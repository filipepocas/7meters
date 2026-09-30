/**
 * 7meters - Jersey Visual Component (SVG Kit Renderer)
 * Renderizador de camisolas de andebol com gola desportiva, mangas curtas,
 * padrões personalizados (riscas verticais, horizontais, diagonal, etc.) e patrocinador frontal.
 */

import React from 'react';
import { JerseyConfig } from '../../types/club.types';

interface JerseyVisualProps {
  jersey: JerseyConfig;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const JerseyVisual: React.FC<JerseyVisualProps> = ({ jersey, className = '', size = 'md' }) => {
  const sizeMap = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-28 h-28',
    xl: 'w-44 h-44',
  };

  const pColor = jersey.primaryColor || '#003399';
  const sColor = jersey.secondaryColor || '#FFCC00';
  const pattern = jersey.patternType || 'solid';
  const sponsor = jersey.chestSponsorName || '7METERS';

  return (
    <div className={`relative inline-block ${sizeMap[size]} ${className}`}>
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <clipPath id={`jersey-clip-${jersey.id}`}>
            {/* Handball jersey silhouette */}
            <path d="M 25 10 L 38 18 L 62 18 L 75 10 L 92 34 L 78 45 L 75 38 L 75 92 L 25 92 L 25 38 L 22 45 L 8 34 Z" />
          </clipPath>
        </defs>

        {/* Outline / Drop border */}
        <path
          d="M 25 10 L 38 18 L 62 18 L 75 10 L 92 34 L 78 45 L 75 38 L 75 92 L 25 92 L 25 38 L 22 45 L 8 34 Z"
          fill={pColor}
          stroke="#000000"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        {/* Pattern Inner Group */}
        <g clipPath={`url(#jersey-clip-${jersey.id})`}>
          {pattern === 'stripes_vertical' && (
            <>
              <rect x="33" y="0" width="10" height="100" fill={sColor} />
              <rect x="57" y="0" width="10" height="100" fill={sColor} />
            </>
          )}

          {pattern === 'stripes_horizontal' && (
            <>
              <rect x="0" y="28" width="100" height="12" fill={sColor} />
              <rect x="0" y="52" width="100" height="12" fill={sColor} />
              <rect x="0" y="76" width="100" height="12" fill={sColor} />
            </>
          )}

          {pattern === 'diagonal' && (
            <polygon points="10,0 35,0 90,100 65,100" fill={sColor} />
          )}

          {pattern === 'modern_abstract' && (
            <>
              <polygon points="25,10 75,90 25,90" fill={sColor} opacity="0.4" />
              <polygon points="75,10 50,50 75,90" fill={sColor} />
            </>
          )}

          {/* Sleeves details */}
          <path d="M 8 34 L 22 45 L 25 38 L 18 24 Z" fill={sColor} opacity="0.8" />
          <path d="M 92 34 L 78 45 L 75 38 L 82 24 Z" fill={sColor} opacity="0.8" />

          {/* Collar */}
          <path
            d="M 38 18 Q 50 30 62 18"
            stroke="#000000"
            strokeWidth="3.5"
            fill={sColor}
          />

          {/* Chest Sponsor text */}
          <text
            x="50"
            y="56"
            textAnchor="middle"
            fill={sColor}
            stroke="#000"
            strokeWidth="0.5"
            fontSize="9"
            fontWeight="900"
            fontFamily="monospace"
          >
            {sponsor.slice(0, 8)}
          </text>

          {/* 7meters badge small */}
          <circle cx="36" cy="32" r="3.5" fill="#FFCC00" stroke="#000" strokeWidth="1" />
        </g>
      </svg>
    </div>
  );
};
