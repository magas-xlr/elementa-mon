import { t } from '../../i18n';
import { cardName, getCard } from '../data/cards';
import { getSpecies, stageName } from '../data/species';

export const MAX_DECK = 15;
export const MIN_DECK = 5;
export const MAX_INVOCACOES = 1;
export const MAX_COPIES = 3;
export const MAX_PARTY = 4;

/** Returns human-readable problems; an empty list means the deck is valid. */
export function validateDeck(
  cardIds: readonly string[],
  playerLevel: number,
  { allowIncomplete = false } = {}
): string[] {
  const errors: string[] = [];
  if (cardIds.length > MAX_DECK) errors.push(t('errDeckMax', { n: MAX_DECK }));
  if (!allowIncomplete && cardIds.length < MIN_DECK) errors.push(t('errDeckMin', { n: MIN_DECK }));

  const counts = new Map<string, number>();
  let invocacoes = 0;
  for (const id of cardIds) {
    const card = getCard(id);
    counts.set(id, (counts.get(id) ?? 0) + 1);
    if (card.kind === 'invocacao') invocacoes += 1;
    if (card.requiredLevel > playerLevel) {
      errors.push(t('errNeedsLevel', { name: cardName(card), n: card.requiredLevel }));
    }
  }
  if (invocacoes > MAX_INVOCACOES) errors.push(t('errOneSummon'));
  for (const [id, n] of counts) {
    if (n > MAX_COPIES) errors.push(t('errMaxCopies', { n: MAX_COPIES, name: cardName(id) }));
  }
  return [...new Set(errors)];
}

export function validateParty(speciesIds: readonly string[], playerLevel: number): string[] {
  const errors: string[] = [];
  if (speciesIds.length === 0) errors.push(t('errNoPet'));
  if (speciesIds.length > MAX_PARTY) errors.push(t('errPartyMax', { n: MAX_PARTY }));
  if (new Set(speciesIds).size !== speciesIds.length) errors.push(t('errRepeatSpecies'));
  for (const id of speciesIds) {
    const s = getSpecies(id);
    if (s.requiredLevel > playerLevel)
      errors.push(t('errNeedsLevel', { name: stageName(s, 0), n: s.requiredLevel }));
  }
  return errors;
}

/** Can this card be added to the deck without breaking a rule? */
export function canAddCard(
  cardIds: readonly string[],
  cardId: string,
  playerLevel: number
): boolean {
  return validateDeck([...cardIds, cardId], playerLevel, { allowIncomplete: true }).length === 0;
}
