
import React from 'react';

export const BedIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2 4v16" />
    <path d="M2 10h20" />
    <path d="M6 4v16" />
    <path d="M22 10v10" />
    <path d="M14 10v10" />
    <path d="M10 10v10" />
    <path d="M18 10v10" />
    <path d="M22 8h-6" />
    <path d="M8 8H2" />
    <path d="M14 8h-4" />
  </svg>
);
