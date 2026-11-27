import { DirectionalLight, Group, HemisphereLight, PerspectiveCamera, Scene, Color } from 'three';
import { audio } from './audio';
import { CARDS, MANA_INFO, MANA_TYPES, getCard, type ManaType } from './game/data/cards';
import { ELEMENT_INFO } from './game/data/elements';
import { getRelic } from './game/data/relics';
import { SPECIES, getSpecies } from './game/data/species';
import {
  alive,
  canAfford,
  chooseManaGrowth,
  endTurn,
  getFighter,
  playCard,
  targetKind,
  type BattleEvent,
  type BattleState,
  type Fighter,
} from './game/rules/battle';
import { MAX_DECK, MAX_PARTY, canAddCard, validateDeck, validateParty } from './game/rules/deck';
import {
  AVATAR_COLORS,
  MAX_PLAYER_LEVEL,
  XP_REWARD,
  petStats,
  playerLevelProgress,
  stageOf,
} from './game/rules/progression';
import {
  FLOORS_PER_RUN,
  rollEncounter,
  setTile,
  tileAt,
  type EncounterKind,
  type Encounter,
} from './game/rules/world';
import {
  addCard,
  battleFromEncounter,
  encounterFor,
  healParty,
  nextFloor,
  openChest,
  recruit,
  startRun,
  syncAfterBattle,
  usePotion,
  winBattle,
  type Reward,
  type RunState,
} from './game/state/run';
import { defaultSave, loadSave, playerLevel, writeSave, type SaveData } from './game/state/save';
import { input, type Action } from './input';
import { BattleView } from './render/battleView';
import { Engine, type View } from './render/engine';
import { createAvatar } from './render/models';
import { OverworldView } from './render/overworld';
import { initThumbnails, creatureThumbnail } from './render/thumbnails';
import { abilityCard, manaCost, petCard } from './ui/cards';
import { UiRoot, bar, esc, floatText, hex, toast, wait } from './ui/dom';

declare global {
  interface Window {
    /** Exposed by electron/preload.cjs when running as the Windows (Steam) build. */
    desktop?: {
      isDesktop: true;
      quit(): void;
      setFullscreen(on: boolean): void;
      unlockAchievement?(id: string): void;
    };
  }
}

type Screen =
  | 'titulo'
  | 'tutorial'
  | 'preparar'
  | 'mundo'
  | 'batalha'
  | 'recompensa'
  | 'inventario'
  | 'personalizar'
  | 'status'
  | 'config'
  | 'derrota'
  | 'vitoria'
  | 'creditos';

const TUTORIAL = [
  {
    title: 'Bem-vindo ao Elementa-Mon!',
    text: 'Monte uma equipe de até 3 pets e um deck de até 15 cartas. Explore 3 andares gerados na hora e derrote o chefe no fim. Se todos os pets caírem, a jornada acaba — mas o seu nível de jogador continua.',
  },
  {
    title: 'Explorando',
    text: 'Ande com WASD, setas ou o direcional. Pets selvagens se escondem no mato alto. Baús guardam cartas, relíquias e poções. A cruz vermelha cura a equipe. Fale com treinadores (Enter) para batalhar. O portal leva ao próximo andar.',
  },
  {
    title: 'Mana',
    text: 'Há três tipos de mana: Corpo-a-corpo (C), Ilusão (I) e Talento (T). Você começa com 1 de cada. No início de cada rodada escolha um tipo para crescer +1. A mana enche de novo a cada rodada.',
  },
  {
    title: 'Cartas e combate',
    text: 'Você começa com 4 cartas e compra 1 por turno (até 5). Escolha o pet que usa a carta, depois a carta e o alvo. Dano = (poder + ataque do pet) × vantagem elemental − defesa. Carta do mesmo elemento do pet ganha +1 de poder.',
  },
  {
    title: 'Elementos e evolução',
    text: 'São 9 elementos. Água vence Fogo, Elétrico vence Água e assim por diante: veja ▲ (forte contra) e ▼ (fraco contra) em cada carta. Pets começam no nível 1 com 10 de vida, evoluem no nível 2 e chegam ao máximo no 3.',
  },
];

export class Game {
  private save: SaveData = loadSave();
  private engine: Engine;
  private ui: UiRoot;
  private screen: Screen = 'titulo';
  private battleView = new BattleView();
  private overworld: OverworldView | null = null;
  private run: RunState | null = null;
  private battle: BattleState | null = null;
  private encounter: Encounter | null = null;
  private encounterAt: { x: number; y: number } | null = null;
  private reward: Reward | null = null;
  private paused = false;
  private busy = false;
  private selectedCard: number | null = null;
  private caster: string | null = null;
  private shown = new Map<string, { hp: number; shield: number }>();
  private summonElement = new Map<string, string>();
  private tutorialPage = 0;
  private confirmReset = false;
  private touchDir: { dx: number; dy: number } | null = null;
  private perf: HTMLElement;
  private perfOn = false;
  private avatarView: (View & { avatar: Group }) | null = null;

  constructor(canvas: HTMLCanvasElement, uiEl: HTMLElement, perfEl: HTMLElement) {
    this.engine = new Engine(canvas);
    initThumbnails(this.engine.renderer);
    this.ui = new UiRoot(uiEl);
    this.perf = perfEl;
    this.applySettings();
    this.engine.onFrame = (dt) => this.frame(dt);
    input.on((a) => this.onAction(a));
    window.addEventListener('keydown', (e) => {
      if (e.code === 'F3') {
        e.preventDefault();
        this.perfOn = !this.perfOn;
        this.perf.hidden = !this.perfOn;
      }
    });
    window.addEventListener('pointerdown', () => audio.unlock(), { once: true });
    window.addEventListener('keydown', () => audio.unlock(), { once: true });
    window.setInterval(() => this.updatePerf(), 500);
  }

  start(): void {
    this.showTitle();
  }

  // ---------- infrastructure ----------

  private persist(): void {
    writeSave(this.save);
  }

  private get level(): number {
    return playerLevel(this.save);
  }

  private applySettings(): void {
    const s = this.save.settings;
    this.engine.configure(s.resolution, s.fpsCap);
    audio.configure(s.volume, s.music);
  }

