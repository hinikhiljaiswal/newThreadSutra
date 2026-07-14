export const demoUser = {
  organization: 'ABCD',
  username: 'nnn',
  loginIds: ['ABCDnnn', 'ABCDNNN'],
  displayName: 'ABCD Demo User',
  role: 'Warehouse Manager',
  passwords: ['ABCD@1122', 'ABCD@1122 '],
  password: 'ABCD@1122',
};

export const orders = [
  { id: 'SO-10291', channel: 'Marketplace', customer: 'Aarav Textiles', status: 'Packed', items: 8, value: 18420, city: 'Mumbai', sla: 'Today 17:30' },
  { id: 'SO-10292', channel: 'B2B', customer: 'Northstar Retail', status: 'Ready to Ship', items: 26, value: 74200, city: 'Delhi', sla: 'Tomorrow 11:00' },
  { id: 'SO-10293', channel: 'Webstore', customer: 'Mira Craft', status: 'Allocated', items: 3, value: 5210, city: 'Pune', sla: 'Today 19:00' },
  { id: 'SO-10294', channel: 'Marketplace', customer: 'Urban Weaves', status: 'Pending Pick', items: 12, value: 29680, city: 'Bengaluru', sla: 'Today 21:00' },
  { id: 'SO-10295', channel: 'Retail', customer: 'Kolkata Central', status: 'Exception', items: 5, value: 13990, city: 'Kolkata', sla: 'Overdue' },
];

export const inventory = [
  { sku: 'TS-KURTA-IND-001', name: 'Indigo Block Kurta', location: 'A-01-04', available: 124, allocated: 37, reorder: 40 },
  { sku: 'TS-DUP-CHN-014', name: 'Chanderi Dupatta', location: 'B-02-11', available: 68, allocated: 18, reorder: 35 },
  { sku: 'TS-SAREE-BAN-022', name: 'Banarasi Saree', location: 'C-03-08', available: 21, allocated: 9, reorder: 25 },
  { sku: 'TS-SHIRT-LIN-033', name: 'Linen Shirt', location: 'A-04-13', available: 203, allocated: 54, reorder: 70 },
  { sku: 'TS-JKT-IKT-009', name: 'Ikat Jacket', location: 'D-01-02', available: 16, allocated: 11, reorder: 20 },
];

export const operationRecords = [
  { id: 'VEN-1001', module: 'master', type: 'Vendor Master', name: 'ThreadSutra Vendor 1', status: 'Active', location: 'JX Karawaci', owner: 'Buying Team', amount: 0, quantity: 0 },
  { id: 'CUS-2201', module: 'master', type: 'Customer Master', name: 'Aarav Textiles', status: 'Active', location: 'Mumbai', owner: 'Sales Team', amount: 18420, quantity: 8 },
  { id: 'TAX-018', module: 'master', type: 'Tax Code', name: 'GST Apparel 5%', status: 'Active', location: 'India', owner: 'Finance', amount: 5, quantity: 0 },
  { id: 'PO-50018', module: 'procurement', type: 'PO Create/Edit', name: 'ThreadSutra Vendor 1', status: 'Open', location: 'JX Karawaci', owner: 'Buyer A', amount: 48200, quantity: 120 },
  { id: 'ASN-70012', module: 'procurement', type: 'Manage ASN', name: 'ASN Against PO-50018', status: 'ASN Created', location: 'JX Karawaci', owner: 'Inbound Team', amount: 48200, quantity: 120 },
  { id: 'PICK-3011', module: 'wms', type: 'Manage Picklist', name: 'Picklist for Marketplace orders', status: 'Pending Pick', location: 'A Zone', owner: 'Picker 01', amount: 0, quantity: 42 },
  { id: 'BIN-A-01-04', module: 'wms', type: 'Bin Enquiry', name: 'A-01-04 Indigo Block Kurta', status: 'Active', location: 'A-01-04', owner: 'Warehouse', amount: 0, quantity: 124 },
  { id: 'AWB-98017', module: 'wms', type: 'Manage AWB', name: 'Carrier handover batch', status: 'Ready to Ship', location: 'Shipping Dock', owner: 'Logistics', amount: 0, quantity: 6 },
  { id: 'RTN-10295', module: 'returns', type: 'Return Enquiry', name: 'Kolkata Central return', status: 'QC Pending', location: 'Returns Dock', owner: 'Returns Team', amount: 13990, quantity: 5 },
  { id: 'STO-4311', module: 'returns', type: 'STO Order Enquiry', name: 'Main Warehouse to Marketplace Hub', status: 'Open', location: 'Main Warehouse', owner: 'Transfer Desk', amount: 0, quantity: 32 },
  { id: 'USR-nnn', module: 'admin', type: 'User Enquiry', name: 'ABCD Demo User', status: 'Active', location: 'JX Karawaci', owner: 'Admin', amount: 0, quantity: 0 },
  { id: 'LOG-9910', module: 'admin', type: 'API Dashboard Logs', name: 'Order sync completed', status: 'Success', location: 'API', owner: 'System', amount: 0, quantity: 15 },
  { id: 'RPT-100', module: 'reports', type: 'Sales Register', name: 'Sales Register - Last 7 days', status: 'Generated', location: 'JX Karawaci', owner: 'Finance', amount: 141500, quantity: 15 },
  { id: 'RPT-220', module: 'reports', type: 'Manifest Report', name: 'Manifest Report - Today', status: 'Generated', location: 'Shipping Dock', owner: 'Outbound', amount: 0, quantity: 6 },
];

