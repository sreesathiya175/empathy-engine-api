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
import { useStaff, getAutoAssignee } from "@/hooks/useStaff";
import { useAssignGrievance, DbGrievance } from "@/hooks/useGrievances";
import { toast } from "sonner";
import { Loader2, Wand2, UserPlus } from "lucide-react";

interface AssignStaffDialogProps {
  grievance: DbGrievance;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AssignStaffDialog({ grievance, open, onOpenChange }: AssignStaffDialogProps) {
  const { data: staffList, isLoading: staffLoading } = useStaff();
  const assignMutation = useAssignGrievance();
  const [selectedStaff, setSelectedStaff] = useState<string>(grievance.assigned_to || "");

  const handleAutoAssign = () => {
    if (!staffList || staffList.length === 0) {
      toast.error("No staff members available for assignment");
      return;
    }

    const autoAssignee = getAutoAssignee(grievance.category, grievance.priority, staffList);
    if (autoAssignee) {
      setSelectedStaff(autoAssignee);
      toast.info("Staff member auto-selected based on priority and availability");
    }
  };

  const handleAssign = async () => {
    if (!selectedStaff) {
      toast.error("Please select a staff member");
      return;
    }

    try {
      await assignMutation.mutateAsync({ id: grievance.id, assignedTo: selectedStaff });
      toast.success("Grievance assigned successfully");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to assign grievance");
    }
  };

  const handleUnassign = async () => {
    try {
      await assignMutation.mutateAsync({ id: grievance.id, assignedTo: null });
      setSelectedStaff("");
      toast.success("Grievance unassigned");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to unassign grievance");
    }
  };

  const selectedStaffMember = staffList?.find(s => s.id === selectedStaff);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Assign Staff Member
          </DialogTitle>
          <DialogDescription>
            Assign a staff member to handle grievance <span className="font-mono text-primary">{grievance.ticket_id}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Category: {grievance.category}</label>
            <p className="text-xs text-muted-foreground">Priority: {grievance.priority.toUpperCase()}</p>
          </div>

          <div className="flex gap-2">
            <Select value={selectedStaff} onValueChange={setSelectedStaff}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select staff member..." />
              </SelectTrigger>
              <SelectContent>
                {staffLoading ? (
                  <div className="flex items-center justify-center p-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : staffList && staffList.length > 0 ? (
                  staffList.map((staff) => (
                    <SelectItem key={staff.id} value={staff.id}>
                      {staff.name || staff.email} ({staff.role})
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-2 text-sm text-muted-foreground">
                    No staff members found
                  </div>
                )}
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              size="icon"
              onClick={handleAutoAssign}
              title="Auto-assign based on category and priority"
            >
              <Wand2 className="h-4 w-4" />
            </Button>
          </div>

          {selectedStaffMember && (
            <div className="rounded-lg border border-border bg-muted/50 p-3">
              <p className="text-sm font-medium">{selectedStaffMember.name || 'No name'}</p>
              <p className="text-xs text-muted-foreground">{selectedStaffMember.email}</p>
              <p className="text-xs text-muted-foreground capitalize">Role: {selectedStaffMember.role}</p>
            </div>
          )}
        </div>

        <div className="flex gap-2 justify-end">
          {grievance.assigned_to && (
            <Button 
              variant="outline" 
              onClick={handleUnassign}
              disabled={assignMutation.isPending}
            >
              Unassign
            </Button>
          )}
          <Button 
            onClick={handleAssign}
            disabled={!selectedStaff || assignMutation.isPending}
          >
            {assignMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Assign
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
