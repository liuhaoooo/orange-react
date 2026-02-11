
import React, { useState, useRef } from 'react';
import { FileText, Loader2 } from 'lucide-react';
import { ConfirmModal } from '../../components/ConfirmModal';
import { useAlert } from '../../utils/AlertContext';
import { uploadSystemUpdateFile, startSystemUpgrade } from '../../utils/api';
import { PrimaryButton } from '../../components/UIComponents';

export const SystemUpgradePage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showAlert } = useAlert();

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateFile(e.target.files[0]);
    }
  };

  const validateFile = (selectedFile: File) => {
    if (selectedFile.name.toLowerCase().endsWith('.bin')) {
      setFile(selectedFile);
    } else {
      showAlert('Only .bin files are allowed for system upgrade.', 'error', 'Invalid File');
    }
  };

  const handleUpgradeClick = () => {
      if (!file) return;
      setIsConfirmOpen(true);
  };

  const processUpgrade = async () => {
      if (!file) return;
      setIsConfirmOpen(false);
      setIsUpgrading(true);

      try {
          const uploadRes = await uploadSystemUpdateFile(file);
          
          if (!uploadRes.success) {
              showAlert(uploadRes.message || 'File upload failed', 'error', 'Upload Failed');
              setIsUpgrading(false);
              return;
          }

          try {
              const upgradeRes = await startSystemUpgrade(file.name);
              
              if (upgradeRes && upgradeRes.success === false) {
                   showAlert(upgradeRes.message || 'Upgrade failed', 'error', 'Upgrade Failed');
                   setIsUpgrading(false);
              } else {
                   showAlert('Upgrade started. The device will reboot automatically.', 'success', 'Upgrading');
              }
          } catch (e) {
              console.log("Upgrade trigger error (likely reboot)", e);
              showAlert('Upgrade started. The device is rebooting...', 'success', 'Upgrading');
          }

      } catch (e) {
          console.error(e);
          showAlert('An error occurred during the process.', 'error');
          setIsUpgrading(false);
      }
  };

  return (
    <div className="w-full animate-fade-in py-2">
      <div 
        className={`w-full h-72 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors select-none
          ${isDragging ? 'border-orange bg-orange/5' : 'border-[#cccccc] hover:border-gray-400 bg-white'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isUpgrading && fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept=".bin"
          onChange={handleFileSelect}
          disabled={isUpgrading}
        />

        {file ? (
          <div className="flex flex-col items-center animate-fade-in">
            <FileText size={64} className="text-gray-500 mb-4" strokeWidth={1.5} />
            <p className="text-black font-bold text-lg">{file.name}</p>
            <p className="text-gray-500 text-sm mt-1">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
            <p className="text-orange text-sm mt-6 font-bold hover:underline">Click or Drag to change file</p>
          </div>
        ) : (
          <>
            <p className="text-[#666666] font-normal text-base text-center px-4">
              Drag .bin file here, or click to select .bin file to upgrade
            </p>
          </>
        )}
      </div>

      {file && (
        <div className="flex justify-end mt-8 animate-fade-in">
            <PrimaryButton 
                onClick={(e) => { e?.stopPropagation(); handleUpgradeClick(); }}
                disabled={isUpgrading}
                loading={isUpgrading}
            >
                Upgrade
            </PrimaryButton>
        </div>
      )}

      <ConfirmModal 
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={processUpgrade}
        title="System Upgrade"
        message="Are you sure you want to upgrade the system? The device will restart automatically."
      />
    </div>
  );
};
