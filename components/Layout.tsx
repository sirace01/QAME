import React from 'react';
import { EVENT_DETAILS } from '../constants';
import { CheckCircle2 } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  step: number;
  totalSteps: number;
}

const Layout: React.FC<LayoutProps> = ({ children, step, totalSteps }) => {
  const progress = (step / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center pb-12">
      {/* Header Banner */}
      <div className="w-full bg-gradient-to-r from-green-700 to-green-900 text-white shadow-lg">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-start md:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
               <img 
                 src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRigtgVaWpL82AnhiwTQpt4SI1vV5GTEc-VzA&s" 
                 alt="SDO QC Logo" 
                 className="w-16 h-16 rounded-full border-2 border-white/20 shadow-lg bg-white object-cover"
               />
               <div>
                 <h1 className="text-sm font-bold opacity-80 uppercase tracking-wider">Schools Division Office of Quezon City</h1>
                 <h2 className="text-xl md:text-2xl font-bold leading-tight mt-1">QAME In-Service Training 2026</h2>
               </div>
            </div>
          </div>
          
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm border border-white/20">
            <h3 className="font-semibold text-lg text-yellow-300 mb-1">{EVENT_DETAILS.title}</h3>
            <p className="text-sm text-green-100 flex items-center gap-2">
              <span className="opacity-75">📅 {EVENT_DETAILS.date}</span>
              <span className="opacity-50">|</span>
              <span className="opacity-75">📍 {EVENT_DETAILS.venue}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-4xl h-1 bg-slate-200 mt-0">
        <div 
          className="h-full bg-yellow-500 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Content Container */}
      <main className="w-full max-w-4xl px-4 -mt-4">
        {children}
      </main>

      <footer className="mt-auto py-8 text-center text-slate-400 text-sm">
        <p>© 2026 Schools Division Office of Quezon City. All rights reserved.</p>
        <p className="mt-1">Quality Assurance, Monitoring and Evaluation (QAME) System</p>
      </footer>
    </div>
  );
};

export default Layout;