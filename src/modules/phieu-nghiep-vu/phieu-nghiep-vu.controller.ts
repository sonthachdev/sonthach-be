/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Controller, Get, Post, Put, Body, Query, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiBody,
} from '@nestjs/swagger';
import { BaseController, CustomApiResponse } from '../../common/base';
import { PhieuNghiepVuService } from './phieu-nghiep-vu.service';
import { PhieuNghiepVuDocument } from '../../schemas';
import {
  CreatePhieuNghiepVuDto,
  ApprovePhieuNghiepVuDto,
  WarehouseEntryDto,
  CreateBlockWarehouseEntryDto,
  BlockWarehouseBatchImportDto,
  ListPhieuNghiepVuQueryDto,
} from './dto/phieu-nghiep-vu.dto';
import { BatchApprovePhieuXuatKhoDto } from './dto/phieu-nghiep-vu-xuat-kho.dto';

@ApiTags('phieu-nghiep-vu')
@Controller('api/phieu-nghiep-vu')
export class PhieuNghiepVuController extends BaseController<PhieuNghiepVuDocument> {
  constructor(private readonly phieuNghiepVuService: PhieuNghiepVuService) {
    super(phieuNghiepVuService);
  }

  /**
   * Lấy danh sách phiếu nghiệp vụ với bộ lọc tùy chọn
   */
  @Get('filter')
  @ApiOperation({
    summary: 'Danh sách phiếu nghiệp vụ',
    description: 'Lọc theo kho, trạng thái, công đoạn hiện tại, loại phiếu',
  })
  @ApiQuery({ name: 'kho', required: false })
  @ApiQuery({ name: 'trangThai', required: false })
  @ApiQuery({ name: 'currentCongDoan', required: false })
  @ApiQuery({ name: 'loaiPhieu', required: false })
  @ApiQuery({ name: 'sort', required: false })
  @ApiOkResponse({
    description: 'Lấy danh sách phiếu nghiệp vụ thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Lấy danh sách thành công' },
        data: { type: 'array', items: { description: 'Phiếu nghiệp vụ' } },
      },
    },
  })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async listPhieuNghiepVu(
    @Query() query: ListPhieuNghiepVuQueryDto,
  ): Promise<CustomApiResponse<any[]>> {
    try {
      const data = await this.phieuNghiepVuService.findByFilters(query);
      // const mapped = data.map((d: any) => ({
      //   _id: d?._id?.toString?.() ?? String(d?._id),
      //   maPhieu: d?.ma_phieu,
      //   loaiPhieu: d?.loai_phieu,
      //   ycscId: d?.ycsc_id ? String(d?.ycsc_id) : undefined,
      //   ycsxId: d?.ycsx_id ? String(d?.ycsx_id) : undefined,
      //   nguoiTao: d?.nguoi_tao_id ?? null,
      //   ngayTao: d?.ngay_tao ? new Date(d.ngay_tao).getTime() : undefined,
      //   nguoiDuyet: d?.nguoi_duyet_id ?? null,
      //   ngayDuyet: d?.ngay_duyet ? new Date(d.ngay_duyet).getTime() : undefined,
      //   kho: d?.kho ?? undefined,
      //   trangThai: d?.trang_thai,
      //   bcslIds: Array.isArray(d?.bcsl_ids)
      //     ? d.bcsl_ids.map((x: any) => (x?._id ? String(x._id) : String(x)))
      //     : [],
      //   bcsl: Array.isArray(d?.bcsl_ids) ? d.bcsl_ids : [],
      //   currentCongDoan: d?.current_cong_doan ?? undefined,
      //   nextCongDoan: d?.next_cong_doan ?? undefined,
      //   pallet: d?.pallet ?? undefined,
      //   theoDonHang: d?.theo_don_hang ?? undefined,
      // }));

      // const transformed = transformIdKey(mapped);
      return {
        success: true,
        message: 'Lấy danh sách thành công',
        data: data,
      };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Lỗi không xác định';
      return {
        success: false,
        message: 'Lấy danh sách thất bại',
        error: message,
      };
    }
  }

  /**
   * Tạo phiếu nhập kho mới
   */
  @Post('nhap-kho')
  @ApiOperation({
    summary: 'Tạo phiếu nhập kho mới',
    description: 'Tạo phiếu nhập kho với trạng thái chờ duyệt',
  })
  @ApiBody({
    type: CreatePhieuNghiepVuDto,
    description: 'Thông tin phiếu nhập kho',
  })
  @ApiOkResponse({
    description: 'Tạo phiếu nhập kho thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Tạo phiếu nhập kho thành công' },
        data: { description: 'Phiếu nhập kho đã tạo' },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Dữ liệu không hợp lệ' })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async createWarehouseEntryTicket(
    @Body() createDto: CreatePhieuNghiepVuDto,
  ): Promise<CustomApiResponse<PhieuNghiepVuDocument>> {
    try {
      const data =
        await this.phieuNghiepVuService.createWarehouseEntryTicket(createDto);
      return {
        success: true,
        message: 'Tạo phiếu nhập kho thành công',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Tạo phiếu nhập kho thất bại',
        error: error.message,
      };
    }
  }

  /**
   * Tạo phiếu nghiệp vụ nhập kho block với thông tin đá
   */
  @Post('nhap-kho-block')
  @ApiOperation({
    summary: 'Tạo phiếu nghiệp vụ nhập kho block với thông tin đá',
    description:
      'Tạo phiếu nhập kho block và tự động tạo báo cáo sản lượng với thông tin đá (mã đá, màu đá, kích thước)',
  })
  @ApiBody({
    type: CreateBlockWarehouseEntryDto,
    description: 'Thông tin phiếu nhập kho block với thông tin đá',
  })
  @ApiOkResponse({
    description: 'Tạo phiếu nhập kho block thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Tạo phiếu nhập kho block thành công',
        },
        data: { description: 'Phiếu nhập kho block đã tạo' },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Dữ liệu không hợp lệ' })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async createBlockWarehouseEntryTicket(
    @Body() createDto: CreateBlockWarehouseEntryDto,
  ): Promise<CustomApiResponse<PhieuNghiepVuDocument>> {
    try {
      const data =
        await this.phieuNghiepVuService.createBlockWarehouseEntryTicket(
          createDto,
        );
      return {
        success: true,
        message: 'Tạo phiếu nhập kho block thành công',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Tạo phiếu nhập kho block thất bại',
        error: error.message,
      };
    }
  }

  /**
   * Duyệt phiếu nhập kho
   */
  @Put(':id/duyet-nhap-kho')
  @ApiOperation({
    summary: 'Duyệt phiếu nhập kho',
    description:
      'Duyệt phiếu nhập kho và tự động thực hiện nhập kho (không cần gọi API nhap-kho riêng biệt)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID của phiếu nghiệp vụ',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({
    type: ApprovePhieuNghiepVuDto,
    description: 'Thông tin duyệt phiếu',
  })
  @ApiOkResponse({
    description: 'Duyệt phiếu nhập kho thành công và đã tự động nhập kho',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Duyệt phiếu nhập kho thành công và đã tự động nhập kho',
        },
        data: { description: 'Phiếu đã được duyệt và nhập kho' },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Dữ liệu không hợp lệ' })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async approveWarehouseEntryTicket(
    @Param('id') id: string,
    @Body() approveDto: ApprovePhieuNghiepVuDto,
  ): Promise<CustomApiResponse<PhieuNghiepVuDocument>> {
    try {
      const data = await this.phieuNghiepVuService.approveWarehouseEntryTicket(
        id,
        approveDto,
      );
      return {
        success: true,
        message: 'Duyệt phiếu nhập kho thành công và đã tự động nhập kho',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Duyệt phiếu nhập kho thất bại',
        error: error.message,
      };
    }
  }

  /**
   * Xử lý nhập kho
   */
  @Put('nhap-kho')
  @ApiOperation({
    summary: 'Xử lý nhập kho',
    description: 'Thực hiện nhập kho sau khi phiếu đã được duyệt',
  })
  @ApiBody({
    type: WarehouseEntryDto,
    description: 'Thông tin nhập kho',
  })
  @ApiOkResponse({
    description: 'Nhập kho thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Nhập kho thành công' },
        data: { description: 'Phiếu đã được nhập kho' },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Dữ liệu không hợp lệ' })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async processWarehouseEntry(
    @Body() warehouseEntryDto: WarehouseEntryDto,
  ): Promise<CustomApiResponse<PhieuNghiepVuDocument>> {
    try {
      const data =
        await this.phieuNghiepVuService.processWarehouseEntry(
          warehouseEntryDto,
        );
      return {
        success: true,
        message: 'Nhập kho thành công',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Nhập kho thất bại',
        error: error.message,
      };
    }
  }

  /**
   * Nhập kho block theo danh sách phiếu, cập nhật vị trí đơn hàng và set trạng thái imported
   */
  @Put('nhap-kho-block')
  @ApiOperation({
    summary: 'Nhập kho block hàng loạt',
    description:
      'Body gồm danh sách ID phiếu nghiệp vụ và 1 field vị trí đơn hàng; cập nhật vi_tri cho BCSL và set trạng thái imported',
  })
  @ApiBody({
    type: BlockWarehouseBatchImportDto,
    description: 'Danh sách ID phiếu và vị trí đơn hàng',
  })
  @ApiOkResponse({
    description: 'Cập nhật nhập kho block thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Nhập kho block thành công' },
        data: {
          type: 'object',
          properties: {
            updatedBaoCaoCount: { type: 'number' },
            updatedPhieuCount: { type: 'number' },
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Dữ liệu không hợp lệ' })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async batchImportBlock(
    @Body() dto: BlockWarehouseBatchImportDto,
  ): Promise<
    CustomApiResponse<{ updatedBaoCaoCount: number; updatedPhieuCount: number }>
  > {
    try {
      const data = await this.phieuNghiepVuService.batchImportBlock(dto);
      return {
        success: true,
        message: 'Nhập kho block thành công',
        data,
      };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Lỗi không xác định';
      return {
        success: false,
        message: 'Nhập kho block thất bại',
        error: message,
      };
    }
  }

  /**
   * Lấy danh sách phiếu nhập kho chờ duyệt
   */
  @Get('nhap-kho/cho-duyet')
  @ApiOperation({
    summary: 'Lấy danh sách phiếu nhập kho chờ duyệt',
    description: 'Lấy tất cả phiếu nhập kho có trạng thái chờ duyệt',
  })
  @ApiOkResponse({
    description: 'Lấy danh sách phiếu nhập kho chờ duyệt thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Lấy danh sách phiếu nhập kho chờ duyệt thành công',
        },
        data: {
          type: 'array',
          items: { description: 'Danh sách phiếu nhập kho chờ duyệt' },
        },
      },
    },
  })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async findWarehouseEntryPendingApproval(): Promise<
    CustomApiResponse<PhieuNghiepVuDocument[]>
  > {
    try {
      const data =
        await this.phieuNghiepVuService.findWarehouseEntryPendingApproval();
      return {
        success: true,
        message: 'Lấy danh sách phiếu nhập kho chờ duyệt thành công',
        data,
      };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Lỗi không xác định';
      return {
        success: false,
        message: 'Lấy danh sách phiếu nhập kho chờ duyệt thất bại',
        error: message,
      };
    }
  }

  /**
   * Lấy danh sách phiếu nhập kho đã duyệt
   */
  @Get('nhap-kho/da-duyet')
  @ApiOperation({
    summary: 'Lấy danh sách phiếu nhập kho đã duyệt',
    description:
      'Lấy tất cả phiếu nhập kho có trạng thái đã duyệt chờ nhập kho',
  })
  @ApiOkResponse({
    description: 'Lấy danh sách phiếu nhập kho đã duyệt thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Lấy danh sách phiếu nhập kho đã duyệt thành công',
        },
        data: {
          type: 'array',
          items: { description: 'Danh sách phiếu nhập kho đã duyệt' },
        },
      },
    },
  })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async findWarehouseEntryApproved(): Promise<
    CustomApiResponse<PhieuNghiepVuDocument[]>
  > {
    try {
      const data = await this.phieuNghiepVuService.findWarehouseEntryApproved();
      return {
        success: true,
        message: 'Lấy danh sách phiếu nhập kho đã duyệt thành công',
        data,
      };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Lỗi không xác định';
      return {
        success: false,
        message: 'Lấy danh sách phiếu nhập kho đã duyệt thất bại',
        error: message,
      };
    }
  }

  /**
   * Lấy danh sách phiếu nhập kho đã hoàn thành
   */
  @Get('nhap-kho/hoan-thanh')
  @ApiOperation({
    summary: 'Lấy danh sách phiếu nhập kho đã hoàn thành',
    description: 'Lấy tất cả phiếu nhập kho có trạng thái đã hoàn thành',
  })
  @ApiOkResponse({
    description: 'Lấy danh sách phiếu nhập kho đã hoàn thành thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Lấy danh sách phiếu nhập kho đã hoàn thành thành công',
        },
        data: {
          type: 'array',
          items: { description: 'Danh sách phiếu nhập kho đã hoàn thành' },
        },
      },
    },
  })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async findWarehouseEntryCompleted(): Promise<
    CustomApiResponse<PhieuNghiepVuDocument[]>
  > {
    try {
      const data =
        await this.phieuNghiepVuService.findWarehouseEntryCompleted();
      return {
        success: true,
        message: 'Lấy danh sách phiếu nhập kho đã hoàn thành thành công',
        data,
      };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Lỗi không xác định';
      return {
        success: false,
        message: 'Lấy danh sách phiếu nhập kho đã hoàn thành thất bại',
        error: message,
      };
    }
  }

  /**
   * Lấy thống kê phiếu nhập kho
   */
  @Get('nhap-kho/thong-ke')
  @ApiOperation({
    summary: 'Lấy thống kê phiếu nhập kho',
    description: 'Lấy số lượng phiếu nhập kho theo từng trạng thái',
  })
  @ApiOkResponse({
    description: 'Lấy thống kê phiếu nhập kho thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Lấy thống kê phiếu nhập kho thành công',
        },
        data: {
          type: 'object',
          properties: {
            pending: { type: 'number', description: 'Số phiếu chờ duyệt' },
            approved: { type: 'number', description: 'Số phiếu đã duyệt' },
            completed: {
              type: 'number',
              description: 'Số phiếu đã hoàn thành',
            },
            total: { type: 'number', description: 'Tổng số phiếu' },
          },
        },
      },
    },
  })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async getWarehouseEntryStats(): Promise<
    CustomApiResponse<{
      pending: number;
      approved: number;
      completed: number;
      total: number;
    }>
  > {
    try {
      const data = await this.phieuNghiepVuService.getWarehouseEntryStats();
      return {
        success: true,
        message: 'Lấy thống kê phiếu nhập kho thành công',
        data,
      };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Lỗi không xác định';
      return {
        success: false,
        message: 'Lấy thống kê phiếu nhập kho thất bại',
        error: message,
      };
    }
  }

  /**
   * Tạo phiếu xuất kho mới
   */
  @Post('xuat-kho')
  @ApiOperation({
    summary: 'Tạo phiếu xuất kho mới',
    description: 'Tạo phiếu xuất kho với trạng thái chờ duyệt',
  })
  @ApiBody({
    type: 'object',
    description: 'Thông tin phiếu xuất kho',
    schema: {
      type: 'object',
      properties: {
        ma_phieu: { type: 'string', example: 'PXK-2024-001' },
        ycsc_id: { type: 'string', example: '507f1f77bcf86cd799439011' },
        nguoi_tao_id: { type: 'string', example: '507f1f77bcf86cd799439011' },
        ngay_tao: { type: 'string', example: '2024-12-01T00:00:00.000Z' },
        nguoi_duyet_id: { type: 'string', example: '507f1f77bcf86cd799439011' },
        kho: { type: 'string', example: 'kho-block' },
        bcsl_ids: { type: 'array', items: { type: 'string' } },
        hang_muc_ids: { type: 'array', items: { type: 'string' } },
        ghi_chu: { type: 'string' },
      },
    },
  })
  @ApiOkResponse({
    description: 'Tạo phiếu xuất kho thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Tạo phiếu xuất kho thành công' },
        data: { description: 'Phiếu xuất kho đã tạo' },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Dữ liệu không hợp lệ' })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async createWarehouseExitTicket(
    @Body() createDto: Record<string, unknown>,
  ): Promise<CustomApiResponse<PhieuNghiepVuDocument>> {
    try {
      const data =
        await this.phieuNghiepVuService.createWarehouseExitTicket(createDto);
      return {
        success: true,
        message: 'Tạo phiếu xuất kho thành công',
        data,
      };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Lỗi không xác định';
      return {
        success: false,
        message: 'Tạo phiếu xuất kho thất bại',
        error: message,
      };
    }
  }

  /**
   * Duyệt phiếu xuất kho
   */
  @Put(':id/duyet-xuat-kho')
  @ApiOperation({
    summary: 'Duyệt phiếu xuất kho',
    description: 'Duyệt phiếu xuất kho và chuyển sang trạng thái đã duyệt',
  })
  @ApiParam({
    name: 'id',
    description: 'ID của phiếu nghiệp vụ',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({
    type: 'object',
    description: 'Thông tin duyệt phiếu',
    schema: {
      type: 'object',
      properties: {
        nguoi_duyet_id: { type: 'string', example: '507f1f77bcf86cd799439011' },
        trang_thai: { type: 'string', example: 'approved' },
        ghi_chu: { type: 'string' },
      },
    },
  })
  @ApiOkResponse({
    description: 'Duyệt phiếu xuất kho thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Duyệt phiếu xuất kho thành công' },
        data: { description: 'Phiếu đã được duyệt' },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Dữ liệu không hợp lệ' })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async approveWarehouseExitTicket(
    @Param('id') id: string,
    @Body() approveDto: Record<string, unknown>,
  ): Promise<CustomApiResponse<PhieuNghiepVuDocument>> {
    try {
      const data = await this.phieuNghiepVuService.approveWarehouseExitTicket(
        id,
        approveDto,
      );
      return {
        success: true,
        message: 'Duyệt phiếu xuất kho thành công',
        data,
      };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Lỗi không xác định';
      return {
        success: false,
        message: 'Duyệt phiếu xuất kho thất bại',
        error: message,
      };
    }
  }

  /**
   * Duyệt nhiều phiếu xuất kho
   */
  @Put('batch-duyet')
  @ApiOperation({
    summary: 'Duyệt nhiều phiếu xuất/nhập kho',
  })
  @ApiBody({ type: BatchApprovePhieuXuatKhoDto })
  @ApiOkResponse({
    description: 'Duyệt nhiều phiếu xuất/nhập kho thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Duyệt nhiều phiếu xuất/nhập kho thành công',
        },
        data: { description: 'Các phiếu đã được duyệt' },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Dữ liệu không hợp lệ' })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async batchApproveWarehouseExitTicket(
    @Body() batchApproveDto: BatchApprovePhieuXuatKhoDto,
  ): Promise<CustomApiResponse<PhieuNghiepVuDocument[]>> {
    try {
      const data =
        await this.phieuNghiepVuService.batchApproveWarehouseExitTicket(
          batchApproveDto,
        );
      return {
        success: true,
        message: 'Duyệt nhiều phiếu xuất/nhập kho thành công',
        data,
      };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Lỗi không xác định';
      return {
        success: false,
        message: 'Duyệt nhiều phiếu xuất/nhập kho thất bại',
        error: message,
      };
    }
  }

  /**
   * Xử lý xuất kho
   */
  @Put('xuat-kho')
  @ApiOperation({
    summary: 'Xử lý xuất kho',
    description: 'Thực hiện xuất kho sau khi phiếu đã được duyệt',
  })
  @ApiBody({
    type: 'object',
    description: 'Thông tin xuất kho',
    schema: {
      type: 'object',
      properties: {
        phieu_id: { type: 'string', example: '507f1f77bcf86cd799439011' },
        nguoi_thuc_hien_id: {
          type: 'string',
          example: '507f1f77bcf86cd799439011',
        },
        ghi_chu: { type: 'string' },
      },
    },
  })
  @ApiOkResponse({
    description: 'Xuất kho thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Xuất kho thành công' },
        data: { description: 'Phiếu đã được xuất kho' },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Dữ liệu không hợp lệ' })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async processWarehouseExit(
    @Body() warehouseExitDto: Record<string, unknown>,
  ): Promise<CustomApiResponse<PhieuNghiepVuDocument>> {
    try {
      const data =
        await this.phieuNghiepVuService.processWarehouseExit(warehouseExitDto);
      return {
        success: true,
        message: 'Xuất kho thành công',
        data,
      };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Lỗi không xác định';
      return {
        success: false,
        message: 'Xuất kho thất bại',
        error: message,
      };
    }
  }

  /**
   * Lấy danh sách phiếu xuất kho chờ duyệt
   */
  @Get('xuat-kho/cho-duyet')
  @ApiOperation({
    summary: 'Lấy danh sách phiếu xuất kho chờ duyệt',
    description: 'Lấy tất cả phiếu xuất kho có trạng thái chờ duyệt',
  })
  @ApiOkResponse({
    description: 'Lấy danh sách phiếu xuất kho chờ duyệt thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Lấy danh sách phiếu xuất kho chờ duyệt thành công',
        },
        data: {
          type: 'array',
          items: { description: 'Danh sách phiếu xuất kho chờ duyệt' },
        },
      },
    },
  })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async findWarehouseExitPendingApproval(): Promise<
    CustomApiResponse<PhieuNghiepVuDocument[]>
  > {
    try {
      const data =
        await this.phieuNghiepVuService.findWarehouseExitPendingApproval();
      return {
        success: true,
        message: 'Lấy danh sách phiếu xuất kho chờ duyệt thành công',
        data,
      };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Lỗi không xác định';
      return {
        success: false,
        message: 'Lấy danh sách phiếu xuất kho chờ duyệt thất bại',
        error: message,
      };
    }
  }

  /**
   * Lấy danh sách phiếu xuất kho đã duyệt
   */
  @Get('xuat-kho/da-duyet')
  @ApiOperation({
    summary: 'Lấy danh sách phiếu xuất kho đã duyệt',
    description:
      'Lấy tất cả phiếu xuất kho có trạng thái đã duyệt chờ xuất kho',
  })
  @ApiOkResponse({
    description: 'Lấy danh sách phiếu xuất kho đã duyệt thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Lấy danh sách phiếu xuất kho đã duyệt thành công',
        },
        data: {
          type: 'array',
          items: { description: 'Danh sách phiếu xuất kho đã duyệt' },
        },
      },
    },
  })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async findWarehouseExitApproved(): Promise<
    CustomApiResponse<PhieuNghiepVuDocument[]>
  > {
    try {
      const data = await this.phieuNghiepVuService.findWarehouseExitApproved();
      return {
        success: true,
        message: 'Lấy danh sách phiếu xuất kho đã duyệt thành công',
        data,
      };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Lỗi không xác định';
      return {
        success: false,
        message: 'Lấy danh sách phiếu xuất kho đã duyệt thất bại',
        error: message,
      };
    }
  }

  /**
   * Lấy danh sách phiếu xuất kho đã hoàn thành
   */
  @Get('xuat-kho/hoan-thanh')
  @ApiOperation({
    summary: 'Lấy danh sách phiếu xuất kho đã hoàn thành',
    description: 'Lấy tất cả phiếu xuất kho có trạng thái đã hoàn thành',
  })
  @ApiOkResponse({
    description: 'Lấy danh sách phiếu xuất kho đã hoàn thành thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Lấy danh sách phiếu xuất kho đã hoàn thành thành công',
        },
        data: {
          type: 'array',
          items: { description: 'Danh sách phiếu xuất kho đã hoàn thành' },
        },
      },
    },
  })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async findWarehouseExitCompleted(): Promise<
    CustomApiResponse<PhieuNghiepVuDocument[]>
  > {
    try {
      const data = await this.phieuNghiepVuService.findWarehouseExitCompleted();
      return {
        success: true,
        message: 'Lấy danh sách phiếu xuất kho đã hoàn thành thành công',
        data,
      };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Lỗi không xác định';
      return {
        success: false,
        message: 'Lấy danh sách phiếu xuất kho đã hoàn thành thất bại',
        error: message,
      };
    }
  }

  /**
   * Lấy thống kê phiếu xuất kho
   */
  @Get('xuat-kho/thong-ke')
  @ApiOperation({
    summary: 'Lấy thống kê phiếu xuất kho',
    description: 'Lấy số lượng phiếu xuất kho theo từng trạng thái',
  })
  @ApiOkResponse({
    description: 'Lấy thống kê phiếu xuất kho thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Lấy thống kê phiếu xuất kho thành công',
        },
        data: {
          type: 'object',
          properties: {
            pending: { type: 'number', description: 'Số phiếu chờ duyệt' },
            approved: { type: 'number', description: 'Số phiếu đã duyệt' },
            completed: {
              type: 'number',
              description: 'Số phiếu đã hoàn thành',
            },
            total: { type: 'number', description: 'Tổng số phiếu' },
          },
        },
      },
    },
  })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async getWarehouseExitStats(): Promise<
    CustomApiResponse<{
      pending: number;
      approved: number;
      completed: number;
      total: number;
    }>
  > {
    try {
      const data = await this.phieuNghiepVuService.getWarehouseExitStats();
      return {
        success: true,
        message: 'Lấy thống kê phiếu xuất kho thành công',
        data,
      };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Lỗi không xác định';
      return {
        success: false,
        message: 'Lấy thống kê phiếu xuất kho thất bại',
        error: message,
      };
    }
  }

  /**
   * Lấy danh sách phiếu nghiệp vụ theo loại phiếu
   */
  @Get('loai-phieu/:loaiPhieu')
  @ApiOperation({
    summary: 'Lấy danh sách phiếu nghiệp vụ theo loại phiếu',
    description: 'Tìm kiếm phiếu nghiệp vụ dựa trên loại phiếu cụ thể',
  })
  @ApiParam({
    name: 'loaiPhieu',
    description: 'Loại phiếu',
    example: 'nhap-kho',
  })
  @ApiOkResponse({
    description: 'Lấy danh sách phiếu nghiệp vụ theo loại phiếu thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Lấy danh sách phiếu nghiệp vụ theo loại phiếu thành công',
        },
        data: {
          type: 'array',
          items: { description: 'Danh sách phiếu nghiệp vụ theo loại phiếu' },
        },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Loại phiếu không hợp lệ' })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async findByLoaiPhieu(
    @Param('loaiPhieu') loaiPhieu: string,
  ): Promise<CustomApiResponse<PhieuNghiepVuDocument[]>> {
    try {
      const data = await this.phieuNghiepVuService.findByLoaiPhieu(loaiPhieu);
      return {
        success: true,
        message: 'Lấy danh sách phiếu nghiệp vụ theo loại phiếu thành công',
        data,
      };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Lỗi không xác định';
      return {
        success: false,
        message: 'Lấy danh sách phiếu nghiệp vụ theo loại phiếu thất bại',
        error: message,
      };
    }
  }

  /**
   * Lấy danh sách phiếu nghiệp vụ theo trạng thái
   */
  @Get('trang-thai/:trangThai')
  @ApiOperation({
    summary: 'Lấy danh sách phiếu nghiệp vụ theo trạng thái',
    description: 'Tìm kiếm phiếu nghiệp vụ dựa trên trạng thái cụ thể',
  })
  @ApiParam({
    name: 'trangThai',
    description: 'Trạng thái phiếu',
    example: 'cho-xu-ly',
  })
  @ApiOkResponse({
    description: 'Lấy danh sách phiếu nghiệp vụ theo trạng thái thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Lấy danh sách phiếu nghiệp vụ theo trạng thái thành công',
        },
        data: {
          type: 'array',
          items: { description: 'Danh sách phiếu nghiệp vụ theo trạng thái' },
        },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Trạng thái không hợp lệ' })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async findByTrangThai(
    @Param('trangThai') trangThai: string,
  ): Promise<CustomApiResponse<PhieuNghiepVuDocument[]>> {
    try {
      const data = await this.phieuNghiepVuService.findByTrangThai(trangThai);
      return {
        success: true,
        message: 'Lấy danh sách phiếu nghiệp vụ theo trạng thái thành công',
        data,
      };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Lỗi không xác định';
      return {
        success: false,
        message: 'Lấy danh sách phiếu nghiệp vụ theo trạng thái thất bại',
        error: message,
      };
    }
  }

  /**
   * Lấy danh sách phiếu nghiệp vụ theo nhân viên
   */
  @Get('nhan-vien/:nhanVienId')
  @ApiOperation({
    summary: 'Lấy danh sách phiếu nghiệp vụ theo nhân viên',
    description: 'Tìm kiếm phiếu nghiệp vụ dựa trên nhân viên cụ thể',
  })
  @ApiParam({
    name: 'nhanVienId',
    description: 'ID của nhân viên',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiOkResponse({
    description: 'Lấy danh sách phiếu nghiệp vụ theo nhân viên thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Lấy danh sách phiếu nghiệp vụ theo nhân viên thành công',
        },
        data: {
          type: 'array',
          items: { description: 'Danh sách phiếu nghiệp vụ theo nhân viên' },
        },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'ID nhân viên không hợp lệ' })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async findByNhanVien(
    @Param('nhanVienId') nhanVienId: string,
  ): Promise<CustomApiResponse<PhieuNghiepVuDocument[]>> {
    try {
      const data = await this.phieuNghiepVuService.findByNhanVien(nhanVienId);
      return {
        success: true,
        message: 'Lấy danh sách phiếu nghiệp vụ theo nhân viên thành công',
        data,
      };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Lỗi không xác định';
      return {
        success: false,
        message: 'Lấy danh sách phiếu nghiệp vụ theo nhân viên thất bại',
        error: message,
      };
    }
  }

  /**
   * Lấy danh sách phiếu nghiệp vụ theo kho
   */
  @Get('kho/:kho')
  @ApiOperation({
    summary: 'Lấy danh sách phiếu nghiệp vụ theo kho',
    description: 'Tìm kiếm phiếu nghiệp vụ dựa trên kho cụ thể',
  })
  @ApiParam({ name: 'kho', description: 'Tên kho', example: 'kho-a' })
  @ApiOkResponse({
    description: 'Lấy danh sách phiếu nghiệp vụ theo kho thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Lấy danh sách phiếu nghiệp vụ theo kho thành công',
        },
        data: {
          type: 'array',
          items: { description: 'Danh sách phiếu nghiệp vụ theo kho' },
        },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Tên kho không hợp lệ' })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async findByKho(
    @Param('kho') kho: string,
  ): Promise<CustomApiResponse<PhieuNghiepVuDocument[]>> {
    try {
      const data = await this.phieuNghiepVuService.findByKho(kho);
      return {
        success: true,
        message: 'Lấy danh sách phiếu nghiệp vụ theo kho thành công',
        data,
      };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Lỗi không xác định';
      return {
        success: false,
        message: 'Lấy danh sách phiếu nghiệp vụ theo kho thất bại',
        error: message,
      };
    }
  }

  /**
   * Lấy danh sách phiếu nghiệp vụ theo ngày tạo
   */
  @Get('ngay-tao')
  @ApiOperation({
    summary: 'Lấy danh sách phiếu nghiệp vụ theo ngày tạo',
    description: 'Tìm kiếm phiếu nghiệp vụ dựa trên ngày tạo cụ thể',
  })
  @ApiQuery({
    name: 'ngayTao',
    description: 'Ngày tạo (YYYY-MM-DD)',
    example: '2024-12-01',
  })
  @ApiOkResponse({
    description: 'Lấy danh sách phiếu nghiệp vụ theo ngày tạo thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Lấy danh sách phiếu nghiệp vụ theo ngày tạo thành công',
        },
        data: {
          type: 'array',
          items: { description: 'Danh sách phiếu nghiệp vụ theo ngày tạo' },
        },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Ngày không hợp lệ' })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async findByNgayTao(
    @Query('ngayTao') ngayTao: string,
  ): Promise<CustomApiResponse<PhieuNghiepVuDocument[]>> {
    try {
      const data = await this.phieuNghiepVuService.findByNgayTao(
        new Date(ngayTao),
      );
      return {
        success: true,
        message: 'Lấy danh sách phiếu nghiệp vụ theo ngày tạo thành công',
        data,
      };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Lỗi không xác định';
      return {
        success: false,
        message: 'Lấy danh sách phiếu nghiệp vụ theo ngày tạo thất bại',
        error: message,
      };
    }
  }

  /**
   * Lấy danh sách phiếu nghiệp vụ theo khoảng thời gian
   */
  @Get('khoang-thoi-gian')
  @ApiOperation({
    summary: 'Lấy danh sách phiếu nghiệp vụ theo khoảng thời gian',
    description: 'Tìm kiếm phiếu nghiệp vụ trong khoảng thời gian cụ thể',
  })
  @ApiQuery({
    name: 'tuNgay',
    description: 'Từ ngày (YYYY-MM-DD)',
    example: '2024-01-01',
  })
  @ApiQuery({
    name: 'denNgay',
    description: 'Đến ngày (YYYY-MM-DD)',
    example: '2024-12-31',
  })
  @ApiOkResponse({
    description:
      'Lấy danh sách phiếu nghiệp vụ theo khoảng thời gian thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example:
            'Lấy danh sách phiếu nghiệp vụ theo khoảng thời gian thành công',
        },
        data: {
          type: 'array',
          items: {
            description: 'Danh sách phiếu nghiệp vụ theo khoảng thời gian',
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Ngày không hợp lệ' })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async findByKhoangThoiGian(
    @Query('tuNgay') tuNgay: string,
    @Query('denNgay') denNgay: string,
  ): Promise<CustomApiResponse<PhieuNghiepVuDocument[]>> {
    try {
      const data = await this.phieuNghiepVuService.findByKhoangThoiGian(
        new Date(tuNgay),
        new Date(denNgay),
      );
      return {
        success: true,
        message:
          'Lấy danh sách phiếu nghiệp vụ theo khoảng thời gian thành công',
        data,
      };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Lỗi không xác định';
      return {
        success: false,
        message: 'Lấy danh sách phiếu nghiệp vụ theo khoảng thời gian thất bại',
        error: message,
      };
    }
  }

  /**
   * Lấy danh sách phiếu nghiệp vụ chờ xử lý
   */
  @Get('cho-xu-ly')
  @ApiOperation({
    summary: 'Lấy danh sách phiếu nghiệp vụ chờ xử lý',
    description: 'Tìm kiếm tất cả phiếu nghiệp vụ có trạng thái chờ xử lý',
  })
  @ApiOkResponse({
    description: 'Lấy danh sách phiếu nghiệp vụ chờ xử lý thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Lấy danh sách phiếu nghiệp vụ chờ xử lý thành công',
        },
        data: {
          type: 'array',
          items: { description: 'Danh sách phiếu nghiệp vụ chờ xử lý' },
        },
      },
    },
  })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async findChoXuLy(): Promise<CustomApiResponse<PhieuNghiepVuDocument[]>> {
    try {
      const data = await this.phieuNghiepVuService.findChoXuLy();
      return {
        success: true,
        message: 'Lấy danh sách phiếu nghiệp vụ chờ xử lý thành công',
        data,
      };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Lỗi không xác định';
      return {
        success: false,
        message: 'Lấy danh sách phiếu nghiệp vụ chờ xử lý thất bại',
        error: message,
      };
    }
  }

  /**
   * Cập nhật trạng thái phiếu nghiệp vụ
   */
  @Get(':id/trang-thai/:trangThai')
  @ApiOperation({
    summary: 'Cập nhật trạng thái phiếu nghiệp vụ',
    description: 'Cập nhật trạng thái của phiếu nghiệp vụ cụ thể',
  })
  @ApiParam({
    name: 'id',
    description: 'ID của phiếu nghiệp vụ',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiParam({
    name: 'trangThai',
    description: 'Trạng thái mới',
    example: 'dang-xu-ly',
  })
  @ApiOkResponse({
    description: 'Cập nhật trạng thái thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Cập nhật trạng thái thành công' },
        data: { description: 'Phiếu nghiệp vụ đã cập nhật' },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'ID hoặc trạng thái không hợp lệ' })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async updateTrangThai(
    @Param('id') id: string,
    @Param('trangThai') trangThai: string,
  ): Promise<CustomApiResponse<PhieuNghiepVuDocument>> {
    try {
      const data = await this.phieuNghiepVuService.updateTrangThai(
        id,
        trangThai,
      );
      return {
        success: true,
        message: 'Cập nhật trạng thái thành công',
        data,
      };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Lỗi không xác định';
      return {
        success: false,
        message: 'Cập nhật trạng thái thất bại',
        error: message,
      };
    }
  }
}
