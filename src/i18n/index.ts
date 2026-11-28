import type { ManaType } from '../game/data/cards';
import type { Element } from '../game/data/elements';
import type { Rarity } from '../game/data/species';
import { de } from './de';
import { en } from './en';
import { es } from './es';
import { fr } from './fr';
import { pt } from './pt';
import { ru } from './ru';
import { zh } from './zh';

export type UiKey = keyof typeof pt.ui;

/**
 * One language. `ui` and `tutorial` are complete; content tables may be partial and fall
 * back to the Portuguese game data. Pet names stay as proper nouns except where `names` gives
 * a version in another script (Chinese, Russian).
 */
export interface Locale {
  ui: Record<UiKey, string>;
  tutorial: { title: string; text: string }[];
  /** Species id → localized names of stages 1–3 (only where the Latin name doesn't fit). */
  names?: Record<string, [string, string, string]>;
  /** Card id → [name, lore]. */
  cards?: Record<string, [string, string]>;
  /** Species id → lore of stages 1, 2 and 3. */
  species?: Record<string, [string, string, string]>;
  /** Relic id → [name, description]. */
  relics?: Record<string, [string, string]>;
  elements?: Record<Element, string>;
  /** Mana type → [name, one-letter short]. */
  mana?: Record<ManaType, [string, string]>;
  rarity?: Record<Rarity, string>;
  /** Avatar color names, in AVATAR_COLORS order. */
  colors?: string[];
}

export const LANGS = ['en', 'zh', 'ru', 'es', 'pt', 'de', 'fr'] as const;
export type Lang = (typeof LANGS)[number];

/** Each language written in itself, for the selector. */
export const LANG_NAMES: Record<Lang, string> = {
  en: 'English',
  zh: '简体中文',
  ru: 'Русский',
  es: 'Español',
  pt: 'Português',
  de: 'Deutsch',
  fr: 'Français',
};

/** BCP 47 tag for `<html lang>` and number formatting. */
export const LANG_TAGS: Record<Lang, string> = {
  en: 'en',
  zh: 'zh-Hans',
  ru: 'ru',
  es: 'es',
  pt: 'pt-BR',
  de: 'de',
  fr: 'fr',
};

export const LOCALES: Record<Lang, Locale> = { en, zh, ru, es, pt, de, fr };

let current: Lang = 'pt';

export const getLang = (): Lang => current;

export function setLang(lang: Lang): void {
  current = LANGS.includes(lang) ? lang : 'en';
  if (typeof document !== 'undefined') document.documentElement.lang = LANG_TAGS[current];
}

export const isLang = (v: unknown): v is Lang => LANGS.includes(v as Lang);

/** Picks the first supported language from the browser/OS list; English otherwise. */
export function detectLang(
  preferred: readonly string[] = globalThis.navigator?.languages ?? []
): Lang {
  for (const tag of preferred) {
    const base = tag.toLowerCase().split('-')[0];
    if (isLang(base)) return base;
  }
  return 'en';
}

const locale = () => LOCALES[current];

/** Translates a UI key and fills `{placeholders}`. */
export function t(key: UiKey, params: Record<string, string | number> = {}): string {
  const text = locale().ui[key] ?? pt.ui[key];
  return text.replace(/\{(\w+)\}/g, (m, name: string) =>
    name in params ? String(params[name]) : m
  );
}

export const tutorialPages = () => locale().tutorial;

export const cardText = (id: string): [string, string] | undefined => locale().cards?.[id];
export const speciesName = (id: string, stage: number): string | undefined =>
  locale().names?.[id]?.[stage];
export const speciesLore = (id: string, stage: number): string | undefined =>
  locale().species?.[id]?.[stage];
export const relicText = (id: string): [string, string] | undefined => locale().relics?.[id];
export const elementName = (e: Element): string | undefined => locale().elements?.[e];
export const manaText = (m: ManaType): [string, string] | undefined => locale().mana?.[m];
export const rarityName = (r: Rarity): string | undefined => locale().rarity?.[r];
export const colorName = (index: number): string | undefined => locale().colors?.[index];
