import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class File {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index('file_url')
  url: string;

  @Column('boolean', { default: false })
  isUsed: boolean;

  @Column({ nullable: true })
  userId: string;
}
