import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Video, Search, PlayCircle, BookOpen,
  Crown, ChevronDown, ClipboardList, Presentation
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useAppData } from "@/hooks/useAppData";

const SUBJECTS = ["All", "Physics", "Chemistry", "Mathematics", "Biology"];

type TabType = "videos" | "slides" | "assignments";

const StudentCourses = () => {
  const { recordedClasses } = useAppData();
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState("All");
  const [activeTab, setActiveTab] = useState<TabType>("videos");
  const [showSubjectMenu, setShowSubjectMenu] = useState(false);
  const [active, setActive] = useState<any | null>(null);

  const items = [...recordedClasses].sort((a, b) => b.created_at.localeCompare(a.created_at));

  const filtered = items.filter((item) => {
    const matchesQuery =
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase());
    // Subject filter: match description or title
    const matchesSubject =
      subject === "All" ||
      item.title.toLowerCase().includes(subject.toLowerCase()) ||
      item.description.toLowerCase().includes(subject.toLowerCase());
    return matchesQuery && matchesSubject;
  });

  const tabs: { key: TabType; label: string; icon: any }[] = [
    { key: "videos", label: "Videos", icon: Video },
    { key: "slides", label: "Slides", icon: Presentation },
    { key: "assignments", label: "Assignments", icon: ClipboardList },
  ];

  return (
    <DashboardLayout role="student">
      {/* Header */}
      <div className="mb-6">
        {/* Gold Member Banner */}
        <div
          className="relative overflow-hidden rounded-2xl px-6 py-5 mb-6 flex items-center gap-4"
          style={{ background: "linear-gradient(120deg, #f59e0b 0%, #fbbf24 50%, #fde68a 100%)" }}
        >
          <div className="h-12 w-12 rounded-xl bg-white/30 flex items-center justify-center shrink-0">
            <Crown className="h-6 w-6 text-yellow-800" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="bg-yellow-800/20 text-yellow-900 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-widest">
                Gold Member
              </span>
            </div>
            <div className="font-bold text-yellow-900 text-lg">Premium Access Activated</div>
            <div className="text-yellow-800/80 text-xs">You have full access to all courses, videos, slides &amp; assignments.</div>
          </div>
          <div className="hidden sm:flex items-center gap-1">
            {["⭐", "⭐", "⭐"].map((s, i) => (
              <span key={i} className="text-xl opacity-80">{s}</span>
            ))}
          </div>
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/15 pointer-events-none" />
          <div className="absolute -right-2 -bottom-8 w-20 h-20 rounded-full bg-white/10 pointer-events-none" />
        </div>

        {/* Title + Search + Subject Filter */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold">My Courses</h2>
            <p className="text-muted-foreground mt-1">Your enrolled subjects &amp; learning materials</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Subject Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowSubjectMenu(!showSubjectMenu)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-background hover:bg-secondary transition-colors text-sm font-medium"
              >
                <BookOpen className="h-4 w-4" style={{ color: "#fe6519" }} />
                {subject}
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
              {showSubjectMenu && (
                <div className="absolute right-0 top-full mt-1 z-20 bg-background border border-border rounded-xl shadow-elevated min-w-[140px] py-1 animate-fade-in">
                  {SUBJECTS.map((s) => (
                    <button
                      key={s}
                      onClick={() => { setSubject(s); setShowSubjectMenu(false); }}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-secondary/60 ${subject === s ? "text-[#fe6519] font-semibold" : "text-foreground"}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* Search */}
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search..."
                className="pl-9"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-secondary/60 mb-6 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeTab === tab.key
                ? "bg-white text-[#fe6519] shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── VIDEOS TAB ── */}
      {activeTab === "videos" && (
        <>
          {filtered.length === 0 ? (
            <Card className="p-12 text-center shadow-card border-border/60">
              <div className="h-14 w-14 rounded-2xl bg-primary-soft flex items-center justify-center mx-auto mb-4">
                <Video className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-lg">No videos yet</h3>
              <p className="text-sm text-muted-foreground mt-1">Your teachers will upload recorded classes here.</p>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((item) => (
                <button key={item.id} onClick={() => setActive(item)} className="text-left group">
                  <Card className="overflow-hidden shadow-card hover:shadow-elevated hover:border-primary/30 transition-smooth border-border/60">
                    {/* Thumbnail */}
                    <div className="aspect-video relative bg-secondary overflow-hidden">
                      <img
                        src={`https://i.ytimg.com/vi/${item.youtube_id}/hqdefault.jpg`}
                        alt={item.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-smooth"
                      />
                      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-smooth flex items-center justify-center">
                        <div
                          className="h-12 w-12 rounded-full flex items-center justify-center"
                          style={{ background: "rgba(254,101,25,0.9)" }}
                        >
                          <PlayCircle className="h-7 w-7 text-white" />
                        </div>
                      </div>
                      {/* Subject badge overlay */}
                      <div className="absolute top-2 left-2">
                        <span className="bg-black/60 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm">
                          Video
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium line-clamp-2 text-sm">{item.title}</h3>
                      {item.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
                      )}
                    </div>
                  </Card>
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── SLIDES TAB ── */}
      {activeTab === "slides" && (
        <Card className="p-12 text-center shadow-card border-border/60">
          <div className="h-14 w-14 rounded-2xl bg-primary-soft flex items-center justify-center mx-auto mb-4">
            <Presentation className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-display font-semibold text-lg">No slides published yet</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Uploaded slide files will appear here when your teacher publishes them.
          </p>
        </Card>
      )}

      {/* ── ASSIGNMENTS TAB ── */}
      {activeTab === "assignments" && (
        <Card className="p-12 text-center shadow-card border-border/60">
          <div className="h-14 w-14 rounded-2xl bg-primary-soft flex items-center justify-center mx-auto mb-4">
            <ClipboardList className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-display font-semibold text-lg">No assignments published yet</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Active worksheets and tasks will appear here when teachers publish them.
          </p>
        </Card>
      )}

      {/* Video Player Dialog */}
      <Dialog open={!!active} onOpenChange={(open) => !open && setActive(null)}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden">
          <DialogTitle className="sr-only">{active?.title}</DialogTitle>
          {active && (
            <>
              <div className="aspect-video bg-black">
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${active.youtube_id}?autoplay=1`}
                  title={active.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="p-5">
                <h3 className="font-display font-semibold text-lg">{active.title}</h3>
                {active.description && (
                  <p className="text-sm text-muted-foreground mt-1">{active.description}</p>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default StudentCourses;
