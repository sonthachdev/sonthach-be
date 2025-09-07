import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { CongDoan, MauDa, MatDa, BaoCaoState, Kho } from '../utils';
import { QuyCach, QuyCachSchema } from './hang-muc.schema';
import { GiaCong } from 'src/utils/gia-cong.enum';

export type BaoCaoSanLuongDocument = BaoCaoSanLuong & Document;

@Schema({ collection: 'bao_cao_san_luong', timestamps: false })
export class BaoCaoSanLuong {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'ycsc', required: false })
  ycsc_id?: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'ycsx', required: false })
  ycsx_id?: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'hang_muc',
    required: false,
  })
  hang_muc_id?: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  ma_da: string;

  @Prop({ required: false, type: Number })
  ma_phoi?: number;

  @Prop({ required: true, enum: MauDa })
  mau_da: MauDa;

  @Prop({ enum: MatDa, required: false })
  mat_da?: MatDa;

  @Prop({ required: false, type: Number })
  do_day_cua?: number;

  @Prop({ type: QuyCachSchema, required: true })
  quy_cach: QuyCach;

  @Prop({ required: true, type: Date })
  ngay_tao: Date;

  @Prop({ required: false, type: Date })
  ngay_duyet?: Date;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'nhan_vien',
    required: false,
  })
  tnsx_id?: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'nhan_vien',
    required: false,
  })
  kcs_id?: MongooseSchema.Types.ObjectId;

  @Prop({ enum: Kho, required: false })
  kho?: Kho;

  @Prop({ required: false })
  vi_tri?: string; // A1-A10, B1-B10, C1-C10

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'bao_cao_san_luong',
    required: false,
  })
  parent_id?: MongooseSchema.Types.ObjectId;

  @Prop({ enum: CongDoan, required: false })
  completed_cong_doan?: CongDoan;

  @Prop({ required: false })
  reason?: string;

  @Prop({ required: true, enum: BaoCaoState })
  trang_thai: BaoCaoState;

  @Prop({ type: Date, default: Date.now })
  ngay_cap_nhat: Date;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'nhan_vien',
    required: false,
  })
  nguoi_tu_choi_id?: MongooseSchema.Types.ObjectId;

  @Prop({ type: Date, required: false })
  ngay_tu_choi?: Date;

  @Prop({ type: Number, required: false })
  pallet?: number; // TP: Thủ Kho TP đánh dấu mã pallet

  @Prop({ type: Boolean, required: false })
  theoDonHang?: boolean; // ĐG: KCS xuất về kho TP thì đánh dấu kiện này có theo đơn hàng hay không, nếu có thì tính tiến độ cho YCSX này

  @Prop({ type: Number, required: false })
  soMay?: number; // CQC: số máy khi báo cáo cắt quy cách, 1 - 10

  @Prop({ type: String, required: false })
  nguoiVanHanhMay?: string; // CQC: người vận hành máy khi báo cáo cắt quy cách, tên do người tạo báo cáo nhập

  @Prop({ type: String, required: false })
  groupId?: string; // ĐG: group BCSL khi đóng gói để đi theo kiện

  @Prop({ type: String, required: false })
  giaCong?: GiaCong;
}

export const BaoCaoSanLuongSchema =
  SchemaFactory.createForClass(BaoCaoSanLuong);
