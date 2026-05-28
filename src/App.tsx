import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { AppDataProvider } from "@/hooks/useAppData";
import { RoleRoute } from "@/components/RoleRoute";

import StudentLogin from "./pages/Index.tsx";
import TeacherLogin from "./pages/auth/TeacherLogin";
import AdminLogin from "./pages/auth/AdminLogin";

import StudentDashboard from "./pages/student/StudentDashboard";
import StudentNews from "./pages/student/StudentNews";
import StudentClasses from "./pages/student/StudentClasses";
import StudentExams from "./pages/student/StudentExams";
import StudentResults from "./pages/student/StudentResults";
import TakeExam from "./pages/student/TakeExam";
import StudentProfile from "./pages/student/StudentProfile";

import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCourses from "./pages/admin/AdminCourses";
import AdminSettings from "./pages/admin/AdminSettings";

import { ManageUsersPage } from "./pages/shared/ManageUsersPage";
import ClassesManager from "./pages/shared/ClassesManager";
import ExamsManager from "./pages/shared/ExamsManager";
import ExamQuestionsEditor from "./pages/shared/ExamQuestionsEditor";
import AnnouncementsManager from "./pages/shared/AnnouncementsManager";
import ResultsManager from "./pages/shared/ResultsManager";
import TimetableManager from "./pages/shared/TimetableManager";
import StudentTimetable from "./pages/student/StudentTimetable";

import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppDataProvider>
            <Routes>
            {/* Public auth routes */}
            <Route path="/" element={<StudentLogin />} />
            <Route path="/teacher" element={<TeacherLogin />} />
            <Route path="/admin" element={<AdminLogin />} />

            {/* Student */}
            <Route path="/dashboard" element={<RoleRoute allow={["student"]}><StudentDashboard /></RoleRoute>} />
            <Route path="/dashboard/news" element={<RoleRoute allow={["student"]}><StudentNews /></RoleRoute>} />
            <Route path="/dashboard/classes" element={<RoleRoute allow={["student"]}><StudentClasses /></RoleRoute>} />
            <Route path="/dashboard/exams" element={<RoleRoute allow={["student"]}><StudentExams /></RoleRoute>} />
            <Route path="/dashboard/exams/:examId" element={<RoleRoute allow={["student"]}><TakeExam /></RoleRoute>} />
            <Route path="/dashboard/results" element={<RoleRoute allow={["student"]}><StudentResults /></RoleRoute>} />
            <Route path="/dashboard/timetable" element={<RoleRoute allow={["student"]}><StudentTimetable /></RoleRoute>} />
            <Route path="/dashboard/profile" element={<RoleRoute allow={["student"]}><StudentProfile /></RoleRoute>} />

            {/* Teacher */}
            <Route path="/teacher/dashboard" element={<RoleRoute allow={["teacher"]} fallback="/teacher"><TeacherDashboard /></RoleRoute>} />
            <Route path="/teacher/students" element={<RoleRoute allow={["teacher"]} fallback="/teacher"><ManageUsersPage role="student" viewerRole="teacher" title="My Students" description="Students on the platform" /></RoleRoute>} />
            <Route path="/teacher/classes" element={<RoleRoute allow={["teacher"]} fallback="/teacher"><ClassesManager viewerRole="teacher" /></RoleRoute>} />
            <Route path="/teacher/exams" element={<RoleRoute allow={["teacher"]} fallback="/teacher"><ExamsManager viewerRole="teacher" /></RoleRoute>} />
            <Route path="/teacher/exams/:examId/questions" element={<RoleRoute allow={["teacher"]} fallback="/teacher"><ExamQuestionsEditor viewerRole="teacher" /></RoleRoute>} />
            <Route path="/teacher/announcements" element={<RoleRoute allow={["teacher"]} fallback="/teacher"><AnnouncementsManager viewerRole="teacher" /></RoleRoute>} />
            <Route path="/teacher/results" element={<RoleRoute allow={["teacher"]} fallback="/teacher"><ResultsManager viewerRole="teacher" /></RoleRoute>} />
            <Route path="/teacher/timetable" element={<RoleRoute allow={["teacher"]} fallback="/teacher"><TimetableManager viewerRole="teacher" /></RoleRoute>} />

            {/* Admin */}
            <Route path="/admin/dashboard" element={<RoleRoute allow={["admin"]} fallback="/admin"><AdminDashboard /></RoleRoute>} />
            <Route path="/admin/students" element={<RoleRoute allow={["admin"]} fallback="/admin"><ManageUsersPage role="student" viewerRole="admin" title="Students" description="Manage all students on the platform" /></RoleRoute>} />
            <Route path="/admin/teachers" element={<RoleRoute allow={["admin"]} fallback="/admin"><ManageUsersPage role="teacher" viewerRole="admin" title="Teachers" description="Manage all teachers on the platform" /></RoleRoute>} />
            <Route path="/admin/courses" element={<RoleRoute allow={["admin"]} fallback="/admin"><AdminCourses /></RoleRoute>} />
            <Route path="/admin/exams" element={<RoleRoute allow={["admin"]} fallback="/admin"><ExamsManager viewerRole="admin" /></RoleRoute>} />
            <Route path="/admin/exams/:examId/questions" element={<RoleRoute allow={["admin"]} fallback="/admin"><ExamQuestionsEditor viewerRole="admin" /></RoleRoute>} />
            <Route path="/admin/announcements" element={<RoleRoute allow={["admin"]} fallback="/admin"><AnnouncementsManager viewerRole="admin" /></RoleRoute>} />
            <Route path="/admin/settings" element={<RoleRoute allow={["admin"]} fallback="/admin"><AdminSettings /></RoleRoute>} />
            <Route path="/admin/results" element={<RoleRoute allow={["admin"]} fallback="/admin"><ResultsManager viewerRole="admin" /></RoleRoute>} />
            <Route path="/admin/timetable" element={<RoleRoute allow={["admin"]} fallback="/admin"><TimetableManager viewerRole="admin" /></RoleRoute>} />

            <Route path="*" element={<NotFound />} />
            </Routes>
          </AppDataProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
