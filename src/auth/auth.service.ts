import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from '../common/enums/role.enum.js';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
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

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const existsUser = await this.userRepository.findOne({
      where: {
        email: email.trim(),
      },
    });

    if (!existsUser) {
      throw new BadRequestException('Account not exists');
    }

    if (!existsUser.isActive) {
      throw new BadRequestException('Account not active');
    }

    const isPasswordValid = await bcrypt.compare(password, existsUser.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid password');
    }

    // Tao Token JWT
    const jwtPayload = {
      sub: existsUser.id,
      email: existsUser.email,
      role: existsUser.role,
    };

    const jwtToken = this.jwtService.sign(jwtPayload);

    return {
      message: 'success',
      accessToken: jwtToken,
      user: {
        id: existsUser.id,
        fullName: existsUser.fullName,
      },
    };
  }
}
