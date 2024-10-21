import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class File {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  url: string;

  @Column('boolean', { default: false })
  isUsed: boolean;
}
