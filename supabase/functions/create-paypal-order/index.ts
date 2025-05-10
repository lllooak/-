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
      throw new Error("PayPal credentials are not configured");
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
      throw new Error("No authorization header");
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    const { amount, currency = "ILS", description = "Wallet top-up" } = await req.json();

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      throw new Error("Invalid amount");
    }

    // Parse amount to ensure it's a valid number with 2 decimal places
    const exactAmount = parseFloat(parseFloat(amount).toFixed(2));

    // Store the exact amount in the transaction
    const { data: transaction, error: transactionError } = await supabaseClient
      .from('wallet_transactions')
      .insert({
        user_id: user.id,
        type: 'top_up',
        amount: exactAmount, // Store exact amount in ILS
        payment_method: 'paypal',
        payment_status: 'pending',
        description: description
      })
      .select()
      .single();

    if (transactionError) {
      throw new Error(`Failed to create transaction record: ${transactionError.message}`);
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
      throw new Error(tokenError.error_description || 'Failed to authenticate with PayPal');
    }

    const { access_token } = await tokenResponse.json();

    // Create PayPal order with exact amount
    const orderResponse = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: currency,
            value: exactAmount.toFixed(2) // Send exact amount to PayPal
          },
          description: description,
          custom_id: transaction.id
        }]
      })
    });

    if (!orderResponse.ok) {
      const orderError = await orderResponse.json();
      throw new Error(orderError.message || orderError.details?.[0]?.description || 'Failed to create PayPal order');
    }

    const paypalOrder = await orderResponse.json();

    return new Response(
      JSON.stringify({
        success: true,
        order_id: paypalOrder.id,
        transaction_id: transaction.id
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error('Error in create-paypal-order:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "An unexpected error occurred"
      }),
      {
        status: error.message === "Unauthorized" ? 401 : 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
