import { useState } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Plus, Trash2, ClipboardList, Pencil, Dumbbell, BookOpen,
  FileText, Calendar, Clock, AlertCircle, CheckCircle2
} from "lucide-react";
import { toast } from "sonner";
import { AppRole } from "@/hooks/useAuth";
import { useAppData } from "@/hooks/useAppData";
import { format, isFuture } from "date-fns";

interface Props {
  viewerRole: AppRole;
}

type ExamTab = "unit_test" | "practice" | "worksheet" | "all";

const TAB_CONFIG: { key: ExamTab; label: string; icon: any; color: string; description: string }[] = [
  { key: "all",       label: "All Exams",       icon: ClipboardList, color: "#f97316", description: "All uploaded exams" },
  { key: "unit_test", label: "Unit Test",        icon: ClipboardList, color: "#6366f1", description: "Chapter-wise assessments" },
  { key: "practice",  label: "Practice Session", icon: Dumbbell,      color: "#10b981", description: "Practice papers" },
  { key: "worksheet", label: "Worksheet",        icon: BookOpen,      color: "#f59e0b", description: "Exercise sheets" },
];

const matchTab = (exam: any, tab: ExamTab): boolean => {
  if (tab === "all") return true;
  const type = (exam.exam_type || exam.description || "").toLowerCase();
  if (tab === "unit_test") return type.includes("unit") || type.includes("test") || type === "pdf" || type === "" || type === "weekly";
  if (tab === "practice")  return type.includes("practice") || type.includes("session");
  if (tab === "worksheet") return type.includes("worksheet") || type.includes("sheet");
  return false;
};

