import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { AuthGuard } from '../auth/auth.guard';
import { DatabaseService } from '../common/database.service';

class CreateProcurementDocDto {
  @IsString()
  type!: string;

  @IsString()
  documentNo!: string;

  @IsString()
  vendor!: string;

  @IsString()
  location!: string;

  @IsNumber()
  @Min(0)
  items!: number;

  @IsString()
  expectedDate!: string;

  @IsString()
  owner!: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  value?: number;

  @IsOptional()
  @IsString()
  asnNo?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  receivedQty?: number;
}

class UpdateProcurementDocDto {
  @IsOptional()
  @IsString()
  vendor?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  items?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  value?: number;

  @IsOptional()
  @IsString()
  expectedDate?: string;

  @IsOptional()
  @IsString()
  owner?: string;

  @IsOptional()
  @IsString()
  asnNo?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  receivedQty?: number;
}

@Controller('procurement')
@UseGuards(AuthGuard)
export class ProcurementController {
  constructor(private readonly db: DatabaseService) {}

  @Get()
  list(@Query('type') type?: string) {
    return this.db.getProcurementDocs(type);
  }

  @Post()
  create(@Body() dto: CreateProcurementDocDto) {
    return this.db.createProcurementDoc(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProcurementDocDto) {
    return this.db.updateProcurementDoc(id, dto);
  }
}
