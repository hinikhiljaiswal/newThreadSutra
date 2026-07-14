import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { AuthGuard } from '../auth/auth.guard';
import { DatabaseService } from '../common/database.service';

class CreateInventoryTaskDto {
  @IsString()
  type!: string;

  @IsString()
  sku!: string;

  @IsString()
  name!: string;

  @IsString()
  fromLocation!: string;

  @IsString()
  toLocation!: string;

  @IsString()
  reason!: string;

  @IsString()
  owner!: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  quantity?: number;
}

class UpdateInventoryTaskDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  fromLocation?: string;

  @IsOptional()
  @IsString()
  toLocation?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  quantity?: number;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  owner?: string;
}

@Controller('inventory-tasks')
@UseGuards(AuthGuard)
export class InventoryTasksController {
  constructor(private readonly db: DatabaseService) {}

  @Get()
  list(@Query('type') type?: string) {
    return this.db.getInventoryTasks(type);
  }

  @Post()
  create(@Body() dto: CreateInventoryTaskDto) {
    return this.db.createInventoryTask(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateInventoryTaskDto) {
    return this.db.updateInventoryTask(id, dto);
  }
}
