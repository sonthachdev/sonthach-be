import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsNumber,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  BaseCreateDto,
  BaseUpdateDto,
  BaseFilterDto,
} from '../../../common/base';

export class CreateHangMucDto extends BaseCreateDto {
  @ApiProperty({ description: 'Tên hàng mục', example: 'Đá granite' })
  @IsString()
  ten: string;

  @ApiProperty({ description: 'Loại hàng mục', example: 'Vật liệu' })
  @IsString()
  loai: string;

  @ApiPropertyOptional({
    description: 'Mô tả hàng mục',
    example: 'Đá granite chất lượng cao',
  })
  @IsOptional()
  @IsString()
  mo_ta?: string;

  @ApiPropertyOptional({ description: 'Đơn vị tính', example: 'm2' })
  @IsOptional()
  @IsString()
  don_vi_tinh?: string;

  @ApiPropertyOptional({ description: 'Giá bán', example: 150000 })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  gia_ban?: number;

  @ApiPropertyOptional({ description: 'Trạng thái hoạt động', default: true })
  @IsOptional()
  @IsBoolean()
  trang_thai?: boolean;
}

export class UpdateHangMucDto extends BaseUpdateDto {
  @ApiPropertyOptional({ description: 'Tên hàng mục', example: 'Đá granite' })
  @IsOptional()
  @IsString()
  ten?: string;

  @ApiPropertyOptional({ description: 'Loại hàng mục', example: 'Vật liệu' })
  @IsOptional()
  @IsString()
  loai?: string;

  @ApiPropertyOptional({
    description: 'Mô tả hàng mục',
    example: 'Đá granite chất lượng cao',
  })
  @IsOptional()
  @IsString()
  mo_ta?: string;

  @ApiPropertyOptional({ description: 'Đơn vị tính', example: 'm2' })
  @IsOptional()
  @IsString()
  don_vi_tinh?: string;

  @ApiPropertyOptional({ description: 'Giá bán', example: 150000 })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  gia_ban?: number;

  @ApiPropertyOptional({ description: 'Trạng thái hoạt động' })
  @IsOptional()
  @IsBoolean()
  trang_thai?: boolean;
}

export class FilterHangMucDto extends BaseFilterDto {
  @ApiPropertyOptional({ description: 'Tên hàng mục' })
  @IsOptional()
  @IsString()
  ten?: string;

  @ApiPropertyOptional({ description: 'Loại hàng mục' })
  @IsOptional()
  @IsString()
  loai?: string;

  @ApiPropertyOptional({ description: 'Trạng thái hoạt động' })
  @IsOptional()
  @IsString()
  trang_thai?: string;

  @ApiPropertyOptional({ description: 'Giá bán từ' })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  gia_ban_tu?: number;

  @ApiPropertyOptional({ description: 'Giá bán đến' })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  gia_ban_den?: number;
}
