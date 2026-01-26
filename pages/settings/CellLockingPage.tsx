
import React, { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';

// Custom Radio Option Component to match design
const RadioOption = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) => (
  <div className="flex items-center cursor-pointer me-8 select-none" onClick={onChange}>
    <div className={`w-5 h-5 rounded-full border flex items-center justify-center me-2 transition-all ${checked ? 'border-black' : 'border-gray-300'}`}>
        {checked && <div className="w-2.5 h-2.5 rounded-full bg-black"></div>}
    </div>
    <span className={`text-sm ${checked ? 'font-bold text-black' : 'text-gray-500'}`}>{label}</span>
  </div>
);

// Warning Banner Component
const WarningBanner = ({ title, text }: { title: string, text: string }) => (
    <div className="bg-[#fff8e1] p-4 mb-6 rounded-sm border-l-4 border-[#ff7900]/0"> {/* Using background color from screenshot */}
        <div className="flex items-center mb-1">
             <div className="bg-[#b45309] rounded-full w-4 h-4 flex items-center justify-center me-2 shrink-0">
                <span className="text-white font-bold text-xs">!</span>
             </div>
            <span className="font-bold text-sm text-[#b45309]">{title}</span>
        </div>
        <p className="text-[#b45309] text-sm leading-tight ps-6">{text}</p>
    </div>
);

interface CellData {
    id: string;
    earfcn: string;
    pci: string;
}

export const CellLockingPage: React.FC = () => {
    // State
    const [lock4g, setLock4g] = useState<'unlock' | 'lock'>('lock');
    const [list4g, setList4g] = useState<CellData[]>([
        { id: '1', earfcn: '111', pci: '222' },
        { id: '2', earfcn: '333', pci: '444' },
    ]);

    const [lock5g, setLock5g] = useState<'unlock' | 'lock'>('lock');
    const [list5g, setList5g] = useState<CellData[]>([
        { id: '1', earfcn: '12312', pci: '21' },
        { id: '2', earfcn: '423', pci: '33' },
    ]);

    // Render Table Helper
    const renderTable = (list: CellData[]) => (
        <div className="w-full border border-gray-200 mt-0">
            {/* Header */}
            <div className="grid grid-cols-12 bg-white border-b border-gray-200 py-3">
                 <div className="col-span-4 ps-4 font-bold text-sm text-black">EARFCN</div>
                 <div className="col-span-6 font-bold text-sm text-black">Physical Cell ID</div>
                 <div className="col-span-2"></div>
            </div>
            {/* Rows */}
            {list.map((item) => (
                 <div key={item.id} className="grid grid-cols-12 bg-white border-b border-gray-100 last:border-0 py-3 items-center hover:bg-gray-50 transition-colors">
                    <div className="col-span-4 ps-4 text-sm text-black font-medium">{item.earfcn}</div>
                    <div className="col-span-6 text-sm text-black font-medium">{item.pci}</div>
                    <div className="col-span-2 flex justify-end pe-4 space-x-3">
                        <button className="text-black hover:text-orange transition-colors"><Pencil size={15} /></button>
                        <button className="text-black hover:text-red-500 transition-colors"><Trash2 size={15} /></button>
                    </div>
                 </div>
            ))}
            {list.length === 0 && (
                <div className="py-4 text-center text-sm text-gray-400 italic">No cells locked</div>
            )}
        </div>
    );

    return (
        <div className="w-full animate-fade-in py-2">
             {/* Global Top Hint */}
             <WarningBanner 
                title="Important Hint" 
                text="This function is only used by professionals to debug the network. After the cell locking function is enabled, the device will only register to the cell network you set. If you modify it at will, the network service may be unavailable, which can be solved by turning off the cell locking function or Factory reset"
             />

             {/* 4G Section */}
             <div className="mb-10">
                <h2 className="text-base font-normal text-black mb-1">4G Locked Cell</h2>
                <div className="border-t border-gray-300 mb-6"></div>

                <div className="flex justify-between items-center mb-6">
                    <span className="font-bold text-sm text-black">Locked Status</span>
                    <span className="text-sm text-black font-medium">Unlocked</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center mb-8">
                    <span className="font-bold text-sm text-black w-56 mb-2 sm:mb-0">Local Physical Cell Locking</span>
                    <div className="flex items-center">
                        <RadioOption 
                            label="Unlock" 
                            checked={lock4g === 'unlock'} 
                            onChange={() => setLock4g('unlock')} 
                        />
                        <RadioOption 
                            label="Lock Specific Physical Cell" 
                            checked={lock4g === 'lock'} 
                            onChange={() => setLock4g('lock')} 
                        />
                    </div>
                </div>

                {lock4g === 'lock' && (
                    <div className="animate-fade-in">
                        <WarningBanner 
                            title="Important Hint"
                            text="The number of locked cells supported by 4G lock physical cells is:6"
                        />
                        
                        {renderTable(list4g)}

                        <div className="flex justify-end mt-4 space-x-4">
                            <button className="bg-white border-2 border-black text-black hover:bg-gray-50 font-bold py-1.5 px-8 text-sm transition-all rounded-[2px]">
                                Add
                            </button>
                            <button className="bg-white border-2 border-black text-black hover:bg-black hover:text-white font-bold py-1.5 px-8 text-sm transition-all rounded-[2px]">
                                Save
                            </button>
                        </div>
                    </div>
                )}
             </div>

             {/* 5G Section */}
             <div className="mb-8">
                <h2 className="text-base font-normal text-black mb-1">5G Locked Cell</h2>
                <div className="border-t border-gray-300 mb-6"></div>

                <div className="flex justify-between items-center mb-6">
                    <span className="font-bold text-sm text-black">Locked Status</span>
                    <span className="text-sm text-black font-medium">Unlocked</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center mb-8">
                    <span className="font-bold text-sm text-black w-56 mb-2 sm:mb-0">Local Physical Cell Locking</span>
                    <div className="flex items-center">
                        <RadioOption 
                            label="Unlock" 
                            checked={lock5g === 'unlock'} 
                            onChange={() => setLock5g('unlock')} 
                        />
                        <RadioOption 
                            label="Lock Specific Physical Cell" 
                            checked={lock5g === 'lock'} 
                            onChange={() => setLock5g('lock')} 
                        />
                    </div>
                </div>

                {lock5g === 'lock' && (
                    <div className="animate-fade-in">
                        <WarningBanner 
                            title="Important Hint"
                            text="The number of locked cells supported by 5G lock physical cells is:6"
                        />
                        
                        {renderTable(list5g)}

                        <div className="flex justify-end mt-4 space-x-4">
                            <button className="bg-white border-2 border-black text-black hover:bg-gray-50 font-bold py-1.5 px-8 text-sm transition-all rounded-[2px]">
                                Add
                            </button>
                            <button className="bg-white border-2 border-black text-black hover:bg-black hover:text-white font-bold py-1.5 px-8 text-sm transition-all rounded-[2px]">
                                Save
                            </button>
                        </div>
                    </div>
                )}
             </div>

        </div>
    );
};
