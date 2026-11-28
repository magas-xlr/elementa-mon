import { audio } from '../audio';
import { ELEMENT_INFO, elementLabel, type Element } from '../game/data/elements';
import { creatureThumbnail } from '../render/thumbnails';
import { stageOf } from '../game/rules/progression';
import { esc } from './dom';
import { elementIcon } from './icons';

/**
 * Digimon-inspired Digivolution / Transmodification sequence!
 * Spinning elemental DNA rings, glowing digital/arcane grid, spinning silhouette energy cocoon,
 * bright morph flash, and final elemental pet reveal with original SVG element emblem.
 */
export function playDigivolveAnimation(opts: {
  petName: string;
  speciesId: string;
  level: number;
  targetElement: Element;
}): Promise<void> {
  return new Promise((resolve) => {
    const fx = document.getElementById('fx');
    if (!fx) {
      resolve();
      return;
    }

    const stage = stageOf(opts.level);
    const beforeThumb = creatureThumbnail(opts.speciesId, stage, 'neutro');
    const afterThumb = creatureThumbnail(opts.speciesId, stage, opts.targetElement);
    const elHex = `#${ELEMENT_INFO[opts.targetElement].color.toString(16).padStart(6, '0')}`;
    const elName = elementLabel(opts.targetElement);

    audio.play('evolve');

    const overlay = document.createElement('div');
    overlay.className = 'digi-overlay';
    overlay.style.setProperty('--el', elHex);
    overlay.innerHTML = `
      <div class="digi-grid"></div>
      <div class="digi-stage">
        <div class="digi-ring r1"></div>
        <div class="digi-ring r2"></div>
        <div class="digi-ring r3"></div>
        <div class="digi-helix"><span>🧬</span><span>✦</span><span>🧬</span><span>✦</span></div>
        <div class="digi-pet-wrap">
          <img class="digi-pet before" src="${beforeThumb}" alt="" />
          <img class="digi-pet after" src="${afterThumb}" alt="" />
        </div>
        <div class="digi-flash"></div>
        <div class="digi-emblem">${elementIcon(opts.targetElement, 46)}</div>
      </div>
      <div class="digi-banner">
        <div class="digi-kicker">🧬 TRANSMODIFICAÇÃO ELEMENTAL COMPLETA!</div>
        <div class="digi-title">${esc(opts.petName)} → ${esc(elName.toUpperCase())}!</div>
        <div class="digi-sub">Elemento permanente gravado no DNA do pet!</div>
        <div class="digi-tap">Clique ou pressione Enter para continuar</div>
      </div>
    `;

    // Trigger the morph phase after 1.1s for dramatic Digivolution reveal!
    const morphTimer = window.setTimeout(() => {
      overlay.classList.add('morphed');
      audio.play('confirm');
    }, 1100);

    let closed = false;
    const close = () => {
      if (closed) return;
      closed = true;
      window.clearTimeout(morphTimer);
      window.removeEventListener('keydown', onKey);
      overlay.classList.add('out');
      window.setTimeout(() => {
        overlay.remove();
        resolve();
      }, 240);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
        e.preventDefault();
        close();
      }
    };
    overlay.addEventListener('pointerdown', close);
    window.addEventListener('keydown', onKey);
    window.setTimeout(close, 4200);
    fx.appendChild(overlay);
  });
}
