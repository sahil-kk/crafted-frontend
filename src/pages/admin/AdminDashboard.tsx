import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, GraduationCap, ClipboardList, Video, Database, Radio, Activity, Award,
  UserCheck, FileText, GraduationCap as TermIcon, FileSpreadsheet, BookOpen, TrendingUp, Settings, ChevronRight
} from "lucide-react";
import { useAppData } from "@/hooks/useAppData";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";

// Beautiful Animated Count-Up component
const AnimatedNumber = ({ value }: { value: number }) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (end <= 0) {
      setCurrent(0);
      return;
    }
    const duration = 800;
    const stepTime = Math.abs(Math.floor(duration / end));
    const timer = setInterval(() => {
      start += 1;
      setCurrent(start);
      if (start >= end) {
        clearInterval(timer);
      }
    }, Math.max(stepTime, 15));

    return () => clearInterval(timer);
  }, [value]);

  return <span>{current}</span>;
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { users, classes, exams, results } = useAppData();
  const [academicYear, setAcademicYear] = useState<string>("2026-2027");

  // Dynamic Live numbers state
  const [liveSessions, setLiveSessions] = useState(14);
  const [queryCount, setQueryCount] = useState(1524);

  // Live fluctuating values simulation
  useEffect(() => {
    const sessionTimer = setInterval(() => {
      setLiveSessions((prev) => {
        const delta = Math.floor(Math.random() * 3) - 1;
        return Math.max(5, Math.min(35, prev + delta));
      });
    }, 4000);

    const queryTimer = setInterval(() => {
      setQueryCount((prev) => prev + Math.floor(Math.random() * 5) + 1);
    }, 2000);

    return () => {
      clearInterval(sessionTimer);
      clearInterval(queryTimer);
    };
  }, []);

  const totalStudents = users.filter((u) => u.role === "student").length;
  const totalTeachers = users.filter((u) => u.role === "teacher").length;

  // Year filter modifier (simulated multiplier for demo, scales base data)
  const multiplier = academicYear === "2025-2026" ? 0.8 : academicYear === "2027-2028" ? 1.25 : 1.0;

  const scaledStats = {
    students: Math.round(totalStudents * multiplier) || 2,
    teachers: Math.round(totalTeachers * multiplier) || 1,
    classes: Math.round((classes?.length || 0) * multiplier) || 1,
    exams: Math.round((exams?.length || 0) * multiplier) || 1,
  };

  // Color theme cards matching user's reference image
  const dashboardCards = [
    {
      title: "Attendance",
      description: "Mark daily attendance for your classes",
      icon: UserCheck,
      path: "/admin/timetable",
      bgClass: "bg-[#f0f5ff] dark:bg-[#1d273f] hover:bg-[#e4eeff]",
      iconBg: "bg-[#2563eb]",
      iconColor: "text-white",
      borderColor: "border-blue-200 dark:border-blue-900/40"
    },
    {
      title: "Daily Viva (DV)",
      description: "Conduct and manage daily viva assessments",
      icon: FileText,
      path: "/admin/exams",
      bgClass: "bg-[#fdf2f8] dark:bg-[#321d28] hover:bg-[#fbe4f1]",
      iconBg: "bg-[#db2777]",
      iconColor: "text-white",
      borderColor: "border-pink-200 dark:border-pink-900/40"
    },
    {
      title: "Unit Test (UT)",
      description: "Create and evaluate unit tests",
      icon: ClipboardList,
      path: "/admin/exams",
      bgClass: "bg-[#f8fafc] dark:bg-[#202736] hover:bg-[#f1f5f9]",
      iconBg: "bg-[#475569]",
      iconColor: "text-white",
      borderColor: "border-slate-200 dark:border-slate-800/40"
    },
    {
      title: "Term Exam (SA)",
      description: "Summative Assessment entry and reports",
      icon: TermIcon,
      path: "/admin/results",
      bgClass: "bg-[#f5f3ff] dark:bg-[#221c38] hover:bg-[#ede9fe]",
      iconBg: "bg-[#7c3aed]",
      iconColor: "text-white",
      borderColor: "border-purple-200 dark:border-purple-900/40"
    },
    {
      title: "FA Entry",
      description: "Formative Assessment marks entry",
      icon: FileSpreadsheet,
      path: "/admin/results",
      bgClass: "bg-[#ecfeff] dark:bg-[#1a2d33] hover:bg-[#d0fbe0]",
      iconBg: "bg-[#0891b2]",
      iconColor: "text-white",
      borderColor: "border-cyan-200 dark:border-cyan-900/40"
    },
    {
      title: "Practice Entry",
      description: "Track student practice sessions",
      icon: BookOpen,
      path: "/admin/courses",
      bgClass: "bg-[#f0fdf4] dark:bg-[#192c1f] hover:bg-[#dcfce7]",
      iconBg: "bg-[#16a34a]",
      iconColor: "text-white",
      borderColor: "border-green-200 dark:border-green-900/40"
    },
    {
      title: "Student Growth",
      description: "Monitor student growth indicators",
      icon: TrendingUp,
      path: "/admin/growth-meter",
      bgClass: "bg-[#fef2f2] dark:bg-[#341d1d] hover:bg-[#fee2e2]",
      iconBg: "bg-[#dc2626]",
      iconColor: "text-white",
      borderColor: "border-red-200 dark:border-red-900/40"
    },
    {
      title: "AST Management",
      description: "Academic system tracking",
      icon: Settings,
      path: "/admin/settings",
      bgClass: "bg-[#faf5ff] dark:bg-[#251b38] hover:bg-[#f3e8ff]",
      iconBg: "bg-[#9333ea]",
      iconColor: "text-white",
      borderColor: "border-fuchsia-200 dark:border-fuchsia-900/40"
    }
  ];

  const loadData = [
    { hour: "08:00", activeUsers: 8, requests: 120 },
    { hour: "10:00", activeUsers: 16, requests: 310 },
    { hour: "12:00", activeUsers: 22, requests: 460 },
    { hour: "14:00", activeUsers: scaledStats.students * 1.4, requests: 540 },
    { hour: "16:00", activeUsers: 20, requests: 390 },
    { hour: "18:00", activeUsers: 12, requests: 260 },
    { hour: "20:00", activeUsers: 5, requests: 130 },
  ];

  return (
    <DashboardLayout role="admin" title="Admin Portal">
      {/* Top Banner section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="font-display text-3xl font-bold">Admin Portal</h2>
          <p className="text-muted-foreground mt-1">Manage portal functions, growth metrics, and courses.</p>
        </div>

        {/* Year Dropdown styled exactly like Green Pill from User screenshot */}
        <div className="flex items-center gap-3">
          <Select value={academicYear} onValueChange={setAcademicYear}>
            <SelectTrigger className="w-[160px] bg-[#10b981] hover:bg-[#059669] border-none text-white font-semibold rounded-full px-5 py-2.5 h-[42px] focus:ring-0 focus:ring-offset-0 [&>span]:text-white shadow-sm flex justify-between items-center transition-all cursor-pointer">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#10b981] border-[#059669] text-white rounded-xl shadow-lg">
              <SelectItem value="2025-2026" className="focus:bg-[#059669] focus:text-white font-semibold cursor-pointer">2025-2026</SelectItem>
              <SelectItem value="2026-2027" className="focus:bg-[#059669] focus:text-white font-semibold cursor-pointer">2026-2027</SelectItem>
              <SelectItem value="2027-2028" className="focus:bg-[#059669] focus:text-white font-semibold cursor-pointer">2027-2028</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Color Grid exactly matching User Screenshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {dashboardCards.map((card) => (
          <Card 
            key={card.title} 
            onClick={() => navigate(card.path)}
            className={`p-6 shadow-sm rounded-3xl border ${card.borderColor} ${card.bgClass} cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-md flex flex-col justify-between min-h-[170px]`}
          >
            <div>
              {/* Icon Squircle Container */}
              <div className={`h-11 w-11 rounded-2xl ${card.iconBg} ${card.iconColor} flex items-center justify-center shadow-sm mb-4`}>
                <card.icon className="h-5.5 w-5.5" />
              </div>
              <h3 className="font-display font-bold text-lg text-foreground tracking-tight">{card.title}</h3>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{card.description}</p>
            </div>
            
            <div className="flex justify-end mt-4">
              <ChevronRight className="h-4 w-4 text-muted-foreground/60 group-hover:text-foreground transition-colors" />
            </div>
          </Card>
        ))}
      </div>

      {/* Core Counter Metrics Section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="p-5 border-border/60 bg-card shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <div className="font-display text-2xl font-bold"><AnimatedNumber value={scaledStats.students} /></div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase">Students Registered</div>
            </div>
          </div>
        </Card>
        <Card className="p-5 border-border/60 bg-card shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <div className="font-display text-2xl font-bold"><AnimatedNumber value={scaledStats.teachers} /></div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase">Tutor Staff</div>
            </div>
          </div>
        </Card>
        <Card className="p-5 border-border/60 bg-card shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <Video className="h-5 w-5" />
            </div>
            <div>
              <div className="font-display text-2xl font-bold"><AnimatedNumber value={scaledStats.classes} /></div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase">Video Chapters</div>
            </div>
          </div>
        </Card>
        <Card className="p-5 border-border/60 bg-card shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <div className="font-display text-2xl font-bold"><AnimatedNumber value={scaledStats.exams} /></div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase">Total Mock Tests</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Real-time System Load Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Fluctuating Panel */}
        <div className="flex flex-col gap-4">
          <Card className="p-5 border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 relative">
                <Radio className="h-5.5 w-5.5 animate-pulse" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-emerald-500 border border-background animate-ping" />
              </div>
              <div>
                <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block">Live Connections</span>
                <h4 className="font-display text-xl font-bold">{liveSessions} Active Students</h4>
              </div>
            </div>
          </Card>

          <Card className="p-5 border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Database className="h-5.5 w-5.5 animate-spin" style={{ animationDuration: '6s' }} />
              </div>
              <div>
                <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block">System Operations</span>
                <h4 className="font-display text-xl font-bold">{queryCount} Sync Actions</h4>
              </div>
            </div>
          </Card>
        </div>

        {/* Load Tracker chart */}
        <Card className="lg:col-span-2 p-5 shadow-card border-border/60">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-semibold text-sm">Portal Resource Utilization</h3>
              <p className="text-[10px] text-muted-foreground">Logged metrics across different hours of the day</p>
            </div>
            <Activity className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="h-[140px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={loadData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="usersLoad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} />
                <RechartsTooltip />
                <Area type="monotone" dataKey="activeUsers" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#usersLoad)" name="Active Load" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
