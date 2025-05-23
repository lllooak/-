-- Create super admin user for Joseph998
    DO $$
    DECLARE
      admin_id uuid;
      admin_email text := 'joseph998@example.com';
      admin_password text := '12121212'; -- Use a strong password in production!
    BEGIN
      -- Check if super admin user already exists in auth.users
      SELECT id INTO admin_id
      FROM auth.users
      WHERE email = admin_email;

      -- If super admin doesn't exist, create it
      IF admin_id IS NULL THEN
        -- Create super admin user in auth.users
        INSERT INTO auth.users (
          instance_id,
          id,
          aud,
          role,
          email,
          encrypted_password,
          email_confirmed_at, -- Confirm email immediately for admin creation
          created_at,
          updated_at
        ) VALUES (
          '00000000-0000-0000-0000-000000000000',
          gen_random_uuid(),
          'authenticated',
          'authenticated',
          admin_email,
          crypt(admin_password, gen_salt('bf')),
          now(),
          now(),
          now()
        )
        RETURNING id INTO admin_id;

        -- Create super admin user in public.users
        INSERT INTO public.users (
          id,
          email,
          role,
          name,
          wallet_balance,
          status,
          created_at,
          is_super_admin -- Set super admin flag
        ) VALUES (
          admin_id,
          admin_email,
          'admin', -- Role is still 'admin'
          'Joseph998', -- Use a name if desired
          0.00, -- Initial wallet balance
          'active',
          now(),
          true -- This is a super admin
        );

        -- Log super admin creation
        INSERT INTO public.audit_logs (
          action,
          entity,
          entity_id,
          details
        ) VALUES (
          'create_super_admin',
          'users',
          admin_id,
          jsonb_build_object(
            'email', admin_email,
            'role', 'admin',
            'is_super_admin', true,
            'created_at', now()
          )
        );
        
        RAISE NOTICE 'Created new super admin user with email %', admin_email;
      ELSE
        -- Ensure super admin role and flag are set correctly in public.users
        INSERT INTO public.users (
          id,
          email,
          role,
          name,
          wallet_balance,
          status,
          created_at,
          is_super_admin
        ) VALUES (
          admin_id,
          admin_email,
          'admin',
          'Joseph998',
          0.00,
          'active',
          now(),
          true -- Ensure super admin flag is true
        )
        ON CONFLICT (id) DO UPDATE
        SET 
          role = 'admin',
          status = 'active',
          is_super_admin = true, -- Ensure super admin flag is true on update
          updated_at = now();
          
        -- Update password if user exists
        UPDATE auth.users
        SET encrypted_password = crypt(admin_password, gen_salt('bf')),
            updated_at = now(),
            email_confirmed_at = now() -- Ensure email is confirmed
        WHERE id = admin_id;
        
        -- Log super admin update
        INSERT INTO public.audit_logs (
          action,
          entity,
          entity_id,
          details
        ) VALUES (
          'update_super_admin',
          'users',
          admin_id,
          jsonb_build_object(
            'email', admin_email,
            'role', 'admin',
            'is_super_admin', true,
            'updated_at', now()
          )
        );
        
        RAISE NOTICE 'Updated existing user to super admin with email %', admin_email;
      END IF;
    END $$;
