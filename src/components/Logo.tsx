import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "h-10" }) => {
  return (
    <div className="flex items-center gap-2">
      <img src="/logo.png" alt="Jom Solution" className={`${className} w-auto object-contain`} />
      <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent hidden md:block">
        Jom
      </span>
    </div>
  );
};
