import { UUIDEntity } from '@/utils';
import { encryptToken } from '@/utils/test';
import { BeforeInsert, Column, Entity } from 'typeorm';

@Entity()
export class TokenSession extends UUIDEntity {
  @Column('text')
  token: string;

  @Column()
  userId: string;

  @Column('timestamp')
  expiredAt: Date;

  @BeforeInsert()
  encryptToken() {
    this.token = encryptToken(this.token);
  }
}
