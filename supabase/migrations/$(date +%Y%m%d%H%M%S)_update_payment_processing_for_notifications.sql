-- Drop existing function if it exists to ensure it's updated with the latest logic
    DROP FUNCTION IF EXISTS public.process_request_payment(uuid, uuid, uuid, numeric);

    -- Create/Recreate function to process request payment and trigger email notifications
    CREATE OR REPLACE FUNCTION public.process_request_payment(
      p_request_id uuid,
      p_fan_id uuid,
      p_creator_id uuid,
      p_amount numeric
    )
    RETURNS jsonb
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    DECLARE
      v_platform_fee numeric := 30; -- Hardcoded 30% platform fee
      v_fee_amount numeric;
      v_creator_amount numeric;
      v_fan_balance numeric;
      v_admin_id uuid;
      v_earnings_id uuid;
      v_creator_email text;
      v_creator_name text;
      v_fan_email text;
      v_fan_name text;
      v_request_type text;
      v_request_message text;
      v_estimated_delivery text;
      v_edge_function_response jsonb;
    BEGIN
      -- Round the input amount to 2 decimal places
      p_amount := ROUND(p_amount::numeric, 2);
      
      -- Calculate fee and creator amounts with proper rounding
      v_fee_amount := ROUND((p_amount * v_platform_fee / 100)::numeric, 2);
      v_creator_amount := ROUND((p_amount - v_fee_amount)::numeric, 2);

      -- Get fan's current balance and details
      SELECT wallet_balance, email, COALESCE(name, email) 
      INTO v_fan_balance, v_fan_email, v_fan_name
      FROM public.users
      WHERE id = p_fan_id
      FOR UPDATE;

      -- Check if fan has sufficient balance
      IF v_fan_balance < p_amount THEN
        RETURN jsonb_build_object(
          'success', false,
          'error', 'Insufficient balance'
        );
      END IF;

      -- Get admin user id
      SELECT id INTO v_admin_id
      FROM public.users
      WHERE role = 'admin'
      LIMIT 1;

      -- Get creator details for email
      SELECT u.email, cp.name, cp.delivery_time
      INTO v_creator_email, v_creator_name, v_estimated_delivery
      FROM public.users u
      JOIN public.creator_profiles cp ON u.id = cp.id
      WHERE u.id = p_creator_id;

      -- Get request details for email
      SELECT request_type, message
      INTO v_request_type, v_request_message
      FROM public.requests
      WHERE id = p_request_id;


      -- Begin transaction
      BEGIN
        -- Deduct amount from fan's wallet
        UPDATE public.users
        SET wallet_balance = ROUND((wallet_balance - p_amount)::numeric, 2)
        WHERE id = p_fan_id;

        INSERT INTO public.earnings (
          creator_id,
          request_id,
          amount,
          status
        ) VALUES (
          p_creator_id,
          p_request_id,
          v_creator_amount,
          'pending' -- Earnings are pending until request is completed
        )
        RETURNING id INTO v_earnings_id;

        INSERT INTO public.wallet_transactions (
          user_id, type, amount, payment_method, payment_status, description
        ) VALUES (
          p_fan_id, 'purchase', p_amount, 'wallet', 'completed', 'Video request payment'
        );

        IF v_admin_id IS NOT NULL THEN
          INSERT INTO public.wallet_transactions (
            user_id, type, amount, payment_method, payment_status, description
          ) VALUES (
            v_admin_id, 'fee', v_fee_amount, 'platform', 'completed', 'Platform fee (30% of payment)'
          );
          
          UPDATE public.users
          SET wallet_balance = ROUND((wallet_balance + v_fee_amount)::numeric, 2)
          WHERE id = v_admin_id;
        END IF;

        -- Log the payment processing
        INSERT INTO public.audit_logs (
          action, entity, entity_id, user_id, details
        ) VALUES (
          'process_payment', 'requests', p_request_id, p_fan_id,
          jsonb_build_object(
            'total_amount', p_amount, 'platform_fee_percentage', v_platform_fee,
            'platform_fee_amount', v_fee_amount, 'creator_amount', v_creator_amount,
            'fan_id', p_fan_id, 'creator_id', p_creator_id,
            'earnings_id', v_earnings_id, 'earnings_status', 'pending'
          )
        );

        -- Invoke Edge Function to send email to creator
        IF v_creator_email IS NOT NULL THEN
          BEGIN
            SELECT net.http_post(
                url:=(SELECT current_setting('app.settings.supabase_url') || '/functions/v1/send-creator-notification'),
                headers:='{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.supabase_service_role_key') || '"}'::jsonb,
                body:=jsonb_build_object(
                    'orderId', p_request_id,
                    'creatorEmail', v_creator_email,
                    'creatorName', v_creator_name,
                    'fanName', v_fan_name,
                    'orderType', v_request_type,
                    'orderMessage', v_request_message,
                    'orderPrice', p_amount,
                    'requestType', v_request_type -- Ensure this is consistent with what the function expects
                )
            ) INTO v_edge_function_response;
            
            IF (v_edge_function_response->>'status_code')::integer >= 400 THEN
                RAISE WARNING 'Error calling send-creator-notification: %', v_edge_function_response;
            END IF;
          EXCEPTION WHEN OTHERS THEN
             RAISE WARNING 'Failed to invoke send-creator-notification Edge Function: %', SQLERRM;
          END;
        END IF;

        -- Invoke Edge Function to send email to fan
        IF v_fan_email IS NOT NULL THEN
          BEGIN
            SELECT net.http_post(
                url:=(SELECT current_setting('app.settings.supabase_url') || '/functions/v1/send-order-email'),
                headers:='{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.supabase_service_role_key') || '"}'::jsonb,
                body:=jsonb_build_object(
                    'orderId', p_request_id,
                    'fanEmail', v_fan_email,
                    'fanName', v_fan_name,
                    'creatorName', v_creator_name,
                    'orderType', v_request_type,
                    'estimatedDelivery', v_estimated_delivery
                )
            ) INTO v_edge_function_response;

            IF (v_edge_function_response->>'status_code')::integer >= 400 THEN
                RAISE WARNING 'Error calling send-order-email: %', v_edge_function_response;
            END IF;
          EXCEPTION WHEN OTHERS THEN
             RAISE WARNING 'Failed to invoke send-order-email Edge Function: %', SQLERRM;
          END;
        END IF;

        RETURN jsonb_build_object(
          'success', true, 'total_amount', p_amount,
          'platform_fee_percentage', v_platform_fee, 'platform_fee_amount', v_fee_amount,
          'creator_amount', v_creator_amount, 'earnings_id', v_earnings_id,
          'earnings_status', 'pending'
        );
      EXCEPTION
        WHEN others THEN
          RAISE NOTICE 'Error in process_request_payment: %', SQLERRM;
          RETURN jsonb_build_object(
            'success', false,
            'error', SQLERRM
          );
      END;
    END;
    $$;

    -- Grant execute permissions
    GRANT EXECUTE ON FUNCTION public.process_request_payment(uuid, uuid, uuid, numeric) TO authenticated;
