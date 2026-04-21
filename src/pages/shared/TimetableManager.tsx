import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, CalendarDays, Pencil } from "lucide-react";
import { toast } from "sonner";
import { AppRole } from "@/hooks/useAuth";
import { useAppData, TimetableObj } from "@/hooks/useAppData";

interface Props {
  viewerRole: AppRole;
}

const TimetableManager = ({ viewerRole }: Props) => {
  const { users, timetables, createTimetable, deleteTimetable, updateTimetable } = useAppData();
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const students = users.filter((u) => u.role === "student");
  
  const [form, setForm] = useState({
    day: "Monday",
    time: "",
    subject: "",
    teacher: "",
    studentId: "" 
  });

  const [editForm, setEditForm] = useState({
    id: "",
    day: "Monday",
    time: "",
    subject: "",
    teacher: "",
    studentId: "" 
  });

  const handleOpenEdit = (t: any) => {
    setEditForm({
      id: t._id || t.id,
      day: t.day || "Monday",
      time: t.time || "",
      subject: t.subject || "",
      teacher: t.teacher || "",
      studentId: t.studentId || ""
    });
    setEditOpen(true);
  };

  const onEdit = (e: React.FormEvent) => {
    e.preventDefault();
    updateTimetable(editForm.id, {
      day: editForm.day,
      time: editForm.time,
      subject: editForm.subject,
      teacher: editForm.teacher,
      studentId: editForm.studentId || undefined
    });
    toast.success("Schedule updated!");
    setEditOpen(false);
  };

  const onCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createTimetable({
      day: form.day,
      time: form.time,
      subject: form.subject,
      teacher: form.teacher,
      studentId: form.studentId || undefined
    });
    toast.success("Schedule added!");
    setOpen(false);
    setForm({ day: "Monday", time: "", subject: "", teacher: "", studentId: "" });
  };

  return (
    <DashboardLayout role={viewerRole}>
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h2 className="font-display text-2xl font-bold">Timetables</h2>
          <p className="text-muted-foreground mt-1">Assign schedules optionally targeting specific students</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="hero"><Plus className="h-4 w-4 mr-2" />Add Entry</Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={onCreate}>
              <DialogHeader><DialogTitle>New Schedule Block</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                   <Label>Target Student (Optional)</Label>
                   <Select value={form.studentId || "none"} onValueChange={(value) => setForm({ ...form, studentId: value === "none" ? "" : value })}>
                    <SelectTrigger><SelectValue placeholder="Broadcast to All" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Broadcast to All Students</SelectItem>
                      {students.map((student) => <SelectItem key={student.id} value={student.id}>{student.full_name || student.email}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Day</Label>
                    <Select value={form.day} onValueChange={(v) => setForm({ ...form, day: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(d => (
                           <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Time Range</Label>
                    <Input required placeholder="eg. 09:00 AM - 10:30 AM" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Subject</Label>
                    <Input required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
                  </div>
                  <div>
                    <Label>Instructor</Label>
                    <Input required value={form.teacher} onChange={(e) => setForm({ ...form, teacher: e.target.value })} />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" variant="hero">Add to Schedule</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <form onSubmit={onEdit}>
            <DialogHeader><DialogTitle>Edit Schedule Block</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                 <Label>Target Student (Optional)</Label>
                 <Select value={editForm.studentId || "none"} onValueChange={(value) => setEditForm({ ...editForm, studentId: value === "none" ? "" : value })}>
                  <SelectTrigger><SelectValue placeholder="Broadcast to All" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Broadcast to All Students</SelectItem>
                    {students.map((student) => <SelectItem key={student.id} value={student.id}>{student.full_name || student.email}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Day</Label>
                  <Select value={editForm.day} onValueChange={(v) => setEditForm({ ...editForm, day: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(d => (
                         <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Time Range</Label>
                  <Input required placeholder="eg. 09:00 AM - 10:30 AM" value={editForm.time} onChange={(e) => setEditForm({ ...editForm, time: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Subject</Label>
                  <Input required value={editForm.subject} onChange={(e) => setEditForm({ ...editForm, subject: e.target.value })} />
                </div>
                <div>
                  <Label>Instructor</Label>
                  <Input required value={editForm.teacher} onChange={(e) => setEditForm({ ...editForm, teacher: e.target.value })} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" variant="hero">Update Schedule</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Card className="p-4 shadow-card border-border/60">
        {!timetables || timetables.length === 0 ? (
          <div className="py-16 text-center">
            <div className="h-14 w-14 rounded-2xl bg-primary-soft flex items-center justify-center mx-auto mb-3">
              <CalendarDays className="h-6 w-6 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">No timetable blocks scheduled.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Target Student</TableHead>
                <TableHead>Day</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Instructor</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {timetables.map((t: TimetableObj) => {
                const stu = students.find((s) => s.id === t.studentId);
                return (
                  <TableRow key={t._id || t.id}>
                    <TableCell className="font-medium text-primary">
                        {stu ? (stu.full_name || stu.email) : (t.studentId ? t.studentId : "Global / All")}
                    </TableCell>
                    <TableCell>{t.day}</TableCell>
                    <TableCell>{t.time}</TableCell>
                    <TableCell>{t.subject}</TableCell>
                    <TableCell>{t.teacher}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end shrink-0">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(t)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteTimetable(t._id! || t.id!)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>
    </DashboardLayout>
  );
};

export default TimetableManager;
