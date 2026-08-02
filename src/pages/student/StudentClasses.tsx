import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, BookOpen, FileText, ClipboardList, 
  ChevronRight, Presentation
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAppData } from "@/hooks/useAppData";

const StudentCourses = () => {
  const { user } = useAuth();
  const { users, courses } = useAppData();

  // Retrieve current student profile details
  const currentStudent = users.find((u) => u.id === user?.id);
  const classGrade = currentStudent?.course || "10th";
  const assignedSubjects = currentStudent?.assignedCourses || ["Physics", "Chemistry", "Biology", "Mathematics"];

  // Navigation states
  const [activeSubject, setActiveSubject] = useState<string | null>(null);
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"notes" | "assignments">("notes");

  // Retrieve current course document matching class + subject
  const activeCourse = courses.find(
    (c) => c.classGrade === classGrade && c.subject === activeSubject
  );

  const activeChapter = activeCourse?.chapters?.find(
    (ch) => (ch._id || ch.id) === activeChapterId
  );

  // Helper to open PDF
  const openFile = (fileUrl: string) => {
    const fullUrl = fileUrl.startsWith("http")
      ? fileUrl
      : `${(import.meta.env.VITE_API_URL || "http://localhost:5001/api").replace("/api", "")}/uploads/${fileUrl}`;
    window.open(fullUrl, "_blank");
  };

  return (
    <DashboardLayout role="student">
      {/* ─── LEVEL 1: List Assigned Subjects ─── */}
      {!activeSubject && (
        <div className="space-y-6">
          <div>
            <h2 className="font-display text-2xl font-bold">My Courses</h2>
            <p className="text-muted-foreground mt-1">Access your assigned study materials, notes, and assignments</p>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-5">
            {assignedSubjects.map((sub) => {
              const matchingCourse = courses.find(
                (c) => c.classGrade === classGrade && c.subject === sub
              );
              const chaptersCount = matchingCourse?.chapters?.length || 0;

              return (
                <Card 
                  key={sub} 
                  className="p-6 cursor-pointer border border-border/60 hover:border-[#f97316]/50 shadow-card hover:shadow-elevated transition-smooth flex flex-col justify-between"
                  onClick={() => setActiveSubject(sub)}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-orange-50 dark:bg-orange-950/20 flex items-center justify-center">
                      <Presentation className="h-6 w-6 text-[#f97316]" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-lg text-foreground">{sub}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{chaptersCount} chapters available</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-[#f97316] font-semibold mt-6 ml-auto">
                    View Course <ChevronRight className="h-3.5 w-3.5" />
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── LEVEL 2: List Chapters in Subject ─── */}
      {activeSubject && !activeChapterId && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => setActiveSubject(null)} className="gap-1.5">
              <ArrowLeft className="h-4 w-4" /> Back to Courses
            </Button>
            <span className="text-sm font-semibold text-muted-foreground font-mono">
              My Courses / {activeSubject}
            </span>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold">{activeSubject}</h2>
            <p className="text-muted-foreground mt-1">Select a chapter to access files</p>
          </div>

          <div className="max-w-3xl space-y-3">
            {!activeCourse?.chapters || activeCourse.chapters.length === 0 ? (
              <Card className="p-12 text-center shadow-card border-border/60">
                <BookOpen className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No chapters have been uploaded for this course yet.</p>
              </Card>
            ) : (
              activeCourse.chapters.map((ch) => {
                const chapterId = ch._id || ch.id;
                return (
                  <Card 
                    key={chapterId}
                    className="p-4 border border-border/60 hover:border-[#f97316]/40 transition-smooth flex items-center justify-between gap-4 cursor-pointer"
                    onClick={() => setActiveChapterId(chapterId)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-orange-550/10 flex items-center justify-center shrink-0">
                        <BookOpen className="h-4.5 w-4.5 text-[#f97316]" />
                      </div>
                      <div>
                        <h4 className="font-display font-bold text-sm text-foreground">{ch.title}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {ch.notes?.length || 0} notes • {ch.assignments?.length || 0} assignments available
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Card>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ─── LEVEL 3: View Notes and Assignments ─── */}
      {activeSubject && activeChapterId && activeChapter && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => setActiveChapterId(null)} className="gap-1.5">
              <ArrowLeft className="h-4 w-4" /> Back to Chapters
            </Button>
            <span className="text-sm font-semibold text-muted-foreground font-mono truncate">
              {activeSubject} / {activeChapter.title}
            </span>
          </div>

          <div className="max-w-3xl space-y-4">
            <div className="flex gap-2 border-b border-border">
              <button
                className={`pb-2.5 px-4 text-sm font-semibold transition-all border-b-2 leading-none flex items-center gap-2 ${
                  activeTab === "notes"
                    ? "border-[#f97316] text-[#f97316]"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setActiveTab("notes")}
              >
                <FileText className="h-4 w-4" /> Notes ({activeChapter.notes?.length || 0})
              </button>
              <button
                className={`pb-2.5 px-4 text-sm font-semibold transition-all border-b-2 leading-none flex items-center gap-2 ${
                  activeTab === "assignments"
                    ? "border-[#f97316] text-[#f97316]"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setActiveTab("assignments")}
              >
                <ClipboardList className="h-4 w-4" /> Assignments ({activeChapter.assignments?.length || 0})
              </button>
            </div>

            {activeTab === "notes" ? (
              <div className="space-y-3">
                {!activeChapter.notes || activeChapter.notes.length === 0 ? (
                  <Card className="p-12 text-center shadow-card border-border/60">
                    <FileText className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">No notes have been uploaded for this chapter yet.</p>
                  </Card>
                ) : (
                  activeChapter.notes.map((note: any) => (
                    <Card 
                      key={note._id || note.id}
                      className="p-4 border border-border/60 hover:border-muted-foreground/20 transition-smooth flex items-center justify-between gap-4 cursor-pointer"
                      onClick={() => openFile(note.fileUrl)}
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-red-500 shrink-0" />
                        <span className="font-semibold text-sm text-foreground">{note.title}</span>
                      </div>
                      <span className="text-xs text-muted-foreground font-mono">Open PDF</span>
                    </Card>
                  ))
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {!activeChapter.assignments || activeChapter.assignments.length === 0 ? (
                  <Card className="p-12 text-center shadow-card border-border/60">
                    <ClipboardList className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">No assignments have been uploaded for this chapter yet.</p>
                  </Card>
                ) : (
                  activeChapter.assignments.map((ass: any) => (
                    <Card 
                      key={ass._id || ass.id}
                      className="p-4 border border-border/60 hover:border-muted-foreground/20 transition-smooth flex items-center justify-between gap-4 cursor-pointer"
                      onClick={() => openFile(ass.fileUrl)}
                    >
                      <div className="flex items-center gap-3">
                        <ClipboardList className="h-5 w-5 text-indigo-500 shrink-0" />
                        <span className="font-semibold text-sm text-foreground">{ass.title}</span>
                      </div>
                      <span className="text-xs text-muted-foreground font-mono">Open PDF</span>
                    </Card>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default StudentCourses;
