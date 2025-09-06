import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { TrangThai } from '../utils';

export type YCSCDocument = YCSC & Document;

@Schema({ collection: 'ycsc', timestamps: false })
export class YCSC {
  @Prop({ required: true, unique: true })
  ma_phieu: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'nhan_vien',
    required: true,
  })
  nguoi_tao_id: MongooseSchema.Types.ObjectId;

  @Prop({ type: Date, required: true })
  ngay_tao: Date;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'nhan_vien',
    required: true,
  })
  nguoi_duyet_id: MongooseSchema.Types.ObjectId;

  @Prop({ type: Date, required: false })
  ngay_duyet?: Date;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'nhan_vien',
    required: true,
  })
  kcs_id: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'nhan_vien',
    required: true,
  })
  tnsx_id: MongooseSchema.Types.ObjectId;

  @Prop({ type: Date, required: false })
  ngay_hoan_thanh?: Date;

  @Prop({ required: true, enum: TrangThai })
  trang_thai: TrangThai;

  @Prop({ type: Date, default: Date.now })
  ngay_cap_nhat: Date;

  @Prop({ type: String, required: false })
  ghi_chu?: string;

  @Prop({ type: String, required: false })
  ghi_chu_duyet?: string;

  @Prop({ type: String, required: false })
  ghi_chu_hoan_thanh?: string;
}

export const YCSCSchema = SchemaFactory.createForClass(YCSC);
