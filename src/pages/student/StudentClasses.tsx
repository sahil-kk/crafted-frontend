import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Video, Search, PlayCircle } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useAppData } from "@/hooks/useAppData";

const StudentClasses = () => {
  const { recordedClasses } = useAppData();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<any | null>(null);
  const items = [...recordedClasses].sort((a, b) => b.created_at.localeCompare(a.created_at));

  const filtered = items.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.description.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <DashboardLayout role="student">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold">Recorded Classes</h2>
          <p className="text-muted-foreground mt-1">Re-watch lessons anytime, anywhere</p>
        </div>
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search lessons..." className="pl-9" />
        </div>
      </div>

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
                <div className="aspect-video relative bg-secondary overflow-hidden">
                  <img
                    src={`https://i.ytimg.com/vi/${item.youtube_id}/hqdefault.jpg`}
                    alt={item.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-smooth"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-smooth flex items-center justify-center">
                    <PlayCircle className="h-12 w-12 text-white drop-shadow-lg" />
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-medium line-clamp-2">{item.title}</h3>
                  {item.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</p>}
                </div>
              </Card>
            </button>
          ))}
        </div>
      )}

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
                {active.description && <p className="text-sm text-muted-foreground mt-1">{active.description}</p>}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default StudentClasses;
