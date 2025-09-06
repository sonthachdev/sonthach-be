import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsOptional,
  IsDateString,
  IsMongoId,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BaoCaoState, MauDa, MatDa, Kho, CongDoan } from '../../../utils';

export class CreateBaoCaoSanLuongDto {
  @ApiProperty({
    description: 'ID yêu cầu sơ chế (nếu có)',
    required: false,
    example: '507f1f77bcf86cd799439011',
  })
  @IsOptional()
  @IsMongoId()
  ycsc_id?: string;

  @ApiProperty({
    description: 'ID yêu cầu sản xuất (nếu có)',
    required: false,
    example: '507f1f77bcf86cd799439011',
  })
  @IsOptional()
  @IsMongoId()
  ycsx_id?: string;

  @ApiProperty({
    description: 'ID hạng mục',
    required: false,
    example: '507f1f77bcf86cd799439011',
  })
  @IsOptional()
  @IsMongoId()
  hang_muc_id?: string;

  @ApiProperty({
    description: 'Mã đá',
    example: 'DA-001',
  })
  @IsString()
  ma_da: string;

  @ApiProperty({
    description: 'Mã phôi',
    required: false,
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  ma_phoi?: number;

  @ApiProperty({
    description: 'Màu đá',
    enum: MauDa,
    example: MauDa.DEN,
  })
  @IsEnum(MauDa)
  mau_da: MauDa;

  @ApiProperty({
    description: 'Mặt đá',
    enum: MatDa,
    required: false,
  })
  @IsOptional()
  @IsEnum(MatDa)
  mat_da?: MatDa;

  @ApiProperty({
    description: 'Quy cách đá',
    example: { chieu_dai: 100, chieu_rong: 50, chieu_cao: 20 },
  })
  quy_cach: any; // Using any for now, can be refined with proper QuyCach type

  @ApiProperty({
    description: 'Ngày tạo báo cáo',
    example: '2024-12-01T00:00:00.000Z',
  })
  @IsDateString()
  ngay_tao: string;

  @ApiProperty({
    description: 'ID nhân viên sản xuất',
    required: false,
    example: '507f1f77bcf86cd799439011',
  })
  @IsOptional()
  @IsMongoId()
  tnsx_id?: string;

  @ApiProperty({
    description: 'ID nhân viên KCS',
    required: false,
    example: '507f1f77bcf86cd799439011',
  })
  @IsOptional()
  @IsMongoId()
  kcs_id?: string;

  @ApiProperty({
    description: 'Kho lưu trữ',
    enum: Kho,
    required: false,
  })
  @IsOptional()
  @IsEnum(Kho)
  kho?: Kho;

  @ApiProperty({
    description: 'Vị trí trong kho',
    required: false,
    example: 'A1',
  })
  @IsOptional()
  @IsString()
  vi_tri?: string;

  @ApiProperty({
    description: 'ID báo cáo cha (nếu có)',
    required: false,
    example: '507f1f77bcf86cd799439011',
  })
  @IsOptional()
  @IsMongoId()
  parent_id?: string;

  @ApiProperty({
    description: 'Công đoạn đã hoàn thành',
    enum: CongDoan,
    required: false,
  })
  @IsOptional()
  @IsEnum(CongDoan)
  completed_cong_doan?: CongDoan;

  @ApiProperty({
    description: 'Lý do (nếu có)',
    required: false,
  })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiProperty({
    description: 'Trạng thái báo cáo',
    enum: BaoCaoState,
    example: BaoCaoState.NEW,
  })
  @IsEnum(BaoCaoState)
  trang_thai: BaoCaoState;
}

export class ApproveBaoCaoSanLuongDto {
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
  ghi_chu?: string;
}

export class RejectBaoCaoSanLuongDto {
  @ApiProperty({
    description: 'ID người từ chối',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  nguoi_tu_choi_id: string;

  @ApiProperty({
    description: 'Lý do từ chối',
    example: 'Chất lượng không đạt yêu cầu',
  })
  @IsString()
  ly_do_tu_choi: string;

  @ApiProperty({
    description: 'Ghi chú bổ sung',
    required: false,
  })
  @IsOptional()
  @IsString()
  ghi_chu?: string;
}

export class ImportBaoCaoSanLuongDto {
  @ApiProperty({
    description: 'ID báo cáo sản lượng',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  bao_cao_id: string;

  @ApiProperty({
    description: 'Kho nhập',
    enum: Kho,
    example: Kho.KHO_PHOI,
  })
  @IsEnum(Kho)
  kho: Kho;

  @ApiProperty({
    description: 'Vị trí trong kho',
    example: 'A1',
  })
  @IsString()
  vi_tri: string;

  @ApiProperty({
    description: 'ID người thực hiện nhập kho',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  nguoi_thuc_hien_id: string;

  @ApiProperty({
    description: 'Ghi chú nhập kho',
    required: false,
  })
  @IsOptional()
  @IsString()
  ghi_chu?: string;
}

export class FilterBaoCaoSanLuongDto {
  @ApiProperty({ description: 'Màu đá', enum: MauDa, required: false })
  @IsOptional()
  @IsEnum(MauDa)
  mau_da?: MauDa;

  @ApiProperty({ description: 'Chiều dài', required: false, example: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  dai?: number;

  @ApiProperty({ description: 'Chiều rộng', required: false, example: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  rong?: number;

  @ApiProperty({ description: 'Độ dày', required: false, example: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  day?: number;

  @ApiProperty({
    description: 'Vị trí trong kho',
    required: false,
    example: 'A1',
  })
  @IsOptional()
  @IsString()
  vi_tri?: string;

  @ApiProperty({
    description: 'Trạng thái báo cáo',
    enum: BaoCaoState,
    required: false,
  })
  @IsOptional()
  @IsEnum(BaoCaoState)
  trang_thai?: BaoCaoState;

  @ApiProperty({
    description: 'Kho',
    enum: Kho,
    required: false,
  })
  @IsOptional()
  @IsEnum(Kho)
  kho?: Kho;

  @ApiProperty({
    description: 'ID yêu cầu sơ chế',
    required: false,
    example: '507f1f77bcf86cd799439011',
  })
  @IsOptional()
  @IsMongoId()
  ycsc_id?: string;

  @ApiProperty({
    description: 'ID yêu cầu sản xuất',
    required: false,
    example: '507f1f77bcf86cd799439011',
  })
  @IsOptional()
  @IsMongoId()
  ycsx_id?: string;
}
