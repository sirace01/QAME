import React from 'react';

interface RatingScaleProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  required?: boolean;
}

const RatingScale: React.FC<RatingScaleProps> = ({ label, value, onChange, required }) => {
  const options = [
    { val: 4, label: 'Strongly Agree', color: 'bg-green-600', hover: 'hover:bg-green-700', text: 'text-green-700' },
    { val: 3, label: 'Agree', color: 'bg-green-400', hover: 'hover:bg-green-500', text: 'text-green-600' },
    { val: 2, label: 'Disagree', color: 'bg-orange-400', hover: 'hover:bg-orange-500', text: 'text-orange-600' },
    { val: 1, label: 'Strongly Disagree', color: 'bg-red-500', hover: 'hover:bg-red-600', text: 'text-red-600' },
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
              flex-1 min-w-[140px] py-3 px-4 rounded-md text-sm font-semibold transition-all duration-200 border
              ${value === opt.val 
                ? `${opt.color} text-white border-transparent shadow-md transform scale-105` 
                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }
            `}
          >
            <div className="flex flex-col items-center">
              <span className="text-lg mb-1">{opt.val}</span>
              <span>{opt.label}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default RatingScale;