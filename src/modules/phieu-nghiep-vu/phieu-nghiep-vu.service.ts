/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, SortOrder, Types } from 'mongoose';
import { BaseService } from '../../common/base';
import {
  PhieuNghiepVu,
  PhieuNghiepVuDocument,
  BaoCaoSanLuong,
} from '../../schemas';
import { TrangThai, LoaiPhieu, Kho, BaoCaoState, CongDoan } from '../../utils';
import {
  CreatePhieuNghiepVuDto,
  ApprovePhieuNghiepVuDto,
  WarehouseEntryDto,
  CreateBlockWarehouseEntryDto,
  BlockWarehouseBatchImportDto,
  ListPhieuNghiepVuQueryDto,
} from './dto/phieu-nghiep-vu.dto';
import { BatchApprovePhieuXuatKhoDto } from './dto/phieu-nghiep-vu-xuat-kho.dto';

@Injectable()
export class PhieuNghiepVuService extends BaseService<PhieuNghiepVuDocument> {
  constructor(
    @InjectModel(PhieuNghiepVu.name)
    private readonly phieuNghiepVuModel: Model<PhieuNghiepVuDocument>,
  ) {
    super(phieuNghiepVuModel);
  }
  async findByLoaiPhieu(loaiPhieu: string): Promise<PhieuNghiepVuDocument[]> {
    const result = await this.findAll({ loaiPhieu });
    return result.data;
  }

  /**
   * Tìm phiếu nghiệp vụ theo bộ lọc tùy chọn
   */
  async findByFilters(
    query: ListPhieuNghiepVuQueryDto,
  ): Promise<PhieuNghiepVuDocument[]> {
    const filter: Record<string, unknown> = {};
    if (query.kho) filter.kho = query.kho;
    if (query.trangThai) filter.trang_thai = query.trangThai;
    if (query.currentCongDoan) filter.currentCongDoan = query.currentCongDoan;
    if (query.loaiPhieu) filter.loai_phieu = query.loaiPhieu;
    const { sort = 'ngay_tao:-1' } = query;

    return this.phieuNghiepVuModel
      .find(filter)
      .populate({ path: 'bcsl_ids', model: BaoCaoSanLuong.name })
      .populate({
        path: 'nguoi_tao_id',
        select: 'ten vai_tro',
        model: 'NhanVien',
      })
      .populate({
        path: 'nguoi_duyet_id',
        select: 'ten vai_tro',
        model: 'NhanVien',
      })
      .select(
        '_id ma_phieu loai_phieu ycsc_id ycsx_id nguoi_tao_id ngay_tao nguoi_duyet_id ngay_duyet kho trang_thai bcsl_ids currentCongDoan next_cong_doan',
      )
      .sort(sort);
  }

  async findByTrangThai(trangThai: string): Promise<PhieuNghiepVuDocument[]> {
    const result = await this.findAll({ trangThai });
    return result.data;
  }

  async findByNhanVien(nhanVienId: string): Promise<PhieuNghiepVuDocument[]> {
    const result = await this.findAll({ nhanVienId });
    return result.data;
  }

  async findByKho(kho: string): Promise<PhieuNghiepVuDocument[]> {
    const result = await this.findAll({ kho });
    return result.data;
  }

  async findByNgayTao(ngayTao: Date): Promise<PhieuNghiepVuDocument[]> {
    const result = await this.findAll({ ngayTao });
    return result.data;
  }

  async findByKhoangThoiGian(
    tuNgay: Date,
    denNgay: Date,
  ): Promise<PhieuNghiepVuDocument[]> {
    const result = await this.findAll({
      ngayTao: {
        $gte: tuNgay,
        $lte: denNgay,
      },
    });
    return result.data;
  }

  async findChoXuLy(): Promise<PhieuNghiepVuDocument[]> {
    const result = await this.findAll({ trangThai: 'cho-xu-ly' });
    return result.data;
  }

