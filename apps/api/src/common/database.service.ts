import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Model, Schema, connect, model, models } from 'mongoose';
import { inventory, operationRecords, orders } from './data';

export type OrderStatus = 'Pending Pick' | 'Allocated' | 'Packed' | 'Ready to Ship' | 'Shipped' | 'Cancelled' | 'Exception';
export type Order = (typeof orders)[number] & { createdAt?: Date; updatedAt?: Date };
export type InventoryItem = (typeof inventory)[number] & { updatedAt?: Date };
export type CreateOrderInput = Omit<Order, 'id' | 'status' | 'createdAt' | 'updatedAt'> & { id?: string; status?: OrderStatus };
export type UpdateOrderInput = Partial<CreateOrderInput> & { status?: OrderStatus };
export type CreateInventoryInput = Omit<InventoryItem, 'updatedAt'>;
export type UpdateInventoryInput = Partial<CreateInventoryInput> & { adjustment?: number; reason?: string };
export type OperationRecord = (typeof operationRecords)[number] & { createdAt?: Date; updatedAt?: Date };
export type CreateOperationInput = Omit<OperationRecord, 'id' | 'amount' | 'quantity' | 'createdAt' | 'updatedAt'> & { id?: string; amount?: number; quantity?: number };
export type UpdateOperationInput = Partial<CreateOperationInput>;

@Injectable()
export class DatabaseService implements OnModuleInit {
  private orderModel?: Model<Order>;
  private inventoryModel?: Model<InventoryItem>;
  private operationModel?: Model<OperationRecord>;
  private ready = false;
  private memoryOrders: Order[] = orders.map((order) => ({ ...order }));
  private memoryInventory: InventoryItem[] = inventory.map((item) => ({ ...item }));
  private memoryOperations: OperationRecord[] = operationRecords.map((record) => ({ ...record }));

  constructor(private readonly config: ConfigService) {}

  async onModuleInit() {
    const uri = this.config.get<string>('MONGODB_URI');
    if (!uri) return;

    try {
      await connect(uri, { serverSelectionTimeoutMS: 1500 });
      this.orderModel =
        (models.Order as Model<Order>) ??
        model<Order>(
          'Order',
          new Schema(
            { id: { type: String, unique: true }, channel: String, customer: String, status: String, items: Number, value: Number, city: String, sla: String },
            { timestamps: true },
          ),
        );
      this.inventoryModel =
        (models.InventoryItem as Model<InventoryItem>) ??
        model<InventoryItem>(
          'InventoryItem',
          new Schema({ sku: { type: String, unique: true }, name: String, location: String, available: Number, allocated: Number, reorder: Number }, { timestamps: true }),
        );
      this.operationModel =
        (models.OperationRecord as Model<OperationRecord>) ??
        model<OperationRecord>(
          'OperationRecord',
          new Schema(
            { id: { type: String, unique: true }, module: String, type: String, name: String, status: String, location: String, owner: String, amount: Number, quantity: Number },
            { timestamps: true },
          ),
        );
      await this.seed();
      this.ready = true;
    } catch {
      this.ready = false;
    }
  }

  async getOrders() {
    if (!this.ready || !this.orderModel) return this.memoryOrders;
    return this.orderModel.find().sort({ id: 1 }).lean();
  }

  async createOrder(input: CreateOrderInput) {
    const order = {
      ...input,
      id: input.id || `SO-${Date.now().toString().slice(-6)}`,
      status: input.status || 'Pending Pick',
    };
    if (!this.ready || !this.orderModel) {
      this.memoryOrders = [order, ...this.memoryOrders];
      return order;
    }
    return this.orderModel.create(order);
  }

  async updateOrder(id: string, input: UpdateOrderInput) {
    if (!this.ready || !this.orderModel) {
      const index = this.memoryOrders.findIndex((order) => order.id === id);
      if (index < 0) throw new NotFoundException(`Order ${id} not found`);
      this.memoryOrders[index] = { ...this.memoryOrders[index], ...input };
      return this.memoryOrders[index];
    }
    const order = await this.orderModel.findOneAndUpdate({ id }, input, { new: true }).lean();
    if (!order) throw new NotFoundException(`Order ${id} not found`);
    return order;
  }

  async deleteOrder(id: string) {
    if (!this.ready || !this.orderModel) {
      const before = this.memoryOrders.length;
      this.memoryOrders = this.memoryOrders.filter((order) => order.id !== id);
      if (this.memoryOrders.length === before) throw new NotFoundException(`Order ${id} not found`);
      return { deleted: true };
    }
    const result = await this.orderModel.deleteOne({ id });
    if (!result.deletedCount) throw new NotFoundException(`Order ${id} not found`);
    return { deleted: true };
  }

