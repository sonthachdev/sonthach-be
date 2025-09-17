import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpStatus,
  HttpCode,
  ParseIntPipe,
  DefaultValuePipe,
  ValidationPipe,
  UsePipes
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiQuery, 
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNoContentResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiInternalServerErrorResponse
} from '@nestjs/swagger';
import { BaseService } from './base.service';
import { Document } from 'mongoose';

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
  populate?: string;
}

export interface CustomApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

@ApiTags('base')
@Controller('api')
export abstract class BaseController<T extends Document> {
  constructor(protected readonly baseService: BaseService<T>) {}

  /**
   * Tạo mới document
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Tạo mới document' })
  @ApiBody({ description: 'Dữ liệu tạo mới' })
  @ApiCreatedResponse({ 
    description: 'Tạo mới thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Tạo mới thành công' },
        data: { description: 'Document đã tạo' }
      }
    }
  })
  @ApiBadRequestResponse({ description: 'Dữ liệu không hợp lệ' })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async create(@Body() createDto: any): Promise<CustomApiResponse<T>> {
    try {
      const created = await this.baseService.create(createDto);
      return {
        success: true,
        message: 'Tạo mới thành công',
        data: created
      };
    } catch (error) {
      return {
        success: false,
        message: 'Tạo mới thất bại',
        error: error.message
      };
    }
  }

  /**
   * Lấy danh sách documents với pagination
   */
  @Get()
  @ApiOperation({ summary: 'Lấy danh sách documents với pagination' })
  @ApiQuery({ name: 'page', required: false, description: 'Số trang', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Số lượng item mỗi trang', example: 10 })
  @ApiQuery({ name: 'sort', required: false, description: 'Sắp xếp (field:order)', example: 'createdAt:-1,name:1' })
  @ApiQuery({ name: 'populate', required: false, description: 'Populate fields', example: 'user,department' })
  @ApiOkResponse({ 
    description: 'Lấy danh sách thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Lấy danh sách thành công' },
        data: { type: 'array', items: { description: 'Danh sách documents' } },
        pagination: {
          type: 'object',
          properties: {
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 10 },
            total: { type: 'number', example: 100 },
            totalPages: { type: 'number', example: 10 }
          }
        }
      }
    }
  })
  @ApiBadRequestResponse({ description: 'Tham số không hợp lệ' })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('sort') sort?: string,
    @Query('populate') populate?: string,
    @Query() filter?: any
  ): Promise<CustomApiResponse<T[]>> {
    try {
      // Xử lý sort string (ví dụ: "createdAt:-1,name:1")
      let sortObj: Record<string, number> = { createdAt: -1 };
      if (sort) {
        sortObj = {};
        sort.split(',').forEach(item => {
          const [field, order] = item.split(':');
          sortObj[field] = order === '1' ? 1 : -1;
        });
      }

      // Xử lý populate
      let populateArray: string[] | undefined;
      if (populate) {
        populateArray = populate.split(',');
      }

      // Xử lý filter từ query params
      const filterObj = { ...filter };
      delete filterObj.page;
      delete filterObj.limit;
      delete filterObj.sort;
      delete filterObj.populate;

      const result = await this.baseService.findAll(filterObj, {
        page,
        limit,
        sort: sortObj,
        populate: populateArray
      });

      return {
        success: true,
        message: 'Lấy danh sách thành công',
        data: result.data,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Lấy danh sách thất bại',
        error: error.message
      };
    }
  }

  /**
   * Lấy document theo ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Lấy document theo ID' })
  @ApiParam({ name: 'id', description: 'ID của document' })
  @ApiQuery({ name: 'populate', required: false, description: 'Populate fields', example: 'user,department' })
  @ApiOkResponse({ 
    description: 'Lấy thông tin thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Lấy thông tin thành công' },
        data: { description: 'Document' }
      }
    }
  })
  @ApiNotFoundResponse({ description: 'Không tìm thấy document' })
  @ApiBadRequestResponse({ description: 'ID không hợp lệ' })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async findById(
    @Param('id') id: string,
    @Query('populate') populate?: string
  ): Promise<CustomApiResponse<T>> {
    try {
      let populateArray: string[] | undefined;
      if (populate) {
        populateArray = populate.split(',');
      }

      const document = await this.baseService.findById(id, populateArray);
      return {
        success: true,
        message: 'Lấy thông tin thành công',
        data: document
      };
    } catch (error) {
      return {
        success: false,
        message: 'Lấy thông tin thất bại',
        error: error.message
      };
    }
  }

  /**
   * Cập nhật document theo ID
   */
  @Put(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Cập nhật document theo ID' })
  @ApiParam({ name: 'id', description: 'ID của document cần cập nhật' })
  @ApiBody({ description: 'Dữ liệu cập nhật' })
  @ApiOkResponse({ 
    description: 'Cập nhật thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Cập nhật thành công' },
        data: { description: 'Document đã cập nhật' }
      }
    }
  })
  @ApiNotFoundResponse({ description: 'Không tìm thấy document' })
  @ApiBadRequestResponse({ description: 'Dữ liệu không hợp lệ' })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: any
  ): Promise<CustomApiResponse<T>> {
    try {
      const updated = await this.baseService.update(id, updateDto);
      return {
        success: true,
        message: 'Cập nhật thành công',
        data: updated
      };
    } catch (error) {
      return {
        success: false,
        message: 'Cập nhật thất bại',
        error: error.message
      };
    }
  }

  /**
   * Xóa document theo ID
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xóa document theo ID' })
  @ApiParam({ name: 'id', description: 'ID của document cần xóa' })
  @ApiNoContentResponse({ description: 'Xóa thành công' })
  @ApiNotFoundResponse({ description: 'Không tìm thấy document' })
  @ApiBadRequestResponse({ description: 'ID không hợp lệ' })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async delete(@Param('id') id: string): Promise<CustomApiResponse<{ deletedCount: number }>> {
    try {
      const result = await this.baseService.delete(id);
      return {
        success: true,
        message: 'Xóa thành công',
        data: result
      };
    } catch (error) {
      return {
        success: false,
        message: 'Xóa thất bại',
        error: error.message
      };
    }
  }

  /**
   * Đếm số documents
   */
  @Get('count/total')
  @ApiOperation({ summary: 'Đếm số documents' })
  @ApiOkResponse({ 
    description: 'Đếm thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Đếm thành công' },
        data: { type: 'number', example: 100 }
      }
    }
  })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async count(@Query() filter?: any): Promise<CustomApiResponse<number>> {
    try {
      const count = await this.baseService.count(filter);
      return {
        success: true,
        message: 'Đếm thành công',
        data: count
      };
    } catch (error) {
      return {
        success: false,
        message: 'Đếm thất bại',
        error: error.message
      };
    }
  }

  /**
   * Kiểm tra document có tồn tại không
   */
  @Get('exists/check')
  @ApiOperation({ summary: 'Kiểm tra document có tồn tại không' })
  @ApiOkResponse({ 
    description: 'Kiểm tra thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Kiểm tra thành công' },
        data: { type: 'boolean', example: true }
      }
    }
  })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async exists(@Query() filter: any): Promise<CustomApiResponse<boolean>> {
    try {
      const exists = await this.baseService.exists(filter);
      return {
        success: true,
        message: 'Kiểm tra thành công',
        data: exists
      };
    } catch (error) {
      return {
        success: false,
        message: 'Kiểm tra thất bại',
        error: error.message
      };
    }
  }
}
