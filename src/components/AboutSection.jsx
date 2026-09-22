import React from 'react';
import { MapPin, Phone, Clock, ShieldCheck, Award, Users, Navigation } from 'lucide-react';

export default function AboutSection() {
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
              JAPA INTERMEDIAÇÕES:<br />
              <span className="text-[#E50914]">CREDIBILIDADE E PAIXÃO POR AUTOMÓVEIS</span>
            </h2>

            <p className="text-[#5F6368] text-base leading-relaxed">
              Consolidada como a principal <strong className="text-[#101010]">loja de carros e seminovos em Wenceslau Braz - PR</strong>, a <strong className="text-[#101010]">JAPA Intermediações</strong> atende clientes de toda a região do Norte Pioneiro (Arapoti, Ibaiti, Jaguariaíva, Santana do Itararé, Tomazina e Siqueira Campos) com foco em compra, venda, troca com avaliação justa e financiamento bancário facilitado.
            </p>

            <p className="text-[#5F6368] text-base leading-relaxed">
              Cada veículo que intermediamos passa por uma rigorosa checagem mecânica, estrutural e documental com laudo cautelar. Nosso compromisso é entregar a você e sua família não apenas um carro de procedência garantida, mas segurança, transparência e as melhores condições de pagamento da região.
            </p>

            {/* Core Values Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <div className="bg-[#F7F7F7] p-5 rounded-2xl border border-[#E5E7EB]">
                <ShieldCheck className="w-6 h-6 text-emerald-600 mb-2" />
                <h4 className="text-xs font-bold text-[#101010] uppercase tracking-wider">Transparência Total</h4>
                <p className="text-xs text-[#5F6368] mt-1">Histórico documental limpo e quilometragem 100% autêntica.</p>
              </div>

              <div className="bg-[#F7F7F7] p-5 rounded-2xl border border-[#E5E7EB]">
                <Users className="w-6 h-6 text-[#E50914] mb-2" />
                <h4 className="text-xs font-bold text-[#101010] uppercase tracking-wider">Atendimento Humano</h4>
                <p className="text-xs text-[#5F6368] mt-1">Consultoria personalizada para encontrar a melhor opção para seu perfil.</p>
              </div>

              <div className="bg-[#F7F7F7] p-5 rounded-2xl border border-[#E5E7EB]">
                <Award className="w-6 h-6 text-amber-500 mb-2" />
                <h4 className="text-xs font-bold text-[#101010] uppercase tracking-wider">Garantia Comprovada</h4>
                <p className="text-xs text-[#5F6368] mt-1">Garantia mecânica de motor e câmbio assegurada em contrato.</p>
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
                    <span>Avenida Avelino Vieira, 68 - Centro</span>
                    <span className="block text-[#5F6368]">Wenceslau Braz - PR, CEP 84950-000</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#101010] block font-semibold">Telefone e WhatsApp Oficial</strong>
                    <a href="https://wa.me/5543996437966" target="_blank" rel="noopener noreferrer" className="hover:text-[#E50914] transition-colors font-mono text-sm font-semibold">
                      (43) 99643-7966
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-[#101010] flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#101010] block font-semibold">Horário de Funcionamento</strong>
                    <span>Segunda a Sexta: das 08h00 às 18h00</span>
                    <span className="block text-[#5F6368]">Sábados: das 08h00 às 12h30</span>
                  </div>
                </div>
              </div>

              {/* Map Action Button */}
              <div className="pt-2 border-t border-[#E5E7EB]">
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Avenida+Avelino+Vieira+68+Wenceslau+Braz+PR"
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
