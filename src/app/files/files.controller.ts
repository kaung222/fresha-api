import {
  Body,
  Controller,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@/security/role.decorator';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EventPattern, Payload } from '@nestjs/microservices';
import { Roles } from '@/security/user.decorator';
import { FilesService } from './files.service';
import { StoreFiledto } from './dto/store-file.dto';
import { StoreMultipleFilesDto } from './dto/store-multi-file.dto';

@Controller('files')
@ApiTags('File')
export class FilesController {
  constructor(private fileService: FilesService) {}
  @Post()
  @ApiOperation({ summary: 'store single image' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  storeImage(
    @Body() storeImageDto: StoreFiledto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1000 * 1000 }),
          new FileTypeValidator({ fileType: /image\/(png|jpeg)/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.fileService.storeImage(file);
  }

  @Post('multiple')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'store multiple images' })
  @UseInterceptors(FilesInterceptor('files', 4))
  uploadFile(
    @Body() storeImageDto: StoreMultipleFilesDto,

    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1000 * 1000 }),
          new FileTypeValidator({ fileType: /image\/(png|jpeg)/ }),
        ],
      }),
    )
    files: Array<Express.Multer.File>,
  ) {
    return this.fileService.storeMultipleImages(files);
  }

  @Cron(CronExpression.EVERY_10_HOURS)
  deleteUnusedFiles() {
    this.fileService.deleteUnusedFiles();
  }
}
