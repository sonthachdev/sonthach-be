import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HangMucController } from './hang-muc.controller';
import { HangMucService } from './hang-muc.service';
import { HangMuc, HangMucSchema } from '../../schemas';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: HangMuc.name, schema: HangMucSchema }]),
    MongooseModule.forFeature([{ name: 'hang_muc', schema: HangMucSchema }]),
  ],
  controllers: [HangMucController],
  providers: [HangMucService],
  exports: [HangMucService],
})
export class HangMucModule {}
