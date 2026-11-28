import { describe, expect, it } from 'vitest';
import {
  ampCurve,
  ecoMusicProfile,
  noteFreq,
  parseBar,
  trackInfo,
  trackProblems,
  type TrackId,
} from './music';

describe('trilha FM', () => {
  it('converte nomes de notas em frequência', () => {
    expect(noteFreq('A4')).toBeCloseTo(440);
    expect(noteFreq('A5')).toBeCloseTo(880);
    expect(noteFreq('C#4')).toBeCloseTo(noteFreq('Db4'));
  });

  it('junta "-" à nota anterior e ignora pausas', () => {
    expect(parseBar('C5 - - . E5 -', 16)).toEqual([
      { step: 16, note: 'C5', length: 3 },
      { step: 20, note: 'E5', length: 2 },
    ]);
  });

  it('todas as faixas têm notas válidas e compassos de 16 passos', () => {
    const ids: TrackId[] = [
      'menu',
      'mundo',
      'mundo2',
      'mundo3',
      'mundo4',
      'mundo5',
      'mundo6',
      'mundo7',
      'batalha',
      'chefe',
      'vitoria',
    ];
    for (const id of ids) {
      const info = trackInfo(id);
      expect(info.bpm).toBeGreaterThan(100);
      expect(info.bars).toBeGreaterThan(0);
    }
    expect(trackProblems()).toEqual([]);
  });

  it('rock: explorar é mais calmo, batalhas e chefe têm mais distorção e riffs abafados', () => {
    const world: TrackId[] = ['mundo', 'mundo2', 'mundo3', 'mundo4', 'mundo5'];
    for (const id of world) {
      expect(trackInfo(id).drive).toBeLessThan(trackInfo('batalha').drive);
      expect(trackInfo(id).rhythm).not.toBe('chug');
    }
    expect(trackInfo('chefe').drive).toBe(1);
    expect(trackInfo('batalha').rhythm).toBe('chug');
    expect(trackInfo('chefe').rhythm).toBe('chug');
  });

  it('curva do amp satura sem passar de ±1', () => {
    const clean = ampCurve(0, 101);
    const metal = ampCurve(1, 101);
    expect(metal[100]).toBeCloseTo(1);
    expect(metal[0]).toBeCloseTo(-1);
    expect(metal[50]).toBeCloseTo(0);
    // At 30% input, high gain is much closer to full scale than clean.
    expect(metal[65]).toBeGreaterThan(clean[65]);
    expect(Math.max(...metal.map(Math.abs))).toBeLessThanOrEqual(1.000001);
  });

  it('música fica mais lenta, grave, macabra e vazia conforme o ambiente é destruído', () => {
    const healthy = ecoMusicProfile(100);
    const damaged = ecoMusicProfile(40);
    const voidState = ecoMusicProfile(5);

    expect(healthy.tempoScale).toBe(1);
    expect(healthy.voidDrone).toBe(0);
    expect(healthy.dropDrums).toBe(false);

    expect(damaged.tempoScale).toBeLessThan(healthy.tempoScale);
    expect(damaged.pitchSemis).toBeLessThan(0);
    expect(damaged.filterCutoff).toBeLessThan(healthy.filterCutoff);

    expect(voidState.tempoScale).toBeLessThan(0.55);
    expect(voidState.voidDrone).toBeGreaterThan(0);
    expect(voidState.dropDrums).toBe(true);
    expect(voidState.moodLabel).toBe('Vazio Existencial');
  });
});
