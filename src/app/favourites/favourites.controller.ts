import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { FavouritesService } from './favourites.service';
import { CreateFavouriteDto } from './dto/create-favourite.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@/security/role.decorator';
import { Roles, User } from '@/security/user.decorator';
import { PaginateQuery } from '@/utils/paginate-query.dto';

@Controller('favourites')
@ApiTags('Favourite')
@Role(Roles.user)
export class FavouritesController {
  constructor(private readonly favouritesService: FavouritesService) {}

  @Post()
  @ApiOperation({ summary: 'Add to fav the org by user' })
  create(
    @User('id') userId: string,
    @Body() createFavouriteDto: CreateFavouriteDto,
  ) {
    return this.favouritesService.create(userId, createFavouriteDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get my favourite' })
  findAll(@User('id') userId: string, @Query() paginateQuery: PaginateQuery) {
    return this.favouritesService.findAll(userId, paginateQuery);
  }

  @Delete(':orgId')
  @ApiOperation({ summary: 'Remove from favourite by user' })
  remove(@Param('orgId') orgId: string, @User('id') userId: string) {
    return this.favouritesService.remove(+orgId, userId);
  }
}
