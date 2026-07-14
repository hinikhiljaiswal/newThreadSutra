import { connect, disconnect, model, models } from 'mongoose';
import type { Model } from 'mongoose';
import { adminRecords, importJobs, inventory, inventoryTasks, logisticsDocs, masterData, operationRecords, orders, procurementDocs, reportRuns, returnCases } from '../common/data';
import { adminRecordSchema, importJobSchema, inventorySchema, inventoryTaskSchema, logisticsDocSchema, masterDataSchema, operationSchema, orderSchema, procurementDocSchema, reportRunSchema, returnCaseSchema } from '../common/schemas';
import type { AdminRecord, ImportJob, InventoryItem, InventoryTask, LogisticsDoc, MasterDataRecord, OperationRecord, Order, ProcurementDoc, ReportRun, ReturnCase } from '../common/database.service';

async function upsertSeedData() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is required to initialize MongoDB.');

  await connect(uri, { dbName: process.env.MONGODB_DB_NAME ?? 'eretail_replica', serverSelectionTimeoutMS: 10_000 });

  const OrderModel = (models.Order as Model<Order>) ?? model<Order>('Order', orderSchema);
  const InventoryModel = (models.InventoryItem as Model<InventoryItem>) ?? model<InventoryItem>('InventoryItem', inventorySchema);
  const OperationModel = (models.OperationRecord as Model<OperationRecord>) ?? model<OperationRecord>('OperationRecord', operationSchema);
  const ImportJobModel = (models.ImportJob as Model<ImportJob>) ?? model<ImportJob>('ImportJob', importJobSchema);
  const ReportRunModel = (models.ReportRun as Model<ReportRun>) ?? model<ReportRun>('ReportRun', reportRunSchema);
  const ReturnCaseModel = (models.ReturnCase as Model<ReturnCase>) ?? model<ReturnCase>('ReturnCase', returnCaseSchema);
  const MasterDataModel = (models.MasterDataRecord as Model<MasterDataRecord>) ?? model<MasterDataRecord>('MasterDataRecord', masterDataSchema);
  const ProcurementDocModel = (models.ProcurementDoc as Model<ProcurementDoc>) ?? model<ProcurementDoc>('ProcurementDoc', procurementDocSchema);
  const AdminRecordModel = (models.AdminRecord as Model<AdminRecord>) ?? model<AdminRecord>('AdminRecord', adminRecordSchema);
  const LogisticsDocModel = (models.LogisticsDoc as Model<LogisticsDoc>) ?? model<LogisticsDoc>('LogisticsDoc', logisticsDocSchema);
  const InventoryTaskModel = (models.InventoryTask as Model<InventoryTask>) ?? model<InventoryTask>('InventoryTask', inventoryTaskSchema);

  await Promise.all([OrderModel.syncIndexes(), InventoryModel.syncIndexes(), OperationModel.syncIndexes(), ImportJobModel.syncIndexes(), ReportRunModel.syncIndexes(), ReturnCaseModel.syncIndexes(), MasterDataModel.syncIndexes(), ProcurementDocModel.syncIndexes(), AdminRecordModel.syncIndexes(), LogisticsDocModel.syncIndexes(), InventoryTaskModel.syncIndexes()]);
  await Promise.all(orders.map((order) => OrderModel.updateOne({ id: order.id }, { $setOnInsert: order }, { upsert: true })));
  await Promise.all(inventory.map((item) => InventoryModel.updateOne({ sku: item.sku }, { $setOnInsert: item }, { upsert: true })));
  await Promise.all(operationRecords.map((record) => OperationModel.updateOne({ id: record.id }, { $setOnInsert: record }, { upsert: true })));
  await Promise.all(importJobs.map((job) => ImportJobModel.updateOne({ id: job.id }, { $setOnInsert: job }, { upsert: true })));
  await Promise.all(reportRuns.map((run) => ReportRunModel.updateOne({ id: run.id }, { $setOnInsert: run }, { upsert: true })));
  await Promise.all(returnCases.map((item) => ReturnCaseModel.updateOne({ id: item.id }, { $setOnInsert: item }, { upsert: true })));
  await Promise.all(masterData.map((item) => MasterDataModel.updateOne({ id: item.id }, { $setOnInsert: item }, { upsert: true })));
  await Promise.all(procurementDocs.map((item) => ProcurementDocModel.updateOne({ id: item.id }, { $setOnInsert: item }, { upsert: true })));
  await Promise.all(adminRecords.map((item) => AdminRecordModel.updateOne({ id: item.id }, { $setOnInsert: item }, { upsert: true })));
  await Promise.all(logisticsDocs.map((item) => LogisticsDocModel.updateOne({ id: item.id }, { $setOnInsert: item }, { upsert: true })));
  await Promise.all(inventoryTasks.map((item) => InventoryTaskModel.updateOne({ id: item.id }, { $setOnInsert: item }, { upsert: true })));

  const [orderCount, inventoryCount, operationCount, importCount, reportCount, returnCount, masterCount, procurementCount, adminCount, logisticsCount, inventoryTaskCount] = await Promise.all([OrderModel.countDocuments(), InventoryModel.countDocuments(), OperationModel.countDocuments(), ImportJobModel.countDocuments(), ReportRunModel.countDocuments(), ReturnCaseModel.countDocuments(), MasterDataModel.countDocuments(), ProcurementDocModel.countDocuments(), AdminRecordModel.countDocuments(), LogisticsDocModel.countDocuments(), InventoryTaskModel.countDocuments()]);
  console.log(`MongoDB initialized: ${orderCount} orders, ${inventoryCount} inventory items, ${operationCount} operation records, ${importCount} import jobs, ${reportCount} report runs, ${returnCount} return cases, ${masterCount} master records, ${procurementCount} procurement docs, ${adminCount} admin records, ${logisticsCount} logistics docs, ${inventoryTaskCount} inventory tasks.`);
}

upsertSeedData()
  .then(() => disconnect())
  .catch(async (error) => {
    console.error(error);
    await disconnect();
    process.exit(1);
  });
