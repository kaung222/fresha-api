import { Organization } from '@/app/organizations/entities/organization.entity';
import { DiscountType } from '@/app/services/entities/service.entity';
import { UUIDEntity } from '@/utils';
import { DecimalColumn } from '@/utils/decorators/column.decorators';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
export class Product extends UUIDEntity {
  @Column({ type: 'simple-array', nullable: true })
  images: string[];

  @Column()
  name: string;

  @Column({ nullable: true })
  code: string;

  @DecimalColumn()
  price: number;

  @DecimalColumn()
  discount: number;

  @DecimalColumn()
  discountPrice: number;

  @Column('enum', { enum: DiscountType, default: DiscountType.percent })
  discountType: DiscountType;

  @Column({ nullable: true })
  brand: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({ nullable: true })
  category: string;

  @Column('int', { default: 1 })
  stock: number;

  @Column('int', { default: 1 })
  moq: number;

  @Column()
  orgId: number;

  @Column({ nullable: true })
  thumbnail: string;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orgId' })
  organization: Organization;
}
