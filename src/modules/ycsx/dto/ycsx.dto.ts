import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsArray,
  IsMongoId,
  IsOptional,
  IsNumber,
  IsObject,
} from 'class-validator';
import { MatDa } from 'src/utils/mat-da.enum';
import {
  CongDoan,
  DonViDoLuong,
  DonViQuyCach,
  MauDa,
  TrangThai,
} from 'src/utils';
import { GiaCong } from 'src/utils/gia-cong.enum';
import { QuyCach } from 'src/schemas/hang-muc.schema';

export class CreateYCSXDto {
  @ApiProperty({
    description: 'Mã phiếu yêu cầu sản xuất',
    example: 'YCSX-2024-001',
  })
  @IsString()
  maPhieu: string;

  @ApiProperty({
    description: 'ID người tạo yêu cầu',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  nguoiTaoId: string;

  @ApiProperty({
    description: 'ID người duyệt yêu cầu - quan đốc',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  nguoiDuyetId: string;

  @ApiProperty({
    description: 'ID thư ký',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  thuKyId: string;

  @ApiProperty({
    description: 'Mã hợp đồng',
    example: 'HD-2024-001',
  })
  @IsString()
  maHopDong: string;

  @ApiProperty({
    description: 'Tên khách hàng',
    example: 'Công ty TNHH ABC',
  })
  @IsString()
  tenKhachHang: string;

  @ApiProperty({
    description: 'Danh sách ID hạng mục sản xuất',
    example: [
      {
        mota: 'Đá granite',
        groupId: '507f1f77bcf86cd799439011',
        ghichu: 'Đá granite',
        mauDa: MauDa.DEN,
        matDa: MatDa.BONG,
        giaCong: GiaCong.KHO_TAY,
        quyCach: {
          dai: 100,
          rong: 50,
          day: 20,
          soLuong: 1,
          dvtDoLuong: DonViDoLuong.MET,
          dvtQuyCach: DonViQuyCach.VIEN,
        },
      },
    ],
  })
  @IsArray()
  hangMuc: HangMucCreateYCSXDto[];
}

export class HangMucCreateYCSXDto {
  @ApiProperty({
    description: 'Mô tả hạng mục',
    example: 'Đá granite',
  })
  @IsString()
  mota: string;

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
    example: MatDa.BONG,
  })
  @IsEnum(MatDa)
  matDa: MatDa;

  @ApiProperty({
    description: 'Gia công',
    enum: GiaCong,
    example: GiaCong.KHO_TAY,
  })
  @IsEnum(GiaCong)
  giaCong: GiaCong;

  @ApiProperty({
    description: 'Quy cách',
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
    description: 'ID nhóm',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  @IsOptional()
  groupId: string;

  @ApiProperty({
    description: 'Ghi chú',
    example: 'Cắt đá vát 2 mặt',
  })
  @IsString()
  ghichu?: string;
}

export class FilterYCSXDto {
  @ApiProperty({
    description: 'Trạng thái',
    enum: TrangThai,
    example: TrangThai.NEW,
  })
  @IsEnum(TrangThai)
  trangThai: TrangThai;

  @ApiProperty({
    description: 'Sắp xếp',
    example: '+ngay_tao',
  })
  @IsString()
  sort?: string;

  @ApiProperty({
    description: 'Trang',
    example: 1,
  })
  @IsNumber()
  page?: number;

  @ApiProperty({
    description: 'Số lượng',
    example: 10,
  })
  @IsNumber()
  limit?: number;
}

export class UpdateDeNghiSanXuatDto {
  @ApiProperty({
    description: 'Danh sách đề nghị sản xuất',
    example: [
      {
        kcsId: '507f1f77bcf86cd799439011',
        tnsxId: '507f1f77bcf86cd799439011',
        congDoan: CongDoan.BO,
      },
    ],
  })
  @IsArray()
  items: UpdateDeNghiSanXuatItemDto[];
}

export class UpdateDeNghiSanXuatItemDto {
  @ApiProperty({
    description: 'ID người KCS',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  kcsId: string;

  @ApiProperty({
    description: 'ID người TNSX',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  tnsxId: string;

  @ApiProperty({
    description: 'Công đoạn',
    enum: CongDoan,
    example: CongDoan.BO,
  })
  @IsEnum(CongDoan)
  congDoan: CongDoan;
}

export class UpdateTrangThaiYCSXDto {
  @ApiProperty({
    description: 'Trạng thái',
    enum: TrangThai,
    example: TrangThai.PROCESSING,
  })
  @IsEnum(TrangThai)
  trangThai: TrangThai;
}

export class UpdateHangMucYCSXDto {
  @ApiProperty({
    description: 'Danh sách ID hạng mục sản xuất',
    example: {
      mota: 'Đá granite',
      groupId: '507f1f77bcf86cd799439011',
      ghichu: 'Đá granite',
      mauDa: MauDa.DEN,
      matDa: MatDa.BONG,
      giaCong: GiaCong.KHO_TAY,
      quyCach: {
        dai: 100,
        rong: 50,
        day: 20,
        soLuong: 1,
        dvtDoLuong: DonViDoLuong.MET,
        dvtQuyCach: DonViQuyCach.VIEN,
      },
    },
  })
  @IsObject()
  hangMuc: HangMucCreateYCSXDto;
}

export class CreateHangMucYCSXDto {
  @ApiProperty({
    description: 'Danh sách hạng mục',
    example: [
      {
        mota: 'Đá granite',
        groupId: '507f1f77bcf86cd799439011',
        ghichu: 'Đá granite',
        mauDa: MauDa.DEN,
        matDa: MatDa.BONG,
        giaCong: GiaCong.KHO_TAY,
        quyCach: {
          dai: 100,
          rong: 50,
          day: 20,
          soLuong: 1,
          dvtDoLuong: DonViDoLuong.MET,
          dvtQuyCach: DonViQuyCach.VIEN,
        },
      },
    ],
  })
  @IsArray()
  hangMuc: HangMucCreateYCSXDto[];
}
