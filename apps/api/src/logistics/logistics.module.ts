import { Module } from '@nestjs/common';
import { DatabaseModule } from '../common/database.module';
import { LogisticsController } from './logistics.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [LogisticsController],
})
export class LogisticsModule {}
