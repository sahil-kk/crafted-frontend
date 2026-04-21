import { ReactNode } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  GraduationCap, Home, Newspaper, Video, FileText, BarChart3,
  Bell, LogOut, Menu, Users, BookOpen, Megaphone, Settings, ClipboardList, Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarProvider, SidebarTrigger, useSidebar,
} from "@/components/ui/sidebar";
import { useAuth, AppRole } from "@/hooks/useAuth";
import { useAppData } from "@/hooks/useAppData";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface NavItem { title: string; url: string; icon: any; }

const navByRole: Record<AppRole, NavItem[]> = {
  student: [
    { title: "Dashboard", url: "/dashboard", icon: Home },
    { title: "Timetable", url: "/dashboard/timetable", icon: Calendar },
    { title: "News", url: "/dashboard/news", icon: Newspaper },
    { title: "Recorded Classes", url: "/dashboard/classes", icon: Video },
    { title: "Exams", url: "/dashboard/exams", icon: FileText },
    { title: "Results", url: "/dashboard/results", icon: BarChart3 },
  ],
  teacher: [
    { title: "Dashboard", url: "/teacher/dashboard", icon: Home },
    { title: "Timetable", url: "/teacher/timetable", icon: Calendar },
    { title: "Students", url: "/teacher/students", icon: Users },
    { title: "Classes", url: "/teacher/classes", icon: Video },
    { title: "Exams", url: "/teacher/exams", icon: ClipboardList },
    { title: "Results", url: "/teacher/results", icon: BarChart3 },
    { title: "Announcements", url: "/teacher/announcements", icon: Megaphone },
  ],
  admin: [
    { title: "Dashboard", url: "/admin/dashboard", icon: Home },
    { title: "Timetable", url: "/admin/timetable", icon: Calendar },
    { title: "Students", url: "/admin/students", icon: Users },
    { title: "Teachers", url: "/admin/teachers", icon: GraduationCap },
    { title: "Courses", url: "/admin/courses", icon: BookOpen },
    { title: "Exams", url: "/admin/exams", icon: ClipboardList },
    { title: "Results", url: "/admin/results", icon: BarChart3 },
    { title: "Announcements", url: "/admin/announcements", icon: Megaphone },
    { title: "Settings", url: "/admin/settings", icon: Settings },
  ],
};

const AppSidebar = ({ role }: { role: AppRole }) => {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const items = navByRole[role];

  return (
    <Sidebar collapsible="icon" className="border-0 shadow-lg">
      <SidebarContent className="flex flex-col h-full bg-white">

        {/* Logo */}
        <div className={cn(
          "flex items-center border-b",
          collapsed ? "justify-center px-2 py-4" : "px-5 py-4"
        )} style={{ borderBottomColor: "#fe651930" }}>
          {collapsed ? (
            <img src="/favicon.ico" alt="Logo" className="w-10 h-10 object-contain rounded-lg" />
          ) : (
            <img src="/logo.svg" alt="Crafted Learning Hub" className="h-14 max-w-[180px] object-contain" />
          )}
        </div>

        {/* Nav Items */}
        <nav className="flex-1 flex flex-col gap-1 px-3 py-4">
          {items.map((item) => (
            <NavLink
              key={item.url}
              to={item.url}
              end={item.url.split("/").length <= 2}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 group",
                  collapsed && "justify-center px-2",
                  isActive
                    ? "bg-[#fe6519] text-white shadow-md"
                    : "text-[#fe6519]/70 hover:bg-[#fe6519]/10 hover:text-[#fe6519]"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={cn(
                    "shrink-0 transition-all duration-200",
                    collapsed ? "h-5 w-5" : "h-4 w-4",
                    isActive ? "text-white" : "text-[#fe6519]/70 group-hover:text-[#fe6519]"
                  )} />
                  {!collapsed && (
                    <span className="tracking-wide uppercase text-xs">
                      {item.title}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom spacer */}
        <div className="h-4" />
      </SidebarContent>
    </Sidebar>
  );
};

interface DashboardLayoutProps {
  role: AppRole;
  title?: string;
  children: ReactNode;
}

export const DashboardLayout = ({ role, title, children }: DashboardLayoutProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const initials = (user?.email ?? "U").slice(0, 2).toUpperCase();

  const handleSignOut = async () => {
    await signOut();
    if (role === "admin") navigate("/admin");
    else if (role === "teacher") navigate("/teacher");
    else navigate("/");
  };

  const { announcements } = useAppData();
  const hasNews = (announcements || []).length > 0;

  // Bell nav target per role
  const newsUrl = role === "student"
    ? "/dashboard/news"
    : role === "teacher"
    ? "/teacher/announcements"
    : "/admin/announcements";

  // Derive title from path if not given
  const items = navByRole[role];
  const current = items.find((i) => location.pathname === i.url || location.pathname.startsWith(i.url + "/"));
  const heading = title ?? current?.title ?? "Dashboard";

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-secondary/30">
        <AppSidebar role={role} />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-3 min-w-0">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
              <div className="hidden sm:block min-w-0">
                <h1 className="font-display font-semibold text-lg truncate">{heading}</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => navigate(newsUrl)}
                title="Notifications"
              >
                <Bell className="h-4 w-4" />
                {hasNews && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-background" />
                )}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 hover:bg-secondary rounded-lg p-1 pr-3 transition-smooth">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary-soft text-primary text-xs font-semibold">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="hidden md:block text-left">
                      <div className="text-sm font-medium leading-none">{user?.email?.split("@")[0]}</div>
                      <div className="text-xs text-muted-foreground capitalize mt-0.5">{role}</div>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="text-sm font-medium">{user?.email}</div>
                    <div className="text-xs text-muted-foreground capitalize mt-0.5">{role} account</div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                    <LogOut className="h-4 w-4 mr-2" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main className="flex-1 p-4 sm:p-6 lg:p-8 animate-fade-in">
            <div className="max-w-7xl mx-auto w-full">{children}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
