import React, { useState, useEffect } from 'react';
import TopBar from './components/TopBar.jsx';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import VehicleSearchBar from './components/VehicleSearchBar.jsx';
import VehicleCard from './components/VehicleCard.jsx';
import DifferentialsSection from './components/DifferentialsSection.jsx';
import HomePromoBanners from './components/HomePromoBanners.jsx';
import Footer from './components/Footer.jsx';
import BottomMobileBar from './components/BottomMobileBar.jsx';
import FloatingWhatsApp from './components/FloatingWhatsApp.jsx';
import VehicleDetailModal from './components/VehicleDetailModal.jsx';
import AdminDashboard from './components/AdminDashboardV2.jsx';
import AdminLoginModal from './components/AdminLoginModal.jsx';
import { ArrowRight } from 'lucide-react';
import { SettingsProvider } from './context/SettingsContext.jsx';

export default function App() {
  const [currentPath, setCurrentPath] = useState('/');
  const [vehicles, setVehicles] = useState([]);
  const [showAllStock, setShowAllStock] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    marcas: ['Toyota', 'Honda', 'Hyundai', 'Jeep', 'Volkswagen', 'Chevrolet', 'Ford'],
    carrocerias: ['SUV', 'Sedan', 'Picape', 'Hatch'],
    cambios: ['Automático', 'Manual', 'CVT'],
    combustiveis: ['Flex', 'Diesel', 'Gasolina']
  });
  const [loading, setLoading] = useState(true);

  // Authentication & Admin State
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(localStorage.getItem('brenza_auth_token')));
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);

  // Search filter from bar
  const [activeSearch, setActiveSearch] = useState({
    marca: 'todas',
    modelo: 'todos',
    ano: 'todos',
    preco: 'todos'
  });

  // Modal State
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // Detect URL path or query params
  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/admin' || window.location.search.includes('admin')) {
      if (localStorage.getItem('brenza_auth_token')) {
        setAdminOpen(true);
      } else {
        setLoginModalOpen(true);
      }
    }
  }, []);

  const handleOpenAdmin = () => {
    if (localStorage.getItem('brenza_auth_token')) {
      setIsAuthenticated(true);
      setAdminOpen(true);
    } else {
      setLoginModalOpen(true);
    }
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setLoginModalOpen(false);
    setAdminOpen(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('brenza_auth_token');
    localStorage.removeItem('brenza_user');
    setIsAuthenticated(false);
    setAdminOpen(false);
  };

  // Fetch Vehicles from API
  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (activeSearch.marca !== 'todas') params.append('marca', activeSearch.marca);
      if (activeSearch.preco !== 'todos') params.append('preco', activeSearch.preco);

      const res = await fetch(`/api/vehicles?${params.toString()}`);
      if (!res.ok) throw new Error('Falha ao obter veículos');
      const data = await res.json();
      setVehicles(data.vehicles || []);
    } catch (error) {
      console.warn('Usando fallback local para catálogo:', error);
      try {
        const fallbackRes = await fetch('/data/vehicles.json');
        const fallbackData = await fallbackRes.json();
        setVehicles(fallbackData);
      } catch (e) {
        console.error('Falha no fallback:', e);
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch filter options
  const fetchOptions = async () => {
    try {
      const res = await fetch('/api/vehicles/filters/options');
      if (res.ok) {
        const data = await res.json();
        setFilterOptions(prev => ({ ...prev, ...data }));
      }
    } catch (error) {}
  };

  useEffect(() => {
    fetchOptions();
  }, []);

  useEffect(() => {
    fetchVehicles();
  }, [activeSearch]);

  const handleSearchFromBar = (searchVals) => {
    setActiveSearch(searchVals);
    setShowAllStock(true);
    const stockEl = document.getElementById('estoque');
    if (stockEl) {
      stockEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNavigation = (path) => {
    setCurrentPath(path);
    if (path === '/') {
      setShowAllStock(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (path === '/estoque') {
      setShowAllStock(true);
      document.getElementById('estoque')?.scrollIntoView({ behavior: 'smooth' });
    } else if (path === '/venda-seu-veiculo') {
      document.getElementById('venda-seu-veiculo')?.scrollIntoView({ behavior: 'smooth' });
    } else if (path === '/financiamento') {
      document.getElementById('financiamento')?.scrollIntoView({ behavior: 'smooth' });
    } else if (path === '/sobre' || path === '#contato') {
      document.getElementById('contato')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Featured vehicles (the top 3 from mockup: Corolla, Hilux, HR-V)
  const displayedVehicles = showAllStock ? vehicles : vehicles.slice(0, 3);

  return (
    <SettingsProvider>
      <div className="min-h-screen bg-white text-[#101010] flex flex-col font-sans selection:bg-[#E50914] selection:text-white pb-14 md:pb-0">
        {/* 1. Barra Superior com Wenceslau Braz - PR */}
        <TopBar />

        {/* 2. Cabeçalho Fixo */}
        <Header
          currentPath={currentPath}
          onNavigate={handleNavigation}
        />

        {/* 3. Hero Principal idêntico ao Mockup */}
        <Hero
          onExploreStock={() => handleNavigation('/estoque')}
          onSellCar={() => handleNavigation('/venda-seu-veiculo')}
        />

        {/* 4. Barra de Busca Flutuante Sobreposta em Pílula */}
        <VehicleSearchBar
          filterOptions={filterOptions}
          onSearch={handleSearchFromBar}
        />

        {/* 5. Seção Veículos em Destaque idêntica ao Mockup */}
        <section id="estoque" className="pt-14 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          {/* Cabeçalho da Seção */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl sm:text-3xl font-black text-[#101010] tracking-tight">
              Veículos em destaque
            </h2>

            <button
              type="button"
              onClick={() => setShowAllStock(!showAllStock)}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#E50914] hover:text-[#B80710] transition-colors"
            >
              <span>{showAllStock ? 'Ver menos' : 'Ver todo o estoque'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Grade de 3 Cards */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-100 rounded-2xl h-80 border border-gray-200" />
              ))}
            </div>
          ) : displayedVehicles.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-10 text-center max-w-lg mx-auto">
              <h3 className="text-base font-bold text-[#101010] mb-1">Nenhum veículo encontrado</h3>
              <p className="text-xs text-slate-500 mb-4">Tente buscar por outras marcas ou modelos.</p>
              <button
                onClick={() => {
                  setActiveSearch({ marca: 'todas', modelo: 'todos', ano: 'todos', preco: 'todos' });
                  setShowAllStock(false);
                }}
                className="bg-[#E50914] text-white text-xs font-bold py-2 px-5 rounded-full"
              >
                Restaurar Destaques
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedVehicles.map((vehicle) => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  onSelectVehicle={(v) => setSelectedVehicle(v)}
                />
              ))}
            </div>
          )}
        </section>

        {/* 6. Faixa Horizontal de Diferenciais com 4 Ícones */}
        <DifferentialsSection />

        {/* 7. Dois Banners Promocionais Lado a Lado Fiel ao Mockup */}
        <div id="venda-seu-veiculo">
          <div id="financiamento">
            <HomePromoBanners />
          </div>
        </div>

        {/* 8. Rodapé Nipo-Moderno Preto */}
        <Footer
          onOpenAdmin={handleOpenAdmin}
          setActiveTab={handleNavigation}
        />

        {/* 9. Barra Inferior Mobile Flutuante */}
        <BottomMobileBar
          onOpenEstoque={() => handleNavigation('/estoque')}
        />

        {/* 10. Botão WhatsApp Flutuante */}
        <FloatingWhatsApp />

        {/* Modais */}
        {selectedVehicle && (
          <VehicleDetailModal
            vehicle={selectedVehicle}
            onClose={() => setSelectedVehicle(null)}
          />
        )}

        {loginModalOpen && (
          <AdminLoginModal
            onClose={() => setLoginModalOpen(false)}
            onLoginSuccess={handleLoginSuccess}
          />
        )}

        {adminOpen && (
          <AdminDashboard
            onClose={() => setAdminOpen(false)}
            onLogout={handleLogout}
            onVehicleUpdated={() => {
              fetchVehicles();
              fetchOptions();
            }}
          />
        )}
      </div>
    </SettingsProvider>
  );
}
