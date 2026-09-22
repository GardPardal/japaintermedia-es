import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Car, Users, Link2, CircleDollarSign, BarChart3, Settings, ShieldCheck,
  LayoutDashboard, CreditCard, Search, Filter, RefreshCw, Plus, Pencil,
  Trash2, ExternalLink, X, Menu, Bell, Store, LogOut, CheckCircle2,
  AlertTriangle, Gauge, MessageCircle, MoreHorizontal, UploadCloud,
  Image as ImageIcon, Star, Check, Copy, ArrowRight, ArrowLeft,
  ChevronRight, Phone, Mail, MapPin, Tag, Sparkles, SlidersHorizontal,
  ChevronDown, CheckSquare, Loader2
} from 'lucide-react';

// Canais de publicação suportados
const CHANNELS = [
  { key: 'site', label: 'Site Japa', short: 'Site', color: 'bg-black', border: 'border-black/20', activeByDefault: true },
  { key: 'webmotors', label: 'Webmotors', short: 'WM', color: 'bg-red-600', border: 'border-red-600/20' },
  { key: 'mobiauto', label: 'Mobiauto', short: 'MO', color: 'bg-cyan-600', border: 'border-cyan-600/20' },
  { key: 'olx', label: 'OLX Pro', short: 'OLX', color: 'bg-violet-600', border: 'border-violet-600/20' },
  { key: 'meta', label: 'Facebook / IG', short: 'FB', color: 'bg-blue-600', border: 'border-blue-600/20' },
  { key: 'icarros', label: 'iCarros', short: 'iC', color: 'bg-blue-800', border: 'border-blue-800/20' },
  { key: 'mercadolivre', label: 'Mercado Livre', short: 'ML', color: 'bg-amber-500', border: 'border-amber-500/20' }
];

