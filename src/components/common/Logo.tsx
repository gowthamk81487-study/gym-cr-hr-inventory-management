import React from 'react';

interface LogoProps {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className = 'h-8 w-8' }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`${className} text-slate-100 hover:text-blue-500 transition-colors duration-200 shrink-0`}
    >
      {/* Background shadow disk */}
      <circle cx="12" cy="12" r="10" stroke="none" fill="currentColor" fillOpacity="0.04" />
      
      {/* Barbell Bar */}
      <line x1="6" y1="12" x2="18" y2="12" />
      
      {/* Left Plate Stack */}
      <rect x="4" y="8" width="2" height="8" rx="1" fill="currentColor" />
      <rect x="2" y="9.5" width="2" height="5" rx="0.5" fill="currentColor" />
      
      {/* Right Plate Stack */}
      <rect x="18" y="8" width="2" height="8" rx="1" fill="currentColor" />
      <rect x="20" y="9.5" width="2" height="5" rx="0.5" fill="currentColor" />
      
      {/* Collars */}
      <rect x="6" y="11" width="1" height="2" rx="0.2" fill="currentColor" />
      <rect x="17" y="11" width="1" height="2" rx="0.2" fill="currentColor" />
    </svg>
  );
};

export default Logo;
