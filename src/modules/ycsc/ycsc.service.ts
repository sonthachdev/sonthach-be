/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery, Types } from 'mongoose';
import { BaseService } from '../../common/base';
import {
  BaoCaoSanLuong,
  PhieuNghiepVu,
  YCSC,
  YCSCDocument,
  BaoCaoSanLuongDocument,
  PhieuNghiepVuDocument,
} from '../../schemas';
import { BaoCaoState, TrangThai, CongDoan, LoaiPhieu, Kho } from '../../utils';
import {
  CreateYCSCDto,
  ApproveYCSCDto,
  CompleteYCSCDto,
  BatchApproveYCSCDto,
  FilterYCSCDto,
  AddBaoCaoSanLuongDto,
  BaoCaoSanLuongDto,
  ApproveBaoCaoSanLuongByYCSCDto,
  NhapKhoBaoCaoSanLuongDto,
} from './dto/ycsc.dto';

@Injectable()
export class YCSCService extends BaseService<YCSCDocument> {
  constructor(
    @InjectModel(YCSC.name)
    private readonly ycscModel: Model<YCSCDocument>,

    // @InjectModel(PhieuNghiepVu.name)
    // private readonly phieuNghiepVuModel: Model<PhieuNghiepVuDocument>,

    // @InjectModel(BaoCaoSanLuong.name)
    // private readonly baoCaoSanLuongModel: Model<BaoCaoSanLuongDocument>,
  ) {
    super(ycscModel);
  }
  async findByTrangThai(trangThai: string): Promise<YCSCDocument[]> {
    const result = await this.findAll({ trangThai });
    return result.data;
  }

  async findByNhanVien(nhanVienId: string): Promise<YCSCDocument[]> {
    const result = await this.findAll({ nhanVienId });
    return result.data;
  }

  async findByLoaiYeuCau(loaiYeuCau: string): Promise<YCSCDocument[]> {
    const result = await this.findAll({ loaiYeuCau });
    return result.data;
  }

  async findByMucDoUuTien(mucDoUuTien: string): Promise<YCSCDocument[]> {
    const result = await this.findAll({ mucDoUuTien });
    return result.data;
  }

  async findByNgayTao(ngayTao: Date): Promise<YCSCDocument[]> {
    const result = await this.findAll({ ngayTao });
    return result.data;
  }

  async findChoXuLy(): Promise<YCSCDocument[]> {
    const result = await this.findAll({ trangThai: 'cho-xu-ly' });
    return result.data;
  }

  async updateTrangThai(id: string, trangThai: string): Promise<YCSCDocument> {
    return this.update(id, { trangThai });
  }

  /**
   * Tạo yêu cầu sơ chế mới
   */
  async createYCSC(createDto: CreateYCSCDto): Promise<YCSCDocument> {
    // Kiểm tra mã phiếu đã tồn tại
    const existingYCSC = await this.ycscModel.findOne({
      ma_phieu: createDto.ma_phieu,
    });
    if (existingYCSC) {
      throw new BadRequestException('Mã phiếu đã tồn tại');
    }

    if (!createDto.block_ids || createDto.block_ids.length === 0) {
      throw new BadRequestException(
        'Danh sách ID block đá không được để trống',
      );
    }

    const BaoCaoSanLuongModel = this.ycscModel.db.model(BaoCaoSanLuong.name);
    const baoCaoSanLuongs = await BaoCaoSanLuongModel.find({
      _id: { $in: createDto.block_ids },
    });
    if (baoCaoSanLuongs.length !== createDto.block_ids.length) {
      throw new NotFoundException('Không tìm thấy báo cáo sản lượng nào');
    }

    // Tạo yêu cầu mới với trạng thái chờ duyệt
    const newYCSC = new this.ycscModel({
      ...createDto,
      trang_thai: TrangThai.NEW,
      ngay_tao: new Date(),
      ngay_cap_nhat: new Date(),
    });

    const ycsc = await newYCSC.save();
    const ycscId = ycsc._id;

    const pnvModel = this.ycscModel.db.model(PhieuNghiepVu.name);
    await pnvModel.create({
      ycsc_id: ycscId,
      ma_phieu: `XuatKho-${(ycscId as any).toString()}-${new Date().getTime()}`,
      loai_phieu: LoaiPhieu.XuatKho,
      trang_thai: TrangThai.NEW,
      ngay_tao: new Date(),
      ngay_cap_nhat: new Date(),
      bcsl_ids: createDto.block_ids,
      nguoi_tao_id: createDto.nguoi_tao_id,
      nguoi_duyet_id: createDto.nguoi_duyet_id,
      kho: Kho.KHO_BLOCK,
    });

    await BaoCaoSanLuongModel.updateMany(
      {
        _id: { $in: createDto.block_ids },
      },
      {
        $set: {
          // ycsc_id: ycscId,
          trang_thai: BaoCaoState.RESERVED,
          ngay_cap_nhat: new Date(),
        },
      },
    );

    return ycsc;
  }

