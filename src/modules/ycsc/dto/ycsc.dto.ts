import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsOptional,
  IsArray,
  IsMongoId,
  IsNumber,
  IsObject,
} from 'class-validator';
import {
  BaoCaoState,
  DonViDoLuong,
  DonViQuyCach,
  Kho,
  MauDa,
  TrangThai,
} from '../../../utils';
import { QuyCach } from 'src/schemas/hang-muc.schema';

export class CreateYCSCDto {
  @ApiProperty({
    description: 'Mã phiếu yêu cầu sơ chế',
    example: 'YCSC-2024-001',
  })
  @IsString()
  ma_phieu: string;

  @ApiProperty({
    description: 'ID người tạo yêu cầu',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  nguoi_tao_id: string;

  @ApiProperty({
    description: 'ID người duyệt yêu cầu',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  nguoi_duyet_id: string;

  @ApiProperty({
    description: 'ID người KCS',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  kcs_id: string;

  @ApiProperty({
    description: 'ID người TNSX',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  tnsx_id: string;

  @ApiProperty({
    description: 'Danh sách ID block đá',
    type: [String],
    required: false,
    example: ['507f1f77bcf86cd799439011'],
  })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  block_ids?: string[];
}

export class ApproveYCSCDto {
  @ApiProperty({
    description: 'ID người duyệt',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  nguoi_duyet_id: string;

  @ApiProperty({
    description: 'Trạng thái sau khi duyệt',
    enum: TrangThai,
    example: TrangThai.APPROVED,
  })
  @IsEnum(TrangThai)
  trang_thai: TrangThai;

  @ApiProperty({
    description: 'Ghi chú duyệt',
    required: false,
  })
  @IsOptional()
  @IsString()
  ghi_chu?: string;
}

export class CompleteYCSCDto {
  @ApiProperty({
    description: 'ID người hoàn thành',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  nguoi_hoan_thanh_id: string;

  @ApiProperty({
    description: 'Ghi chú hoàn thành',
    required: false,
  })
  @IsOptional()
  @IsString()
  ghi_chu?: string;
}

export class BatchApproveYCSCDto {
  @ApiProperty({
    description: 'Danh sách ID yêu cầu sơ chế',
    example: ['507f1f77bcf86cd799439011'],
  })
  @IsArray()
  @IsMongoId({ each: true })
  ycsc_ids: string[];
}

export class FilterYCSCDto {
  @ApiProperty({
    description: 'Trạng thái yêu cầu',
    enum: TrangThai,
    required: false,
  })
  @IsOptional()
  @IsEnum(TrangThai)
  trang_thai?: string;
}

export class AddBaoCaoSanLuongDto {
  @ApiProperty({
    description: 'Danh sách ID báo cáo sản lượng',
    example: ['507f1f77bcf86cd799439011'],
  })
  @IsArray()
  @IsMongoId({ each: true })
  bao_cao_san_luong_ids: string[];
}

export class BaoCaoSanLuongDto {
  @ApiProperty({
    description: 'Mã đá',
    example: 'DA-001',
  })
  @IsString()
  ma_da: string;

  @ApiProperty({
    description: 'Mã phôi',
    example: 1,
  })
  @IsNumber()
  ma_phoi: number;

  @ApiProperty({
    description: 'Màu đá',
    enum: MauDa,
    example: MauDa.DEN,
  })
  @IsEnum(MauDa)
  mau_da: MauDa;

  @ApiProperty({
    description: 'Vị trí',
    example: 'A1',
  })
  @IsString()
  vi_tri: string;

  @ApiProperty({
    description: 'ID báo cáo sản lượng cha',
    example: '507f1f77bcf86cd799439011',
  })
  @IsOptional()
  @IsMongoId()
  parent_id?: string;

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

  @ApiProperty({
    description: 'Kho',
    enum: Kho,
    example: Kho.KHO_BLOCK,
  })
  @IsOptional()
  @IsEnum(Kho)
  kho?: Kho;
}

export class ApproveBaoCaoSanLuongByYCSCDto {
  @ApiProperty({
    description: 'ID báo cáo sản lượng',
    example: ['507f1f77bcf86cd799439011'],
  })
  @IsArray()
  @IsMongoId({ each: true })
  bao_cao_san_luong_ids: string[];

  @ApiProperty({
    description: 'ID người duyệt',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  nguoi_duyet_id: string;

  @ApiProperty({
    description: 'Trạng thái sau khi duyệt',
    enum: BaoCaoState,
    example: BaoCaoState.APPROVED,
  })
  @IsEnum(BaoCaoState)
  trang_thai: BaoCaoState;

  @ApiProperty({
    description: 'Ghi chú duyệt',
    required: false,
  })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class NhapKhoBaoCaoSanLuongDto {
  @ApiProperty({
    description: 'Mã phiếu nhập kho',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  ma_phieu: string;

  @ApiProperty({
    description: 'ID người nhập kho',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  nguoi_tao_id: string;

  @ApiProperty({
    description: 'ID thủ kho',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  thu_kho_id: string;

  @ApiProperty({
    description: 'Danh sách ID báo cáo sản lượng',
    example: ['507f1f77bcf86cd799439011'],
  })
  @IsArray()
  @IsMongoId({ each: true })
  bao_cao_san_luong_ids: string[];
}
