import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import toast from 'react-hot-toast';

export function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Success message
      toast.success('ההודעה נשלחה בהצלחה! נחזור אליך בהקדם.');
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      toast.error('אירעה שגיאה בשליחת הטופס. אנא נסה שוב מאוחר יותר.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl" dir="rtl">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">צור קשר</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          יש לך שאלות? אנחנו כאן כדי לעזור! מלא את הטופס מטה או השתמש בפרטי הקשר שלנו.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Contact Form */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-xl font-semibold mb-6 text-gray-800">שלח לנו הודעה</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                שם מלא
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                placeholder="הזן את שמך המלא"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                כתובת אימייל
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                placeholder="הזן את כתובת האימייל שלך"
              />
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                נושא
              </label>
              <select
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">בחר נושא</option>
                <option value="support">תמיכה טכנית</option>
                <option value="billing">תשלומים וחיובים</option>
                <option value="creators">שאלות ליוצרים</option>
                <option value="fans">שאלות למעריצים</option>
                <option value="other">אחר</option>
              </select>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                הודעה
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                placeholder="כתוב את הודעתך כאן..."
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  שולח...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <Send className="h-5 w-5 ml-2" />
                  שלח הודעה
                </span>
              )}
            </button>
          </form>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-xl font-semibold mb-6 text-gray-800">פרטי התקשרות</h2>
          
          <div className="space-y-8">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="p-3 bg-primary-100 rounded-full">
                  <Mail className="h-6 w-6 text-primary-600" />
                </div>
              </div>
              <div className="mr-4">
                <h3 className="text-lg font-medium text-gray-900">אימייל</h3>
                <p className="mt-1 text-gray-600">
                  <a href="mailto:support@mystar.co.il" className="hover:text-primary-600">
                    support@mystar.co.il
                  </a>
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  אנו מגיבים לרוב הפניות תוך 24-48 שעות.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="p-3 bg-primary-100 rounded-full">
                  <Phone className="h-6 w-6 text-primary-600" />
                </div>
              </div>
              <div className="mr-4">
                <h3 className="text-lg font-medium text-gray-900">טלפון</h3>
                <p className="mt-1 text-gray-600">
                  <a href="tel:+972-3-1234567" className="hover:text-primary-600">
                    03-1234567
                  </a>
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  ימים א'-ה', 9:00-17:00
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="p-3 bg-primary-100 rounded-full">
                  <MapPin className="h-6 w-6 text-primary-600" />
                </div>
              </div>
              <div className="mr-4">
                <h3 className="text-lg font-medium text-gray-900">כתובת</h3>
                <p className="mt-1 text-gray-600">
                  רחוב הברזל 30, תל אביב
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  קומה 5, משרד 512
                </p>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">שאלות נפוצות</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-800">מהו זמן התגובה הממוצע?</h4>
                <p className="text-gray-600 text-sm">אנו מתחייבים להגיב לכל הפניות תוך 24-48 שעות בימי עסקים.</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-800">האם יש אפשרות לתמיכה בשפות נוספות?</h4>
                <p className="text-gray-600 text-sm">כן, צוות התמיכה שלנו מספק שירות בעברית ובאנגלית.</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-800">איך אוכל לעקוב אחר הפנייה שלי?</h4>
                <p className="text-gray-600 text-sm">לאחר שליחת הטופס, תקבל אימייל עם מספר פנייה שיאפשר לך לעקוב אחר הסטטוס.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-16 bg-white rounded-lg shadow-md p-8">
        <h2 className="text-xl font-semibold mb-6 text-gray-800">שעות פעילות</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">תמיכה טכנית</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex justify-between">
                <span>ימים א'-ה'</span>
                <span>9:00 - 17:00</span>
              </li>
              <li className="flex justify-between">
                <span>יום ו'</span>
                <span>9:00 - 13:00</span>
              </li>
              <li className="flex justify-between">
                <span>שבת</span>
                <span>סגור</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">תמיכה בחיובים ותשלומים</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex justify-between">
                <span>ימים א'-ה'</span>
                <span>10:00 - 16:00</span>
              </li>
              <li className="flex justify-between">
                <span>יום ו', שבת</span>
                <span>סגור</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
