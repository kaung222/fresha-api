// import {
//   Column,
//   Entity,
//   Index,
//   JoinColumn,
//   ManyToMany,
//   ManyToOne,
//   PrimaryGeneratedColumn,
// } from 'typeorm';
// import { Service } from '@/app/services/entities/service.entity';
// import { Organization } from '@/app/organizations/entities/organization.entity';
// import { DecimalColumn } from '@/utils/decorators/column.decorators';
// import { Appointment } from '@/app/appointments/entities/appointment.entity';

// export enum DiscountType {
//   fixed = 'fixed',
//   percent = 'percent',
//   free = 'free',
// }
// @Entity()
// export class Package {
//   @PrimaryGeneratedColumn()
//   id: number;

//   @DecimalColumn()
//   price: number;

//   @Column({ nullable: true })
//   name: string;

//   @Column('int', { default: 0 })
//   discount: number;

//   @Column('int', { default: 0 })
//   duration: number;

//   @Column('enum', { enum: DiscountType, default: DiscountType.fixed })
//   discountType: DiscountType;

//   @Column('text')
//   description: string;

//   @ManyToMany(() => Service, (service) => service.packages, {
//     eager: true,
//   })
//   @JoinColumn()
//   services: Service[];

//   @ManyToMany(() => Appointment, (app) => app.packages)
//   appointments: Appointment[];

//   @Index('orgId')
//   @Column()
//   orgId: number;

//   @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
//   @JoinColumn({ name: 'orgId' })
//   organization: Organization;
// }
