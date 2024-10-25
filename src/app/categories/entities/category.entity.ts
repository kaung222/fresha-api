import { Organization } from '@/app/organizations/entities/organization.entity';
import { Service } from '@/app/services/entities/service.entity';
import { IncrementEntity } from '@/utils/base.entity';
import { Column, Entity, Index, ManyToOne, OneToMany } from 'typeorm';

@Entity()
export class Category extends IncrementEntity {
  @Column()
  name: string;

  @Index('creatorId')
  @Column()
  creatorId: number;

  @Column({ nullable: true })
  notes: string;

  @ManyToOne(() => Organization)
  organization: Organization;

  @OneToMany(() => Service, (service) => service.category)
  services: Service[];
}
