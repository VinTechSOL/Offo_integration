
import React, { useState, useRef, useEffect } from 'react';

interface MultiSelectDropdownProps {
  label: string;
  options: string[];
  selectedOptions: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({ 
  label, 
  options, 
  selectedOptions, 
  onChange,
  placeholder = "Select..."
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (option: string) => {
    if (selectedOptions.includes(option)) {
      onChange(selectedOptions.filter(o => o !== option));
    } else {
      onChange([...selectedOptions, option]);
    }
  };

  const selectAll = () => {
    if (selectedOptions.length === options.length) {
      onChange([]);
    } else {
      onChange([...options]);
    }
  };

  // const displayValue = selectedOptions.length === 0 
  //   ? placeholder 
  //   : selectedOptions.length === options.length 
  //     ? `All ${label}s` 
  //     : `${selectedOptions.length} ${label}${selectedOptions.length > 1 ? 's' : ''}`;

const selectallLabel = selectedOptions.length === options.length ? `Deselect All` : `Select All`;
const selectallCount = options.length;


  
const allOptionsSelected = Array.isArray(options) && Array.isArray(selectedOptions) && options.length > 0 && selectedOptions.length === options.length;   

const safeOptions = Array.isArray(options) ? options : [];
const safeSelected = Array.isArray(selectedOptions) ? selectedOptions : [];


const displayValue = (() => {

  if (safeSelected.length === 0) {
    return `Select ${label}`;
  }

  if (safeSelected.length === safeOptions.length) {
    return `All ${label}s`;
  }

  if (safeSelected.length === 1) {
    return safeSelected[0];
  }

  if (safeSelected.length === 2) {
    return `${safeSelected[0]}, ${safeSelected[1]}`;
  }

  return `${safeSelected[0]}, ${safeSelected[1]} +${safeSelected.length - 2}`;

})();

    
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offoOrange min-w-[240px]"
      >
        <span className="truncate mr-2">{displayValue}</span>
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 w-64 mt-2 origin-top-right bg-white border border-gray-200 rounded-xl shadow-2xl animate-modal-in">
          <div className="p-2 border-b border-gray-100">
            <button
              onClick={selectAll}
              className="w-full px-3 py-1.5 text-xs font-bold text-left text-offoOrange hover:bg-orange-50 rounded-lg transition-colors flex items-center justify-between"
            >
              {selectedOptions.length === options.length ? 'Deselect All' : 'Select All'}
              <span className="text-[10px] bg-orange-100 px-1.5 py-0.5 rounded">{options.length}</span>
            </button>
          </div>
          <div className="max-h-60 overflow-y-auto p-1">
            {options.map((option) => (
              <label
                key={option}
                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer group transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedOptions.includes(option)}
                  onChange={() => toggleOption(option)}
                  className="w-4 h-4 text-offoOrange border-gray-300 rounded focus:ring-offoOrange cursor-pointer"
                />
                <span className="ml-3 font-medium group-hover:text-offoDark transition-colors">{option}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSelectDropdown;