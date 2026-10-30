import { BadRequestException, Injectable } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto.js';
import { UpdateAuthDto } from './dto/update-auth.dto.js';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from '../common/enums/role.enum.js';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) { }

  async create(registerDto: RegisterDto) {
    if (registerDto.password !== registerDto.retypePassword) {
      throw new BadRequestException('Password and RetypePassword not match');
    }

    const { email, password, phone, fullName } = registerDto;
    // B1: Check User
    const existsUser = await this.userRepository.findOne({
      where: {
        email: email.trim(),
      },
    });

    if (existsUser) {
      throw new BadRequestException('Account exists');
    }

    // B2: Create new User
    const salt = await bcrypt.genSalt(10);
    const passwordHashed = await bcrypt.hash(password, salt);

    const newUser = this.userRepository.create({
      email: email.trim(),
      password: passwordHashed,
      phone,
      fullName,
      isActive: true,
      role: Role.USER,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.userRepository.save(newUser);

    return {
      message: 'success',
      user: {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.fullName,
      },
    };
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
