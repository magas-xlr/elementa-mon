/**
 * Keyboard + gamepad mapped to a few abstract actions (Steam Deck / controllers friendly).
 */
export type Action = 'up' | 'down' | 'left' | 'right' | 'confirm' | 'cancel' | 'menu';

const KEYMAP: Record<string, Action> = {
  ArrowUp: 'up',
  KeyW: 'up',
  ArrowDown: 'down',
  KeyS: 'down',
  ArrowLeft: 'left',
  KeyA: 'left',
  ArrowRight: 'right',
  KeyD: 'right',
  Enter: 'confirm',
  Space: 'confirm',
  KeyZ: 'confirm',
  Escape: 'cancel',
  Backspace: 'cancel',
  KeyX: 'cancel',
  Tab: 'menu',
  KeyM: 'menu',
};

// Standard gamepad layout: 0 = A, 1 = B, 9 = Start, 12-15 = D-pad.
const PAD_BUTTONS: [number, Action][] = [
  [0, 'confirm'],
  [1, 'cancel'],
  [9, 'menu'],
  [3, 'menu'],
  [12, 'up'],
  [13, 'down'],
  [14, 'left'],
  [15, 'right'],
];

class Input {
  private held = new Set<Action>();
  private padHeld = new Set<Action>();
  private listeners = new Set<(a: Action) => void>();
  private repeatTimer = 0;
  /** A quick tap still moves one tile even if the key is released before the next frame. */
  private tapped: Action | null = null;

  constructor() {
    window.addEventListener('keydown', (e) => {
      const action = KEYMAP[e.code];
      if (!action) return;
      // Let text fields and range sliders keep their own keys.
      const el = e.target as HTMLElement | null;
      if (
        el &&
        el.tagName === 'INPUT' &&
        (el as HTMLInputElement).type === 'range' &&
        (action === 'left' || action === 'right')
      )
        return;
      e.preventDefault();
      if (!e.repeat) {
        this.emit(action);
        if (action === 'up' || action === 'down' || action === 'left' || action === 'right')
          this.tapped = action;
      }
      this.held.add(action);
    });
    window.addEventListener('keyup', (e) => {
      const action = KEYMAP[e.code];
      if (action) this.held.delete(action);
    });
    window.addEventListener('blur', () => this.held.clear());
  }

  on(fn: (a: Action) => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private emit(a: Action): void {
    for (const fn of [...this.listeners]) fn(a);
  }

  isHeld(a: Action): boolean {
    return this.held.has(a) || this.padHeld.has(a);
  }

  /** Current movement direction from keys, D-pad or left stick. */
  direction(): { dx: number; dy: number } | null {
    const tap = this.tapped;
    this.tapped = null;
    if (tap === 'up') return { dx: 0, dy: -1 };
    if (tap === 'down') return { dx: 0, dy: 1 };
    if (tap === 'left') return { dx: -1, dy: 0 };
    if (tap === 'right') return { dx: 1, dy: 0 };
    if (this.isHeld('up')) return { dx: 0, dy: -1 };
    if (this.isHeld('down')) return { dx: 0, dy: 1 };
    if (this.isHeld('left')) return { dx: -1, dy: 0 };
    if (this.isHeld('right')) return { dx: 1, dy: 0 };
    return null;
  }

  /** Polls gamepads once per frame and emits edge-triggered actions (with menu repeat). */
  poll(dt: number): void {
    const pads = navigator.getGamepads?.() ?? [];
    const now = new Set<Action>();
    for (const pad of pads) {
      if (!pad) continue;
      for (const [i, a] of PAD_BUTTONS) if (pad.buttons[i]?.pressed) now.add(a);
      const [x = 0, y = 0] = pad.axes;
      if (y < -0.5) now.add('up');
      if (y > 0.5) now.add('down');
      if (x < -0.5) now.add('left');
      if (x > 0.5) now.add('right');
    }
    let anyDir = false;
    for (const a of now) {
      if (!this.padHeld.has(a)) {
        this.emit(a);
        this.repeatTimer = 0.35;
      }
      if (a === 'up' || a === 'down' || a === 'left' || a === 'right') anyDir = true;
    }
    if (anyDir) {
      this.repeatTimer -= dt;
      if (this.repeatTimer <= 0) {
        this.repeatTimer = 0.12;
        for (const a of now)
          if (a === 'up' || a === 'down' || a === 'left' || a === 'right') this.emit(a);
      }
    }
    this.padHeld = now;
  }
}

export const input = new Input();
