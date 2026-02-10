import React from 'react';

interface RatingScaleProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  required?: boolean;
}

const RatingScale: React.FC<RatingScaleProps> = ({ label, value, onChange, required }) => {
  const options = [
    { val: 5, label: 'Outstanding', color: 'bg-green-700', hover: 'hover:bg-green-800', text: 'text-green-800' },
    { val: 4, label: 'Very Satisfactory', color: 'bg-green-500', hover: 'hover:bg-green-600', text: 'text-green-600' },
    { val: 3, label: 'Satisfactory', color: 'bg-blue-400', hover: 'hover:bg-blue-500', text: 'text-blue-600' },
    { val: 2, label: 'Unsatisfactory', color: 'bg-orange-400', hover: 'hover:bg-orange-500', text: 'text-orange-600' },
    { val: 1, label: 'Poor', color: 'bg-red-500', hover: 'hover:bg-red-600', text: 'text-red-600' },
  ];

  return (
    <div className="mb-6 p-4 bg-white rounded-lg border border-slate-100 shadow-sm transition-all hover:shadow-md">
      <p className="text-slate-800 font-medium mb-3 flex items-start gap-1">
        {label} {required && <span className="text-red-500">*</span>}
      </p>
      <div className="flex flex-wrap gap-2 sm:gap-4">
        {options.map((opt) => (
          <button
            key={opt.val}
            type="button"
            onClick={() => onChange(opt.val)}
            className={`
              flex-1 min-w-[120px] py-3 px-3 rounded-md text-sm font-semibold transition-all duration-200 border
              ${value === opt.val 
                ? `${opt.color} text-white border-transparent shadow-md transform scale-105` 
                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }
            `}
          >
            <div className="flex flex-col items-center">
              <span className="text-lg mb-1">{opt.val}</span>
              <span className="text-xs sm:text-sm whitespace-nowrap">{opt.label}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default RatingScale;