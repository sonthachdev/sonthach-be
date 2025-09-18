import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsOptional,
  IsDateString,
  IsMongoId,
  IsNumber,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  BaoCaoState,
  MauDa,
  MatDa,
  Kho,
  CongDoan,
  DonViDoLuong,
  DonViQuyCach,
} from '../../../utils';
import { QuyCach } from 'src/schemas/hang-muc.schema';

export class CreateBaoCaoSanLuongDto {
  @ApiProperty({
    description: 'ID yêu cầu sơ chế (nếu có)',
    required: false,
    example: '507f1f77bcf86cd799439011',
  })
  @IsOptional()
  @IsMongoId()
  ycscId?: string;

  @ApiProperty({
    description: 'ID yêu cầu sản xuất (nếu có)',
    required: false,
    example: '507f1f77bcf86cd799439011',
  })
  @IsOptional()
  @IsMongoId()
  ycsxId?: string;

  @ApiProperty({
    description: 'ID hạng mục',
    required: false,
    example: '507f1f77bcf86cd799439011',
  })
  @IsOptional()
  @IsMongoId()
  hangMucId?: string;

  @ApiProperty({
    description: 'Mã đá',
    example: 'DA-001',
  })
  @IsString()
  maDa: string;

  @ApiProperty({
    description: 'Mã phôi',
    required: false,
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  maPhoi?: number;

  @ApiProperty({
    description: 'Màu đá',
    enum: MauDa,
    example: MauDa.DEN,
  })
  @IsEnum(MauDa)
  mauDa: MauDa;

  @ApiProperty({
    description: 'Mặt đá',
    enum: MatDa,
    required: false,
  })
  @IsOptional()
  @IsEnum(MatDa)
  matDa?: MatDa;

  @ApiProperty({
    description: 'Quy cách đá',
    example: {
      dai: 100,
      rong: 50,
      day: 20,
      soLuong: 1,
      dvtDoLuong: DonViDoLuong.MET,
      dvtQuyCach: DonViQuyCach.VIEN,
    },
  })
  quyCach: QuyCach;

  @ApiProperty({
    description: 'Ngày tạo báo cáo',
    example: '2024-12-01T00:00:00.000Z',
  })
  @IsDateString()
  ngayTao: string;

  @ApiProperty({
    description: 'ID nhân viên sản xuất',
    required: false,
    example: '507f1f77bcf86cd799439011',
  })
  @IsOptional()
  @IsMongoId()
  tnsxId?: string;

  @ApiProperty({
    description: 'ID nhân viên KCS',
    required: false,
    example: '507f1f77bcf86cd799439011',
  })
  @IsOptional()
  @IsMongoId()
  kcsId?: string;

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
  viTri?: string;

  @ApiProperty({
    description: 'ID báo cáo cha (nếu có)',
    required: false,
    example: '507f1f77bcf86cd799439011',
  })
  @IsOptional()
  @IsMongoId()
  parentId?: string;

  @ApiProperty({
    description: 'Công đoạn đã hoàn thành',
    enum: CongDoan,
    required: false,
  })
  @IsOptional()
  @IsEnum(CongDoan)
  completedCongDoan?: CongDoan;

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
  trangThai: BaoCaoState;
}

export class ApproveBaoCaoSanLuongDto {
  @ApiProperty({
    description: 'ID người duyệt',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  nguoiDuyetId: string;

  @ApiProperty({
    description: 'Trạng thái sau khi duyệt',
    enum: BaoCaoState,
    example: BaoCaoState.APPROVED,
  })
  @IsEnum(BaoCaoState)
  trangThai: BaoCaoState;

  @ApiProperty({
    description: 'Ghi chú duyệt',
    required: false,
  })
  @IsOptional()
  @IsString()
  ghiChu?: string;
}

export class RejectBaoCaoSanLuongDto {
  @ApiProperty({
    description: 'ID người từ chối',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  nguoiTuChoiId: string;

  @ApiProperty({
    description: 'Lý do từ chối',
    example: 'Chất lượng không đạt yêu cầu',
  })
  @IsString()
  lyDoTuChoi: string;

  @ApiProperty({
    description: 'Ghi chú bổ sung',
    required: false,
  })
  @IsOptional()
  @IsString()
  ghiChu?: string;
}

export class ImportBaoCaoSanLuongDto {
  @ApiProperty({
    description: 'ID báo cáo sản lượng',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  baoCaoId: string;

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
  viTri: string;

  @ApiProperty({
    description: 'ID người thực hiện nhập kho',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  nguoiThucHienId: string;

  @ApiProperty({
    description: 'Ghi chú nhập kho',
    required: false,
  })
  @IsOptional()
  @IsString()
  ghiChu?: string;
}

export class FilterBaoCaoSanLuongDto {
  @ApiProperty({ description: 'Màu đá', enum: MauDa, required: false })
  @IsOptional()
  @IsEnum(MauDa)
  mauDa?: MauDa;

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
  viTri?: string;

  @ApiProperty({
    description: 'Trạng thái báo cáo',
    enum: BaoCaoState,
    required: false,
  })
  @IsOptional()
  @IsEnum(BaoCaoState)
  trangThai?: BaoCaoState;

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
  ycscId?: string;

  @ApiProperty({
    description: 'ID yêu cầu sản xuất',
    required: false,
    example: '507f1f77bcf86cd799439011',
  })
  @IsOptional()
  @IsMongoId()
  ycsxId?: string;
}

export class UpdatePalletBaoCaoSanLuongDto {
  @ApiProperty({
    description: 'Mã pallet',
    example: 1,
  })
  @IsNumber()
  pallet: number;

  @ApiProperty({
    description: 'Danh sách ID báo cáo sản lượng',
    example: ['507f1f77bcf86cd799439011'],
  })
  @IsArray()
  @IsMongoId({ each: true })
  bcslIds: string[];
}

export class XuatHoaDonBaoCaoSanLuongDto {
  @ApiProperty({
    description: 'Danh sách ID báo cáo sản lượng',
    example: ['507f1f77bcf86cd799439011'],
  })
  @IsArray()
  @IsMongoId({ each: true })
  bcslIds: string[];

  @ApiProperty({
    description: 'Kho',
    enum: Kho,
    example: Kho.KHO_BLOCK,
  })
  @IsEnum(Kho)
  kho: Kho;

  @ApiProperty({
    description: 'Mã phiếu',
    example: 'PXK-2024-001',
  })
  @IsString()
  maPhieu: string;

  @ApiProperty({
    description: 'ID người tạo phiếu',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  nguoiTaoId: string;

  @ApiProperty({
    description: 'ID người duyệt phiếu',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  nguoiDuyetId: string;
}
