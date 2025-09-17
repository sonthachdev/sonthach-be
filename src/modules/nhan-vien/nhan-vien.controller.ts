/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Controller,
  Get,
  Query,
  Param,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { BaseController, CustomApiResponse } from '../../common/base';
import { NhanVienService } from './nhan-vien.service';
import { NhanVienDocument } from '../../schemas';
import { AuthService } from './auth.service';
import {
  SignInDto,
  SignOutDto,
  SignUpDto,
  AuthResponseDto,
  RefreshTokenDto,
} from './dto/auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { VaiTro } from 'src/utils/vai-tro.enum';
import { CongDoan } from 'src/utils/cong-doan.enum';

@ApiTags('nhan-vien')
@Controller('api/nhan-vien')
export class NhanVienController extends BaseController<NhanVienDocument> {
  constructor(
    private readonly nhanVienService: NhanVienService,
    private readonly authService: AuthService,
  ) {
    super(nhanVienService);
  }

  /**
   * Đăng ký nhân viên mới
   */
  @Post('signup')
  @ApiOperation({
    summary: 'Đăng ký nhân viên mới',
    description:
      'Tạo tài khoản mới cho nhân viên với thông tin cá nhân và vai trò',
  })
  @ApiBody({ type: SignUpDto })
  @ApiOkResponse({
    description: 'Đăng ký thành công',
    type: AuthResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Thông tin đăng ký không hợp lệ' })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async signUp(@Body() signUpDto: SignUpDto): Promise<AuthResponseDto> {
    try {
      const data = await this.authService.signUp(signUpDto);
      return {
        success: true,
        message: 'Đăng ký thành công',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Đăng ký thất bại',
        error: error.message,
      };
    }
  }

  /**
   * Đăng nhập nhân viên
   */
  @Post('signin')
  @ApiOperation({
    summary: 'Đăng nhập nhân viên',
    description: 'Xác thực thông tin đăng nhập và trả về JWT token',
  })
  @ApiBody({ type: SignInDto })
  @ApiOkResponse({
    description: 'Đăng nhập thành công',
    type: AuthResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Thông tin đăng nhập không hợp lệ' })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async signIn(@Body() signInDto: SignInDto): Promise<AuthResponseDto> {
    try {
      const data = await this.authService.signIn(signInDto);
      return {
        success: true,
        message: 'Đăng nhập thành công',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Đăng nhập thất bại',
        error: error.message,
      };
    }
  }

  /**
   * Đăng xuất nhân viên
   */
  @Post('signout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Đăng xuất nhân viên',
    description: 'Vô hiệu hóa JWT token và đăng xuất người dùng',
  })
  @ApiBody({ type: SignOutDto })
  @ApiOkResponse({
    description: 'Đăng xuất thành công',
    type: AuthResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Token không hợp lệ' })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async signOut(@Body() signOutDto: SignOutDto): Promise<AuthResponseDto> {
    try {
      const data = await this.authService.signOut(signOutDto);
      return {
        success: true,
        message: 'Đăng xuất thành công',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Đăng xuất thất bại',
        error: error.message,
      };
    }
  }

  /**
   * Refresh access token
   */
  @Post('refresh-token')
  @ApiOperation({
    summary: 'Refresh access token',
    description: 'Sử dụng refresh token để tạo access token mới',
  })
  @ApiBody({ type: RefreshTokenDto })
  @ApiOkResponse({
    description: 'Refresh token thành công',
    type: AuthResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Refresh token không hợp lệ' })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<AuthResponseDto> {
    try {
      const data = await this.authService.refreshToken(refreshTokenDto);
      return {
        success: true,
        message: 'Refresh token thành công',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Refresh token thất bại',
        error: error.message,
      };
    }
  }

  /**
   * Lấy danh sách nhân viên theo vai trò
   */
  @Get('vai-tro/:vaiTro')
  @ApiOperation({
    summary: 'Lấy danh sách nhân viên theo vai trò',
    description: 'Tìm kiếm nhân viên dựa trên vai trò cụ thể',
  })
  @ApiParam({
    name: 'vaiTro',
    description: 'Vai trò của nhân viên',
    example: 'tho',
  })
  @ApiOkResponse({
    description: 'Lấy danh sách nhân viên theo vai trò thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Lấy danh sách nhân viên theo vai trò thành công',
        },
        data: {
          type: 'array',
          items: { description: 'Danh sách nhân viên theo vai trò' },
        },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Vai trò không hợp lệ' })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async findByVaiTro(
    @Param('vaiTro') vaiTro: string,
  ): Promise<CustomApiResponse<NhanVienDocument[]>> {
    try {
      const data = await this.nhanVienService.findByVaiTro(vaiTro);
      return {
        success: true,
        message: 'Lấy danh sách nhân viên theo vai trò thành công',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Lấy danh sách nhân viên theo vai trò thất bại',
        error: error.message,
      };
    }
  }

  /**
   * Lấy danh sách nhân viên theo công đoạn
   */
  @Get('cong-doan/:congDoan')
  @ApiOperation({
    summary: 'Lấy danh sách nhân viên theo công đoạn',
    description: 'Tìm kiếm nhân viên dựa trên công đoạn cụ thể',
  })
  @ApiParam({
    name: 'congDoan',
    description: 'Công đoạn của nhân viên',
    example: 'cat_da',
  })
  @ApiOkResponse({
    description: 'Lấy danh sách nhân viên theo công đoạn thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Lấy danh sách nhân viên theo công đoạn thành công',
        },
        data: {
          type: 'array',
          items: { description: 'Danh sách nhân viên theo công đoạn' },
        },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Công đoạn không hợp lệ' })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async findByCongDoan(
    @Param('congDoan') congDoan: string,
  ): Promise<CustomApiResponse<NhanVienDocument[]>> {
    try {
      const data = await this.nhanVienService.findByCongDoan(congDoan);
      return {
        success: true,
        message: 'Lấy danh sách nhân viên theo công đoạn thành công',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Lấy danh sách nhân viên theo công đoạn thất bại',
        error: error.message,
      };
    }
  }

  /**
   * Tìm kiếm nhân viên theo tên
   */
  @Get('search/ten')
  @ApiOperation({
    summary: 'Tìm kiếm nhân viên theo tên',
    description: 'Tìm kiếm nhân viên dựa trên tên (hỗ trợ tìm kiếm mờ)',
  })
  @ApiQuery({
    name: 'q',
    description: 'Từ khóa tìm kiếm',
    example: 'Nguyễn Văn A',
  })
  @ApiOkResponse({
    description: 'Tìm kiếm nhân viên thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Tìm kiếm nhân viên thành công' },
        data: {
          type: 'array',
          items: { description: 'Danh sách nhân viên tìm được' },
        },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Từ khóa tìm kiếm không hợp lệ' })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async findByTen(
    @Query('q') query: string,
  ): Promise<CustomApiResponse<NhanVienDocument[]>> {
    try {
      const data = await this.nhanVienService.findByTen(query);
      return {
        success: true,
        message: 'Tìm kiếm nhân viên thành công',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Tìm kiếm nhân viên thất bại',
        error: error.message,
      };
    }
  }

  /**
   * Lấy danh sách nhân viên đang hoạt động
   */
  @Get('active/list')
  @ApiOperation({
    summary: 'Lấy danh sách nhân viên đang hoạt động',
    description: 'Lấy tất cả nhân viên có trạng thái hoạt động',
  })
  @ApiOkResponse({
    description: 'Lấy danh sách nhân viên đang hoạt động thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Lấy danh sách nhân viên đang hoạt động thành công',
        },
        data: {
          type: 'array',
          items: { description: 'Danh sách nhân viên đang hoạt động' },
        },
      },
    },
  })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async findActive(): Promise<CustomApiResponse<NhanVienDocument[]>> {
    try {
      const data = await this.nhanVienService.findActive();
      return {
        success: true,
        message: 'Lấy danh sách nhân viên đang hoạt động thành công',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Lấy danh sách nhân viên đang hoạt động thất bại',
        error: error.message,
      };
    }
  }

