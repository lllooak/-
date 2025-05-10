import React from 'react';
import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';

export function LanguageToggle() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'he' : 'en';
    i18n.changeLanguage(newLang);
    document.documentElement.dir = newLang === 'he' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
  };

  return (
    <button
      onClick={toggleLanguage}
      className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
      title={i18n.language === 'en' ? 'Switch to Hebrew' : 'החלף לאנגלית'}
    >
      <Languages className="h-5 w-5" />
    </button>
  );
}
