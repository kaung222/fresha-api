import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export enum Currency {
  mmk = 'MMK',
  thb = 'THB',
  cyn = 'CNY',
  usd = 'USD',
  eur = 'EUR',
}

@Entity()
export class Feature {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index('orgId')
  orgId: number;

  @Column('boolean')
  isAcceptEmail: boolean;

  @Column('boolean')
  isAcceptNotify: boolean;

  @Column('enum', { enum: Currency, default: Currency.mmk })
  currency: Currency;
}
