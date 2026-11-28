/**
 * Lightweight frame-by-frame anime watercolor opening cutscene (12 fps traditional animation
 * feel on a crisp HTML5 canvas) for Biome 1 — Prado das Colinas.
 * Skippable at any moment (click, Enter, Esc, or "Pular" button).
 */

export interface CutsceneOptions {
  chapter: string;
  subtitle: string;
  skipLabel?: string;
}

export function playCutscene(opts: CutsceneOptions): Promise<void> {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'cutscene';
    overlay.innerHTML = `
      <canvas class="cutscene-canvas" width="960" height="540"></canvas>
      <div class="cutscene-letterbox top"></div>
      <div class="cutscene-letterbox bottom"></div>
      <div class="cutscene-caption">
        <span class="cutscene-kicker">✦ ELEMENTA-MON ✦</span>
        <h2>${opts.chapter}</h2>
        <p>${opts.subtitle}</p>
      </div>
      <button class="cutscene-skip" type="button">${opts.skipLabel ?? 'Pular ⏭'}</button>
    `;
    document.body.appendChild(overlay);

    const canvas = overlay.querySelector('canvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    const skipBtn = overlay.querySelector('.cutscene-skip') as HTMLButtonElement;

    const DURATION = 4.4;
    const FPS = 12; // Traditional anime "on twos" cadence
    const start = performance.now();
    let lastFrame = -1;
    let raf = 0;
    let done = false;

    const finish = () => {
      if (done) return;
      done = true;
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', onKey);
      overlay.classList.add('fade-out');
      window.setTimeout(() => {
        overlay.remove();
        resolve();
      }, 360);
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Escape' || e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        finish();
      }
    };

    skipBtn.addEventListener('click', finish);
    overlay.addEventListener('click', (e) => {
      if (e.target === canvas) finish();
    });
    window.addEventListener('keydown', onKey);

    // Seeded petals for frame-by-frame breeze drift
    const petals = Array.from({ length: 24 }, (_, i) => ({
      x: (i * 97) % 960,
      y: (i * 61) % 540,
      r: 3 + (i % 4) * 1.4,
      sp: 45 + (i % 5) * 16,
      ph: i * 0.9,
      col: i % 3 === 0 ? '#fff6d6' : i % 3 === 1 ? '#ffd8e8' : '#e6ffcf',
    }));

    const drawFrame = (frameIdx: number) => {
      const t = Math.min(1, frameIdx / (DURATION * FPS));
      const w = canvas.width;
      const h = canvas.height;

      // 1. Sunlit watercolor sky gradient
      const sky = ctx.createLinearGradient(0, 0, 0, h * 0.72);
      sky.addColorStop(0, '#58b4ff');
      sky.addColorStop(0.55, '#a8deff');
      sky.addColorStop(1, '#fff4dc');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);

      // Warm sun halo
      const sunX = 760 - t * 40;
      const sunY = 125;
      const sunGlow = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 160);
      sunGlow.addColorStop(0, 'rgba(255, 250, 224, 0.95)');
      sunGlow.addColorStop(0.4, 'rgba(255, 232, 168, 0.4)');
      sunGlow.addColorStop(1, 'rgba(255, 232, 168, 0)');
      ctx.fillStyle = sunGlow;
      ctx.beginPath();
      ctx.arc(sunX, sunY, 160, 0, Math.PI * 2);
      ctx.fill();

      // 2. Drifting puffy anime watercolor clouds
      const drawCloud = (cx: number, cy: number, s: number) => {
        ctx.fillStyle = 'rgba(255, 253, 248, 0.92)';
        ctx.beginPath();
        ctx.arc(cx, cy, 34 * s, 0, Math.PI * 2);
        ctx.arc(cx + 32 * s, cy - 8 * s, 28 * s, 0, Math.PI * 2);
        ctx.arc(cx - 30 * s, cy + 4 * s, 24 * s, 0, Math.PI * 2);
        ctx.arc(cx + 56 * s, cy + 6 * s, 22 * s, 0, Math.PI * 2);
        ctx.fill();
      };
      drawCloud(180 + t * 55, 118, 1.15);
      drawCloud(520 + t * 38, 92, 0.9);
      drawCloud(810 + t * 48, 155, 0.85);

      // 3. Distant layered BotW hills (parallax pan)
      const hill = (yBase: number, amp: number, freq: number, shift: number, color: string) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(0, h);
        for (let x = 0; x <= w; x += 24) {
          const y =
            yBase + Math.sin(x * freq + shift) * amp + Math.cos(x * freq * 0.5) * (amp * 0.4);
          ctx.lineTo(x, y);
        }
        ctx.lineTo(w, h);
        ctx.closePath();
        ctx.fill();
      };
      hill(315, 28, 0.005, t * 0.4, '#88c0a8');
      hill(360, 24, 0.0065, 1.4 + t * 0.7, '#6ab376');
      hill(412, 18, 0.008, 2.6 + t * 1.1, '#52a854');

      // 4. Frame-by-frame swaying grass blades in the foreground
      ctx.strokeStyle = '#3d8f44';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      for (let i = 0; i < 36; i++) {
        const gx = (i / 35) * w;
        const gy = 440 + Math.sin(i * 1.3) * 18;
        const sway = Math.sin(frameIdx * 0.45 + i * 0.6) * 8;
        ctx.beginPath();
        ctx.moveTo(gx, gy + 28);
        ctx.quadraticCurveTo(gx + sway * 0.5, gy + 8, gx + sway, gy - 12);
        ctx.stroke();
      }

      // 5. Adorable Caputino hopping across the sunlit hill (frame-by-frame squash & blink!)
      const hopCycle = (frameIdx % 8) / 8;
      const hopY = Math.abs(Math.sin(hopCycle * Math.PI)) * 28;
      const cx = 240 + t * 430;
      const cy = 386 - hopY;
      const squash = hopCycle < 0.15 || hopCycle > 0.85 ? 1.12 : 0.94;
      const blink = frameIdx % 18 === 0;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(squash, 2 - squash);
      // Soft ground shadow
      ctx.fillStyle = 'rgba(42, 34, 58, 0.22)';
      ctx.beginPath();
      ctx.ellipse(0, 32 + hopY, 26, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      // Fluffy squirrel tail
      ctx.fillStyle = '#f5ebd6';
      ctx.strokeStyle = '#45334a';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(-24, -8, 16, 28, -0.25, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Body + ears
      ctx.fillStyle = '#e8d4b4';
      ctx.beginPath();
      ctx.ellipse(0, 4, 22, 24, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      for (const sx of [-11, 11]) {
        ctx.beginPath();
        ctx.moveTo(sx - 6, -14);
        ctx.lineTo(sx + (sx < 0 ? -4 : 4), -36);
        ctx.lineTo(sx + 6, -14);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
      // Cream belly + glossy anime eyes
      ctx.fillStyle = '#fff9ee';
      ctx.beginPath();
      ctx.ellipse(4, 9, 13, 15, 0, 0, Math.PI * 2);
      ctx.fill();
      if (blink) {
        ctx.strokeStyle = '#3b241c';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(-4, -3);
        ctx.lineTo(2, -3);
        ctx.moveTo(10, -3);
        ctx.lineTo(16, -3);
        ctx.stroke();
      } else {
        for (const ex of [-1, 13]) {
          ctx.fillStyle = '#2d1c1a';
          ctx.beginPath();
          ctx.ellipse(ex, -3, 4, 5.2, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(ex + 1.4, -5, 1.6, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();

      // 6. Drifting golden/pink watercolor breeze petals
      for (const p of petals) {
        const px = ((p.x + frameIdx * (p.sp / FPS)) % (w + 40)) - 20;
        const py = (p.y + Math.sin(frameIdx * 0.25 + p.ph) * 26 + frameIdx * 4) % h;
        ctx.fillStyle = p.col;
        ctx.beginPath();
        ctx.ellipse(px, py, p.r, p.r * 0.65, frameIdx * 0.2 + p.ph, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const tick = (now: number) => {
      const elapsed = (now - start) / 1000;
      if (elapsed >= DURATION) {
        finish();
        return;
      }
      const frameIdx = Math.floor(elapsed * FPS);
      if (frameIdx !== lastFrame) {
        lastFrame = frameIdx;
        drawFrame(frameIdx);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  });
}
