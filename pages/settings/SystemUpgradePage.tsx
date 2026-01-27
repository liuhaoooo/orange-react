
import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, Loader2 } from 'lucide-react';

export const SystemUpgradePage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      alert('Only .bin files are allowed for system upgrade.');
    }
  };

  const handleUpgrade = () => {
      if (!file) return;
      setIsUpgrading(true);
      
      // Simulation of upgrade process
      setTimeout(() => {
          setIsUpgrading(false);
          alert("Upgrade simulation finished.");
          setFile(null);
      }, 3000);
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
            <div className="mb-6">
               {/* Cloud Icon styled to match screenshot */}
               <UploadCloud size={80} className="text-[#aab2bd] fill-[#dae1e7]" strokeWidth={1.5} />
            </div>
            <p className="text-[#666666] font-normal text-base text-center px-4">
              Drag .bin file here, or click to select .bin file to upgrade
            </p>
          </>
        )}
      </div>

      {file && (
        <div className="flex justify-end mt-8 animate-fade-in">
           <button 
                onClick={(e) => { e.stopPropagation(); handleUpgrade(); }}
                disabled={isUpgrading}
                className="bg-white border-2 border-black text-black hover:bg-black hover:text-white font-bold py-2.5 px-12 text-sm transition-all rounded-[2px] shadow-sm uppercase tracking-wide flex items-center min-w-[140px] justify-center"
           >
              {isUpgrading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Upgrade'}
           </button>
        </div>
      )}
    </div>
  );
};
