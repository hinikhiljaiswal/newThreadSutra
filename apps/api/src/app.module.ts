import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AdminRecordsModule } from './admin-records/admin-records.module';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './common/database.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { HealthModule } from './health/health.module';
import { ImportsModule } from './imports/imports.module';
import { InventoryModule } from './inventory/inventory.module';
import { InventoryTasksModule } from './inventory-tasks/inventory-tasks.module';
import { LogisticsModule } from './logistics/logistics.module';
import { MasterDataModule } from './master-data/master-data.module';
import { OperationsModule } from './operations/operations.module';
import { OrdersModule } from './orders/orders.module';
import { ProcurementModule } from './procurement/procurement.module';
import { ReportsModule } from './reports/reports.module';
import { ReturnsModule } from './returns/returns.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env', '../../.env'] }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    AdminRecordsModule,
    DatabaseModule,
    AuthModule,
    HealthModule,
    DashboardModule,
    ImportsModule,
    InventoryTasksModule,
    LogisticsModule,
    MasterDataModule,
    OrdersModule,
    InventoryModule,
    OperationsModule,
    ReportsModule,
    ProcurementModule,
    ReturnsModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
