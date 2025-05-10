import React from 'react';
import { Bell, Globe, Clock } from 'lucide-react';
import { NotificationPreferences } from '../../../components/NotificationPreferences';
import { useCreatorStore } from '../../../stores/creatorStore';
import toast from 'react-hot-toast';

// Default settings structure
const defaultSettings = {
  notifications: {
    email: false,
    push: false,
    sms: false
  },
  availability: {
    autoAcceptRequests: false,
    maxRequestsPerDay: 10,
    deliveryTime: 24
  }
};

export function SettingsPage() {
  const { settings = defaultSettings, updateSettings } = useCreatorStore();

  const handleSave = async () => {
    try {
      await updateSettings(settings);
      toast.success('ההגדרות נשמרו בהצלחה');
    } catch (error) {
      toast.error('שגיאה בשמירת ההגדרות');
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <h1 className="text-2xl font-semibold text-gray-900">הגדרות</h1>

      <div className="grid grid-cols-1 gap-6">
        {/* Notification Settings */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <div className="flex items-center mb-6">
              <Bell className="h-6 w-6 text-primary-600 ml-2" />
              <h2 className="text-lg font-medium text-gray-900">העדפות התראות</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings?.notifications?.email ?? false}
                    onChange={(e) => updateSettings({
                      ...settings,
                      notifications: { ...settings?.notifications, email: e.target.checked }
                    })}
                    className="rounded text-primary-600 focus:ring-primary-500 h-4 w-4 ml-2"
                  />
                  <span className="text-gray-700">התראות במייל</span>
                </label>
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings?.notifications?.push ?? false}
                    onChange={(e) => updateSettings({
                      ...settings,
                      notifications: { ...settings?.notifications, push: e.target.checked }
                    })}
                    className="rounded text-primary-600 focus:ring-primary-500 h-4 w-4 ml-2"
                  />
                  <span className="text-gray-700">התראות דחיפה</span>
                </label>
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings?.notifications?.sms ?? false}
                    onChange={(e) => updateSettings({
                      ...settings,
                      notifications: { ...settings?.notifications, sms: e.target.checked }
                    })}
                    className="rounded text-primary-600 focus:ring-primary-500 h-4 w-4 ml-2"
                  />
                  <span className="text-gray-700">התראות SMS</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Availability Settings */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <div className="flex items-center mb-6">
              <Clock className="h-6 w-6 text-primary-600 ml-2" />
              <h2 className="text-lg font-medium text-gray-900">הגדרות זמינות</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings?.availability?.autoAcceptRequests ?? false}
                    onChange={(e) => updateSettings({
                      ...settings,
                      availability: { ...settings?.availability, autoAcceptRequests: e.target.checked }
                    })}
                    className="rounded text-primary-600 focus:ring-primary-500 h-4 w-4 ml-2"
                  />
                  <span className="text-gray-700">קבל בקשות אוטומטית</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  מקסימום בקשות ליום
                </label>
                <input
                  type="number"
                  value={settings?.availability?.maxRequestsPerDay ?? 10}
                  onChange={(e) => updateSettings({
                    ...settings,
                    availability: { ...settings?.availability, maxRequestsPerDay: parseInt(e.target.value) }
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  זמן אספקה ברירת מחדל (שעות)
                </label>
                <input
                  type="number"
                  value={settings?.availability?.deliveryTime ?? 24}
                  onChange={(e) => updateSettings({
                    ...settings,
                    availability: { ...settings?.availability, deliveryTime: parseInt(e.target.value) }
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            שמור הגדרות
          </button>
        </div>
      </div>
    </div>
  );
}
