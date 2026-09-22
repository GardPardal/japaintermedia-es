import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle, BarChart3, Bell, Car, CheckCircle2, ChevronRight, CircleDollarSign,
  ExternalLink, FileWarning, Filter, Gauge, LayoutDashboard, Link2, Loader2, LogOut,
  Menu, MessageCircle, MoreHorizontal, Pencil, Plus, RefreshCw, Search, Settings,
  ShieldCheck, Store, Users, X
} from 'lucide-react';

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
      const [vehicleRes, leadRes, statsRes] = await Promise.all([
        fetch('/api/vehicles'), fetch('/api/leads'), fetch('/api/stats')
      ]);
      const vehicleData = vehicleRes.ok ? await vehicleRes.json() : { vehicles: [] };
      const leadData = leadRes.ok ? await leadRes.json() : { leads: [] };
      const statsData = statsRes.ok ? await statsRes.json() : null;
      setVehicles(vehicleData.vehicles || []);
      setLeads(leadData.leads || []);
      setStats(statsData);
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
    if (['sales', 'reports', 'settings'].includes(key)) {
      setNotice('Este módulo está preparado no layout e será ativado quando os respectivos dados forem conectados.');
      return;
    }
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
              <div><p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-[#e50914]">JAPA Gestão</p><h1 className="text-2xl font-black tracking-tight sm:text-3xl">{tab === 'stock' ? 'Estoque de veículos' : tab === 'leads' ? 'Leads e propostas' : tab === 'portals' ? 'Canais de publicação' : 'Visão geral'}</h1><p className="mt-1 text-sm text-slate-500">{vehicles.length} veículos • {published} disponíveis no site</p></div>
              {tab === 'stock' && <button onClick={() => setEditorVehicle(null)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#e50914] px-5 py-3 text-sm font-black text-white shadow-lg shadow-red-200 hover:bg-[#bd0710]"><Plus className="h-4 w-4" />Cadastrar veículo</button>}
            </div>

            <section className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-5">
              <Metric label="Em estoque" value={stats?.totalEstoque ?? vehicles.length} icon={Car} />
              <Metric label="Publicados" value={published} icon={CheckCircle2} tone="green" />
              <Metric label="Reservados" value={reserved} icon={Gauge} tone="amber" />
              <Metric label="Leads novos" value={stats?.leadsNovos ?? 0} icon={MessageCircle} tone="blue" />
              <Metric label="Atenção" value={needsAttention} icon={AlertTriangle} tone="red" />
            </section>

            {loading ? <div className="flex min-h-[320px] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[#e50914]" /></div> : null}
            {!loading && tab === 'stock' && <StockView vehicles={filtered} query={query} setQuery={setQuery} status={status} setStatus={setStatus} onRefresh={loadData} onEdit={setEditorVehicle} onChannels={setSelectedVehicle} />}
            {!loading && tab === 'overview' && <Overview stats={stats} vehicles={vehicles} leads={leads} onOpenStock={() => setTab('stock')} />}
            {!loading && tab === 'leads' && <LeadView leads={leads} />}
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
      {editorVehicle !== undefined && <VehicleEditor vehicle={editorVehicle} saving={saving} onClose={() => setEditorVehicle(undefined)} onSave={saveVehicle} />}
    </div>
  );
}

function Metric({ label, value, icon: Icon, tone = 'slate' }) {
  const tones = { slate: 'bg-slate-100 text-slate-900', green: 'bg-emerald-50 text-emerald-600', amber: 'bg-amber-50 text-amber-600', blue: 'bg-blue-50 text-blue-600', red: 'bg-red-50 text-[#e50914]' };
  return <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl ${tones[tone]}`}><Icon className="h-4 w-4" /></div><p className="text-xs font-semibold text-slate-500">{label}</p><p className="mt-0.5 text-2xl font-black">{value}</p></div>;
}

function StockView({ vehicles, query, setQuery, status, setStatus, onRefresh, onEdit, onChannels }) {
  return <>
    <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center">
      <div className="relative flex-1"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar marca, modelo, versão ou código..." className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none focus:border-[#e50914]" /></div>
      <div className="flex gap-2"><div className="relative flex-1 sm:flex-none"><Filter className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" /><select value={status} onChange={e => setStatus(e.target.value)} className="h-10 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-9 pr-8 text-sm font-semibold outline-none"><option value="todos">Todos</option><option value="Disponível">Disponíveis</option><option value="Reservado">Reservados</option><option value="Vendido">Vendidos</option></select></div><button onClick={onRefresh} className="rounded-xl border border-slate-200 p-2.5 hover:bg-slate-50" title="Atualizar"><RefreshCw className="h-4 w-4" /></button></div>
    </div>
    {vehicles.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center"><Car className="mx-auto mb-3 h-8 w-8 text-slate-300" /><h3 className="font-black">Nenhum veículo encontrado</h3><p className="mt-1 text-sm text-slate-500">Altere os filtros ou cadastre um novo veículo.</p></div> : <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{vehicles.map(vehicle => <AdminVehicleCard key={vehicle.id} vehicle={vehicle} onEdit={() => onEdit(vehicle)} onChannels={() => onChannels(vehicle)} />)}</div>}
  </>;
}

function AdminVehicleCard({ vehicle, onEdit, onChannels }) {
  const state = String(vehicle.status || 'Disponível');
  const statusClass = state === 'Disponível' ? 'bg-emerald-50 text-emerald-700' : state === 'Reservado' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600';
  const photo = vehicle.fotos?.[0] || '/veiculo-sedan.webp';
  return <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl">
    <div className="relative aspect-[16/10] overflow-hidden bg-slate-100"><img src={photo} alt={`${vehicle.marca} ${vehicle.modelo}`} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" /><span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-[11px] font-black shadow-sm ${statusClass}`}><StatusDot tone={state === 'Disponível' ? 'success' : state === 'Reservado' ? 'warning' : 'muted'} /> <span className="ml-1">{state}</span></span><button onClick={onEdit} className="absolute right-3 top-3 rounded-xl bg-white/95 p-2 text-slate-700 shadow"><Pencil className="h-4 w-4" /></button></div>
    <div className="p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="truncate text-base font-black">{vehicle.marca} {vehicle.modelo}</h3><p className="truncate text-xs text-slate-500">{vehicle.versao}</p></div><strong className="whitespace-nowrap text-base font-black">{money(vehicle.preco)}</strong></div>
      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs font-semibold text-slate-500"><span>{vehicle.anoFabricacao}/{vehicle.anoModelo}</span><span>{Number(vehicle.km || 0).toLocaleString('pt-BR')} km</span><span>{vehicle.cambio}</span></div>
      <div className="mt-4 flex flex-wrap gap-1.5">{CHANNELS.slice(0, 5).map(channel => { const c = channelState(vehicle, channel.key); return <span key={channel.key} className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2 py-1 text-[10px] font-bold text-slate-600"><StatusDot tone={c.tone} />{channel.label}</span>; })}</div>
      <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3"><button onClick={onEdit} className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-2.5 text-xs font-black hover:bg-slate-50"><Pencil className="h-3.5 w-3.5" />Editar</button><button onClick={onChannels} className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#e50914] py-2.5 text-xs font-black text-white hover:bg-[#bd0710]"><ExternalLink className="h-3.5 w-3.5" />Publicar</button></div>
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

function Overview({ stats, vehicles, leads, onOpenStock }) {
  const total = stats?.valorTotalEstoque || vehicles.reduce((sum, item) => sum + Number(item.preco || 0), 0);
  return <div className="grid gap-5 lg:grid-cols-3"><div className="rounded-2xl bg-[#111315] p-6 text-white shadow-xl lg:col-span-2"><p className="text-xs font-bold uppercase tracking-widest text-red-400">Valor do estoque</p><p className="mt-2 text-4xl font-black">{money(total)}</p><p className="mt-2 text-sm text-slate-400">Visão consolidada dos veículos cadastrados.</p><button onClick={onOpenStock} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#e50914] px-4 py-3 text-sm font-black">Gerenciar estoque<ChevronRight className="h-4 w-4" /></button></div><div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><Users className="h-6 w-6 text-[#e50914]" /><p className="mt-5 text-3xl font-black">{leads.length}</p><p className="text-sm text-slate-500">Leads recebidos</p></div></div>;
}

function LeadView({ leads }) {
  return <div className="grid gap-3">{leads.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-sm text-slate-500">Nenhum lead recebido até agora.</div> : leads.map(lead => <article key={lead.id} className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center"><div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 font-black text-[#e50914]">{String(lead.nome || 'L').slice(0,1)}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-black">{lead.nome}</h3><span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-black text-emerald-700">{lead.status || 'Novo'}</span></div><p className="truncate text-sm text-slate-500">{lead.veiculoNome || lead.mensagem || 'Contato geral'}</p></div>{lead.telefone && <a href={`https://wa.me/55${String(lead.telefone).replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-black text-white"><MessageCircle className="h-4 w-4" />WhatsApp</a>}</article>)}</div>;
}

function VehicleEditor({ vehicle, saving, onClose, onSave }) {
  const [form, setForm] = useState(() => ({
    ...(vehicle || {}), marca: vehicle?.marca || '', modelo: vehicle?.modelo || '', versao: vehicle?.versao || '',
    anoFabricacao: vehicle?.anoFabricacao || new Date().getFullYear(), anoModelo: vehicle?.anoModelo || new Date().getFullYear(),
    km: vehicle?.km || 0, preco: vehicle?.preco || 0, cambio: vehicle?.cambio || 'Automático', combustivel: vehicle?.combustivel || 'Flex',
    status: vehicle?.status || 'Disponível', fotos: vehicle?.fotos || ['/veiculo-sedan.webp'], descricao: vehicle?.descricao || '',
    webmotorsSync: Boolean(vehicle?.webmotorsSync)
  }));
  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }));
  return <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/55 p-0 sm:items-center sm:p-4" onClick={onClose}><div onClick={e => e.stopPropagation()} className="max-h-[94vh] w-full max-w-3xl overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-7"><div className="mb-6 flex items-start justify-between"><div><p className="text-xs font-black uppercase tracking-widest text-[#e50914]">Estoque</p><h2 className="mt-1 text-2xl font-black">{vehicle ? 'Editar veículo' : 'Cadastrar veículo'}</h2></div><button onClick={onClose} className="rounded-xl border border-slate-200 p-2"><X className="h-4 w-4" /></button></div><form onSubmit={e => { e.preventDefault(); onSave(form); }} className="grid gap-4 sm:grid-cols-2">
    <Field label="Marca" value={form.marca} onChange={v => set('marca', v)} required /><Field label="Modelo" value={form.modelo} onChange={v => set('modelo', v)} required /><div className="sm:col-span-2"><Field label="Versão completa" value={form.versao} onChange={v => set('versao', v)} required /></div><Field label="Ano fabricação" type="number" value={form.anoFabricacao} onChange={v => set('anoFabricacao', Number(v))} /><Field label="Ano modelo" type="number" value={form.anoModelo} onChange={v => set('anoModelo', Number(v))} /><Field label="Quilometragem" type="number" value={form.km} onChange={v => set('km', Number(v))} /><Field label="Preço" type="number" value={form.preco} onChange={v => set('preco', Number(v))} />
    <Select label="Câmbio" value={form.cambio} onChange={v => set('cambio', v)} options={['Automático','Manual','CVT','Automatizado']} /><Select label="Combustível" value={form.combustivel} onChange={v => set('combustivel', v)} options={['Flex','Gasolina','Diesel','Híbrido','Elétrico']} /><Select label="Status" value={form.status} onChange={v => set('status', v)} options={['Disponível','Reservado','Vendido']} /><Field label="URL da foto principal" value={form.fotos?.[0] || ''} onChange={v => set('fotos', [v, ...(form.fotos || []).slice(1)])} />
    <label className="sm:col-span-2"><span className="mb-1.5 block text-xs font-bold text-slate-600">Descrição</span><textarea rows={4} value={form.descricao} onChange={e => set('descricao', e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#e50914]" /></label><div className="sm:col-span-2 flex flex-col-reverse gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end"><button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-black">Cancelar</button><button disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#e50914] px-6 py-3 text-sm font-black text-white disabled:opacity-60">{saving && <Loader2 className="h-4 w-4 animate-spin" />}{vehicle ? 'Salvar alterações' : 'Cadastrar veículo'}</button></div>
  </form></div></div>;
}

function Field({ label, value, onChange, type = 'text', required }) { return <label><span className="mb-1.5 block text-xs font-bold text-slate-600">{label}</span><input required={required} type={type} value={value} onChange={e => onChange(e.target.value)} className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#e50914]" /></label>; }
function Select({ label, value, onChange, options }) { return <label><span className="mb-1.5 block text-xs font-bold text-slate-600">{label}</span><select value={value} onChange={e => onChange(e.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#e50914]">{options.map(option => <option key={option}>{option}</option>)}</select></label>; }
function MobileNav({ icon: Icon, label, active, onClick }) { return <button onClick={onClick} className={`flex flex-col items-center justify-center gap-1 text-[10px] font-bold ${active ? 'text-[#e50914]' : 'text-slate-500'}`}><Icon className="h-5 w-5" />{label}</button>; }
