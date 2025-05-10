import React, { useState, useEffect } from 'react';
    import { useParams, Link as RouterLink } from 'react-router-dom'; // Import Link as RouterLink
    import { Star, Clock, Calendar, Award, MessageCircle, Video, Heart, Share2, Link as LinkIcon } from 'lucide-react'; // Import Link as LinkIcon
    import { BookingModal } from '../components/BookingModal';
    import { VideoGallery } from '../components/VideoGallery';
    import { ChatWidget } from '../components/ChatWidget';
    import { ShareModal } from '../components/ShareModal';
    import { supabase } from '../lib/supabase';
    import toast from 'react-hot-toast';

    interface VideoAd {
      id: string;
      title: string;
      description: string;
      price: number;
      duration: string;
      thumbnail_url: string | null;
      sample_video_url: string | null;
      requirements: string | null;
      active: boolean;
    }

    interface CreatorProfileData {
      id: string;
      name: string;
      category: string;
      bio?: string;
      price: number;
      delivery_time: string;
      avatar_url?: string | null; // Ensure avatar_url can be null
      banner_url?: string | null; // Ensure banner_url can be null
      social_links?: {
        website?: string;
        facebook?: string;
        twitter?: string;
        instagram?: string;
        youtube?: string;
      };
      created_at?: string;
      updated_at?: string;
      rating?: number; // Add rating if available
      reviews?: number; // Add reviews count if available
      specialties?: string[]; // Add specialties if available
      reviewList?: any[]; // Add reviewList if available
    }

    export function CreatorProfile() {
      const { username } = useParams(); // Use username which likely corresponds to the ID
      const [creator, setCreator] = useState<CreatorProfileData | null>(null);
      const [videoAds, setVideoAds] = useState<VideoAd[]>([]);
      const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
      const [isShareModalOpen, setIsShareModalOpen] = useState(false);
      const [isFavorite, setIsFavorite] = useState(false);
      const [loading, setLoading] = useState(true);

      useEffect(() => {
        fetchCreatorProfile();
      }, [username]);

      async function fetchCreatorProfile() {
        try {
          setLoading(true);
          
          // Fetch creator profile using the ID from the URL parameter
          const { data: profile, error: profileError } = await supabase
            .from('creator_profiles')
            .select('*')
            .eq('id', username) // Use username (ID) here
            .single();

          if (profileError) {
            if (profileError.code === 'PGRST116') { // Resource not found
              toast.error('Creator not found');
              setCreator(null); // Set creator to null if not found
            } else {
              throw profileError;
            }
          } else {
            setCreator(profile);

            // Fetch video ads only if profile exists
            const { data: ads, error: adsError } = await supabase
              .from('video_ads')
              .select('*')
              .eq('creator_id', profile.id)
              .eq('active', true)
              .order('created_at', { ascending: false });

            if (adsError) throw adsError;
            setVideoAds(ads || []);
          }
        } catch (error) {
          console.error('Error fetching creator profile:', error);
          toast.error('Failed to load creator profile');
          setCreator(null); // Set creator to null on error
        } finally {
          setLoading(false);
        }
      }

      const handleFavoriteClick = () => {
        setIsFavorite(!isFavorite);
        toast.success(
          isFavorite ? 'Removed from favorites' : 'Added to favorites',
          {
            icon: '❤️',
            position: 'bottom-right',
          }
        );
      };

      const getCategoryIcon = (category: string) => {
        const icons: Record<string, string> = {
          'musician': '🎵',
          'actor': '🎭',
          'comedian': '😂',
          'influencer': '📱',
          'athlete': '⚽',
          'artist': '🎨'
        };
        
        return icons[category?.toLowerCase()] || '🌟';
      };

      const getCategoryNameInHebrew = (category: string) => {
        const hebrewNames: Record<string, string> = {
          'musician': 'מוזיקאי',
          'actor': 'שחקן',
          'comedian': 'קומיקאי',
          'influencer': 'משפיען',
          'athlete': 'ספורטאי',
          'artist': 'אמן'
        };
        
        return hebrewNames[category?.toLowerCase()] || category;
      };
      
      // Function to format delivery time to show only hours
      const formatDeliveryTime = (duration: string) => {
        if (!duration) return '';
        
        // If it's already in the format "X hours", return it
        if (duration.includes('hours')) {
          return duration.replace('hours', 'שעות');
        }
        
        // If it's in the format "HH:MM:SS", extract the hours
        if (duration.includes(':')) {
          const parts = duration.split(':');
          const hours = parseInt(parts[0], 10);
          return `${hours} שעות`;
        }
        
        // If it's just a number, assume it's hours
        if (!isNaN(parseInt(duration, 10))) {
          return `${parseInt(duration, 10)} שעות`;
        }
        
        return duration;
      };

      // Fallback image URL
      const defaultAvatar = (name: string) => `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`;
      const defaultBanner = 'https://images.unsplash.com/photo-1444628838545-ac4016a5418a?w=1600&h=400&fit=crop';

      if (loading) {
        return (
          <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        );
      }

      if (!creator) {
        return (
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900">Creator not found</h2>
              <p className="mt-2 text-gray-600">The creator profile you are looking for does not exist or is unavailable.</p>
            </div>
          </div>
        );
      }

      return (
        <>
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-6xl mx-auto">
              {/* Creator Header */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="md:flex">
                  <div className="md:flex-shrink-0">
                    <img
                      className="h-48 w-full object-cover md:w-48"
                      src={creator.avatar_url || defaultAvatar(creator.name)}
                      alt={creator.name}
                      onError={(e) => (e.currentTarget.src = defaultAvatar(creator.name))}
                    />
                  </div>
                  <div className="p-8 flex-1"> {/* Added flex-1 */}
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center">
                          <h1 className="text-3xl font-bold text-gray-900">{creator.name}</h1>
                          <span className="mr-3 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full flex items-center">
                            <span className="ml-1">{getCategoryIcon(creator.category)}</span>
                            {getCategoryNameInHebrew(creator.category)}
                          </span>
                        </div>
                        <p className="mt-2 text-gray-600">{getCategoryNameInHebrew(creator.category)}</p>
                      </div>
                      <div className="flex items-center">
                        <Star className="h-5 w-5 text-yellow-400 fill-current" />
                        <span className="ml-2 text-lg font-semibold">{creator.rating || 'New'}</span>
                        <span className="ml-1 text-gray-600">({creator.reviews || 0} reviews)</span>
                      </div>
                    </div>
                    <p className="mt-4 text-gray-600">{creator.bio}</p>
                    <div className="mt-6 flex flex-wrap gap-4">
                      {creator.specialties?.map((specialty: string, index: number) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                    
                    <div className="mt-6 flex flex-wrap gap-3">
                      <button
                        onClick={handleFavoriteClick}
                        className={`px-4 py-2 rounded-lg flex items-center ${
                          isFavorite 
                            ? 'bg-pink-100 text-pink-700 border border-pink-300' 
                            : 'bg-gray-100 text-gray-700 border border-gray-300'
                        }`}
                      >
                        <Heart className={`h-5 w-5 ml-2 ${isFavorite ? 'fill-current' : ''}`} />
                        {isFavorite ? 'במועדפים' : 'הוסף למועדפים'}
                      </button>
                      <button
                        onClick={() => setIsShareModalOpen(true)}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg border border-gray-300"
                      >
                        <Share2 className="h-5 w-5 ml-2 inline-block" />
                        שתף
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Video Ads Section */}
              <div className="mt-8">
                <h2 className="text-2xl font-bold mb-6">שירותי וידאו</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {videoAds.map((ad) => (
                    <div
                      key={ad.id}
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
                          <Video className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                      <div className="p-4">
                        <RouterLink 
                          to={`/video-ad/${ad.id}`}
                          className="block hover:text-primary-600 transition-colors"
                        >
                          <h3 className="text-lg font-semibold text-gray-900 hover:text-primary-600">{ad.title}</h3>
                        </RouterLink>
                        <p className="mt-1 text-sm text-gray-600 line-clamp-2">{ad.description}</p>
                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>זמן אספקה: {formatDeliveryTime(ad.duration)}</span>
                          </div>
                          <span className="text-lg font-semibold text-primary-600">₪{ad.price}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reviews Section */}
              <div className="mt-8">
                <h2 className="text-2xl font-bold mb-6">Reviews</h2>
                <div className="space-y-6">
                  {creator.reviewList?.map((review: any) => (
                    <div key={review.id} className="bg-white rounded-lg shadow-md p-6">
                      <div className="flex items-start">
                        <img
                          className="h-10 w-10 rounded-full object-cover"
                          src={review.userImage || defaultAvatar(review.user)}
                          alt={review.user}
                          onError={(e) => (e.currentTarget.src = defaultAvatar(review.user))}
                        />
                        <div className="ml-4 flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">{review.user}</h3>
                            <div className="flex items-center">
                              <Star className="h-5 w-5 text-yellow-400 fill-current" />
                              <span className="ml-1 text-gray-600">{review.rating}</span>
                            </div>
                          </div>
                          <p className="mt-1 text-gray-600">{review.comment}</p>
                          <p className="mt-2 text-sm text-gray-500">{review.date}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <BookingModal
            isOpen={isBookingModalOpen}
            onClose={() => setIsBookingModalOpen(false)}
            creator={creator}
          />

          <ShareModal
            isOpen={isShareModalOpen}
            onClose={() => setIsShareModalOpen(false)}
            title={`Book a personalized video from ${creator.name}`}
            description={creator.bio || ''}
            url={window.location.href}
          />

          <ChatWidget
            creatorName={creator.name}
            creatorImage={creator.avatar_url || defaultAvatar(creator.name)}
            creatorId={creator.id}
            userId="current-user-id" // Replace with actual user ID
          />
        </>
      );
    }
