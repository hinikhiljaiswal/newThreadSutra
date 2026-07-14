const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_HOST ? `https://${process.env.NEXT_PUBLIC_API_HOST}` : '');

function apiBaseUrl() {
  if (typeof window === 'undefined') return configuredApiUrl;
  if (!configuredApiUrl) return '';

  try {
    const url = new URL(configuredApiUrl);
    const appHost = window.location.hostname;
    const pointsAtLocalhost = ['localhost', '127.0.0.1', '0.0.0.0'].includes(url.hostname);
    const appIsLocalhost = ['localhost', '127.0.0.1', '0.0.0.0'].includes(appHost);
    return pointsAtLocalhost && !appIsLocalhost ? '' : configuredApiUrl;
  } catch {
    return configuredApiUrl;
  }
}

export type Metric = { label: string; value: number; tone: string; currency?: boolean };
export type Order = { id: string; channel: string; customer: string; status: string; items: number; value: number; city: string; sla: string };
export type InventoryItem = { sku: string; name: string; location: string; available: number; allocated: number; reorder: number };
export type OperationRecord = { id: string; module: string; type: string; name: string; status: string; location: string; owner: string; amount: number; quantity: number };
export type ImportJob = { id: string; type: string; fileName: string; status: string; rows: number; successRows: number; failedRows: number; owner: string; message: string };
export type ReportRun = { id: string; type: string; status: string; rows: number; owner: string; format: string; totalAmount: number; message: string };
export type ReturnCase = { id: string; type: string; orderId: string; customer: string; city: string; status: string; reason: string; disposition: string; quantity: number; refundAmount: number; owner: string; dock: string };
export type MasterDataRecord = { id: string; type: string; code: string; name: string; category: string; status: string; location: string; contact: string; owner: string; balance: number };
export type ProcurementDoc = { id: string; type: string; documentNo: string; vendor: string; location: string; status: string; items: number; value: number; expectedDate: string; owner: string; asnNo: string; receivedQty: number };
export type AdminRecord = { id: string; type: string; code: string; name: string; role: string; status: string; location: string; channel: string; lastEvent: string; severity: string; owner: string };
export type LogisticsDoc = { id: string; type: string; shipmentNo: string; orderId: string; carrier: string; service: string; status: string; origin: string; destination: string; packages: number; weight: number; owner: string };
export type InventoryTask = { id: string; type: string; sku: string; name: string; fromLocation: string; toLocation: string; status: string; quantity: number; reason: string; owner: string };

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = typeof window === 'undefined' ? '' : window.localStorage.getItem('eretail-token');
  const response = await fetch(`${apiBaseUrl()}/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json() as Promise<T>;
}

export const api = {
  login: (body: { loginId?: string; organization?: string; username?: string; password: string }) =>
    request<{ token: string; user: { displayName: string; role: string; organization: string; username: string } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  dashboard: () => request<{ metrics: Metric[]; queues: { label: string; value: number }[] }>('/dashboard'),
  orders: () => request<Order[]>('/orders'),
  createOrder: (body: Omit<Order, 'id'>) =>
    request<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  updateOrder: (id: string, body: Partial<Pick<Order, 'status' | 'sla'>>) =>
    request<Order>(`/orders/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  bulkUpdateOrders: (body: { ids: string[]; status: string }) =>
    request<{ updated: number }>('/orders/bulk/status', {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  deleteOrder: (id: string) => request<{ deleted: boolean }>(`/orders/${id}`, { method: 'DELETE' }),
  inventory: () => request<InventoryItem[]>('/inventory'),
  createInventory: (body: InventoryItem) =>
    request<InventoryItem>('/inventory', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  updateInventory: (sku: string, body: Partial<Pick<InventoryItem, 'location' | 'reorder'>> & { adjustment?: number }) =>
    request<InventoryItem>(`/inventory/${sku}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  operations: (params?: { module?: string; type?: string }) => {
    const query = new URLSearchParams();
    if (params?.module) query.set('module', params.module);
    if (params?.type) query.set('type', params.type);
    return request<OperationRecord[]>(`/operations${query.toString() ? `?${query}` : ''}`);
  },
  createOperation: (body: Omit<OperationRecord, 'id'>) =>
    request<OperationRecord>('/operations', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  updateOperation: (id: string, body: Partial<Omit<OperationRecord, 'id' | 'module' | 'type'>>) =>
    request<OperationRecord>(`/operations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  bulkUpdateOperations: (body: { ids: string[]; status: string }) =>
    request<{ updated: number }>('/operations/bulk/status', {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  deleteOperation: (id: string) => request<{ deleted: boolean }>(`/operations/${id}`, { method: 'DELETE' }),
  imports: (params?: { type?: string }) => {
    const query = new URLSearchParams();
    if (params?.type) query.set('type', params.type);
    return request<ImportJob[]>(`/imports${query.toString() ? `?${query}` : ''}`);
  },
  createImport: (body: { type: string; fileName: string; rows: number; owner: string; message?: string }) =>
    request<ImportJob>('/imports', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  updateImport: (id: string, body: Partial<Pick<ImportJob, 'status' | 'successRows' | 'failedRows' | 'message'>>) =>
    request<ImportJob>(`/imports/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  reports: (params?: { type?: string }) => {
    const query = new URLSearchParams();
    if (params?.type) query.set('type', params.type);
    return request<ReportRun[]>(`/reports${query.toString() ? `?${query}` : ''}`);
  },
  createReport: (body: { type: string; rows: number; owner: string; format: string; totalAmount?: number; message?: string }) =>
    request<ReportRun>('/reports', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  updateReport: (id: string, body: Partial<Pick<ReportRun, 'status' | 'rows' | 'format' | 'totalAmount' | 'message'>>) =>
    request<ReportRun>(`/reports/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  returns: (params?: { type?: string }) => {
    const query = new URLSearchParams();
    if (params?.type) query.set('type', params.type);
    return request<ReturnCase[]>(`/returns${query.toString() ? `?${query}` : ''}`);
  },
  createReturn: (body: Omit<ReturnCase, 'id'>) =>
    request<ReturnCase>('/returns', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  updateReturn: (id: string, body: Partial<Omit<ReturnCase, 'id' | 'type' | 'orderId'>>) =>
    request<ReturnCase>(`/returns/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  masterData: (params?: { type?: string }) => {
    const query = new URLSearchParams();
    if (params?.type) query.set('type', params.type);
    return request<MasterDataRecord[]>(`/master-data${query.toString() ? `?${query}` : ''}`);
  },
  createMasterData: (body: Omit<MasterDataRecord, 'id'>) =>
    request<MasterDataRecord>('/master-data', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  updateMasterData: (id: string, body: Partial<Omit<MasterDataRecord, 'id' | 'type' | 'code'>>) =>
    request<MasterDataRecord>(`/master-data/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  procurement: (params?: { type?: string }) => {
    const query = new URLSearchParams();
    if (params?.type) query.set('type', params.type);
    return request<ProcurementDoc[]>(`/procurement${query.toString() ? `?${query}` : ''}`);
  },
  createProcurement: (body: Omit<ProcurementDoc, 'id'>) =>
    request<ProcurementDoc>('/procurement', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  updateProcurement: (id: string, body: Partial<Omit<ProcurementDoc, 'id' | 'type' | 'documentNo'>>) =>
    request<ProcurementDoc>(`/procurement/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  adminRecords: (params?: { type?: string }) => {
    const query = new URLSearchParams();
    if (params?.type) query.set('type', params.type);
    return request<AdminRecord[]>(`/admin-records${query.toString() ? `?${query}` : ''}`);
  },
  createAdminRecord: (body: Omit<AdminRecord, 'id'>) =>
    request<AdminRecord>('/admin-records', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  updateAdminRecord: (id: string, body: Partial<Omit<AdminRecord, 'id' | 'type' | 'code'>>) =>
    request<AdminRecord>(`/admin-records/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  logistics: (params?: { type?: string }) => {
    const query = new URLSearchParams();
    if (params?.type) query.set('type', params.type);
    return request<LogisticsDoc[]>(`/logistics${query.toString() ? `?${query}` : ''}`);
  },
  createLogistics: (body: Omit<LogisticsDoc, 'id'>) =>
    request<LogisticsDoc>('/logistics', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  updateLogistics: (id: string, body: Partial<Omit<LogisticsDoc, 'id' | 'type' | 'shipmentNo'>>) =>
    request<LogisticsDoc>(`/logistics/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  inventoryTasks: (params?: { type?: string }) => {
    const query = new URLSearchParams();
    if (params?.type) query.set('type', params.type);
    return request<InventoryTask[]>(`/inventory-tasks${query.toString() ? `?${query}` : ''}`);
  },
  createInventoryTask: (body: Omit<InventoryTask, 'id'>) =>
    request<InventoryTask>('/inventory-tasks', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  updateInventoryTask: (id: string, body: Partial<Omit<InventoryTask, 'id' | 'type' | 'sku'>>) =>
    request<InventoryTask>(`/inventory-tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
};
