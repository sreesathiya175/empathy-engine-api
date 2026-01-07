import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
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

const handler = async (req: Request): Promise<Response> => {
  console.log("Received notification request");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: NotificationRequest = await req.json();
    console.log("Notification payload:", JSON.stringify(payload));

    const { type, grievanceTitle, ticketId, recipientEmail, recipientName, assignedByName, newStatus, oldStatus } = payload;

    let subject: string;
    let htmlContent: string;

    if (type === "assignment") {
      subject = `🎫 New Grievance Assigned: ${ticketId}`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">📋 Grievance Assigned to You</h1>
          </div>
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
            <p style="font-size: 16px; color: #333;">Hello ${recipientName || 'Staff Member'},</p>
            <p style="font-size: 16px; color: #555;">A new grievance has been assigned to you${assignedByName ? ` by ${assignedByName}` : ''}:</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0;">
              <p style="margin: 0 0 10px 0;"><strong>Ticket ID:</strong> ${ticketId}</p>
              <p style="margin: 0;"><strong>Title:</strong> ${grievanceTitle}</p>
            </div>
            
            <p style="font-size: 16px; color: #555;">Please review and take appropriate action at your earliest convenience.</p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef;">
              <p style="font-size: 14px; color: #888; margin: 0;">This is an automated notification from the Grievance Management System.</p>
            </div>
          </div>
        </div>
      `;
    } else {
      subject = `🔄 Grievance Status Updated: ${ticketId}`;
      const statusEmoji = newStatus === 'resolved' ? '✅' : newStatus === 'in_progress' ? '🔄' : '⏳';
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); padding: 30px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">${statusEmoji} Grievance Status Updated</h1>
          </div>
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
            <p style="font-size: 16px; color: #333;">Hello ${recipientName || 'User'},</p>
            <p style="font-size: 16px; color: #555;">The status of your grievance has been updated:</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #11998e; margin: 20px 0;">
              <p style="margin: 0 0 10px 0;"><strong>Ticket ID:</strong> ${ticketId}</p>
              <p style="margin: 0 0 10px 0;"><strong>Title:</strong> ${grievanceTitle}</p>
              <p style="margin: 0 0 10px 0;"><strong>Previous Status:</strong> <span style="color: #888;">${oldStatus?.replace('_', ' ').toUpperCase()}</span></p>
              <p style="margin: 0;"><strong>New Status:</strong> <span style="color: #11998e; font-weight: bold;">${newStatus?.replace('_', ' ').toUpperCase()}</span></p>
            </div>
            
            ${newStatus === 'resolved' ? '<p style="font-size: 16px; color: #555;">🎉 Your grievance has been resolved! Thank you for your patience.</p>' : '<p style="font-size: 16px; color: #555;">We will continue to work on your grievance and keep you updated.</p>'}
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef;">
              <p style="font-size: 14px; color: #888; margin: 0;">This is an automated notification from the Grievance Management System.</p>
            </div>
          </div>
        </div>
      `;
    }

    console.log("Sending email to:", recipientEmail);

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "GrievEase <onboarding@resend.dev>",
        to: [recipientEmail],
        subject: subject,
        html: htmlContent,
      }),
    });

    const emailData = await emailResponse.json();
    
    if (!emailResponse.ok) {
      console.error("Email send failed:", emailData);
      throw new Error(emailData.message || "Failed to send email");
    }

    console.log("Email sent successfully:", emailData);

    return new Response(JSON.stringify({ success: true, data: emailData }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-grievance-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
