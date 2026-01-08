import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface GrievanceComment {
  id: string;
  grievance_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export function useGrievanceComments(grievanceId: string) {
  return useQuery({
    queryKey: ['grievance-comments', grievanceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('grievance_comments')
        .select('*')
        .eq('grievance_id', grievanceId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as GrievanceComment[];
    },
    enabled: !!grievanceId
  });
}

export function useAddComment() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ grievanceId, content }: { grievanceId: string; content: string }) => {
      if (!user) throw new Error('User must be logged in');

      const { data, error } = await supabase
        .from('grievance_comments')
        .insert({
          grievance_id: grievanceId,
          user_id: user.id,
          content
        })
        .select()
        .single();

      if (error) throw error;
      return data as GrievanceComment;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['grievance-comments', variables.grievanceId] });
    }
  });
}
