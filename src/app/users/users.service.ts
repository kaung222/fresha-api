import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { PaginateQuery } from '@/utils/paginate-query.dto';
import { PaginationResponse } from '@/utils/paginate-res.dto';
import { Appointment } from '../appointments/entities/appointment.entity';
import { CacheService, CacheTTL } from '@/global/cache.service';
import { EmailsService } from '../emails/emails.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private readonly dataSource: DataSource,
    private readonly cacheService: CacheService,
    private emailService: EmailsService,
  ) {}
  async create(createUserDto: CreateUserDto) {
    const newUser = this.userRepository.create(createUserDto);
    return await this.userRepository.save(newUser);
  }

  async getOTP(userId: string) {
    // return await this.emailService.sendOTPToEmail(userId);
  }

  async verifyEmail(userId) {
    // this.emailService.confirmOTP({email: '',otp:''})
  }

  async findAll({ page = 1 }: PaginateQuery) {
    const cached = await this.cacheService.get('users');
    if (cached) return cached;
    const [data, totalCount] = await this.userRepository.findAndCount({
      take: 10,
      skip: 10 * (page - 1),
    });
    const response = new PaginationResponse({
      page,
      data,
      totalCount,
    }).toResponse();
    this.cacheService.set('users', response);
    return response;
  }

  async getUserById(id: string) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  // get user including password to check
  async findOneByEmail(email: string) {
    return await this.userRepository
      .createQueryBuilder('user')
      .where('user.email=:email', { email })
      .addSelect('user.password')
      .getOne();
  }

  async getProfile(id: string) {
    const cacheKey = this.getUserCacheKey(id);
    const dataInCache = await this.cacheService.get(cacheKey);
    if (dataInCache) return dataInCache;

    const user = await this.getUserById(id);
    await this.cacheService.set(cacheKey, user, 5 * 60);
    return user;
  }

  private getCacheKey(userId: string, page = 1) {
    return `appointment:user:${userId}:${page}`;
  }

  private getUserCacheKey(userId: string) {
    return `user: ${userId}`;
  }
  async getMyAppointments(userId: string, page = 1) {
    const cacheKey = this.getCacheKey(userId, page);
    const dataInCache = await this.cacheService.get(cacheKey);

    if (dataInCache) return dataInCache;
    const [data, totalCount] = await this.dataSource
      .getRepository(Appointment)
      .findAndCount({
        where: { userId },
        relations: { organization: true, bookingItems: true },
        take: 10,
        skip: 10 * (page - 1),
        order: { createdAt: 'DESC' },
      });

    const response = new PaginationResponse({
      data,
      totalCount,
      page,
    }).toResponse();
    await this.cacheService.set(cacheKey, response, 5 * 60);
    return response;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.getUserById(id);
    const { password, email, ...rest } = updateUserDto;
    const createUser = this.userRepository.create({ ...user, ...rest });
    const newUser = await this.userRepository.save(createUser);
    await this.cacheService.del(this.getUserCacheKey(id));
    return {
      message: 'Update profile successfully',
      user: newUser,
    };
  }

  remove(id: string) {
    return this.userRepository.delete({ id });
  }
}
