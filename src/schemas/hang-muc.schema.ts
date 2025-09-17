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
  soLuong: number;

  @Prop({ required: false, enum: DonViDoLuong, default: DonViDoLuong.MET })
  dvtDoLuong: DonViDoLuong;

  @Prop({ required: false, enum: DonViQuyCach, default: DonViQuyCach.VIEN })
  dvtQuyCach: DonViQuyCach;
}

@Schema({ collection: 'hang_muc', timestamps: false })
export class HangMuc {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'ycsx', required: false })
  ycsx?: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  mota: string;

  @Prop({ enum: MauDa, required: false })
  mauDa?: MauDa;

  @Prop({ enum: MatDa, required: false })
  matDa?: MatDa;

  @Prop({ enum: GiaCong, required: false })
  giaCong?: GiaCong;

  @Prop({ type: QuyCach, required: true })
  quyCach: QuyCach;

  @Prop({ required: false })
  groupId?: string;

  @Prop({ required: false })
  ghichu?: string;

  @Prop({ type: Date, default: Date.now })
  ngayTao: Date;

  @Prop({ type: Date, default: Date.now })
  ngayCapNhat: Date;
}

export const QuyCachSchema = SchemaFactory.createForClass(QuyCach);
export const HangMucSchema = SchemaFactory.createForClass(HangMuc);
