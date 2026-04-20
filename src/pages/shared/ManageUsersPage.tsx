import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Users, Copy, Pencil } from "lucide-react";
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
  
  const [form, setForm] = useState({ email: "", full_name: "", password: randomPassword() });
  const [editForm, setEditForm] = useState({ id: "", email: "", full_name: "", password: "" });

  const rows = useMemo(
    () =>
      users
        .filter((user) => user.role === role)
        .filter((user) => [user.email, user.full_name].some((value) => value?.toLowerCase().includes(query.toLowerCase())))
        .sort((a, b) => b.created_at.localeCompare(a.created_at)),
    [query, role, users],
  );

  const onCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createUser({ email: form.email, full_name: form.full_name, role });
    toast.success(`${role} scheduled for creation in DB`, {
      description: `${form.email} / ${form.password}`,
      duration: 10000,
    });
    setOpen(false);
    setForm({ email: "", full_name: "", password: randomPassword() });
  };

  const onEdit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({ 
        id: editForm.id, 
        email: editForm.email, 
        full_name: editForm.full_name, 
        role,
        ...(editForm.password ? { password: editForm.password } : {})
    });
    toast.success(`${role} scheduled for update in DB`);
    setEditOpen(false);
  };

  const handleOpenEdit = (user: any) => {
    setEditForm({ id: user.id, email: user.email, full_name: user.full_name, password: "" });
    setEditOpen(true);
  };

  const onDelete = (id: string, name: string) => {
    if (!confirm(`Delete ${name}? This cannot be undone.`)) return;
    deleteUser(id, role);
    toast.success("Deleted");
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
            <DialogContent>
              <form onSubmit={onCreate}>
                <DialogHeader>
                  <DialogTitle>Create {role}</DialogTitle>
                  <DialogDescription>
                    We automatically provision an account in the database.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label>Full name</Label>
                    <Input required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
                  </div>
                  <div>
                    <Label>Email (used as login username)</Label>
                    <Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  </div>
                  <div>
                    <Label>Initial password</Label>
                    <div className="flex gap-2">
                      <Input required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                      <Button type="button" variant="outline" size="icon" onClick={() => navigator.clipboard.writeText(form.password)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" variant="hero">Create</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
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
                <Label>New Password (leave blank to keep current)</Label>
                <Input type="text" minLength={6} value={editForm.password} onChange={(e) => setEditForm({ ...editForm, password: e.target.value })} />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" variant="hero">Update</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Card className="p-4 shadow-card border-border/60">
        <Input placeholder="Search..." value={query} onChange={(e) => setQuery(e.target.value)} className="mb-4 max-w-sm" />
        {rows.length === 0 ? (
          <div className="py-16 text-center">
            <div className="h-14 w-14 rounded-2xl bg-primary-soft flex items-center justify-center mx-auto mb-3">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">No {role}s yet.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Joined</TableHead>
                {viewerRole === "admin" && <TableHead className="w-24 text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.full_name || "-"}</TableCell>
                  <TableCell>{row.email}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{format(new Date(row.created_at), "MMM d, yyyy")}</TableCell>
                  {viewerRole === "admin" && (
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(row)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onDelete(row.id, row.full_name || row.email)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </DashboardLayout>
  );
};
