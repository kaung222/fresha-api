import { Brand } from '@/app/brands/entities/brand.entity';
import { Category } from '@/app/categories/entities/category.entity';
import { ProductCategory } from '@/app/product-category/entities/product-category.entity';
import { Product } from '@/app/products/entities/product.entity';
import { DiscountType, Service } from '@/app/services/entities/service.entity';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DataSource } from 'typeorm';

@Injectable()
export class DefaultService {
  constructor(private readonly dataSource: DataSource) {}

  @OnEvent('organization.created')
  async generateSampleData({ orgId }: { orgId: number }) {
    try {
      // Create sample data concurrently
      await Promise.all([
        this.createSampleBrand(orgId),
        this.createSampleProduct(orgId),
        this.createSampleProductCategory(orgId),
        // Create sample service after category to ensure dependencies are resolved
        await this.createSampleService(orgId),
      ]);
    } catch (error) {
      console.error(
        `Failed to generate sample data for organization ${orgId}:`,
        error,
      );
      throw new Error('Failed to generate sample data. Please try again.');
    }
  }

  // Create a sample service
  private async createSampleService(orgId: number) {
    const sampleService = this.dataSource.getRepository(Service).create({
      name: 'Hair Cut',
      price: 10000,
      category: { name: 'Hair Styling' },
      duration: 1800,
      orgId,
    });

    return await this.dataSource.getRepository(Service).save(sampleService);
  }

  // Create a sample category
  private async createSampleCategory(orgId: number) {
    const sampleCategory = this.dataSource.getRepository(Category).create({
      orgId,
      name: 'Hair coloring',
    });

    return await this.dataSource.getRepository(Category).save(sampleCategory);
  }

  // Create a sample brand
  private async createSampleBrand(orgId: number) {
    const sampleBrand = this.dataSource.getRepository(Brand).create({
      orgId,
      name: 'SunSilk',
    });
    console.log(orgId);
    return await this.dataSource.getRepository(Brand).save(sampleBrand);
  }

  // Create a sample product
  private async createSampleProduct(orgId: number) {
    const sampleProduct = this.dataSource.getRepository(Product).create({
      name: 'SunSilk Shampoo',
      brand: 'SunSilk',
      category: 'Shampoo',
      moq: 10,
      price: 5000,
      orgId,
      stock: 10,
      discount: 10,
      discountType: DiscountType.percent,
      discountPrice: 4500,
    });

    return await this.dataSource.getRepository(Product).save(sampleProduct);
  }

  // Create a sample product category
  private async createSampleProductCategory(orgId: number) {
    const sampleProductCategory = this.dataSource
      .getRepository(ProductCategory)
      .create({ orgId, name: 'Shampoo' });

    return await this.dataSource
      .getRepository(ProductCategory)
      .save(sampleProductCategory);
  }
}
