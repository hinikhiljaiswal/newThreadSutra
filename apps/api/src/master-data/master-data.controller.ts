import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { AuthGuard } from '../auth/auth.guard';
import { DatabaseService } from '../common/database.service';

class CreateMasterDataDto {
  @IsString()
  type!: string;

  @IsString()
  code!: string;

  @IsString()
  name!: string;

  @IsString()
  category!: string;

  @IsString()
  location!: string;

  @IsString()
  contact!: string;

  @IsString()
  owner!: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  balance?: number;
}

class UpdateMasterDataDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  contact?: string;

  @IsOptional()
  @IsString()
  owner?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  balance?: number;
}

@Controller('master-data')
@UseGuards(AuthGuard)
export class MasterDataController {
  constructor(private readonly db: DatabaseService) {}

  @Get()
  list(@Query('type') type?: string) {
    return this.db.getMasterData(type);
  }

  @Post()
  create(@Body() dto: CreateMasterDataDto) {
    return this.db.createMasterData(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMasterDataDto) {
    return this.db.updateMasterData(id, dto);
  }
}
