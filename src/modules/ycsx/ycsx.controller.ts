/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Controller, Get, Query, Param, Post, Body, Put } from '@nestjs/common';
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
import { YCSXService } from './ycsx.service';
import {
  BaoCaoSanLuongDocument,
  HangMucDocument,
  PhanCongDocument,
  PhieuNghiepVuDocument,
  YCSXDocument,
} from '../../schemas';
import {
  CreateYCSXDto,
  FilterYCSXDto,
  UpdateDeNghiSanXuatDto,
  UpdateHangMucYCSXDto,
  CreateHangMucYCSXDto,
  UpdateTrangThaiYCSXDto,
} from './dto/ycsx.dto';
import { NhapNguyenLieuDto } from './dto/ycsx.nguyen-lieu.dto';
import {
  BaoCaoSanLuongByYCSXDto,
  UpdateBaoCaoSanLuongByYCSXDto,
  XuatKhoBaoCaoSanLuongByYCSXDto,
  ApproveChuyenTiepBaoCaoSanLuongByYCSXDto,
} from './dto/ycsx.bcsl';

@ApiTags('ycsx')
@Controller('api/ycsx')
export class YCSXController extends BaseController<YCSXDocument> {
  constructor(private readonly ycsxService: YCSXService) {
    super(ycsxService);
  }

  /**
   * Lấy danh sách yêu cầu sản xuất theo trạng thái
   */
  @Get('trang-thai/:trangThai')
  @ApiOperation({
    summary: 'Lấy danh sách yêu cầu sản xuất theo trạng thái',
    description: 'Tìm kiếm yêu cầu sản xuất dựa trên trạng thái cụ thể',
  })
  @ApiParam({
    name: 'trangThai',
    description: 'Trạng thái yêu cầu',
    example: 'cho-xu-ly',
  })
  @ApiOkResponse({
    description: 'Lấy danh sách yêu cầu sản xuất theo trạng thái thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Lấy danh sách yêu cầu sản xuất theo trạng thái thành công',
        },
        data: {
          type: 'array',
          items: { description: 'Danh sách yêu cầu sản xuất theo trạng thái' },
        },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Trạng thái không hợp lệ' })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async findByTrangThai(
    @Param('trangThai') trangThai: string,
  ): Promise<CustomApiResponse<YCSXDocument[]>> {
    try {
      const data = await this.ycsxService.findByTrangThai(trangThai);
      return {
        success: true,
        message: 'Lấy danh sách yêu cầu sản xuất theo trạng thái thành công',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Lấy danh sách yêu cầu sản xuất theo trạng thái thất bại',
        error: error.message,
      };
    }
  }

