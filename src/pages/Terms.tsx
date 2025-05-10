import React from 'react';
import { Link } from 'react-router-dom';

export function Terms() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl" dir="rtl">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">תנאי שימוש</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-6">
            ברוכים הבאים לאתר MyStar. אנא קראו בעיון את תנאי השימוש הבאים לפני השימוש באתר ובשירותים שלנו.
            השימוש באתר ובשירותים מהווה הסכמה לתנאים אלה.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4 text-gray-800">1. הגדרות</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>"האתר" או "הפלטפורמה" - אתר האינטרנט MyStar וכל השירותים הניתנים בו.</li>
            <li>"המשתמש" - כל אדם הגולש או משתמש באתר בכל דרך שהיא.</li>
            <li>"יוצר" - משתמש שנרשם לאתר כיוצר תוכן ומציע שירותי וידאו מותאמים אישית.</li>
            <li>"מעריץ" - משתמש שנרשם לאתר כדי להזמין וידאו מותאם אישית מיוצר.</li>
            <li>"תוכן" - כל חומר המועלה לאתר, כולל וידאו, טקסט, תמונות וכל מדיה אחרת.</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8 mb-4 text-gray-800">2. הרשמה ותנאי שימוש</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>השימוש באתר מותר למשתמשים מגיל 18 ומעלה בלבד.</li>
            <li>בעת ההרשמה, על המשתמש לספק פרטים מדויקים ומלאים.</li>
            <li>המשתמש אחראי לשמירה על סודיות פרטי הכניסה לחשבונו.</li>
            <li>אנו שומרים את הזכות לחסום או להסיר חשבונות משתמשים שמפרים את תנאי השימוש.</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8 mb-4 text-gray-800">3. תשלומים ומדיניות ביטולים</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>כל העסקאות באתר מתבצעות באמצעות מערכת התשלומים המאובטחת שלנו.</li>
            <li>המחירים המוצגים באתר הם בשקלים חדשים וכוללים מע"מ.</li>
            <li>לאחר אישור הזמנה על ידי היוצר, לא ניתן לבטל את העסקה.</li>
            <li>במקרה שהיוצר דוחה את הבקשה, הכסף יוחזר לארנק המשתמש באופן אוטומטי.</li>
            <li>אנו גובים עמלה בשיעור של 30% מכל עסקה המתבצעת באתר.</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8 mb-4 text-gray-800">4. זכויות יוצרים וקניין רוחני</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>כל התכנים המוצגים באתר, לרבות סימני מסחר, לוגו, עיצוב, טקסט וגרפיקה, הם קניינה של MyStar, אלא אם צוין אחרת.</li>
            <li>היוצרים שומרים על זכויות היוצרים של התוכן שהם מייצרים, אך מעניקים רישיון לאתר ולמזמין להשתמש בתוכן.</li>
            <li>המזמין מקבל רישיון לשימוש אישי בלבד בתוכן שהוזמן, אלא אם רכש זכויות נוספות.</li>
            <li>חל איסור על העלאת תוכן המפר זכויות יוצרים של צד שלישי.</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8 mb-4 text-gray-800">5. כללי התנהגות</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>חל איסור על העלאת תוכן פוגעני, מאיים, גזעני, מיני בוטה, או כל תוכן אחר שעלול לפגוע במשתמשים אחרים.</li>
            <li>חל איסור על שימוש באתר למטרות לא חוקיות.</li>
            <li>אין להשתמש באתר כדי להטריד, לאיים או לפגוע במשתמשים אחרים.</li>
            <li>אנו שומרים את הזכות להסיר כל תוכן שלדעתנו מפר את כללי ההתנהגות.</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8 mb-4 text-gray-800">6. הגבלת אחריות</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>האתר מסופק "כפי שהוא" (AS IS) ואיננו מתחייבים שהשירות יהיה ללא תקלות או יענה על ציפיות המשתמש.</li>
            <li>איננו אחראים לתוכן המועלה על ידי משתמשים או יוצרים.</li>
            <li>איננו אחראים לכל נזק ישיר או עקיף שעלול להיגרם כתוצאה משימוש באתר.</li>
            <li>אחריותנו הכספית מוגבלת לסכום ששולם עבור השירות הספציפי.</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8 mb-4 text-gray-800">7. שינויים בתנאי השימוש</h2>
          <p className="text-gray-700">
            אנו שומרים את הזכות לשנות את תנאי השימוש בכל עת. שינויים אלה ייכנסו לתוקף מיד עם פרסומם באתר.
            המשך השימוש באתר לאחר פרסום השינויים מהווה הסכמה לתנאים החדשים.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4 text-gray-800">8. יצירת קשר</h2>
          <p className="text-gray-700">
            לכל שאלה או בירור בנוגע לתנאי השימוש, ניתן ליצור קשר עם צוות התמיכה שלנו באמצעות
            <Link to="/contact" className="text-primary-600 hover:text-primary-700"> טופס יצירת הקשר</Link>.
          </p>

          <div className="mt-10 pt-6 border-t border-gray-200">
            <p className="text-gray-500 text-sm">
              עודכן לאחרונה: 24 באפריל, 2025
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
