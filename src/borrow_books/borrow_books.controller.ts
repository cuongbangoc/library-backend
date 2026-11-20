import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { BorrowBooksService } from './borrow_books.service.js';
import { CreateBorrowBookDto } from './dto/create-borrow_book.dto.js';
import { ReturnBorrowBookDto } from './dto/return-borrow_book.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth-guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { Role } from '../common/enums/role.enum.js';
import { ApiBearerAuth, ApiProperty } from '@nestjs/swagger';

@Controller('borrow-books')
export class BorrowBooksController {
  constructor(private readonly borrowBooksService: BorrowBooksService) { }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @ApiBearerAuth('access-token')
  create(@Req() req: any, @Body() createBorrowBookDto: CreateBorrowBookDto) {
    const user = req.user;
    const userId = user.id;
    return this.borrowBooksService.create(userId, createBorrowBookDto);
  }

  // HOMEWORK
  // 1. Neu Role = USER thì chỉ trả về danh sách của user đó
  // 2. Con lai ADMIN, LIBRARIAN thì trả về toàn bộ phiếu mượn
  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  findAll(@Req() req: any) {
    const user = req.user;
    return this.borrowBooksService.findAllByUser(user);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.borrowBooksService.findOne(+id);
  }

  // Admin API
  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.LIBRARIAN)
  @ApiBearerAuth('access-token')
  update(@Param('id') id: string) {
    return this.borrowBooksService.approveBorrow(id);
  }

  @Patch(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.LIBRARIAN)
  @ApiBearerAuth('access-token')
  reject(@Param('id') id: string) {
    return this.borrowBooksService.rejectBorrow(id);
  }

  @Patch(':id/return')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.LIBRARIAN)
  @ApiBearerAuth('access-token')
  return(@Param('id') id: string, @Body() returnBorrowBookDto: ReturnBorrowBookDto) {
    return this.borrowBooksService.returnBorrow(id, returnBorrowBookDto);
  }
}
