import { afterEach, describe, expect, it } from 'vitest';
import { CARDS, describeEffect, MANA_TYPES } from '../game/data/cards';
import { ELEMENTS } from '../game/data/elements';
import { RELICS } from '../game/data/relics';
import { SPECIES } from '../game/data/species';
import { AVATAR_COLORS } from '../game/rules/progression';
import { validateDeck } from '../game/rules/deck';
import { LANGS, LOCALES, detectLang, setLang, t, type UiKey } from './index';
import { pt } from './pt';

const placeholders = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

afterEach(() => setLang('pt'));

describe('idiomas', () => {
  it('tem os 7 idiomas pedidos', () => {
    expect([...LANGS].sort()).toEqual(['de', 'en', 'es', 'fr', 'pt', 'ru', 'zh']);
  });

  for (const lang of LANGS) {
    const loc = LOCALES[lang];
    it(`${lang}: textos completos e com os mesmos marcadores`, () => {
      for (const key of Object.keys(pt.ui) as UiKey[]) {
        expect(loc.ui[key], `${lang}.${key}`).toBeTruthy();
        expect(placeholders(loc.ui[key]), `${lang}.${key}`).toEqual(placeholders(pt.ui[key]));
      }
      expect(loc.tutorial).toHaveLength(pt.tutorial.length);
    });

    if (lang === 'pt') continue;
    it(`${lang}: traduz todas as cartas, pets, relíquias e nomes de dados`, () => {
      for (const c of CARDS) expect(loc.cards?.[c.id], c.id).toHaveLength(2);
      for (const s of SPECIES) expect(loc.species?.[s.id], s.id).toHaveLength(3);
      for (const r of RELICS) expect(loc.relics?.[r.id], r.id).toHaveLength(2);
      for (const e of ELEMENTS) expect(loc.elements?.[e], e).toBeTruthy();
      for (const m of MANA_TYPES) expect(loc.mana?.[m], m).toHaveLength(2);
      expect(loc.colors).toHaveLength(AVATAR_COLORS.length);
      if (loc.names) for (const s of SPECIES) expect(loc.names[s.id], s.id).toHaveLength(3);
    });
  }

  it('preenche marcadores e troca de idioma em tempo real', () => {
    setLang('en');
    expect(t('biomeHud', { name: 'Sky Fortress', n: 2, max: 7 })).toBe('Sky Fortress · 2/7 biomes');
    expect(describeEffect({ kind: 'dano', power: 3, area: true })).toBe(
      'Deals 3 damage to all enemies.'
    );
    expect(validateDeck(['investida'], 1).join()).toContain('at least 5');
    setLang('zh');
    expect(t('round', { n: 4 })).toBe('第 4 回合');
  });

  it('detecta o idioma do sistema', () => {
    expect(detectLang(['pt-BR'])).toBe('pt');
    expect(detectLang(['zh-CN', 'en'])).toBe('zh');
    expect(detectLang(['ja-JP', 'ru-RU'])).toBe('ru');
    expect(detectLang(['ja-JP'])).toBe('en');
    expect(detectLang([])).toBe('en');
  });
});
