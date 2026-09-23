import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useSettings } from '../context/SettingsContext.jsx';

export default function FloatingWhatsApp() {
  const { settings, getWhatsAppUrl } = useSettings();
  const whatsappUrl = getWhatsAppUrl(`Olá, acessei o site da ${settings.nomeLoja || 'JAPA Intermediações'} e gostaria de atendimento.`);

  return (
    <aside aria-label="Atendimento via WhatsApp" className="fixed bottom-5 right-5 z-40">
      <a
        href={whatsappUrl}
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
