import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Review } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
  ) {}

  async create(
    createReviewDto: CreateReviewDto,
    receiverId: number,
  ): Promise<Review> {
    const review = this.reviewRepository.create({
      receiverId,
      donorId: createReviewDto.donorId,
      rating: createReviewDto.rating,
      comment: createReviewDto.comment,
    });

    return await this.reviewRepository.save(review);
  }

  async findAll(): Promise<Review[]> {
    return await this.reviewRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
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
    currentUserId: number,
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
    currentUserId: number,
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