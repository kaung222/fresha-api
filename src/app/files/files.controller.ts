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
import { FilesService } from './files.service';
import { StoreFiledto } from './dto/store-file.dto';
import { StoreMultipleFilesDto } from './dto/store-multi-file.dto';
import { Roles, User } from '@/security/user.decorator';

@Controller('files')
@ApiTags('File')
@Role(Roles.member, Roles.org, Roles.user)
export class FilesController {
  constructor(private fileService: FilesService) {}
  @Post()
  @ApiOperation({ summary: 'store single image' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  storeImage(
    @User('id') userId: any,
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
    return this.fileService.storeImage(file, userId);
  }

  @Post('multiple')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'store multiple images' })
  @UseInterceptors(FilesInterceptor('files', 4))
  uploadFile(
    @User('id') userId: any,
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
    return this.fileService.storeMultipleImages(files, userId);
  }

  // @Cron(CronExpression.EVERY_2_HOURS)
  deleteUnusedFiles() {
    this.fileService.deleteUnusedFiles();
  }
}
