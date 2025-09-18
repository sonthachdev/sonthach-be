/* eslint-disable @typescript-eslint/no-unsafe-assignment */

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery, UpdateQuery } from 'mongoose';
import { BaseService } from '../../common/base';
import {
  BaoCaoSanLuongDocument,
  PhieuNghiepVu,
  PhieuNghiepVuDocument,
} from '../../schemas';
import { BaoCaoState, LoaiPhieu, TrangThai } from '../../utils';
import {
  CreateBaoCaoSanLuongDto,
  ApproveBaoCaoSanLuongDto,
  RejectBaoCaoSanLuongDto,
  ImportBaoCaoSanLuongDto,
  UpdatePalletBaoCaoSanLuongDto,
  XuatHoaDonBaoCaoSanLuongDto,
} from './dto/bao-cao-san-luong.dto';
import { FilterBaoCaoSanLuongDto } from './dto/bao-cao-san-luong.dto';

@Injectable()
export class BaoCaoSanLuongService extends BaseService<BaoCaoSanLuongDocument> {
  constructor(
    @InjectModel('BaoCaoSanLuong')
    private readonly baoCaoSanLuongModel: Model<BaoCaoSanLuongDocument>,
  ) {
    super(baoCaoSanLuongModel);
  }

  async filterBaoCaoSanLuong(
    dto: FilterBaoCaoSanLuongDto,
  ): Promise<BaoCaoSanLuongDocument[]> {
    type QuyCachFilter = Partial<
      Record<'quy_cach.dai' | 'quy_cach.rong' | 'quy_cach.day', number>
    >;
    const filter: FilterQuery<BaoCaoSanLuongDocument> & QuyCachFilter = {};

    if (dto.mauDa !== undefined) {
      filter.mauDa = dto.mauDa;
    }

    if (dto.trangThai !== undefined) {
      filter.trangThai = dto.trangThai;
    }

    if (dto.viTri !== undefined) {
      filter.viTri = dto.viTri;
    }

    if (dto.kho !== undefined) {
      filter.kho = dto.kho;
    }

    if (dto.ycscId !== undefined) {
      filter.ycscId = dto.ycscId;
    }

    if (dto.ycsxId !== undefined) {
      filter.ycsxId = dto.ycsxId;
    }

    const qcFilter: QuyCachFilter = {};
    if (dto.dai !== undefined) {
      qcFilter['quyCach.dai'] = dto.dai;
    }
    if (dto.rong !== undefined) {
      qcFilter['quyCach.rong'] = dto.rong;
    }
    if (dto.day !== undefined) {
      qcFilter['quyCach.day'] = dto.day;
    }
    Object.assign(filter, qcFilter);

    const result = await this.findAll(filter, { limit: 1000, page: 1 });
    return result.data;
  }

  async findByThangNam(
    thang: number,
    nam: number,
  ): Promise<BaoCaoSanLuongDocument[]> {
    const result = await this.findAll({ thang, nam });
    return result.data;
  }

  async findByNhanVien(nhanVienId: string): Promise<BaoCaoSanLuongDocument[]> {
    const result = await this.findAll({ nhanVienId });
    return result.data;
  }

  async findByTrangThai(trangThai: string): Promise<BaoCaoSanLuongDocument[]> {
    const result = await this.findAll({ trangThai });
    return result.data;
  }

  async findByKhoangThoiGian(
    tuNgay: Date,
    denNgay: Date,
  ): Promise<BaoCaoSanLuongDocument[]> {
    const result = await this.findAll({
      ngayTao: {
        $gte: tuNgay,
        $lte: denNgay,
      },
    });
    return result.data;
  }

  async findChoDuyet(): Promise<BaoCaoSanLuongDocument[]> {
    const result = await this.findAll({ trangThai: 'cho-duyet' });
    return result.data;
  }

  async updateTrangThai(
    id: string,
    trangThai: string,
  ): Promise<BaoCaoSanLuongDocument> {
    return this.update(id, { trangThai });
  }

  /**
   * Tạo báo cáo sản lượng mới
   */
  async createBaoCaoSanLuong(
    createDto: CreateBaoCaoSanLuongDto,
  ): Promise<BaoCaoSanLuongDocument> {
    // Tạo báo cáo mới với trạng thái chờ duyệt
    const newBaoCao = new this.baoCaoSanLuongModel({
      ...createDto,
      trangThai: BaoCaoState.NEW, // Mới tạo
      ngayTao: new Date(createDto.ngayTao),
      ngayCapNhat: new Date(),
    });

    return await newBaoCao.save();
  }

