import React from 'react';

export const GeneralitatLogoIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 200 60"
    aria-labelledby="logoTitle"
  >
    <title id="logoTitle">Logo de la Generalitat de Catalunya</title>
    <g id="logo-mark" fill="black">
        <rect x="10" y="10" width="4" height="40" />
        <rect x="18" y="10" width="4" height="40" />
        <rect x="26" y="10" width="4" height="40" />
        <rect x="34" y="10" width="4" height="40" />
        <rect x="10" y="10" width="12" height="4" />
        <rect x="26" y="46" width="12" height="4" />
    </g>
    <g id="text" fontFamily="sans-serif">
        <text x="50" y="26" fontSize="20" fontWeight="bold">Generalitat</text>
        <text x="50" y="48" fontSize="20" fontWeight="bold">de Catalunya</text>
    </g>
  </svg>
);