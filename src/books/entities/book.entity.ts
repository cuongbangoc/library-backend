import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Relation } from "typeorm";
import { Category } from "../../categories/entities/category.entity.js";

@Entity('books')
export class Book {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: false })
    name: string;

    @Column()
    author: string;

    @Column()
    price: number;

    @ManyToOne(() => Category, (category) => category.books, { onDelete: 'SET NULL', nullable: true })
    category: any;

    @Column()
    createdAt: Date;

    @Column()
    updatedAt: Date;
}
