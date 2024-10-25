import { Organization } from '@/app/organizations/entities/organization.entity';
import { IncrementEntity } from '@/utils';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity()
export class Branch extends IncrementEntity {
  @Column()
  name: string;

  @Column()
  address: string;

  @Column()
  notes: string;

  @Column('simple-array')
  images: string[];

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  organization: Organization;
}
