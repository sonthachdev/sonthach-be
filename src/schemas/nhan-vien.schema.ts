import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { VaiTro, CongDoan } from '../utils';

export type NhanVienDocument = NhanVien & Document;

@Schema({ collection: 'nhan_vien', timestamps: false })
export class NhanVien {
  @Prop({ required: true })
  ten: string;

  @Prop({ required: true, enum: VaiTro })
  vai_tro: VaiTro;

  @Prop({ enum: CongDoan, required: false })
  cong_doan?: CongDoan;

  @Prop({ type: Date, default: Date.now })
  ngay_tao: Date;

  @Prop({ type: Date, default: Date.now })
  ngay_cap_nhat: Date;

  @Prop({ type: Boolean, default: true })
  trang_thai: boolean;

  @Prop({ type: String, default: '' })
  username: string;

  @Prop({ type: String, default: '' })
  password: string;
}

export const NhanVienSchema = SchemaFactory.createForClass(NhanVien);