export const importJobs = [
  { id: 'IMP-9001', type: 'Order Import', fileName: 'marketplace-orders.csv', status: 'Completed', rows: 42, successRows: 40, failedRows: 2, owner: 'Operations', message: '2 rows failed SKU validation' },
  { id: 'IMP-9002', type: 'Common Import', fileName: 'tax-zone-master.csv', status: 'Processing', rows: 18, successRows: 12, failedRows: 0, owner: 'Admin', message: 'Validation completed, posting rows' },
  { id: 'IMP-9003', type: 'SKU Import', fileName: 'new-season-skus.csv', status: 'Queued', rows: 64, successRows: 0, failedRows: 0, owner: 'Merchandising', message: 'Awaiting processing slot' },
  { id: 'IMP-9004', type: 'Bulk Upload MP Inventory Log', fileName: 'marketplace-inventory.csv', status: 'Failed', rows: 31, successRows: 25, failedRows: 6, owner: 'Warehouse', message: '6 bins not found' },
];

export const reportRuns = [
  { id: 'REP-7001', type: 'Sales Register', status: 'Generated', rows: 15, owner: 'Finance', format: 'CSV', totalAmount: 196013, message: 'Sales register generated for last 7 days' },
  { id: 'REP-7002', type: 'Manifest Report', status: 'Generated', rows: 6, owner: 'Outbound', format: 'CSV', totalAmount: 0, message: 'Carrier manifest generated for today' },
  { id: 'REP-7003', type: 'Fin Inv Report - By SKU', status: 'Queued', rows: 5, owner: 'Inventory', format: 'XLS', totalAmount: 0, message: 'Awaiting inventory snapshot' },
  { id: 'REP-7004', type: 'Pick Pack Report', status: 'Processing', rows: 9, owner: 'Warehouse', format: 'CSV', totalAmount: 0, message: 'Compiling pick/pack productivity' },
];

