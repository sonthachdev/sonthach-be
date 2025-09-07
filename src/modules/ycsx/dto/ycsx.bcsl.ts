import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsArray,
  IsMongoId,
  IsOptional,
  IsNumber,
  IsObject,
  IsBoolean,
} from 'class-validator';
import { MatDa } from 'src/utils/mat-da.enum';
import {
  CongDoan,
  DonViDoLuong,
  DonViQuyCach,
  Kho,
  MauDa,
  TrangThai,
} from 'src/utils';
import { GiaCong } from 'src/utils/gia-cong.enum';
import { QuyCach } from 'src/schemas/hang-muc.schema';
import { BaoCaoState } from 'src/utils/bao-cao-state.enum';
import { LoaiPhieu } from 'src/utils/loai-phieu.enum';

export class BaoCaoSanLuongByYCSXDto {
  @ApiProperty({
    description: 'Mã đá',
    example: 'DA-001',
  })
  @IsString()
  ma_da: string;

  @ApiProperty({
    description: 'Màu đá',
    example: MauDa.DEN,
  })
  @IsEnum(MauDa)
  mau_da: MauDa;

  @ApiProperty({
    description: 'Mặt đá',
    enum: MatDa,
    example: MatDa.BONG,
  })
  @IsEnum(MatDa)
  mat_da?: MatDa;

  @ApiProperty({
    description: 'Mã phôi',
    example: 1,
  })
  @IsNumber()
  ma_phoi?: number;

  @ApiProperty({
    description: 'ID báo cáo sản lượng cha',
    example: '507f1f77bcf86cd799439011',
  })
  @IsOptional()
  @IsMongoId()
  parent_id: string;

  @ApiProperty({
    description: 'Quy cách',
    example: {
      dai: 100,
      rong: 50,
      day: 20,
      so_luong: 1,
      dvt_do_luong: DonViDoLuong.MET,
      dvt_quy_cach: DonViQuyCach.VIEN,
    },
  })
  @IsObject()
  quy_cach: QuyCach;
}

export class UpdateBaoCaoSanLuongByYCSXDto {
  @ApiProperty({
    description: 'Danh sách ID báo cáo sản lượng',
    example: ['507f1f77bcf86cd799439011'],
  })
  @IsArray()
  @IsMongoId({ each: true })
  bcsl_ids: string[];

  @ApiProperty({
    description: 'Lý do',
    example: 'Lý do',
  })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiProperty({
    description: 'Báo cáo sản lượng',
    example: BaoCaoState.APPROVED,
  })
  @IsEnum(BaoCaoState)
  trang_thai: BaoCaoState;
}

export class XuatKhoBaoCaoSanLuongByYCSXDto {
  @ApiProperty({
    description: 'Danh sách ID báo cáo sản lượng',
    example: ['507f1f77bcf86cd799439011'],
  })
  @IsArray()
  @IsMongoId({ each: true })
  bcsl_ids: string[];

  @ApiProperty({
    description: 'Độ dày của báo cáo sản lượng',
    example: 10,
  })
  @IsNumber()
  do_day_cua: number;

  @ApiProperty({
    description: 'Kho',
    enum: Kho,
    example: Kho.KHO_BLOCK,
  })
  @IsEnum(Kho)
  kho_nhan?: Kho;

  @ApiProperty({
    description: 'Mã phiếu',
    example: 'PXK-2024-001',
  })
  @IsString()
  ma_phieu: string;

  @ApiProperty({
    description: 'Thủ kho',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  thu_kho_id?: string;

  @ApiProperty({
    description: 'KCS nhận',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  kcs_nhan_id?: string;

  @ApiProperty({
    description: 'Loại phiếu',
    enum: LoaiPhieu,
    example: LoaiPhieu.XuatKho,
  })
  @IsEnum(LoaiPhieu)
  loai_phieu: LoaiPhieu;

  @ApiProperty({
    description: 'Công đoạn tiếp theo',
    enum: CongDoan,
    example: CongDoan.BO,
  })
  @IsEnum(CongDoan)
  next_cong_doan?: CongDoan;

  @ApiProperty({
    description: 'Theo đơn hàng',
    example: true,
  })
  @IsBoolean()
  theoDonHang?: boolean;

  @ApiProperty({
    description: 'Gia công',
    enum: GiaCong,
    example: GiaCong.KHO_TAY,
  })
  @IsEnum(GiaCong)
  giaCong?: GiaCong;
}

export class ApproveChuyenTiepBaoCaoSanLuongByYCSXDto {
  @ApiProperty({
    description: 'Danh sách ID phiếu nghiệp vụ',
    example: ['507f1f77bcf86cd799439011'],
  })
  @IsArray()
  @IsMongoId({ each: true })
  pnv_ids: string[];
}
