import type { PetElement } from '../game/data/elements';
import { petElementLabel } from '../game/data/elements';

/**
 * Original, universally recognizable hand-crafted SVG emblems for Elementa-Mon.
 * Crisp ink outlines, rich fantasy colors, zero system emoji inconsistency, zero external image weight.
 */
const ELEMENT_SVG: Record<PetElement, { bg: string; inner: string }> = {
  // Fogo: bold stylized flame with golden core
  fogo: {
    bg: '#d94826',
    inner: `
      <path d="M16 4c1 5 6 7 6 13a7.5 7.5 0 0 1-15 0c0-3.8 2.2-6.6 4-8.5.2 2.2 1.2 3.2 2.2 3.5-.6-3.2.5-6 2.8-8Z" fill="#ff9e2c" stroke="#2c1710" stroke-width="1.6" stroke-linejoin="round"/>
      <path d="M16 11.5c1.8 2 3.2 3.8 3.2 6.2a4.2 4.2 0 0 1-8.4 0c0-1.9 1-3.3 2.2-4.4.3 1.2 1 1.7 1.6 1.8-.3-1.5.2-2.7 1.4-3.6Z" fill="#fff294"/>`,
  },
  // Água: sculpted droplet with wave sheen
  agua: {
    bg: '#2b7bd6',
    inner: `
      <path d="M16 4.5C16 4.5 8 13.4 8 18.6a8 8 0 0 0 16 0C24 13.4 16 4.5 16 4.5Z" fill="#52c4ff" stroke="#132642" stroke-width="1.6" stroke-linejoin="round"/>
      <path d="M12.2 17.8c0 2.5 1.8 4.4 4.4 4.4 1.6 0 2.8-.6 3.5-1.5-1.4.4-2.8.1-4-1-1.3-1.2-1.8-2.9-1.6-4.8-1.4.8-2.3 1.8-2.3 2.9Z" fill="#d8f6ff"/>
      <circle cx="13.2" cy="14.2" r="1.4" fill="#ffffff"/>`,
  },
  // Elétrico: sharp lightning bolt
  eletrico: {
    bg: '#d49a16',
    inner: `
      <path d="M18.2 4L8.8 17h6.1l-1.5 11 9.8-13.6h-6.2L18.2 4Z" fill="#ffe44d" stroke="#2e2108" stroke-width="1.6" stroke-linejoin="round"/>
      <path d="M16.8 8.2L11.6 15.6h4.5l-.8 6.4 5.2-7.2h-4.4l.7-6.6Z" fill="#fffbe0"/>`,
  },
  // Terra: faceted mountain peak + emerald leaf
  terra: {
    bg: '#8a5d34',
    inner: `
      <path d="M4.5 23.5L12.2 9.5l4.4 7 3.4-4.5 7.5 11.5H4.5Z" fill="#c9955d" stroke="#2d1d12" stroke-width="1.6" stroke-linejoin="round"/>
      <path d="M12.2 9.5l3.2 5.2-2.6 1.2-2-1.4-2.4 1.5 3.8-6.5Z" fill="#f0d5a8"/>
      <path d="M19.2 12c2.8-2.4 6.2-2.2 6.8-1.8-.3 2.8-2.2 5.2-5.4 5.2-1.2 0-2-.5-2.4-1.1.3-.9.6-1.7 1-2.3Z" fill="#63c768" stroke="#1f3b1e" stroke-width="1.2"/>`,
  },
  // Gelo: 6-point crystalline frost prism
  gelo: {
    bg: '#4baec7',
    inner: `
      <g stroke="#163547" stroke-width="3.2" stroke-linecap="round">
        <path d="M16 5v22M6.5 10.5l19 11M25.5 10.5l-19 11"/>
      </g>
      <g stroke="#e8fbff" stroke-width="1.7" stroke-linecap="round">
        <path d="M16 5v22M6.5 10.5l19 11M25.5 10.5l-19 11"/>
        <path d="M13.5 7.5L16 10l2.5-2.5M13.5 24.5L16 22l2.5 2.5"/>
      </g>
      <polygon points="16,11.8 19.6,13.9 19.6,18.1 16,20.2 12.4,18.1 12.4,13.9" fill="#9df2ff" stroke="#163547" stroke-width="1.3"/>`,
  },
  // Venenoso: toxic bubbling droplet + fumes
  venenoso: {
    bg: '#7d38a8',
    inner: `
      <path d="M16 6.5c0 0-7.2 7.2-7.2 12.2a7.2 7.2 0 0 0 14.4 0c0-5-7.2-12.2-7.2-12.2Z" fill="#b866f2" stroke="#241033" stroke-width="1.6" stroke-linejoin="round"/>
      <circle cx="13.2" cy="19.5" r="2.1" fill="#a8ff6e" stroke="#241033" stroke-width="1"/>
      <circle cx="18.4" cy="17.2" r="1.5" fill="#d9ff9c" stroke="#241033" stroke-width="0.9"/>
      <circle cx="22.5" cy="9.2" r="2.2" fill="#c77dff" stroke="#241033" stroke-width="1.2"/>
      <circle cx="9.6" cy="10.2" r="1.6" fill="#a8ff6e" stroke="#241033" stroke-width="1.1"/>`,
  },
  // Psíquico: radiant mystic eye / mind spiral
  psiquico: {
    bg: '#c7438b',
    inner: `
      <path d="M4.5 16C7.6 10.6 11.6 8.5 16 8.5s8.4 2.1 11.5 7.5C24.4 21.4 20.4 23.5 16 23.5S7.6 21.4 4.5 16Z" fill="#ff9ed2" stroke="#361229" stroke-width="1.6" stroke-linejoin="round"/>
      <circle cx="16" cy="16" r="5" fill="#9c2fc7" stroke="#361229" stroke-width="1.4"/>
      <circle cx="16" cy="16" r="2.2" fill="#fff5b8"/>
      <circle cx="14.2" cy="14.2" r="1.1" fill="#ffffff"/>`,
  },
  // Fantasma: spectral wisp with glowing eyes
  fantasma: {
    bg: '#4e42a8',
    inner: `
      <path d="M16 5.5c-5 0-8.5 3.8-8.5 9v10.5l3.2-2.4 2.6 2.4 2.7-2.4 2.7 2.4 2.6-2.4 3.2 2.4V14.5c0-5.2-3.5-9-8.5-9Z" fill="#b4a8ff" stroke="#1e1747" stroke-width="1.6" stroke-linejoin="round"/>
      <ellipse cx="12.8" cy="14.8" rx="1.9" ry="2.5" fill="#1e1747"/>
      <ellipse cx="19.2" cy="14.8" rx="1.9" ry="2.5" fill="#1e1747"/>
      <circle cx="12.4" cy="14" r="0.8" fill="#8cf6ff"/>
      <circle cx="18.8" cy="14" r="0.8" fill="#8cf6ff"/>`,
  },
  // Fada: twin radiant butterfly wings + star sparkle
  fada: {
    bg: '#d96ca8',
    inner: `
      <path d="M15.6 15.2C13 9.2 6.5 7.5 5.5 11.8c-.8 3.2 2.4 5.8 5.8 5.6-3.2 1.2-4.2 4.6-2.1 6.4 2.2 1.9 5.4-.2 6.4-4.2Z" fill="#ffd1eb" stroke="#3d1730" stroke-width="1.4" stroke-linejoin="round"/>
      <path d="M16.4 15.2C19 9.2 25.5 7.5 26.5 11.8c.8 3.2-2.4 5.8-5.8 5.6 3.2 1.2 4.2 4.6 2.1 6.4-2.2 1.9-5.4-.2-6.4-4.2Z" fill="#ffd1eb" stroke="#3d1730" stroke-width="1.4" stroke-linejoin="round"/>
      <path d="M16 6.2l1.2 3.2 3.2 1.2-3.2 1.2L16 15l-1.2-3.2-3.2-1.2 3.2-1.2L16 6.2Z" fill="#fff6a8" stroke="#3d1730" stroke-width="1"/>`,
  },
  // Neutro: golden-ivory 4-point compass star emblem
  neutro: {
    bg: '#8c8070',
    inner: `
      <path d="M16 4.5l3.2 8.3 8.3 3.2-8.3 3.2L16 27.5l-3.2-8.3L4.5 16l8.3-3.2L16 4.5Z" fill="#fff4d6" stroke="#33281d" stroke-width="1.6" stroke-linejoin="round"/>
      <circle cx="16" cy="16" r="2.6" fill="#f5c95c" stroke="#33281d" stroke-width="1.1"/>`,
  },
  // Radioativo: neon-toxic radiation trefoil emblem
  radioativo: {
    bg: '#3a7d10',
    inner: `
      <path d="M16 16L10.5 6.8A10.5 10.5 0 0 1 21.5 6.8Z" fill="#b6ff2e" stroke="#182b08" stroke-width="1.2"/>
      <path d="M16 16L26.2 16A10.5 10.5 0 0 1 21.2 25.1Z" fill="#b6ff2e" stroke="#182b08" stroke-width="1.2"/>
      <path d="M16 16L10.8 25.1A10.5 10.5 0 0 1 5.8 16Z" fill="#b6ff2e" stroke="#182b08" stroke-width="1.2"/>
      <circle cx="16" cy="16" r="3" fill="#182b08" stroke="#b6ff2e" stroke-width="1.2"/>`,
  },
};

