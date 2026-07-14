import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Model, connect, model, models } from 'mongoose';
import { adminRecords, importJobs, inventory, inventoryTasks, logisticsDocs, masterData, operationRecords, orders, procurementDocs, reportRuns, returnCases } from './data';
import { adminRecordSchema, importJobSchema, inventorySchema, inventoryTaskSchema, logisticsDocSchema, masterDataSchema, operationSchema, orderSchema, procurementDocSchema, reportRunSchema, returnCaseSchema } from './schemas';

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
export type ImportJob = (typeof importJobs)[number] & { createdAt?: Date; updatedAt?: Date };
export type CreateImportJobInput = Omit<ImportJob, 'id' | 'status' | 'successRows' | 'failedRows' | 'message' | 'createdAt' | 'updatedAt'> & { id?: string; status?: string; successRows?: number; failedRows?: number; message?: string };
export type UpdateImportJobInput = Partial<Omit<ImportJob, 'id' | 'type' | 'fileName' | 'rows' | 'owner' | 'createdAt' | 'updatedAt'>>;
export type ReportRun = (typeof reportRuns)[number] & { createdAt?: Date; updatedAt?: Date };
export type CreateReportRunInput = Omit<ReportRun, 'id' | 'status' | 'message' | 'totalAmount' | 'createdAt' | 'updatedAt'> & { id?: string; status?: string; message?: string; totalAmount?: number };
export type UpdateReportRunInput = Partial<Omit<ReportRun, 'id' | 'type' | 'createdAt' | 'updatedAt'>>;
export type ReturnCase = (typeof returnCases)[number] & { createdAt?: Date; updatedAt?: Date };
export type CreateReturnCaseInput = Omit<ReturnCase, 'id' | 'status' | 'createdAt' | 'updatedAt'> & { id?: string; status?: string };
export type UpdateReturnCaseInput = Partial<Omit<ReturnCase, 'id' | 'type' | 'orderId' | 'createdAt' | 'updatedAt'>>;
export type MasterDataRecord = (typeof masterData)[number] & { createdAt?: Date; updatedAt?: Date };
export type CreateMasterDataInput = Omit<MasterDataRecord, 'id' | 'status' | 'balance' | 'createdAt' | 'updatedAt'> & { id?: string; status?: string; balance?: number };
export type UpdateMasterDataInput = Partial<Omit<MasterDataRecord, 'id' | 'type' | 'code' | 'createdAt' | 'updatedAt'>>;
export type ProcurementDoc = (typeof procurementDocs)[number] & { createdAt?: Date; updatedAt?: Date };
export type CreateProcurementDocInput = Omit<ProcurementDoc, 'id' | 'status' | 'value' | 'asnNo' | 'receivedQty' | 'createdAt' | 'updatedAt'> & { id?: string; status?: string; value?: number; asnNo?: string; receivedQty?: number };
export type UpdateProcurementDocInput = Partial<Omit<ProcurementDoc, 'id' | 'type' | 'documentNo' | 'createdAt' | 'updatedAt'>>;
export type AdminRecord = (typeof adminRecords)[number] & { createdAt?: Date; updatedAt?: Date };
export type CreateAdminRecordInput = Omit<AdminRecord, 'id' | 'status' | 'severity' | 'createdAt' | 'updatedAt'> & { id?: string; status?: string; severity?: string };
export type UpdateAdminRecordInput = Partial<Omit<AdminRecord, 'id' | 'type' | 'code' | 'createdAt' | 'updatedAt'>>;
export type LogisticsDoc = (typeof logisticsDocs)[number] & { createdAt?: Date; updatedAt?: Date };
export type CreateLogisticsDocInput = Omit<LogisticsDoc, 'id' | 'status' | 'packages' | 'weight' | 'createdAt' | 'updatedAt'> & { id?: string; status?: string; packages?: number; weight?: number };
export type UpdateLogisticsDocInput = Partial<Omit<LogisticsDoc, 'id' | 'type' | 'shipmentNo' | 'createdAt' | 'updatedAt'>>;
export type InventoryTask = (typeof inventoryTasks)[number] & { createdAt?: Date; updatedAt?: Date };
export type CreateInventoryTaskInput = Omit<InventoryTask, 'id' | 'status' | 'quantity' | 'createdAt' | 'updatedAt'> & { id?: string; status?: string; quantity?: number };
export type UpdateInventoryTaskInput = Partial<Omit<InventoryTask, 'id' | 'type' | 'sku' | 'createdAt' | 'updatedAt'>>;

