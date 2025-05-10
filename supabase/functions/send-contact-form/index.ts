import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    // Validate Resend API key
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "re_Rd7RQJcH_NAcieG7itN95tK4Cv2zUR314";
    
    if (!RESEND_API_KEY) {
      console.error("Resend API key not configured");
      return new Response(
        JSON.stringify({ success: false, error: "Email service not properly configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Parse request body
    let { name, email, subject, message } = await req.json();
    
    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Default subject if not provided
    subject = subject || 'פנייה מטופס יצירת קשר';

    // Store in support_tickets table first (this is more likely to succeed)
    let ticketId = null;
    try {
      const { data: ticket, error: ticketError } = await supabaseAdmin
        .from('support_tickets')
        .insert([{
          subject: subject,
          description: message,
          email: email,
          status: 'open',
          priority: 'medium'
        }])
        .select()
        .single();

      if (ticketError) {
        console.error('Error storing support ticket:', ticketError);
      } else {
        ticketId = ticket?.id;
        console.log('Support ticket created with ID:', ticketId);
      }
    } catch (storeError) {
      console.error('Exception storing ticket:', storeError);
    }

    // Try sending email via Resend
    let emailSent = false;
    let emailError = null;

    try {
      // Use domain email with the domain you've verified with Resend
      // Note: Replace this with your actual verified domain in production
      const fromEmail = "contact@mystar.co.il";
      
      // Send email via Resend API
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: fromEmail,
          to: "support@mystar.co.il", // This must be a verified domain in production
          subject: `פנייה חדשה: ${subject || 'פנייה מטופס יצירת קשר'}`,
          html: `
            <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
              <h1 style="color: #0284c7; text-align: center;">פנייה חדשה התקבלה</h1>
              <div style="margin-top: 20px;">
                <p><strong>שם:</strong> ${name}</p>
                <p><strong>אימייל:</strong> ${email}</p>
                <p><strong>נושא:</strong> ${subject || 'פנייה מטופס יצירת קשר'}</p>
                <p><strong>הודעה:</strong></p>
                <div style="background-color: #f9fafb; padding: 15px; border-radius: 5px; margin-top: 10px;">
                  ${message.replace(/\n/g, '<br>')}
                </div>
              </div>
              <div style="margin-top: 30px; font-size: 14px; color: #6b7280;">
                <p>הודעה זו נשלחה מטופס יצירת הקשר באתר MyStar.</p>
                ${ticketId ? `<p>מזהה פנייה: ${ticketId}</p>` : ''}
              </div>
            </div>
          `,
          reply_to: email
        })
      });

      const resendData = await response.json();
      
      if (!response.ok) {
        console.error('Resend API error:', {
          status: response.status,
          statusText: response.statusText,
          error: resendData
        });
        
        emailError = resendData.message || 'Failed to send email';
      } else {
        emailSent = true;
        console.log('Email sent successfully:', resendData);
      }
    } catch (emailErr) {
      console.error('Exception sending email:', emailErr);
      emailError = emailErr.message || 'Exception while sending email';
    }

    // If both the ticket was created and email was sent, return success
    if (ticketId && emailSent) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "הפנייה נשלחה בהצלחה",
          ticketId: ticketId,
          emailSent: true
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // If the ticket was created but email failed, return partial success
    if (ticketId) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "הפנייה נשמרה במערכת, אך שליחת האימייל נכשלה",
          ticketId: ticketId,
          emailSent: false,
          emailError: emailError
        }),
        { status: 207, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // If both failed, return error
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: "Failed to process your request",
        details: emailError
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error('Error in send-contact-form function:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: "An unexpected error occurred",
        details: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