  private setScreen(screen: Screen): void {
    this.screen = screen;
    document.body.dataset.screen = screen;
  }

  private updatePerf(): void {
    if (!this.perfOn) return;
    const s = this.engine.stats();
    this.perf.textContent = `${s.fps} fps · ${s.width}×${s.height} · ${s.triangles} tris · ${s.calls} draws`;
  }

  private frame(dt: number): void {
    input.poll(dt);
    if (this.screen !== 'mundo' || this.paused || this.busy || !this.overworld) return;
    const dir = this.touchDir ?? input.direction();
    if (!dir) return;
    const result = this.overworld.move(dir.dx, dir.dy);
    if (result === 'blocked') this.tryTalk();
  }

  private onAction(a: Action): void {
    if (this.screen === 'mundo' && !this.paused) {
      if (a === 'menu' || a === 'cancel') this.openPause();
      else if (a === 'confirm') this.tryTalk();
      return;
    }
    if (this.busy) return;
    this.ui.handleAction(a);
  }

  private showcase(): void {
    this.battleView.setBiome(0);
    this.battleView.setup(
      this.save.party.map((id, i) => ({
        uid: `show-${i}`,
        speciesId: id,
        level: 1 + i,
        side: 'player' as const,
      })),
      true
    );
    this.engine.setView(this.battleView);
  }

  // ---------- title & menus ----------

  private showTitle(): void {
    this.setScreen('titulo');
    this.run = null;
    this.paused = false;
    audio.music('menu');
    this.showcase();
    const p = playerLevelProgress(this.save.playerXp);
    this.ui.render(
      `<div class="title-screen">
        <h1 class="logo">Elementa<span>-Mon</span></h1>
        <p class="tagline">Pets elementais · cartas · aventura roguelite</p>
        <nav class="menu">
          <button data-action="jogar">▶ Jogar</button>
          <button data-action="tutorial">Tutorial</button>
          <button data-action="personalizar">Personalizar</button>
          <button data-action="status">Status</button>
          <button data-action="config">Configurações</button>
          <button data-action="creditos">Créditos</button>
          ${window.desktop ? '<button data-action="sair">Sair</button>' : ''}
        </nav>
        <div class="player-chip">Nível ${p.level} ${bar(p.current, p.needed, 'xp')}</div>
      </div>`,
      {
        jogar: () => (this.save.tutorialSeen ? this.showBuilder() : this.showTutorial(true)),
        tutorial: () => this.showTutorial(false),
        personalizar: () => this.showCustomize(),
        status: () => this.showStatus(),
        config: () => this.showSettings(),
        creditos: () => this.showCredits(),
        sair: () => window.desktop?.quit(),
      }
    );
  }

  private showTutorial(thenPlay: boolean): void {
    this.setScreen('tutorial');
    const page = TUTORIAL[this.tutorialPage];
    const last = this.tutorialPage === TUTORIAL.length - 1;
    this.ui.render(
      `<div class="panel narrow">
        <h2>${esc(page.title)}</h2>
        <p class="big-text">${esc(page.text)}</p>
        <div class="dots">${TUTORIAL.map((_, i) => `<i class="${i === this.tutorialPage ? 'on' : ''}"></i>`).join('')}</div>
        <div class="row">
          <button data-action="voltar">${this.tutorialPage === 0 ? 'Menu' : '◀ Anterior'}</button>
          <button data-action="proximo" class="primary">${last ? (thenPlay ? 'Começar!' : 'Concluir') : 'Próximo ▶'}</button>
        </div>
      </div>`,
      {
        voltar: () => {
          if (this.tutorialPage === 0) return this.showTitle();
          this.tutorialPage -= 1;
          this.showTutorial(thenPlay);
        },
        proximo: () => {
          if (!last) {
            this.tutorialPage += 1;
            return this.showTutorial(thenPlay);
          }
          this.tutorialPage = 0;
          this.save.tutorialSeen = true;
          this.persist();
          if (thenPlay) this.showBuilder();
          else this.showTitle();
        },
      },
      { back: 'voltar', focus: '.primary' }
    );
  }

