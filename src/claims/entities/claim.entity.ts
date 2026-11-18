import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { FoodListing } from '../../food-listing/entities/food-listing.entity.js';
import { LocalUser } from '../../food-listing/entities/local-user.entity.js';

@Entity('claims')
export class Claim {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'listing_id', type: 'integer' })
  listingId: number;

  @ManyToOne(() => FoodListing, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'listing_id' })
  listing: FoodListing;

  @Column({ name: 'receiver_id', type: 'varchar', length: 10 })
  receiverId: string;

  @ManyToOne(() => LocalUser, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'receiver_id', referencedColumnName: 'id' })
  receiver: LocalUser;

  @Column({ type: 'integer' })
  quantity: number;

  @Column({ type: 'varchar', length: 20, default: 'CONFIRMED' })
  status: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
