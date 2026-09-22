import React, { useState } from 'react';
import { Heart, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

export default function VehicleCard({ vehicle, onSelectVehicle }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);

  const formatPrice = (val) => {
    return Number(val || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0
    });
  };

  const calculateInstallment = (price) => {
    const val = Number(price || 0);
    // Parcelamento simulado 12x
    const inst = Math.round(val / 12);
    return Number(inst).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0
    });
  };

  const photos = vehicle.fotos && vehicle.fotos.length > 0
    ? vehicle.fotos
    : ['/veiculo-sedan.webp'];

  const currentPhoto = photos[photoIndex] || photos[0];
  const mileage = vehicle.quilometragem !== undefined ? vehicle.quilometragem : (vehicle.km || 0);

  const prevPhoto = (e) => {
    e.stopPropagation();
    setPhotoIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  const nextPhoto = (e) => {
    e.stopPropagation();
    setPhotoIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="group bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col">
      {/* Photo Container */}
      <div 
        className="relative aspect-[16/10] overflow-hidden bg-slate-100 cursor-pointer"
        onClick={() => onSelectVehicle(vehicle)}
      >
        <img
          src={currentPhoto}
          alt={`${vehicle.marca} ${vehicle.modelo}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Top Left: Badge Seminovo */}
        <div className="absolute top-3 left-3 z-10 pointer-events-none">
          <span className="px-3 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-[#E50914] text-white shadow-sm">
            Seminovo
          </span>
        </div>

        {/* Top Right: Favorite Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsFavorite(!isFavorite);
          }}
          className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            isFavorite 
              ? 'bg-[#E50914] text-white' 
              : 'bg-white/90 text-slate-600 hover:bg-white hover:text-[#E50914]'
          } shadow-sm backdrop-blur-sm`}
          aria-label="Favoritar"
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-white' : ''}`} />
        </button>

        {/* Gallery Navigation Arrows */}
        {photos.length > 1 && (
          <>
            <button
              type="button"
              onClick={prevPhoto}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Foto anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={nextPhoto}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Próxima foto"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Title: Marca Modelo */}
          <div className="cursor-pointer" onClick={() => onSelectVehicle(vehicle)}>
            <h3 className="text-lg font-bold text-[#101010] group-hover:text-[#E50914] transition-colors truncate">
              {vehicle.marca} {vehicle.modelo}
            </h3>
          </div>

          {/* Specs row: Ano | KM | Câmbio */}
          <div className="text-xs text-[#5F6368] font-medium mt-1 mb-4 flex items-center gap-2">
            <span>{vehicle.anoFabricacao || vehicle.anoModelo}</span>
            <span>|</span>
            <span>{Number(mileage).toLocaleString('pt-BR')} km</span>
            <span>|</span>
            <span className="capitalize">{vehicle.cambio || 'Automático'}</span>
          </div>
        </div>

        {/* Bottom Row: Price & Details CTA */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-3">
          <div>
            <div className="text-xl sm:text-2xl font-black text-[#101010] tracking-tight">
              {formatPrice(vehicle.preco)}
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              Ou 12x de {calculateInstallment(vehicle.preco)}
            </div>
          </div>

          <button
            type="button"
            onClick={() => onSelectVehicle(vehicle)}
            className="inline-flex items-center gap-1.5 bg-[#E50914] hover:bg-[#B80710] text-white font-bold text-xs sm:text-sm py-2.5 px-4 rounded-full shadow-xs transition-colors flex-shrink-0"
          >
            <span>Ver detalhes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
