import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { AuthGuard } from '../auth/auth.guard';
import { DatabaseService } from '../common/database.service';

class CreateImportJobDto {
  @IsString()
  type!: string;

  @IsString()
  fileName!: string;

  @IsNumber()
  @Min(0)
  rows!: number;

  @IsString()
  owner!: string;

  @IsOptional()
  @IsString()
  message?: string;
}

class UpdateImportJobDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  successRows?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  failedRows?: number;

  @IsOptional()
  @IsString()
  message?: string;
}

@Controller('imports')
@UseGuards(AuthGuard)
export class ImportsController {
  constructor(private readonly db: DatabaseService) {}

  @Get()
  list(@Query('type') type?: string) {
    return this.db.getImportJobs(type);
  }

  @Post()
  create(@Body() dto: CreateImportJobDto) {
    return this.db.createImportJob(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateImportJobDto) {
    return this.db.updateImportJob(id, dto);
  }
}
