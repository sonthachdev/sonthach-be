import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsOptional,
  IsArray,
  IsDateString,
  IsMongoId,
} from 'class-validator';
import { LoaiPhieu, TrangThai, Kho, CongDoan } from '../../../utils';

export class CreatePhieuXuatKhoDto {
  @ApiProperty({
    description: 'Mã phiếu xuất kho',
    example: 'PXK-2024-001',
  })
  @IsString()
  ma_phieu: string;

  @ApiProperty({
    description: 'ID yêu cầu sơ chế',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  ycsc_id: string;

  @ApiProperty({
    description: 'ID người tạo phiếu',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  nguoi_tao_id: string;

  @ApiProperty({
    description: 'Ngày tạo phiếu',
    example: '2024-12-01T00:00:00.000Z',
  })
  @IsDateString()
  ngay_tao: string;

  @ApiProperty({
    description: 'ID người duyệt phiếu',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  nguoi_duyet_id: string;

  @ApiProperty({
    description: 'Kho xuất',
    enum: Kho,
    example: Kho.KHO_BLOCK,
  })
  @IsEnum(Kho)
  kho: Kho;

  @ApiProperty({
    description: 'Trạng thái phiếu',
    enum: TrangThai,
    example: TrangThai.NEW,
  })
  @IsEnum(TrangThai)
  trang_thai: TrangThai;

  @ApiProperty({
    description: 'Công đoạn hiện tại',
    enum: CongDoan,
    required: false,
  })
  @IsOptional()
  @IsEnum(CongDoan)
  currentCongDoan?: CongDoan;

  @ApiProperty({
    description: 'Công đoạn tiếp theo',
    enum: CongDoan,
    required: false,
  })
  @IsOptional()
  @IsEnum(CongDoan)
  next_cong_doan?: CongDoan;

  @ApiProperty({
    description: 'Danh sách ID báo cáo sản lượng',
    type: [String],
    example: ['507f1f77bcf86cd799439011'],
  })
  @IsArray()
  @IsMongoId({ each: true })
  bcsl_ids: string[];

  @ApiProperty({
    description: 'Danh sách ID hạng mục',
    type: [String],
    required: false,
    example: ['507f1f77bcf86cd799439011'],
  })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  hang_muc_ids?: string[];

  @ApiProperty({
    description: 'Ghi chú xuất kho',
    required: false,
  })
  @IsOptional()
  @IsString()
  ghi_chu?: string;
}

export class ApprovePhieuXuatKhoDto {
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

export class BatchApprovePhieuXuatKhoDto {
  @ApiProperty({
    description: 'Danh sách ID phiếu xuất kho',
    example: ['507f1f77bcf86cd799439011'],
  })
  @IsArray()
  @IsMongoId({ each: true })
  phieu_ids: string[];

  @ApiProperty({
    description: 'Vị trí đơn hàng trong kho',
    example: 'A1',
  })
  @IsString()
  vi_tri: string;
}

export class ProcessWarehouseExitDto {
  @ApiProperty({
    description: 'ID phiếu xuất kho',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  phieu_id: string;

  @ApiProperty({
    description: 'ID người thực hiện xuất kho',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  nguoi_thuc_hien_id: string;

  @ApiProperty({
    description: 'Ghi chú xuất kho',
    required: false,
  })
  @IsOptional()
  @IsString()
  ghi_chu?: string;
}
