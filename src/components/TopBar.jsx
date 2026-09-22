import React from 'react';
import { MapPin, MessageCircle } from 'lucide-react';

export default function TopBar() {
  return (
    <div className="bg-[#101010] text-[#A0A4A8] text-[11px] sm:text-xs py-2 px-4 sm:px-6 lg:px-8 border-b border-white/5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left: Location & WhatsApp */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-1.5 text-white">
            <MapPin className="w-3.5 h-3.5 text-[#E50914] flex-shrink-0" />
            <span className="font-semibold text-white">Wenceslau Braz - PR</span>
          </div>

          <span className="text-slate-600 hidden xs:inline">|</span>

          <a
            href="https://wa.me/5543996437966?text=Ol%C3%A1%20JAPA%20Intermedia%C3%A7%C3%B5es!%20Gostaria%20de%20atendimento."
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[#CCCCCC] hover:text-white transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Atendimento via WhatsApp</span>
          </a>
        </div>

        {/* Right: Slogan */}
        <div className="hidden md:block text-slate-300 italic text-[11px]">
          “Confiança que te leva mais longe!”
        </div>
      </div>
    </div>
  );
}
