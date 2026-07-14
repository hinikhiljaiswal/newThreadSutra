import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { AuthGuard } from '../auth/auth.guard';
import { DatabaseService } from '../common/database.service';

class CreateLogisticsDocDto {
  @IsString()
  type!: string;

  @IsString()
  shipmentNo!: string;

  @IsString()
  orderId!: string;

  @IsString()
  carrier!: string;

  @IsString()
  service!: string;

  @IsString()
  origin!: string;

  @IsString()
  destination!: string;

  @IsString()
  owner!: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  packages?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;
}

class UpdateLogisticsDocDto {
  @IsOptional()
  @IsString()
  orderId?: string;

  @IsOptional()
  @IsString()
  carrier?: string;

  @IsOptional()
  @IsString()
  service?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  origin?: string;

  @IsOptional()
  @IsString()
  destination?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  packages?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;

  @IsOptional()
  @IsString()
  owner?: string;
}

@Controller('logistics')
@UseGuards(AuthGuard)
export class LogisticsController {
  constructor(private readonly db: DatabaseService) {}

  @Get()
  list(@Query('type') type?: string) {
    return this.db.getLogisticsDocs(type);
  }

  @Post()
  create(@Body() dto: CreateLogisticsDocDto) {
    return this.db.createLogisticsDoc(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateLogisticsDocDto) {
    return this.db.updateLogisticsDoc(id, dto);
  }
}
