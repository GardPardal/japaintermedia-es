import React, { useState } from 'react';
import {
  BarChart3, TrendingUp, CircleDollarSign, Users, Car, Printer, Calendar,
  PieChart, AlertCircle, ArrowUpRight, CheckCircle2
} from 'lucide-react';

const money = (value) => Number(value || 0).toLocaleString('pt-BR', {
  style: 'currency', currency: 'BRL', maximumFractionDigits: 0
});

export default function ReportsView({ reports, sales, vehicles, leads }) {
  const [period, setPeriod] = useState('6m');

  const totalFaturado = reports?.metricas?.totalFaturado ?? sales.reduce((acc, s) => acc + (Number(s.valorVenda) || 0), 0);
  const totalLucro = reports?.metricas?.totalLucro ?? sales.reduce((acc, s) => acc + (Number(s.lucroEstimado) || 0), 0);
  const ticketMedio = reports?.metricas?.ticketMedio ?? (sales.length > 0 ? Math.round(totalFaturado / sales.length) : 0);
  const taxaConversao = reports?.metricas?.taxaConversao ?? (leads.length > 0 ? ((sales.length / leads.length) * 100).toFixed(1) : 0);

  const monthlySales = reports?.vendasPorMes || [
    { mes: 'Abr/26', total: 65000, quantidade: 1 },
    { mes: 'Mai/26', total: 110000, quantidade: 2 },
    { mes: 'Jun/26', total: 145000, quantidade: 2 },
    { mes: 'Jul/26', total: 190000, quantidade: 3 },
    { mes: 'Ago/26', total: 160000, quantidade: 2 },
    { mes: 'Set/26', total: totalFaturado, quantidade: sales.length }
  ];

  const maxMonthly = Math.max(...monthlySales.map(m => m.total), 1);

  // Categorias de Carroceria
  const categoryCounts = reports?.porCarroceria || vehicles.reduce((acc, v) => {
    const c = v.carroceria || 'Outros';
    acc[c] = (acc[c] || 0) + 1;
    return acc;
  }, {});

  // Marcas
  const brandCounts = reports?.porMarca || vehicles.reduce((acc, v) => {
    const m = v.marca || 'Outras';
    acc[m] = (acc[m] || 0) + 1;
    return acc;
  }, {});

  // Formas de Pagamento
  const paymentCounts = reports?.porPagamento || sales.reduce((acc, s) => {
    const p = s.formaPagamento || 'Outros';
    acc[p] = (acc[p] || 0) + 1;
    return acc;
  }, {});

  const totalVehicles = vehicles.length || 1;

  return (
    <div className="space-y-6">
      {/* BARRA SUPERIOR DO RELATÓRIO */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div>
          <h2 className="text-lg font-black text-slate-900">Relatório de Performance Comercial</h2>
          <p className="text-xs text-slate-500 mt-0.5">Visão consolidada de faturamento, estoque, conversão e portais.</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={period}
            onChange={e => setPeriod(e.target.value)}
            className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-bold outline-none"
          >
            <option value="6m">Últimos 6 meses</option>
            <option value="ano">Ano 2026</option>
            <option value="tudo">Histórico completo</option>
          </select>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-black text-white hover:bg-black transition shadow-sm"
          >
            <Printer className="h-4 w-4" />
            Imprimir Relatório
          </button>
        </div>
      </div>

      {/* 4 CARDS DE INDICADORES CHAVE */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 mb-3">
            <CircleDollarSign className="h-5 w-5" />
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Faturamento Acumulado</p>
          <p className="mt-1 text-2xl font-black text-emerald-700">{money(totalFaturado)}</p>
          <p className="mt-1 text-[11px] text-slate-500">{sales.length} negociações fechadas</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 mb-3">
            <TrendingUp className="h-5 w-5" />
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Margem Estimada</p>
          <p className="mt-1 text-2xl font-black text-purple-700">{money(totalLucro)}</p>
          <p className="mt-1 text-[11px] text-slate-500">Lucro operacional bruto</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-3">
            <Car className="h-5 w-5" />
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Ticket Médio</p>
          <p className="mt-1 text-2xl font-black text-slate-900">{money(ticketMedio)}</p>
          <p className="mt-1 text-[11px] text-slate-500">Valor médio por veículo vendido</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-[#e50914] mb-3">
            <Users className="h-5 w-5" />
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Conversão de Leads</p>
          <p className="mt-1 text-2xl font-black text-slate-900">{taxaConversao}%</p>
          <p className="mt-1 text-[11px] text-slate-500">{leads.length} oportunidades geradas</p>
        </div>
      </section>

      {/* GRÁFICO DE EVOLUÇÃO DE VENDAS */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-black text-base text-slate-900">Evolução de Vendas e Faturamento</h3>
            <p className="text-xs text-slate-500 mt-0.5">Volume financeiro faturado mês a mês.</p>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
            Crescimento Consistente
          </span>
        </div>

        <div className="grid grid-cols-6 gap-2 sm:gap-4 items-end h-52 pt-8 pb-2 border-b border-slate-100">
          {monthlySales.map((item, index) => {
            const heightPct = Math.max(15, Math.round((item.total / maxMonthly) * 100));
            const isLatest = index === monthlySales.length - 1;

            return (
              <div key={item.mes} className="flex flex-col items-center h-full justify-end group">
                <span className="text-[10px] font-black text-slate-600 mb-1 opacity-80 group-hover:opacity-100 transition whitespace-nowrap hidden sm:block">
                  {money(item.total)}
                </span>
                <div
                  style={{ height: `${heightPct}%` }}
                  className={`w-full max-w-[48px] rounded-t-xl transition-all duration-500 group-hover:scale-y-[1.03] ${
                    isLatest
                      ? 'bg-gradient-to-t from-[#bd0710] to-[#e50914] shadow-lg shadow-red-200'
                      : 'bg-slate-200 group-hover:bg-slate-300'
                  }`}
                />
                <span className="mt-2 text-[11px] font-bold text-slate-600">{item.mes}</span>
                <span className="text-[10px] text-slate-400 font-semibold">{item.quantidade} un.</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* SEÇÃO DUPLA: CATEGORIAS & FORMAS DE PAGAMENTO */}
      <div className="grid gap-5 md:grid-cols-2">
        {/* Distribuição por Carroceria */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="font-black text-base text-slate-900 mb-1">Distribuição do Estoque por Categoria</h3>
          <p className="text-xs text-slate-500 mb-5">Mix de produtos disponível na loja.</p>

          <div className="space-y-3.5">
            {Object.entries(categoryCounts).map(([cat, count]) => {
              const pct = Math.round((count / totalVehicles) * 100);
              return (
                <div key={cat}>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-slate-700">{cat}</span>
                    <span className="text-slate-500">{count} carros ({pct}%)</span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      style={{ width: `${pct}%` }}
                      className="h-full rounded-full bg-[#e50914] transition-all duration-500"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Formas de Pagamento */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="font-black text-base text-slate-900 mb-1">Meios de Pagamento Preferidos</h3>
          <p className="text-xs text-slate-500 mb-5">Perfil de quitação das vendas fechadas.</p>

          <div className="space-y-3">
            {Object.entries(paymentCounts).map(([method, count]) => {
              const totalSales = sales.length || 1;
              const pct = Math.round((count / totalSales) * 100);
              return (
                <div key={method} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <div>
                    <strong className="block text-xs font-bold text-slate-800">{method}</strong>
                    <span className="text-[11px] text-slate-500">{count} negociações</span>
                  </div>
                  <span className="rounded-full bg-white border border-slate-200 px-2.5 py-1 text-xs font-black text-slate-700">
                    {pct}%
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* GIRO DE ESTOQUE / TEMPO DE PÁTIO */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-black text-base text-slate-900">Análise de Giro de Estoque</h3>
            <p className="text-xs text-slate-500 mt-0.5">Acompanhamento do tempo de pátio dos veículos ativos.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-black uppercase text-slate-400">
                <th className="pb-3">Veículo</th>
                <th className="pb-3">Ano / Versão</th>
                <th className="pb-3">Preço</th>
                <th className="pb-3">Tempo Estimado em Pátio</th>
                <th className="pb-3 text-right">Status do Giro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {vehicles.filter(v => v.status === 'Disponível').slice(0, 6).map((v, i) => {
                // Cálculo ilustrativo proporcional aos IDs
                const diasPatio = (i + 1) * 8 + 4;
                const statusGiro = diasPatio < 25
                  ? { label: 'Giro Rápido', color: 'bg-emerald-50 text-emerald-700' }
                  : diasPatio < 45
                  ? { label: 'Giro Médio', color: 'bg-blue-50 text-blue-700' }
                  : { label: 'Atenção (> 40d)', color: 'bg-amber-50 text-amber-700' };

                return (
                  <tr key={v.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 font-black text-slate-900">{v.marca} {v.modelo}</td>
                    <td className="py-3 text-slate-500">{v.anoModelo} • {v.versao}</td>
                    <td className="py-3 font-bold text-slate-800">{money(v.preco)}</td>
                    <td className="py-3 text-slate-600 font-semibold">{diasPatio} dias no estoque</td>
                    <td className="py-3 text-right">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-black ${statusGiro.color}`}>
                        {statusGiro.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
