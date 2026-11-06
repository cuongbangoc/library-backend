import 'multer';
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, UseInterceptors, UploadedFile } from '@nestjs/common';
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

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get('/profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req: Request) {
    const user: any = req.user;

    return this.usersService.getProfile(user.id);
  }

  @Patch('/change-password')
  @UseGuards(JwtAuthGuard)
  changePassword(@Req() req: Request, @Body() changePasswordDto: ChangePasswordDto) {
    const reqUser: any = req.user;

    return this.usersService.changePassword(reqUser, changePasswordDto);
  }

  @Patch('/change-avatar')
  @UseGuards(JwtAuthGuard)
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

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.USER)
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
