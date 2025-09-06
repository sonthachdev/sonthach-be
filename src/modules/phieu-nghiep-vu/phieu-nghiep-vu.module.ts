import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PhieuNghiepVuController } from './phieu-nghiep-vu.controller';
import { PhieuNghiepVuService } from './phieu-nghiep-vu.service';
import { PhieuNghiepVu, PhieuNghiepVuSchema } from '../../schemas';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PhieuNghiepVu.name, schema: PhieuNghiepVuSchema },
    ]),
  ],
  controllers: [PhieuNghiepVuController],
  providers: [PhieuNghiepVuService],
  exports: [PhieuNghiepVuService],
})
export class PhieuNghiepVuModule {}
