import 'multer';
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, UseInterceptors, UploadedFile, Query } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { Role } from '../common/enums/role.enum.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth-guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import type { Request, Express } from 'express';
import { ChangePasswordDto } from './dto/change-password.dto.js';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { AdminChangePasswordDto } from './dto/admin.change-password.dto.js';
import { ToggleActiveDto } from './dto/toggle-active.dto.js';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  // === USER API ====
  @Get('/profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  getProfile(@Req() req: Request) {
    const user: any = req.user;

    return this.usersService.getProfile(user.id);
  }

  @Patch('/change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  changePassword(@Req() req: Request, @Body() changePasswordDto: ChangePasswordDto) {
    const reqUser: any = req.user;

    return this.usersService.changePassword(reqUser, changePasswordDto);
  }

  @Patch('/change-avatar')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @UseInterceptors(FileInterceptor('avatar', {
    storage: diskStorage({
      destination: './uploads/avatar',
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => Math.round(Math.random() * 16).toString(16)).join('');
        return cb(null, `${randomName}_${file.originalname}`);
      }
    }),
    fileFilter: (req, file, cb) => {
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('Invalid file type'), false);
      }
      cb(null, true);
    }
  }))
  changeAvatar(@Req() req: Request, @UploadedFile() file: Express.Multer.File) {
    const reqUser: any = req.user;

    // console.log(file);
    return this.usersService.changeAvatar(reqUser, file);
  }


  // === ADMIN API ===
  @Post('admin/add-user')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('access-token')
  addUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Patch('/admin/change-user-password')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('access-token')
  adminChangePassword(@Body() adminChangePasswordDto: AdminChangePasswordDto) {
    return this.usersService.adminChangePassword(adminChangePasswordDto);
  }


  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.LIBRARIAN)
  @ApiBearerAuth('access-token')
  findAll(@Query('email') email: string, @Query('phone') phone: string, @Query('role') role: string) {
    const queryParams = {
      email,
      phone,
      role,
    };

    return this.usersService.findAll(queryParams);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.LIBRARIAN)
  @ApiBearerAuth('access-token')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('access-token')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('access-token')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Patch(':id/toggle-active')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('access-token')
  toggleActive(@Param('id') id: string, @Body() toggleActiveDto: ToggleActiveDto) {
    return this.usersService.toggleActive(id, toggleActiveDto);
  }
}
