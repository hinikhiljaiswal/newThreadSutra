import { Module } from '@nestjs/common';
import { DatabaseModule } from '../common/database.module';
import { ProcurementController } from './procurement.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [ProcurementController],
})
export class ProcurementModule {}
