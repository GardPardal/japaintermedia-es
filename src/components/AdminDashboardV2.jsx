import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle, BarChart3, Bell, Car, CheckCircle2, ChevronRight, CircleDollarSign,
  ExternalLink, FileWarning, Filter, Gauge, LayoutDashboard, Link2, Loader2, LogOut,
  Menu, MessageCircle, MoreHorizontal, Pencil, Plus, RefreshCw, Search, Settings,
  ShieldCheck, Store, Users, X, UploadCloud, Trash2, Star, Image as ImageIcon, Link as LinkIcon
} from 'lucide-react';
import SalesView from './admin/SalesView';
import ReportsView from './admin/ReportsView';
import SettingsView from './admin/SettingsView';

const CHANNELS = [
  { key: 'site', label: 'Site', color: 'bg-slate-950' },
  { key: 'webmotors', label: 'Webmotors', color: 'bg-red-600' },
  { key: 'mobiauto', label: 'Mobiauto', color: 'bg-cyan-600' },
  { key: 'olx', label: 'OLX', color: 'bg-violet-600' },
  { key: 'meta', label: 'Facebook / Instagram', color: 'bg-blue-600' },
  { key: 'icarros', label: 'iCarros', color: 'bg-blue-700' },
  { key: 'mercadolivre', label: 'Mercado Livre', color: 'bg-amber-400' }
];

const NAV = [
  { key: 'overview', label: 'Visão geral', icon: LayoutDashboard },
  { key: 'stock', label: 'Estoque', icon: Car },
  { key: 'leads', label: 'Leads', icon: Users },
  { key: 'portals', label: 'Portais', icon: Link2 },
  { key: 'sales', label: 'Vendas', icon: CircleDollarSign },
  { key: 'reports', label: 'Relatórios', icon: BarChart3 },
  { key: 'settings', label: 'Configurações', icon: Settings }
];

const money = (value) => Number(value || 0).toLocaleString('pt-BR', {
  style: 'currency', currency: 'BRL', maximumFractionDigits: 0
});

function channelState(vehicle, key) {
  if (key === 'site') return { label: 'Publicado', tone: 'success' };
  if (key === 'webmotors' && vehicle.webmotorsSync) return { label: 'Selecionado', tone: 'warning' };
  return { label: 'Não conectado', tone: 'muted' };
}

function StatusDot({ tone = 'muted' }) {
  const color = tone === 'success' ? 'bg-emerald-500' : tone === 'error' ? 'bg-red-500' : tone === 'warning' ? 'bg-amber-400' : 'bg-slate-300';
  return <span className={`inline-block h-2 w-2 rounded-full ${color}`} />;
}

