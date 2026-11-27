import {
  CARD_COLORS,
  MANA_INFO,
  MANA_TYPES,
  describeEffect,
  getCard,
  type CardDef,
  type ManaPool,
} from '../game/data/cards';
import { ELEMENT_INFO, strongAgainst, weakAgainst, type Element } from '../game/data/elements';
import { getSpecies, type Rarity } from '../game/data/species';
import { stageOf, statsFor } from '../game/rules/progression';
import { creatureThumbnail } from '../render/thumbnails';
import { esc } from './dom';

const RARITY: Record<Rarity, string> = {
  comum: 'Comum',
  raro: 'Raro',
  epico: 'Épico',
  lendario: 'Lendário',
};

const elIcons = (list: Element[]) =>
  list
    .slice(0, 3)
    .map((e) => ELEMENT_INFO[e].icon)
    .join('') || '—';

export function manaCost(cost: Partial<ManaPool>): string {
  const gems = MANA_TYPES.flatMap((t) =>
    Array.from(
      { length: cost[t] ?? 0 },
      () =>
        `<span class="gem" style="--c:${MANA_INFO[t].color}" title="${MANA_INFO[t].name}">${MANA_INFO[t].short}</span>`
    )
  );
  return gems.join('') || '<span class="gem free">0</span>';
}

/**
 * Card layout from the wiki: attack (left) · name (center) · defense (right), strong/weak
 * elements, picture, element, lore, rarity + required player level, mana cost at the bottom.
 */
function cardFrame(o: {
  color: string;
  attack: string | number;
  defense: string | number;
  name: string;
  strong: string;
  weak: string;
  picture: string;
  element: string;
  text: string;
  lore: string;
  rarity: string;
  level: number;
  footer: string;
  extra?: string;
}): string {
  return `
  <div class="card" style="--card:${o.color}">
    <div class="card-top"><b class="atk">${o.attack}</b><span class="name">${esc(o.name)}</span><b class="def">${o.defense}</b></div>
    <div class="card-elems"><span title="Forte contra">▲${o.strong}</span><span title="Fraco contra">▼${o.weak}</span></div>
    <div class="card-pic">${o.picture}</div>
    <div class="card-elem">${o.element}</div>
    <div class="card-text">${esc(o.text)}</div>
    <div class="card-lore">${esc(o.lore)}</div>
    <div class="card-meta"><span>${o.rarity}</span><span>Nv ${o.level}</span></div>
    <div class="card-cost">${o.footer}</div>
    ${o.extra ?? ''}
  </div>`;
}

export function abilityCard(card: CardDef | string): string {
  const c = typeof card === 'string' ? getCard(card) : card;
  const isElem = c.element !== 'neutro';
  const info = isElem ? ELEMENT_INFO[c.element as Element] : { name: 'Neutro', icon: '✦' };
  const e = c.effect;
  const attack = e.kind === 'dano' || e.kind === 'invocar' ? e.power : '–';
  const defense = e.kind === 'escudo' ? e.amount : e.kind === 'cura' ? `+${e.amount}` : '–';
  return cardFrame({
    color: c.kind === 'invocacao' ? CARD_COLORS.invocacao : CARD_COLORS.habilidade,
    attack,
    defense,
    name: c.name,
    strong: isElem ? elIcons(strongAgainst(c.element as Element)) : '—',
    weak: isElem ? elIcons(weakAgainst(c.element as Element)) : '—',
    picture: `<span class="pic-icon">${info.icon}</span>`,
    element: `${info.name} · ${c.kind === 'invocacao' ? 'Invocação' : 'Habilidade'}`,
    text: describeEffect(c.effect),
    lore: c.lore,
    rarity: RARITY[c.rarity],
    level: c.requiredLevel,
    footer: manaCost(c.cost),
  });
}

export function petCard(speciesId: string, level = 1, extra = ''): string {
  const sp = getSpecies(speciesId);
  const stage = stageOf(level);
  const stats = statsFor(sp, level);
  const info = ELEMENT_INFO[sp.element];
  const color = [CARD_COLORS.pet1, CARD_COLORS.pet2, CARD_COLORS.pet3][stage];
  const thumb = creatureThumbnail(speciesId, stage);
  return cardFrame({
    color,
    attack: stats.attack,
    defense: stats.defense,
    name: stats.name,
    strong: elIcons(strongAgainst(sp.element)),
    weak: elIcons(weakAgainst(sp.element)),
    picture: thumb ? `<img src="${thumb}" alt="" />` : `<span class="pic-icon">${info.icon}</span>`,
    element: `${info.icon} ${info.name} · Pet nv ${level}`,
    text: `Vida ${stats.maxHp}`,
    lore: sp.stages[stage].lore,
    rarity: RARITY[sp.rarity],
    level: sp.requiredLevel,
    footer: `<span class="gem free">♥ ${stats.maxHp}</span>`,
    extra,
  });
}
