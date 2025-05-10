import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Video, Users } from 'lucide-react';

export function Home() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-indigo-800">
        <div className="absolute inset-0">
          <img
            className="w-full h-full object-cover"
            src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2830&q=80&blend=111827&blend-mode=multiply&sat=-100"
            alt="People working"
          />
        </div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8" dir="rtl">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            קבל סרטוני ברכה אישיים מהכוכבים האהובים עליך
          </h1>
          <p className="mt-6 text-xl text-indigo-100 max-w-3xl">
            הזמן סרטוני ברכה מותאמים אישית לכל אירוע. הפוך את היום של מישהו למיוחד עם ברכה אישית מהכוכב האהוב עליו.
          </p>
          <div className="mt-10 flex space-x-4 space-x-reverse">
            <Link
              to="/explore"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-white hover:bg-indigo-50"
            >
              גלה יוצרים
            </Link>
            <Link
              to="/categories"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 bg-opacity-60 hover:bg-opacity-70"
            >
              עיין בקטגוריות
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">איך זה עובד</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              שלושה שלבים פשוטים
            </p>
          </div>

          <div className="mt-20">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-3" dir="rtl">
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center h-16 w-16 rounded-md bg-indigo-500 text-white">
                  <Users className="h-8 w-8" />
                </div>
                <h3 className="mt-6 text-xl font-medium text-gray-900">1. בחר יוצר</h3>
                <p className="mt-2 text-base text-gray-500 text-center">
                  עיין במגוון היוצרים המוכשרים שלנו ומצא את ההתאמה המושלמת להודעת הוידאו שלך.
                </p>
              </div>

              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center h-16 w-16 rounded-md bg-indigo-500 text-white">
                  <Video className="h-8 w-8" />
                </div>
                <h3 className="mt-6 text-xl font-medium text-gray-900">2. בקש סרטון</h3>
                <p className="mt-2 text-base text-gray-500 text-center">
                  ספר לנו על האירוע ומה תרצה שהיוצר יאמר בסרטון המותאם אישית שלך.
                </p>
              </div>

              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center h-16 w-16 rounded-md bg-indigo-500 text-white">
                  <Star className="h-8 w-8" />
                </div>
                <h3 className="mt-6 text-xl font-medium text-gray-900">3. קבל ושתף</h3>
                <p className="mt-2 text-base text-gray-500 text-center">
                  קבל את הסרטון הייחודי שלך לתיבת הדואר ושתף את הקסם עם יקיריך.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center mb-12">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">קטגוריות</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              מצא את היוצר המושלם
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              עיין בקטגוריות השונות שלנו ומצא את היוצר המתאים לאירוע שלך
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-6" dir="rtl">
            <Link to="/explore?category=musician" className="group">
              <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4">🎵</div>
                <h3 className="text-lg font-medium text-gray-900 group-hover:text-indigo-600">מוזיקאים</h3>
              </div>
            </Link>
            
            <Link to="/explore?category=actor" className="group">
              <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4">🎭</div>
                <h3 className="text-lg font-medium text-gray-900 group-hover:text-indigo-600">שחקנים</h3>
              </div>
            </Link>
            
            <Link to="/explore?category=comedian" className="group">
              <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4">😂</div>
                <h3 className="text-lg font-medium text-gray-900 group-hover:text-indigo-600">קומיקאים</h3>
              </div>
            </Link>
            
            <Link to="/explore?category=influencer" className="group">
              <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4">📱</div>
                <h3 className="text-lg font-medium text-gray-900 group-hover:text-indigo-600">משפיענים</h3>
              </div>
            </Link>
            
            <Link to="/explore?category=athlete" className="group">
              <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4">⚽</div>
                <h3 className="text-lg font-medium text-gray-900 group-hover:text-indigo-600">ספורטאים</h3>
              </div>
            </Link>
            
            <Link to="/explore?category=artist" className="group">
              <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4">🎨</div>
                <h3 className="text-lg font-medium text-gray-900 group-hover:text-indigo-600">אמנים</h3>
              </div>
            </Link>
          </div>
          
          <div className="text-center mt-12">
            <Link
              to="/categories"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              עיין בכל הקטגוריות
            </Link>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">המלצות</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              מה אומרים עלינו
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3" dir="rtl">
            <div className="bg-gray-50 p-6 rounded-lg shadow">
              <div className="flex items-center mb-4">
                <img
                  className="h-12 w-12 rounded-full object-cover"
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                  alt="Testimonial"
                />
                <div className="mr-4">
                  <h3 className="text-lg font-medium text-gray-900">שרה לוי</h3>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  </div>
                </div>
              </div>
              <p className="text-gray-600">
                "הזמנתי סרטון ברכה ליום ההולדת של אבא שלי מהזמר האהוב עליו. הוא היה המום! זו הייתה המתנה המושלמת והוא לא מפסיק לדבר על זה."
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg shadow">
              <div className="flex items-center mb-4">
                <img
                  className="h-12 w-12 rounded-full object-cover"
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                  alt="Testimonial"
                />
                <div className="mr-4">
                  <h3 className="text-lg font-medium text-gray-900">דני כהן</h3>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <Star className="h-4 w-4 text-gray-300" />
                  </div>
                </div>
              </div>
              <p className="text-gray-600">
                "הזמנתי סרטון מוטיבציה מספורטאי מפורסם לקבוצת הכדורגל שאני מאמן. הילדים היו בהלם מוחלט והמוטיבציה שלהם עלתה לשמיים!"
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg shadow">
              <div className="flex items-center mb-4">
                <img
                  className="h-12 w-12 rounded-full object-cover"
                  src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                  alt="Testimonial"
                />
                <div className="mr-4">
                  <h3 className="text-lg font-medium text-gray-900">מיכל אברהם</h3>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  </div>
                </div>
              </div>
              <p className="text-gray-600">
                "הזמנתי סרטון הצעת נישואין מהקומיקאית האהובה על בת זוגי. היא צחקה, בכתה ואמרה כן! תודה על שעזרתם לי ליצור רגע בלתי נשכח."
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
