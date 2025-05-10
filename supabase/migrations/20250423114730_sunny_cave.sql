-- Create the storage bucket if it doesn't exist
    DO $$
    BEGIN
      INSERT INTO storage.buckets (id, name, public)
      VALUES ('request-videos', 'request-videos', true)
      ON CONFLICT (id) DO NOTHING;
    END $$;

    -- Enable RLS -- Commented out
    -- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

    -- Drop existing policies if they exist
    DO $$
    DECLARE
      policy_name text;
    BEGIN
      FOR policy_name IN 
        SELECT polname FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND polname LIKE 'request_videos_%'
      LOOP
        -- Check if policy exists before dropping
        IF EXISTS (SELECT 1 FROM pg_policy WHERE polname = policy_name AND polrelid = 'storage.objects'::regclass) THEN
          EXECUTE 'DROP POLICY IF EXISTS "' || policy_name || '" ON storage.objects;';
        END IF;
      END LOOP;
    END $$;

    -- Policy for creators to upload videos for their requests
    CREATE POLICY "request_videos_creator_upload"
    ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (
      bucket_id = 'request-videos' AND
      EXISTS (
        SELECT 1 FROM public.requests r -- Reference public.requests
        JOIN public.creator_profiles cp ON cp.id = r.creator_id -- Reference public.creator_profiles
        WHERE 
          cp.id = auth.uid() AND
          r.id::text = split_part(name, '/', 1)
      )
    );

    -- Policy for creators to read their uploaded videos
    CREATE POLICY "request_videos_creator_read"
    ON storage.objects FOR SELECT TO authenticated
    USING (
      bucket_id = 'request-videos' AND
      EXISTS (
        SELECT 1 FROM public.requests r -- Reference public.requests
        JOIN public.creator_profiles cp ON cp.id = r.creator_id -- Reference public.creator_profiles
        WHERE 
          cp.id = auth.uid() AND
          r.id::text = split_part(name, '/', 1)
      )
    );

    -- Policy for fans to view videos for their requests
    CREATE POLICY "request_videos_fan_view"
    ON storage.objects FOR SELECT TO authenticated
    USING (
      bucket_id = 'request-videos' AND
      EXISTS (
        SELECT 1 FROM public.requests r -- Reference public.requests
        WHERE 
          r.fan_id = auth.uid() AND
          r.id::text = split_part(name, '/', 1)
      )
    );

    -- Policy for admins to manage all videos
    CREATE POLICY "request_videos_admin_manage"
    ON storage.objects FOR ALL TO authenticated
    USING (
      bucket_id = 'request-videos' AND
      EXISTS (
        SELECT 1 FROM public.users -- Reference public.users
        WHERE users.id = auth.uid() AND users.role = 'admin'
      )
    );

    -- Add public access policy for request videos
    CREATE POLICY "request_videos_public_view"
    ON storage.objects FOR SELECT TO public
    USING (
      bucket_id = 'request-videos'
    );
