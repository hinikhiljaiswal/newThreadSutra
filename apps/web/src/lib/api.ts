const API_URL = process.env.NEXT_PUBLIC_API_URL ?? (process.env.NEXT_PUBLIC_API_HOST ? `https://${process.env.NEXT_PUBLIC_API_HOST}` : '');

export type Metric = { label: string; value: number; tone: string; currency?: boolean };
export type Order = { id: string; channel: string; customer: string; status: string; items: number; value: number; city: string; sla: string };
export type InventoryItem = { sku: string; name: string; location: string; available: number; allocated: number; reorder: number };
export type OperationRecord = { id: string; module: string; type: string; name: string; status: string; location: string; owner: string; amount: number; quantity: number };

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = typeof window === 'undefined' ? '' : window.localStorage.getItem('eretail-token');
  const response = await fetch(`${API_URL}/api${path}`, {
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
  login: (body: { organization: string; username: string; password: string }) =>
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
};
