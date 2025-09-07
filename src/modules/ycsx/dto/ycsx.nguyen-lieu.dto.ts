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
  Kho,
  MauDa,
  TrangThai,
} from 'src/utils';
import { GiaCong } from 'src/utils/gia-cong.enum';
import { QuyCach } from 'src/schemas/hang-muc.schema';

export class NhapNguyenLieuDto {
  @ApiProperty({
    description: 'Danh sách ID báo cáo sản lượng',
    type: [String],
    example: ['507f1f77bcf86cd799439011'],
  })
  @IsArray()
  @IsMongoId({ each: true })
  bcsl_ids: string[];

  @ApiProperty({
    description: 'Độ dày của báo cáo sản lượng',
    example: 10,
  })
  @IsNumber()
  do_day_cua?: number;

  @ApiProperty({
    description: 'Kho',
    enum: Kho,
    example: Kho.KHO_BLOCK,
  })
  @IsEnum(Kho)
  kho?: Kho;
}
