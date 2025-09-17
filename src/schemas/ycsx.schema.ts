import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { TrangThai } from '../utils';

export type YCSXDocument = YCSX & Document;

@Schema({ collection: 'ycsx', timestamps: false })
export class YCSX {
  @Prop({ required: true, unique: true })
  maPhieu: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'nhan_vien',
    required: true,
  })
  nguoiTao: MongooseSchema.Types.ObjectId;

  @Prop({ type: Date, required: true })
  ngayTao: Date;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'nhan_vien',
    required: true,
  })
  nguoiDuyet: MongooseSchema.Types.ObjectId;

  @Prop({ type: Date, required: false })
  ngayDuyet?: Date;

  @Prop({ type: Date, required: false })
  ngayHoanThanh?: Date;

  @Prop({ required: true, enum: TrangThai })
  trangThai: TrangThai;

  @Prop({ required: true })
  maHopDong: string;

  @Prop({ required: true })
  tenKhachHang: string;

  @Prop({
    type: [MongooseSchema.Types.ObjectId],
    ref: 'hang_muc',
    required: true,
  })
  hangMuc: MongooseSchema.Types.ObjectId[];

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'nhan_vien',
    required: false,
  })
  nguoiXuLy: MongooseSchema.Types.ObjectId;

  @Prop({ type: Date, required: false })
  ngayXuLy?: Date;

  @Prop({
    type: [MongooseSchema.Types.ObjectId],
    ref: 'phan_cong',
    required: true,
  })
  phanCong: MongooseSchema.Types.ObjectId[];
}

export const YCSXSchema = SchemaFactory.createForClass(YCSX);
