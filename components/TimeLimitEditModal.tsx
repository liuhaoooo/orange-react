import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertCircle } from 'lucide-react';
import { TimeLimitRule } from '../utils/api';
import { FormRow, StyledInput } from './UIComponents';

interface TimeLimitEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (rules: TimeLimitRule[]) => void;
  initialData: TimeLimitRule | null;
  prefilledMacs?: string[];
  existingRules: TimeLimitRule[];
  editingIndex: number | null;
}

const DAYS_OF_WEEK = [
  { label: 'Mon', value: '1' },
  { label: 'Tue', value: '2' },
  { label: 'Wed', value: '3' },
  { label: 'Thu', value: '4' },
  { label: 'Fri', value: '5' },
  { label: 'Sat', value: '6' },
  { label: 'Sun', value: '0' },
];

export const TimeLimitEditModal: React.FC<TimeLimitEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  prefilledMacs = [],
  existingRules,
  editingIndex
}) => {
  const [macAddress, setMacAddress] = useState('');
  const [startTime, setStartTime] = useState('00:00');
  const [endTime, setEndTime] = useState('23:59');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setMacAddress(initialData.mac);
        setStartTime(initialData.startTime);
        setEndTime(initialData.endTime);
        setSelectedDays(initialData.scheduleDays ? initialData.scheduleDays.split(',') : []);
      } else {
        setMacAddress(prefilledMacs.join(', '));
        setStartTime('00:00');
        setEndTime('23:59');
        setSelectedDays(['1', '2', '3', '4', '5', '6', '0']);
      }
      setErrors({});
    }
  }, [isOpen, initialData, prefilledMacs]);

  if (!isOpen) return null;

  const validateMac = (mac: string) => {
    const regex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
    return regex.test(mac.trim());
  };

  const validateTime = (time: string) => {
    const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    return regex.test(time);
  };

  const handleSave = () => {
    const newErrors: { [key: string]: string } = {};

    if (!macAddress.trim()) {
      newErrors.macAddress = 'MAC Address is required';
    } else {
      const macs = macAddress.split(',').map(m => m.trim());
      const invalidMacs = macs.filter(m => !validateMac(m));
      if (invalidMacs.length > 0) {
        newErrors.macAddress = 'Invalid MAC Address format';
      } else {
        // Check for duplicate MACs
        const existingMacs = new Set(
          existingRules
            .filter((_, idx) => idx !== editingIndex)
            .flatMap(r => r.mac.split(',').map(m => m.trim()))
        );
        const duplicateMacs = macs.filter(m => existingMacs.has(m));
        if (duplicateMacs.length > 0) {
          newErrors.macAddress = `MAC Address already exists: ${duplicateMacs.join(', ')}`;
        }
      }
    }

    if (!validateTime(startTime)) {
      newErrors.startTime = 'Invalid time format (HH:MM)';
    }

    if (!validateTime(endTime)) {
      newErrors.endTime = 'Invalid time format (HH:MM)';
    }

    if (selectedDays.length === 0) {
      newErrors.scheduleDays = 'Please select at least one day';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const cleanedMacs = macAddress.split(',').map(m => m.trim()).filter(Boolean).join(',');

    const newRules: TimeLimitRule[] = [{
      enableRule: initialData ? initialData.enableRule : true,
      mac: cleanedMacs,
      startTime: startTime,
      endTime: endTime,
      scheduleDays: selectedDays.join(',')
    }];

    onSave(newRules);
    onClose();
  };

  const toggleDay = (dayValue: string) => {
    setSelectedDays(prev => 
      prev.includes(dayValue) ? prev.filter(d => d !== dayValue) : [...prev, dayValue]
    );
    setErrors(prev => ({ ...prev, scheduleDays: '' }));
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg shadow-2xl relative animate-fade-in text-black border border-gray-300">
        <div className="flex justify-between items-center p-6 pb-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-black">
            {initialData ? 'Edit Rule' : 'Add Rule'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-8 pb-8 pt-6">
          <div className="bg-[#fff8e6] text-[#b38000] p-3 rounded-[2px] mb-6 flex items-center text-sm">
            <AlertCircle size={16} className="me-2 shrink-0" />
            Use when entering multiple MAC addresses, separated by commas
          </div>

          <FormRow label="MAC Address" required={true} error={errors.macAddress} className="border-b-0 py-2 mt-4" alignTop={true}>
            <div className="w-full">
              <StyledInput
                type="text"
                value={macAddress}
                onChange={(e) => {
                  setMacAddress(e.target.value);
                  setErrors(prev => ({ ...prev, macAddress: '' }));
                }}
                hasError={!!errors.macAddress}
              />
            </div>
          </FormRow>

          <FormRow label="Limit Time" required={true} error={errors.startTime || errors.endTime} className="border-b-0 py-2 mt-4" alignTop={true}>
            <div className="w-full flex items-center space-x-2">
              <StyledInput
                type="time"
                value={startTime}
                onChange={(e) => {
                  setStartTime(e.target.value);
                  setErrors(prev => ({ ...prev, startTime: '' }));
                }}
                hasError={!!errors.startTime}
              />
              <span className="text-gray-500">-</span>
              <StyledInput
                type="time"
                value={endTime}
                onChange={(e) => {
                  setEndTime(e.target.value);
                  setErrors(prev => ({ ...prev, endTime: '' }));
                }}
                hasError={!!errors.endTime}
              />
            </div>
          </FormRow>

          <FormRow label="Limit Date" required={true} error={errors.scheduleDays} className="border-b-0 py-2 mt-4" alignTop={true}>
            <div className="w-full flex flex-wrap gap-2">
              {DAYS_OF_WEEK.map(day => (
                <button
                  key={day.value}
                  onClick={() => toggleDay(day.value)}
                  className={`px-3 py-1.5 text-sm rounded-[2px] border transition-colors ${
                    selectedDays.includes(day.value)
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </FormRow>

          <div className="flex justify-end space-x-4 mt-8">
            <button
              onClick={onClose}
              className="bg-[#eeeeee] border-2 border-black text-black font-bold py-2 px-8 text-sm transition-all rounded-[2px] shadow-sm min-w-[120px]"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="bg-[#eeeeee] border-2 border-black text-black font-bold py-2 px-8 text-sm transition-all rounded-[2px] shadow-sm min-w-[120px]"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
