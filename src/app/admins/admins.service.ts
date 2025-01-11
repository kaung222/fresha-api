import { ConflictException, Injectable } from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Admin } from './entities/admin.entity';
import { In, Repository } from 'typeorm';
import { PaginationResponse } from '@/utils/paginate-res.dto';

@Injectable()
export class AdminsService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
  ) {}
  async create(createAdminDto: CreateAdminDto) {
    const admin = await this.adminRepository.findOneBy({
      email: createAdminDto.email,
    });
    if (admin) throw new ConflictException('Admin already existed');
    const newAdmin = this.adminRepository.create(createAdminDto);
    return this.adminRepository.save(newAdmin);
  }
  async findOneByEmail(email: string) {
    return await this.adminRepository.findOneBy({ email });
  }
  async generateSysAdmin() {
    const admins = await this.adminRepository.findBy({
      email: In(['thirdgodiswinning@gmail.com', 'phonyo126@gmail.com']),
    });
    if (admins) return admins;
    const createAdmins = this.adminRepository.create([
      {
        username: 'Phoe Nyo',
        email: 'phonyo126@gmail.com',
        role: 'sysadmin',
      },
      {
        username: 'James Marcus',
        email: 'thirdgodiswinning@gmail.com',
        role: 'sysadmin',
      },
    ]);
    return await this.adminRepository.save(createAdmins);
  }

  async findAll() {
    const admins = await this.adminRepository.find();
    return new PaginationResponse({
      data: admins,
      page: 1,
      totalCount: 5,
    }).toResponse();
  }

  findOne(id: number) {
    return this.adminRepository.findOneBy({ id });
  }

  update(id: number, updateAdminDto: UpdateAdminDto) {
    return `This action updates a #${id} admin`;
  }

  remove(id: number) {
    return this.adminRepository.delete({ id });
  }
}
