import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany} from 'typeorm';
import {FoodListing } from '../../food-listing/entities/food-listing.entity.js';



@Entity('food_categories')

export class FoodCategory {
  @PrimaryGeneratedColumn()
        
  id!: number;

        @Column({
        type: 'varchar',
        length: 80,
         unique: true,
  })
  
  name!: string;

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

  @ManyToMany(() => FoodListing,(listing) => listing.categories)
  listings!: FoodListing[];
}