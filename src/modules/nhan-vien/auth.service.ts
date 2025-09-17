/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { NhanVien, NhanVienDocument } from '../../schemas';
import {
  SignInDto,
  SignOutDto,
  SignUpDto,
  RefreshTokenDto,
} from './dto/auth.dto';

export interface JwtPayload {
  sub: string;
  ten?: string;
  username?: string;
  vaiTro?: string;
  congDoan?: string;
  [key: string]: any;
}

@Injectable()
export class AuthService {
  private readonly blacklistedTokens: Set<string> = new Set();

  constructor(
    @InjectModel(NhanVien.name)
    private readonly nhanVienModel: Model<NhanVienDocument>,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Đăng ký nhân viên mới
   */
  async signUp(signUpDto: SignUpDto) {
    const { username, password, ten, vaiTro, congDoan, trangThai } = signUpDto;

    // Kiểm tra username đã tồn tại chưa
    const existingUser = await this.nhanVienModel.findOne({ username }).exec();
    if (existingUser) {
      throw new ConflictException('Tên đăng nhập đã tồn tại');
    }

    // Hash mật khẩu
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Tạo nhân viên mới
    const newNhanVien = new this.nhanVienModel({
      ten,
      username,
      password: hashedPassword,
      vaiTro,
      congDoan,
      trangThai,
      ngayTao: new Date(),
      ngayCapNhat: new Date(),
    });

    const savedNhanVien = await newNhanVien.save();

    // Tạo JWT token cho user mới
    const payload = {
      sub: savedNhanVien._id,
      ten: savedNhanVien.ten,
      username: savedNhanVien.username,
      vaiTro: savedNhanVien.vaiTro,
      congDoan: savedNhanVien.congDoan,
    };

    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);

    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
      user: {
        id: savedNhanVien._id,
        ten: savedNhanVien.ten,
        vaiTro: savedNhanVien.vaiTro,
        congDoan: savedNhanVien.congDoan,
        username: savedNhanVien.username,
        ngayTao: savedNhanVien.ngayTao,
        ngayCapNhat: savedNhanVien.ngayCapNhat,
      },
    };
  }

  /**
   * Đăng nhập nhân viên
   */
  async signIn(signInDto: SignInDto) {
    const { username, password } = signInDto;

    // Tìm nhân viên theo username
    const nhanVien = await this.nhanVienModel
      .findOne({
        username: username,
        trangThai: true,
      })
      .exec();

    if (!nhanVien) {
      throw new UnauthorizedException('Tên đăng nhập hoặc mật khẩu không đúng');
    }

    // Kiểm tra mật khẩu
    const isPasswordValid = await bcrypt.compare(password, nhanVien.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Tên đăng nhập hoặc mật khẩu không đúng');
    }

    // Tạo JWT token
    const payload = {
      sub: nhanVien._id,
      ten: nhanVien.ten,
      username: nhanVien.username,
      vaiTro: nhanVien.vaiTro,
      congDoan: nhanVien.congDoan,
    };

    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);

    // Cập nhật thời gian đăng nhập cuối
    await this.nhanVienModel.updateOne(
      { _id: nhanVien._id },
      { ngayCapNhat: new Date() },
    );

    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
      user: {
        _id: nhanVien._id,
        ten: nhanVien.ten,
        vaiTro: nhanVien.vaiTro,
        congDoan: nhanVien.congDoan,
        username: nhanVien.username,
      },
    };
  }

  /**
   * Đăng xuất nhân viên
   */
  signOut(signOutDto: SignOutDto) {
    const { token } = signOutDto;

    try {
      // Xác thực token
      this.jwtService.verify(token);

      // Thêm token vào danh sách đen
      this.blacklistedTokens.add(token);

      return {
        success: true,
        message: 'Đăng xuất thành công',
      };
    } catch {
      throw new BadRequestException('Token không hợp lệ');
    }
  }

  /**
   * Kiểm tra token có bị chặn không
   */
  isTokenBlacklisted(token: string): boolean {
    return this.blacklistedTokens.has(token);
  }

  /**
   * Tạo mật khẩu hash
   */
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  /**
   * Xác thực token
   */
  async validateToken(token: string): Promise<JwtPayload> {
    try {
      const payload = this.jwtService.verify(token);

      // Kiểm tra token có bị chặn không
      if (this.isTokenBlacklisted(token)) {
        throw new UnauthorizedException('Token đã bị vô hiệu hóa');
      }

      // Kiểm tra nhân viên còn tồn tại và hoạt động không
      const nhanVien = await this.nhanVienModel.findById(payload.sub).exec();
      if (!nhanVien || !nhanVien.trangThai) {
        throw new UnauthorizedException(
          'Người dùng không tồn tại hoặc đã bị vô hiệu hóa',
        );
      }

      return payload;
    } catch {
      throw new UnauthorizedException('Token không hợp lệ');
    }
  }

  /**
   * Tạo access token
   */
  private generateAccessToken(payload: Record<string, any>): string {
    return this.jwtService.sign(payload, { expiresIn: '15m' });
  }

  /**
   * Tạo refresh token
   */
  private generateRefreshToken(payload: Record<string, any>): string {
    return this.jwtService.sign(payload, { expiresIn: '7d' });
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    const { refreshToken } = refreshTokenDto;

    try {
      // Xác thực refresh token
      const payload = this.jwtService.verify(refreshToken);

      // Kiểm tra refresh token có bị chặn không
      if (this.isTokenBlacklisted(refreshToken)) {
        throw new UnauthorizedException('Refresh token đã bị vô hiệu hóa');
      }

      // Kiểm tra nhân viên còn tồn tại và hoạt động không
      const nhanVien = await this.nhanVienModel.findById(payload.sub).exec();
      if (!nhanVien || !nhanVien.trangThai) {
        throw new UnauthorizedException(
          'Người dùng không tồn tại hoặc đã bị vô hiệu hóa',
        );
      }

      // Tạo access token mới
      const newAccessTokenPayload = {
        sub: nhanVien._id,
        ten: nhanVien.ten,
        username: nhanVien.username,
        vaiTro: nhanVien.vaiTro,
        congDoan: nhanVien.congDoan,
      };

      const newAccessToken = this.generateAccessToken(newAccessTokenPayload);

      // Tạo refresh token mới (optional - có thể giữ nguyên refresh token cũ)
      const newRefreshToken = this.generateRefreshToken(newAccessTokenPayload);

      // Thêm refresh token cũ vào danh sách đen
      this.blacklistedTokens.add(refreshToken);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        user: {
          id: nhanVien._id,
          ten: nhanVien.ten,
          vaiTro: nhanVien.vaiTro,
          congDoan: nhanVien.congDoan,
          username: nhanVien.username,
        },
      };
    } catch {
      throw new UnauthorizedException('Refresh token không hợp lệ');
    }
  }
}
