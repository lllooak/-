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
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Get user session
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: "No authorization header" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      console.error('Authentication error:', authError);
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Parse request body
    const { to, subject, template, data } = await req.json();

    if (!to || !subject || !template) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required parameters" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Get email template from database
    const { data: templateData, error: templateError } = await supabaseClient
      .from('email_templates')
      .select('*')
      .eq('name', template)
      .single();

    if (templateError) {
      console.error('Error fetching email template:', templateError);
      return new Response(
        JSON.stringify({ success: false, error: "Template not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Replace variables in template
    let content = templateData.content;
    if (data) {
      Object.entries(data).forEach(([key, value]) => {
        content = content.replace(new RegExp(`{{${key}}}`, 'g'), value as string);
      });
    }

    // Send email using a third-party service or Supabase's email service
    // This is a placeholder - you would need to implement the actual email sending logic
    // using a service like SendGrid, Mailgun, etc.
    
    // For demonstration purposes, we'll just log the email details
    console.log('Email details:', {
      to,
      subject,
      content
    });

    // Log the email sending attempt
    await supabaseClient
      .from('audit_logs')
      .insert({
        action: 'send_email',
        entity: 'email',
        user_id: user.id,
        details: {
          to,
          subject,
          template,
          timestamp: new Date().toISOString()
        }
      });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Email sent successfully"
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error('Error in send-email function:', error);
    
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
