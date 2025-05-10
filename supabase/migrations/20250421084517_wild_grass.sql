-- Create storage bucket for downloadable videos if it doesn't exist
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('downloadable-videos', 'downloadable-videos', true)
    ON CONFLICT (id) DO NOTHING;

    -- Enable RLS on storage.objects if not already enabled -- Commented out
    -- DO $$ 
    -- BEGIN
    --   IF NOT EXISTS (
    --     SELECT 1 FROM pg_tables 
    --     WHERE tablename = 'objects' 
    --     AND schemaname = 'storage' 
    --     AND rowsecurity = true
    --   ) THEN
    --     ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
    --   END IF;
    -- END $$;

    -- Drop existing policies if they exist to avoid conflicts
    DO $$ 
    DECLARE
      policy_exists boolean;
      policy_name text;
    BEGIN
      FOR policy_name IN 
        SELECT polname FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND polname LIKE '%downloadable videos%'
      LOOP
        -- Check if policy exists before dropping
        IF EXISTS (SELECT 1 FROM pg_policy WHERE polname = policy_name AND polrelid = 'storage.objects'::regclass) THEN
          EXECUTE 'DROP POLICY IF EXISTS "' || policy_name || '" ON storage.objects;';
        END IF;
      END LOOP;
    END $$;

    -- Create new policies with unique names
    CREATE POLICY "creators_upload_downloadable_videos"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = 'downloadable-videos' AND
      EXISTS (
        SELECT 1 FROM public.requests -- Reference public.requests
        WHERE requests.id::text = (storage.foldername(name))[1]
        AND requests.creator_id = auth.uid()
      )
    );

    CREATE POLICY "creators_manage_uploaded_videos"
    ON storage.objects
    FOR ALL
    TO authenticated
    USING (
      bucket_id = 'downloadable-videos' AND
      EXISTS (
        SELECT 1 FROM public.requests -- Reference public.requests
        WHERE requests.id::text = (storage.foldername(name))[1]
        AND requests.creator_id = auth.uid()
      )
    );

    CREATE POLICY "fans_view_download_videos"
    ON storage.objects
    FOR SELECT
    TO authenticated
    USING (
      bucket_id = 'downloadable-videos' AND
      EXISTS (
        SELECT 1 FROM public.requests -- Reference public.requests
        WHERE requests.id::text = (storage.foldername(name))[1]
        AND requests.fan_id = auth.uid()
      )
    );

    CREATE POLICY "public_access_downloadable_videos"
    ON storage.objects
    FOR SELECT
    TO public
    USING (
      bucket_id = 'downloadable-videos'
    );
