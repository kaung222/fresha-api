import { Controller, Get, Query } from '@nestjs/common';
import { ApiParam, ApiProperty, ApiTags } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { IsEnum, IsNotEmpty, IsOptional, IsPositive } from 'class-validator';
import { Public } from '@/security/public.decorator';
import { Transform } from 'class-transformer';
import { Role } from '@/security/role.decorator';
import { Roles, User } from '@/security/user.decorator';
import { OrgSearchDto } from './dto/org-search.dto';
import { SearchServiceDto } from './dto/search-service.dto';

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
  @Role(Roles.org, Roles.member)
  searchData(@Query() searchDto: SearchDto, @User('orgId') orgId: number) {
    return this.searchService.search(orgId, searchDto);
  }

  @Get('organizations')
  searchOrganizations(@Query() orgSearchDto: OrgSearchDto) {
    return this.searchService.searchOrg(orgSearchDto);
  }

  @Get('services')
  searchServices(@Query() { search, page }: SearchServiceDto) {
    return this.searchService.searchServices(search, page);
  }
}
