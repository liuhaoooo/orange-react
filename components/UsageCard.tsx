
import React from 'react';
import { Card, CardHeader } from './UIComponents';
import { useLanguage } from '../utils/i18nContext';
import { useGlobalState } from '../utils/GlobalStateContext';
import { Link } from '../utils/GlobalStateContext';

const DonutChart = ({ value, label, unit, percentage }: { value: number, label: string, unit: string, percentage: number }) => {
  return (
    <div className="flex flex-col items-center">
      <span className="text-base font-bold mb-4 text-black">{label}</span>
      {/* Increased size from w-32/h-32 to w-40/h-40 */}
      <div className="relative w-40 h-40 rounded-full flex items-center justify-center bg-gray-100"
           style={{
             backgroundImage: `conic-gradient(#ff7900 ${percentage}%, #f2f2f2 ${percentage}% 100%)`
           }}
      >
        {/* Inner circle increased from w-24/h-24 to w-32/h-32 */}
        <div className="absolute w-32 h-32 bg-white rounded-full flex flex-col items-center justify-center">
             <span className="text-2xl font-bold text-black leading-none mb-1">{value.toFixed(1)}</span>
             <span className="text-base font-bold text-gray-500 leading-none">{unit}</span>
        </div>
      </div>
    </div>
  );
};

// Helper to convert MB string to { val, unit }
const formatTraffic = (mbStr: string | undefined) => {
  const mb = parseFloat(mbStr || '0');
  if (isNaN(mb)) return { val: 0, unit: 'MB' };

  if (mb >= 1024) {
    return { val: mb / 1024, unit: 'GB' };
  } else if (mb < 1 && mb > 0) {
    return { val: mb * 1024, unit: 'KB' };
  }
  return { val: mb, unit: 'MB' };
};

const getLimitInMb = (limit: string | undefined, unit: string | undefined) => {
  if (!limit) return 0;
  const val = parseFloat(limit);
  if (isNaN(val)) return 0;
  
  if (unit === '1') {
    return val * 1000;
  } else if (unit === '2') {
    return val * 1000000;
  }
  return val;
};

export const UsageCard: React.FC = () => {
  const { t } = useLanguage();
  const { globalData } = useGlobalState();
  const info = globalData.statusInfo;
  const flowLimitUnit = info?.flow_limit_unit;

  // 1. National Data
  const natUsedMb = (parseFloat(info?.dl_mon_flow || '0') + parseFloat(info?.ul_mon_flow || '0'));
  const natTotalMb = getLimitInMb(info?.nation_limit_size, flowLimitUnit);
  
  const natFormatted = formatTraffic(natUsedMb.toString());
  const natPercentage = natTotalMb > 0 ? (natUsedMb / natTotalMb) * 100 : 0;

  // 2. International Data
  const intUsedMb = (parseFloat(info?.roam_dl_mon_flow || '0') + parseFloat(info?.roam_ul_mon_flow || '0'));
  const intTotalMb = getLimitInMb(info?.internation_limit_size, flowLimitUnit);

  const intFormatted = formatTraffic(intUsedMb.toString());
  const intPercentage = intTotalMb > 0 ? (intUsedMb / intTotalMb) * 100 : 0;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader title={t('usage')} />
      
      <div className="p-6 flex-1 flex flex-col">
        {/* Charts Area */}
        <div className="flex justify-around items-center w-full mt-6 gap-6">
          <DonutChart 
            value={natFormatted.val} 
            percentage={natPercentage > 100 ? 100 : natPercentage} 
            label={t('national')} 
            unit={natFormatted.unit} 
          />
          <DonutChart 
            value={intFormatted.val} 
            percentage={intPercentage > 100 ? 100 : intPercentage} 
            label={t('international')} 
            unit={intFormatted.unit} 
          />
        </div>

        {/* Button Area - Pushed to bottom */}
        <div className="mt-auto pt-8">
             <Link to="/usage" className="inline-block bg-orange hover:bg-orange-dark text-black font-bold py-2.5 px-8 text-base transition-colors rounded-none">
                {t('viewUsage')}
             </Link>
        </div>
      </div>
    </Card>
  );
};
