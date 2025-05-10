import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

export function FanSignup() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    birthDate: '',
    bio: '',
    agreeToTerms: false
  });

  // Countdown timer for cooldown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldownTime > 0) {
      timer = setInterval(() => {
        setCooldownTime(time => time - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [cooldownTime]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if we're in cooldown period
    if (cooldownTime > 0) {
      toast.error(`אנא המתן ${cooldownTime} שניות לפני נסיון נוסף`);
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (formData.password !== formData.confirmPassword) {
        toast.error('הסיסמאות אינן תואמות');
        setIsLoading(false);
        return;
      }

      if (!formData.agreeToTerms) {
        toast.error('עליך להסכים לתנאי השימוש ומדיניות הפרטיות');
        setIsLoading(false);
        return;
      }

      // Sign up with Supabase Auth - explicitly disable email confirmation
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            birth_date: formData.birthDate,
            bio: formData.bio
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          // Explicitly disable email confirmation
          emailConfirm: false
        }
      });

      if (signUpError) {
        // Check if it's a rate limit error
        if (signUpError.message.includes('rate limit')) {
          setCooldownTime(30); // Set 30 second cooldown
          throw new Error('נא להמתין 30 שניות לפני נסיון נוסף');
        }
        throw signUpError;
      }
      
      if (!user) throw new Error('No user returned after signup');

      // Create user record in public.users table
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email,
          name: formData.name,
          birth_date: formData.birthDate || null,
          bio: formData.bio || null,
          role: 'fan',
          wallet_balance: 0,
          status: 'active'
        });

      if (userError) throw userError;

      toast.success('החשבון נוצר בהצלחה! אנא בדוק את האימייל שלך לאימות החשבון.');
      navigate('/login?verification=true&email=' + encodeURIComponent(formData.email));
    } catch (error: any) {
      console.error('Error during signup:', error);
      if (error.message.includes('duplicate key')) {
        toast.error('כתובת האימייל כבר קיימת במערכת');
      } else {
        toast.error(error.message || 'אירעה שגיאה בתהליך ההרשמה. אנא נסה שוב.');
      }
      
      // Set cooldown if it's a rate limit error
      if (error.message.includes('rate limit') || error.message.includes('security purposes')) {
        setCooldownTime(30);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary-100">
            <UserPlus className="h-6 w-6 text-primary-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            הרשמה כמעריץ
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            כבר יש לך חשבון?{' '}
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
              התחבר
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                שם מלא
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-right"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={isLoading || cooldownTime > 0}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                כתובת אימייל
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-right"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={isLoading || cooldownTime > 0}
              />
            </div>

            <div>
              <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700">
                תאריך לידה
              </label>
              <input
                id="birthDate"
                name="birthDate"
                type="date"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-right"
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                disabled={isLoading || cooldownTime > 0}
              />
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                קצת על עצמך
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-right"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                disabled={isLoading || cooldownTime > 0}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                סיסמה
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-right"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                disabled={isLoading || cooldownTime > 0}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                אימות סיסמה
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-right"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                disabled={isLoading || cooldownTime > 0}
              />
            </div>

            <div className="flex items-center">
              <input
                id="agree-terms"
                name="agree-terms"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded ml-2"
                checked={formData.agreeToTerms}
                onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
                disabled={isLoading || cooldownTime > 0}
                required
              />
              <label htmlFor="agree-terms" className="text-sm text-gray-700">
                אני מסכים/ה ל
                <Link to="/terms" className="font-medium text-primary-600 hover:text-primary-500 mx-1">
                  תנאי השימוש
                </Link>
                ול
                <Link to="/privacy" className="font-medium text-primary-600 hover:text-primary-500 mx-1">
                  מדיניות הפרטיות
                </Link>
              </label>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading || cooldownTime > 0}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  נרשם...
                </span>
              ) : cooldownTime > 0 ? (
                `אנא המתן ${cooldownTime} שניות`
              ) : (
                'הרשמה כמעריץ'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
