import { Product } from '@/app/products/entities/product.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
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

  @Column('int', { default: 1 })
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  subtotalPrice: number;

  @ManyToOne(() => Product, { onDelete: 'SET NULL' })
  product: Product;

  @ManyToOne(() => Sale, { onDelete: 'CASCADE' })
  sale: Sale;
}
