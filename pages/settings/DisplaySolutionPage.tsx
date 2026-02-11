
import React, { useState, useEffect } from 'react';
import { Save, ChevronUp, ChevronDown, Loader2 } from 'lucide-react';
import { fetchDisplaySolution, setDisplaySolution } from '../../utils/api';
import { useAlert } from '../../utils/AlertContext';
import { FormRow, StyledSelect, PrimaryButton } from '../../components/UIComponents';

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
      <div className="max-w-4xl">
        <FormRow label="4/5G display solution">
            <StyledSelect
                value={solution}
                onChange={(e) => setSolution(e.target.value)}
                options={['A', 'B', 'C', 'D'].map(v => ({ label: v, value: v }))}
            />
        </FormRow>

        <div className="flex justify-end pt-12 pb-12">
            <PrimaryButton 
                onClick={handleSave}
                loading={saving}
                icon={<Save size={18} />}
            >
                Save
            </PrimaryButton>
        </div>

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
                        <div className="col-span-4 p-4"></div>
                        <div className="col-span-2 p-4 text-center font-normal text-black text-base">Configuration A</div>
                        <div className="col-span-2 p-4 text-center font-normal text-black text-base">Configuration B</div>
                        <div className="col-span-2 p-4 text-center font-normal text-black text-base">Configuration C</div>
                        <div className="col-span-2 p-4 text-center font-normal text-black text-base">Configuration D</div>

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
    </div>
  );
};
