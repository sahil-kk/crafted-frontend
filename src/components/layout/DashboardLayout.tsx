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
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarContent className="bg-sidebar">
        <div className={cn("p-4 flex items-center gap-2.5", collapsed && "justify-center px-2")}>
          {collapsed ? (
            <img src="/logo.svg" alt="Crafted" className="w-8 h-8 object-contain" />
          ) : (
            <img src="/logo.svg" alt="Crafted Learning Hub" className="h-10 max-w-[140px] object-contain" />
          )}
        </div>
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground px-3 mt-2">Menu</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu className="gap-1 px-2">
              {items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild className="h-10">
                    <NavLink
                      to={item.url}
                      end={item.url.split("/").length <= 2}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-3 rounded-lg px-3 transition-smooth",
                          isActive
                            ? "bg-primary-soft text-primary font-medium"
                            : "text-sidebar-foreground hover:bg-secondary"
                        )
                      }
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span className="text-sm">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
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
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" />
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