/** Returns an original, universally recognizable circular SVG emblem for any pet/card element. */
export function elementIcon(el: PetElement, size = 20): string {
  const e = ELEMENT_SVG[el] ?? ELEMENT_SVG.neutro;
  const label = petElementLabel(el);
  return `<svg class="em-icon em-el-${el}" width="${size}" height="${size}" viewBox="0 0 32 32" role="img" aria-label="${label}"><title>${label}</title><circle cx="16" cy="16" r="14.5" fill="${e.bg}" stroke="#2a1d18" stroke-width="1.8"/>${e.inner}</svg>`;
}

export type GameIconKind =
  'atk' | 'def' | 'dice' | 'follower' | 'bench' | 'coin' | 'food' | 'happy';

const GAME_SVG: Record<GameIconKind, string> = {
  atk: `<path d="M24 6l2 2-11.5 11.5 2.5 2.5-2 2-3.5-3.5-3.5 3.5-2-2 3.5-3.5L6 15l2-2 2.5 2.5L22 4l2 2Z" fill="#ff9e44" stroke="#2a1810" stroke-width="1.6" stroke-linejoin="round"/>`,
  def: `<path d="M16 4.5L6.5 8.5v7.5c0 6.2 4.1 10.6 9.5 12 5.4-1.4 9.5-5.8 9.5-12V8.5L16 4.5Z" fill="#63b5ff" stroke="#182a42" stroke-width="1.6" stroke-linejoin="round"/><path d="M16 8v16.5c3.4-1.1 6-4.2 6-8.5v-5.2L16 8Z" fill="#a8dcff"/>`,
  dice: `<rect x="5" y="5" width="22" height="22" rx="4.5" fill="#fff7e2" stroke="#2c1d14" stroke-width="1.8"/><circle cx="11" cy="11" r="2.1" fill="#2c1d14"/><circle cx="21" cy="11" r="2.1" fill="#2c1d14"/><circle cx="16" cy="16" r="2.1" fill="#d94826"/><circle cx="11" cy="21" r="2.1" fill="#2c1d14"/><circle cx="21" cy="21" r="2.1" fill="#2c1d14"/>`,
  follower: `<circle cx="16" cy="19.5" r="5.2" fill="#ffd464" stroke="#2e1d10" stroke-width="1.5"/><circle cx="9.2" cy="13.5" r="2.6" fill="#ffd464" stroke="#2e1d10" stroke-width="1.4"/><circle cx="14" cy="9.5" r="2.6" fill="#ffd464" stroke="#2e1d10" stroke-width="1.4"/><circle cx="18.8" cy="9.5" r="2.6" fill="#ffd464" stroke="#2e1d10" stroke-width="1.4"/><circle cx="22.8" cy="13.5" r="2.6" fill="#ffd464" stroke="#2e1d10" stroke-width="1.4"/>`,
  bench: `<rect x="4.5" y="9" width="23" height="16.5" rx="3" fill="#b57a44" stroke="#2b190d" stroke-width="1.7"/><path d="M4.5 14h23" stroke="#2b190d" stroke-width="1.7"/><rect x="13" y="12" width="6" height="5" rx="1.2" fill="#f4cb5b" stroke="#2b190d" stroke-width="1.4"/><path d="M10.5 9V7a2.5 2.5 0 0 1 2.5-2.5h6A2.5 2.5 0 0 1 21.5 7v2" fill="none" stroke="#2b190d" stroke-width="1.8"/>`,
  coin: `<circle cx="16" cy="16" r="11.5" fill="#f7c844" stroke="#472b0c" stroke-width="1.8"/><circle cx="16" cy="16" r="7.8" fill="#ffe484" stroke="#b87a1c" stroke-width="1.3"/><path d="M16 11v10M13 13.5h6M13 18.5h6" stroke="#8c5412" stroke-width="1.6" stroke-linecap="round"/>`,
  food: `<path d="M16 10.5c-4.5-1.5-8.5 1.8-8.5 6.8 0 4.8 3.6 9.2 7.2 9.2 1 0 1.3-.4 1.3-.4s.3.4 1.3.4c3.6 0 7.2-4.4 7.2-9.2 0-5-4-8.3-8.5-6.8Z" fill="#e84a43" stroke="#301312" stroke-width="1.6"/><path d="M16 10.5c.4-2.8 2-4.5 4.2-4.8-.2 2.4-1.6 4.2-4.2 4.8Z" fill="#63c768" stroke="#1e3d1e" stroke-width="1.3"/>`,
  happy: `<circle cx="16" cy="16" r="11.5" fill="#ffdf6b" stroke="#38240c" stroke-width="1.7"/><circle cx="12" cy="14" r="1.6" fill="#38240c"/><circle cx="20" cy="14" r="1.6" fill="#38240c"/><path d="M11 18.8c1.4 2.6 8.6 2.6 10 0" fill="none" stroke="#38240c" stroke-width="1.9" stroke-linecap="round"/>`,
};

/** Returns an original universal SVG icon for common RPG/TCG concepts (ATK, DEF, Dice, Follower, Bench, Coin, Food, Happy). */
export function gameIcon(kind: GameIconKind, size = 16): string {
  return `<svg class="em-icon em-ico-${kind}" width="${size}" height="${size}" viewBox="0 0 32 32" aria-hidden="true">${GAME_SVG[kind]}</svg>`;
}
