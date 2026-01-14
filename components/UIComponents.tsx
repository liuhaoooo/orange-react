
import React from 'react';
import { Check, X, Battery, BatteryWarning, BatteryCharging, Zap } from 'lucide-react';

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
      className={`flex border w-16 h-8 cursor-pointer select-none transition-colors ${isOn ? 'border-orange' : 'border-gray-300'}`}
      onClick={onChange}
    >
      <div className={`flex-1 flex items-center justify-center transition-colors ${isOn ? 'bg-orange text-black' : 'bg-white'}`}>
        {isOn && <Check size={20} strokeWidth={3} />}
      </div>
      <div className={`flex-1 flex items-center justify-center transition-colors ${!isOn ? 'bg-gray-100 text-gray-400' : 'bg-white'}`}>
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
