import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { AuthGuard } from '../auth/auth.guard';
import { DatabaseService } from '../common/database.service';

class CreateReturnCaseDto {
  @IsString()
  type!: string;

  @IsString()
  orderId!: string;

  @IsString()
  customer!: string;

  @IsString()
  city!: string;

  @IsString()
  reason!: string;

  @IsString()
  disposition!: string;

  @IsNumber()
  @Min(0)
  quantity!: number;

  @IsNumber()
  @Min(0)
  refundAmount!: number;

  @IsString()
  owner!: string;

  @IsString()
  dock!: string;

  @IsOptional()
  @IsString()
  status?: string;
}

class UpdateReturnCaseDto {
  @IsOptional()
  @IsString()
  customer?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  disposition?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  quantity?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  refundAmount?: number;

  @IsOptional()
  @IsString()
  owner?: string;

  @IsOptional()
  @IsString()
  dock?: string;
}

@Controller('returns')
@UseGuards(AuthGuard)
export class ReturnsController {
  constructor(private readonly db: DatabaseService) {}

  @Get()
  list(@Query('type') type?: string) {
    return this.db.getReturnCases(type);
  }

  @Post()
  create(@Body() dto: CreateReturnCaseDto) {
    return this.db.createReturnCase(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateReturnCaseDto) {
    return this.db.updateReturnCase(id, dto);
  }
}