  /**
   * Duyệt yêu cầu sơ chế
   */
  async approveYCSC(
    ycscId: string,
    approveDto: ApproveYCSCDto,
  ): Promise<YCSCDocument> {
    const ycsc = await this.ycscModel.findById(ycscId);
    if (!ycsc) {
      throw new NotFoundException('Yêu cầu sơ chế không tồn tại');
    }

    // Kiểm tra trạng thái hiện tại phải là chờ duyệt
    if (ycsc.trang_thai !== TrangThai.NEW) {
      throw new BadRequestException('Yêu cầu không ở trạng thái mới tạo');
    }

    // Cập nhật thông tin duyệt
    const updateData: any = {
      trang_thai: approveDto.trang_thai,
      ngay_duyet: new Date(),
      ngay_cap_nhat: new Date(),
    };

    return await this.update(ycscId, updateData);
  }

  async batchApproveYCSC(
    approveDto: BatchApproveYCSCDto,
  ): Promise<{ modifiedCount: number }> {
    const ycscs = await this.ycscModel.find({
      _id: { $in: approveDto.ycsc_ids },
    });
    if (ycscs.length !== approveDto.ycsc_ids.length) {
      throw new NotFoundException('Một số yêu cầu sơ chế không tồn tại');
    }

    const updateData: any = {
      trang_thai: TrangThai.PROCESSING,
      ngay_duyet: new Date(),
      ngay_cap_nhat: new Date(),
      // nguoi_duyet_id: approveDto.nguoi_duyet_id,
    };

    const result = await this.updateMany(
      { _id: { $in: approveDto.ycsc_ids } },
      updateData,
    );

    return { modifiedCount: result.modifiedCount };
  }

  /**
   * Hoàn thành yêu cầu sơ chế
   */
  async completeYCSC(
    ycscId: string,
    completeDto: CompleteYCSCDto,
  ): Promise<YCSCDocument> {
    const ycsc = await this.ycscModel.findById(ycscId);
    if (!ycsc) {
      throw new NotFoundException('Yêu cầu sơ chế không tồn tại');
    }

    // Kiểm tra trạng thái phải là đã duyệt
    if (ycsc.trang_thai !== TrangThai.PROCESSING) {
      throw new BadRequestException(
        'Yêu cầu phải được xử lý trước khi hoàn thành',
      );
    }

    // Cập nhật thông tin hoàn thành
    const updateData: any = {
      trang_thai: TrangThai.COMPLETED,
      ngay_hoan_thanh: new Date(),
      ngay_cap_nhat: new Date(),
      nguoi_hoan_thanh_id: completeDto.nguoi_hoan_thanh_id,
    };

    return await this.update(ycscId, updateData);
  }

  /**
   * Lấy danh sách yêu cầu sơ chế chờ duyệt
   */
  async findPendingApproval(): Promise<YCSCDocument[]> {
    return await this.ycscModel
      .find({
        trang_thai: TrangThai.REVIEWED,
      })
      .populate('nguoi_tao_id', 'ten vai_tro')
      .populate('nguoi_duyet_id', 'ten vai_tro');
  }

  /**
   * Lấy danh sách yêu cầu sơ chế đã duyệt
   */
  async findApproved(): Promise<YCSCDocument[]> {
    return await this.ycscModel
      .find({
        trang_thai: TrangThai.APPROVED,
      })
      .populate('nguoi_tao_id', 'ten vai_tro')
      .populate('nguoi_duyet_id', 'ten vai_tro');
  }

