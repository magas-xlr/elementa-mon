import './styles.css';
import { Game } from './app';

const canvas = document.getElementById('view') as HTMLCanvasElement;
const ui = document.getElementById('ui') as HTMLElement;
const perf = document.getElementById('perf') as HTMLElement;

try {
  const game = new Game(canvas, ui, perf);
  game.start();
  // Dev-only handle for debugging in the browser console.
  if (import.meta.env.DEV) Object.assign(window, { game });
} catch (err) {
  console.error(err);
  ui.innerHTML = `<div class="panel narrow"><h2>Não foi possível iniciar</h2>
    <p>Este jogo precisa de WebGL. Atualize o navegador ou os drivers de vídeo.</p></div>`;
}
