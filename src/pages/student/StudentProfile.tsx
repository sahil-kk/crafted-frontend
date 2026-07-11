import { useEffect, useMemo, useState, useRef } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useAppData, ResultObj } from "@/hooks/useAppData";
import { apiClient } from "@/lib/apiClient";
import { toast } from "sonner";
import {
  UserCircle, Camera, Mail, Hash, Shield, Edit3,
  Trophy, FileText, CalendarDays, Lock, CheckCircle2,
  Crown, Star, Save, X
} from "lucide-react";

const StudentProfile = () => {
  const { user } = useAuth();
  const { exams, results, timetables, users } = useAppData();
  const fileRef = useRef<HTMLInputElement>(null);
  const currentStudent = users.find((item) => item.id === user?.id);

  const profileStorageKey = useMemo(() => `student-profile-${user?.id || "guest"}`, [user?.id]);
  const [photo, setPhoto] = useState<string | null>(currentStudent?.profilePhoto || user?.profilePhoto || null);
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(currentStudent?.full_name || user?.full_name || user?.email?.split("@")[0] || "Student");
  const [savedName, setSavedName] = useState(displayName);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ password: "", confirm: "" });
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    const backendPhoto = currentStudent?.profilePhoto || user?.profilePhoto;
    const backendName = currentStudent?.full_name || user?.full_name;
    if (backendPhoto) setPhoto(backendPhoto);
    if (backendName) {
      setDisplayName(backendName);
      setSavedName(backendName);
    }

    try {
      const raw = window.localStorage.getItem(profileStorageKey);
      if (!raw) return;
      const saved = JSON.parse(raw) as { photo?: string; fullName?: string };
      if (!backendPhoto && saved.photo) setPhoto(saved.photo);
      if (!backendName && saved.fullName) {
        setDisplayName(saved.fullName);
        setSavedName(saved.fullName);
      }
    } catch {
      window.localStorage.removeItem(profileStorageKey);
    }
  }, [currentStudent?.full_name, currentStudent?.profilePhoto, profileStorageKey, user?.full_name, user?.profilePhoto]);

  const persistProfile = (next: { photo?: string | null; fullName?: string }) => {
    const current = { photo, fullName };
    const updated = { ...current, ...next };
    window.localStorage.setItem(profileStorageKey, JSON.stringify(updated));
  };

  const fullName = savedName || user?.full_name || user?.email?.split("@")[0] || "Student";
  const studentId = user?.id?.toString().slice(-6).toUpperCase() || "------";
  const email = user?.email || "—";
  const initials = fullName.slice(0, 2).toUpperCase();

  const myResults = (results || []).filter((r: ResultObj) => r.studentId === user?.id);
  const avgScore =
    myResults.length > 0
      ? Math.round(
        (myResults.reduce((acc, r) => acc + r.score / (r.maxScore || 100), 0) / myResults.length) * 100
      )
      : null;
  const bestScore =
    myResults.length > 0
      ? Math.max(...myResults.map((r) => Math.round((r.score / (r.maxScore || 100)) * 100)))
      : null;

  const myTimetable = (timetables || []).filter((t: any) => !t.studentId || t.studentId === user?.id);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2 MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = String(reader.result || "");
      setPhoto(dataUrl);
      persistProfile({ photo: dataUrl });
      try {
        await apiClient(`/students/${user?.id}`, {
          method: "PATCH",
          body: JSON.stringify({ profilePhoto: dataUrl }),
        });
        toast.success("Profile photo updated");
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Parent portal will update after the photo is saved";
        toast.error("Could not sync photo", { description: message });
      }
    };
    reader.onerror = () => toast.error("Could not read image");
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    const trimmed = displayName.trim();
    if (!trimmed) {
      toast.error("Name cannot be empty");
      return;
    }
    setSavedName(trimmed);
    setDisplayName(trimmed);
    persistProfile({ fullName: trimmed });
    try {
      await apiClient(`/students/${user?.id}`, {
        method: "PATCH",
        body: JSON.stringify({ name: trimmed }),
      });
      toast.success("Profile updated");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Parent portal will update after the profile is saved";
      toast.error("Could not sync profile", { description: message });
    } finally {
      setEditing(false);
    }
  };

  const handlePasswordChange = async (event: React.FormEvent) => {
    event.preventDefault();
    if (passwordForm.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (passwordForm.password !== passwordForm.confirm) {
      toast.error("Passwords do not match");
      return;
    }

    setSavingPassword(true);
    try {
      await apiClient(`/students/${user?.id}`, {
        method: "PATCH",
        body: JSON.stringify({ password: passwordForm.password }),
      });
      setPasswordForm({ password: "", confirm: "" });
      setPasswordOpen(false);
      toast.success("Password changed");
    } catch (err: any) {
      toast.error("Could not change password", {
        description: err.message || "Please try again.",
      });
    } finally {
      setSavingPassword(false);
    }
  };

  const stats = [
    { label: "Exams Available", value: exams?.length ?? 0, icon: FileText, color: "#fe6519" },
    { label: "Exams Taken", value: myResults.length, icon: CheckCircle2, color: "#10b981" },
    { label: "Avg Score", value: avgScore !== null ? `${avgScore}%` : "—", icon: Trophy, color: "#6366f1" },
    { label: "Classes", value: myTimetable.length, icon: CalendarDays, color: "#f59e0b" },
  ];

  return (
    <DashboardLayout role="student">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h2 className="font-display text-2xl font-bold">My Profile</h2>
          <p className="text-muted-foreground mt-1">Manage your personal information and account settings</p>
        </div>

        <div className="grid lg:grid-cols-12 gap-6">

          {/* ── LEFT: Profile Card ── */}
          <div className="lg:col-span-4 flex flex-col gap-5">

            {/* Photo + Name Card */}
            <Card className="p-6 shadow-card border-border/60 text-center">
              {/* Photo */}
              <div className="relative inline-block mx-auto mb-4">
                <div
                  className="h-28 w-28 rounded-2xl mx-auto flex items-center justify-center text-white font-bold text-4xl border-4 border-white shadow-xl overflow-hidden"
                  style={{ background: "linear-gradient(135deg, #fe6519, #ff8147)" }}
                >
                  {photo ? (
                    <img src={photo} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    initials
                  )}
                </div>
                <button
                  onClick={() => fileRef.current?.click()}
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-[#fe6519] text-white flex items-center justify-center shadow-lg hover:bg-[#e55a15] transition-colors"
                  title="Change photo"
                >
                  <Camera className="h-3.5 w-3.5" />
                </button>
                {photo && (
                  <button
                    onClick={() => {
                      setPhoto(null);
                      persistProfile({ photo: null });
                      apiClient(`/students/${user?.id}`, {
                        method: "PATCH",
                        body: JSON.stringify({ profilePhoto: "" }),
                      }).catch(() => undefined);
                      toast.success("Profile photo removed");
                    }}
                    className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-white text-destructive border border-border flex items-center justify-center shadow hover:bg-secondary transition-colors"
                    title="Remove photo"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
              </div>

              {/* Gold member badge */}
              <div className="flex justify-center mb-2">
                <Badge
                  className="gap-1.5 text-xs font-bold px-3 py-1"
                  style={{ background: "linear-gradient(90deg, #f59e0b, #fbbf24)", color: "#78350f", border: "none" }}
                >
                  <Crown className="h-3.5 w-3.5" /> Gold Member
                </Badge>
              </div>

              <h3 className="font-display font-bold text-xl text-foreground mt-2">{fullName}</h3>
              <p className="text-sm text-muted-foreground mt-0.5">Student</p>

              {/* Quick info pills */}
              <div className="flex flex-col gap-2 mt-5 text-left">
                <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-secondary/50">
                  <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm text-foreground truncate">{email}</span>
                </div>
                <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-secondary/50">
                  <Hash className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm text-foreground font-mono font-semibold">{studentId}</span>
                  <span className="text-xs text-muted-foreground ml-auto">Student ID</span>
                </div>
                <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-secondary/50">
                  <Shield className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm text-foreground capitalize">Student</span>
                  <span className="text-xs text-muted-foreground ml-auto">Role</span>
                </div>
              </div>
            </Card>

            {/* Membership Card */}
            <Card
              className="p-5 shadow-card border-0 text-white overflow-hidden relative"
              style={{ background: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 60%, #fde68a 100%)" }}
            >
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <Crown className="h-5 w-5 text-yellow-800" />
                  <span className="font-bold text-yellow-900">Gold Membership</span>
                </div>
                <p className="text-yellow-800/90 text-xs leading-relaxed">
                  Full access to all recorded classes, slides, exams, and study materials.
                </p>
                <div className="flex items-center gap-1 mt-3">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="h-4 w-4 text-yellow-700 fill-yellow-600" />
                  ))}
                </div>
              </div>
              <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-white/20" />
              <div className="absolute -right-2 -bottom-6 w-16 h-16 rounded-full bg-white/15" />
            </Card>
          </div>

          {/* ── RIGHT: Details ── */}
          <div className="lg:col-span-8 flex flex-col gap-5">

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {stats.map((stat) => (
                <Card key={stat.label} className="p-4 shadow-card border-border/60 text-center">
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center mx-auto mb-2"
                    style={{ background: `${stat.color}18` }}
                  >
                    <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
                  </div>
                  <div className="font-bold text-lg text-foreground">{stat.value}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{stat.label}</div>
                </Card>
              ))}
            </div>

            {/* Edit Profile */}
            <Card className="p-6 shadow-card border-border/60">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <UserCircle className="h-5 w-5" style={{ color: "#fe6519" }} />
                  <h3 className="font-display font-bold text-base text-foreground">Personal Information</h3>
                </div>
                {!editing && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs"
                    onClick={() => setEditing(true)}
                  >
                    <Edit3 className="h-3.5 w-3.5" /> Edit
                  </Button>
                )}
              </div>

              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                      Full Name
                    </label>
                    {editing ? (
                      <Input
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="text-sm"
                        placeholder="Enter your full name"
                      />
                    ) : (
                      <div className="px-3 py-2 rounded-xl bg-secondary/40 text-sm text-foreground font-medium">
                        {fullName}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                      Student ID
                    </label>
                    <div className="px-3 py-2 rounded-xl bg-secondary/40 text-sm text-foreground font-mono font-semibold">
                      {studentId}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                    Email Address
                  </label>
                  <div className="px-3 py-2 rounded-xl bg-secondary/40 text-sm text-muted-foreground">
                    {email}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                    Role
                  </label>
                  <div className="px-3 py-2 rounded-xl bg-secondary/40 text-sm text-foreground capitalize flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" /> Student
                  </div>
                </div>

                {editing && (
                  <div className="flex gap-2 pt-1">
                    <Button
                      onClick={handleSave}
                      variant="hero"
                      className="text-sm px-5"
                    >
                      <Save className="h-4 w-4 mr-1.5" /> Save Changes
                    </Button>
                    <Button
                      variant="outline"
                      className="text-sm px-5"
                      onClick={() => { setEditing(false); setDisplayName(savedName); }}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </Card>

            {/* Performance Summary */}
            <Card className="p-6 shadow-card border-border/60">
              <div className="flex items-center gap-2 mb-5">
                <Trophy className="h-5 w-5" style={{ color: "#fe6519" }} />
                <h3 className="font-display font-bold text-base text-foreground">Academic Performance</h3>
              </div>

              {myResults.length === 0 ? (
                <div className="text-center py-6 text-sm text-muted-foreground">
                  No exam results yet. Complete your first exam to see your performance here.
                </div>
              ) : (
                <div className="space-y-3">
                  {myResults.slice(0, 5).map((r: ResultObj, i) => {
                    const pct = Math.round((r.score / (r.maxScore || 100)) * 100);
                    const barColor = pct >= 80 ? "#10b981" : pct >= 60 ? "#f59e0b" : "#ef4444";
                    return (
                      <div key={r.id || i}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="font-medium text-foreground">{r.subject}</span>
                          <span className="font-bold" style={{ color: barColor }}>{pct}%</span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${pct}%`, background: barColor }}
                          />
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {r.score} / {r.maxScore || 100} marks
                          {r.grade ? ` · Grade ${r.grade}` : ""}
                        </div>
                      </div>
                    );
                  })}

                  {avgScore !== null && (
                    <div className="mt-4 pt-4 border-t border-border/60 flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">Overall Average</div>
                      <div
                        className="text-lg font-bold"
                        style={{ color: avgScore >= 80 ? "#10b981" : avgScore >= 60 ? "#f59e0b" : "#ef4444" }}
                      >
                        {avgScore}%
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>

            {/* Security */}
            <Card className="p-6 shadow-card border-border/60">
              <div className="flex items-center gap-2 mb-4">
                <Lock className="h-5 w-5" style={{ color: "#fe6519" }} />
                <h3 className="font-display font-bold text-base text-foreground">Security</h3>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border/50">
                <div>
                  <div className="text-sm font-medium text-foreground">Password</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Change your account password</div>
                </div>
                <Button variant="outline" size="sm" className="text-xs" onClick={() => setPasswordOpen(true)}>
                  Change
                </Button>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <div className="text-sm font-medium text-foreground">Account Status</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Your account is active</div>
                </div>
                <Badge className="bg-green-100 text-green-700 border-0 text-xs gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Active
                </Badge>
              </div>
            </Card>

          </div>
        </div>
      </div>
      <Dialog open={passwordOpen} onOpenChange={setPasswordOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={handlePasswordChange}>
            <DialogHeader>
              <DialogTitle>Change Password</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>New password</Label>
                <Input
                  type="password"
                  value={passwordForm.password}
                  onChange={(event) => setPasswordForm((prev) => ({ ...prev, password: event.target.value }))}
                  minLength={6}
                  required
                />
              </div>
              <div>
                <Label>Confirm password</Label>
                <Input
                  type="password"
                  value={passwordForm.confirm}
                  onChange={(event) => setPasswordForm((prev) => ({ ...prev, confirm: event.target.value }))}
                  minLength={6}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setPasswordOpen(false)}>Cancel</Button>
              <Button type="submit" variant="hero" disabled={savingPassword}>Update Password</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default StudentProfile;
