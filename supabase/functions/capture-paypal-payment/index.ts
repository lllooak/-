import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.7";

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

    const { order_id, transaction_id } = await req.json();

    if (!order_id || !transaction_id) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required parameters" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Verify transaction
    const { data: transaction, error: transactionError } = await supabaseClient
      .from('wallet_transactions')
      .select('*')
      .eq('id', transaction_id)
      .eq('user_id', user.id)
      .single();

    if (transactionError || !transaction) {
      console.error('Transaction verification error:', transactionError);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Transaction not found or unauthorized"
        }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Get PayPal access token
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
      const tokenError = await tokenResponse.json();
      console.error('PayPal authentication failed:', {
        status: tokenResponse.status,
        error: tokenError
      });

      return new Response(
        JSON.stringify({
          success: false,
          error: "Failed to authenticate with PayPal",
          details: tokenError.error_description || tokenError.message
        }),
        {
          status: tokenResponse.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    const { access_token } = await tokenResponse.json();
    
    // Capture payment
    const captureResponse = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders/${order_id}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`
      }
    });

    if (!captureResponse.ok) {
      const captureError = await captureResponse.json();
      console.error('PayPal capture failed:', {
        status: captureResponse.status,
        error: captureError
      });
      
      // Update transaction status to failed
      await supabaseClient
        .from('wallet_transactions')
        .update({
          payment_status: 'failed',
          updated_at: new Date().toISOString()
        })
        .eq('id', transaction_id);

      return new Response(
        JSON.stringify({
          success: false,
          error: "Failed to capture PayPal payment",
          details: captureError.message || captureError.details?.[0]?.description
        }),
        {
          status: captureResponse.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    const captureData = await captureResponse.json();

    // Update transaction and wallet balance
    const { error: updateError } = await supabaseClient
      .rpc('process_paypal_transaction', {
        p_transaction_id: transaction_id,
        p_status: 'completed'
      });

    if (updateError) {
      console.error('Error updating transaction:', updateError);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Failed to update transaction status",
          details: updateError.message
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Payment captured successfully",
        capture_id: captureData.purchase_units[0].payments.captures[0].id
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error('Error in capture-paypal-payment:', {
      error,
      message: error.message,
      stack: error.stack
    });
    
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
