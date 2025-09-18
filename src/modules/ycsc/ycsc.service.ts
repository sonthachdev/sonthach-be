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
  HangMuc,
  PhanCong,
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
import { ObjectId } from 'mongodb';

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
      maPhieu: createDto.maPhieu,
    });
    if (existingYCSC) {
      throw new BadRequestException('Mã phiếu đã tồn tại');
    }

    if (!createDto.blockIds || createDto.blockIds.length === 0) {
      throw new BadRequestException(
        'Danh sách ID block đá không được để trống',
      );
    }

    const BaoCaoSanLuongModel = this.ycscModel.db.model(BaoCaoSanLuong.name);
    const baoCaoSanLuongs = await BaoCaoSanLuongModel.find({
      _id: { $in: createDto.blockIds },
    });
    if (baoCaoSanLuongs.length !== createDto.blockIds.length) {
      throw new NotFoundException('Không tìm thấy báo cáo sản lượng nào');
    }

    // Tạo yêu cầu mới với trạng thái chờ duyệt
    const newYCSC = new this.ycscModel({
      ...createDto,
      nguoiTao: createDto.nguoiTaoId,
      nguoiDuyet: createDto.nguoiDuyetId,
      trangThai: TrangThai.NEW,
      ngayTao: new Date(),
      ngayCapNhat: new Date(),
    });

    const ycsc = await newYCSC.save();
    const ycscId = ycsc._id;

    const pnvModel = this.ycscModel.db.model(PhieuNghiepVu.name);
    await pnvModel.create({
      ycscId: ycscId,
      maPhieu: `XuatKho-${(ycscId as any).toString()}-${new Date().getTime()}`,
      loaiPhieu: LoaiPhieu.XuatKho,
      trangThai: TrangThai.NEW,
      ngayTao: new Date(),
      ngayCapNhat: new Date(),
      bcsl: createDto.blockIds,
      nguoiTao: createDto.nguoiTaoId,
      nguoiDuyet: createDto.nguoiDuyetId,
      kho: Kho.KHO_BLOCK,
    });

    await BaoCaoSanLuongModel.updateMany(
      {
        _id: { $in: createDto.blockIds },
      },
      {
        $set: {
          ycscId: ycscId,
          trangThai: BaoCaoState.RESERVED,
          ngayCapNhat: new Date(),
        },
      },
    );

    const phanCongModel = this.ycscModel.db.model(PhanCong.name);
    const phanCongCreate = await phanCongModel.create({
      kcs: createDto.kcsId,
      tnsx: createDto.tnsxId,
      congDoan: CongDoan.BO,
      ycscId: ycscId,
      ngayTao: new Date(),
      ngayCapNhat: new Date(),
    });

    const ycscUpdated = await this.update((ycscId as any).toString(), {
      phanCong: [phanCongCreate._id],
      ngayCapNhat: new Date(),
    });

    return ycscUpdated;
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
    if (ycsc.trangThai !== TrangThai.NEW) {
      throw new BadRequestException('Yêu cầu không ở trạng thái mới tạo');
    }

    // Cập nhật thông tin duyệt
    const updateData: any = {
      trangThai: approveDto.trangThai,
      ngayDuyet: new Date(),
      ngayCapNhat: new Date(),
    };

    return await this.update(ycscId, updateData);
  }

  async batchApproveYCSC(
    approveDto: BatchApproveYCSCDto,
  ): Promise<{ modifiedCount: number }> {
    const ycscs = await this.ycscModel.find({
      _id: { $in: approveDto.ycscIds },
    });
    if (ycscs.length !== approveDto.ycscIds.length) {
      throw new NotFoundException('Một số yêu cầu sơ chế không tồn tại');
    }

    const updateData: any = {
      trangThai: TrangThai.PROCESSING,
      ngayDuyet: new Date(),
      ngayCapNhat: new Date(),
      // nguoi_duyet_id: approveDto.nguoi_duyet_id,
    };

    const result = await this.updateMany(
      { _id: { $in: approveDto.ycscIds } },
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
    if (ycsc.trangThai !== TrangThai.PROCESSING) {
      throw new BadRequestException(
        'Yêu cầu phải được xử lý trước khi hoàn thành',
      );
    }

    // Cập nhật thông tin hoàn thành
    const updateData: any = {
      trangThai: TrangThai.COMPLETED,
      ngayHoanThanh: new Date(),
      ngayCapNhat: new Date(),
      nguoiHoanThanhId: completeDto.nguoiHoanThanhId,
    };

    return await this.update(ycscId, updateData);
  }

  /**
   * Lấy danh sách yêu cầu sơ chế chờ duyệt
   */
  async findPendingApproval(): Promise<YCSCDocument[]> {
    return await this.ycscModel
      .find({
        trangThai: TrangThai.REVIEWED,
      })
      .populate('nguoiTao', 'ten vai_tro')
      .populate('nguoiDuyet', 'ten vai_tro');
  }

  /**
   * Lấy danh sách yêu cầu sơ chế đã duyệt
   */
  async findApproved(): Promise<YCSCDocument[]> {
    return await this.ycscModel
      .find({
        trangThai: TrangThai.APPROVED,
      })
      .populate('nguoiTao', 'ten vai_tro')
      .populate('nguoiDuyet', 'ten vai_tro');
  }

  /**
   * Lấy danh sách yêu cầu sơ chế đã hoàn thành
   */
  async findCompleted(): Promise<YCSCDocument[]> {
    return await this.ycscModel
      .find({
        trangThai: TrangThai.COMPLETED,
      })
      .populate('nguoiTao', 'ten vai_tro')
      .populate('nguoiDuyet', 'ten vai_tro');
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
        trangThai: TrangThai.REVIEWED,
      }),
      this.ycscModel.countDocuments({
        trangThai: TrangThai.APPROVED,
      }),
      this.ycscModel.countDocuments({
        trangThai: TrangThai.COMPLETED,
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
      baoCaoSanLuongIds: baoCaoIds,
      ngayCapNhat: new Date(),
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
      phieuXuatKhoIds: phieuIds,
      ngayCapNhat: new Date(),
    });
  }

  async filterYCSC(filter: FilterYCSCDto): Promise<any[]> {
    const filterQuery: FilterQuery<YCSCDocument> = {};
    if (filter.trangThai) {
      filterQuery.trangThai = filter.trangThai;
    }
    const result = await this.ycscModel
      .find(filterQuery)
      .populate('nguoiTao', 'ten vai_tro')
      .populate('nguoiDuyet', 'ten vai_tro')
      .populate({
        path: 'phanCong',
        select: 'kcs tnsx congDoan',
        populate: [
          { path: 'kcs', select: 'ten vai_tro' },
          { path: 'tnsx', select: 'ten vai_tro' },
        ],
      })
      .lean();

    const ycscIds = result.map((item) => item._id);

    const pnvModel = this.ycscModel.db.model(PhieuNghiepVu.name);
    const phieuXuatKhos = await pnvModel.find({
      ycscId: { $in: ycscIds },
      loaiPhieu: LoaiPhieu.XuatKho,
      kho: Kho.KHO_BLOCK,
    });

    let bcsl: string[] = [];
    bcsl = [
      ...bcsl,
      ...phieuXuatKhos.map((item) => item.bcsl.map((id) => id.toString())),
    ].flat();

    const baoCaoSanLuongModel = this.ycscModel.db.model(BaoCaoSanLuong.name);
    const baoCaoSanLuongs = await baoCaoSanLuongModel.find({
      _id: { $in: bcsl.map((id) => new Types.ObjectId(id)) },
    });

    const res: any[] = [];
    for (const item of result) {
      console.log('item', (item as any)._id.toString());
      const phieuNghiepVus = phieuXuatKhos.filter(
        (phieu) => String(phieu.ycscId) === String((item as any)._id),
      );

      const phieuNVs: any[] = [];
      for (const phieu of phieuNghiepVus) {
        const baoCaoSanLuongIds = phieu.bcsl.map((id) => id.toString());
        const baoCaoSanLuong = baoCaoSanLuongs.filter((baoCao) =>
          baoCaoSanLuongIds.includes(baoCao._id.toString()),
        );
        const plainPhieuNV = phieu.toObject ? phieu.toObject() : phieu;
        phieuNVs.push({ ...plainPhieuNV, baoCaoSanLuong: baoCaoSanLuong });
      }
      const plain = (item as any).toObject ? (item as any).toObject() : item;
      res.push({ ...plain, phieuNghiepVu: phieuNVs });
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
      ycscId: ycsc._id,
      maPhieu: `XuatKho-${(ycsc._id as any).toString()}-${new Date().getTime()}`,
      loaiPhieu: LoaiPhieu.XuatKho,
      trangThai: TrangThai.NEW,
      ngayTao: new Date(),
      ngayCapNhat: new Date(),
      bcsl: addBaoCaoSanLuongDto.baoCaoSanLuongIds,
      nguoiTao: ycsc.nguoiTao,
      nguoiDuyet: ycsc.nguoiDuyet,
      kho: Kho.KHO_BLOCK,
    });

    const ycscUpdated = await this.update(id, {
      ngayCapNhat: new Date(),
    });

    const baoCaoSanLuongModel = this.ycscModel.db.model(BaoCaoSanLuong.name);
    await baoCaoSanLuongModel.updateMany(
      { _id: { $in: addBaoCaoSanLuongDto.baoCaoSanLuongIds } },
      {
        $set: {
          trangThai: BaoCaoState.RESERVED,
          completedCongDoan: CongDoan.BO,
          ngayCapNhat: new Date(),
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
      _id: baoCaoSanLuongDto.parentId,
    });
    if (!parent) {
      throw new NotFoundException('Báo cáo sản lượng cha không tồn tại');
    }
    const baoCaoSanLuong = await baoCaoSanLuongModel.create({
      ...baoCaoSanLuongDto,
      quyCach: baoCaoSanLuongDto.quyCach,
      parentId: parent[0]._id,
      trangThai: BaoCaoState.NEW,
      ycscId: ycsc._id,
      ngayTao: new Date(),
      completedCongDoan: CongDoan.BO,
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
      ycscId: ycscId,
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
      _id: { $in: approveDto.baoCaoSanLuongIds },
      ycscId: ycsc._id,
    });
    if (baoCaoSanLuong.length !== approveDto.baoCaoSanLuongIds.length) {
      throw new NotFoundException('Một số báo cáo sản lượng không tồn tại');
    }
    await baoCaoSanLuongModel.updateMany(
      { _id: { $in: approveDto.baoCaoSanLuongIds } },
      {
        $set: {
          trangThai: approveDto.trangThai,
          ngayDuyet: new Date(),
          ngayCapNhat: new Date(),
          reason: approveDto.reason,
          nguoiDuyet: approveDto.nguoiDuyetId,
        },
      },
    );
    const baoCaoSanLuongUpdated = await baoCaoSanLuongModel.find({
      _id: { $in: approveDto.baoCaoSanLuongIds },
      ycscId: ycsc._id,
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
      _id: { $in: nhapKhoDto.baoCaoSanLuongIds },
      ycscId: ycsc._id,
    });
    if (baoCaoSanLuong.length !== nhapKhoDto.baoCaoSanLuongIds.length) {
      throw new NotFoundException('Một số báo cáo sản lượng không tồn tại');
    }

    const phieuNghiepVuModel = this.ycscModel.db.model(PhieuNghiepVu.name);
    const phieuNghiepVu = await phieuNghiepVuModel.create({
      maPhieu: nhapKhoDto.maPhieu,
      loaiPhieu: LoaiPhieu.NhapKho,
      ycscId: ycsc._id,
      nguoiTao: nhapKhoDto.nguoiTaoId,
      nguoiDuyet: nhapKhoDto.thuKhoId,
      kho: Kho.KHO_PHOI,
      trangThai: TrangThai.NEW,
      currentCongDoan: CongDoan.SC,
      bcsl: nhapKhoDto.baoCaoSanLuongIds,
      ngayTao: new Date(),
      ngayCapNhat: new Date(),
    });

    await baoCaoSanLuongModel.updateMany(
      { _id: { $in: nhapKhoDto.baoCaoSanLuongIds } },
      {
        $set: {
          trangThai: BaoCaoState.RESERVED,
          ngayCapNhat: new Date(),
          // completed_cong_doan: CongDoan.SC,
        },
      },
    );

    return phieuNghiepVu;
  }

  async getDetailYCSC(id: string): Promise<{
    ycsc: YCSCDocument;
    phieuNghiepVu: PhieuNghiepVuDocument[];
    baoCaoSanLuong: BaoCaoSanLuongDocument[];
  }> {
    const ycsc = await this.ycscModel.findById(id).populate([
      {
        path: 'nguoiTao',
        select: '_id ten vaiTro',
      },
      {
        path: 'nguoiDuyet',
        select: '_id ten vaiTro',
      },
      {
        path: 'phanCong',
        select: '_id kcs tnsx congDoan',
        populate: [
          {
            path: 'kcs',
            select: '_id ten vaiTro',
          },
          {
            path: 'tnsx',
            select: '_id ten vaiTro',
          },
        ],
      },
    ]);

    if (!ycsc) {
      throw new NotFoundException('Yêu cầu sơ chế không tồn tại');
    }

    const phieuNghiepVuModel = this.ycscModel.db.model(PhieuNghiepVu.name);
    const phieuNghiepVu = await phieuNghiepVuModel
      .find({
        ycscId: ycsc._id,
      })
      .populate([
        {
          path: 'nguoiTao',
          select: '_id ten vaiTro',
        },
        {
          path: 'nguoiDuyet',
          select: '_id ten vaiTro',
        },
        {
          path: 'bcsl',
          select:
            '_id maPhieu loaiPhieu kho trangThai viTri maDa mauDa ngayTao ngayCapNhat quyCach',
        },
      ]);

    const baoCaoSanLuongModel = this.ycscModel.db.model(BaoCaoSanLuong.name);
    const baoCaoSanLuong = await baoCaoSanLuongModel.find({
      ycscId: ycsc._id,
    });

    const ycscWithPhieuNghiepVu = {
      ycsc: ycsc.toObject(),
      phieuNghiepVu: phieuNghiepVu,
      baoCaoSanLuong: baoCaoSanLuong,
    };

    return ycscWithPhieuNghiepVu;
  }
}