@Injectable()
export class DatabaseService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseService.name);
  private orderModel?: Model<Order>;
  private inventoryModel?: Model<InventoryItem>;
  private operationModel?: Model<OperationRecord>;
  private importJobModel?: Model<ImportJob>;
  private reportRunModel?: Model<ReportRun>;
  private returnCaseModel?: Model<ReturnCase>;
  private masterDataModel?: Model<MasterDataRecord>;
  private procurementDocModel?: Model<ProcurementDoc>;
  private adminRecordModel?: Model<AdminRecord>;
  private logisticsDocModel?: Model<LogisticsDoc>;
  private inventoryTaskModel?: Model<InventoryTask>;
  private ready = false;
  private memoryOrders: Order[] = orders.map((order) => ({ ...order }));
  private memoryInventory: InventoryItem[] = inventory.map((item) => ({ ...item }));
  private memoryOperations: OperationRecord[] = operationRecords.map((record) => ({ ...record }));
  private memoryImportJobs: ImportJob[] = importJobs.map((job) => ({ ...job }));
  private memoryReportRuns: ReportRun[] = reportRuns.map((run) => ({ ...run }));
  private memoryReturnCases: ReturnCase[] = returnCases.map((item) => ({ ...item }));
  private memoryMasterData: MasterDataRecord[] = masterData.map((item) => ({ ...item }));
  private memoryProcurementDocs: ProcurementDoc[] = procurementDocs.map((item) => ({ ...item }));
  private memoryAdminRecords: AdminRecord[] = adminRecords.map((item) => ({ ...item }));
  private memoryLogisticsDocs: LogisticsDoc[] = logisticsDocs.map((item) => ({ ...item }));
  private memoryInventoryTasks: InventoryTask[] = inventoryTasks.map((item) => ({ ...item }));

  constructor(private readonly config: ConfigService) {}

  async onModuleInit() {
    const uri = this.config.get<string>('MONGODB_URI');
    if (!uri) {
      this.logger.warn('MONGODB_URI is not set. Using in-memory seed data.');
      return;
    }

    try {
      await connect(uri, { dbName: this.config.get<string>('MONGODB_DB_NAME') ?? 'eretail_replica', serverSelectionTimeoutMS: 10_000 });
      this.orderModel = (models.Order as Model<Order>) ?? model<Order>('Order', orderSchema);
      this.inventoryModel = (models.InventoryItem as Model<InventoryItem>) ?? model<InventoryItem>('InventoryItem', inventorySchema);
      this.operationModel = (models.OperationRecord as Model<OperationRecord>) ?? model<OperationRecord>('OperationRecord', operationSchema);
      this.importJobModel = (models.ImportJob as Model<ImportJob>) ?? model<ImportJob>('ImportJob', importJobSchema);
      this.reportRunModel = (models.ReportRun as Model<ReportRun>) ?? model<ReportRun>('ReportRun', reportRunSchema);
      this.returnCaseModel = (models.ReturnCase as Model<ReturnCase>) ?? model<ReturnCase>('ReturnCase', returnCaseSchema);
      this.masterDataModel = (models.MasterDataRecord as Model<MasterDataRecord>) ?? model<MasterDataRecord>('MasterDataRecord', masterDataSchema);
      this.procurementDocModel = (models.ProcurementDoc as Model<ProcurementDoc>) ?? model<ProcurementDoc>('ProcurementDoc', procurementDocSchema);
      this.adminRecordModel = (models.AdminRecord as Model<AdminRecord>) ?? model<AdminRecord>('AdminRecord', adminRecordSchema);
      this.logisticsDocModel = (models.LogisticsDoc as Model<LogisticsDoc>) ?? model<LogisticsDoc>('LogisticsDoc', logisticsDocSchema);
      this.inventoryTaskModel = (models.InventoryTask as Model<InventoryTask>) ?? model<InventoryTask>('InventoryTask', inventoryTaskSchema);
      await this.seed();
      this.ready = true;
      this.logger.log('MongoDB connected, indexed, and seeded.');
    } catch (error) {
      this.ready = false;
      this.logger.error('MongoDB initialization failed.', error instanceof Error ? error.stack : String(error));
      if (this.config.get<string>('NODE_ENV') === 'production') throw error;
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

  async bulkUpdateOrders(ids: string[], input: UpdateOrderInput) {
    if (!ids.length) return { updated: 0 };
    if (!this.ready || !this.orderModel) {
      let updated = 0;
      this.memoryOrders = this.memoryOrders.map((order) => {
        if (!ids.includes(order.id)) return order;
        updated += 1;
        return { ...order, ...input };
      });
      return { updated };
    }
    const result = await this.orderModel.updateMany({ id: { $in: ids } }, input);
    return { updated: result.modifiedCount };
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

  async getImportJobs(type?: string) {
    if (!this.ready || !this.importJobModel) return type ? this.memoryImportJobs.filter((job) => job.type === type) : this.memoryImportJobs;
    const query = type ? { type } : {};
    return this.importJobModel.find(query).sort({ createdAt: -1, id: -1 }).lean();
  }

  async createImportJob(input: CreateImportJobInput) {
    const job = {
      ...input,
      id: input.id || `IMP-${Date.now().toString().slice(-6)}`,
      status: input.status || 'Queued',
      successRows: Number(input.successRows || 0),
      failedRows: Number(input.failedRows || 0),
      message: input.message || 'Import queued for validation',
    };
    if (!this.ready || !this.importJobModel) {
      this.memoryImportJobs = [job, ...this.memoryImportJobs];
      return job;
    }
    return this.importJobModel.create(job);
  }

  async updateImportJob(id: string, input: UpdateImportJobInput) {
    if (!this.ready || !this.importJobModel) {
      const index = this.memoryImportJobs.findIndex((job) => job.id === id);
      if (index < 0) throw new NotFoundException(`Import job ${id} not found`);
      this.memoryImportJobs[index] = { ...this.memoryImportJobs[index], ...input };
      return this.memoryImportJobs[index];
    }
    const job = await this.importJobModel.findOneAndUpdate({ id }, input, { new: true }).lean();
    if (!job) throw new NotFoundException(`Import job ${id} not found`);
    return job;
  }

  async getReportRuns(type?: string) {
    if (!this.ready || !this.reportRunModel) return type ? this.memoryReportRuns.filter((run) => run.type === type) : this.memoryReportRuns;
    const query = type ? { type } : {};
    return this.reportRunModel.find(query).sort({ createdAt: -1, id: -1 }).lean();
  }

  async createReportRun(input: CreateReportRunInput) {
    const run = {
      ...input,
      id: input.id || `REP-${Date.now().toString().slice(-6)}`,
      status: input.status || 'Queued',
      message: input.message || 'Report queued for generation',
      totalAmount: Number(input.totalAmount || 0),
      rows: Number(input.rows || 0),
    };
    if (!this.ready || !this.reportRunModel) {
      this.memoryReportRuns = [run, ...this.memoryReportRuns];
      return run;
    }
    return this.reportRunModel.create(run);
  }

  async updateReportRun(id: string, input: UpdateReportRunInput) {
    if (!this.ready || !this.reportRunModel) {
      const index = this.memoryReportRuns.findIndex((run) => run.id === id);
      if (index < 0) throw new NotFoundException(`Report run ${id} not found`);
      this.memoryReportRuns[index] = { ...this.memoryReportRuns[index], ...input };
      return this.memoryReportRuns[index];
    }
    const run = await this.reportRunModel.findOneAndUpdate({ id }, input, { new: true }).lean();
    if (!run) throw new NotFoundException(`Report run ${id} not found`);
    return run;
  }

  async getReturnCases(type?: string) {
    if (!this.ready || !this.returnCaseModel) return type ? this.memoryReturnCases.filter((item) => item.type === type) : this.memoryReturnCases;
    const query = type ? { type } : {};
    return this.returnCaseModel.find(query).sort({ createdAt: -1, id: -1 }).lean();
  }

  async createReturnCase(input: CreateReturnCaseInput) {
    const item = {
      ...input,
      id: input.id || `${input.type.toUpperCase().startsWith('STO') ? 'STO' : input.type.toUpperCase().startsWith('RTV') ? 'RTV' : 'RTN'}-${Date.now().toString().slice(-6)}`,
      status: input.status || 'Return Initiated',
      quantity: Number(input.quantity || 0),
      refundAmount: Number(input.refundAmount || 0),
    };
    if (!this.ready || !this.returnCaseModel) {
      this.memoryReturnCases = [item, ...this.memoryReturnCases];
      return item;
    }
    return this.returnCaseModel.create(item);
  }

  async updateReturnCase(id: string, input: UpdateReturnCaseInput) {
    if (!this.ready || !this.returnCaseModel) {
      const index = this.memoryReturnCases.findIndex((item) => item.id === id);
      if (index < 0) throw new NotFoundException(`Return case ${id} not found`);
      this.memoryReturnCases[index] = { ...this.memoryReturnCases[index], ...input };
      return this.memoryReturnCases[index];
    }
    const item = await this.returnCaseModel.findOneAndUpdate({ id }, input, { new: true }).lean();
    if (!item) throw new NotFoundException(`Return case ${id} not found`);
    return item;
  }

  async getMasterData(type?: string) {
    if (!this.ready || !this.masterDataModel) return type ? this.memoryMasterData.filter((item) => item.type === type) : this.memoryMasterData;
    const query = type ? { type } : {};
    return this.masterDataModel.find(query).sort({ type: 1, code: 1 }).lean();
  }

  async createMasterData(input: CreateMasterDataInput) {
    const prefix = input.type.toUpperCase().includes('CUSTOMER') ? 'CUS' : input.type.toUpperCase().includes('TAX') ? 'TAX' : input.type.toUpperCase().includes('TRANSPORTER') ? 'TRN' : 'MST';
    const item = {
      ...input,
      id: input.id || `${prefix}-${Date.now().toString().slice(-6)}`,
      status: input.status || 'Active',
      balance: Number(input.balance || 0),
    };
    if (!this.ready || !this.masterDataModel) {
      this.memoryMasterData = [item, ...this.memoryMasterData];
      return item;
    }
    return this.masterDataModel.create(item);
  }

  async updateMasterData(id: string, input: UpdateMasterDataInput) {
    if (!this.ready || !this.masterDataModel) {
      const index = this.memoryMasterData.findIndex((item) => item.id === id);
      if (index < 0) throw new NotFoundException(`Master data ${id} not found`);
      this.memoryMasterData[index] = { ...this.memoryMasterData[index], ...input };
      return this.memoryMasterData[index];
    }
    const item = await this.masterDataModel.findOneAndUpdate({ id }, input, { new: true }).lean();
    if (!item) throw new NotFoundException(`Master data ${id} not found`);
    return item;
  }

  async getProcurementDocs(type?: string) {
    if (!this.ready || !this.procurementDocModel) return type ? this.memoryProcurementDocs.filter((item) => item.type === type) : this.memoryProcurementDocs;
    const query = type ? { type } : {};
    return this.procurementDocModel.find(query).sort({ expectedDate: 1, documentNo: 1 }).lean();
  }

  async createProcurementDoc(input: CreateProcurementDocInput) {
    const prefix = input.type.toUpperCase().includes('ASN') ? 'ASN' : input.type.toUpperCase().includes('INBOUND') ? 'INB' : 'PO';
    const item = {
      ...input,
      id: input.id || `${prefix}-${Date.now().toString().slice(-6)}`,
      status: input.status || (prefix === 'ASN' ? 'ASN Created' : 'Open'),
      value: Number(input.value || 0),
      items: Number(input.items || 0),
      asnNo: input.asnNo || '',
      receivedQty: Number(input.receivedQty || 0),
    };
    if (!this.ready || !this.procurementDocModel) {
      this.memoryProcurementDocs = [item, ...this.memoryProcurementDocs];
      return item;
    }
    return this.procurementDocModel.create(item);
  }

  async updateProcurementDoc(id: string, input: UpdateProcurementDocInput) {
    if (!this.ready || !this.procurementDocModel) {
      const index = this.memoryProcurementDocs.findIndex((item) => item.id === id);
      if (index < 0) throw new NotFoundException(`Procurement document ${id} not found`);
      this.memoryProcurementDocs[index] = { ...this.memoryProcurementDocs[index], ...input };
      return this.memoryProcurementDocs[index];
    }
    const item = await this.procurementDocModel.findOneAndUpdate({ id }, input, { new: true }).lean();
    if (!item) throw new NotFoundException(`Procurement document ${id} not found`);
    return item;
  }

  async getAdminRecords(type?: string) {
    if (!this.ready || !this.adminRecordModel) return type ? this.memoryAdminRecords.filter((item) => item.type === type) : this.memoryAdminRecords;
    const query = type ? { type } : {};
    return this.adminRecordModel.find(query).sort({ createdAt: -1, id: -1 }).lean();
  }

  async createAdminRecord(input: CreateAdminRecordInput) {
    const prefix = input.type.toUpperCase().includes('USER') ? 'USR' : input.type.toUpperCase().includes('AUDIT') ? 'AUD' : input.type.toUpperCase().includes('API') ? 'API' : 'LOG';
    const item = {
      ...input,
      id: input.id || `${prefix}-${Date.now().toString().slice(-6)}`,
      status: input.status || 'Active',
      severity: input.severity || 'Info',
    };
    if (!this.ready || !this.adminRecordModel) {
      this.memoryAdminRecords = [item, ...this.memoryAdminRecords];
      return item;
    }
    return this.adminRecordModel.create(item);
  }

  async updateAdminRecord(id: string, input: UpdateAdminRecordInput) {
    if (!this.ready || !this.adminRecordModel) {
      const index = this.memoryAdminRecords.findIndex((item) => item.id === id);
      if (index < 0) throw new NotFoundException(`Admin record ${id} not found`);
      this.memoryAdminRecords[index] = { ...this.memoryAdminRecords[index], ...input };
      return this.memoryAdminRecords[index];
    }
    const item = await this.adminRecordModel.findOneAndUpdate({ id }, input, { new: true }).lean();
    if (!item) throw new NotFoundException(`Admin record ${id} not found`);
    return item;
  }

  async getLogisticsDocs(type?: string) {
    if (!this.ready || !this.logisticsDocModel) return type ? this.memoryLogisticsDocs.filter((item) => item.type === type) : this.memoryLogisticsDocs;
    const query = type ? { type } : {};
    return this.logisticsDocModel.find(query).sort({ createdAt: -1, shipmentNo: 1 }).lean();
  }

  async createLogisticsDoc(input: CreateLogisticsDocInput) {
    const prefix = input.type.toUpperCase().includes('PIN') ? 'PIN' : input.type.toUpperCase().includes('TRANSPORTER') ? 'TRP' : input.type.toUpperCase().includes('HANDOVER') ? 'HAND' : input.type.toUpperCase().includes('SHIPPING') ? 'SHIP' : 'AWB';
    const item = {
      ...input,
      id: input.id || `${prefix}-${Date.now().toString().slice(-6)}`,
      status: input.status || 'Ready to Ship',
      packages: Number(input.packages || 0),
      weight: Number(input.weight || 0),
    };
    if (!this.ready || !this.logisticsDocModel) {
      this.memoryLogisticsDocs = [item, ...this.memoryLogisticsDocs];
      return item;
    }
    return this.logisticsDocModel.create(item);
  }

  async updateLogisticsDoc(id: string, input: UpdateLogisticsDocInput) {
    if (!this.ready || !this.logisticsDocModel) {
      const index = this.memoryLogisticsDocs.findIndex((item) => item.id === id);
      if (index < 0) throw new NotFoundException(`Logistics document ${id} not found`);
      this.memoryLogisticsDocs[index] = { ...this.memoryLogisticsDocs[index], ...input };
      return this.memoryLogisticsDocs[index];
    }
    const item = await this.logisticsDocModel.findOneAndUpdate({ id }, input, { new: true }).lean();
    if (!item) throw new NotFoundException(`Logistics document ${id} not found`);
    return item;
  }

  async getInventoryTasks(type?: string) {
    if (!this.ready || !this.inventoryTaskModel) return type ? this.memoryInventoryTasks.filter((item) => item.type === type) : this.memoryInventoryTasks;
    const query = type ? { type } : {};
    return this.inventoryTaskModel.find(query).sort({ createdAt: -1, id: -1 }).lean();
  }

  async createInventoryTask(input: CreateInventoryTaskInput) {
    const prefix = input.type.toUpperCase().includes('COUNT') ? 'CNT' : input.type.toUpperCase().includes('HOLD') ? 'HLD' : input.type.toUpperCase().includes('RESERVATION') ? 'RES' : input.type.toUpperCase().includes('TRANSACTION') ? 'TXN' : 'MOV';
    const item = {
      ...input,
      id: input.id || `${prefix}-${Date.now().toString().slice(-6)}`,
      status: input.status || 'Open',
      quantity: Number(input.quantity || 0),
    };
    if (!this.ready || !this.inventoryTaskModel) {
      this.memoryInventoryTasks = [item, ...this.memoryInventoryTasks];
      return item;
    }
    return this.inventoryTaskModel.create(item);
  }

  async updateInventoryTask(id: string, input: UpdateInventoryTaskInput) {
    if (!this.ready || !this.inventoryTaskModel) {
      const index = this.memoryInventoryTasks.findIndex((item) => item.id === id);
      if (index < 0) throw new NotFoundException(`Inventory task ${id} not found`);
      this.memoryInventoryTasks[index] = { ...this.memoryInventoryTasks[index], ...input };
      return this.memoryInventoryTasks[index];
    }
    const item = await this.inventoryTaskModel.findOneAndUpdate({ id }, input, { new: true }).lean();
    if (!item) throw new NotFoundException(`Inventory task ${id} not found`);
    return item;
  }

  private async seed() {
    if (!this.orderModel || !this.inventoryModel || !this.operationModel || !this.importJobModel || !this.reportRunModel || !this.returnCaseModel || !this.masterDataModel || !this.procurementDocModel || !this.adminRecordModel || !this.logisticsDocModel || !this.inventoryTaskModel) return;
    await Promise.all([this.orderModel.syncIndexes(), this.inventoryModel.syncIndexes(), this.operationModel.syncIndexes(), this.importJobModel.syncIndexes(), this.reportRunModel.syncIndexes(), this.returnCaseModel.syncIndexes(), this.masterDataModel.syncIndexes(), this.procurementDocModel.syncIndexes(), this.adminRecordModel.syncIndexes(), this.logisticsDocModel.syncIndexes(), this.inventoryTaskModel.syncIndexes()]);
    await Promise.all(orders.map((order) => this.orderModel!.updateOne({ id: order.id }, { $setOnInsert: order }, { upsert: true })));
    await Promise.all(inventory.map((item) => this.inventoryModel!.updateOne({ sku: item.sku }, { $setOnInsert: item }, { upsert: true })));
    await Promise.all(operationRecords.map((record) => this.operationModel!.updateOne({ id: record.id }, { $setOnInsert: record }, { upsert: true })));
    await Promise.all(importJobs.map((job) => this.importJobModel!.updateOne({ id: job.id }, { $setOnInsert: job }, { upsert: true })));
    await Promise.all(reportRuns.map((run) => this.reportRunModel!.updateOne({ id: run.id }, { $setOnInsert: run }, { upsert: true })));
    await Promise.all(returnCases.map((item) => this.returnCaseModel!.updateOne({ id: item.id }, { $setOnInsert: item }, { upsert: true })));
    await Promise.all(masterData.map((item) => this.masterDataModel!.updateOne({ id: item.id }, { $setOnInsert: item }, { upsert: true })));
    await Promise.all(procurementDocs.map((item) => this.procurementDocModel!.updateOne({ id: item.id }, { $setOnInsert: item }, { upsert: true })));
    await Promise.all(adminRecords.map((item) => this.adminRecordModel!.updateOne({ id: item.id }, { $setOnInsert: item }, { upsert: true })));
    await Promise.all(logisticsDocs.map((item) => this.logisticsDocModel!.updateOne({ id: item.id }, { $setOnInsert: item }, { upsert: true })));
    await Promise.all(inventoryTasks.map((item) => this.inventoryTaskModel!.updateOne({ id: item.id }, { $setOnInsert: item }, { upsert: true })));
  }
}
