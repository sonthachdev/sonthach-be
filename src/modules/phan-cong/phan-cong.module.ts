import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PhanCongController } from './phan-cong.controller';
import { PhanCongService } from './phan-cong.service';
import { PhanCong, PhanCongSchema } from '../../schemas';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PhanCong.name, schema: PhanCongSchema },
    ]),
  ],
  controllers: [PhanCongController],
  providers: [PhanCongService],
  exports: [PhanCongService],
})
export class PhanCongModule {}