  /**
   * Duyệt báo cáo sản lượng
   */
  async approveBaoCaoSanLuong(
    baoCaoId: string,
    approveDto: ApproveBaoCaoSanLuongDto,
  ): Promise<BaoCaoSanLuongDocument> {
    const baoCao = await this.baoCaoSanLuongModel.findById(baoCaoId);
    if (!baoCao) {
      throw new NotFoundException('Báo cáo sản lượng không tồn tại');
    }

    // Kiểm tra trạng thái hiện tại phải là mới tạo
    if (baoCao.trangThai !== BaoCaoState.NEW) {
      throw new BadRequestException('Báo cáo không ở trạng thái mới tạo');
    }

    // Cập nhật thông tin duyệt
    const updateData: UpdateQuery<BaoCaoSanLuongDocument> = {
      trangThai: BaoCaoState.APPROVED,
      ngayDuyet: new Date(),
      ngayCapNhat: new Date(),
    };

    // Lưu ghi chú duyệt
    if (approveDto.ghiChu) {
      (updateData as any).ghiChuDuyet = approveDto.ghiChu;
    }

    return await this.update(baoCaoId, updateData);
  }

  /**
   * Từ chối báo cáo sản lượng
   */
  async rejectBaoCaoSanLuong(
    baoCaoId: string,
    rejectDto: RejectBaoCaoSanLuongDto,
  ): Promise<BaoCaoSanLuongDocument> {
    const baoCao = await this.baoCaoSanLuongModel.findById(baoCaoId);
    if (!baoCao) {
      throw new NotFoundException('Báo cáo sản lượng không tồn tại');
    }

    // Kiểm tra trạng thái hiện tại phải là mới tạo
    if (baoCao.trangThai !== BaoCaoState.NEW) {
      throw new BadRequestException('Báo cáo không ở trạng thái mới tạo');
    }

    // Cập nhật thông tin từ chối
    const updateData: UpdateQuery<BaoCaoSanLuongDocument> = {
      trangThai: BaoCaoState.REJECTED,
      ngayTuChoi: new Date(),
      ngayCapNhat: new Date(),
      nguoiTuChoiId: rejectDto.nguoiTuChoiId,
      lyDoTuChoi: rejectDto.lyDoTuChoi,
    };

    // Lưu ghi chú từ chối
    if (rejectDto.ghiChu) {
      (updateData as any).ghiChuTuChoi = rejectDto.ghiChu;
    }

    return await this.update(baoCaoId, updateData);
  }

  /**
   * Nhập kho báo cáo sản lượng (chuyển thành phôi)
   */
  async importBaoCaoSanLuong(
    importDto: ImportBaoCaoSanLuongDto,
  ): Promise<BaoCaoSanLuongDocument> {
    const baoCao = await this.baoCaoSanLuongModel.findById(importDto.baoCaoId);
    if (!baoCao) {
      throw new NotFoundException('Báo cáo sản lượng không tồn tại');
    }

    // Kiểm tra trạng thái phải là đã duyệt
    if (baoCao.trangThai !== BaoCaoState.APPROVED) {
      throw new BadRequestException(
        'Báo cáo phải được duyệt trước khi nhập kho',
      );
    }

    // Cập nhật thông tin nhập kho
    const updateData: UpdateQuery<BaoCaoSanLuongDocument> = {
      trangThai: BaoCaoState.IMPORTED, // Đã nhập kho (thành phôi)
      kho: importDto.kho,
      viTri: importDto.viTri,
      ngayNhapKho: new Date(),
      nguoiNhapKhoId: importDto.nguoiThucHienId,
      ngayCapNhat: new Date(),
    };

    // Lưu ghi chú nhập kho
    if (importDto.ghiChu) {
      (updateData as any).ghiChuNhapKho = importDto.ghiChu;
    }

    return await this.update(importDto.baoCaoId, updateData);
  }

  /**
   * Lấy danh sách báo cáo sản lượng chờ duyệt
   */
  async findPendingApproval(): Promise<BaoCaoSanLuongDocument[]> {
    return await this.baoCaoSanLuongModel
      .find({
        trangThai: BaoCaoState.NEW,
      })
      .populate('tnsxId', 'ten vai_tro')
      .populate('kcs_id', 'ten vai_tro');
  }

  /**
   * Lấy danh sách báo cáo sản lượng đã duyệt
   */
  async findApproved(): Promise<BaoCaoSanLuongDocument[]> {
    return await this.baoCaoSanLuongModel
      .find({
        trangThai: BaoCaoState.APPROVED,
      })
      .populate('tnsxId', 'ten vai_tro')
      .populate('kcs_id', 'ten vai_tro');
  }

