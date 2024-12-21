import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { PaginateQuery } from '@/utils/paginate-query.dto';
import { PaginationResponse } from '@/utils/paginate-res.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}
  async create(createUserDto: CreateUserDto) {
    const newUser = this.userRepository.create(createUserDto);
    return await this.userRepository.save(newUser);
  }

  async findAll({ page = 1 }: PaginateQuery) {
    const [data, totalCount] = await this.userRepository.findAndCount({
      take: 10,
      skip: 10 * (page - 1),
    });
    return new PaginationResponse({ page, data, totalCount }).toResponse();
  }

  async getUserById(id: string) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findOneByEmail(email: string) {
    return await this.userRepository
      .createQueryBuilder('user')
      .where('user.email=:email', { email })
      .addSelect('user.email')
      .getOne();
  }

  async getProfile(id: string) {
    return await this.getUserById(id);
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.getUserById(id);
    Object.assign(user, updateUserDto);
    const newUser = await this.userRepository.save(user);
    return {
      message: 'Update profile successfully',
      user: newUser,
    };
  }

  remove(id: string) {
    return this.userRepository.delete({ id });
  }
}
