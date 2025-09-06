import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NhanVienController } from './nhan-vien.controller';
import { NhanVienService } from './nhan-vien.service';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { NhanVien, NhanVienSchema } from '../../schemas';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: NhanVien.name, schema: NhanVienSchema },
      { name: 'nhan_vien', schema: NhanVienSchema },
    ]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'your-secret-key',
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '24h',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [NhanVienController],
  providers: [NhanVienService, AuthService, JwtStrategy],
  exports: [NhanVienService, AuthService],
})
export class NhanVienModule {}