  async getInventory() {
    if (!this.ready || !this.inventoryModel) return this.memoryInventory;
    return this.inventoryModel.find().sort({ sku: 1 }).lean();
  }

  async createInventory(input: CreateInventoryInput) {
    if (!this.ready || !this.inventoryModel) {
      this.memoryInventory = [input, ...this.memoryInventory.filter((item) => item.sku !== input.sku)];
      return input;
    }
    return this.inventoryModel.create(input);
  }

  async updateInventory(sku: string, input: UpdateInventoryInput) {
    const { adjustment, ...update } = input;
    if (!this.ready || !this.inventoryModel) {
      const index = this.memoryInventory.findIndex((item) => item.sku === sku);
      if (index < 0) throw new NotFoundException(`SKU ${sku} not found`);
      const available = typeof adjustment === 'number' ? this.memoryInventory[index].available + adjustment : update.available;
      this.memoryInventory[index] = { ...this.memoryInventory[index], ...update, ...(typeof available === 'number' ? { available } : {}) };
      return this.memoryInventory[index];
    }
    const patch = typeof adjustment === 'number' ? { ...update, $inc: { available: adjustment } } : update;
    const item = await this.inventoryModel.findOneAndUpdate({ sku }, patch, { new: true }).lean();
    if (!item) throw new NotFoundException(`SKU ${sku} not found`);
    return item;
  }

  async getOperations(module?: string, type?: string) {
    const matches = (record: OperationRecord) => (!module || record.module === module) && (!type || record.type === type);
    if (!this.ready || !this.operationModel) return this.memoryOperations.filter(matches);
    const query: Record<string, string> = {};
    if (module) query.module = module;
    if (type) query.type = type;
    return this.operationModel.find(query).sort({ id: 1 }).lean();
  }

  async createOperation(input: CreateOperationInput) {
    const record = {
      ...input,
      id: input.id || `${input.module.toUpperCase()}-${Date.now().toString().slice(-6)}`,
      status: input.status || 'Open',
      amount: Number(input.amount || 0),
      quantity: Number(input.quantity || 0),
    };
    if (!this.ready || !this.operationModel) {
      this.memoryOperations = [record, ...this.memoryOperations];
      return record;
    }
    return this.operationModel.create(record);
  }

  async updateOperation(id: string, input: UpdateOperationInput) {
    if (!this.ready || !this.operationModel) {
      const index = this.memoryOperations.findIndex((record) => record.id === id);
      if (index < 0) throw new NotFoundException(`Operation ${id} not found`);
      this.memoryOperations[index] = { ...this.memoryOperations[index], ...input };
      return this.memoryOperations[index];
    }
    const record = await this.operationModel.findOneAndUpdate({ id }, input, { new: true }).lean();
    if (!record) throw new NotFoundException(`Operation ${id} not found`);
    return record;
  }

  async bulkUpdateOperations(ids: string[], input: UpdateOperationInput) {
    if (!ids.length) return { updated: 0 };
    if (!this.ready || !this.operationModel) {
      let updated = 0;
      this.memoryOperations = this.memoryOperations.map((record) => {
        if (!ids.includes(record.id)) return record;
        updated += 1;
        return { ...record, ...input };
      });
      return { updated };
    }
    const result = await this.operationModel.updateMany({ id: { $in: ids } }, input);
    return { updated: result.modifiedCount };
  }

  async deleteOperation(id: string) {
    if (!this.ready || !this.operationModel) {
      const before = this.memoryOperations.length;
      this.memoryOperations = this.memoryOperations.filter((record) => record.id !== id);
      if (before === this.memoryOperations.length) throw new NotFoundException(`Operation ${id} not found`);
      return { deleted: true };
    }
    const result = await this.operationModel.deleteOne({ id });
    if (!result.deletedCount) throw new NotFoundException(`Operation ${id} not found`);
    return { deleted: true };
  }

  private async seed() {
    if (!this.orderModel || !this.inventoryModel || !this.operationModel) return;
    if ((await this.orderModel.countDocuments()) === 0) await this.orderModel.insertMany(orders);
    if ((await this.inventoryModel.countDocuments()) === 0) await this.inventoryModel.insertMany(inventory);
    if ((await this.operationModel.countDocuments()) === 0) await this.operationModel.insertMany(operationRecords);
  }
}
