import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { CongDoan, MauDa, MatDa, BaoCaoState, Kho } from '../utils';
import { QuyCach, QuyCachSchema } from './hang-muc.schema';

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

  @Prop({ type: String, required: false })
  ghi_chu_duyet?: string;

  @Prop({ type: String, required: false })
  ly_do_tu_choi?: string;

  @Prop({ type: String, required: false })
  ghi_chu_tu_choi?: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'nhan_vien',
    required: false,
  })
  nguoi_tu_choi_id?: MongooseSchema.Types.ObjectId;

  @Prop({ type: Date, required: false })
  ngay_tu_choi?: Date;

  @Prop({ type: Date, required: false })
  ngay_nhap_kho?: Date;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'nhan_vien',
    required: false,
  })
  nguoi_nhap_kho_id?: MongooseSchema.Types.ObjectId;

  @Prop({ type: String, required: false })
  ghi_chu_nhap_kho?: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'phieu_nghiep_vu',
    required: false,
  })
  phieu_nhap_kho_id?: MongooseSchema.Types.ObjectId;
}

export const BaoCaoSanLuongSchema =
  SchemaFactory.createForClass(BaoCaoSanLuong);