  /**
   * Lấy danh sách báo cáo sản lượng đã nhập kho (phôi)
   */
  async findImported(): Promise<BaoCaoSanLuongDocument[]> {
    return await this.baoCaoSanLuongModel
      .find({
        trangThai: BaoCaoState.IMPORTED,
      })
      .populate('tnsxId', 'ten vai_tro')
      .populate('kcs_id', 'ten vai_tro');
  }

  /**
   * Lấy danh sách báo cáo sản lượng bị từ chối
   */
  async findRejected(): Promise<BaoCaoSanLuongDocument[]> {
    return await this.baoCaoSanLuongModel
      .find({
        trangThai: BaoCaoState.REJECTED,
      })
      .populate('tnsxId', 'ten vai_tro')
      .populate('kcs_id', 'ten vai_tro');
  }

  /**
   * Lấy thống kê báo cáo sản lượng theo trạng thái
   */
  async getBaoCaoSanLuongStats(): Promise<{
    new: number;
    approved: number;
    rejected: number;
    imported: number;
    total: number;
  }> {
    const [newCount, approved, rejected, imported, total] = await Promise.all([
      this.baoCaoSanLuongModel.countDocuments({
        trangThai: BaoCaoState.NEW,
      }),
      this.baoCaoSanLuongModel.countDocuments({
        trangThai: BaoCaoState.APPROVED,
      }),
      this.baoCaoSanLuongModel.countDocuments({
        trangThai: BaoCaoState.REJECTED,
      }),
      this.baoCaoSanLuongModel.countDocuments({
        trangThai: BaoCaoState.IMPORTED,
      }),
      this.baoCaoSanLuongModel.countDocuments({}),
    ]);

    return { new: newCount, approved, rejected, imported, total };
  }

  async updatePalletBaoCaoSanLuong(
    updateDto: UpdatePalletBaoCaoSanLuongDto,
  ): Promise<BaoCaoSanLuongDocument[]> {
    const baoCaoSanLuong = await this.baoCaoSanLuongModel.find({
      _id: { $in: updateDto.bcslIds },
    });
    if (baoCaoSanLuong.length !== updateDto.bcslIds.length) {
      throw new NotFoundException('Một số báo cáo sản lượng không tồn tại');
    }

    await this.baoCaoSanLuongModel.updateMany(
      { _id: { $in: updateDto.bcslIds } },
      { pallet: updateDto.pallet, ngayCapNhat: new Date() },
    );

    const baoCaoSanLuongUpdated = await this.baoCaoSanLuongModel.find({
      _id: { $in: updateDto.bcslIds },
    });

    return baoCaoSanLuongUpdated;
  }

  async xuatHoaDonBaoCaoSanLuong(
    xuatHoaDonDto: XuatHoaDonBaoCaoSanLuongDto,
  ): Promise<PhieuNghiepVuDocument> {
    const baoCaoSanLuong = await this.baoCaoSanLuongModel.find({
      _id: { $in: xuatHoaDonDto.bcslIds },
    });

    if (baoCaoSanLuong.length !== xuatHoaDonDto.bcslIds.length) {
      throw new NotFoundException('Một số báo cáo sản lượng không tồn tại');
    }

    const phieuNghiepVuModel = this.baoCaoSanLuongModel.db.model(
      PhieuNghiepVu.name,
    );
    const phieuNghiepVuCreated = await phieuNghiepVuModel.create({
      bcsl_ids: xuatHoaDonDto.bcslIds,
      maPhieu: xuatHoaDonDto.maPhieu,
      kho: xuatHoaDonDto.kho,
      nguoiTao: xuatHoaDonDto.nguoiTaoId,
      nguoiDuyet: xuatHoaDonDto.nguoiDuyetId,
      ngayTao: new Date(),
      ngayCapNhat: new Date(),
      trangThai: TrangThai.NEW,
      loaiPhieu: LoaiPhieu.XuatKho,
    });

    await this.baoCaoSanLuongModel.updateMany(
      { _id: { $in: xuatHoaDonDto.bcslIds } },
      { trangThai: BaoCaoState.RESERVED, ngayCapNhat: new Date() },
    );

    const phieuNghiepVuUpdated = await phieuNghiepVuModel
      .findById(phieuNghiepVuCreated._id)
      .populate('bcsl');

    return phieuNghiepVuUpdated as PhieuNghiepVuDocument;
  }
}
