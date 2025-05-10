import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fetchCategories() {
  try {
    console.log('Fetching categories from platform_config...');
    
    // Fetch categories from platform_config
    const { data: configData, error: configError } = await supabase
      .from('platform_config')
      .select('value')
      .eq('key', 'categories')
      .maybeSingle();

    if (configError) {
      throw configError;
    }

    // Get admin categories or use default if none exist
    const adminCategories = configData?.value?.categories || [];
    
    // Only use active categories
    const activeAdminCategories = adminCategories
      .filter((cat) => cat.active)
      .sort((a, b) => a.order - b.order);

    console.log('Categories found:', activeAdminCategories.length);
    
    if (activeAdminCategories.length === 0) {
      console.log('No active categories found');
    } else {
      console.log('Active categories:');
      activeAdminCategories.forEach((category, index) => {
        console.log(`${index + 1}. ${category.name} (${category.icon}) - ${category.description}`);
      });
    }

    return activeAdminCategories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

// Execute the function
fetchCategories().then(() => {
  console.log('Done fetching categories');
});
