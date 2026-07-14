import { connect, disconnect, model, models } from 'mongoose';
import type { Model } from 'mongoose';
import { importJobs, inventory, operationRecords, orders, reportRuns } from '../common/data';
import { importJobSchema, inventorySchema, operationSchema, orderSchema, reportRunSchema } from '../common/schemas';
import type { ImportJob, InventoryItem, OperationRecord, Order, ReportRun } from '../common/database.service';

async function upsertSeedData() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is required to initialize MongoDB.');

  await connect(uri, { dbName: process.env.MONGODB_DB_NAME ?? 'eretail_replica', serverSelectionTimeoutMS: 10_000 });

  const OrderModel = (models.Order as Model<Order>) ?? model<Order>('Order', orderSchema);
  const InventoryModel = (models.InventoryItem as Model<InventoryItem>) ?? model<InventoryItem>('InventoryItem', inventorySchema);
  const OperationModel = (models.OperationRecord as Model<OperationRecord>) ?? model<OperationRecord>('OperationRecord', operationSchema);
  const ImportJobModel = (models.ImportJob as Model<ImportJob>) ?? model<ImportJob>('ImportJob', importJobSchema);
  const ReportRunModel = (models.ReportRun as Model<ReportRun>) ?? model<ReportRun>('ReportRun', reportRunSchema);

  await Promise.all([OrderModel.syncIndexes(), InventoryModel.syncIndexes(), OperationModel.syncIndexes(), ImportJobModel.syncIndexes(), ReportRunModel.syncIndexes()]);
  await Promise.all(orders.map((order) => OrderModel.updateOne({ id: order.id }, { $setOnInsert: order }, { upsert: true })));
  await Promise.all(inventory.map((item) => InventoryModel.updateOne({ sku: item.sku }, { $setOnInsert: item }, { upsert: true })));
  await Promise.all(operationRecords.map((record) => OperationModel.updateOne({ id: record.id }, { $setOnInsert: record }, { upsert: true })));
  await Promise.all(importJobs.map((job) => ImportJobModel.updateOne({ id: job.id }, { $setOnInsert: job }, { upsert: true })));
  await Promise.all(reportRuns.map((run) => ReportRunModel.updateOne({ id: run.id }, { $setOnInsert: run }, { upsert: true })));

  const [orderCount, inventoryCount, operationCount, importCount, reportCount] = await Promise.all([OrderModel.countDocuments(), InventoryModel.countDocuments(), OperationModel.countDocuments(), ImportJobModel.countDocuments(), ReportRunModel.countDocuments()]);
  console.log(`MongoDB initialized: ${orderCount} orders, ${inventoryCount} inventory items, ${operationCount} operation records, ${importCount} import jobs, ${reportCount} report runs.`);
}

upsertSeedData()
  .then(() => disconnect())
  .catch(async (error) => {
    console.error(error);
    await disconnect();
    process.exit(1);
  });