  private showBuilder(): void {
    this.setScreen('preparar');
    const lvl = this.level;
    const party = this.save.party
      .filter((id) => getSpecies(id).requiredLevel <= lvl)
      .slice(0, MAX_PARTY);
    const deck = this.save.deck.filter((id) => getCard(id).requiredLevel <= lvl);
    this.save.party = party;
    this.save.deck = deck;
    const errors = [...validateParty(party, lvl), ...validateDeck(deck, lvl)];
    const counts = new Map<string, number>();
    for (const id of deck) counts.set(id, (counts.get(id) ?? 0) + 1);

    const speciesHtml = SPECIES.map((s) => {
      const locked = s.requiredLevel > lvl;
      const on = party.includes(s.id);
      const thumb = creatureThumbnail(s.id, 0);
      return `<button class="pick ${on ? 'on' : ''}" data-action="pet" data-id="${s.id}" ${locked ? 'disabled' : ''}
        title="${esc(s.stages[0].lore)}">
        <img src="${thumb}" alt="" /><span>${ELEMENT_INFO[s.element].icon} ${esc(s.stages[0].name)}</span>
        ${locked ? `<small>🔒 Nv ${s.requiredLevel}</small>` : on ? '<small>✔ Na equipe</small>' : ''}
      </button>`;
    }).join('');

    const cardsHtml = CARDS.map((c) => {
      const n = counts.get(c.id) ?? 0;
      const locked = c.requiredLevel > lvl;
      return `<div class="deck-row ${locked ? 'locked' : ''}">
        <span class="cost">${manaCost(c.cost)}</span>
        <span class="cname" title="${esc(c.lore)}">${c.element === 'neutro' ? '✦' : ELEMENT_INFO[c.element].icon} ${esc(c.name)}${c.kind === 'invocacao' ? ' <em>invocação</em>' : ''}</span>
        ${
          locked
            ? `<small>🔒 Nv ${c.requiredLevel}</small>`
            : `
        <button data-action="menos" data-id="${c.id}" ${n === 0 ? 'disabled' : ''} aria-label="Remover">−</button>
        <b class="count">${n}</b>
        <button data-action="mais" data-id="${c.id}" ${canAddCard(deck, c.id, lvl) ? '' : 'disabled'} aria-label="Adicionar">+</button>`
        }
      </div>`;
    }).join('');

    this.ui.render(
      `<div class="panel wide builder">
        <h2>Preparar a aventura</h2>
        <section>
          <h3>Equipe <small>${party.length}/${MAX_PARTY} pets</small></h3>
          <div class="picks">${speciesHtml}</div>
        </section>
        <section>
          <h3>Deck <small>${deck.length}/${MAX_DECK} cartas · máx. 1 invocação</small></h3>
          <div class="deck-list">${cardsHtml}</div>
        </section>
        ${errors.length ? `<ul class="errors">${errors.map((e) => `<li>${esc(e)}</li>`).join('')}</ul>` : ''}
        <div class="row">
          <button data-action="voltar">◀ Menu</button>
          <button data-action="padrao">Deck padrão</button>
          <button data-action="comecar" class="primary" ${errors.length ? 'disabled' : ''}>Começar aventura ▶</button>
        </div>
      </div>`,
      {
        voltar: () => this.showTitle(),
        pet: (el) => {
          const id = el.dataset.id as string;
          if (party.includes(id)) this.save.party = party.filter((p) => p !== id);
          else if (party.length < MAX_PARTY) this.save.party = [...party, id];
          else toast('A equipe já tem 3 pets.');
          this.persist();
          this.showBuilder();
          this.refocus(`[data-action="pet"][data-id="${id}"]`);
        },
        mais: (el) => {
          this.save.deck = [...deck, el.dataset.id as string];
          this.persist();
          this.showBuilder();
          this.refocus(`[data-action="mais"][data-id="${el.dataset.id}"]`);
        },
        menos: (el) => {
          const i = deck.indexOf(el.dataset.id as string);
          if (i >= 0) deck.splice(i, 1);
          this.save.deck = deck;
          this.persist();
          this.showBuilder();
          this.refocus(`[data-action="menos"][data-id="${el.dataset.id}"]`);
        },
        padrao: () => {
          this.save.deck = defaultSave().deck;
          this.persist();
          this.showBuilder();
        },
        comecar: () => this.beginRun(),
      },
      { back: 'voltar', focus: errors.length ? undefined : '.primary' }
    );
  }

  private refocus(selector: string): void {
    const el = this.ui.el.querySelector<HTMLElement>(selector);
    if (el && !el.hasAttribute('disabled')) el.focus();
  }

  private showCustomize(): void {
    this.setScreen('personalizar');
    const lvl = this.level;
    if (!this.avatarView) {
      const scene = new Scene();
      scene.background = new Color(0x2b2540);
      scene.add(new HemisphereLight(0xffffff, 0x445544, 1.8));
      const sun = new DirectionalLight(0xffffff, 2);
      sun.position.set(2, 4, 4);
      scene.add(sun);
      const camera = new PerspectiveCamera(35, 1, 0.1, 20);
      camera.position.set(0, 1.0, 4.4);
      camera.lookAt(0, 0.6, 0);
      const view = {
        scene,
        camera,
        avatar: new Group(),
        update: (_dt: number, time: number) => {
          view.avatar.rotation.y = time * 0.8;
        },
        resize: (aspect: number) => {
          camera.aspect = aspect;
          camera.updateProjectionMatrix();
        },
      };
      scene.add(view.avatar);
      this.avatarView = view;
    }
    const view = this.avatarView;
    view.avatar.clear();
    view.avatar.add(createAvatar(this.save.avatar.body, this.save.avatar.hat));
    this.engine.setView(view);

    const swatches = (slot: 'body' | 'hat') =>
      AVATAR_COLORS.map((c) => {
        const locked = c.level > lvl;
        const on = this.save.avatar[slot] === c.color;
        return `<button class="swatch ${on ? 'on' : ''}" style="--c:${hex(c.color)}" data-action="${slot}" data-color="${c.color}"
          ${locked ? 'disabled' : ''} title="${c.name}${locked ? ` (nível ${c.level})` : ''}">${locked ? '🔒' : ''}</button>`;
      }).join('');
    this.ui.render(
      `<div class="panel side-panel">
        <h2>Personalizar</h2>
        <h3>Roupa</h3><div class="swatches">${swatches('body')}</div>
        <h3>Boné</h3><div class="swatches">${swatches('hat')}</div>
        <p class="hint">Novas cores liberam conforme o seu nível de jogador.</p>
        <button data-action="voltar">◀ Menu</button>
      </div>`,
      {
        body: (el) => this.setAvatarColor('body', Number(el.dataset.color)),
        hat: (el) => this.setAvatarColor('hat', Number(el.dataset.color)),
        voltar: () => this.showTitle(),
      },
      { back: 'voltar' }
    );
  }

  private setAvatarColor(slot: 'body' | 'hat', color: number): void {
    this.save.avatar[slot] = color;
    this.persist();
    this.showCustomize();
    this.refocus(`[data-action="${slot}"][data-color="${color}"]`);
  }

