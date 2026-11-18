import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';

import { Review } from './entities/review.entity.js';
import { Delivery } from '../deliveries/entities/delivery.entity.js';
import { FoodListing } from '../food-listing/entities/food-listing.entity.js';
import { CreateReviewDto } from './dto/create-review.dto.js';
import { UpdateReviewDto } from './dto/update-review.dto.js';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(Delivery)
    private readonly deliveryRepository: Repository<Delivery>,
    @InjectRepository(FoodListing)
    private readonly listingRepository: Repository<FoodListing>,
  ) {}

  async create(
    createReviewDto: CreateReviewDto,
    receiverId: string,
  ): Promise<Review> {
    const delivery = await this.deliveryRepository.findOne({
      where: { claimId: createReviewDto.claimId },
    });
    if (!delivery || delivery.status !== 'DELIVERED') {
      throw new ForbiddenException(
        'A review can be created only after delivery',
      );
    }
    const claim = delivery.claim as unknown as {
      receiverId: string | number;
      listingId: number;
    };
    if (String(claim.receiverId) !== receiverId) {
      throw new ForbiddenException(
        'You can review only a delivery claimed by you',
      );
    }
    const listing = await this.listingRepository.findOne({
      where: { id: claim.listingId },
      relations: { donor: true },
    });
    if (!listing) throw new NotFoundException('Food listing not found');
    const existingReview = await this.reviewRepository.findOne({
      where: { claimId: createReviewDto.claimId },
    });
    if (existingReview)
      throw new ConflictException('This delivery has already been reviewed');

    const review = this.reviewRepository.create({
      claimId: createReviewDto.claimId,
      receiverId,
      donorId: listing.donor.id,
      rating: createReviewDto.rating,
      comment: createReviewDto.comment,
    });

    try {
      return await this.reviewRepository.save(review);
    } catch (error) {
      if (
        (error as { driverError?: { code?: string } })?.driverError?.code ===
        '23505'
      ) {
        throw new ConflictException('This delivery has already been reviewed');
      }
      throw error;
    }
  }

  async findAll(query: PaginationQueryDto) {
    const [items, total] = await this.reviewRepository.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    });
    return {
      items,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        pages: Math.ceil(total / query.limit),
      },
    };
  }

  async findOne(id: number): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return review;
  }

  async update(
    id: number,
    updateReviewDto: UpdateReviewDto,
    currentUserId: string,
  ): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.receiverId !== currentUserId) {
      throw new ForbiddenException('You can update only your own review');
    }

    Object.assign(review, updateReviewDto);

    return await this.reviewRepository.save(review);
  }

  async remove(
    id: number,
    currentUserId: string,
    role: string,
  ): Promise<{ message: string }> {
    const review = await this.reviewRepository.findOne({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.receiverId !== currentUserId && role !== 'ADMIN') {
      throw new ForbiddenException('You can delete only your own review');
    }

    await this.reviewRepository.remove(review);

    return {
      message: 'Review deleted successfully',
    };
  }
}
