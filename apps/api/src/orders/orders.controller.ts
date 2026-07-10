import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { IsIn, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { DatabaseService } from '../common/database.service';
import { AuthGuard } from '../auth/auth.guard';

const statuses = ['Pending Pick', 'Allocated', 'Packed', 'Ready to Ship', 'Shipped', 'Cancelled', 'Exception'] as const;

class CreateOrderDto {
  @IsString()
  channel!: string;

  @IsString()
  customer!: string;

  @IsString()
  city!: string;

  @IsString()
  sla!: string;

  @IsNumber()
  @Min(1)
  items!: number;

  @IsNumber()
  @Min(0)
  value!: number;

  @IsOptional()
  @IsIn(statuses)
  status?: (typeof statuses)[number];
}

class UpdateOrderDto {
  @IsOptional()
  @IsIn(statuses)
  status?: (typeof statuses)[number];

  @IsOptional()
  @IsString()
  sla?: string;
}

@Controller('orders')
@UseGuards(AuthGuard)
export class OrdersController {
  constructor(private readonly db: DatabaseService) {}

  @Get()
  list() {
    return this.db.getOrders();
  }

  @Post()
  create(@Body() dto: CreateOrderDto) {
    return this.db.createOrder(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateOrderDto) {
    return this.db.updateOrder(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.db.deleteOrder(id);
  }
}