export default function AdminDashboardV2({ onClose, onLogout, onVehicleUpdated }) {
  const [tab, setTab] = useState('stock');
  const [mobileMenu, setMobileMenu] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [leads, setLeads] = useState([]);
  const [sales, setSales] = useState([]);
  const [reports, setReports] = useState(null);
  const [settings, setSettings] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('todos');
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [editorVehicle, setEditorVehicle] = useState(undefined);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');

  async function loadData() {
    setLoading(true);
    try {
      const [vehicleRes, leadRes, statsRes, salesRes, reportsRes, settingsRes] = await Promise.all([
        fetch('/api/vehicles'),
        fetch('/api/leads'),
        fetch('/api/stats'),
        fetch('/api/sales').catch(() => null),
        fetch('/api/reports').catch(() => null),
        fetch('/api/settings').catch(() => null)
      ]);
      const vehicleData = vehicleRes.ok ? await vehicleRes.json() : { vehicles: [] };
      const leadData = leadRes.ok ? await leadRes.json() : { leads: [] };
      const statsData = statsRes.ok ? await statsRes.json() : null;
      const salesData = salesRes && salesRes.ok ? await salesRes.json() : { sales: [] };
      const reportsData = reportsRes && reportsRes.ok ? await reportsRes.json() : null;
      const settingsData = settingsRes && settingsRes.ok ? await settingsRes.json() : null;

      setVehicles(vehicleData.vehicles || []);
      setLeads(leadData.leads || []);
      setStats(statsData);
      setSales(salesData.sales || []);
      setReports(reportsData);
      setSettings(settingsData);
    } catch (error) {
      setNotice('Não foi possível atualizar os dados agora. Verifique a API da hospedagem.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  const filtered = useMemo(() => vehicles.filter((vehicle) => {
    const text = `${vehicle.marca} ${vehicle.modelo} ${vehicle.versao || ''} ${vehicle.id}`.toLowerCase();
    const matchesText = text.includes(query.toLowerCase());
    const matchesStatus = status === 'todos' || String(vehicle.status).toLowerCase() === status.toLowerCase();
    return matchesText && matchesStatus;
  }), [vehicles, query, status]);

  const reserved = vehicles.filter(v => String(v.status).toLowerCase() === 'reservado').length;
  const published = vehicles.filter(v => String(v.status).toLowerCase() !== 'vendido').length;
  const needsAttention = vehicles.filter(v => v.isDemoPrice).length;

  function selectTab(key) {
    setTab(key);
    setMobileMenu(false);
  }

  async function saveVehicle(form) {
    setSaving(true);
    try {
      const editing = Boolean(form.id);
      const url = editing ? `/api/vehicles/${form.id}` : '/api/vehicles';
      const response = await fetch(url, {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!response.ok) throw new Error('Falha ao salvar');
      setEditorVehicle(undefined);
      await loadData();
      onVehicleUpdated?.();
      setNotice(editing ? 'Veículo atualizado com sucesso.' : 'Veículo cadastrado com sucesso.');
    } catch (error) {
      setNotice('Não foi possível salvar o veículo. Confira a API e tente novamente.');
    } finally {
      setSaving(false);
    }
  }

  async function deleteVehicle(vehicle) {
    if (!vehicle || !vehicle.id) return;
    const vehicleName = `${vehicle.marca || ''} ${vehicle.modelo || ''}`.trim() || `ID ${vehicle.id}`;
    const confirmed = window.confirm(`Tem certeza que deseja excluir o veículo "${vehicleName}"? Esta ação removerá o anúncio do site e não pode ser desfeita.`);
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/vehicles/${vehicle.id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Falha ao excluir veículo.');
      }
      if (editorVehicle && String(editorVehicle.id) === String(vehicle.id)) {
        setEditorVehicle(undefined);
      }
      await loadData();
      onVehicleUpdated?.();
      setNotice(`Veículo "${vehicleName}" excluído com sucesso.`);
    } catch (error) {
      setNotice('Erro ao excluir veículo. Verifique a conexão e tente novamente.');
    }
  }

  async function saveSale(saleData) {
    const res = await fetch('/api/sales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(saleData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Falha ao registrar venda.');
    }
    await loadData();
    onVehicleUpdated?.();
    setNotice(`Venda de "${saleData.veiculoNome}" registrada com sucesso!`);
  }

  async function deleteSale(sale) {
    if (!sale || !sale.id) return;
    const confirmed = window.confirm(`Deseja cancelar o registro de venda de "${sale.veiculoNome}" para ${sale.clienteNome}? Se o veículo pertencia ao estoque, seu status voltará a ser 'Disponível'.`);
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/sales/${sale.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Falha ao cancelar venda.');
      await loadData();
      onVehicleUpdated?.();
      setNotice('Venda cancelada com sucesso.');
    } catch (e) {
      setNotice('Erro ao cancelar venda.');
    }
  }

  async function saveSettings(settingsData) {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settingsData)
    });
    if (!res.ok) throw new Error('Falha ao salvar configurações.');
    const data = await res.json();
    setSettings(data.settings);
    setNotice('Configurações da loja atualizadas com sucesso.');
  }

  return (
    <div className="fixed inset-0 z-50 flex overflow-hidden bg-[#f5f6f8] text-[#111]">
      <aside className={`absolute inset-y-0 left-0 z-50 w-64 bg-[#111315] text-white transition-transform lg:relative lg:translate-x-0 ${mobileMenu ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-full flex-col">
          <div className="border-b border-white/10 p-5">
            <div className="rounded-xl bg-white px-3 py-2 shadow-lg">
              <img src="/logo-japa.png" alt="JAPA Intermediações" className="h-14 w-full object-contain" />
            </div>
          </div>
          <nav className="flex-1 space-y-1 p-3">
            {NAV.map(({ key, label, icon: Icon }) => (
              <button key={key} onClick={() => selectTab(key)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${tab === key ? 'bg-[#e50914] text-white shadow-lg shadow-red-950/30' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}>
                <Icon className="h-5 w-5" /><span>{label}</span>
                {key === 'leads' && leads.filter(l => l.status === 'Novo').length > 0 && <span className="ml-auto rounded-full bg-white px-2 py-0.5 text-[10px] font-black text-[#e50914]">{leads.filter(l => l.status === 'Novo').length}</span>}
              </button>
            ))}
          </nav>
          <div className="bg-seigaiha border-t border-white/10 p-5">
            <p className="text-xs leading-relaxed text-slate-400">Conectando boas histórias sobre rodas.</p>
            <button onClick={onLogout} className="mt-4 flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white"><LogOut className="h-4 w-4" />Sair da conta</button>
          </div>
        </div>
      </aside>

      {mobileMenu && <button aria-label="Fechar menu" onClick={() => setMobileMenu(false)} className="fixed inset-0 z-40 bg-black/50 lg:hidden" />}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center gap-3 border-b border-slate-200 bg-white px-4 sm:px-6">
          <button onClick={() => setMobileMenu(true)} className="rounded-lg p-2 hover:bg-slate-100 lg:hidden"><Menu className="h-5 w-5" /></button>
          <div className="relative hidden max-w-md flex-1 md:block">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar no sistema..." className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-3 text-sm outline-none focus:border-[#e50914]" />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button className="relative rounded-xl p-2.5 text-slate-600 hover:bg-slate-100"><Bell className="h-5 w-5" /><span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#e50914]" /></button>
            <div className="hidden items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 sm:flex"><Store className="h-4 w-4" /><span className="text-xs font-bold">Loja Matriz</span></div>
            <button onClick={onClose} className="rounded-xl border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-100" title="Fechar painel"><X className="h-5 w-5" /></button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 pb-24 sm:p-6 lg:p-7">
          <div className="mx-auto max-w-[1500px]">
            {notice && <div className="mb-4 flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"><span>{notice}</span><button onClick={() => setNotice('')}><X className="h-4 w-4" /></button></div>}

            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-[#e50914]">JAPA Gestão</p>
                <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                  {tab === 'stock' ? 'Estoque de veículos' :
                   tab === 'leads' ? 'Leads e propostas' :
                   tab === 'sales' ? 'Gestão de vendas' :
                   tab === 'reports' ? 'Relatórios e métricas' :
                   tab === 'settings' ? 'Configurações da loja' :
                   tab === 'portals' ? 'Canais de publicação' : 'Visão geral'}
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  {tab === 'sales' ? `${sales.length} vendas registradas • Faturamento consolidado` :
                   tab === 'reports' ? 'Indicadores de faturamento, margem e giro de estoque' :
                   tab === 'settings' ? 'Parâmetros institucionais, segurança e integrações' :
                   tab === 'leads' ? `${leads.length} propostas recebidas` :
                   `${vehicles.length} veículos • ${published} disponíveis no site`}
                </p>
              </div>
              {tab === 'stock' && (
                <button onClick={() => setEditorVehicle(null)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#e50914] px-5 py-3 text-sm font-black text-white shadow-lg shadow-red-200 hover:bg-[#bd0710]">
                  <Plus className="h-4 w-4" />Cadastrar veículo
                </button>
              )}
            </div>

            <section className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-5">
              <Metric label="Em estoque" value={stats?.totalEstoque ?? vehicles.length} icon={Car} />
              <Metric label="Publicados" value={published} icon={CheckCircle2} tone="green" />
              <Metric label="Reservados" value={reserved} icon={Gauge} tone="amber" />
              <Metric label="Leads novos" value={stats?.leadsNovos ?? 0} icon={MessageCircle} tone="blue" />
              <Metric label="Atenção" value={needsAttention} icon={AlertTriangle} tone="red" />
            </section>

            {loading ? <div className="flex min-h-[320px] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[#e50914]" /></div> : null}
            {!loading && tab === 'stock' && <StockView vehicles={filtered} query={query} setQuery={setQuery} status={status} setStatus={setStatus} onRefresh={loadData} onEdit={setEditorVehicle} onChannels={setSelectedVehicle} onDelete={deleteVehicle} />}
            {!loading && tab === 'overview' && <Overview stats={stats} vehicles={vehicles} leads={leads} sales={sales} onOpenStock={() => setTab('stock')} onOpenSales={() => setTab('sales')} />}
            {!loading && tab === 'leads' && <LeadView leads={leads} />}
            {!loading && tab === 'sales' && <SalesView sales={sales} vehicles={vehicles} onRefresh={loadData} onSaveSale={saveSale} onDeleteSale={deleteSale} />}
            {!loading && tab === 'reports' && <ReportsView reports={reports} sales={sales} vehicles={vehicles} leads={leads} />}
            {!loading && tab === 'settings' && <SettingsView settings={settings} onSaveSettings={saveSettings} vehicles={vehicles} leads={leads} sales={sales} />}
            {!loading && tab === 'portals' && <PortalView />}
          </div>
        </main>

        <nav className="fixed bottom-0 left-0 right-0 z-30 grid h-16 grid-cols-5 border-t border-slate-200 bg-white px-2 lg:hidden">
          <MobileNav icon={LayoutDashboard} label="Painel" active={tab === 'overview'} onClick={() => setTab('overview')} />
          <MobileNav icon={Car} label="Estoque" active={tab === 'stock'} onClick={() => setTab('stock')} />
          <button onClick={() => setEditorVehicle(null)} className="mx-auto -mt-5 flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-[#e50914] text-white shadow-xl"><Plus className="h-6 w-6" /></button>
          <MobileNav icon={Users} label="Leads" active={tab === 'leads'} onClick={() => setTab('leads')} />
          <MobileNav icon={MoreHorizontal} label="Mais" active={tab === 'portals'} onClick={() => setTab('portals')} />
        </nav>
      </div>

      {selectedVehicle && <ChannelDrawer vehicle={selectedVehicle} onClose={() => setSelectedVehicle(null)} />}
      {editorVehicle !== undefined && <VehicleEditor vehicle={editorVehicle} saving={saving} onClose={() => setEditorVehicle(undefined)} onSave={saveVehicle} onDelete={deleteVehicle} />}
    </div>
  );
}

function Metric({ label, value, icon: Icon, tone = 'slate' }) {
  const tones = { slate: 'bg-slate-100 text-slate-900', green: 'bg-emerald-50 text-emerald-600', amber: 'bg-amber-50 text-amber-600', blue: 'bg-blue-50 text-blue-600', red: 'bg-red-50 text-[#e50914]' };
  return <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl ${tones[tone]}`}><Icon className="h-4 w-4" /></div><p className="text-xs font-semibold text-slate-500">{label}</p><p className="mt-0.5 text-2xl font-black">{value}</p></div>;
}

