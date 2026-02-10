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

export const PROGRAM_QUESTIONS: Question[] = [
  { id: 'pm1', text: "The program started and ended on time." },
  { id: 'pm2', text: "The information and instructions given throughout the program were clear and easy to follow." },
  { id: 'pm3', text: "The organization of the program was logical." },
  { id: 'pm4', text: "The program was structured properly." },
  { id: 'pm5', text: "Socially-inclusive, gender-sensitive, and non-discriminatory stereotypical language was always used." },
  { id: 'pm6', text: "The program was managed efficiently." },
  { id: 'pm7', text: "The PMT is responsive to the needs of the participants." }
];

export const VENUE_QUESTIONS: Question[] = [
  { id: 'v1', text: "The venue is well-lighted and well-ventilated." },
  { id: 'v2', text: "The venue has sufficient space for program activities." },
  { id: 'v3', text: "The venue has adequate soundproofing." },
  { id: 'v4', text: "The venue is clean and has accessible comfort rooms." },
  { id: 'v5', text: "The internet access was usable" }
];

export const MEAL_QUESTIONS: Question[] = [
  { id: 'm1', text: "Meals were of satisfactory quality and varied." },
  { id: 'm2', text: "Meals were nutritious." },
  { id: 'm3', text: "Meals served on time" }
];

export const SESSION_QUESTIONS: Question[] = [
  { id: 'sq1', text: "The session started on time." },
  { id: 'sq2', text: "The session objectives were explained at the beginning of the session." },
  { id: 'sq3', text: "The resource speaker explained the topics in an understandable level." },
  { id: 'sq4', text: "The time and pace allotted for the session was sufficient to absorb inputs or to accomplish outputs." },
  { id: 'sq5', text: "The resource speaker establishes rapport with participants." },
  { id: 'sq6', text: "The resource speaker established and maintained a positive/non-threatening and comfortable learning environment." },
  { id: 'sq7', text: "The resource speaker demonstrated good communication skills (verbal and non-verbal)." },
  { id: 'sq8', text: "The resource speaker used appropriate technology with ease and confidence." },
  { id: 'sq9', text: "The resource speaker synthesized the responses of the participants and the activities of the session." },
  { id: 'sq10', text: "The resource speaker exhibited flexibility and adaptability in the delivery of the session to ensure an appropriate response to unforeseen situations." },
  { id: 'sq11', text: "The resource speaker presented him/herself in a professional manner." },
  { id: 'sq12', text: "The session ended on time." }
];