import { Module } from '@nestjs/common';
import { DatabaseModule } from '../common/database.module';
import { MasterDataController } from './master-data.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [MasterDataController],
})
export class MasterDataModule {}
