// import {
//   Controller,
//   Get,
//   Post,
//   Body,
//   Patch,
//   Param,
//   Delete,
// } from '@nestjs/common';
// import { PackagesService } from './packages.service';
// import { CreatePackageDto } from './dto/create-package.dto';
// import { UpdatePackageDto } from './dto/update-package.dto';
// import { ApiTags } from '@nestjs/swagger';
// import { Role } from '@/security/role.decorator';
// import { Roles, User } from '@/security/user.decorator';

// @Controller('packages')
// @ApiTags('Package')
// @Role(Roles.org)
// export class PackagesController {
//   constructor(private readonly packagesService: PackagesService) {}

//   @Post()
//   create(
//     @Body() createPackageDto: CreatePackageDto,
//     @User('orgId') orgId: number,
//   ) {
//     return this.packagesService.create(orgId, createPackageDto);
//   }

//   @Get()
//   findAll(@User('orgId') orgId: number) {
//     return this.packagesService.findAll(orgId);
//   }

//   @Get(':id')
//   findOne(@Param('id') id: string) {
//     return this.packagesService.findOne(+id);
//   }

//   @Patch(':id')
//   update(@Param('id') id: string, @Body() updatePackageDto: UpdatePackageDto) {
//     return this.packagesService.update(+id, updatePackageDto);
//   }

//   @Delete(':id')
//   remove(@Param('id') id: string) {
//     return this.packagesService.remove(+id);
//   }
// }
