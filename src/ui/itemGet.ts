import { audio } from '../audio';
import { esc } from './dom';

/**
 * The Legend of Zelda: Ocarina of Time-inspired "Item Get!" celebration overlay:
 * Radiant spinning golden light rays behind the obtained item + upward sparkles + RPG fanfare banner.
 */
export function showItemGet(opts: {
  icon: string;
  name: string;
  subtitle?: string;
}): Promise<void> {
  return new Promise((resolve) => {
    const fx = document.getElementById('fx');
    if (!fx) {
      resolve();
      return;
    }
    audio.play('evolve');

    const overlay = document.createElement('div');
    overlay.className = 'oot-overlay';
    overlay.innerHTML = `
      <div class="oot-stage">
        <div class="oot-rays"></div>
        <div class="oot-glow"></div>
        <div class="oot-item">${opts.icon}</div>
        <div class="oot-sparkles"><i>✦</i><i>✧</i><i>✦</i><i>✧</i><i>✦</i></div>
      </div>
      <div class="oot-banner">
        <div class="oot-kicker">✨ NOVO ITEM OBTIDO! ✨</div>
        <div class="oot-name">${esc(opts.name)}</div>
        ${opts.subtitle ? `<div class="oot-sub">${esc(opts.subtitle)}</div>` : ''}
        <div class="oot-tap">Clique ou pressione Enter para continuar</div>
      </div>
    `;

    let closed = false;
    const close = () => {
      if (closed) return;
      closed = true;
      window.removeEventListener('keydown', onKey);
      overlay.classList.add('out');
      window.setTimeout(() => {
        overlay.remove();
        resolve();
      }, 220);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
        e.preventDefault();
        close();
      }
    };
    overlay.addEventListener('pointerdown', close);
    window.addEventListener('keydown', onKey);
    // Auto-dismiss gracefully after 2.8s if player doesn't tap
    window.setTimeout(close, 2800);
    fx.appendChild(overlay);
  });
}
