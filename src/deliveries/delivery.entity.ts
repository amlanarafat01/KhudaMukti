// STUB of Member 4's entity. Member 3 only needs it to insert the OPEN delivery task inside the
// claim transaction and to cancel it. Member 4's real entity replaces this file.
import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Claim } from '../claims/claim.entity';

export enum DeliveryStatus {
  OPEN = 'OPEN',
  ACCEPTED = 'ACCEPTED',
  PICKED_UP = 'PICKED_UP',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

@Entity('deliveries')
export class Delivery {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'claim_id', type: 'int', unique: true })
  claimId: number;

  @OneToOne(() => Claim, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'claim_id' })
  claim: Claim;

  @Column({ name: 'volunteer_id', type: 'varchar', length: 50, nullable: true })
  volunteerId: string | null;

  @Column({ type: 'varchar', length: 20, default: DeliveryStatus.OPEN })
  status: string;

  @Column({ name: 'picked_at', type: 'timestamptz', nullable: true })
  pickedAt: Date | null;

  @Column({ name: 'delivered_at', type: 'timestamptz', nullable: true })
  deliveredAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
