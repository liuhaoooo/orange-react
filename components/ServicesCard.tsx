import React, { useState } from 'react';
import { Card, CardHeader } from './UIComponents';
import { ChevronLeft, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../utils/i18nContext';

export const ServicesCard: React.FC = () => {
  const [mode, setMode] = useState<'menu' | 'keyboard'>('menu');
  const [displayValue, setDisplayValue] = useState('');
  const [inputValue, setInputValue] = useState('');
  const { t } = useLanguage();

  const handleKeyPress = (key: string) => {
    setInputValue(prev => prev + key);
  };

  const handleBackspace = () => {
    setInputValue(prev => prev.slice(0, -1));
  };

  const handleSend = () => {
    if (!inputValue) return;
    // Simulate sending logic (append to display screen)
    setDisplayValue(prev => prev + (prev ? '\n' : '') + `> ${inputValue}`);
    setInputValue('');
  };

  const handleCancel = () => {
    setInputValue('');
  };
  
  const goBack = () => {
      setMode('menu');
      setInputValue('');
      setDisplayValue('');
  };

  if (mode === 'menu') {
    return (
      <Card className="w-[300px] max-w-[300px] overflow-hidden">
        <CardHeader title={t('services')} showSettings={false} />
        <div className="flex-1 bg-[#f2f2f2] relative flex flex-col w-full">
           {/* Service List */}
           <div className="w-full">
              <button className="w-full py-4 px-4 text-start font-bold text-sm border-b border-gray-300 bg-transparent hover:bg-gray-200 text-black transition-colors truncate">{t('checkAirtime')}</button>
              <button className="w-full py-4 px-4 text-start font-bold text-sm border-b border-gray-300 bg-transparent hover:bg-gray-200 text-black transition-colors truncate">{t('checkBalance')}</button>
              <button className="w-full py-4 px-4 text-start font-bold text-sm border-b border-gray-300 bg-transparent hover:bg-gray-200 text-black transition-colors truncate">{t('checkNumber')}</button>
           </div>
           
           {/* Virtual Keyboard Button */}
           <div className="mt-auto mb-24 flex justify-center w-full px-4">
              <button 
                onClick={() => setMode('keyboard')}
                className="bg-[#f2f2f2] border-2 border-black px-6 py-2.5 font-bold text-sm text-black hover:bg-white transition-colors w-full max-w-[240px]"
              >
                {t('useKeyboard')}
              </button>
           </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-[300px] max-w-[300px] overflow-hidden">
        {/* Custom Header for Keyboard Mode */}
        <div className="bg-black text-white px-4 py-3 flex items-center shrink-0">
             <button onClick={goBack} className="me-2 hover:text-orange flex items-center transform rtl:rotate-180">
                <ChevronLeft className="w-6 h-6" />
             </button>
            <h2 className="font-bold text-lg">{t('services')}</h2>
        </div>
        
        <div className="p-4 bg-[#f2f2f2] flex-1 flex flex-col w-full">
            {/* Display Screen */}
            <div className="bg-[#f5f5f5] border border-gray-300 h-44 mb-4 p-2 text-sm font-mono break-all overflow-y-auto text-black shadow-inner whitespace-pre-wrap w-full text-start">
                {displayValue}
            </div>

            {/* Input Row */}
            <div className="flex space-x-3 mb-4 h-11 w-full rtl:space-x-reverse">
                <div className="flex-[1.2] bg-[#f5f5f5] border border-gray-300 flex items-center px-2 text-black font-bold tracking-widest overflow-hidden min-w-0 text-start">
                   {inputValue}
                </div>
                <button 
                    onClick={handleCancel} 
                    className="flex-1 bg-[#cccccc] text-black font-bold text-sm hover:bg-gray-400 transition-colors flex items-center justify-center min-w-0"
                >
                    {t('cancel')}
                </button>
                <button 
                    onClick={handleSend} 
                    className="flex-1 bg-white border-2 border-black text-black font-bold text-sm hover:bg-gray-100 transition-colors flex items-center justify-center min-w-0"
                >
                    {t('send')}
                </button>
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-3 gap-3 w-full">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, '*', 0, '#'].map((key) => (
                    <button 
                        key={key} 
                        onClick={() => handleKeyPress(key.toString())}
                        className="bg-white border-2 border-black h-11 text-lg font-bold hover:bg-gray-100 active:bg-gray-200 text-black shadow-sm flex items-center justify-center"
                    >
                        {key}
                    </button>
                ))}
            </div>
            
            {/* Backspace Row */}
            <div className="flex justify-end mt-3 w-full rtl:justify-start">
                 <button 
                    onClick={handleBackspace}
                    className="w-[calc(33.33%-0.5rem)] bg-white border-2 border-black h-11 flex items-center justify-center hover:bg-gray-100 active:bg-gray-200 shadow-sm"
                 >
                    <ArrowLeft className="w-5 h-5 text-black transform rtl:rotate-180" />
                 </button>
            </div>
        </div>
    </Card>
  );
};