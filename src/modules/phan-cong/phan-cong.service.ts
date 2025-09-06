import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseService } from '../../common/base';
import { PhanCong, PhanCongDocument } from '../../schemas';

@Injectable()
export class PhanCongService extends BaseService<PhanCongDocument> {
  constructor(
    @InjectModel(PhanCong.name)
    private readonly phanCongModel: Model<PhanCongDocument>,
  ) {
    super(phanCongModel);
  }

  /**
   * Tìm phân công theo nhân viên
   */
  async findByNhanVien(nhanVienId: string): Promise<PhanCongDocument[]> {
    return await this.model.find({ nhan_vien_id: nhanVienId }).exec();
  }

  /**
   * Tìm phân công theo hàng mục
   */
  async findByHangMuc(hangMucId: string): Promise<PhanCongDocument[]> {
    return await this.model.find({ hang_muc_id: hangMucId }).exec();
  }

  /**
   * Tìm phân công theo trạng thái
   */
  async findByTrangThai(trangThai: string): Promise<PhanCongDocument[]> {
    return await this.model.find({ trang_thai: trangThai }).exec();
  }

  /**
   * Tìm phân công theo ngày
   */
  async findByNgay(ngay: Date): Promise<PhanCongDocument[]> {
    const startOfDay = new Date(ngay);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(ngay);
    endOfDay.setHours(23, 59, 59, 999);

    return await this.model
      .find({
        ngay_phan_cong: { $gte: startOfDay, $lte: endOfDay },
      })
      .exec();
  }

  /**
   * Lấy danh sách phân công đang hoạt động
   */
  async findActive(): Promise<PhanCongDocument[]> {
    return await this.model.find({ trang_thai: 'dang_lam' }).exec();
  }

  /**
   * Cập nhật trạng thái phân công
   */
  async updateTrangThai(
    id: string,
    trangThai: string,
  ): Promise<PhanCongDocument> {
    return await this.update(id, {
      trang_thai: trangThai,
      ngay_cap_nhat: new Date(),
    });
  }
}
