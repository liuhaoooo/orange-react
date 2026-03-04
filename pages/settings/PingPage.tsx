import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../utils/i18nContext';
import { apiRequest, API_BASE_URL, getSessionId } from '../../utils/api';
import { PrimaryButton, FormRow, StyledInput } from '../../components/UIComponents';
import { useAlert } from '../../utils/AlertContext';

export const PingPage: React.FC = () => {
  const { t } = useLanguage();
  const { showAlert } = useAlert();

  const [isInfinite, setIsInfinite] = useState(false);
  const [count, setCount] = useState('10');
  const [url, setUrl] = useState('');
  const [timeoutPeriod, setTimeoutPeriod] = useState('20');
  
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  
  const outputRef = useRef<HTMLTextAreaElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll to bottom
  useEffect(() => {
      if (outputRef.current) {
          setTimeout(() => {
              if (outputRef.current) {
                  outputRef.current.scrollTop = outputRef.current.scrollHeight;
              }
          }, 10);
      }
  }, [output]);

  useEffect(() => {
      return () => {
          if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
          }
      };
  }, []);

  const stopPing = async () => {
      setIsRunning(false);
      if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
      }
      try {
          await apiRequest(168, 'POST', {
              pingTimes: 0,
              url: "",
              subcmd: 0,
              timeouts: "",
              wan_index: ""
          });
      } catch (e) {
          console.error("Failed to stop ping", e);
      }
  };

  const startPolling = () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      
      pollIntervalRef.current = setInterval(async () => {
          try {
              const sessionId = getSessionId();
              const response = await fetch(API_BASE_URL, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ cmd: 204, url: "1", subcmd: 168, method: 'GET', sessionId })
              });
              
              const textData = await response.text();
              
              let isJson = false;
              try {
                  JSON.parse(textData);
                  isJson = true;
              } catch (e) {
                  isJson = false;
              }
              
              if (isJson) {
                  stopPing();
                  return;
              }
              
              if (textData) {
                  // Overwrite new data instead of appending
                  setOutput(textData);
              }
              
              if (textData.includes("ping statistics") || textData.startsWith("connect") || textData.startsWith("ping")) {
                  stopPing();
              }
              
          } catch (e) {
              console.error("Polling error", e);
              stopPing();
          }
      }, 1000);
  };

  const handleStart = async () => {
      if (!url) {
          showAlert(t('emptyError') || 'Cannot be empty', 'error');
          return;
      }
      if (!isInfinite && !count) {
          showAlert(t('emptyError') || 'Cannot be empty', 'error');
          return;
      }
      if (!timeoutPeriod) {
          showAlert(t('emptyError') || 'Cannot be empty', 'error');
          return;
      }

      setOutput('');
      setIsRunning(true);
      
      try {
          const payload = {
              cmd: 168,
              pingTimes: isInfinite ? "9999" : count,
              url: url,
              subcmd: 0,
              timeouts: timeoutPeriod,
              wan_index: "",
              method: 'POST'
          };
          const res = await apiRequest(168, 'POST', payload);
          if (res && res.success) {
              setTimeout(() => {
                  startPolling();
              }, 1500);
          } else {
              showAlert('Failed to start ping', 'error');
              setIsRunning(false);
          }
      } catch (e) {
          showAlert('Failed to start ping', 'error');
          setIsRunning(false);
      }
  };

  const handleStop = () => {
      stopPing();
  };

  const handleClear = () => {
      setOutput('');
  };

  return (
    <div className="w-full max-w-4xl animate-fade-in py-2">
      <div className="space-y-0">
        
        <FormRow label="Loop or Not">
            <label className="flex items-center space-x-2 cursor-pointer">
                <input 
                    type="checkbox" 
                    checked={isInfinite}
                    onChange={(e) => setIsInfinite(e.target.checked)}
                    className="w-4 h-4 text-orange border-gray-300 rounded focus:ring-orange"
                />
                <span className="text-sm text-gray-600">Infinite</span>
            </label>
        </FormRow>

        <FormRow label="Count" required>
            <StyledInput 
                value={count}
                onChange={(e) => setCount(e.target.value)}
                disabled={isInfinite || isRunning}
            />
        </FormRow>

        <FormRow label="URL or IP Address" required>
            <StyledInput 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isRunning}
            />
        </FormRow>

        <FormRow label="Timeout period" required>
            <StyledInput 
                value={timeoutPeriod}
                onChange={(e) => setTimeoutPeriod(e.target.value)}
                disabled={isRunning}
            />
        </FormRow>

        <div className="flex justify-end space-x-4 mt-8 mb-8">
            <button 
                onClick={handleStart} 
                disabled={isRunning}
                className={`w-24 px-4 py-2 font-bold text-sm transition-colors border-2 ${
                    isRunning 
                        ? 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed' 
                        : 'border-black bg-white text-black hover:bg-gray-50'
                }`}
            >
                Start
            </button>
            <button 
                onClick={handleStop}
                disabled={!isRunning}
                className={`w-24 px-4 py-2 font-bold text-sm transition-colors border-2 ${
                    !isRunning 
                        ? 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed' 
                        : 'border-black bg-gray-200 hover:bg-gray-300 text-black'
                }`}
            >
                Stop
            </button>
        </div>

        <div className="mb-4 mt-4 relative">
            <textarea
                ref={outputRef}
                value={output}
                readOnly
                className="w-full h-64 p-3 text-sm font-mono text-gray-700 bg-white border border-gray-300 rounded-[2px] resize-none focus:outline-none"
            />
            {isRunning && !output && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-gray-400 font-mono animate-pulse">Waiting for data...</span>
                </div>
            )}
        </div>

        <div className="flex justify-end">
            <button 
                onClick={handleClear} 
                className="w-24 px-4 py-2 font-bold text-sm transition-colors border-2 border-black bg-white text-black hover:bg-gray-50"
            >
                Clear
            </button>
        </div>

      </div>
    </div>
  );
};
