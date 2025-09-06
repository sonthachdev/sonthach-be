import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { CongDoan, TrangThai, LoaiPhieu, Kho } from '../utils';

export type PhieuNghiepVuDocument = PhieuNghiepVu & Document;

@Schema({ collection: 'phieu_nghiep_vu', timestamps: false })
export class PhieuNghiepVu {
  @Prop({ required: true, unique: true })
  ma_phieu: string;

  @Prop({ required: true, enum: LoaiPhieu })
  loai_phieu: LoaiPhieu;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'ycsc', required: false })
  ycsc_id?: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'ycsx', required: false })
  ycsx_id?: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'nhan_vien',
    required: true,
  })
  nguoi_tao_id: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, type: Date })
  ngay_tao: Date;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'nhan_vien',
    required: true,
  })
  nguoi_duyet_id: MongooseSchema.Types.ObjectId;

  @Prop({ required: false, type: Date })
  ngay_duyet?: Date;

  @Prop({ enum: Kho, required: false })
  kho?: Kho;

  @Prop({ required: true, enum: TrangThai })
  trang_thai: TrangThai;

  @Prop({ enum: CongDoan, required: false })
  current_cong_doan?: CongDoan;

  @Prop({ enum: CongDoan, required: false })
  next_cong_doan?: CongDoan;

  @Prop({
    type: [MongooseSchema.Types.ObjectId],
    ref: 'bao_cao_san_luong',
    required: true,
  })
  bcsl_ids: MongooseSchema.Types.ObjectId[];

  @Prop({
    type: [MongooseSchema.Types.ObjectId],
    ref: 'hang_muc',
    required: false,
  })
  hang_muc_ids?: MongooseSchema.Types.ObjectId[];

  @Prop({ type: Date, default: Date.now })
  ngay_cap_nhat: Date;

  @Prop({ type: String, required: false })
  ghi_chu_duyet?: string;

  @Prop({ type: String, required: false })
  ghi_chu_nhap_kho?: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'nhan_vien',
    required: false,
  })
  nguoi_thuc_hien_nhap_kho_id?: MongooseSchema.Types.ObjectId;

  @Prop({ type: Date, required: false })
  ngay_nhap_kho?: Date;
}

export const PhieuNghiepVuSchema = SchemaFactory.createForClass(PhieuNghiepVu);
