import { audio } from '../audio';
import type { Action } from '../input';

export const esc = (s: string | number): string =>
  String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export const hex = (n: number): string => `#${n.toString(16).padStart(6, '0')}`;

export type Handler = (el: HTMLElement) => void;

/**
 * Screens render plain HTML strings into #ui; buttons carry `data-action` and are wired via
 * event delegation. Arrow keys / D-pad move focus spatially between buttons.
 */
export class UiRoot {
  readonly el: HTMLElement;
  private handlers: Record<string, Handler> = {};
  private backAction: string | null = null;
  navEnabled = true;

  constructor(el: HTMLElement) {
    this.el = el;
    el.addEventListener('click', (e) => {
      const target = (e.target as HTMLElement).closest<HTMLElement>('[data-action]');
      if (!target || target.hasAttribute('disabled')) return;
      const fn = this.handlers[target.dataset.action ?? ''];
      if (fn) {
        audio.unlock();
        audio.play(target.dataset.action === this.backAction ? 'back' : 'confirm');
        fn(target);
      }
    });
    el.addEventListener('input', (e) => {
      const target = e.target as HTMLElement;
      const fn = target.dataset.input ? this.handlers[target.dataset.input] : undefined;
      fn?.(target);
    });
  }

  render(
    html: string,
    handlers: Record<string, Handler>,
    opts: { back?: string; focus?: string } = {}
  ): void {
    this.el.innerHTML = html;
    this.handlers = handlers;
    this.backAction = opts.back ?? null;
    const focus = opts.focus ? this.el.querySelector<HTMLElement>(opts.focus) : null;
    (focus ?? this.focusables()[0])?.focus({ preventScroll: true });
  }

  /** Re-binds handlers without replacing the DOM (partial updates). */
  setHandlers(handlers: Record<string, Handler>): void {
    this.handlers = handlers;
  }

  private focusables(): HTMLElement[] {
    return [
      ...this.el.querySelectorAll<HTMLElement>('button:not([disabled]), input, select'),
    ].filter((b) => b.offsetParent !== null);
  }

  handleAction(action: Action): boolean {
    if (!this.navEnabled) return false;
    if (action === 'cancel' && this.backAction) {
      const fn = this.handlers[this.backAction];
      if (fn) {
        audio.play('back');
        fn(this.el);
        return true;
      }
    }
    const items = this.focusables();
    if (items.length === 0) return false;
    const current = document.activeElement as HTMLElement | null;
    if (action === 'confirm') {
      if (current && items.includes(current) && current.tagName === 'BUTTON') {
        current.click();
        return true;
      }
      return false;
    }
    if (action === 'up' || action === 'down' || action === 'left' || action === 'right') {
      if (current && current.tagName === 'SELECT' && (action === 'up' || action === 'down'))
        return false;
      const next = current && items.includes(current) ? nearest(current, items, action) : items[0];
      if (next) {
        next.focus({ preventScroll: false });
        next.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        audio.play('blip');
      }
      return true;
    }
    return false;
  }
}

function nearest(from: HTMLElement, items: HTMLElement[], dir: Action): HTMLElement | null {
  const a = from.getBoundingClientRect();
  const ax = a.left + a.width / 2;
  const ay = a.top + a.height / 2;
  let best: HTMLElement | null = null;
  let bestScore = Infinity;
  for (const el of items) {
    if (el === from) continue;
    const b = el.getBoundingClientRect();
    const dx = b.left + b.width / 2 - ax;
    const dy = b.top + b.height / 2 - ay;
    const forward = dir === 'up' ? -dy : dir === 'down' ? dy : dir === 'left' ? -dx : dx;
    const side = dir === 'up' || dir === 'down' ? Math.abs(dx) : Math.abs(dy);
    if (forward <= 1) continue;
    const score = forward + side * 2;
    if (score < bestScore) {
      bestScore = score;
      best = el;
    }
  }
  return best;
}

/** Short message at the top of the screen. */
export function toast(text: string, ms = 1800): void {
  const layer = document.getElementById('fx');
  if (!layer) return;
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = text;
  layer.appendChild(el);
  window.setTimeout(() => el.remove(), ms);
}

/** Floating number (damage / heal) at a screen position. */
export function floatText(
  text: string,
  x: number,
  y: number,
  kind: 'dano' | 'cura' | 'escudo' | 'info'
): void {
  const layer = document.getElementById('fx');
  if (!layer) return;
  const el = document.createElement('div');
  el.className = `float float-${kind}`;
  el.textContent = text;
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  layer.appendChild(el);
  window.setTimeout(() => el.remove(), 1000);
}

export const wait = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));

export function bar(value: number, max: number, cls = 'hp'): string {
  const pct = Math.max(0, Math.min(100, (value / Math.max(1, max)) * 100));
  const tone = cls === 'hp' ? (pct > 50 ? 'ok' : pct > 25 ? 'warn' : 'low') : '';
  return `<div class="bar ${cls} ${tone}"><i style="width:${pct}%"></i></div>`;
}
