import { Badge } from "@/components/ui/badge";
import { type PriorityLevel } from "@/types/grievance";
import { AlertTriangle, AlertCircle, CheckCircle } from "lucide-react";

interface PriorityBadgeProps {
  priority: PriorityLevel;
  showIcon?: boolean;
}

const priorityConfig: Record<PriorityLevel, { 
  label: string; 
  variant: "priority-high" | "priority-medium" | "priority-low";
  icon: typeof AlertTriangle;
}> = {
  high: { 
    label: "High Priority", 
    variant: "priority-high",
    icon: AlertTriangle
  },
  medium: { 
    label: "Medium Priority", 
    variant: "priority-medium",
    icon: AlertCircle
  },
  low: { 
    label: "Low Priority", 
    variant: "priority-low",
    icon: CheckCircle
  },
};

export function PriorityBadge({ priority, showIcon = true }: PriorityBadgeProps) {
  const config = priorityConfig[priority];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="gap-1">
      {showIcon && <Icon className="h-3 w-3" />}
      {config.label}
    </Badge>
  );
}
