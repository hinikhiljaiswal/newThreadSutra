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