  /**
   * Lấy danh sách nhân viên theo vai trò và công đoạn
   */
  @Get('filter/vai-tro-cong-doan')
  @ApiOperation({
    summary: 'Lấy danh sách nhân viên theo vai trò và công đoạn',
    description: 'Tìm kiếm nhân viên dựa trên cả vai trò và công đoạn',
  })
  @ApiQuery({
    name: 'vaiTro',
    description: 'Vai trò của nhân viên',
    example: VaiTro.NVKD,
    required: false,
  })
  @ApiQuery({
    name: 'congDoan',
    description: 'Công đoạn của nhân viên',
    example: CongDoan.BO,
    required: false,
  })
  @ApiOkResponse({
    description: 'Lấy danh sách nhân viên theo bộ lọc thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Lấy danh sách nhân viên theo bộ lọc thành công',
        },
        data: {
          type: 'array',
          items: { description: 'Danh sách nhân viên theo bộ lọc' },
        },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Tham số bộ lọc không hợp lệ' })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async findByVaiTroAndCongDoan(
    @Query('vaiTro') vaiTro: string,
    @Query('congDoan') congDoan: string,
  ): Promise<CustomApiResponse<NhanVienDocument[]>> {
    try {
      const data = await this.nhanVienService.findByVaiTroAndCongDoan(
        vaiTro,
        congDoan,
      );
      return {
        success: true,
        message: 'Lấy danh sách nhân viên theo bộ lọc thành công',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Lấy danh sách nhân viên theo bộ lọc thất bại',
        error: error.message,
      };
    }
  }

  /**
   * Cập nhật trạng thái nhân viên
   */
  @Get('update-trang-thai/:id/:trangThai')
  @ApiOperation({
    summary: 'Cập nhật trạng thái nhân viên',
    description: 'Cập nhật trạng thái hoạt động của nhân viên theo ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID của nhân viên',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiParam({
    name: 'trangThai',
    description: 'Trạng thái mới (true/false)',
    example: 'false',
  })
  @ApiOkResponse({
    description: 'Cập nhật trạng thái nhân viên thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Cập nhật trạng thái nhân viên thành công',
        },
        data: { description: 'Nhân viên đã cập nhật' },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'ID hoặc trạng thái không hợp lệ' })
  @ApiInternalServerErrorResponse({ description: 'Lỗi server' })
  async updateTrangThai(
    @Param('id') id: string,
    @Param('trangThai') trangThai: string,
  ): Promise<CustomApiResponse<NhanVienDocument>> {
    try {
      const isActive = trangThai === 'true';
      const data = await this.nhanVienService.updateTrangThai(id, isActive);
      return {
        success: true,
        message: 'Cập nhật trạng thái nhân viên thành công',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Cập nhật trạng thái nhân viên thất bại',
        error: error.message,
      };
    }
  }
}
