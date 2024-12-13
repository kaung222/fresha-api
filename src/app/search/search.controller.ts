import { Controller, Get, Query } from '@nestjs/common';
import { ApiParam, ApiProperty, ApiTags } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { IsEnum, IsNotEmpty, IsOptional, IsPositive } from 'class-validator';
import { Public } from '@/security/public.decorator';
import { Transform } from 'class-transformer';

export enum SearchName {
  product = 'product',
  service = 'service',
  client = 'client',
  appointment = 'appointment',
  sale = 'sale',
}
export class SearchDto {
  @IsNotEmpty()
  @IsEnum(SearchName)
  @ApiProperty()
  name: string;

  @IsNotEmpty()
  @ApiProperty()
  q: string;

  @IsOptional()
  @IsPositive()
  @ApiProperty()
  @Transform(({ value }) => parseInt(value))
  page: number;
}

@Controller('search')
@ApiTags('Search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @Public()
  searchData(@Query() searchDto: SearchDto) {
    return this.searchService.search(searchDto);
  }
}
