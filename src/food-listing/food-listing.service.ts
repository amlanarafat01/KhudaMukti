
import { Injectable, NotFoundException, ForbiddenException, BadRequestException, ConflictException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, DataSource} from 'typeorm';
import { FoodListing } from './entities/food-listing.entity.js';
import { ListingStatus } from './entities/listing-status.enum.js';
import { FoodCategory } from '../food-category/entities/food-category.entity.js';
import { LocalUser } from './entities/local-user.entity.js';
import { CreateFoodListingDto } from './dto/create-food-listing.dto.js';
import { UpdateFoodListingDto } from './dto/update-food-listing.dto.js';
import { QueryFoodListingDto } from './dto/query-food-listing.dto.js';

function getPgErrorCode(error: unknown): string | undefined {
  if (typeof error !== 'object' || error === null) {
    return undefined;
  }
  const err = error as {
    code?: string;
    driverError?: {
      code?: string;
    };
  };

  return err.driverError?.code ?? err.code;
}

@Injectable()
export class FoodListingsService {
  constructor(
    @InjectRepository(FoodListing)
    private readonly listingRepository: Repository<FoodListing>,

    @InjectRepository(FoodCategory)
    private readonly categoryRepository: Repository<FoodCategory>,

    @InjectRepository(LocalUser)
    private readonly usersRepository: Repository<LocalUser>,

    private readonly dataSource: DataSource,
  ) {}

  private async getCategories(
    categoryIds: number[],
    repository: Repository<FoodCategory> = this.categoryRepository,
  ): Promise<FoodCategory[]> {
    const categories = await repository.findBy({
      id: In(categoryIds),
    });

    if (categories.length !== categoryIds.length) {
      throw new BadRequestException(
        'One or more category IDs are invalid',
      );
    }

    return categories;
  }

  async create(dto: CreateFoodListingDto,donorId: string): Promise<FoodListing> {
    const donor = await this.usersRepository.findOneBy({
      id: donorId,
    });

    if (!donor) {
      throw new NotFoundException('Donor not found');
    }

    if (donor.role?.toLowerCase() !== 'donor') {
      throw new ForbiddenException(
        'Only donors can create food listings',
      );
    }

    if (!donor.isVerified) {
      throw new ForbiddenException(
        'Donor must be verified first',
      );
    }

    const expiryDate = new Date(dto.expiresAt);

    if (
      Number.isNaN(expiryDate.getTime()) ||
      expiryDate <= new Date()
    ) {
      throw new BadRequestException(
        'Expiry date must be in the future',
      );
    }

    const categories = await this.getCategories(
      dto.categoryIds,
    );

    const listing = this.listingRepository.create({
      title: dto.title.trim(),
      description: dto.description?.trim() ?? null,
      totalQty: dto.totalQty,
      availableQty: dto.totalQty,
      unit: dto.unit.trim(),
      expiresAt: expiryDate,
      pickupAddress: dto.pickupAddress.trim(),
      status: ListingStatus.AVAILABLE,
      donor,
      categories,
    });

    const savedListing =
      await this.listingRepository.save(listing);

    return this.findOne(savedListing.id);
  }

  // Get all listings with filtering and pagination
  async findAll(query: QueryFoodListingDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const queryBuilder = this.listingRepository
      .createQueryBuilder('listing')
      .leftJoinAndSelect(
        'listing.categories',
        'category',
      )
      .distinct(true);

    // Filter by area
    if (query.area?.trim()) {
      queryBuilder.andWhere(
        'listing.pickupAddress ILIKE :area',
        {
          area: `%${query.area.trim()}%`,
        },
      );
    }

    // Filter by category
    if (query.category?.trim()) {
      queryBuilder.andWhere(
        'LOWER(category.name) = LOWER(:category)',
        {
          category: query.category.trim(),
        },
      );
    }

    // Filter by status
    if (query.status) {
      queryBuilder.andWhere(
        'listing.status = :status',
        {
          status: query.status,
        },
      );
    }

    // Sort by latest listing
    queryBuilder.orderBy(
      'listing.createdAt',
      'DESC',
    );

    // Pagination
    queryBuilder
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] =
      await queryBuilder.getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get listing by ID
  async findOne(id: number): Promise<FoodListing> {
    const listing =
      await this.listingRepository.findOne({
        where: { id },
        relations: {
          categories: true,
        },
      });

    if (!listing) {
      throw new NotFoundException(
        'Food listing not found',
      );
    }

    return listing;
  }

