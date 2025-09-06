/**
 * TEMPLATE ĐỂ TẠO CRUD CHO SCHEMA MỚI
 *
 * 1. Tạo Service (extend BaseService):
 *
 * import { Injectable } from '@nestjs/common';
 * import { InjectModel } from '@nestjs/mongoose';
 * import { Model } from 'mongoose';
 * import { BaseService } from '../../common/base';
 * import { TenSchema, TenSchemaDocument } from '../../schemas';
 *
 * @Injectable()
 * export class TenSchemaService extends BaseService<TenSchemaDocument> {
 *   constructor(
 *     @InjectModel(TenSchema.name)
 *     private readonly tenSchemaModel: Model<TenSchemaDocument>
 *   ) {
 *     super(tenSchemaModel);
 *   }
 *
 *   // Thêm các method đặc biệt cho schema này
 *   async findByField(field: string): Promise<TenSchemaDocument[]> {
 *     return await this.model.find({ field }).exec();
 *   }
 * }
 *
 * 2. Tạo Controller (extend BaseController):
 *
 * import { Controller } from '@nestjs/common';
 * import { BaseController, ApiResponse } from '../../common/base';
 * import { TenSchemaService } from './ten-schema.service';
 * import { TenSchemaDocument } from '../../schemas';
 *
 * @Controller('ten-schema')
 * export class TenSchemaController extends BaseController<TenSchemaDocument> {
 *   constructor(private readonly tenSchemaService: TenSchemaService) {
 *     super(tenSchemaService);
 *   }
 *
 *   // Thêm các endpoint đặc biệt
 *   @Get('custom/endpoint')
 *   async customMethod(): Promise<ApiResponse<TenSchemaDocument[]>> {
 *     // Implementation
 *   }
 * }
 *
 * 3. Tạo Module:
 *
 * import { Module } from '@nestjs/common';
 * import { MongooseModule } from '@nestjs/mongoose';
 * import { TenSchemaController } from './ten-schema.controller';
 * import { TenSchemaService } from './ten-schema.service';
 * import { TenSchema, TenSchemaSchema } from '../../schemas';
 *
 * @Module({
 *   imports: [
 *     MongooseModule.forFeature([
 *       { name: TenSchema.name, schema: TenSchemaSchema }
 *     ])
 *   ],
 *   controllers: [TenSchemaController],
 *   providers: [TenSchemaService],
 *   exports: [TenSchemaService]
 * })
 * export class TenSchemaModule {}
 *
 * 4. Tạo DTOs (extend Base DTOs):
 *
 * import { IsString, IsOptional } from 'class-validator';
 * import { BaseCreateDto, BaseUpdateDto, BaseFilterDto } from '../../../common/base';
 *
 * export class CreateTenSchemaDto extends BaseCreateDto {
 *   @IsString()
 *   field: string;
 *
 *   // Thêm các field khác
 * }
 *
 * export class UpdateTenSchemaDto extends BaseUpdateDto {
 *   @IsOptional()
 *   @IsString()
 *   field?: string;
 *
 *   // Thêm các field khác
 * }
 *
 * export class FilterTenSchemaDto extends BaseFilterDto {
 *   @IsOptional()
 *   @IsString()
 *   field?: string;
 *
 *   // Thêm các field khác
 * }
 *
 * 5. Cập nhật app.module.ts:
 *
 * import { TenSchemaModule } from './modules/ten-schema/ten-schema.module';
 *
 * @Module({
 *   imports: [
 *     // ... other imports
 *     TenSchemaModule
 *   ],
 *   // ... rest of module config
 * })
 * export class AppModule {}
 */

// Các endpoint CRUD cơ bản có sẵn từ BaseController:
// POST / - Tạo mới
// GET / - Lấy danh sách (với pagination, filter, sort, populate)
// GET /:id - Lấy theo ID
// PUT /:id - Cập nhật theo ID
// DELETE /:id - Xóa theo ID
// GET /count/total - Đếm tổng số
// GET /exists/check - Kiểm tra tồn tại

// Các method CRUD cơ bản có sẵn từ BaseService:
// create(createDto)
// findAll(filter, options)
// findById(id, populate)
// findOne(filter, populate)
// update(id, updateDto)
// updateMany(filter, updateDto)
// delete(id)
// deleteMany(filter)
// count(filter)
// exists(filter)
// findOneAndUpdate(filter, updateDto, upsert)