  private showStatus(): void {
    this.setScreen('status');
    const p = playerLevelProgress(this.save.playerXp);
    const st = this.save.stats;
    const next = [
      ...SPECIES.filter((s) => s.requiredLevel > p.level).map((s) => ({
        lvl: s.requiredLevel,
        name: `Pet ${s.stages[0].name}`,
      })),
      ...CARDS.filter((c) => c.requiredLevel > p.level).map((c) => ({
        lvl: c.requiredLevel,
        name: `Carta ${c.name}`,
      })),
      ...AVATAR_COLORS.filter((c) => c.level > p.level).map((c) => ({
        lvl: c.level,
        name: `Cor ${c.name}`,
      })),
    ]
      .sort((a, b) => a.lvl - b.lvl)
      .slice(0, 6);
    this.ui.render(
      `<div class="panel narrow">
        <h2>Status do jogador</h2>
        <p class="big-text">Nível <b>${p.level}</b>${p.level >= MAX_PLAYER_LEVEL ? ' (máximo)' : ''}</p>
        ${bar(p.current, p.needed, 'xp')}
        <p class="hint">${p.level >= MAX_PLAYER_LEVEL ? 'Você chegou ao topo!' : `${p.needed - p.current} XP para o próximo nível`}</p>
        <dl class="stats">
          <dt>Aventuras</dt><dd>${st.runs}</dd>
          <dt>Vitórias contra o chefe</dt><dd>${st.victories}</dd>
          <dt>Batalhas vencidas</dt><dd>${st.battlesWon}</dd>
          <dt>Andar mais distante</dt><dd>${st.bestFloor}</dd>
        </dl>
        ${next.length ? `<h3>Próximos desbloqueios</h3><ul class="unlocks">${next.map((n) => `<li><b>Nv ${n.lvl}</b> ${esc(n.name)}</li>`).join('')}</ul>` : ''}
        <button data-action="voltar">◀ Menu</button>
      </div>`,
      { voltar: () => this.showTitle() },
      { back: 'voltar' }
    );
  }

  private showSettings(from: 'titulo' | 'pausa' = 'titulo'): void {
    if (from === 'titulo') this.setScreen('config');
    const s = this.save.settings;
    const opt = <T extends string | number>(value: T, current: T, label: string) =>
      `<option value="${value}" ${value === current ? 'selected' : ''}>${label}</option>`;
    this.ui.render(
      `<div class="panel narrow settings">
        <h2>Configurações</h2>
        <label>Volume <input type="range" min="0" max="1" step="0.05" value="${s.volume}" data-input="volume" /></label>
        <label>Resolução interna
          <select data-input="resolucao">
            ${opt('baixa', s.resolution, '240p · estilo N64 (mais leve)')}
            ${opt('media', s.resolution, '360p')}
            ${opt('alta', s.resolution, '480p')}
          </select>
        </label>
        <label>Limite de FPS
          <select data-input="fps">${opt(30, s.fpsCap, '30 fps')}${opt(60, s.fpsCap, '60 fps')}</select>
        </label>
        <div class="row">
          <button data-action="musica">Música: ${s.music ? 'ligada' : 'desligada'}</button>
          <button data-action="tela">Tela cheia: ${s.fullscreen ? 'sim' : 'não'}</button>
        </div>
        <p class="hint">F3 mostra FPS, triângulos e draw calls.</p>
        <div class="row">
          <button data-action="voltar">◀ Voltar</button>
          ${from === 'titulo' ? `<button data-action="apagar" class="danger">${this.confirmReset ? 'Confirmar: apagar tudo?' : 'Apagar progresso'}</button>` : ''}
        </div>
      </div>`,
      {
        volume: (el) => {
          s.volume = Number((el as HTMLInputElement).value);
          this.applySettings();
          this.persist();
        },
        resolucao: (el) => {
          s.resolution = (el as HTMLSelectElement).value as typeof s.resolution;
          this.applySettings();
          this.persist();
        },
        fps: (el) => {
          s.fpsCap = Number((el as HTMLSelectElement).value) as 30 | 60;
          this.applySettings();
          this.persist();
        },
        musica: () => {
          s.music = !s.music;
          this.applySettings();
          this.persist();
          this.showSettings(from);
          this.refocus('[data-action="musica"]');
        },
        tela: () => {
          s.fullscreen = !s.fullscreen;
          this.persist();
          if (window.desktop) window.desktop.setFullscreen(s.fullscreen);
          else if (s.fullscreen)
            void document.documentElement.requestFullscreen?.().catch(() => undefined);
          else if (document.fullscreenElement) void document.exitFullscreen();
          this.showSettings(from);
          this.refocus('[data-action="tela"]');
        },
        apagar: () => {
          if (!this.confirmReset) {
            this.confirmReset = true;
            this.showSettings(from);
            this.refocus('[data-action="apagar"]');
            return;
          }
          this.confirmReset = false;
          this.save = defaultSave();
          this.persist();
          this.applySettings();
          toast('Progresso apagado.');
          this.showTitle();
        },
        voltar: () => {
          this.confirmReset = false;
          if (from === 'pausa') this.openPause();
          else this.showTitle();
        },
      },
      { back: 'voltar' }
    );
  }

  private showCredits(): void {
    this.setScreen('creditos');
    this.ui.render(
      `<div class="panel narrow credits">
        <h2>Créditos</h2>
        <p>Elementa-Mon — um jogo de pets elementais e cartas.</p>
        <p>Feito com Three.js, TypeScript e Vite. Modelos low-poly gerados por código; sons sintetizados com WebAudio.</p>
        <p>Pipeline de arte sugerido: Blockbench (pets), Crocotile 3D (cenários) e Blender.</p>
        <p class="hint">Obrigado por jogar!</p>
        <button data-action="voltar">◀ Menu</button>
      </div>`,
      { voltar: () => this.showTitle() },
      { back: 'voltar' }
    );
  }

  // ---------- run & overworld ----------

  private beginRun(): void {
    this.save.stats.runs += 1;
    this.persist();
    this.run = startRun([...this.save.party], [...this.save.deck], this.level);
    if (!this.overworld) {
      this.overworld = new OverworldView(this.run.map, this.save.avatar);
      this.overworld.onArrive = (x, y) => this.onArrive(x, y);
    } else {
      this.overworld.setAvatar(this.save.avatar.body, this.save.avatar.hat);
      this.overworld.setMap(this.run.map);
    }
    toast(`Andar 1 de ${FLOORS_PER_RUN}`);
    this.showWorld();
  }

