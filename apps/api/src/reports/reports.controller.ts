import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { AuthGuard } from '../auth/auth.guard';
import { DatabaseService } from '../common/database.service';

class CreateReportRunDto {
  @IsString()
  type!: string;

  @IsNumber()
  @Min(0)
  rows!: number;

  @IsString()
  owner!: string;

  @IsString()
  format!: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  totalAmount?: number;

  @IsOptional()
  @IsString()
  message?: string;
}

class UpdateReportRunDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  rows?: number;

  @IsOptional()
  @IsString()
  format?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  totalAmount?: number;

  @IsOptional()
  @IsString()
  message?: string;
}

@Controller('reports')
@UseGuards(AuthGuard)
export class ReportsController {
  constructor(private readonly db: DatabaseService) {}

  @Get()
  list(@Query('type') type?: string) {
    return this.db.getReportRuns(type);
  }

  @Post()
  create(@Body() dto: CreateReportRunDto) {
    return this.db.createReportRun(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateReportRunDto) {
    return this.db.updateReportRun(id, dto);
  }
}
