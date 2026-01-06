import React from 'react';
import { Card, CardHeader } from './UIComponents';
import { RotateCcw, ArrowUp, ArrowDown } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useLanguage } from '../utils/i18nContext';

const dataNational = [
  { name: 'Used', value: 1.2 },
  { name: 'Remaining', value: 100 }, // Mock remaining
];
const dataInternational = [
  { name: 'Used', value: 0 },
  { name: 'Remaining', value: 100 },
];

const COLORS_NATIONAL = ['#000000', '#e5e5e5'];
const COLORS_INTERNATIONAL = ['#ffcc00', '#e5e5e5'];

const CircularProgress = ({ value, label, unit, colors }: { value: string, label: string, unit: string, colors: string[] }) => (
  <div className="flex flex-col items-center">
    <div className="relative w-24 h-24">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={[{ value: parseFloat(value) }, { value: 100 - parseFloat(value) }]}
            innerRadius={32}
            outerRadius={42}
            startAngle={90}
            endAngle={-270}
            dataKey="value"
            stroke="none"
          >
            {dataNational.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-xs font-bold text-black">
        <span>{value}</span>
        <span>{unit}</span>
      </div>
    </div>
    <span className="text-xs font-bold mt-1 text-black">{label}</span>
  </div>
);

export const UsageCard: React.FC = () => {
  const { t } = useLanguage();

  return (
    <Card>
      <CardHeader 
        title={t('usage')} 
        extraIcons={<RotateCcw className="w-5 h-5 cursor-pointer hover:text-orange transform -scale-x-100" />} // Approximate refresh icon
      />
      
      <div className="p-4 pb-0">
        <h3 className="font-bold text-sm mb-4 text-black">{t('myUsage')}</h3>
        <div className="flex justify-around mb-6">
          <CircularProgress value="1.20" unit="GB" label={t('national')} colors={COLORS_NATIONAL} />
          <CircularProgress value="0.00" unit="MB" label={t('international')} colors={COLORS_INTERNATIONAL} />
        </div>

        <div className="border-t border-gray-200 pt-3">
          <h3 className="font-bold text-sm mb-2 text-black">{t('currentSession')}</h3>
          
          <div className="flex text-xs mb-1 text-black">
             <div className="flex items-center justify-center w-1/2">
                <ArrowUp className="w-3 h-3 me-1" /> 78.75 MB
             </div>
             <div className="flex items-center justify-center w-1/2">
                <ArrowUp className="w-3 h-3 me-1" /> 0.00 MB
             </div>
          </div>
          <div className="flex text-xs font-bold mb-1 text-black">
             <div className="flex items-center justify-center w-1/2">
                <ArrowDown className="w-3 h-3 me-1" /> 1.13 GB
             </div>
             <div className="flex items-center justify-center w-1/2">
                <ArrowDown className="w-3 h-3 me-1" /> 0.00 MB
             </div>
          </div>
          <div className="flex text-xs font-bold text-black">
             <div className="w-1/2 text-center">{t('national')}</div>
             <div className="w-1/2 text-center">{t('international')}</div>
          </div>
        </div>

        <div className="text-[10px] text-black mt-4 mb-2">
            {t('infoSource')}
        </div>
      </div>

      {/* Client Area Banner */}
      <div className="mt-auto bg-[#36a9e1] p-4 flex relative overflow-hidden h-[160px]">
        {/* Background Image Layer */}
        {/* TIP: Replace the url() below with your specific image URL */}
        <div 
            className="absolute inset-0 z-0 bg-cover bg-center rtl:transform rtl:-scale-x-100"
            style={{
                backgroundImage: "url('https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop')",
                opacity: 0.4, // Adjust opacity to blend with the blue background
                mixBlendMode: 'overlay' 
            }}
        />

        <div className="w-2/3 z-10 relative flex flex-col items-start h-full">
            <h3 className="font-bold text-xl mb-1 text-black opacity-90 leading-tight">{t('clientArea')}</h3>
            <p className="text-sm leading-tight mb-3 text-black opacity-80">
                {t('clientAreaDesc')}
            </p>
            <button className="mt-auto border border-black text-black text-xs font-bold px-4 py-1.5 hover:bg-white/10 transition-colors backdrop-blur-sm">
                {t('connect')}
            </button>
        </div>
      </div>
    </Card>
  );
};