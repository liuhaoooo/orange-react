
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

export const FormRow = ({ label, children, required = false, error, className = "", alignTop = false }: { label: string; children?: React.ReactNode; required?: boolean; error?: string; className?: string; alignTop?: boolean }) => (
  <div className={`flex flex-col sm:flex-row ${alignTop ? 'items-start' : 'sm:items-center'} py-4 border-b border-gray-100 last:border-0 ${className}`}>
    <div className={`w-full sm:w-1/3 mb-2 sm:mb-0 ${alignTop ? 'pt-2' : ''}`}>
      <label className="font-bold text-sm text-black">
        {required && <span className="text-orange me-1">*</span>}
        {label}
      </label>
    </div>
    <div className={`w-full sm:w-2/3 flex flex-col ${alignTop ? 'justify-start' : 'justify-center'} items-end`}>
         <div className={`w-full flex ${alignTop ? 'items-start' : 'items-center'} justify-start sm:justify-end`}>
            {children}
         </div>
         {error && <div className="text-red-500 text-xs mt-1 w-full text-end">{error}</div>}
    </div>
  </div>
);

export const StyledInput = ({ hasError, suffix, className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement> & { hasError?: boolean; suffix?: string }) => (
  <div className={`relative w-full ${className}`}>
    <input
      {...props}
      className={`w-full border px-3 py-2 text-sm text-black outline-none transition-all rounded-[2px] bg-white placeholder-gray-400 h-10 ${hasError ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-orange focus:ring-1 focus:ring-orange'} ${suffix ? 'pe-16' : ''} ${props.disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
    />
    {suffix && (
      <div className="absolute right-0 top-0 bottom-0 flex items-center justify-center px-4 bg-[#f3f4f6] border-l border-gray-300 text-gray-500 text-sm rounded-r-[2px]">
          {suffix}
      </div>
    )}
  </div>
);

export const StyledTextarea = ({ hasError, className = "", ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { hasError?: boolean }) => (
  <textarea
    {...props}
    className={`w-full border px-3 py-2 text-sm text-black outline-none transition-all rounded-[2px] bg-white min-h-[120px] resize-y font-sans ${hasError ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-orange focus:ring-1 focus:ring-orange'} ${className}`}
  />
);

export const StyledSelect = ({ value, onChange, options, className = "", disabled = false, hasError = false }: { value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, options: { label?: string; name?: string; value: string }[], className?: string, disabled?: boolean, hasError?: boolean }) => (
  <div className={`relative w-full ${className}`}>
    <select
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`w-full border px-3 py-2 text-sm text-black outline-none transition-all rounded-[2px] appearance-none bg-white cursor-pointer h-10 ${hasError ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-orange focus:ring-1 focus:ring-orange'} ${disabled ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''}`}
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label || opt.name}</option>
      ))}
    </select>
    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
        <ChevronDown size={16} />
    </div>
  </div>
);

export const RadioGroup = ({ options, value, onChange, className = "" }: { options: { label: string; value: any }[], value: any, onChange: (val: any) => void, className?: string }) => (
  <div className={`flex flex-wrap gap-4 sm:gap-6 items-center ${className}`}>
    {options.map((opt) => (
      <label key={opt.label} className="flex items-center cursor-pointer select-none group">
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center me-2 transition-colors shrink-0 ${value === opt.value ? 'border-black' : 'border-gray-300 group-hover:border-gray-400'}`}>
            {value === opt.value && <div className="w-2.5 h-2.5 rounded-full bg-black"></div>}
        </div>
        <span className={`text-sm font-bold ${value === opt.value ? 'text-black' : 'text-gray-500 group-hover:text-gray-700'}`}>{opt.label}</span>
        <input 
            type="radio" 
            className="hidden" 
            checked={value === opt.value} 
            onChange={() => onChange(opt.value)} 
        />
      </label>
    ))}
  </div>
);

export const PrimaryButton = ({ onClick, disabled, loading, children, className = "", icon }: { onClick?: (e?: any) => void; disabled?: boolean; loading?: boolean; children: React.ReactNode; className?: string; icon?: React.ReactNode }) => (
    <button
        onClick={onClick}
        disabled={disabled || loading}
        className={`
            font-bold py-2.5 px-12 text-sm transition-all rounded-[2px] shadow-sm uppercase tracking-wide flex items-center justify-center min-w-[120px] border-2
            bg-white border-black text-black hover:bg-black hover:text-white
            disabled:!bg-[#e0e0e0] disabled:!border-[#e0e0e0] disabled:!text-[#a0a0a0] disabled:cursor-not-allowed disabled:shadow-none disabled:!opacity-100
            ${className}
        `}
    >
        {loading ? <Loader2 className="animate-spin w-4 h-4 me-2" /> : (icon ? <span className="me-2">{icon}</span> : null)}
        {children}
    </button>
);
