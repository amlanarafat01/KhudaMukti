import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAuditLogs1710840000000 implements MigrationInterface {
  name = 'CreateAuditLogs1710840000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "audit_logs" (
        "id" SERIAL PRIMARY KEY,
        "userId" varchar(64) NULL,
        "action" varchar(16) NOT NULL,
        "entity" varchar(80) NOT NULL,
        "entityId" varchar(80) NULL,
        "oldValue" jsonb NULL,
        "newValue" jsonb NULL,
        "ip" varchar(64) NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS "IDX_audit_logs_entity_entityId" ON "audit_logs" ("entity", "entityId")',
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX IF EXISTS "IDX_audit_logs_entity_entityId"',
    );
    await queryRunner.query('DROP TABLE IF EXISTS "audit_logs"');
  }
}
