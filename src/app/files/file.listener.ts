import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { FilesService } from './files.service';

@Injectable()
export class FileListener {
  constructor(private readonly fileService: FilesService) {}
  @OnEvent('unused_file')
  updateFileAsUnused({ ids }) {
    this.fileService.updateFileAsUnused(ids);
  }

  @OnEvent('used_file')
  updateFileAsUsed({ ids }) {
    this.fileService.updateFileAsUsed(ids);
  }
}