  async updateTrangThai(
    id: string,
    trangThai: string,
  ): Promise<PhieuNghiepVuDocument> {
    return this.update(id, { trangThai });
  }

  /**
   * Tạo phiếu nhập kho mới
   */
  async createWarehouseEntryTicket(
    createDto: CreatePhieuNghiepVuDto,
  ): Promise<PhieuNghiepVuDocument> {
    // Kiểm tra loại phiếu phải là nhập kho
    if (createDto.loai_phieu !== LoaiPhieu.NhapKho) {
      throw new BadRequestException('Chỉ có thể tạo phiếu nhập kho');
    }

    // Kiểm tra mã phiếu đã tồn tại
    const existingPhieu = await this.phieuNghiepVuModel.findOne({
      ma_phieu: createDto.ma_phieu,
    });
    if (existingPhieu) {
      throw new BadRequestException('Mã phiếu đã tồn tại');
    }

    // Tạo phiếu mới với trạng thái chờ duyệt
    const newPhieu = new this.phieuNghiepVuModel({
      ...createDto,
      trang_thai: TrangThai.REVIEWED, // Chờ duyệt
      ngay_tao: new Date(createDto.ngay_tao),
      ngay_cap_nhat: new Date(),
    });

    return await newPhieu.save();
  }

  /**
   * Duyệt phiếu nhập kho
   */
  async approveWarehouseEntryTicket(
    phieuId: string,
    approveDto: ApprovePhieuNghiepVuDto,
  ): Promise<PhieuNghiepVuDocument> {
    const phieu = await this.phieuNghiepVuModel.findById(phieuId);
    if (!phieu) {
      throw new NotFoundException('Phiếu nghiệp vụ không tồn tại');
    }

    // Kiểm tra loại phiếu phải là nhập kho
    if (phieu.loai_phieu !== LoaiPhieu.NhapKho) {
      throw new BadRequestException('Chỉ có thể duyệt phiếu nhập kho');
    }

    // Kiểm tra trạng thái hiện tại phải là chờ duyệt
    if (phieu.trang_thai !== TrangThai.REVIEWED) {
      throw new BadRequestException('Phiếu không ở trạng thái chờ duyệt');
    }

    // Cập nhật thông tin duyệt và tự động nhập kho
    const updateData: any = {
      trang_thai: TrangThai.COMPLETED, // Trực tiếp chuyển sang hoàn thành (đã nhập kho)
      ngay_duyet: new Date(),
      ngay_cap_nhat: new Date(),
      ngay_nhap_kho: new Date(), // Tự động set ngày nhập kho
      nguoi_thuc_hien_nhap_kho_id: approveDto.nguoi_duyet_id, // Người duyệt cũng là người thực hiện nhập kho
    };

    // Nếu có thông tin kho, cập nhật kho
    if (approveDto.kho) {
      updateData.kho = approveDto.kho;
    }

    // Nếu có ghi chú, lưu vào field ghi chú duyệt
    if (approveDto.ghi_chu) {
      updateData.ghi_chu_duyet = approveDto.ghi_chu;
    }

    // Cập nhật phiếu nghiệp vụ
    const updatedPhieu = await this.update(phieuId, updateData);

    // Nếu có bcsl_ids, cập nhật trạng thái báo cáo sản lượng từ "reserved" sang "imported"
    if (phieu.bcsl_ids && phieu.bcsl_ids.length > 0) {
      const targetKho = approveDto.kho || phieu.kho;
      if (targetKho) {
        await this.updateBaoCaoSanLuongStatus(
          phieu.bcsl_ids,
          targetKho,
          approveDto.nguoi_duyet_id,
        );
      }
    }

    return updatedPhieu;
  }

