import { Category } from '@/app/categories/entities/category.entity';
import { Member } from '@/app/members/entities/member.entity';
import { Organization } from '@/app/organizations/entities/organization.entity';
import { IncrementEntity } from '@/utils/base.entity';
import { Entity, Column, ManyToOne, ManyToMany, JoinColumn } from 'typeorm';

export enum TargetGender {
  all = 'all',
  male = 'male',
  female = 'female',
}

export enum PriceType {
  fixed = 'fixed',
  from = 'from',
  free = 'free',
}

@Entity()
export class Service extends IncrementEntity {
  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  price: number;

  @Column({ nullable: true })
  thumbnailUrl: string;

  @Column({ type: 'enum', enum: TargetGender, default: TargetGender.all })
  targetGender: TargetGender;

  @Column({ nullable: true })
  duration?: number; // in minutes

  @ManyToMany(() => Member, (member) => member.services)
  members: Member[];

  @Column('enum', { enum: PriceType, default: PriceType.fixed })
  priceType: PriceType;

  @Column({ nullable: true })
  categoryId: number;

  @ManyToOne(() => Category, { onDelete: 'SET NULL', eager: true })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @ManyToOne(() => Organization)
  organization: Organization;
}
