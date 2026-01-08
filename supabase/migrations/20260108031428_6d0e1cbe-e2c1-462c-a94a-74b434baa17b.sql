-- Add 'closed' value to the grievance_status enum
ALTER TYPE grievance_status ADD VALUE IF NOT EXISTS 'closed';