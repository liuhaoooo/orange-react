
import React from 'react';
import { Card, CardHeader } from './UIComponents';
import { RotateCcw, ArrowUp, ArrowDown } from 'lucide-react';
import { useLanguage } from '../utils/i18nContext';

// Simple CSS-based Donut Chart Component
const DonutChart = ({ value, total, color, label, unit }: { value: number, total: number, color: string, label: string, unit: string }) => {
  const percentage = Math.min(100, Math.max(0, (value / total) * 100));
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24 rounded-full flex items-center justify-center bg-gray-200"
           style={{
             background: `conic-gradient(${color} ${percentage}%, #e5e5e5 ${percentage}% 100%)`
           }}
      >
        {/* Inner white circle to create donut effect */}
        <div className="absolute w-16 h-16 bg-white rounded-full flex flex-col items-center justify-center">
             <span className="text-sm font-bold text-black leading-none">{value.toFixed(2)}</span>
             <span className="text-xs font-bold text-gray-500 leading-none">{unit}</span>
        </div>
      </div>
      <span className="text-xs font-bold mt-2 text-black">{label}</span>
    </div>
  );
};

export const UsageCard: React.FC = () => {
  const { t } = useLanguage();

  return (
    <Card className="h-full">
      <CardHeader 
        title={t('usage')} 
        extraIcons={<RotateCcw className="w-5 h-5 cursor-pointer hover:text-orange transform -scale-x-100" />} 
      />
      
      <div className="p-4 pb-0 flex-1 flex flex-col">
        <h3 className="font-bold text-sm mb-4 text-black">{t('myUsage')}</h3>
        
        {/* Charts Area */}
        <div className="flex justify-around mb-6">
          <DonutChart 
            value={1.20} 
            total={100} 
            color="#000000" 
            label={t('national')} 
            unit="GB" 
          />
          <DonutChart 
            value={0.00} 
            total={100} 
            color="#ffcc00" 
            label={t('international')} 
            unit="MB" 
          />
        </div>

        {/* Stats Table */}
        <div className="border-t border-gray-200 pt-3 mt-auto mb-4">
          <h3 className="font-bold text-sm mb-2 text-black">{t('currentSession')}</h3>
          
          {/* Upload Row */}
          <div className="flex text-xs mb-1 text-black">
             <div className="flex items-center justify-center w-1/2 text-gray-600">
                <ArrowUp className="w-3 h-3 me-1" /> 78.75 MB
             </div>
             <div className="flex items-center justify-center w-1/2 text-gray-600">
                <ArrowUp className="w-3 h-3 me-1" /> 0.00 MB
             </div>
          </div>
          
          {/* Download Row */}
          <div className="flex text-xs font-bold mb-1 text-black">
             <div className="flex items-center justify-center w-1/2">
                <ArrowDown className="w-3 h-3 me-1" /> 1.13 GB
             </div>
             <div className="flex items-center justify-center w-1/2">
                <ArrowDown className="w-3 h-3 me-1" /> 0.00 MB
             </div>
          </div>
          
          {/* Labels Row */}
          <div className="flex text-xs font-bold text-black mt-2">
             <div className="w-1/2 text-center border-r border-gray-200">{t('national')}</div>
             <div className="w-1/2 text-center">{t('international')}</div>
          </div>
        </div>

        <div className="text-[10px] text-gray-400 mt-2 mb-2 text-center">
            {t('infoSource')}
        </div>
      </div>

      {/* Client Area Banner */}
      <div className="mt-auto bg-[#36a9e1] p-4 flex relative overflow-hidden h-[140px] shrink-0">
        <div 
            className="absolute inset-0 z-0 bg-cover bg-center rtl:transform rtl:-scale-x-100"
            style={{
                backgroundImage: "url('https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop')",
                opacity: 0.4, 
                mixBlendMode: 'overlay' 
            }}
        />

        <div className="w-3/4 z-10 relative flex flex-col items-start h-full justify-between">
            <div>
                <h3 className="font-bold text-lg mb-1 text-black opacity-90 leading-tight">{t('clientArea')}</h3>
                <p className="text-xs leading-tight mb-2 text-black opacity-80">
                    {t('clientAreaDesc')}
                </p>
            </div>
            <button className="border border-black text-black text-xs font-bold px-4 py-1.5 hover:bg-white/20 transition-colors backdrop-blur-sm self-start">
                {t('connect')}
            </button>
        </div>
      </div>
    </Card>
  );
};
