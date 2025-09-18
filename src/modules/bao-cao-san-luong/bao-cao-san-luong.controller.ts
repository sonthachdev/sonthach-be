import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Query,
  Param,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
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
import { BaoCaoSanLuongService } from './bao-cao-san-luong.service';
import { BaoCaoSanLuongDocument, PhieuNghiepVuDocument } from '../../schemas';
import {
  CreateBaoCaoSanLuongDto,
  ApproveBaoCaoSanLuongDto,
  RejectBaoCaoSanLuongDto,
  ImportBaoCaoSanLuongDto,
  FilterBaoCaoSanLuongDto,
  UpdatePalletBaoCaoSanLuongDto,
  XuatHoaDonBaoCaoSanLuongDto,
} from './dto/bao-cao-san-luong.dto';

@ApiTags('bao-cao-san-luong')
@Controller('api/bao-cao-san-luong')
export class BaoCaoSanLuongController extends BaseController<BaoCaoSanLuongDocument> {
  constructor(private readonly baoCaoSanLuongService: BaoCaoSanLuongService) {
    super(baoCaoSanLuongService);
  }

  /**
   * Lọc báo cáo sản lượng theo các tiêu chí
   */
  @Get('filter')
  @ApiOperation({
    summary: 'Lọc báo cáo sản lượng',
    description:
      'Lọc theo mauDa, dai, rong, day, viTri, trangThai, kho, ycscId, ycsxId',
  })
  @ApiQuery({ name: 'mauDa', required: false })
  @ApiQuery({ name: 'dai', required: false })
  @ApiQuery({ name: 'rong', required: false })
  @ApiQuery({ name: 'day', required: false })
  @ApiQuery({ name: 'viTri', required: false })
  @ApiQuery({ name: 'trangThai', required: false })
  @ApiQuery({ name: 'kho', required: false })
  @ApiQuery({ name: 'ycscId', required: false })
  @ApiQuery({ name: 'ycsxId', required: false })
  @UsePipes(new ValidationPipe({ transform: true }))
  async filter(
    @Query() query: FilterBaoCaoSanLuongDto,
  ): Promise<CustomApiResponse<BaoCaoSanLuongDocument[]>> {
    try {
      const data = await this.baoCaoSanLuongService.filterBaoCaoSanLuong(query);
      return {
        success: true,
        message: 'Lọc báo cáo sản lượng thành công',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Lọc báo cáo sản lượng thất bại',
        error: (error as Error).message,
      };
    }
  }

  /**
   * Tạo báo cáo sản lượng mới
   */
  @Post()
  @ApiOperation({
    summary: 'Tạo báo cáo sản lượng mới',
    description: 'Tạo báo cáo sản lượng với trạng thái mới tạo',
  })
  @ApiBody({
    type: CreateBaoCaoSanLuongDto,
    description: 'Thông tin báo cáo sản lượng',
  })
  @ApiOkResponse({
    description: 'Tạo báo cáo sản lượng thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Tạo báo cáo sản lượng thành công',
        },
        data: { description: 'Báo cáo sản lượng đã tạo' },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Dữ liệu không hợp lệ' })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async createBaoCaoSanLuong(
    @Body() createDto: CreateBaoCaoSanLuongDto,
  ): Promise<CustomApiResponse<BaoCaoSanLuongDocument>> {
    try {
      const data =
        await this.baoCaoSanLuongService.createBaoCaoSanLuong(createDto);
      return {
        success: true,
        message: 'Tạo báo cáo sản lượng thành công',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Tạo báo cáo sản lượng thất bại',
        error: (error as Error).message,
      };
    }
  }

