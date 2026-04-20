import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import {
  Announcement,
  AttemptAnswer,
  Course,
  createId,
  Exam,
  ExamAttempt,
  initialMockState,
  MockAppState,
  MockUser,
  Question,
  RecordedClass,
} from "@/lib/mockData";
export interface TimetableObj { id?: string; _id?: string; day: string; time: string; subject: string; teacher: string; studentId?: string; }
export interface ResultObj { id?: string; _id?: string; studentId: string; subject: string; examType: string; score: number; maxScore: number; grade?: string; trend?: string; date?: string; }
import { apiClient } from "@/lib/apiClient";
import { useAuth } from "./useAuth";

interface CreateUserInput {
  email: string;
  full_name: string;
  role: MockUser["role"];
}

interface UpdateUserInput {
  id: string;
  email?: string;
  full_name?: string;
  password?: string;
  role: MockUser["role"];
}

interface CreateCourseInput {
  name: string;
  description: string;
}

interface CreateClassInput {
  title: string;
  description: string;
  youtube_id: string;
  course_id: string | null;
}

interface CreateAnnouncementInput {
  title: string;
  body: string;
  is_global: boolean;
}

interface CreateExamInput {
  file: File | null;
  studentId: string | null;
  title: string;
  description: string;
  exam_type: string;
  duration_minutes: number;
  starts_at: string | null;
  course_id: string | null;
}

interface CreateQuestionInput {
  exam_id: string;
  question_text: string;
  question_type: Question["question_type"];
  marks: number;
  options: string[] | null;
  correct_answer: string | null;
}

interface SubmitExamInput {
  attemptId: string;
  answers: Record<string, string>;
}

interface AppDataContextValue extends MockAppState {
  createUser: (input: CreateUserInput) => void;
  deleteUser: (id: string, role?: string) => void;
  updateUser: (input: UpdateUserInput) => void;
  createCourse: (input: CreateCourseInput) => void;
  deleteCourse: (id: string) => void;
  createClass: (input: CreateClassInput) => void;
  deleteClass: (id: string) => void;
  createAnnouncement: (input: CreateAnnouncementInput) => void;
  deleteAnnouncement: (id: string) => void;
  createExam: (input: CreateExamInput) => string;
  deleteExam: (id: string) => void;
  createQuestion: (input: CreateQuestionInput) => void;
  deleteQuestion: (id: string) => void;
  getOrCreateAttempt: (examId: string, studentId: string) => ExamAttempt;
  saveAnswer: (attemptId: string, questionId: string, answer: string) => void;
  submitExam: (input: SubmitExamInput) => void;
  results: ResultObj[];
  timetables: TimetableObj[];
  createTimetable: (input: TimetableObj) => void;
  deleteTimetable: (id: string) => void;
  createResult: (res: ResultObj) => void;
  deleteResult: (id: string) => void;
}

const STORAGE_KEY = "ui-only-school-app";
const AppDataContext = createContext<AppDataContextValue | undefined>(undefined);

const loadState = (): MockAppState => {
  if (typeof window === "undefined") return initialMockState;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return initialMockState;
  try {
    return JSON.parse(raw) as MockAppState;
  } catch {
    return initialMockState;
  }
};

