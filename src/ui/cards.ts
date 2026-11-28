import { t } from '../i18n';
import {
  CARD_COLORS,
  MANA_INFO,
  MANA_TYPES,
  cardLore,
  cardName,
  describeEffect,
  manaName,
  manaShort,
  getCard,
  type CardDef,
  type ManaPool,
} from '../game/data/cards';
import {
  elementLabel,
  petElementLabel,
  strongAgainst,
  weakAgainst,
  type Element,
  type PetElement,
} from '../game/data/elements';
import { getSpecies, rarityLabel, stageLore } from '../game/data/species';
import { stageOf, statsFor } from '../game/rules/progression';
import { creatureThumbnail } from '../render/thumbnails';
import { cardArtwork } from '../render/cardArt';
import { esc } from './dom';
import { elementIcon, gameIcon } from './icons';

const elIcons = (list: Element[]) =>
  list
    .slice(0, 3)
    .map((e) => elementIcon(e, 15))
    .join('') || '—';

export function manaCost(cost: Partial<ManaPool>): string {
  const gems = MANA_TYPES.flatMap((t) =>
    Array.from(
      { length: cost[t] ?? 0 },
      () =>
        `<span class="gem" style="--c:${MANA_INFO[t].color}" title="${manaName(t)}">${manaShort(t)}</span>`
    )
  );
  return gems.join('') || '<span class="gem free">0</span>';
}

/**
 * Yu-Gi-Oh!-inspired TCG card frame with anime watercolor elegance:
 * - Header bar: Card Name + glowing circular Elemental Attribute Orb (top-right)
 * - Level/Tier Star row (★) or Spell/Summon badge
 * - Gold-beveled Artwork Window
 * - Parchment Effect & Lore Box with ATK / DEF stat bar & Battledome dice icon
 * - Mana Cost footer
 */
function cardFrame(o: {
  color: string;
  attrIcon: string;
  attrTitle: string;
  stars: number;
  typeLine: string;
  attack: string | number;
  defense: string | number;
  name: string;
  strong: string;
  weak: string;
  picture: string;
  text: string;
  lore: string;
  rarity: string;
  level: number;
  footer: string;
  extra?: string;
}): string {
  const starRow =
    o.stars > 0
      ? `<div class="card-stars">${'<span class="star">★</span>'.repeat(o.stars)}</div>`
      : `<div class="card-type-pill">${esc(o.typeLine)}</div>`;
  return `
  <div class="card ygo-card" style="--card:${o.color}">
    <div class="card-header">
      <span class="name">${esc(o.name)}</span>
      <span class="attr-orb" title="${esc(o.attrTitle)}">${o.attrIcon}</span>
    </div>
    ${starRow}
    <div class="card-pic">${o.picture}</div>
    <div class="card-box">
      <div class="card-type-line">[${esc(o.typeLine)}] <span class="card-vs" title="${t('strongVs')} / ${t('weakVs')}">▲${o.strong} ▼${o.weak}</span></div>
      <div class="card-text">${esc(o.text)}</div>
      <div class="card-lore">${esc(o.lore)}</div>
      <div class="card-stats">
        <span class="stat-atk">${gameIcon('atk', 14)} ATK/${o.attack}</span>
        <span class="stat-def">${gameIcon('def', 14)} DEF/${o.defense}</span>
      </div>
    </div>
    <div class="card-footer">
      <span class="card-rarity">${o.rarity} · ${t('lvShort', { n: o.level })}</span>
      <div class="card-cost">${o.footer}</div>
    </div>
    ${o.extra ?? ''}
  </div>`;
}

export function abilityCard(card: CardDef | string): string {
  const c = typeof card === 'string' ? getCard(card) : card;
  const isElem = c.element !== 'neutro';
  const el = (isElem ? c.element : 'neutro') as PetElement;
  const info = {
    name: isElem ? elementLabel(c.element as Element) : t('neutral'),
    icon: elementIcon(el, 22),
  };
  const e = c.effect;
  const attack =
    e.kind === 'dano' || e.kind === 'invocar' ? `${e.power}${gameIcon('dice', 13)}` : '–';
  const defense = e.kind === 'escudo' ? e.amount : e.kind === 'cura' ? `+${e.amount}` : '–';
  const art = cardArtwork(c);
  return cardFrame({
    color: c.kind === 'invocacao' ? CARD_COLORS.invocacao : CARD_COLORS.habilidade,
    attrIcon: info.icon,
    attrTitle: info.name,
    stars: c.kind === 'invocacao' ? 3 : 0,
    typeLine: `${info.name} · ${t(c.kind === 'invocacao' ? 'kindSummon' : 'kindAbility')}`,
    attack,
    defense,
    name: cardName(c),
    strong: isElem ? elIcons(strongAgainst(c.element as Element)) : '—',
    weak: isElem ? elIcons(weakAgainst(c.element as Element)) : '—',
    picture: art
      ? `<img class="mtg-art" src="${art}" alt="" />`
      : `<span class="pic-icon">${info.icon}</span>`,
    text: describeEffect(c.effect),
    lore: cardLore(c),
    rarity: rarityLabel(c.rarity),
    level: c.requiredLevel,
    footer: manaCost(c.cost),
  });
}

export function petCard(
  speciesId: string,
  level = 1,
  extra = '',
  element: PetElement = 'neutro'
): string {
  const sp = getSpecies(speciesId);
  const stage = stageOf(level);
  const stats = statsFor(sp, level);
  const icon = elementIcon(element, 22);
  const color = [CARD_COLORS.pet1, CARD_COLORS.pet2, CARD_COLORS.pet3][stage];
  const thumb = creatureThumbnail(speciesId, stage, element);
  return cardFrame({
    color,
    attrIcon: icon,
    attrTitle: petElementLabel(element),
    stars: level,
    typeLine: `${petElementLabel(element)} · ${t('petLevel', { n: level })}`,
    attack: `${stats.attack}${gameIcon('dice', 13)}`,
    defense: `${stats.defense}${gameIcon('dice', 13)}`,
    name: stats.name,
    strong:
      element === 'neutro'
        ? '—'
        : element === 'radioativo'
          ? '☢️ Hit-Kill'
          : elIcons(strongAgainst(element)),
    weak:
      element === 'neutro'
        ? '—'
        : element === 'radioativo'
          ? '−50% HP (Todos)'
          : elIcons(weakAgainst(element)),
    picture: thumb ? `<img src="${thumb}" alt="" />` : `<span class="pic-icon">${icon}</span>`,
    text: t('life', { n: stats.maxHp }),
    lore: stageLore(sp, stage),
    rarity: rarityLabel(sp.rarity),
    level: sp.requiredLevel,
    footer: `<span class="gem free">♥ ${stats.maxHp}</span>`,
    extra,
  });
}
