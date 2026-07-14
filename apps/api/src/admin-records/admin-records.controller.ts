import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { IsOptional, IsString } from 'class-validator';
import { AuthGuard } from '../auth/auth.guard';
import { DatabaseService } from '../common/database.service';

class CreateAdminRecordDto {
  @IsString()
  type!: string;

  @IsString()
  code!: string;

  @IsString()
  name!: string;

  @IsString()
  role!: string;

  @IsString()
  location!: string;

  @IsString()
  channel!: string;

  @IsString()
  lastEvent!: string;

  @IsString()
  owner!: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  severity?: string;
}

class UpdateAdminRecordDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  channel?: string;

  @IsOptional()
  @IsString()
  lastEvent?: string;

  @IsOptional()
  @IsString()
  severity?: string;

  @IsOptional()
  @IsString()
  owner?: string;
}

@Controller('admin-records')
@UseGuards(AuthGuard)
export class AdminRecordsController {
  constructor(private readonly db: DatabaseService) {}

  @Get()
  list(@Query('type') type?: string) {
    return this.db.getAdminRecords(type);
  }

  @Post()
  create(@Body() dto: CreateAdminRecordDto) {
    return this.db.createAdminRecord(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAdminRecordDto) {
    return this.db.updateAdminRecord(id, dto);
  }
}
