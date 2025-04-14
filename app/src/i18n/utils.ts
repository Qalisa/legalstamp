import { defaultLang, ui } from './ui';

export function getLangFromUrl(url: URL) {
  const [, lang] = url.pathname.split('/');
  if (lang in ui) return lang as keyof typeof ui;
  return defaultLang;
}

export function useTranslations(lang: keyof typeof ui) {
  return function t(key: keyof typeof ui[typeof defaultLang]) {
    //@ts-expect-error allow not to find a translation on lang, to resort to default one
    return ui[lang][key] || ui[defaultLang][key];
  }
}