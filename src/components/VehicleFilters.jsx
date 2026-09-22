import React from 'react';
import { Filter, RotateCcw, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

export default function VehicleFilters({
  filters,
  setFilters,
  filterOptions,
  totalResults,
  onReset
}) {
  const categories = [
    { id: 'todas', label: 'Todos os Veículos' },
    { id: 'SUV', label: 'SUVs & Crossovers' },
    { id: 'Sedan', label: 'Sedans' },
    { id: 'Picape', label: 'Picapes 4x4' },
    { id: 'Hatch', label: 'Hatches' },
  ];

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 mb-10 shadow-sm">
      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 border-b border-[#E5E7EB] no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilters({ ...filters, carroceria: cat.id })}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              filters.carroceria === cat.id
                ? 'bg-[#E50914] text-white shadow-sm'
                : 'bg-[#F7F7F7] text-[#5F6368] hover:bg-slate-200 hover:text-[#101010] border border-[#E5E7EB]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Filter Selectors Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 pt-5">
        {/* Marca */}
        <div>
          <label className="block text-[11px] font-bold text-[#101010] uppercase tracking-wider mb-1.5">
            Marca do Veículo
          </label>
          <select
            value={filters.marca}
            onChange={(e) => setFilters({ ...filters, marca: e.target.value })}
            className="w-full bg-[#F7F7F7] border border-[#E5E7EB] text-[#101010] text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#E50914] font-medium"
          >
            <option value="todas">Todas as Marcas</option>
            {filterOptions.marcas?.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        {/* Câmbio */}
        <div>
          <label className="block text-[11px] font-bold text-[#101010] uppercase tracking-wider mb-1.5">
            Transmissão
          </label>
          <select
            value={filters.cambio}
            onChange={(e) => setFilters({ ...filters, cambio: e.target.value })}
            className="w-full bg-[#F7F7F7] border border-[#E5E7EB] text-[#101010] text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#E50914] font-medium"
          >
            <option value="todos">Todos os Câmbios</option>
            {filterOptions.cambios?.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Combustível */}
        <div>
          <label className="block text-[11px] font-bold text-[#101010] uppercase tracking-wider mb-1.5">
            Combustível
          </label>
          <select
            value={filters.combustivel}
            onChange={(e) => setFilters({ ...filters, combustivel: e.target.value })}
            className="w-full bg-[#F7F7F7] border border-[#E5E7EB] text-[#101010] text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#E50914] font-medium"
          >
            <option value="todos">Todos os Tipos</option>
            {filterOptions.combustiveis?.map((cb) => (
              <option key={cb} value={cb}>{cb}</option>
            ))}
          </select>
        </div>

        {/* Ordenar por */}
        <div>
          <label className="block text-[11px] font-bold text-[#101010] uppercase tracking-wider mb-1.5">
            Classificar Por
          </label>
          <select
            value={filters.sort}
            onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
            className="w-full bg-[#F7F7F7] border border-[#E5E7EB] text-[#101010] text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#E50914] font-medium"
          >
            <option value="padrao">Destaques Selecionados</option>
            <option value="preco-asc">Menor Preço</option>
            <option value="preco-desc">Maior Preço</option>
            <option value="ano-desc">Mais Recentes (Ano)</option>
            <option value="km-asc">Menor Quilometragem</option>
          </select>
        </div>

        {/* Limpar e Contagem */}
        <div className="flex flex-col justify-end">
          <button
            onClick={onReset}
            className="flex items-center justify-center gap-2 w-full bg-[#F7F7F7] hover:bg-slate-200 text-[#101010] px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all border border-[#E5E7EB]"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#5F6368]" />
            <span>Redefinir Filtros</span>
          </button>
        </div>
      </div>

      {/* Result counter indicator */}
      <div className="mt-5 pt-4 border-t border-[#E5E7EB] flex items-center justify-between text-xs text-[#5F6368]">
        <span>
          Apresentando <strong className="text-[#101010] font-bold">{totalResults}</strong> veículos selecionados no showroom
        </span>
        <span className="text-[11px] text-[#5F6368] hidden sm:inline">
          JAPA Intermediações • Estoque verificado em tempo real
        </span>
      </div>
    </div>
  );
}