  /**
   * Lấy danh sách yêu cầu sơ chế đã hoàn thành
   */
  async findCompleted(): Promise<YCSCDocument[]> {
    return await this.ycscModel
      .find({
        trang_thai: TrangThai.COMPLETED,
      })
      .populate('nguoi_tao_id', 'ten vai_tro')
      .populate('nguoi_duyet_id', 'ten vai_tro');
  }

  /**
   * Lấy thống kê yêu cầu sơ chế theo trạng thái
   */
  async getYCSCStats(): Promise<{
    pending: number;
    approved: number;
    completed: number;
    total: number;
  }> {
    const [pending, approved, completed, total] = await Promise.all([
      this.ycscModel.countDocuments({
        trang_thai: TrangThai.REVIEWED,
      }),
      this.ycscModel.countDocuments({
        trang_thai: TrangThai.APPROVED,
      }),
      this.ycscModel.countDocuments({
        trang_thai: TrangThai.COMPLETED,
      }),
      this.ycscModel.countDocuments({}),
    ]);

    return { pending, approved, completed, total };
  }

  /**
   * Cập nhật danh sách báo cáo sản lượng liên quan
   */
  async updateBaoCaoSanLuongIds(
    ycscId: string,
    baoCaoIds: string[],
  ): Promise<YCSCDocument> {
    return await this.update(ycscId, {
      bao_cao_san_luong_ids: baoCaoIds,
      ngay_cap_nhat: new Date(),
    });
  }

  /**
   * Cập nhật danh sách phiếu xuất kho liên quan
   */
  async updatePhieuXuatKhoIds(
    ycscId: string,
    phieuIds: string[],
  ): Promise<YCSCDocument> {
    return await this.update(ycscId, {
      phieu_xuat_kho_ids: phieuIds,
      ngay_cap_nhat: new Date(),
    });
  }

  async filterYCSC(filter: FilterYCSCDto): Promise<any[]> {
    const filterQuery: FilterQuery<YCSCDocument> = {};
    if (filter.trang_thai) {
      filterQuery.trang_thai = filter.trang_thai;
    }
    const result = await this.ycscModel
      .find(filterQuery)
      .populate('nguoi_tao_id', 'ten vai_tro')
      .populate('nguoi_duyet_id', 'ten vai_tro')
      .populate('kcs_id', 'ten vai_tro')
      .populate('tnsx_id', 'ten vai_tro')
      .lean();

    const ycscIds = result.map((item) => item._id);

    const pnvModel = this.ycscModel.db.model(PhieuNghiepVu.name);
    const phieuXuatKhos = await pnvModel.find({
      ycsc_id: { $in: ycscIds },
      loai_phieu: LoaiPhieu.XuatKho,
      kho: Kho.KHO_BLOCK,
    });

    let bcslIds: string[] = [];
    bcslIds = [
      ...bcslIds,
      ...phieuXuatKhos.map((item) => item.bcsl_ids.map((id) => id.toString())),
    ].flat();

    const baoCaoSanLuongModel = this.ycscModel.db.model(BaoCaoSanLuong.name);
    const baoCaoSanLuongs = await baoCaoSanLuongModel.find({
      _id: { $in: bcslIds.map((id) => new Types.ObjectId(id)) },
    });

    const res: any[] = [];
    for (const item of result) {
      console.log('item', (item as any)._id.toString());
      const phieuNghiepVus = phieuXuatKhos.filter(
        (phieu) => String(phieu.ycsc_id) === String((item as any)._id),
      );

      const phieuNVs: any[] = [];
      for (const phieu of phieuNghiepVus) {
        const baoCaoSanLuongIds = phieu.bcsl_ids.map((id) => id.toString());
        const baoCaoSanLuong = baoCaoSanLuongs.filter((baoCao) =>
          baoCaoSanLuongIds.includes(baoCao._id.toString()),
        );
        const plainPhieuNV = phieu.toObject ? phieu.toObject() : phieu;
        phieuNVs.push({ ...plainPhieuNV, bao_cao_san_luong: baoCaoSanLuong });
      }
      const plain = (item as any).toObject ? (item as any).toObject() : item;
      res.push({ ...plain, phieu_nghiep_vu: phieuNVs });
    }
    return res;
  }

