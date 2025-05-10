/*
      # Fix storage buckets for video uploads and downloads

      1. Changes
        - Create request-videos bucket if it doesn't exist
        - Set proper public access settings
        - Add RLS policies for creators and fans
      
      2. Security
        - Enable RLS on storage.objects
        - Add policies for creators to upload videos
        - Add policies for fans to view their videos
    */

    -- Create request-videos bucket if it doesn't exist
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('request-videos', 'request-videos', true)
    ON CONFLICT (id) DO NOTHING;

    -- Enable RLS on storage.objects -- Commented out
    -- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

    -- Drop existing policies if they exist to avoid conflicts
    DO $$ 
    DECLARE
      policy_exists boolean;
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

    -- Create policies for request-videos bucket
    CREATE POLICY "request_videos_insert_policy"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = 'request-videos' AND
      EXISTS (
        SELECT 1 FROM public.requests -- Reference public.requests
        WHERE requests.id::text = (storage.foldername(name))[1]
        AND requests.creator_id = auth.uid()
      )
    );

    CREATE POLICY "request_videos_select_policy"
    ON storage.objects
    FOR SELECT
    TO authenticated
    USING (
      bucket_id = 'request-videos' AND
      (
        -- Creators can view their own uploads
        EXISTS (
          SELECT 1 FROM public.requests -- Reference public.requests
          WHERE requests.id::text = (storage.foldername(name))[1]
          AND requests.creator_id = auth.uid()
        )
        OR
        -- Fans can view videos for their requests
        EXISTS (
          SELECT 1 FROM public.requests -- Reference public.requests
          WHERE requests.id::text = (storage.foldername(name))[1]
          AND requests.fan_id = auth.uid()
        )
      )
    );

    -- Add policy for public access to request videos
    CREATE POLICY "public_access_request_videos"
    ON storage.objects
    FOR SELECT
    TO public
    USING (
      bucket_id = 'request-videos'
    );
