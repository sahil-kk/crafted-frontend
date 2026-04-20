import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import {
  CalendarDays, ClipboardCheck, GraduationCap, TrendingUp,
  ChevronRight, Bell, Video, FileText,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAppData, ResultObj } from "@/hooks/useAppData";
import { format } from "date-fns";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";

const StudentDashboard = () => {
  const { user } = useAuth();
  const name = user?.email?.split("@")[0] ?? "Student";
  const { exams, announcements, results, timetables } = useAppData();

  // Stats Logic
  const myResults = (results || []).filter((r: ResultObj) => r.studentId === user?.id);
  const myTimetables = (timetables || []).filter((t: any) => !t.studentId || t.studentId === user?.id);

  const avgScore = myResults.length > 0 
    ? Math.round(myResults.reduce((acc, curr) => acc + (curr.score / (curr.maxScore || 100)), 0) / myResults.length * 100)
    : 0;
  
  const latestResult = myResults.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())[0];

  const stats = [
    { label: "My Classes", value: myTimetables.length.toString(), icon: CalendarDays, color: "text-success" },
    { label: "Latest score", value: latestResult ? `${latestResult.score}/${latestResult.maxScore}` : "N/A", icon: ClipboardCheck, color: "text-primary" },
    { label: "Available Exams", value: (exams || []).length.toString(), icon: FileText, color: "text-info" },
    { label: "Avg. Progress", value: `${avgScore}%`, icon: TrendingUp, color: "text-success" },
  ];

  // Upcomings
  const upcomingExams = (exams || []).slice(0, 3);
  
  // Notifications
  const recents = (announcements || []).slice(0, 4);

  // Graph data
  const performanceData = myResults.map(r => ({
    name: r.subject || "Exam",
    percent: Math.round((r.score / (r.maxScore || 100)) * 100)
  })).reverse(); // Chronological if it was newest first

  return (
    <DashboardLayout role="student">
      {/* Welcome */}
      <div className="mb-8">
        <h2 className="font-display text-3xl font-bold capitalize text-balance">
          Welcome back, {name} 
        </h2>
        <p className="text-muted-foreground mt-1">Here's a live overview of your academic performance.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <Card key={s.label} className="p-5 shadow-card hover:shadow-elevated transition-smooth border-border/60">
            <div className="flex items-start justify-between mb-3">
              <div className="h-10 w-10 rounded-xl bg-primary-soft flex items-center justify-center">
                <s.icon className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="font-display text-2xl font-bold">{s.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        
        {/* Performance Graph */}
        <Card className="lg:col-span-2 p-6 shadow-card border-border/60">
           <div className="flex items-center justify-between mb-5">
             <div>
               <h3 className="font-display font-semibold text-lg">Performance Trend</h3>
               <p className="text-xs text-muted-foreground mt-0.5">Your progress visualized across recent exams</p>
             </div>
             <Button asChild variant="ghost" size="sm">
               <Link to="/dashboard/results">Full report <ChevronRight className="h-4 w-4" /></Link>
             </Button>
           </div>
           
           {performanceData.length === 0 ? (
              <div className="h-48 flex items-center justify-center flex-col text-muted-foreground bg-secondary/20 rounded-xl">
                 <ClipboardCheck className="h-8 w-8 text-muted mb-2 opacity-30" />
                 <p className="text-sm">Take exams to see your progress graph.</p>
              </div>
           ) : (
             <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPercent1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                    <RechartsTooltip contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                    <Area type="monotone" dataKey="percent" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorPercent1)" />
                  </AreaChart>
                </ResponsiveContainer>
             </div>
           )}
        </Card>

        {/* Notifications */}
        <Card className="p-6 shadow-card border-border/60 flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display font-semibold text-lg flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" /> Live Updates
            </h3>
          </div>
          <div className="space-y-4 flex-1 overflow-y-auto">
            {recents.length === 0 ? (
               <p className="text-xs text-muted-foreground">No recent announcements.</p>
            ) : (
                recents.map((n: any, i) => (
                  <div key={i} className="flex gap-3 pb-4 border-b border-border/60 last:border-0 last:pb-0">
                    <div className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">{n.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{n.content || "See details"}</div>
                      <div className="text-xs text-muted-foreground/70 mt-1">{n.created_at ? format(new Date(n.created_at), "MMM d") : "Recent"}</div>
                    </div>
                  </div>
                ))
            )}
          </div>
        </Card>
      </div>

       {/* Upcoming exams List */}
      <h3 className="font-display font-semibold text-lg mb-4">Current Assignments</h3>
      <div className="grid md:grid-cols-3 gap-4 mb-8">
            {upcomingExams.length === 0 ? (
               <p className="text-xs text-muted-foreground col-span-3">No pending exams.</p>
            ) : (
                upcomingExams.map((e: any) => (
                  <Card key={e.title} className="p-4 shadow-card border border-border/60 hover:bg-primary-soft/40 transition-smooth group">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary-soft flex items-center justify-center shrink-0">
                            <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                            <div className="font-medium text-sm truncate">{e.title}</div>
                            <div className="text-xs text-muted-foreground mt-0.5 capitalize">{e.exam_type || "Assignment"} • {e.duration_minutes || 0} min</div>
                        </div>
                    </div>
                  </Card>
                ))
            )}
      </div>

      {/* Quick links */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {[
          { title: "Recorded classes", desc: "Catch up on missed lessons", icon: Video, to: "/dashboard/classes" },
          { title: "View results", desc: "View detailed statistics", icon: TrendingUp, to: "/dashboard/results" },
          { title: "Latest news", desc: "Updates from your teachers", icon: GraduationCap, to: "/dashboard/news" },
        ].map((q) => (
          <Link key={q.to} to={q.to}>
            <Card className="p-5 shadow-card hover:shadow-elevated hover:border-primary/30 transition-smooth border-border/60 h-full">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-display font-semibold">{q.title}</div>
                  <div className="text-sm text-muted-foreground mt-1">{q.desc}</div>
                </div>
                <div className="h-9 w-9 rounded-lg bg-primary-soft flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-smooth">
                  <q.icon className="h-4 w-4" />
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
