import React from 'react';
import { ArrowRight, ShieldCheck, Handshake, Award } from 'lucide-react';

export default function Hero({ onExploreStock, onSellCar }) {
  return (
    <section className="relative overflow-hidden bg-white">
      {/* Hero Container with calibrated height matching the mockup */}
      <div className="relative min-h-[460px] md:min-h-[500px] lg:min-h-[520px] flex items-center">
        
        {/* Background Hero Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="/hero-japa.webp"
            alt="JAPA Intermediações"
            className="w-full h-full object-cover object-right md:object-center"
            fetchPriority="high"
          />
          {/* Subtle soft white gradient on the left for text contrast */}
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 sm:via-white/75 to-transparent md:w-3/5 lg:w-1/2 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-transparent to-transparent md:hidden pointer-events-none" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full">
          <div className="max-w-lg lg:max-w-xl space-y-5">
            
            {/* Title matching mockup */}
            <h1 className="text-3xl sm:text-5xl lg:text-5xl font-black text-[#101010] tracking-tight leading-[1.15]">
              Seu próximo <br />
              <span className="text-[#E50914]">veículo</span> começa aqui.
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-[#444444] font-medium leading-relaxed max-w-md">
              Compra, venda, troca e financiamento com segurança.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onExploreStock}
                className="inline-flex items-center justify-center gap-2 bg-[#E50914] hover:bg-[#B80710] text-white font-bold text-sm sm:text-base py-3 px-8 rounded-full shadow-sm hover:shadow-md transition-all duration-200"
              >
                <span>Ver estoque</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onSellCar}
                className="inline-flex items-center justify-center bg-white hover:bg-red-50/50 text-[#101010] border border-[#E50914] font-bold text-sm sm:text-base py-3 px-8 rounded-full shadow-xs transition-all duration-200"
              >
                <span>Vender meu veículo</span>
              </button>
            </div>

            {/* 3 Trust Pillars matching mockup */}
            <div className="pt-6 border-t border-slate-200/80 flex flex-wrap items-center gap-6 sm:gap-8 text-xs font-semibold text-slate-700">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0 text-[#E50914]">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-[#101010] font-bold leading-tight">Segurança</span>
                  <span className="text-[10px] text-slate-500">em cada negócio</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0 text-[#E50914]">
                  <Handshake className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-[#101010] font-bold leading-tight">Transparência</span>
                  <span className="text-[10px] text-slate-500">do início ao fim</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0 text-[#E50914]">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-[#101010] font-bold leading-tight">Experiência</span>
                  <span className="text-[10px] text-slate-500">que faz a diferença</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
