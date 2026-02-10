import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import RatingScale from './components/RatingScale';
import { EvaluationState, RatingValue, AggregatedStats, Question } from './types';
import { 
  EVENT_DETAILS, 
  PROGRAM_QUESTIONS, 
  VENUE_QUESTIONS, 
  MEAL_QUESTIONS, 
  SESSION_QUESTIONS, 
  SESSIONS, 
  POSITIONS 
} from './constants';
import { ArrowRight, Check, User, MessageSquare, ClipboardCheck, ArrowLeft, BookOpen, Loader2, Lock, BarChart3, PieChart, LogOut, Download, Utensils, MapPin, Calendar, Star, TrendingUp, AlertTriangle } from 'lucide-react';
import { supabase } from './supabaseClient';

const INITIAL_STATE: EvaluationState = {
  profile: {
    name: '',
    email: '',
    sex: '',
    position: '',
    school: '',
  },
  generalRatings: {},
  sessionRatings: {},
  comments: {
    strengths: '',
    improvements: ''
  }
};

const ALL_GENERAL_QUESTIONS = [...PROGRAM_QUESTIONS, ...VENUE_QUESTIONS, ...MEAL_QUESTIONS];

// Helper to interpret ratings
const getRatingLabel = (rating: number) => {
    if (rating === 0) return 'No Data';
    if (rating >= 4.50) return 'Outstanding';
    if (rating >= 3.50) return 'Very Satisfactory';
    if (rating >= 2.50) return 'Satisfactory';
    if (rating >= 1.50) return 'Unsatisfactory';
    return 'Poor';
};

const getRatingColorClass = (rating: number) => {
    if (rating === 0) return 'text-slate-400';
    if (rating >= 4.50) return 'text-green-700'; // Outstanding
    if (rating >= 3.50) return 'text-green-600'; // VS
    if (rating >= 2.50) return 'text-blue-600';  // S
    if (rating >= 1.50) return 'text-orange-600'; // US
    return 'text-red-600'; // Poor
};

