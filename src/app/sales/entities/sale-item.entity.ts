import { Product } from '@/app/products/entities/product.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Sale } from './sale.entity';
import { DecimalColumn } from '@/utils/decorators/column.decorators';

@Entity()
export class SaleItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  name: string;

  @DecimalColumn()
  price: number;

  @Column('simple-array', { nullable: true })
  images: string[];

  @Column('int', { default: 1 })
  quantity: number;

  @DecimalColumn()
  subtotalPrice: number;

  @Column({ nullable: true })
  productId: string;

  @ManyToOne(() => Product, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @ManyToOne(() => Sale, { onDelete: 'CASCADE' })
  sale: Sale;
}
