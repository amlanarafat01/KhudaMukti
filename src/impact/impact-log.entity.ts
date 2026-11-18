import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Claim } from '../claims/claim.entity';

// numeric columns come back from pg as strings; convert them to numbers
const numeric = { to: (v?: number) => v, from: (v: string | null) => (v === null ? null : parseFloat(v)) };

@Entity('impact_logs')
export class ImpactLog {
  @PrimaryGeneratedColumn()
  id: number;

  // 1-1 with claims; deleting a claim removes its log
  @Column({ name: 'claim_id', type: 'int', unique: true })
  claimId: number;

  @OneToOne(() => Claim, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'claim_id' })
  claim: Claim;

  @Column({ name: 'meals_saved', type: 'int' })
  mealsSaved: number;

  @Column({ name: 'kg_rescued', type: 'numeric', precision: 10, scale: 2, transformer: numeric })
  kgRescued: number;

  @Column({ name: 'co2_saved', type: 'numeric', precision: 10, scale: 2, transformer: numeric })
  co2Saved: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
