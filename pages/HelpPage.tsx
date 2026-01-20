
import React, { useState } from 'react';
import { useLanguage } from '../utils/i18nContext';
import { useGlobalState } from '../utils/GlobalStateContext';
import { FileText } from 'lucide-react';

export const HelpPage: React.FC = () => {
  const { t } = useLanguage();
  const { globalData } = useGlobalState();
  const statusInfo = globalData.statusInfo || {};
  
  const [activeTab, setActiveTab] = useState<'info' | 'faq'>('info');

  const getNetworkStatusText = () => {
    if (statusInfo.network_status === "1") return t('connected');
    return t('notConnected');
  };

  return (
    <div className="w-full">
      {/* Header Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('info')}
          className={`px-4 py-3 font-bold text-sm border-b-4 transition-colors ${
            activeTab === 'info'
              ? 'text-orange border-orange'
              : 'text-black border-transparent hover:border-gray-200'
          }`}
        >
          {t('usefulInformation')}
        </button>
        <button
          onClick={() => setActiveTab('faq')}
          className={`px-4 py-3 font-bold text-sm border-b-4 transition-colors ${
            activeTab === 'faq'
              ? 'text-orange border-orange'
              : 'text-black border-transparent hover:border-gray-200'
          }`}
        >
          {t('faq')}
        </button>
      </div>

      {/* Content */}
      <div className="animate-fade-in">
        {activeTab === 'info' ? (
          <div className="space-y-6">
            {/* My Information Section */}
            <div className="bg-white border border-gray-300 p-6">
              <h2 className="text-lg font-bold text-black mb-4">{t('myInformation')}</h2>
              
              <div className="mb-4">
                <a href="#" className="text-blue-600 font-bold underline text-sm hover:text-blue-800">
                  {t('personalDataNotice')}
                </a>
              </div>

              <div className="space-y-3 text-sm text-black">
                <div className="flex">
                  <span className="text-gray-500 w-32 shrink-0">{t('phoneNumber')} :</span>
                  <span className="font-medium">{statusInfo.msisdn || '0612345678'}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-500 w-32 shrink-0">{t('model')} :</span>
                  <span className="font-medium">Airbox2</span>
                </div>
                <div className="flex">
                  <span className="text-gray-500 w-32 shrink-0">{t('firmware')} :</span>
                  <span className="font-medium">{statusInfo.sw_version || 'XX.XX.XXX.XX'}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-500 w-32 shrink-0">{t('type')} :</span>
                  <span className="font-medium">{statusInfo.hw_version || 'YY.YYY.YYY.YYY'}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-500 w-32 shrink-0">{t('apn')} :</span>
                  <span className="font-medium">{statusInfo.apn || 'orange-mib'}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-500 w-32 shrink-0">{t('networkStatus')} :</span>
                  <span className="font-medium">{getNetworkStatusText()}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-500 w-32 shrink-0">{t('version')} :</span>
                  <span className="font-medium">20250817_Revamp_001</span>
                </div>
              </div>
            </div>

            {/* Help & Support Section */}
            <div className="bg-white border border-gray-300 p-6">
              <h2 className="text-lg font-bold text-black mb-2">{t('helpSupport')}</h2>
              <p className="text-gray-500 text-sm mb-4">{t('helpSupportText')}</p>
              
              <div className="flex items-center">
                 <FileText className="w-5 h-5 text-black me-2" />
                 <a href="#" className="text-blue-600 font-bold underline text-sm hover:text-blue-800">
                   {t('userGuide')}
                 </a>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-200 border border-gray-300 h-[600px] flex flex-col items-center justify-center relative overflow-hidden">
             {/* Simulating a PDF Viewer container */}
             <div className="bg-white p-10 shadow-lg max-w-2xl w-full h-[90%] overflow-y-auto">
                <h1 className="text-3xl font-bold text-orange mb-2">Airbox 4G</h1>
                <h2 className="text-xl font-bold text-gray-700 mb-6">(U10E)</h2>
                <h2 className="text-2xl font-bold text-gray-500 mb-10">Quick Start Guide</h2>
                
                <div className="flex justify-center mb-10">
                   <div className="w-64 h-40 bg-black rounded-3xl flex items-center justify-center relative border-4 border-gray-800">
                        {/* Device Graphic Mockup */}
                        <div className="text-gray-600 text-xs">Device Image</div>
                   </div>
                </div>
                
                <div className="flex justify-between items-end mt-20">
                    <div className="w-8 h-8 bg-orange text-white rounded-full flex items-center justify-center font-bold">1</div>
                    <div className="bg-orange text-white px-2 py-1 font-bold text-xs">orange</div>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};
