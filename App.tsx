import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import RatingScale from './components/RatingScale';
import { EvaluationState, RatingValue } from './types';
import { EVENT_DETAILS, GENERAL_QUESTIONS, SESSION_QUESTIONS, SESSIONS, POSITIONS } from './constants';
import { ArrowRight, Check, User, MessageSquare, ClipboardCheck, ArrowLeft, BookOpen, Loader2 } from 'lucide-react';
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

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0); // 0: Welcome, 1: Profile, 2: General, 3: Sessions, 4: Comments, 5: Success
  const [formData, setFormData] = useState<EvaluationState>(INITIAL_STATE);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    return GENERAL_QUESTIONS.every(q => formData.generalRatings[q.id] !== undefined);
  };

  // Filter sessions based on selected day
  const filteredSessions = selectedDay ? SESSIONS.filter(s => s.day === selectedDay) : [];

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

  // Render Welcome Screen
  if (currentStep === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-xl overflow-hidden">
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
                        placeholder="e.g. Quezon City HS"
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

        {/* Step 2: General Evaluation */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
              <div className="p-2 bg-yellow-100 text-yellow-600 rounded-lg">
                <ClipboardCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">Program Management</h2>
                <p className="text-sm text-slate-500">Rate the overall conduct of the activity.</p>
              </div>
            </div>

            <div className="space-y-4">
                {GENERAL_QUESTIONS.map(q => (
                    <RatingScale
                        key={q.id}
                        label={q.text}
                        value={formData.generalRatings[q.id]}
                        onChange={(val) => handleGeneralRating(q.id, val)}
                        required
                    />
                ))}
            </div>

            <div className="flex justify-between pt-6">
                <button
                    onClick={() => setCurrentStep(1)}
                    className="flex items-center gap-2 text-slate-500 px-4 py-3 font-semibold hover:text-slate-800 transition-all"
                >
                    <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                    disabled={!isGeneralValid()}
                    onClick={() => setCurrentStep(3)}
                    className="flex items-center gap-2 bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    Evaluate Sessions <ArrowRight className="w-4 h-4" />
                </button>
            </div>
          </div>
        )}

        {/* Step 3: Session Evaluation */}
        {currentStep === 3 && (
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
                                     <p className="text-slate-700 font-medium mb-3 text-sm">{q.text}</p>
                                     <div className="flex flex-wrap gap-2">
                                        {[1, 2, 3, 4].map((val) => (
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
                                                {val} - {val === 4 ? 'Strongly Agree' : val === 3 ? 'Agree' : val === 2 ? 'Disagree' : 'Strongly Disagree'}
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
                        onClick={() => setCurrentStep(2)}
                        className="flex items-center gap-2 text-slate-500 px-4 py-3 font-semibold hover:text-slate-800 transition-all"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <button
                        onClick={() => setCurrentStep(4)}
                        className="flex items-center gap-2 bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-all"
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