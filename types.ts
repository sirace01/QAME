export enum RatingValue {
  Poor = 1,
  Unsatisfactory = 2,
  Satisfactory = 3,
  VerySatisfactory = 4,
  Outstanding = 5
}

export interface Speaker {
  id: string;
  name: string;
  topic: string;
  role?: string;
}

export interface Session {
  id: string;
  day: number;
  title: string;
  speakers: Speaker[];
}

export interface EvaluationState {
  profile: {
    name: string;
    email: string;
    sex: 'Male' | 'Female' | '';
    position: string;
    school: string;
  };
  generalRatings: Record<string, number>;
  sessionRatings: Record<string, Record<string, number>>; // sessionId -> criteriaId -> rating
  comments: {
    strengths: string;
    improvements: string;
  };
}

export interface Question {
  id: string;
  text: string;
}

export interface DailyRatingStats {
  overall: number;
  pmt: number;
  meals: number;
  venue: number;
}

export interface AggregatedStats {
  totalRespondents: number;
  dailyRespondents: Record<number, number>;
  overallRating: number;
  dailyRatings: Record<number, DailyRatingStats>;
  sexDistribution: Record<string, number>;
  positionDistribution: Record<string, number>;
  generalRatings: Record<string, { sum: number; count: number; avg: number }>;
  sessionRatings: Record<string, Record<string, { sum: number; count: number; avg: number }>>;
  comments: {
    strengths: string[];
    improvements: string[];
  };
}