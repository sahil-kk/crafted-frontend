import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Clock, Calendar, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { useAppData } from "@/hooks/useAppData";

const StudentExams = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { exams, attempts } = useAppData();
  const attemptedIds = new Set(
    attempts
      .filter((attempt) => attempt.student_id === user?.id && attempt.status === "submitted")
      .map((attempt) => attempt.exam_id),
  );
  const rows = [...exams].sort((a, b) => (a.starts_at ?? "").localeCompare(b.starts_at ?? ""));

  return (
    <DashboardLayout role="student">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold">Exams</h2>
        <p className="text-muted-foreground mt-1">Your upcoming and completed assessments</p>
      </div>

      {rows.length === 0 ? (
        <Card className="p-12 text-center shadow-card border-border/60">
          <div className="h-14 w-14 rounded-2xl bg-primary-soft flex items-center justify-center mx-auto mb-4">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-display font-semibold text-lg">No exams scheduled</h3>
          <p className="text-sm text-muted-foreground mt-1">Your teachers will publish exams here.</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {rows.map((exam) => {
            const attempted = attemptedIds.has(exam.id);
            return (
              <Card key={exam.id} className="p-6 shadow-card hover:shadow-elevated transition-smooth border-border/60">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="h-11 w-11 rounded-xl bg-primary-soft flex items-center justify-center shrink-0">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <Badge variant="secondary" className="bg-secondary text-foreground/70 border-0 capitalize">{exam.exam_type}</Badge>
                </div>
                <h3 className="font-display font-semibold text-lg">{exam.title}</h3>
                {exam.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{exam.description}</p>}
                <div className="flex items-center gap-4 text-xs text-muted-foreground mt-4">
                  <div className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {exam.duration_minutes} min</div>
                  {exam.starts_at && (
                    <div className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {format(new Date(exam.starts_at), "MMM d, p")}</div>
                  )}
                </div>
                <div className="mt-5 space-y-2">
                  {exam.pdf && (
                      <Button variant="outline" className="w-full" onClick={() => window.open(`${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '')}/uploads/${exam.pdf}`, '_blank')}>
                        <FileText className="h-4 w-4 mr-2" /> View Question Paper
                      </Button>
                  )}
                  {attempted ? (
                    <Button variant="soft" className="w-full" disabled>
                      <CheckCircle2 className="h-4 w-4 mr-2" /> Attempted
                    </Button>
                  ) : (
                    <Button variant="hero" className="w-full" onClick={() => navigate(`/dashboard/exams/${exam.id}`)}>
                      Start interactive exam
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
};

export default StudentExams;