  /**
   * Cập nhật trạng thái báo cáo sản lượng sau khi nhập kho
   */
  private async updateBaoCaoSanLuongStatus(
    bcslIds: any[],
    kho: Kho,
    nguoiThucHienId: string,
  ): Promise<void> {
    try {
      // Sử dụng model hiện có thay vì import động
      const BaoCaoSanLuongModel =
        this.phieuNghiepVuModel.db.model('BaoCaoSanLuong');

      // Cập nhật trạng thái từ "reserved" sang "imported" cho tất cả báo cáo sản lượng liên quan
      await BaoCaoSanLuongModel.updateMany(
        {
          _id: { $in: bcslIds },
          trang_thai: 'reserved', // Chỉ cập nhật những báo cáo có trạng thái "reserved"
        },
        {
          $set: {
            trang_thai: 'imported',
            kho: kho,
            ngay_nhap_kho: new Date(),
            nguoi_nhap_kho_id: nguoiThucHienId,
            ghi_chu_nhap_kho: 'Tự động nhập kho khi duyệt phiếu',
            ngay_cap_nhat: new Date(),
          },
        },
      );
    } catch (error) {
      // Log lỗi nhưng không làm fail việc duyệt phiếu
      console.error('Lỗi khi cập nhật trạng thái báo cáo sản lượng:', error);
    }
  }

  /**
   * Nhập kho block theo danh sách phiếu: cập nhật vi_tri cho BCSL liên quan và chuyển trạng thái sang imported
   */
  async batchImportBlock(
    dto: BlockWarehouseBatchImportDto,
  ): Promise<{ updatedBaoCaoCount: number; updatedPhieuCount: number }> {
    // Lấy các phiếu nghiệp vụ theo danh sách id
    const phieuList = await this.phieuNghiepVuModel
      .find({ _id: { $in: dto.phieu_ids } })
      .select('_id bcsl_ids trang_thai');

    if (!phieuList || phieuList.length === 0) {
      throw new NotFoundException('Không tìm thấy phiếu nghiệp vụ nào');
    }

    if (phieuList.length !== dto.phieu_ids.length) {
      throw new NotFoundException('Không tìm thấy phiếu nghiệp vụ nào');
    }

    // Thu thập toàn bộ bcsl_ids từ các phiếu
    const bcslIds: Types.ObjectId[] = [];
    for (const p of phieuList) {
      if (Array.isArray(p.bcsl_ids) && p.bcsl_ids.length > 0) {
        for (const id of p.bcsl_ids as any[]) {
          bcslIds.push(new Types.ObjectId(id));
        }
      }
    }

    if (bcslIds.length === 0) {
      return { updatedBaoCaoCount: 0, updatedPhieuCount: 0 };
    }

    // Model BCSL
    const BaoCaoSanLuongModel = this.phieuNghiepVuModel.db.model(
      BaoCaoSanLuong.name,
    );

    // Cập nhật BCSL: set vi_tri và trạng thái imported
    const bcslUpdate = await BaoCaoSanLuongModel.updateMany(
      { _id: { $in: bcslIds } },
      {
        $set: {
          vi_tri: dto.vi_tri,
          // completed_cong_doan: CongDoan.BO,
          trang_thai: BaoCaoState.IMPORTED,
          ngay_cap_nhat: new Date(),
        },
      },
    );

    // Cập nhật trạng thái phiếu sang completed hoặc mapping imported
    // Trong hệ thống phiếu dùng enum TrangThai; để thể hiện imported cho nhập kho ta dùng COMPLETED
    const phieuUpdate = await this.phieuNghiepVuModel.updateMany(
      { _id: { $in: dto.phieu_ids } },
      { $set: { trang_thai: TrangThai.COMPLETED, ngay_cap_nhat: new Date() } },
    );

    return {
      updatedBaoCaoCount: bcslUpdate.modifiedCount ?? 0,
      updatedPhieuCount: phieuUpdate.modifiedCount ?? 0,
    };
  }

