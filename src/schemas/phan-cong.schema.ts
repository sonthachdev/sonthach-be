import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { CongDoan } from '../utils';

export type PhanCongDocument = PhanCong & Document;

@Schema({ collection: 'phan_cong', timestamps: false })
export class PhanCong {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'ycsx', required: false })
  ycsx?: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'ycsc', required: false })
  ycsc?: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'nhan_vien',
    required: true,
  })
  kcs: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'nhan_vien',
    required: true,
  })
  tnsx: MongooseSchema.Types.ObjectId;

  @Prop({ enum: CongDoan, required: true })
  congDoan: CongDoan;

  @Prop({ type: Date, default: Date.now })
  ngayTao: Date;

  @Prop({ type: Date, default: Date.now })
  ngayCapNhat: Date;
}

export const PhanCongSchema = SchemaFactory.createForClass(PhanCong);
