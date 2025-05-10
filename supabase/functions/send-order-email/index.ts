import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
    import { createClient } from "npm:@supabase/supabase-js@2.39.7";

    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
    };

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const FROM_EMAIL = "orders@bitshop.co.il"; // Updated domain
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");


    serve(async (req) => {
      if (req.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: corsHeaders });
      }

      if (!RESEND_API_KEY) {
        console.error("Resend API key not configured for send-order-email");
        return new Response(
          JSON.stringify({ success: false, error: "Email service (fan order) not properly configured." }),
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
        auth: { persistSession: false }
      });
      
      let requestPayload;
      try {
        requestPayload = await req.json();
      } catch (e) {
        console.error("Failed to parse request JSON for send-order-email:", e.message);
        return new Response(JSON.stringify({ success: false, error: "Invalid JSON payload" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }


      try {
        const {
          orderId,
          fanEmail,
          fanName,
          creatorName,
          orderType,
          estimatedDelivery
        } = requestPayload;

        if (!orderId || !fanEmail || !fanName || !creatorName || !orderType) {
          console.error("Missing required fields for fan order email:", requestPayload);
          return new Response(
            JSON.stringify({ success: false, error: "Missing required fields for fan order email" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        const requestTypeMap: Record<string, string> = {
          'birthday': 'יום הולדת',
          'anniversary': 'יום נישואין',
          'congratulations': 'ברכות',
          'motivation': 'מוטיבציה',
          'other': 'אחר'
        };
        const translatedRequestType = requestTypeMap[orderType.toLowerCase()] || orderType;

        const subject = `ההזמנה שלך מ-${creatorName} התקבלה! (#${String(orderId).substring(0,8)}) - MyStar`;
        const siteUrl = Deno.env.get("SITE_URL") || SUPABASE_URL.replace(/\/$/, "") || 'https://mystar.co.il';
        const dashboardUrl = `${siteUrl}/dashboard/fan`;

        const htmlContent = `
          <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; text-align: right;">
            <div style="text-align: center; margin-bottom: 20px;">
              <img src="https://answerme.co.il/mystar/logo.png" alt="MyStar Logo" style="width: 120px; height: auto;" />
            </div>
            <h1 style="color: #0284c7; text-align: center;">תודה על הזמנתך, ${fanName}!</h1>
            <p style="margin-top: 20px;">ההזמנה שלך עבור סרטון ברכה מ-<strong>${creatorName}</strong> התקבלה והועברה ליוצר.</p>
            <p>היוצר יתחיל לעבוד על הבקשה שלך בקרוב!</p>
            
            <div style="background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h3 style="color: #0284c7; margin-top: 0;">פרטי ההזמנה:</h3>
              <p><strong>מספר הזמנה:</strong> #${String(orderId).substring(0, 8)}</p>
              <p><strong>סוג בקשה:</strong> ${translatedRequestType}</p>
              <p><strong>יוצר:</strong> ${creatorName}</p>
              <p><strong>זמן אספקה משוער:</strong> ${estimatedDelivery || '24-48 שעות'}</p>
            </div>
            
            <p>כאשר הסרטון יהיה מוכן, נשלח לך הודעה נוספת ותוכל לצפות בו בלוח הבקרה שלך.</p>
            
            <p style="margin-top: 30px;">אם יש לך שאלות, אנא פנה לתמיכה בכתובת <a href="mailto:support@bitshop.co.il" style="color: #0284c7;">support@bitshop.co.il</a>.</p>
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
            to: fanEmail,
            subject: subject,
            html: htmlContent,
            reply_to: "support@bitshop.co.il"
          })
        });

        const resendData = await resendResponse.json();

        if (!resendResponse.ok) {
          const errorDetail = `Resend API Error: Status ${resendResponse.status}, Body: ${JSON.stringify(resendData)}`;
          console.error(errorDetail);
          await supabaseAdmin.from('audit_logs').insert({
            action: 'send_fan_order_email_failed', entity: 'requests', entity_id: String(orderId),
            details: { fanEmail, error: resendData?.message || 'Failed to send email', resend_response: resendData }
          });
          return new Response(
            JSON.stringify({ success: false, error: "Failed to send order confirmation email to fan", details: resendData?.message || errorDetail }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        await supabaseAdmin.from('audit_logs').insert({
          action: 'send_fan_order_email_success', entity: 'requests', entity_id: String(orderId),
          details: { fanEmail, emailId: resendData.id }
        });

        return new Response(
          JSON.stringify({ success: true, message: "Fan order confirmation email sent successfully", emailId: resendData.id }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

      } catch (err) {
        console.error('Error in send-order-email function:', err.message, err.stack);
        await supabaseAdmin.from('audit_logs').insert({
          action: 'send_fan_order_email_exception', entity: 'requests',
          details: { error: err.message || 'Unknown error', stack: err.stack, request_payload: requestPayload }
        });
        return new Response(
          JSON.stringify({ success: false, error: "An unexpected error occurred", details: err.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    });
