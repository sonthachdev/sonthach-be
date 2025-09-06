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
import { HangMucService } from './hang-muc.service';
import { HangMucDocument } from '../../schemas';

@ApiTags('hang-muc')
@Controller('hang-muc')
export class HangMucController extends BaseController<HangMucDocument> {
  constructor(private readonly hangMucService: HangMucService) {
    super(hangMucService);
  }

  /**
   * Lấy danh sách hàng mục theo loại
   */
  @Get('loai/:loai')
  @ApiOperation({
    summary: 'Lấy danh sách hàng mục theo loại',
    description: 'Tìm kiếm hàng mục dựa trên loại cụ thể',
  })
  @ApiParam({ name: 'loai', description: 'Loại hàng mục', example: 'vat-lieu' })
  @ApiOkResponse({
    description: 'Lấy danh sách hàng mục theo loại thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Lấy danh sách hàng mục theo loại thành công',
        },
        data: {
          type: 'array',
          items: { description: 'Danh sách hàng mục theo loại' },
        },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Loại không hợp lệ' })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async findByLoai(
    @Param('loai') loai: string,
  ): Promise<CustomApiResponse<HangMucDocument[]>> {
    try {
      const data = await this.hangMucService.findByLoai(loai);
      return {
        success: true,
        message: 'Lấy danh sách hàng mục theo loại thành công',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Lấy danh sách hàng mục theo loại thất bại',
        error: error.message,
      };
    }
  }

  /**
   * Lấy danh sách hàng mục theo trạng thái
   */
  @Get('trang-thai/:trangThai')
  @ApiOperation({
    summary: 'Lấy danh sách hàng mục theo trạng thái',
    description: 'Tìm kiếm hàng mục dựa trên trạng thái cụ thể',
  })
  @ApiParam({
    name: 'trangThai',
    description: 'Trạng thái hàng mục',
    example: 'true',
  })
  @ApiOkResponse({
    description: 'Lấy danh sách hàng mục theo trạng thái thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Lấy danh sách hàng mục theo trạng thái thành công',
        },
        data: {
          type: 'array',
          items: { description: 'Danh sách hàng mục theo trạng thái' },
        },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Trạng thái không hợp lệ' })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async findByTrangThai(
    @Param('trangThai') trangThai: string,
  ): Promise<CustomApiResponse<HangMucDocument[]>> {
    try {
      const isActive = trangThai === 'true';
      const data = await this.hangMucService.findByTrangThai(isActive);
      return {
        success: true,
        message: 'Lấy danh sách hàng mục theo trạng thái thành công',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Lấy danh sách hàng mục theo trạng thái thất bại',
        error: error.message,
      };
    }
  }

  /**
   * Tìm kiếm hàng mục theo tên
   */
  @Get('search')
  @ApiOperation({
    summary: 'Tìm kiếm hàng mục theo tên',
    description: 'Tìm kiếm hàng mục dựa trên từ khóa trong tên',
  })
  @ApiQuery({
    name: 'q',
    description: 'Từ khóa tìm kiếm',
    example: 'đá granite',
  })
  @ApiOkResponse({
    description: 'Tìm kiếm hàng mục theo tên thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Tìm kiếm hàng mục theo tên thành công',
        },
        data: {
          type: 'array',
          items: { description: 'Danh sách hàng mục tìm được' },
        },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Từ khóa tìm kiếm không hợp lệ' })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async findByTen(
    @Query('q') query: string,
  ): Promise<CustomApiResponse<HangMucDocument[]>> {
    try {
      const data = await this.hangMucService.findByTen(query);
      return {
        success: true,
        message: 'Tìm kiếm hàng mục theo tên thành công',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Tìm kiếm hàng mục theo tên thất bại',
        error: error.message,
      };
    }
  }

  /**
   * Lấy danh sách hàng mục đang hoạt động
   */
  @Get('active')
  @ApiOperation({
    summary: 'Lấy danh sách hàng mục đang hoạt động',
    description: 'Tìm kiếm tất cả hàng mục có trạng thái đang hoạt động',
  })
  @ApiOkResponse({
    description: 'Lấy danh sách hàng mục đang hoạt động thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Lấy danh sách hàng mục đang hoạt động thành công',
        },
        data: {
          type: 'array',
          items: { description: 'Danh sách hàng mục đang hoạt động' },
        },
      },
    },
  })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async findActive(): Promise<CustomApiResponse<HangMucDocument[]>> {
    try {
      const data = await this.hangMucService.findActive();
      return {
        success: true,
        message: 'Lấy danh sách hàng mục đang hoạt động thành công',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Lấy danh sách hàng mục đang hoạt động thất bại',
        error: error.message,
      };
    }
  }

  /**
   * Cập nhật trạng thái hàng mục
   */
  @Get(':id/trang-thai/:trangThai')
  @ApiOperation({
    summary: 'Cập nhật trạng thái hàng mục',
    description: 'Cập nhật trạng thái của hàng mục cụ thể',
  })
  @ApiParam({
    name: 'id',
    description: 'ID của hàng mục',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiParam({
    name: 'trangThai',
    description: 'Trạng thái mới',
    example: 'false',
  })
  @ApiOkResponse({
    description: 'Cập nhật trạng thái thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Cập nhật trạng thái thành công' },
        data: { description: 'Hàng mục đã cập nhật' },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'ID hoặc trạng thái không hợp lệ' })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async updateTrangThai(
    @Param('id') id: string,
    @Param('trangThai') trangThai: string,
  ): Promise<CustomApiResponse<HangMucDocument>> {
    try {
      const isActive = trangThai === 'true';
      const data = await this.hangMucService.updateTrangThai(id, isActive);
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
