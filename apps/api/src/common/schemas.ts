import { Schema } from 'mongoose';
import type { ImportJob, InventoryItem, OperationRecord, Order, ReportRun } from './database.service';

export const orderSchema = new Schema<Order>(
  {
    id: { type: String, unique: true, index: true, required: true },
    channel: { type: String, required: true, index: true },
    customer: { type: String, required: true },
    status: { type: String, required: true, index: true },
    items: { type: Number, required: true },
    value: { type: Number, required: true },
    city: { type: String, required: true },
    sla: { type: String, required: true },
  },
  { timestamps: true },
);

export const inventorySchema = new Schema<InventoryItem>(
  {
    sku: { type: String, unique: true, index: true, required: true },
    name: { type: String, required: true },
    location: { type: String, required: true, index: true },
    available: { type: Number, required: true },
    allocated: { type: Number, required: true },
    reorder: { type: Number, required: true },
  },
  { timestamps: true },
);

export const operationSchema = new Schema<OperationRecord>(
  {
    id: { type: String, unique: true, index: true, required: true },
    module: { type: String, required: true, index: true },
    type: { type: String, required: true, index: true },
    name: { type: String, required: true },
    status: { type: String, required: true, index: true },
    location: { type: String, required: true },
    owner: { type: String, required: true },
    amount: { type: Number, default: 0 },
    quantity: { type: Number, default: 0 },
  },
  { timestamps: true },
);

operationSchema.index({ module: 1, type: 1 });

export const importJobSchema = new Schema<ImportJob>(
  {
    id: { type: String, unique: true, index: true, required: true },
    type: { type: String, required: true, index: true },
    fileName: { type: String, required: true },
    status: { type: String, required: true, index: true },
    rows: { type: Number, required: true },
    successRows: { type: Number, required: true },
    failedRows: { type: Number, required: true },
    owner: { type: String, required: true },
    message: { type: String, default: '' },
  },
  { timestamps: true },
);

export const reportRunSchema = new Schema<ReportRun>(
  {
    id: { type: String, unique: true, index: true, required: true },
    type: { type: String, required: true, index: true },
    status: { type: String, required: true, index: true },
    rows: { type: Number, required: true },
    owner: { type: String, required: true },
    format: { type: String, required: true },
    totalAmount: { type: Number, default: 0 },
    message: { type: String, default: '' },
  },
  { timestamps: true },
);
