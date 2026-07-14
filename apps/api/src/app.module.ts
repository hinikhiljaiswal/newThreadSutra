import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './common/database.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { HealthModule } from './health/health.module';
import { ImportsModule } from './imports/imports.module';
import { InventoryModule } from './inventory/inventory.module';
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
    DatabaseModule,
    AuthModule,
    HealthModule,
    DashboardModule,
    ImportsModule,
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
