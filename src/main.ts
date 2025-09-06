import * as dotenv from 'dotenv';
dotenv.config();
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
// import { TransformIdInterceptor } from './common/interceptors/transform-id.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Global interceptor to transform Mongo _id to id across all responses
  // app.useGlobalInterceptors(new TransformIdInterceptor());

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Son Thach Company API')
    .setDescription('API documentation for Son Thach Company backend system')
    .setVersion('2.0.0')
    .addTag('bao-cao-san-luong', 'Báo cáo sản lượng management')
    .addTag('hang-muc', 'Hàng mục management')
    .addTag('nhan-vien', 'Nhân viên management')
    .addTag('phan-cong', 'Phân công management')
    .addTag('phieu-nghiep-vu', 'Phiếu nghiệp vụ management')
    .addTag('ycsc', 'Yêu cầu sản xuất management')
    .addTag('ycsx', 'Yêu cầu sản xuất management')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customSiteTitle: 'Son Thach Company API Docs',
  });

  const port = configService.get<number>('PORT', 3000);
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');
  await app.listen(port);
  console.log(`Application is running on port ${port}`);
  console.log(`Environment: ${nodeEnv}`);
  console.log(
    `Swagger documentation available at: http://localhost:${port}/api-docs`,
  );
}
bootstrap();
