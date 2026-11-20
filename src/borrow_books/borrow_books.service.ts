import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateBorrowBookDto } from './dto/create-borrow_book.dto.js';
import { ReturnBorrowBookDto } from './dto/return-borrow_book.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Book } from '../books/entities/book.entity.js';
import { DataSource, In, Repository } from 'typeorm';
import { BorrowBook } from './entities/borrow_book.entity.js';
import { BorrowStatus } from '../common/enums/borrow-status.enum.js';
import { Role } from '../common/enums/role.enum.js';

@Injectable()
export class BorrowBooksService {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
    @InjectRepository(BorrowBook)
    private readonly borrowBookRepository: Repository<BorrowBook>,
    private readonly dataSource: DataSource,
  ) { }

  async create(userId: string, createBorrowBookDto: CreateBorrowBookDto) {
    // B1: Kiểm tra sách tồn tại không
    const book = await this.bookRepository.findOne({ where: { id: createBorrowBookDto.bookId } });
    if (!book) {
      throw new BadRequestException('Book not found');
    }
    // B2: Kiểm tra sách có còn khả dụng không
    if (book.availableNumber < 1) {
      throw new BadRequestException('Book not available');
    }
    // User chưa mượn sách này trước đó hoặc đã trả sách rồi
    const existsBorrowBook = await this.borrowBookRepository.findOne({
      where: {
        user: { id: userId },
        book: { id: createBorrowBookDto.bookId },
        status: In([BorrowStatus.PENDING, BorrowStatus.APPROVED]),
      },
    });

    if (existsBorrowBook) {
      throw new BadRequestException('Book is already borrowed');
    }

    // B4: Tạo phiếu mượn sách
    const borrowBook = this.borrowBookRepository.create({
      user: { id: userId },
      book: { id: createBorrowBookDto.bookId },
      borrowDate: new Date(),
      expectReturnDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      penaltyMoney: book.price,
      status: BorrowStatus.PENDING,
    });

    return this.borrowBookRepository.save(borrowBook);
  }

  findAll() {
    return `This action returns all borrowBooks`;
  }

  findOne(id: number) {
    return `This action returns a #${id} borrowBook`;
  }

  async approveBorrow(id: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // B1: Tìm phiếu mượn sách
      const borrowBook = await queryRunner.manager.findOne(BorrowBook, {
        where: { id },
        relations: { book: true }
      });
      if (!borrowBook) {
        throw new BadRequestException('Borrow not found');
      }

      // B2: Kiểm tra trạng thái có phải là PENDING không
      if (borrowBook.status !== BorrowStatus.PENDING) {
        throw new BadRequestException('Borrow is not in PENDING status');
      }
      // B3: Kiểm tra sách
      const book = borrowBook.book;
      if (!book) {
        throw new BadRequestException('Book not found');
      }
      if (book.availableNumber < 1) {
        throw new BadRequestException('Book not available');
      }

      // B4: Cập nhật số lượng sách và trạng thái phiếu mượn
      book.availableNumber = book.availableNumber - 1;
      await queryRunner.manager.save(book);

      borrowBook.status = BorrowStatus.APPROVED;
      await queryRunner.manager.save(borrowBook);

      // B5: Commit toàn bộ transaction vào DB
      await queryRunner.commitTransaction();
      return borrowBook;
    } catch (error) {
      // Rollback
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async rejectBorrow(id: string) {
    const borrowBook = await this.borrowBookRepository.findOne({
      where: { id },
    });
    if (!borrowBook) {
      throw new BadRequestException('Borrow not found');
    }

    if (borrowBook.status !== BorrowStatus.PENDING) {
      throw new BadRequestException('Borrow can not reject');
    }

    borrowBook.status = BorrowStatus.REJECTED;
    return this.borrowBookRepository.save(borrowBook);
  }

  async returnBorrow(id: string, returnBorrowBookDto: ReturnBorrowBookDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // B1: Tìm phiếu mượn sách
      const borrowBook = await queryRunner.manager.findOne(BorrowBook, {
        where: { id },
        relations: { book: true }
      });
      if (!borrowBook) {
        throw new BadRequestException('Borrow not found');
      }

      // B2: Kiểm tra trạng thái có phải là APPROVED không
      if (borrowBook.status !== BorrowStatus.APPROVED) {
        throw new BadRequestException('Borrow is not in APPROVED status');
      }

      // B3: Kiểm tra sách
      const book = borrowBook.book;
      if (!book) {
        throw new BadRequestException('Book not found');
      }

      // TH1: TRA SACH
      if (returnBorrowBookDto.status === BorrowStatus.RETURNED) {
        book.availableNumber = book.availableNumber + 1;
        await queryRunner.manager.save(book);

        borrowBook.status = BorrowStatus.RETURNED;
        borrowBook.returnDate = new Date();
        await queryRunner.manager.save(borrowBook);
      }
      // TH2: MAT SACH
      if (returnBorrowBookDto.status === BorrowStatus.MISSED) {
        borrowBook.status = BorrowStatus.MISSED;
        await queryRunner.manager.save(borrowBook);
      }


      // B5: Commit toàn bộ transaction vào DB
      await queryRunner.commitTransaction();
      return borrowBook;
    } catch (error) {
      // Rollback
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAllByUser(user: any) {
    const { role, id } = user;
    if (role === Role.USER) {
      // Truy van du lieu theo id
      const borrowBooks = await this.borrowBookRepository.find({
        where: { user: { id } },
        relations: { book: true },
      });
      return borrowBooks;
    }

    // Truy van all du lieu
    const borrowBooks = await this.borrowBookRepository.find({
      relations: { book: true },
    });
    return borrowBooks;
  }
}
