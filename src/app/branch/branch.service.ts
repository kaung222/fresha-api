import { Injectable } from '@nestjs/common';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Branch } from './entities/branch.entity';
import { Repository } from 'typeorm';

@Injectable()
export class BranchService {
  constructor(
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
  ) {}
  create(createBranchDto: CreateBranchDto) {}

  findAll(orgId: number) {
    return this.branchRepository.findBy({ organization: { id: orgId } });
  }

  findOne(id: number) {
    return this.branchRepository.findOneBy({id})
  }

  update(id: number, updateBranchDto: UpdateBranchDto) {
    return `This action updates a #${id} branch`;
  }

  remove(id: number) {
    return this.branchRepository.delete(id)
  }
}
