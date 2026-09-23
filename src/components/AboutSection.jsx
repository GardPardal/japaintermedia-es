import React from 'react';
import { MapPin, Phone, Clock, ShieldCheck, Award, Users, Navigation } from 'lucide-react';
import { useSettings } from '../context/SettingsContext.jsx';

export default function AboutSection() {
  const { settings, getWhatsAppUrl, getPhoneDisplay } = useSettings();

  const addressLine1 = `${settings.endereco || 'Avenida Avelino Vieira, 68'}${settings.bairro ? ` - ${settings.bairro}` : ''}`;
  const addressLine2 = `${settings.cidade || 'Wenceslau Braz'} - ${settings.uf || 'PR'}${settings.cep ? `, CEP ${settings.cep}` : ''}`;
  const whatsappUrl = getWhatsAppUrl(`Olá ${settings.nomeLoja || 'JAPA Intermediações'}! Gostaria de mais informações.`);
  const mapsQuery = encodeURIComponent(`${settings.endereco || 'Avenida Avelino Vieira 68'} ${settings.cidade || 'Wenceslau Braz'} ${settings.uf || 'PR'}`);

  return (
    <section id="sobre" className="py-20 bg-white border-t border-[#E5E7EB] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Brand story */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-red-50 text-[#E50914] text-xs font-bold uppercase tracking-wider">
              <Award className="w-4 h-4" />
              <span>Nossa História e Princípios</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-[#101010] tracking-tight leading-tight">
              {settings.nomeLoja ? settings.nomeLoja.toUpperCase() : 'JAPA INTERMEDIAÇÕES'}:<br />
              <span className="text-[#E50914]">CREDIBILIDADE E PAIXÃO POR AUTOMÓVEIS</span>
            </h2>

            <p className="text-sm text-[#5F6368] leading-relaxed">
              Fundada em {settings.cidade || 'Wenceslau Braz'} - {settings.uf || 'PR'}, a {settings.nomeLoja || 'JAPA Intermediações'} nasceu com o objetivo claro de transformar a experiência de compra e venda de veículos em um processo transparente, ágil e seguro.
            </p>

            <p className="text-sm text-[#5F6368] leading-relaxed">
              Trabalhamos rigorosamente com veículos periciados, revisados e de alta procedência. Cada carro em nosso estoque passa por criteriosa inspeção mecânica e documental, garantindo a tranquilidade que você e sua família merecem na conquista do seu novo seminovo.
            </p>

            {/* 3 Value Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#E5E7EB]">
              <div className="p-4 rounded-xl bg-[#F7F7F7] border border-[#E5E7EB]">
                <ShieldCheck className="w-6 h-6 text-[#E50914] mb-2" />
                <h4 className="font-bold text-xs text-[#101010] uppercase mb-1">Garantia e Procedência</h4>
                <p className="text-[11px] text-[#5F6368]">{settings.garantiaPadrao || '3 meses de motor e câmbio'} com laudo cautelar aprovado.</p>
              </div>

              <div className="p-4 rounded-xl bg-[#F7F7F7] border border-[#E5E7EB]">
                <Users className="w-6 h-6 text-[#E50914] mb-2" />
                <h4 className="font-bold text-xs text-[#101010] uppercase mb-1">Atendimento VIP</h4>
                <p className="text-[11px] text-[#5F6368]">Consultoria personalizada presencial ou 100% online pelo WhatsApp.</p>
              </div>

              <div className="p-4 rounded-xl bg-[#F7F7F7] border border-[#E5E7EB]">
                <Award className="w-6 h-6 text-[#E50914] mb-2" />
                <h4 className="font-bold text-xs text-[#101010] uppercase mb-1">Melhor Negociação</h4>
                <p className="text-[11px] text-[#5F6368]">Avaliação justa do seu usado e as menores taxas de financiamento bancário.</p>
              </div>
            </div>
          </div>

          {/* Right Column: Location & Contact Card */}
          <div id="contato" className="lg:col-span-5">
            <div className="bg-[#F7F7F7] border border-[#E5E7EB] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
              <h3 className="text-xl font-bold text-[#101010]">
                Venha Conhecer Nosso Showroom
              </h3>
              <p className="text-xs text-[#5F6368]">
                Estamos de portas abertas para receber você e apresentar de perto todos os detalhes do nosso estoque.
              </p>

              <div className="space-y-4 text-xs text-slate-700">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#E50914] flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#101010] block font-semibold">Endereço da Loja</strong>
                    <span>{addressLine1}</span>
                    <span className="block text-[#5F6368]">{addressLine2}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#101010] block font-semibold">Telefone e WhatsApp Oficial</strong>
                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="hover:text-[#E50914] transition-colors font-mono text-sm font-semibold">
                      {getPhoneDisplay()}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-[#101010] flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#101010] block font-semibold">Horário de Funcionamento</strong>
                    <span>Segunda a Sexta: das {settings.horarioSemana || '08h00 às 18h00'}</span>
                    <span className="block text-[#5F6368]">Sábados: das {settings.horarioSabado || '08h00 às 12h30'}</span>
                  </div>
                </div>
              </div>

              {/* Map Action Button */}
              <div className="pt-2 border-t border-[#E5E7EB]">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-white hover:bg-slate-100 text-[#101010] py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 border border-[#E5E7EB] hover:border-[#E50914] shadow-sm"
                >
                  <Navigation className="w-4 h-4 text-[#E50914]" />
                  <span>Traçar Rota no Google Maps</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