function StockView({ vehicles, query, setQuery, status, setStatus, onRefresh, onEdit, onChannels, onDelete }) {
  return <>
    <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center">
      <div className="relative flex-1"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar marca, modelo, versão ou código..." className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none focus:border-[#e50914]" /></div>
      <div className="flex gap-2"><div className="relative flex-1 sm:flex-none"><Filter className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" /><select value={status} onChange={e => setStatus(e.target.value)} className="h-10 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-9 pr-8 text-sm font-semibold outline-none"><option value="todos">Todos</option><option value="Disponível">Disponíveis</option><option value="Reservado">Reservados</option><option value="Vendido">Vendidos</option></select></div><button onClick={onRefresh} className="rounded-xl border border-slate-200 p-2.5 hover:bg-slate-50" title="Atualizar"><RefreshCw className="h-4 w-4" /></button></div>
    </div>
    {vehicles.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center"><Car className="mx-auto mb-3 h-8 w-8 text-slate-300" /><h3 className="font-black">Nenhum veículo encontrado</h3><p className="mt-1 text-sm text-slate-500">Altere os filtros ou cadastre um novo veículo.</p></div> : <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{vehicles.map(vehicle => <AdminVehicleCard key={vehicle.id} vehicle={vehicle} onEdit={() => onEdit(vehicle)} onChannels={() => onChannels(vehicle)} onDelete={() => onDelete(vehicle)} />)}</div>}
  </>;
}

function AdminVehicleCard({ vehicle, onEdit, onChannels, onDelete }) {
  const state = String(vehicle.status || 'Disponível');
  const statusClass = state === 'Disponível' ? 'bg-emerald-50 text-emerald-700' : state === 'Reservado' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600';
  const photo = vehicle.fotos?.[0] || '/veiculo-sedan.webp';
  return <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl">
    <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
      <img src={photo} alt={`${vehicle.marca} ${vehicle.modelo}`} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
      <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-[11px] font-black shadow-sm ${statusClass}`}>
        <StatusDot tone={state === 'Disponível' ? 'success' : state === 'Reservado' ? 'warning' : 'muted'} /> <span className="ml-1">{state}</span>
      </span>
      <div className="absolute right-3 top-3 flex items-center gap-1.5">
        <button onClick={onEdit} className="rounded-xl bg-white/95 p-2 text-slate-700 shadow hover:bg-white hover:text-black transition" title="Editar veículo">
          <Pencil className="h-4 w-4" />
        </button>
        <button onClick={onDelete} className="rounded-xl bg-white/95 p-2 text-red-600 shadow hover:bg-red-50 hover:text-red-700 transition" title="Excluir veículo">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
    <div className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-black">{vehicle.marca} {vehicle.modelo}</h3>
          <p className="truncate text-xs text-slate-500">{vehicle.versao}</p>
        </div>
        <strong className="whitespace-nowrap text-base font-black">{money(vehicle.preco)}</strong>
      </div>
      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs font-semibold text-slate-500">
        <span>{vehicle.anoFabricacao}/{vehicle.anoModelo}</span>
        <span>{Number(vehicle.km || 0).toLocaleString('pt-BR')} km</span>
        <span>{vehicle.cambio}</span>
      </div>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {CHANNELS.slice(0, 5).map(channel => {
          const c = channelState(vehicle, channel.key);
          return <span key={channel.key} className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2 py-1 text-[10px] font-bold text-slate-600"><StatusDot tone={c.tone} />{channel.label}</span>;
        })}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3">
        <button onClick={onEdit} className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-2.5 text-xs font-black text-slate-700 hover:bg-slate-50 transition" title="Editar informações">
          <Pencil className="h-3.5 w-3.5" />Editar
        </button>
        <button onClick={onChannels} className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 py-2.5 text-xs font-black text-white hover:bg-black transition" title="Canais e Portais">
          <ExternalLink className="h-3.5 w-3.5" />Portais
        </button>
        <button onClick={onDelete} className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 py-2.5 text-xs font-black text-red-600 hover:bg-red-600 hover:text-white transition" title="Excluir veículo do estoque">
          <Trash2 className="h-3.5 w-3.5" />Excluir
        </button>
      </div>
    </div>
  </article>;
}

function ChannelDrawer({ vehicle, onClose }) {
  return <div className="fixed inset-0 z-[70] bg-black/35" onClick={onClose}><aside onClick={e => e.stopPropagation()} className="absolute bottom-0 right-0 max-h-[90vh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:bottom-auto sm:top-0 sm:h-full sm:max-h-none sm:max-w-md sm:rounded-none sm:p-6">
    <div className="mb-6 flex items-start justify-between"><div><p className="text-xs font-black uppercase tracking-widest text-[#e50914]">Distribuição</p><h2 className="mt-1 text-xl font-black">Canais de publicação</h2><p className="mt-1 text-sm text-slate-500">{vehicle.marca} {vehicle.modelo}</p></div><button onClick={onClose} className="rounded-xl border border-slate-200 p-2"><X className="h-4 w-4" /></button></div>
    <div className="mb-5 flex items-center gap-3 rounded-2xl bg-slate-50 p-3"><img src={vehicle.fotos?.[0] || '/veiculo-sedan.webp'} alt="" className="h-16 w-24 rounded-xl object-cover" /><div><strong className="block text-sm">{vehicle.marca} {vehicle.modelo}</strong><span className="text-xs text-slate-500">{vehicle.anoModelo} • {money(vehicle.preco)}</span></div></div>
    <div className="space-y-2">{CHANNELS.map(channel => { const s = channelState(vehicle, channel.key); return <div key={channel.key} className="flex items-center gap-3 rounded-2xl border border-slate-200 p-3"><span className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-black text-white ${channel.color}`}>{channel.label.slice(0,2).toUpperCase()}</span><div className="min-w-0 flex-1"><strong className="block text-sm">{channel.label}</strong><span className="flex items-center gap-1 text-xs text-slate-500"><StatusDot tone={s.tone} />{s.label}</span></div><button disabled={channel.key !== 'site'} className={`relative h-6 w-11 rounded-full ${channel.key === 'site' ? 'bg-[#e50914]' : 'cursor-not-allowed bg-slate-200'}`}><span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow ${channel.key === 'site' ? 'right-0.5' : 'left-0.5'}`} /></button></div>; })}</div>
    <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-xs leading-relaxed text-blue-900"><ShieldCheck className="mb-2 h-5 w-5" /><strong className="block">Integrações reais e seguras</strong>Os portais serão habilitados somente após inserir credenciais oficiais e validar publicação, atualização e remoção.</div>
  </aside></div>;
}

function PortalView() {
  return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{CHANNELS.map(channel => <div key={channel.key} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-3"><span className={`flex h-11 w-11 items-center justify-center rounded-full text-xs font-black text-white ${channel.color}`}>{channel.label.slice(0,2).toUpperCase()}</span><div><h3 className="font-black">{channel.label}</h3><p className="flex items-center gap-1 text-xs text-slate-500"><StatusDot tone={channel.key === 'site' ? 'success' : 'muted'} />{channel.key === 'site' ? 'Ativo' : 'Aguardando credenciais'}</p></div></div><button disabled={channel.key !== 'site'} className="mt-5 w-full rounded-xl border border-slate-200 py-2.5 text-xs font-black disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400">{channel.key === 'site' ? 'Conexão ativa' : 'Configurar integração'}</button></div>)}</div>;
}

function Overview({ stats, vehicles, leads, sales = [], onOpenStock, onOpenSales }) {
  const total = stats?.valorTotalEstoque || vehicles.reduce((sum, item) => sum + Number(item.preco || 0), 0);
  const totalVendido = sales.reduce((sum, s) => sum + (Number(s.valorVenda) || 0), 0);

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <div className="rounded-2xl bg-[#111315] p-6 text-white shadow-xl lg:col-span-2">
        <p className="text-xs font-bold uppercase tracking-widest text-red-400">Valor do estoque</p>
        <p className="mt-2 text-4xl font-black">{money(total)}</p>
        <p className="mt-2 text-sm text-slate-400">Visão consolidada dos veículos cadastrados e disponíveis na loja.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={onOpenStock}
            className="inline-flex items-center gap-2 rounded-xl bg-[#e50914] px-4 py-3 text-sm font-black text-white hover:bg-[#bd0710] transition shadow-lg shadow-red-950/30"
          >
            Gerenciar estoque<ChevronRight className="h-4 w-4" />
          </button>
          <button
            onClick={onOpenSales}
            className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-sm font-black text-white hover:bg-white/20 transition"
          >
            Ver Vendas Realizadas<ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <CircleDollarSign className="h-6 w-6 text-emerald-600" />
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-black text-emerald-700">Faturamento</span>
          </div>
          <p className="mt-3 text-2xl font-black text-slate-900">{money(totalVendido)}</p>
          <p className="text-xs text-slate-500">{sales.length} veículos vendidos</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <Users className="h-6 w-6 text-[#e50914]" />
            <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-black text-[#e50914]">Interesse</span>
          </div>
          <p className="mt-3 text-2xl font-black text-slate-900">{leads.length}</p>
          <p className="text-xs text-slate-500">Leads e propostas recebidos</p>
        </div>
      </div>
    </div>
  );
}

function LeadView({ leads }) {
  return <div className="grid gap-3">{leads.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-sm text-slate-500">Nenhum lead recebido até agora.</div> : leads.map(lead => <article key={lead.id} className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center"><div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 font-black text-[#e50914]">{String(lead.nome || 'L').slice(0,1)}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-black">{lead.nome}</h3><span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-black text-emerald-700">{lead.status || 'Novo'}</span></div><p className="truncate text-sm text-slate-500">{lead.veiculoNome || lead.mensagem || 'Contato geral'}</p></div>{lead.telefone && <a href={`https://wa.me/55${String(lead.telefone).replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-black text-white"><MessageCircle className="h-4 w-4" />WhatsApp</a>}</article>)}</div>;
}

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const POPULAR_OPCIONAIS = [
  'Ar-condicionado', 'Direção Elétrica', 'Airbags Frontais', 'Freios ABS',
  'Câmera de Ré', 'Sensor de Estacionamento', 'Central Multimídia',
  'Bancos de Couro', 'Rodas de Liga Leve', 'Vidros Elétricos', 'Alarme',
  'Controle de Estabilidade', 'Piloto Automático', 'Faróis de LED', 'Teto Solar'
];

