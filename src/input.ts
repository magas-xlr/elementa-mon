/**
 * Keyboard + Universal Gamepad input (PlayStation, Nintendo Switch, Xbox & Generic USB/Bluetooth controllers!).
 * Supports Standard Gamepad mapping, Nintendo A/B layout detection, shoulder-bumper tab cycling,
 * and fallback D-pad / hat-axis decoding for generic controllers.
 */
export type Action =
  'up' | 'down' | 'left' | 'right' | 'confirm' | 'cancel' | 'menu' | 'tabPrev' | 'tabNext';

export type ControllerBrand = 'PlayStation' | 'Switch' | 'Xbox' | 'Controle' | null;

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
  KeyQ: 'tabPrev',
  KeyE: 'tabNext',
};

function detectBrand(id: string): ControllerBrand {
  const s = id.toLowerCase();
  if (
    s.includes('dualsense') ||
    s.includes('dualshock') ||
    s.includes('playstation') ||
    s.includes('054c')
  )
    return 'PlayStation';
  if (s.includes('nintendo') || s.includes('switch') || s.includes('joy-con') || s.includes('057e'))
    return 'Switch';
  if (s.includes('xbox') || s.includes('xinput') || s.includes('045e')) return 'Xbox';
  return 'Controle';
}

class Input {
  private held = new Set<Action>();
  private padHeld = new Set<Action>();
  private listeners = new Set<(a: Action) => void>();
  private padListeners = new Set<(brand: ControllerBrand) => void>();
  private repeatTimer = 0;
  private tapped: Action | null = null;
  connectedBrand: ControllerBrand = null;

  constructor() {
    window.addEventListener('keydown', (e) => {
      const action = KEYMAP[e.code];
      if (!action) return;
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
    window.addEventListener('gamepadconnected', (e) => {
      this.connectedBrand = detectBrand(e.gamepad.id);
      for (const fn of this.padListeners) fn(this.connectedBrand);
    });
    window.addEventListener('gamepaddisconnected', () => {
      const pads = (navigator.getGamepads?.() ?? []).filter(Boolean);
      this.connectedBrand = pads[0] ? detectBrand(pads[0].id) : null;
      for (const fn of this.padListeners) fn(this.connectedBrand);
    });
  }

  on(fn: (a: Action) => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  onGamepadChange(fn: (brand: ControllerBrand) => void): () => void {
    this.padListeners.add(fn);
    return () => this.padListeners.delete(fn);
  }

  private emit(a: Action): void {
    for (const fn of [...this.listeners]) fn(a);
  }

  isHeld(a: Action): boolean {
    return this.held.has(a) || this.padHeld.has(a);
  }

  /** Current movement direction from keys, D-pad or left analog stick. */
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

  /** Polls PlayStation, Switch, Xbox & Generic gamepads once per frame with menu auto-repeat. */
  poll(dt: number): void {
    const pads = navigator.getGamepads?.() ?? [];
    const now = new Set<Action>();
    for (const pad of pads) {
      if (!pad || !pad.connected) continue;
      if (!this.connectedBrand) {
        this.connectedBrand = detectBrand(pad.id);
        for (const fn of this.padListeners) fn(this.connectedBrand);
      }
      const isSwitch = this.connectedBrand === 'Switch';
      const btn = (i: number) =>
        Boolean(pad.buttons[i]?.pressed || (pad.buttons[i]?.value ?? 0) > 0.5);

      // Confirm / Cancel (Nintendo Switch swaps A=right / B=bottom; PS/Xbox/Generic use bottom=confirm, right=cancel)
      if (btn(isSwitch ? 1 : 0)) now.add('confirm');
      if (btn(isSwitch ? 0 : 1)) now.add('cancel');
      if (btn(2) || btn(3) || btn(8) || btn(9)) now.add('menu');
      if (btn(4) || btn(6)) now.add('tabPrev');
      if (btn(5) || btn(7)) now.add('tabNext');

      // Standard D-Pad buttons (12..15)
      if (btn(12)) now.add('up');
      if (btn(13)) now.add('down');
      if (btn(14)) now.add('left');
      if (btn(15)) now.add('right');

      // Left stick (axes 0, 1) with deadzone 0.42
      const ax = pad.axes[0] ?? 0;
      const ay = pad.axes[1] ?? 0;
      if (ay < -0.42) now.add('up');
      if (ay > 0.42) now.add('down');
      if (ax < -0.42) now.add('left');
      if (ax > 0.42) now.add('right');

      // Generic non-standard gamepad fallback D-pad axes (axes 6, 7)
      if (pad.mapping !== 'standard' && pad.axes.length >= 8) {
        const dx = pad.axes[6] ?? 0;
        const dy = pad.axes[7] ?? 0;
        if (dy < -0.5) now.add('up');
        if (dy > 0.5) now.add('down');
        if (dx < -0.5) now.add('left');
        if (dx > 0.5) now.add('right');
      }
    }

    let anyDir = false;
    for (const a of now) {
      if (!this.padHeld.has(a)) {
        this.emit(a);
        this.repeatTimer = 0.34;
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
