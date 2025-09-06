import { IsOptional, IsString, IsDate, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class BaseCreateDto {
  // Base properties that can be overridden by child classes
}

export class BaseUpdateDto {
  // Base properties that can be overridden by child classes
}

export class BaseFilterDto {
  @ApiPropertyOptional({ description: 'Ngày tạo từ (YYYY-MM-DD)', example: '2024-01-01' })
  @IsOptional()
  @IsString()
  ngay_tao_tu?: string;

  @ApiPropertyOptional({ description: 'Ngày tạo đến (YYYY-MM-DD)', example: '2024-12-31' })
  @IsOptional()
  @IsString()
  ngay_tao_den?: string;

  @ApiPropertyOptional({ description: 'Ngày cập nhật từ (YYYY-MM-DD)', example: '2024-01-01' })
  @IsOptional()
  @IsString()
  ngay_cap_nhat_tu?: string;

  @ApiPropertyOptional({ description: 'Ngày cập nhật đến (YYYY-MM-DD)', example: '2024-12-31' })
  @IsOptional()
  @IsString()
  ngay_cap_nhat_den?: string;
}

export class PaginationDto {
  @ApiPropertyOptional({ description: 'Số trang', default: 1, example: 1 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Số lượng item mỗi trang', default: 10, example: 10 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Sắp xếp (field:order)', example: 'createdAt:-1,name:1' })
  @IsOptional()
  @IsString()
  sort?: string;

  @ApiPropertyOptional({ description: 'Populate fields', example: 'user,department' })
  @IsOptional()
  @IsString()
  populate?: string;
}
