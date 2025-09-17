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
  maPhieu: string;

  @ApiProperty({
    description: 'ID yêu cầu sơ chế',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  ycscId: string;

  @ApiProperty({
    description: 'ID người tạo phiếu',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  nguoiTaoId: string;

  @ApiProperty({
    description: 'Ngày tạo phiếu',
    example: '2024-12-01T00:00:00.000Z',
  })
  @IsDateString()
  ngayTao: string;

  @ApiProperty({
    description: 'ID người duyệt phiếu',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  nguoiDuyetId: string;

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
  trangThai: TrangThai;

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
  nextCongDoan?: CongDoan;

  @ApiProperty({
    description: 'Danh sách ID báo cáo sản lượng',
    type: [String],
    example: ['507f1f77bcf86cd799439011'],
  })
  @IsArray()
  @IsMongoId({ each: true })
  bcslIds: string[];

  @ApiProperty({
    description: 'Danh sách ID hạng mục',
    type: [String],
    required: false,
    example: ['507f1f77bcf86cd799439011'],
  })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  hangMucIds?: string[];

  @ApiProperty({
    description: 'Ghi chú xuất kho',
    required: false,
  })
  @IsOptional()
  @IsString()
  ghiChu?: string;
}

export class ApprovePhieuXuatKhoDto {
  @ApiProperty({
    description: 'ID người duyệt',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  nguoiDuyetId: string;

  @ApiProperty({
    description: 'Trạng thái sau khi duyệt',
    enum: TrangThai,
    example: TrangThai.APPROVED,
  })
  @IsEnum(TrangThai)
  trangThai: TrangThai;

  @ApiProperty({
    description: 'Ghi chú duyệt',
    required: false,
  })
  @IsOptional()
  @IsString()
  ghiChu?: string;
}

export class BatchApprovePhieuXuatKhoDto {
  @ApiProperty({
    description: 'Danh sách ID phiếu xuất kho',
    example: ['507f1f77bcf86cd799439011'],
  })
  @IsArray()
  @IsMongoId({ each: true })
  phieuIds: string[];

  @ApiProperty({
    description: 'Vị trí đơn hàng trong kho',
    example: 'A1',
  })
  @IsString()
  viTri: string;
}

export class BatchRejectPhieuXuatKhoDto {
  @ApiProperty({
    description: 'Danh sách ID phiếu xuất kho',
    example: ['507f1f77bcf86cd799439011'],
  })
  @IsArray()
  @IsMongoId({ each: true })
  phieuIds: string[];
}

export class ProcessWarehouseExitDto {
  @ApiProperty({
    description: 'ID phiếu xuất kho',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  phieuId: string;

  @ApiProperty({
    description: 'ID người thực hiện xuất kho',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  nguoiThucHienId: string;

  @ApiProperty({
    description: 'Ghi chú xuất kho',
    required: false,
  })
  @IsOptional()
  @IsString()
  ghiChu?: string;
}
