import { Brand } from '@/app/brands/entities/brand.entity';
import { Category } from '@/app/categories/entities/category.entity';
import {
  CommissionFeesType,
  Member,
  MemberType,
} from '@/app/members/entities/member.entity';
import { ProductCategory } from '@/app/product-category/entities/product-category.entity';
import { Product } from '@/app/products/entities/product.entity';
import {
  DiscountType,
  Service,
  ServiceType,
} from '@/app/services/entities/service.entity';
import { Gender } from '@/app/users/entities/user.entity';
import { Roles } from '@/security/user.decorator';
import { OnEvent } from '@nestjs/event-emitter';
import { DataSource } from 'typeorm';

export class DefaultService {
  constructor(private readonly dataSource: DataSource) {}
  @OnEvent('organization.created')
  async generateSampleData(orgId: number) {
    await Promise.all([
      this.createSampleBrand(orgId),
      this.createSampleMember(orgId),
      this.createSampleCategory(orgId),
      this.createSampleProduct(orgId),
      this.createSampleProductCategory(orgId),
    ]);
    await this.createSampleService(orgId);
  }

  // service
  private async createSampleService(orgId: number) {
    const category = await this.dataSource
      .getRepository(Category)
      .findOneBy({ orgId });
    const createService = this.dataSource
      .getRepository(Service)
      .create({ name: 'Hair Cut', price: 10000, category, duration: 1800 });
    this.dataSource.getRepository(Service).save(createService);
  }

  // member
  private createSampleMember(orgId: number) {
    const createMember = this.dataSource.getRepository(Member).create({
      firstName: 'Kyaw Kyaw',
      role: Roles.member,
      type: MemberType.employee,
      commissionFees: 20,
      commissionFeesType: CommissionFeesType.percent,
      gender: Gender.male,
      jobTitle: 'Assistant Manager',
      experience: 5,
      orgId,
    });
    return this.dataSource.getRepository(Member).save(createMember);
  }

  // service category
  private createSampleCategory(orgId: number) {
    const createCategory = this.dataSource
      .getRepository(Category)
      .create({ orgId, name: 'Hair coloring' });
    return this.dataSource.getRepository(Category).save(createCategory);
  }

  // product brand
  private createSampleBrand(orgId: number) {
    const createBrand = this.dataSource
      .getRepository(Brand)
      .create({ orgId, name: 'SunSilk' });
    return this.dataSource.getRepository(Brand).save(createBrand);
  }

  // product
  private createSampleProduct(orgId: number) {
    const createProduct = this.dataSource.getRepository(Product).create({
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
    return this.dataSource.getRepository(Product).save(createProduct);
  }

  // product category
  private createSampleProductCategory(orgId: number) {
    const createCategory = this.dataSource
      .getRepository(ProductCategory)
      .create({ orgId, name: 'Shampoo' });
    return this.dataSource.getRepository(ProductCategory).save(createCategory);
  }
}
