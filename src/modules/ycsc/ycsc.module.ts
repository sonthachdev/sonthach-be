import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { YCSCController } from './ycsc.controller';
import { YCSCService } from './ycsc.service';
import { YCSC, YCSCSchema } from '../../schemas';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: YCSC.name, schema: YCSCSchema }]),
  ],
  controllers: [YCSCController],
  providers: [YCSCService],
  exports: [YCSCService],
})
export class YCSCModule {}
