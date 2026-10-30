import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module.js';
import { CategoriesModule } from './categories/categories.module.js';
import { BooksModule } from './books/books.module.js';
import { User } from './users/entities/user.entity.js';
import { Category } from './categories/entities/category.entity.js';
import { Book } from './books/entities/book.entity.js';
import { BorrowBooksModule } from './borrow_books/borrow_books.module.js';
import { BorrowBook } from './borrow_books/entities/borrow_book.entity.js';
import { AuthModule } from './auth/auth.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        autoLoadEntities: true,
        entities: [User, Category, Book, BorrowBook], // Chỉ định các entity ở đây
        synchronize: true, // Tự đông tạo bảng từ Entity (Chỉ dùng ở local)
        logging: true, // Log SQL query, chỉ dùng ở local/dev hoặc khi cần debug
      }),
    }),
    UsersModule,
    CategoriesModule,
    BooksModule,
    BorrowBooksModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
