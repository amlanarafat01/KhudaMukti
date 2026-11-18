import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Claim } from './entities/claim.entity.js';
import { FoodListing } from '../food-listing/entities/food-listing.entity.js';
import { LocalUser } from '../food-listing/entities/local-user.entity.js';
import { CreateClaimDto } from './dto/create-claim.dto.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';
@Injectable()
export class ClaimsService {
  constructor(private readonly dataSource:DataSource,@InjectRepository(Claim) private readonly claims:Repository<Claim>,@InjectRepository(LocalUser) private readonly users:Repository<LocalUser>){}
  async create(dto:CreateClaimDto,receiverId:string){
    const user=await this.users.findOne({where:{id:receiverId}});
    if(!user||user.role.toUpperCase()!=='RECEIVER') throw new ForbiddenException('Only receivers can claim food');
    if(!user.isVerified) throw new ForbiddenException('Receiver account must be verified');
    return this.dataSource.transaction(async manager=>{
      const listingRepo=manager.getRepository(FoodListing), claimRepo=manager.getRepository(Claim);
      const listing=await listingRepo.findOne({where:{id:dto.listingId},lock:{mode:'pessimistic_write'}});
      if(!listing) throw new NotFoundException('Food listing not found');
      if(listing.status!=='AVAILABLE'||listing.expiresAt<=new Date()) throw new BadRequestException('Food listing is not available');
      if(dto.quantity>listing.availableQty) throw new BadRequestException('Requested quantity exceeds available stock');
      listing.availableQty-=dto.quantity;
      if(listing.availableQty===0) listing.status='CLAIMED' as typeof listing.status;
      await listingRepo.save(listing);
      const claim=claimRepo.create({listingId:listing.id,receiverId,quantity:dto.quantity,status:'CONFIRMED'});
      return claimRepo.save(claim);
    });
  }
  async findAll(userId:string,role:string,query:PaginationQueryDto){
    const where=role.toUpperCase()==='ADMIN'?{}:{receiverId:userId};
    const [items,total]=await this.claims.findAndCount({where,order:{createdAt:'DESC'},skip:(query.page-1)*query.limit,take:query.limit});
    return {items,meta:{page:query.page,limit:query.limit,total,pages:Math.ceil(total/query.limit)}};
  }
  async findOne(id:number,userId:string,role:string){
    const claim=await this.claims.findOne({where:{id}});
    if(!claim) throw new NotFoundException('Claim not found');
    if(role.toUpperCase()!=='ADMIN'&&claim.receiverId!==userId) throw new ForbiddenException('You can view only your own claims');
    return claim;
  }
}
