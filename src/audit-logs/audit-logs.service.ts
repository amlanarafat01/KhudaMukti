import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity.js';

@Injectable()
export class AuditLogsService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly repository: Repository<AuditLog>,
    private readonly dataSource: DataSource,
  ) {}

  list(page = 1, limit = 20) {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(100, Math.max(1, limit));
    return this.repository
      .findAndCount({
        order: { createdAt: 'DESC' },
        skip: (safePage - 1) * safeLimit,
        take: safeLimit,
      })
      .then(([items, total]) => ({
        items,
        meta: {
          page: safePage,
          limit: safeLimit,
          total,
          pages: Math.ceil(total / safeLimit),
        },
      }));
  }

  async snapshot(entity: 'food_listings' | 'claims', id: string | number) {
    const rows = await this.dataSource.query(
      `SELECT * FROM \"${entity}\" WHERE id = $1 LIMIT 1`,
      [id],
    );
    return rows[0] ?? null;
  }

  record(entry: Partial<AuditLog>) {
    return this.repository.save(this.repository.create(entry));
  }
}
