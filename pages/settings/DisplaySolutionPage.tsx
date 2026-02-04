
import React, { useState, useEffect } from 'react';
import { ChevronDown, Save, ChevronUp, Loader2 } from 'lucide-react';
import { fetchDisplaySolution, setDisplaySolution } from '../../utils/api';
import { useAlert } from '../../utils/AlertContext';

const FormRow = ({ label, children }: { label: string; children?: React.ReactNode }) => (
  <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-gray-100 last:border-0">
    <div className="w-full sm:w-1/3 mb-1 sm:mb-0">
      <label className="font-bold text-sm text-black">{label}</label>
    </div>
    <div className="w-full sm:w-2/3">
      {children}
    </div>
  </div>
);

const StyledSelect = ({ value, onChange, options }: { value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, options: string[] }) => (
  <div className="relative w-full">
    <select
      value={value}
      onChange={onChange}
      className="w-full border border-gray-300 px-3 py-2 text-sm text-gray-600 outline-none focus:border-orange focus:ring-1 focus:ring-orange transition-all rounded-[2px] appearance-none bg-white cursor-pointer"
    >
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
        <ChevronDown size={16} />
    </div>
  </div>
);

export const DisplaySolutionPage: React.FC = () => {
  const { showAlert } = useAlert();
  const [solution, setSolution] = useState('D');
  const [isExplanationOpen, setIsExplanationOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const res = await fetchDisplaySolution();
        if (res && (res.success || res.success === undefined)) {
          if (res.buffer) {
            setSolution(res.buffer);
          }
        }
      } catch (e) {
        console.error("Failed to fetch display solution", e);
        showAlert('Failed to load settings.', 'error');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [showAlert]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await setDisplaySolution(solution);
      if (res && (res.success || res.message === 'success' || res.result === 'success')) {
        showAlert('Settings saved successfully.', 'success');
      } else {
        showAlert('Failed to save settings.', 'error');
      }
    } catch (e) {
      console.error("Failed to set display solution", e);
      showAlert('An error occurred.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const tableData = [
    {
      desc: "Currently camping in an LTE cell (NSA is not supported), idle or connected",
      a: "4G", b: "4G", c: "4G", d: "4G"
    },
    {
      desc: "Currently camping in an LTE cell (supports NSA but no NR coverage is detected), idle state",
      a: "4G", b: "4G", c: "4G", d: "5G"
    },
    {
      desc: "Currently camping in an LTE cell (supports NSA and detects NR coverage), connected state",
      a: "4G", b: "4G", c: "5G", d: "5G"
    },
    {
      desc: "Currently camping in an LTE cell (supports NSA and detects NR coverage), idle state",
      a: "4G", b: "5G", c: "5G", d: "5G"
    },
    {
      desc: "Currently camped in LTE and NR cells (supports NSA), connected state",
      a: "5G", b: "5G", c: "5G", d: "5G"
    },
    {
      desc: "Currently resident in NR (SA), idle or connected state",
      a: "5G", b: "5G", c: "5G", d: "5G"
    },
  ];

  const getCellClass = (val: string) => {
      // 5G cells have a distinct gray background and white borders to match the design
      if (val === '5G') return "bg-[#b3b3b3] text-black border border-white";
      return "bg-white text-black";
  };

  if (loading) {
      return (
          <div className="w-full h-64 flex items-center justify-center">
              <Loader2 className="animate-spin text-orange" size={40} />
          </div>
      );
  }

  return (
    <div className="w-full animate-fade-in py-2">
      <FormRow label="4/5G display solution">
          <StyledSelect
            value={solution}
            onChange={(e) => setSolution(e.target.value)}
            options={['A', 'B', 'C', 'D']}
          />
      </FormRow>

      <div className="flex justify-end pt-12 pb-12">
        <button 
            onClick={handleSave}
            disabled={saving}
            className="bg-white border-2 border-black text-black hover:bg-black hover:text-white font-bold py-2.5 px-12 text-sm transition-all rounded-[2px] shadow-sm uppercase tracking-wide flex items-center"
        >
            {saving ? <Loader2 className="animate-spin w-4 h-4 me-2" /> : <Save size={18} className="me-2" />}
            Save
        </button>
      </div>

      {/* Explanation Section */}
      <div>
        <div
            className="flex items-center cursor-pointer mb-6"
            onClick={() => setIsExplanationOpen(!isExplanationOpen)}
        >
            <div className="bg-black rounded-full w-5 h-5 flex items-center justify-center me-3 text-white shrink-0">
                <span className="font-bold text-sm">?</span>
            </div>
            <span className="text-xl text-gray-700 me-auto">Explanation</span>
            {isExplanationOpen ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
        </div>

        {isExplanationOpen && (
            <div className="overflow-x-auto pb-4">
                <div className="min-w-[800px] grid grid-cols-12 gap-0 text-sm">
                    {/* Header */}
                    <div className="col-span-4 p-4"></div>
                    <div className="col-span-2 p-4 text-center font-normal text-black text-base">Configuration A</div>
                    <div className="col-span-2 p-4 text-center font-normal text-black text-base">Configuration B</div>
                    <div className="col-span-2 p-4 text-center font-normal text-black text-base">Configuration C</div>
                    <div className="col-span-2 p-4 text-center font-normal text-black text-base">Configuration D</div>

                    {/* Rows */}
                    {tableData.map((row, idx) => (
                        <React.Fragment key={idx}>
                            <div className="col-span-4 p-4 pe-8 text-black text-sm leading-relaxed flex items-center">
                                {row.desc}
                            </div>
                            <div className={`col-span-2 flex items-center justify-center p-4 text-base ${getCellClass(row.a)}`}>
                                {row.a}
                            </div>
                            <div className={`col-span-2 flex items-center justify-center p-4 text-base ${getCellClass(row.b)}`}>
                                {row.b}
                            </div>
                            <div className={`col-span-2 flex items-center justify-center p-4 text-base ${getCellClass(row.c)}`}>
                                {row.c}
                            </div>
                            <div className={`col-span-2 flex items-center justify-center p-4 text-base ${getCellClass(row.d)}`}>
                                {row.d}
                            </div>
                        </React.Fragment>
                    ))}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};
