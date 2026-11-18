import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDeliveryReviewTables1710840001000 implements MigrationInterface {
  name = 'CreateDeliveryReviewTables1710840001000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "deliveries_status_enum" AS ENUM ('OPEN', 'ACCEPTED', 'PICKED_UP', 'DELIVERED');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "claims" (
        "id" SERIAL PRIMARY KEY,
        "listing_id" integer NOT NULL,
        "receiver_id" varchar(10) NOT NULL,
        "quantity" integer NOT NULL,
        "status" varchar(20) NOT NULL DEFAULT 'CONFIRMED',
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "deliveries" (
        "id" SERIAL PRIMARY KEY,
        "claimId" integer NOT NULL UNIQUE,
        "volunteerId" varchar(10) NULL,
        "status" "deliveries_status_enum" NOT NULL DEFAULT 'OPEN',
        "pickedAt" TIMESTAMP NULL,
        "deliveredAt" TIMESTAMP NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "reviews" (
        "id" SERIAL PRIMARY KEY,
        "claimId" integer NOT NULL UNIQUE,
        "receiverId" varchar(10) NOT NULL,
        "donorId" varchar(10) NOT NULL,
        "rating" integer NOT NULL CHECK ("rating" BETWEEN 1 AND 5),
        "comment" text NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS "reviews"');
    await queryRunner.query('DROP TABLE IF EXISTS "deliveries"');
    await queryRunner.query('DROP TABLE IF EXISTS "claims"');
    await queryRunner.query('DROP TYPE IF EXISTS "deliveries_status_enum"');
  }
}
