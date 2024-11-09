import { Organization } from '@/app/organizations/entities/organization.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ClosedDay {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('date')
  startDate: string;

  @Column('date')
  endDate: string;

  @Column({ nullable: true })
  notes: string;

  @Column({ default: 'Holidays' })
  type: string;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  organization: Organization;
}
