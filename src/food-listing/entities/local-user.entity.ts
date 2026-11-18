import { Column, Entity, PrimaryColumn } from 'typeorm';
@Entity('users')
export class LocalUser {
  @PrimaryColumn({ type: 'varchar', length: 50 }) id!: string;
  @Column({ type: 'varchar', length: 100 }) name!: string;
  @Column({ type: 'varchar', length: 255, nullable: true, unique: true }) email!: string | null;
  @Column({ type: 'varchar', length: 255, nullable: true, select: false }) password!: string | null;
  @Column({ type: 'varchar', length: 30, default: 'donor' }) role!: string;
  @Column({ name: 'isVerified', type: 'boolean', default: false }) isVerified!: boolean;
  @Column({ type: 'integer', nullable: true }) age!: number | null;
  @Column({ type: 'varchar', length: 500, nullable: true }) address!: string | null;
  @Column({ name: 'isBangladeshi', type: 'boolean', nullable: true, default: true }) isBangladeshi!: boolean | null;
  @Column({ type: 'varchar', length: 30, nullable: true }) gender!: string | null;
}
