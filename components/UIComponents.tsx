
import React from 'react';
import { Check, X } from 'lucide-react';

export const CardHeader: React.FC<{ title: string; extraIcons?: React.ReactNode }> = ({ title, extraIcons }) => (
  <div className="bg-black text-white px-4 py-3 flex justify-between items-center shrink-0">
    <h2 className="font-bold text-lg">{title}</h2>
    <div className="flex items-center space-x-3">
      {extraIcons}
    </div>
  </div>
);

interface SquareSwitchProps {
  isOn: boolean;
  onChange?: () => void;
}

export const SquareSwitch: React.FC<SquareSwitchProps> = ({ isOn, onChange }) => {
  return (
    <div 
      className="flex border border-gray-400 w-16 h-8 cursor-pointer select-none"
      onClick={onChange}
    >
      <div className={`flex-1 flex items-center justify-center transition-colors ${isOn ? 'bg-black text-white' : 'bg-white text-black'}`}>
        {isOn && <Check size={18} strokeWidth={4} />}
      </div>
      <div className={`flex-1 flex items-center justify-center transition-colors ${!isOn ? 'bg-black text-white' : 'bg-white text-black'}`}>
        {!isOn && <X size={18} strokeWidth={4} />}
      </div>
    </div>
  );
};

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <div className={`bg-white shadow-sm flex flex-col overflow-hidden ${className}`}>
    {children}
  </div>
);