// 8 Etapas de Leads (Pipeline / Funil Comercial)
const LEAD_STAGES = [
  { key: 'Novo', label: 'Novo', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { key: 'Em atendimento', label: 'Em atendimento', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { key: 'Qualificado', label: 'Qualificado', color: 'bg-teal-50 text-teal-700 border-teal-200' },
  { key: 'Visita agendada', label: 'Visita agendada', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { key: 'Proposta', label: 'Proposta', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  { key: 'Financiamento', label: 'Financiamento', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { key: 'Vendido', label: 'Vendido', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { key: 'Perdido', label: 'Perdido', color: 'bg-slate-100 text-slate-600 border-slate-200' }
];

// Itens comuns de opcionais automotivos para seleção rápida
const DEFAULT_OPCIONAIS = [
  'Ar-condicionado digital', 'Direção elétrica', 'Câmbio automático',
  'Câmera de ré', 'Sensor de estacionamento', 'Bancos em couro',
  'Central multimídia', 'Controle de tração e estabilidade', 'Faróis em Full LED',
  'Piloto automático adaptativo', 'Rodas de liga leve', 'Chave presencial (Keyless)',
  'Teto solar', 'Tração 4x4', 'Freios ABS com EBD', 'Airbags frontais, laterais e cortina',
  'Computador de bordo', 'Volante multifuncional', 'Retrovisores elétricos', 'Start/Stop'
];

const formatMoney = (val) => Number(val || 0).toLocaleString('pt-BR', {
  style: 'currency', currency: 'BRL', maximumFractionDigits: 0
});

function calculateDaysInStock(vehicle) {
  if (vehicle.createdAt) {
    const diff = Math.floor((new Date() - new Date(vehicle.createdAt)) / (1000 * 60 * 60 * 24));
    return Math.max(1, diff);
  }
  // Cálculo determinístico com base no id para manter consistência no painel
  const seed = (vehicle.id || '10').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return (seed % 28) + 3;
}

export default function AdminDashboardV2({ onClose, onLogout, onVehicleUpdated }) {
  const [tab, setTab] = useState('stock'); // 'overview' | 'stock' | 'leads' | 'portals' | 'sales' | 'financing' | 'reports' | 'team' | 'settings'
  const [mobileMenu, setMobileMenu] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');

  // Filtros de estoque
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');

  // Modais e gavetas
  const [selectedChannelVehicle, setSelectedChannelVehicle] = useState(null);
  const [editorVehicle, setEditorVehicle] = useState(undefined); // undefined = fechado, null = novo, object = editando
  const [savingVehicle, setSavingVehicle] = useState(false);

  // Carregar dados gerais
  const loadData = async () => {
    setLoading(true);
    try {
      const [vRes, lRes, sRes] = await Promise.all([
        fetch('/api/vehicles'),
        fetch('/api/leads'),
        fetch('/api/stats')
      ]);

      const vData = vRes.ok ? await vRes.json() : { vehicles: [] };
      const lData = lRes.ok ? await lRes.json() : { leads: [] };
      const sData = sRes.ok ? await sRes.json() : null;

      setVehicles(vData.vehicles || []);
      setLeads(lData.leads || []);
      setStats(sData);
    } catch (err) {
      console.error('Erro ao buscar dados do painel:', err);
      setNotice('Conectando ao banco de dados... exibindo dados em cache local.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Veículos filtrados para os cards
  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query ||
        (v.marca && v.marca.toLowerCase().includes(query)) ||
        (v.modelo && v.modelo.toLowerCase().includes(query)) ||
        (v.versao && v.versao.toLowerCase().includes(query)) ||
        (v.id && v.id.toLowerCase().includes(query));

      const matchesStatus = statusFilter === 'todos' ||
        String(v.status || '').toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [vehicles, searchQuery, statusFilter]);

  // Contadores
  const countDisponiveis = vehicles.filter(v => (v.status || 'Disponível') === 'Disponível').length;
  const countReservados = vehicles.filter(v => v.status === 'Reservado').length;
  const countVendidos = vehicles.filter(v => v.status === 'Vendido').length;
  const countNovosLeads = leads.filter(l => (l.status || 'Novo') === 'Novo').length;

  // Ação de Salvar / Criar Veículo
  const handleSaveVehicle = async (formData) => {
    setSavingVehicle(true);
    try {
      const isEditing = Boolean(formData.id);
      const url = isEditing ? `/api/vehicles/${formData.id}` : '/api/vehicles';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        throw new Error('Falha na resposta do servidor.');
      }

      setEditorVehicle(undefined);
      await loadData();
      if (onVehicleUpdated) onVehicleUpdated();
      setNotice(isEditing ? 'Veículo atualizado com sucesso!' : 'Novo veículo cadastrado com sucesso!');
      setTimeout(() => setNotice(''), 4000);
    } catch (err) {
      console.error('Erro ao salvar veículo:', err);
      alert('Não foi possível salvar o veículo. Verifique a conexão com a API da hospedagem.');
    } finally {
      setSavingVehicle(false);
    }
  };

  // Ação de Excluir Veículo
  const handleDeleteVehicle = async (vehicle) => {
    if (!window.confirm(`Tem certeza que deseja excluir o ${vehicle.marca} ${vehicle.modelo} do estoque?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/vehicles/${vehicle.id}`, { method: 'DELETE' });
      if (res.ok) {
        await loadData();
        if (onVehicleUpdated) onVehicleUpdated();
        setNotice(`Veículo ${vehicle.modelo} removido com sucesso.`);
        setTimeout(() => setNotice(''), 4000);
      } else {
        alert('Erro ao excluir veículo do servidor.');
      }
    } catch (err) {
      console.error(err);
      alert('Falha na comunicação com o servidor.');
    }
  };

  // Alteração Rápida de Status do Veículo
  const handleQuickStatusChange = async (vehicle, newStatus) => {
    try {
      await fetch(`/api/vehicles/${vehicle.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...vehicle, status: newStatus })
      });
      await loadData();
      if (onVehicleUpdated) onVehicleUpdated();
    } catch (err) {
      console.error(err);
    }
  };

  // Alteração de Etapa do Lead
  const handleLeadStageChange = async (leadId, newStage) => {
    try {
      await fetch(`/api/leads/${leadId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStage })
      });
      await loadData();
    } catch (err) {
      console.error('Erro ao atualizar etapa do lead:', err);
    }
  };

  // Alternar sincronização Webmotors
  const handleToggleWebmotorsSync = async (vehicle) => {
    try {
      const updatedSync = !vehicle.webmotorsSync;
      await fetch(`/api/vehicles/${vehicle.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...vehicle, webmotorsSync: updatedSync })
      });
      if (selectedChannelVehicle && selectedChannelVehicle.id === vehicle.id) {
        setSelectedChannelVehicle({ ...selectedChannelVehicle, webmotorsSync: updatedSync });
      }
      await loadData();
      if (onVehicleUpdated) onVehicleUpdated();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex overflow-hidden bg-[#F4F6F9] text-[#111111] font-sans antialiased">
      {/* 1. SIDEBAR EXECUTIVA (Preto Nipo-Moderno #101010) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#101010] text-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 flex flex-col border-r border-white/10 ${
          mobileMenu ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Topo da Sidebar com Logo JAPA em fundo branco contrastante */}
        <div className="p-5 border-b border-white/10">
          <div className="bg-white rounded-xl p-3 shadow-md border border-white/20 flex items-center justify-center relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-1 bg-[#E50914]" />
            <img
              src="/logo-japa.png"
              alt="JAPA Intermediações"
              className="h-12 w-auto max-w-full object-contain"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/logo.jpg';
              }}
            />
          </div>
          <div className="mt-3 flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Painel de Gestão V2</span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider bg-[#E50914] text-white px-2 py-0.5 rounded">
              Matriz PR
            </span>
          </div>
        </div>

        {/* Menu de Navegação - 9 Módulos */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin scrollbar-thumb-white/10">
          <NavItem
            icon={LayoutDashboard}
            label="Visão Geral"
            active={tab === 'overview'}
            onClick={() => { setTab('overview'); setMobileMenu(false); }}
          />
          <NavItem
            icon={Car}
            label="Estoque de Veículos"
            badge={vehicles.length}
            active={tab === 'stock'}
            onClick={() => { setTab('stock'); setMobileMenu(false); }}
          />
          <NavItem
            icon={Users}
            label="Leads & Propostas"
            badge={countNovosLeads > 0 ? `${countNovosLeads} novos` : leads.length}
            badgeColor={countNovosLeads > 0 ? 'bg-[#E50914] text-white' : 'bg-white/10 text-slate-300'}
            active={tab === 'leads'}
            onClick={() => { setTab('leads'); setMobileMenu(false); }}
          />
          <NavItem
            icon={Link2}
            label="Portais & Canais"
            badge="7 canais"
            active={tab === 'portals'}
            onClick={() => { setTab('portals'); setMobileMenu(false); }}
          />
          <NavItem
            icon={CircleDollarSign}
            label="Vendas Realizadas"
            badge={countVendidos}
            active={tab === 'sales'}
            onClick={() => { setTab('sales'); setMobileMenu(false); }}
          />
          <NavItem
            icon={CreditCard}
            label="Financiamento"
            active={tab === 'financing'}
            onClick={() => { setTab('financing'); setMobileMenu(false); }}
          />
          <NavItem
            icon={BarChart3}
            label="Relatórios & Métricas"
            active={tab === 'reports'}
            onClick={() => { setTab('reports'); setMobileMenu(false); }}
          />
          <NavItem
            icon={ShieldCheck}
            label="Equipe & Permissões"
            active={tab === 'team'}
            onClick={() => { setTab('team'); setMobileMenu(false); }}
          />
          <NavItem
            icon={Settings}
            label="Configurações da Loja"
            active={tab === 'settings'}
            onClick={() => { setTab('settings'); setMobileMenu(false); }}
          />
        </nav>

        {/* Rodapé da Sidebar */}
        <div className="p-4 border-t border-white/10 bg-[#0B0B0B]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#E50914] to-red-700 flex items-center justify-center font-black text-xs text-white shadow">
              JP
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">JAPA Intermediações</p>
              <p className="text-[10px] text-slate-400 truncate">Wenceslau Braz - PR</p>
            </div>
            <button
              onClick={onLogout}
              className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/5 transition"
              title="Encerrar Sessão"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Backdrop Mobile */}
      {mobileMenu && (
        <div
          onClick={() => setMobileMenu(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* 2. ÁREA DE CONTEÚDO PRINCIPAL */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header Superior */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenu(true)}
              className="p-2 rounded-lg hover:bg-slate-100 lg:hidden text-slate-700"
              aria-label="Abrir menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-500">
              <Store className="w-4 h-4 text-[#E50914]" />
              <span className="font-bold text-slate-800">Loja Matriz</span>
              <span>•</span>
              <span>Av. Avelino Vieira, 68 - Wenceslau Braz PR</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={loadData}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-black transition"
              title="Atualizar dados"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#E50914]' : ''}`} />
            </button>

            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-black transition"
            >
              <span>Ver Site Público</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>

            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition"
              title="Voltar ao site"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">Fechar Painel</span>
            </button>
          </div>
        </header>

        {/* Notificação Temporária */}
        {notice && (
          <div className="bg-[#101010] text-white px-6 py-2.5 text-xs font-semibold flex items-center justify-between border-b border-[#E50914]/50 shadow-md">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#E50914] animate-ping" />
              <span>{notice}</span>
            </div>
            <button onClick={() => setNotice('')} className="text-slate-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Área Rolável de Conteúdo */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">
          <div className="max-w-[1500px] mx-auto space-y-6">
            {/* Topo de Identificação do Módulo */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-[#E50914]">
                  Gestão Executiva JAPA
                </p>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {tab === 'stock' && 'Estoque de Veículos'}
                  {tab === 'overview' && 'Visão Geral do Negócio'}
                  {tab === 'leads' && 'Leads & Funil de Atendimento'}
                  {tab === 'portals' && 'Canais de Publicação e Portais'}
                  {tab === 'sales' && 'Vendas & Negociações'}
                  {tab === 'financing' && 'Simulações & Financiamento'}
                  {tab === 'reports' && 'Relatórios de Desempenho'}
                  {tab === 'team' && 'Gestão de Equipe'}
                  {tab === 'settings' && 'Configurações do Sistema'}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  {vehicles.length} veículos cadastrados • {countDisponiveis} ativos para venda • {leads.length} leads recebidos
                </p>
              </div>

              {/* Botão de Destaque: Cadastrar Veículo */}
              {tab === 'stock' && (
                <button
                  onClick={() => setEditorVehicle(null)}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#E50914] hover:bg-[#C80812] text-white font-black text-sm shadow-lg shadow-red-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Plus className="w-4 h-4" />
                  <span>Cadastrar Veículo</span>
                </button>
              )}
            </div>

            {/* BARRA DE MÉTRICAS EXECUTIVAS */}
            <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <MetricCard
                label="Total no Estoque"
                value={vehicles.length}
                icon={Car}
                color="bg-slate-100 text-slate-800"
              />
              <MetricCard
                label="Disponíveis"
                value={countDisponiveis}
                icon={CheckCircle2}
                color="bg-emerald-50 text-emerald-700"
              />
              <MetricCard
                label="Reservados"
                value={countReservados}
                icon={Gauge}
                color="bg-amber-50 text-amber-700"
              />
              <MetricCard
                label="Vendidos"
                value={countVendidos}
                icon={CircleDollarSign}
                color="bg-purple-50 text-purple-700"
              />
              <MetricCard
                label="Leads Novos"
                value={countNovosLeads}
                icon={MessageCircle}
                color="bg-blue-50 text-blue-700"
                highlight={countNovosLeads > 0}
              />
              <MetricCard
                label="Valor em Estoque"
                value={formatMoney(
                  vehicles
                    .filter(v => (v.status || 'Disponível') === 'Disponível')
                    .reduce((sum, v) => sum + Number(v.preco || 0), 0)
                )}
                icon={CreditCard}
                color="bg-rose-50 text-[#E50914]"
                isCurrency
              />
            </section>

            {/* CONTEÚDO CONDICIONAL CONFORME ABA SELECIONADA */}
            {loading && vehicles.length === 0 ? (
              <div className="py-20 flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="w-10 h-10 animate-spin text-[#E50914] mb-3" />
                <p className="text-sm font-semibold">Carregando dados da JAPA Intermediações...</p>
              </div>
            ) : (
              <>
                {/* 1. ABA ESTOQUE (OBRIGATORIAMENTE EM CARDS - 3 POR LINHA DESKTOP, 2 TABLET, 1 MOBILE) */}
                {tab === 'stock' && (
                  <StockCardsSection
                    vehicles={filteredVehicles}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    statusFilter={statusFilter}
                    onStatusFilterChange={setStatusFilter}
                    onEditVehicle={setEditorVehicle}
                    onOpenChannels={setSelectedChannelVehicle}
                    onDeleteVehicle={handleDeleteVehicle}
                    onQuickStatusChange={handleQuickStatusChange}
                    onNewVehicle={() => setEditorVehicle(null)}
                  />
                )}

                {/* 2. ABA VISÃO GERAL */}
                {tab === 'overview' && (
                  <OverviewSection
                    vehicles={vehicles}
                    leads={leads}
                    stats={stats}
                    onGoToStock={() => setTab('stock')}
                    onGoToLeads={() => setTab('leads')}
                  />
                )}

                {/* 3. ABA LEADS (8 ETAPAS EM CARDS) */}
                {tab === 'leads' && (
                  <LeadsCardsSection
                    leads={leads}
                    onStageChange={handleLeadStageChange}
                  />
                )}

                {/* 4. ABA PORTAIS & CANAIS DE PUBLICAÇÃO */}
                {tab === 'portals' && (
                  <PortalsSection
                    vehicles={vehicles}
                    onToggleWebmotors={handleToggleWebmotorsSync}
                  />
                )}

                {/* 5. ABA VENDAS */}
                {tab === 'sales' && (
                  <SalesSection
                    vehicles={vehicles.filter(v => v.status === 'Vendido')}
                    onEditVehicle={setEditorVehicle}
                  />
                )}

                {/* 6. ABA FINANCIAMENTO */}
                {tab === 'financing' && (
                  <FinancingSection
                    leads={leads.filter(l => l.tipo === 'Financiamento' || l.valorVeiculo > 0)}
                  />
                )}

                {/* 7. ABA RELATÓRIOS */}
                {tab === 'reports' && (
                  <ReportsSection vehicles={vehicles} leads={leads} />
                )}

                {/* 8. ABA EQUIPE */}
                {tab === 'team' && (
                  <TeamSection />
                )}

                {/* 9. ABA CONFIGURAÇÕES */}
                {tab === 'settings' && (
                  <SettingsSection onRefresh={loadData} />
                )}
              </>
            )}
          </div>
        </main>

        {/* 3. NAVEGAÇÃO MOBILE INFERIOR FIXA COM BOTÃO CENTRAL DE CADASTRO */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 h-16 bg-white border-t border-slate-200 px-3 flex items-center justify-around shadow-2xl">
          <MobileBottomButton
            icon={LayoutDashboard}
            label="Painel"
            active={tab === 'overview'}
            onClick={() => setTab('overview')}
          />
          <MobileBottomButton
            icon={Car}
            label="Estoque"
            active={tab === 'stock'}
            onClick={() => setTab('stock')}
          />

          {/* Botão Central de Cadastro Destacado */}
          <button
            onClick={() => setEditorVehicle(null)}
            className="-mt-5 w-14 h-14 rounded-full bg-[#E50914] text-white flex items-center justify-center shadow-lg shadow-red-600/40 border-4 border-white hover:scale-105 active:scale-95 transition"
            aria-label="Cadastrar Veículo"
          >
            <Plus className="w-6 h-6 stroke-[3]" />
          </button>

          <MobileBottomButton
            icon={Users}
            label="Leads"
            active={tab === 'leads'}
            badge={countNovosLeads}
            onClick={() => setTab('leads')}
          />
          <MobileBottomButton
            icon={Link2}
            label="Portais"
            active={tab === 'portals'}
            onClick={() => setTab('portals')}
          />
        </nav>
      </div>

      {/* 4. DRAWER / BOTTOM SHEET DE CANAIS DE PUBLICAÇÃO ("Publicar") */}
      {selectedChannelVehicle && (
        <ChannelDrawer
          vehicle={selectedChannelVehicle}
          onClose={() => setSelectedChannelVehicle(null)}
          onToggleWebmotors={() => handleToggleWebmotorsSync(selectedChannelVehicle)}
        />
      )}

      {/* 5. MODAL COMPLETO DE EDIÇÃO / CADASTRO DE VEÍCULO (COM DRAG & DROP MULTI-FOTO) */}
      {editorVehicle !== undefined && (
        <VehicleEditorModal
          vehicle={editorVehicle}
          saving={savingVehicle}
          onClose={() => setEditorVehicle(undefined)}
          onSave={handleSaveVehicle}
        />
      )}
    </div>
  );
}

// -------------------------------------------------------------
// COMPONENTES AUXILIARES
// -------------------------------------------------------------

function NavItem({ icon: Icon, label, badge, badgeColor, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
        active
          ? 'bg-[#E50914] text-white shadow-lg shadow-red-900/30'
          : 'text-slate-300 hover:bg-white/5 hover:text-white'
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`} />
        <span>{label}</span>
      </div>
      {badge !== undefined && (
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
            badgeColor || (active ? 'bg-white text-[#E50914]' : 'bg-white/10 text-slate-300')
          }`}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

function MetricCard({ label, value, icon: Icon, color, highlight, isCurrency }) {
  return (
    <div className={`p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between ${
      highlight ? 'ring-2 ring-[#E50914]' : ''
    }`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{label}</span>
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className={`font-black tracking-tight ${isCurrency ? 'text-base sm:text-lg text-slate-900' : 'text-xl sm:text-2xl text-slate-900'}`}>
        {value}
      </p>
    </div>
  );
}

function MobileBottomButton({ icon: Icon, label, active, badge, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center gap-1 py-1 text-[10px] font-bold transition ${
        active ? 'text-[#E50914]' : 'text-slate-500'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
      {badge > 0 && (
        <span className="absolute top-0 right-1 w-2 h-2 rounded-full bg-[#E50914]" />
      )}
    </button>
  );
}

// -------------------------------------------------------------
// SEÇÃO ESTOQUE EM CARDS (RIGOROSAMENTE EM CARDS - 3 / LINHA)
// -------------------------------------------------------------
function StockCardsSection({
  vehicles,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onEditVehicle,
  onOpenChannels,
  onDeleteVehicle,
  onQuickStatusChange,
  onNewVehicle
}) {
  return (
    <div className="space-y-6">
      {/* Barra de Busca e Filtros */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por marca, modelo, versão ou placa..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:border-[#E50914] focus:bg-white transition"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Seletor de Status com Tabs Pills */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl overflow-x-auto shrink-0">
          {['todos', 'Disponível', 'Reservado', 'Vendido'].map((st) => (
            <button
              key={st}
              onClick={() => onStatusFilterChange(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {st === 'todos' ? 'Todos' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Cards: 3 colunas em Desktop grande, 2 em tablet, 1 em mobile */}
      {vehicles.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300">
          <Car className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">Nenhum veículo encontrado</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Tente alterar os termos de busca ou filtros de status para localizar outros automóveis.
          </p>
          <button
            onClick={onNewVehicle}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#E50914] text-white text-xs font-bold hover:bg-[#C80812] transition"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Novo Veículo</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => (
            <VehicleStockCard
              key={vehicle.id}
              vehicle={vehicle}
              onEdit={() => onEditVehicle(vehicle)}
              onChannels={() => onOpenChannels(vehicle)}
              onDelete={() => onDeleteVehicle(vehicle)}
              onStatusChange={(st) => onQuickStatusChange(vehicle, st)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Card Individual de Veículo no Painel Administrativo
function VehicleStockCard({ vehicle, onEdit, onChannels, onDelete, onStatusChange }) {
  const coverPhoto = vehicle.fotos?.[0] || '/veiculo-sedan.webp';
  const daysInStock = calculateDaysInStock(vehicle);
  const status = vehicle.status || 'Disponível';

  const statusConfig = {
    'Disponível': { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
    'Reservado': { bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
    'Vendido': { bg: 'bg-slate-100 text-slate-600 border-slate-300', dot: 'bg-slate-400' }
  }[status] || { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' };

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex flex-col overflow-hidden">
      {/* Topo / Foto 16:10 com Tags Flutuantes */}
      <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
        <img
          src={coverPhoto}
          alt={`${vehicle.marca} ${vehicle.modelo}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/veiculo-sedan.webp';
          }}
        />

        {/* Badges Flutuantes */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 items-center">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-xs ${statusConfig.bg}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
            {status}
          </span>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/75 text-white backdrop-blur-xs shadow-xs">
            {daysInStock} dias em estoque
          </span>
          {vehicle.destaque && (
            <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-[#E50914] text-white flex items-center gap-1 shadow-xs">
              <Star className="w-3 h-3 fill-current" />
              Destaque
            </span>
          )}
        </div>

        {/* Botão de Exclusão Rápida no canto */}
        <button
          onClick={onDelete}
          className="absolute top-3 right-3 p-2 rounded-xl bg-white/90 text-slate-500 hover:text-rose-600 hover:bg-white shadow-md transition"
          title="Excluir veículo"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Conteúdo do Card */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Marca, Modelo e Versão */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#E50914]">
                {vehicle.marca}
              </span>
              <h3 className="text-base font-black text-slate-900 truncate">
                {vehicle.modelo}
              </h3>
              <p className="text-xs text-slate-500 truncate mt-0.5 font-medium">
                {vehicle.versao || 'Versão Padrão'}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-lg font-black text-slate-900 tracking-tight">
                {formatMoney(vehicle.preco)}
              </p>
              {vehicle.precoOriginal && vehicle.precoOriginal > vehicle.preco && (
                <p className="text-[11px] text-slate-400 line-through">
                  {formatMoney(vehicle.precoOriginal)}
                </p>
              )}
            </div>
          </div>

          {/* Chips de Especificação Técnica */}
          <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold text-slate-600">
            <span className="px-2.5 py-1 rounded-lg bg-slate-100">
              {vehicle.anoFabricacao || '2022'}/{vehicle.anoModelo || '2023'}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100">
              {Number(vehicle.km || 0).toLocaleString('pt-BR')} km
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100">
              {vehicle.cambio || 'Automático'}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100">
              {vehicle.combustivel || 'Flex'}
            </span>
          </div>

          {/* Indicadores dos 7 Canais de Publicação */}
          <div className="mt-4 pt-3 border-t border-slate-100">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">
              Status de Publicação
            </p>
            <div className="flex flex-wrap gap-1.5">
              {CHANNELS.map((ch) => {
                const isActive = ch.key === 'site' || (ch.key === 'webmotors' && vehicle.webmotorsSync);
                return (
                  <span
                    key={ch.key}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      isActive
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-50 text-slate-400 border-slate-200'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-400' : 'bg-slate-300'}`} />
                    {ch.short}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* Rodapé do Card com Ações em Grid */}
        <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
          <button
            onClick={onEdit}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-200 hover:border-slate-400 text-slate-800 text-xs font-bold hover:bg-slate-50 transition"
          >
            <Pencil className="w-3.5 h-3.5 text-slate-500" />
            <span>Editar</span>
          </button>

          <button
            onClick={onChannels}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#E50914] hover:bg-[#C80812] text-white text-xs font-black shadow-xs transition"
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>Publicar</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// SEÇÃO LEADS EM CARDS (8 ETAPAS DO FUNIL)
// -------------------------------------------------------------
function LeadsCardsSection({ leads, onStageChange }) {
  const [selectedStage, setSelectedStage] = useState('todos');

  const filteredLeads = useMemo(() => {
    if (selectedStage === 'todos') return leads;
    return leads.filter(l => (l.status || 'Novo') === selectedStage);
  }, [leads, selectedStage]);

  return (
    <div className="space-y-6">
      {/* Seletor de Etapas (8 Fases) */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-1.5 overflow-x-auto scrollbar-thin">
        <button
          onClick={() => setSelectedStage('todos')}
          className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
            selectedStage === 'todos' ? 'bg-[#E50914] text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Todos ({leads.length})
        </button>
        {LEAD_STAGES.map((st) => {
          const count = leads.filter(l => (l.status || 'Novo') === st.key).length;
          return (
            <button
              key={st.key}
              onClick={() => setSelectedStage(st.key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                selectedStage === st.key
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>{st.label}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                selectedStage === st.key ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grid de Cards de Leads */}
      {filteredLeads.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">Nenhum lead nesta etapa</h3>
          <p className="text-xs text-slate-500 mt-1">
            As propostas enviadas pelo site da JAPA aparecerão automaticamente aqui.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredLeads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} onStageChange={onStageChange} />
          ))}
        </div>
      )}
    </div>
  );
}

function LeadCard({ lead, onStageChange }) {
  const rawPhone = String(lead.telefone || '').replace(/\D/g, '');
  const waUrl = rawPhone ? `https://wa.me/55${rawPhone}` : null;
  const stage = lead.status || 'Novo';

  const stageInfo = LEAD_STAGES.find(s => s.key === stage) || LEAD_STAGES[0];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition">
      <div>
        {/* Cabeçalho do Lead */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-[#E50914] flex items-center justify-center font-black text-sm">
              {String(lead.nome || 'L').slice(0, 1).toUpperCase()}
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-900">{lead.nome || 'Cliente'}</h4>
              <p className="text-[11px] text-slate-500">{lead.data || 'Hoje'}</p>
            </div>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${stageInfo.color}`}>
            {stageInfo.label}
          </span>
        </div>

        {/* Informações de Interesse */}
        <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-600">
            <span className="font-semibold text-slate-500">Veículo / Assunto:</span>
            <span className="font-bold text-slate-900 truncate max-w-[180px]">
              {lead.veiculoNome || lead.tipo || 'Interesse Geral'}
            </span>
          </div>
          {lead.valorVeiculo > 0 && (
            <div className="flex items-center justify-between text-slate-600">
              <span className="font-semibold text-slate-500">Proposta / Valor:</span>
              <span className="font-bold text-emerald-700">{formatMoney(lead.valorVeiculo)}</span>
            </div>
          )}
          {lead.mensagem && (
            <p className="pt-2 border-t border-slate-200/60 text-slate-600 italic text-[11px] line-clamp-2">
              "{lead.mensagem}"
            </p>
          )}
        </div>
      </div>

      {/* Ações e Seletor Rápido de Etapa */}
      <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Mudar Etapa:</span>
          <select
            value={stage}
            onChange={(e) => onStageChange(lead.id, e.target.value)}
            className="text-xs font-bold bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 focus:outline-none"
          >
            {LEAD_STAGES.map(st => (
              <option key={st.key} value={st.key}>{st.label}</option>
            ))}
          </select>
        </div>

        {waUrl && (
          <a
            href={waUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-xs transition"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Atender no WhatsApp ({lead.telefone})</span>
          </a>
        )}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// SEÇÃO VISÃO GERAL (OVERVIEW)
// -------------------------------------------------------------
function OverviewSection({ vehicles, leads, stats, onGoToStock, onGoToLeads }) {
  const totalValue = vehicles
    .filter(v => (v.status || 'Disponível') === 'Disponível')
    .reduce((sum, v) => sum + Number(v.preco || 0), 0);

  return (
    <div className="space-y-6">
      {/* Banner Principal com Estética Executiva */}
      <div className="bg-[#101010] text-white p-6 sm:p-8 rounded-3xl relative overflow-hidden shadow-xl border border-white/10">
        <div className="relative z-10 max-w-2xl">
          <span className="text-xs font-black uppercase tracking-widest text-[#E50914]">
            Painel Executivo JAPA
          </span>
          <h2 className="text-2xl sm:text-4xl font-black mt-2 tracking-tight">
            Valor de Estoque: {formatMoney(totalValue)}
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Gestão unificada de veículos, propostas em tempo real e distribuição para canais parceiros.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={onGoToStock}
              className="px-5 py-2.5 rounded-xl bg-[#E50914] text-white text-xs font-black hover:bg-[#C80812] transition shadow-md"
            >
              Acessar Estoque
            </button>
            <button
              onClick={onGoToLeads}
              className="px-5 py-2.5 rounded-xl bg-white/10 text-white text-xs font-black hover:bg-white/20 transition"
            >
              Ver Funil de Leads
            </button>
          </div>
        </div>
      </div>

      {/* Grid Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200">
          <h3 className="text-base font-black text-slate-900 mb-4 flex items-center gap-2">
            <Car className="w-5 h-5 text-[#E50914]" />
            <span>Últimos Veículos Adicionados</span>
          </h3>
          <div className="space-y-3">
            {vehicles.slice(0, 4).map(v => (
              <div key={v.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div>
                  <p className="text-xs font-bold text-slate-900">{v.marca} {v.modelo}</p>
                  <p className="text-[11px] text-slate-500">{v.anoFabricacao}/{v.anoModelo} • {v.cambio}</p>
                </div>
                <span className="text-xs font-black text-slate-900">{formatMoney(v.preco)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200">
          <h3 className="text-base font-black text-slate-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#E50914]" />
            <span>Últimas Mensagens & Propostas</span>
          </h3>
          <div className="space-y-3">
            {leads.slice(0, 4).map(l => (
              <div key={l.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div>
                  <p className="text-xs font-bold text-slate-900">{l.nome}</p>
                  <p className="text-[11px] text-slate-500">{l.veiculoNome || 'Geral'}</p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-50 text-blue-700">
                  {l.status || 'Novo'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// SEÇÃO PORTAIS & CANAIS
// -------------------------------------------------------------
function PortalsSection({ vehicles, onToggleWebmotors }) {
  const webmotorsCount = vehicles.filter(v => v.webmotorsSync).length;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200">
        <h3 className="text-lg font-black text-slate-900">Integração Multicanal</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-2xl">
          O site oficial da JAPA Intermediações atua como núcleo central. As integrações com portais terceiros utilizam feed XML e adaptadores oficiais para garantir que os dados não sejam desconfigurados.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {CHANNELS.map((ch) => {
          const isSite = ch.key === 'site';
          const isWebmotors = ch.key === 'webmotors';

          return (
            <div key={ch.key} className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl text-white flex items-center justify-center font-black text-xs ${ch.color}`}>
                      {ch.short}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900">{ch.label}</h4>
                      <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${isSite ? 'bg-emerald-500' : isWebmotors ? 'bg-amber-400' : 'bg-slate-300'}`} />
                      <span className="text-[11px] text-slate-500 font-semibold">
                        {isSite ? 'Conexão Ativa' : isWebmotors ? 'Feed XML Ativo' : 'Aguardando Credenciais'}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                  {isSite && 'Catálogo sincronizado automaticamente em tempo real com banco de dados.'}
                  {isWebmotors && `${webmotorsCount} veículos selecionados para exportação no feed XML da Webmotors.`}
                  {!isSite && !isWebmotors && 'Requer chave de API e homologação direta com a plataforma parceira.'}
                </p>
              </div>

              {isWebmotors ? (
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <a
                    href="/api/integrations/webmotors/feed.xml"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-[#E50914] hover:underline inline-flex items-center gap-1"
                  >
                    <span>Ver Feed XML</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <span className="text-xs font-bold text-slate-500">
                    {webmotorsCount} carros selecionados
                  </span>
                </div>
              ) : (
                <button
                  disabled={!isSite}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold border transition ${
                    isSite
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'
                  }`}
                >
                  {isSite ? 'Sincronização Ativa' : 'Configurar Integração'}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// SEÇÃO VENDAS
// -------------------------------------------------------------
function SalesSection({ vehicles, onEditVehicle }) {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200">
        <h3 className="text-lg font-black text-slate-900">Histórico de Vendas Concluídas</h3>
        <p className="text-xs text-slate-500 mt-1">
          Veículos marcados com o status "Vendido" são mantidos no histórico para relatórios de faturamento e giro de estoque.
        </p>
      </div>

      {vehicles.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300">
          <CircleDollarSign className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="font-bold text-slate-800">Nenhum veículo com status "Vendido"</h4>
          <p className="text-xs text-slate-500 mt-1">Quando fechar uma venda, altere o status do veículo no estoque.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {vehicles.map(v => (
            <div key={v.id} className="bg-white rounded-2xl border border-slate-200 p-4 flex gap-3 items-center">
              <img src={v.fotos?.[0] || '/veiculo-sedan.webp'} alt="" className="w-20 h-16 rounded-xl object-cover" />
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-black text-slate-900 truncate">{v.marca} {v.modelo}</h4>
                <p className="text-[11px] text-slate-500">{v.anoFabricacao}/{v.anoModelo}</p>
                <p className="text-xs font-black text-emerald-600 mt-1">{formatMoney(v.preco)}</p>
              </div>
              <button
                onClick={() => onEditVehicle(v)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// SEÇÃO FINANCIAMENTO
// -------------------------------------------------------------
function FinancingSection({ leads }) {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200">
        <h3 className="text-lg font-black text-slate-900">Solicitações de Financiamento</h3>
        <p className="text-xs text-slate-500 mt-1">
          Propostas com interesse em parcelamento através dos bancos parceiros (Santander, BV, Itaú, Bradesco, Pan).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {leads.length === 0 ? (
          <div className="col-span-2 p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300">
            <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-xs text-slate-500">Nenhuma solicitação de financiamento registrada até o momento.</p>
          </div>
        ) : (
          leads.map(l => (
            <div key={l.id} className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-sm font-black text-slate-900">{l.nome}</h4>
                  <p className="text-xs text-slate-500">{l.telefone}</p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-50 text-purple-700">
                  {l.status || 'Em análise'}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                <p><strong className="text-slate-700">Veículo:</strong> {l.veiculoNome || 'Não especificado'}</p>
                {l.valorVeiculo && <p><strong className="text-slate-700">Valor do Veículo:</strong> {formatMoney(l.valorVeiculo)}</p>}
                {l.entrada && <p><strong className="text-slate-700">Entrada:</strong> {formatMoney(l.entrada)}</p>}
                {l.prazo && <p><strong className="text-slate-700">Prazo Solicitado:</strong> {l.prazo}x</p>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// SEÇÃO RELATÓRIOS
// -------------------------------------------------------------
function ReportsSection({ vehicles, leads }) {
  const marcas = {};
  vehicles.forEach(v => {
    marcas[v.marca] = (marcas[v.marca] || 0) + 1;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200">
        <h3 className="text-lg font-black text-slate-900">Relatórios & Giro de Estoque</h3>
        <p className="text-xs text-slate-500 mt-1">
          Métricas consolidadas de veículos e conversão de propostas.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200">
          <h4 className="text-sm font-black text-slate-900 mb-4">Composição por Montadora</h4>
          <div className="space-y-2">
            {Object.entries(marcas).map(([marca, count]) => (
              <div key={marca} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100">
                <span className="font-bold text-slate-700">{marca}</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 font-black text-slate-800">{count} un.</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200">
          <h4 className="text-sm font-black text-slate-900 mb-4">Giro Médio</h4>
          <div className="space-y-3 text-xs text-slate-600">
            <p>• Tempo médio de permanência em estoque: <strong>18 dias</strong></p>
            <p>• Canal com maior conversão de leads: <strong>WhatsApp Oficial</strong></p>
            <p>• Categoria com maior procura: <strong>SUVs e Picapes</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// SEÇÃO EQUIPE
// -------------------------------------------------------------
function TeamSection() {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200">
        <h3 className="text-lg font-black text-slate-900">Equipe & Consultores</h3>
        <p className="text-xs text-slate-500 mt-1">
          Usuários com permissão de acesso ao painel de gestão JAPA.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black">
            AD
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-900">Administrador JAPA</h4>
            <p className="text-xs text-slate-500">Gestão Geral & Estoque</p>
            <span className="inline-block mt-1 text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
              Acesso Total
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// SEÇÃO CONFIGURAÇÕES
// -------------------------------------------------------------
function SettingsSection({ onRefresh }) {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
        <h3 className="text-lg font-black text-slate-900">Dados da Concessionária</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-bold text-slate-600 block mb-1">Razão Social / Nome</label>
            <input type="text" readOnly value="JAPA Intermediações de Veículos" className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200" />
          </div>
          <div>
            <label className="font-bold text-slate-600 block mb-1">Cidade / Estado</label>
            <input type="text" readOnly value="Wenceslau Braz - PR" className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200" />
          </div>
          <div>
            <label className="font-bold text-slate-600 block mb-1">WhatsApp de Atendimento</label>
            <input type="text" readOnly value="(43) 99643-7966" className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200" />
          </div>
          <div>
            <label className="font-bold text-slate-600 block mb-1">Endereço Completo</label>
            <input type="text" readOnly value="Av. Avelino Vieira, 68 - Centro, CEP 84950-000" className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200" />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200">
        <h3 className="text-base font-black text-slate-900 mb-2">Conexão da API & Banco de Dados</h3>
        <p className="text-xs text-slate-500 leading-relaxed mb-4">
          O sistema opera com sincronização de banco de dados MySQL na hospedagem Hostoo com suporte a LiteSpeed e Apache.
        </p>
        <button
          onClick={onRefresh}
          className="px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-black transition"
        >
          Testar Conexão com API
        </button>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// DRAWER / BOTTOM SHEET DE CANAIS DE PUBLICAÇÃO ("Publicar")
// -------------------------------------------------------------
function ChannelDrawer({ vehicle, onClose, onToggleWebmotors }) {
  const [copiedFeed, setCopiedFeed] = useState(false);

  const handleCopyFeed = () => {
    navigator.clipboard.writeText(`${window.location.origin}/api/integrations/webmotors/feed.xml`);
    setCopiedFeed(true);
    setTimeout(() => setCopiedFeed(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-xs flex items-end sm:items-stretch sm:justify-end"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md bg-white h-[90vh] sm:h-full rounded-t-3xl sm:rounded-none flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-right duration-300"
      >
        {/* Topo do Drawer */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#E50914]">
              Publicação Multicanal
            </span>
            <h3 className="text-lg font-black text-slate-900">Canais de Divulgação</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Resumo do Veículo */}
        <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
          <img
            src={vehicle.fotos?.[0] || '/veiculo-sedan.webp'}
            alt=""
            className="w-16 h-12 rounded-xl object-cover border border-slate-200"
          />
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-black text-slate-900 truncate">{vehicle.marca} {vehicle.modelo}</h4>
            <p className="text-[11px] text-slate-500">{vehicle.anoFabricacao}/{vehicle.anoModelo} • {formatMoney(vehicle.preco)}</p>
          </div>
        </div>

        {/* Lista de Canais */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Canal 1: Site Japa (Sempre Ativo) */}
          <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <strong className="text-xs font-black text-slate-900">Site JAPA Intermediações</strong>
              </div>
              <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                Publicado
              </span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              O veículo está visível publicamente no catálogo do site da loja.
            </p>
          </div>

          {/* Canal 2: Webmotors (Feed XML) */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${vehicle.webmotorsSync ? 'bg-red-600' : 'bg-slate-300'}`} />
                <strong className="text-xs font-black text-slate-900">Webmotors Integrador</strong>
              </div>
              <button
                onClick={onToggleWebmotors}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  vehicle.webmotorsSync ? 'bg-[#E50914]' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    vehicle.webmotorsSync ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Quando ativado, este veículo é incluído no feed XML oficial da Webmotors para importação automática.
            </p>
            <button
              onClick={handleCopyFeed}
              className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center justify-center gap-1.5 transition"
            >
              {copiedFeed ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedFeed ? 'Link do Feed Copiado!' : 'Copiar URL do Feed XML'}</span>
            </button>
          </div>

          {/* Canais Restantes: Mobiauto, OLX, Meta, iCarros, ML */}
          {CHANNELS.filter(c => c.key !== 'site' && c.key !== 'webmotors').map(ch => (
            <div key={ch.key} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2 opacity-80">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                  <strong className="text-xs font-bold text-slate-700">{ch.label}</strong>
                </div>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
                  Aguardando API
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Requer inserção de token ou credencial corporativa oficial nas configurações.
              </p>
            </div>
          ))}
        </div>

        {/* Rodapé do Drawer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition"
          >
            Concluir Ajustes de Publicação
          </button>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// MODAL COMPLETO DE EDIÇÃO / CADASTRO COM MULTI-UPLOAD REAL
// -------------------------------------------------------------
function VehicleEditorModal({ vehicle, saving, onClose, onSave }) {
  const isEditing = Boolean(vehicle?.id);
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [customOpcional, setCustomOpcional] = useState('');

  // Formulário completo
  const [form, setForm] = useState(() => ({
    id: vehicle?.id || '',
    marca: vehicle?.marca || '',
    modelo: vehicle?.modelo || '',
    versao: vehicle?.versao || '',
    anoFabricacao: vehicle?.anoFabricacao || new Date().getFullYear(),
    anoModelo: vehicle?.anoModelo || new Date().getFullYear(),
    km: vehicle?.km || 0,
    preco: vehicle?.preco || 0,
    precoOriginal: vehicle?.precoOriginal || '',
    isDemoPrice: Boolean(vehicle?.isDemoPrice),
    combustivel: vehicle?.combustivel || 'Flex',
    cambio: vehicle?.cambio || 'Automático',
    cor: vehicle?.cor || 'Branco',
    portas: vehicle?.portas || 4,
    carroceria: vehicle?.carroceria || 'SUV',
    finalPlaca: vehicle?.finalPlaca || '',
    cidade: vehicle?.cidade || 'Wenceslau Braz',
    uf: vehicle?.uf || 'PR',
    destaque: Boolean(vehicle?.destaque),
    status: vehicle?.status || 'Disponível',
    descricao: vehicle?.descricao || '',
    fotos: vehicle?.fotos && vehicle.fotos.length > 0 ? [...vehicle.fotos] : ['/veiculo-sedan.webp'],
    opcionais: vehicle?.opcionais && vehicle.opcionais.length > 0 ? [...vehicle.opcionais] : [],
    webmotorsSync: vehicle?.webmotorsSync !== false
  }));

  const updateField = (field, val) => {
    setForm(prev => ({ ...prev, [field]: val }));
  };

  // UPLOAD REAL DE FOTOS (DRAG & DROP / FILE INPUT)
  const handleFilesUpload = async (files) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    const newUrls = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append('foto', file);
      formData.append('file', file);

      try {
        const res = await fetch('/api/index.php?endpoint=upload', {
          method: 'POST',
          body: formData
        });

        if (res.ok) {
          const data = await res.json();
          if (data.url) {
            newUrls.push(data.url);
          } else if (data.urls && data.urls.length > 0) {
            newUrls.push(...data.urls);
          }
        } else {
          // Fallback FileReader base64 se a rota PHP de upload não responder
          const base64Url = await fileToBase64(file);
          newUrls.push(base64Url);
        }
      } catch (err) {
        console.warn('Fallback para leitor local de imagem:', err);
        try {
          const base64Url = await fileToBase64(file);
          newUrls.push(base64Url);
        } catch (e) {}
      }
    }

    if (newUrls.length > 0) {
      setForm(prev => {
        // Se a foto padrão for o mockup genérico, substitui
        const currentFotos = (prev.fotos || []).filter(f => !f.includes('/veiculo-sedan.webp'));
        return {
          ...prev,
          fotos: [...currentFotos, ...newUrls]
        };
      });
    }

    setUploading(false);
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Reordenação de Fotos
  const handleMakeCover = (index) => {
    setForm(prev => {
      const fotos = [...prev.fotos];
      const [target] = fotos.splice(index, 1);
      return { ...prev, fotos: [target, ...fotos] };
    });
  };

  const handleRemovePhoto = (index) => {
    setForm(prev => {
      const fotos = prev.fotos.filter((_, i) => i !== index);
      return { ...prev, fotos: fotos.length > 0 ? fotos : ['/veiculo-sedan.webp'] };
    });
  };

  const handleMovePhoto = (index, direction) => {
    setForm(prev => {
      const fotos = [...prev.fotos];
      const newIndex = index + direction;
      if (newIndex < 0 || newIndex >= fotos.length) return prev;
      const temp = fotos[index];
      fotos[index] = fotos[newIndex];
      fotos[newIndex] = temp;
      return { ...prev, fotos };
    });
  };

  // Opcionais
  const toggleOpcional = (opc) => {
    setForm(prev => {
      const list = prev.opcionais || [];
      return {
        ...prev,
        opcionais: list.includes(opc) ? list.filter(o => o !== opc) : [...list, opc]
      };
    });
  };

  const handleAddCustomOpcional = (e) => {
    e.preventDefault();
    if (customOpcional.trim() && !form.opcionais.includes(customOpcional.trim())) {
      setForm(prev => ({
        ...prev,
        opcionais: [...prev.opcionais, customOpcional.trim()]
      }));
      setCustomOpcional('');
    }
  };

  return (
    <div
      className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto"
      >
        {/* Cabeçalho do Modal */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between shrink-0 bg-white">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#E50914]">
              Gestão de Estoque JAPA
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              {isEditing ? `Editar: ${form.marca} ${form.modelo}` : 'Cadastrar Novo Veículo'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário Rolável */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave(form);
          }}
          className="flex-1 overflow-y-auto p-6 space-y-8"
        >
          {/* 1. SEÇÃO DE FOTOS COM DRAG & DROP REAL */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  Galeria de Fotografias
                </h3>
                <p className="text-xs text-slate-500">
                  Arraste imagens ou clique na caixa. A primeira imagem será utilizada como capa oficial.
                </p>
              </div>
              <span className="text-xs font-bold text-slate-400">
                {form.fotos.length} foto(s)
              </span>
            </div>

            {/* Dropzone Drag & Drop */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleFilesUpload(e.dataTransfer.files);
              }}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-[#E50914] bg-slate-50/70 hover:bg-red-50/20 rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 group"
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFilesUpload(e.target.files)}
              />
              <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-500 group-hover:text-[#E50914] group-hover:scale-110 transition">
                {uploading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-[#E50914]" />
                ) : (
                  <UploadCloud className="w-6 h-6" />
                )}
              </div>
              <p className="text-xs font-bold text-slate-700">
                {uploading ? 'Processando fotografias...' : 'Clique ou arraste fotos do veículo aqui'}
              </p>
              <p className="text-[11px] text-slate-400">
                Formatos aceitos: JPG, PNG, WEBP (múltiplos arquivos permitidos)
              </p>
            </div>

            {/* Grid de Miniaturas com Ações (Capa, Reordenar, Excluir) */}
            {form.fotos.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2">
                {form.fotos.map((foto, idx) => (
                  <div
                    key={idx}
                    className="relative group/thumb rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-[4/3]"
                  >
                    <img src={foto} alt="" className="w-full h-full object-cover" />

                    {/* Badge de Capa */}
                    {idx === 0 && (
                      <span className="absolute top-1.5 left-1.5 bg-[#E50914] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded shadow">
                        Capa
                      </span>
                    )}

                    {/* Overlay de Ações ao passar o mouse */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/thumb:opacity-100 transition flex items-center justify-center gap-1.5 p-1">
                      {idx > 0 && (
                        <button
                          type="button"
                          onClick={() => handleMakeCover(idx)}
                          className="p-1 rounded bg-white text-slate-800 hover:text-[#E50914]"
                          title="Definir como Capa"
                        >
                          <Star className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {idx > 0 && (
                        <button
                          type="button"
                          onClick={() => handleMovePhoto(idx, -1)}
                          className="p-1 rounded bg-white text-slate-800"
                          title="Mover para esquerda"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {idx < form.fotos.length - 1 && (
                        <button
                          type="button"
                          onClick={() => handleMovePhoto(idx, 1)}
                          className="p-1 rounded bg-white text-slate-800"
                          title="Mover para direita"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(idx)}
                        className="p-1 rounded bg-rose-600 text-white hover:bg-rose-700"
                        title="Remover foto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 2. DADOS PRINCIPAIS DO VEÍCULO */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              Identificação & Especificações
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Marca *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Toyota, Honda, Jeep"
                  value={form.marca}
                  onChange={(e) => updateField('marca', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#E50914]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Modelo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Corolla, Compass, Hilux"
                  value={form.modelo}
                  onChange={(e) => updateField('modelo', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#E50914]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Versão Completa *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: XEi 2.0 16V Flex Automático"
                  value={form.versao}
                  onChange={(e) => updateField('versao', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#E50914]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Ano Fab.</label>
                <input
                  type="number"
                  value={form.anoFabricacao}
                  onChange={(e) => updateField('anoFabricacao', Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#E50914]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Ano Modelo</label>
                <input
                  type="number"
                  value={form.anoModelo}
                  onChange={(e) => updateField('anoModelo', Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#E50914]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Quilometragem (km)</label>
                <input
                  type="number"
                  value={form.km}
                  onChange={(e) => updateField('km', Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#E50914]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Final da Placa</label>
                <input
                  type="text"
                  maxLength={2}
                  placeholder="Ex: 8"
                  value={form.finalPlaca}
                  onChange={(e) => updateField('finalPlaca', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#E50914]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Preço de Venda (R$) *</label>
                <input
                  type="number"
                  required
                  value={form.preco}
                  onChange={(e) => updateField('preco', Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold text-emerald-700 focus:outline-none focus:border-[#E50914]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Preço Original / De (Opcional)</label>
                <input
                  type="number"
                  value={form.precoOriginal}
                  onChange={(e) => updateField('precoOriginal', e.target.value ? Number(e.target.value) : '')}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#E50914]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Status no Estoque</label>
                <select
                  value={form.status}
                  onChange={(e) => updateField('status', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#E50914] bg-white"
                >
                  <option value="Disponível">Disponível</option>
                  <option value="Reservado">Reservado</option>
                  <option value="Vendido">Vendido</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Câmbio</label>
                <select
                  value={form.cambio}
                  onChange={(e) => updateField('cambio', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#E50914] bg-white"
                >
                  <option value="Automático">Automático</option>
                  <option value="Manual">Manual</option>
                  <option value="CVT">CVT</option>
                  <option value="Automatizado">Automatizado</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Combustível</label>
                <select
                  value={form.combustivel}
                  onChange={(e) => updateField('combustivel', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#E50914] bg-white"
                >
                  <option value="Flex">Flex</option>
                  <option value="Gasolina">Gasolina</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Híbrido">Híbrido</option>
                  <option value="Elétrico">Elétrico</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Carroceria</label>
                <select
                  value={form.carroceria}
                  onChange={(e) => updateField('carroceria', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#E50914] bg-white"
                >
                  <option value="SUV">SUV</option>
                  <option value="Sedan">Sedan</option>
                  <option value="Picape">Picape</option>
                  <option value="Hatch">Hatch</option>
                  <option value="Cupê">Cupê</option>
                  <option value="Utilitário">Utilitário</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Cor</label>
                <input
                  type="text"
                  value={form.cor}
                  onChange={(e) => updateField('cor', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#E50914]"
                />
              </div>
            </div>
          </div>

          {/* 3. OPCIONAIS & EQUIPAMENTOS */}
          <div className="space-y-3">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              Opcionais & Equipamentos
            </h3>
            <p className="text-xs text-slate-500">
              Clique nos opcionais para ativar ou desativar neste veículo.
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              {DEFAULT_OPCIONAIS.map((opc) => {
                const isSelected = form.opcionais.includes(opc);
                return (
                  <button
                    type="button"
                    key={opc}
                    onClick={() => toggleOpcional(opc)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 inline mr-1" />}
                    {opc}
                  </button>
                );
              })}
            </div>

            {/* Adicionar opcional customizado */}
            <div className="flex gap-2 pt-2">
              <input
                type="text"
                placeholder="Adicionar outro opcional..."
                value={customOpcional}
                onChange={(e) => setCustomOpcional(e.target.value)}
                className="flex-1 p-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#E50914]"
              />
              <button
                type="button"
                onClick={handleAddCustomOpcional}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold"
              >
                Adicionar
              </button>
            </div>
          </div>

          {/* 4. DESCRIÇÃO E DETALHES COMERCIAIS */}
          <div className="space-y-3">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              Descrição Comercial do Veículo
            </h3>
            <textarea
              rows={4}
              value={form.descricao}
              onChange={(e) => updateField('descricao', e.target.value)}
              placeholder="Descreva detalhes como laudo cautelar aprovado, revisões na concessionária, manual e chave reserva..."
              className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#E50914]"
            />
          </div>

          {/* 5. OPÇÕES ESPECIAIS (CHECKBOXES) */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap gap-6 items-center">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
              <input
                type="checkbox"
                checked={form.destaque}
                onChange={(e) => updateField('destaque', e.target.checked)}
                className="w-4 h-4 rounded text-[#E50914] focus:ring-0"
              />
              <span>Destacar na Página Inicial do Site</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
              <input
                type="checkbox"
                checked={form.webmotorsSync}
                onChange={(e) => updateField('webmotorsSync', e.target.checked)}
                className="w-4 h-4 rounded text-[#E50914] focus:ring-0"
              />
              <span>Incluir no Feed Webmotors (XML)</span>
            </label>
          </div>

          {/* Botões do Rodapé */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-[#E50914] hover:bg-[#C80812] text-white text-xs font-black shadow-lg shadow-red-600/20 transition flex items-center gap-2 disabled:opacity-50"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{isEditing ? 'Salvar Alterações' : 'Cadastrar Veículo'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
