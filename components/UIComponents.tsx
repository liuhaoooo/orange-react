
import React from 'react';
import { Check, X, Battery, BatteryWarning, BatteryCharging, Zap, Loader2, ChevronDown } from 'lucide-react';

export const CardHeader: React.FC<{ title: string; extraIcons?: React.ReactNode }> = ({ title, extraIcons }) => (
  <div className="bg-black text-white px-5 py-4 flex justify-between items-center shrink-0">
    <h2 className="font-bold text-xl">{title}</h2>
    <div className="flex items-center space-x-3">
      {extraIcons}
    </div>
  </div>
);

interface SquareSwitchProps {
  isOn: boolean;
  onChange?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export const SquareSwitch: React.FC<SquareSwitchProps> = ({ isOn, onChange, isLoading, disabled = false }) => {
  if (isLoading) {
    return (
      <div className="flex border border-gray-300 w-16 h-8 items-center justify-center bg-gray-50 select-none">
        <Loader2 className="animate-spin text-orange" size={18} />
      </div>
    );
  }

  return (
    <div 
      className={`flex border w-16 h-8 select-none transition-colors ${isOn ? 'border-orange' : 'border-black'} ${disabled ? 'opacity-40 cursor-not-allowed grayscale' : 'cursor-pointer'}`}
      onClick={!disabled ? onChange : undefined}
    >
      <div className={`flex-1 flex items-center justify-center transition-colors ${isOn ? 'bg-orange text-black' : 'bg-white'}`}>
        {isOn && <Check size={20} strokeWidth={3} />}
      </div>
      <div className={`flex-1 flex items-center justify-center transition-colors ${!isOn ? 'bg-black text-white' : 'bg-white'}`}>
        {!isOn && <X size={20} strokeWidth={3} />}
      </div>
    </div>
  );
};

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <div className={`bg-white shadow-sm flex flex-col overflow-hidden ${className}`}>
    {children}
  </div>
);

export const SignalStrengthIcon: React.FC<{ level: number, className?: string, barWidth?: string }> = ({ level, className = "h-8 w-10", barWidth = "w-1.5" }) => {
  return (
    <div className={`flex items-end justify-center space-x-1 ${className}`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className={`${barWidth} ${i <= level ? 'bg-orange' : 'bg-gray-300'}`}
          style={{ height: `${i * 20}%` }}
        />
      ))}
    </div>
  );
};

export const BatteryStatusIcon: React.FC<{ 
  status: string; 
  chargeStatus: string; 
  level: string; 
  size?: number;
  className?: string;
}> = ({ status, chargeStatus, level, size = 40, className = "" }) => {
  // 1. battery_status != '1' -> No Battery
  if (status !== '1') {
    return <BatteryWarning size={size} strokeWidth={1.5} className={`text-red-500 ${className}`} />;
  }

  // 2. battery_charge_status == '2' -> Fast Charging
  if (chargeStatus === '2') {
    return <Zap size={size} strokeWidth={1.5} className={`fill-orange text-orange ${className}`} />;
  }

  // 3. battery_charge_status == '1' -> Normal Charging
  if (chargeStatus === '1') {
    return <BatteryCharging size={size} strokeWidth={1.5} className={className} />;
  }

  // 4. Normal Battery
  return <Battery size={size} strokeWidth={1.5} className={className} />;
};

// --- Standardized Form Components ---

export const FormRow = ({ label, children, required = false, error, className = "" }: { label: string; children?: React.ReactNode; required?: boolean; error?: string; className?: string }) => (
  <div className={`flex flex-col sm:flex-row sm:items-center py-4 border-b border-gray-100 last:border-0 ${className}`}>
    <div className="w-full sm:w-1/3 mb-2 sm:mb-0">
      <label className="font-bold text-sm text-black">
        {required && <span className="text-orange me-1">*</span>}
        {label}
      </label>
    </div>
    <div className="w-full sm:w-2/3 flex flex-col items-end">
         <div className="w-full flex justify-start sm:justify-end items-center">
            {children}
         </div>
         {error && <div className="text-red-500 text-xs mt-1 w-full text-end">{error}</div>}
    </div>
  </div>
);

export const StyledInput = ({ hasError, className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement> & { hasError?: boolean }) => (
  <input
    {...props}
    className={`w-full border px-3 py-2 text-sm text-black outline-none transition-all rounded-[2px] bg-white placeholder-gray-400 h-10 ${hasError ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-orange focus:ring-1 focus:ring-orange'} ${className}`}
  />
);

export const StyledSelect = ({ value, onChange, options, className = "", disabled = false }: { value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, options: { name: string, value: string }[], className?: string, disabled?: boolean }) => (
  <div className={`relative w-full ${className}`}>
    <select
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`w-full border border-gray-300 px-3 py-2 text-sm text-gray-600 outline-none focus:border-orange focus:ring-1 focus:ring-orange transition-all rounded-[2px] appearance-none bg-white cursor-pointer h-10 ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.name}</option>
      ))}
    </select>
    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
        <ChevronDown size={16} />
    </div>
  </div>
);

export const PrimaryButton = ({ onClick, disabled, loading, children, className = "", icon }: { onClick?: () => void; disabled?: boolean; loading?: boolean; children: React.ReactNode; className?: string; icon?: React.ReactNode }) => (
    <button
        onClick={onClick}
        disabled={disabled || loading}
        className={`bg-white border-2 border-black text-black hover:bg-black hover:text-white font-bold py-2.5 px-12 text-sm transition-all rounded-[2px] shadow-sm uppercase tracking-wide flex items-center justify-center min-w-[120px] ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
        {loading ? <Loader2 className="animate-spin w-4 h-4 me-2" /> : (icon ? <span className="me-2">{icon}</span> : null)}
        {children}
    </button>
);
