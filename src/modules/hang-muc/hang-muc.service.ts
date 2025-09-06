import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseService } from '../../common/base';
import { HangMuc, HangMucDocument } from '../../schemas';

@Injectable()
export class HangMucService extends BaseService<HangMucDocument> {
  constructor(
    @InjectModel(HangMuc.name)
    private readonly hangMucModel: Model<HangMucDocument>,
  ) {
    super(hangMucModel);
  }

  /**
   * Tìm hàng mục theo loại
   */
  async findByLoai(loai: string): Promise<HangMucDocument[]> {
    return await this.model.find({ loai }).exec();
  }

  /**
   * Tìm hàng mục theo trạng thái
   */
  async findByTrangThai(trangThai: boolean): Promise<HangMucDocument[]> {
    return await this.model.find({ trang_thai: trangThai }).exec();
  }

  /**
   * Tìm hàng mục theo tên (tìm kiếm mờ)
   */
  async findByTen(ten: string): Promise<HangMucDocument[]> {
    const regex = new RegExp(ten, 'i'); // i = case insensitive
    return await this.model.find({ ten: regex }).exec();
  }

  /**
   * Lấy danh sách hàng mục đang hoạt động
   */
  async findActive(): Promise<HangMucDocument[]> {
    return await this.model.find({ trang_thai: true }).exec();
  }

  /**
   * Cập nhật trạng thái hàng mục
   */
  async updateTrangThai(
    id: string,
    trangThai: boolean,
  ): Promise<HangMucDocument> {
    return await this.update(id, {
      trang_thai: trangThai,
      ngay_cap_nhat: new Date(),
    });
  }
}
