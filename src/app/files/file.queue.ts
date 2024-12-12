import { InjectRepository } from '@nestjs/typeorm';
import { Process, Processor } from '@nestjs/bull';
import { In, Repository } from 'typeorm';
import { File } from './entities/file.entity';
import { Job } from 'bull';

@Processor('FileQueue')
export class FileQueue {
  constructor(
    @InjectRepository(File)
    private fileRepository: Repository<File>,
  ) {}

  @Process('updateFileUnused')
  async updateFileAsUnused({ data }: Job<{ urls: string[]; userId: string }>) {
    console.log(data);
    const { userId, urls } = data;
    await this.fileRepository.update(
      { url: In(urls), userId },
      { isUsed: false },
    );
  }

  @Process('updateFileUsed')
  async updateFileAsUsed({ data }: Job<{ urls: string[]; userId: string }>) {
    const { userId, urls } = data;
    await this.fileRepository.update(
      { url: In(urls), userId },
      { isUsed: true },
    );
  }
}
