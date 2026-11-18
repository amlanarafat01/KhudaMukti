// STUB of Member 2's entity. Mirrors the EXISTING `food_listings` table (integer id, string donor_id).
// Member 2 adds the many-to-many categories relation in the real file.
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export enum ListingStatus {
  AVAILABLE = 'AVAILABLE',
  CLAIMED = 'CLAIMED',
  EXPIRED = 'EXPIRED',
}

@Entity('food_listings')
export class FoodListing {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'donor_id', type: 'varchar', length: 10 })
  donorId: string;

  @Column({ type: 'varchar', length: 150 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'total_qty', type: 'int' })
  totalQty: number;

  @Column({ name: 'available_qty', type: 'int' })
  availableQty: number;

  @Column({ type: 'varchar', length: 30 })
  unit: string;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt: Date;

  @Column({ name: 'pickup_address', type: 'varchar', length: 500 })
  pickupAddress: string;

  @Column({ type: 'varchar', length: 20, default: ListingStatus.AVAILABLE })
  status: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
