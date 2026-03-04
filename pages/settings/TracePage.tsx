import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../utils/i18nContext';
import { apiRequest, API_BASE_URL, getSessionId } from '../../utils/api';
import { FormRow, StyledInput, StyledSelect } from '../../components/UIComponents';
import { useAlert } from '../../utils/AlertContext';

export const TracePage: React.FC = () => {
  const { t } = useLanguage();
  const { showAlert } = useAlert();

  const [url, setUrl] = useState('');
  const [servicePort, setServicePort] = useState('');
  const [maximumHops, setMaximumHops] = useState('10');
  const [timeoutPeriod, setTimeoutPeriod] = useState('20');
  const [interfaceType, setInterfaceType] = useState('default');
  
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

  const stopTrace = async () => {
      setIsRunning(false);
      if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
      }
      try {
          await apiRequest(168, 'POST', {
              stopped: "1",
              port: -1,
              url: "",
              subcmd: 2,
              maximum_hops: "",
              timeouts: "",
              wan_index: ""
          });
      } catch (e) {
          console.error("Failed to stop trace", e);
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
                  body: JSON.stringify({ cmd: 204, url: "2", subcmd: 168, method: 'GET', sessionId })
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
                  stopTrace();
                  return;
              }
              
              if (textData) {
                  setOutput(textData);
              }
              
              const matchRes = textData.match(/traceroute to.*?\((.+?)\)/);
              if (matchRes) {
                  const addr = matchRes[1];
                  const infoLines = textData.split("\n").slice(1);
                  if (infoLines.some(info => info.includes(addr))) {
                      stopTrace();
                  }
              } else if (textData) {
                  stopTrace();
              }
              
          } catch (e) {
              console.error("Polling error", e);
              stopTrace();
          }
      }, 1000);
  };

  const handleStart = async () => {
      if (!url) {
          showAlert(t('emptyError') || 'Cannot be empty', 'error');
          return;
      }
      if (!maximumHops) {
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
              stopped: "0",
              port: servicePort || "",
              url: url,
              subcmd: 2,
              maximum_hops: maximumHops,
              timeouts: timeoutPeriod,
              wan_index: interfaceType === 'default' ? "" : interfaceType,
              method: 'POST'
          };
          const res = await apiRequest(168, 'POST', payload);
          if (res && res.success) {
              setTimeout(() => {
                  startPolling();
              }, 1500);
          } else {
              showAlert('Failed to start trace', 'error');
              setIsRunning(false);
          }
      } catch (e) {
          showAlert('Failed to start trace', 'error');
          setIsRunning(false);
      }
  };

  const handleStop = () => {
      stopTrace();
  };

  const handleClear = () => {
      setOutput('');
  };

  return (
    <div className="w-full max-w-4xl animate-fade-in py-2">
      <div className="space-y-0">
        
        <FormRow label="URL or IP Address" required>
            <StyledInput 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isRunning}
            />
        </FormRow>

        <FormRow label="Service Port">
            <StyledInput 
                value={servicePort}
                onChange={(e) => setServicePort(e.target.value)}
                disabled={isRunning}
            />
        </FormRow>

        <FormRow label="Maximum hops" required>
            <StyledInput 
                value={maximumHops}
                onChange={(e) => setMaximumHops(e.target.value)}
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

        <FormRow label="Interface">
            <StyledSelect
                value={interfaceType}
                onChange={(e) => setInterfaceType(e.target.value)}
                disabled={isRunning}
                options={[
                    { name: 'default', value: 'default' }
                ]}
            />
        </FormRow>

        <div className="flex justify-end space-x-4 pt-6 pb-4">
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

        <div className="pb-4 relative">
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
