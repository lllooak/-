-- Grant necessary permissions to the authenticated role -- Commented out
    -- GRANT USAGE ON SCHEMA auth TO authenticated;
    -- GRANT SELECT ON auth.users TO authenticated;

    -- Grant necessary permissions to the anon role -- Commented out
    -- GRANT USAGE ON SCHEMA auth TO anon;
    -- GRANT SELECT ON auth.users TO anon;

    -- Ensure the auth schema is accessible -- Commented out
    -- ALTER SCHEMA auth OWNER TO supabase_admin;

    -- Ensure proper permissions for the auth user management -- Commented out
    -- GRANT SELECT, INSERT, UPDATE ON auth.users TO service_role;
    -- GRANT SELECT, INSERT, UPDATE ON auth.refresh_tokens TO service_role;

    -- Ensure auth.users has proper indexes for performance -- Commented out
    -- CREATE INDEX IF NOT EXISTS auth_users_email_idx ON auth.users(email);
    -- CREATE INDEX IF NOT EXISTS auth_users_instance_id_idx ON auth.users(instance_id);

    -- Ensure proper RLS is enabled and configured for auth -- Commented out
    -- ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

    -- Create policy for authenticated users to view their own auth data if it doesn't exist -- Commented out
    -- DO $$
    -- DECLARE
    --   policy_exists boolean;
    -- BEGIN
    --   SELECT EXISTS (
    --     SELECT 1 FROM pg_policies 
    --     WHERE policyname = 'Users can view own auth data' 
    --     AND tablename = 'users' 
    --     AND schemaname = 'auth'
    --   ) INTO policy_exists;
      
    --   IF NOT policy_exists THEN
    --     EXECUTE 'CREATE POLICY "Users can view own auth data"
    --       ON auth.users
    --       FOR SELECT
    --       TO authenticated
    --       USING (id = auth.uid())';
    --   END IF;
    -- END $$;

    -- Create policy for public access to necessary auth data if it doesn't exist -- Commented out
    -- DO $$
    -- DECLARE
    --   policy_exists boolean;
    -- BEGIN
    --   SELECT EXISTS (
    --     SELECT 1 FROM pg_policies 
    --     WHERE policyname = 'Public can access necessary auth data' 
    --     AND tablename = 'users' 
    --     AND schemaname = 'auth'
    --   ) INTO policy_exists;
      
    --   IF NOT policy_exists THEN
    --     EXECUTE 'CREATE POLICY "Public can access necessary auth data"
    --       ON auth.users
    --       FOR SELECT
    --       TO anon
    --       USING (true)';
    --   END IF;
    -- END $$;

    -- Add a comment indicating why the lines are commented out
    -- Modifications to the auth schema (like adding indexes, enabling RLS, or changing ownership)
    -- should generally be avoided in user migrations as they are managed by Supabase
    -- and can cause permission errors like 'must be owner of table'.