  /**
   * Lấy ID người dùng hiện tại (có thể implement theo authentication system)
   */
  private getCurrentUserId(): string {
    // TODO: Implement theo authentication system hiện tại
    // Tạm thời return null, sẽ được cập nhật sau
    return '';
  }

  /**
   * Xử lý nhập kho sau khi duyệt
   */
  async processWarehouseEntry(
    warehouseEntryDto: WarehouseEntryDto,
  ): Promise<PhieuNghiepVuDocument> {
    const phieu = await this.phieuNghiepVuModel.findById(
      warehouseEntryDto.phieu_id,
    );
    if (!phieu) {
      throw new NotFoundException('Phiếu nghiệp vụ không tồn tại');
    }

    // Kiểm tra loại phiếu phải là nhập kho
    if (phieu.loai_phieu !== LoaiPhieu.NhapKho) {
      throw new BadRequestException('Chỉ có thể xử lý phiếu nhập kho');
    }

    // Kiểm tra trạng thái phải là đã duyệt
    if (phieu.trang_thai !== TrangThai.APPROVED) {
      throw new BadRequestException('Phiếu phải được duyệt trước khi nhập kho');
    }

    // Kiểm tra kho phải khớp với kho trong phiếu
    if (phieu.kho && phieu.kho !== warehouseEntryDto.kho) {
      throw new BadRequestException(
        'Kho trong phiếu không khớp với kho thực hiện',
      );
    }

    // Cập nhật trạng thái thành đã nhập kho
    const updateData: any = {
      trang_thai: TrangThai.COMPLETED,
      kho: warehouseEntryDto.kho,
      ngay_cap_nhat: new Date(),
      ngay_nhap_kho: new Date(),
      nguoi_thuc_hien_nhap_kho_id: warehouseEntryDto.nguoi_thuc_hien_id,
    };

    // Lưu thông tin người thực hiện nhập kho
    if (warehouseEntryDto.ghi_chu) {
      updateData.ghi_chu_nhap_kho = warehouseEntryDto.ghi_chu;
    }

    return await this.update(warehouseEntryDto.phieu_id, updateData);
  }

  /**
   * Lấy danh sách phiếu nhập kho chờ duyệt
   */
  async findWarehouseEntryPendingApproval(): Promise<PhieuNghiepVuDocument[]> {
    return await this.phieuNghiepVuModel
      .find({
        loai_phieu: LoaiPhieu.NhapKho,
        trang_thai: TrangThai.REVIEWED,
      })
      .populate('nguoi_tao_id', 'ten vai_tro')
      .populate('nguoi_duyet_id', 'ten vai_tro');
  }

  /**
   * Lấy danh sách phiếu nhập kho đã duyệt chờ nhập kho
   */
  async findWarehouseEntryApproved(): Promise<PhieuNghiepVuDocument[]> {
    return await this.phieuNghiepVuModel
      .find({
        loai_phieu: LoaiPhieu.NhapKho,
        trang_thai: TrangThai.APPROVED,
      })
      .populate('nguoi_tao_id', 'ten vai_tro')
      .populate('nguoi_duyet_id', 'ten vai_tro');
  }

  /**
   * Lấy danh sách phiếu nhập kho đã hoàn thành
   */
  async findWarehouseEntryCompleted(): Promise<PhieuNghiepVuDocument[]> {
    return await this.phieuNghiepVuModel
      .find({
        loai_phieu: LoaiPhieu.NhapKho,
        trang_thai: TrangThai.COMPLETED,
      })
      .populate('nguoi_tao_id', 'ten vai_tro')
      .populate('nguoi_duyet_id', 'ten vai_tro');
  }

