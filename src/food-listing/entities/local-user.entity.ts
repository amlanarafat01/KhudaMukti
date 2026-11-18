import {
  Entity,
  PrimaryColumn,
  Column,
} from 'typeorm';

@Entity('users')
export class LocalUser {
  @PrimaryColumn({
    type: 'varchar',
    length: 10,
  })
  id!: string;

  @Column({
    type: 'varchar',
    length: 30,
  })
  role!: string;

  @Column({
    name: 'isVerified',
    type: 'boolean',
  })
  isVerified!: boolean;
}