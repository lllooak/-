/*
      # Fix authentication schema permissions

      1. Changes
        - Grant necessary permissions to the authenticated and anon roles (Commented out)
        - Enable proper access to auth schema for authentication (Commented out)
        - Add missing policies for user authentication (Commented out)
        - Remove index creation on auth.users

      2. Security
        - Maintains secure access patterns
        - Only grants minimum required permissions
    */

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

    -- Add indexes to improve auth performance -- Commented out
    -- CREATE INDEX IF NOT EXISTS auth_users_email_idx ON auth.users(email);
    -- CREATE INDEX IF NOT EXISTS auth_users_instance_id_idx ON auth.users(instance_id);

    -- Ensure proper RLS is enabled and configured -- Commented out
    -- ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

    -- Add necessary policies for auth -- Commented out (Policies on auth schema are usually managed by Supabase)
    -- CREATE POLICY "Users can view own auth data"
    --   ON auth.users
    --   FOR SELECT
    --   TO authenticated
    --   USING (auth.uid() = id);

    -- CREATE POLICY "Public can access necessary auth data"
    --   ON auth.users
    --   FOR SELECT
    --   TO anon
    --   USING (true);

    -- Add a comment indicating why the lines are commented out
    -- Modifications to the auth schema (like adding indexes, enabling RLS, or changing ownership)
    -- should generally be avoided in user migrations as they are managed by Supabase
    -- and can cause permission errors like 'must be owner of table'.
