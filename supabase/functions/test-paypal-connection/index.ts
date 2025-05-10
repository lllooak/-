import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

const PAYPAL_API_URL = Deno.env.get("PAYPAL_SANDBOX") === "true" 
  ? "https://api-m.sandbox.paypal.com" 
  : "https://api-m.paypal.com";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    // Validate PayPal configuration
    const clientId = Deno.env.get("PAYPAL_CLIENT_ID");
    const clientSecret = Deno.env.get("PAYPAL_CLIENT_SECRET");

    if (!clientId || !clientSecret) {
      console.error('PayPal credentials missing:', {
        hasClientId: !!clientId,
        hasClientSecret: !!clientSecret
      });
      
      return new Response(
        JSON.stringify({
          success: false,
          error: "PayPal credentials are not configured"
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Test PayPal API connection by getting an access token
    const tokenResponse = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error('PayPal authentication failed:', {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        error: errorData
      });

      return new Response(
        JSON.stringify({
          success: false,
          error: "Failed to authenticate with PayPal",
          details: errorData.error_description || errorData.message
        }),
        {
          status: tokenResponse.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    const { access_token } = await tokenResponse.json();

    return new Response(
      JSON.stringify({
        success: true,
        message: "Successfully connected to PayPal"
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error('Error in test-paypal-connection:', {
      error,
      message: error.message,
      stack: error.stack
    });

    return new Response(
      JSON.stringify({
        success: false,
        error: "Failed to test PayPal connection",
        details: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
