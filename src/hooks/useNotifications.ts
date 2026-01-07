import { supabase } from "@/integrations/supabase/client";

interface NotificationPayload {
  type: "assignment" | "status_change";
  grievanceId: string;
  grievanceTitle: string;
  ticketId: string;
  recipientEmail: string;
  recipientName?: string;
  assignedByName?: string;
  newStatus?: string;
  oldStatus?: string;
}

export async function sendGrievanceNotification(payload: NotificationPayload): Promise<boolean> {
  try {
    console.log("Sending notification:", payload);
    
    const { data, error } = await supabase.functions.invoke('send-grievance-notification', {
      body: payload
    });

    if (error) {
      console.error("Failed to send notification:", error);
      return false;
    }

    console.log("Notification sent successfully:", data);
    return true;
  } catch (error) {
    console.error("Error sending notification:", error);
    return false;
  }
}

export async function notifyAssignment(
  grievanceId: string,
  grievanceTitle: string,
  ticketId: string,
  assignedToId: string,
  assignedByName?: string
): Promise<boolean> {
  try {
    // Fetch the assigned staff's profile
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('email, name')
      .eq('id', assignedToId)
      .single();

    if (error || !profile) {
      console.error("Could not find staff profile:", error);
      return false;
    }

    return sendGrievanceNotification({
      type: "assignment",
      grievanceId,
      grievanceTitle,
      ticketId,
      recipientEmail: profile.email,
      recipientName: profile.name || undefined,
      assignedByName
    });
  } catch (error) {
    console.error("Error in notifyAssignment:", error);
    return false;
  }
}

export async function notifyStatusChange(
  grievanceId: string,
  grievanceTitle: string,
  ticketId: string,
  userId: string,
  oldStatus: string,
  newStatus: string
): Promise<boolean> {
  try {
    // Fetch the grievance owner's profile
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('email, name')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      console.error("Could not find user profile:", error);
      return false;
    }

    return sendGrievanceNotification({
      type: "status_change",
      grievanceId,
      grievanceTitle,
      ticketId,
      recipientEmail: profile.email,
      recipientName: profile.name || undefined,
      oldStatus,
      newStatus
    });
  } catch (error) {
    console.error("Error in notifyStatusChange:", error);
    return false;
  }
}