  // Update food listing
  async update(
    id: number,
    dto: UpdateFoodListingDto,
    donorId: string,
  ): Promise<FoodListing> {

    const updatedId = await this.dataSource.transaction(
      async (manager) => {
        const listingRepository =
          manager.getRepository(FoodListing);

        const categoryRepository =
          manager.getRepository(FoodCategory);

        // Find and lock listing row
        const listing =
          await listingRepository.findOne({
            where: { id },

            lock: {
              mode: 'pessimistic_write',
            },
          });

        if (!listing) {
          throw new NotFoundException(
            'Food listing not found',
          );
        }

        // Check listing owner
        const ownerRows: Array<{ donor_id: string }> =
          await manager.query(
            'SELECT donor_id FROM food_listings WHERE id = $1',
            [id],
          );

        if (ownerRows[0]?.donor_id !== donorId) {
          throw new ForbiddenException(
            'You cannot update another donor listing',
          );
        }

        // Check listing status
        if (
          listing.status !== ListingStatus.AVAILABLE ||
          listing.expiresAt <= new Date()
        ) {
          throw new ConflictException(
            'Only available and non-expired listings can be updated',
          );
        }

        // Update title
        if (dto.title !== undefined) {
          listing.title = dto.title.trim();
        }

        // Update description
        if (dto.description !== undefined) {
          listing.description = dto.description.trim();
        }

        // Update unit
        if (dto.unit !== undefined) {
          listing.unit = dto.unit.trim();
        }

        // Update pickup address
        if (dto.pickupAddress !== undefined) {
          listing.pickupAddress =
            dto.pickupAddress.trim();
        }

        // Update quantity
        if (dto.totalQty !== undefined) {
          const claimedQty =
            listing.totalQty - listing.availableQty;

          if (dto.totalQty < claimedQty) {
            throw new BadRequestException(
              'Total quantity cannot be less than already claimed quantity',
            );
          }

          listing.totalQty = dto.totalQty;

          listing.availableQty =
            dto.totalQty - claimedQty;
        }

        // Update expiry date
        if (dto.expiresAt !== undefined) {
          const expiryDate = new Date(dto.expiresAt);

          if (
            Number.isNaN(expiryDate.getTime()) ||
            expiryDate <= new Date()
          ) {
            throw new BadRequestException(
              'Expiry date must be in the future',
            );
          }

          listing.expiresAt = expiryDate;
        }

        // Update categories
        if (dto.categoryIds !== undefined) {
          listing.categories =
            await this.getCategories(
              dto.categoryIds,
              categoryRepository,
            );
        }

        await listingRepository.save(listing);

        return listing.id;
      },
    );

    // Return updated listing with categories
    return this.findOne(updatedId);
  }

async remove(
  id: number,
  userId: string,
): Promise<{ message: string }> {

  const listing = await this.listingRepository.findOneBy({
    id,
  });

  if (!listing) {
    throw new NotFoundException(
      'Food listing not found',
    );
  }

  const ownerRows: Array<{ donor_id: string }> =
    await this.dataSource.query(
      'SELECT donor_id FROM food_listings WHERE id = $1',
      [id],
    );

  // Only the owner can delete the listing
  if (ownerRows[0]?.donor_id !== userId) {
    throw new ForbiddenException(
      'You cannot delete another donor listing',
    );
  }

  try {
    await this.listingRepository.remove(listing);

    return {
      message: 'Food listing deleted successfully',
    };
  } catch (error: unknown) {
    if (getPgErrorCode(error) === '23503') {
      throw new ConflictException(
        'This listing has related claims and cannot be deleted',
      );
    }

    throw error;
  }
}
}

