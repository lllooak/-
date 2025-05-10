import React, { useState } from 'react';
import { Bell, Mail, MessageSquare, Calendar } from 'lucide-react';

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  type: 'push' | 'email' | 'sms';
  enabled: boolean;
}

export function NotificationPreferences() {
  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      id: 'booking_confirmation',
      title: 'Booking Confirmations',
      description: 'Get notified when your booking is confirmed by the creator',
      type: 'push',
      enabled: true,
    },
    {
      id: 'booking_reminder',
      title: 'Booking Reminders',
      description: 'Receive reminders before your scheduled video calls',
      type: 'email',
      enabled: true,
    },
    {
      id: 'messages',
      title: 'New Messages',
      description: 'Get notified when you receive new messages',
      type: 'push',
      enabled: true,
    },
    {
      id: 'creator_updates',
      title: 'Creator Updates',
      description: 'Stay updated with your favorite creators',
      type: 'push',
      enabled: false,
    },
  ]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'push':
        return <Bell className="h-5 w-5" />;
      case 'email':
        return <Mail className="h-5 w-5" />;
      case 'messages':
        return <MessageSquare className="h-5 w-5" />;
      case 'calendar':
        return <Calendar className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const handleToggle = (id: string) => {
    setSettings(
      settings.map((setting) =>
        setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Notification Preferences</h2>
        <button className="text-sm text-primary-600 hover:text-primary-700">
          Reset to Default
        </button>
      </div>

      <div className="space-y-4">
        {settings.map((setting) => (
          <div
            key={setting.id}
            className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200"
          >
            <div className="flex items-start space-x-4">
              <div className={`p-2 rounded-lg ${setting.enabled ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-500'}`}>
                {getIcon(setting.type)}
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900">{setting.title}</h3>
                <p className="text-sm text-gray-500">{setting.description}</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={setting.enabled}
                onChange={() => handleToggle(setting.id)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