function VehicleEditor({ vehicle, saving, onClose, onSave, onDelete }) {
  const [form, setForm] = useState(() => ({
    ...(vehicle || {}),
    marca: vehicle?.marca || '',
    modelo: vehicle?.modelo || '',
    versao: vehicle?.versao || '',
    anoFabricacao: vehicle?.anoFabricacao || new Date().getFullYear(),
    anoModelo: vehicle?.anoModelo || new Date().getFullYear(),
    km: vehicle?.km || 0,
    preco: vehicle?.preco || 0,
    cambio: vehicle?.cambio || 'Automático',
    combustivel: vehicle?.combustivel || 'Flex',
    cor: vehicle?.cor || 'Branco',
    carroceria: vehicle?.carroceria || 'SUV',
    portas: vehicle?.portas || 4,
    finalPlaca: vehicle?.finalPlaca || '1',
    status: vehicle?.status || 'Disponível',
    laudoCautelar: vehicle?.laudoCautelar || 'Aprovado 100%',
    fotos: Array.isArray(vehicle?.fotos) ? [...vehicle.fotos] : [],
    opcionais: Array.isArray(vehicle?.opcionais) ? [...vehicle.opcionais] : [],
    descricao: vehicle?.descricao || '',
    webmotorsSync: Boolean(vehicle?.webmotorsSync ?? true)
  }));

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [customLink, setCustomLink] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);
  const fileInputRef = React.useRef(null);

  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return;
    setUploadError('');
    setUploading(true);

    try {
      const validFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
      if (validFiles.length === 0) {
        setUploadError('Por favor, selecione apenas arquivos de imagem (JPG, PNG, WEBP).');
        setUploading(false);
        return;
      }

      // 1. Tentar upload direto via FormData (multipart)
      const formData = new FormData();
      validFiles.forEach(f => formData.append('images[]', f));

      let uploadedUrls = [];
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        if (res.ok && data.success) {
          uploadedUrls = data.urls || (data.url ? [data.url] : []);
        }
      } catch (e) {
        // multipart falhou, tentar fallback individual
      }

      // 2. Se multipart não retornou URLs, usar fallback Base64
      if (uploadedUrls.length === 0) {
        for (const file of validFiles) {
          try {
            const base64 = await readFileAsBase64(file);
            const res = await fetch('/api/upload', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ image: base64 })
            });
            const data = await res.json();
            if (data.success && data.url) {
              uploadedUrls.push(data.url);
            }
          } catch (err) {
            console.error('Falha no upload Base64:', err);
          }
        }
      }

      if (uploadedUrls.length > 0) {
        setForm(prev => ({
          ...prev,
          fotos: [...(prev.fotos || []), ...uploadedUrls]
        }));
      } else {
        setUploadError('Não foi possível enviar as imagens. Tente novamente.');
      }
    } catch (err) {
      setUploadError('Ocorreu um erro no upload. Verifique a conexão com o servidor.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const removePhoto = (index) => {
    setForm(prev => ({
      ...prev,
      fotos: prev.fotos.filter((_, i) => i !== index)
    }));
  };

  const setPrimaryPhoto = (index) => {
    setForm(prev => {
      const fotos = [...prev.fotos];
      const [chosen] = fotos.splice(index, 1);
      return { ...prev, fotos: [chosen, ...fotos] };
    });
  };

  const addLinkPhoto = () => {
    if (!customLink.trim()) return;
    setForm(prev => ({ ...prev, fotos: [...(prev.fotos || []), customLink.trim()] }));
    setCustomLink('');
  };

  const toggleOpcional = (item) => {
    setForm(prev => {
      const exists = prev.opcionais.includes(item);
      return {
        ...prev,
        opcionais: exists ? prev.opcionais.filter(x => x !== item) : [...prev.opcionais, item]
      };
    });
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/60 p-0 backdrop-blur-xs sm:items-center sm:p-4" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="max-h-[94vh] w-full max-w-4xl overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-8">
        
        {/* Cabeçalho do Modal */}
        <div className="mb-6 flex items-start justify-between border-b border-slate-100 pb-4">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-[#e50914]">Gestão de Estoque</p>
            <h2 className="mt-1 text-2xl font-black text-slate-900">{vehicle ? 'Editar Veículo' : 'Cadastrar Novo Veículo'}</h2>
            <p className="text-xs text-slate-500 mt-0.5">Preencha os dados e adicione as fotos arrastando do seu computador.</p>
          </div>
          <button onClick={onClose} className="rounded-xl border border-slate-200 p-2 hover:bg-slate-100 transition-colors">
            <X className="h-5 w-5 text-slate-600" />
          </button>
        </div>

        <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="space-y-6">
          
          {/* SEÇÃO 1: FOTOS DO VEÍCULO (DRAG & DROP) */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-[#e50914]" />
                  Fotos do Veículo ({form.fotos?.length || 0})
                </h3>
                <p className="text-xs text-slate-500">Arraste fotos aqui ou clique para selecionar. A primeira foto será a capa do anúncio.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowLinkInput(!showLinkInput)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors"
              >
                <LinkIcon className="h-3 w-3" />
                {showLinkInput ? 'Ocultar link' : 'Adicionar por link'}
              </button>
            </div>

            {/* Input por link opcional */}
            {showLinkInput && (
              <div className="mb-4 flex gap-2">
                <input
                  type="url"
                  placeholder="Cole aqui o link direto da imagem (https://...)"
                  value={customLink}
                  onChange={e => setCustomLink(e.target.value)}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-[#e50914]"
                />
                <button
                  type="button"
                  onClick={addLinkPhoto}
                  className="rounded-xl bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 text-xs font-bold transition-colors"
                >
                  Inserir Link
                </button>
              </div>
            )}

            {/* Caixa de Arrastar e Soltar (Dropzone) */}
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition-all ${
                dragActive
                  ? 'border-[#e50914] bg-red-50/50 scale-[1.01]'
                  : 'border-slate-300 bg-white hover:border-[#e50914] hover:bg-slate-50/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/png, image/jpeg, image/jpg, image/webp"
                onChange={e => handleFiles(e.target.files)}
                className="hidden"
              />

              {uploading ? (
                <div className="flex flex-col items-center justify-center py-4">
                  <Loader2 className="h-10 w-10 animate-spin text-[#e50914] mb-2" />
                  <p className="text-sm font-bold text-slate-800">Enviando fotos para o servidor...</p>
                  <p className="text-xs text-slate-500 mt-1">Isso levará apenas alguns segundos.</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-2">
                  <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-[#e50914]">
                    <UploadCloud className="h-7 w-7" />
                  </div>
                  <p className="text-sm font-bold text-slate-800">
                    <span className="text-[#e50914]">Clique para selecionar fotos</span> ou arraste e solte aqui
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Formatos aceitos: JPG, PNG, WEBP (Selecione várias fotos de uma vez)
                  </p>
                </div>
              )}
            </div>

            {uploadError && (
              <p className="mt-2 text-xs font-bold text-red-600">{uploadError}</p>
            )}

            {/* Galeria de Fotos Carregadas */}
            {form.fotos && form.fotos.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Fotos adicionadas (clique na estrela para definir como capa):
                </p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-5">
                  {form.fotos.map((foto, index) => {
                    const isCover = index === 0;
                    return (
                      <div
                        key={index}
                        className={`group relative aspect-[4/3] rounded-xl overflow-hidden border-2 bg-slate-100 shadow-sm ${
                          isCover ? 'border-[#e50914] ring-2 ring-red-100' : 'border-slate-200'
                        }`}
                      >
                        <img
                          src={foto}
                          alt={`Foto ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                        
                        {/* Badge de Capa */}
                        {isCover && (
                          <span className="absolute top-1.5 left-1.5 bg-[#e50914] text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow">
                            ★ Capa
                          </span>
                        )}

                        {/* Botões de Ação na Imagem */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                          {!isCover && (
                            <button
                              type="button"
                              onClick={() => setPrimaryPhoto(index)}
                              title="Tornar Foto Principal"
                              className="rounded-lg bg-white p-1.5 text-slate-800 hover:text-[#e50914] shadow"
                            >
                              <Star className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => removePhoto(index)}
                            title="Excluir Foto"
                            className="rounded-lg bg-red-600 p-1.5 text-white hover:bg-red-700 shadow"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* SEÇÃO 2: DADOS DO VEÍCULO */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Marca" value={form.marca} onChange={v => set('marca', v)} placeholder="Ex: Toyota, Honda, Jeep" required />
            <Field label="Modelo" value={form.modelo} onChange={v => set('modelo', v)} placeholder="Ex: Corolla, Civic, Compass" required />
            <Field label="Versão Completa" value={form.versao} onChange={v => set('versao', v)} placeholder="Ex: 2.0 XEi 16V Flex Automático" required />

            <Field label="Ano Fabricação" type="number" value={form.anoFabricacao} onChange={v => set('anoFabricacao', Number(v))} />
            <Field label="Ano Modelo" type="number" value={form.anoModelo} onChange={v => set('anoModelo', Number(v))} />
            <Field label="Quilometragem (km)" type="number" value={form.km} onChange={v => set('km', Number(v))} />

            <Field label="Preço à Vista (R$)" type="number" value={form.preco} onChange={v => set('preco', Number(v))} required />
            <Select label="Câmbio" value={form.cambio} onChange={v => set('cambio', v)} options={['Automático', 'Manual', 'CVT', 'Automatizado']} />
            <Select label="Combustível" value={form.combustivel} onChange={v => set('combustivel', v)} options={['Flex', 'Gasolina', 'Diesel', 'Híbrido', 'Elétrico']} />

            <Select label="Status no Estoque" value={form.status} onChange={v => set('status', v)} options={['Disponível', 'Reservado', 'Vendido']} />
            <Select label="Carroceria" value={form.carroceria} onChange={v => set('carroceria', v)} options={['SUV', 'Sedan', 'Hatch', 'Picape', 'Cupê', 'Minivan', 'Utilitário']} />
            <Field label="Cor do Veículo" value={form.cor} onChange={v => set('cor', v)} placeholder="Ex: Branco Pérola, Preto" />

            <Field label="Número de Portas" type="number" value={form.portas} onChange={v => set('portas', Number(v))} />
            <Field label="Final da Placa" value={form.finalPlaca} onChange={v => set('finalPlaca', v)} placeholder="Ex: 8" />
            <Field label="Laudo Cautelar" value={form.laudoCautelar} onChange={v => set('laudoCautelar', v)} placeholder="Ex: Aprovado 100%" />
          </div>

          {/* SEÇÃO 3: OPCIONAIS (CHIPS) */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <span className="mb-2 block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Opcionais e Itens de Série:
            </span>
            <div className="flex flex-wrap gap-2">
              {POPULAR_OPCIONAIS.map(op => {
                const active = form.opcionais.includes(op);
                return (
                  <button
                    key={op}
                    type="button"
                    onClick={() => toggleOpcional(op)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                      active
                        ? 'bg-[#e50914] text-white shadow-sm'
                        : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {active ? `✓ ${op}` : `+ ${op}`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SEÇÃO 4: OBSERVAÇÕES / DESCRIÇÃO */}
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Descrição do Anúncio (Histórico, Estado e Diferenciais)
            </span>
            <textarea
              rows={4}
              value={form.descricao}
              onChange={e => set('descricao', e.target.value)}
              placeholder="Descreva detalhes como laudo cautelar aprovado, revisões em concessionária, único dono, manual e chave reserva..."
              className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-[#e50914]"
            />
          </label>

          {/* BOTÕES DE FINALIZAÇÃO */}
          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
            {vehicle?.id ? (
              <button
                type="button"
                onClick={() => onDelete?.(vehicle)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-black text-red-600 hover:bg-red-600 hover:text-white transition"
              >
                <Trash2 className="h-4 w-4" />
                Excluir veículo
              </button>
            ) : <div />}
            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-black text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving || uploading}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#e50914] hover:bg-[#bd0710] px-8 py-3 text-sm font-black text-white shadow-lg shadow-red-200 disabled:opacity-60 transition-all"
              >
                {(saving || uploading) && <Loader2 className="h-4 w-4 animate-spin" />}
                {vehicle ? 'Salvar Alterações' : 'Concluir Cadastro'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', required }) { return <label><span className="mb-1.5 block text-xs font-bold text-slate-600">{label}</span><input required={required} type={type} value={value} onChange={e => onChange(e.target.value)} className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#e50914]" /></label>; }
function Select({ label, value, onChange, options }) { return <label><span className="mb-1.5 block text-xs font-bold text-slate-600">{label}</span><select value={value} onChange={e => onChange(e.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#e50914]">{options.map(option => <option key={option}>{option}</option>)}</select></label>; }
function MobileNav({ icon: Icon, label, active, onClick }) { return <button onClick={onClick} className={`flex flex-col items-center justify-center gap-1 text-[10px] font-bold ${active ? 'text-[#e50914]' : 'text-slate-500'}`}><Icon className="h-5 w-5" />{label}</button>; }
