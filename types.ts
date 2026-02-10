export enum RatingValue {
  StronglyDisagree = 1,
  Disagree = 2,
  Agree = 3,
  StronglyAgree = 4
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