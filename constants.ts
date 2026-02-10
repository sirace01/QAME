import { Session, Question } from './types';

export const EVENT_DETAILS = {
  title: "Complaint Management at the School Level Cum MANCOM Meeting",
  date: "February 11-13, 2026",
  venue: "Development Academy of the Philippines (DAP) Tagaytay City",
  organizer: "Schools Division Office of Quezon City"
};

export const POSITIONS = [
  "Master Teacher I",
  "Master Teacher II",
  "Master Teacher III",
  "Master Teacher IV",
  "Master Teacher V",
  "Principal I",
  "Principal II",
  "Principal III",
  "Principal IV",
  "Public School District Supervisor",
  "Education Program Supervisor",
  "Assistant School Division Superintendent",
  "School Division Superintendent"
];

export const SESSIONS: Session[] = [
  // Day 1
  {
    id: 'd1-s1',
    day: 1,
    title: "Session 1: Application of Procurement Law in the School Setting",
    speakers: [{ id: 'spk-1', name: "Atty. Ruhjen S. Osmeña", topic: "Procurement Law" }]
  },
  {
    id: 'd1-s2',
    day: 1,
    title: "Session 2: Restorative Justice and Victimology",
    speakers: [{ id: 'spk-2', name: "Dr. Janette S. Padua", topic: "Restorative Justice" }]
  },
  {
    id: 'd1-s3',
    day: 1,
    title: "Session 3: Salient Features of DepEd Order 49, s. 2006",
    speakers: [{ id: 'spk-3', name: "Atty. Hiede S. Manginga", topic: "DepEd Order 49" }]
  },
  // Day 2
  {
    id: 'd2-s4',
    day: 2,
    title: "Session 4: Proper Handling of Child Protection Concerns",
    speakers: [{ id: 'spk-4', name: "Atty. Ruhjen S. Osmeña", topic: "Child Protection" }]
  },
  {
    id: 'd2-s5',
    day: 2,
    title: "Session 5: Legal Matters that School Heads Should Know",
    speakers: [{ id: 'spk-5', name: "Atty. Analiza G. Esperanza", topic: "Legal Matters" }]
  },
  {
    id: 'd2-s6',
    day: 2,
    title: "Session 6: PTA Common Issues and Concerns (DO 13, s. 2022)",
    speakers: [{ id: 'spk-6', name: "Atty. Katherine Mae M. Hoggang", topic: "PTA Issues" }]
  },
  // Day 3
  {
    id: 'd3-s7',
    day: 3,
    title: "Session 7: Grievance and Mediation",
    speakers: [{ id: 'spk-7', name: "Atty. Jean N. Litusquen", topic: "Grievance and Mediation" }]
  },
  {
    id: 'd3-mancom',
    day: 3,
    title: "Management Committee Meeting",
    speakers: [{ id: 'spk-8', name: "Carleen S. Sedilla, CESO V", topic: "SDS Address / MANCOM" }]
  }
];

export const GENERAL_QUESTIONS: Question[] = [
  { id: 'g1', text: "Registration process was systematic and efficient." },
  { id: 'g2', text: "The venue (DAP Tagaytay) was conducive to learning." },
  { id: 'g3', text: "Food and accommodation were satisfactory." },
  { id: 'g4', text: "The secretariat/program management team was helpful." },
  { id: 'g5', text: "The seminar objectives were clearly met." }
];

export const SESSION_QUESTIONS: Question[] = [
  { id: 'sq1', text: "The speaker demonstrated mastery of the topic." },
  { id: 'sq2', text: "The topic was relevant to my role/function." },
  { id: 'sq3', text: "The presentation materials were clear and readable." },
  { id: 'sq4', text: "Time management was observed." }
];