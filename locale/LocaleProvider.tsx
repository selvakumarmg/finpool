import React, { createContext, useContext, useCallback, ReactNode, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import appConfig, { SupportedLanguage } from '@/config/appConfig';
import { RootState } from '@/store';
import { setLanguage } from '@/store/slices/settingsSlice';
import { getTranslation, supportedLanguages, TranslationKey } from './translations';

type TranslateFn = (key: TranslationKey, params?: Record<string, string | number>) => string;

type LocaleContextValue = {
  language: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => void;
  t: TranslateFn;
  supportedLanguages: readonly SupportedLanguage[];
};

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

export const LocaleProvider = ({ children }: { children: ReactNode }) => {
  const dispatch = useDispatch();
  const language = useSelector((state: RootState) => state.settings.language);

  const normalizedLanguage = useMemo<SupportedLanguage>(() => {
    const candidate = language as unknown as string;
    if ((supportedLanguages as readonly string[]).includes(candidate)) {
      return candidate as SupportedLanguage;
    }
    return appConfig.localization.defaultLanguage as SupportedLanguage;
  }, [language]);

  const handleSetLanguage = useCallback(
    (nextLanguage: SupportedLanguage) => {
      dispatch(setLanguage(nextLanguage));
    },
    [dispatch]
  );

  useEffect(() => {
    const candidate = language as unknown as string;
    if (!(supportedLanguages as readonly string[]).includes(candidate)) {
      handleSetLanguage(appConfig.localization.defaultLanguage as SupportedLanguage);
    }
  }, [handleSetLanguage, language]);

  const translate: TranslateFn = useCallback(
    (key, params) => getTranslation(normalizedLanguage, key, params),
    [normalizedLanguage]
  );

  return (
    <LocaleContext.Provider
      value={{
        language: normalizedLanguage,
        setLanguage: handleSetLanguage,
        t: translate,
        supportedLanguages,
      }}
    >
      {children}
    </LocaleContext.Provider>
  );
};

export const useLocale = () => {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
};

export const useTranslation = () => {
  const { t } = useLocale();
  return t;
};

