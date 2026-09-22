import React from 'react';

export default function Logo({ className = 'h-10 w-auto', variant = 'dark' }) {
  const isWhite = variant === 'white';
  const textColor = isWhite ? '#FFFFFF' : '#101010';
  const subColor = isWhite ? '#CCCCCC' : '#444444';

  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      <svg
        viewBox="0 0 280 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-auto max-h-12"
      >
        {/* Red Japanese Enso Brush Circle */}
        <circle cx="32" cy="32" r="28" fill="#E50914" />
        {/* Inner stylized sumi-e ink brush arc */}
        <path
          d="M 12 32 C 12 18, 24 8, 38 8 C 48 8, 56 14, 58 22 C 55 18, 46 14, 36 15 C 22 17, 16 26, 17 36 C 18 46, 28 54, 40 52 C 50 50, 56 42, 57 36 C 54 44, 45 48, 35 48 C 22 48, 12 42, 12 32 Z"
          fill="#B80710"
          opacity="0.9"
        />
        <circle cx="32" cy="32" r="16" fill="#E50914" />
        <path
          d="M 22 28 Q 30 18 42 22 Q 46 30 38 38 Q 28 42 24 34 Z"
          fill="#FFFFFF"
          opacity="0.25"
        />

        {/* Word JAPA */}
        <text
          x="72"
          y="40"
          fill={textColor}
          fontFamily="system-ui, -apple-system, 'Inter', 'Segoe UI', sans-serif"
          fontWeight="900"
          fontSize="40"
          letterSpacing="-0.02em"
        >
          JAPA
        </text>

        {/* Word INTERMEDIAÇÕES */}
        <text
          x="73"
          y="56"
          fill={subColor}
          fontFamily="system-ui, -apple-system, 'Inter', 'Segoe UI', sans-serif"
          fontWeight="700"
          fontSize="11"
          letterSpacing="0.28em"
        >
          INTERMEDIAÇÕES
        </text>
      </svg>
    </div>
  );
}
