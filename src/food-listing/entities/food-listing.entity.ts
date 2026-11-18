import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinColumn,
  JoinTable,
} from 'typeorm';

import { LocalUser } from './local-user.entity.js';

import { FoodCategory } from '../../food-category/entities/food-category.entity.js';

import { ListingStatus } from './listing-status.enum.js';


@Entity('food_listings')

export class FoodListing {
  
    @PrimaryGeneratedColumn()
    id!: number;

      @Column({
        type: 'varchar',
        length: 150,
    })
    title!: string;

    @Column({
        type: 'text',
        nullable: true,
  })
  
    description!: string | null;

    @Column({
      name: 'total_qty',
     type: 'integer',
  })
  
    totalQty!: number;

    @Column({
     name: 'available_qty',
     type: 'integer',
  })
    availableQty!: number;

    @Column({
        type: 'varchar',
        length: 30,
  })

    unit!: string;

    @Column({
        name: 'expires_at',
        type: 'timestamptz',
  })

    expiresAt!: Date;

    @Column({
        name: 'pickup_address',
        type: 'varchar',
        length: 500,
  })

  pickupAddress!: string;
  @Column({
    type: 'varchar',
    length: 20,
    default: ListingStatus.AVAILABLE,
  })

  status!: ListingStatus;
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })

  createdAt!: Date;
  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
  })
  updatedAt!: Date;

  // One donor can create many listings
@ManyToOne(
  () => LocalUser,
  {
    nullable: false,
    onDelete: 'RESTRICT',
  },
)
@JoinColumn({
  name: 'donor_id',
  referencedColumnName: 'id',
})
donor!: LocalUser;



  // One donor can create many food listings
//   @ManyToOne(
//     () => Users,
//     {
//       nullable: false,
//       onDelete: 'RESTRICT',
//     },
//   )
//   @JoinColumn({
//     name: 'donor_id',
//     referencedColumnName: 'id',
//   })
//   donor!: Users;

  // Many-to-Many relationship
  @ManyToMany(
        () => FoodCategory,(category) => category.listings,
  )

  @JoinTable({
    name: 'food_listing_categories',
    
    joinColumn: {
      name: 'listing_id',
      referencedColumnName: 'id',
    },

    inverseJoinColumn: {
      name: 'category_id',
      referencedColumnName: 'id',
    },
  })
  
  categories!: FoodCategory[];
}