  /**
   * Lấy danh sách yêu cầu sản xuất theo nhân viên
   */
  @Get('nhan-vien/:nhanVienId')
  @ApiOperation({
    summary: 'Lấy danh sách yêu cầu sản xuất theo nhân viên',
    description: 'Tìm kiếm yêu cầu sản xuất dựa trên nhân viên cụ thể',
  })
  @ApiParam({
    name: 'nhanVienId',
    description: 'ID của nhân viên',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiOkResponse({
    description: 'Lấy danh sách yêu cầu sản xuất theo nhân viên thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Lấy danh sách yêu cầu sản xuất theo nhân viên thành công',
        },
        data: {
          type: 'array',
          items: { description: 'Danh sách yêu cầu sản xuất theo nhân viên' },
        },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'ID nhân viên không hợp lệ' })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async findByNhanVien(
    @Param('nhanVienId') nhanVienId: string,
  ): Promise<CustomApiResponse<YCSXDocument[]>> {
    try {
      const data = await this.ycsxService.findByNhanVien(nhanVienId);
      return {
        success: true,
        message: 'Lấy danh sách yêu cầu sản xuất theo nhân viên thành công',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Lấy danh sách yêu cầu sản xuất theo nhân viên thất bại',
        error: error.message,
      };
    }
  }

  /**
   * Lấy danh sách yêu cầu sản xuất theo ngày tạo
   */
  @Get('ngay-tao')
  @ApiOperation({
    summary: 'Lấy danh sách yêu cầu sản xuất theo ngày tạo',
    description: 'Tìm kiếm yêu cầu sản xuất dựa trên ngày tạo cụ thể',
  })
  @ApiQuery({
    name: 'ngayTao',
    description: 'Ngày tạo (YYYY-MM-DD)',
    example: '2024-12-01',
  })
  @ApiOkResponse({
    description: 'Lấy danh sách yêu cầu sản xuất theo ngày tạo thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Lấy danh sách yêu cầu sản xuất theo ngày tạo thành công',
        },
        data: {
          type: 'array',
          items: { description: 'Danh sách yêu cầu sản xuất theo ngày tạo' },
        },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Ngày không hợp lệ' })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async findByNgayTao(
    @Query('ngayTao') ngayTao: string,
  ): Promise<CustomApiResponse<YCSXDocument[]>> {
    try {
      const data = await this.ycsxService.findByNgayTao(new Date(ngayTao));
      return {
        success: true,
        message: 'Lấy danh sách yêu cầu sản xuất theo ngày tạo thành công',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Lấy danh sách yêu cầu sản xuất theo ngày tạo thất bại',
        error: error.message,
      };
    }
  }

  /**
   * Lấy danh sách yêu cầu sản xuất theo loại yêu cầu
   */
  @Get('loai-yeu-cau/:loaiYeuCau')
  @ApiOperation({
    summary: 'Lấy danh sách yêu cầu sản xuất theo loại yêu cầu',
    description: 'Tìm kiếm yêu cầu sản xuất dựa trên loại yêu cầu cụ thể',
  })
  @ApiParam({
    name: 'loaiYeuCau',
    description: 'Loại yêu cầu',
    example: 'san-xuat',
  })
  @ApiOkResponse({
    description: 'Lấy danh sách yêu cầu sản xuất theo loại yêu cầu thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example:
            'Lấy danh sách yêu cầu sản xuất theo loại yêu cầu thành công',
        },
        data: {
          type: 'array',
          items: {
            description: 'Danh sách yêu cầu sản xuất theo loại yêu cầu',
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Loại yêu cầu không hợp lệ' })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async findByLoaiYeuCau(
    @Param('loaiYeuCau') loaiYeuCau: string,
  ): Promise<CustomApiResponse<YCSXDocument[]>> {
    try {
      const data = await this.ycsxService.findByLoaiYeuCau(loaiYeuCau);
      return {
        success: true,
        message: 'Lấy danh sách yêu cầu sản xuất theo loại yêu cầu thành công',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Lấy danh sách yêu cầu sản xuất theo loại yêu cầu thất bại',
        error: error.message,
      };
    }
  }

  /**
   * Lấy danh sách yêu cầu sản xuất chờ xử lý
   */
  @Get('cho-xu-ly')
  @ApiOperation({
    summary: 'Lấy danh sách yêu cầu sản xuất chờ xử lý',
    description: 'Tìm kiếm tất cả yêu cầu sản xuất có trạng thái chờ xử lý',
  })
  @ApiOkResponse({
    description: 'Lấy danh sách yêu cầu sản xuất chờ xử lý thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Lấy danh sách yêu cầu sản xuất chờ xử lý thành công',
        },
        data: {
          type: 'array',
          items: { description: 'Danh sách yêu cầu sản xuất chờ xử lý' },
        },
      },
    },
  })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async findChoXuLy(): Promise<CustomApiResponse<YCSXDocument[]>> {
    try {
      const data = await this.ycsxService.findChoXuLy();
      return {
        success: true,
        message: 'Lấy danh sách yêu cầu sản xuất chờ xử lý thành công',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Lấy danh sách yêu cầu sản xuất chờ xử lý thất bại',
        error: error.message,
      };
    }
  }

