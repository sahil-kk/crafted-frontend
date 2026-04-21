import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

const schema = z.object({
  identifier: z.string().trim().min(3, "At least 3 characters").max(255),
  password: z.string().min(6, "At least 6 characters").max(72),
});

interface Props {
  role: "student" | "teacher" | "admin";
  title: string;
  subtitle: string;
  redirectPath: string;
  showBackToStudent?: boolean;
}

export const LoginShell = ({ role, title, subtitle, redirectPath, showBackToStudent }: Props) => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ identifier, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }

    setIsLoggingIn(true);
    try {
      await signIn(role, identifier, password);
      toast.success("Login successful");
      navigate(redirectPath, { replace: true });
    } catch (error: any) {
      toast.error(error.message || "Failed to log in");
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-soft">
      {/* Left: branding */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-gradient-primary p-12 flex-col justify-between text-primary-foreground">
        <div className="flex items-center gap-2.5">
          <img src="/logo.svg" alt="Crafted" className="h-16 w-auto max-w-[200px] object-contain bg-white rounded-2xl shadow-elevated p-3 pl-4 pr-4" />
        </div>
        <div className="space-y-6 max-w-md">
          <h1 className="font-display text-5xl font-bold leading-[1.05] text-balance">
            Learn smarter. Grow faster.
          </h1>
          <p className="text-lg text-primary-foreground/90 leading-relaxed">
            One platform for live classes, recorded sessions, online exams and progress tracking — built for serious learners.
          </p>
          <div className="grid grid-cols-3 gap-4 pt-4">
            {[
              { k: "10k+", v: "Students" },
              { k: "500+", v: "Courses" },
              { k: "98%", v: "Pass rate" },
            ].map((s) => (
              <div key={s.v} className="bg-white/10 backdrop-blur rounded-xl p-4">
                <div className="font-display text-2xl font-bold">{s.k}</div>
                <div className="text-xs text-primary-foreground/80 mt-0.5">{s.v}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="text-sm text-primary-foreground/70">
          © {new Date().getFullYear()} Crafted. All rights reserved.
        </div>
        {/* decorative */}
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      </div>

      {/* Right: form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md animate-fade-in">
          <div className="lg:hidden flex items-center mt-2 mb-8 justify-center">
            <img src="/logo.svg" alt="Crafted" className="max-h-12 w-auto object-contain" />
          </div>

          <Card className="p-8 shadow-card border-border/60">
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 text-xs font-medium px-2.5 py-1 rounded-full bg-primary-soft text-primary mb-3">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                {role === "student" ? "Student portal" : role === "teacher" ? "Teacher portal" : "Admin portal"}
              </div>
              <h2 className="font-display text-2xl font-bold">{title}</h2>
              <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>

            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="identifier">
                  {role === "student" ? "Student ID" : role === "teacher" ? "Username" : "Admin Username"}
                </Label>
                <Input
                  id="identifier"
                  type="text"
                  placeholder={role === "student" ? "e.g. STU123" : "e.g. admin"}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>
              <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isLoggingIn}>
                {isLoggingIn ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            {role === "student" && (
              <p className="text-xs text-muted-foreground text-center mt-6">
                Don't have an account? Ask your institute admin to create one.
              </p>
            )}
            {showBackToStudent && (
              <p className="text-xs text-muted-foreground text-center mt-6">
                <Link to="/" className="text-primary hover:underline font-medium">← Back to student login</Link>
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
