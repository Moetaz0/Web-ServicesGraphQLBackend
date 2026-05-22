import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthServiceService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(data: any) {
    const { email, password, role } = data;
    const existing = await this.userRepository.findOne({ where: { email } });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      role: role || UserRole.OPERATOR,
    });

    const savedUser = await this.userRepository.save(user);
    const userResult = { ...savedUser };
    delete userResult.password;

    const token = this.jwtService.sign({ id: savedUser.id, email: savedUser.email, role: savedUser.role });
    return { token, user: userResult };
  }

  async login(data: any) {
    const { email, password } = data;
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const matches = await bcrypt.compare(password, user.password);
    if (!matches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const userResult = { ...user };
    delete userResult.password;
    const token = this.jwtService.sign({ id: user.id, email: user.email, role: user.role });
    return { token, user: userResult };
  }

  async verifyToken(data: any) {
    const { token } = data;
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.userRepository.findOne({ where: { id: payload.id } });
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      const userResult = { ...user };
      delete userResult.password;
      return userResult;
    } catch (e) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