  async addBaoCaoSanLuong(
    id: string,
    addBaoCaoSanLuongDto: AddBaoCaoSanLuongDto,
  ): Promise<YCSCDocument> {
    const ycsc = await this.ycscModel.findById(id);
    if (!ycsc) {
      throw new NotFoundException('Yêu cầu sơ chế không tồn tại');
    }

    const pnvModel = this.ycscModel.db.model(PhieuNghiepVu.name);
    await pnvModel.create({
      ycsc_id: ycsc._id,
      ma_phieu: `XuatKho-${(ycsc._id as any).toString()}-${new Date().getTime()}`,
      loai_phieu: LoaiPhieu.XuatKho,
      trang_thai: TrangThai.NEW,
      ngay_tao: new Date(),
      ngay_cap_nhat: new Date(),
      bcsl_ids: addBaoCaoSanLuongDto.bao_cao_san_luong_ids,
      nguoi_tao_id: ycsc.nguoi_tao_id,
      nguoi_duyet_id: ycsc.nguoi_duyet_id,
      kho: Kho.KHO_BLOCK,
    });

    const ycscUpdated = await this.update(id, {
      ngay_cap_nhat: new Date(),
    });

    const baoCaoSanLuongModel = this.ycscModel.db.model(BaoCaoSanLuong.name);
    await baoCaoSanLuongModel.updateMany(
      { _id: { $in: addBaoCaoSanLuongDto.bao_cao_san_luong_ids } },
      {
        $set: {
          trang_thai: BaoCaoState.RESERVED,
          completed_cong_doan: CongDoan.BO,
          ngay_cap_nhat: new Date(),
        },
      },
    );

    return ycscUpdated;
  }

  async addBaoCaoSanLuongByDto(
    id: string,
    baoCaoSanLuongDto: BaoCaoSanLuongDto,
  ): Promise<BaoCaoSanLuongDocument> {
    const ycsc = await this.ycscModel.findById(id);
    if (!ycsc) {
      throw new NotFoundException('Yêu cầu sơ chế không tồn tại');
    }

    const baoCaoSanLuongModel = this.ycscModel.db.model(BaoCaoSanLuong.name);
    const parent = await baoCaoSanLuongModel.find({
      _id: baoCaoSanLuongDto.parent_id,
    });
    if (!parent) {
      throw new NotFoundException('Báo cáo sản lượng cha không tồn tại');
    }
    const baoCaoSanLuong = await baoCaoSanLuongModel.create({
      ...baoCaoSanLuongDto,
      quy_cach: baoCaoSanLuongDto.quy_cach,
      parent_id: parent[0]._id,
      trang_thai: BaoCaoState.NEW,
      ycsc_id: ycsc._id,
      ngay_tao: new Date(),
      completed_cong_doan: CongDoan.BO,
    });

    return baoCaoSanLuong;
  }

  async getBaoCaoSanLuong(ycscId: string): Promise<BaoCaoSanLuongDocument[]> {
    const ycsc = await this.ycscModel.findById(ycscId);
    if (!ycsc) {
      throw new NotFoundException('Yêu cầu sơ chế không tồn tại');
    }

    const baoCaoSanLuongModel = this.ycscModel.db.model(BaoCaoSanLuong.name);
    const baoCaoSanLuong = await baoCaoSanLuongModel.find({
      ycsc_id: ycscId,
    });
    return baoCaoSanLuong;
  }

  async approveBaoCaoSanLuong(
    id: string,
    approveDto: ApproveBaoCaoSanLuongByYCSCDto,
  ): Promise<BaoCaoSanLuongDocument[]> {
    const ycsc = await this.ycscModel.findById(id);
    if (!ycsc) {
      throw new NotFoundException('Yêu cầu sơ chế không tồn tại');
    }

    const baoCaoSanLuongModel = this.ycscModel.db.model(BaoCaoSanLuong.name);
    const baoCaoSanLuong = await baoCaoSanLuongModel.find({
      _id: { $in: approveDto.bao_cao_san_luong_ids },
      ycsc_id: ycsc._id,
    });
    if (baoCaoSanLuong.length !== approveDto.bao_cao_san_luong_ids.length) {
      throw new NotFoundException('Một số báo cáo sản lượng không tồn tại');
    }
    await baoCaoSanLuongModel.updateMany(
      { _id: { $in: approveDto.bao_cao_san_luong_ids } },
      {
        $set: {
          trang_thai: approveDto.trang_thai,
          ngay_duyet: new Date(),
          ngay_cap_nhat: new Date(),
          reason: approveDto.reason,
          nguoi_duyet_id: approveDto.nguoi_duyet_id,
        },
      },
    );
    const baoCaoSanLuongUpdated = await baoCaoSanLuongModel.find({
      _id: { $in: approveDto.bao_cao_san_luong_ids },
      ycsc_id: ycsc._id,
    });

    return baoCaoSanLuongUpdated;
  }

