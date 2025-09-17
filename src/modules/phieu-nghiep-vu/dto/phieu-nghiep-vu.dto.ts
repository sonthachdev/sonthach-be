import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsOptional,
  IsArray,
  IsDateString,
  IsMongoId,
  IsNumber,
} from 'class-validator';
import {
  LoaiPhieu,
  TrangThai,
  Kho,
  CongDoan,
  MauDa,
  DonViDoLuong,
  DonViQuyCach,
} from '../../../utils';

export class CreatePhieuNghiepVuDto {
  @ApiProperty({
    description: 'Mã phiếu nghiệp vụ',
    example: 'PNV-2024-001',
  })
  @IsString()
  maPhieu: string;

  @ApiProperty({
    description: 'Loại phiếu',
    enum: LoaiPhieu,
    example: LoaiPhieu.NhapKho,
  })
  @IsEnum(LoaiPhieu)
  loaiPhieu: LoaiPhieu;

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
    description: 'ID người tạo phiếu',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  nguoiTao: string;

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
    description: 'Kho nhập/xuất',
    enum: Kho,
    required: false,
    example: Kho.KHO_BLOCK,
  })
  @IsOptional()
  @IsEnum(Kho)
  kho?: Kho;

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
}

export class UpdatePhieuNghiepVuDto {
  @ApiProperty({
    description: 'Trạng thái mới',
    enum: TrangThai,
    required: false,
  })
  @IsOptional()
  @IsEnum(TrangThai)
  trangThai?: TrangThai;

  @ApiProperty({
    description: 'Ngày duyệt',
    required: false,
    example: '2024-12-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  ngayDuyet?: string;

  @ApiProperty({
    description: 'Kho nhập/xuất',
    enum: Kho,
    required: false,
  })
  @IsOptional()
  @IsEnum(Kho)
  kho?: Kho;

  @ApiProperty({
    description: 'Công đoạn hiện tại',
    enum: CongDoan,
    required: false,
  })
  @IsOptional()
  @IsEnum(CongDoan)
  currentCongDoan: CongDoan;

  @ApiProperty({
    description: 'Công đoạn tiếp theo',
    enum: CongDoan,
    required: false,
  })
  @IsOptional()
  @IsEnum(CongDoan)
  nextCongDoan?: CongDoan;
}

export class ApprovePhieuNghiepVuDto {
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
    description: 'Kho nhập/xuất',
    enum: Kho,
    required: false,
  })
  @IsOptional()
  @IsEnum(Kho)
  kho?: Kho;

  @ApiProperty({
    description: 'Ghi chú duyệt',
    required: false,
  })
  @IsOptional()
  @IsString()
  ghiChu?: string;
}

export class WarehouseEntryDto {
  @ApiProperty({
    description: 'ID phiếu nghiệp vụ',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  phieuId: string;

  @ApiProperty({
    description: 'Kho nhập',
    enum: Kho,
    example: Kho.KHO_BLOCK,
  })
  @IsEnum(Kho)
  kho: Kho;

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

export class CreateBlockWarehouseEntryDto {
  @ApiProperty({
    description: 'Mã phiếu nghiệp vụ',
    example: 'PNV-2024-001',
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

  @ApiProperty({
    description: 'Mã đá',
    example: 'DA-001',
  })
  @IsString()
  maDa: string;

  @ApiProperty({
    description: 'Màu đá',
    enum: MauDa,
    example: MauDa.DEN,
  })
  @IsEnum(MauDa)
  mauDa: MauDa;

  @ApiProperty({
    description: 'Chiều dài (mm)',
    example: 100,
  })
  @IsNumber()
  dai: number;

  @ApiProperty({
    description: 'Chiều rộng (mm)',
    example: 50,
  })
  @IsNumber()
  rong: number;

  @ApiProperty({
    description: 'Chiều cao (mm)',
    example: 20,
  })
  @IsNumber()
  day: number;

  @ApiProperty({
    description: 'Số lượng',
    example: 1,
  })
  @IsNumber()
  soLuong: number;

  @ApiProperty({
    description: 'Đơn vị đo lường',
    enum: DonViDoLuong,
    example: DonViDoLuong.MET,
  })
  @IsEnum(DonViDoLuong)
  dvtDoLuong: DonViDoLuong;

  @ApiProperty({
    description: 'Đơn vị quy cách',
    enum: DonViQuyCach,
    example: DonViQuyCach.KHOI,
  })
  @IsEnum(DonViQuyCach)
  dvtQuyCach: DonViQuyCach;

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
    description: 'ID hạng mục (nếu có)',
    required: false,
    example: '507f1f77bcf86cd799439011',
  })
  @IsOptional()
  @IsMongoId()
  hangMucId?: string;
}

export class BlockWarehouseBatchImportDto {
  @ApiProperty({
    description: 'Danh sách ID phiếu nghiệp vụ nhập kho block',
    type: [String],
    example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
  })
  @IsArray()
  @IsMongoId({ each: true })
  phieuIds: string[];

  @ApiProperty({
    description: 'Vị trí đơn hàng trong kho (ví dụ: A1, B5, ...)',
    example: 'A1',
  })
  @IsString()
  viTri: string;
}

export class ListPhieuNghiepVuQueryDto {
  @ApiProperty({ description: 'Kho', enum: Kho, required: false })
  @IsOptional()
  @IsEnum(Kho)
  kho?: Kho;

  @ApiProperty({
    description: 'Trạng thái phiếu',
    enum: TrangThai,
    required: false,
  })
  @IsOptional()
  @IsEnum(TrangThai)
  trangThai?: TrangThai;

  @ApiProperty({
    description: 'Công đoạn hiện tại',
    enum: CongDoan,
    required: false,
  })
  @IsOptional()
  @IsEnum(CongDoan)
  currentCongDoan?: CongDoan;

  @ApiProperty({ description: 'Loại phiếu', enum: LoaiPhieu, required: false })
  @IsOptional()
  @IsEnum(LoaiPhieu)
  loaiPhieu?: LoaiPhieu;

  @ApiProperty({
    description: 'Sắp xếp (hỗ trợ nhiều trường: field1:order1,field2:order2)',
    required: false,
    example: 'ngayTao:-1,trangThai:1',
  })
  @IsOptional()
  @IsString()
  sort?: string;
}