  /**
   * Lấy thống kê phiếu nhập kho theo trạng thái
   */
  async getWarehouseEntryStats(): Promise<{
    pending: number;
    approved: number;
    completed: number;
    total: number;
  }> {
    const [pending, approved, completed, total] = await Promise.all([
      this.phieuNghiepVuModel.countDocuments({
        loai_phieu: LoaiPhieu.NhapKho,
        trang_thai: TrangThai.REVIEWED,
      }),
      this.phieuNghiepVuModel.countDocuments({
        loai_phieu: LoaiPhieu.NhapKho,
        trang_thai: TrangThai.APPROVED,
      }),
      this.phieuNghiepVuModel.countDocuments({
        loai_phieu: LoaiPhieu.NhapKho,
        trang_thai: TrangThai.COMPLETED,
      }),
      this.phieuNghiepVuModel.countDocuments({
        loai_phieu: LoaiPhieu.NhapKho,
      }),
    ]);

    return { pending, approved, completed, total };
  }

  /**
   * Tạo phiếu xuất kho mới
   */
  async createWarehouseExitTicket(
    createDto: any,
  ): Promise<PhieuNghiepVuDocument> {
    // Kiểm tra loại phiếu phải là xuất kho
    if (createDto.loai_phieu !== LoaiPhieu.XuatKho) {
      throw new BadRequestException('Chỉ có thể tạo phiếu xuất kho');
    }

    // Kiểm tra mã phiếu đã tồn tại
    const existingPhieu = await this.phieuNghiepVuModel.findOne({
      ma_phieu: createDto.ma_phieu,
    });
    if (existingPhieu) {
      throw new BadRequestException('Mã phiếu đã tồn tại');
    }

    // Tạo phiếu mới với trạng thái chờ duyệt
    const newPhieu = new this.phieuNghiepVuModel({
      ...createDto,
      trang_thai: TrangThai.REVIEWED, // Chờ duyệt
      ngay_tao: new Date(createDto.ngay_tao),
      ngay_cap_nhat: new Date(),
    });

    return await newPhieu.save();
  }

  /**
   * Duyệt phiếu xuất kho
   */
  async approveWarehouseExitTicket(
    phieuId: string,
    approveDto: any,
  ): Promise<PhieuNghiepVuDocument> {
    const phieu = await this.phieuNghiepVuModel.findById(phieuId);
    if (!phieu) {
      throw new NotFoundException('Phiếu nghiệp vụ không tồn tại');
    }

    // Kiểm tra loại phiếu phải là xuất kho
    if (phieu.loai_phieu !== LoaiPhieu.XuatKho) {
      throw new BadRequestException('Chỉ có thể duyệt phiếu xuất kho');
    }

    // Kiểm tra trạng thái hiện tại phải là chờ duyệt
    if (phieu.trang_thai !== TrangThai.REVIEWED) {
      throw new BadRequestException('Phiếu không ở trạng thái chờ duyệt');
    }

    // Cập nhật thông tin duyệt
    const updateData: any = {
      trang_thai: approveDto.trang_thai,
      ngay_duyet: new Date(),
      ngay_cap_nhat: new Date(),
    };

    // Lưu ghi chú duyệt
    if (approveDto.ghi_chu) {
      updateData.ghi_chu_duyet = approveDto.ghi_chu;
    }

    return await this.update(phieuId, updateData);
  }

