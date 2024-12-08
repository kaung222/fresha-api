import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class OrgType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  icon: string;
}
