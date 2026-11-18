// STUB of Member 1's entity. Mirrors the EXISTING `users` table in khudamukti_db exactly
// (string id, camelCase "isVerified"). Replace with Member 1's file when merging.
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryColumn({ type: 'varchar', length: 50 })
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'int', nullable: true })
  age: number | null;

  @Column({ type: 'varchar', length: 255, nullable: true, unique: true })
  email: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  address: string | null;

  @Column({ name: 'isBangladeshi', type: 'boolean', default: true })
  isBangladeshi: boolean;

  @Column({ type: 'varchar', length: 30, nullable: true })
  gender: string | null;

  // never selected by default, so it can not leak through any query
  @Column({ type: 'varchar', length: 255, nullable: true, select: false })
  password: string | null;

  @Column({ type: 'varchar', length: 30, default: 'donor' })
  role: string;

  @Column({ name: 'isVerified', type: 'boolean', default: false })
  isVerified: boolean;
}