const ExamsManager = ({ viewerRole }: Props) => {
  const { courses, exams, users, createExam, deleteExam, updateExam } = useAppData();
  const [open, setOpen]         = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ExamTab>("all");

  const students = users.filter((u) => u.role === "student");

  const [form, setForm] = useState({
    title: "", description: "", exam_type: "unit_test",
    duration_minutes: 30, starts_at: "", course_id: "", studentId: "",
  });

  const [editForm, setEditForm] = useState({
    id: "", title: "", description: "", exam_type: "unit_test",
    duration_minutes: 30, starts_at: "", course_id: "", studentId: "",
  });

  const [file, setFile] = useState<File | null>(null);

  const allRows = [...exams].sort((a, b) =>
    a.created_at ? b.created_at.localeCompare(a.created_at) : -1
  );

  const tabRows = allRows.filter((e) => matchTab(e, activeTab));

  const upcomingAll = allRows
    .filter((e) => e.starts_at && isFuture(new Date(e.starts_at)))
    .sort((a, b) => new Date(a.starts_at!).getTime() - new Date(b.starts_at!).getTime())
    .slice(0, 8);

  const handleOpenEdit = (exam: any) => {
    setEditForm({
      id: exam.id,
      title: exam.title,
      description: exam.description || "",
      exam_type: exam.exam_type || "unit_test",
      duration_minutes: exam.duration_minutes || 30,
      starts_at: exam.starts_at || "",
      course_id: exam.course_id || "",
      studentId: exam.studentId || "",
    });
    setEditOpen(true);
  };

  const onEdit = (e: React.FormEvent) => {
    e.preventDefault();
    updateExam(editForm.id, {
      title: editForm.title,
      description: editForm.description,
      exam_type: editForm.exam_type,
      duration_minutes: Number(editForm.duration_minutes),
      starts_at: editForm.starts_at ? new Date(editForm.starts_at).toISOString() : null,
      course_id: editForm.course_id || null,
      studentId: editForm.studentId || null,
    });
    toast.success("Exam updated");
    setEditOpen(false);
  };

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { toast.error("Please upload a PDF file."); return; }
    await createExam({
      title: form.title,
      description: form.description,
      exam_type: form.exam_type,
      duration_minutes: Number(form.duration_minutes),
      starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : null,
      course_id: form.course_id || null,
      studentId: form.studentId || null,
      file,
    });
    toast.success("Exam uploaded successfully.");
    setOpen(false);
    setForm({ title: "", description: "", exam_type: "unit_test", duration_minutes: 30, starts_at: "", course_id: "", studentId: "" });
    setFile(null);
  };

  const onDelete = (id: string) => {
    if (!confirm("Delete this exam?")) return;
    deleteExam(id);
    toast.success("Deleted");
  };

  const basePath = viewerRole === "admin" ? "/admin" : "/teacher";
  const activeConfig = TAB_CONFIG.find((t) => t.key === activeTab)!;

  return (
    <DashboardLayout role={viewerRole}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h2 className="font-display text-2xl font-bold">Exams &amp; Papers</h2>
          <p className="text-muted-foreground mt-1">Upload question papers &amp; manage assessments</p>
        </div>

        {/* Create Exam Dialog */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="hero"><Plus className="h-4 w-4 mr-2" />New Exam</Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={onCreate}>
              <DialogHeader><DialogTitle>Upload Question Paper</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>Title</Label>
                  <Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>
                <div>
                  <Label>Exam Type</Label>
                  <Select value={form.exam_type} onValueChange={(v) => setForm({ ...form, exam_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unit_test">Unit Test</SelectItem>
                      <SelectItem value="practice">Practice Session</SelectItem>
                      <SelectItem value="worksheet">Worksheet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Question Paper PDF</Label>
                  <Input type="file" accept="application/pdf" required onChange={(e) => setFile(e.target.files?.[0] || null)} />
                </div>
                <div>
                  <Label>Schedule Date &amp; Time (optional)</Label>
                  <Input type="datetime-local" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} />
                </div>
                <div>
                  <Label>Subject / Description</Label>
                  <Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <div>
                  <Label>Target Student (optional — leave blank for all)</Label>
                  <Select value={form.studentId || "none"} onValueChange={(v) => setForm({ ...form, studentId: v === "none" ? "" : v })}>
                    <SelectTrigger><SelectValue placeholder="Broadcast to All" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Broadcast to All</SelectItem>
                      {students.map((s) => <SelectItem key={s.id} value={s.id}>{s.full_name || s.email}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={!file} variant="hero">Upload Exam</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <form onSubmit={onEdit}>
            <DialogHeader><DialogTitle>Edit Exam</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Title</Label>
                <Input required value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} />
              </div>
              <div>
                <Label>Exam Type</Label>
                <Select value={editForm.exam_type} onValueChange={(v) => setEditForm({ ...editForm, exam_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unit_test">Unit Test</SelectItem>
                    <SelectItem value="practice">Practice Session</SelectItem>
                    <SelectItem value="worksheet">Worksheet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Schedule Date &amp; Time (optional)</Label>
                <Input type="datetime-local" value={editForm.starts_at} onChange={(e) => setEditForm({ ...editForm, starts_at: e.target.value })} />
              </div>
              <div>
                <Label>Subject / Description</Label>
                <Textarea rows={2} value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
              </div>
              <div>
                <Label>Target Student (optional)</Label>
                <Select value={editForm.studentId || "none"} onValueChange={(v) => setEditForm({ ...editForm, studentId: v === "none" ? "" : v })}>
                  <SelectTrigger><SelectValue placeholder="Broadcast to All" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Broadcast to All</SelectItem>
                    {students.map((s) => <SelectItem key={s.id} value={s.id}>{s.full_name || s.email}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" variant="hero">Update</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Tabs ── */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
        {TAB_CONFIG.map((tab) => {
          const count = allRows.filter((e) => matchTab(e, tab.key)).length;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 whitespace-nowrap border ${
                activeTab === tab.key
                  ? "text-white shadow-md border-transparent"
                  : "bg-background border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
              }`}
              style={activeTab === tab.key ? { background: tab.color } : {}}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                activeTab === tab.key ? "bg-white/25 text-white" : "bg-secondary text-muted-foreground"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Exam Cards ── */}
      {tabRows.length === 0 ? (
        <Card className="p-12 text-center shadow-card border-border/60 mb-8">
          <div
            className="h-14 w-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
            style={{ background: `${activeConfig.color}18` }}
          >
            <activeConfig.icon className="h-6 w-6" style={{ color: activeConfig.color }} />
          </div>
          <h3 className="font-display font-semibold text-lg">No {activeConfig.label}s yet</h3>
          <p className="text-sm text-muted-foreground mt-1">{activeConfig.description}. Click "New Exam" to upload one.</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {tabRows.map((row: any) => {
            const upcoming = row.starts_at ? isFuture(new Date(row.starts_at)) : false;
            const cfg = TAB_CONFIG.find((t) => t.key !== "all" && matchTab(row, t.key)) || TAB_CONFIG[1];

            return (
              <Card key={row.id} className="p-5 shadow-card border-border/60 hover:shadow-elevated transition-smooth relative overflow-hidden">
                {/* color strip */}
                <div className="absolute top-0 left-0 w-1 h-full rounded-l-lg" style={{ background: cfg.color }} />

                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex gap-1.5 flex-wrap">
                    <Badge
                      className="text-[10px] font-bold border-0 capitalize text-white"
                      style={{ background: cfg.color }}
                    >
                      {cfg.label}
                    </Badge>
                    {upcoming && (
                      <Badge className="bg-blue-100 text-blue-700 border-0 text-[10px]">
                        <AlertCircle className="h-2.5 w-2.5 mr-1" />Upcoming
                      </Badge>
                    )}
                    {row.studentId && (
                      <Badge variant="outline" className="text-[10px] border-primary/20 text-primary">
                        Targeted
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleOpenEdit(row)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onDelete(row.id)}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                </div>

                <h3 className="font-display font-semibold text-base leading-snug">{row.title}</h3>
                {row.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{row.description}</p>
                )}

                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-3">
                  {row.duration_minutes && (
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{row.duration_minutes} min</span>
                  )}
                  {row.starts_at && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />{format(new Date(row.starts_at), "MMM d, yyyy")}
                    </span>
                  )}
                </div>

                <div className="mt-4 space-y-2">
                  {row.pdf && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs gap-1.5"
                      onClick={() =>
                        window.open(
                          `${(import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace("/api", "")}/uploads/${row.pdf}`,
                          "_blank"
                        )
                      }
                    >
                      <FileText className="h-3.5 w-3.5" style={{ color: "#f97316" }} />
                      View Question Paper (PDF)
                    </Button>
                  )}
                  <Button asChild variant="outline" size="sm" className="w-full text-xs gap-1.5">
                    <Link to={`${basePath}/exams/${row.id}/questions`}>
                      <Pencil className="h-3.5 w-3.5" />Add MCQ Questions
                    </Link>
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ── Upcoming Exam Schedule ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-xl">Upcoming Exam Schedule</h3>
          <Badge variant="secondary" className="text-xs">{upcomingAll.length} scheduled</Badge>
        </div>

        {upcomingAll.length === 0 ? (
          <Card className="p-8 text-center shadow-card border-border/60">
            <div className="text-2xl mb-2">📅</div>
            <p className="text-sm text-muted-foreground">No upcoming exams scheduled. Set a date when uploading an exam.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {upcomingAll.map((exam, idx) => {
              const daysLeft = exam.starts_at
                ? Math.ceil((new Date(exam.starts_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                : null;
              const cfg = TAB_CONFIG.find((t) => t.key !== "all" && matchTab(exam, t.key)) || TAB_CONFIG[1];

              return (
                <Card key={exam.id} className="px-5 py-4 shadow-card border-border/60 flex items-center gap-4 hover:shadow-elevated transition-smooth">
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center font-bold text-white text-sm shrink-0"
                    style={{ background: "linear-gradient(135deg, #f97316, #f97316)" }}
                  >
                    {idx + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-foreground truncate">{exam.title}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground">{exam.description || cfg.label}</span>
                      <Badge className="text-[9px] border-0 text-white px-1.5 py-0" style={{ background: cfg.color }}>
                        {cfg.label}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {exam.starts_at && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(exam.starts_at), "MMM d, yyyy · h:mm a")}
                      </div>
                    )}
                    {daysLeft !== null && (
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                        style={{ background: daysLeft <= 3 ? "#ef4444" : daysLeft <= 7 ? "#f59e0b" : "#10b981" }}
                      >
                        {daysLeft === 0 ? "Today!" : `${daysLeft}d left`}
                      </span>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ExamsManager;
