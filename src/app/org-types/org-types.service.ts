import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrgTypeDto } from './dto/create-org-type.dto';
import { UpdateOrgTypeDto } from './dto/update-org-type.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { OrgType } from './entities/org-type.entity';
import { Repository } from 'typeorm';
import { FilesService } from '../files/files.service';

@Injectable()
export class OrgTypesService {
  constructor(
    @InjectRepository(OrgType) private orgTypeRepository: Repository<OrgType>,
    private fileService: FilesService,
  ) {}

  // create type
  async create(adminId: string, createOrgTypeDto: CreateOrgTypeDto) {
    const { icon } = createOrgTypeDto;
    const createType = this.orgTypeRepository.create(createOrgTypeDto);
    await this.orgTypeRepository.save(createType);
    // update file used
    this.fileService.updateFileAsUsed(icon, adminId);
    return {
      message: 'Create type successfully',
    };
  }

  // get all types
  findAll() {
    return this.orgTypeRepository.find();
  }

  async findOne(id: number) {
    return await this.orgTypeRepository.findOneBy({ id });
  }

  async remove(id: number, adminId: string) {
    const type = await this.findOne(id);
    const response = await this.orgTypeRepository.delete({ id });
    if (response.affected !== 1) throw new NotFoundException();
    // update file unused
    this.fileService.updateFileAsUnused(type.icon, adminId);
    return {
      message: 'Delete type successfully',
    };
  }
}
