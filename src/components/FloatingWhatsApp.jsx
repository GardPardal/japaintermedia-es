import React from 'react';
import { MessageCircle } from 'lucide-react';

export default function FloatingWhatsApp() {
  return (
    <aside aria-label="Atendimento via WhatsApp" className="fixed bottom-5 right-5 z-40">
      <a
        href="https://wa.me/5543996437966?text=Ol%C3%A1,%20acessei%20o%20site%20da%20JAPA%20Intermedia%C3%A7%C3%B5es%20e%20gostaria%20de%20atendimento."
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Iniciar conversa no WhatsApp"
        className="h-12 w-12 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
      >
        <MessageCircle className="w-6 h-6 fill-white" />
      </a>
    </aside>
  );
}
