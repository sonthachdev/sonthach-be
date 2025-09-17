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
import { BatchApprovePhieuXuatKhoDto, BatchRejectPhieuXuatKhoDto } from './dto/phieu-nghiep-vu-xuat-kho.dto';

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
    if (query.trangThai) {
      // example: new,cancelled
      const listTrangThai = query.trangThai.split(',');
      filter.trangThai = { $in: listTrangThai };
    }
    if (query.currentCongDoan) filter.currentCongDoan = query.currentCongDoan;
    if (query.loaiPhieu) filter.loaiPhieu = query.loaiPhieu;
    // sort format: field:order,field2:order2
    const sort: Record<string, SortOrder> = {};

    if (query.sort) {
      // Parse multiple sort fields separated by comma
      const sortPairs = query.sort.split(',');
      for (const pair of sortPairs) {
        const [field, order] = pair.split(':');
        if (field && order) {
          const sortOrder = order === '1' ? 1 : -1;
          sort[field] = sortOrder as SortOrder;
        }
      }
    }

    // Default sort if no sort specified or parsing failed
    if (Object.keys(sort).length === 0) {
      sort.ngayTao = -1;
    }

    return this.phieuNghiepVuModel
      .find(filter)
      .populate({ path: 'bcsl', model: BaoCaoSanLuong.name })
      .populate({
        path: 'nguoiTao',
        select: 'ten vaiTro',
        model: 'NhanVien',
      })
      .populate({
        path: 'nguoiDuyet',
        select: 'ten vaiTro',
        model: 'NhanVien',
      })
      .select(
        '_id maPhieu loaiPhieu ycscId ycsxId nguoiTao ngayTao nguoiDuyet ngayDuyet kho trangThai bcsl currentCongDoan nextCongDoan',
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
    if (createDto.loaiPhieu !== LoaiPhieu.NhapKho) {
      throw new BadRequestException('Chỉ có thể tạo phiếu nhập kho');
    }

    // Kiểm tra mã phiếu đã tồn tại
    const existingPhieu = await this.phieuNghiepVuModel.findOne({
      maPhieu: createDto.maPhieu,
    });
    if (existingPhieu) {
      throw new BadRequestException('Mã phiếu đã tồn tại');
    }

    // Tạo phiếu mới với trạng thái chờ duyệt
    const newPhieu = new this.phieuNghiepVuModel({
      ...createDto,
      trang_thai: TrangThai.REVIEWED, // Chờ duyệt
      ngay_tao: new Date(createDto.ngayTao),
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
    if (phieu.loaiPhieu !== LoaiPhieu.NhapKho) {
      throw new BadRequestException('Chỉ có thể duyệt phiếu nhập kho');
    }

    // Kiểm tra trạng thái hiện tại phải là chờ duyệt
    if (phieu.trangThai !== TrangThai.REVIEWED) {
      throw new BadRequestException('Phiếu không ở trạng thái chờ duyệt');
    }

    // Cập nhật thông tin duyệt và tự động nhập kho
    const updateData: any = {
      trang_thai: TrangThai.COMPLETED, // Trực tiếp chuyển sang hoàn thành (đã nhập kho)
      ngay_duyet: new Date(),
      ngay_cap_nhat: new Date(),
      ngay_nhap_kho: new Date(), // Tự động set ngày nhập kho
      nguoi_thuc_hien_nhap_kho_id: approveDto.nguoiDuyetId, // Người duyệt cũng là người thực hiện nhập kho
    };

    // Nếu có thông tin kho, cập nhật kho
    if (approveDto.kho) {
      updateData.kho = approveDto.kho;
    }

    // Nếu có ghi chú, lưu vào field ghi chú duyệt
    if (approveDto.ghiChu) {
      updateData.ghi_chu_duyet = approveDto.ghiChu;
    }

    // Cập nhật phiếu nghiệp vụ
    const updatedPhieu = await this.update(phieuId, updateData);

    // Nếu có bcsl_ids, cập nhật trạng thái báo cáo sản lượng từ "reserved" sang "imported"
    if (phieu.bcsl && phieu.bcsl.length > 0) {
      const targetKho = approveDto.kho || phieu.kho;
      if (targetKho) {
        await this.updateBaoCaoSanLuongStatus(
          phieu.bcsl,
          targetKho,
          approveDto.nguoiDuyetId,
        );
      }
    }

    return updatedPhieu;
  }

  /**
   * Cập nhật trạng thái báo cáo sản lượng sau khi nhập kho
   */
  private async updateBaoCaoSanLuongStatus(
    bcsl: any[],
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
          _id: { $in: bcsl },
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
      .find({ _id: { $in: dto.phieuIds } })
      .select('_id bcsl trangThai');

    if (!phieuList || phieuList.length === 0) {
      throw new NotFoundException('Không tìm thấy phiếu nghiệp vụ nào');
    }

    if (phieuList.length !== dto.phieuIds.length) {
      throw new NotFoundException('Không tìm thấy phiếu nghiệp vụ nào');
    }

    // Thu thập toàn bộ bcsl_ids từ các phiếu
    const bcsl: Types.ObjectId[] = [];
    for (const p of phieuList) {
      if (Array.isArray(p.bcsl) && p.bcsl.length > 0) {
        for (const id of p.bcsl as any[]) {
          bcsl.push(new Types.ObjectId(id));
        }
      }
    }

    if (bcsl.length === 0) {
      return { updatedBaoCaoCount: 0, updatedPhieuCount: 0 };
    }

    // Model BCSL
    const BaoCaoSanLuongModel = this.phieuNghiepVuModel.db.model(
      BaoCaoSanLuong.name,
    );

    // Cập nhật BCSL: set vi_tri và trạng thái imported
    const bcslUpdate = await BaoCaoSanLuongModel.updateMany(
      { _id: { $in: bcsl } },
      {
        $set: {
          viTri: dto.viTri,
          // completed_cong_doan: CongDoan.BO,
          trangThai: BaoCaoState.IMPORTED,
          ngayCapNhat: new Date(),
        },
      },
    );

    // Cập nhật trạng thái phiếu sang completed hoặc mapping imported
    // Trong hệ thống phiếu dùng enum TrangThai; để thể hiện imported cho nhập kho ta dùng COMPLETED
    const phieuUpdate = await this.phieuNghiepVuModel.updateMany(
      { _id: { $in: dto.phieuIds } },
      { $set: { trangThai: TrangThai.COMPLETED, ngayCapNhat: new Date() } },
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
      warehouseEntryDto.phieuId,
    );
    if (!phieu) {
      throw new NotFoundException('Phiếu nghiệp vụ không tồn tại');
    }

    // Kiểm tra loại phiếu phải là nhập kho
    if (phieu.loaiPhieu !== LoaiPhieu.NhapKho) {
      throw new BadRequestException('Chỉ có thể xử lý phiếu nhập kho');
    }

    // Kiểm tra trạng thái phải là đã duyệt
    if (phieu.trangThai !== TrangThai.APPROVED) {
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
      trangThai: TrangThai.COMPLETED,
      kho: warehouseEntryDto.kho,
      ngayCapNhat: new Date(),
      ngayNhapKho: new Date(),
    };

    // Lưu thông tin người thực hiện nhập kho
    if (warehouseEntryDto.ghiChu) {
      updateData.ghi_chu_nhap_kho = warehouseEntryDto.ghiChu;
    }

    return await this.update(warehouseEntryDto.phieuId, updateData);
  }

  /**
   * Lấy danh sách phiếu nhập kho chờ duyệt
   */
  async findWarehouseEntryPendingApproval(): Promise<PhieuNghiepVuDocument[]> {
    return await this.phieuNghiepVuModel
      .find({
        loaiPhieu: LoaiPhieu.NhapKho,
        trangThai: TrangThai.REVIEWED,
      })
      .populate('nguoiTao', 'ten vaiTro')
      .populate('nguoiDuyet', 'ten vaiTro');
  }

  /**
   * Lấy danh sách phiếu nhập kho đã duyệt chờ nhập kho
   */
  async findWarehouseEntryApproved(): Promise<PhieuNghiepVuDocument[]> {
    return await this.phieuNghiepVuModel
      .find({
        loaiPhieu: LoaiPhieu.NhapKho,
        trangThai: TrangThai.APPROVED,
      })
      .populate('nguoiTao', 'ten vaiTro')
      .populate('nguoiDuyet', 'ten vaiTro');
  }

  /**
   * Lấy danh sách phiếu nhập kho đã hoàn thành
   */
  async findWarehouseEntryCompleted(): Promise<PhieuNghiepVuDocument[]> {
    return await this.phieuNghiepVuModel
      .find({
        loaiPhieu: LoaiPhieu.NhapKho,
        trangThai: TrangThai.COMPLETED,
      })
      .populate('nguoiTao', 'ten vaiTro')
      .populate('nguoiDuyet', 'ten vaiTro');
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
        loaiPhieu: LoaiPhieu.NhapKho,
        trangThai: TrangThai.REVIEWED,
      }),
      this.phieuNghiepVuModel.countDocuments({
        loaiPhieu: LoaiPhieu.NhapKho,
        trangThai: TrangThai.APPROVED,
      }),
      this.phieuNghiepVuModel.countDocuments({
        loaiPhieu: LoaiPhieu.NhapKho,
        trangThai: TrangThai.COMPLETED,
      }),
      this.phieuNghiepVuModel.countDocuments({
        loaiPhieu: LoaiPhieu.NhapKho,
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
    if (createDto.loaiPhieu !== LoaiPhieu.XuatKho) {
      throw new BadRequestException('Chỉ có thể tạo phiếu xuất kho');
    }

    // Kiểm tra mã phiếu đã tồn tại
    const existingPhieu = await this.phieuNghiepVuModel.findOne({
      maPhieu: createDto.maPhieu,
    });
    if (existingPhieu) {
      throw new BadRequestException('Mã phiếu đã tồn tại');
    }

    // Tạo phiếu mới với trạng thái chờ duyệt
    const newPhieu = new this.phieuNghiepVuModel({
      ...createDto,
      trangThai: TrangThai.REVIEWED, // Chờ duyệt
      ngayTao: new Date(createDto.ngayTao),
      ngayCapNhat: new Date(),
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
    if (phieu.loaiPhieu !== LoaiPhieu.XuatKho) {
      throw new BadRequestException('Chỉ có thể duyệt phiếu xuất kho');
    }

    // Kiểm tra trạng thái hiện tại phải là chờ duyệt
    if (phieu.trangThai !== TrangThai.REVIEWED) {
      throw new BadRequestException('Phiếu không ở trạng thái chờ duyệt');
    }

    // Cập nhật thông tin duyệt
    const updateData: any = {
      trangThai: approveDto.trangThai,
      ngayDuyet: new Date(),
      ngayCapNhat: new Date(),
    };

    // Lưu ghi chú duyệt
    if (approveDto.ghiChu) {
      updateData.ghiChuDuyet = approveDto.ghiChu;
    }

    return await this.update(phieuId, updateData);
  }

  async batchApproveWarehouseExitTicket(
    batchApproveDto: BatchApprovePhieuXuatKhoDto,
  ): Promise<PhieuNghiepVuDocument[]> {
    const pnvs = await this.phieuNghiepVuModel.find({
      _id: { $in: batchApproveDto.phieuIds },
    });
    if (pnvs.length !== batchApproveDto.phieuIds.length) {
      throw new NotFoundException('Một số phiếu nghiệp vụ không tồn tại');
    }

    await this.phieuNghiepVuModel.updateMany(
      { _id: { $in: batchApproveDto.phieuIds } },
      { $set: { trangThai: TrangThai.COMPLETED, ngayCapNhat: new Date() } },
    );

    for (const pnv of pnvs) {
      if (pnv.bcsl && pnv.bcsl.length > 0) {
        const BaoCaoSanLuongModel = this.phieuNghiepVuModel.db.model(
          BaoCaoSanLuong.name,
        );
        const setData: any = {
          trangThai:
            pnv.loaiPhieu === LoaiPhieu.XuatKho
              ? BaoCaoState.EXPORTED
              : pnv.loaiPhieu === LoaiPhieu.NhapKho
                ? BaoCaoState.IMPORTED
                : BaoCaoState.FORWARDED,
          // ycsc_id: pnv.ycsc_id,
          // ycsx_id: pnv.ycsx_id,
          kho: pnv.kho,
          ngayCapNhat: new Date(),
        };
        if (batchApproveDto.viTri != null) {
          setData.viTri = batchApproveDto.viTri;
        }
        await BaoCaoSanLuongModel.updateMany(
          { _id: { $in: pnv.bcsl } },
          {
            $set: setData,
          },
        );
      }
    }

    return await this.phieuNghiepVuModel
      .find({
        _id: { $in: batchApproveDto.phieuIds },
      })
      .populate('bcsl');
  }

  /**
   * Xử lý xuất kho sau khi duyệt
   */
  async processWarehouseExit(
    warehouseExitDto: any,
  ): Promise<PhieuNghiepVuDocument> {
    const phieu = await this.phieuNghiepVuModel.findById(
      warehouseExitDto.phieuId,
    );
    if (!phieu) {
      throw new NotFoundException('Phiếu nghiệp vụ không tồn tại');
    }

    // Kiểm tra loại phiếu phải là xuất kho
    if (phieu.loaiPhieu !== LoaiPhieu.XuatKho) {
      throw new BadRequestException('Chỉ có thể xử lý phiếu xuất kho');
    }

    // Kiểm tra trạng thái phải là đã duyệt
    if (phieu.trangThai !== TrangThai.APPROVED) {
      throw new BadRequestException('Phiếu phải được duyệt trước khi xuất kho');
    }

    // Cập nhật trạng thái thành đã xuất kho
    const updateData: any = {
      trangThai: TrangThai.COMPLETED,
      ngayCapNhat: new Date(),
    };

    // Lưu thông tin người thực hiện xuất kho
    if (warehouseExitDto.ghiChu) {
      updateData.ghiChuXuatKho = warehouseExitDto.ghiChu;
    }

    return await this.update(warehouseExitDto.phieuId, updateData);
  }

  /**
   * Lấy danh sách phiếu xuất kho chờ duyệt
   */
  async findWarehouseExitPendingApproval(): Promise<PhieuNghiepVuDocument[]> {
    return await this.phieuNghiepVuModel
      .find({
        loaiPhieu: LoaiPhieu.XuatKho,
        trangThai: TrangThai.REVIEWED,
      })
      .populate('nguoiTao', 'ten vaiTro')
      .populate('nguoiDuyet', 'ten vaiTro');
  }

  /**
   * Lấy danh sách phiếu xuất kho đã duyệt
   */
  async findWarehouseExitApproved(): Promise<PhieuNghiepVuDocument[]> {
    return await this.phieuNghiepVuModel
      .find({
        loaiPhieu: LoaiPhieu.XuatKho,
        trangThai: TrangThai.APPROVED,
      })
      .populate('nguoiTao', 'ten vaiTro')
      .populate('nguoiDuyet', 'ten vaiTro');
  }

  /**
   * Lấy danh sách phiếu xuất kho đã hoàn thành
   */
  async findWarehouseExitCompleted(): Promise<PhieuNghiepVuDocument[]> {
    return await this.phieuNghiepVuModel
      .find({
        loaiPhieu: LoaiPhieu.XuatKho,
        trangThai: TrangThai.COMPLETED,
      })
      .populate('nguoiTao', 'ten vaiTro')
      .populate('nguoiDuyet', 'ten vaiTro');
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
        loaiPhieu: LoaiPhieu.XuatKho,
        trangThai: TrangThai.REVIEWED,
      }),
      this.phieuNghiepVuModel.countDocuments({
        loaiPhieu: LoaiPhieu.XuatKho,
        trangThai: TrangThai.APPROVED,
      }),
      this.phieuNghiepVuModel.countDocuments({
        loaiPhieu: LoaiPhieu.XuatKho,
        trangThai: TrangThai.COMPLETED,
      }),
      this.phieuNghiepVuModel.countDocuments({
        loaiPhieu: LoaiPhieu.XuatKho,
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
      maPhieu: createDto.maPhieu,
    });
    if (existingPhieu) {
      throw new BadRequestException('Mã phiếu đã tồn tại');
    }

    // Tạo báo cáo sản lượng mới với thông tin đá
    const BaoCaoSanLuongModel = this.phieuNghiepVuModel.db.model(
      BaoCaoSanLuong.name,
    );

    const newBaoCao = new BaoCaoSanLuongModel({
      ycsc: createDto.ycscId ? new Types.ObjectId(createDto.ycscId) : undefined,
      ycsx: createDto.ycsxId ? new Types.ObjectId(createDto.ycsxId) : undefined,
      hangMuc: createDto.hangMucId
        ? new Types.ObjectId(createDto.hangMucId)
        : undefined,
      maDa: createDto.maDa,
      mauDa: createDto.mauDa,
      quyCach: {
        dai: createDto.dai,
        rong: createDto.rong,
        day: createDto.day,
        soLuong: createDto.soLuong,
        dvtDoLuong: createDto.dvtDoLuong,
        dvtQuyCach: createDto.dvtQuyCach,
      },
      ngayTao: new Date(),
      trangThai: TrangThai.NEW, // Trạng thái mới tạo
      ngayCapNhat: new Date(),
      kho: Kho.KHO_BLOCK,
    });

    const savedBaoCao = await newBaoCao.save();

    // Tạo phiếu nghiệp vụ nhập kho
    const newPhieu = new this.phieuNghiepVuModel({
      maPhieu: createDto.maPhieu,
      loaiPhieu: LoaiPhieu.NhapKho,
      ycsc: createDto.ycscId ? new Types.ObjectId(createDto.ycscId) : undefined,
      ycsx: createDto.ycsxId ? new Types.ObjectId(createDto.ycsxId) : undefined,
      nguoiTao: new Types.ObjectId(createDto.nguoiTaoId),
      ngayTao: new Date(),
      nguoiDuyet: new Types.ObjectId(createDto.nguoiDuyetId),
      kho: Kho.KHO_BLOCK, // Mặc định là kho block
      trangThai: TrangThai.NEW, // Chờ duyệt
      bcsl: [savedBaoCao._id], // Liên kết với báo cáo sản lượng vừa tạo
      hangMuc: createDto.hangMucId
        ? [new Types.ObjectId(createDto.hangMucId)]
        : undefined,
      ngayCapNhat: new Date(),
    });

    return await newPhieu.save();
  }

  async batchRejectWarehouseExitTicket(
    batchRejectDto: BatchRejectPhieuXuatKhoDto,
  ): Promise<PhieuNghiepVuDocument[]> {
    const pnvs = await this.phieuNghiepVuModel.find({
      _id: { $in: batchRejectDto.phieuIds },
    });
    if (pnvs.length !== batchRejectDto.phieuIds.length) {
      throw new NotFoundException('Một số phiếu nghiệp vụ không tồn tại');
    }
    await this.phieuNghiepVuModel.updateMany(
      { _id: { $in: batchRejectDto.phieuIds } },
      { $set: { trangThai: TrangThai.CANCELLED, ngayCapNhat: new Date() } },
    );

    return await this.phieuNghiepVuModel.find({
      _id: { $in: batchRejectDto.phieuIds },
    });
  }
}
