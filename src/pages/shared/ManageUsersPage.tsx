import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Users, Copy, Pencil, Phone, BookOpen, GraduationCap, School } from "lucide-react";
import { toast } from "sonner";
import { AppRole } from "@/hooks/useAuth";
import { useAppData } from "@/hooks/useAppData";
import { format } from "date-fns";

interface Props {
  role: "student" | "teacher";
  viewerRole: AppRole;
  title: string;
  description: string;
}

const randomPassword = () => {
  const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let output = "";
  for (let i = 0; i < 10; i += 1) output += chars[Math.floor(Math.random() * chars.length)];
  return `${output}!`;
};

export const ManageUsersPage = ({ role, viewerRole, title, description }: Props) => {
  const { users, createUser, deleteUser, updateUser } = useAppData();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  // Filter States
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  
  const [form, setForm] = useState({ 
    email: "", 
    full_name: "", 
    password: randomPassword(),
    course: "10th", 
    batch: "Batch 1", 
    phone: "", 
    subject: "Physics" 
  });
  
  const [editForm, setEditForm] = useState({ 
    id: "", 
    email: "", 
    full_name: "", 
    password: "", 
    course: "10th", 
    batch: "Batch 1", 
    phone: "", 
    subject: "Physics" 
  });

  const rows = useMemo(() => {
    return users
      .filter((user) => user.role === role)
      .filter((user) => {
        if (role === "student") {
          if (selectedClass !== "all") {
            return user.course === selectedClass;
          }
        } else if (role === "teacher") {
          if (selectedSubject !== "all") {
            const sub = user.subject?.toLowerCase() || "";
            if (selectedSubject === "phy") return sub.includes("phy");
            if (selectedSubject === "che") return sub.includes("che");
            if (selectedSubject === "mat") return sub.includes("math") || sub.includes("mat");
            if (selectedSubject === "bio") return sub.includes("bio");
            return sub === selectedSubject.toLowerCase();
          }
        }
        return true;
      })
      .filter((user) => 
        [user.email, user.full_name, user.phone, user.course, user.batch, user.subject]
          .some((val) => val?.toLowerCase().includes(query.toLowerCase()))
      )
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
  }, [query, role, users, selectedClass, selectedSubject]);

  const onCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createUser({ 
      email: form.email, 
      full_name: form.full_name, 
      role,
      course: role === "student" ? form.course : undefined,
      batch: role === "student" ? form.batch : undefined,
      phone: form.phone,
      subject: role === "teacher" ? form.subject : undefined
    });
    toast.success(`${role} scheduled for creation in DB`, {
      description: `${form.email} / ${form.password}`,
      duration: 10000,
    });
    setOpen(false);
    setForm({ 
      email: "", 
      full_name: "", 
      password: randomPassword(), 
      course: "10th", 
      batch: "Batch 1", 
      phone: "", 
      subject: "Physics" 
    });
  };

  const onEdit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({ 
      id: editForm.id, 
      email: editForm.email, 
      full_name: editForm.full_name, 
      role,
      course: role === "student" ? editForm.course : undefined,
      batch: role === "student" ? editForm.batch : undefined,
      phone: editForm.phone,
      subject: role === "teacher" ? editForm.subject : undefined,
      ...(editForm.password ? { password: editForm.password } : {})
    });
    toast.success(`${role} scheduled for update in DB`);
    setEditOpen(false);
  };

  const handleOpenEdit = (user: any) => {
    setEditForm({ 
      id: user.id, 
      email: user.email, 
      full_name: user.full_name, 
      password: "",
      course: user.course || "10th",
      batch: user.batch || "Batch 1",
      phone: user.phone || "",
      subject: user.subject || "Physics"
    });
    setEditOpen(true);
  };

  const onDelete = (id: string, name: string) => {
    if (!confirm(`Delete ${name}? This cannot be undone.`)) return;
    deleteUser(id, role);
    toast.success("Deleted");
  };

  // Helper to determine row coloring class for students based on grade
  const getStudentRowClass = (classGrade?: string) => {
    switch (classGrade) {
      case "8th":
        return "bg-emerald-50/40 dark:bg-emerald-950/10 border-l-4 border-l-emerald-500 hover:bg-emerald-100/40 dark:hover:bg-emerald-950/20 transition-all";
      case "9th":
        return "bg-blue-50/40 dark:bg-blue-950/10 border-l-4 border-l-blue-500 hover:bg-blue-100/40 dark:hover:bg-blue-950/20 transition-all";
      case "10th":
        return "bg-purple-50/40 dark:bg-purple-950/10 border-l-4 border-l-purple-500 hover:bg-purple-100/40 dark:hover:bg-purple-950/20 transition-all";
      case "11th":
        return "bg-amber-50/40 dark:bg-amber-950/10 border-l-4 border-l-amber-500 hover:bg-amber-100/40 dark:hover:bg-amber-950/20 transition-all";
      case "12th":
        return "bg-rose-50/40 dark:bg-rose-950/10 border-l-4 border-l-rose-500 hover:bg-rose-100/40 dark:hover:bg-rose-950/20 transition-all";
      default:
        return "border-l-4 border-l-transparent hover:bg-muted/50 transition-all";
    }
  };

  return (
    <DashboardLayout role={viewerRole} title={title}>
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h2 className="font-display text-2xl font-bold">{title}</h2>
          <p className="text-muted-foreground mt-1">{description}</p>
        </div>
        {viewerRole === "admin" && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="hero"><Plus className="h-4 w-4 mr-2" />Add {role}</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <form onSubmit={onCreate}>
                <DialogHeader>
                  <DialogTitle>Create {role}</DialogTitle>
                  <DialogDescription>
                    Fill in details to provision a new {role} account.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label>Full name</Label>
                    <Input required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="e.g. John Doe" />
                  </div>
                  <div>
                    <Label>Email (Username)</Label>
                    <Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="e.g. john@school.com" />
                  </div>
                  <div>
                    <Label>Phone number</Label>
                    <Input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="e.g. +91 9876543210" />
                  </div>

                  {role === "student" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Class / Grade</Label>
                        <Select value={form.course} onValueChange={(val) => setForm({ ...form, course: val })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select class" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="8th">8th Grade</SelectItem>
                            <SelectItem value="9th">9th Grade</SelectItem>
                            <SelectItem value="10th">10th Grade</SelectItem>
                            <SelectItem value="11th">11th Grade</SelectItem>
                            <SelectItem value="12th">12th Grade</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Student Batch</Label>
                        <Select value={form.batch} onValueChange={(val) => setForm({ ...form, batch: val })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select batch" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Batch 1">Batch 1</SelectItem>
                            <SelectItem value="Batch 2">Batch 2</SelectItem>
                            <SelectItem value="Batch 3">Batch 3</SelectItem>
                            <SelectItem value="Batch 4">Batch 4</SelectItem>
                            <SelectItem value="Batch 5">Batch 5</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {role === "teacher" && (
                    <div>
                      <Label>Subject specialization</Label>
                      <Select value={form.subject} onValueChange={(val) => setForm({ ...form, subject: val })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Physics">Physics</SelectItem>
                          <SelectItem value="Chemistry">Chemistry</SelectItem>
                          <SelectItem value="Mathematics">Mathematics</SelectItem>
                          <SelectItem value="Biology">Biology</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div>
                    <Label>Initial password</Label>
                    <div className="flex gap-2">
                      <Input required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                      <Button type="button" variant="outline" size="icon" onClick={() => {
                        navigator.clipboard.writeText(form.password);
                        toast.success("Copied to clipboard");
                      }}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" variant="hero">Create {role}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={onEdit}>
            <DialogHeader>
              <DialogTitle>Edit {role}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Full name</Label>
                <Input required value={editForm.full_name} onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })} />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" required value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
              </div>
              <div>
                <Label>Phone number</Label>
                <Input type="tel" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
              </div>

              {role === "student" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Class / Grade</Label>
                    <Select value={editForm.course} onValueChange={(val) => setEditForm({ ...editForm, course: val })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="8th">8th Grade</SelectItem>
                        <SelectItem value="9th">9th Grade</SelectItem>
                        <SelectItem value="10th">10th Grade</SelectItem>
                        <SelectItem value="11th">11th Grade</SelectItem>
                        <SelectItem value="12th">12th Grade</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Student Batch</Label>
                    <Select value={editForm.batch} onValueChange={(val) => setEditForm({ ...editForm, batch: val })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select batch" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Batch 1">Batch 1</SelectItem>
                        <SelectItem value="Batch 2">Batch 2</SelectItem>
                        <SelectItem value="Batch 3">Batch 3</SelectItem>
                        <SelectItem value="Batch 4">Batch 4</SelectItem>
                        <SelectItem value="Batch 5">Batch 5</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {role === "teacher" && (
                <div>
                  <Label>Subject specialization</Label>
                  <Select value={editForm.subject} onValueChange={(val) => setEditForm({ ...editForm, subject: val })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Physics">Physics</SelectItem>
                      <SelectItem value="Chemistry">Chemistry</SelectItem>
                      <SelectItem value="Mathematics">Mathematics</SelectItem>
                      <SelectItem value="Biology">Biology</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label>New Password (leave blank to keep current)</Label>
                <Input type="text" minLength={6} value={editForm.password} onChange={(e) => setEditForm({ ...editForm, password: e.target.value })} placeholder="New password" />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" variant="hero">Update {role}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Card className="p-6 shadow-card border-border/60">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6">
          <Input placeholder="Search name or email..." value={query} onChange={(e) => setQuery(e.target.value)} className="max-w-sm" />
          
          <div className="flex items-center gap-2">
            {role === "student" && (
              <div className="flex items-center gap-2 min-w-[200px]">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">Filter by Class:</Label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Classes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    <SelectItem value="8th">8th Grade</SelectItem>
                    <SelectItem value="9th">9th Grade</SelectItem>
                    <SelectItem value="10th">10th Grade</SelectItem>
                    <SelectItem value="11th">11th Grade</SelectItem>
                    <SelectItem value="12th">12th Grade</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {role === "teacher" && (
              <div className="flex items-center gap-2 min-w-[220px]">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">Filter by Subject:</Label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Subjects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    <SelectItem value="phy">Physics (phy)</SelectItem>
                    <SelectItem value="che">Chemistry (che)</SelectItem>
                    <SelectItem value="mat">Mathematics (mat)</SelectItem>
                    <SelectItem value="bio">Biology (bio)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>

        {rows.length === 0 ? (
          <div className="py-16 text-center">
            <div className="h-14 w-14 rounded-2xl bg-primary-soft flex items-center justify-center mx-auto mb-3">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">No matching {role}s found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  {role === "student" && (
                    <>
                      <TableHead>Class</TableHead>
                      <TableHead>Batch</TableHead>
                    </>
                  )}
                  {role === "teacher" && <TableHead>Subject</TableHead>}
                  <TableHead>Joined</TableHead>
                  {viewerRole === "admin" && <TableHead className="w-24 text-right pr-4">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => {
                  const studentRowStyle = role === "student" ? getStudentRowClass(row.course) : "hover:bg-muted/50 transition-all";
                  return (
                    <TableRow key={row.id} className={studentRowStyle}>
                      <TableCell className="font-semibold pl-4">
                        <div className="flex items-center gap-2">
                          <span className="text-foreground">{row.full_name || "-"}</span>
                          {role === "student" && (
                            <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                              {row.course || "N/A"}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">{row.email}</TableCell>
                      <TableCell className="text-sm">
                        <div className="flex items-center gap-1.5 text-foreground/80">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          <span>{row.phone || "No phone"}</span>
                        </div>
                      </TableCell>
                      {role === "student" && (
                        <>
                          <TableCell>
                            <span className="font-semibold">{row.course || "8th"}</span>
                          </TableCell>
                          <TableCell>
                            <span className="inline-flex items-center gap-1 rounded bg-secondary/80 px-2 py-0.5 text-xs font-semibold text-secondary-foreground">
                              {row.batch || "Batch 1"}
                            </span>
                          </TableCell>
                        </>
                      )}
                      {role === "teacher" && (
                        <TableCell>
                          <span className="inline-flex items-center gap-1 rounded bg-indigo-550/10 px-2.5 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                            <GraduationCap className="h-3 w-3" />
                            {row.subject || "Physics"}
                          </span>
                        </TableCell>
                      )}
                      <TableCell className="text-muted-foreground text-xs">
                        {format(new Date(row.created_at), "MMM d, yyyy")}
                      </TableCell>
                      {viewerRole === "admin" && (
                        <TableCell className="text-right pr-4">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(row)} className="hover:bg-primary-soft hover:text-primary">
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => onDelete(row.id, row.full_name || row.email)} className="hover:bg-destructive/10 hover:text-destructive">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </DashboardLayout>
  );
};
