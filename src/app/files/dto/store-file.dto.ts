import { ApiProperty } from '@nestjs/swagger';

export class StoreFiledto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: Express.Multer.File;
}
