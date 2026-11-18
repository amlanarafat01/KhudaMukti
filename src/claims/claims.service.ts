import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Delivery, DeliveryStatus } from '../deliveries/delivery.entity';
import { calculateImpact } from '../impact/impact.calculator';
import { ImpactLog } from '../impact/impact-log.entity';
import { FoodListing, ListingStatus } from '../listings/food-listing.entity';
import { MailService } from '../mail/mail.service';
import { AuthUser, Role } from '../shared/roles.enum';
import { buildMeta } from '../shared/pagination-query.dto';
import { User } from '../users/user.entity';
import { Claim, ClaimStatus } from './claim.entity';
import { CreateClaimDto } from './dto/create-claim.dto';
import { CancelClaimDto } from './dto/update-claim.dto';
import { QueryClaimDto } from './dto/query-claim.dto';

@Injectable()
export class ClaimsService {
  private readonly logger = new Logger(ClaimsService.name);

  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Claim) private readonly claims: Repository<Claim>,
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly mail: MailService,
    private readonly config: ConfigService,
  ) {}

  // ---------------------------------------------------------------------------
  // CORE TRANSACTION: claim food
  // lock listing -> validate -> insert claim -> reduce stock -> insert delivery -> insert impact log
  // Any error rolls everything back. The listing row lock stops two receivers over-claiming.
  // ---------------------------------------------------------------------------
  async create(dto: CreateClaimDto, authUser: AuthUser) {
    if (dto.simulateFailure && !this.config.get<boolean>('ALLOW_DEMO_FAILURE')) {
      throw new ForbiddenException('Demo failure mode is disabled (set ALLOW_DEMO_FAILURE=true)');
    }

    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      // fresh DB check, so a stale token can not claim after a block or un-verify
      const receiver = await qr.manager.findOne(User, { where: { id: authUser.id } });
      if (!receiver) throw new NotFoundException('User not found');
      if (!receiver.isVerified) throw new ForbiddenException('Your account is not verified yet');

      // 1. lock the listing row (SELECT ... FOR UPDATE). Other claims on it wait here.
      const listing = await qr.manager.findOne(FoodListing, {
        where: { id: dto.listingId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!listing) throw new NotFoundException(`Listing ${dto.listingId} not found`);

      // 2. validate against the locked, up-to-date row
      if (listing.status === ListingStatus.EXPIRED || listing.expiresAt.getTime() <= Date.now()) {
        throw new ConflictException('This listing has expired');
      }
      if (listing.status !== ListingStatus.AVAILABLE) {
        throw new ConflictException('This listing is no longer available');
      }
      if (listing.availableQty < dto.quantity) {
        throw new ConflictException(`Only ${listing.availableQty} ${listing.unit} left, you asked for ${dto.quantity}`);
      }

      // 3. insert the claim
      const claim = await qr.manager.save(
        qr.manager.create(Claim, {
          listingId: listing.id,
          receiverId: receiver.id,
          quantity: dto.quantity,
          status: ClaimStatus.CONFIRMED,
        }),
      );

      // 4. reduce stock; CLAIMED when nothing is left
      listing.availableQty -= dto.quantity;
      if (listing.availableQty === 0) listing.status = ListingStatus.CLAIMED;
      await qr.manager.save(listing);

      // 5. open delivery task for volunteers
      await qr.manager.save(
        qr.manager.create(Delivery, { claimId: claim.id, volunteerId: null, status: DeliveryStatus.OPEN }),
      );

      // 6. impact log
      const impact = calculateImpact(dto.quantity, listing.unit);
      await qr.manager.save(qr.manager.create(ImpactLog, { claimId: claim.id, ...impact }));

      // deliberate failure for the rollback demo: everything above is undone
      if (dto.simulateFailure) {
        throw new InternalServerErrorException('Simulated failure after all inserts (rollback demo)');
      }

      await qr.commitTransaction();

      // email only after commit; fire and forget, failures are logged and ignored
      void this.notify(claim, listing, receiver);

      return { ...claim, listing, impact };
    } catch (err) {
      await qr.rollbackTransaction();
      throw err;
    } finally {
      await qr.release();
    }
  }

  // ---------------------------------------------------------------------------
  // READ
  // ---------------------------------------------------------------------------
  async findAll(query: QueryClaimDto, user: AuthUser) {
    const qb = this.claims
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.listing', 'l')
      .orderBy('c.createdAt', 'DESC')
      .skip((query.page - 1) * query.limit)
      .take(query.limit);

    if (user.role === Role.RECEIVER) qb.andWhere('c.receiverId = :uid', { uid: user.id });
    else if (user.role === Role.DONOR) qb.andWhere('l.donorId = :uid', { uid: user.id }); // claims on own listings
    if (query.status) qb.andWhere('c.status = :status', { status: query.status });

    const [data, total] = await qb.getManyAndCount();
    return { data, meta: buildMeta(total, query.page, query.limit) };
  }

  async findOne(id: number, user: AuthUser) {
    const claim = await this.claims.findOne({ where: { id }, relations: { listing: true } });
    if (!claim) throw new NotFoundException(`Claim ${id} not found`);

    const allowed =
      user.role === Role.ADMIN ||
      claim.receiverId === user.id ||
      (user.role === Role.DONOR && claim.listing.donorId === user.id);
    if (!allowed) throw new ForbiddenException('You can not view this claim');
    return claim;
  }

  // ---------------------------------------------------------------------------
  // UPDATE: cancel own claim and restore stock (transaction)
  // ---------------------------------------------------------------------------
  async cancel(id: number, dto: CancelClaimDto, user: AuthUser) {
    const pre = await this.claims.findOne({ where: { id } });
    if (!pre) throw new NotFoundException(`Claim ${id} not found`);
    if (pre.receiverId !== user.id) throw new ForbiddenException('You can only cancel your own claim');

    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();
    try {
      // same lock order everywhere: listing first, then claim (avoids deadlocks and double restore)
      const listing = await qr.manager.findOneOrFail(FoodListing, {
        where: { id: pre.listingId },
        lock: { mode: 'pessimistic_write' },
      });
      const claim = await qr.manager.findOneOrFail(Claim, { where: { id }, lock: { mode: 'pessimistic_write' } });

      if (claim.status !== ClaimStatus.CONFIRMED) {
        throw new ConflictException(`Claim is already ${claim.status.toLowerCase()}`);
      }

      const delivery = await qr.manager.findOne(Delivery, {
        where: { claimId: id },
        lock: { mode: 'pessimistic_write' },
      });
      if (delivery && delivery.status !== DeliveryStatus.OPEN) {
        throw new ConflictException('A volunteer already took this delivery, so the claim can not be cancelled');
      }

      // give the quantity back
      listing.availableQty += claim.quantity;
      if (listing.status === ListingStatus.CLAIMED && listing.expiresAt.getTime() > Date.now()) {
        listing.status = ListingStatus.AVAILABLE;
      }
      await qr.manager.save(listing);

      claim.status = ClaimStatus.CANCELLED;
      claim.cancelledAt = new Date();
      claim.cancelReason = dto.reason ?? null;
      await qr.manager.save(claim);

      if (delivery) {
        delivery.status = DeliveryStatus.CANCELLED;
        await qr.manager.save(delivery);
      }
      // meals were not saved, so the impact log goes away
      await qr.manager.delete(ImpactLog, { claimId: id });

      await qr.commitTransaction();
      return claim;
    } catch (err) {
      await qr.rollbackTransaction();
      throw err;
    } finally {
      await qr.release();
    }
  }

  // ---------------------------------------------------------------------------
  // DELETE (Admin): remove a claim; stock is restored if the food never left
  // ---------------------------------------------------------------------------
  async remove(id: number) {
    const pre = await this.claims.findOne({ where: { id } });
    if (!pre) throw new NotFoundException(`Claim ${id} not found`);

    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();
    try {
      const listing = await qr.manager.findOneOrFail(FoodListing, {
        where: { id: pre.listingId },
        lock: { mode: 'pessimistic_write' },
      });
      const claim = await qr.manager.findOne(Claim, { where: { id }, lock: { mode: 'pessimistic_write' } });
      if (!claim) throw new NotFoundException(`Claim ${id} not found`);

      const delivery = await qr.manager.findOne(Delivery, { where: { claimId: id } });
      const foodDelivered = claim.status === ClaimStatus.COMPLETED || delivery?.status === DeliveryStatus.DELIVERED;

      if (claim.status === ClaimStatus.CONFIRMED && !foodDelivered) {
        listing.availableQty = Math.min(listing.totalQty, listing.availableQty + claim.quantity);
        if (listing.status === ListingStatus.CLAIMED && listing.expiresAt.getTime() > Date.now()) {
          listing.status = ListingStatus.AVAILABLE;
        }
        await qr.manager.save(listing);
      }

      // deliveries and impact_logs rows are removed by ON DELETE CASCADE
      await qr.manager.delete(Claim, { id });
      await qr.commitTransaction();
      return { id, deleted: true };
    } catch (err) {
      await qr.rollbackTransaction();
      throw err;
    } finally {
      await qr.release();
    }
  }

  // ---------------------------------------------------------------------------
  private async notify(claim: Claim, listing: FoodListing, receiver: User) {
    try {
      const donor = await this.users.findOne({ where: { id: listing.donorId } });
      await this.mail.sendClaimConfirmed(
        {
          claimId: claim.id,
          listingTitle: listing.title,
          quantity: claim.quantity,
          unit: listing.unit,
          pickupAddress: listing.pickupAddress,
          receiverName: receiver.name,
          donorName: donor?.name ?? 'Donor',
        },
        receiver.email,
        donor?.email,
      );
    } catch (e) {
      this.logger.warn(`Notification for claim #${claim.id} failed: ${(e as Error).message}`);
    }
  }
}
