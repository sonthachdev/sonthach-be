import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { VaiTro, CongDoan } from '../utils';

export type NhanVienDocument = NhanVien & Document;

@Schema({ collection: 'nhan_vien', timestamps: false })
export class NhanVien {
  @Prop({ required: true })
  ten: string;

  @Prop({ required: true, enum: VaiTro })
  vaiTro: VaiTro;

  @Prop({ enum: CongDoan, required: false })
  congDoan?: CongDoan;

  @Prop({ type: Date, default: Date.now })
  ngayTao: Date;

  @Prop({ type: Date, default: Date.now })
  ngayCapNhat: Date;

  @Prop({ type: Boolean, default: true })
  trangThai: boolean;

  @Prop({ type: String, default: '' })
  username: string;

  @Prop({ type: String, default: '' })
  password: string;
}

export const NhanVienSchema = SchemaFactory.createForClass(NhanVien);
