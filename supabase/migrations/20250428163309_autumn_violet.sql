-- Fix NULL values in auth.users table that cause schema errors
    -- This migration addresses the error: "converting NULL to string is unsupported"

    -- First, update any NULL confirmation_token values to empty strings
    UPDATE auth.users
    SET confirmation_token = ''
    WHERE confirmation_token IS NULL;

    -- Update any NULL email_change values to empty strings
    UPDATE auth.users
    SET email_change = ''
    WHERE email_change IS NULL;

    -- Update any other potentially problematic NULL string fields
    UPDATE auth.users
    SET phone_change = ''
    WHERE phone_change IS NULL;

    UPDATE auth.users
    SET email_change_token_new = ''
    WHERE email_change_token_new IS NULL;

    UPDATE auth.users
    SET email_change_token_current = ''
    WHERE email_change_token_current IS NULL;

    UPDATE auth.users
    SET phone_change_token = ''
    WHERE phone_change_token IS NULL;

    UPDATE auth.users
    SET recovery_token = ''
    WHERE recovery_token IS NULL;

    -- Create a function to handle NULL string values during authentication -- REMOVED
    -- CREATE OR REPLACE FUNCTION auth.handle_null_string_fields() ...

    -- Create a trigger to handle NULL string fields -- REMOVED
    -- DROP TRIGGER IF EXISTS handle_null_string_fields_trigger ON auth.users;
    -- CREATE TRIGGER handle_null_string_fields_trigger ...

    -- Log the change
    INSERT INTO public.audit_logs ( -- Ensure logging goes to public schema
      action,
      entity,
      entity_id,
      details
    ) VALUES (
      'fix_auth_schema_errors',
      'auth.users',
      NULL,
      jsonb_build_object(
        'description', 'Fixed NULL string fields in auth.users table that were causing schema errors (data update only)',
        'timestamp', now(),
        'fields_fixed', ARRAY['confirmation_token', 'email_change', 'phone_change', 'email_change_token_new', 'email_change_token_current', 'phone_change_token', 'recovery_token']
      )
    );
