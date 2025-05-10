-- Ensure RLS is enabled on storage.objects
    ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

    -- Drop potentially conflicting old policies first
    DO $$ 
    DECLARE
      policy_name text;
    BEGIN
      FOR policy_name IN 
        SELECT polname FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects'
      LOOP
        -- Check if policy exists before dropping
        IF EXISTS (SELECT 1 FROM pg_policy WHERE polname = policy_name AND polrelid = 'storage.objects'::regclass) THEN
          EXECUTE 'DROP POLICY IF EXISTS "' || policy_name || '" ON storage.objects;';
        END IF;
      END LOOP;
    END $$;

    -- == Policies for PUBLIC Buckets ==

    -- site-assets: Allow public read access
    CREATE POLICY "Allow public read access to site assets"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'site-assets');

    -- site-assets: Allow admins to manage
    CREATE POLICY "Admins can manage site assets"
    ON storage.objects FOR ALL
    TO authenticated
    USING (
      bucket_id = 'site-assets' AND
      EXISTS (
        SELECT 1 FROM public.users -- Reference public.users
        WHERE users.id = auth.uid() AND (users.role = 'admin' OR users.is_super_admin = true)
      )
    )
    WITH CHECK (
      bucket_id = 'site-assets' AND
      EXISTS (
        SELECT 1 FROM public.users -- Reference public.users
        WHERE users.id = auth.uid() AND (users.role = 'admin' OR users.is_super_admin = true)
      )
    );

    -- profile-images: Allow public read access
    CREATE POLICY "Allow public read access to profile images"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'profile-images');

    -- profile-images: Allow authenticated users to upload/manage their own images
    CREATE POLICY "Users can manage their own profile images"
    ON storage.objects FOR ALL
    TO authenticated
    USING (bucket_id = 'profile-images' AND owner = auth.uid())
    WITH CHECK (bucket_id = 'profile-images' AND owner = auth.uid());

    -- creator-images: Allow public read access
    CREATE POLICY "Allow public read access to creator images"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'creator-images');

    -- creator-images: Allow authenticated users (creators) to manage their own images
    CREATE POLICY "Creators can manage their own creator images"
    ON storage.objects FOR ALL
    TO authenticated
    USING (bucket_id = 'creator-images' AND owner = auth.uid())
    WITH CHECK (bucket_id = 'creator-images' AND owner = auth.uid());

    -- thumbnails: Allow public read access
    CREATE POLICY "Allow public read access to thumbnails"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'thumbnails');

    -- thumbnails: Allow authenticated users to manage their own thumbnails
    CREATE POLICY "Users can manage their own thumbnails"
    ON storage.objects FOR ALL
    TO authenticated
    USING (bucket_id = 'thumbnails' AND owner = auth.uid())
    WITH CHECK (bucket_id = 'thumbnails' AND owner = auth.uid());

    -- == Policies for PRIVATE Buckets ==

    -- request-videos: Allow creators to upload/manage videos for their requests
    CREATE POLICY "Creators can manage videos for their requests"
    ON storage.objects FOR ALL
    TO authenticated
    USING (
      bucket_id = 'request-videos' AND
      EXISTS (
        SELECT 1 FROM public.requests r -- Reference public.requests
        WHERE r.creator_id = auth.uid() AND r.id::text = (storage.foldername(name))[1]
      )
    )
    WITH CHECK (
      bucket_id = 'request-videos' AND
      EXISTS (
        SELECT 1 FROM public.requests r -- Reference public.requests
        WHERE r.creator_id = auth.uid() AND r.id::text = (storage.foldername(name))[1]
      )
    );

    -- request-videos: Allow fans to view videos for their completed requests
    CREATE POLICY "Fans can view videos for their completed requests"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (
      bucket_id = 'request-videos' AND
      EXISTS (
        SELECT 1 FROM public.requests r -- Reference public.requests
        WHERE r.fan_id = auth.uid() AND r.status = 'completed' AND r.id::text = (storage.foldername(name))[1]
      )
    );

    -- == Admin Access Policy (Apply to private buckets) ==
    CREATE POLICY "Admins can manage private storage objects"
    ON storage.objects FOR ALL
    TO authenticated
    USING (
      bucket_id IN ('request-videos', 'media-uploads') AND -- Add other private buckets here if needed
      EXISTS (
        SELECT 1 FROM public.users -- Reference public.users
        WHERE users.id = auth.uid() AND (users.role = 'admin' OR users.is_super_admin = true)
      )
    );
