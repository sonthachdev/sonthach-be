import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MinLength,
  IsEnum,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { VaiTro, CongDoan } from '../../../utils';

export class SignInDto {
  @ApiProperty({
    description: 'Tên đăng nhập của nhân viên',
    example: 'nguyenvana',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: 'Mật khẩu đăng nhập',
    example: 'password123',
    required: true,
    minLength: 6,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}

export class SignUpDto {
  @ApiProperty({
    description: 'Tên đầy đủ của nhân viên',
    example: 'Nguyễn Văn A',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  ten: string;

  @ApiProperty({
    description: 'Tên đăng nhập (phải là duy nhất)',
    example: 'nguyenvana',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  username: string;

  @ApiProperty({
    description: 'Mật khẩu (tối thiểu 6 ký tự)',
    example: 'password123',
    required: true,
    minLength: 6,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: 'Vai trò của nhân viên',
    enum: VaiTro,
    example: 'tho',
    required: true,
  })
  @IsEnum(VaiTro)
  @IsNotEmpty()
  vai_tro: VaiTro;

  @ApiProperty({
    description: 'Công đoạn của nhân viên (không bắt buộc)',
    enum: CongDoan,
    example: 'cat_da',
    required: false,
  })
  @IsEnum(CongDoan)
  @IsOptional()
  cong_doan?: CongDoan;

  @ApiProperty({
    description: 'Trạng thái hoạt động (mặc định: true)',
    example: true,
    required: false,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  trang_thai?: boolean;
}

export class SignOutDto {
  @ApiProperty({
    description: 'Token JWT cần đăng xuất',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  token: string;
}

export class AuthResponseDto {
  @ApiProperty({
    description: 'Trạng thái thành công',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Thông báo kết quả',
    example: 'Đăng nhập thành công',
  })
  message: string;

  @ApiProperty({
    description: 'Dữ liệu trả về',
    example: {
      access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      user: {
        id: '507f1f77bcf86cd799439011',
        ten: 'Nguyễn Văn A',
        vai_tro: 'tho',
        username: 'nguyenvana',
      },
    },
  })
  data?: any;

  @ApiProperty({
    description: 'Thông báo lỗi (nếu có)',
    example: 'Tên đăng nhập hoặc mật khẩu không đúng',
    required: false,
  })
  error?: string;
}
