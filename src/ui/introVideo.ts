/**
 * Fullscreen skippable Intro Video player (`/intro.mp4`) for Elementa-Mon.
 */
export function playIntroVideo(): Promise<void> {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.style.cssText =
      'position:fixed;inset:0;z-index:9999;background:#090812;display:flex;align-items:center;justify-content:center;';
    overlay.innerHTML = `
      <video src="/intro.mp4" autoplay playsinline style="max-width:100%;max-height:100%;width:100%;height:100%;object-fit:contain;"></video>
      <button type="button" data-skip="1" style="position:fixed;right:24px;bottom:24px;z-index:10000;padding:10px 18px;border-radius:999px;border:2px solid #f5cd5b;background:rgba(18,16,28,0.86);color:#fff6dc;font-weight:700;cursor:pointer;">⏭️ Pular Introdução (ESC)</button>
    `;
    document.body.appendChild(overlay);
    const video = overlay.querySelector('video')!;
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      window.removeEventListener('keydown', onKey);
      video.pause();
      overlay.remove();
      resolve();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Escape' || e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        finish();
      }
    };
    window.addEventListener('keydown', onKey);
    overlay.querySelector('[data-skip]')?.addEventListener('click', finish);
    video.addEventListener('ended', finish);
    video.addEventListener('error', finish);
    void video.play().catch(() => {
      video.muted = true;
      void video.play().catch(finish);
    });
  });
}
