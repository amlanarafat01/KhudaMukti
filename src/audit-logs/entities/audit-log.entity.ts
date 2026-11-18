import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('audit_logs')
@Index(['entity', 'entityId'])
export class AuditLog {
  @PrimaryGeneratedColumn() id: number;
  @Column({ type: 'varchar', length: 64, nullable: true }) userId:
    string | null;
  @Column({ type: 'varchar', length: 16 }) action: string;
  @Column({ type: 'varchar', length: 80 }) entity: string;
  @Column({ type: 'varchar', length: 80, nullable: true }) entityId:
    string | null;
  @Column({ type: 'jsonb', nullable: true }) oldValue: unknown;
  @Column({ type: 'jsonb', nullable: true }) newValue: unknown;
  @Column({ type: 'varchar', length: 64, nullable: true }) ip: string | null;
  @CreateDateColumn() createdAt: Date;
}
