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
import { Plus, Trash2, ClipboardList, Pencil } from "lucide-react";
import { toast } from "sonner";
import { AppRole } from "@/hooks/useAuth";
import { useAppData } from "@/hooks/useAppData";
import { format } from "date-fns";

interface Props {
  viewerRole: AppRole;
}

const ExamsManager = ({ viewerRole }: Props) => {
  const { courses, exams, users, createExam, deleteExam } = useAppData();
  const [open, setOpen] = useState(false);
  const students = users.filter((u) => u.role === "student");
  
  const [form, setForm] = useState({
    title: "",
    description: "",
    exam_type: "weekly",
    duration_minutes: 30,
    starts_at: "",
    course_id: "",
    studentId: "",
  });
  
  const [file, setFile] = useState<File | null>(null);

  const rows = [...exams].sort((a, b) => b.created_at.localeCompare(a.created_at));

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
        toast.error("Please explicitly upload a PDF file.");
        return;
    }
    
    await createExam({
      title: form.title,
      description: form.description,
      exam_type: form.exam_type,
      duration_minutes: Number(form.duration_minutes),
      starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : null,
      course_id: form.course_id || null,
      studentId: form.studentId || null,
      file: file
    });
    
    toast.success("Exam uploaded. You can still add additional MCQs.");
    setOpen(false);
    setForm({ title: "", description: "", exam_type: "weekly", duration_minutes: 30, starts_at: "", course_id: "", studentId: "" });
    setFile(null);
  };

  const onDelete = (id: string) => {
    if (!confirm("Delete this exam and all its local mock attempts?")) return;
    deleteExam(id);
    toast.success("Deleted");
  };

  const basePath = viewerRole === "admin" ? "/admin" : "/teacher";

  return (
    <DashboardLayout role={viewerRole}>
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h2 className="font-display text-2xl font-bold">Exams & Papers</h2>
          <p className="text-muted-foreground mt-1">Upload target question papers & distribute tests</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="hero"><Plus className="h-4 w-4 mr-2" />New exam</Button>
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
                  <Label>Question Paper PDF</Label>
                  <Input type="file" accept="application/pdf" required onChange={(e) => setFile(e.target.files?.[0] || null)} />
                </div>
                <div>
                   <Label>Target Student (Optional)</Label>
                   <Select value={form.studentId || "none"} onValueChange={(value) => setForm({ ...form, studentId: value === "none" ? "" : value })}>
                    <SelectTrigger><SelectValue placeholder="Broadcast to All" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Broadcast to All</SelectItem>
                      {students.map((student) => <SelectItem key={student.id} value={student.id}>{student.full_name || student.email}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Subject Description</Label>
                  <Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={!file} variant="hero">Upload</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {rows.length === 0 ? (
        <Card className="p-12 text-center shadow-card border-border/60">
          <div className="h-14 w-14 rounded-2xl bg-primary-soft flex items-center justify-center mx-auto mb-3">
            <ClipboardList className="h-6 w-6 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">No exams yet.</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rows.map((row: any) => (
            <Card key={row.id} className="p-5 shadow-card border-border/60 hover:shadow-elevated transition-smooth">
              <div className="flex items-start justify-between gap-2">
                <Badge variant="secondary" className="bg-primary-soft text-primary border-0 capitalize">{row.exam_type}</Badge>
                <Button variant="ghost" size="icon" onClick={() => onDelete(row.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
              <h3 className="font-display font-semibold mt-3">{row.title}</h3>
              {row.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{row.description}</p>}
              
              {row.studentId && (
                  <Badge variant="outline" className="mt-2 text-xs border-primary/20 text-primary">
                    Targeted Exam (Student ID: {row.studentId})
                  </Badge>
              )}

              <div className="text-xs text-muted-foreground mt-3">
                {row.duration_minutes} min{row.starts_at ? ` • ${format(new Date(row.starts_at), "MMM d, p")}` : ""}
              </div>
              <Button asChild variant="outline" className="w-full mt-4">
                <Link to={`${basePath}/exams/${row.id}/questions`}>
                  <Pencil className="h-4 w-4 mr-2" />Add specific MCQs
                </Link>
              </Button>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default ExamsManager;
