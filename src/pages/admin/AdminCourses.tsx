import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { AppRole } from "@/hooks/useAuth";
import { useAppData } from "@/hooks/useAppData";

const AdminCourses = ({ viewerRole = "admin" as AppRole }) => {
  const { courses, createCourse, deleteCourse } = useAppData();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });
  const rows = [...courses].sort((a, b) => b.created_at.localeCompare(a.created_at));

  const onCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createCourse(form);
    toast.success("Course created");
    setOpen(false);
    setForm({ name: "", description: "" });
  };

  const onDelete = (id: string) => {
    if (!confirm("Delete this course?")) return;
    deleteCourse(id);
    toast.success("Deleted");
  };

  return (
    <DashboardLayout role={viewerRole}>
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h2 className="font-display text-2xl font-bold">Courses</h2>
          <p className="text-muted-foreground mt-1">Create and manage courses</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="hero"><Plus className="h-4 w-4 mr-2" />New course</Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={onCreate}>
              <DialogHeader><DialogTitle>Create course</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>Name</Label>
                  <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" variant="hero">Create</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {rows.length === 0 ? (
        <Card className="p-12 text-center shadow-card border-border/60">
          <div className="h-14 w-14 rounded-2xl bg-primary-soft flex items-center justify-center mx-auto mb-3">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">No courses yet.</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rows.map((course) => (
            <Card key={course.id} className="p-5 shadow-card border-border/60 hover:shadow-elevated transition-smooth">
              <div className="flex items-start justify-between gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary-soft flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <Button variant="ghost" size="icon" onClick={() => onDelete(course.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
              <h3 className="font-display font-semibold mt-3">{course.name}</h3>
              {course.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-3">{course.description}</p>}
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminCourses;
