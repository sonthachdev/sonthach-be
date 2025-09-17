/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */
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

    if (dto.mau_da !== undefined) {
      filter.mau_da = dto.mau_da;
    }

    if (dto.trang_thai !== undefined) {
      filter.trangThai = dto.trang_thai;
    }

    if (dto.vi_tri !== undefined) {
      filter.viTri = dto.vi_tri;
    }

    if (dto.kho !== undefined) {
      filter.kho = dto.kho;
    }

    if (dto.ycsc_id !== undefined) {
      filter.ycsc_id = dto.ycsc_id;
    }

    if (dto.ycsx_id !== undefined) {
      filter.ycsx_id = dto.ycsx_id;
    }

    const qcFilter: QuyCachFilter = {};
    if (dto.dai !== undefined) {
      qcFilter['quy_cach.dai'] = dto.dai;
    }
    if (dto.rong !== undefined) {
      qcFilter['quy_cach.rong'] = dto.rong;
    }
    if (dto.day !== undefined) {
      qcFilter['quy_cach.day'] = dto.day;
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
      trang_thai: BaoCaoState.NEW, // Mới tạo
      ngay_tao: new Date(createDto.ngay_tao),
      ngay_cap_nhat: new Date(),
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
    if (approveDto.ghi_chu) {
      (updateData as any).ghi_chu_duyet = approveDto.ghi_chu;
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
      ngay_tu_choi: new Date(),
      ngayCapNhat: new Date(),
      nguoi_tu_choi_id: rejectDto.nguoi_tu_choi_id,
      ly_do_tu_choi: rejectDto.ly_do_tu_choi,
    };

    // Lưu ghi chú từ chối
    if (rejectDto.ghi_chu) {
      (updateData as any).ghi_chu_tu_choi = rejectDto.ghi_chu;
    }

    return await this.update(baoCaoId, updateData);
  }

  /**
   * Nhập kho báo cáo sản lượng (chuyển thành phôi)
   */
  async importBaoCaoSanLuong(
    importDto: ImportBaoCaoSanLuongDto,
  ): Promise<BaoCaoSanLuongDocument> {
    const baoCao = await this.baoCaoSanLuongModel.findById(
      importDto.bao_cao_id,
    );
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
      viTri: importDto.vi_tri,
      ngay_nhap_kho: new Date(),
      nguoi_nhap_kho_id: importDto.nguoi_thuc_hien_id,
      ngayCapNhat: new Date(),
    };

    // Lưu ghi chú nhập kho
    if (importDto.ghi_chu) {
      (updateData as any).ghi_chu_nhap_kho = importDto.ghi_chu;
    }

    return await this.update(importDto.bao_cao_id, updateData);
  }

  /**
   * Lấy danh sách báo cáo sản lượng chờ duyệt
   */
  async findPendingApproval(): Promise<BaoCaoSanLuongDocument[]> {
    return await this.baoCaoSanLuongModel
      .find({
        trangThai: BaoCaoState.NEW,
      })
      .populate('tnsx_id', 'ten vai_tro')
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
      .populate('tnsx_id', 'ten vai_tro')
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
      .populate('tnsx_id', 'ten vai_tro')
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
      .populate('tnsx_id', 'ten vai_tro')
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
      _id: { $in: updateDto.bcsl_ids },
    });
    if (baoCaoSanLuong.length !== updateDto.bcsl_ids.length) {
      throw new NotFoundException('Một số báo cáo sản lượng không tồn tại');
    }

    await this.baoCaoSanLuongModel.updateMany(
      { _id: { $in: updateDto.bcsl_ids } },
      { pallet: updateDto.pallet, ngayCapNhat: new Date() },
    );

    const baoCaoSanLuongUpdated = await this.baoCaoSanLuongModel.find({
      _id: { $in: updateDto.bcsl_ids },
    });

    return baoCaoSanLuongUpdated;
  }

  async xuatHoaDonBaoCaoSanLuong(
    xuatHoaDonDto: XuatHoaDonBaoCaoSanLuongDto,
  ): Promise<PhieuNghiepVuDocument> {
    const baoCaoSanLuong = await this.baoCaoSanLuongModel.find({
      _id: { $in: xuatHoaDonDto.bcsl_ids },
    });

    if (baoCaoSanLuong.length !== xuatHoaDonDto.bcsl_ids.length) {
      throw new NotFoundException('Một số báo cáo sản lượng không tồn tại');
    }

    const phieuNghiepVuModel = this.baoCaoSanLuongModel.db.model(
      PhieuNghiepVu.name,
    );
    const phieuNghiepVuCreated = await phieuNghiepVuModel.create({
      bcsl_ids: xuatHoaDonDto.bcsl_ids,
      ma_phieu: xuatHoaDonDto.ma_phieu,
      kho: xuatHoaDonDto.kho,
      nguoi_tao_id: xuatHoaDonDto.nguoi_tao_id,
      nguoi_duyet_id: xuatHoaDonDto.nguoi_duyet_id,
      ngay_tao: new Date(),
      ngay_cap_nhat: new Date(),
      trang_thai: TrangThai.NEW,
      loai_phieu: LoaiPhieu.XuatKho,
    });

    await this.baoCaoSanLuongModel.updateMany(
      { _id: { $in: xuatHoaDonDto.bcsl_ids } },
      { trangThai: BaoCaoState.RESERVED, ngayCapNhat: new Date() },
    );

    const phieuNghiepVuUpdated = await phieuNghiepVuModel
      .findById(phieuNghiepVuCreated._id)
      .populate('bcsl_ids');

    return phieuNghiepVuUpdated;
  }
}
