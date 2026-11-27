import { getCard } from '../data/cards';
import { getSpecies } from '../data/species';

export const MAX_DECK = 15;
export const MIN_DECK = 5;
export const MAX_INVOCACOES = 1;
export const MAX_COPIES = 3;
export const MAX_PARTY = 3;

/** Returns human-readable problems; an empty list means the deck is valid. */
export function validateDeck(
  cardIds: readonly string[],
  playerLevel: number,
  { allowIncomplete = false } = {}
): string[] {
  const errors: string[] = [];
  if (cardIds.length > MAX_DECK) errors.push(`O deck pode ter no máximo ${MAX_DECK} cartas.`);
  if (!allowIncomplete && cardIds.length < MIN_DECK)
    errors.push(`O deck precisa de pelo menos ${MIN_DECK} cartas.`);

  const counts = new Map<string, number>();
  let invocacoes = 0;
  for (const id of cardIds) {
    const card = getCard(id);
    counts.set(id, (counts.get(id) ?? 0) + 1);
    if (card.kind === 'invocacao') invocacoes += 1;
    if (card.requiredLevel > playerLevel) {
      errors.push(`${card.name} exige nível ${card.requiredLevel}.`);
    }
  }
  if (invocacoes > MAX_INVOCACOES) errors.push('O deck pode ter só 1 invocação.');
  for (const [id, n] of counts) {
    if (n > MAX_COPIES) errors.push(`No máximo ${MAX_COPIES} cópias de ${getCard(id).name}.`);
  }
  return [...new Set(errors)];
}

export function validateParty(speciesIds: readonly string[], playerLevel: number): string[] {
  const errors: string[] = [];
  if (speciesIds.length === 0) errors.push('Escolha pelo menos 1 pet.');
  if (speciesIds.length > MAX_PARTY) errors.push(`A equipe tem no máximo ${MAX_PARTY} pets.`);
  if (new Set(speciesIds).size !== speciesIds.length) errors.push('Não repita espécies na equipe.');
  for (const id of speciesIds) {
    const s = getSpecies(id);
    if (s.requiredLevel > playerLevel)
      errors.push(`${s.stages[0].name} exige nível ${s.requiredLevel}.`);
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
