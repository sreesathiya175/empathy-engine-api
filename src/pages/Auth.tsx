import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquareWarning, Mail, Lock, User, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { type UserRole } from "@/types/grievance";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>("citizen");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate authentication - will be replaced with real auth
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: isLogin ? "Welcome back!" : "Account created!",
        description: isLogin 
          ? "You have successfully logged in." 
          : "Your account has been created. You can now submit grievances.",
      });
      navigate("/dashboard");
    }, 1500);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNCAxNHoiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L2c+PC9zdmc+')] opacity-30" />
        <div className="relative z-10 flex flex-col justify-center p-12">
          <Link to="/" className="mb-auto inline-flex items-center gap-2 text-primary-foreground/70 hover:text-primary-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          
          <div className="my-auto">
            <div className="flex items-center gap-3 mb-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-foreground/10 text-primary-foreground">
                <MessageSquareWarning className="h-7 w-7" />
              </div>
              <span className="font-display text-3xl font-bold text-primary-foreground">GrievEase</span>
            </div>
            
            <h1 className="font-display text-4xl font-bold text-primary-foreground leading-tight">
              Empowering Voices,
              <br />
              <span className="text-primary-foreground/70">Resolving Concerns</span>
            </h1>
            
            <p className="mt-6 text-lg text-primary-foreground/60 max-w-md">
              Join our platform to submit, track, and resolve grievances with AI-powered sentiment analysis for faster resolution.
            </p>
            
            <div className="mt-12 grid grid-cols-2 gap-6">
              {[
                { label: "Quick Submission", desc: "Submit in minutes" },
                { label: "AI Analysis", desc: "Smart prioritization" },
                { label: "Real-time Tracking", desc: "Stay informed" },
                { label: "Fast Resolution", desc: "Efficient process" }
              ].map((item) => (
                <div key={item.label} className="rounded-lg bg-primary-foreground/5 p-4">
                  <p className="font-medium text-primary-foreground">{item.label}</p>
                  <p className="text-sm text-primary-foreground/60">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center">
            <Link to="/" className="inline-flex items-center gap-2 mb-4 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
            <div className="flex items-center justify-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <MessageSquareWarning className="h-5 w-5" />
              </div>
              <span className="font-display text-2xl font-bold">GrievEase</span>
            </div>
          </div>

          <Card className="border-border/50 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="font-display text-2xl">
                {isLogin ? "Welcome Back" : "Create Account"}
              </CardTitle>
              <CardDescription>
                {isLogin 
                  ? "Enter your credentials to access your account" 
                  : "Fill in your details to get started"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="name"
                          placeholder="John Doe"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="citizen">Citizen</SelectItem>
                          <SelectItem value="employee">Employee</SelectItem>
                          <SelectItem value="admin">Administrator</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      {isLogin ? "Signing in..." : "Creating account..."}
                    </span>
                  ) : (
                    isLogin ? "Sign In" : "Create Account"
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  {isLogin ? "Don't have an account?" : "Already have an account?"}
                  <button
                    type="button"
                    onClick={() => setIsLogin(!isLogin)}
                    className="ml-1 font-medium text-primary hover:underline"
                  >
                    {isLogin ? "Sign up" : "Sign in"}
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}