  private showWorld(): void {
    const run = this.run;
    if (!run || !this.overworld) return;
    this.setScreen('mundo');
    this.paused = false;
    this.busy = false;
    audio.music('mundo');
    this.engine.setView(this.overworld);
    this.ui.navEnabled = true;
    const party = run.party
      .map((p) => {
        const st = petStats(p);
        return `<div class="mini ${p.hp <= 0 ? 'ko' : ''}"><img src="${creatureThumbnail(p.speciesId, stageOf(p.level))}" alt="" />
          <span>${esc(st.name)} <small>nv ${p.level}</small></span>${bar(p.hp, st.maxHp)}</div>`;
      })
      .join('');
    this.ui.render(
      `<div class="hud">
        <div class="hud-left">
          <div class="floor">Andar ${run.floor}/${FLOORS_PER_RUN}</div>
          <div class="party">${party}</div>
          <div class="items">🧪 ${run.potions} ${run.relics.map((r) => `<span title="${esc(getRelic(r).description)}">${getRelic(r).icon}</span>`).join('')}</div>
        </div>
        <button class="hud-menu" data-action="pausa">☰ Menu</button>
        <div class="hud-hint">Setas/WASD andam · Enter fala · Esc abre o menu</div>
        <div class="dpad">
          <button data-dir="0,-1" aria-label="Cima">▲</button>
          <button data-dir="-1,0" aria-label="Esquerda">◀</button>
          <button data-dir="1,0" aria-label="Direita">▶</button>
          <button data-dir="0,1" aria-label="Baixo">▼</button>
        </div>
      </div>`,
      { pausa: () => this.openPause() }
    );
    (document.activeElement as HTMLElement | null)?.blur();
    for (const b of this.ui.el.querySelectorAll<HTMLElement>('[data-dir]')) {
      const [dx, dy] = (b.dataset.dir as string).split(',').map(Number);
      b.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.touchDir = { dx, dy };
      });
      for (const ev of ['pointerup', 'pointerleave', 'pointercancel'])
        b.addEventListener(ev, () => (this.touchDir = null));
    }
  }

  private openPause(): void {
    const run = this.run;
    if (!run) return;
    this.paused = true;
    this.touchDir = null;
    this.ui.render(
      `<div class="panel narrow pause">
        <h2>Pausa</h2>
        <nav class="menu">
          <button data-action="continuar">Continuar</button>
          <button data-action="inventario">Inventário</button>
          <button data-action="config">Configurações</button>
          <button data-action="desistir" class="danger">Desistir da aventura</button>
        </nav>
      </div>`,
      {
        continuar: () => this.showWorld(),
        inventario: () => this.showInventory(),
        config: () => this.showSettings('pausa'),
        desistir: () => this.gameOver('Você desistiu da aventura.'),
      },
      { back: 'continuar' }
    );
  }

  private showInventory(): void {
    const run = this.run;
    if (!run) return;
    this.setScreen('inventario');
    const pets = run.party
      .map((p) => {
        const st = petStats(p);
        return `<div class="inv-pet">${petCard(p.speciesId, p.level)}
          <div>${bar(p.hp, st.maxHp)} <small>${p.hp}/${st.maxHp} ♥ · XP ${p.xp}</small></div>
          <button data-action="pocao" data-uid="${p.uid}" ${run.potions > 0 && p.hp > 0 && p.hp < st.maxHp ? '' : 'disabled'}>🧪 Usar poção</button>
        </div>`;
      })
      .join('');
    const deckCounts = new Map<string, number>();
    for (const id of run.deck) deckCounts.set(id, (deckCounts.get(id) ?? 0) + 1);
    this.ui.render(
      `<div class="panel wide">
        <h2>Inventário</h2>
        <div class="inv-pets">${pets}</div>
        <h3>Poções: ${run.potions} · Relíquias</h3>
        <ul class="relics">${run.relics.map((r) => `<li>${getRelic(r).icon} <b>${esc(getRelic(r).name)}</b> — ${esc(getRelic(r).description)}</li>`).join('') || '<li>Nenhuma ainda. Procure baús!</li>'}</ul>
        <h3>Deck (${run.deck.length}/${MAX_DECK})</h3>
        <p class="deck-inline">${[...deckCounts].map(([id, n]) => `${esc(getCard(id).name)} ×${n}`).join(' · ')}</p>
        <button data-action="voltar">◀ Voltar</button>
      </div>`,
      {
        pocao: (el) => {
          if (usePotion(run, el.dataset.uid as string)) {
            audio.play('heal');
            toast('Poção usada: +5 de vida.');
          }
          this.showInventory();
        },
        voltar: () => {
          this.setScreen('mundo');
          this.openPause();
        },
      },
      { back: 'voltar' }
    );
  }

  private onArrive(x: number, y: number): void {
    const run = this.run;
    if (!run || !this.overworld) return;
    audio.play('step');
    const tile = tileAt(run.map, x, y);
    run.pos = { x, y };
    if (tile === 'matoAlto' && rollEncounter(run.rng, tile)) {
      void this.startBattle('selvagem');
    } else if (tile === 'bau') {
      const loot = openChest(run);
      setTile(run.map, x, y, 'grama');
      this.overworld.removeAt(x, y);
      audio.play('chest');
      toast(
        loot.kind === 'carta'
          ? `Baú: carta ${getCard(loot.cardId).name}!`
          : loot.kind === 'reliquia'
            ? `Baú: relíquia ${getRelic(loot.relicId).name}! ${getRelic(loot.relicId).description}`
            : 'Baú: uma poção!',
        2600
      );
      this.showWorld();
    } else if (tile === 'cura') {
      healParty(run);
      setTile(run.map, x, y, 'caminho');
      this.overworld.removeAt(x, y);
      audio.play('heal');
      toast('A equipe foi curada!');
      this.showWorld();
    } else if (tile === 'portal') {
      if (run.floor < FLOORS_PER_RUN) {
        this.addXp(XP_REWARD.andar);
        nextFloor(run);
        this.save.stats.bestFloor = Math.max(this.save.stats.bestFloor, run.floor);
        this.persist();
        this.overworld.setMap(run.map);
        audio.play('confirm');
        toast(`Andar ${run.floor} de ${FLOORS_PER_RUN}`);
        this.showWorld();
      } else {
        toast('O guardião do portal apareceu!');
        void this.startBattle('chefe');
      }
    }
  }

  private tryTalk(): void {
    const run = this.run;
    if (!run || !this.overworld || this.overworld.moving || this.busy) return;
    const { x, y } = this.overworld.facingTile();
    if (tileAt(run.map, x, y) === 'treinador') {
      this.encounterAt = { x, y };
      toast('Treinador: "Vamos batalhar!"');
      void this.startBattle('treinador');
    }
  }

  private addXp(amount: number): void {
    const before = this.level;
    this.save.playerXp += amount;
    if (this.run) this.run.playerLevel = this.level;
    if (this.level > before) toast(`Nível de jogador ${this.level}! Novos desbloqueios.`, 2600);
    this.persist();
  }

  // ---------- battle ----------

  private async startBattle(kind: EncounterKind): Promise<void> {
    const run = this.run;
    if (!run) return;
    if (kind !== 'treinador') this.encounterAt = null;
    this.busy = true;
    this.touchDir = null;
    audio.play('encounter');
    document.body.classList.add('flash');
    await wait(450);
    document.body.classList.remove('flash');
    this.encounter = encounterFor(run, kind);
    this.battle = battleFromEncounter(run, this.encounter);
    this.selectedCard = null;
    this.caster = alive(this.battle.party)[0]?.uid ?? null;
    this.shown.clear();
    this.summonElement.clear();
    this.battleView.setBiome(kind === 'chefe' ? 3 : run.floor - 1);
    this.battleView.setup([
      ...this.battle.party.map((f) => ({
        uid: f.uid,
        speciesId: f.speciesId,
        level: f.level,
        side: 'player' as const,
      })),
      ...this.battle.enemies.map((f) => ({
        uid: f.uid,
        speciesId: f.speciesId,
        level: f.level,
        side: 'enemy' as const,
      })),
    ]);
    this.engine.setView(this.battleView);
    this.setScreen('batalha');
    audio.music('batalha');
    this.busy = false;
    const names = this.battle.enemies.map((e) => e.name).join(', ');
    this.renderBattle(
      kind === 'selvagem'
        ? `Um ${names} selvagem apareceu!`
        : kind === 'chefe'
          ? `O chefe enviou ${names}!`
          : `O treinador enviou ${names}!`
    );
  }

  private fighterHp(f: Fighter) {
    return this.shown.get(f.uid) ?? { hp: f.hp, shield: f.shield };
  }

  private renderBattle(message = ''): void {
    const b = this.battle;
    if (!b) return;
    const card = this.selectedCard !== null ? b.hand[this.selectedCard] : null;
    const kind = card ? targetKind(card) : null;
    const row = (f: Fighter) => {
      const s = this.fighterHp(f);
      const ko = s.hp <= 0;
      const targetable =
        !ko &&
        ((kind === 'inimigo' && f.side === 'enemy') || (kind === 'aliado' && f.side === 'player'));
      const isCaster = f.uid === this.caster;
      return `<button class="fighter ${f.side} ${ko ? 'ko' : ''} ${targetable ? 'target' : ''} ${isCaster ? 'caster' : ''}"
          data-action="fighter" data-uid="${f.uid}" ${ko || this.busy ? 'disabled' : ''}>
        <span class="fname">${ELEMENT_INFO[f.element].icon} ${esc(f.name)} <small>nv ${f.level}</small></span>
        <span class="fstats">⚔${f.attack} 🛡${f.defense}${s.shield ? ` <b class="shield">+${s.shield}</b>` : ''}</span>
        ${bar(s.hp, f.maxHp)}<small class="hpnum">${s.hp}/${f.maxHp}</small>
        ${isCaster ? '<i class="tag">usa a carta</i>' : ''}${targetable ? '<i class="tag alvo">alvo</i>' : ''}
      </button>`;
    };
    const mana = MANA_TYPES.map(
      (t) =>
        `<span class="mana-pill" style="--c:${MANA_INFO[t].color}" title="${MANA_INFO[t].name}">${MANA_INFO[t].short} ${b.mana[t]}/${b.maxMana[t]}</span>`
    ).join('');
    const hand = b.hand
      .map((id, i) => {
        const ok = canAfford(b.mana, getCard(id).cost) && b.phase === 'jogador' && !this.busy;
        return `<button class="hand-card ${i === this.selectedCard ? 'selected' : ''}" data-action="carta" data-index="${i}" ${ok ? '' : 'disabled'}>${abilityCard(id)}</button>`;
      })
      .join('');
    const hint =
      message ||
      (b.phase === 'mana'
        ? 'Escolha qual mana cresce nesta rodada.'
        : card
          ? kind === 'inimigo'
            ? `${getCard(card).name}: escolha um inimigo.`
            : `${getCard(card).name}: escolha um aliado.`
          : 'Escolha o pet que vai agir e uma carta.');
    const manaModal =
      b.phase === 'mana' && !this.busy && !b.winner
        ? `<div class="modal"><div class="panel narrow">
            <h2>Rodada ${b.round}</h2><p>Qual mana cresce +1?</p>
            <div class="row">${MANA_TYPES.map((t) => `<button data-action="mana" data-type="${t}" style="--c:${MANA_INFO[t].color}" class="mana-btn">${MANA_INFO[t].name}<br><small>${b.maxMana[t]} → ${Math.min(5, b.maxMana[t] + 1)}</small></button>`).join('')}</div>
          </div></div>`
        : '';
    this.ui.render(
      `<div class="battle ${this.busy ? 'busy' : ''}">
        <div class="side enemies">${b.enemies.map(row).join('')}</div>
        <div class="side allies">${b.party.map(row).join('')}</div>
        <div class="battle-msg">${esc(hint)}</div>
        <div class="battle-bottom">
          <div class="battle-bar">
            <div class="mana">${mana}</div>
            <div class="deck-info">🂠 ${b.deck.length} · descarte ${b.discard.length}${b.summons.length ? ` · ✨ ${b.summons.map((s) => `${esc(s.name)} (${s.turnsLeft})`).join(', ')}` : ''}</div>
            <div class="row">
              ${this.encounter?.kind === 'selvagem' ? `<button data-action="fugir" ${this.busy || b.phase !== 'jogador' ? 'disabled' : ''}>Fugir</button>` : ''}
              <button data-action="fim" class="primary" ${this.busy || b.phase !== 'jogador' ? 'disabled' : ''}>Encerrar turno ▶</button>
            </div>
          </div>
          <div class="hand">${hand}</div>
        </div>
        ${manaModal}
      </div>`,
      {
        carta: (el) => this.onCard(Number(el.dataset.index)),
        fighter: (el) => this.onFighter(el.dataset.uid as string),
        fim: () => void this.onEndTurn(),
        fugir: () => this.flee(),
        mana: (el) => {
          chooseManaGrowth(b, el.dataset.type as ManaType);
          this.renderBattle();
        },
        cancelar: () => {
          this.selectedCard = null;
          this.renderBattle();
        },
      },
      {
        back: 'cancelar',
        focus:
          b.phase === 'mana'
            ? '.mana-btn'
            : this.selectedCard !== null
              ? '.fighter.target'
              : '.hand-card:not([disabled])',
      }
    );
  }

  private onCard(index: number): void {
    const b = this.battle;
    if (!b || this.busy) return;
    if (this.selectedCard === index) {
      this.selectedCard = null;
      return this.renderBattle();
    }
    const id = b.hand[index];
    if (!this.caster || !getFighter(b, this.caster) || (getFighter(b, this.caster)?.hp ?? 0) <= 0) {
      this.caster = alive(b.party)[0]?.uid ?? null;
    }
    if (targetKind(id) === 'nenhum') {
      void this.play(index);
      return;
    }
    this.selectedCard = index;
    this.renderBattle();
  }

  private onFighter(uid: string): void {
    const b = this.battle;
    if (!b || this.busy) return;
    const f = getFighter(b, uid);
    if (!f || f.hp <= 0) return;
    if (this.selectedCard !== null) {
      const kind = targetKind(b.hand[this.selectedCard]);
      if (
        (kind === 'inimigo' && f.side === 'enemy') ||
        (kind === 'aliado' && f.side === 'player')
      ) {
        void this.play(this.selectedCard, uid);
        return;
      }
    }
    if (f.side === 'player') {
      this.caster = uid;
      this.renderBattle(`${f.name} vai usar a próxima carta.`);
    }
  }

  private snapshot(): void {
    const b = this.battle;
    if (!b) return;
    this.shown.clear();
    for (const f of [...b.party, ...b.enemies])
      this.shown.set(f.uid, { hp: f.hp, shield: f.shield });
  }

  private async play(index: number, target?: string): Promise<void> {
    const b = this.battle;
    if (!b || !this.caster) return;
    this.snapshot();
    const result = playCard(b, index, this.caster, target);
    this.selectedCard = null;
    if (!result.ok) {
      this.shown.clear();
      toast(result.error ?? 'Não deu.');
      return this.renderBattle();
    }
    await this.animate(result.events);
  }

  private async onEndTurn(): Promise<void> {
    const b = this.battle;
    if (!b || this.busy) return;
    this.selectedCard = null;
    this.snapshot();
    await this.animate(endTurn(b));
  }

  private async animate(events: BattleEvent[]): Promise<void> {
    const b = this.battle;
    if (!b) return;
    this.busy = true;
    this.renderBattle();
    let element: string = 'neutro';
    const canvas = this.engine.canvas;
    const at = (uid: string) =>
      this.battleView.screenPos(uid, canvas) ?? { x: innerWidth / 2, y: innerHeight / 2 };
    const msg = (text: string) => {
      const el = this.ui.el.querySelector('.battle-msg');
      if (el) el.textContent = text;
    };
    const refresh = () => {
      const keep = this.ui.el.querySelector('.battle-msg')?.textContent ?? '';
      this.renderBattle(keep);
    };

    for (const ev of events) {
      switch (ev.type) {
        case 'carta': {
          const card = getCard(ev.cardId);
          element = card.element;
          msg(`${getFighter(b, ev.casterUid)?.name ?? ''} usou ${card.name}!`);
          await wait(250);
          break;
        }
        case 'turno':
          if (ev.side === 'enemy') msg('Vez dos inimigos…');
          await wait(350);
          element = 'enemy';
          break;
        case 'dano': {
          const src = getFighter(b, ev.sourceUid);
          const el =
            this.summonElement.get(ev.sourceUid) ??
            (element === 'enemy' ? src?.element : element) ??
            'neutro';
          if (src) await this.battleView.attack(ev.sourceUid, ev.targetUid);
          audio.play('hit');
          const s = this.shown.get(ev.targetUid);
          if (s) {
            s.shield -= ev.absorbed;
            s.hp = Math.max(0, s.hp - ev.amount);
          }
          const p = at(ev.targetUid);
          floatText(`-${ev.amount}${ev.absorbed ? ` (🛡${ev.absorbed})` : ''}`, p.x, p.y, 'dano');
          if (ev.multiplier > 1) floatText('Super eficaz!', p.x, p.y - 24, 'info');
          else if (ev.multiplier < 1) floatText('Pouco eficaz…', p.x, p.y - 24, 'info');
          await this.battleView.hit(ev.targetUid, el as never);
          refresh();
          break;
        }
        case 'cura': {
          audio.play('heal');
          const s = this.shown.get(ev.targetUid);
          if (s) s.hp += ev.amount;
          const p = at(ev.targetUid);
          floatText(`+${ev.amount}`, p.x, p.y, 'cura');
          await this.battleView.glow(ev.targetUid, 0x6bff8f);
          refresh();
          break;
        }
        case 'escudo': {
          audio.play('shield');
          const s = this.shown.get(ev.targetUid);
          if (s) s.shield += ev.amount;
          const p = at(ev.targetUid);
          floatText(`+${ev.amount} 🛡`, p.x, p.y, 'escudo');
          await this.battleView.glow(ev.targetUid, 0x6bb8ff);
          refresh();
          break;
        }
        case 'fortalecer': {
          const p = at(ev.targetUid);
          floatText(`+${ev.amount} ⚔`, p.x, p.y, 'info');
          await this.battleView.glow(ev.targetUid, 0xffa94d);
          break;
        }
        case 'comprar':
          toast(`Comprou ${ev.count} carta${ev.count > 1 ? 's' : ''}.`, 1000);
          break;
        case 'invocar': {
          const summon = b.summons.find((s) => s.uid === ev.summonUid);
          this.summonElement.set(ev.summonUid, summon?.element ?? 'neutro');
          this.battleView.addSummon(summon?.element ?? 'neutro');
          msg(`${ev.name} entrou na batalha!`);
          await wait(400);
          break;
        }
        case 'invocacaoSaiu':
          this.battleView.removeSummon();
          msg('A invocação foi embora.');
          await wait(250);
          break;
        case 'nocaute':
          msg(`${getFighter(b, ev.uid)?.name ?? ''} desmaiou!`);
          await this.battleView.faint(ev.uid);
          break;
        case 'fim':
          break;
      }
    }
    this.shown.clear();
    this.busy = false;
    if (b.winner) return this.finishBattle();
    if (!getFighter(b, this.caster ?? '') || (getFighter(b, this.caster ?? '')?.hp ?? 0) <= 0) {
      this.caster = alive(b.party)[0]?.uid ?? null;
    }
    this.renderBattle(b.phase === 'mana' ? '' : undefined);
  }

  private flee(): void {
    const run = this.run;
    const b = this.battle;
    if (!run || !b) return;
    syncAfterBattle(run, b);
    toast('Você fugiu!');
    this.battle = null;
    this.showWorld();
  }

  private finishBattle(): void {
    const run = this.run;
    const b = this.battle;
    const enc = this.encounter;
    if (!run || !b || !enc) return;
    if (b.winner === 'enemy') {
      syncAfterBattle(run, b);
      audio.play('lose');
      return this.gameOver('Todos os seus pets desmaiaram.');
    }
    audio.play('win');
    const reward = winBattle(run, b, enc);
    this.addXp(reward.xp);
    this.save.stats.battlesWon += 1;
    this.persist();
    if (enc.kind === 'treinador' && this.encounterAt) {
      setTile(run.map, this.encounterAt.x, this.encounterAt.y, 'caminho');
      this.overworld?.removeAt(this.encounterAt.x, this.encounterAt.y);
    }
    this.battle = null;
    if (enc.kind === 'chefe') return this.victory();
    this.reward = reward;
    if (reward.evolutions.length) audio.play('evolve');
    this.showReward();
  }

  private showReward(): void {
    const run = this.run;
    const reward = this.reward;
    if (!run || !reward) return;
    this.setScreen('recompensa');
    const choices = reward.cardChoices.filter((id) => canAddCard(run.deck, id, run.playerLevel));
    this.ui.render(
      `<div class="panel wide reward">
        <h2>Vitória!</h2>
        <p>+${reward.xp} XP de jogador${reward.evolutions.length ? '' : ' · os pets ganharam experiência'}</p>
        ${reward.evolutions.map((e) => `<p class="evolve">✨ ${esc(e)}</p>`).join('')}
        ${
          reward.recruit
            ? `<h3>${esc(getSpecies(reward.recruit).stages[0].name)} quer entrar na equipe!</h3>
               <div class="choices"><button class="choice" data-action="recrutar">${petCard(reward.recruit, 1)}</button></div>`
            : ''
        }
        <h3>${choices.length ? 'Escolha uma carta para o deck' : 'O deck está cheio'}</h3>
        <div class="choices">${choices.map((id) => `<button class="choice" data-action="carta" data-id="${id}">${abilityCard(id)}</button>`).join('')}</div>
        <div class="row"><button data-action="pular">Continuar sem carta ▶</button></div>
      </div>`,
      {
        recrutar: () => {
          if (reward.recruit) {
            recruit(run, reward.recruit);
            toast(`${getSpecies(reward.recruit).stages[0].name} entrou na equipe!`);
            reward.recruit = undefined;
          }
          this.showReward();
        },
        carta: (el) => {
          addCard(run, el.dataset.id as string);
          toast(`${getCard(el.dataset.id as string).name} foi para o deck.`);
          this.reward = null;
          this.showWorld();
        },
        pular: () => {
          this.reward = null;
          this.showWorld();
        },
      },
      { back: 'pular', focus: '.choice' }
    );
  }

  private gameOver(reason: string): void {
    const run = this.run;
    this.setScreen('derrota');
    audio.music(null);
    this.showcase();
    this.ui.render(
      `<div class="panel narrow">
        <h2>Fim da jornada</h2>
        <p class="big-text">${esc(reason)}</p>
        <p>Andar alcançado: ${run?.floor ?? 1} · Batalhas vencidas: ${run?.battlesWon ?? 0} · XP ganho: ${run?.xpEarned ?? 0}</p>
        <p class="hint">Os pets voltam ao nível 1 na próxima aventura, mas o seu nível de jogador (${this.level}) continua.</p>
        <div class="row">
          <button data-action="menu">Menu</button>
          <button data-action="denovo" class="primary">Tentar de novo ▶</button>
        </div>
      </div>`,
      { menu: () => this.showTitle(), denovo: () => this.showBuilder() },
      { focus: '.primary' }
    );
    this.run = null;
  }

  private victory(): void {
    const run = this.run;
    this.save.stats.victories += 1;
    this.save.stats.bestFloor = FLOORS_PER_RUN;
    this.persist();
    window.desktop?.unlockAchievement?.('PRIMEIRA_VITORIA');
    this.setScreen('vitoria');
    audio.music('menu');
    this.battleView.setBiome(0);
    this.battleView.setup(
      (run?.party ?? []).map((p) => ({
        uid: p.uid,
        speciesId: p.speciesId,
        level: p.level,
        side: 'player' as const,
      })),
      true
    );
    this.engine.setView(this.battleView);
    this.ui.render(
      `<div class="panel narrow">
        <h2>🏆 Você venceu o guardião!</h2>
        <p class="big-text">A sua equipe atravessou os ${FLOORS_PER_RUN} andares.</p>
        <p>Batalhas vencidas: ${run?.battlesWon ?? 0} · XP ganho: ${run?.xpEarned ?? 0} · Nível de jogador: ${this.level}</p>
        <div class="row">
          <button data-action="creditos">Créditos</button>
          <button data-action="menu" class="primary">Menu ▶</button>
        </div>
      </div>`,
      { menu: () => this.showTitle(), creditos: () => this.showCredits() },
      { focus: '.primary' }
    );
    this.run = null;
  }
}
