import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ArrayNotEmpty, IsArray, IsNumber, IsOptional, IsString } from 'class-validator';
import { AuthGuard } from '../auth/auth.guard';
import { DatabaseService } from '../common/database.service';

class CreateOperationDto {
  @IsString()
  module!: string;

  @IsString()
  type!: string;

  @IsString()
  name!: string;

  @IsString()
  status!: string;

  @IsString()
  location!: string;

  @IsString()
  owner!: string;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsNumber()
  quantity?: number;
}

class UpdateOperationDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  owner?: string;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsNumber()
  quantity?: number;
}

class BulkStatusDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  ids!: string[];

  @IsString()
  status!: string;
}

@Controller('operations')
@UseGuards(AuthGuard)
export class OperationsController {
  constructor(private readonly db: DatabaseService) {}

  @Get()
  list(@Query('module') module?: string, @Query('type') type?: string) {
    return this.db.getOperations(module, type);
  }

  @Post()
  create(@Body() dto: CreateOperationDto) {
    return this.db.createOperation(dto);
  }

  @Patch('bulk/status')
  updateBulkStatus(@Body() dto: BulkStatusDto) {
    return this.db.bulkUpdateOperations(dto.ids, { status: dto.status });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateOperationDto) {
    return this.db.updateOperation(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.db.deleteOperation(id);
  }
}
