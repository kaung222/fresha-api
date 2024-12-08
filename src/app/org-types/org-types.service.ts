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
  async create(createOrgTypeDto: CreateOrgTypeDto) {
    const { icon } = createOrgTypeDto;
    const createType = this.orgTypeRepository.create(createOrgTypeDto);
    await this.orgTypeRepository.save(createType);
    this.fileService.updateFileAsUsed([icon]);
    return {
      message: 'Create type successfully',
    };
  }

  findAll() {
    return this.orgTypeRepository.find();
  }

  async findOne(id: number) {
    return await this.orgTypeRepository.findOneBy({ id });
  }

  async remove(id: number) {
    const response = await this.orgTypeRepository.delete({ id });
    if (response.affected !== 1) throw new NotFoundException();
    return {
      message: 'Delete type successfully',
    };
  }
}
