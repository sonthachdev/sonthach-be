/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { BaseService } from '../../common/base';
import {
  HangMuc,
  HangMucDocument,
  PhanCong,
  PhanCongDocument,
  YCSX,
  YCSXDocument,
} from '../../schemas';
import {
  CreateYCSXDto,
  FilterYCSXDto,
  HangMucCreateYCSXDto,
  CreateHangMucYCSXDto,
  UpdateDeNghiSanXuatDto,
  UpdateHangMucYCSXDto,
  UpdateTrangThaiYCSXDto,
} from './dto/ycsx.dto';
import { TrangThai } from '../../utils';
import { ObjectId } from 'mongodb';

@Injectable()
export class YCSXService extends BaseService<YCSXDocument> {
  constructor(
    @InjectModel(YCSX.name)
    private readonly ycsxModel: Model<YCSXDocument>,
  ) {
    super(ycsxModel);
  }
  async findByTrangThai(trangThai: string): Promise<YCSXDocument[]> {
    const result = await this.findAll({ trangThai });
    return result.data;
  }

  async findByNhanVien(nhanVienId: string): Promise<YCSXDocument[]> {
    const result = await this.findAll({ nhanVienId });
    return result.data;
  }

  async findByNgayTao(ngayTao: Date): Promise<YCSXDocument[]> {
    const result = await this.findAll({ ngayTao });
    return result.data;
  }

  async findByLoaiYeuCau(loaiYeuCau: string): Promise<YCSXDocument[]> {
    const result = await this.findAll({ loaiYeuCau });
    return result.data;
  }

  async findChoXuLy(): Promise<YCSXDocument[]> {
    const result = await this.findAll({ trangThai: 'cho-xu-ly' });
    return result.data;
  }

  async updateTrangThai(id: string, trangThai: string): Promise<YCSXDocument> {
    return this.update(id, { trangThai });
  }

  async createYCSX(createDto: CreateYCSXDto): Promise<any> {
    const existingYCSX = await this.ycsxModel.findOne({
      ma_phieu: createDto.ma_phieu,
    });
    if (existingYCSX) {
      throw new BadRequestException('Mã phiếu đã tồn tại');
    }
    const newYCSX = new this.ycsxModel({
      ...createDto,
      trang_thai: TrangThai.NEW,
      ngay_tao: new Date(),
      ngay_cap_nhat: new Date(),
    });
    const savedYCSX = await newYCSX.save();
    const hangMucModel = this.ycsxModel.db.model(HangMuc.name);

    const hangMucDocuments = await Promise.all(
      createDto.hang_muc.map(async (hangMuc: HangMucCreateYCSXDto) => {
        const newHangMuc = new hangMucModel({
          ...hangMuc,
          ycsx_id: savedYCSX._id,
        });
        return await newHangMuc.save();
      }),
    );

    const listHangMucIds = hangMucDocuments.map((hangMuc) => hangMuc._id);

    await this.update(savedYCSX._id as string, {
      hang_muc_ids: listHangMucIds,
    });

    const ycsx = await this.findById(savedYCSX._id as string);

    return {
      ...ycsx.toObject(),
      hang_muc: hangMucDocuments,
    };
  }

  async filterYCSX(filter: FilterYCSXDto): Promise<{
    ycsx: YCSXDocument[];
    total: number;
    totalPages: number;
  }> {
    const filterQuery: FilterQuery<YCSXDocument> = {};
    if (filter.trang_thai) {
      filterQuery.trang_thai = filter.trang_thai;
    }
    const result = await this.findAll(filterQuery, {
      page: filter.page,
      limit: filter.limit,
      sort: filter.sort,
      populateSelect: [
        { path: 'nguoi_tao_id', select: '_id ten vai_tro' },
        { path: 'nguoi_duyet_id', select: '_id ten vai_tro' },
      ],
    });
    const total = await this.count(filterQuery);
    return {
      ycsx: result.data,
      total,
      totalPages: result.totalPages,
    };
  }

  async updateDeNghiSanXuat(
    id: string,
    deNghiSanXuat: UpdateDeNghiSanXuatDto,
  ): Promise<{
    ycsx: YCSXDocument;
    phan_cong: PhanCongDocument[];
  }> {
    const ycsx = await this.findById(id);
    if (!ycsx) {
      throw new NotFoundException('Yêu cầu sản xuất không tồn tại');
    }
    const phanCongModel = this.ycsxModel.db.model(PhanCong.name);
    const phanCongs = await Promise.all(
      deNghiSanXuat.items.map(async (item) => {
        const newPhanCong = new phanCongModel({
          ycsx_id: ycsx._id,
          kcs_id: item.kcs_id,
          tnsx_id: item.tnsx_id,
          cong_doan: item.cong_doan,
          ngay_tao: new Date(),
        });
        return await newPhanCong.save();
      }),
    );
    const updatedYCSX = await this.update(id, {
      ngay_cap_nhat: new Date(),
      trang_thai: TrangThai.REVIEWED,
    });
    return { ycsx: updatedYCSX.toObject(), phan_cong: phanCongs };
  }

