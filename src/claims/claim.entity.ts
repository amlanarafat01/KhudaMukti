import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { FoodListing } from '../listings/food-listing.entity';
import { User } from '../users/user.entity';

export enum ClaimStatus {
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED', // set by the delivery flow (Member 4) once food is delivered
}

@Entity('claims')
export class Claim {
  @PrimaryGeneratedColumn()
  id: number;

  @Index('idx_claims_listing')
  @Column({ name: 'listing_id', type: 'int' })
  listingId: number;

  @ManyToOne(() => FoodListing, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'listing_id' })
  listing: FoodListing;

  @Index('idx_claims_receiver')
  @Column({ name: 'receiver_id', type: 'varchar', length: 50 })
  receiverId: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'receiver_id' })
  receiver: User;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'varchar', length: 20, default: ClaimStatus.CONFIRMED })
  status: string;

  @Column({ name: 'cancel_reason', type: 'text', nullable: true })
  cancelReason: string | null;

  @Column({ name: 'cancelled_at', type: 'timestamptz', nullable: true })
  cancelledAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
