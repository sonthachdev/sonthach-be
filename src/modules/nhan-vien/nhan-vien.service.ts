import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { BaseService } from '../../common/base';
import { NhanVien, NhanVienDocument } from '../../schemas';

@Injectable()
export class NhanVienService extends BaseService<NhanVienDocument> {
  constructor(
    @InjectModel(NhanVien.name)
    private readonly nhanVienModel: Model<NhanVienDocument>,
  ) {
    super(nhanVienModel);
  }

  /**
   * Tìm nhân viên theo vai trò
   */
  async findByVaiTro(vaiTro: string): Promise<NhanVienDocument[]> {
    return await this.model.find({ vai_tro: vaiTro }).exec();
  }

  /**
   * Tìm nhân viên theo công đoạn
   */
  async findByCongDoan(congDoan: string): Promise<NhanVienDocument[]> {
    return await this.model.find({ cong_doan: congDoan }).exec();
  }

  /**
   * Tìm nhân viên theo tên (tìm kiếm mờ)
   */
  async findByTen(ten: string): Promise<NhanVienDocument[]> {
    const regex = new RegExp(ten, 'i'); // i = case insensitive
    return await this.model.find({ ten: regex }).exec();
  }

  /**
   * Cập nhật trạng thái nhân viên
   */
  async updateTrangThai(
    id: string,
    trangThai: boolean,
  ): Promise<NhanVienDocument> {
    return await this.update(id, {
      trang_thai: trangThai,
      ngay_cap_nhat: new Date(),
    });
  }

  /**
   * Lấy danh sách nhân viên đang hoạt động
   */
  async findActive(): Promise<NhanVienDocument[]> {
    return await this.model.find({ trang_thai: true }).exec();
  }

  /**
   * Lấy danh sách nhân viên theo vai trò và công đoạn
   */
  async findByVaiTroAndCongDoan(
    vaiTro: string,
    congDoan: string,
  ): Promise<NhanVienDocument[]> {
    return await this.model
      .find({
        vai_tro: vaiTro,
        cong_doan: congDoan,
        trang_thai: true,
      })
      .exec();
  }

  /**
   * Tạo nhân viên mới với mật khẩu đã hash
   */
  async createWithHashedPassword(
    nhanVienData: Partial<NhanVien>,
  ): Promise<NhanVienDocument> {
    if (nhanVienData.password) {
      const saltRounds = 10;
      nhanVienData.password = await bcrypt.hash(
        nhanVienData.password,
        saltRounds,
      );
    }

    const nhanVien = new this.model({
      ...nhanVienData,
      ngay_tao: new Date(),
      ngay_cap_nhat: new Date(),
      trang_thai: true,
    });

    return await nhanVien.save();
  }

  /**
   * Cập nhật mật khẩu cho nhân viên
   */
  async updatePassword(
    id: string,
    newPassword: string,
  ): Promise<NhanVienDocument> {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    return await this.update(id, {
      password: hashedPassword,
      ngay_cap_nhat: new Date(),
    });
  }

  /**
   * Tìm nhân viên theo username
   */
  async findByUsername(username: string): Promise<NhanVienDocument | null> {
    return await this.model.findOne({ username }).exec();
  }
}
