import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
    import { createClient } from "npm:@supabase/supabase-js@2.39.7";

    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
    };

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const FROM_EMAIL = "orders@bitshop.co.il"; // Using bitshop.co.il
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    serve(async (req) => {
      if (req.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: corsHeaders });
      }

      if (!RESEND_API_KEY) {
        const errorMsg = "CRITICAL: Resend API key not configured (RESEND_API_KEY missing).";
        console.error(errorMsg);
        return new Response(
          JSON.stringify({ success: false, error: "Email service (creator notification) is not properly configured." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
        const errorMsg = "CRITICAL: Supabase URL or Service Role Key not configured.";
        console.error(errorMsg);
        return new Response(
          JSON.stringify({ success: false, error: "Supabase connection details missing." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: { persistSession: false },
      });

      let requestPayload;
      try {
        requestPayload = await req.json();
      } catch (e) {
        console.error("Failed to parse request JSON:", e.message);
        return new Response(JSON.stringify({ success: false, error: "Invalid JSON payload" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const {
        orderId, creatorEmail, creatorName, fanName,
        orderType, orderMessage, orderPrice
      } = requestPayload;

      if (!orderId || !creatorEmail || !creatorName || !fanName || !orderType || orderPrice === undefined || orderPrice === null) {
        console.error("Missing required fields for creator notification:", requestPayload);
        return new Response(
          JSON.stringify({ success: false, error: "Missing required fields for creator notification" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      try {
        const formattedPrice = typeof orderPrice === 'number' ? orderPrice.toFixed(2) : String(orderPrice);
        const creatorShare = (Number(formattedPrice) * 0.70).toFixed(2);

        const requestTypeMap: Record<string, string> = {
          'birthday': 'יום הולדת', 'anniversary': 'יום נישואין',
          'congratulations': 'ברכות', 'motivation': 'מוטיבציה', 'other': 'אחר'
        };
        const translatedRequestType = requestTypeMap[orderType.toLowerCase()] || orderType;
        const subject = `הזמנה חדשה התקבלה מ-${fanName}! (#${String(orderId).substring(0,8)}) - MyStar`;
        
        const siteUrl = Deno.env.get("SITE_URL") || `https://${Deno.env.get("PROJECT_ID") || 'your-project-id'}.supabase.co`; // Fallback to Supabase URL if SITE_URL not set
        const dashboardUrl = `${siteUrl}/dashboard/creator/requests`; // Assuming SITE_URL is your frontend domain

        const htmlContent = `
          <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; text-align: right;">
            <div style="text-align: center; margin-bottom: 20px;">
              <img src="https://answerme.co.il/mystar/logo.png" alt="MyStar Logo" style="width: 120px; height: auto;" />
            </div>
            <h1 style="color: #0284c7; text-align: center;">הזמנה חדשה התקבלה!</h1>
            <p style="margin-top: 20px;">שלום ${creatorName},</p>
            <p>קיבלת בקשת וידאו חדשה מ-<strong>${fanName}</strong>.</p>
            <div style="background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h3 style="color: #0284c7; margin-top: 0;">פרטי ההזמנה:</h3>
              <p><strong>מספר הזמנה:</strong> #${String(orderId).substring(0, 8)}</p>
              <p><strong>סוג בקשה:</strong> ${translatedRequestType}</p>
              <p><strong>מחיר שתקבל (לאחר עמלה):</strong> ₪${creatorShare} (מתוך ₪${formattedPrice})</p>
              <p><strong>הודעה מהמעריץ:</strong></p>
              <div style="background-color: #ffffff; padding: 15px; border-radius: 5px; margin-top: 10px; white-space: pre-wrap;">${orderMessage || "אין הודעה מיוחדת."}</div>
            </div>
            <p>אנא היכנס ל<a href="${dashboardUrl}" style="color: #0284c7; text-decoration: none;">לוח הבקרה</a> שלך כדי לאשר או לדחות את הבקשה תוך 48 שעות.</p>
            <div style="margin-top: 30px; text-align: center;">
              <a href="${dashboardUrl}" style="background-color: #0284c7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">צפה בבקשה</a>
            </div>
            <p style="margin-top: 30px;">אם יש לך שאלות, אנא פנה לתמיכה.</p>
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px;">
              <p>&copy; ${new Date().getFullYear()} MyStar - מיי סטאר. כל הזכויות שמורות.</p>
            </div>
          </div>
        `;

        const resendResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            from: FROM_EMAIL,
            to: creatorEmail,
            subject: subject,
            html: htmlContent,
            reply_to: "support@bitshop.co.il" // Updated reply-to
          })
        });

        const resendData = await resendResponse.json();

        if (!resendResponse.ok) {
          const errorDetail = `Resend API Error: Status ${resendResponse.status}, Body: ${JSON.stringify(resendData)}`;
          console.error(errorDetail);
          await supabaseAdmin.from('audit_logs').insert({
            action: 'send_creator_notification_failed', entity: 'requests', entity_id: String(orderId),
            details: { creatorEmail, error: resendData?.message || 'Failed to send email', resend_response: resendData }
          });
          return new Response(
            JSON.stringify({ success: false, error: "Failed to send email to creator", details: resendData?.message || errorDetail }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        await supabaseAdmin.from('audit_logs').insert({
          action: 'send_creator_notification_success', entity: 'requests', entity_id: String(orderId),
          details: { creatorEmail, emailId: resendData.id }
        });

        return new Response(
          JSON.stringify({ success: true, message: "Creator notification email sent successfully", emailId: resendData.id }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

      } catch (err) {
        console.error("Unhandled exception in send-creator-notification function:", err.message, err.stack);
        await supabaseAdmin.from('audit_logs').insert({
          action: 'send_creator_notification_exception', entity: 'requests',
          details: { error: err.message || 'Unknown error', stack: err.stack, request_payload: requestPayload }
        });
        return new Response(
          JSON.stringify({ success: false, error: "An unexpected error occurred in Edge Function.", details: err.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    });
