import { connect, disconnect, model, models } from 'mongoose';
import type { Model } from 'mongoose';
import { inventory, operationRecords, orders } from '../common/data';
import { inventorySchema, operationSchema, orderSchema } from '../common/schemas';
import type { InventoryItem, OperationRecord, Order } from '../common/database.service';

async function upsertSeedData() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is required to initialize MongoDB.');

  await connect(uri, { dbName: process.env.MONGODB_DB_NAME ?? 'eretail_replica', serverSelectionTimeoutMS: 10_000 });

  const OrderModel = (models.Order as Model<Order>) ?? model<Order>('Order', orderSchema);
  const InventoryModel = (models.InventoryItem as Model<InventoryItem>) ?? model<InventoryItem>('InventoryItem', inventorySchema);
  const OperationModel = (models.OperationRecord as Model<OperationRecord>) ?? model<OperationRecord>('OperationRecord', operationSchema);

  await Promise.all([OrderModel.syncIndexes(), InventoryModel.syncIndexes(), OperationModel.syncIndexes()]);
  await Promise.all(orders.map((order) => OrderModel.updateOne({ id: order.id }, { $setOnInsert: order }, { upsert: true })));
  await Promise.all(inventory.map((item) => InventoryModel.updateOne({ sku: item.sku }, { $setOnInsert: item }, { upsert: true })));
  await Promise.all(operationRecords.map((record) => OperationModel.updateOne({ id: record.id }, { $setOnInsert: record }, { upsert: true })));

  const [orderCount, inventoryCount, operationCount] = await Promise.all([OrderModel.countDocuments(), InventoryModel.countDocuments(), OperationModel.countDocuments()]);
  console.log(`MongoDB initialized: ${orderCount} orders, ${inventoryCount} inventory items, ${operationCount} operation records.`);
}

upsertSeedData()
  .then(() => disconnect())
  .catch(async (error) => {
    console.error(error);
    await disconnect();
    process.exit(1);
  });
