# Base CRUD System

Hệ thống CRUD cơ bản cho NestJS với Mongoose, cung cấp các chức năng CRUD chuẩn mà bạn có thể extend cho tất cả các schema.

## Cấu trúc

```
src/common/base/
├── base.service.ts      # Base service với các method CRUD cơ bản
├── base.controller.ts   # Base controller với các endpoint CRUD cơ bản
├── base.dto.ts         # Base DTOs với validation
└── index.ts            # Export tất cả base classes
```

## Tính năng có sẵn

### BaseService
- `create(createDto)` - Tạo mới document
- `findAll(filter, options)` - Lấy danh sách với pagination, filter, sort, populate
- `findById(id, populate)` - Tìm theo ID
- `findOne(filter, populate)` - Tìm theo điều kiện
- `update(id, updateDto)` - Cập nhật theo ID
- `updateMany(filter, updateDto)` - Cập nhật nhiều documents
- `delete(id)` - Xóa theo ID
- `deleteMany(filter)` - Xóa nhiều documents
- `count(filter)` - Đếm số documents
- `exists(filter)` - Kiểm tra tồn tại
- `findOneAndUpdate(filter, updateDto, upsert)` - Tìm và cập nhật

### BaseController
- `POST /` - Tạo mới
- `GET /` - Lấy danh sách (với pagination, filter, sort, populate)
- `GET /:id` - Lấy theo ID
- `PUT /:id` - Cập nhật theo ID
- `DELETE /:id` - Xóa theo ID
- `GET /count/total` - Đếm tổng số
- `GET /exists/check` - Kiểm tra tồn tại

### Base DTOs
- `BaseCreateDto` - Base cho create DTO
- `BaseUpdateDto` - Base cho update DTO
- `BaseFilterDto` - Base cho filter DTO
- `PaginationDto` - DTO cho pagination

## Cách sử dụng

### 1. Tạo Service

```typescript
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseService } from '../../common/base';
import { TenSchema, TenSchemaDocument } from '../../schemas';

@Injectable()
export class TenSchemaService extends BaseService<TenSchemaDocument> {
  constructor(
    @InjectModel(TenSchema.name)
    private readonly tenSchemaModel: Model<TenSchemaDocument>
  ) {
    super(tenSchemaModel);
  }

  // Thêm các method đặc biệt cho schema này
  async findByField(field: string): Promise<TenSchemaDocument[]> {
    return await this.model.find({ field }).exec();
  }
}
```

### 2. Tạo Controller

```typescript
import { Controller } from '@nestjs/common';
import { BaseController, ApiResponse } from '../../common/base';
import { TenSchemaService } from './ten-schema.service';
import { TenSchemaDocument } from '../../schemas';

@Controller('ten-schema')
export class TenSchemaController extends BaseController<TenSchemaDocument> {
  constructor(private readonly tenSchemaService: TenSchemaService) {
    super(tenSchemaService);
  }

  // Thêm các endpoint đặc biệt
  @Get('custom/endpoint')
  async customMethod(): Promise<ApiResponse<TenSchemaDocument[]>> {
    // Implementation
  }
}
```

### 3. Tạo Module

```typescript
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TenSchemaController } from './ten-schema.controller';
import { TenSchemaService } from './ten-schema.service';
import { TenSchema, TenSchemaSchema } from '../../schemas';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TenSchema.name, schema: TenSchemaSchema }
    ])
  ],
  controllers: [TenSchemaController],
  providers: [TenSchemaService],
  exports: [TenSchemaService]
})
export class TenSchemaModule {}
```

### 4. Tạo DTOs

```typescript
import { IsString, IsOptional } from 'class-validator';
import { BaseCreateDto, BaseUpdateDto, BaseFilterDto } from '../../../common/base';

export class CreateTenSchemaDto extends BaseCreateDto {
  @IsString()
  field: string;
}

export class UpdateTenSchemaDto extends BaseUpdateDto {
  @IsOptional()
  @IsString()
  field?: string;
}

export class FilterTenSchemaDto extends BaseFilterDto {
  @IsOptional()
  @IsString()
  field?: string;
}
```

## Query Parameters

### Pagination
- `page` - Số trang (mặc định: 1)
- `limit` - Số items mỗi trang (mặc định: 10)

### Sorting
- `sort` - Format: "field:order,field2:order2" (ví dụ: "createdAt:-1,name:1")
  - `1` = ascending
  - `-1` = descending

### Population
- `populate` - Format: "field1,field2" để populate các reference fields

### Filtering
- Tất cả các field khác trong query params sẽ được sử dụng làm filter

## Ví dụ API Calls

### Tạo mới
```bash
POST /api/ten-schema
Content-Type: application/json

{
  "field": "value"
}
```

### Lấy danh sách với pagination và sort
```bash
GET /api/ten-schema?page=1&limit=20&sort=createdAt:-1,name:1
```

### Lấy danh sách với filter và populate
```bash
GET /api/ten-schema?trang_thai=true&populate=nhan_vien,hang_muc
```

### Lấy theo ID với populate
```bash
GET /api/ten-schema/64f1234567890abcdef12345?populate=nhan_vien
```

### Cập nhật
```bash
PUT /api/ten-schema/64f1234567890abcdef12345
Content-Type: application/json

{
  "field": "new value"
}
```

### Xóa
```bash
DELETE /api/ten-schema/64f1234567890abcdef12345
```

## Response Format

Tất cả API responses đều có format chuẩn:

```typescript
interface ApiResponse<T> {
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
```

## Error Handling

Hệ thống tự động xử lý các lỗi phổ biến:
- `NotFoundException` - Không tìm thấy document
- `BadRequestException` - Dữ liệu không hợp lệ
- Validation errors từ class-validator

## Lưu ý

1. Tất cả các method trong BaseService đều có error handling
2. Validation được thực hiện tự động thông qua class-validator
3. Pagination được xử lý tự động với metadata đầy đủ
4. Populate được hỗ trợ cho tất cả các method find
5. Timestamps được tự động cập nhật khi tạo/sửa document
