import React, { useState, useEffect } from 'react';
import { Menu, X, MessageCircle, Phone } from 'lucide-react';
import Logo from './Logo.jsx';

export default function Header({ 
  currentPath = '/', 
  onNavigate 
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Início', path: '/' },
    { label: 'Estoque', path: '/estoque' },
    { label: 'Venda seu veículo', path: '/venda-seu-veiculo' },
    { label: 'Financiamento', path: '/financiamento' },
    { label: 'Sobre', path: '/sobre' },
    { label: 'Contato', path: '#contato' }
  ];

  const handleNavClick = (path) => {
    setMobileMenuOpen(false);
    if (onNavigate) {
      onNavigate(path);
    }
  };

  const whatsappUrl = "https://wa.me/5543996437966?text=" + encodeURIComponent("Olá JAPA Intermediações! Acessei o site e gostaria de atendimento.");

  return (
    <header className={`sticky top-0 z-40 bg-white transition-all duration-300 ${
      isScrolled ? 'shadow-sm border-b border-gray-100 py-1' : 'border-b border-gray-100 py-2'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Mobile Hamburger */}
          <div className="flex items-center lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 -ml-2 rounded-lg text-[#101010] hover:text-[#E50914] transition-colors"
              aria-label="Abrir menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Logo JAPA */}
          <div 
            className="flex-shrink-0 flex items-center cursor-pointer" 
            onClick={() => handleNavClick('/')}
          >
            <Logo className="h-10 sm:h-12 w-auto" variant="dark" />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 xl:gap-9">
            {navItems.map((item) => {
              const isActive = (item.path === '/' && currentPath === '/') || (item.path !== '/' && currentPath === item.path);
              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => handleNavClick(item.path)}
                  className={`relative text-sm font-semibold transition-colors py-2 ${
                    isActive 
                      ? 'text-[#E50914]' 
                      : 'text-[#101010] hover:text-[#E50914]'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E50914] rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Desktop WhatsApp CTA Button */}
          <div className="hidden lg:flex items-center">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#E50914] hover:bg-[#B80710] text-white text-sm font-bold py-3 px-6 rounded-full shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Falar no WhatsApp</span>
            </a>
          </div>

          {/* Mobile WhatsApp Icon Button */}
          <div className="flex lg:hidden items-center">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-sm"
              aria-label="WhatsApp"
            >
              <MessageCircle className="w-5 h-5 fill-white" />
            </a>
          </div>

        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white px-4 pt-3 pb-6 space-y-2 shadow-xl animate-in slide-in-from-top-2 duration-200">
          {navItems.map((item) => (
            <button
              key={item.path}
              type="button"
              onClick={() => handleNavClick(item.path)}
              className="w-full text-left py-2.5 px-3 rounded-xl text-sm font-bold text-[#101010] hover:bg-slate-50 hover:text-[#E50914] transition-colors flex items-center justify-between"
            >
              <span>{item.label}</span>
            </button>
          ))}
          <div className="pt-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-[#E50914] text-white py-3 rounded-xl font-bold text-sm shadow-sm"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Falar no WhatsApp</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
