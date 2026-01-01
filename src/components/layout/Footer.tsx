import { MessageSquareWarning } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container py-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <MessageSquareWarning className="h-4 w-4" />
            </div>
            <span className="font-display font-semibold">GrievEase</span>
          </div>
          
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} GrievEase. Empowering voices, resolving concerns.
          </p>
          
          <div className="flex gap-4 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
