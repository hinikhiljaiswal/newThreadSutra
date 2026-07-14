import { Module } from '@nestjs/common';
import { DatabaseModule } from '../common/database.module';
import { InventoryTasksController } from './inventory-tasks.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [InventoryTasksController],
})
export class InventoryTasksModule {}
