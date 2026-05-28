import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { useAuth } from "@/hooks/useAuth";
import { useAppData, ResultObj, TimetableObj } from "@/hooks/useAppData";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  FileText, TrendingUp, CalendarDays, Clock, BookOpen,
  Trophy, Star, ChevronRight, Megaphone
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const DAY_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { exams, announcements, results, timetables } = useAppData();

  const [calDate, setCalDate] = useState<Date | undefined>(new Date());

  // Real data derivations
  const myResults = (results || []).filter((r: ResultObj) => r.studentId === user?.id);
  const avgScore =
    myResults.length > 0
      ? Math.round(
        (myResults.reduce((acc, r) => acc + r.score / (r.maxScore || 100), 0) / myResults.length) * 100
      )
      : null;

  const upcomingExams = (exams || [])
    .filter((e: any) => e.starts_at && new Date(e.starts_at) >= new Date())
    .sort((a: any, b: any) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())
    .slice(0, 5);

  const myTimetable = (timetables || [])
    .filter((t: TimetableObj) => !t.studentId || t.studentId === user?.id)
    .sort((a: TimetableObj, b: TimetableObj) => {
      const ai = DAY_ORDER.indexOf(a.day);
      const bi = DAY_ORDER.indexOf(b.day);
      return ai - bi;
    });

  const firstName = user?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "Student";
  const studentId = user?.id?.toString().slice(-6).toUpperCase() || "------";
  const fullName = user?.full_name || user?.email?.split("@")[0] || "Student";

  // Latest exam marks for display
  const recentMarks = [...myResults].slice(0, 6);

  return (
    <DashboardLayout role="student">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ── LEFT COLUMN ── */}
        <div className="lg:col-span-8 flex flex-col gap-6">

          {/* Welcome Banner with Photo + Student ID */}
          <div
            className="relative overflow-hidden rounded-2xl flex items-center min-h-[160px] sm:min-h-[180px] px-5 py-6"
            style={{ background: "linear-gradient(120deg, #fe6519 0%, #ff8147 60%, #ffab76 100%)" }}
          >
            {/* Left: Avatar + Info — width-capped so image never overlaps */}
            <div className="relative z-10 flex items-center gap-4 w-[58%] sm:w-[62%] min-w-0">
              {/* Avatar */}
              <div className="shrink-0">
                <div
                  className="rounded-2xl border-4 border-white/40 shadow-xl flex items-center justify-center text-white font-bold"
                  style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)", width: "clamp(52px,14vw,80px)", height: "clamp(52px,14vw,80px)", fontSize: "clamp(18px,5vw,30px)" }}
                >
                  {fullName[0].toUpperCase()}
                </div>
              </div>
              {/* Name + ID */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="bg-white/25 text-white text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full tracking-widest uppercase whitespace-nowrap">
                    ⭐ Gold Member
                  </span>
                </div>
                <h2 className="font-display font-bold text-white leading-tight truncate" style={{ fontSize: "clamp(15px, 4.5vw, 28px)" }}>
                  {fullName}
                </h2>
                <p className="text-white/80 mt-0.5 font-medium tracking-wide" style={{ fontSize: "clamp(10px, 2.8vw, 14px)" }}>
                  ID: <span className="text-white font-bold">{studentId}</span>
                </p>
                <p className="text-white/70 mt-1 line-clamp-1" style={{ fontSize: "clamp(9px, 2.5vw, 12px)" }}>
                  {upcomingExams.length > 0
                    ? `${upcomingExams.length} upcoming exam${upcomingExams.length > 1 ? "s" : ""} scheduled`
                    : announcements?.[0]?.title || "You're all caught up!"}
                </p>
              </div>
            </div>

            {/* Gradient fade — protects text from image bleed-in */}
            <div
              className="absolute inset-y-0 pointer-events-none z-[5]"
              style={{
                left: "45%",
                right: 0,
                background: "linear-gradient(to right, #ff8147 0%, transparent 55%)"
              }}
            />

            {/* Decorative illustration — always visible, constrained to right zone */}
            <div className="absolute right-0 top-0 bottom-0 flex items-end justify-end opacity-95 pointer-events-none select-none z-[4]">
              <img
                src="/student_banner.png"
                alt=""
                className="object-contain object-bottom drop-shadow-lg"
                style={{ height: "100%", maxHeight: "clamp(130px, 42vw, 200px)", maxWidth: "clamp(120px, 40vw, 180px)" }}
              />
            </div>

            {/* Decorative circles */}
            <div className="absolute -top-8 -right-8 w-28 sm:w-36 h-28 sm:h-36 rounded-full bg-white/10 pointer-events-none z-[3]" />
            <div className="absolute -bottom-10 right-20 w-20 sm:w-28 h-20 sm:h-28 rounded-full bg-white/10 pointer-events-none z-[3]" />
          </div>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Avg Score", value: avgScore !== null ? `${avgScore}%` : "—", icon: Trophy, color: "#fe6519" },
              { label: "Exams", value: exams?.length ?? 0, icon: FileText, color: "#6366f1" },
              { label: "Classes", value: myTimetable.length, icon: CalendarDays, color: "#10b981" },
            ].map((stat) => (
              <Card key={stat.label} className="p-4 shadow-card border-border/60 flex items-center gap-3">
                <div
                  className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${stat.color}18` }}
                >
                  <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
                </div>
                <div>
                  <div className="font-bold text-lg text-foreground leading-none">{stat.value}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
                </div>
              </Card>
            ))}
          </div>

          {/* Upcoming Exams */}
          <Card className="shadow-card border-border/60">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border/60">
              <h3 className="font-display font-bold text-lg text-foreground">Upcoming Exams</h3>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs gap-1"
                style={{ color: "#fe6519" }}
                onClick={() => navigate("/dashboard/exams")}
              >
                View All <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
            <div className="divide-y divide-border/40">
              {upcomingExams.length === 0 ? (
                <div className="px-6 py-10 text-center text-sm text-muted-foreground">
                  No upcoming exams. Relax! 🎉
                </div>
              ) : (
                upcomingExams.map((exam: any) => (
                  <div
                    key={exam.id}
                    className="grid grid-cols-12 gap-3 px-6 py-4 items-center hover:bg-secondary/40 transition-smooth group cursor-pointer"
                    onClick={() => navigate("/dashboard/exams")}
                  >
                    <div className="col-span-6 flex items-center gap-3">
                      <div
                        className="h-9 w-9 rounded-full flex items-center justify-center shrink-0"
                        style={{ background: "#fe651920" }}
                      >
                        <FileText className="h-4 w-4" style={{ color: "#fe6519" }} />
                      </div>
                      <div className="font-medium text-sm text-foreground truncate">{exam.title}</div>
                    </div>
                    <div className="col-span-3">
                      <Badge variant="secondary" className="text-[10px] capitalize">
                        {exam.description || "Exam"}
                      </Badge>
                    </div>
                    <div className="col-span-3 text-sm text-muted-foreground text-right">
                      {exam.starts_at ? format(new Date(exam.starts_at), "MMM d") : "—"}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Previous Exam Marks */}
          <Card className="shadow-card border-border/60">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border/60">
              <div>
                <h3 className="font-display font-bold text-lg text-foreground">Previous Exam Marks</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Your recent assessment results</p>
              </div>
              <Star className="h-5 w-5" style={{ color: "#fe6519" }} />
            </div>
            {recentMarks.length === 0 ? (
              <div className="px-6 py-10 text-center text-sm text-muted-foreground">
                No results yet. Your marks will appear here after exams.
              </div>
            ) : (
              <>
                {/* Table header */}
                <div className="grid grid-cols-12 gap-2 px-6 py-3 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground border-b border-border/40">
                  <div className="col-span-4">Subject</div>
                  <div className="col-span-3">Type</div>
                  <div className="col-span-2 text-center">Score</div>
                  <div className="col-span-3 text-right">Grade</div>
                </div>
                <div className="divide-y divide-border/30">
                  {recentMarks.map((r: ResultObj, i) => {
                    const pct = Math.round((r.score / (r.maxScore || 100)) * 100);
                    const gradeColor = pct >= 80 ? "#10b981" : pct >= 60 ? "#f59e0b" : "#ef4444";
                    return (
                      <div key={r.id || i} className="grid grid-cols-12 gap-2 px-6 py-3.5 items-center hover:bg-secondary/30 transition-smooth">
                        <div className="col-span-4">
                          <div className="flex items-center gap-2">
                            <div
                              className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
                              style={{ background: "#fe651915" }}
                            >
                              <BookOpen className="h-3.5 w-3.5" style={{ color: "#fe6519" }} />
                            </div>
                            <span className="text-sm font-medium text-foreground truncate">{r.subject}</span>
                          </div>
                        </div>
                        <div className="col-span-3">
                          <span className="text-xs text-muted-foreground capitalize">{r.examType || "—"}</span>
                        </div>
                        <div className="col-span-2 text-center">
                          <span className="font-bold text-sm" style={{ color: "#fe6519" }}>{r.score}</span>
                          <span className="text-xs text-muted-foreground">/{r.maxScore || 100}</span>
                        </div>
                        <div className="col-span-3 text-right">
                          <span
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold text-white"
                            style={{ background: gradeColor }}
                          >
                            {r.grade || `${pct}%`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {/* Mini performance chart */}
                <div className="px-6 pt-2 pb-5">
                  <div className="h-24 mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={[...myResults].reverse().map(r => ({
                          name: r.subject || "Exam",
                          pct: Math.round((r.score / (r.maxScore || 100)) * 100)
                        }))}
                        margin={{ top: 5, right: 5, left: -25, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="perfGrad2" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#fe6519" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#fe6519" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={9} tickLine={false} axisLine={false} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={9} tickLine={false} axisLine={false} domain={[0, 100]} unit="%" />
                        <RechartsTooltip
                          contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))", fontSize: 11 }}
                          formatter={(val: any) => [`${val}%`, "Score"]}
                        />
                        <Area
                          type="monotone" dataKey="pct" stroke="#fe6519" strokeWidth={2}
                          fillOpacity={1} fill="url(#perfGrad2)"
                          dot={{ fill: "#fe6519", r: 2.5 }} activeDot={{ r: 4.5 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </>
            )}
          </Card>

          {/* Timetable Widget */}
          <Card className="shadow-card border-border/60">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border/60">
              <div>
                <h3 className="font-display font-bold text-lg text-foreground">My Timetable</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Your weekly class schedule</p>
              </div>
              <CalendarDays className="h-5 w-5" style={{ color: "#fe6519" }} />
            </div>
            {myTimetable.length === 0 ? (
              <div className="px-6 py-10 text-center text-sm text-muted-foreground">
                No timetable entries yet.
              </div>
            ) : (
              <div className="divide-y divide-border/30">
                {myTimetable.map((t: TimetableObj) => (
                  <div key={t._id || t.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-secondary/30 transition-smooth">
                    <div className="w-20 shrink-0">
                      <span
                        className="inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide text-white"
                        style={{ background: "#fe6519" }}
                      >
                        {t.day?.slice(0, 3)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground w-20 shrink-0">
                      <Clock className="h-3 w-3" /> {t.time}
                    </div>
                    <div className="flex-1 font-medium text-sm text-foreground">{t.subject}</div>
                    <div className="text-xs text-muted-foreground hidden sm:block">{t.teacher}</div>
                  </div>
                ))}
              </div>
            )}
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
                head_cell: "w-9 font-semibold text-[10px] uppercase text-center",
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

          {/* Announcements */}
          {announcements && announcements.length > 0 && (
            <Card className="shadow-card border-border/60">
              <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-border/60">
                <h3 className="font-display font-bold text-base text-foreground">Announcements</h3>
                <Megaphone className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="divide-y divide-border/30">
                {announcements.slice(0, 3).map((ann) => (
                  <div key={ann.id} className="px-5 py-3.5">
                    <div className="font-semibold text-sm text-foreground line-clamp-1">{ann.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{ann.body}</div>
                    {ann.created_at && (
                      <div className="text-[10px] text-muted-foreground/60 mt-1">
                        {format(new Date(ann.created_at), "MMM d, yyyy")}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Performance Summary */}
          <Card className="p-5 shadow-card border-border/60">
            <h3 className="font-display font-bold text-base text-foreground mb-4">Performance</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Avg Score</span>
                <span className="font-bold" style={{ color: "#fe6519" }}>
                  {avgScore !== null ? `${avgScore}%` : "No results"}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Exams Taken</span>
                <span className="font-bold text-foreground">{myResults.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Best Score</span>
                <span className="font-bold text-green-600">
                  {myResults.length > 0
                    ? `${Math.max(...myResults.map(r => Math.round((r.score / (r.maxScore || 100)) * 100)))}%`
                    : "—"}
                </span>
              </div>
              {avgScore !== null && (
                <div className="mt-2">
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${avgScore}%`, background: "linear-gradient(90deg, #fe6519, #ff8147)" }}
                    />
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-1 text-right">{avgScore}% overall</div>
                </div>
              )}
            </div>
          </Card>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