  async updateTrangThaiYCSX(
    id: string,
    body: UpdateTrangThaiYCSXDto,
  ): Promise<YCSXDocument> {
    const ycsx = await this.findById(id);
    if (!ycsx) {
      throw new NotFoundException('Yêu cầu sản xuất không tồn tại');
    }
    return this.update(id, {
      trang_thai: body.trang_thai,
      ngay_cap_nhat: new Date(),
      ngay_duyet: new Date(),
    });
  }

  async getDetailYCSX(id: string): Promise<{
    ycsx: YCSXDocument;
    phan_cong: PhanCongDocument[];
  }> {
    const ycsxModel = this.ycsxModel.db.model(YCSX.name);
    const ycsx = await ycsxModel.findById(id).populate([
      {
        path: 'nguoi_tao_id',
        select: '_id ten vai_tro cong_doan',
      },
      {
        path: 'nguoi_duyet_id',
        select: '_id ten vai_tro cong_doan',
      },
      {
        path: 'nguoi_xu_ly_id',
        select: '_id ten vai_tro cong_doan',
      },
      {
        path: 'hang_muc_ids',
        select: '_id mota mau_da mat_da quy_cach group_id ghichu',
      },
    ]);
    if (!ycsx) {
      throw new NotFoundException('Yêu cầu sản xuất không tồn tại');
    }

    const phanCongModel = this.ycsxModel.db.model(PhanCong.name);
    const phanCongs = await phanCongModel.find({ ycsx_id: id }).populate([
      {
        path: 'kcs_id',
        select: '_id ten vai_tro cong_doan',
      },
      {
        path: 'tnsx_id',
        select: '_id ten vai_tro cong_doan',
      },
    ]);
    const ycsxWithPhanCong = {
      ycsx: ycsx.toObject(),
      phan_cong: phanCongs,
    };

    return ycsxWithPhanCong;
  }

  async updateHangMucYCSX(
    id: string,
    hangMucId: string,
    body: UpdateHangMucYCSXDto,
  ): Promise<HangMucDocument> {
    const ycsx = await this.findById(id);
    if (!ycsx) {
      throw new NotFoundException('Yêu cầu sản xuất không tồn tại');
    }

    const hangMucModel = this.ycsxModel.db.model(HangMuc.name);
    const hangMuc = await hangMucModel.findById(hangMucId);
    if (!hangMuc) {
      throw new NotFoundException('Hàng mục không tồn tại');
    }

    await hangMucModel.updateOne(
      { _id: hangMucId },
      {
        $set: {
          ...body.hang_muc,
          ngay_cap_nhat: new Date(),
        },
      },
    );

    const updatedHangMuc = await hangMucModel.findById(hangMucId);

    const listHangMucByGroupId = await hangMucModel.find({
      group_id: hangMuc.group_id,
      _id: { $ne: hangMucId },
    });

    if (listHangMucByGroupId.length > 0) {
      await hangMucModel.updateMany(
        { group_id: hangMuc.group_id },
        {
          $set: {
            ghichu: updatedHangMuc.ghichu,
            mota: updatedHangMuc.mota,
            ngay_cap_nhat: new Date(),
          },
        },
      );
    }
    await this.update(id, {
      ngay_cap_nhat: new Date(),
    });
    return updatedHangMuc.toObject();
  }

  async createHangMucYCSX(
    id: string,
    body: CreateHangMucYCSXDto,
  ): Promise<HangMucDocument[]> {
    const ycsx = await this.findById(id);
    if (!ycsx) {
      throw new NotFoundException('Yêu cầu sản xuất không tồn tại');
    }
    const hangMucModel = this.ycsxModel.db.model(HangMuc.name);
    const hangMucs = await Promise.all(
      body.hang_muc.map(async (hangMuc: HangMucCreateYCSXDto) => {
        const newHangMuc = new hangMucModel({
          ...hangMuc,
          ycsx_id: ycsx._id,
          group_id: hangMuc.group_id
            ? hangMuc.group_id
            : new ObjectId().toString(),
          ngay_tao: new Date(),
        });
        return await newHangMuc.save();
      }),
    );
    await this.update(id, {
      ngay_cap_nhat: new Date(),
    });
    return hangMucs;
  }
}
