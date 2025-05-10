import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface SiteConfig {
  site_name: string;
  site_name_hebrew: string;
  logo_url: string;
  favicon_url: string;
  meta_description: string;
  meta_keywords: string[];
  og_image: string;
  og_title: string;
  og_description: string;
  google_analytics_id: string;
}

// Default configuration to use when no config is found
const defaultConfig: SiteConfig = {
  site_name: 'MyStar',
  site_name_hebrew: 'מיי סטאר',
  logo_url: '',
  favicon_url: '',
  meta_description: 'קבל ברכה מותאמת אישית לכל אירוע מאמנים יוצרים וסלבריטאים',
  meta_keywords: ['מיי סטאר', 'ברכות מאמנים', 'ברכות לכל אירוע', 'ברכות מיוצרים', 'ברכות מסלב', 'mystar'],
  og_image: '',
  og_title: 'מיי סטאר- רכישת ברכות מותאמות אישית מיוצרים אמנים וסלבריטאים לכל אירוע',
  og_description: 'קבל ברכה מותאמת אישית לכל אירוע מאמנים יוצרים וסלבריטאים',
  google_analytics_id: ''
};

export function useSiteConfig() {
  const [config, setConfig] = useState<SiteConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConfig();
    subscribeToChanges();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('platform_config')
        .select('value')
        .eq('key', 'site_config')
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error loading site config:', error);
        toast.error('Failed to load site configuration');
        return;
      }
      
      const siteConfig = data?.value as SiteConfig;
      if (siteConfig) {
        setConfig(siteConfig);
        updateDocumentMetadata(siteConfig);
      } else {
        console.warn('No site configuration found, using defaults');
        setConfig(defaultConfig);
        updateDocumentMetadata(defaultConfig);
      }
    } catch (error) {
      console.error('Error loading site config:', error);
      toast.error('Failed to load site configuration');
    } finally {
      setLoading(false);
    }
  };

  const subscribeToChanges = () => {
    const subscription = supabase
      .channel('platform_config_changes')
      .on('postgres_changes', 
        { 
          event: 'UPDATE',
          schema: 'public',
          table: 'platform_config',
          filter: `key=eq.site_config`
        }, 
        (payload) => {
          const newConfig = payload.new.value as SiteConfig;
          if (newConfig) {
            setConfig(newConfig);
            updateDocumentMetadata(newConfig);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const updateDocumentMetadata = (config: SiteConfig) => {
    // Update document title
    document.title = `מיי סטאר- רכישת ברכות מותאמות אישית מיוצרים אמנים וסלבריטאים לכל אירוע`;

    // Update meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', 'קבל ברכה מותאמת אישית לכל אירוע מאמנים יוצרים וסלבריטאים');

    // Update meta keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', 'מיי סטאר, ברכות מאמנים, ברכות לכל אירוע, ברכות מיוצרים, ברכות מסלב, mystar');

    // Update Open Graph tags
    const ogTags = {
      'og:title': 'מיי סטאר- רכישת ברכות מותאמות אישית מיוצרים אמנים וסלבריטאים לכל אירוע',
      'og:description': 'קבל ברכה מותאמת אישית לכל אירוע מאמנים יוצרים וסלבריטאים',
      'og:image': config.og_image,
      'og:site_name': config.site_name
    };

    Object.entries(ogTags).forEach(([property, content]) => {
      if (!content) return;

      let metaTag = document.querySelector(`meta[property="${property}"]`);
      if (!metaTag) {
        metaTag = document.createElement('meta');
        metaTag.setAttribute('property', property);
        document.head.appendChild(metaTag);
      }
      metaTag.setAttribute('content', content);
    });

    // Update favicon
    if (config.favicon_url) {
      let favicon = document.querySelector("link[rel='icon']");
      if (!favicon) {
        favicon = document.createElement('link');
        favicon.setAttribute('rel', 'icon');
        document.head.appendChild(favicon);
      }
      favicon.setAttribute('href', config.favicon_url);
    }

    // Add Google Analytics if provided
    if (config.google_analytics_id && !document.querySelector(`script[src*="googletagmanager"]`)) {
      const gaScript = document.createElement('script');
      gaScript.async = true;
      gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${config.google_analytics_id}`;
      document.head.appendChild(gaScript);

      const gaConfig = document.createElement('script');
      gaConfig.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${config.google_analytics_id}');
      `;
      document.head.appendChild(gaConfig);
    }
  };

  return { config, loading };
}
