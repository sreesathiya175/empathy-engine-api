import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { generateTicketId, getSentimentFromAnalysis, getPriorityFromSentiment } from "@/types/grievance";

export type DbGrievanceCategory = 'IT' | 'HR' | 'Infrastructure' | 'Academic' | 'Finance' | 'Administration' | 'Other';
export type DbSentimentType = 'highly_negative' | 'negative' | 'neutral' | 'positive';
export type DbPriorityLevel = 'high' | 'medium' | 'low';
export type DbGrievanceStatus = 'pending' | 'in_progress' | 'resolved';

export interface DbGrievance {
  id: string;
  ticket_id: string;
  user_id: string;
  category: DbGrievanceCategory;
  title: string;
  description: string;
  sentiment: DbSentimentType;
  priority: DbPriorityLevel;
  status: DbGrievanceStatus;
  assigned_to: string | null;
  file_url: string | null;
  created_at: string;
  updated_at: string;
}

export function useGrievances() {
  const { user, role } = useAuth();

  return useQuery({
    queryKey: ['grievances', user?.id, role],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('grievances')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as DbGrievance[];
    },
    enabled: !!user
  });
}

export function useMyGrievances() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['my-grievances', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('grievances')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as DbGrievance[];
    },
    enabled: !!user
  });
}

interface CreateGrievanceInput {
  title: string;
  category: DbGrievanceCategory;
  description: string;
  sentiment: DbSentimentType;
  priority: DbPriorityLevel;
  file_url?: string;
}

export function useCreateGrievance() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: CreateGrievanceInput) => {
      if (!user) throw new Error('User must be logged in');

      const ticketId = generateTicketId();

      const { data, error } = await supabase
        .from('grievances')
        .insert({
          ticket_id: ticketId,
          user_id: user.id,
          title: input.title,
          category: input.category,
          description: input.description,
          sentiment: input.sentiment,
          priority: input.priority,
          file_url: input.file_url || null
        })
        .select()
        .single();

      if (error) throw error;
      return data as DbGrievance;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grievances'] });
      queryClient.invalidateQueries({ queryKey: ['my-grievances'] });
    }
  });
}

export function useUpdateGrievanceStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: DbGrievanceStatus }) => {
      const { data, error } = await supabase
        .from('grievances')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as DbGrievance;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grievances'] });
      queryClient.invalidateQueries({ queryKey: ['my-grievances'] });
      queryClient.invalidateQueries({ queryKey: ['assigned-grievances'] });
    }
  });
}

export function useAssignGrievance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, assignedTo }: { id: string; assignedTo: string | null }) => {
      const { data, error } = await supabase
        .from('grievances')
        .update({ assigned_to: assignedTo })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as DbGrievance;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grievances'] });
      queryClient.invalidateQueries({ queryKey: ['my-grievances'] });
      queryClient.invalidateQueries({ queryKey: ['assigned-grievances'] });
    }
  });
}

export function useAssignedGrievances() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['assigned-grievances', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('grievances')
        .select('*')
        .eq('assigned_to', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as DbGrievance[];
    },
    enabled: !!user
  });
}

export function useGrievanceStats() {
  const { data: grievances, isLoading } = useGrievances();

  const stats = {
    total: grievances?.length || 0,
    pending: grievances?.filter(g => g.status === 'pending').length || 0,
    inProgress: grievances?.filter(g => g.status === 'in_progress').length || 0,
    resolved: grievances?.filter(g => g.status === 'resolved').length || 0,
    highPriority: grievances?.filter(g => g.priority === 'high').length || 0
  };

  const sentimentData = [
    { name: "Positive", value: grievances?.filter(g => g.sentiment === 'positive').length || 0, color: "hsl(142, 71%, 45%)" },
    { name: "Neutral", value: grievances?.filter(g => g.sentiment === 'neutral').length || 0, color: "hsl(200, 15%, 50%)" },
    { name: "Negative", value: grievances?.filter(g => g.sentiment === 'negative').length || 0, color: "hsl(38, 92%, 50%)" },
    { name: "Highly Negative", value: grievances?.filter(g => g.sentiment === 'highly_negative').length || 0, color: "hsl(0, 72%, 51%)" }
  ];

  const categoryData = ['IT', 'HR', 'Infrastructure', 'Academic', 'Finance', 'Administration', 'Other'].map(cat => ({
    name: cat,
    count: grievances?.filter(g => g.category === cat).length || 0
  }));

  return { stats, sentimentData, categoryData, isLoading };
}
