import { supabase } from '../lib/supabase';

// Maximum file sizes
const MAX_LOGO_SIZE = 2 * 1024 * 1024; // 2MB
const MAX_FAVICON_SIZE = 100 * 1024; // 100KB

// Allowed file types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/svg+xml'];
const ALLOWED_FAVICON_TYPES = ['image/x-icon', 'image/png', 'image/svg+xml'];

// Storage bucket name
const STORAGE_BUCKET = 'site-assets';

async function ensureBucketExists() {
  try {
    // Check if bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === STORAGE_BUCKET);

    if (!bucketExists) {
      // Create bucket if it doesn't exist
      const { error } = await supabase.storage.createBucket(STORAGE_BUCKET, {
        public: true // Make bucket publicly accessible
      });
      
      if (error) {
        throw new Error(`Failed to create storage bucket: ${error.message}`);
      }
    }
  } catch (error) {
    console.error('Error checking/creating bucket:', error);
    throw new Error('Unable to access storage. Please contact support.');
  }
}

export async function uploadLogo(file: File): Promise<string> {
  // Validate file type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error('Invalid file type. Please upload a JPG, PNG, or SVG file.');
  }

  // Validate file size
  if (file.size > MAX_LOGO_SIZE) {
    throw new Error('File too large. Maximum size is 2MB.');
  }

  try {
    // Ensure bucket exists before upload
    await ensureBucketExists();

    // Generate a unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `logo-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    // Upload file to Supabase Storage
    const { error: uploadError, data } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error(`Failed to upload logo: ${uploadError.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading logo:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to upload logo. Please try again.');
  }
}

export async function uploadFavicon(file: File): Promise<string> {
  // Validate file type
  if (!ALLOWED_FAVICON_TYPES.includes(file.type)) {
    throw new Error('Invalid file type. Please upload an ICO, PNG, or SVG file.');
  }

  // Validate file size
  if (file.size > MAX_FAVICON_SIZE) {
    throw new Error('File too large. Maximum size is 100KB.');
  }

  try {
    // Ensure bucket exists before upload
    await ensureBucketExists();

    // Generate a unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `favicon-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    // Upload file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error(`Failed to upload favicon: ${uploadError.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading favicon:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to upload favicon. Please try again.');
  }
}
