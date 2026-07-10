import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { AuthGuard } from '../auth/auth.guard';
import { DatabaseService } from '../common/database.service';

class CreateInventoryDto {
  @IsString()
  sku!: string;

  @IsString()
  name!: string;

  @IsString()
  location!: string;

  @IsNumber()
  @Min(0)
  available!: number;

  @IsNumber()
  @Min(0)
  allocated!: number;

  @IsNumber()
  @Min(0)
  reorder!: number;
}

class UpdateInventoryDto {
  @IsOptional()
  @IsNumber()
  adjustment?: number;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  reorder?: number;
}

@Controller('inventory')
@UseGuards(AuthGuard)
export class InventoryController {
  constructor(private readonly db: DatabaseService) {}

  @Get()
  list() {
    return this.db.getInventory();
  }

  @Post()
  create(@Body() dto: CreateInventoryDto) {
    return this.db.createInventory(dto);
  }

  @Patch(':sku')
  update(@Param('sku') sku: string, @Body() dto: UpdateInventoryDto) {
    return this.db.updateInventory(sku, dto);
  }
}