  /**
   * Duyệt báo cáo sản lượng
   */
  @Put(':id/duyet')
  @ApiOperation({
    summary: 'Duyệt báo cáo sản lượng',
    description: 'Duyệt báo cáo sản lượng và chuyển sang trạng thái đã duyệt',
  })
  @ApiParam({
    name: 'id',
    description: 'ID của báo cáo sản lượng',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({
    type: ApproveBaoCaoSanLuongDto,
    description: 'Thông tin duyệt báo cáo',
  })
  @ApiOkResponse({
    description: 'Duyệt báo cáo sản lượng thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Duyệt báo cáo sản lượng thành công',
        },
        data: { description: 'Báo cáo đã được duyệt' },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Dữ liệu không hợp lệ' })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async approveBaoCaoSanLuong(
    @Param('id') id: string,
    @Body() approveDto: ApproveBaoCaoSanLuongDto,
  ): Promise<CustomApiResponse<BaoCaoSanLuongDocument>> {
    try {
      const data = await this.baoCaoSanLuongService.approveBaoCaoSanLuong(
        id,
        approveDto,
      );
      return {
        success: true,
        message: 'Duyệt báo cáo sản lượng thành công',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Duyệt báo cáo sản lượng thất bại',
        error: (error as Error).message,
      };
    }
  }

  /**
   * Từ chối báo cáo sản lượng
   */
  @Put(':id/tu-choi')
  @ApiOperation({
    summary: 'Từ chối báo cáo sản lượng',
    description:
      'Từ chối báo cáo sản lượng và chuyển sang trạng thái bị từ chối',
  })
  @ApiParam({
    name: 'id',
    description: 'ID của báo cáo sản lượng',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({
    type: RejectBaoCaoSanLuongDto,
    description: 'Thông tin từ chối báo cáo',
  })
  @ApiOkResponse({
    description: 'Từ chối báo cáo sản lượng thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Từ chối báo cáo sản lượng thành công',
        },
        data: { description: 'Báo cáo đã bị từ chối' },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Dữ liệu không hợp lệ' })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async rejectBaoCaoSanLuong(
    @Param('id') id: string,
    @Body() rejectDto: RejectBaoCaoSanLuongDto,
  ): Promise<CustomApiResponse<BaoCaoSanLuongDocument>> {
    try {
      const data = await this.baoCaoSanLuongService.rejectBaoCaoSanLuong(
        id,
        rejectDto,
      );
      return {
        success: true,
        message: 'Từ chối báo cáo sản lượng thành công',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Từ chối báo cáo sản lượng thất bại',
        error: (error as Error).message,
      };
    }
  }

  /**
   * Nhập kho báo cáo sản lượng (chuyển thành phôi)
   */
  @Put('nhap-kho')
  @ApiOperation({
    summary: 'Nhập kho báo cáo sản lượng',
    description: 'Nhập kho báo cáo sản lượng đã duyệt để chuyển thành phôi',
  })
  @ApiBody({
    type: ImportBaoCaoSanLuongDto,
    description: 'Thông tin nhập kho',
  })
  @ApiOkResponse({
    description: 'Nhập kho báo cáo sản lượng thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Nhập kho báo cáo sản lượng thành công',
        },
        data: { description: 'Báo cáo đã được nhập kho' },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Dữ liệu không hợp lệ' })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async importBaoCaoSanLuong(
    @Body() importDto: ImportBaoCaoSanLuongDto,
  ): Promise<CustomApiResponse<BaoCaoSanLuongDocument>> {
    try {
      const data =
        await this.baoCaoSanLuongService.importBaoCaoSanLuong(importDto);
      return {
        success: true,
        message: 'Nhập kho báo cáo sản lượng thành công',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Nhập kho báo cáo sản lượng thất bại',
        error: (error as Error).message,
      };
    }
  }

  /**
   * Lấy danh sách báo cáo sản lượng chờ duyệt
   */
  @Get('cho-duyet')
  @ApiOperation({
    summary: 'Lấy danh sách báo cáo sản lượng chờ duyệt',
    description: 'Lấy tất cả báo cáo sản lượng có trạng thái mới tạo',
  })
  @ApiOkResponse({
    description: 'Lấy danh sách báo cáo sản lượng chờ duyệt thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Lấy danh sách báo cáo sản lượng chờ duyệt thành công',
        },
        data: {
          type: 'array',
          items: { description: 'Danh sách báo cáo sản lượng chờ duyệt' },
        },
      },
    },
  })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async findPendingApproval(): Promise<
    CustomApiResponse<BaoCaoSanLuongDocument[]>
  > {
    try {
      const data = await this.baoCaoSanLuongService.findPendingApproval();
      return {
        success: true,
        message: 'Lấy danh sách báo cáo sản lượng chờ duyệt thành công',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Lấy danh sách báo cáo sản lượng chờ duyệt thất bại',
        error: (error as Error).message,
      };
    }
  }

  /**
   * Lấy danh sách báo cáo sản lượng đã duyệt
   */
  @Get('da-duyet')
  @ApiOperation({
    summary: 'Lấy danh sách báo cáo sản lượng đã duyệt',
    description: 'Lấy tất cả báo cáo sản lượng có trạng thái đã duyệt',
  })
  @ApiOkResponse({
    description: 'Lấy danh sách báo cáo sản lượng đã duyệt thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Lấy danh sách báo cáo sản lượng đã duyệt thành công',
        },
        data: {
          type: 'array',
          items: { description: 'Danh sách báo cáo sản lượng đã duyệt' },
        },
      },
    },
  })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async findApproved(): Promise<CustomApiResponse<BaoCaoSanLuongDocument[]>> {
    try {
      const data = await this.baoCaoSanLuongService.findApproved();
      return {
        success: true,
        message: 'Lấy danh sách báo cáo sản lượng đã duyệt thành công',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Lấy danh sách báo cáo sản lượng đã duyệt thất bại',
        error: (error as Error).message,
      };
    }
  }

  /**
   * Lấy danh sách báo cáo sản lượng đã nhập kho (phôi)
   */
  @Get('da-nhap-kho')
  @ApiOperation({
    summary: 'Lấy danh sách báo cáo sản lượng đã nhập kho',
    description: 'Lấy tất cả báo cáo sản lượng đã nhập kho (thành phôi)',
  })
  @ApiOkResponse({
    description: 'Lấy danh sách báo cáo sản lượng đã nhập kho thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Lấy danh sách báo cáo sản lượng đã nhập kho thành công',
        },
        data: {
          type: 'array',
          items: { description: 'Danh sách báo cáo sản lượng đã nhập kho' },
        },
      },
    },
  })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async findImported(): Promise<CustomApiResponse<BaoCaoSanLuongDocument[]>> {
    try {
      const data = await this.baoCaoSanLuongService.findImported();
      return {
        success: true,
        message: 'Lấy danh sách báo cáo sản lượng đã nhập kho thành công',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Lấy danh sách báo cáo sản lượng đã nhập kho thất bại',
        error: (error as Error).message,
      };
    }
  }

  /**
   * Lấy danh sách báo cáo sản lượng bị từ chối
   */
  @Get('bi-tu-choi')
  @ApiOperation({
    summary: 'Lấy danh sách báo cáo sản lượng bị từ chối',
    description: 'Lấy tất cả báo cáo sản lượng có trạng thái bị từ chối',
  })
  @ApiOkResponse({
    description: 'Lấy danh sách báo cáo sản lượng bị từ chối thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Lấy danh sách báo cáo sản lượng bị từ chối thành công',
        },
        data: {
          type: 'array',
          items: { description: 'Danh sách báo cáo sản lượng bị từ chối' },
        },
      },
    },
  })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async findRejected(): Promise<CustomApiResponse<BaoCaoSanLuongDocument[]>> {
    try {
      const data = await this.baoCaoSanLuongService.findRejected();
      return {
        success: true,
        message: 'Lấy danh sách báo cáo sản lượng bị từ chối thành công',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Lấy danh sách báo cáo sản lượng bị từ chối thất bại',
        error: (error as Error).message,
      };
    }
  }

  /**
   * Lấy thống kê báo cáo sản lượng
   */
  @Get('thong-ke')
  @ApiOperation({
    summary: 'Lấy thống kê báo cáo sản lượng',
    description: 'Lấy số lượng báo cáo sản lượng theo từng trạng thái',
  })
  @ApiOkResponse({
    description: 'Lấy thống kê báo cáo sản lượng thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Lấy thống kê báo cáo sản lượng thành công',
        },
        data: {
          type: 'object',
          properties: {
            new: { type: 'number', description: 'Số báo cáo mới tạo' },
            approved: { type: 'number', description: 'Số báo cáo đã duyệt' },
            rejected: { type: 'number', description: 'Số báo cáo bị từ chối' },
            imported: { type: 'number', description: 'Số báo cáo đã nhập kho' },
            total: { type: 'number', description: 'Tổng số báo cáo' },
          },
        },
      },
    },
  })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async getBaoCaoSanLuongStats(): Promise<
    CustomApiResponse<{
      new: number;
      approved: number;
      rejected: number;
      imported: number;
      total: number;
    }>
  > {
    try {
      const data = await this.baoCaoSanLuongService.getBaoCaoSanLuongStats();
      return {
        success: true,
        message: 'Lấy thống kê báo cáo sản lượng thành công',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Lấy thống kê báo cáo sản lượng thất bại',
        error: (error as Error).message,
      };
    }
  }

  /**
   * Lấy danh sách báo cáo sản lượng theo tháng và năm
   */
  @Get('thang/:thang/nam/:nam')
  @ApiOperation({
    summary: 'Lấy danh sách báo cáo sản lượng theo tháng và năm',
    description: 'Tìm kiếm báo cáo sản lượng dựa trên tháng và năm cụ thể',
  })
  @ApiParam({ name: 'thang', description: 'Tháng (1-12)', example: 12 })
  @ApiParam({ name: 'nam', description: 'Năm', example: 2024 })
  @ApiOkResponse({
    description: 'Lấy danh sách báo cáo sản lượng theo tháng và năm thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example:
            'Lấy danh sách báo cáo sản lượng theo tháng và năm thành công',
        },
        data: {
          type: 'array',
          items: {
            description: 'Danh sách báo cáo sản lượng theo tháng và năm',
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Tháng hoặc năm không hợp lệ' })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async findByThangNam(
    @Param('thang') thang: string,
    @Param('nam') nam: string,
  ): Promise<CustomApiResponse<BaoCaoSanLuongDocument[]>> {
    try {
      const data = await this.baoCaoSanLuongService.findByThangNam(
        parseInt(thang),
        parseInt(nam),
      );
      return {
        success: true,
        message: 'Lấy danh sách báo cáo sản lượng theo tháng và năm thành công',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Lấy danh sách báo cáo sản lượng theo tháng và năm thất bại',
        error: (error as Error).message,
      };
    }
  }

  /**
   * Lấy danh sách báo cáo sản lượng theo nhân viên
   */
  @Get('nhan-vien/:nhanVienId')
  @ApiOperation({
    summary: 'Lấy danh sách báo cáo sản lượng theo nhân viên',
    description: 'Tìm kiếm báo cáo sản lượng dựa trên nhân viên cụ thể',
  })
  @ApiParam({
    name: 'nhanVienId',
    description: 'ID của nhân viên',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiOkResponse({
    description: 'Lấy danh sách báo cáo sản lượng theo nhân viên thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Lấy danh sách báo cáo sản lượng theo nhân viên thành công',
        },
        data: {
          type: 'array',
          items: { description: 'Danh sách báo cáo sản lượng theo nhân viên' },
        },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'ID nhân viên không hợp lệ' })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async findByNhanVien(
    @Param('nhanVienId') nhanVienId: string,
  ): Promise<CustomApiResponse<BaoCaoSanLuongDocument[]>> {
    try {
      const data = await this.baoCaoSanLuongService.findByNhanVien(nhanVienId);
      return {
        success: true,
        message: 'Lấy danh sách báo cáo sản lượng theo nhân viên thành công',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Lấy danh sách báo cáo sản lượng theo nhân viên thất bại',
        error: (error as Error).message,
      };
    }
  }

  /**
   * Lấy danh sách báo cáo sản lượng theo trạng thái
   */
  @Get('trang-thai/:trangThai')
  @ApiOperation({
    summary: 'Lấy danh sách báo cáo sản lượng theo trạng thái',
    description: 'Tìm kiếm báo cáo sản lượng dựa trên trạng thái cụ thể',
  })
  @ApiParam({
    name: 'trangThai',
    description: 'Trạng thái báo cáo',
    example: 'cho-duyet',
  })
  @ApiOkResponse({
    description: 'Lấy danh sách báo cáo sản lượng theo trạng thái thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Lấy danh sách báo cáo sản lượng theo trạng thái thành công',
        },
        data: {
          type: 'array',
          items: { description: 'Danh sách báo cáo sản lượng theo trạng thái' },
        },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Trạng thái không hợp lệ' })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async findByTrangThai(
    @Param('trangThai') trangThai: string,
  ): Promise<CustomApiResponse<BaoCaoSanLuongDocument[]>> {
    try {
      const data = await this.baoCaoSanLuongService.findByTrangThai(trangThai);
      return {
        success: true,
        message: 'Lấy danh sách báo cáo sản lượng theo trạng thái thành công',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Lấy danh sách báo cáo sản lượng theo trạng thái thất bại',
        error: (error as Error).message,
      };
    }
  }

  /**
   * Lấy danh sách báo cáo sản lượng theo khoảng thời gian
   */
  @Get('khoang-thoi-gian')
  @ApiOperation({
    summary: 'Lấy danh sách báo cáo sản lượng theo khoảng thời gian',
    description: 'Tìm kiếm báo cáo sản lượng trong khoảng thời gian cụ thể',
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
      'Lấy danh sách báo cáo sản lượng theo khoảng thời gian thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example:
            'Lấy danh sách báo cáo sản lượng theo khoảng thời gian thành công',
        },
        data: {
          type: 'array',
          items: {
            description: 'Danh sách báo cáo sản lượng theo khoảng thời gian',
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
  ): Promise<CustomApiResponse<BaoCaoSanLuongDocument[]>> {
    try {
      const data = await this.baoCaoSanLuongService.findByKhoangThoiGian(
        new Date(tuNgay),
        new Date(denNgay),
      );
      return {
        success: true,
        message:
          'Lấy danh sách báo cáo sản lượng theo khoảng thời gian thành công',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message:
          'Lấy danh sách báo cáo sản lượng theo khoảng thời gian thất bại',
        error: (error as Error).message,
      };
    }
  }

  /**
   * Cập nhật trạng thái báo cáo sản lượng
   */
  @Get(':id/trang-thai/:trangThai')
  @ApiOperation({
    summary: 'Cập nhật trạng thái báo cáo sản lượng',
    description: 'Cập nhật trạng thái của báo cáo sản lượng cụ thể',
  })
  @ApiParam({
    name: 'id',
    description: 'ID của báo cáo sản lượng',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiParam({
    name: 'trangThai',
    description: 'Trạng thái mới',
    example: 'da-duyet',
  })
  @ApiOkResponse({
    description: 'Cập nhật trạng thái thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Cập nhật trạng thái thành công' },
        data: { description: 'Báo cáo sản lượng đã cập nhật' },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'ID hoặc trạng thái không hợp lệ' })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async updateTrangThai(
    @Param('id') id: string,
    @Param('trangThai') trangThai: string,
  ): Promise<CustomApiResponse<BaoCaoSanLuongDocument>> {
    try {
      const data = await this.baoCaoSanLuongService.updateTrangThai(
        id,
        trangThai,
      );
      return {
        success: true,
        message: 'Cập nhật trạng thái thành công',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Cập nhật trạng thái thất bại',
        error: (error as Error).message,
      };
    }
  }

  /**
   * Cập nhật mã pallet báo cáo sản lượng
   */
  @Put('pallet')
  @ApiOperation({
    summary: 'Cập nhật mã pallet báo cáo sản lượng',
    description: 'Cập nhật mã pallet báo cáo sản lượng cụ thể',
  })
  @ApiBody({
    type: UpdatePalletBaoCaoSanLuongDto,
    description: 'Thông tin cập nhật mã pallet báo cáo sản lượng',
  })
  @ApiOkResponse({
    description: 'Cập nhật mã pallet báo cáo sản lượng thành công',
  })
  @ApiBadRequestResponse({ description: 'Dữ liệu không hợp lệ' })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async updatePalletBaoCaoSanLuong(
    @Body() updateDto: UpdatePalletBaoCaoSanLuongDto,
  ): Promise<CustomApiResponse<BaoCaoSanLuongDocument[]>> {
    try {
      const data =
        await this.baoCaoSanLuongService.updatePalletBaoCaoSanLuong(updateDto);
      return {
        success: true,
        message: 'Cập nhật mã pallet báo cáo sản lượng thành công',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Cập nhật mã pallet báo cáo sản lượng thất bại',
        error: (error as Error).message,
      };
    }
  }

  /**
   * Xuất đơn báo cáo sản lượng
   */
  @Post('xuat-don')
  @ApiOperation({
    summary: 'Xuất hóa đơn báo cáo sản lượng',
    description: 'Xuất hóa đơn báo cáo sản lượng cụ thể',
  })
  @ApiBody({
    type: XuatHoaDonBaoCaoSanLuongDto,
    description: 'Thông tin xuất đơn báo cáo sản lượng',
  })
  @ApiOkResponse({
    description: 'Xuất đơn báo cáo sản lượng thành công',
  })
  @ApiBadRequestResponse({ description: 'Dữ liệu không hợp lệ' })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async xuatDonBaoCaoSanLuong(
    @Body() xuatDonDto: XuatHoaDonBaoCaoSanLuongDto,
  ): Promise<CustomApiResponse<PhieuNghiepVuDocument>> {
    try {
      const data =
        await this.baoCaoSanLuongService.xuatHoaDonBaoCaoSanLuong(xuatDonDto);
      return {
        success: true,
        message: 'Xuất đơn báo cáo sản lượng thành công',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Xuất đơn báo cáo sản lượng thất bại',
        error: (error as Error).message,
      };
    }
  }
}
