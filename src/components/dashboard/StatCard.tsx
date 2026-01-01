import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  description?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  variant?: "default" | "primary" | "warning" | "success" | "danger";
}

const variantStyles = {
  default: "bg-card",
  primary: "bg-primary/5 border-primary/20",
  warning: "bg-status-pending/10 border-status-pending/20",
  success: "bg-status-resolved/10 border-status-resolved/20",
  danger: "bg-destructive/10 border-destructive/20",
};

const iconVariantStyles = {
  default: "bg-muted text-muted-foreground",
  primary: "bg-primary/10 text-primary",
  warning: "bg-status-pending/20 text-status-pending",
  success: "bg-status-resolved/20 text-status-resolved",
  danger: "bg-destructive/20 text-destructive",
};

export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  description, 
  variant = "default" 
}: StatCardProps) {
  return (
    <Card className={cn("transition-all duration-200 hover:shadow-md", variantStyles[variant])}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-display font-bold">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          <div className={cn("rounded-lg p-3", iconVariantStyles[variant])}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
