import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Delivery } from './entities/delivery.entity';
import { DeliveryStatus } from './entities/delivery-status.enum';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { UpdateDeliveryStatusDto } from './dto/update-delivery-status.dto';
import { Claim } from '../claims/entities/claim.entity';

@Injectable()
export class DeliveriesService {
  constructor(
    @InjectRepository(Delivery)
    private readonly deliveryRepository: Repository<Delivery>,

    @InjectRepository(Claim)
    private readonly claimRepository: Repository<Claim>,
  ) {}

  async create(createDeliveryDto: CreateDeliveryDto): Promise<Delivery> {
    const { claimId } = createDeliveryDto;

    const claim = await this.claimRepository.findOne({
      where: { id: claimId },
    });

    if (!claim) {
      throw new NotFoundException('Claim not found');
    }

    const existingDelivery = await this.deliveryRepository.findOne({
      where: { claimId },
    });

    if (existingDelivery) {
      throw new ConflictException('Delivery already exists for this claim');
    }

    const delivery = this.deliveryRepository.create({
      claimId,
      status: DeliveryStatus.OPEN,
    });

    return await this.deliveryRepository.save(delivery);
  }

  async findOpenDeliveries(): Promise<Delivery[]> {
    return await this.deliveryRepository.find({
      where: { status: DeliveryStatus.OPEN },
      order: { createdAt: 'DESC' },
    });
  }

  async acceptDelivery(id: number, volunteerId: number): Promise<Delivery> {
    const delivery = await this.deliveryRepository.findOne({
      where: { id },
    });

    if (!delivery) {
      throw new NotFoundException('Delivery not found');
    }

    if (delivery.status !== DeliveryStatus.OPEN) {
      throw new ConflictException('This delivery is not open for acceptance');
    }

    delivery.volunteerId = volunteerId;
    delivery.status = DeliveryStatus.ACCEPTED;

    return await this.deliveryRepository.save(delivery);
  }

  async updateStatus(
    id: number,
    updateDeliveryStatusDto: UpdateDeliveryStatusDto,
    volunteerId: number,
  ): Promise<Delivery> {
    const { status } = updateDeliveryStatusDto;

    const delivery = await this.deliveryRepository.findOne({
      where: { id },
    });

    if (!delivery) {
      throw new NotFoundException('Delivery not found');
    }

    if (!delivery.volunteerId) {
      throw new ConflictException('Delivery has not been accepted yet');
    }

    if (delivery.volunteerId !== volunteerId) {
      throw new ForbiddenException('You are not assigned to this delivery');
    }

    if (status === DeliveryStatus.OPEN || status === DeliveryStatus.ACCEPTED) {
      throw new BadRequestException('Invalid status update');
    }

    if (
      status === DeliveryStatus.PICKED_UP &&
      delivery.status !== DeliveryStatus.ACCEPTED
    ) {
      throw new ConflictException('Delivery must be accepted before picked up');
    }

    if (
      status === DeliveryStatus.DELIVERED &&
      delivery.status !== DeliveryStatus.PICKED_UP
    ) {
      throw new ConflictException('Delivery must be picked up before delivered');
    }

    delivery.status = status;

    if (status === DeliveryStatus.PICKED_UP) {
      delivery.pickedAt = new Date();
    }

    if (status === DeliveryStatus.DELIVERED) {
      delivery.deliveredAt = new Date();
    }

    return await this.deliveryRepository.save(delivery);
  }

  async remove(id: number): Promise<{ message: string }> {
    const delivery = await this.deliveryRepository.findOne({
      where: { id },
    });

    if (!delivery) {
      throw new NotFoundException('Delivery not found');
    }

    await this.deliveryRepository.remove(delivery);

    return {
      message: 'Delivery deleted successfully',
    };
  }
}