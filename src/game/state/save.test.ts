import { describe, expect, it } from 'vitest';
import { defaultSave, loadSave, SAVE_KEY, writeSave, type KeyValueStorage } from './save';

function memory(): KeyValueStorage & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => {
      data.set(k, v);
    },
  };
}

describe('save', () => {
  it('volta ao padrão quando não há save ou ele está corrompido', () => {
    const store = memory();
    expect(loadSave(store)).toEqual(defaultSave());
    store.setItem(SAVE_KEY, '{nope');
    expect(loadSave(store)).toEqual(defaultSave());
  });

  it('grava e lê completando campos novos', () => {
    const store = memory();
    const save = defaultSave();
    save.playerXp = 33;
    writeSave(save, store);
    const partial = JSON.parse(store.data.get(SAVE_KEY) as string);
    delete partial.settings.fpsCap;
    store.setItem(SAVE_KEY, JSON.stringify(partial));
    const loaded = loadSave(store);
    expect(loaded.playerXp).toBe(33);
    expect(loaded.settings.fpsCap).toBe(60);
  });
});
