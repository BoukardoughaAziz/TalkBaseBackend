import { Module } from '@nestjs/common';
import { BaseScoutService } from './base-scout.service';
import { BaseScoutController } from './base-scout.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from 'src/models/ProductSchema';

@Module({
  controllers: [BaseScoutController],
  providers: [BaseScoutService],
    imports:[    
      MongooseModule.forFeature([
          { name: Product.name, schema: ProductSchema },
        ]),]
})
export class BaseScoutModule {}
