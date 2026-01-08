import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGrievanceComments, useAddComment } from "@/hooks/useGrievanceComments";
import { DbGrievance } from "@/hooks/useGrievances";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Send, MessageSquare } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface AdminCommentsDialogProps {
  grievance: DbGrievance;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ProfileInfo {
  name: string | null;
  email: string;
}

export function AdminCommentsDialog({ grievance, open, onOpenChange }: AdminCommentsDialogProps) {
  const { data: comments, isLoading } = useGrievanceComments(grievance.id);
  const addComment = useAddComment();
  const [newComment, setNewComment] = useState("");
  const [profiles, setProfiles] = useState<Record<string, ProfileInfo>>({});

  useEffect(() => {
    const fetchProfiles = async () => {
      if (!comments || comments.length === 0) return;
      
      const userIds = [...new Set(comments.map(c => c.user_id))];
      const { data } = await supabase
        .from('profiles')
        .select('id, name, email')
        .in('id', userIds);

      if (data) {
        const profileMap: Record<string, ProfileInfo> = {};
        data.forEach(p => {
          profileMap[p.id] = { name: p.name, email: p.email };
        });
        setProfiles(profileMap);
      }
    };

    fetchProfiles();
  }, [comments]);

  const handleSubmit = async () => {
    if (!newComment.trim()) return;

    try {
      await addComment.mutateAsync({
        grievanceId: grievance.id,
        content: newComment.trim()
      });
      setNewComment("");
      toast({
        title: "Comment Added",
        description: "Your comment has been posted."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add comment.",
        variant: "destructive"
      });
    }
  };

  const getProfileName = (userId: string) => {
    return profiles[userId]?.name || profiles[userId]?.email || "Unknown User";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Comments - {grievance.ticket_id}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Grievance Summary */}
          <div className="p-3 bg-muted rounded-lg">
            <p className="font-medium">{grievance.title}</p>
            <p className="text-sm text-muted-foreground line-clamp-2">{grievance.description}</p>
          </div>

          {/* Comments List */}
          <ScrollArea className="h-[250px] border rounded-lg p-3">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            ) : comments && comments.length > 0 ? (
              <div className="space-y-3">
                {comments.map((comment) => (
                  <div key={comment.id} className="p-3 bg-background border rounded-lg">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-sm">{getProfileName(comment.user_id)}</span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(comment.created_at), "MMM d, yyyy h:mm a")}
                      </span>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <MessageSquare className="h-8 w-8 mb-2 opacity-50" />
                <p>No comments yet</p>
              </div>
            )}
          </ScrollArea>

          {/* Add Comment */}
          <div className="space-y-2">
            <Textarea
              placeholder="Add a comment or remark..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
            />
            <Button 
              onClick={handleSubmit} 
              disabled={!newComment.trim() || addComment.isPending}
              className="w-full"
            >
              <Send className="h-4 w-4 mr-2" />
              {addComment.isPending ? "Posting..." : "Post Comment"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
