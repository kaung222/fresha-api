import { Injectable } from '@nestjs/common';
import { CreateTestDto } from './dto/create-test.dto';
import { UpdateTestDto } from './dto/update-test.dto';
import { DataSource } from 'typeorm';
import { Test } from './entities/test.entity';

@Injectable()
export class TestService {
  constructor(private readonly dataSource: DataSource) {}
  create(createTestDto: CreateTestDto) {
    return 'This action adds a new test';
  }

  findAll() {
    return {
      data: 'Test list',
    };
  }

  findOne(id: number) {
    const test = this.dataSource.getRepository(Test).create({ name: 'james' });
    console.log(test);
  }

  update(id: number, updateTestDto: UpdateTestDto) {
    return `This action updates a #${id} test`;
  }

  remove(id: number) {
    return `This action removes a #${id} test`;
  }
}
