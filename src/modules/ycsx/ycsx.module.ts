import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { YCSXController } from './ycsx.controller';
import { YCSXService } from './ycsx.service';
import { YCSX, YCSXSchema } from '../../schemas';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: YCSX.name, schema: YCSXSchema }]),
  ],
  controllers: [YCSXController],
  providers: [YCSXService],
  exports: [YCSXService],
})
export class YCSXModule {}
