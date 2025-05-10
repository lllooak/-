
    import React, { useState, useEffect } from 'react';
    import { Link, useSearchParams } from 'react-router-dom';
    import { useCartStore } from '../stores/cartStore';
    import { supabase } from '../lib/supabase';
    import { Search, Filter, Star, Clock, DollarSign, Video } from 'lucide-react'; // Added Video icon
    import { formatCurrency } from '../utils/currency';
    import toast from 'react-hot-toast';

    interface VideoAd {
      id: string;
      creator_id: string;
      title: string;
      description: string;
      price: number;
      duration: string;
      thumbnail_url: string | null;
      sample_video_url: string | null;
      requirements: string | null;
      active: boolean;
      creator: {
        id: string;
        name: string;
        avatar_url: string | null;
        category: string;
        active: boolean;
      } | null;
    }

    interface AdminCategory {
      id: string;
      name: string;
      icon: string;
      description: string;
      order: number;
      active: boolean;
    }

    export function Explore() {
      const [searchParams] = useSearchParams();
      const categoryParam = searchParams.get('category');
      const [selectedCategory, setSelectedCategory] = useState(categoryParam || 'all');
      const [searchQuery, setSearchQuery] = useState('');
      const [videoAds, setVideoAds] = useState<VideoAd[]>([]);
      const [categories, setCategories] = useState<string[]>(['all']);
      const [loading, setLoading] = useState(true);
      const [refreshTrigger, setRefreshTrigger] = useState(0);
      const { addItem } = useCartStore();

      useEffect(() => {
        if (categoryParam) {
          setSelectedCategory(categoryParam);
        }
        
        Promise.all([
          fetchVideoAds(),
          fetchCategories()
        ]).catch(error => {
          console.error('Error initializing explore page:', error);
          toast.error('שגיאה בטעינת הדף');
        });
      }, [categoryParam, refreshTrigger]);

      // Set up a refresh interval to periodically check for updates
      useEffect(() => {
        const intervalId = setInterval(() => {
          setRefreshTrigger(prev => prev + 1);
        }, 60000); // Refresh every minute
        
        return () => clearInterval(intervalId);
      }, []);

      async function fetchCategories() {
        try {
          const { data: configData, error: configError } = await supabase
            .from('platform_config')
            .select('value')
            .eq('key', 'categories')
            .maybeSingle();

          if (configError) throw configError;

          // Get admin categories or use default if none exist
          const adminCategories = configData?.value?.categories || [];
          
          // Only use active categories
          const activeCategories = adminCategories
            .filter((cat: AdminCategory) => cat.active)
            .map((cat: AdminCategory) => cat.name);

          // If no categories defined, use default categories
          const defaultCategories = ['מוזיקאי', 'שחקן', 'קומיקאי', 'ספורטאי', 'משפיען', 'אמן'];
          
          // Map Hebrew categories to English for database matching
          const categoryMapping: Record<string, string> = {
            'מוזיקאי': 'musician',
            'שחקן': 'actor',
            'קומיקאי': 'comedian',
            'ספורטאי': 'athlete',
            'משפיען': 'influencer',
            'אמן': 'artist'
          };
          
          const englishCategories = (activeCategories.length > 0 ? activeCategories : defaultCategories)
            .map(cat => categoryMapping[cat] || cat);
          
          setCategories(['all', ...englishCategories]);
        } catch (error) {
          console.error('Error fetching categories:', error);
          // Fallback to default categories
          setCategories(['all', 'musician', 'actor', 'comedian', 'athlete', 'influencer', 'artist']);
        }
      }

      async function fetchVideoAds() {
        try {
          setLoading(true);
          
          const { data, error } = await supabase
            .from('video_ads')
            .select(`
              *,
              creator:creator_profiles(
                id,
                name,
                avatar_url,
                category,
                active
              )
            `)
            .eq('active', true)
            .order('created_at', { ascending: false });

          if (error) throw error;
          
          // Filter out ads from banned users
          const filteredAds = await filterBannedUsersAds(data || []);
          setVideoAds(filteredAds);
        } catch (error) {
          console.error('Error fetching video ads:', error);
          toast.error('שגיאה בטעינת מודעות וידאו');
        } finally {
          setLoading(false);
        }
      }

      // Function to filter out ads from banned users
      async function filterBannedUsersAds(ads: VideoAd[]): Promise<VideoAd[]> {
        if (ads.length === 0) return [];
        
        try {
          // First filter out ads where creator is not active
          const activeCreatorAds = ads.filter(ad => ad.creator?.active === true);
          
          // Get all creator IDs from the ads
          const creatorIds = [...new Set(activeCreatorAds.map(ad => ad.creator_id))];
          
          // Get the status of all these creators
          const { data: usersData, error } = await supabase
            .from('users')
            .select('id, status')
            .in('id', creatorIds);
            
          if (error) throw error;
          
          // Create a map of user IDs to their status
          const userStatusMap = new Map();
          usersData?.forEach(user => {
            userStatusMap.set(user.id, user.status);
          });
          
          // Filter out ads from banned users
          return activeCreatorAds.filter(ad => {
            const creatorStatus = userStatusMap.get(ad.creator_id);
            return creatorStatus === 'active'; // Only keep ads from active users
          });
        } catch (error) {
          console.error('Error filtering banned users ads:', error);
          return ads; // Return original ads if there's an error
        }
      }

      // Function to format delivery time to show only hours
      const formatDeliveryTime = (duration: string) => {
        if (!duration) return '';
        
        // If it's already in the format "X hours", extract the hours
        if (duration.includes('hours')) {
          const hours = duration.split(' ')[0];
          return `${hours} שעות`;
        }
        
        // If it's in the format "HH:MM:SS", extract the hours
        if (duration.includes(':')) {
          const hours = parseInt(duration.split(':')[0], 10);
          return `${hours} שעות`;
        }
        
        // If it's just a number, assume it's hours
        if (!isNaN(parseInt(duration, 10))) {
          return `${parseInt(duration, 10)} שעות`;
        }
        
        return duration;
      };

      // Map Hebrew categories to English for database matching
      const categoryMapping: Record<string, string> = {
        'מוזיקאי': 'musician',
        'שחקן': 'actor',
        'קומיקאי': 'comedian',
        'ספורטאי': 'athlete',
        'משפיען': 'influencer',
        'אמן': 'artist'
      };

      // Create reverse mapping for display
      const reverseCategoryMapping: Record<string, string> = {};
      Object.entries(categoryMapping).forEach(([hebrew, english]) => {
        reverseCategoryMapping[english] = hebrew;
      });

      // Fallback image URL
      const defaultAvatar = (name: string) => `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`;

      const filteredAds = videoAds.filter(ad => {
        const matchesSearch = 
          ad.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (ad.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
          (ad.creator?.name.toLowerCase().includes(searchQuery.toLowerCase()) || false);
        
        const matchesCategory = selectedCategory === 'all' || 
                               ad.creator?.category === selectedCategory ||
                               (ad.creator?.category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
                                selectedCategory.toLowerCase().includes(ad.creator?.category.toLowerCase()));
        
        return matchesSearch && matchesCategory;
      });

      return (
        <div className="container mx-auto px-4 py-8" dir="rtl">
          {/* Search and Filter Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-6">
              {selectedCategory === 'all' ? 'גלה מודעות וידאו' : `סרטוני ${reverseCategoryMapping[selectedCategory] || selectedCategory}`}
            </h1>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="חיפוש מודעות וידאו..."
                  className="pr-10 pl-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-right"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex space-x-4 space-x-reverse">
                <select
                  className="block w-full md:w-48 pl-4 pr-8 py-2 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-right"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category === 'all' ? 'כל הקטגוריות' : reverseCategoryMapping[category] || category}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredAds.map((ad) => (
                <Link
                  key={ad.id}
                  to={`/video-ad/${ad.id}`}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  {ad.thumbnail_url ? (
                    <img
                      src={ad.thumbnail_url}
                      alt={ad.title}
                      className="w-full h-48 object-cover"
                      onError={(e) => (e.currentTarget.src = defaultAvatar(ad.title))} // Fallback for thumbnail
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                      <Video className="h-12 w-12 text-gray-400" /> {/* Use Video icon */}
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{ad.title}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2">{ad.description}</p>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 ml-1" />
                        <span>זמן אספקה: {formatDeliveryTime(ad.duration)}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <DollarSign className="h-4 w-4 ml-1" />
                        <span>מחיר: