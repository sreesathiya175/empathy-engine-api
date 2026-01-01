import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 flex items-center justify-center">
        <div className="container py-16 text-center">
          <div className="mx-auto max-w-md">
            <div className="mb-8">
              <span className="font-display text-9xl font-bold text-primary/20">404</span>
            </div>
            <h1 className="font-display text-3xl font-bold mb-4">Page Not Found</h1>
            <p className="text-muted-foreground mb-8">
              The page you're looking for doesn't exist or has been moved. 
              Let's get you back on track.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/">
                <Button className="gap-2">
                  <Home className="h-4 w-4" />
                  Go to Home
                </Button>
              </Link>
              <Button variant="outline" onClick={() => window.history.back()} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NotFound;
