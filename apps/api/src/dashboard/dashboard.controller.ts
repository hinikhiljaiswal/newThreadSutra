import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { DatabaseService } from '../common/database.service';

@Controller('dashboard')
@UseGuards(AuthGuard)
export class DashboardController {
  constructor(private readonly db: DatabaseService) {}

  @Get()
  async summary() {
    const [orders, inventory] = await Promise.all([this.db.getOrders(), this.db.getInventory()]);
    const openOrders = orders.filter((order) => order.status !== 'Exception').length;
    const exceptions = orders.filter((order) => order.status === 'Exception').length;
    const lowStock = inventory.filter((item) => item.available <= item.reorder).length;
    const value = orders.reduce((total, order) => total + order.value, 0);

    return {
      metrics: [
        { label: 'Open Orders', value: openOrders, tone: 'blue' },
        { label: 'Exceptions', value: exceptions, tone: 'red' },
        { label: 'Low Stock SKUs', value: lowStock, tone: 'amber' },
        { label: 'Order Value', value, tone: 'green', currency: true },
      ],
      queues: [
        { label: 'Pending Pick', value: orders.filter((order) => order.status === 'Pending Pick').length },
        { label: 'Allocated', value: orders.filter((order) => order.status === 'Allocated').length },
        { label: 'Packed', value: orders.filter((order) => order.status === 'Packed').length },
        { label: 'Ready to Ship', value: orders.filter((order) => order.status === 'Ready to Ship').length },
      ],
    };
  }
}
