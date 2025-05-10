import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

export function EmailVerificationSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login after 5 seconds
    const timer = setTimeout(() => {
      navigate('/login');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <div className="text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
          <h2 className="mt-4 text-2xl font-bold text-gray-900">האימייל אומת בהצלחה!</h2>
          <p className="mt-2 text-gray-600">תודה שאימתת את האימייל שלך. כעת תוכל להתחבר לחשבונך.</p>
          <div className="mt-6">
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              התחבר עכשיו
            </button>
          </div>
          <p className="mt-4 text-sm text-gray-500">מועבר אוטומטית לדף ההתחברות בעוד מספר שניות...</p>
        </div>
      </div>
    </div>
  );
}