  /**
   * Cập nhật trạng thái yêu cầu sản xuất
   */
  @Get(':id/trang-thai/:trangThai')
  @ApiOperation({
    summary: 'Cập nhật trạng thái yêu cầu sản xuất',
    description: 'Cập nhật trạng thái của yêu cầu sản xuất cụ thể',
  })
  @ApiParam({
    name: 'id',
    description: 'ID của yêu cầu sản xuất',
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
        data: { description: 'Yêu cầu sản xuất đã cập nhật' },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'ID hoặc trạng thái không hợp lệ' })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async updateTrangThai(
    @Param('id') id: string,
    @Param('trangThai') trangThai: string,
  ): Promise<CustomApiResponse<YCSXDocument>> {
    try {
      const data = await this.ycsxService.updateTrangThai(id, trangThai);
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

  /**
   * Tạo yêu cầu sản xuất
   */
  @Post()
  @ApiOperation({
    summary: 'Tạo yêu cầu sản xuất',
  })
  @ApiBody({ type: CreateYCSXDto })
  @ApiOkResponse({
    description: 'Tạo yêu cầu sản xuất thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Tạo yêu cầu sản xuất thành công' },
        data: { description: 'Yêu cầu sản xuất đã tạo' },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Dữ liệu không hợp lệ' })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async create(
    @Body() createDto: CreateYCSXDto,
  ): Promise<CustomApiResponse<YCSXDocument>> {
    try {
      const data = await this.ycsxService.createYCSX(createDto);
      return {
        success: true,
        message: 'Tạo yêu cầu sản xuất thành công',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Tạo yêu cầu sản xuất thất bại',
        error: error.message,
      };
    }
  }

  /**
   * Lấy danh sách yêu cầu sản xuất theo filter
   */
  @Get('filter')
  @ApiOperation({
    summary: 'Lấy danh sách yêu cầu sản xuất theo filter',
  })
  // @ApiQuery({ type: FilterYCSXDto })
  @ApiOkResponse({
    description: 'Lấy danh sách yêu cầu sản xuất theo filter thành công',
  })
  @ApiBadRequestResponse({ description: 'Filter không hợp lệ' })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async filterYCSX(@Query() filter: FilterYCSXDto): Promise<
    CustomApiResponse<{
      ycsx: YCSXDocument[];
      total: number;
      totalPages: number;
    }>
  > {
    try {
      const data = await this.ycsxService.filterYCSX(filter);
      return {
        success: true,
        message: 'Lấy danh sách yêu cầu sản xuất theo filter thành công',
        data: data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Lấy danh sách yêu cầu sản xuất theo filter thất bại',
        error: error.message,
      };
    }
  }

  // Put :id/de-nghi-san-xuat
  @Put(':id/de-nghi-san-xuat')
  @ApiOperation({
    summary: 'Cập nhật đề nghị sản xuất',
  })
  @ApiParam({
    name: 'id',
    description: 'ID của yêu cầu sản xuất',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({ type: UpdateDeNghiSanXuatDto })
  @ApiOkResponse({
    description: 'Cập nhật đề nghị sản xuất thành công',
  })
  @ApiBadRequestResponse({ description: 'Dữ liệu không hợp lệ' })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async updateDeNghiSanXuat(
    @Param('id') id: string,
    @Body() updateDto: UpdateDeNghiSanXuatDto,
  ): Promise<
    CustomApiResponse<{
      ycsx: YCSXDocument;
      phan_cong: PhanCongDocument[];
    }>
  > {
    try {
      const data = await this.ycsxService.updateDeNghiSanXuat(id, updateDto);
      return {
        success: true,
        message: 'Cập nhật đề nghị sản xuất thành công',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Cập nhật đề nghị sản xuất thất bại',
        error: error.message,
      };
    }
  }

  // Put :id/duyet-ycsx
  @Put(':id/trang-thai')
  @ApiOperation({
    summary: 'Cập nhật trạng thái yêu cầu sản xuất',
  })
  @ApiParam({
    name: 'id',
    description: 'ID của yêu cầu sản xuất',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({ type: UpdateTrangThaiYCSXDto })
  @ApiOkResponse({
    description: 'Cập nhật trạng thái yêu cầu sản xuất thành công',
  })
  @ApiBadRequestResponse({ description: 'Dữ liệu không hợp lệ' })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async updateTrangThaiYCSX(
    @Param('id') id: string,
    @Body() body: UpdateTrangThaiYCSXDto,
  ): Promise<CustomApiResponse<YCSXDocument>> {
    try {
      const data = await this.ycsxService.updateTrangThaiYCSX(id, body);
      return {
        success: true,
        message: 'Cập nhật trạng thái yêu cầu sản xuất thành công',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Cập nhật trạng thái yêu cầu sản xuất thất bại',
        error: error.message,
      };
    }
  }

  // get :id
  @Get(':id/detail')
  @ApiOperation({
    summary: 'Lấy yêu cầu sản xuất theo ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID của yêu cầu sản xuất',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiOkResponse({
    description: 'Lấy yêu cầu sản xuất theo ID thành công',
  })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async getDetailYCSX(@Param('id') id: string): Promise<
    CustomApiResponse<{
      ycsx: YCSXDocument;
      phan_cong: PhanCongDocument[];
    }>
  > {
    try {
      const data = await this.ycsxService.getDetailYCSX(id);
      return {
        success: true,
        message: 'Lấy yêu cầu sản xuất theo ID thành công',
        data,
      };
    } catch (error) {
      console.log('error', error);
      return {
        success: false,
        message: 'Lấy yêu cầu sản xuất theo ID thất bại',
        error: error.message,
      };
    }
  }

  // put :id/hang-muc
  @Put(':id/hang-muc/:hangMucId')
  @ApiOperation({
    summary: 'Cập nhật hang-muc',
  })
  @ApiParam({
    name: 'id',
    description: 'ID của yêu cầu sản xuất',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiParam({
    name: 'hangMucId',
    description: 'ID của hàng mục',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({ type: UpdateHangMucYCSXDto })
  @ApiOkResponse({
    description: 'Cập nhật hang-muc thành công',
  })
  @ApiBadRequestResponse({ description: 'Dữ liệu không hợp lệ' })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async updateHangMucYCSX(
    @Param('id') id: string,
    @Param('hangMucId') hangMucId: string,
    @Body() body: UpdateHangMucYCSXDto,
  ): Promise<CustomApiResponse<HangMucDocument>> {
    try {
      const data = await this.ycsxService.updateHangMucYCSX(
        id,
        hangMucId,
        body,
      );
      return {
        success: true,
        message: 'Cập nhật hang-muc thành công',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Cập nhật hang-muc thất bại',
        error: error.message,
      };
    }
  }

  // post :id/hang-muc
  @Post(':id/hang-muc')
  @ApiOperation({
    summary: 'Tạo hang-muc',
  })
  @ApiParam({
    name: 'id',
    description: 'ID của yêu cầu sản xuất',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({ type: CreateHangMucYCSXDto })
  @ApiOkResponse({
    description: 'Tạo hang-muc thành công',
  })
  @ApiBadRequestResponse({ description: 'Dữ liệu không hợp lệ' })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async createHangMucYCSX(
    @Param('id') id: string,
    @Body() body: CreateHangMucYCSXDto,
  ): Promise<CustomApiResponse<HangMucDocument[]>> {
    try {
      const data = await this.ycsxService.createHangMucYCSX(id, body);
      return {
        success: true,
        message: 'Tạo hang-muc thành công',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Tạo hang-muc thất bại',
        error: error.message,
      };
    }
  }

  // post :id/congdoan/:congdoanId/nhap-nguyen-lieu
  @Post(':id/congdoan/:congdoanId/nhap-nguyen-lieu')
  @ApiOperation({
    summary: 'Nhập nguyên liệu',
  })
  @ApiParam({
    name: 'id',
    description: 'ID của yêu cầu sản xuất',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiParam({
    name: 'congdoanId',
    description: 'ID của công đoạn',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({ type: NhapNguyenLieuDto })
  @ApiOkResponse({
    description: 'Nhập nguyên liệu thành công',
  })
  @ApiBadRequestResponse({ description: 'Dữ liệu không hợp lệ' })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async nhapNguyenLieu(
    @Param('id') id: string,
    @Param('congdoanId') congdoanId: string,
    @Body() body: NhapNguyenLieuDto,
  ): Promise<CustomApiResponse<PhieuNghiepVuDocument>> {
    try {
      const data = await this.ycsxService.addNguyenLieuYCSXByCongDoan(
        id,
        congdoanId,
        body,
      );
      return {
        success: true,
        message: 'Nhập nguyên liệu thành công',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Nhập nguyên liệu thất bại',
        error: error.message,
      };
    }
  }

  // post :id/congdoan/:congdoanId/bao-cao-san-luong
  @Post(':id/congdoan/:congdoanId/bao-cao-san-luong')
  @ApiOperation({
    summary: 'Thêm báo cáo sản lượng vào yêu cầu sản xuất',
  })
  @ApiParam({
    name: 'id',
    description: 'ID của yêu cầu sản xuất',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiParam({
    name: 'congdoanId',
    description: 'ID của công đoạn',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({ type: BaoCaoSanLuongByYCSXDto })
  async addBaoCaoSanLuongByYCSX(
    @Param('id') id: string,
    @Param('congdoanId') congdoanId: string,
    @Body() body: BaoCaoSanLuongByYCSXDto,
  ): Promise<CustomApiResponse<BaoCaoSanLuongDocument>> {
    try {
      const data = await this.ycsxService.addBaoCaoSanLuongByYCSX(
        id,
        congdoanId,
        body,
      );
      return {
        success: true,
        message: 'Thêm báo cáo sản lượng vào yêu cầu sản xuất thành công',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Thêm báo cáo sản lượng vào yêu cầu sản xuất thất bại',
        error: error.message,
      };
    }
  }

  // put :id/congdoan/:congdoanId/bao-cao-san-luong
  @Put(':id/congdoan/:congdoanId/bao-cao-san-luong')
  @ApiOperation({
    summary: 'Cập nhật báo cáo sản lượng vào yêu cầu sản xuất',
  })
  @ApiParam({
    name: 'id',
    description: 'ID của yêu cầu sản xuất',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiParam({
    name: 'congdoanId',
    description: 'ID của công đoạn',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({ type: UpdateBaoCaoSanLuongByYCSXDto })
  @ApiOkResponse({
    description: 'Cập nhật báo cáo sản lượng vào yêu cầu sản xuất thành công',
  })
  @ApiBadRequestResponse({ description: 'Dữ liệu không hợp lệ' })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async updateBaoCaoSanLuongByYCSX(
    @Param('id') id: string,
    @Param('congdoanId') congdoanId: string,
    @Body() body: UpdateBaoCaoSanLuongByYCSXDto,
  ): Promise<CustomApiResponse<BaoCaoSanLuongDocument[]>> {
    try {
      const data = await this.ycsxService.updateBaoCaoSanLuongByYCSX(
        id,
        congdoanId,
        body,
      );
      return {
        success: true,
        message: 'Cập nhật báo cáo sản lượng vào yêu cầu sản xuất thành công',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Cập nhật báo cáo sản lượng vào yêu cầu sản xuất thất bại',
        error: error.message,
      };
    }
  }

  // post :id/congdoan/:congdoanId/xuat-kho
  @Post(':id/congdoan/:congdoanId/xuat-kho')
  @ApiOperation({
    summary: 'Xuất kho báo cáo sản lượng vào yêu cầu sản xuất',
  })
  @ApiParam({
    name: 'id',
    description: 'ID của yêu cầu sản xuất',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiParam({
    name: 'congdoanId',
    description: 'ID của công đoạn',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({ type: XuatKhoBaoCaoSanLuongByYCSXDto })
  @ApiOkResponse({
    description: 'Xuất kho báo cáo sản lượng vào yêu cầu sản xuất thành công',
  })
  @ApiBadRequestResponse({ description: 'Dữ liệu không hợp lệ' })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async xuatKhoBaoCaoSanLuongByYCSX(
    @Param('id') id: string,
    @Param('congdoanId') congdoanId: string,
    @Body() body: XuatKhoBaoCaoSanLuongByYCSXDto,
  ): Promise<CustomApiResponse<BaoCaoSanLuongDocument[]>> {
    try {
      const data = await this.ycsxService.xuatKhoBaoCaoSanLuongByYCSX(
        id,
        congdoanId,
        body,
      );
      return {
        success: true,
        message: 'Xuất kho báo cáo sản lượng vào yêu cầu sản xuất thành công',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Xuất kho báo cáo sản lượng vào yêu cầu sản xuất thất bại',
        error: error.message,
      };
    }
  }

  // put :id/congdoan/:congdoanId/duyet-chuyen-tiep
  @Put(':id/congdoan/:congdoanId/duyet-chuyen-tiep')
  @ApiOperation({
    summary: 'Duyệt chuyển tiếp báo cáo sản lượng vào yêu cầu sản xuất',
  })
  @ApiParam({
    name: 'id',
    description: 'ID của yêu cầu sản xuất',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiParam({
    name: 'congdoanId',
    description: 'ID của công đoạn',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({ type: ApproveChuyenTiepBaoCaoSanLuongByYCSXDto })
  @ApiOkResponse({
    description:
      'Duyệt chuyển tiếp báo cáo sản lượng vào yêu cầu sản xuất thành công',
  })
  @ApiBadRequestResponse({ description: 'Dữ liệu không hợp lệ' })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async approveChuyenTiepBaoCaoSanLuongByYCSX(
    @Param('id') id: string,
    @Param('congdoanId') congdoanId: string,
    @Body() body: ApproveChuyenTiepBaoCaoSanLuongByYCSXDto,
  ): Promise<CustomApiResponse<PhieuNghiepVuDocument[]>> {
    try {
      const data = await this.ycsxService.approveChuyenTiepBaoCaoSanLuongByYCSX(
        id,
        congdoanId,
        body,
      );
      return {
        success: true,
        message:
          'Duyệt chuyển tiếp báo cáo sản lượng vào yêu cầu sản xuất thành công',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message:
          'Duyệt chuyển tiếp báo cáo sản lượng vào yêu cầu sản xuất thất bại',
        error: error.message,
      };
    }
  }
}
