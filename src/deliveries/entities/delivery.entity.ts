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
import { Claim } from '../../claims/entities/claim.entity';
import { User } from '../../users/entities/user.entity';
import { DeliveryStatus } from './delivery-status.enum';

@Entity('deliveries')
export class Delivery {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  claimId: number;

  @OneToOne(() => Claim, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'claimId' })
  claim: Claim;

  @Column({ nullable: true })
  volunteerId: number;

  @ManyToOne(() => User, { nullable: true, eager: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'volunteerId' })
  volunteer: User;

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