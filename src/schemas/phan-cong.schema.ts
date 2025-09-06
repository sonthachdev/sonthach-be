import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { CongDoan } from '../utils';

export type PhanCongDocument = PhanCong & Document;

@Schema({ collection: 'phan_cong', timestamps: false })
export class PhanCong {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'ycsx', required: false })
  ycsx_id?: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'ycsc', required: false })
  ycsc_id?: MongooseSchema.Types.ObjectId;

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

  @Prop({ enum: CongDoan, required: true })
  cong_doan: CongDoan;

  @Prop({ type: Date, default: Date.now })
  ngay_tao: Date;
}

export const PhanCongSchema = SchemaFactory.createForClass(PhanCong);
