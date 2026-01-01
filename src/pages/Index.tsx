import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { 
  MessageSquareWarning, 
  Shield, 
  BarChart3, 
  Zap, 
  Users, 
  CheckCircle2,
  ArrowRight,
  Brain
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Sentiment Analysis",
    description: "Automatically analyze grievance text to classify sentiment and assign priority levels instantly."
  },
  {
    icon: Zap,
    title: "Instant Ticket Generation",
    description: "Get a unique ticket ID immediately upon submission for easy tracking and reference."
  },
  {
    icon: BarChart3,
    title: "Real-time Analytics",
    description: "Monitor grievance trends, sentiment distribution, and resolution rates with live dashboards."
  },
  {
    icon: Users,
    title: "Role-Based Access",
    description: "Secure multi-role system for citizens, employees, and administrators with tailored views."
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Your data is protected with enterprise-grade security and privacy controls."
  },
  {
    icon: CheckCircle2,
    title: "Status Tracking",
    description: "Follow your grievance from submission to resolution with real-time status updates."
  }
];

const stats = [
  { value: "10K+", label: "Grievances Resolved" },
  { value: "98%", label: "Satisfaction Rate" },
  { value: "24h", label: "Avg. Response Time" },
  { value: "50+", label: "Organizations" }
];

export default function Index() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-hero py-20 md:py-32">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNCAxNHoiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L2c+PC9zdmc+')] opacity-30" />
          <div className="container relative">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-4 py-1.5 text-sm text-primary-foreground animate-fade-up">
                <Brain className="h-4 w-4" />
                <span>AI-Powered Grievance Resolution</span>
              </div>
              <h1 className="font-display text-4xl font-bold tracking-tight text-primary-foreground md:text-6xl animate-fade-up" style={{ animationDelay: "0.1s" }}>
                Your Voice Matters.
                <br />
                <span className="text-primary-foreground/80">We Listen & Act.</span>
              </h1>
              <p className="mt-6 text-lg text-primary-foreground/70 md:text-xl animate-fade-up" style={{ animationDelay: "0.2s" }}>
                Submit, track, and resolve grievances with our intelligent platform that uses sentiment analysis to prioritize and expedite resolution.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row animate-fade-up" style={{ animationDelay: "0.3s" }}>
                <Link to="/auth">
                  <Button variant="hero" size="xl" className="group">
                    Get Started
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button variant="hero-outline" size="xl" className="text-primary-foreground border-primary-foreground/30 hover:bg-primary-foreground/10">
                    Submit a Grievance
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="border-b border-border bg-card py-12">
          <div className="container">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {stats.map((stat, index) => (
                <div 
                  key={stat.label} 
                  className="text-center animate-fade-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <p className="font-display text-3xl font-bold text-primary md:text-4xl">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 md:py-32">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-display text-3xl font-bold md:text-4xl">
                Intelligent Grievance Management
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Our platform combines AI-powered analysis with streamlined workflows to ensure every concern is heard and addressed efficiently.
              </p>
            </div>
            
            <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div 
                    key={feature.title}
                    className="group rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-lg animate-fade-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-3 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-display text-xl font-semibold">{feature.title}</h3>
                    <p className="mt-2 text-muted-foreground">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="bg-muted/50 py-20 md:py-32">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-display text-3xl font-bold md:text-4xl">
                How It Works
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                From submission to resolution in four simple steps
              </p>
            </div>
            
            <div className="mt-16 grid gap-8 md:grid-cols-4">
              {[
                { step: "1", title: "Submit", description: "Fill out the grievance form with details about your concern" },
                { step: "2", title: "Analyze", description: "Our AI analyzes sentiment and assigns priority automatically" },
                { step: "3", title: "Assign", description: "Grievance is routed to the appropriate department" },
                { step: "4", title: "Resolve", description: "Track progress until your issue is fully resolved" }
              ].map((item, index) => (
                <div 
                  key={item.step}
                  className="relative text-center animate-fade-up"
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary font-display text-xl font-bold text-primary-foreground">
                    {item.step}
                  </div>
                  <h3 className="font-display text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                  {index < 3 && (
                    <div className="absolute right-0 top-6 hidden h-0.5 w-full -translate-x-1/2 bg-border md:block" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-32">
          <div className="container">
            <div className="mx-auto max-w-3xl rounded-3xl bg-gradient-hero p-8 text-center md:p-16">
              <MessageSquareWarning className="mx-auto h-12 w-12 text-primary-foreground/80" />
              <h2 className="mt-6 font-display text-3xl font-bold text-primary-foreground md:text-4xl">
                Ready to Get Started?
              </h2>
              <p className="mt-4 text-lg text-primary-foreground/70">
                Join thousands of users who trust GrievEase for efficient grievance resolution.
              </p>
              <div className="mt-8">
                <Link to="/auth">
                  <Button 
                    size="xl" 
                    className="bg-primary-foreground text-foreground hover:bg-primary-foreground/90"
                  >
                    Create Your Account
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}