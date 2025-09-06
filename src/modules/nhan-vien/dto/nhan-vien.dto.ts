import {
  IsString,
  IsEnum,
  IsOptional,
  IsDate,
  IsBoolean,
} from 'class-validator';
import { Transform } from 'class-transformer';
import {
  BaseCreateDto,
  BaseUpdateDto,
  BaseFilterDto,
} from '../../../common/base';
import { VaiTro, CongDoan } from '../../../utils';

export class CreateNhanVienDto extends BaseCreateDto {
  @IsString()
  ten: string;

  @IsEnum(VaiTro)
  vai_tro: VaiTro;

  @IsOptional()
  @IsEnum(CongDoan)
  cong_doan?: CongDoan;

  @IsOptional()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  ngay_tao?: Date;

  @IsOptional()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  ngay_cap_nhat?: Date;

  @IsOptional()
  @IsBoolean()
  trang_thai?: boolean;
}

export class UpdateNhanVienDto extends BaseUpdateDto {
  @IsOptional()
  @IsString()
  ten?: string;

  @IsOptional()
  @IsEnum(VaiTro)
  vai_tro?: VaiTro;

  @IsOptional()
  @IsEnum(CongDoan)
  cong_doan?: CongDoan;

  @IsOptional()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  ngay_cap_nhat?: Date;

  @IsOptional()
  @IsBoolean()
  trang_thai?: boolean;
}

export class FilterNhanVienDto extends BaseFilterDto {
  @IsOptional()
  @IsString()
  ten?: string;

  @IsOptional()
  @IsEnum(VaiTro)
  vai_tro?: VaiTro;

  @IsOptional()
  @IsEnum(CongDoan)
  cong_doan?: CongDoan;

  @IsOptional()
  @IsString()
  trang_thai?: string;
}
