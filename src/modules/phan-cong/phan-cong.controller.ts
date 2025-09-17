import { Controller, Get, Query, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { BaseController, CustomApiResponse } from '../../common/base';
import { PhanCongService } from './phan-cong.service';
import { PhanCongDocument } from '../../schemas';

@ApiTags('phan-cong')
@Controller('api/phan-cong')
export class PhanCongController extends BaseController<PhanCongDocument> {
  constructor(private readonly phanCongService: PhanCongService) {
    super(phanCongService);
  }

  /**
   * Lấy danh sách phân công theo nhân viên
   */
  @Get('nhan-vien/:nhanVienId')
  @ApiOperation({
    summary: 'Lấy danh sách phân công theo nhân viên',
    description: 'Tìm kiếm phân công dựa trên nhân viên cụ thể',
  })
  @ApiParam({
    name: 'nhanVienId',
    description: 'ID của nhân viên',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiOkResponse({
    description: 'Lấy danh sách phân công theo nhân viên thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Lấy danh sách phân công theo nhân viên thành công',
        },
        data: {
          type: 'array',
          items: { description: 'Danh sách phân công theo nhân viên' },
        },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'ID nhân viên không hợp lệ' })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async findByNhanVien(
    @Param('nhanVienId') nhanVienId: string,
  ): Promise<CustomApiResponse<PhanCongDocument[]>> {
    try {
      const data = await this.phanCongService.findByNhanVien(nhanVienId);
      return {
        success: true,
        message: 'Lấy danh sách phân công theo nhân viên thành công',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Lấy danh sách phân công theo nhân viên thất bại',
        error: error.message,
      };
    }
  }

  /**
   * Lấy danh sách phân công theo hàng mục
   */
  @Get('hang-muc/:hangMucId')
  @ApiOperation({
    summary: 'Lấy danh sách phân công theo hàng mục',
    description: 'Tìm kiếm phân công dựa trên hàng mục cụ thể',
  })
  @ApiParam({
    name: 'hangMucId',
    description: 'ID của hàng mục',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiOkResponse({
    description: 'Lấy danh sách phân công theo hàng mục thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Lấy danh sách phân công theo hàng mục thành công',
        },
        data: {
          type: 'array',
          items: { description: 'Danh sách phân công theo hàng mục' },
        },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'ID hàng mục không hợp lệ' })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async findByHangMuc(
    @Param('hangMucId') hangMucId: string,
  ): Promise<CustomApiResponse<PhanCongDocument[]>> {
    try {
      const data = await this.phanCongService.findByHangMuc(hangMucId);
      return {
        success: true,
        message: 'Lấy danh sách phân công theo hàng mục thành công',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Lấy danh sách phân công theo hàng mục thất bại',
        error: error.message,
      };
    }
  }

  /**
   * Lấy danh sách phân công theo trạng thái
   */
  @Get('trang-thai/:trangThai')
  @ApiOperation({
    summary: 'Lấy danh sách phân công theo trạng thái',
    description: 'Tìm kiếm phân công dựa trên trạng thái cụ thể',
  })
  @ApiParam({
    name: 'trangThai',
    description: 'Trạng thái phân công',
    example: 'dang-lam',
  })
  @ApiOkResponse({
    description: 'Lấy danh sách phân công theo trạng thái thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Lấy danh sách phân công theo trạng thái thành công',
        },
        data: {
          type: 'array',
          items: { description: 'Danh sách phân công theo trạng thái' },
        },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Trạng thái không hợp lệ' })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async findByTrangThai(
    @Param('trangThai') trangThai: string,
  ): Promise<CustomApiResponse<PhanCongDocument[]>> {
    try {
      const data = await this.phanCongService.findByTrangThai(trangThai);
      return {
        success: true,
        message: 'Lấy danh sách phân công theo trạng thái thành công',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Lấy danh sách phân công theo trạng thái thất bại',
        error: error.message,
      };
    }
  }

  /**
   * Lấy danh sách phân công theo ngày
   */
  @Get('ngay')
  @ApiOperation({
    summary: 'Lấy danh sách phân công theo ngày',
    description: 'Tìm kiếm phân công dựa trên ngày cụ thể',
  })
  @ApiQuery({
    name: 'ngay',
    description: 'Ngày (YYYY-MM-DD)',
    example: '2024-12-01',
  })
  @ApiOkResponse({
    description: 'Lấy danh sách phân công theo ngày thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Lấy danh sách phân công theo ngày thành công',
        },
        data: {
          type: 'array',
          items: { description: 'Danh sách phân công theo ngày' },
        },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Ngày không hợp lệ' })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async findByNgay(
    @Query('ngay') ngay: string,
  ): Promise<CustomApiResponse<PhanCongDocument[]>> {
    try {
      const data = await this.phanCongService.findByNgay(new Date(ngay));
      return {
        success: true,
        message: 'Lấy danh sách phân công theo ngày thành công',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Lấy danh sách phân công theo ngày thất bại',
        error: error.message,
      };
    }
  }

  /**
   * Lấy danh sách phân công đang hoạt động
   */
  @Get('active')
  @ApiOperation({
    summary: 'Lấy danh sách phân công đang hoạt động',
    description: 'Tìm kiếm tất cả phân công có trạng thái đang hoạt động',
  })
  @ApiOkResponse({
    description: 'Lấy danh sách phân công đang hoạt động thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Lấy danh sách phân công đang hoạt động thành công',
        },
        data: {
          type: 'array',
          items: { description: 'Danh sách phân công đang hoạt động' },
        },
      },
    },
  })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async findActive(): Promise<CustomApiResponse<PhanCongDocument[]>> {
    try {
      const data = await this.phanCongService.findActive();
      return {
        success: true,
        message: 'Lấy danh sách phân công đang hoạt động thành công',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Lấy danh sách phân công đang hoạt động thất bại',
        error: error.message,
      };
    }
  }

  /**
   * Cập nhật trạng thái phân công
   */
  @Get(':id/trang-thai/:trangThai')
  @ApiOperation({
    summary: 'Cập nhật trạng thái phân công',
    description: 'Cập nhật trạng thái của phân công cụ thể',
  })
  @ApiParam({
    name: 'id',
    description: 'ID của phân công',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiParam({
    name: 'trangThai',
    description: 'Trạng thái mới',
    example: 'hoan-thanh',
  })
  @ApiOkResponse({
    description: 'Cập nhật trạng thái thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Cập nhật trạng thái thành công' },
        data: { description: 'Phân công đã cập nhật' },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'ID hoặc trạng thái không hợp lệ' })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async updateTrangThai(
    @Param('id') id: string,
    @Param('trangThai') trangThai: string,
  ): Promise<CustomApiResponse<PhanCongDocument>> {
    try {
      const data = await this.phanCongService.updateTrangThai(id, trangThai);
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
}
