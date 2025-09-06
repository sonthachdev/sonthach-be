/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  Model,
  Document,
  FilterQuery,
  UpdateQuery,
  QueryOptions,
} from 'mongoose';

@Injectable()
export abstract class BaseService<T extends Document> {
  constructor(protected readonly model: Model<T>) {}

  /**
   * Tạo mới một document
   */
  async create(createDto: any): Promise<T> {
    try {
      const created = new this.model(createDto);
      return await created.save();
    } catch (error) {
      throw new BadRequestException(`Không thể tạo: ${error.message}`);
    }
  }

  /**
   * Tìm tất cả documents với pagination và filter
   */
  async findAll(
    filter: FilterQuery<T> = {},
    options: {
      page?: number;
      limit?: number;
      sort?: any;
      populate?: string | string[];
      populateSelect?: { path: string; select: string }[];
    } = {},
  ): Promise<{
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      page = 1,
      limit = 10,
      sort = { createdAt: -1 },
      populate,
      populateSelect,
    } = options;
    const skip = (page - 1) * limit;

    let query = this.model.find(filter).sort(sort).skip(skip).limit(limit);

    if (populate) {
      query = query.populate(populate);
    }

    if (populateSelect) {
      query = query.populate(populateSelect);
    }

    const [data, total] = await Promise.all([
      query.exec(),
      this.model.countDocuments(filter),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Tìm document theo ID
   */
  async findById(id: string, populate?: string | string[]): Promise<T> {
    try {
      let query = this.model.findById(id);

      if (populate) {
        query = query.populate(populate);
      }

      const document = await query.exec();

      if (!document) {
        throw new NotFoundException(`Không tìm thấy document với ID: ${id}`);
      }

      return document;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`ID không hợp lệ: ${id}`);
    }
  }

  /**
   * Tìm document theo điều kiện
   */
  async findOne(
    filter: FilterQuery<T>,
    populate?: string | string[],
  ): Promise<T | null> {
    let query = this.model.findOne(filter);

    if (populate) {
      query = query.populate(populate);
    }

    return await query.exec();
  }

  /**
   * Cập nhật document theo ID
   */
  async update(id: string, updateDto: UpdateQuery<T>): Promise<T> {
    try {
      const options: QueryOptions = { new: true, runValidators: true };
      const updated = await this.model.findByIdAndUpdate(
        id,
        updateDto,
        options,
      );

      if (!updated) {
        throw new NotFoundException(`Không tìm thấy document với ID: ${id}`);
      }

      return updated;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Không thể cập nhật: ${error.message}`);
    }
  }

  /**
   * Cập nhật nhiều documents theo điều kiện
   */
  async updateMany(
    filter: FilterQuery<T>,
    updateDto: UpdateQuery<T>,
  ): Promise<{ modifiedCount: number }> {
    try {
      const result = await this.model.updateMany(filter, updateDto, {
        runValidators: true,
      });
      return { modifiedCount: result.modifiedCount };
    } catch (error) {
      throw new BadRequestException(`Không thể cập nhật: ${error.message}`);
    }
  }

  /**
   * Xóa document theo ID
   */
  async delete(id: string): Promise<{ deletedCount: number }> {
    try {
      const deleted = await this.model.findByIdAndDelete(id);

      if (!deleted) {
        throw new NotFoundException(`Không tìm thấy document với ID: ${id}`);
      }

      return { deletedCount: 1 };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Không thể xóa: ${error.message}`);
    }
  }

  /**
   * Xóa nhiều documents theo điều kiện
   */
  async deleteMany(filter: FilterQuery<T>): Promise<{ deletedCount: number }> {
    try {
      const result = await this.model.deleteMany(filter);
      return { deletedCount: result.deletedCount };
    } catch (error) {
      throw new BadRequestException(`Không thể xóa: ${error.message}`);
    }
  }

  /**
   * Đếm số documents theo điều kiện
   */
  async count(filter: FilterQuery<T> = {}): Promise<number> {
    return await this.model.countDocuments(filter);
  }

  /**
   * Kiểm tra document có tồn tại không
   */
  async exists(filter: FilterQuery<T>): Promise<boolean> {
    const count = await this.model.countDocuments(filter);
    return count > 0;
  }

  /**
   * Tìm và cập nhật document (upsert)
   */
  async findOneAndUpdate(
    filter: FilterQuery<T>,
    updateDto: UpdateQuery<T>,
    upsert = false,
  ): Promise<T> {
    try {
      const options: QueryOptions = {
        new: true,
        runValidators: true,
        upsert,
      };

      const updated = await this.model.findOneAndUpdate(
        filter,
        updateDto,
        options,
      );

      if (!updated) {
        throw new NotFoundException('Không tìm thấy document để cập nhật');
      }

      return updated;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Không thể cập nhật: ${error.message}`);
    }
  }
}
