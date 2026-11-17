import { Module } from '@nestjs/common';
import { BorrowBooksService } from './borrow_books.service.js';
import { BorrowBooksController } from './borrow_books.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BorrowBook } from './entities/borrow_book.entity.js';
import { Book } from '../books/entities/book.entity.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([BorrowBook, Book]),
    AuthModule,
  ],
  controllers: [BorrowBooksController],
  providers: [BorrowBooksService],
})
export class BorrowBooksModule { }