  async batchApproveWarehouseExitTicket(
    batchApproveDto: BatchApprovePhieuXuatKhoDto,
  ): Promise<PhieuNghiepVuDocument[]> {
    const pnvs = await this.phieuNghiepVuModel.find({
      _id: { $in: batchApproveDto.phieu_ids },
    });
    if (pnvs.length !== batchApproveDto.phieu_ids.length) {
      throw new NotFoundException('Một số phiếu nghiệp vụ không tồn tại');
    }

    await this.phieuNghiepVuModel.updateMany(
      { _id: { $in: batchApproveDto.phieu_ids } },
      { $set: { trang_thai: TrangThai.COMPLETED, ngay_cap_nhat: new Date() } },
    );

    for (const pnv of pnvs) {
      if (pnv.bcsl_ids && pnv.bcsl_ids.length > 0) {
        const BaoCaoSanLuongModel = this.phieuNghiepVuModel.db.model(
          BaoCaoSanLuong.name,
        );
        const setData: any = {
          trang_thai:
            pnv.loai_phieu === LoaiPhieu.XuatKho
              ? BaoCaoState.EXPORTED
              : pnv.loai_phieu === LoaiPhieu.NhapKho
                ? BaoCaoState.IMPORTED
                : BaoCaoState.FORWARDED,
          // ycsc_id: pnv.ycsc_id,
          // ycsx_id: pnv.ycsx_id,
          kho: pnv.kho,
          ngay_cap_nhat: new Date(),
        };
        if (batchApproveDto.vi_tri != null) {
          setData.vi_tri = batchApproveDto.vi_tri;
        }
        await BaoCaoSanLuongModel.updateMany(
          { _id: { $in: pnv.bcsl_ids } },
          {
            $set: setData,
          },
        );
      }
    }

    return await this.phieuNghiepVuModel.find({
      _id: { $in: batchApproveDto.phieu_ids },
    }).populate('bcsl_ids');
  }

  /**
   * Xử lý xuất kho sau khi duyệt
   */
  async processWarehouseExit(
    warehouseExitDto: any,
  ): Promise<PhieuNghiepVuDocument> {
    const phieu = await this.phieuNghiepVuModel.findById(
      warehouseExitDto.phieu_id,
    );
    if (!phieu) {
      throw new NotFoundException('Phiếu nghiệp vụ không tồn tại');
    }

    // Kiểm tra loại phiếu phải là xuất kho
    if (phieu.loai_phieu !== LoaiPhieu.XuatKho) {
      throw new BadRequestException('Chỉ có thể xử lý phiếu xuất kho');
    }

    // Kiểm tra trạng thái phải là đã duyệt
    if (phieu.trang_thai !== TrangThai.APPROVED) {
      throw new BadRequestException('Phiếu phải được duyệt trước khi xuất kho');
    }

    // Cập nhật trạng thái thành đã xuất kho
    const updateData: any = {
      trang_thai: TrangThai.COMPLETED,
      ngay_cap_nhat: new Date(),
    };

    // Lưu thông tin người thực hiện xuất kho
    if (warehouseExitDto.ghi_chu) {
      updateData.ghi_chu_xuat_kho = warehouseExitDto.ghi_chu;
    }

    return await this.update(warehouseExitDto.phieu_id, updateData);
  }

  /**
   * Lấy danh sách phiếu xuất kho chờ duyệt
   */
  async findWarehouseExitPendingApproval(): Promise<PhieuNghiepVuDocument[]> {
    return await this.phieuNghiepVuModel
      .find({
        loai_phieu: LoaiPhieu.XuatKho,
        trang_thai: TrangThai.REVIEWED,
      })
      .populate('nguoi_tao_id', 'ten vai_tro')
      .populate('nguoi_duyet_id', 'ten vai_tro');
  }

  /**
   * Lấy danh sách phiếu xuất kho đã duyệt
   */
  async findWarehouseExitApproved(): Promise<PhieuNghiepVuDocument[]> {
    return await this.phieuNghiepVuModel
      .find({
        loai_phieu: LoaiPhieu.XuatKho,
        trang_thai: TrangThai.APPROVED,
      })
      .populate('nguoi_tao_id', 'ten vai_tro')
      .populate('nguoi_duyet_id', 'ten vai_tro');
  }

  /**
   * Lấy danh sách phiếu xuất kho đã hoàn thành
   */
  async findWarehouseExitCompleted(): Promise<PhieuNghiepVuDocument[]> {
    return await this.phieuNghiepVuModel
      .find({
        loai_phieu: LoaiPhieu.XuatKho,
        trang_thai: TrangThai.COMPLETED,
      })
      .populate('nguoi_tao_id', 'ten vai_tro')
      .populate('nguoi_duyet_id', 'ten vai_tro');
  }

