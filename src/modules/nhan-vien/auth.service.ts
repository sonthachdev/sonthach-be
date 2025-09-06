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
import { SignInDto, SignOutDto, SignUpDto } from './dto/auth.dto';

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
    const {
      username,
      password,
      ten,
      vai_tro,
      cong_doan,
      trang_thai = true,
    } = signUpDto;

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
      vai_tro,
      cong_doan,
      trang_thai,
      ngay_tao: new Date(),
      ngay_cap_nhat: new Date(),
    });

    const savedNhanVien = await newNhanVien.save();

    // Tạo JWT token cho user mới
    const payload = {
      sub: savedNhanVien._id,
      username: savedNhanVien.username,
      vai_tro: savedNhanVien.vai_tro,
      cong_doan: savedNhanVien.cong_doan,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      access_token: accessToken,
      user: {
        id: savedNhanVien._id,
        ten: savedNhanVien.ten,
        vai_tro: savedNhanVien.vai_tro,
        cong_doan: savedNhanVien.cong_doan,
        username: savedNhanVien.username,
        ngay_tao: savedNhanVien.ngay_tao,
        ngay_cap_nhat: savedNhanVien.ngay_cap_nhat,
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
        trang_thai: true,
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
      username: nhanVien.username,
      vai_tro: nhanVien.vai_tro,
      cong_doan: nhanVien.cong_doan,
    };

    const accessToken = this.jwtService.sign(payload);

    // Cập nhật thời gian đăng nhập cuối
    await this.nhanVienModel.updateOne(
      { _id: nhanVien._id },
      { ngay_cap_nhat: new Date() },
    );

    return {
      access_token: accessToken,
      user: {
        id: nhanVien._id,
        ten: nhanVien.ten,
        vai_tro: nhanVien.vai_tro,
        cong_doan: nhanVien.cong_doan,
        username: nhanVien.username,
        ngay_tao: nhanVien.ngay_tao,
        ngay_cap_nhat: nhanVien.ngay_cap_nhat,
      },
    };
  }

  /**
   * Đăng xuất nhân viên
   */
  async signOut(signOutDto: SignOutDto) {
    const { token } = signOutDto;

    try {
      // Xác thực token
      const payload = this.jwtService.verify(token);

      // Thêm token vào danh sách đen
      this.blacklistedTokens.add(token);

      return {
        success: true,
        message: 'Đăng xuất thành công',
      };
    } catch (error) {
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
  async validateToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);

      // Kiểm tra token có bị chặn không
      if (this.isTokenBlacklisted(token)) {
        throw new UnauthorizedException('Token đã bị vô hiệu hóa');
      }

      // Kiểm tra nhân viên còn tồn tại và hoạt động không
      const nhanVien = await this.nhanVienModel.findById(payload.sub).exec();
      if (!nhanVien || !nhanVien.trang_thai) {
        throw new UnauthorizedException(
          'Người dùng không tồn tại hoặc đã bị vô hiệu hóa',
        );
      }

      return payload;
    } catch (error) {
      throw new UnauthorizedException('Token không hợp lệ');
    }
  }
}
