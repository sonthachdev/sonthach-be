import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BaoCaoSanLuongModule } from './modules/bao-cao-san-luong/bao-cao-san-luong.module';
import { HangMucModule } from './modules/hang-muc/hang-muc.module';
import { NhanVienModule } from './modules/nhan-vien/nhan-vien.module';
import { PhanCongModule } from './modules/phan-cong/phan-cong.module';
import { PhieuNghiepVuModule } from './modules/phieu-nghiep-vu/phieu-nghiep-vu.module';
import { YCSCModule } from './modules/ycsc/ycsc.module';
import { YCSXModule } from './modules/ycsx/ycsx.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        uri:
          configService.get<string>('MONGODB_URI') ||
          'mongodb://localhost:27017/sonthach_v2',
        // Mongoose 8 / MongoDB Driver 6: deprecated flags removed, options flattened
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 30000,
        socketTimeoutMS: 45000,
        bufferCommands: false,
        connectionFactory: (connection) => {
          connection.on('connected', () =>
            console.log('[MongoDB] connected to', connection.name),
          );
          connection.on('error', (err) =>
            console.error('[MongoDB] connection error:', err?.message ?? err),
          );
          connection.on('disconnected', () =>
            console.warn('[MongoDB] disconnected'),
          );
          return connection;
        },
      }),
      inject: [ConfigService],
    }),
    BaoCaoSanLuongModule,
    HangMucModule,
    NhanVienModule,
    PhanCongModule,
    PhieuNghiepVuModule,
    YCSCModule,
    YCSXModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