const App: React.FC = () => {
  // Steps: 0=Welcome, 1-4=Form, 5=Success, -1=Login, -2=Dashboard
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<EvaluationState>(INITIAL_STATE);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Admin State
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [stats, setStats] = useState<AggregatedStats | null>(null);

  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  const handleProfileChange = (field: keyof typeof formData.profile, value: string) => {
    setFormData(prev => ({
      ...prev,
      profile: { ...prev.profile, [field]: value }
    }));
  };

  const handleGeneralRating = (id: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      generalRatings: { ...prev.generalRatings, [id]: value }
    }));
  };

  const handleSessionRating = (sessionId: string, questionId: string, value: number) => {
    setFormData(prev => {
      const currentSessionRatings = prev.sessionRatings[sessionId] || {};
      return {
        ...prev,
        sessionRatings: {
          ...prev.sessionRatings,
          [sessionId]: { ...currentSessionRatings, [questionId]: value }
        }
      };
    });
  };

  const isProfileValid = () => {
    return (
        formData.profile.email.trim() !== '' &&
        formData.profile.position.trim() !== '' && 
        formData.profile.school.trim() !== '' && 
        formData.profile.sex !== ''
    );
  };

  const isGeneralValid = () => {
    return ALL_GENERAL_QUESTIONS.every(q => formData.generalRatings[q.id] !== undefined);
  };

  // Filter sessions based on selected day
  const filteredSessions = selectedDay ? SESSIONS.filter(s => s.day === selectedDay) : [];

  const isSessionValid = () => {
    if (filteredSessions.length === 0) return true;
    return filteredSessions.every(session => {
        const ratings = formData.sessionRatings[session.id];
        if (!ratings) return false;
        return SESSION_QUESTIONS.every(q => ratings[q.id] !== undefined && ratings[q.id] > 0);
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
        const { error } = await supabase
            .from('evaluations')
            .insert([
                {
                    name: formData.profile.name,
                    email: formData.profile.email,
                    sex: formData.profile.sex,
                    position: formData.profile.position,
                    school: formData.profile.school,
                    selected_day: selectedDay,
                    general_ratings: formData.generalRatings,
                    session_ratings: formData.sessionRatings,
                    strengths: formData.comments.strengths,
                    improvements: formData.comments.improvements
                }
            ]);

        if (error) throw error;

        setCurrentStep(5);
    } catch (error) {
        console.error('Error submitting evaluation:', error);
        alert('Failed to submit evaluation. Please check your internet connection and try again.');
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleLogin = async () => {
      setLoginError('');
      setIsLoadingResults(true);

      try {
          // Verify password against database
          const { data: codes, error } = await supabase
            .from('access_codes')
            .select('*')
            .eq('code', passwordInput)
            .single();

          if (error || !codes) {
              setLoginError('Invalid access code.');
              setIsLoadingResults(false);
              return;
          }

          // Fetch all data
          console.log('Fetching evaluations...');
          const { data: evaluations, error: evalError } = await supabase
            .from('evaluations')
            .select('*');

          if (evalError) throw evalError;
          
          console.log('Evaluations fetched:', evaluations);

          // Process Data
          processStats(evaluations || []);
          setCurrentStep(-2); // Go to Dashboard

      } catch (err) {
          console.error(err);
          setLoginError('An error occurred. Please try again.');
      } finally {
          setIsLoadingResults(false);
      }
  };

  const processStats = (data: any[]) => {
      const newStats: AggregatedStats = {
          totalRespondents: data.length,
          dailyRespondents: { 1: 0, 2: 0, 3: 0 },
          overallRating: 0,
          dailyRatings: {
            1: { overall: 0, pmt: 0, meals: 0, venue: 0 },
            2: { overall: 0, pmt: 0, meals: 0, venue: 0 },
            3: { overall: 0, pmt: 0, meals: 0, venue: 0 }
          },
          sexDistribution: {},
          positionDistribution: {},
          generalRatings: {},
          sessionRatings: {},
          comments: { strengths: [], improvements: [] }
      };

      // Accumulators for Daily Ratings
      const dailyAcc: Record<number, { 
        pmt: { sum: number, count: number }, 
        meals: { sum: number, count: number },
        venue: { sum: number, count: number },
        overall: { sum: number, count: number }
      }> = {
          1: { pmt: {sum:0, count:0}, meals: {sum:0, count:0}, venue: {sum:0, count:0}, overall: {sum:0, count:0} },
          2: { pmt: {sum:0, count:0}, meals: {sum:0, count:0}, venue: {sum:0, count:0}, overall: {sum:0, count:0} },
          3: { pmt: {sum:0, count:0}, meals: {sum:0, count:0}, venue: {sum:0, count:0}, overall: {sum:0, count:0} },
      };

      // Used for Overall Rating Calculation (Grand Mean)
      let grandSum = 0;
      let grandCount = 0;

      // Initialize General Ratings Accumulators
      ALL_GENERAL_QUESTIONS.forEach(q => {
          newStats.generalRatings[q.id] = { sum: 0, count: 0, avg: 0 };
      });

      // Initialize Session Ratings Accumulators
      SESSIONS.forEach(s => {
          newStats.sessionRatings[s.id] = {};
          SESSION_QUESTIONS.forEach(q => {
              newStats.sessionRatings[s.id][q.id] = { sum: 0, count: 0, avg: 0 };
          });
      });

      data.forEach(entry => {
          // Daily Counters & Casting
          let day = entry.selected_day;
          // Ensure day is a number if it comes back as string
          if (typeof day === 'string') day = parseInt(day, 10);

          if (day && (day === 1 || day === 2 || day === 3)) {
              newStats.dailyRespondents[day]++;
          }

          // Demographics
          const sex = entry.sex || 'Unspecified';
          newStats.sexDistribution[sex] = (newStats.sexDistribution[sex] || 0) + 1;

          const pos = entry.position || 'Unspecified';
          newStats.positionDistribution[pos] = (newStats.positionDistribution[pos] || 0) + 1;

          // General Ratings
          if (entry.general_ratings) {
              Object.entries(entry.general_ratings).forEach(([key, val]) => {
                  const numVal = Number(val);
                  if (newStats.generalRatings[key] && !isNaN(numVal)) {
                      newStats.generalRatings[key].sum += numVal;
                      newStats.generalRatings[key].count += 1;
                      
                      // Add to Grand Mean
                      grandSum += numVal;
                      grandCount += 1;

                      // Add to Daily Stats if day is valid
                      if (day && (day === 1 || day === 2 || day === 3) && dailyAcc[day]) {
                          dailyAcc[day].overall.sum += numVal;
                          dailyAcc[day].overall.count += 1;

                          if (key.startsWith('pm')) {
                              dailyAcc[day].pmt.sum += numVal;
                              dailyAcc[day].pmt.count += 1;
                          } else if (key.startsWith('m')) {
                              dailyAcc[day].meals.sum += numVal;
                              dailyAcc[day].meals.count += 1;
                          } else if (key.startsWith('v')) {
                              dailyAcc[day].venue.sum += numVal;
                              dailyAcc[day].venue.count += 1;
                          }
                      }
                  }
              });
          }

          // Session Ratings
          if (entry.session_ratings) {
              Object.entries(entry.session_ratings).forEach(([sessionId, sessionData]) => {
                  if (newStats.sessionRatings[sessionId] && typeof sessionData === 'object') {
                      Object.entries(sessionData as Record<string, number>).forEach(([qId, val]) => {
                          const numVal = Number(val);
                          if (newStats.sessionRatings[sessionId][qId] && !isNaN(numVal)) {
                              newStats.sessionRatings[sessionId][qId].sum += numVal;
                              newStats.sessionRatings[sessionId][qId].count += 1;
                              
                              // Add to Grand Mean
                              grandSum += numVal;
                              grandCount += 1;

                              // Add to Daily Stats (Overall)
                              if (day && (day === 1 || day === 2 || day === 3) && dailyAcc[day]) {
                                  dailyAcc[day].overall.sum += numVal;
                                  dailyAcc[day].overall.count += 1;
                              }
                          }
                      });
                  }
              });
          }

          // Comments
          if (entry.strengths) newStats.comments.strengths.push(entry.strengths);
          if (entry.improvements) newStats.comments.improvements.push(entry.improvements);
      });

      // Calculate Averages for Standard Stats
      Object.keys(newStats.generalRatings).forEach(key => {
          const item = newStats.generalRatings[key];
          item.avg = item.count > 0 ? item.sum / item.count : 0;
      });

      Object.keys(newStats.sessionRatings).forEach(sessId => {
          Object.keys(newStats.sessionRatings[sessId]).forEach(qId => {
              const item = newStats.sessionRatings[sessId][qId];
              item.avg = item.count > 0 ? item.sum / item.count : 0;
          });
      });

      // Calculate Daily Averages
      [1, 2, 3].forEach(d => {
          const acc = dailyAcc[d as 1|2|3];
          newStats.dailyRatings[d as 1|2|3] = {
              overall: acc.overall.count > 0 ? acc.overall.sum / acc.overall.count : 0,
              pmt: acc.pmt.count > 0 ? acc.pmt.sum / acc.pmt.count : 0,
              meals: acc.meals.count > 0 ? acc.meals.sum / acc.meals.count : 0,
              venue: acc.venue.count > 0 ? acc.venue.sum / acc.venue.count : 0
          };
      });

      // Calculate Overall Rating
      newStats.overallRating = grandCount > 0 ? grandSum / grandCount : 0;

      setStats(newStats);
  };

  const renderAnalysisSection = (title: string, icon: React.ReactNode, questions: Question[]) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-2 mb-6 pb-2 border-b">
            {icon}
            <h3 className="font-bold text-slate-800">{title}</h3>
        </div>
        <div className="space-y-6">
            {questions.map(q => {
                const rating = stats?.generalRatings[q.id] || { sum: 0, count: 0, avg: 0 };
                // Calculate percentage based on 5-point scale
                const percentage = (rating.avg / 5) * 100;
                return (
                    <div key={q.id}>
                        <div className="flex justify-between items-end mb-1">
                            <p className="text-sm font-medium text-slate-700">{q.text}</p>
                            <div className="text-right">
                                <p className="text-lg font-bold text-slate-900">{rating.avg.toFixed(2)} <span className="text-xs text-slate-400 font-normal">/ 5.00</span></p>
                                <p className={`text-xs font-bold ${getRatingColorClass(rating.avg)}`}>{getRatingLabel(rating.avg)}</p>
                            </div>
                        </div>
                        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${percentage >= 80 ? 'bg-green-500' : percentage >= 60 ? 'bg-blue-500' : percentage >= 40 ? 'bg-orange-500' : 'bg-red-500'}`} 
                              style={{ width: `${percentage}%` }}
                            ></div>
                        </div>
                    </div>
                );
            })}
        </div>
    </div>
  );

  // --- RENDER FUNCTIONS ---

  // Login Screen
  if (currentStep === -1) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-xl overflow-hidden p-8">
                <div className="flex justify-center mb-6">
                    <div className="p-3 bg-slate-100 rounded-full">
                        <Lock className="w-8 h-8 text-slate-600" />
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">Restricted Access</h2>
                <p className="text-center text-slate-500 mb-6">Please enter the administration access code to view QAME results.</p>
                
                <div className="space-y-4">
                    <input 
                        type="password" 
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                        placeholder="Enter Access Code"
                        onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                    />
                    {loginError && <p className="text-red-500 text-sm text-center">{loginError}</p>}
                    
                    <button 
                        onClick={handleLogin}
                        disabled={isLoadingResults}
                        className="w-full bg-slate-800 text-white py-3 rounded-lg font-semibold hover:bg-slate-900 transition-all disabled:opacity-50 flex justify-center items-center gap-2"
                    >
                        {isLoadingResults ? <Loader2 className="animate-spin w-4 h-4" /> : 'Access Results'}
                    </button>
                    <button 
                        onClick={() => setCurrentStep(0)}
                        className="w-full text-slate-500 py-2 hover:text-slate-800 transition-all text-sm"
                    >
                        Return to Home
                    </button>
                </div>
            </div>
        </div>
      );
  }

  // Dashboard Screen
  if (currentStep === -2 && stats) {
      return (
          <div className="min-h-screen bg-slate-100 pb-12">
              {/* Dashboard Header */}
              <div className="bg-white shadow border-b border-slate-200 sticky top-0 z-10">
                  <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                          <BarChart3 className="w-6 h-6 text-green-600" />
                          <h1 className="text-xl font-bold text-slate-800">QAME Result Analysis</h1>
                      </div>
                      <div className="flex gap-2">
                        <button 
                            onClick={() => window.print()}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-md hover:bg-slate-200"
                        >
                            <Download className="w-4 h-4" /> Print
                        </button>
                        <button 
                            onClick={() => { setStats(null); setPasswordInput(''); setCurrentStep(0); }}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100"
                        >
                            <LogOut className="w-4 h-4" /> Logout
                        </button>
                      </div>
                  </div>
              </div>

              <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
                  {stats.totalRespondents === 0 ? (
                      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                          <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <BarChart3 className="w-12 h-12 text-slate-400" />
                          </div>
                          <h3 className="text-xl font-bold text-slate-800 mb-2">No Evaluation Data Yet</h3>
                          <p className="text-slate-500 max-w-md mx-auto mb-8">
                              There are currently no submitted evaluations visible in the system. 
                          </p>
                          
                          <div className="bg-yellow-50 text-yellow-800 p-6 rounded-lg text-sm text-left max-w-lg mx-auto mb-8 border border-yellow-200">
                            <p className="font-bold mb-2 flex items-center gap-2 text-base">
                                <AlertTriangle className="w-5 h-5" /> Data Not Showing?
                            </p>
                            <p className="mb-2">If you have verified that data exists in your Supabase database, the issue is likely due to <strong>Row Level Security (RLS)</strong>.</p>
                            <p className="mb-2">Supabase tables hide data from API requests by default. To fix this:</p>
                            <ol className="list-decimal pl-5 space-y-1 mb-2">
                                <li>Go to your Supabase Dashboard > Table Editor.</li>
                                <li>Select the <code>evaluations</code> table.</li>
                                <li>Click "Add RLS Policy" or edit existing policies.</li>
                                <li>Create a policy to <strong>Enable SELECT for public/anon</strong>.</li>
                            </ol>
                          </div>

                          <button 
                              onClick={() => { setStats(null); setPasswordInput(''); setCurrentStep(0); }}
                              className="text-green-600 font-semibold hover:text-green-800"
                          >
                              Return to Evaluation Form
                          </button>
                      </div>
                  ) : (
                      <>
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl shadow-md text-white">
                                <div className="flex items-center gap-2 mb-2 opacity-90">
                                  <Star className="w-5 h-5" />
                                  <p className="text-sm font-medium">Overall Rating</p>
                                </div>
                                <div className="flex items-end gap-2">
                                    <p className="text-4xl font-bold">{stats.overallRating.toFixed(2)}</p>
                                    <p className="text-sm font-semibold opacity-90 mb-2">{getRatingLabel(stats.overallRating)}</p>
                                </div>
                                <p className="text-xs opacity-80 mt-1">Grand Mean</p>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                                <div className="flex items-center gap-2 mb-2 text-slate-500">
                                  <User className="w-5 h-5" />
                                  <p className="text-sm font-medium">Total Respondents</p>
                                </div>
                                <p className="text-4xl font-bold text-slate-800">{stats.totalRespondents}</p>
                            </div>
                            
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                                <div className="flex items-center gap-2 mb-2 text-slate-500">
                                   <Calendar className="w-5 h-5" />
                                   <p className="text-sm font-medium">Respondents by Day</p>
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-center">
                                    <div className="bg-slate-50 rounded p-2">
                                        <div className="text-xs text-slate-400 font-bold uppercase">Day 1</div>
                                        <div className="font-bold text-slate-700">{stats.dailyRespondents[1]}</div>
                                    </div>
                                    <div className="bg-slate-50 rounded p-2">
                                        <div className="text-xs text-slate-400 font-bold uppercase">Day 2</div>
                                        <div className="font-bold text-slate-700">{stats.dailyRespondents[2]}</div>
                                    </div>
                                    <div className="bg-slate-50 rounded p-2">
                                        <div className="text-xs text-slate-400 font-bold uppercase">Day 3</div>
                                        <div className="font-bold text-slate-700">{stats.dailyRespondents[3]}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                                <div className="flex items-center gap-2 mb-2 text-slate-500">
                                  <MessageSquare className="w-5 h-5" />
                                  <p className="text-sm font-medium">Total Comments</p>
                                </div>
                                <p className="text-4xl font-bold text-blue-600">{(stats.comments.strengths?.length ?? 0) + (stats.comments.improvements?.length ?? 0)}</p>
                            </div>
                        </div>

                        {/* Daily Ratings Breakdown */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                                <div className="flex items-center gap-2 mb-6 pb-2 border-b">
                                    <TrendingUp className="w-5 h-5 text-slate-400" />
                                    <h3 className="font-bold text-slate-800">Daily Rating Analysis</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                                            <tr>
                                                <th className="px-6 py-3 rounded-l-lg">Category</th>
                                                <th className="px-6 py-3 text-center">Day 1</th>
                                                <th className="px-6 py-3 text-center">Day 2</th>
                                                <th className="px-6 py-3 text-center rounded-r-lg">Day 3</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr className="bg-white border-b hover:bg-slate-50">
                                                <th scope="row" className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                                                    Overall Daily Rating
                                                </th>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="font-bold text-green-600">{stats.dailyRatings[1].overall.toFixed(2)}</div>
                                                    <div className="text-xs text-slate-500">{getRatingLabel(stats.dailyRatings[1].overall)}</div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="font-bold text-green-600">{stats.dailyRatings[2].overall.toFixed(2)}</div>
                                                    <div className="text-xs text-slate-500">{getRatingLabel(stats.dailyRatings[2].overall)}</div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="font-bold text-green-600">{stats.dailyRatings[3].overall.toFixed(2)}</div>
                                                    <div className="text-xs text-slate-500">{getRatingLabel(stats.dailyRatings[3].overall)}</div>
                                                </td>
                                            </tr>
                                            <tr className="bg-white border-b hover:bg-slate-50">
                                                <th scope="row" className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap flex items-center gap-2">
                                                    <ClipboardCheck className="w-4 h-4 text-blue-500" /> Program Management Team
                                                </th>
                                                <td className="px-6 py-4 text-center text-slate-600">
                                                    {stats.dailyRatings[1].pmt.toFixed(2)}
                                                </td>
                                                <td className="px-6 py-4 text-center text-slate-600">
                                                    {stats.dailyRatings[2].pmt.toFixed(2)}
                                                </td>
                                                <td className="px-6 py-4 text-center text-slate-600">
                                                    {stats.dailyRatings[3].pmt.toFixed(2)}
                                                </td>
                                            </tr>
                                            <tr className="bg-white border-b hover:bg-slate-50">
                                                <th scope="row" className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap flex items-center gap-2">
                                                    <Utensils className="w-4 h-4 text-orange-500" /> Meals
                                                </th>
                                                <td className="px-6 py-4 text-center text-slate-600">
                                                    {stats.dailyRatings[1].meals.toFixed(2)}
                                                </td>
                                                <td className="px-6 py-4 text-center text-slate-600">
                                                    {stats.dailyRatings[2].meals.toFixed(2)}
                                                </td>
                                                <td className="px-6 py-4 text-center text-slate-600">
                                                    {stats.dailyRatings[3].meals.toFixed(2)}
                                                </td>
                                            </tr>
                                            <tr className="bg-white hover:bg-slate-50">
                                                <th scope="row" className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap flex items-center gap-2">
                                                    <MapPin className="w-4 h-4 text-red-500" /> Venue
                                                </th>
                                                <td className="px-6 py-4 text-center text-slate-600">
                                                    {stats.dailyRatings[1].venue.toFixed(2)}
                                                </td>
                                                <td className="px-6 py-4 text-center text-slate-600">
                                                    {stats.dailyRatings[2].venue.toFixed(2)}
                                                </td>
                                                <td className="px-6 py-4 text-center text-slate-600">
                                                    {stats.dailyRatings[3].venue.toFixed(2)}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                        </div>

                        {/* Demographics */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                                <div className="flex items-center gap-2 mb-4 pb-2 border-b">
                                    <User className="w-5 h-5 text-slate-400" />
                                    <h3 className="font-bold text-slate-800">Respondents by Position</h3>
                                </div>
                                <div className="space-y-3">
                                    {Object.entries(stats.positionDistribution)
                                      .sort(([, countA], [, countB]) => Number(countB) - Number(countA))
                                      .map(([pos, count]) => (
                                        <div key={pos} className="flex items-center justify-between text-sm">
                                            <span className="text-slate-600 truncate mr-2">{pos}</span>
                                            <div className="flex items-center gap-2">
                                              <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                  <div className="h-full bg-blue-500" style={{ width: `${(Number(count) / (stats.totalRespondents || 1)) * 100}%` }}></div>
                                              </div>
                                              <span className="font-bold w-6 text-right">{count}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                                 <div className="flex items-center gap-2 mb-4 pb-2 border-b">
                                    <PieChart className="w-5 h-5 text-slate-400" />
                                    <h3 className="font-bold text-slate-800">Respondents by Sex</h3>
                                </div>
                                <div className="flex gap-4">
                                     {Object.entries(stats.sexDistribution).map(([sex, count]) => (
                                         <div key={sex} className="flex-1 text-center p-4 bg-slate-50 rounded-lg">
                                             <span className="block text-2xl font-bold text-slate-800">{count}</span>
                                             <span className="text-sm text-slate-500">{sex}</span>
                                         </div>
                                     ))}
                                </div>
                            </div>
                        </div>

                        {/* General Evaluation Analysis */}
                        {renderAnalysisSection('Program Management Team', <ClipboardCheck className="w-5 h-5 text-slate-400" />, PROGRAM_QUESTIONS)}
                        {renderAnalysisSection('Venue and Accommodation', <MapPin className="w-5 h-5 text-slate-400" />, VENUE_QUESTIONS)}
                        {renderAnalysisSection('Meals', <Utensils className="w-5 h-5 text-slate-400" />, MEAL_QUESTIONS)}

                        {/* Session Analysis */}
                        <div className="space-y-6">
                              <div className="flex items-center gap-2 mb-2">
                                  <BookOpen className="w-5 h-5 text-slate-400" />
                                  <h3 className="font-bold text-xl text-slate-800">Session Evaluation Breakdown</h3>
                              </div>
                              {SESSIONS.map(session => {
                                  const sessionStats = stats.sessionRatings[session.id] || {};
                                  // Calculate overall session average
                                  const values = Object.values(sessionStats) as { sum: number; count: number; avg: number }[];
                                  const totalSum = values.reduce((acc, curr) => acc + curr.sum, 0);
                                  const totalCount = values.reduce((acc, curr) => acc + curr.count, 0);
                                  const sessionAvg = totalCount ? totalSum / totalCount : 0;

                                  return (
                                      <div key={session.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 break-inside-avoid">
                                          <div className="flex justify-between items-start mb-4 border-b pb-4">
                                              <div>
                                                  <span className="inline-block px-2 py-1 bg-slate-100 text-xs font-bold text-slate-600 rounded mb-1">Day {session.day}</span>
                                                  <h4 className="font-bold text-lg text-slate-800">{session.title}</h4>
                                                  <p className="text-sm text-slate-500">{session.speakers.map(s => s.name).join(', ')}</p>
                                              </div>
                                              <div className="text-right">
                                                  <div className="text-2xl font-bold text-green-600">{sessionAvg.toFixed(2)}</div>
                                                  <div className={`text-xs font-bold ${getRatingColorClass(sessionAvg)}`}>{getRatingLabel(sessionAvg)}</div>
                                              </div>
                                          </div>
                                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                              {SESSION_QUESTIONS.map(q => {
                                                  const qStat = sessionStats[q.id];
                                                  // Safe check if qStat exists (it should initialized in processStats)
                                                  const avg = qStat ? qStat.avg : 0;
                                                  return (
                                                      <div key={q.id} className="bg-slate-50 p-3 rounded-lg">
                                                          <p className="text-xs text-slate-500 mb-1 truncate" title={q.text}>{q.text}</p>
                                                          <div className="flex justify-between items-center">
                                                              <div className="flex gap-0.5">
                                                                  {[1,2,3,4,5].map(star => (
                                                                      <div key={star} className={`w-2 h-2 rounded-full ${star <= Math.round(avg) ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                                                                  ))}
                                                              </div>
                                                              <span className="font-bold text-sm">{avg.toFixed(2)}</span>
                                                          </div>
                                                      </div>
                                                  )
                                              })}
                                          </div>
                                      </div>
                                  );
                              })}
                        </div>

                        {/* Qualitative Comments */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:break-before-page">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                                 <div className="flex items-center gap-2 mb-4 pb-2 border-b border-green-100">
                                    <MessageSquare className="w-5 h-5 text-green-600" />
                                    <h3 className="font-bold text-slate-800">Significant Learnings / Strengths</h3>
                                </div>
                                <div className="h-96 overflow-y-auto pr-2 space-y-3">
                                    {stats.comments.strengths.filter(c => c.trim().length > 0).map((comment, idx) => (
                                        <div key={idx} className="p-3 bg-green-50 rounded-lg text-sm text-slate-700 border-l-4 border-green-500">
                                            "{comment}"
                                        </div>
                                    ))}
                                    {stats.comments.strengths.filter(c => c.trim().length > 0).length === 0 && (
                                        <p className="text-slate-400 text-center italic mt-10">No comments recorded.</p>
                                    )}
                                </div>
                            </div>
                            
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                                 <div className="flex items-center gap-2 mb-4 pb-2 border-b border-orange-100">
                                    <MessageSquare className="w-5 h-5 text-orange-600" />
                                    <h3 className="font-bold text-slate-800">Areas for Improvement</h3>
                                </div>
                                <div className="h-96 overflow-y-auto pr-2 space-y-3">
                                    {stats.comments.improvements.filter(c => c.trim().length > 0).map((comment, idx) => (
                                        <div key={idx} className="p-3 bg-orange-50 rounded-lg text-sm text-slate-700 border-l-4 border-orange-500">
                                            "{comment}"
                                        </div>
                                    ))}
                                    {stats.comments.improvements.filter(c => c.trim().length > 0).length === 0 && (
                                        <p className="text-slate-400 text-center italic mt-10">No comments recorded.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                      </>
                  )}
              </div>
          </div>
      );
  }

  // Render Welcome Screen
  if (currentStep === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-xl overflow-hidden relative">
            <button 
                onClick={() => setCurrentStep(-1)}
                className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-all z-20"
                title="View Results"
            >
                <BarChart3 className="w-5 h-5" />
            </button>
            <div className="h-48 bg-green-700 relative flex items-center justify-center">
                 <div className="absolute inset-0 bg-[url('https://picsum.photos/800/400?blur')] opacity-20 bg-cover bg-center"></div>
                 <div className="relative z-10 text-white text-center p-4 flex flex-col items-center">
                     <img 
                        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRigtgVaWpL82AnhiwTQpt4SI1vV5GTEc-VzA&s" 
                        alt="SDO QC Logo" 
                        className="w-20 h-20 rounded-full border-4 border-white/20 shadow-xl bg-white object-cover mb-3"
                     />
                     <h1 className="text-2xl font-bold">QAME Evaluation</h1>
                     <p className="text-green-100 text-sm">Online Feedback System</p>
                 </div>
            </div>
            <div className="p-8">
                <p className="text-slate-600 mb-6 text-center leading-relaxed">
                    Welcome to the online evaluation for the <strong>{EVENT_DETAILS.title}</strong>. Your feedback is crucial for the continuous improvement of our programs.
                </p>
                
                <div className="space-y-4">
                    <button 
                        onClick={() => { setSelectedDay(1); setCurrentStep(1); }}
                        className="w-full flex items-center justify-between p-4 bg-white border border-slate-200 rounded-lg shadow-sm hover:border-green-500 hover:shadow-md transition-all group"
                    >
                        <span className="font-semibold text-slate-700 group-hover:text-green-700">Evaluate Day 1</span>
                        <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-green-500" />
                    </button>
                    <button 
                        onClick={() => { setSelectedDay(2); setCurrentStep(1); }}
                        className="w-full flex items-center justify-between p-4 bg-white border border-slate-200 rounded-lg shadow-sm hover:border-green-500 hover:shadow-md transition-all group"
                    >
                        <span className="font-semibold text-slate-700 group-hover:text-green-700">Evaluate Day 2</span>
                        <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-green-500" />
                    </button>
                    <button 
                        onClick={() => { setSelectedDay(3); setCurrentStep(1); }}
                        className="w-full flex items-center justify-between p-4 bg-white border border-slate-200 rounded-lg shadow-sm hover:border-green-500 hover:shadow-md transition-all group"
                    >
                        <span className="font-semibold text-slate-700 group-hover:text-green-700">Evaluate Day 3</span>
                        <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-green-500" />
                    </button>
                </div>
            </div>
            <div className="bg-slate-50 p-4 text-center text-xs text-slate-400 border-t border-slate-100">
                SDO Quezon City • {EVENT_DETAILS.date}
            </div>
        </div>
      </div>
    );
  }

  // Render Success Screen
  if (currentStep === 5) {
      return (
          <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
              <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-10 text-center">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Check className="w-10 h-10 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">Thank You!</h2>
                  <p className="text-slate-600 mb-8">Your evaluation has been successfully submitted. We appreciate your time and honesty.</p>
                  <button 
                    onClick={() => {
                        setFormData(INITIAL_STATE);
                        setSelectedDay(null);
                        setCurrentStep(0);
                    }}
                    className="text-green-600 font-semibold hover:text-green-800 underline"
                  >
                      Submit another response
                  </button>
              </div>
          </div>
      )
  }

  return (
    <Layout step={currentStep} totalSteps={4}>
      <div className="bg-white rounded-xl shadow-xl mt-6 p-6 md:p-8">
        
        {/* Step 1: Profile */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">Participant Profile</h2>
                <p className="text-sm text-slate-500">Please provide your details below.</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                    <input 
                        type="text" 
                        value={formData.profile.name}
                        onChange={(e) => handleProfileChange('name', e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                        placeholder="Juan Dela Cruz"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Email Address <span className="text-red-500">*</span></label>
                    <input 
                        type="email" 
                        value={formData.profile.email}
                        onChange={(e) => handleProfileChange('email', e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                        placeholder="juan@deped.gov.ph"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Sex <span className="text-red-500">*</span></label>
                    <select 
                        value={formData.profile.sex}
                        onChange={(e) => handleProfileChange('sex', e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white transition-all"
                    >
                        <option value="">Select...</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Position / Designation <span className="text-red-500">*</span></label>
                    <select
                        value={formData.profile.position}
                        onChange={(e) => handleProfileChange('position', e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white transition-all"
                    >
                        <option value="">Select Position...</option>
                        {POSITIONS.map(pos => (
                            <option key={pos} value={pos}>{pos}</option>
                        ))}
                    </select>
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">School / Office <span className="text-red-500">*</span></label>
                    <input 
                        type="text" 
                        value={formData.profile.school}
                        onChange={(e) => handleProfileChange('school', e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                        placeholder="Ramon Magsaysay (CUBAO) High School"
                    />
                </div>
            </div>

            <div className="flex justify-end pt-6">
                <button
                    disabled={!isProfileValid()}
                    onClick={() => setCurrentStep(2)}
                    className="flex items-center gap-2 bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    Next Step <ArrowRight className="w-4 h-4" />
                </button>
            </div>
          </div>
        )}

        {/* Step 2: Session Evaluation (MOVED FROM STEP 3) */}
        {currentStep === 2 && (
            <div className="space-y-8">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                    <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                        <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Session Evaluation</h2>
                        <p className="text-sm text-slate-500">Day {selectedDay} Speakers and Topics</p>
                    </div>
                </div>

                {filteredSessions.map((session, index) => (
                    <div key={session.id} className="border border-slate-200 rounded-xl overflow-hidden mb-8">
                        <div className="bg-slate-50 p-4 border-b border-slate-200">
                            <h3 className="font-bold text-lg text-slate-800">{session.title}</h3>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {session.speakers.map(s => (
                                    <span key={s.id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        🎤 {s.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="p-4 bg-white">
                            {SESSION_QUESTIONS.map(q => (
                                <div key={q.id} className="mb-6 last:mb-0">
                                     <p className="text-slate-700 font-medium mb-3 text-sm">
                                        {q.text} <span className="text-red-500">*</span>
                                     </p>
                                     <div className="flex flex-wrap gap-2">
                                        {[1, 2, 3, 4, 5].map((val) => (
                                            <button
                                                key={val}
                                                onClick={() => handleSessionRating(session.id, q.id, val)}
                                                className={`
                                                    flex-1 py-2 px-2 text-xs sm:text-sm border rounded hover:bg-slate-50 transition-colors
                                                    ${formData.sessionRatings[session.id]?.[q.id] === val 
                                                        ? 'bg-green-600 text-white border-green-600 hover:bg-green-700' 
                                                        : 'border-slate-300 text-slate-600'
                                                    }
                                                `}
                                            >
                                                {val} - {val === 5 ? 'Outstanding' : val === 4 ? 'Very Satisfactory' : val === 3 ? 'Satisfactory' : val === 2 ? 'Unsatisfactory' : 'Poor'}
                                            </button>
                                        ))}
                                     </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                <div className="flex justify-between pt-6">
                    <button
                        onClick={() => setCurrentStep(1)}
                        className="flex items-center gap-2 text-slate-500 px-4 py-3 font-semibold hover:text-slate-800 transition-all"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <button
                        onClick={() => setCurrentStep(3)}
                        disabled={!isSessionValid()}
                        className="flex items-center gap-2 bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        General Evaluation <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        )}

        {/* Step 3: General Evaluation (MOVED FROM STEP 2) */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
              <div className="p-2 bg-yellow-100 text-yellow-600 rounded-lg">
                <ClipboardCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">General Evaluation</h2>
                <p className="text-sm text-slate-500">Rate the overall conduct of the activity.</p>
              </div>
            </div>

            {/* Program Management */}
            <div className="mb-8">
                <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
                    <ClipboardCheck className="w-5 h-5 text-blue-600" /> 
                    Program Management Team
                </h3>
                <div className="space-y-4">
                    {PROGRAM_QUESTIONS.map(q => (
                        <RatingScale
                            key={q.id}
                            label={q.text}
                            value={formData.generalRatings[q.id]}
                            onChange={(val) => handleGeneralRating(q.id, val)}
                            required
                        />
                    ))}
                </div>
            </div>

            {/* Venue */}
            <div className="mb-8">
                <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-red-600" /> 
                    Venue and Accommodation
                </h3>
                <div className="space-y-4">
                    {VENUE_QUESTIONS.map(q => (
                        <RatingScale
                            key={q.id}
                            label={q.text}
                            value={formData.generalRatings[q.id]}
                            onChange={(val) => handleGeneralRating(q.id, val)}
                            required
                        />
                    ))}
                </div>
            </div>

            {/* Meals */}
            <div className="mb-8">
                <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
                    <Utensils className="w-5 h-5 text-orange-600" /> 
                    Meals
                </h3>
                <div className="space-y-4">
                    {MEAL_QUESTIONS.map(q => (
                        <RatingScale
                            key={q.id}
                            label={q.text}
                            value={formData.generalRatings[q.id]}
                            onChange={(val) => handleGeneralRating(q.id, val)}
                            required
                        />
                    ))}
                </div>
            </div>

            <div className="flex justify-between pt-6">
                <button
                    onClick={() => setCurrentStep(2)}
                    className="flex items-center gap-2 text-slate-500 px-4 py-3 font-semibold hover:text-slate-800 transition-all"
                >
                    <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                    disabled={!isGeneralValid()}
                    onClick={() => setCurrentStep(4)}
                    className="flex items-center gap-2 bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    Final Comments <ArrowRight className="w-4 h-4" />
                </button>
            </div>
          </div>
        )}

        {/* Step 4: Comments */}
        {currentStep === 4 && (
             <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                    <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                        <MessageSquare className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Comments & Suggestions</h2>
                        <p className="text-sm text-slate-500">Your qualitative feedback is valuable to us.</p>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Significant learnings / Strong points of the activity</label>
                    <textarea 
                        rows={4}
                        className="w-full p-4 rounded-lg border border-slate-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none"
                        placeholder="What did you like most about the seminar?"
                        value={formData.comments.strengths}
                        onChange={(e) => setFormData(prev => ({ ...prev, comments: { ...prev.comments, strengths: e.target.value }}))}
                    ></textarea>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Areas for improvement / Suggestions for future activities</label>
                    <textarea 
                        rows={4}
                        className="w-full p-4 rounded-lg border border-slate-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none"
                        placeholder="How can we improve?"
                        value={formData.comments.improvements}
                        onChange={(e) => setFormData(prev => ({ ...prev, comments: { ...prev.comments, improvements: e.target.value }}))}
                    ></textarea>
                </div>

                <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg text-sm text-blue-800">
                    <p className="font-semibold mb-1">Data Privacy Notice</p>
                    <p>By submitting this form, you consent to the collection and processing of your personal data for the purpose of evaluation and monitoring of this event.</p>
                </div>

                <div className="flex justify-between pt-6">
                    <button
                        onClick={() => setCurrentStep(3)}
                        disabled={isSubmitting}
                        className="flex items-center gap-2 text-slate-500 px-4 py-3 font-semibold hover:text-slate-800 transition-all disabled:opacity-50"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-800 text-white px-8 py-3 rounded-lg font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                          </>
                        ) : (
                          'Submit Evaluation'
                        )}
                    </button>
                </div>
             </div>
        )}

      </div>
    </Layout>
  );
};

export default App;