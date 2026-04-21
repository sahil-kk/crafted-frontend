import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { useAuth } from "@/hooks/useAuth";
import { useAppData, ResultObj } from "@/hooks/useAppData";
import { Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { MoreHorizontal, FileText, BookOpen, Megaphone, TrendingUp } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { exams, announcements, results, timetables, recordedClasses, courses } = useAppData();

  const [calDate, setCalDate] = useState<Date | undefined>(new Date());

  // Real data derivations — no hardcoding
  const myResults = (results || []).filter((r: ResultObj) => r.studentId === user?.id);
  const avgScore =
    myResults.length > 0
      ? Math.round(
        (myResults.reduce((acc, r) => acc + r.score / (r.maxScore || 100), 0) / myResults.length) * 100
      )
      : null;

  const upcomingExams = (exams || []).slice(0, 5);
  const todayTimetable = (timetables || []).filter(
    (t: any) => !t.studentId || t.studentId === user?.id
  );
  const latestAnnouncement = (announcements || [])[0];

  // Banner summary message — built entirely from real data
  const summaryParts: string[] = [];
  if (upcomingExams.length > 0) summaryParts.push(`You have ${upcomingExams.length} upcoming exam${upcomingExams.length > 1 ? "s" : ""}.`);
  if (latestAnnouncement) summaryParts.push(latestAnnouncement.title + ".");
  const bannerSummary = summaryParts.length > 0
    ? summaryParts.join(" ")
    : "You're all caught up! Check your timetable and recorded classes.";

  const firstName = user?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "Student";

  return (
    <DashboardLayout role="student">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ── LEFT COLUMN ── */}
        <div className="lg:col-span-8 flex flex-col gap-6">

          {/* Welcome Banner */}
          <div
            className="relative overflow-hidden rounded-2xl flex items-center min-h-[170px] px-8 py-8"
            style={{ background: "linear-gradient(120deg, #fe6519 0%, #ff8147 100%)" }}
          >
            <div className="relative z-10 max-w-[60%]">
              <h2 className="font-display font-bold text-white text-2xl md:text-3xl mb-2">
                Hello {firstName}!
              </h2>
              <p className="text-white/75 text-sm leading-relaxed mb-4 max-w-xs">
                {bannerSummary}
              </p>
              <Link
                to="/dashboard/news"
                className="text-white/80 font-semibold text-sm underline underline-offset-2 hover:text-white transition-colors"
              >
                Read more
              </Link>
            </div>
            {/* Decorative illustration */}
            <div className="absolute right-6 top-0 bottom-0 flex items-center opacity-90 pointer-events-none select-none">
              <img
                src="/student_banner.png"
                alt=""
                className="h-full max-h-[170px] object-contain drop-shadow-lg"
              />
            </div>
          </div>

          {/* Exam / Course Progress Table */}
          <Card className="shadow-card border-border/60">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border/60">
              <h3 className="font-display font-bold text-lg text-foreground">
                {upcomingExams.length > 0 ? "Upcoming Exams" : "Courses Overview"}
              </h3>
              <Button
                variant="hero"
                size="sm"
                className="rounded-full text-xs px-5 text-white border-0 shadow-none"
                style={{ background: "#fe6519" }}
                onClick={() => navigate(upcomingExams.length > 0 ? "/dashboard/exams" : "/dashboard/classes")}
              >
                View All
              </Button>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-12 gap-3 px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide border-b border-border/40">
              <div className="col-span-5">Title</div>
              <div className="col-span-4">Subject / Type</div>
              <div className="col-span-3">Date</div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-border/40">
              {upcomingExams.length > 0
                ? upcomingExams.map((exam: any) => (
                  <div
                    key={exam.id}
                    className="grid grid-cols-12 gap-3 px-6 py-4 items-center hover:bg-secondary/40 transition-smooth group cursor-pointer"
                    onClick={() => navigate("/dashboard/exams")}
                  >
                    <div className="col-span-5 flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full flex items-center justify-center shrink-0" style={{ background: "#fe651920" }}>
                          <FileText className="h-4 w-4" style={{ color: "#fe6519" }} />
                      </div>
                      <div className="font-medium text-sm text-foreground truncate">{exam.title}</div>
                    </div>
                    <div className="col-span-4">
                      <div className="flex items-center gap-1.5">
                          <span className="inline-block w-2 h-2 rounded-full shrink-0" style={{ background: "#fe6519" }} />
                        <span className="text-sm text-muted-foreground capitalize truncate">
                          {exam.description || exam.exam_type || "—"}
                        </span>
                      </div>
                    </div>
                    <div className="col-span-3 flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {exam.starts_at
                          ? format(new Date(exam.starts_at), "MMM d, yyyy")
                          : "—"}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 h-7 w-7 text-muted-foreground"
                        onClick={(e) => { e.stopPropagation(); navigate("/dashboard/exams"); }}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
                : courses.slice(0, 5).map((course: any) => (
                  <div
                    key={course.id}
                    className="grid grid-cols-12 gap-3 px-6 py-4 items-center hover:bg-secondary/40 transition-smooth group cursor-pointer"
                    onClick={() => navigate("/dashboard/classes")}
                  >
                    <div className="col-span-5 flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                        <BookOpen className="h-4 w-4 text-indigo-500" />
                      </div>
                      <div className="font-medium text-sm text-foreground truncate">{course.name}</div>
                    </div>
                    <div className="col-span-4">
                      <div className="flex items-center gap-1.5">
                        <span className="inline-block w-2 h-2 rounded-full bg-indigo-400 shrink-0" />
                        <span className="text-sm text-muted-foreground truncate">{course.description || "Course"}</span>
                      </div>
                    </div>
                    <div className="col-span-3 flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {course.created_at ? format(new Date(course.created_at), "MMM d, yyyy") : "—"}
                      </span>
                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 h-7 w-7 text-muted-foreground">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

              {upcomingExams.length === 0 && courses.length === 0 && (
                <div className="px-6 py-10 text-center text-sm text-muted-foreground">
                  No exams or courses added yet.
                </div>
              )}
            </div>
          </Card>

          {/* Performance Graph */}
          <Card className="shadow-card border-border/60">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border/60">
              <div>
                <h3 className="font-display font-bold text-lg text-foreground">Performance Trend</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Your scores across recent exams</p>
              </div>
              <TrendingUp className="h-5 w-5" style={{ color: "#fe6519" }} />
            </div>
            <div className="p-6">
              {myResults.length === 0 ? (
                <div className="h-28 flex flex-col items-center justify-center text-muted-foreground bg-secondary/20 rounded-xl">
                  <TrendingUp className="h-8 w-8 opacity-20 mb-2" />
                  <p className="text-sm">No results yet. Scores will appear here.</p>
                </div>
              ) : (
                <div className="h-28">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={myResults.map(r => ({ name: r.subject || "Exam", score: r.score, max: r.maxScore, pct: Math.round((r.score / (r.maxScore || 100)) * 100) })).reverse()}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="perfGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#fe6519" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#fe6519" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} unit="%" />
                      <RechartsTooltip
                        contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))", fontSize: 12 }}
                        formatter={(val: any) => [`${val}%`, "Score"]}
                      />
                      <Area type="monotone" dataKey="pct" stroke="#fe6519" strokeWidth={2} fillOpacity={1} fill="url(#perfGrad)" dot={{ fill: "#fe6519", r: 3 }} activeDot={{ r: 5 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="lg:col-span-4 flex flex-col gap-6">

          {/* Calendar */}
          <Card className="p-2 shadow-card border-border/60 overflow-hidden">
            <Calendar
              mode="single"
              selected={calDate}
              onSelect={setCalDate}
              className="w-full"
              classNames={{
                months: "w-full",
                month: "w-full",
                caption: "flex justify-between items-center px-3 py-2 mb-1",
                caption_label: "font-bold text-sm text-foreground",
                nav: "flex items-center gap-1",
                nav_button: "h-7 w-7 rounded-full hover:bg-secondary flex items-center justify-center transition-colors",
                nav_button_previous: "",
                nav_button_next: "",
                table: "w-full border-collapse",
                head_row: "flex justify-between mt-1",
                head_cell: "w-9 font-semibold text-[10px] uppercase text-center" ,
                row: "flex w-full justify-between mt-1",
                cell: "h-9 w-9 text-center p-0 flex items-center justify-center relative",
                day: "h-9 w-9 rounded-full hover:bg-[#fe6519]/10 hover:text-[#fe6519] transition-colors font-medium text-sm flex items-center justify-center",
                day_selected: "!bg-[#fe6519] !text-white font-bold",
                day_today: "bg-green-100 text-green-700 font-bold",
                day_outside: "opacity-30",
                day_disabled: "opacity-25",
              }}
            />
          </Card>

          {/* Profile Card */}
          <Card className="p-6 shadow-card border-border/60">
            {/* Avatar + name */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-14 w-14 rounded-full flex items-center justify-center text-white font-bold text-xl shrink-0" style={{ background: "linear-gradient(135deg, #fe6519, #ff8147)" }}>
                  {(user?.full_name || user?.email || "S")[0].toUpperCase()}
                </div>
                <div>
                  <div className="font-display font-bold text-base text-foreground leading-tight">
                    {user?.full_name || user?.email?.split("@")[0] || "Student"}
                  </div>
                  <div className="text-xs text-muted-foreground capitalize mt-0.5">{user?.role || "Student"}</div>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="text-muted-foreground h-8 w-8 -mt-1">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>

            {/* Contact icons */}
            <div className="flex items-center gap-3 mb-5">
              <div className="h-9 w-9 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors cursor-pointer">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
              </div>
              <div className="h-9 w-9 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors cursor-pointer">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
              </div>
              <div className="h-9 w-9 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors cursor-pointer">
                <Megaphone className="h-4 w-4" />
              </div>
            </div>

            <div className="space-y-3 border-t border-border/60 pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground font-medium">Email</span>
                <span className="text-foreground font-medium truncate ml-4 max-w-[60%] text-right">{user?.email || "—"}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground font-medium">Exams</span>
                <span className="text-foreground font-medium">{exams?.length ?? 0} Available</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground font-medium">Avg Score</span>
                <span className="text-foreground font-medium">{avgScore !== null ? `${avgScore}%` : "No results"}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground font-medium">Classes</span>
                <span className="text-foreground font-medium">{todayTimetable.length} Scheduled</span>
              </div>
            </div>
          </Card>


        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
