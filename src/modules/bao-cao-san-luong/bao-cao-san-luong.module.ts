import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BaoCaoSanLuongController } from './bao-cao-san-luong.controller';
import { BaoCaoSanLuongService } from './bao-cao-san-luong.service';
import { BaoCaoSanLuong, BaoCaoSanLuongSchema } from '../../schemas';

@Module({
  imports: [
    MongooseModule.forFeature([
      // ModelName chuẩn theo class
      { name: BaoCaoSanLuong.name, schema: BaoCaoSanLuongSchema },
      // Alias theo tên đang dùng trong ref ('bao_cao_san_luong') để tránh lỗi populate
      { name: 'bao_cao_san_luong', schema: BaoCaoSanLuongSchema },
    ]),
  ],
  controllers: [BaoCaoSanLuongController],
  providers: [BaoCaoSanLuongService],
  exports: [BaoCaoSanLuongService],
})
export class BaoCaoSanLuongModule {}
