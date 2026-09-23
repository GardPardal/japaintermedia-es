import React from 'react';
import { Car, MessageCircle } from 'lucide-react';
import { useSettings } from '../context/SettingsContext.jsx';

export default function BottomMobileBar({ onOpenEstoque }) {
  const { settings, getWhatsAppUrl } = useSettings();
  const whatsappUrl = getWhatsAppUrl(`Olá ${settings.nomeLoja || 'JAPA Intermediações'}! Gostaria de atendimento.`);

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-100 px-4 py-2.5 flex items-center gap-3 shadow-xl">
      <button
        type="button"
        onClick={() => {
          if (onOpenEstoque) onOpenEstoque();
          const el = document.getElementById('estoque');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        className="flex-1 py-2.5 px-3 rounded-full bg-gray-50 hover:bg-gray-100 text-[#101010] font-bold text-xs flex items-center justify-center gap-2 transition-colors border border-gray-100"
      >
        <Car className="w-4 h-4 text-[#101010]" />
        <span>Estoque</span>
      </button>

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 py-2.5 px-3 rounded-full bg-[#E50914] hover:bg-[#B80710] text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
      >
        <MessageCircle className="w-4 h-4 fill-white" />
        <span>WhatsApp</span>
      </a>
    </div>
  );
}
