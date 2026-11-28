import { audio } from '../audio';
import { ELEMENTS, ELEMENT_INFO, elementLabel } from '../game/data/elements';
import { int, pick } from '../game/rules/rng';
import type { RunState } from '../game/state/run';
import { esc, toast } from './dom';

/**
 * Fairground / Arcade Games Shop ("🎪 Feirinha da Sorte") in Vila da Brisa:
 * 1. 🎡 Roleta de Prêmios (Prize Wheel)
 * 2. 🎫 Raspadinha (Interactive 3×3 Scratch Card)
 * 3. 🔨 Teste de Força com Marreta (Timing-bar High-Striker)
 * 4. 🎟️ Loteria da Vila (Pick 3 lucky numbers 1..15)
 */

export type ArcadeGameId = 'roleta' | 'raspadinha' | 'marreta' | 'loteria';

interface WheelSlice {
  label: string;
  color: string;
  apply(run: RunState): string;
}

const WHEEL_SLICES: readonly WheelSlice[] = [
  {
    label: '🪙 +60',
    color: '#f4c84c',
    apply: (run) => {
      run.coins += 60;
      return '🎉 Jackpot na Roleta! Ganhou 🪙 60 moedas!';
    },
  },
  {
    label: '🧪 Poção',
    color: '#5cd685',
    apply: (run) => {
      run.potions += 1;
      return '🧪 Ganhou 1 Poção de cura na Roleta!';
    },
  },
  {
    label: '💎 Cristal',
    color: '#6bb8ff',
    apply: (run) => {
      const el = pick(run.rng, [...ELEMENTS]);
      run.crystals[el] = (run.crystals[el] ?? 0) + 1;
      return `💎 Ganhou um Cristal de ${elementLabel(el)}!`;
    },
  },
  {
    label: '✨ +15 Beleza',
    color: '#ff8ec8',
    apply: (run) => {
      for (const p of run.party) p.beauty = Math.min(100, (p.beauty ?? 20) + 15);
      return '✨ Brilho mágico! Todos os pets ganharam +15 de Beleza!';
    },
  },
  {
    label: '🍎 Lanche',
    color: '#ff8e52',
    apply: (run) => {
      for (const p of run.party) p.hunger = Math.min(100, (p.hunger ?? 100) + 40);
      return '🍎 Prêmio saboroso! Toda a equipe recuperou +40% de fome!';
    },
  },
  {
    label: '🪙 +5',
    color: '#7a7696',
    apply: (run) => {
      run.coins += 5;
      return '😅 Quase lá! Prêmio de consolação: 🪙 5 moedas.';
    },
  },
];

const SCRATCH_SYMBOLS = ['🪙', '💎', '⭐', '🍀'] as const;

export interface ArcadeController {
  render(container: HTMLElement): void;
  dispose(): void;
}

