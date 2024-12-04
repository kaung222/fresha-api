import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { File } from '../files/entities/file.entity';
import { FilesService } from '../files/files.service';

@Module({
  imports: [TypeOrmModule.forFeature([Product, File])],
  controllers: [ProductsController],
  providers: [ProductsService, FilesService],
})
export class ProductsModule {}
