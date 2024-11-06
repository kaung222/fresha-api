import { Organization } from '@/app/organizations/entities/organization.entity';
import { Service } from '@/app/services/entities/service.entity';
import {
  Column,
  Entity,
  Index,
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

  @ManyToOne(() => Organization)
  organization: Organization;

  @OneToMany(() => Service, (service) => service.category)
  services: Service[];
}
