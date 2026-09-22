import React from 'react';

export default function Logo({ className = 'h-12 w-auto', variant = 'dark' }) {
  const isFooter = variant === 'white';

  return (
    <div
      className={`select-none flex items-center ${
        isFooter ? 'rounded-xl bg-white px-3 py-2 shadow-sm' : ''
      } ${className}`}
    >
      <img
        src="/logo-japa-oficial.png"
        alt="JAPA Intermediações"
        className="h-full w-auto object-contain"
        draggable="false"
      />
    </div>
  );
}
