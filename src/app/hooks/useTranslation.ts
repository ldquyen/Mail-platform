import { useApp } from '../contexts/AppContext';
import { translations } from '../translations/index';

export function useTranslation() {
  const { language } = useApp();
  return translations[language];
}