  /**
   * Lấy thống kê phiếu xuất kho theo trạng thái
   */
  async getWarehouseExitStats(): Promise<{
    pending: number;
    approved: number;
    completed: number;
    total: number;
  }> {
    const [pending, approved, completed, total] = await Promise.all([
      this.phieuNghiepVuModel.countDocuments({
        loai_phieu: LoaiPhieu.XuatKho,
        trang_thai: TrangThai.REVIEWED,
      }),
      this.phieuNghiepVuModel.countDocuments({
        loai_phieu: LoaiPhieu.XuatKho,
        trang_thai: TrangThai.APPROVED,
      }),
      this.phieuNghiepVuModel.countDocuments({
        loai_phieu: LoaiPhieu.XuatKho,
        trang_thai: TrangThai.COMPLETED,
      }),
      this.phieuNghiepVuModel.countDocuments({
        loai_phieu: LoaiPhieu.XuatKho,
      }),
    ]);

    return { pending, approved, completed, total };
  }

  /**
   * Tạo phiếu nghiệp vụ nhập kho block với thông tin đá
   */
  async createBlockWarehouseEntryTicket(
    createDto: CreateBlockWarehouseEntryDto,
  ): Promise<PhieuNghiepVuDocument> {
    // Kiểm tra mã phiếu đã tồn tại
    const existingPhieu = await this.phieuNghiepVuModel.findOne({
      ma_phieu: createDto.ma_phieu,
    });
    if (existingPhieu) {
      throw new BadRequestException('Mã phiếu đã tồn tại');
    }

    // Tạo báo cáo sản lượng mới với thông tin đá
    const BaoCaoSanLuongModel =
      this.phieuNghiepVuModel.db.model('BaoCaoSanLuong');

    const newBaoCao = new BaoCaoSanLuongModel({
      ycsc_id: createDto.ycsc_id
        ? new Types.ObjectId(createDto.ycsc_id)
        : undefined,
      ycsx_id: createDto.ycsx_id
        ? new Types.ObjectId(createDto.ycsx_id)
        : undefined,
      hang_muc_id: createDto.hang_muc_id
        ? new Types.ObjectId(createDto.hang_muc_id)
        : undefined,
      ma_da: createDto.ma_da,
      mau_da: createDto.mau_da,
      quy_cach: {
        dai: createDto.dai,
        rong: createDto.rong,
        day: createDto.day,
      },
      ngay_tao: new Date(),
      trang_thai: 'new', // Trạng thái mới tạo
      ngay_cap_nhat: new Date(),
      kho: Kho.KHO_BLOCK,
    });

    const savedBaoCao = await newBaoCao.save();

    // Tạo phiếu nghiệp vụ nhập kho
    const newPhieu = new this.phieuNghiepVuModel({
      ma_phieu: createDto.ma_phieu,
      loai_phieu: LoaiPhieu.NhapKho,
      ycsc_id: createDto.ycsc_id
        ? new Types.ObjectId(createDto.ycsc_id)
        : undefined,
      ycsx_id: createDto.ycsx_id
        ? new Types.ObjectId(createDto.ycsx_id)
        : undefined,
      nguoi_tao_id: new Types.ObjectId(createDto.nguoi_tao_id),
      ngay_tao: new Date(),
      nguoi_duyet_id: new Types.ObjectId(createDto.nguoi_duyet_id),
      kho: Kho.KHO_BLOCK, // Mặc định là kho block
      trang_thai: TrangThai.NEW, // Chờ duyệt
      bcsl_ids: [savedBaoCao._id], // Liên kết với báo cáo sản lượng vừa tạo
      hang_muc_ids: createDto.hang_muc_id
        ? [new Types.ObjectId(createDto.hang_muc_id)]
        : undefined,
      ngay_cap_nhat: new Date(),
    });

    return await newPhieu.save();
  }
}
