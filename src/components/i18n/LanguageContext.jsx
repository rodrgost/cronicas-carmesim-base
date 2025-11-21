import React, { createContext, useContext, useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import ptTranslations from './translations/pt';
import enTranslations from './translations/en';

const translations = {
  pt: ptTranslations,
  en: enTranslations
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('pt');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load language preference from user entity
    const loadUserLanguage = async () => {
      try {
        const user = await base44.auth.me();
        if (user?.language) {
          setLanguage(user.language);
        }
      } catch (error) {
        console.log("User not authenticated, using default language");
      } finally {
        setIsLoading(false);
      }
    };

    loadUserLanguage();
  }, []);

  const t = (key, replacements = {}) => {
    const keys = key.split('.');
    let value = translations[language];

    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return key; // Return key if translation not found
      }
    }

    if (typeof value === 'string') {
      // Replace placeholders like {{npcName}}
      return value.replace(/\{\{(\w+)\}\}/g, (match, placeholder) => {
        return replacements[placeholder] || match;
      });
    }

    return key; // Return key if translation not found
  };

  const changeLanguage = async (newLanguage) => {
    if (translations[newLanguage]) {
      setLanguage(newLanguage);
      
      // Save to user entity
      try {
        await base44.auth.updateMe({ language: newLanguage });
      } catch (error) {
        console.error("Error saving language preference:", error);
      }
    }
  };

  return (
    <LanguageContext.Provider value={{ language, t, changeLanguage, isLoading }}>
      {isLoading ? null : children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}