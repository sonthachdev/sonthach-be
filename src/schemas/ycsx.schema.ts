import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { TrangThai } from '../utils';

export type YCSXDocument = YCSX & Document;

@Schema({ collection: 'ycsx', timestamps: false })
export class YCSX {
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

  @Prop({ type: Date, required: false })
  ngay_hoan_thanh?: Date;

  @Prop({ required: true, enum: TrangThai })
  trang_thai: TrangThai;

  @Prop({ required: true })
  ma_hop_dong: string;

  @Prop({ required: true })
  ten_khach_hang: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'nhan_vien',
    required: false,
  })
  nguoi_xu_ly_id?: MongooseSchema.Types.ObjectId;

  @Prop({ type: Date, required: false })
  ngay_xu_ly?: Date;

  @Prop({
    type: [MongooseSchema.Types.ObjectId],
    ref: 'hang_muc',
    required: true,
  })
  hang_muc_ids: MongooseSchema.Types.ObjectId[];

  @Prop({ type: Date, default: Date.now })
  ngay_cap_nhat: Date;
}

export const YCSXSchema = SchemaFactory.createForClass(YCSX);
