import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { BorrowBook } from "../../borrow_books/entities/borrow_book.entity.js";

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid') // Random ID
    id: string;

    @Column({ nullable: true })
    fullName: string;

    @Column({ nullable: true })
    phone: string;

    @Column({ unique: true, nullable: false })
    email: string;

    @Column({ nullable: false })
    password: string;

    @Column({ nullable: false })
    role: string;

    @Column({ nullable: false, default: true })
    isActive: boolean;

    @OneToMany(() => BorrowBook, (borrowBook) => borrowBook.user)
    borrowBooks: any;

    @Column()
    createdAt: Date;

    @Column()
    updatedAt: Date;
}

