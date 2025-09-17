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
  ApiConsumes,
  ApiProduces,
  ApiResponse,
} from '@nestjs/swagger';
import { BaseController, CustomApiResponse } from '../../common/base';
import { YCSCService } from './ycsc.service';
import {
  BaoCaoSanLuongDocument,
  PhieuNghiepVuDocument,
  YCSCDocument,
} from '../../schemas';
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

@ApiTags('ycsc')
@Controller('api/ycsc')
export class YCSCController extends BaseController<YCSCDocument> {
  constructor(private readonly ycscService: YCSCService) {
    super(ycscService);
  }

  /**
   * Tạo yêu cầu sơ chế mới
   */
  @Post()
  @ApiOperation({
    summary: 'Tạo yêu cầu sơ chế mới',
    description: 'Tạo yêu cầu sơ chế với trạng thái chờ duyệt',
  })
  @ApiConsumes('application/json')
  @ApiProduces('application/json')
  @ApiBody({
    description: 'Thông tin yêu cầu sơ chế',
    type: CreateYCSCDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Tạo yêu cầu sơ chế thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Tạo yêu cầu sơ chế thành công' },
        data: { description: 'Yêu cầu sơ chế đã tạo' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 500, description: 'Lỗi server' })
  async create(
    @Body() createDto: CreateYCSCDto,
  ): Promise<CustomApiResponse<YCSCDocument>> {
    try {
      const data = await this.ycscService.createYCSC(createDto);
      return {
        success: true,
        message: 'Tạo yêu cầu sơ chế thành công',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Tạo yêu cầu sơ chế thất bại',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Duyệt yêu cầu sơ chế
   */
  @Put(':id/duyet')
  @ApiOperation({
    summary: 'Duyệt yêu cầu sơ chế',
    description: 'Duyệt yêu cầu sơ chế và chuyển sang trạng thái đã duyệt',
  })
  @ApiParam({
    name: 'id',
    description: 'ID của yêu cầu sơ chế',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({
    type: ApproveYCSCDto,
    description: 'Thông tin duyệt yêu cầu',
  })
  @ApiOkResponse({
    description: 'Duyệt yêu cầu sơ chế thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Duyệt yêu cầu sơ chế thành công' },
        data: { description: 'Yêu cầu đã được duyệt' },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Dữ liệu không hợp lệ' })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async approveYCSC(
    @Param('id') id: string,
    @Body() approveDto: ApproveYCSCDto,
  ): Promise<CustomApiResponse<YCSCDocument>> {
    try {
      const data = await this.ycscService.approveYCSC(id, approveDto);
      return {
        success: true,
        message: 'Duyệt yêu cầu sơ chế thành công',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Duyệt yêu cầu sơ chế thất bại',
        error: error.message,
      };
    }
  }

  /**
   * Duyệt nhiều yêu cầu sơ chế
   */
  @Put('batch-duyet')
  @ApiOperation({
    summary: 'Duyệt nhiều yêu cầu sơ chế',
  })
  @ApiBody({ type: BatchApproveYCSCDto })
  @ApiOkResponse({
    description: 'Duyệt nhiều yêu cầu sơ chế thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Duyệt nhiều yêu cầu sơ chế thành công',
        },
        data: { description: 'Các yêu cầu đã được duyệt' },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Dữ liệu không hợp lệ' })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async batchApproveYCSC(
    @Body() approveDto: BatchApproveYCSCDto,
  ): Promise<CustomApiResponse<{ modifiedCount: number }>> {
    try {
      const data = await this.ycscService.batchApproveYCSC(approveDto);
      return {
        success: true,
        message: 'Duyệt nhiều yêu cầu sơ chế thành công',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Duyệt nhiều yêu cầu sơ chế thất bại',
        error: error.message,
      };
    }
  }

  /**
   * Hoàn thành yêu cầu sơ chế
   */
  @Put(':id/hoan-thanh')
  @ApiOperation({
    summary: 'Hoàn thành yêu cầu sơ chế',
    description: 'Đánh dấu yêu cầu sơ chế đã hoàn thành',
  })
  @ApiParam({
    name: 'id',
    description: 'ID của yêu cầu sơ chế',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({
    type: CompleteYCSCDto,
    description: 'Thông tin hoàn thành yêu cầu',
  })
  @ApiOkResponse({
    description: 'Hoàn thành yêu cầu sơ chế thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Hoàn thành yêu cầu sơ chế thành công',
        },
        data: { description: 'Yêu cầu đã hoàn thành' },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Dữ liệu không hợp lệ' })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async completeYCSC(
    @Param('id') id: string,
    @Body() completeDto: CompleteYCSCDto,
  ): Promise<CustomApiResponse<YCSCDocument>> {
    try {
      const data = await this.ycscService.completeYCSC(id, completeDto);
      return {
        success: true,
        message: 'Hoàn thành yêu cầu sơ chế thành công',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Hoàn thành yêu cầu sơ chế thất bại',
        error: error.message,
      };
    }
  }

  /**
   * Lấy danh sách yêu cầu sơ chế chờ duyệt
   */
  @Get('cho-duyet')
  @ApiOperation({
    summary: 'Lấy danh sách yêu cầu sơ chế chờ duyệt',
    description: 'Lấy tất cả yêu cầu sơ chế có trạng thái chờ duyệt',
  })
  @ApiOkResponse({
    description: 'Lấy danh sách yêu cầu sơ chế chờ duyệt thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Lấy danh sách yêu cầu sơ chế chờ duyệt thành công',
        },
        data: {
          type: 'array',
          items: { description: 'Danh sách yêu cầu sơ chế chờ duyệt' },
        },
      },
    },
  })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async findPendingApproval(): Promise<CustomApiResponse<YCSCDocument[]>> {
    try {
      const data = await this.ycscService.findPendingApproval();
      return {
        success: true,
        message: 'Lấy danh sách yêu cầu sơ chế chờ duyệt thành công',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Lấy danh sách yêu cầu sơ chế chờ duyệt thất bại',
        error: error.message,
      };
    }
  }

  /**
   * Lấy danh sách yêu cầu sơ chế đã duyệt
   */
  @Get('da-duyet')
  @ApiOperation({
    summary: 'Lấy danh sách yêu cầu sơ chế đã duyệt',
    description: 'Lấy tất cả yêu cầu sơ chế có trạng thái đã duyệt',
  })
  @ApiOkResponse({
    description: 'Lấy danh sách yêu cầu sơ chế đã duyệt thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Lấy danh sách yêu cầu sơ chế đã duyệt thành công',
        },
        data: {
          type: 'array',
          items: { description: 'Danh sách yêu cầu sơ chế đã duyệt' },
        },
      },
    },
  })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async findApproved(): Promise<CustomApiResponse<YCSCDocument[]>> {
    try {
      const data = await this.ycscService.findApproved();
      return {
        success: true,
        message: 'Lấy danh sách yêu cầu sơ chế đã duyệt thành công',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Lấy danh sách yêu cầu sơ chế đã duyệt thất bại',
        error: error.message,
      };
    }
  }

  /**
   * Lấy danh sách yêu cầu sơ chế đã hoàn thành
   */
  @Get('hoan-thanh')
  @ApiOperation({
    summary: 'Lấy danh sách yêu cầu sơ chế đã hoàn thành',
    description: 'Lấy tất cả yêu cầu sơ chế có trạng thái đã hoàn thành',
  })
  @ApiOkResponse({
    description: 'Lấy danh sách yêu cầu sơ chế đã hoàn thành thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Lấy danh sách yêu cầu sơ chế đã hoàn thành thành công',
        },
        data: {
          type: 'array',
          items: { description: 'Danh sách yêu cầu sơ chế đã hoàn thành' },
        },
      },
    },
  })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async findCompleted(): Promise<CustomApiResponse<YCSCDocument[]>> {
    try {
      const data = await this.ycscService.findCompleted();
      return {
        success: true,
        message: 'Lấy danh sách yêu cầu sơ chế đã hoàn thành thành công',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Lấy danh sách yêu cầu sơ chế đã hoàn thành thất bại',
        error: error.message,
      };
    }
  }

  /**
   * Lấy thống kê yêu cầu sơ chế
   */
  @Get('thong-ke')
  @ApiOperation({
    summary: 'Lấy thống kê yêu cầu sơ chế',
    description: 'Lấy số lượng yêu cầu sơ chế theo từng trạng thái',
  })
  @ApiOkResponse({
    description: 'Lấy thống kê yêu cầu sơ chế thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Lấy thống kê yêu cầu sơ chế thành công',
        },
        data: {
          type: 'object',
          properties: {
            pending: { type: 'number', description: 'Số yêu cầu chờ duyệt' },
            approved: { type: 'number', description: 'Số yêu cầu đã duyệt' },
            completed: {
              type: 'number',
              description: 'Số yêu cầu đã hoàn thành',
            },
            total: { type: 'number', description: 'Tổng số yêu cầu' },
          },
        },
      },
    },
  })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async getYCSCStats(): Promise<
    CustomApiResponse<{
      pending: number;
      approved: number;
      completed: number;
      total: number;
    }>
  > {
    try {
      const data = await this.ycscService.getYCSCStats();
      return {
        success: true,
        message: 'Lấy thống kê yêu cầu sơ chế thành công',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Lấy thống kê yêu cầu sơ chế thất bại',
        error: error.message,
      };
    }
  }

  /**
   * Lấy danh sách yêu cầu sửa chữa theo trạng thái
   */
  @Get('trang-thai/:trangThai')
  @ApiOperation({
    summary: 'Lấy danh sách yêu cầu sửa chữa theo trạng thái',
    description: 'Tìm kiếm yêu cầu sửa chữa dựa trên trạng thái cụ thể',
  })
  @ApiParam({
    name: 'trangThai',
    description: 'Trạng thái yêu cầu',
    example: 'cho-xu-ly',
  })
  @ApiOkResponse({
    description: 'Lấy danh sách yêu cầu sửa chữa theo trạng thái thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Lấy danh sách yêu cầu sửa chữa theo trạng thái thành công',
        },
        data: {
          type: 'array',
          items: { description: 'Danh sách yêu cầu sửa chữa theo trạng thái' },
        },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Trạng thái không hợp lệ' })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async findByTrangThai(
    @Param('trangThai') trangThai: string,
  ): Promise<CustomApiResponse<YCSCDocument[]>> {
    try {
      const data = await this.ycscService.findByTrangThai(trangThai);
      return {
        success: true,
        message: 'Lấy danh sách yêu cầu sửa chữa theo trạng thái thành công',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Lấy danh sách yêu cầu sửa chữa theo trạng thái thất bại',
        error: error.message,
      };
    }
  }

  /**
   * Lấy danh sách yêu cầu sửa chữa theo nhân viên
   */
  @Get('nhan-vien/:nhanVienId')
  @ApiOperation({
    summary: 'Lấy danh sách yêu cầu sửa chữa theo nhân viên',
    description: 'Tìm kiếm yêu cầu sửa chữa dựa trên nhân viên cụ thể',
  })
  @ApiParam({
    name: 'nhanVienId',
    description: 'ID của nhân viên',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiOkResponse({
    description: 'Lấy danh sách yêu cầu sửa chữa theo nhân viên thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Lấy danh sách yêu cầu sửa chữa theo nhân viên thành công',
        },
        data: {
          type: 'array',
          items: { description: 'Danh sách yêu cầu sửa chữa theo nhân viên' },
        },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'ID nhân viên không hợp lệ' })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async findByNhanVien(
    @Param('nhanVienId') nhanVienId: string,
  ): Promise<CustomApiResponse<YCSCDocument[]>> {
    try {
      const data = await this.ycscService.findByNhanVien(nhanVienId);
      return {
        success: true,
        message: 'Lấy danh sách yêu cầu sửa chữa theo nhân viên thành công',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Lấy danh sách yêu cầu sửa chữa theo nhân viên thất bại',
        error: error.message,
      };
    }
  }

  /**
   * Lấy danh sách yêu cầu sửa chữa theo loại yêu cầu
   */
  @Get('loai-yeu-cau/:loaiYeuCau')
  @ApiOperation({
    summary: 'Lấy danh sách yêu cầu sửa chữa theo loại yêu cầu',
    description: 'Tìm kiếm yêu cầu sửa chữa dựa trên loại yêu cầu cụ thể',
  })
  @ApiParam({
    name: 'loaiYeuCau',
    description: 'Loại yêu cầu',
    example: 'sua-chua',
  })
  @ApiOkResponse({
    description: 'Lấy danh sách yêu cầu sửa chữa theo loại yêu cầu thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example:
            'Lấy danh sách yêu cầu sửa chữa theo loại yêu cầu thành công',
        },
        data: {
          type: 'array',
          items: {
            description: 'Danh sách yêu cầu sửa chữa theo loại yêu cầu',
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Loại yêu cầu không hợp lệ' })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async findByLoaiYeuCau(
    @Param('loaiYeuCau') loaiYeuCau: string,
  ): Promise<CustomApiResponse<YCSCDocument[]>> {
    try {
      const data = await this.ycscService.findByLoaiYeuCau(loaiYeuCau);
      return {
        success: true,
        message: 'Lấy danh sách yêu cầu sửa chữa theo loại yêu cầu thành công',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Lấy danh sách yêu cầu sửa chữa theo loại yêu cầu thất bại',
        error: error.message,
      };
    }
  }

  /**
   * Lấy danh sách yêu cầu sửa chữa theo mức độ ưu tiên
   */
  @Get('muc-do-uu-tien/:mucDoUuTien')
  @ApiOperation({
    summary: 'Lấy danh sách yêu cầu sửa chữa theo mức độ ưu tiên',
    description: 'Tìm kiếm yêu cầu sửa chữa dựa trên mức độ ưu tiên cụ thể',
  })
  @ApiParam({
    name: 'mucDoUuTien',
    description: 'Mức độ ưu tiên',
    example: 'cao',
  })
  @ApiOkResponse({
    description:
      'Lấy danh sách yêu cầu sửa chữa theo mức độ ưu tiên thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example:
            'Lấy danh sách yêu cầu sửa chữa theo mức độ ưu tiên thành công',
        },
        data: {
          type: 'array',
          items: {
            description: 'Danh sách yêu cầu sửa chữa theo mức độ ưu tiên',
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Mức độ ưu tiên không hợp lệ' })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async findByMucDoUuTien(
    @Param('mucDoUuTien') mucDoUuTien: string,
  ): Promise<CustomApiResponse<YCSCDocument[]>> {
    try {
      const data = await this.ycscService.findByMucDoUuTien(mucDoUuTien);
      return {
        success: true,
        message:
          'Lấy danh sách yêu cầu sửa chữa theo mức độ ưu tiên thành công',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Lấy danh sách yêu cầu sửa chữa theo mức độ ưu tiên thất bại',
        error: error.message,
      };
    }
  }

  /**
   * Lấy danh sách yêu cầu sửa chữa theo ngày tạo
   */
  @Get('ngay-tao')
  @ApiOperation({
    summary: 'Lấy danh sách yêu cầu sửa chữa theo ngày tạo',
    description: 'Tìm kiếm yêu cầu sửa chữa dựa trên ngày tạo cụ thể',
  })
  @ApiQuery({
    name: 'ngayTao',
    description: 'Ngày tạo (YYYY-MM-DD)',
    example: '2024-12-01',
  })
  @ApiOkResponse({
    description: 'Lấy danh sách yêu cầu sửa chữa theo ngày tạo thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Lấy danh sách yêu cầu sửa chữa theo ngày tạo thành công',
        },
        data: {
          type: 'array',
          items: { description: 'Danh sách yêu cầu sửa chữa theo ngày tạo' },
        },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Ngày không hợp lệ' })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async findByNgayTao(
    @Query('ngayTao') ngayTao: string,
  ): Promise<CustomApiResponse<YCSCDocument[]>> {
    try {
      const data = await this.ycscService.findByNgayTao(new Date(ngayTao));
      return {
        success: true,
        message: 'Lấy danh sách yêu cầu sửa chữa theo ngày tạo thành công',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Lấy danh sách yêu cầu sửa chữa theo ngày tạo thất bại',
        error: error.message,
      };
    }
  }

  /**
   * Lấy danh sách yêu cầu sửa chữa chờ xử lý
   */
  @Get('cho-xu-ly')
  @ApiOperation({
    summary: 'Lấy danh sách yêu cầu sửa chữa chờ xử lý',
    description: 'Tìm kiếm tất cả yêu cầu sửa chữa có trạng thái chờ xử lý',
  })
  @ApiOkResponse({
    description: 'Lấy danh sách yêu cầu sửa chữa chờ xử lý thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Lấy danh sách yêu cầu sửa chữa chờ xử lý thành công',
        },
        data: {
          type: 'array',
          items: { description: 'Danh sách yêu cầu sửa chữa chờ xử lý' },
        },
      },
    },
  })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async findChoXuLy(): Promise<CustomApiResponse<YCSCDocument[]>> {
    try {
      const data = await this.ycscService.findChoXuLy();
      return {
        success: true,
        message: 'Lấy danh sách yêu cầu sửa chữa chờ xử lý thành công',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Lấy danh sách yêu cầu sửa chữa chờ xử lý thất bại',
        error: error.message,
      };
    }
  }

  /**
   * Cập nhật trạng thái yêu cầu sửa chữa
   */
  @Get(':id/trang-thai/:trangThai')
  @ApiOperation({
    summary: 'Cập nhật trạng thái yêu cầu sửa chữa',
    description: 'Cập nhật trạng thái của yêu cầu sửa chữa cụ thể',
  })
  @ApiParam({
    name: 'id',
    description: 'ID của yêu cầu sửa chữa',
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
        data: { description: 'Yêu cầu sửa chữa đã cập nhật' },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'ID hoặc trạng thái không hợp lệ' })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async updateTrangThai(
    @Param('id') id: string,
    @Param('trangThai') trangThai: string,
  ): Promise<CustomApiResponse<YCSCDocument>> {
    try {
      const data = await this.ycscService.updateTrangThai(id, trangThai);
      return {
        success: true,
        message: 'Cập nhật trạng thái thành công',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Cập nhật trạng thái thất bại',
        error: error.message,
      };
    }
  }

  @Get('filter')
  @ApiOperation({
    summary: 'Lấy danh sách yêu cầu sửa chữa theo filter',
    description: 'Lấy danh sách yêu cầu sửa chữa dựa trên filter',
  })
  // @ApiQuery({ type: FilterYCSCDto })
  @ApiOkResponse({
    description: 'Lấy danh sách yêu cầu sửa chữa theo filter thành công',
  })
  @ApiBadRequestResponse({ description: 'Filter không hợp lệ' })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async filterYCSC(
    @Query() filter: FilterYCSCDto,
  ): Promise<CustomApiResponse<any[]>> {
    try {
      const data = await this.ycscService.filterYCSC(filter);
      return {
        success: true,
        message: 'Lấy danh sách yêu cầu sửa chữa theo filter thành công',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Lấy danh sách yêu cầu sửa chữa theo filter thất bại',
        error: error.message,
      };
    }
  }

  @Put(':id/add-nguyen-lieu')
  @ApiOperation({
    summary: 'Thêm báo cáo sản lượng vào yêu cầu sơ chế',
    description: 'Thêm báo cáo sản lượng vào yêu cầu sơ chế',
  })
  @ApiParam({
    name: 'id',
    description: 'ID của yêu cầu sơ chế',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({ type: AddBaoCaoSanLuongDto })
  async addBaoCaoSanLuong(
    @Param('id') id: string,
    @Body() addBaoCaoSanLuongDto: AddBaoCaoSanLuongDto,
  ): Promise<CustomApiResponse<YCSCDocument>> {
    try {
      const data = await this.ycscService.addBaoCaoSanLuong(
        id,
        addBaoCaoSanLuongDto,
      );
      return {
        success: true,
        message: 'Thêm báo cáo sản lượng vào yêu cầu sơ chế thành công',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Thêm báo cáo sản lượng vào yêu cầu sơ chế thất bại',
        error: error.message,
      };
    }
  }

  @Post(':id/bao-cao-san-luong')
  @ApiOperation({
    summary: 'Thêm báo cáo sản lượng vào yêu cầu sơ chế',
    description: 'Thêm báo cáo sản lượng vào yêu cầu sơ chế',
  })
  @ApiParam({
    name: 'id',
    description: 'ID của yêu cầu sơ chế',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({ type: BaoCaoSanLuongDto })
  async addBaoCaoSanLuongByDto(
    @Param('id') id: string,
    @Body() baoCaoSanLuongDto: BaoCaoSanLuongDto,
  ): Promise<CustomApiResponse<BaoCaoSanLuongDocument>> {
    try {
      const data = await this.ycscService.addBaoCaoSanLuongByDto(
        id,
        baoCaoSanLuongDto,
      );
      return {
        success: true,
        message: 'Thêm báo cáo sản lượng vào yêu cầu sơ chế thành công',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Thêm báo cáo sản lượng vào yêu cầu sơ chế thất bại',
        error: error.message,
      };
    }
  }

  @Get(':id/bao-cao-san-luong')
  @ApiOperation({
    summary: 'Lấy danh sách báo cáo sản lượng của yêu cầu sơ chế',
    description: 'Lấy danh sách báo cáo sản lượng của yêu cầu sơ chế',
  })
  @ApiParam({
    name: 'id',
    description: 'ID của yêu cầu sơ chế',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiOkResponse({
    description:
      'Lấy danh sách báo cáo sản lượng của yêu cầu sơ chế thành công',
  })
  @ApiBadRequestResponse({ description: 'ID không hợp lệ' })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async getBaoCaoSanLuong(
    @Param('id') id: string,
  ): Promise<CustomApiResponse<BaoCaoSanLuongDocument[]>> {
    try {
      const data = await this.ycscService.getBaoCaoSanLuong(id);
      return {
        success: true,
        message:
          'Lấy danh sác ng báo cáo sản lượng của yêu cầu sơ chế thành công',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message:
          'Lấy danh sác ng báo cáo sản lượng của yêu cầu sơ chế thất bại',
        error: error.message,
      };
    }
  }

  @Put(':id/bao-cao-san-luong/duyet')
  @ApiOperation({
    summary: 'Duyệt báo cáo sản lượng của yêu cầu sơ chế',
    description: 'Duyệt báo cáo sản lượng của yêu cầu sơ chế',
  })
  @ApiParam({
    name: 'id',
    description: 'ID của yêu cầu sơ chế',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({ type: ApproveBaoCaoSanLuongByYCSCDto })
  async approveBaoCaoSanLuong(
    @Param('id') id: string,
    @Body() approveDto: ApproveBaoCaoSanLuongByYCSCDto,
  ): Promise<CustomApiResponse<BaoCaoSanLuongDocument[]>> {
    try {
      const data = await this.ycscService.approveBaoCaoSanLuong(id, approveDto);
      return {
        success: true,
        message: 'Duyệt báo cáo sản lượng của yêu cầu sơ chế thành công',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Duyệt báo cáo sản lượng của yêu cầu sơ chế thất bại',
        error: error.message,
      };
    }
  }

  @Put(':id/phieu-ra')
  @ApiOperation({
    summary: 'Tạo phiếu ra cho yêu cầu sơ chế',
    description: 'Tạo phiếu ra cho yêu cầu sơ chế',
  })
  @ApiParam({
    name: 'id',
    description: 'ID của yêu cầu sơ chế',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({ type: NhapKhoBaoCaoSanLuongDto })
  async createPhieuRa(
    @Param('id') id: string,
    @Body() createPhieuRaDto: NhapKhoBaoCaoSanLuongDto,
  ): Promise<CustomApiResponse<PhieuNghiepVuDocument>> {
    try {
      const data = await this.ycscService.nhapKhoBaoCaoSanLuong(
        id,
        createPhieuRaDto,
      );
      return {
        success: true,
        message: 'Tạo phiếu ra cho yêu cầu sơ chế thành công',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Tạo phiếu ra cho yêu cầu sơ chế thất bại',
        error: error.message,
      };
    }
  }

  // get :id/detail
  @Get(':id/detail')
  @ApiOperation({
    summary: 'Lấy chi tiết yêu cầu sơ chế',
    description: 'Lấy chi tiết yêu cầu sơ chế',
  })
  @ApiParam({
    name: 'id',
    description: 'ID của yêu cầu sơ chế',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiOkResponse({
    description: 'Lấy chi tiết yêu cầu sơ chế thành công',
  })
  @ApiBadRequestResponse({ description: 'ID không hợp lệ' })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async getDetailYCSC(@Param('id') id: string): Promise<
    CustomApiResponse<{
      ycsc: YCSCDocument;
      phieuNghiepVu: PhieuNghiepVuDocument[];
      baoCaoSanLuong: BaoCaoSanLuongDocument[];
    }>
  > {
    try {
      const data = await this.ycscService.getDetailYCSC(id);
      return {
        success: true,
        message: 'Lấy chi tiết yêu cầu sơ chế thành công',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Lấy chi tiết yêu cầu sơ chế thất bại',
        error: error.message,
      };
    }
  }
}
