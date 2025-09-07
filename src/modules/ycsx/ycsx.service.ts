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
  BaoCaoSanLuong,
  BaoCaoSanLuongDocument,
  HangMuc,
  HangMucDocument,
  PhanCong,
  PhanCongDocument,
  PhieuNghiepVu,
  PhieuNghiepVuDocument,
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
import { BaoCaoState, Kho, LoaiPhieu, TrangThai } from '../../utils';
import { ObjectId } from 'mongodb';
import { NhapNguyenLieuDto } from './dto/ycsx.nguyen-lieu.dto';
import {
  BaoCaoSanLuongByYCSXDto,
  UpdateBaoCaoSanLuongByYCSXDto,
  XuatKhoBaoCaoSanLuongByYCSXDto,
  ApproveChuyenTiepBaoCaoSanLuongByYCSXDto,
} from './dto/ycsx.bcsl';

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
    const listHangMucNewIds = hangMucs.map((hangMuc) => hangMuc._id);
    const listHangMucUpdate = [...ycsx.hang_muc_ids, ...listHangMucNewIds];
    await this.update(id, {
      ngay_cap_nhat: new Date(),
      hang_muc_ids: listHangMucUpdate,
    });
    return hangMucs;
  }

  async addNguyenLieuYCSXByCongDoan(
    id: string,
    congDoanId: string,
    body: NhapNguyenLieuDto,
  ): Promise<PhieuNghiepVuDocument> {
    const ycsx = await this.findById(id);
    if (!ycsx) {
      throw new NotFoundException('Yêu cầu sản xuất không tồn tại');
    }

    const phanCongModel = this.ycsxModel.db.model(PhanCong.name);
    const phanCong = await phanCongModel.findById(congDoanId);
    if (!phanCong) {
      throw new NotFoundException('Phân công không tồn tại');
    }

    const baoCaoSanLuongModel = this.ycsxModel.db.model(BaoCaoSanLuong.name);
    const baoCaoSanLuongs = await baoCaoSanLuongModel.find({
      _id: { $in: body.bcsl_ids },
    });
    if (baoCaoSanLuongs.length !== body.bcsl_ids.length) {
      throw new NotFoundException('Một số báo cáo sản lượng không tồn tại');
    }

    const phieuNghiepVuModel = this.ycsxModel.db.model(PhieuNghiepVu.name);
    const phieuNghiepVu = await phieuNghiepVuModel.create({
      ycsx_id: ycsx._id,
      ma_phieu: `NhapNguyenLieu-${(ycsx._id as any).toString()}-${new Date().getTime()}`,
      loai_phieu: LoaiPhieu.XuatKho,
      trang_thai: TrangThai.NEW,
      kho: body.kho,
      ngay_tao: new Date(),
      ngay_cap_nhat: new Date(),
      currentCongDoan: phanCong.cong_doan,
      bcsl_ids: body.bcsl_ids,
      nguoi_tao_id: phanCong.tnsx_id,
      nguoi_duyet_id: phanCong.kcs_id,
    });

    await baoCaoSanLuongModel.updateMany(
      { _id: { $in: body.bcsl_ids } },
      {
        $set: {
          trang_thai: BaoCaoState.RESERVED,
          ngay_cap_nhat: new Date(),
          do_day_cua: body.do_day_cua,
          kho: body.kho,
          ycsx_id: ycsx._id,
        },
      },
    );

    const phieuNghiepVuUpdated = await phieuNghiepVuModel
      .findById(phieuNghiepVu._id)
      .populate('bcsl_ids');

    return phieuNghiepVuUpdated;
  }

  async addBaoCaoSanLuongByYCSX(
    id: string,
    congDoanId: string,
    body: BaoCaoSanLuongByYCSXDto,
  ): Promise<BaoCaoSanLuongDocument> {
    const ycsx = await this.findById(id);
    if (!ycsx) {
      throw new NotFoundException('Yêu cầu sản xuất không tồn tại');
    }

    const phanCongModel = this.ycsxModel.db.model(PhanCong.name);
    const phanCong = await phanCongModel.findById(congDoanId);
    if (!phanCong) {
      throw new NotFoundException('Phân công không tồn tại');
    }

    const baoCaoSanLuongModel = this.ycsxModel.db.model(BaoCaoSanLuong.name);
    const baoCaoSanLuong = await baoCaoSanLuongModel.create({
      ...body,
      ycsx_id: ycsx._id,
      trang_thai: BaoCaoState.NEW,
      ngay_tao: new Date(),
      completed_cong_doan: phanCong.cong_doan,
      tnsx_id: phanCong.tnsx_id,
      kcs_id: phanCong.kcs_id,
      ngay_cap_nhat: new Date(),
    });

    return baoCaoSanLuong;
  }

  async updateBaoCaoSanLuongByYCSX(
    id: string,
    congDoanId: string,
    body: UpdateBaoCaoSanLuongByYCSXDto,
  ): Promise<BaoCaoSanLuongDocument[]> {
    const ycsx = await this.findById(id);
    if (!ycsx) {
      throw new NotFoundException('Yêu cầu sản xuất không tồn tại');
    }

    const phanCongModel = this.ycsxModel.db.model(PhanCong.name);
    const phanCong = await phanCongModel.findById(congDoanId);
    if (!phanCong) {
      throw new NotFoundException('Phân công không tồn tại');
    }

    const baoCaoSanLuongModel = this.ycsxModel.db.model(BaoCaoSanLuong.name);
    const baoCaoSanLuong = await baoCaoSanLuongModel.find({
      _id: { $in: body.bcsl_ids },
    });
    if (baoCaoSanLuong.length !== body.bcsl_ids.length) {
      throw new NotFoundException('Một số báo cáo sản lượng không tồn tại');
    }

    await baoCaoSanLuongModel.updateMany(
      { _id: { $in: body.bcsl_ids } },
      {
        $set: {
          trang_thai: body.trang_thai,
          reason: body.reason,
          ngay_cap_nhat: new Date(),
        },
      },
    );

    const baoCaoSanLuongUpdated = await baoCaoSanLuongModel.find({
      _id: { $in: body.bcsl_ids },
    });

    return baoCaoSanLuongUpdated;
  }

  async xuatKhoBaoCaoSanLuongByYCSX(
    id: string,
    congDoanId: string,
    body: XuatKhoBaoCaoSanLuongByYCSXDto,
  ): Promise<BaoCaoSanLuongDocument[]> {
    const ycsx = await this.findById(id);
    if (!ycsx) {
      throw new NotFoundException('Yêu cầu sản xuất không tồn tại');
    }

    const phanCongModel = this.ycsxModel.db.model(PhanCong.name);
    const phanCong = await phanCongModel.findById(congDoanId);
    if (!phanCong) {
      throw new NotFoundException('Phân công không tồn tại');
    }

    const baoCaoSanLuongModel = this.ycsxModel.db.model(BaoCaoSanLuong.name);
    const baoCaoSanLuong = await baoCaoSanLuongModel.find({
      _id: { $in: body.bcsl_ids },
    });
    if (baoCaoSanLuong.length !== body.bcsl_ids.length) {
      throw new NotFoundException('Một số báo cáo sản lượng không tồn tại');
    }

    const phieuNghiepVuModel = this.ycsxModel.db.model(PhieuNghiepVu.name);

    const bodyPhieuNghiepVu = {
      ycsx_id: ycsx._id,
      ma_phieu: body.ma_phieu,
      loai_phieu: body.loai_phieu,
      trang_thai: TrangThai.NEW,
      kho: body.kho_nhan,
      currentCongDoan: phanCong.cong_doan,
      nextCongDoan: body.next_cong_doan,
      bcsl_ids: body.bcsl_ids,
      nguoi_tao_id: phanCong.kcs_id,
      nguoi_duyet_id:
        body.loai_phieu === LoaiPhieu.NhapKho
          ? body.thu_kho_id
          : body.kcs_nhan_id,

      ngay_tao: new Date(),
      ngay_cap_nhat: new Date(),
      theoDonHang: body.theoDonHang,
    };
    const phieuNghiepVu = await phieuNghiepVuModel.create(bodyPhieuNghiepVu);

    await baoCaoSanLuongModel.updateMany(
      { _id: { $in: body.bcsl_ids } },
      {
        $set: {
          trang_thai: BaoCaoState.RESERVED,
          ngay_cap_nhat: new Date(),
          do_day_cua: body.do_day_cua,
          theoDonHang: body.theoDonHang,
        },
      },
    );

    const phieuNghiepVuUpdated = await phieuNghiepVuModel
      .findById(phieuNghiepVu._id)
      .populate('bcsl_ids');
    return phieuNghiepVuUpdated;
  }

  async approveChuyenTiepBaoCaoSanLuongByYCSX(
    id: string,
    congDoanId: string,
    body: ApproveChuyenTiepBaoCaoSanLuongByYCSXDto,
  ): Promise<PhieuNghiepVuDocument[]> {
    const ycsx = await this.findById(id);
    if (!ycsx) {
      throw new NotFoundException('Yêu cầu sản xuất không tồn tại');
    }

    const phanCongModel = this.ycsxModel.db.model(PhanCong.name);
    const phanCong = await phanCongModel.findById(congDoanId);
    if (!phanCong) {
      throw new NotFoundException('Phân công không tồn tại');
    }

    const phieuNghiepVuModel = this.ycsxModel.db.model(PhieuNghiepVu.name);
    const phieuNghiepVu = await phieuNghiepVuModel.find({
      _id: { $in: body.pnv_ids },
    });
    if (phieuNghiepVu.length !== body.pnv_ids.length) {
      throw new NotFoundException('Một số phiếu nghiệp vụ không tồn tại');
    }

    const bcslIds = phieuNghiepVu.map((pnv) => pnv.bcsl_ids).flat();
    const baoCaoSanLuongModel = this.ycsxModel.db.model(BaoCaoSanLuong.name);
    await baoCaoSanLuongModel.updateMany(
      { _id: { $in: bcslIds } },
      {
        $set: {
          trang_thai: BaoCaoState.FORWARDED,
          ngay_cap_nhat: new Date(),
        },
      },
    );

    await phieuNghiepVuModel.updateMany(
      { _id: { $in: body.pnv_ids } },
      {
        $set: {
          trang_thai: TrangThai.COMPLETED,
          ngay_cap_nhat: new Date(),
        },
      },
    );

    const phieuNghiepVuUpdated = await phieuNghiepVuModel
      .find({
        _id: { $in: body.pnv_ids },
      })
      .populate('bcsl_ids');

    return phieuNghiepVuUpdated;
  }
}
