import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, Relation } from "typeorm";
import { Category } from "../../categories/entities/category.entity.js";
import { BorrowBook } from "../../borrow_books/entities/borrow_book.entity.js";

@Entity('books')
export class Book {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: false })
    name: string;

    @Column({ nullable: true })
    author: string;

    @Column({ nullable: true })
    price: number;

    @ManyToOne(() => Category, (category) => category.books, { onDelete: 'SET NULL', nullable: true })
    category: any;

    @OneToMany(() => BorrowBook, (borrowBook) => borrowBook.book)
    borrowBooks: any;

    @Column()
    createdAt: Date;

    @Column()
    updatedAt: Date;
}
