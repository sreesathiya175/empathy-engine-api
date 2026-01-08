export type UserRole = 'citizen' | 'employee' | 'admin';

export type GrievanceCategory = 
  | 'IT' 
  | 'HR' 
  | 'Infrastructure' 
  | 'Academic' 
  | 'Finance' 
  | 'Administration' 
  | 'Other';

export type SentimentType = 'highly_negative' | 'negative' | 'neutral' | 'positive';

export type PriorityLevel = 'high' | 'medium' | 'low';

export type GrievanceStatus = 'pending' | 'in_progress' | 'resolved' | 'closed';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
}

export interface Grievance {
  id: string;
  ticket_id: string;
  user_id: string;
  category: GrievanceCategory;
  title: string;
  description: string;
  sentiment: SentimentType;
  priority: PriorityLevel;
  status: GrievanceStatus;
  assigned_to?: string;
  file_url?: string;
  created_at: string;
  updated_at: string;
}

export interface GrievanceComment {
  id: string;
  grievance_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export interface DashboardStats {
  total: number;
  pending: number;
  in_progress: number;
  resolved: number;
  high_priority: number;
  medium_priority: number;
  low_priority: number;
  by_category: Record<GrievanceCategory, number>;
  by_sentiment: Record<SentimentType, number>;
}

export const CATEGORIES: GrievanceCategory[] = [
  'IT',
  'HR',
  'Infrastructure',
  'Academic',
  'Finance',
  'Administration',
  'Other'
];

export const CATEGORY_ICONS: Record<GrievanceCategory, string> = {
  IT: '💻',
  HR: '👥',
  Infrastructure: '🏗️',
  Academic: '📚',
  Finance: '💰',
  Administration: '📋',
  Other: '📝'
};

export function getSentimentFromAnalysis(score: number): SentimentType {
  if (score < -0.5) return 'highly_negative';
  if (score < 0) return 'negative';
  if (score < 0.5) return 'neutral';
  return 'positive';
}

export function getPriorityFromSentiment(sentiment: SentimentType): PriorityLevel {
  switch (sentiment) {
    case 'highly_negative':
      return 'high';
    case 'negative':
      return 'medium';
    default:
      return 'low';
  }
}

export function generateTicketId(): string {
  const prefix = 'GRV';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}
