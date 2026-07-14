import { Module } from '@nestjs/common';
import { DatabaseModule } from '../common/database.module';
import { ReturnsController } from './returns.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [ReturnsController],
})
export class ReturnsModule {}
