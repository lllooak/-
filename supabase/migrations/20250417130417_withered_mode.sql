-- Ensure RLS is disabled for platform_config table
    ALTER TABLE platform_config DISABLE ROW LEVEL SECURITY;

    -- Add updated_at column if it doesn't exist
    DO $$ 
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'platform_config' 
        AND column_name = 'updated_at'
      ) THEN
        ALTER TABLE platform_config 
        ADD COLUMN updated_at timestamptz DEFAULT now();
      END IF;
    END $$;

    -- Add unique constraint on key if it doesn't exist
    DO $$ 
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'platform_config_key_key'
      ) THEN
        ALTER TABLE platform_config 
        ADD CONSTRAINT platform_config_key_key UNIQUE (key);
      END IF;
    END $$;

    -- Initialize default settings if they don't exist, converting values to JSONB with explicit casts where needed
    INSERT INTO platform_config (key, value)
    VALUES 
      ('platform_fee', to_jsonb(10::numeric)), -- Explicit cast to numeric
      ('min_request_price', to_jsonb(5::numeric)), -- Explicit cast to numeric
      ('max_request_price', to_jsonb(1000::numeric)), -- Explicit cast to numeric
      ('default_delivery_time', to_jsonb(24::numeric)), -- Explicit cast to numeric
      ('max_delivery_time', to_jsonb(72::numeric)), -- Explicit cast to numeric
      ('allowed_file_types', to_jsonb(ARRAY['mp4', 'mov', 'avi'])), 
      ('max_file_size', to_jsonb(100::numeric)), -- Explicit cast to numeric
      ('auto_approve_creators', to_jsonb(false)), 
      ('require_email_verification', to_jsonb(true)), 
      ('enable_disputes', to_jsonb(true)), 
      ('dispute_window', to_jsonb(48::numeric)), -- Explicit cast to numeric
      ('payout_threshold', to_jsonb(50::numeric)), -- Explicit cast to numeric
      ('payout_schedule', to_jsonb('weekly'::text)) 
    ON CONFLICT (key) DO NOTHING;
