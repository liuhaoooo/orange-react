
import React from 'react';
import { Card, CardHeader } from './UIComponents';
import { useLanguage } from '../utils/i18nContext';
import { Link } from 'react-router-dom';

const DonutChart = ({ value, label, unit, percentage }: { value: number, label: string, unit: string, percentage: number }) => {
  return (
    <div className="flex flex-col items-center">
      <span className="text-base font-bold mb-3 text-black">{label}</span>
      <div className="relative w-40 h-40 rounded-full flex items-center justify-center bg-gray-100"
           style={{
             background: `conic-gradient(#ff7900 ${percentage}%, #f2f2f2 ${percentage}% 100%)`
           }}
      >
        <div className="absolute w-28 h-28 bg-white rounded-full flex flex-col items-center justify-center">
             <span className="text-2xl font-bold text-black leading-none mb-1">{value.toFixed(1)}</span>
             <span className="text-base font-bold text-gray-500 leading-none">{unit}</span>
        </div>
      </div>
    </div>
  );
};

export const UsageCard: React.FC = () => {
  const { t } = useLanguage();

  return (
    <Card className="h-full flex flex-col">
      <CardHeader title={t('usage')} />
      
      <div className="p-6 flex-1 flex flex-col">
        {/* Charts Area */}
        <div className="flex justify-around items-center w-full mt-8">
          <DonutChart 
            value={465.7} 
            percentage={45} 
            label={t('national')} 
            unit="GB" 
          />
          <DonutChart 
            value={931.3} 
            percentage={15} 
            label={t('international')} 
            unit="GB" 
          />
        </div>

        {/* Button Area - Pushed to bottom */}
        <div className="mt-auto pt-6">
             <Link to="/usage" className="inline-block bg-orange hover:bg-orange-dark text-black font-bold py-3 px-8 text-sm transition-colors rounded-none">
                {t('viewUsage')}
             </Link>
        </div>
      </div>
    </Card>
  );
};
