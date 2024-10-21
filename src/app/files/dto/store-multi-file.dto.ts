import { ApiProperty } from '@nestjs/swagger';

export class StoreMultipleFilesDto {
  @ApiProperty({ type: 'array', items: { type: 'string', format: 'binary' } })
  files: Express.Multer.File[];
}
