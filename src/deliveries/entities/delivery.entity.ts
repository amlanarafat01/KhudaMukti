import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Claim } from '../../claims/entities/claim.entity.js';
import { LocalUser } from '../../food-listing/entities/local-user.entity.js';
import { DeliveryStatus } from './delivery-status.enum.js';

@Entity('deliveries')
export class Delivery {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  claimId: number;

  @OneToOne(() => Claim, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'claimId' })
  claim: Claim;

  @Column({ type: 'varchar', length: 10, nullable: true })
  volunteerId: string;

  @ManyToOne(() => LocalUser, {
    nullable: true,
    eager: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'volunteerId' })
  volunteer: LocalUser;

  @Column({
    type: 'enum',
    enum: DeliveryStatus,
    default: DeliveryStatus.OPEN,
  })
  status: DeliveryStatus;

  @Column({ type: 'timestamp', nullable: true })
  pickedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deliveredAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
