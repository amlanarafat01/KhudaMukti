import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { LocalUser } from '../../food-listing/entities/local-user.entity.js';
import { Claim } from '../../claims/entities/claim.entity.js';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  claimId: number;

  @OneToOne(() => Claim, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'claimId' })
  claim: Claim;

  @Column({ type: 'varchar', length: 10 })
  receiverId: string;

  @ManyToOne(() => LocalUser, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'receiverId' })
  receiver: LocalUser;

  @Column({ type: 'varchar', length: 10 })
  donorId: string;

  @ManyToOne(() => LocalUser, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'donorId' })
  donor: LocalUser;

  @Column({ type: 'int' })
  rating: number;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