export const AppDataProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<MockAppState>(initialMockState);
  const { session } = useAuth();
  
  useEffect(() => {
    if (!session?.access_token) return;
    
    // Fetch initial state from backend
    const fetchAll = async () => {
      try {
        const [students, teachers, courses, announcements, exams, classes, results, timetables] = await Promise.all([
          apiClient<any[]>("/students").catch(() => []),
          apiClient<any[]>("/admin/teachers").catch(() => []),
          apiClient<any[]>("/courses").catch(() => []),
          apiClient<any[]>("/announcements").catch(() => []),
          apiClient<any[]>("/exams").catch(() => []),
          apiClient<any[]>("/classes").catch(() => []),
          apiClient<any[]>("/results").catch(() => []),
          apiClient<any[]>("/timetable").catch(() => []),
        ]);
        
        const combinedUsers = [
          ...(students || []).map((u: any) => ({
            id: u._id || u.studentId,
            email: u.email,
            full_name: u.name,
            role: "student",
            created_at: u.createdAt || new Date().toISOString()
          })),
          ...(teachers || []).map((u: any) => ({
            id: u._id,
            email: u.email,
            full_name: u.name,
            role: "teacher",
            created_at: u.createdAt || new Date().toISOString()
          }))
        ];

        setState(prev => ({
          ...prev,
          users: combinedUsers,
          courses: (courses || []).map(c => ({
            id: c._id,
            name: c.name,
            description: c.description,
            created_at: c.createdAt || new Date().toISOString()
          })),
          announcements: (announcements || []).map(a => ({
            id: a._id,
            title: a.title,
            body: a.content || a.message || a.body || "",
            is_global: true,
            created_at: a.createdAt || new Date().toISOString()
          })),
          recordedClasses: (classes || []).map((c: any) => ({
            id: c._id,
            title: c.title,
            description: c.description,
            youtube_id: c.youtube_id,
            course_id: c.course_id,
            created_at: c.createdAt || new Date().toISOString()
          })),
          timetables: timetables || [],
          results: results || [],
          exams: (exams || []).map(e => ({
            id: e._id,
            title: e.title,
            description: e.subject || "",
            exam_type: "pdf",
            duration_minutes: 60,
            starts_at: e.date || new Date().toISOString(),
            course_id: null,
            created_at: e.createdAt || new Date().toISOString()
          })),
        }));
      } catch (err) {
        console.error("Failed to fetch initial state", err);
      }
    };
    fetchAll();
  }, [session?.access_token]);

  // Sync state to local storage is kept for mock fallback features
  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);


  const value = useMemo<AppDataContextValue>(() => ({
    ...state,
    createUser: async (input) => {
      try {
        const password = "password123"; // default fallback for local mock
        let endpoint = input.role === "teacher" ? "/admin/teachers" : "/students";
        let body: any = { password, email: input.email, name: input.full_name };
        if (input.role === "student") {
          body.studentId = input.email.split('@')[0];
          body.course = "General";
        }
        const res = await apiClient<any>(endpoint, { method: "POST", body: JSON.stringify(body) });
        
        const actualId = (res.student?._id || res.teacher?._id || res._id) || createId("user");
        
        setState((prev) => ({
          ...prev,
          users: [
            {
              id: actualId,
              email: input.email,
              full_name: input.full_name,
              role: input.role,
              created_at: new Date().toISOString(),
            },
            ...prev.users,
          ],
        }));
      } catch (err) {
        console.error(err);
      }
    },
    deleteUser: async (id, role: any) => {
      try {
        if (role) {
           let endpoint = role === "teacher" ? `/admin/teachers/${id}` : `/students/${id}`;
           await apiClient(endpoint, { method: "DELETE" }).catch(console.error);
        }
      } catch (e) {}
      setState((prev) => ({
        ...prev,
        users: prev.users.filter((user) => user.id !== id),
        attempts: prev.attempts.filter((attempt) => attempt.student_id !== id),
      }));
    },
    updateUser: async (input) => {
      try {
        let endpoint = input.role === "teacher" ? `/admin/teachers/${input.id}` : `/students/${input.id}`;
        let body: any = {};
        if (input.email !== undefined) body.email = input.email;
        if (input.full_name !== undefined) body.name = input.full_name;
        if (input.password !== undefined) body.password = input.password;
        
        await apiClient<any>(endpoint, { method: "PATCH", body: JSON.stringify(body) });
        
        setState((prev) => ({
          ...prev,
          users: prev.users.map(u => u.id === input.id ? { 
              ...u, 
              email: input.email !== undefined ? input.email : u.email, 
              full_name: input.full_name !== undefined ? input.full_name : u.full_name 
            } : u)
        }));
      } catch (err) {
        console.error(err);
      }
    },
    createCourse: async (input) => {
      try {
        const res = await apiClient<any>("/courses", {
          method: "POST",
          body: JSON.stringify({ name: input.name, description: input.description, duration:"1 month", color:"blue" })
        });
        setState((prev) => ({
          ...prev,
          courses: [
            {
              id: res.course?._id || createId("course"),
              name: input.name,
              description: input.description,
              created_at: new Date().toISOString(),
            },
            ...prev.courses,
          ],
        }));
      } catch (err) {
        console.error("Create course failed", err);
      }
    },
    deleteCourse: async (id) => {
      try {
        await apiClient(`/courses/${id}`, { method: "DELETE" });
      } catch (e) { console.error(e); }
      setState((prev) => ({
        ...prev,
        courses: prev.courses.filter((course) => course.id !== id),
      }));
    },
    createClass: async (input) => {
      try {
        const res = await apiClient<any>("/classes", {
          method: "POST",
          body: JSON.stringify({
            title: input.title,
            description: input.description,
            youtube_id: input.youtube_id,
            course_id: input.course_id
          })
        });
        
        setState((prev) => ({
          ...prev,
          recordedClasses: [
            {
              id: res._id || createId("class"),
              title: input.title,
              description: input.description,
              youtube_id: input.youtube_id,
              course_id: input.course_id,
              created_at: new Date().toISOString(),
            },
            ...prev.recordedClasses,
          ],
        }));
      } catch(e) { }
    },
    deleteClass: async (id) => {
      try {
        await apiClient(`/classes/${id}`, { method: "DELETE" }).catch(console.error);
      } catch(e) {}
      setState((prev) => ({
        ...prev,
        recordedClasses: prev.recordedClasses.filter((item) => item.id !== id),
      }));
    },
    createAnnouncement: (input) => {
      setState((prev) => ({
        ...prev,
        announcements: [
          {
            id: createId("announcement"),
            title: input.title,
            body: input.body,
            is_global: input.is_global,
            created_at: new Date().toISOString(),
          },
          ...prev.announcements,
        ],
      }));
    },
    deleteAnnouncement: (id) => {
      setState((prev) => ({
        ...prev,
        announcements: prev.announcements.filter((item) => item.id !== id),
      }));
    },
    createExam: async (input) => {
      try {
        let formData = new FormData();
        formData.append("title", input.title);
        formData.append("subject", input.description || "General");
        formData.append("date", input.starts_at || new Date().toISOString());
        if (input.studentId) formData.append("studentId", input.studentId);
        if (input.file) formData.append("pdf", input.file);
        
        const res = await apiClient<any>("/exams/add", {
          method: "POST",
          body: formData
        });

        setState((prev) => ({
          ...prev,
          exams: [
            {
              id: res.exam?._id || createId("exam"),
              title: input.title,
              description: input.description,
              exam_type: input.exam_type,
              duration_minutes: input.duration_minutes,
              starts_at: input.starts_at,
              course_id: input.course_id,
              created_at: new Date().toISOString(),
            },
            ...prev.exams,
          ],
        }));
        return res.exam?._id || "123";
      } catch(e) { console.error(e); return "123"; }
    },
    createResult: async (input) => { 
        try {
            const res = await apiClient<any>("/results/add", { method: "POST", body: JSON.stringify(input) });
            setState(prev => ({ ...prev, results: [res.result, ...prev.results] }));
        } catch(e){}
    },
    deleteResult: async (id) => {
        try {
            await apiClient(`/results/delete/${id}`, { method: "DELETE" });
            setState(prev => ({ ...prev, results: prev.results.filter((r: any) => r._id !== id && r.id !== id) }));
        } catch(e){}
    },
    createTimetable: async (input) => {
      try {
        const res = await apiClient<any>("/timetable", { method: "POST", body: JSON.stringify(input) });
        setState(prev => ({ ...prev, timetables: [res, ...prev.timetables] }));
      } catch(e){}
    },
    deleteTimetable: async (id) => {
      try {
        await apiClient(`/timetable/${id}`, { method: "DELETE" });
        setState(prev => ({ ...prev, timetables: prev.timetables.filter((t: any) => t._id !== id && t.id !== id) }));
      } catch(e){}
    },
    deleteExam: async (id) => {
      try { await apiClient(`/exams/${id}`, { method: "DELETE" }); } catch(e){}
      setState((prev) => {
        const attemptIds = prev.attempts.filter((attempt) => attempt.exam_id === id).map((attempt) => attempt.id);
        return {
          ...prev,
          exams: prev.exams.filter((exam) => exam.id !== id),
          questions: prev.questions.filter((question) => question.exam_id !== id),
          attempts: prev.attempts.filter((attempt) => attempt.exam_id !== id),
          attemptAnswers: prev.attemptAnswers.filter((answer) => !attemptIds.includes(answer.attempt_id)),
        };
      });
    },
    createQuestion: (input) => {
      setState((prev) => {
        const position = prev.questions.filter((question) => question.exam_id === input.exam_id).length;
        return {
          ...prev,
          questions: [
            ...prev.questions,
            {
              id: createId("question"),
              exam_id: input.exam_id,
              question_text: input.question_text,
              question_type: input.question_type,
              marks: input.marks,
              options: input.options,
              correct_answer: input.correct_answer,
              position,
            },
          ],
        };
      });
    },
    deleteQuestion: (id) => {
      setState((prev) => ({
        ...prev,
        questions: prev.questions.filter((question) => question.id !== id),
        attemptAnswers: prev.attemptAnswers.filter((answer) => answer.question_id !== id),
      }));
    },
    getOrCreateAttempt: (examId, studentId) => {
      let nextAttempt: ExamAttempt | undefined;
      setState((prev) => {
        const existing = prev.attempts.find(
          (attempt) => attempt.exam_id === examId && attempt.student_id === studentId,
        );
        if (existing) {
          nextAttempt = existing;
          return prev;
        }
        nextAttempt = {
          id: createId("attempt"),
          exam_id: examId,
          student_id: studentId,
          status: "in_progress",
          started_at: new Date().toISOString(),
          submitted_at: null,
          score: null,
          max_score: null,
        };
        return {
          ...prev,
          attempts: [...prev.attempts, nextAttempt],
        };
      });
      return nextAttempt!;
    },
    saveAnswer: (attemptId, questionId, answer) => {
      setState((prev) => {
        const existing = prev.attemptAnswers.find(
          (item) => item.attempt_id === attemptId && item.question_id === questionId,
        );
        if (existing) {
          return {
            ...prev,
            attemptAnswers: prev.attemptAnswers.map((item) =>
              item.id === existing.id ? { ...item, answer } : item,
            ),
          };
        }
        return {
          ...prev,
          attemptAnswers: [
            ...prev.attemptAnswers,
            {
              id: createId("answer"),
              attempt_id: attemptId,
              question_id: questionId,
              answer,
              awarded_marks: null,
            },
          ],
        };
      });
    },
    submitExam: ({ attemptId, answers }) => {
      setState((prev) => {
        const attempt = prev.attempts.find((item) => item.id === attemptId);
        if (!attempt) return prev;
        const examQuestions = prev.questions.filter((question) => question.exam_id === attempt.exam_id);
        let score = 0;
        const maxScore = examQuestions.reduce((sum, question) => sum + Number(question.marks), 0);
        const updatedAnswers: AttemptAnswer[] = prev.attemptAnswers.map((item) => {
          const question = examQuestions.find((entry) => entry.id === item.question_id);
          if (!question || item.attempt_id !== attemptId) return item;
          if (question.question_type !== "mcq") return { ...item, answer: answers[item.question_id] ?? item.answer };
          const awarded = question.correct_answer === (answers[item.question_id] ?? item.answer) ? Number(question.marks) : 0;
          score += awarded;
          return {
            ...item,
            answer: answers[item.question_id] ?? item.answer,
            awarded_marks: awarded,
          };
        });
        return {
          ...prev,
          attemptAnswers: updatedAnswers,
          attempts: prev.attempts.map((item) =>
            item.id === attemptId
              ? {
                  ...item,
                  status: "submitted",
                  submitted_at: new Date().toISOString(),
                  score,
                  max_score: maxScore,
                }
              : item,
          ),
        };
      });
    },
  }), [state]);

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
};

export const useAppData = () => {
  const context = useContext(AppDataContext);
  if (!context) throw new Error("useAppData must be used within AppDataProvider");
  return context;
};
