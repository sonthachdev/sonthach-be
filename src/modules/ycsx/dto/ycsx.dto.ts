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
  ma_phieu: string;

  @ApiProperty({
    description: 'ID người tạo yêu cầu',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  nguoi_tao_id: string;

  @ApiProperty({
    description: 'ID người duyệt yêu cầu - quan đốc',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  nguoi_duyet_id: string;

  @ApiProperty({
    description: 'ID thư ký',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  thu_ky_id: string;

  @ApiProperty({
    description: 'Mã hợp đồng',
    example: 'HD-2024-001',
  })
  @IsString()
  ma_hop_dong: string;

  @ApiProperty({
    description: 'Tên khách hàng',
    example: 'Công ty TNHH ABC',
  })
  @IsString()
  ten_khach_hang: string;

  @ApiProperty({
    description: 'Danh sách ID hạng mục sản xuất',
    example: [
      {
        mota: 'Đá granite',
        group_id: '507f1f77bcf86cd799439011',
        ghichu: 'Đá granite',
        mau_da: MauDa.DEN,
        mat_da: MatDa.BONG,
        gia_cong: GiaCong.KHO_TAY,
        quy_cach: {
          dai: 100,
          rong: 50,
          day: 20,
          so_luong: 1,
          dvt_do_luong: DonViDoLuong.MET,
          dvt_quy_cach: DonViQuyCach.VIEN,
        },
      },
    ],
  })
  @IsArray()
  hang_muc: HangMucCreateYCSXDto[];
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
  mau_da: MauDa;

  @ApiProperty({
    description: 'Mặt đá',
    enum: MatDa,
    example: MatDa.BONG,
  })
  @IsEnum(MatDa)
  mat_da: MatDa;

  @ApiProperty({
    description: 'Gia công',
    enum: GiaCong,
    example: GiaCong.KHO_TAY,
  })
  @IsEnum(GiaCong)
  gia_cong: GiaCong;

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
  quy_cach: QuyCach;

  @ApiProperty({
    description: 'ID nhóm',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  @IsOptional()
  group_id: string;

  @ApiProperty({
    description: 'Ghi chú',
    example: 'Cắt đá vát 2 mặt',
  })
  @IsString()
  ghichu: string;
}

export class FilterYCSXDto {
  @ApiProperty({
    description: 'Trạng thái',
    enum: TrangThai,
    example: TrangThai.NEW,
  })
  @IsEnum(TrangThai)
  trang_thai: TrangThai;

  @ApiProperty({
    description: 'Sắp xếp',
    example: '+ngay_tao',
  })
  @IsString()
  sort: string;

  @ApiProperty({
    description: 'Trang',
    example: 1,
  })
  @IsNumber()
  page: number;

  @ApiProperty({
    description: 'Số lượng',
    example: 10,
  })
  @IsNumber()
  limit: number;
}

export class UpdateDeNghiSanXuatDto {
  @ApiProperty({
    description: 'Danh sách đề nghị sản xuất',
    example: [
      {
        kcs_id: '507f1f77bcf86cd799439011',
        tnsx_id: '507f1f77bcf86cd799439011',
        cong_doan: CongDoan.BO,
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
  kcs_id: string;

  @ApiProperty({
    description: 'ID người TNSX',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  tnsx_id: string;

  @ApiProperty({
    description: 'Công đoạn',
    enum: CongDoan,
    example: CongDoan.BO,
  })
  @IsEnum(CongDoan)
  cong_doan: CongDoan;
}

export class UpdateTrangThaiYCSXDto {
  @ApiProperty({
    description: 'Trạng thái',
    enum: TrangThai,
    example: TrangThai.PROCESSING,
  })
  @IsEnum(TrangThai)
  trang_thai: TrangThai;
}

export class UpdateHangMucYCSXDto {
  @ApiProperty({
    description: 'Danh sách ID hạng mục sản xuất',
    example: {
      mota: 'Đá granite',
      group_id: '507f1f77bcf86cd799439011',
      ghichu: 'Đá granite',
      mau_da: MauDa.DEN,
      mat_da: MatDa.BONG,
      gia_cong: GiaCong.KHO_TAY,
      quy_cach: {
        dai: 100,
        rong: 50,
        day: 20,
        so_luong: 1,
        dvt_do_luong: DonViDoLuong.MET,
        dvt_quy_cach: DonViQuyCach.VIEN,
      },
    },
  })
  @IsObject()
  hang_muc: HangMucCreateYCSXDto;
}

export class CreateHangMucYCSXDto {
  @ApiProperty({
    description: 'Danh sách hạng mục',
    example: [
      {
        mota: 'Đá granite',
        group_id: '507f1f77bcf86cd799439011',
        ghichu: 'Đá granite',
        mau_da: MauDa.DEN,
        mat_da: MatDa.BONG,
        gia_cong: GiaCong.KHO_TAY,
        quy_cach: {
          dai: 100,
          rong: 50,
          day: 20,
          so_luong: 1,
          dvt_do_luong: DonViDoLuong.MET,
          dvt_quy_cach: DonViQuyCach.VIEN,
        },
      },
    ],
  })
  @IsArray()
  hang_muc: HangMucCreateYCSXDto[];
}