  async nhapKhoBaoCaoSanLuong(
    id: string,
    nhapKhoDto: NhapKhoBaoCaoSanLuongDto,
  ): Promise<PhieuNghiepVuDocument> {
    const ycsc = await this.ycscModel.findById(id);
    if (!ycsc) {
      throw new NotFoundException('Yêu cầu sơ chế không tồn tại');
    }

    const baoCaoSanLuongModel = this.ycscModel.db.model(BaoCaoSanLuong.name);
    const baoCaoSanLuong = await baoCaoSanLuongModel.find({
      _id: { $in: nhapKhoDto.bao_cao_san_luong_ids },
      ycsc_id: ycsc._id,
    });
    if (baoCaoSanLuong.length !== nhapKhoDto.bao_cao_san_luong_ids.length) {
      throw new NotFoundException('Một số báo cáo sản lượng không tồn tại');
    }

    const phieuNghiepVuModel = this.ycscModel.db.model(PhieuNghiepVu.name);
    const phieuNghiepVu = await phieuNghiepVuModel.create({
      ma_phieu: nhapKhoDto.ma_phieu,
      loai_phieu: LoaiPhieu.NhapKho,
      ycsc_id: ycsc._id,
      nguoi_tao_id: nhapKhoDto.nguoi_tao_id,
      nguoi_duyet_id: nhapKhoDto.thu_kho_id,
      kho: Kho.KHO_PHOI,
      trang_thai: TrangThai.NEW,
      current_cong_doan: CongDoan.SC,
      bcsl_ids: nhapKhoDto.bao_cao_san_luong_ids,
      ngay_tao: new Date(),
      ngay_cap_nhat: new Date(),
    });

    await baoCaoSanLuongModel.updateMany(
      { _id: { $in: nhapKhoDto.bao_cao_san_luong_ids } },
      {
        $set: {
          trang_thai: BaoCaoState.RESERVED,
          ngay_cap_nhat: new Date(),
          // completed_cong_doan: CongDoan.SC,
        },
      },
    );

    return phieuNghiepVu;
  }

  async getDetailYCSC(id: string): Promise<{
    ycsc: YCSCDocument;
    phieu_nghiep_vu: PhieuNghiepVuDocument[];
    bao_cao_san_luong: BaoCaoSanLuongDocument[];
  }> {
    const ycsc = await this.ycscModel.findById(id).populate([
      {
        path: 'nguoi_tao_id',
        select: '_id ten vai_tro',
      },
      {
        path: 'nguoi_duyet_id',
        select: '_id ten vai_tro',
      },
      {
        path: 'kcs_id',
        select: '_id ten vai_tro',
      },
      {
        path: 'tnsx_id',
        select: '_id ten vai_tro',
      },
    ]);

    if (!ycsc) {
      throw new NotFoundException('Yêu cầu sơ chế không tồn tại');
    }

    const phieuNghiepVuModel = this.ycscModel.db.model(PhieuNghiepVu.name);
    const phieuNghiepVu = await phieuNghiepVuModel
      .find({
        ycsc_id: ycsc._id,
      })
      .populate([
        {
          path: 'nguoi_tao_id',
          select: '_id ten vai_tro',
        },
        {
          path: 'nguoi_duyet_id',
          select: '_id ten vai_tro',
        },
        {
          path: 'bcsl_ids',
          select:
            '_id ma_phieu loai_phieu kho trang_thai ngay_tao ngay_cap_nhat',
        },
      ]);

    const baoCaoSanLuongModel = this.ycscModel.db.model(BaoCaoSanLuong.name);
    const baoCaoSanLuong = await baoCaoSanLuongModel.find({
      ycsc_id: ycsc._id,
    });

    const ycscWithPhieuNghiepVu = {
      ycsc: ycsc.toObject(),
      phieu_nghiep_vu: phieuNghiepVu,
      bao_cao_san_luong: baoCaoSanLuong,
    };

    return ycscWithPhieuNghiepVu;
  }
}
