import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import toast from 'react-hot-toast';

interface WishlistButtonProps {
  creatorId: string;
  initialIsWishlisted?: boolean;
  onWishlistChange?: (isWishlisted: boolean) => void;
}

export function WishlistButton({
  creatorId,
  initialIsWishlisted = false,
  onWishlistChange,
}: WishlistButtonProps) {
  const [isWishlisted, setIsWishlisted] = useState(initialIsWishlisted);

  const handleWishlistClick = () => {
    const newState = !isWishlisted;
    setIsWishlisted(newState);
    onWishlistChange?.(newState);

    toast.success(
      newState ? 'Added to wishlist' : 'Removed from wishlist',
      {
        icon: '❤️',
        position: 'bottom-right',
      }
    );
  };

  return (
    <button
      onClick={handleWishlistClick}
      className={`
        flex items-center justify-center space-x-2 px-4 py-2 rounded-lg
        transition-colors duration-200 ease-in-out
        ${
          isWishlisted
            ? 'bg-pink-50 text-pink-600 border border-pink-200 hover:bg-pink-100'
            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
        }
      `}
    >
      <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
      <span>{isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}</span>
    </button>
  );
}
