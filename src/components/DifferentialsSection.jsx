import React from 'react';
import { ShieldCheck, BarChart3, CreditCard, Users2 } from 'lucide-react';

export default function DifferentialsSection() {
  const items = [
    {
      icon: ShieldCheck,
      title: 'Procedência',
      subtitle: 'garantida'
    },
    {
      icon: BarChart3,
      title: 'Avaliação justa',
      subtitle: 'do seu veículo'
    },
    {
      icon: CreditCard,
      title: 'Financiamento',
      subtitle: 'facilitado'
    },
    {
      icon: Users2,
      title: 'Atendimento',
      subtitle: 'transparente'
    }
  ];

  return (
    <section className="py-6 sm:py-8 bg-white border-y border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
          {items.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div 
                key={idx} 
                className={`flex items-center gap-3 pt-3 sm:pt-0 ${idx > 0 ? 'sm:pl-6' : ''}`}
              >
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-[#E50914] flex-shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#101010] leading-tight">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">
                    {item.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
