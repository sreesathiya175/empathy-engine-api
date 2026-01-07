import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PriorityBadge } from "./PriorityBadge";
import { StatusBadge } from "./StatusBadge";
import { SentimentBadge } from "./SentimentBadge";
import { AssignStaffDialog } from "./AssignStaffDialog";
import { useUpdateGrievanceStatus, DbGrievance, DbGrievanceStatus } from "@/hooks/useGrievances";
import { useStaff } from "@/hooks/useStaff";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { format } from "date-fns";
import { 
  Calendar, 
  User, 
  Loader2, 
  UserPlus,
  FileText,
  Tag
} from "lucide-react";
import { CATEGORY_ICONS } from "@/types/grievance";

interface GrievanceDetailDialogProps {
  grievance: DbGrievance;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GrievanceDetailDialog({ grievance, open, onOpenChange }: GrievanceDetailDialogProps) {
  const { role } = useAuth();
  const { data: staffList } = useStaff();
  const updateStatusMutation = useUpdateGrievanceStatus();
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);

  const isStaff = role === 'employee' || role === 'admin';
  const assignedStaff = staffList?.find(s => s.id === grievance.assigned_to);

  const handleStatusChange = async (newStatus: DbGrievanceStatus) => {
    try {
      await updateStatusMutation.mutateAsync({ id: grievance.id, status: newStatus, grievance });
      toast.success(`Status updated to ${newStatus.replace('_', ' ')}. Notification sent to user.`);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-2xl">{CATEGORY_ICONS[grievance.category as keyof typeof CATEGORY_ICONS]}</span>
              {grievance.title}
            </DialogTitle>
            <DialogDescription className="font-mono">
              {grievance.ticket_id}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Status Badges */}
            <div className="flex flex-wrap gap-2">
              <StatusBadge status={grievance.status} />
              <PriorityBadge priority={grievance.priority} />
              <SentimentBadge sentiment={grievance.sentiment} />
            </div>

            {/* Meta Info */}
            <div className="grid gap-3 sm:grid-cols-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Tag className="h-4 w-4" />
                <span>Category: {grievance.category}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Submitted: {format(new Date(grievance.created_at), 'PPP')}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="h-4 w-4" />
                <span>
                  Assigned to: {assignedStaff ? (assignedStaff.name || assignedStaff.email) : 'Unassigned'}
                </span>
              </div>
              {grievance.file_url && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <a href={grievance.file_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    View Attachment
                  </a>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h4 className="font-medium">Description</h4>
              <p className="text-muted-foreground whitespace-pre-wrap bg-muted/50 p-4 rounded-lg">
                {grievance.description}
              </p>
            </div>

            {/* Staff Actions */}
            {isStaff && (
              <div className="border-t border-border pt-4 space-y-4">
                <h4 className="font-medium">Staff Actions</h4>
                
                <div className="flex flex-wrap gap-4">
                  {/* Status Update */}
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Update Status</label>
                    <Select 
                      value={grievance.status} 
                      onValueChange={(val) => handleStatusChange(val as DbGrievanceStatus)}
                      disabled={updateStatusMutation.isPending}
                    >
                      <SelectTrigger className="w-[160px]">
                        {updateStatusMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <SelectValue />
                        )}
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Assign Button (Admin only) */}
                  {role === 'admin' && (
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">Assignment</label>
                      <Button 
                        variant="outline" 
                        onClick={() => setAssignDialogOpen(true)}
                        className="gap-2"
                      >
                        <UserPlus className="h-4 w-4" />
                        {grievance.assigned_to ? 'Reassign' : 'Assign Staff'}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AssignStaffDialog 
        grievance={grievance}
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
      />
    </>
  );
}
