import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { User } from './entities/user.entity.js';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ChangePasswordDto } from './dto/change-password.dto.js';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) { }

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async getProfile(id: string) {
    const user = await this.userRepository.findOne({
      where: {
        id,
      },
    });

    const avatarUrl = `${this.configService.get<string>('BASE_URL')}/${user?.avatar}`;
    return {
      id: user?.id,
      email: user?.email,
      fullName: user?.fullName,
      phone: user?.phone,
      role: user?.role,
      avatar: user?.avatar ? avatarUrl : null,
    };
  }

  async changePassword(reqUser: any, changePasswordDto: ChangePasswordDto) {
    const user = await this.userRepository.findOne({
      where: {
        id: reqUser.id,
      },
    });

    // B1: Kiểm tra tồn tại user
    if (!user) {
      throw new Error('User not found');
    }
    // B2: Kiểm tra user có bị khóa không
    if (!user.isActive) {
      throw new BadRequestException('User is not active');
    }
    // B3: So sánh mật khẩu cũ
    const isMatchOldPassword = await bcrypt.compare(changePasswordDto.oldPassword, user.password);
    if (!isMatchOldPassword) {
      throw new BadRequestException('Incorrect old password');
    }
    // B4: Kiểm tra mật khẩu mới có trùng với retypePassword không
    if (changePasswordDto.newPassword !== changePasswordDto.confirmPassword) {
      throw new BadRequestException('New password and confirm password do not match');
    }
    // B5: Kiểm tra mật khẩu mới có trùng với mật khẩu cũ không
    const isMatchNewPassword = await bcrypt.compare(changePasswordDto.newPassword, user.password);
    if (isMatchNewPassword) {
      throw new BadRequestException('New password is the same as old password');
    }

    const newHashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);
    user.password = newHashedPassword;
    user.updatedAt = new Date();

    await this.userRepository.save(user);
    return {
      message: 'Password changed successfully',
    };
  }

  async changeAvatar(reqUser: any, file: Express.Multer.File) {
    const user = await this.userRepository.findOne({
      where: {
        id: reqUser.id,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }
    if (!user.isActive) {
      throw new BadRequestException('User is not active');
    }

    user.avatar = file.path;
    user.updatedAt = new Date();

    await this.userRepository.save(user);
    return {
      message: 'Avatar changed successfully',
    };

  }
}
