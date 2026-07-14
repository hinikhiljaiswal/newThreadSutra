import { Module } from '@nestjs/common';
import { DatabaseModule } from '../common/database.module';
import { AdminRecordsController } from './admin-records.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [AdminRecordsController],
})
export class AdminRecordsModule {}
