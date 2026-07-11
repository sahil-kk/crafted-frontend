export type AppRole = "admin" | "teacher" | "student" | "parent";

export interface MockUser {
  id: string;
  studentId?: string;
  email: string;
  role: AppRole;
  full_name: string;
  created_at: string;
  course?: string;
  batch?: string;
  phone?: string;
  profilePhoto?: string;
  subject?: string;
  linkedStudentId?: string;
  relationship?: string;
}

export interface Course {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

export interface RecordedClass {
  id: string;
  title: string;
  description: string;
  youtube_id: string;
  course_id: string | null;
  created_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  is_global: boolean;
  created_at: string;
}

export interface Exam {
  id: string;
  title: string;
  description: string;
  exam_type: string;
  duration_minutes: number;
  starts_at: string | null;
  course_id: string | null;
  pdf?: string;
  created_at: string;
}

export interface Question {
  id: string;
  exam_id: string;
  question_text: string;
  question_type: "mcq" | "short" | "long";
  marks: number;
  options: string[] | null;
  correct_answer: string | null;
  position: number;
}

export interface ExamAttempt {
  id: string;
  exam_id: string;
  student_id: string;
  status: "in_progress" | "submitted";
  started_at: string;
  submitted_at: string | null;
  score: number | null;
  max_score: number | null;
}

export interface AttemptAnswer {
  id: string;
  attempt_id: string;
  question_id: string;
  answer: string;
  awarded_marks: number | null;
}

export interface MockAppState {
  users: MockUser[];
  courses: Course[];
  recordedClasses: RecordedClass[];
  announcements: Announcement[];
  exams: Exam[];
  questions: Question[];
  attempts: ExamAttempt[];
  attemptAnswers: AttemptAnswer[];
  results: unknown[];
  timetables: unknown[];
}

export const createId = (prefix: string) =>
  `${prefix}-${Math.random().toString(36).slice(2, 10)}`;

const now = new Date("2026-04-20T09:00:00.000Z");
const daysAgo = (n: number) => new Date(now.getTime() - n * 24 * 60 * 60 * 1000).toISOString();
const daysAhead = (n: number, hour = 10) => {
  const date = new Date(now.getTime() + n * 24 * 60 * 60 * 1000);
  date.setUTCHours(hour, 0, 0, 0);
  return date.toISOString();
};

export const initialMockState: MockAppState = {
  users: [
    { id: "student-1", email: "student@demo.com", role: "student", full_name: "Aarav Patel", created_at: daysAgo(30) },
    { id: "student-2", email: "riya@demo.com", role: "student", full_name: "Riya Sharma", created_at: daysAgo(24) },
    { id: "teacher-1", email: "teacher@demo.com", role: "teacher", full_name: "Neha Verma", created_at: daysAgo(40) },
    { id: "admin-1", email: "admin@demo.com", role: "admin", full_name: "Platform Admin", created_at: daysAgo(60) },
  ],
  courses: [
    { id: "course-1", name: "Mathematics", description: "Foundations, algebra, and calculus practice.", created_at: daysAgo(35) },
    { id: "course-2", name: "Physics", description: "Concepts, numericals, and exam prep.", created_at: daysAgo(33) },
    { id: "course-3", name: "Chemistry", description: "Theory, reactions, and mock tests.", created_at: daysAgo(28) },
  ],
  recordedClasses: [
    {
      id: "class-1",
      title: "Limits and Continuity Explained",
      description: "A clear walkthrough of core calculus ideas with examples.",
      youtube_id: "dQw4w9WgXcQ",
      course_id: "course-1",
      created_at: daysAgo(6),
    },
    {
      id: "class-2",
      title: "Newton's Laws Revision Session",
      description: "Quick recap with problem-solving strategies for weekly tests.",
      youtube_id: "M7lc1UVf-VE",
      course_id: "course-2",
      created_at: daysAgo(4),
    },
    {
      id: "class-3",
      title: "Chemical Bonding in 20 Minutes",
      description: "Fast but structured revision of ionic and covalent bonding.",
      youtube_id: "ysz5S6PUM-U",
      course_id: "course-3",
      created_at: daysAgo(2),
    },
  ],
  announcements: [
    {
      id: "announcement-1",
      title: "Weekly revision plan published",
      body: "Check the updated revision schedule before Friday's assessment.",
      is_global: true,
      created_at: daysAgo(1),
    },
    {
      id: "announcement-2",
      title: "Physics doubt session tomorrow",
      body: "Join the optional live session at 5:00 PM for chapter 5 questions.",
      is_global: false,
      created_at: daysAgo(3),
    },
  ],
  exams: [
    {
      id: "exam-1",
      title: "Mathematics Weekly Test 4",
      description: "Algebra and functions mixed practice set.",
      exam_type: "weekly",
      duration_minutes: 30,
      starts_at: daysAhead(2, 4),
      course_id: "course-1",
      created_at: daysAgo(2),
    },
    {
      id: "exam-2",
      title: "Physics Chapter 5 Quiz",
      description: "Motion and forces quick check.",
      exam_type: "practice",
      duration_minutes: 20,
      starts_at: daysAhead(4, 8),
      course_id: "course-2",
      created_at: daysAgo(2),
    },
    {
      id: "exam-3",
      title: "Chemistry Mock Exam",
      description: "Objective and descriptive mix for mock readiness.",
      exam_type: "monthly",
      duration_minutes: 45,
      starts_at: daysAhead(6, 5),
      course_id: "course-3",
      created_at: daysAgo(1),
    },
  ],
  questions: [
    {
      id: "question-1",
      exam_id: "exam-1",
      question_text: "What is the value of 2x + 3 when x = 4?",
      question_type: "mcq",
      marks: 2,
      options: ["8", "10", "11", "12"],
      correct_answer: "11",
      position: 0,
    },
    {
      id: "question-2",
      exam_id: "exam-1",
      question_text: "Explain the meaning of a linear function in one or two sentences.",
      question_type: "short",
      marks: 3,
      options: null,
      correct_answer: null,
      position: 1,
    },
    {
      id: "question-3",
      exam_id: "exam-2",
      question_text: "Which law states that force equals mass into acceleration?",
      question_type: "mcq",
      marks: 2,
      options: ["First law", "Second law", "Third law", "Law of gravitation"],
      correct_answer: "Second law",
      position: 0,
    },
    {
      id: "question-4",
      exam_id: "exam-3",
      question_text: "Write a short note on ionic bonding.",
      question_type: "long",
      marks: 5,
      options: null,
      correct_answer: null,
      position: 0,
    },
  ],
  attempts: [
    {
      id: "attempt-1",
      exam_id: "exam-0",
      student_id: "student-1",
      status: "submitted",
      started_at: daysAgo(10),
      submitted_at: daysAgo(10),
      score: 18,
      max_score: 20,
    },
    {
      id: "attempt-2",
      exam_id: "exam-00",
      student_id: "student-1",
      status: "submitted",
      started_at: daysAgo(7),
      submitted_at: daysAgo(7),
      score: 40,
      max_score: 50,
    },
  ],
  attemptAnswers: [],
  results: [],
  timetables: [],
};
