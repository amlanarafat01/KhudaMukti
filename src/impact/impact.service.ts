import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Claim } from '../claims/claim.entity';
import { buildMeta, PaginationQueryDto } from '../shared/pagination-query.dto';
import { CreateImpactLogDto } from './dto/create-impact-log.dto';
import { UpdateImpactLogDto } from './dto/update-impact-log.dto';
import { ImpactLog } from './impact-log.entity';

@Injectable()
export class ImpactService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(ImpactLog) private readonly logs: Repository<ImpactLog>,
    @InjectRepository(Claim) private readonly claims: Repository<Claim>,
  ) {}

  // ---------------- reports ----------------

  /** Totals across every impact log: meals saved, kg rescued, CO2 avoided. */
  async summary() {
    const [row] = await this.dataSource.query(`
      SELECT COALESCE(SUM(meals_saved), 0)::int  AS "mealsSaved",
             COALESCE(SUM(kg_rescued), 0)::float8 AS "kgRescued",
             COALESCE(SUM(co2_saved), 0)::float8  AS "co2Avoided",
             COUNT(*)::int                        AS "claimsCounted"
      FROM impact_logs`);
    return {
      mealsSaved: row.mealsSaved,
      kgRescued: Math.round(row.kgRescued * 100) / 100,
      co2Avoided: Math.round(row.co2Avoided * 100) / 100,
      claimsCounted: row.claimsCounted,
    };
  }

  /** Top donors ranked by meals saved. */
  async leaderboard(limit: number) {
    const rows = await this.dataSource.query(
      `
      SELECT u.id   AS "donorId",
             u.name AS "donorName",
             SUM(i.meals_saved)::int    AS "mealsSaved",
             SUM(i.kg_rescued)::float8  AS "kgRescued",
             SUM(i.co2_saved)::float8   AS "co2Avoided",
             COUNT(*)::int              AS "claims"
      FROM impact_logs i
      JOIN claims c        ON c.id = i.claim_id
      JOIN food_listings l ON l.id = c.listing_id
      JOIN users u         ON u.id = l.donor_id
      GROUP BY u.id, u.name
      ORDER BY "mealsSaved" DESC, "kgRescued" DESC, u.name ASC
      LIMIT $1`,
      [limit],
    );
    return rows.map((r: any, i: number) => ({
      rank: i + 1,
      ...r,
      kgRescued: Math.round(r.kgRescued * 100) / 100,
      co2Avoided: Math.round(r.co2Avoided * 100) / 100,
    }));
  }

  // ---------------- admin CRUD on impact_logs ----------------

  async create(dto: CreateImpactLogDto) {
    const claim = await this.claims.findOne({ where: { id: dto.claimId } });
    if (!claim) throw new NotFoundException(`Claim ${dto.claimId} not found`);
    if (await this.logs.exist({ where: { claimId: dto.claimId } })) {
      throw new ConflictException(`Claim ${dto.claimId} already has an impact log`);
    }
    return this.logs.save(this.logs.create(dto));
  }

  async findAll(query: PaginationQueryDto) {
    const [data, total] = await this.logs.findAndCount({
      order: { createdAt: 'DESC', id: 'DESC' },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    });
    return { data, meta: buildMeta(total, query.page, query.limit) };
  }

  async findOne(id: number) {
    const log = await this.logs.findOne({ where: { id } });
    if (!log) throw new NotFoundException(`Impact log ${id} not found`);
    return log;
  }

  async update(id: number, dto: UpdateImpactLogDto) {
    const log = await this.findOne(id);
    Object.assign(log, dto);
    return this.logs.save(log);
  }

  async remove(id: number) {
    const log = await this.findOne(id);
    await this.logs.remove(log);
    return { id, deleted: true };
  }
}
