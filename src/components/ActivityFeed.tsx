import React from 'react';
import { format } from 'date-fns';
import { Video, MessageSquare, Star, Heart, DollarSign } from 'lucide-react';

interface Activity {
  id: string;
  type: 'booking' | 'message' | 'review' | 'favorite' | 'payment';
  title: string;
  description: string;
  timestamp: Date;
  metadata?: {
    amount?: number;
    rating?: number;
    messagePreview?: string;
  };
}

interface ActivityFeedProps {
  activities: Activity[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return <Video className="h-5 w-5" />;
      case 'message':
        return <MessageSquare className="h-5 w-5" />;
      case 'review':
        return <Star className="h-5 w-5" />;
      case 'favorite':
        return <Heart className="h-5 w-5" />;
      case 'payment':
        return <DollarSign className="h-5 w-5" />;
      default:
        return null;
    }
  };

  const getIconBackground = (type: string) => {
    switch (type) {
      case 'booking':
        return 'bg-blue-100 text-blue-600';
      case 'message':
        return 'bg-green-100 text-green-600';
      case 'review':
        return 'bg-yellow-100 text-yellow-600';
      case 'favorite':
        return 'bg-pink-100 text-pink-600';
      case 'payment':
        return 'bg-purple-100 text-purple-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="flow-root">
      <ul role="list" className="-mb-8">
        {activities.map((activity, activityIdx) => (
          <li key={activity.id}>
            <div className="relative pb-8">
              {activityIdx !== activities.length - 1 ? (
                <span
                  className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200"
                  aria-hidden="true"
                />
              ) : null}
              <div className="relative flex items-start space-x-3">
                <div className={`relative p-2 rounded-lg ${getIconBackground(activity.type)}`}>
                  {getIcon(activity.type)}
                </div>
                <div className="min-w-0 flex-1">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {activity.title}
                    </div>
                    <p className="mt-0.5 text-sm text-gray-500">
                      {format(activity.timestamp, 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                  <div className="mt-2 text-sm text-gray-700">
                    <p>{activity.description}</p>
                    {activity.metadata && (
                      <div className="mt-2">
                        {activity.metadata.amount && (
                          <p className="text-sm font-medium text-gray-900">
                            Amount: ${activity.metadata.amount}
                          </p>
                        )}
                        {activity.metadata.rating && (
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-gray-900 mr-1">
                              Rating:
                            </span>
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < activity.metadata!.rating!
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        )}
                        {activity.metadata.messagePreview && (
                          <p className="text-sm text-gray-500 italic">
                            "{activity.metadata.messagePreview}"
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
