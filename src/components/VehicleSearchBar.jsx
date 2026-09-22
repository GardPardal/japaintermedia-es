import React, { useState } from 'react';
import { Search, ChevronDown, Globe, Car, Calendar, DollarSign } from 'lucide-react';

export default function VehicleSearchBar({ 
  filterOptions = {}, 
  onSearch, 
  initialValues = {} 
}) {
  const [marca, setMarca] = useState(initialValues.marca || 'todas');
  const [modelo, setModelo] = useState(initialValues.modelo || 'todos');
  const [ano, setAno] = useState(initialValues.ano || 'todos');
  const [preco, setPreco] = useState(initialValues.preco || 'todos');

  const marcasList = filterOptions.marcas || ['Toyota', 'Honda', 'Hyundai', 'Jeep', 'Volkswagen', 'Chevrolet', 'Ford'];
  const anosList = ['2024', '2023', '2022', '2021', '2020', '2019', '2018'];

  const precosList = [
    { label: 'Qualquer valor', value: 'todos' },
    { label: 'Até R$ 80.000', value: '80000' },
    { label: 'Até R$ 120.000', value: '120000' },
    { label: 'Até R$ 180.000', value: '180000' },
    { label: 'Acima de R$ 180.000', value: 'acima-180000' }
  ];

  const handleApplySearch = (e) => {
    if (e) e.preventDefault();
    if (onSearch) {
      onSearch({
        marca,
        modelo,
        ano,
        preco
      });
    }
  };

  return (
    <div className="relative -mt-7 sm:-mt-9 z-30 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Desktop Search Bar: Single Pill Shape with Divided Columns */}
      <div className="hidden md:block bg-white rounded-full shadow-lg border border-gray-100 p-2 pl-6">
        <form onSubmit={handleApplySearch} className="flex items-center justify-between">
          
          {/* Col 1: Marca */}
          <div className="flex-1 pr-4">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
              Marca
            </label>
            <div className="relative">
              <select
                value={marca}
                onChange={(e) => setMarca(e.target.value)}
                className="w-full bg-transparent text-sm font-semibold text-[#101010] appearance-none focus:outline-none cursor-pointer pr-5 truncate"
              >
                <option value="todas">Todas</option>
                {marcasList.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-0 top-1 pointer-events-none" />
            </div>
          </div>

          <div className="h-8 w-px bg-gray-200" />

          {/* Col 2: Modelo */}
          <div className="flex-1 px-4">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
              Modelo
            </label>
            <div className="relative">
              <select
                value={modelo}
                onChange={(e) => setModelo(e.target.value)}
                className="w-full bg-transparent text-sm font-semibold text-[#101010] appearance-none focus:outline-none cursor-pointer pr-5 truncate"
              >
                <option value="todos">Todos</option>
                <option value="Corolla">Corolla</option>
                <option value="Hilux">Hilux</option>
                <option value="HR-V">HR-V</option>
                <option value="Compass">Compass</option>
                <option value="Creta">Creta</option>
                <option value="Polo">Polo</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-0 top-1 pointer-events-none" />
            </div>
          </div>

          <div className="h-8 w-px bg-gray-200" />

          {/* Col 3: Ano */}
          <div className="flex-1 px-4">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
              Ano
            </label>
            <div className="relative">
              <select
                value={ano}
                onChange={(e) => setAno(e.target.value)}
                className="w-full bg-transparent text-sm font-semibold text-[#101010] appearance-none focus:outline-none cursor-pointer pr-5"
              >
                <option value="todos">Todos</option>
                {anosList.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-0 top-1 pointer-events-none" />
            </div>
          </div>

          <div className="h-8 w-px bg-gray-200" />

          {/* Col 4: Faixa de Preço */}
          <div className="flex-1 px-4">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
              Faixa de preço
            </label>
            <div className="relative">
              <select
                value={preco}
                onChange={(e) => setPreco(e.target.value)}
                className="w-full bg-transparent text-sm font-semibold text-[#101010] appearance-none focus:outline-none cursor-pointer pr-5 truncate"
              >
                {precosList.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-0 top-1 pointer-events-none" />
            </div>
          </div>

          {/* Col 5: Botão Buscar Veículos */}
          <div className="pl-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 bg-[#E50914] hover:bg-[#B80710] text-white font-bold text-sm py-3.5 px-7 rounded-full shadow-sm transition-all duration-200 hover:scale-[1.02]"
            >
              <Search className="w-4 h-4" />
              <span>Buscar veículos</span>
            </button>
          </div>

        </form>
      </div>

      {/* Mobile Search Bar: Clean Card as shown on phone in mockup */}
      <div className="md:hidden bg-white rounded-2xl shadow-lg border border-gray-100 p-4 space-y-3">
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl border border-gray-100">
            <div className="flex items-center gap-2.5 text-[#101010] font-semibold">
              <Globe className="w-4 h-4 text-slate-400" />
              <span>Marca</span>
            </div>
            <select
              value={marca}
              onChange={(e) => setMarca(e.target.value)}
              className="bg-transparent font-bold text-[#101010] text-right focus:outline-none"
            >
              <option value="todas">Todas</option>
              {marcasList.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl border border-gray-100">
            <div className="flex items-center gap-2.5 text-[#101010] font-semibold">
              <Car className="w-4 h-4 text-slate-400" />
              <span>Modelo</span>
            </div>
            <select
              value={modelo}
              onChange={(e) => setModelo(e.target.value)}
              className="bg-transparent font-bold text-[#101010] text-right focus:outline-none"
            >
              <option value="todos">Todos</option>
              <option value="Corolla">Corolla</option>
              <option value="Hilux">Hilux</option>
              <option value="HR-V">HR-V</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl border border-gray-100">
            <div className="flex items-center gap-2.5 text-[#101010] font-semibold">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Ano</span>
            </div>
            <select
              value={ano}
              onChange={(e) => setAno(e.target.value)}
              className="bg-transparent font-bold text-[#101010] text-right focus:outline-none"
            >
              <option value="todos">Todos</option>
              {anosList.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl border border-gray-100">
            <div className="flex items-center gap-2.5 text-[#101010] font-semibold">
              <DollarSign className="w-4 h-4 text-slate-400" />
              <span>Faixa de preço</span>
            </div>
            <select
              value={preco}
              onChange={(e) => setPreco(e.target.value)}
              className="bg-transparent font-bold text-[#101010] text-right focus:outline-none"
            >
              {precosList.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="button"
          onClick={handleApplySearch}
          className="w-full flex items-center justify-center gap-2 bg-[#E50914] text-white font-bold text-sm py-3 rounded-xl shadow-sm"
        >
          <Search className="w-4 h-4" />
          <span>Buscar veículos</span>
        </button>
      </div>
    </div>
  );
}
