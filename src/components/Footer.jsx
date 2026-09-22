import React from 'react';
import { MapPin, MessageCircle, Instagram, Facebook, Youtube, Lock } from 'lucide-react';
import Logo from './Logo.jsx';

export default function Footer({ onOpenAdmin, setActiveTab }) {
  const handleLink = (id) => {
    if (setActiveTab) setActiveTab(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const whatsappUrl = "https://wa.me/5543996437966?text=" + encodeURIComponent("Olá JAPA Intermediações! Gostaria de atendimento.");

  return (
    <footer id="contato" className="bg-[#101010] text-[#888888] text-xs pt-12 pb-8 border-t border-[#1C1C1C]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 items-start pb-10 border-b border-[#222222]">
          
          {/* Col 1: Logo & Slogan */}
          <div className="lg:col-span-2 space-y-3">
            <Logo variant="white" className="h-14 w-fit" />
            <p className="text-slate-400 text-xs font-normal">
              Sua loja de carros e seminovos em Wenceslau Braz - PR. Conectando você ao melhor negócio com procedência e garantia!
            </p>
          </div>

          {/* Col 2: Navegação */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Navegação
            </h4>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => handleLink('inicio')} className="hover:text-white transition-colors">Início</button></li>
              <li><button onClick={() => handleLink('estoque')} className="hover:text-white transition-colors">Estoque</button></li>
              <li><button onClick={() => handleLink('venda-seu-veiculo')} className="hover:text-white transition-colors">Venda seu veículo</button></li>
              <li><button onClick={() => handleLink('financiamento')} className="hover:text-white transition-colors">Financiamento</button></li>
              <li><button onClick={() => handleLink('sobre')} className="hover:text-white transition-colors">Sobre</button></li>
              <li><button onClick={() => handleLink('contato')} className="hover:text-white transition-colors">Contato</button></li>
            </ul>
          </div>

          {/* Col 3: Endereço */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Endereço & Atendimento
            </h4>
            <div className="space-y-1 text-xs">
              <div className="flex items-start gap-1.5 text-white font-medium">
                <MapPin className="w-3.5 h-3.5 text-[#E50914] flex-shrink-0 mt-0.5" />
                <span>Avenida Avelino Vieira, 68 - Centro<br /><span className="text-slate-400">Wenceslau Braz - PR</span></span>
              </div>
              <p className="text-slate-400 text-[11px] pt-1">
                Atendimento: Seg à Sex 08h-18h | Sáb 08h-12h30
              </p>
            </div>
          </div>

          {/* Col 4: Siga-nos & CTA WhatsApp */}
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
                Siga-nos
              </h4>
              <div className="flex items-center gap-3 text-white">
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#E50914] flex items-center justify-center transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a 
                  href="https://facebook.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#E50914] flex items-center justify-center transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
                <a 
                  href="https://youtube.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#E50914] flex items-center justify-center transition-colors"
                  aria-label="YouTube"
                >
                  <Youtube className="w-4 h-4" />
                </a>
              </div>
            </div>

            <div className="pt-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#E50914] hover:bg-[#B80710] text-white text-xs font-bold py-2.5 px-5 rounded-full shadow-sm transition-all duration-200"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-white" />
                <span>Falar no WhatsApp</span>
              </a>
              <p className="text-[10px] text-slate-400 italic pt-1.5">
                “Confiança que te leva mais longe!”
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} JAPA Intermediações • Loja de Carros em Wenceslau Braz - PR. Todos os direitos reservados.</p>
          <button
            type="button"
            onClick={onOpenAdmin}
            className="flex items-center gap-1 hover:text-slate-400 transition-colors"
          >
            <Lock className="w-3 h-3" />
            <span>Painel</span>
          </button>
        </div>
      </div>
    </footer>
  );
}