export const returnCases = [
  { id: 'RTN-10291', type: 'Return Enquiry', orderId: 'SO-10291', customer: 'Aarav Textiles', city: 'Mumbai', status: 'Return Initiated', reason: 'Size mismatch', disposition: 'QC Pending', quantity: 2, refundAmount: 4620, owner: 'Returns Team', dock: 'Returns Dock' },
  { id: 'RTN-10295', type: 'Return Enquiry', orderId: 'SO-10295', customer: 'Kolkata Central', city: 'Kolkata', status: 'QC Pending', reason: 'Damaged in transit', disposition: 'Replace', quantity: 5, refundAmount: 13990, owner: 'Returns Team', dock: 'Returns Dock' },
  { id: 'RTV-5007', type: 'RTV Enquiry', orderId: 'PO-50018', customer: 'ThreadSutra Vendor 1', city: 'JX Karawaci', status: 'Vendor Review', reason: 'Excess receipt', disposition: 'Return to Vendor', quantity: 12, refundAmount: 0, owner: 'Inbound QC', dock: 'Inbound Dock' },
  { id: 'STO-4311', type: 'STO Order Enquiry', orderId: 'STO-4311', customer: 'Marketplace Hub', city: 'Delhi', status: 'Open', reason: 'Hub replenishment', disposition: 'Transfer', quantity: 32, refundAmount: 0, owner: 'Transfer Desk', dock: 'Main Warehouse' },
];

export const masterData = [
  { id: 'VEN-1001', type: 'Vendor Master', code: 'VEN-1001', name: 'ThreadSutra Vendor 1', category: 'Apparel Supplier', status: 'Active', location: 'JX Karawaci', contact: 'vendor1@threadsutra.test', owner: 'Buying Team', balance: 48200 },
  { id: 'VEN-1002', type: 'Vendor Master', code: 'VEN-1002', name: 'Indigo Loom Works', category: 'Fabric Supplier', status: 'On Hold', location: 'Jaipur', contact: 'accounts@indigoloom.test', owner: 'Buying Team', balance: 12600 },
  { id: 'CUS-2201', type: 'Customer Master', code: 'CUS-2201', name: 'Aarav Textiles', category: 'B2B', status: 'Active', location: 'Mumbai', contact: 'orders@aarav.test', owner: 'Sales Team', balance: 18420 },
  { id: 'CUS-2202', type: 'Customer Master', code: 'CUS-2202', name: 'Northstar Retail', category: 'Retail Chain', status: 'Active', location: 'Delhi', contact: 'ops@northstar.test', owner: 'Sales Team', balance: 74200 },
  { id: 'TAX-018', type: 'Tax Code', code: 'GST-APP-5', name: 'GST Apparel 5%', category: 'GST', status: 'Active', location: 'India', contact: 'finance@threadsutra.test', owner: 'Finance', balance: 5 },
  { id: 'TRN-014', type: 'Transporter Master', code: 'TRN-014', name: 'BlueDart Express', category: 'Courier', status: 'Active', location: 'India', contact: 'pickup@bluedart.test', owner: 'Logistics', balance: 0 },
];

export const procurementDocs = [
  { id: 'PO-50018', type: 'PO Create/Edit', documentNo: 'PO-50018', vendor: 'ThreadSutra Vendor 1', location: 'JX Karawaci', status: 'Open', items: 120, value: 48200, expectedDate: '2026-07-18', owner: 'Buyer A', asnNo: 'ASN-70012', receivedQty: 0 },
  { id: 'PO-50019', type: 'PO Enquiry', documentNo: 'PO-50019', vendor: 'Indigo Loom Works', location: 'Jaipur', status: 'Approved', items: 80, value: 33600, expectedDate: '2026-07-21', owner: 'Buyer B', asnNo: '', receivedQty: 0 },
  { id: 'ASN-70012', type: 'Manage ASN', documentNo: 'ASN-70012', vendor: 'ThreadSutra Vendor 1', location: 'JX Karawaci', status: 'ASN Created', items: 120, value: 48200, expectedDate: '2026-07-18', owner: 'Inbound Team', asnNo: 'ASN-70012', receivedQty: 48 },
  { id: 'INB-8107', type: 'Inbound Enquiry', documentNo: 'INB-8107', vendor: 'ThreadSutra Vendor 1', location: 'Inbound Dock', status: 'QC Pending', items: 48, value: 19280, expectedDate: '2026-07-14', owner: 'Inbound QC', asnNo: 'ASN-70012', receivedQty: 48 },
];
