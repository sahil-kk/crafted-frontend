import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CalendarDays } from "lucide-react";
import { useAppData, TimetableObj } from "@/hooks/useAppData";
import { useAuth } from "@/hooks/useAuth";

const StudentTimetable = () => {
  const { timetables } = useAppData();
  const { user } = useAuth();

  // Filter timetables: show entries mapped to THIS student or GLOBAL (undefined/null studentId)
  const mySchedule = (timetables || []).filter((t: TimetableObj) => {
    return !t.studentId || t.studentId === user?.id;
  });

  return (
    <DashboardLayout role="student">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold">My Timetable</h2>
        <p className="text-muted-foreground mt-1">Your weekly personal schedule</p>
      </div>

      <Card className="p-4 shadow-card border-border/60">
        {mySchedule.length === 0 ? (
          <div className="py-16 text-center">
            <div className="h-14 w-14 rounded-2xl bg-primary-soft flex items-center justify-center mx-auto mb-3">
              <CalendarDays className="h-6 w-6 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">No classes scheduled yet.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Day</TableHead>
                <TableHead>Time Block</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead className="text-right">Instructor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mySchedule.map((t: TimetableObj) => (
                <TableRow key={t._id || t.id}>
                  <TableCell className="font-medium text-primary">{t.day}</TableCell>
                  <TableCell>{t.time}</TableCell>
                  <TableCell>{t.subject}</TableCell>
                  <TableCell className="text-right">{t.teacher}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </DashboardLayout>
  );
};

export default StudentTimetable;
