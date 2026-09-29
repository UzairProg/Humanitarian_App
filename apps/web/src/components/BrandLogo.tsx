import React from 'react';

interface BrandLogoProps {
  size?: number;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ size = 38, className = '' }) => {
  return (
    <div
      className={className}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: `${Math.round(size * 0.22)}px`,
        backgroundColor: '#0b1f2a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1.5px solid #c6a24a',
        boxShadow: '0 2px 6px rgba(11, 31, 42, 0.2)',
        position: 'relative',
        flexShrink: 0,
        userSelect: 'none',
      }}
      aria-label="Al-Husseiniya Emblem"
    >
      <svg
        width={Math.round(size * 0.72)}
        height={Math.round(size * 0.72)}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Subtle geometric inner frame */}
        <rect
          x="3"
          y="3"
          width="34"
          height="34"
          rx="6"
          stroke="#deb95f"
          strokeWidth="1"
          strokeOpacity="0.3"
        />
        {/* Calligraphic Arabic Letter 'Haa' (ح) for Al-Husseiniya */}
        <path
          d="M 12 16 C 14 13.5, 24 13.5, 27 15.5 C 29 16.8, 27.5 19.5, 23 20 C 17 20.8, 13 24, 13 28.5 C 13 33, 19 35, 25 33.5 C 28 32.8, 30 31, 31 29.5"
          stroke="#deb95f"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};
