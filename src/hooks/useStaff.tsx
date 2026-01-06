import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface StaffMember {
  id: string;
  email: string;
  name: string | null;
  role: 'employee' | 'admin';
}

export function useStaff() {
  return useQuery({
    queryKey: ['staff'],
    queryFn: async () => {
      // Fetch users who have employee or admin roles
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('role', ['employee', 'admin']);

      if (roleError) throw roleError;

      if (!roleData || roleData.length === 0) return [];

      const userIds = roleData.map(r => r.user_id);

      // Fetch profiles for these users
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, name')
        .in('id', userIds);

      if (profileError) throw profileError;

      // Combine data
      return (profiles || []).map(profile => {
        const userRole = roleData.find(r => r.user_id === profile.id);
        return {
          id: profile.id,
          email: profile.email,
          name: profile.name,
          role: userRole?.role as 'employee' | 'admin'
        };
      });
    }
  });
}

// Category to default assignee mapping (can be expanded)
export const CATEGORY_STAFF_MAPPING: Record<string, string[]> = {
  'IT': [],
  'HR': [],
  'Infrastructure': [],
  'Academic': [],
  'Finance': [],
  'Administration': [],
  'Other': []
};

export function getAutoAssignee(
  category: string, 
  priority: string, 
  staffList: StaffMember[]
): string | null {
  if (!staffList || staffList.length === 0) return null;

  // Priority-based: High priority goes to admins first
  if (priority === 'high') {
    const admins = staffList.filter(s => s.role === 'admin');
    if (admins.length > 0) {
      return admins[Math.floor(Math.random() * admins.length)].id;
    }
  }

  // Default: Round-robin to any available staff
  return staffList[Math.floor(Math.random() * staffList.length)].id;
}
