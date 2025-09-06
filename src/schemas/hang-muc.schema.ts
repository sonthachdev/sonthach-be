import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { MauDa, MatDa, DonViDoLuong, DonViQuyCach } from '../utils';
import { GiaCong } from 'src/utils/gia-cong.enum';

export type HangMucDocument = HangMuc & Document;

@Schema({ _id: false })
export class QuyCach {
  @Prop({ required: true, type: Number })
  dai: number;

  @Prop({ required: true, type: Number })
  rong: number;

  @Prop({ required: true, type: Number })
  day: number;

  @Prop({ required: true, type: Number, default: 1 })
  so_luong: number;

  @Prop({ required: false, enum: DonViDoLuong, default: DonViDoLuong.MET })
  dvt_do_luong: DonViDoLuong;

  @Prop({ required: false, enum: DonViQuyCach, default: DonViQuyCach.VIEN })
  dvt_quy_cach: DonViQuyCach;
}

@Schema({ collection: 'hang_muc', timestamps: false })
export class HangMuc {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'ycsx', required: false })
  ycsx_id?: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  mota: string;

  @Prop({ enum: MauDa, required: false })
  mau_da?: MauDa;

  @Prop({ enum: MatDa, required: false })
  mat_da?: MatDa;

  @Prop({ enum: GiaCong, required: false })
  gia_cong?: GiaCong;

  @Prop({ type: QuyCach, required: true })
  quy_cach: QuyCach;

  @Prop({ required: false })
  group_id?: string;

  @Prop({ required: false })
  ghichu?: string;

  @Prop({ type: Date, default: Date.now })
  ngay_tao: Date;
}

export const QuyCachSchema = SchemaFactory.createForClass(QuyCach);
export const HangMucSchema = SchemaFactory.createForClass(HangMuc);
