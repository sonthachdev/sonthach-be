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
      maPhieu: createDto.maPhieu,
    });
    if (existingYCSX) {
      throw new BadRequestException('Mã phiếu đã tồn tại');
    }
    const newYCSX = new this.ycsxModel({
      ...createDto,
      trangThai: TrangThai.NEW,
      ngayTao: new Date(),
      ngayCapNhat: new Date(),
    });
    const savedYCSX = await newYCSX.save();
    const hangMucModel = this.ycsxModel.db.model(HangMuc.name);

    const hangMucDocuments = await Promise.all(
      createDto.hangMuc.map(async (hangMuc: HangMucCreateYCSXDto) => {
        const newHangMuc = new hangMucModel({
          ...hangMuc,
          ycsxId: savedYCSX._id,
        });
        return await newHangMuc.save();
      }),
    );

    const listHangMucIds = hangMucDocuments.map((hangMuc) => hangMuc._id);

    await this.update(savedYCSX._id as string, {
      hangMuc: listHangMucIds,
    });

    const ycsx = await this.findById(savedYCSX._id as string);

    return {
      ...ycsx.toObject(),
      hangMuc: hangMucDocuments,
    };
  }

  async filterYCSX(filter: FilterYCSXDto): Promise<{
    ycsx: YCSXDocument[];
    total: number;
    totalPages: number;
  }> {
    const filterQuery: FilterQuery<YCSXDocument> = {};
    if (filter.trangThai) {
      filterQuery.trangThai = filter.trangThai;
    }
    const result = await this.findAll(filterQuery, {
      page: filter.page,
      limit: filter.limit,
      sort: filter.sort,
      populateSelect: [
        { path: 'nguoiTao', select: '_id ten vai_tro' },
        { path: 'nguoiDuyet', select: '_id ten vai_tro' },
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
          kcs_id: item.kcsId,
          tnsx_id: item.tnsxId,
          cong_doan: item.congDoan,
          ngay_tao: new Date(),
        });
        return await newPhanCong.save();
      }),
    );
    const updatedYCSX = await this.update(id, {
      ngay_cap_nhat: new Date(),
      trangThai: TrangThai.REVIEWED,
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
      trangThai: body.trangThai,
      ngay_cap_nhat: new Date(),
      ngayDuyet: new Date(),
    });
  }

  async getDetailYCSX(id: string): Promise<{
    ycsx: YCSXDocument;
    phan_cong: PhanCongDocument[];
  }> {
    const ycsxModel = this.ycsxModel.db.model(YCSX.name);
    const ycsx = await ycsxModel.findById(id).populate([
      {
        path: 'nguoiTao',
        select: '_id ten vaiTro congDoan',
      },
      {
        path: 'nguoiDuyet',
        select: '_id ten vaiTro congDoan',
      },
      {
        path: 'nguoiXuLy',
        select: '_id ten vaiTro congDoan',
      },
      {
        path: 'hangMuc',
        select: '_id mota mauDa matDa quyCach groupId ghichu',
      },
    ]);
    if (!ycsx) {
      throw new NotFoundException('Yêu cầu sản xuất không tồn tại');
    }

    const phanCongModel = this.ycsxModel.db.model(PhanCong.name);
    const phanCongs = await phanCongModel.find({ ycsxId: id }).populate([
      {
        path: 'kcs',
        select: '_id ten vaiTro congDoan',
      },
      {
        path: 'tnsx',
        select: '_id ten vaiTro congDoan',
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
          ...body.hangMuc,
          ngayCapNhat: new Date(),
        },
      },
    );

    const updatedHangMuc = await hangMucModel.findById(hangMucId);

    const listHangMucByGroupId = await hangMucModel.find({
      groupId: hangMuc.groupId,
      _id: { $ne: hangMucId },
    });

    if (listHangMucByGroupId.length > 0) {
      await hangMucModel.updateMany(
        { groupId: hangMuc.groupId },
        {
          $set: {
            ghichu: updatedHangMuc.ghichu,
            mota: updatedHangMuc.mota,
            ngayCapNhat: new Date(),
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
      body.hangMuc.map(async (hangMuc: HangMucCreateYCSXDto) => {
        const newHangMuc = new hangMucModel({
          ...hangMuc,
          ycsx: ycsx._id,
          groupId: hangMuc.groupId
            ? hangMuc.groupId
            : new ObjectId().toString(),
          ngay_tao: new Date(),
        });
        return await newHangMuc.save();
      }),
    );
    const listHangMucNewIds = hangMucs.map((hangMuc) => hangMuc._id);
    const listHangMucUpdate = [...ycsx.hangMuc, ...listHangMucNewIds];
    await this.update(id, {
      ngay_cap_nhat: new Date(),
      hangMuc: listHangMucUpdate,
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
      _id: { $in: body.bcslIds },
    });
    if (baoCaoSanLuong.length !== body.bcslIds.length) {
      throw new NotFoundException('Một số báo cáo sản lượng không tồn tại');
    }

    await baoCaoSanLuongModel.updateMany(
      { _id: { $in: body.bcslIds } },
      {
        $set: {
          trangThai: body.trangThai,
          reason: body.reason,
          ngay_cap_nhat: new Date(),
        },
      },
    );

    const baoCaoSanLuongUpdated = await baoCaoSanLuongModel.find({
      _id: { $in: body.bcslIds },
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
      _id: { $in: body.bcslIds },
    });
    if (baoCaoSanLuong.length !== body.bcslIds.length) {
      throw new NotFoundException('Một số báo cáo sản lượng không tồn tại');
    }

    const phieuNghiepVuModel = this.ycsxModel.db.model(PhieuNghiepVu.name);

    const bodyPhieuNghiepVu = {
      ycsxId: ycsx._id,
      maPhieu: body.maPhieu,
      loaiPhieu: body.loaiPhieu,
      trangThai: TrangThai.NEW,
      kho: body.khoNhan,
      currentCongDoan: phanCong.congDoan,
      nextCongDoan: body.nextCongDoan,
      bcsl: body.bcslIds,
      nguoiTao: phanCong.kcsId,
      nguoiDuyet:
        body.loaiPhieu === LoaiPhieu.NhapKho ? body.thuKhoId : body.kcsNhanId,

      ngayTao: new Date(),
      ngayCapNhat: new Date(),
      theoDonHang: body.theoDonHang,
    };
    const phieuNghiepVu = await phieuNghiepVuModel.create(bodyPhieuNghiepVu);

    await baoCaoSanLuongModel.updateMany(
      { _id: { $in: body.bcslIds } },
      {
        $set: {
          trangThai: BaoCaoState.RESERVED,
          ngayCapNhat: new Date(),
          doDayCua: body.doDayCua,
          theoDonHang: body.theoDonHang,
        },
      },
    );

    const phieuNghiepVuUpdated = await phieuNghiepVuModel
      .findById(phieuNghiepVu._id)
      .populate('bcsl');
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
      _id: { $in: body.phieuNghiepVuIds },
    });
    if (phieuNghiepVu.length !== body.phieuNghiepVuIds.length) {
      throw new NotFoundException('Một số phiếu nghiệp vụ không tồn tại');
    }

    const bcsl = phieuNghiepVu.map((pnv) => pnv.bcsl).flat();
    const baoCaoSanLuongModel = this.ycsxModel.db.model(BaoCaoSanLuong.name);
    await baoCaoSanLuongModel.updateMany(
      { _id: { $in: bcsl } },
      {
        $set: {
          trangThai: BaoCaoState.FORWARDED,
          ngayCapNhat: new Date(),
        },
      },
    );

    await phieuNghiepVuModel.updateMany(
      { _id: { $in: body.phieuNghiepVuIds } },
      {
        $set: {
          trangThai: TrangThai.COMPLETED,
          ngayCapNhat: new Date(),
        },
      },
    );

    const phieuNghiepVuUpdated = await phieuNghiepVuModel
      .find({
        _id: { $in: body.phieuNghiepVuIds },
      })
      .populate('bcsl');

    return phieuNghiepVuUpdated;
  }
}
