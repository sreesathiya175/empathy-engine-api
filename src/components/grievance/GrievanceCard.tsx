import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PriorityBadge } from "./PriorityBadge";
import { StatusBadge } from "./StatusBadge";
import { SentimentBadge } from "./SentimentBadge";
import { type Grievance, CATEGORY_ICONS } from "@/types/grievance";
import { Calendar, FileText, User } from "lucide-react";
import { format } from "date-fns";

interface GrievanceCardProps {
  grievance: Grievance;
  onClick?: () => void;
}

export function GrievanceCard({ grievance, onClick }: GrievanceCardProps) {
  return (
    <Card 
      className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 border-border/50"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">{CATEGORY_ICONS[grievance.category]}</span>
            <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
              {grievance.ticket_id}
            </span>
          </div>
          <PriorityBadge priority={grievance.priority} />
        </div>
        <h3 className="font-display font-semibold text-lg leading-tight mt-2 group-hover:text-primary transition-colors">
          {grievance.title}
        </h3>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {grievance.description}
        </p>
        
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={grievance.status} />
          <SentimentBadge sentiment={grievance.sentiment} />
        </div>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {format(new Date(grievance.created_at), "MMM d, yyyy")}
          </div>
          {grievance.file_url && (
            <div className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              Attachment
            </div>
          )}
          {grievance.assigned_to && (
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              Assigned
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
