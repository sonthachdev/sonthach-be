import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { CongDoan, TrangThai, LoaiPhieu, Kho } from '../utils';

export type PhieuNghiepVuDocument = PhieuNghiepVu & Document;

@Schema({ collection: 'phieu_nghiep_vu', timestamps: false })
export class PhieuNghiepVu {
  @Prop({ required: true, unique: true })
  maPhieu: string;

  @Prop({ required: true, enum: LoaiPhieu })
  loaiPhieu: LoaiPhieu;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'ycsc', required: false })
  ycscId?: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'ycsx', required: false })
  ycsxId?: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'nhan_vien',
    required: true,
  })
  nguoiTao: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, type: Date })
  ngayTao: Date;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'nhan_vien',
    required: true,
  })
  nguoiDuyet: MongooseSchema.Types.ObjectId;

  @Prop({ required: false, type: Date })
  ngayDuyet?: Date;

  @Prop({ enum: Kho, required: false })
  kho?: Kho;

  @Prop({ required: true, enum: TrangThai })
  trangThai: TrangThai;

  @Prop({ enum: CongDoan, required: false })
  currentCongDoan?: CongDoan;

  @Prop({ enum: CongDoan, required: false })
  nextCongDoan?: CongDoan;

  @Prop({
    type: [MongooseSchema.Types.ObjectId],
    ref: 'bao_cao_san_luong',
    required: true,
  })
  bcsl: MongooseSchema.Types.ObjectId[];

  @Prop({ type: Date, default: Date.now })
  ngayCapNhat: Date;

  @Prop({ type: Number, required: false })
  pallet?: number; // metadata dùng để update cho BCSL đính kèm

  @Prop({ type: Boolean, required: false })
  theoDonHang?: boolean; // metadata dùng để update cho BCSL đính kèm

  @Prop({ type: String, required: false })
  lyDoTraHang?: string; // Phiếu Trả Hàng cần có lý do trả hàng
}

export const PhieuNghiepVuSchema = SchemaFactory.createForClass(PhieuNghiepVu);
