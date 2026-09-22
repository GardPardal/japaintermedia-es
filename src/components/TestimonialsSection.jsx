import React from 'react';
import { Star, ShieldCheck, Quote } from 'lucide-react';

export default function TestimonialsSection() {
  const testimonials = [
    {
      name: 'Eduardo M. Takahashi',
      city: 'Londrina - PR',
      car: 'Toyota Corolla XEi',
      rating: 5,
      text: 'Experiência impecável com a JAPA! O carro veio exatamente como nas fotos, com laudo cautelar 100% aprovado e atendimento super transparente. Recomendo de olhos fechados.'
    },
    {
      name: 'Camila Rodrigues',
      city: 'Maringá - PR',
      car: 'Honda HR-V Touring',
      rating: 5,
      text: 'Deixei meu usado na troca e recebi uma avaliação muito justa, superior a todas as outras concessionárias da região. Quitaram meu financiamento e em dois dias saí com o HR-V.'
    },
    {
      name: 'Marcos Vinicius Santos',
      city: 'Arapongas - PR',
      car: 'Toyota Hilux SRX',
      rating: 5,
      text: 'O financiamento foi aprovado super rápido com taxa muito baixa. A equipe foi muito atenciosa e esclareceu todas as dúvidas no WhatsApp. Atendimento nota 10!'
    }
  ];

  return (
    <section className="py-20 bg-white border-b border-[#E5E7EB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#E50914] block mb-2">
            Avaliações e Depoimentos
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#101010] tracking-tight">
            Quem compra ou vende na JAPA recomenda
          </h2>
          <p className="text-sm text-[#5F6368] mt-2">
            A satisfação dos nossos clientes é o maior reflexo da nossa seriedade e procedência.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="bg-[#F7F7F7] border border-[#E5E7EB] hover:border-[#E50914] p-6 rounded-2xl shadow-sm transition-all duration-300 flex flex-col justify-between relative group"
            >
              <Quote className="w-8 h-8 text-red-100 absolute top-5 right-5 pointer-events-none group-hover:text-red-200 transition-colors" />

              <div>
                <div className="flex items-center gap-1 mb-4 text-amber-500">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <p className="text-sm text-[#101010] leading-relaxed italic mb-6">
                  "{t.text}"
                </p>
              </div>

              <div className="pt-4 border-t border-[#E5E7EB]/80 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-[#101010]">{t.name}</h4>
                  <p className="text-xs text-[#5F6368]">{t.city} • <span className="text-[#E50914] font-medium">{t.car}</span></p>
                </div>
                <span className="p-1 rounded-full bg-emerald-100 text-emerald-600" title="Compra Verificada">
                  <ShieldCheck className="w-4 h-4" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
