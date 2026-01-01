import { Badge } from "@/components/ui/badge";
import { type GrievanceStatus } from "@/types/grievance";
import { Clock, Loader2, CheckCircle2 } from "lucide-react";

interface StatusBadgeProps {
  status: GrievanceStatus;
  showIcon?: boolean;
}

const statusConfig: Record<GrievanceStatus, { 
  label: string; 
  variant: "status-pending" | "status-progress" | "status-resolved";
  icon: typeof Clock;
}> = {
  pending: { 
    label: "Pending", 
    variant: "status-pending",
    icon: Clock
  },
  in_progress: { 
    label: "In Progress", 
    variant: "status-progress",
    icon: Loader2
  },
  resolved: { 
    label: "Resolved", 
    variant: "status-resolved",
    icon: CheckCircle2
  },
};

export function StatusBadge({ status, showIcon = true }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="gap-1">
      {showIcon && <Icon className={`h-3 w-3 ${status === 'in_progress' ? 'animate-spin' : ''}`} />}
      {config.label}
    </Badge>
  );
}
