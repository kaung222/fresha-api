import { Organization } from '@/app/organizations/entities/organization.entity';
import { UUIDEntity } from '@/utils';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity()
export class Branch extends UUIDEntity {
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
