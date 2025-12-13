
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export const BackButton: React.FC<{ className?: string, label?: string, onClick?: () => void }> = ({ className = '', label = 'Retour', onClick }) => {
  const navigate = useNavigate();
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(-1);
    }
  };
  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center text-sm font-medium text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors mb-6 ${className}`}
    >
      <ChevronLeft className="w-4 h-4 mr-1" />
      {label}
    </button>
  );
};
