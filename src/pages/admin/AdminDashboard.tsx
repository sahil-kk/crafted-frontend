import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Users, GraduationCap, BookOpen, ClipboardList, Video, Calendar } from "lucide-react";
import { useAppData } from "@/hooks/useAppData";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

const AdminDashboard = () => {
  const { users, courses, exams, classes, timetables, results } = useAppData();
  const counts = {
    students: users.filter((user) => user.role === "student").length,
    teachers: users.filter((user) => user.role === "teacher").length,
    courses: courses?.length || 0,
    exams: exams?.length || 0,
    classes: classes?.length || 0,
    timetables: timetables?.length || 0,
    results: results?.length || 0,
  };

  const stats = [
    { label: "Students", value: counts.students, icon: Users },
    { label: "Teachers", value: counts.teachers, icon: GraduationCap },
    { label: "Video Classes", value: counts.classes, icon: Video },
    { label: "Exams", value: counts.exams, icon: ClipboardList },
  ];

  const distributionData = [
    { name: "Students", value: counts.students, color: "hsl(var(--primary))" },
    { name: "Teachers", value: counts.teachers, color: "hsl(var(--secondary-foreground))" },
  ];

  const activityData = [
    { name: "Exams", count: counts.exams },
    { name: "Videos", count: counts.classes },
    { name: "Scores", count: counts.results },
    { name: "Schedules", count: counts.timetables },
  ];

  return (
    <DashboardLayout role="admin">
      <div className="mb-8">
        <h2 className="font-display text-3xl font-bold">Admin overview</h2>
        <p className="text-muted-foreground mt-1">Monitor live platform metrics intelligently in real-time.</p>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-5 shadow-card hover:shadow-elevated transition-smooth border-border/60">
            <div className="h-10 w-10 rounded-xl bg-primary-soft flex items-center justify-center mb-3">
              <stat.icon className="h-5 w-5 text-primary" />
            </div>
            <div className="font-display text-3xl font-bold">{stat.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 shadow-card border-border/60">
          <h3 className="font-display font-semibold mb-6">User Distribution</h3>
          {counts.students === 0 && counts.teachers === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground">No users registered yet</div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={distributionData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}>
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-6 mt-2">
                {distributionData.map(d => (
                  <div key={d.name} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }}></div>
                    {d.name} ({d.value})
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        <Card className="p-6 shadow-card border-border/60">
          <h3 className="font-display font-semibold mb-6">Platform Activity Tracker</h3>
          <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                 <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                 <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                 <RechartsTooltip cursor={{ fill: "hsl(var(--secondary))" }} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                 <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
               </BarChart>
             </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
