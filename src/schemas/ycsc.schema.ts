import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { TrangThai } from '../utils';

export type YCSCDocument = YCSC & Document;

@Schema({ collection: 'ycsc', timestamps: false })
export class YCSC {
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

  @Prop({
    type: [MongooseSchema.Types.ObjectId],
    ref: 'phan_cong',
    required: true,
  })
  phanCong: MongooseSchema.Types.ObjectId[];
}

export const YCSCSchema = SchemaFactory.createForClass(YCSC);
