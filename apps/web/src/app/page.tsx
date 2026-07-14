'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  BarChart3,
  Bell,
  Boxes,
  CheckCircle2,
  ClipboardList,
  Home,
  Lock,
  LogOut,
  PackagePlus,
  RefreshCw,
  Save,
  Search,
  Settings,
  ShoppingCart,
  Trash2,
  Truck,
  User,
  Warehouse,
} from 'lucide-react';
import { api, ImportJob, InventoryItem, MasterDataRecord, Metric, OperationRecord, Order, ProcurementDoc, ReportRun, ReturnCase } from '@/lib/api';

type Session = { displayName: string; role: string; organization: string; username: string };
type ModuleKey = 'dashboard' | 'master' | 'procurement' | 'sales' | 'wms' | 'returns' | 'inventory' | 'warehouse' | 'shipping' | 'reports' | 'admin';

const orderStatuses = ['Pending Pick', 'Allocated', 'Packed', 'Ready to Ship', 'Shipped', 'Cancelled', 'Exception'];
const operationStatuses = ['Open', 'Active', 'Pending', 'Pending Pick', 'ASN Created', 'Ready to Ship', 'QC Pending', 'Generated', 'Success', 'Closed', 'Cancelled'];

export default function HomePage() {
  const [session, setSession] = useState<Session | null>(null);
  const [active, setActive] = useState<ModuleKey>('dashboard');
  const [workspaceMode, setWorkspaceMode] = useState<'dashboard' | 'menu' | 'screen'>('dashboard');
  const [deskTab, setDeskTab] = useState<'Sales' | 'Fulfillment' | 'Inventory' | 'Returns'>('Sales');
  const [openScreen, setOpenScreen] = useState<{ module: ModuleKey; title: string } | null>(null);
  const [openScreens, setOpenScreens] = useState<{ module: ModuleKey; title: string }[]>([]);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [queues, setQueues] = useState<{ label: string; value: number }[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [globalSearch, setGlobalSearch] = useState<{ type: string; value: string } | null>(null);
  const [drilldown, setDrilldown] = useState<string | null>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem('eretail-session');
    if (saved) setSession(JSON.parse(saved));
    const savedWorkspace = window.localStorage.getItem('eretail-workspace');
    if (savedWorkspace) {
      const workspace = JSON.parse(savedWorkspace) as {
        active?: ModuleKey;
        workspaceMode?: 'dashboard' | 'menu' | 'screen';
        deskTab?: 'Sales' | 'Fulfillment' | 'Inventory' | 'Returns';
        openScreen?: { module: ModuleKey; title: string } | null;
        openScreens?: { module: ModuleKey; title: string }[];
      };
      if (workspace.active) setActive(workspace.active);
      if (workspace.workspaceMode) setWorkspaceMode(workspace.workspaceMode);
      if (workspace.deskTab) setDeskTab(workspace.deskTab);
      if (workspace.openScreen) setOpenScreen(workspace.openScreen);
      if (workspace.openScreens) setOpenScreens(workspace.openScreens);
    }
  }, []);

  useEffect(() => {
    if (session) void refresh();
  }, [session]);

  useEffect(() => {
    if (!session) return;
    window.localStorage.setItem('eretail-workspace', JSON.stringify({ active, workspaceMode, deskTab, openScreen, openScreens }));
  }, [active, workspaceMode, deskTab, openScreen, openScreens, session]);

  async function refresh() {
    setLoading(true);
    setMessage('');
    try {
      const [dashboard, orderRows, inventoryRows] = await Promise.all([api.dashboard(), api.orders(), api.inventory()]);
      setMetrics(dashboard.metrics);
      setQueues(dashboard.queues);
      setOrders(orderRows);
      setInventory(inventoryRows);
    } catch {
      setMessage('Session expired or API unavailable. Please log in again.');
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    window.localStorage.removeItem('eretail-token');
    window.localStorage.removeItem('eretail-session');
    window.localStorage.removeItem('eretail-workspace');
    setSession(null);
  }

  function openWorkspaceScreen(screen: { module: ModuleKey; title: string }) {
    setOpenScreen(screen);
    setWorkspaceMode('screen');
    setGlobalSearch(null);
    setDrilldown(null);
    setOpenScreens((screens) => {
      if (screens.some((item) => item.module === screen.module && item.title === screen.title)) return screens;
      return [...screens, screen];
    });
  }

  function closeWorkspaceScreen(title: string) {
    const remaining = openScreens.filter((screen) => screen.title !== title);
    setOpenScreens(remaining);
    if (openScreen?.title === title) {
      const next = remaining[remaining.length - 1] ?? null;
      setOpenScreen(next);
      setWorkspaceMode(next ? 'screen' : 'dashboard');
    }
  }

  function showDashboard() {
    setOpenScreen(null);
    setWorkspaceMode('dashboard');
  }

  function selectRailModule(module: ModuleKey) {
    setActive(module);
    setOpenScreen(null);
    setGlobalSearch(null);
    setDrilldown(null);
    setWorkspaceMode(module === 'dashboard' ? 'dashboard' : 'menu');
  }

  if (!session) return <LoginScreen onLogin={setSession} />;

  return (
    <main className="vin-app-shell min-h-screen bg-[#f3f3f3] text-[#222]">
      <VineToolbar user={session} query={query} setQuery={setQuery} onSearch={(type, value) => setGlobalSearch({ type, value })} onLogout={logout} />
      <div className="flex">
        <LegacyIconRail active={active} setActive={selectRailModule} />
        <section className="min-h-[calc(100vh-52px)] min-w-0 flex-1">
          <VineDeskTabs active={deskTab} setActive={(tab) => {
            setDeskTab(tab);
            if (tab === 'Sales') setActive('sales');
            if (tab === 'Fulfillment') setActive('wms');
            if (tab === 'Inventory') setActive('inventory');
            if (tab === 'Returns') setActive('returns');
            setWorkspaceMode('dashboard');
            setOpenScreen(null);
            setGlobalSearch(null);
            setDrilldown(null);
          }} />
          <OpenScreenStrip screens={openScreens} active={openScreen} onDashboard={showDashboard} onSelect={(screen) => { setOpenScreen(screen); setWorkspaceMode('screen'); }} onClose={closeWorkspaceScreen} />
          <div className="border-b border-[#bfc2c8] bg-[#dedfe6] px-3 py-1">
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs text-[#777]">
                {workspaceMode === 'screen' && openScreen ? `${active.toUpperCase()} > ${openScreen.title}` : workspaceMode === 'menu' ? `${active.toUpperCase()} > Menu` : `Dashboard > ${deskTab}`}
              </div>
              <div className="flex items-center gap-2">
                <select className="h-7 w-52 rounded-sm border border-[#d5d5d5] bg-white px-2 text-xs text-[#555]"><option>-----All-----</option></select>
                <button onClick={refresh} className="grid h-7 w-10 place-items-center rounded-sm bg-[#ff9800] text-white" title="Refresh">
                  <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                </button>
              </div>
            </div>
            {message ? <div className="mt-1 border border-amber-200 bg-amber-50 px-3 py-1 text-xs text-amber-800">{message}</div> : null}
          </div>

          <div className="p-2">
            {workspaceMode === 'dashboard' ? (
              <>
                <VineDashboard tab={deskTab} orders={orders} inventory={inventory} onDrilldown={setDrilldown} />
                {globalSearch ? <GlobalSearchPanel search={globalSearch} orders={orders} inventory={inventory} /> : null}
                {drilldown ? <KpiDrilldown title={drilldown} orders={orders} inventory={inventory} onClose={() => setDrilldown(null)} /> : null}
              </>
            ) : null}
            {workspaceMode === 'menu' && active !== 'dashboard' ? <LiveMenuWorkspace active={active} openTitle={openScreen?.title} onOpen={(title) => openWorkspaceScreen({ module: active, title })} /> : null}
            {workspaceMode === 'screen' && openScreen ? <OpenedScreen screen={openScreen} orders={orders} inventory={inventory} onRefresh={refresh} setMessage={setMessage} /> : null}
          </div>
          <footer className="flex h-[28px] items-center justify-between border-t border-[#d5dce1] bg-white px-4 text-xs">
            <span>Copyright © 2012&nbsp; <b className="text-[#2c9bd3]">Vinculum Solutions Pvt Ltd.</b></span>
            <span>All rights reserved. <b>Version 9.3.186</b></span>
          </footer>
        </section>
      </div>
    </main>
  );
}

function LoginScreen({ onLogin }: { onLogin: (user: Session) => void }) {
  const [loginId, setLoginId] = useState('ABCDnnn');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const normalizedLoginId = loginId.trim();
      const organization = normalizedLoginId.slice(0, 4).toUpperCase();
      const username = normalizedLoginId.slice(4);
      const response = await api.login({ loginId: normalizedLoginId, organization, username, password });
      window.localStorage.setItem('eretail-token', response.token);
      window.localStorage.setItem('eretail-session', JSON.stringify(response.user));
      onLogin(response.user);
    } catch {
      setError('Invalid Login Id or Password.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="vin-login min-h-screen bg-white text-[#333132]">
      <div className="grid min-h-[90vh] lg:grid-cols-[58.4%_41.6%]">
        <section
          className="relative hidden min-h-[765px] bg-cover bg-left-top lg:block"
          style={{ backgroundImage: "url('/vineretail/lhs-panel-vin-seller-panel-mobile-app-june-26.jpg')" }}
        />

        <section className="flex min-h-screen items-center justify-center px-8 py-8 lg:min-h-[765px]">
          <div className="w-full max-w-[435px]">
            <div className="mb-12 flex justify-center">
              <img src="/vineretail/logo.png" alt="eRetail" className="h-auto w-[210px]" />
            </div>
            <form onSubmit={submit} className="space-y-9">
              <div>
                <label className="relative flex items-end gap-4">
                  <User size={34} strokeWidth={1.4} className="mb-1 text-[#ed1c3c]" />
                  <span className="flex-1">
                    <span className="mb-0.5 block text-[11px] text-[#9aa0a6]">Login Id</span>
                    <input className="vin-login-input h-9 w-full text-base" value={loginId} onChange={(event) => setLoginId(event.target.value)} required />
                  </span>
                </label>
              </div>
              <div>
                <label className="relative flex items-end gap-4">
                  <Lock size={31} strokeWidth={1.4} className="mb-1 text-[#9aa0a6]" />
                  <span className="flex-1">
                    <span className="sr-only">Password</span>
                    <input className="vin-login-input h-10 w-full pr-20 text-lg placeholder:text-[#8f9398]" placeholder="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
                  </span>
                  <button type="button" className="absolute bottom-3 right-0 text-sm text-[#58595b] hover:text-[#ed2124]">Forgot?</button>
                </label>
              </div>
              {error ? <div className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}
              <div className="flex justify-center gap-4">
                <button className="vin-gradient h-11 w-[168px] rounded-md text-xl font-medium text-white" disabled={busy}>{busy ? 'Login' : 'Login'}</button>
                <button type="button" onClick={() => { setLoginId(''); setPassword(''); }} className="h-11 w-[172px] rounded-md bg-[#58595b] text-xl font-medium text-white">Reset</button>
              </div>
            </form>

            <div className="mt-3 text-center">
              <button className="inline-flex h-11 w-[205px] items-center justify-center gap-5 border border-[#3367d6] bg-[#4285f4] text-sm font-medium text-white shadow">
                <span className="grid h-8 w-8 place-items-center bg-white text-lg font-bold text-[#4285f4]">G</span>
                Sign in with Google
              </button>
            </div>

            <div className="mt-9 flex items-center justify-center gap-3 text-base">
              <span>Connect With Us:</span>
              <span className="grid h-[30px] w-[30px] place-items-center rounded-full bg-[#6381c1] font-bold text-white">f</span>
              <span className="grid h-[30px] w-[30px] place-items-center rounded-full bg-[#2897cf] font-bold text-white">t</span>
              <span className="grid h-[30px] w-[30px] place-items-center rounded-full bg-[#4abbec] font-bold text-white">in</span>
            </div>

            <div className="mx-auto mt-10 w-[82%] text-center">
              <p className="text-[22px] font-semibold leading-8">Click below to refer a customer for Vinculum</p>
              <button className="mt-2 h-[39px] w-48 rounded-md bg-[#0095da] text-xl font-medium text-white">Refer Now</button>
            </div>
          </div>
        </section>
      </div>
      <footer className="hidden h-[85px] border-t border-[#d0d0d0] bg-white lg:grid lg:grid-cols-[58.4%_41.6%]">
        <div className="grid grid-cols-2">
          <a className="flex items-center justify-center border-r border-[#d0d0d0] text-sm font-bold uppercase text-[#002659] underline" href="#">Latest Blogs</a>
          <a className="flex items-center justify-center border-r border-[#d0d0d0] text-sm font-bold uppercase text-[#002659] underline" href="#">Case Studies</a>
        </div>
        <div />
      </footer>
    </main>
  );
}

function VineToolbar({ user, query, setQuery, onSearch, onLogout }: { user: Session; query: string; setQuery: (query: string) => void; onSearch: (type: string, value: string) => void; onLogout: () => void }) {
  const [showUserPanel, setShowUserPanel] = useState(false);
  const [showLocation, setShowLocation] = useState(false);
  const [searchType, setSearchType] = useState('Web Order No');
  return (
    <header className="relative z-20 flex h-[52px] items-center bg-[#3d90b8] text-white">
      <div className="grid h-full w-[50px] place-items-center bg-white">
        <img src="/vineretail/logo.png" alt="eRetail" className="w-9 object-contain" />
      </div>
      <div className="flex flex-1 items-center justify-end gap-4 px-4">
        <button onClick={() => setShowLocation((show) => !show)} className="text-xs font-semibold hover:underline">JX Karawaci</button>
        <div className="flex h-[30px] w-[225px] overflow-hidden rounded-full bg-[#2c7da4] shadow-inner">
          <select value={searchType} onChange={(event) => setSearchType(event.target.value)} className="w-[105px] bg-transparent px-3 text-xs font-semibold text-white outline-none">
            {['Web Order No', 'AWB No', 'Sub Order No', 'PO No', 'LPN No', 'Reverse AWB No', 'Invoice No'].map((option) => <option key={option}>{option}</option>)}
          </select>
          <input value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') onSearch(searchType, query); }} className="min-w-0 flex-1 bg-white px-2 text-xs text-[#333] outline-none" />
          <button onClick={() => onSearch(searchType, query)} className="grid w-8 place-items-center bg-white text-[#555]"><Search size={15} /></button>
        </div>
        <span className="text-lg">*</span>
        <span className="relative text-lg">⚑<b className="absolute -right-2 -top-2 rounded bg-[#e84c3d] px-1 text-[10px] leading-3">1</b></span>
        <span className="text-lg">⛶</span>
        <span className="text-lg">⌄</span>
        <button onClick={() => setShowUserPanel((show) => !show)} className="grid h-8 w-8 place-items-center rounded-full bg-white/90 text-[#777]" title={user.displayName}>
          <User size={20} />
        </button>
      </div>
      {showUserPanel ? <UserPanel user={user} onLogout={onLogout} /> : null}
      {showLocation ? <LocationPanel /> : null}
    </header>
  );
}

function LocationPanel() {
  return (
    <div className="absolute right-[300px] top-[46px] w-[280px] border border-[#b7cbd8] bg-white text-[#333] shadow-xl">
      <div className="bg-[#3d90b8] px-4 py-2 font-bold text-white">Company / Location</div>
      <div className="p-3 text-sm">
        {['JX Karawaci', 'Marketplace Hub', 'Main Warehouse', 'Returns Dock'].map((location, index) => (
          <button key={location} className={`mb-1 flex h-8 w-full items-center justify-between border px-2 text-left ${index === 0 ? 'border-[#3c8dbc] bg-[#e8f2fb] font-bold text-[#2e6e9e]' : 'border-[#e5e5e5] hover:bg-[#f7f7f7]'}`}>
            {location}
            {index === 0 ? <span>✓</span> : null}
          </button>
        ))}
      </div>
    </div>
  );
}

function UserPanel({ user, onLogout }: { user: Session; onLogout: () => void }) {
  return (
    <div className="absolute right-3 top-[46px] w-[315px] border border-[#b7cbd8] bg-white text-[#333] shadow-xl">
      <div className="bg-[#3d90b8] px-4 py-3 text-white">
        <div className="text-base font-bold">USer Panel</div>
        <div className="mt-1 text-xs">{user.displayName}</div>
      </div>
      <div className="space-y-3 p-4 text-sm">
        <div className="font-bold">You last visited on 10/07/2026 03:11 PM</div>
        <div className="border-t border-[#e5e5e5] pt-3">
          <div className="font-bold text-[#3c8dbc]">Contact Helpdesk</div>
          <div>vineretail.helpdesk@vinculumgroup.com</div>
          <div>+91 7838 130 820</div>
        </div>
        <button onClick={onLogout} className="h-8 rounded-sm bg-[#dd4b39] px-4 text-xs font-bold text-white">Sign out</button>
      </div>
    </div>
  );
}

function OpenScreenStrip({ screens, active, onDashboard, onSelect, onClose }: { screens: { module: ModuleKey; title: string }[]; active: { module: ModuleKey; title: string } | null; onDashboard: () => void; onSelect: (screen: { module: ModuleKey; title: string }) => void; onClose: (title: string) => void }) {
  if (!screens.length) {
    return (
      <div className="flex h-[28px] items-center border-b border-[#ccd2d7] bg-[#f7f7f7] px-3 text-xs text-[#555]">
        <span>You have 1 Open Screen(s)</span>
        <button onClick={onDashboard} className="ml-2 rounded-sm border border-[#bfc4c8] bg-white px-2 py-0.5 font-bold text-[#3c8dbc]">Dashboard</button>
        <button onClick={onDashboard} className="ml-2 text-[#777]">Close</button>
      </div>
    );
  }
  return (
    <div className="flex min-h-[30px] flex-wrap items-center gap-1 border-b border-[#ccd2d7] bg-[#f7f7f7] px-3 py-1 text-xs text-[#555]">
      <span className="mr-1">You have {screens.length + 1} Open Screen(s)</span>
      <button onClick={onDashboard} className="rounded-sm border border-[#bfc4c8] bg-white px-2 py-0.5 font-bold text-[#3c8dbc]">Dashboard</button>
      {screens.map((screen) => (
        <span key={`${screen.module}-${screen.title}`} className={`inline-flex items-center border px-2 py-0.5 ${active?.title === screen.title ? 'border-[#ff9800] bg-white text-[#111]' : 'border-[#bfc4c8] bg-[#f2f2f2]'}`}>
          <button onClick={() => onSelect(screen)}>{screen.title}</button>
          <button onClick={() => onClose(screen.title)} className="ml-2 font-bold text-[#a94442]">x</button>
        </span>
      ))}
      <button onClick={() => { screens.forEach((screen) => onClose(screen.title)); onDashboard(); }} className="ml-2 text-[#777]">Close</button>
    </div>
  );
}

function LegacyIconRail({ active, setActive }: { active: ModuleKey; setActive: (active: ModuleKey) => void }) {
  const rail = [
    { key: 'dashboard' as ModuleKey, icon: BarChart3, label: 'Dashboard' },
    { key: 'master' as ModuleKey, icon: ClipboardList, label: 'Master' },
    { key: 'procurement' as ModuleKey, icon: PackagePlus, label: 'Procurement' },
    { key: 'sales' as ModuleKey, icon: ShoppingCart, label: 'Sales' },
    { key: 'wms' as ModuleKey, icon: Warehouse, label: 'WMS' },
    { key: 'inventory' as ModuleKey, icon: Boxes, label: 'Inventory' },
    { key: 'returns' as ModuleKey, icon: RefreshCw, label: 'Returns' },
    { key: 'reports' as ModuleKey, icon: BarChart3, label: 'Reports' },
    { key: 'admin' as ModuleKey, icon: Settings, label: 'Admin' },
  ];
  return (
    <aside className="min-h-[calc(100vh-52px)] w-[50px] bg-[#1d2d32] text-[#d8e3e7]">
      {rail.map((item) => (
        <button
          key={item.key}
          onClick={() => setActive(item.key)}
          title={item.label}
          className={`grid h-48px h-[48px] w-full place-items-center border-b border-black/30 ${active === item.key ? 'bg-[#2d4148] text-white' : 'hover:bg-[#243941]'}`}
        >
          <item.icon size={18} />
        </button>
      ))}
    </aside>
  );
}

function VineDeskTabs({ active, setActive }: { active: 'Sales' | 'Fulfillment' | 'Inventory' | 'Returns'; setActive: (tab: 'Sales' | 'Fulfillment' | 'Inventory' | 'Returns') => void }) {
  const tabs = [
    { label: 'Sales', icon: ShoppingCart },
    { label: 'Fulfillment', icon: Truck },
    { label: 'Inventory', icon: Boxes },
    { label: 'Returns', icon: RefreshCw },
  ] as const;
  return (
    <div className="flex h-[34px] items-end gap-1 border-b border-[#bfc2c8] bg-[#d8d9e1] px-2">
      {tabs.map((tab) => (
        <button
          key={tab.label}
          onClick={() => setActive(tab.label)}
          className={`flex h-[28px] items-center gap-1 border px-2 text-sm font-bold ${active === tab.label ? 'border-[#ff8d00] border-b-white bg-white text-[#111]' : 'border-transparent text-[#111] hover:bg-white/50'}`}
        >
          <tab.icon size={14} fill={tab.label === active ? 'currentColor' : 'none'} />
          {tab.label}
        </button>
      ))}
    </div>
  );
}

function VineDashboard({ tab, orders, inventory, onDrilldown }: { tab: 'Sales' | 'Fulfillment' | 'Inventory' | 'Returns'; orders: Order[]; inventory: InventoryItem[]; onDrilldown: (title: string) => void }) {
  const kpis = vineKpis[tab];
  return (
    <div>
      <div className="border border-dashed border-[#b8b8b8] bg-white p-3">
        <select className="mb-3 h-7 rounded border border-[#bfc4c8] bg-[#f3f3f3] px-2 text-sm font-bold tracking-[3px] text-[#888]">
          <option>Last 7 days</option>
        </select>
        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-5">
          {kpis.map((kpi) => <VineKpi key={kpi.label} {...kpi} onClick={() => onDrilldown(kpi.label)} />)}
        </div>
      </div>

      <div className="mt-2 grid gap-2 xl:grid-cols-2">
        <VineChart title={tab === 'Inventory' ? 'Inventory Value - By Date' : tab === 'Fulfillment' ? 'Picklist Count - By Date' : tab === 'Returns' ? 'Return Count - By Date' : 'Order Count - By Date'} values={[12, 1, 1, 1]} />
        <VineChart title={tab === 'Inventory' ? 'Inventory Movement - By Date' : tab === 'Fulfillment' ? 'Shipment Count - By Date' : tab === 'Returns' ? 'Return Line Count - By Date' : 'Order Line Count - By Date'} values={[12, 1, 1, 2]} />
      </div>

      <div className="mt-2 grid gap-2 xl:grid-cols-2">
        <Panel title={tab === 'Inventory' ? 'Inventory Exceptions' : tab === 'Fulfillment' ? 'Fulfillment Work Queue' : tab === 'Returns' ? 'Returns Work Queue' : `${tab} Work Queue`}>
          {tab === 'Inventory' ? <InventoryCards inventory={inventory.slice(0, 5)} /> : tab === 'Returns' ? <ReturnsModule orders={orders} /> : <OrderTable orders={orders.slice(0, 5)} compact />}
        </Panel>
        <Panel title="Quick Search Fields">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {['Web Order No', 'AWB No', 'Sub Order No', 'PO No', 'LPN No', 'Reverse AWB No', 'Invoice No'].map((field) => (
              <label key={field} className="text-xs font-semibold text-[#555]">
                {field}
                <input className="mt-1 h-8 w-full border border-[#bfc4c8] px-2 font-normal outline-none focus:border-[#3d90b8]" />
              </label>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

const vineKpis: Record<'Sales' | 'Fulfillment' | 'Inventory' | 'Returns', { label: string; value: string; color: string; chart: 'bar' | 'line' | 'pie' }[]> = {
  Sales: [
    { label: 'Total Orders', value: '15', color: '#08a95a', chart: 'line' },
    { label: 'Total Order Lines', value: '16', color: '#f39c12', chart: 'bar' },
    { label: 'Total Order Quantity', value: '98', color: '#e74c3c', chart: 'line' },
    { label: 'Distinct SKU Sold', value: '9', color: '#40c6c5', chart: 'bar' },
    { label: 'Average Lines Per Order', value: '1.07', color: '#6259a9', chart: 'pie' },
    { label: 'Total Order Amount', value: '1,96,013', color: '#d81b60', chart: 'bar' },
    { label: 'Avg. Order Amount', value: '13,067', color: '#ef0fb6', chart: 'line' },
    { label: '% COD Orders', value: '0', color: '#3c8dbc', chart: 'pie' },
    { label: 'Total Discount', value: '0', color: '#ff851b', chart: 'line' },
    { label: 'Order Qty Pending Stock', value: '18', color: '#3d9970', chart: 'line' },
    { label: 'Total Pending Order', value: '15', color: '#40c6c5', chart: 'bar' },
    { label: 'Unfulfillable Line Level Order', value: '0', color: '#605ca8', chart: 'bar' },
    { label: 'Total Unfulfillable Order', value: '1', color: '#d81b60', chart: 'bar' },
    { label: 'Total SLA Breached Order', value: '6', color: '#00a65a', chart: 'bar' },
    { label: 'Total Failed Order', value: '1,237', color: '#e74c3c', chart: 'bar' },
  ],
  Fulfillment: [
    { label: 'Total Picklist', value: '9', color: '#08a95a', chart: 'bar' },
    { label: 'Pending Picklist', value: '4', color: '#f39c12', chart: 'bar' },
    { label: 'Packed Orders', value: '8', color: '#40c6c5', chart: 'line' },
    { label: 'Ready To Ship', value: '6', color: '#6259a9', chart: 'pie' },
    { label: 'Manifested Orders', value: '3', color: '#3d9970', chart: 'line' },
    { label: 'SLA Breached Picklist', value: '2', color: '#d81b60', chart: 'bar' },
  ],
  Inventory: [
    { label: 'Total SKUs', value: '5', color: '#08a95a', chart: 'bar' },
    { label: 'Available Quantity', value: '432', color: '#40c6c5', chart: 'bar' },
    { label: 'Allocated Quantity', value: '129', color: '#f39c12', chart: 'line' },
    { label: 'Low Stock SKU', value: '2', color: '#e74c3c', chart: 'pie' },
    { label: 'Distinct Locations', value: '5', color: '#6259a9', chart: 'bar' },
  ],
  Returns: [
    { label: 'Total Returns', value: '7', color: '#08a95a', chart: 'bar' },
    { label: 'Pending Receive', value: '3', color: '#f39c12', chart: 'bar' },
    { label: 'QC Pending', value: '2', color: '#e74c3c', chart: 'line' },
    { label: 'Refund Pending', value: '1', color: '#d81b60', chart: 'pie' },
    { label: 'Closed Returns', value: '4', color: '#3c8dbc', chart: 'bar' },
  ],
};

function VineKpi({ label, value, color, chart, onClick }: { label: string; value: string; color: string; chart: 'bar' | 'line' | 'pie'; onClick: () => void }) {
  return (
    <button onClick={onClick} className="relative h-[74px] overflow-hidden rounded-sm px-2 py-2 text-left text-white" style={{ background: color }}>
      <div className="text-[15px]">{label}</div>
      <div className="mt-2 text-xl font-bold">{value}</div>
      <div className="absolute bottom-2 right-2 opacity-20">
        {chart === 'pie' ? <div className="h-12 w-12 rounded-full border-[14px] border-black border-r-transparent" /> : chart === 'line' ? <BarChart3 size={58} /> : <BarChart3 size={58} />}
      </div>
    </button>
  );
}

function VineChart({ title, values }: { title: string; values: number[] }) {
  const labels = ['2026-07-04', '2026-07-06', '2026-07-07', '2609-07-01'];
  return (
    <div className="border border-dashed border-[#b8b8b8] bg-white p-3">
      <select className="h-7 rounded border border-[#bfc4c8] bg-[#f3f3f3] px-2 text-sm font-bold tracking-[3px] text-[#888]"><option>Last 7 days</option></select>
      <div className="mt-4 text-center text-xl font-bold text-[#333]">{title}</div>
      <div className="text-center text-xs font-bold">[Click On The Bar(s) To Drilldown]</div>
      <div className="relative mx-auto mt-2 h-[255px] max-w-[580px] border border-[#999] bg-[repeating-linear-gradient(to_bottom,#fff_0,#fff_38px,#dcdcdc_39px)]">
        <div className="absolute bottom-0 left-10 right-8 flex h-[235px] items-end gap-12">
          {values.map((value, index) => (
            <div key={labels[index]} className="flex flex-1 flex-col items-center">
              <div className="w-full bg-[#4995bd]" style={{ height: `${value * 18}px` }} />
              <span className="mt-2 rotate-[25deg] text-xs font-bold">{labels[index]}</span>
            </div>
          ))}
        </div>
        <div className="absolute bottom-2 right-2 text-xs font-semibold">Powered by <span className="text-[#006699]">ZingChart</span></div>
      </div>
    </div>
  );
}

const liveMenus: Record<string, { title: string; items: string[] }[]> = {
  dashboard: [{ title: 'Dashboard', items: ['eRetail Dashboard', 'Seller Panel Dashboard'] }],
  master: [
    { title: 'Trading Partners', items: ['Vendor Master', 'Customer Master', 'Transporter Master', 'Client Master', 'Customer Group'] },
    { title: 'Tax Management', items: ['Tax Category (HSN/SAC)', 'Tax Code', 'Tax Group', 'Tax Zone', 'Tax Application'] },
    { title: 'SKU Management', items: ['SKU Master', 'SKU Import', 'SKU Barcode', 'Manage SKU Group', 'Merchandising Hierarchy', 'Vendor SKU Catalog'] },
    { title: 'Organization Management', items: ['Location Enquiry', 'Location Create/Edit'] },
    { title: 'Miscellaneous', items: ['Other Masters', 'Price Zone Master'] },
  ],
  procurement: [
    { title: 'PO', items: ['PO Create/Edit', 'Single Location From Back Orders', 'PO Enquiry', 'PO Revision', 'Manage ASN'] },
    { title: 'Vendor Promotions', items: ['Setup Category Buyers'] },
    { title: 'ARS', items: ['ARS SKU-Location Link', 'ARS Rules', 'ARS Execution Log'] },
  ],
  sales: [
    { title: 'Manage Channels', items: ['SKU Channel Listing', 'OMS Rules Master'] },
    { title: 'Order Enquiry', items: ['Order Enquiry', 'Order Create/Edit', 'Manage Kitting Order', 'Global Order Search'] },
    { title: 'Payment Recon', items: ['COD Reconciliation'] },
    { title: 'SKU Moderation', items: ['SKU Moderation'] },
  ],
  wms: [
    { title: 'Setup', items: ['Zone', 'Picker Zone Preference', 'Bin Enquiry', 'Bin Create/Edit', 'Lottable Validation', 'Receipt Validation', 'SKU Label Print', 'Manage PutAway Rule', 'Manage Allocation Strategies', 'Manage Cycle Count Wave'] },
    { title: 'Order Processing', items: ['Order Allocate/Unallocate', 'Delivery Shipping', 'Bulk Order Update', 'Manage Picklist', 'Manage Picking', 'Delivery Split', 'Shipment Handover', 'Order Acknowledgement', 'Sort To Box'] },
    { title: 'Inventory', items: ['Inventory View', 'Inventory Move History', 'Inventory Move', 'Inventory Move By Scan', 'Cycle Count', 'BIN Audit', 'Bulk update Lottables', 'Inventory Hold', 'OutBound GatePass', 'SKU Transaction History', 'Manage SKU Lot Transfer', 'Manage RePack', 'SKU Lot Transfer Create/Edit', 'Manage Inventory Reservation', 'Inventory Move By Task', 'Manage Let Down'] },
    { title: 'Logistics', items: ['Manage AWB', 'Transporter Preference', 'Manage Service Pin Code'] },
    { title: 'Inbound', items: ['Manage Inbound Gate Pass', 'Inbound Enquiry', 'Inbound Create/Edit', 'Inbound RealTime', 'Inbound QC', 'Direct Inbound', 'STO Inbound', 'Return Inbound Create/Edit'] },
    { title: 'Miscellaneous', items: ['PutAway Enquiry', 'Discrepancy Enquiry', 'Bulk Upload MP Inventory Log', 'LPN Enquiry', 'Transhipment'] },
  ],
  inventory: [
    { title: 'Inventory', items: ['Inventory View', 'Inventory Move History', 'Inventory Move', 'Inventory Move By Scan', 'Cycle Count', 'BIN Audit', 'Inventory Hold', 'SKU Transaction History', 'Manage Inventory Reservation'] },
  ],
  returns: [
    { title: 'Returns', items: ['RTV Enquiry', 'Vendor Return Create/Edit', 'Return Enquiry', 'Return Create/Edit', 'Global Returns Search'] },
    { title: 'Transfers', items: ['STO Order Enquiry', 'STO Order Create/Edit'] },
  ],
  reports: [
    { title: 'Inbound', items: ['GR Register', 'PO Report', 'Inbound QC Report'] },
    { title: 'Finance', items: ['Sales Register', 'Purchase Register', 'Sales Return Register'] },
    { title: 'Outbound', items: ['Ship Label/Delivery Challan', 'Invoice', 'Manifest Report', 'Dispatch Report'] },
    { title: 'Inventory', items: ['Fin Inv Report - By SKU', 'Fin Inv Report - By SKU BIN'] },
    { title: 'Sales & Return', items: ['Sales Report', 'SKU Wise Sales Report'] },
    { title: 'Miscellaneous', items: ['MIS reports', 'Pick Pack Report'] },
  ],
  admin: [
    { title: 'User Management', items: ['User Enquiry'] },
    { title: 'Imports', items: ['Order Import', 'Common Import', 'Miscellaneous'] },
    { title: 'Exports', items: ['Force Order Pull'] },
    { title: 'Settings', items: ['Manage Api', 'API Dashboard Logs', 'User Audit Logs', 'Tax Integration Log', 'POS Integration Log'] },
  ],
};

function LiveMenuWorkspace({ active, openTitle, onOpen }: { active: ModuleKey; openTitle?: string; onOpen: (title: string) => void }) {
  const [menuQuery, setMenuQuery] = useState('');
  const menus = liveMenus[active] ?? liveMenus.dashboard;
  const heading = active === 'wms' ? 'WMS' : active === 'returns' ? 'Returns & Transfers' : active.charAt(0).toUpperCase() + active.slice(1);
  const filteredMenus = menus
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => `${group.title} ${item}`.toLowerCase().includes(menuQuery.toLowerCase())),
    }))
    .filter((group) => group.items.length);
  return (
    <Panel title={`${heading} Menu`}>
      <div className="mb-3 flex items-center gap-2 border border-[#d5e3ef] bg-[#fbfdff] px-3 py-2">
        <Search size={15} className="text-[#3c8dbc]" />
        <input value={menuQuery} onChange={(event) => setMenuQuery(event.target.value)} className="h-8 flex-1 border border-[#bfc4c8] px-2 text-sm outline-none focus:border-[#3c8dbc]" placeholder={`Search ${heading} menu`} />
        {menuQuery ? <button onClick={() => setMenuQuery('')} className="text-xs font-bold text-[#777]">Clear</button> : null}
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {filteredMenus.map((group) => (
          <div key={group.title} className="border border-[#d5e3ef] bg-[#fbfdff]">
            <div className="border-b border-[#a6c9e2] bg-[#e8f2fb] px-3 py-2 text-sm font-bold text-[#2e6e9e]">{group.title}</div>
            <div className="grid gap-1 p-2">
              {group.items.map((item) => (
                <button key={item} onClick={() => onOpen(item)} className={`h-8 truncate border px-2 text-left text-xs hover:border-[#a6c9e2] hover:bg-white hover:text-[#0b6fa4] ${openTitle === item ? 'border-[#a6c9e2] bg-white text-[#0b6fa4]' : 'border-transparent text-[#333]'}`} title={item}>
                  {item}
                </button>
              ))}
            </div>
          </div>
        ))}
        {!filteredMenus.length ? <div className="border border-dashed border-[#b8b8b8] bg-white p-8 text-center text-sm text-[#777]">No menu items found</div> : null}
      </div>
    </Panel>
  );
}

function OpenedScreen({ screen, orders, inventory, onRefresh, setMessage }: { screen: { module: ModuleKey; title: string }; orders: Order[]; inventory: InventoryItem[]; onRefresh: () => Promise<void>; setMessage: (message: string) => void }) {
  const title = screen.title;
  const lower = title.toLowerCase();

  if (screen.module === 'wms' && ['allocate', 'unallocate', 'pick', 'pack', 'ship', 'handover', 'acknowledgement', 'sort to box', 'bulk order'].some((term) => lower.includes(term))) {
    return <FulfillmentWorkbench title={title} orders={orders} onRefresh={onRefresh} setMessage={setMessage} />;
  }
  if (lower.includes('import') || lower.includes('bulk upload')) {
    return <ImportWorkbench title={title} setMessage={setMessage} />;
  }
  if (lower.includes('order') && !lower.includes('import')) {
    return <OrderEnquiryScreen title={title} orders={orders} onRefresh={onRefresh} setMessage={setMessage} />;
  }
  if (lower.includes('sku') && !lower.includes('wise')) {
    return <SkuScreen title={title} inventory={inventory} onRefresh={onRefresh} setMessage={setMessage} />;
  }
  if (screen.module === 'master') {
    return <MasterDataScreen title={title} setMessage={setMessage} />;
  }
  if (lower.includes('inventory') || lower.includes('bin') || lower.includes('lpn')) {
    return <InventoryOperationScreen title={title} inventory={inventory} onRefresh={onRefresh} setMessage={setMessage} />;
  }
  if (lower.includes('return') || lower.includes('rtv') || lower.includes('sto')) {
    return <ReturnOperationScreen title={title} orders={orders} setMessage={setMessage} />;
  }
  if (lower.includes('user') || lower.includes('api') || lower.includes('log') || lower.includes('setting')) {
    return <AdminOperationScreen title={title} />;
  }
  if (lower.includes('report') || lower.includes('register') || lower.includes('invoice') || lower.includes('manifest')) {
    return <ReportOperationScreen title={title} orders={orders} inventory={inventory} setMessage={setMessage} />;
  }
  if (lower.includes('po') || lower.includes('asn') || lower.includes('vendor') || lower.includes('inbound')) {
    return <ProcurementOperationScreen title={title} setMessage={setMessage} />;
  }
  return <GenericOperationScreen title={title} module={screen.module} />;
}

function ScreenShell({ title, children, actions }: { title: string; children: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <section className="mt-3 border border-[#cfd8df] bg-white">
      <div className="flex min-h-10 items-center justify-between border-t-[3px] border-[#3c8dbc] border-b border-[#e5e5e5] px-3">
        <div className="font-bold text-[#333]">{title}</div>
        <div className="flex items-center gap-2">{actions}</div>
      </div>
      <div className="p-3">{children}</div>
    </section>
  );
}

function SearchForm({ fields }: { fields: string[] }) {
  const [values, setValues] = useState<Record<string, string>>({});
  const filled = Object.values(values).filter(Boolean).length;
  return (
    <div className="mb-3 border border-dashed border-[#b8b8b8] bg-[#fbfbfb] p-3">
      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
        {fields.map((field) => (
          <label key={field} className="text-xs font-bold text-[#555]">
            {field}
            <input value={values[field] ?? ''} onChange={(event) => setValues({ ...values, [field]: event.target.value })} className="mt-1 h-8 w-full border border-[#bfc4c8] px-2 font-normal outline-none focus:border-[#3d90b8]" />
          </label>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <button type="button" className="h-8 rounded-sm bg-[#3c8dbc] px-4 text-xs font-bold text-white">Search{filled ? ` (${filled})` : ''}</button>
        <button type="button" onClick={() => setValues({})} className="h-8 rounded-sm bg-[#f4f4f4] px-4 text-xs font-bold text-[#444] ring-1 ring-[#ddd]">Reset</button>
        <button className="h-8 rounded-sm bg-[#00a65a] px-4 text-xs font-bold text-white">Export</button>
      </div>
    </div>
  );
}

function OrderEnquiryScreen({ title, orders, onRefresh, setMessage }: { title: string; orders: Order[]; onRefresh: () => Promise<void>; setMessage: (message: string) => void }) {
  async function move(id: string, status: string) {
    await api.updateOrder(id, { status });
    setMessage(`${id} updated to ${status}`);
    await onRefresh();
  }
  return (
    <ScreenShell title={title} actions={<button className="rounded-sm bg-[#ff9800] px-3 py-1 text-xs font-bold text-white">Create New</button>}>
      <SearchForm fields={['Order No', 'Web Order No', 'Channel', 'Customer', 'From Date', 'To Date', 'Status', 'AWB No', 'Invoice No', 'SKU Code']} />
      <OrderTable orders={orders} onStatus={move} />
    </ScreenShell>
  );
}

function FulfillmentWorkbench({ title, orders, onRefresh, setMessage }: { title: string; orders: Order[]; onRefresh: () => Promise<void>; setMessage: (message: string) => void }) {
  const lower = title.toLowerCase();
  const defaultStatus = lower.includes('ship') || lower.includes('handover') ? 'Shipped' : lower.includes('pick') ? 'Packed' : lower.includes('bulk') ? 'Allocated' : 'Allocated';
  const [selected, setSelected] = useState<string[]>([]);
  const [nextStatus, setNextStatus] = useState(defaultStatus);
  const [filter, setFilter] = useState('');
  const [activity, setActivity] = useState<string[]>([]);
  const rows = orders.filter((order) => {
    const text = [order.id, order.channel, order.customer, order.status, order.city, order.sla].join(' ').toLowerCase();
    return text.includes(filter.toLowerCase());
  });
  const selectedRows = rows.filter((order) => selected.includes(order.id));
  const totalValue = selectedRows.reduce((sum, order) => sum + order.value, 0);
  const totalItems = selectedRows.reduce((sum, order) => sum + order.items, 0);
  const allSelected = Boolean(rows.length) && rows.every((order) => selected.includes(order.id));

  useEffect(() => {
    setNextStatus(defaultStatus);
    setSelected([]);
    setActivity([]);
  }, [title]);

  function toggle(id: string) {
    setSelected((ids) => (ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]));
  }

  function toggleAll() {
    setSelected(allSelected ? [] : rows.map((order) => order.id));
  }

  async function applyBulkStatus() {
    if (!selected.length) return;
    const result = await api.bulkUpdateOrders({ ids: selected, status: nextStatus });
    setActivity((items) => [`${result.updated} order(s) moved to ${nextStatus}`, ...items].slice(0, 6));
    setMessage(`${result.updated} order(s) moved to ${nextStatus}`);
    setSelected([]);
    await onRefresh();
  }

  async function moveOne(id: string, status: string) {
    await api.updateOrder(id, { status });
    setActivity((items) => [`${id} moved to ${status}`, ...items].slice(0, 6));
    setMessage(`${id} moved to ${status}`);
    await onRefresh();
  }

  function exportManifest() {
    const exportRows = selectedRows.length ? selectedRows : rows;
    const header = ['Order', 'Channel', 'Customer', 'City', 'Status', 'Items', 'Value', 'SLA'];
    const csv = [header, ...exportRows.map((order) => [order.id, order.channel, order.customer, order.city, order.status, order.items, order.value, order.sla])]
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.replaceAll(' ', '_')}_manifest.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setActivity((items) => [`Manifest exported for ${exportRows.length} order(s)`, ...items].slice(0, 6));
  }

  return (
    <ScreenShell title={title} actions={<button onClick={exportManifest} className="rounded-sm bg-[#00a65a] px-3 py-1 text-xs font-bold text-white">Manifest CSV</button>}>
      <SearchForm fields={['Order No', 'Web Order No', 'Picklist No', 'AWB No', 'Channel', 'Location', 'From Date', 'To Date', 'Status']} />
      <div className="mb-3 grid gap-2 md:grid-cols-4">
        <ReportCard label="Selected Orders" value={selected.length.toString()} />
        <ReportCard label="Selected Qty" value={totalItems.toString()} />
        <ReportCard label="Selected Value" value={new Intl.NumberFormat('en-IN').format(totalValue)} />
        <ReportCard label="Queue Size" value={rows.length.toString()} />
      </div>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 border border-[#d5e3ef] bg-[#fbfdff] px-3 py-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#555]">Bulk Action</span>
          <select value={nextStatus} onChange={(event) => setNextStatus(event.target.value)} className="h-8 border border-[#bfc4c8] bg-white px-2">
            {orderStatuses.map((status) => <option key={status}>{status}</option>)}
          </select>
          <button disabled={!selected.length} onClick={applyBulkStatus} className="h-8 rounded-sm bg-[#3c8dbc] px-3 font-bold text-white disabled:opacity-40">Apply</button>
          <button disabled={!selected.length} onClick={() => setSelected([])} className="h-8 rounded-sm border border-[#bfc4c8] bg-white px-3 font-bold text-[#555] disabled:opacity-40">Clear</button>
        </div>
        <input value={filter} onChange={(event) => setFilter(event.target.value)} className="h-8 w-64 border border-[#bfc4c8] px-2 text-xs outline-none focus:border-[#3c8dbc]" placeholder="Filter orders, customer, city" />
      </div>
      <div className="overflow-x-auto">
        <table className="vin-grid w-full min-w-[980px] border-collapse text-sm">
          <thead className="text-left text-xs uppercase">
            <tr>
              <th className="px-3 py-2"><input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="Select all orders" /></th>
              {['Order', 'Channel', 'Customer', 'City', 'Status', 'Items', 'Value', 'SLA', 'Action'].map((head) => <th key={head} className="px-3 py-2">{head}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((order) => (
              <tr key={order.id}>
                <td className="px-3 py-3"><input type="checkbox" checked={selected.includes(order.id)} onChange={() => toggle(order.id)} aria-label={`Select ${order.id}`} /></td>
                <td className="px-3 py-3 font-bold text-[#006bb6]">{order.id}</td>
                <td className="px-3 py-3">{order.channel}</td>
                <td className="px-3 py-3">{order.customer}</td>
                <td className="px-3 py-3">{order.city}</td>
                <td className="px-3 py-3"><Status value={order.status} /></td>
                <td className="px-3 py-3">{order.items}</td>
                <td className="px-3 py-3">{new Intl.NumberFormat('en-IN').format(order.value)}</td>
                <td className="px-3 py-3">{order.sla}</td>
                <td className="px-3 py-3">
                  <select className="h-8 border border-[#bfc4c8] bg-white px-2 text-xs" value={order.status} onChange={(event) => moveOne(order.id, event.target.value)}>
                    {orderStatuses.map((status) => <option key={status}>{status}</option>)}
                  </select>
                </td>
              </tr>
            ))}
            {!rows.length ? <tr><td colSpan={10} className="px-3 py-8 text-center text-[#777]">No orders found</td></tr> : null}
          </tbody>
        </table>
      </div>
      <div className="mt-3 grid gap-3 xl:grid-cols-[1fr_320px]">
        <Panel title="Dock Summary">
          <div className="grid gap-2 md:grid-cols-4">
            {orderStatuses.map((status) => <ReportCard key={status} label={status} value={orders.filter((order) => order.status === status).length.toString()} />)}
          </div>
        </Panel>
        <Panel title="Activity / Audit Trail">
          <div className="text-xs text-[#555]">
            {activity.length ? activity.map((item, index) => <div key={`${item}-${index}`} className="border-b border-[#eef3f7] py-1">{item}</div>) : <div>No activity yet</div>}
          </div>
        </Panel>
      </div>
    </ScreenShell>
  );
}

function ImportWorkbench({ title, setMessage }: { title: string; setMessage: (message: string) => void }) {
  const [jobs, setJobs] = useState<ImportJob[]>([]);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ fileName: `${title.replaceAll(' ', '-').toLowerCase()}.csv`, rows: 25, owner: 'Operations' });
  const [filter, setFilter] = useState('');
  const rows = jobs.filter((job) => [job.id, job.fileName, job.status, job.owner, job.message].join(' ').toLowerCase().includes(filter.toLowerCase()));
  const complete = jobs.filter((job) => job.status === 'Completed').length;
  const failed = jobs.filter((job) => job.status === 'Failed').length;
  const queued = jobs.filter((job) => ['Queued', 'Processing'].includes(job.status)).length;

  useEffect(() => {
    void load();
  }, [title]);

  async function load() {
    setBusy(true);
    try {
      const exact = await api.imports({ type: title });
      const all = exact.length ? exact : await api.imports();
      setJobs(all.filter((job) => job.type === title || !exact.length));
    } finally {
      setBusy(false);
    }
  }

  async function createJob(event: React.FormEvent) {
    event.preventDefault();
    const job = await api.createImport({
      type: title,
      fileName: form.fileName,
      rows: Number(form.rows || 0),
      owner: form.owner,
      message: 'File received and queued for validation',
    });
    setMessage(`${job.id} queued`);
    setForm({ fileName: `${title.replaceAll(' ', '-').toLowerCase()}.csv`, rows: 25, owner: 'Operations' });
    await load();
  }

  async function transition(job: ImportJob, status: string) {
    const successRows = status === 'Completed' ? job.rows - job.failedRows : status === 'Failed' ? job.successRows : Math.min(job.rows, Math.max(job.successRows, Math.ceil(job.rows * 0.6)));
    const failedRows = status === 'Failed' && job.failedRows === 0 ? Math.max(1, Math.floor(job.rows * 0.1)) : job.failedRows;
    const message = status === 'Completed' ? 'Import completed successfully' : status === 'Failed' ? 'Validation failed for one or more rows' : 'Rows are being validated';
    await api.updateImport(job.id, { status, successRows, failedRows, message });
    setMessage(`${job.id} marked ${status}`);
    await load();
  }

  function downloadTemplate() {
    const header = title.toLowerCase().includes('sku')
      ? ['SKU', 'Name', 'Barcode', 'Category', 'Brand', 'MRP']
      : title.toLowerCase().includes('order')
        ? ['OrderNo', 'Channel', 'Customer', 'SKU', 'Qty', 'Amount']
        : ['Code', 'Name', 'Location', 'Status', 'Value'];
    const sample = header.map((head) => `${head}-Sample`);
    const csv = [header, sample].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.replaceAll(' ', '_')}_template.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <ScreenShell title={title} actions={<button onClick={downloadTemplate} className="rounded-sm bg-[#00a65a] px-3 py-1 text-xs font-bold text-white">Download Template</button>}>
      <SearchForm fields={['Import No', 'File Name', 'Created By', 'From Date', 'To Date', 'Status']} />
      <div className="grid gap-3 xl:grid-cols-[360px_1fr]">
        <Panel title="Upload File">
          <form onSubmit={createJob} className="space-y-3">
            <Input label="File Name" value={form.fileName} onChange={(fileName) => setForm({ ...form, fileName })} />
            <div className="grid grid-cols-2 gap-3">
              <NumberInput label="Rows" value={form.rows} onChange={(rows) => setForm({ ...form, rows })} />
              <Input label="Owner" value={form.owner} onChange={(owner) => setForm({ ...form, owner })} />
            </div>
            <div className="border border-dashed border-[#b8b8b8] bg-[#fbfbfb] p-4 text-center text-xs text-[#777]">
              CSV/XLS file staging area
            </div>
            <button className="h-9 w-full rounded-sm bg-[#ff9800] text-xs font-bold text-white">Upload / Queue Import</button>
          </form>
        </Panel>
        <div>
          <div className="mb-3 grid gap-2 md:grid-cols-4">
            <ReportCard label="Total Jobs" value={jobs.length.toString()} />
            <ReportCard label="Queued / Processing" value={queued.toString()} />
            <ReportCard label="Completed" value={complete.toString()} />
            <ReportCard label="Failed" value={failed.toString()} />
          </div>
          <div className="mb-2 flex items-center justify-between gap-2 border border-[#d5e3ef] bg-[#fbfdff] px-3 py-2">
            <span className="text-xs font-bold text-[#555]">{rows.length} job(s)</span>
            <input value={filter} onChange={(event) => setFilter(event.target.value)} className="h-8 w-64 border border-[#bfc4c8] px-2 text-xs outline-none focus:border-[#3c8dbc]" placeholder="Filter jobs" />
          </div>
          <div className="overflow-x-auto">
            <table className="vin-grid w-full min-w-[920px] border-collapse text-sm">
              <thead className="text-left text-xs uppercase">
                <tr>{['Import No', 'File', 'Status', 'Rows', 'Success', 'Failed', 'Owner', 'Message', 'Action'].map((head) => <th key={head} className="px-3 py-2">{head}</th>)}</tr>
              </thead>
              <tbody>
                {rows.map((job) => (
                  <tr key={job.id}>
                    <td className="px-3 py-3 font-bold text-[#006bb6]">{job.id}</td>
                    <td className="px-3 py-3">{job.fileName}</td>
                    <td className="px-3 py-3"><Status value={job.status} /></td>
                    <td className="px-3 py-3">{job.rows}</td>
                    <td className="px-3 py-3">{job.successRows}</td>
                    <td className="px-3 py-3">{job.failedRows}</td>
                    <td className="px-3 py-3">{job.owner}</td>
                    <td className="px-3 py-3">{job.message}</td>
                    <td className="px-3 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => transition(job, 'Processing')} className="rounded-sm border border-[#a6c9e2] px-2 py-1 text-xs text-[#006bb6]">Process</button>
                        <button onClick={() => transition(job, 'Completed')} className="rounded-sm bg-[#00a65a] px-2 py-1 text-xs text-white">Complete</button>
                        <button onClick={() => transition(job, 'Failed')} className="rounded-sm bg-[#dd4b39] px-2 py-1 text-xs text-white">Fail</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!rows.length ? <tr><td colSpan={9} className="px-3 py-8 text-center text-[#777]">{busy ? 'Loading...' : 'No import jobs found'}</td></tr> : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ScreenShell>
  );
}

function SkuScreen({ title, inventory, onRefresh, setMessage }: { title: string; inventory: InventoryItem[]; onRefresh: () => Promise<void>; setMessage: (message: string) => void }) {
  async function adjust(sku: string) {
    await api.updateInventory(sku, { adjustment: 1 });
    setMessage(`${sku} incremented by 1`);
    await onRefresh();
  }
  return (
    <ScreenShell title={title} actions={<button className="rounded-sm bg-[#00a65a] px-3 py-1 text-xs font-bold text-white">Create SKU</button>}>
      <SearchForm fields={['SKU Code', 'SKU Name', 'Barcode', 'Category', 'Brand', 'Vendor', 'Status', 'Location']} />
      <div className="overflow-x-auto">
        <table className="vin-grid w-full min-w-[860px] border-collapse text-sm">
          <thead className="text-left text-xs uppercase">
            <tr>{['SKU Code', 'SKU Name', 'Location', 'Available', 'Allocated', 'Reorder', 'Action'].map((head) => <th key={head} className="px-3 py-2">{head}</th>)}</tr>
          </thead>
          <tbody>
            {inventory.map((item) => (
              <tr key={item.sku}>
                <td className="px-3 py-3 font-bold text-[#006bb6]">{item.sku}</td>
                <td className="px-3 py-3">{item.name}</td>
                <td className="px-3 py-3">{item.location}</td>
                <td className="px-3 py-3">{item.available}</td>
                <td className="px-3 py-3">{item.allocated}</td>
                <td className="px-3 py-3">{item.reorder}</td>
                <td className="px-3 py-3"><button onClick={() => adjust(item.sku)} className="rounded-sm bg-[#3c8dbc] px-2 py-1 text-xs text-white">Adjust +1</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <OperationGrid module="master" type={title} />
    </ScreenShell>
  );
}

function InventoryOperationScreen({ title, inventory, onRefresh, setMessage }: { title: string; inventory: InventoryItem[]; onRefresh: () => Promise<void>; setMessage: (message: string) => void }) {
  return (
    <ScreenShell title={title}>
      <SearchForm fields={['Location', 'Zone', 'Bin', 'SKU Code', 'LPN No', 'Lot No', 'Inventory Status']} />
      <InventoryModule inventory={inventory} query="" onRefresh={onRefresh} setMessage={setMessage} />
      <OperationGrid module="wms" type={title} />
    </ScreenShell>
  );
}

function ReturnOperationScreen({ title, orders, setMessage }: { title: string; orders: Order[]; setMessage: (message: string) => void }) {
  const firstOrder = orders[0];
  const [cases, setCases] = useState<ReturnCase[]>([]);
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState('');
  const [form, setForm] = useState({
    orderId: firstOrder?.id ?? 'SO-NEW',
    customer: firstOrder?.customer ?? '',
    city: firstOrder?.city ?? '',
    reason: title.toLowerCase().includes('sto') ? 'Hub replenishment' : 'Customer return',
    disposition: title.toLowerCase().includes('sto') ? 'Transfer' : title.toLowerCase().includes('rtv') ? 'Return to Vendor' : 'QC Pending',
    quantity: 1,
    refundAmount: firstOrder ? Math.round(firstOrder.value / Math.max(firstOrder.items, 1)) : 0,
    owner: title.toLowerCase().includes('sto') ? 'Transfer Desk' : 'Returns Team',
    dock: title.toLowerCase().includes('sto') ? 'Main Warehouse' : 'Returns Dock',
  });
  const visibleCases = cases.filter((item) => [item.id, item.orderId, item.customer, item.city, item.status, item.reason, item.disposition, item.owner, item.dock].join(' ').toLowerCase().includes(filter.toLowerCase()));
  const qcPending = cases.filter((item) => ['Return Initiated', 'QC Pending', 'Vendor Review', 'Open'].includes(item.status)).length;
  const refundTotal = cases.reduce((sum, item) => sum + item.refundAmount, 0);
  const qtyTotal = cases.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    void load();
  }, [title]);

  async function load() {
    setBusy(true);
    try {
      const exact = await api.returns({ type: title });
      const all = exact.length ? exact : await api.returns();
      setCases(all.filter((item) => item.type === title || !exact.length));
    } finally {
      setBusy(false);
    }
  }

  async function createCase(event: React.FormEvent) {
    event.preventDefault();
    const item = await api.createReturn({
      type: title,
      status: title.toLowerCase().includes('sto') ? 'Open' : 'Return Initiated',
      ...form,
      quantity: Number(form.quantity || 0),
      refundAmount: Number(form.refundAmount || 0),
    });
    setMessage(`${item.id} created`);
    await load();
  }

  async function transition(item: ReturnCase, status: string) {
    const disposition = status === 'Closed' ? 'Closed' : status === 'Refund Pending' ? 'Refund' : item.disposition;
    await api.updateReturn(item.id, { status, disposition });
    setMessage(`${item.id} moved to ${status}`);
    await load();
  }

  function useOrder(orderId: string) {
    const order = orders.find((item) => item.id === orderId);
    if (!order) return;
    setForm({
      ...form,
      orderId: order.id,
      customer: order.customer,
      city: order.city,
      refundAmount: Math.round(order.value / Math.max(order.items, 1)),
    });
  }

  function exportCases() {
    const header = ['Return No', 'Type', 'Order', 'Customer', 'City', 'Status', 'Reason', 'Disposition', 'Qty', 'Refund', 'Owner', 'Dock'];
    const csv = [header, ...visibleCases.map((item) => [item.id, item.type, item.orderId, item.customer, item.city, item.status, item.reason, item.disposition, item.quantity, item.refundAmount, item.owner, item.dock])]
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.replaceAll(' ', '_')}_returns.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <ScreenShell title={title} actions={<button onClick={exportCases} className="rounded-sm bg-[#00a65a] px-3 py-1 text-xs font-bold text-white">Export CSV</button>}>
      <SearchForm fields={['Return No', 'Order No', 'AWB No', 'Customer', 'From Date', 'To Date', 'Status']} />
      <div className="grid gap-3 xl:grid-cols-[360px_1fr]">
        <Panel title={title.toLowerCase().includes('sto') ? 'Create STO Transfer' : title.toLowerCase().includes('rtv') ? 'Create Vendor Return' : 'Create Return'}>
          <form onSubmit={createCase} className="space-y-3">
            <Select label="Source Order" value={form.orderId} options={[...new Set([form.orderId, ...orders.map((order) => order.id)])]} onChange={useOrder} />
            <Input label="Customer / Vendor" value={form.customer} onChange={(customer) => setForm({ ...form, customer })} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="City" value={form.city} onChange={(city) => setForm({ ...form, city })} />
              <Input label="Dock" value={form.dock} onChange={(dock) => setForm({ ...form, dock })} />
            </div>
            <Input label="Reason" value={form.reason} onChange={(reason) => setForm({ ...form, reason })} />
            <Select label="Disposition" value={form.disposition} options={['QC Pending', 'Replace', 'Refund', 'Return to Vendor', 'Transfer', 'Closed']} onChange={(disposition) => setForm({ ...form, disposition })} />
            <div className="grid grid-cols-2 gap-3">
              <NumberInput label="Quantity" value={form.quantity} onChange={(quantity) => setForm({ ...form, quantity })} />
              <NumberInput label="Refund Amount" value={form.refundAmount} onChange={(refundAmount) => setForm({ ...form, refundAmount })} />
            </div>
            <Input label="Owner" value={form.owner} onChange={(owner) => setForm({ ...form, owner })} />
            <button className="h-9 w-full rounded-sm bg-[#ff9800] text-xs font-bold text-white">Save Case</button>
          </form>
        </Panel>
        <div>
          <div className="mb-3 grid gap-2 md:grid-cols-4">
            <ReportCard label="Total Cases" value={cases.length.toString()} />
            <ReportCard label="Pending Work" value={qcPending.toString()} />
            <ReportCard label="Total Qty" value={qtyTotal.toString()} />
            <ReportCard label="Refund Value" value={new Intl.NumberFormat('en-IN').format(refundTotal)} />
          </div>
          <div className="mb-2 flex items-center justify-between gap-2 border border-[#d5e3ef] bg-[#fbfdff] px-3 py-2">
            <span className="text-xs font-bold text-[#555]">{visibleCases.length} case(s)</span>
            <input value={filter} onChange={(event) => setFilter(event.target.value)} className="h-8 w-64 border border-[#bfc4c8] px-2 text-xs outline-none focus:border-[#3c8dbc]" placeholder="Filter returns, customer, status" />
          </div>
          <div className="overflow-x-auto">
            <table className="vin-grid w-full min-w-[1120px] border-collapse text-sm">
              <thead className="text-left text-xs uppercase">
                <tr>{['Return No', 'Order / STO', 'Customer', 'City', 'Status', 'Reason', 'Disposition', 'Qty', 'Refund', 'Owner', 'Dock', 'Action'].map((head) => <th key={head} className="px-3 py-2">{head}</th>)}</tr>
              </thead>
              <tbody>
                {visibleCases.map((item) => (
                  <tr key={item.id}>
                    <td className="px-3 py-3 font-bold text-[#006bb6]">{item.id}</td>
                    <td className="px-3 py-3">{item.orderId}</td>
                    <td className="px-3 py-3">{item.customer}</td>
                    <td className="px-3 py-3">{item.city}</td>
                    <td className="px-3 py-3"><Status value={item.status} /></td>
                    <td className="px-3 py-3">{item.reason}</td>
                    <td className="px-3 py-3">{item.disposition}</td>
                    <td className="px-3 py-3">{item.quantity}</td>
                    <td className="px-3 py-3">{new Intl.NumberFormat('en-IN').format(item.refundAmount)}</td>
                    <td className="px-3 py-3">{item.owner}</td>
                    <td className="px-3 py-3">{item.dock}</td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => transition(item, 'QC Pending')} className="rounded-sm border border-[#a6c9e2] px-2 py-1 text-xs text-[#006bb6]">QC</button>
                        <button onClick={() => transition(item, 'Refund Pending')} className="rounded-sm bg-[#3c8dbc] px-2 py-1 text-xs text-white">Refund</button>
                        <button onClick={() => transition(item, 'Closed')} className="rounded-sm bg-[#00a65a] px-2 py-1 text-xs text-white">Close</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!visibleCases.length ? <tr><td colSpan={12} className="px-3 py-8 text-center text-[#777]">{busy ? 'Loading...' : 'No return cases found'}</td></tr> : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <OperationGrid module="returns" type={title} />
    </ScreenShell>
  );
}

function MasterDataScreen({ title, setMessage }: { title: string; setMessage: (message: string) => void }) {
  const lower = title.toLowerCase();
  const [records, setRecords] = useState<MasterDataRecord[]>([]);
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState('');
  const [form, setForm] = useState({
    code: lower.includes('customer') ? 'CUS-NEW' : lower.includes('tax') ? 'TAX-NEW' : lower.includes('transport') ? 'TRN-NEW' : 'VEN-NEW',
    name: '',
    category: lower.includes('tax') ? 'GST' : lower.includes('customer') ? 'B2B' : lower.includes('transport') ? 'Courier' : 'Apparel Supplier',
    status: 'Active',
    location: 'JX Karawaci',
    contact: 'ops@threadsutra.test',
    owner: lower.includes('tax') ? 'Finance' : lower.includes('customer') ? 'Sales Team' : lower.includes('transport') ? 'Logistics' : 'Buying Team',
    balance: 0,
  });
  const rows = records.filter((record) => [record.id, record.code, record.name, record.category, record.status, record.location, record.contact, record.owner].join(' ').toLowerCase().includes(filter.toLowerCase()));
  const active = records.filter((record) => record.status === 'Active').length;
  const onHold = records.filter((record) => record.status === 'On Hold').length;
  const totalBalance = records.reduce((sum, record) => sum + record.balance, 0);

  useEffect(() => {
    void load();
  }, [title]);

  async function load() {
    setBusy(true);
    try {
      const exact = await api.masterData({ type: title });
      const all = exact.length ? exact : await api.masterData();
      setRecords(all.filter((record) => record.type === title || !exact.length));
    } finally {
      setBusy(false);
    }
  }

  async function createRecord(event: React.FormEvent) {
    event.preventDefault();
    const record = await api.createMasterData({ type: title, ...form, balance: Number(form.balance || 0) });
    setMessage(`${record.id} saved`);
    setForm({ ...form, code: form.code.includes('NEW') ? form.code : `${form.code}-COPY`, name: '', balance: 0 });
    await load();
  }

  async function changeStatus(record: MasterDataRecord, status: string) {
    await api.updateMasterData(record.id, { status });
    setMessage(`${record.code} marked ${status}`);
    await load();
  }

  function exportRows() {
    const header = ['ID', 'Type', 'Code', 'Name', 'Category', 'Status', 'Location', 'Contact', 'Owner', 'Balance'];
    const csv = [header, ...rows.map((record) => [record.id, record.type, record.code, record.name, record.category, record.status, record.location, record.contact, record.owner, record.balance])]
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.replaceAll(' ', '_')}_master.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <ScreenShell title={title} actions={<button onClick={exportRows} className="rounded-sm bg-[#00a65a] px-3 py-1 text-xs font-bold text-white">Export CSV</button>}>
      <SearchForm fields={['Code', 'Name', 'Category', 'Location', 'Status', 'Created From', 'Created To']} />
      <div className="grid gap-3 xl:grid-cols-[360px_1fr]">
        <Panel title="Create / Edit Master">
          <form onSubmit={createRecord} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input label="Code" value={form.code} onChange={(code) => setForm({ ...form, code })} />
              <Select label="Status" value={form.status} options={['Active', 'On Hold', 'Pending', 'Archived']} onChange={(status) => setForm({ ...form, status })} />
            </div>
            <Input label="Name" value={form.name} onChange={(name) => setForm({ ...form, name })} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Category" value={form.category} onChange={(category) => setForm({ ...form, category })} />
              <Input label="Location" value={form.location} onChange={(location) => setForm({ ...form, location })} />
            </div>
            <Input label="Contact" value={form.contact} onChange={(contact) => setForm({ ...form, contact })} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Owner" value={form.owner} onChange={(owner) => setForm({ ...form, owner })} />
              <NumberInput label={lower.includes('tax') ? 'Tax Rate' : 'Opening Balance'} value={form.balance} onChange={(balance) => setForm({ ...form, balance })} />
            </div>
            <button className="h-9 w-full rounded-sm bg-[#ff9800] text-xs font-bold text-white">Save Master</button>
          </form>
        </Panel>
        <div>
          <div className="mb-3 grid gap-2 md:grid-cols-4">
            <ReportCard label="Records" value={records.length.toString()} />
            <ReportCard label="Active" value={active.toString()} />
            <ReportCard label="On Hold" value={onHold.toString()} />
            <ReportCard label={lower.includes('tax') ? 'Rate / Value' : 'Balance'} value={new Intl.NumberFormat('en-IN').format(totalBalance)} />
          </div>
          <div className="mb-2 flex items-center justify-between gap-2 border border-[#d5e3ef] bg-[#fbfdff] px-3 py-2">
            <span className="text-xs font-bold text-[#555]">{rows.length} record(s)</span>
            <input value={filter} onChange={(event) => setFilter(event.target.value)} className="h-8 w-64 border border-[#bfc4c8] px-2 text-xs outline-none focus:border-[#3c8dbc]" placeholder="Filter code, name, owner" />
          </div>
          <div className="overflow-x-auto">
            <table className="vin-grid w-full min-w-[1080px] border-collapse text-sm">
              <thead className="text-left text-xs uppercase">
                <tr>{['Code', 'Name', 'Category', 'Status', 'Location', 'Contact', 'Owner', 'Balance', 'Action'].map((head) => <th key={head} className="px-3 py-2">{head}</th>)}</tr>
              </thead>
              <tbody>
                {rows.map((record) => (
                  <tr key={record.id}>
                    <td className="px-3 py-3 font-bold text-[#006bb6]">{record.code}</td>
                    <td className="px-3 py-3">{record.name}</td>
                    <td className="px-3 py-3">{record.category}</td>
                    <td className="px-3 py-3"><Status value={record.status} /></td>
                    <td className="px-3 py-3">{record.location}</td>
                    <td className="px-3 py-3">{record.contact}</td>
                    <td className="px-3 py-3">{record.owner}</td>
                    <td className="px-3 py-3">{new Intl.NumberFormat('en-IN').format(record.balance)}</td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => changeStatus(record, 'Active')} className="rounded-sm bg-[#00a65a] px-2 py-1 text-xs text-white">Active</button>
                        <button onClick={() => changeStatus(record, 'On Hold')} className="rounded-sm bg-[#3c8dbc] px-2 py-1 text-xs text-white">Hold</button>
                        <button onClick={() => changeStatus(record, 'Archived')} className="rounded-sm bg-[#dd4b39] px-2 py-1 text-xs text-white">Archive</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!rows.length ? <tr><td colSpan={9} className="px-3 py-8 text-center text-[#777]">{busy ? 'Loading...' : 'No master records found'}</td></tr> : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <OperationGrid module="master" type={title} />
    </ScreenShell>
  );
}

function AdminOperationScreen({ title }: { title: string }) {
  return (
    <ScreenShell title={title}>
      <SearchForm fields={['User Id', 'User Name', 'Role', 'Location', 'Status', 'From Date', 'To Date']} />
      <OperationGrid module="admin" type={title} />
    </ScreenShell>
  );
}

function ReportOperationScreen({ title, orders, inventory, setMessage }: { title: string; orders: Order[]; inventory: InventoryItem[]; setMessage: (message: string) => void }) {
  return (
    <ScreenShell title={title}>
      <SearchForm fields={['From Date', 'To Date', 'Location', 'Channel', 'SKU Code', 'Status']} />
      <ReportsModule orders={orders} inventory={inventory} />
      <ReportRunWorkbench title={title} orders={orders} inventory={inventory} setMessage={setMessage} />
    </ScreenShell>
  );
}

function ProcurementOperationScreen({ title, setMessage }: { title: string; setMessage: (message: string) => void }) {
  const lower = title.toLowerCase();
  const docPrefix = lower.includes('asn') ? 'ASN' : lower.includes('inbound') ? 'INB' : 'PO';
  const [docs, setDocs] = useState<ProcurementDoc[]>([]);
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState('');
  const [form, setForm] = useState({
    documentNo: `${docPrefix}-NEW`,
    vendor: 'ThreadSutra Vendor 1',
    location: lower.includes('inbound') ? 'Inbound Dock' : 'JX Karawaci',
    status: lower.includes('asn') ? 'ASN Created' : 'Open',
    items: 10,
    value: 10000,
    expectedDate: '2026-07-18',
    owner: lower.includes('asn') || lower.includes('inbound') ? 'Inbound Team' : 'Buyer A',
    asnNo: lower.includes('asn') || lower.includes('inbound') ? 'ASN-NEW' : 'ASN-PENDING',
    receivedQty: 0,
  });
  const rows = docs.filter((doc) => [doc.id, doc.documentNo, doc.vendor, doc.location, doc.status, doc.owner, doc.asnNo].join(' ').toLowerCase().includes(filter.toLowerCase()));
  const open = docs.filter((doc) => ['Open', 'Approved', 'ASN Created', 'QC Pending'].includes(doc.status)).length;
  const received = docs.reduce((sum, doc) => sum + doc.receivedQty, 0);
  const totalValue = docs.reduce((sum, doc) => sum + doc.value, 0);

  useEffect(() => {
    void load();
  }, [title]);

  async function load() {
    setBusy(true);
    try {
      const exact = await api.procurement({ type: title });
      const all = exact.length ? exact : await api.procurement();
      setDocs(all.filter((doc) => doc.type === title || !exact.length));
    } finally {
      setBusy(false);
    }
  }

  async function createDoc(event: React.FormEvent) {
    event.preventDefault();
    const doc = await api.createProcurement({
      type: title,
      ...form,
      items: Number(form.items || 0),
      value: Number(form.value || 0),
      receivedQty: Number(form.receivedQty || 0),
    });
    setMessage(`${doc.documentNo} saved`);
    setForm({ ...form, documentNo: `${docPrefix}-NEW`, asnNo: lower.includes('asn') || lower.includes('inbound') ? 'ASN-NEW' : 'ASN-PENDING', receivedQty: 0 });
    await load();
  }

  async function transition(doc: ProcurementDoc, status: string) {
    const receivedQty = status === 'Received' || status === 'QC Pending' ? doc.items : doc.receivedQty;
    await api.updateProcurement(doc.id, { status, receivedQty });
    setMessage(`${doc.documentNo} moved to ${status}`);
    await load();
  }

  function exportDocs() {
    const header = ['Document', 'Type', 'Vendor', 'Location', 'Status', 'Items', 'Received', 'Value', 'Expected Date', 'Owner', 'ASN'];
    const csv = [header, ...rows.map((doc) => [doc.documentNo, doc.type, doc.vendor, doc.location, doc.status, doc.items, doc.receivedQty, doc.value, doc.expectedDate, doc.owner, doc.asnNo])]
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.replaceAll(' ', '_')}_procurement.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <ScreenShell title={title} actions={<button onClick={exportDocs} className="rounded-sm bg-[#00a65a] px-3 py-1 text-xs font-bold text-white">Export CSV</button>}>
      <SearchForm fields={['PO No', 'Vendor Code', 'Location', 'ASN No', 'From Date', 'To Date', 'Status']} />
      <div className="grid gap-3 xl:grid-cols-[360px_1fr]">
        <Panel title={lower.includes('asn') ? 'Create ASN' : lower.includes('inbound') ? 'Create Inbound' : 'Create PO'}>
          <form onSubmit={createDoc} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input label="Document No" value={form.documentNo} onChange={(documentNo) => setForm({ ...form, documentNo })} />
              <Select label="Status" value={form.status} options={['Open', 'Approved', 'ASN Created', 'Received', 'QC Pending', 'Closed', 'Cancelled']} onChange={(status) => setForm({ ...form, status })} />
            </div>
            <Input label="Vendor" value={form.vendor} onChange={(vendor) => setForm({ ...form, vendor })} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Location" value={form.location} onChange={(location) => setForm({ ...form, location })} />
              <Input label="Expected Date" value={form.expectedDate} onChange={(expectedDate) => setForm({ ...form, expectedDate })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumberInput label="Items" value={form.items} onChange={(items) => setForm({ ...form, items })} />
              <NumberInput label="Value" value={form.value} onChange={(value) => setForm({ ...form, value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="ASN No" value={form.asnNo} onChange={(asnNo) => setForm({ ...form, asnNo })} />
              <NumberInput label="Received Qty" value={form.receivedQty} onChange={(receivedQty) => setForm({ ...form, receivedQty })} />
            </div>
            <Input label="Owner" value={form.owner} onChange={(owner) => setForm({ ...form, owner })} />
            <button className="h-9 w-full rounded-sm bg-[#ff9800] text-xs font-bold text-white">Save Document</button>
          </form>
        </Panel>
        <div>
          <div className="mb-3 grid gap-2 md:grid-cols-4">
            <ReportCard label="Documents" value={docs.length.toString()} />
            <ReportCard label="Open Work" value={open.toString()} />
            <ReportCard label="Received Qty" value={received.toString()} />
            <ReportCard label="Value" value={new Intl.NumberFormat('en-IN').format(totalValue)} />
          </div>
          <div className="mb-2 flex items-center justify-between gap-2 border border-[#d5e3ef] bg-[#fbfdff] px-3 py-2">
            <span className="text-xs font-bold text-[#555]">{rows.length} document(s)</span>
            <input value={filter} onChange={(event) => setFilter(event.target.value)} className="h-8 w-64 border border-[#bfc4c8] px-2 text-xs outline-none focus:border-[#3c8dbc]" placeholder="Filter PO, ASN, vendor" />
          </div>
          <div className="overflow-x-auto">
            <table className="vin-grid w-full min-w-[1120px] border-collapse text-sm">
              <thead className="text-left text-xs uppercase">
                <tr>{['Document', 'Vendor', 'Location', 'Status', 'Items', 'Received', 'Value', 'Expected', 'Owner', 'ASN', 'Action'].map((head) => <th key={head} className="px-3 py-2">{head}</th>)}</tr>
              </thead>
              <tbody>
                {rows.map((doc) => (
                  <tr key={doc.id}>
                    <td className="px-3 py-3 font-bold text-[#006bb6]">{doc.documentNo}</td>
                    <td className="px-3 py-3">{doc.vendor}</td>
                    <td className="px-3 py-3">{doc.location}</td>
                    <td className="px-3 py-3"><Status value={doc.status} /></td>
                    <td className="px-3 py-3">{doc.items}</td>
                    <td className="px-3 py-3">{doc.receivedQty}</td>
                    <td className="px-3 py-3">{new Intl.NumberFormat('en-IN').format(doc.value)}</td>
                    <td className="px-3 py-3">{doc.expectedDate}</td>
                    <td className="px-3 py-3">{doc.owner}</td>
                    <td className="px-3 py-3">{doc.asnNo || '-'}</td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => transition(doc, 'Approved')} className="rounded-sm border border-[#a6c9e2] px-2 py-1 text-xs text-[#006bb6]">Approve</button>
                        <button onClick={() => transition(doc, lower.includes('asn') || lower.includes('inbound') ? 'QC Pending' : 'ASN Created')} className="rounded-sm bg-[#3c8dbc] px-2 py-1 text-xs text-white">{lower.includes('asn') || lower.includes('inbound') ? 'Receive' : 'ASN'}</button>
                        <button onClick={() => transition(doc, 'Closed')} className="rounded-sm bg-[#00a65a] px-2 py-1 text-xs text-white">Close</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!rows.length ? <tr><td colSpan={11} className="px-3 py-8 text-center text-[#777]">{busy ? 'Loading...' : 'No procurement documents found'}</td></tr> : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <OperationGrid module="procurement" type={title} />
    </ScreenShell>
  );
}

function GenericOperationScreen({ title, module }: { title: string; module: ModuleKey }) {
  return (
    <ScreenShell title={title}>
      <SearchForm fields={['Code', 'Name', 'Location', 'Status', 'Created From', 'Created To']} />
      <OperationGrid module={module} type={title} />
    </ScreenShell>
  );
}

function OperationGrid({ module, type }: { module: ModuleKey | string; type: string }) {
  const [records, setRecords] = useState<OperationRecord[]>([]);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ name: '', location: 'JX Karawaci', owner: 'System', quantity: 0, amount: 0, status: 'Open' });
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [editingId, setEditingId] = useState('');
  const [page, setPage] = useState(1);
  const [activity, setActivity] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState('Closed');
  const [gridQuery, setGridQuery] = useState('');
  const pageSize = 5;
  const filteredRecords = records.filter((record) => [record.id, record.type, record.name, record.status, record.location, record.owner].join(' ').toLowerCase().includes(gridQuery.toLowerCase()));
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const pagedRecords = filteredRecords.slice((page - 1) * pageSize, page * pageSize);
  const visibleIds = pagedRecords.map((record) => record.id);
  const allVisibleSelected = Boolean(visibleIds.length) && visibleIds.every((id) => selected.includes(id));

  useEffect(() => {
    void load();
  }, [module, type]);

  useEffect(() => {
    setSelected([]);
  }, [module, type]);

  async function load() {
    setBusy(true);
    try {
      const exact = await api.operations({ module: String(module), type });
      const rows = exact.length ? exact : await api.operations({ module: String(module) });
      setRecords(rows);
      setPage(1);
      setSelected((ids) => ids.filter((id) => rows.some((record) => record.id === id)));
    } finally {
      setBusy(false);
    }
  }

  async function saveRecord(event: React.FormEvent) {
    event.preventDefault();
    if (modal === 'edit' && editingId) {
      await api.updateOperation(editingId, {
        name: form.name || `${type} record`,
        location: form.location,
        owner: form.owner,
        quantity: Number(form.quantity || 0),
        amount: Number(form.amount || 0),
        status: form.status,
      });
      setActivity((items) => [`Updated ${editingId}`, ...items].slice(0, 6));
    } else {
      const created = await api.createOperation({
        module: String(module),
        type,
        name: form.name || `${type} record`,
        location: form.location,
        owner: form.owner,
        quantity: Number(form.quantity || 0),
        amount: Number(form.amount || 0),
        status: form.status,
      });
      setActivity((items) => [`Created ${created.id}`, ...items].slice(0, 6));
    }
    setForm({ name: '', location: 'JX Karawaci', owner: 'System', quantity: 0, amount: 0, status: 'Open' });
    setEditingId('');
    setModal(null);
    await load();
  }

  function startCreate() {
    setForm({ name: '', location: 'JX Karawaci', owner: 'System', quantity: 0, amount: 0, status: 'Open' });
    setEditingId('');
    setModal('create');
  }

  function startEdit(record: OperationRecord) {
    setForm({ name: record.name, location: record.location, owner: record.owner, quantity: record.quantity, amount: record.amount, status: record.status });
    setEditingId(record.id);
    setModal('edit');
  }

  async function updateStatus(id: string, status: string) {
    await api.updateOperation(id, { status });
    setActivity((items) => [`Changed ${id} to ${status}`, ...items].slice(0, 6));
    await load();
  }

  async function bulkUpdateStatus() {
    if (!selected.length) return;
    const result = await api.bulkUpdateOperations({ ids: selected, status: bulkStatus });
    setActivity((items) => [`Bulk changed ${result.updated} record(s) to ${bulkStatus}`, ...items].slice(0, 6));
    setSelected([]);
    await load();
  }

  function toggleSelected(id: string) {
    setSelected((ids) => (ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]));
  }

  function toggleVisibleSelected() {
    if (allVisibleSelected) {
      setSelected((ids) => ids.filter((id) => !visibleIds.includes(id)));
      return;
    }
    setSelected((ids) => Array.from(new Set([...ids, ...visibleIds])));
  }

  async function remove(id: string) {
    await api.deleteOperation(id);
    setActivity((items) => [`Deleted ${id}`, ...items].slice(0, 6));
    setSelected((ids) => ids.filter((item) => item !== id));
    await load();
  }

  function exportCsv() {
    const header = ['Code', 'Type', 'Name', 'Status', 'Location', 'Owner', 'Qty', 'Amount'];
    const rows = records.map((record) => [record.id, record.type, record.name, record.status, record.location, record.owner, record.quantity, record.amount]);
    const csv = [header, ...rows].map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${type.replaceAll(' ', '_')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setActivity((items) => [`Exported ${records.length} record(s)`, ...items].slice(0, 6));
  }

  function downloadTemplate() {
    const header = ['Name', 'Status', 'Location', 'Owner', 'Qty', 'Amount'];
    const sample = [`${type} record`, 'Open', 'JX Karawaci', 'System', '1', '0'];
    const csv = [header, sample].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${type.replaceAll(' ', '_')}_template.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setActivity((items) => [`Downloaded ${type} import template`, ...items].slice(0, 6));
  }

  async function importSampleBatch() {
    const created = await Promise.all(
      ['Primary', 'Secondary', 'Exception'].map((name, index) =>
        api.createOperation({
          module: String(module),
          type,
          name: `${type} ${name} batch`,
          location: index === 2 ? 'Returns Dock' : 'JX Karawaci',
          owner: index === 0 ? 'System' : 'Operations',
          quantity: 10 + index * 5,
          amount: index === 2 ? 0 : 2500 * (index + 1),
          status: index === 2 ? 'Pending' : 'Open',
        }),
      ),
    );
    setActivity((items) => [`Imported ${created.length} ${type} sample row(s)`, ...items].slice(0, 6));
    await load();
  }

  return (
    <div className="mt-3">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs text-[#555]">
          <span>{filteredRecords.length} of {records.length} record(s)</span>
          <input value={gridQuery} onChange={(event) => { setGridQuery(event.target.value); setPage(1); }} className="h-8 w-56 border border-[#bfc4c8] px-2 text-xs outline-none focus:border-[#3c8dbc]" placeholder="Filter current grid" />
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={downloadTemplate} className="rounded-sm border border-[#a6c9e2] bg-white px-3 py-1.5 text-xs font-bold text-[#006bb6]">Template</button>
          <button onClick={importSampleBatch} className="rounded-sm border border-[#a6c9e2] bg-white px-3 py-1.5 text-xs font-bold text-[#006bb6]">Import Sample</button>
          <button onClick={exportCsv} className="rounded-sm bg-[#00a65a] px-3 py-1.5 text-xs font-bold text-white">Export CSV</button>
          <button onClick={startCreate} className="rounded-sm bg-[#ff9800] px-3 py-1.5 text-xs font-bold text-white">Create {type}</button>
        </div>
      </div>
      <div className="mb-2 flex flex-wrap items-center gap-2 border border-[#d5e3ef] bg-[#fbfdff] px-3 py-2 text-xs">
        <span className="font-bold text-[#555]">{selected.length} selected</span>
        <select value={bulkStatus} onChange={(event) => setBulkStatus(event.target.value)} className="h-8 border border-[#bfc4c8] bg-white px-2">
          {operationStatuses.map((status) => <option key={status}>{status}</option>)}
        </select>
        <button disabled={!selected.length} onClick={bulkUpdateStatus} className="h-8 rounded-sm bg-[#3c8dbc] px-3 font-bold text-white disabled:opacity-40">Apply Bulk Status</button>
        {selected.length ? <button onClick={() => setSelected([])} className="h-8 rounded-sm border border-[#bfc4c8] bg-white px-3 font-bold text-[#555]">Clear Selection</button> : null}
      </div>
      <div className="overflow-x-auto">
        <table className="vin-grid w-full min-w-[860px] border-collapse text-sm">
          <thead className="text-left text-xs uppercase">
            <tr>
              <th className="px-3 py-2"><input type="checkbox" checked={allVisibleSelected} onChange={toggleVisibleSelected} aria-label="Select visible rows" /></th>
              {['Code', 'Type', 'Name', 'Status', 'Location', 'Owner', 'Qty', 'Amount', 'Action'].map((head) => <th key={head} className="px-3 py-2">{head}</th>)}
            </tr>
          </thead>
          <tbody>
            {pagedRecords.map((record) => (
              <tr key={record.id}>
                <td className="px-3 py-3"><input type="checkbox" checked={selected.includes(record.id)} onChange={() => toggleSelected(record.id)} aria-label={`Select ${record.id}`} /></td>
                <td className="px-3 py-3 font-bold text-[#006bb6]">{record.id}</td>
                <td className="px-3 py-3">{record.type}</td>
                <td className="px-3 py-3">{record.name}</td>
                <td className="px-3 py-3"><Status value={record.status} /></td>
                <td className="px-3 py-3">{record.location}</td>
                <td className="px-3 py-3">{record.owner}</td>
                <td className="px-3 py-3">{record.quantity}</td>
                <td className="px-3 py-3">{new Intl.NumberFormat('en-IN').format(record.amount)}</td>
                <td className="px-3 py-3">
                  <div className="flex gap-2">
                    <select className="h-8 border border-[#bfc4c8] bg-white px-2 text-xs" value={record.status} onChange={(event) => updateStatus(record.id, event.target.value)}>
                      {operationStatuses.map((status) => <option key={status}>{status}</option>)}
                    </select>
                    <button onClick={() => startEdit(record)} className="rounded-sm border border-[#a6c9e2] px-2 text-xs text-[#006bb6]">Edit</button>
                    <button onClick={() => remove(record.id)} className="grid h-8 w-8 place-items-center rounded-sm border border-red-200 text-red-600" title="Delete"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {!records.length ? (
              <tr>
                <td colSpan={10} className="px-3 py-8 text-center text-[#777]">{busy ? 'Loading...' : 'No records found'}</td>
              </tr>
            ) : records.length && !filteredRecords.length ? (
              <tr>
                <td colSpan={10} className="px-3 py-8 text-center text-[#777]">No records match the current filter</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <div className="mt-2 flex items-center justify-end gap-2 text-xs">
        <button disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="h-7 rounded-sm border border-[#bfc4c8] bg-white px-3 disabled:opacity-40">Prev</button>
        <span>Page {page} of {totalPages}</span>
        <button disabled={page === totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))} className="h-7 rounded-sm border border-[#bfc4c8] bg-white px-3 disabled:opacity-40">Next</button>
      </div>
      <div className="mt-3 border border-[#d5e3ef] bg-[#fbfdff]">
        <div className="border-b border-[#a6c9e2] bg-[#e8f2fb] px-3 py-2 text-sm font-bold text-[#2e6e9e]">Activity / Audit Trail</div>
        <div className="p-3 text-xs text-[#555]">
          {activity.length ? activity.map((item, index) => <div key={`${item}-${index}`} className="border-b border-[#eef3f7] py-1">{item}</div>) : <div>No activity yet</div>}
        </div>
      </div>
      {modal ? (
        <div className="fixed inset-0 z-40 grid place-items-center bg-black/35 p-4">
          <form onSubmit={saveRecord} className="w-full max-w-[560px] border border-[#3c8dbc] bg-white shadow-2xl">
            <div className="flex h-10 items-center justify-between bg-[#3c8dbc] px-3 text-white">
              <div className="font-bold">{modal === 'edit' ? 'Edit' : 'Create'} {type}</div>
              <button type="button" onClick={() => setModal(null)} className="font-bold">x</button>
            </div>
            <div className="space-y-3 p-4">
              <Input label="Name" value={form.name} onChange={(name) => setForm({ ...form, name })} />
              <div className="grid gap-3 md:grid-cols-2">
                <Input label="Location" value={form.location} onChange={(location) => setForm({ ...form, location })} />
                <Input label="Owner" value={form.owner} onChange={(owner) => setForm({ ...form, owner })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <NumberInput label="Qty" value={form.quantity} onChange={(quantity) => setForm({ ...form, quantity })} />
                <NumberInput label="Amount" value={form.amount} onChange={(amount) => setForm({ ...form, amount })} />
              </div>
              <Select label="Status" value={form.status} options={operationStatuses} onChange={(status) => setForm({ ...form, status })} />
            </div>
            <div className="flex justify-end gap-2 border-t border-[#e5e5e5] bg-[#f7f7f7] px-4 py-3">
              <button type="button" onClick={() => setModal(null)} className="h-8 rounded-sm bg-[#f4f4f4] px-4 text-xs font-bold text-[#444] ring-1 ring-[#ddd]">Cancel</button>
              <button className="h-8 rounded-sm bg-[#3c8dbc] px-4 text-xs font-bold text-white">Save</button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}

function GlobalSearchPanel({ search, orders, inventory }: { search: { type: string; value: string }; orders: Order[]; inventory: InventoryItem[] }) {
  const needle = search.value.toLowerCase();
  const orderRows = orders.filter((order) => !needle || [order.id, order.customer, order.city, order.channel].join(' ').toLowerCase().includes(needle));
  const skuRows = inventory.filter((item) => !needle || [item.sku, item.name, item.location].join(' ').toLowerCase().includes(needle));
  return (
    <ScreenShell title={`Global Search - ${search.type}`}>
      <div className="mb-3 text-sm text-[#555]">Search value: <b>{search.value || 'All'}</b></div>
      <div className="grid gap-3 xl:grid-cols-2">
        <Panel title="Order Matches">
          <OrderTable orders={orderRows.slice(0, 5)} compact />
        </Panel>
        <Panel title="Inventory Matches">
          <InventoryCards inventory={skuRows.slice(0, 5)} />
        </Panel>
      </div>
    </ScreenShell>
  );
}

function KpiDrilldown({ title, orders, inventory, onClose }: { title: string; orders: Order[]; inventory: InventoryItem[]; onClose: () => void }) {
  const isStock = title.toLowerCase().includes('sku') || title.toLowerCase().includes('stock') || title.toLowerCase().includes('inventory');
  return (
    <ScreenShell title={`${title} Drilldown`} actions={<button onClick={onClose} className="rounded-sm bg-[#dd4b39] px-3 py-1 text-xs font-bold text-white">Close</button>}>
      <SearchForm fields={isStock ? ['SKU Code', 'Location', 'Available From', 'Available To', 'Status'] : ['Order No', 'Channel', 'Customer', 'From Date', 'To Date', 'Status']} />
      {isStock ? <InventoryCards inventory={inventory} /> : <OrderTable orders={orders} compact />}
    </ScreenShell>
  );
}

function ReturnsModule({ orders }: { orders: Order[] }) {
  const rows = orders.slice(0, 4).map((order, index) => ({
    id: `RTN-${order.id.replace('SO-', '')}`,
    order: order.id,
    customer: order.customer,
    status: ['Return Initiated', 'QC Pending', 'Refund Pending', 'Closed'][index] ?? 'Return Initiated',
    city: order.city,
  }));
  return (
    <Panel title="Return Enquiry">
      <div className="overflow-x-auto">
        <table className="vin-grid w-full min-w-[720px] border-collapse text-sm">
          <thead className="text-left text-xs uppercase">
            <tr>{['Return No', 'Order No', 'Customer', 'City', 'Status'].map((head) => <th key={head} className="px-3 py-2">{head}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td className="px-3 py-3 font-bold text-[#006bb6]">{row.id}</td>
                <td className="px-3 py-3">{row.order}</td>
                <td className="px-3 py-3">{row.customer}</td>
                <td className="px-3 py-3">{row.city}</td>
                <td className="px-3 py-3"><Status value={row.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function Dashboard({ metrics, queues, orders, inventory, setActive }: { metrics: Metric[]; queues: { label: string; value: number }[]; orders: Order[]; inventory: InventoryItem[]; setActive: (active: ModuleKey) => void }) {
  return (
    <>
      <MetricGrid metrics={metrics} />
      <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
        <Panel title="Today Operations" action={<button onClick={() => setActive('sales')} className="rounded bg-[#1e9bd7] px-3 py-1.5 text-xs font-semibold text-white">Open Orders</button>}>
          <OrderTable orders={orders.slice(0, 6)} compact />
        </Panel>
        <Panel title="Fulfillment Status">
          <div className="space-y-3">
            {queues.map((queue) => (
              <div key={queue.label}>
                <div className="mb-1 flex justify-between text-sm"><span>{queue.label}</span><span className="font-semibold">{queue.value}</span></div>
                <div className="h-2 bg-slate-100"><div className="h-2 bg-[#1e9bd7]" style={{ width: `${Math.max(10, queue.value * 20)}%` }} /></div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
      <Panel title="Stock Alerts" action={<button onClick={() => setActive('inventory')} className="rounded border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600">Manage Stock</button>}>
        <InventoryCards inventory={inventory.filter((item) => item.available <= item.reorder)} />
      </Panel>
    </>
  );
}

function OrdersModule({ orders, query, onRefresh, setMessage }: { orders: Order[]; query: string; onRefresh: () => Promise<void>; setMessage: (message: string) => void }) {
  const [form, setForm] = useState({ channel: 'Marketplace', customer: '', city: '', items: 1, value: 0, sla: 'Today 18:00', status: 'Pending Pick' });
  const filtered = useMemo(() => filterOrders(orders, query), [orders, query]);

  async function createOrder(event: React.FormEvent) {
    event.preventDefault();
    await api.createOrder(form);
    setForm({ channel: 'Marketplace', customer: '', city: '', items: 1, value: 0, sla: 'Today 18:00', status: 'Pending Pick' });
    setMessage('Order created successfully.');
    await onRefresh();
  }

  async function update(id: string, status: string) {
    await api.updateOrder(id, { status });
    setMessage(`Order ${id} moved to ${status}.`);
    await onRefresh();
  }

  async function remove(id: string) {
    await api.deleteOrder(id);
    setMessage(`Order ${id} deleted.`);
    await onRefresh();
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
      <Panel title="Sales Orders">
        <OrderTable orders={filtered} onStatus={update} onDelete={remove} />
      </Panel>
      <Panel title="Create Order">
        <form onSubmit={createOrder} className="space-y-3">
          <Input label="Customer" value={form.customer} onChange={(customer) => setForm({ ...form, customer })} />
          <Input label="City" value={form.city} onChange={(city) => setForm({ ...form, city })} />
          <Select label="Channel" value={form.channel} options={['Marketplace', 'B2B', 'Webstore', 'Retail']} onChange={(channel) => setForm({ ...form, channel })} />
          <div className="grid grid-cols-2 gap-3">
            <NumberInput label="Items" value={form.items} onChange={(items) => setForm({ ...form, items })} />
            <NumberInput label="Value" value={form.value} onChange={(value) => setForm({ ...form, value })} />
          </div>
          <Input label="SLA" value={form.sla} onChange={(sla) => setForm({ ...form, sla })} />
          <button className="flex h-10 w-full items-center justify-center gap-2 rounded bg-[#1e9bd7] text-sm font-semibold text-white">
            <Save size={16} />
            Save Order
          </button>
        </form>
      </Panel>
    </div>
  );
}

function InventoryModule({ inventory, query, onRefresh, setMessage }: { inventory: InventoryItem[]; query: string; onRefresh: () => Promise<void>; setMessage: (message: string) => void }) {
  const [form, setForm] = useState({ sku: '', name: '', location: '', available: 0, allocated: 0, reorder: 10 });
  const [adjustments, setAdjustments] = useState<Record<string, number>>({});
  const filtered = inventory.filter((item) => [item.sku, item.name, item.location].join(' ').toLowerCase().includes(query.toLowerCase()));

  async function addSku(event: React.FormEvent) {
    event.preventDefault();
    await api.createInventory(form);
    setForm({ sku: '', name: '', location: '', available: 0, allocated: 0, reorder: 10 });
    setMessage('SKU added to inventory.');
    await onRefresh();
  }

  async function adjust(sku: string) {
    await api.updateInventory(sku, { adjustment: Number(adjustments[sku] || 0) });
    setAdjustments({ ...adjustments, [sku]: 0 });
    setMessage(`${sku} stock adjusted.`);
    await onRefresh();
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
      <Panel title="Inventory Ledger">
        <div className="overflow-x-auto">
          <table className="vin-grid w-full min-w-[760px] border-collapse text-sm">
            <thead className="text-left text-xs uppercase">
              <tr>{['SKU', 'Name', 'Location', 'Available', 'Allocated', 'Reorder', 'Adjustment'].map((head) => <th key={head} className="px-3 py-2">{head}</th>)}</tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.sku} className="border-b border-slate-100">
                  <td className="px-3 py-3 font-semibold text-[#1e73a8]">{item.sku}</td>
                  <td className="px-3 py-3">{item.name}</td>
                  <td className="px-3 py-3">{item.location}</td>
                  <td className="px-3 py-3">{item.available}</td>
                  <td className="px-3 py-3">{item.allocated}</td>
                  <td className="px-3 py-3">{item.reorder}</td>
                  <td className="px-3 py-3">
                    <div className="flex gap-2">
                      <input className="h-8 w-20 border border-slate-300 px-2" type="number" value={adjustments[item.sku] ?? 0} onChange={(event) => setAdjustments({ ...adjustments, [item.sku]: Number(event.target.value) })} />
                      <button onClick={() => adjust(item.sku)} className="rounded bg-[#263746] px-3 text-xs font-semibold text-white">Apply</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
      <Panel title="Add SKU">
        <form onSubmit={addSku} className="space-y-3">
          <Input label="SKU" value={form.sku} onChange={(sku) => setForm({ ...form, sku })} />
          <Input label="Name" value={form.name} onChange={(name) => setForm({ ...form, name })} />
          <Input label="Location" value={form.location} onChange={(location) => setForm({ ...form, location })} />
          <div className="grid grid-cols-3 gap-2">
            <NumberInput label="Avail" value={form.available} onChange={(available) => setForm({ ...form, available })} />
            <NumberInput label="Alloc" value={form.allocated} onChange={(allocated) => setForm({ ...form, allocated })} />
            <NumberInput label="Reorder" value={form.reorder} onChange={(reorder) => setForm({ ...form, reorder })} />
          </div>
          <button className="flex h-10 w-full items-center justify-center gap-2 rounded bg-[#1e9bd7] text-sm font-semibold text-white">
            <PackagePlus size={16} />
            Add SKU
          </button>
        </form>
      </Panel>
    </div>
  );
}

function WarehouseModule({ orders, inventory, onRefresh, setMessage }: { orders: Order[]; inventory: InventoryItem[]; onRefresh: () => Promise<void>; setMessage: (message: string) => void }) {
  const pickable = orders.filter((order) => ['Pending Pick', 'Allocated'].includes(order.status));
  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
      <Panel title="Pick List">
        <OrderTable orders={pickable} onStatus={async (id, status) => { await api.updateOrder(id, { status }); setMessage(`Warehouse updated ${id}.`); await onRefresh(); }} compact />
      </Panel>
      <Panel title="Bin Capacity">
        <InventoryCards inventory={inventory.slice(0, 5)} />
      </Panel>
    </div>
  );
}

function ShippingModule({ orders, onRefresh, setMessage }: { orders: Order[]; onRefresh: () => Promise<void>; setMessage: (message: string) => void }) {
  const ready = orders.filter((order) => order.status === 'Ready to Ship');
  return (
    <Panel title="Carrier Manifest">
      <OrderTable orders={ready} onStatus={async (id) => { await api.updateOrder(id, { status: 'Shipped' }); setMessage(`${id} shipped.`); await onRefresh(); }} compact />
    </Panel>
  );
}

function ReportsModule({ orders, inventory }: { orders: Order[]; inventory: InventoryItem[] }) {
  const value = orders.reduce((total, order) => total + order.value, 0);
  const units = inventory.reduce((total, item) => total + item.available, 0);
  return (
    <div className="grid gap-5 md:grid-cols-3">
      <ReportCard label="Order Revenue" value={new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value)} />
      <ReportCard label="Inventory Units" value={units.toString()} />
      <ReportCard label="Fulfillment Rate" value={`${Math.round((orders.filter((order) => order.status === 'Shipped').length / Math.max(1, orders.length)) * 100)}%`} />
    </div>
  );
}

function ReportRunWorkbench({ title, orders, inventory, setMessage }: { title: string; orders: Order[]; inventory: InventoryItem[]; setMessage: (message: string) => void }) {
  const [runs, setRuns] = useState<ReportRun[]>([]);
  const [filter, setFilter] = useState('');
  const [format, setFormat] = useState('CSV');
  const [owner, setOwner] = useState('Reports');
  const rows = runs.filter((run) => [run.id, run.status, run.owner, run.format, run.message].join(' ').toLowerCase().includes(filter.toLowerCase()));
  const amount = orders.reduce((total, order) => total + order.value, 0);
  const suggestedRows = title.toLowerCase().includes('inventory') || title.toLowerCase().includes('inv') ? inventory.length : orders.length;
  const totalGenerated = runs.filter((run) => run.status === 'Generated').length;

  useEffect(() => {
    void load();
  }, [title]);

  async function load() {
    const exact = await api.reports({ type: title });
    const all = exact.length ? exact : await api.reports();
    setRuns(all.filter((run) => run.type === title || !exact.length));
  }

  async function generateReport(event: React.FormEvent) {
    event.preventDefault();
    const run = await api.createReport({
      type: title,
      rows: suggestedRows,
      owner,
      format,
      totalAmount: amount,
      message: 'Report queued for generation',
    });
    setMessage(`${run.id} queued`);
    await load();
  }

  async function transition(run: ReportRun, status: string) {
    const message = status === 'Generated' ? 'Report generated successfully' : status === 'Failed' ? 'Report generation failed' : 'Report is processing';
    await api.updateReport(run.id, { status, message, rows: run.rows || suggestedRows, totalAmount: run.totalAmount || amount });
    setMessage(`${run.id} marked ${status}`);
    await load();
  }

  function exportRun(run?: ReportRun) {
    const exportRows = title.toLowerCase().includes('inventory') || title.toLowerCase().includes('inv')
      ? inventory.map((item) => [item.sku, item.name, item.location, item.available, item.allocated, item.reorder])
      : orders.map((order) => [order.id, order.channel, order.customer, order.status, order.items, order.value, order.city, order.sla]);
    const header = title.toLowerCase().includes('inventory') || title.toLowerCase().includes('inv')
      ? ['SKU', 'Name', 'Location', 'Available', 'Allocated', 'Reorder']
      : ['Order', 'Channel', 'Customer', 'Status', 'Items', 'Value', 'City', 'SLA'];
    const csv = [header, ...exportRows].map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(run?.id ?? title).replaceAll(' ', '_')}.${(run?.format ?? format).toLowerCase() === 'xls' ? 'csv' : 'csv'}`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mt-3 grid gap-3 xl:grid-cols-[360px_1fr]">
      <Panel title="Generate Report">
        <form onSubmit={generateReport} className="space-y-3">
          <Select label="Format" value={format} options={['CSV', 'XLS', 'PDF']} onChange={setFormat} />
          <Input label="Owner" value={owner} onChange={setOwner} />
          <div className="grid grid-cols-2 gap-3">
            <ReportCard label="Rows" value={suggestedRows.toString()} />
            <ReportCard label="Amount" value={new Intl.NumberFormat('en-IN').format(amount)} />
          </div>
          <button className="h-9 w-full rounded-sm bg-[#ff9800] text-xs font-bold text-white">Generate</button>
          <button type="button" onClick={() => exportRun()} className="h-9 w-full rounded-sm bg-[#00a65a] text-xs font-bold text-white">Quick Export</button>
        </form>
      </Panel>
      <div>
        <div className="mb-3 grid gap-2 md:grid-cols-3">
          <ReportCard label="Report Runs" value={runs.length.toString()} />
          <ReportCard label="Generated" value={totalGenerated.toString()} />
          <ReportCard label="Pending" value={runs.filter((run) => run.status !== 'Generated').length.toString()} />
        </div>
        <div className="mb-2 flex items-center justify-between gap-2 border border-[#d5e3ef] bg-[#fbfdff] px-3 py-2">
          <span className="text-xs font-bold text-[#555]">{rows.length} run(s)</span>
          <input value={filter} onChange={(event) => setFilter(event.target.value)} className="h-8 w-64 border border-[#bfc4c8] px-2 text-xs outline-none focus:border-[#3c8dbc]" placeholder="Filter report runs" />
        </div>
        <div className="overflow-x-auto">
          <table className="vin-grid w-full min-w-[840px] border-collapse text-sm">
            <thead className="text-left text-xs uppercase">
              <tr>{['Report Run', 'Status', 'Rows', 'Format', 'Owner', 'Amount', 'Message', 'Action'].map((head) => <th key={head} className="px-3 py-2">{head}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((run) => (
                <tr key={run.id}>
                  <td className="px-3 py-3 font-bold text-[#006bb6]">{run.id}</td>
                  <td className="px-3 py-3"><Status value={run.status} /></td>
                  <td className="px-3 py-3">{run.rows}</td>
                  <td className="px-3 py-3">{run.format}</td>
                  <td className="px-3 py-3">{run.owner}</td>
                  <td className="px-3 py-3">{new Intl.NumberFormat('en-IN').format(run.totalAmount)}</td>
                  <td className="px-3 py-3">{run.message}</td>
                  <td className="px-3 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => transition(run, 'Processing')} className="rounded-sm border border-[#a6c9e2] px-2 py-1 text-xs text-[#006bb6]">Run</button>
                      <button onClick={() => transition(run, 'Generated')} className="rounded-sm bg-[#00a65a] px-2 py-1 text-xs text-white">Generate</button>
                      <button onClick={() => exportRun(run)} className="rounded-sm bg-[#3c8dbc] px-2 py-1 text-xs text-white">Export</button>
                    </div>
                  </td>
                </tr>
              ))}
              {!rows.length ? <tr><td colSpan={8} className="px-3 py-8 text-center text-[#777]">No report runs found</td></tr> : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AdminModule({ session }: { session: Session }) {
  return (
    <Panel title="User & Organization">
      <div className="grid gap-4 md:grid-cols-3">
        <ReportCard label="Organization" value={session.organization} />
        <ReportCard label="User" value={session.username} />
        <ReportCard label="Role" value={session.role} />
      </div>
    </Panel>
  );
}

function OrderTable({ orders, onStatus, onDelete, compact = false }: { orders: Order[]; onStatus?: (id: string, status: string) => void | Promise<void>; onDelete?: (id: string) => void | Promise<void>; compact?: boolean }) {
  if (!orders.length) return <EmptyState label="No matching orders" />;
  return (
    <div className="overflow-x-auto">
      <table className="vin-grid w-full min-w-[760px] border-collapse text-sm">
        <thead className="text-left text-xs uppercase">
          <tr>{['Order', 'Channel', 'Customer', 'Status', 'Items', 'Value', 'SLA', 'Actions'].map((head) => <th key={head} className="border-b border-slate-200 px-3 py-2 font-semibold">{head}</th>)}</tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b border-slate-100 hover:bg-sky-50">
              <td className="px-3 py-3 font-semibold text-[#1e73a8]">{order.id}</td>
              <td className="px-3 py-3">{order.channel}</td>
              <td className="px-3 py-3">{order.customer}<span className="block text-xs text-slate-500">{order.city}</span></td>
              <td className="px-3 py-3"><Status value={order.status} /></td>
              <td className="px-3 py-3">{order.items}</td>
              <td className="px-3 py-3">{new Intl.NumberFormat('en-IN').format(order.value)}</td>
              <td className="px-3 py-3">{order.sla}</td>
              <td className="px-3 py-3">
                <div className="flex flex-wrap gap-2">
                  {onStatus ? <select className="h-8 border border-slate-300 bg-white px-2 text-xs" value={order.status} onChange={(event) => onStatus(order.id, event.target.value)}>{orderStatuses.map((status) => <option key={status}>{status}</option>)}</select> : null}
                  {onDelete && !compact ? <button onClick={() => onDelete(order.id)} className="grid h-8 w-8 place-items-center rounded border border-red-200 text-red-600" title="Delete"><Trash2 size={15} /></button> : null}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MetricGrid({ metrics }: { metrics: Metric[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <div key={metric.label} className="border-l-4 border-[#1e9bd7] bg-white p-4 shadow-sm">
          <div className="text-xs uppercase text-slate-500">{metric.label}</div>
          <div className="mt-2 text-2xl font-semibold">
            {metric.currency ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(metric.value) : metric.value}
          </div>
        </div>
      ))}
    </div>
  );
}

function InventoryCards({ inventory }: { inventory: InventoryItem[] }) {
  if (!inventory.length) return <EmptyState label="No inventory alerts" />;
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
      {inventory.map((item) => (
        <div key={item.sku} className="border border-slate-200 bg-white p-3">
          <div className="flex items-start justify-between gap-2">
            <CheckCircle2 size={18} className={item.available <= item.reorder ? 'text-amber-500' : 'text-emerald-500'} />
            <span className="text-xs text-slate-500">{item.location}</span>
          </div>
          <div className="mt-2 text-sm font-semibold">{item.name}</div>
          <div className="mt-1 text-xs text-slate-500">{item.sku}</div>
          <div className="mt-3 flex justify-between text-xs">
            <span>Available <b>{item.available}</b></span>
            <span>Allocated <b>{item.allocated}</b></span>
          </div>
        </div>
      ))}
    </div>
  );
}

function TopBar({ user, query, setQuery, onLogout }: { user: Session; query: string; setQuery: (query: string) => void; onLogout: () => void }) {
  return (
    <header className="flex h-[52px] items-center justify-between bg-[#3c8dbc] text-white shadow">
      <div className="flex h-full items-center">
        <div className="flex h-full w-[230px] items-center justify-center bg-[#367fa9] text-xl font-semibold">eRetail</div>
      </div>
      <div className="hidden h-8 w-[360px] items-center gap-2 rounded-sm bg-white px-3 text-slate-500 md:flex">
        <Search size={16} />
        <input className="min-w-0 flex-1 text-sm outline-none" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search order, SKU, customer" />
      </div>
      <div className="flex h-full items-center">
        <button className="grid h-full w-12 place-items-center hover:bg-[#367fa9]" title="Notifications"><Bell size={18} /></button>
        <span className="hidden h-full items-center px-3 text-right text-xs hover:bg-[#367fa9] sm:flex sm:flex-col sm:justify-center"><span className="block font-semibold">{user.displayName}</span><span className="block text-sky-100">{user.role}</span></span>
        <button onClick={onLogout} className="grid h-full w-12 place-items-center hover:bg-[#367fa9]" title="Logout"><LogOut size={18} /></button>
      </div>
    </header>
  );
}

function Panel({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="vin-box border border-[#d2d6de] bg-white">
      <div className="flex min-h-10 items-center justify-between border-b border-[#f4f4f4] px-3">
        <h2 className="text-[15px] font-semibold text-[#444]">{title}</h2>
        {action}
      </div>
      <div className="p-3">{children}</div>
    </section>
  );
}

function Field({ icon: Icon, label, value, onChange, type = 'text' }: { icon: typeof User; label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">{label}</span>
      <span className="flex h-10 items-center gap-2 border border-slate-300 bg-white px-3 focus-within:border-[#1e9bd7]">
        <Icon size={16} className="text-slate-400" />
        <input className="min-w-0 flex-1 outline-none" type={type} value={value} onChange={(event) => onChange(event.target.value)} required />
      </span>
    </label>
  );
}

function Input({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">{label}</span>
      <input required className="h-9 w-full border border-slate-300 px-3 outline-none focus:border-[#1e9bd7]" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function NumberInput({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">{label}</span>
      <input required type="number" min={0} className="h-9 w-full border border-slate-300 px-3 outline-none focus:border-[#1e9bd7]" value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  );
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">{label}</span>
      <select className="h-9 w-full border border-slate-300 bg-white px-3 outline-none focus:border-[#1e9bd7]" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </label>
  );
}

function Status({ value }: { value: string }) {
  const color = value === 'Exception' || value === 'Cancelled' ? 'bg-red-50 text-red-700 ring-red-200' : value === 'Shipped' || value === 'Ready to Ship' ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : 'bg-sky-50 text-sky-700 ring-sky-200';
  return <span className={`inline-flex rounded px-2 py-1 text-xs font-semibold ring-1 ${color}`}>{value}</span>;
}

function ReportCard({ label, value }: { label: string; value: string }) {
  return <div className="border border-slate-200 bg-white p-5"><div className="text-xs uppercase text-slate-500">{label}</div><div className="mt-2 text-2xl font-semibold">{value}</div></div>;
}

function EmptyState({ label }: { label: string }) {
  return <div className="flex min-h-32 items-center justify-center border border-dashed border-slate-300 text-sm text-slate-500"><AlertTriangle size={16} className="mr-2" />{label}</div>;
}

function filterOrders(orders: Order[], query: string) {
  const needle = query.toLowerCase();
  return orders.filter((order) => [order.id, order.channel, order.customer, order.city, order.status].join(' ').toLowerCase().includes(needle));
}
