import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { FilesService } from './files.service';

@Injectable()
export class FileListener {
  constructor(private readonly fileService: FilesService) {}
  @OnEvent('files.unused')
  updateFileAsUnused({ ids }) {
    this.fileService.updateFileAsUnused(ids);
  }

  @OnEvent('files.used')
  updateFileAsUsed({ ids }) {
    this.fileService.updateFileAsUsed(ids);
  }
}