export function createArcadeController(
  run: RunState,
  onCoinsChanged: () => void
): ArcadeController {
  let active: ArcadeGameId = 'roleta';
  let wheelAngle = 0;
  let spinning = false;

  // Scratch card state (3×3 grid)
  let scratchCells: string[] | null = null;
  let scratchRevealed: boolean[] = [];
  let scratchDone = false;

  // Hammer timing bar state
  let hammerActive = false;
  let hammerPos = 0;
  let hammerDir = 1;
  let hammerRaf = 0;
  let hammerResult = '';

  // Lottery state
  const lottoPicks = new Set<number>();
  let lottoDrawn: number[] | null = null;
  let lottoResult = '';

  let rootEl: HTMLElement | null = null;

  const stopHammer = () => {
    if (hammerRaf) cancelAnimationFrame(hammerRaf);
    hammerRaf = 0;
    hammerActive = false;
  };

  const render = (container: HTMLElement) => {
    rootEl = container;
    stopHammer();

    const subTabs: [ArcadeGameId, string][] = [
      ['roleta', '🎡 Roleta (🪙 20)'],
      ['raspadinha', '🎫 Raspadinha (🪙 15)'],
      ['marreta', '🔨 Marreta (🪙 10)'],
      ['loteria', '🎟️ Loteria (🪙 15)'],
    ];

    let gameHtml: string;

    if (active === 'roleta') {
      const segs = WHEEL_SLICES.map((s, i) => {
        const a0 = (i / WHEEL_SLICES.length) * 360;
        const a1 = ((i + 1) / WHEEL_SLICES.length) * 360;
        return `${s.color} ${a0}deg ${a1}deg`;
      }).join(', ');
      gameHtml = `
        <div class="arcade-box wheel-box">
          <div class="wheel-wrap">
            <div class="wheel-pointer">▼</div>
            <div class="wheel-disc" style="background:conic-gradient(${segs}); transform:rotate(${wheelAngle}deg)">
              ${WHEEL_SLICES.map((s, i) => {
                const mid = ((i + 0.5) / WHEEL_SLICES.length) * 360;
                return `<span class="wheel-lbl" style="transform:rotate(${mid}deg) translateY(-58px)">${s.label}</span>`;
              }).join('')}
            </div>
          </div>
          <button class="primary" data-arc="spin" ${spinning || run.coins < 20 ? 'disabled' : ''}>🎡 Girar Roleta (🪙 20)</button>
        </div>`;
    } else if (active === 'raspadinha') {
      gameHtml = `
        <div class="arcade-box">
          <p class="hint">Raspe as 9 casinhas! Combine <b>3 símbolos iguais</b> para ganhar prêmios (🪙 +75, Poção ou Cristal).</p>
          ${
            scratchCells
              ? `<div class="scratch-grid">
                  ${scratchCells
                    .map(
                      (sym, i) =>
                        `<button class="scratch-cell ${scratchRevealed[i] ? 'open' : ''}" data-scratch="${i}" ${scratchRevealed[i] ? 'disabled' : ''}>${scratchRevealed[i] ? sym : '✦'}</button>`
                    )
                    .join('')}
                </div>
                ${scratchDone ? `<button class="primary" data-arc="new-scratch" ${run.coins < 15 ? 'disabled' : ''}>🎫 Comprar outra Raspadinha (🪙 15)</button>` : ''}`
              : `<button class="primary" data-arc="new-scratch" ${run.coins < 15 ? 'disabled' : ''}>🎫 Comprar Raspadinha (🪙 15)</button>`
          }
        </div>`;
    } else if (active === 'marreta') {
      gameHtml = `
        <div class="arcade-box hammer-box">
          <p class="hint">Acerte o botão <b>🔨 BATER!</b> quando a barra atingir a zona dourada do sino (🔔)!</p>
          <div class="hammer-tower">
            <div class="hammer-bell">🔔</div>
            <div class="hammer-track">
              <div class="hammer-zone"></div>
              <div class="hammer-fill" style="height:${Math.round(hammerPos * 100)}%"></div>
            </div>
          </div>
          ${hammerResult ? `<p class="evolve">${esc(hammerResult)}</p>` : ''}
          <div class="row">
            <button class="primary" data-arc="hammer-go" ${run.coins < 10 ? 'disabled' : ''}>🔨 Começar (🪙 10)</button>
            <button class="primary" data-arc="hammer-hit" hidden>💥 BATER AGORA!</button>
          </div>
        </div>`;
    } else {
      const nums = Array.from({ length: 15 }, (_, i) => i + 1);
      gameHtml = `
        <div class="arcade-box">
          <p class="hint">Escolha <b>3 números da sorte</b> (1 a 15). 1 acerto: 🪙 20 · 2 acertos: 🪙 80 · 3 acertos: 🪙 300 + 💎!</p>
          <div class="lotto-grid">
            ${nums
              .map((n) => {
                const on = lottoPicks.has(n);
                const hit = lottoDrawn?.includes(n);
                return `<button class="lotto-num ${on ? 'on' : ''} ${hit ? 'drawn' : ''}" data-lotto="${n}">${n}</button>`;
              })
              .join('')}
          </div>
          ${lottoDrawn ? `<p class="evolve">🎲 Sorteados: ${lottoDrawn.join(' · ')} — ${esc(lottoResult)}</p>` : ''}
          <button class="primary" data-arc="lotto-draw" ${lottoPicks.size !== 3 || run.coins < 15 ? 'disabled' : ''}>🎟️ Sortear Loteria (🪙 15)</button>
        </div>`;
    }

    container.innerHTML = `
      <div class="arcade-wrap">
        <div class="town-tabs">
          ${subTabs.map(([id, lbl]) => `<button class="elem-pill ${id === active ? 'on' : ''}" data-arc-tab="${id}">${lbl}</button>`).join('')}
        </div>
        ${gameHtml}
      </div>
    `;

    // Sub-tab switchers
    container.querySelectorAll<HTMLButtonElement>('[data-arc-tab]').forEach((b) => {
      b.addEventListener('click', () => {
        active = b.dataset.arcTab as ArcadeGameId;
        render(container);
      });
    });

    // 1. Prize Wheel spin
    container.querySelector('[data-arc="spin"]')?.addEventListener('click', () => {
      if (spinning || run.coins < 20) return;
      run.coins -= 20;
      onCoinsChanged();
      spinning = true;
      const winIdx = int(run.rng, 0, WHEEL_SLICES.length - 1);
      const sliceDeg = 360 / WHEEL_SLICES.length;
      const targetCenter = (winIdx + 0.5) * sliceDeg;
      const extraSpins = 360 * 4;
      const desired = extraSpins + (360 - targetCenter);
      wheelAngle = wheelAngle - (wheelAngle % 360) + desired;
      const disc = container.querySelector<HTMLElement>('.wheel-disc');
      if (disc) disc.style.transform = `rotate(${wheelAngle}deg)`;
      const btn = container.querySelector<HTMLButtonElement>('[data-arc="spin"]');
      if (btn) btn.disabled = true;
      audio.play('confirm');
      window.setTimeout(() => {
        spinning = false;
        const msg = WHEEL_SLICES[winIdx].apply(run);
        audio.play('chest');
        toast(msg, 3200);
        onCoinsChanged();
        if (rootEl) render(rootEl);
      }, 1500);
    });

    // 2. Scratch card buy & reveal
    container.querySelector('[data-arc="new-scratch"]')?.addEventListener('click', () => {
      if (run.coins < 15) return;
      run.coins -= 15;
      onCoinsChanged();
      scratchCells = Array.from({ length: 9 }, () => pick(run.rng, [...SCRATCH_SYMBOLS]));
      scratchRevealed = new Array(9).fill(false);
      scratchDone = false;
      audio.play('confirm');
      render(container);
    });
    container.querySelectorAll<HTMLButtonElement>('[data-scratch]').forEach((b) => {
      b.addEventListener('click', () => {
        if (!scratchCells || scratchDone) return;
        const idx = Number(b.dataset.scratch);
        scratchRevealed[idx] = true;
        audio.play('step');
        if (scratchRevealed.every(Boolean)) {
          scratchDone = true;
          const counts = new Map<string, number>();
          for (const s of scratchCells) counts.set(s, (counts.get(s) ?? 0) + 1);
          const winner = [...counts.entries()].find(([, n]) => n >= 3);
          if (winner) {
            if (winner[0] === '💎') {
              const el = pick(run.rng, [...ELEMENTS]);
              run.crystals[el] = (run.crystals[el] ?? 0) + 1;
              toast(`🎉 3× 💎! Ganhou Cristal de ${elementLabel(el)}!`, 3200);
            } else if (winner[0] === '🍀') {
              run.potions += 2;
              toast('🎉 3× 🍀! Ganhou 2 Poções de cura!', 3200);
            } else {
              run.coins += 75;
              toast(`🎉 3× ${winner[0]}! Ganhou 🪙 75 moedas na Raspadinha!`, 3200);
            }
            audio.play('chest');
            onCoinsChanged();
          } else {
            toast('😅 Sem trio desta vez! Tente outra raspadinha!', 2200);
          }
        }
        render(container);
      });
    });

    // 3. Hammer strength game
    const goBtn = container.querySelector<HTMLButtonElement>('[data-arc="hammer-go"]');
    const hitBtn = container.querySelector<HTMLButtonElement>('[data-arc="hammer-hit"]');
    const fillEl = container.querySelector<HTMLElement>('.hammer-fill');

    goBtn?.addEventListener('click', () => {
      if (run.coins < 10) return;
      run.coins -= 10;
      onCoinsChanged();
      hammerResult = '';
      hammerActive = true;
      hammerPos = 0.1;
      hammerDir = 1;
      goBtn.hidden = true;
      if (hitBtn) hitBtn.hidden = false;
      let last = performance.now();
      const loop = (now: number) => {
        if (!hammerActive) return;
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        hammerPos += hammerDir * dt * 2.2;
        if (hammerPos >= 1) {
          hammerPos = 1;
          hammerDir = -1;
        } else if (hammerPos <= 0) {
          hammerPos = 0;
          hammerDir = 1;
        }
        if (fillEl) fillEl.style.height = `${Math.round(hammerPos * 100)}%`;
        hammerRaf = requestAnimationFrame(loop);
      };
      hammerRaf = requestAnimationFrame(loop);
    });

    hitBtn?.addEventListener('click', () => {
      if (!hammerActive) return;
      stopHammer();
      if (hammerPos >= 0.82) {
        run.coins += 45;
        for (const p of run.party) p.happiness = Math.min(100, (p.happiness ?? 72) + 12);
        hammerResult = '🔔 DING! Força máxima! +🪙 45 e +12% 😊 para a equipe!';
        audio.play('evolve');
      } else if (hammerPos >= 0.55) {
        run.coins += 15;
        hammerResult = '💪 Boa batida! Ganhou 🪙 15 moedas!';
        audio.play('confirm');
      } else {
        hammerResult = '😅 Batida fraca! Tente acertar no topo dourado!';
        audio.play('lose');
      }
      toast(hammerResult, 2800);
      onCoinsChanged();
      render(container);
    });

    // 4. Village Lottery
    container.querySelectorAll<HTMLButtonElement>('[data-lotto]').forEach((b) => {
      b.addEventListener('click', () => {
        const n = Number(b.dataset.lotto);
        if (lottoPicks.has(n)) lottoPicks.delete(n);
        else if (lottoPicks.size < 3) lottoPicks.add(n);
        lottoDrawn = null;
        render(container);
      });
    });

    container.querySelector('[data-arc="lotto-draw"]')?.addEventListener('click', () => {
      if (lottoPicks.size !== 3 || run.coins < 15) return;
      run.coins -= 15;
      const pool = Array.from({ length: 15 }, (_, i) => i + 1);
      const drawn: number[] = [];
      for (let i = 0; i < 3; i++) {
        const idx = int(run.rng, 0, pool.length - 1);
        drawn.push(pool.splice(idx, 1)[0]);
      }
      drawn.sort((a, b) => a - b);
      lottoDrawn = drawn;
      const matches = drawn.filter((n) => lottoPicks.has(n)).length;
      if (matches === 3) {
        run.coins += 300;
        const el = pick(run.rng, [...ELEMENTS]);
        run.crystals[el] = (run.crystals[el] ?? 0) + 1;
        lottoResult = `🏆 JACKPOT! 3 acertos! +🪙 300 e Cristal ${ELEMENT_INFO[el].icon}!`;
        audio.play('evolve');
      } else if (matches === 2) {
        run.coins += 80;
        lottoResult = '🎉 2 acertos! Ganhou 🪙 80 moedas!';
        audio.play('chest');
      } else if (matches === 1) {
        run.coins += 20;
        lottoResult = '✨ 1 acerto! Ganhou 🪙 20 moedas!';
        audio.play('confirm');
      } else {
        lottoResult = '😅 Nenhum acerto desta vez.';
        audio.play('lose');
      }
      toast(lottoResult, 3200);
      onCoinsChanged();
      render(container);
    });
  };

  return { render, dispose: stopHammer };
}
