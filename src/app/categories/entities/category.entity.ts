import { Organization } from '@/app/organizations/entities/organization.entity';
import { Service } from '@/app/services/entities/service.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  notes: string;

  @Column('int', { default: 0 })
  serviceCount: number;

  @Index('orgId')
  @Column()
  orgId: number;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'orgId' })
  organization: Organization;

  @OneToMany(() => Service, (service) => service.category)
  services: Service[];
}
