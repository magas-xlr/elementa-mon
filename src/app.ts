import { DirectionalLight, HemisphereLight, PerspectiveCamera, Scene } from 'three';
import { audio } from './audio';
import { ecoMusicProfile } from './music';
import logoUrl from './assets/logo.webp';
import {
  CARDS,
  MANA_INFO,
  MANA_TYPES,
  cardLore,
  cardName,
  getCard,
  manaName,
  manaShort,
  type ManaType,
} from './game/data/cards';
import { BIOMES, biomeName } from './game/data/biomes';
import { npcForBiome, STORY_NPCS } from './game/data/npcs';
import { BUILDINGS, type BuildingKind } from './game/data/buildings';
import { dailyMatchup } from './game/rules/gambling';
import { CAR_MODELS, getCar } from './game/rules/social';
import {
  APPLIANCES,
  computeUtilityImpact,
  getAppliance,
  RECYCLING_BIN_LABELS,
  type RecyclingBin,
} from './game/rules/utilities';
import { MARTIAL_ARTS, type MartialArtId } from './game/rules/dojo';
import { ALL_FOSSIL_BONES, hasCompleteDinosaurFossil, SEEDS } from './game/rules/biogeochem';
import { BOSSES_TO_UNLOCK_SEWER, SEWER_BIOMES, TALKING_MONSTERS } from './game/rules/sewerQuest';
import { NGOS } from './game/rules/ngos';
import { LITTER_DEFS, PACKING_BOX_PRICE, type DisposalTarget } from './game/rules/litter';
import { HIREABLE_HUMANS, ROBOT_BUY_PRICE } from './game/rules/business';
import {
  esgScoreOf,
  MAINTENANCE_COST,
  rankLowestWasteProducers,
  RAW_MATERIALS_ESG,
  RESERVE_COST,
  verifyCleanerProduction,
} from './game/rules/sustainability';
import { BIOME_ENDEMISM, HYDRO_DAM_COST } from './game/rules/biosphere';
import { HOSPITAL_COST, itemsForShop, SHOP_META, type ShopId } from './game/data/shops';
import { JOBS, getJobItem } from './game/data/jobs';
import { BIOME_ECONOMIES, PLAYER_SHOP_GOODS, STOCKS, biomeEconomy } from './game/data/economy';
import {
  buyStock,
  depositAtBank,
  exchangeCurrency,
  localPrice,
  restockMyShop,
  sellFromMyShop,
  sellStock,
  withdrawFromBank,
} from './game/rules/economy';
import {
  cardEcoDamage,
  computeLabAccidentChance,
  damageBiomeEcology,
  labCatalystForBiome,
  shopRelationPriceFactor,
  WEATHER_META,
} from './game/rules/ecology';
import { APARTMENTS, masonQuotePrice } from './game/rules/housing';
import { MATERIAL_BUNDLES, prefeituraForBiome } from './game/data/governance';
import { seizedHouseBuybackPrice } from './game/rules/governance';
import {
  computeEcologicalIntegrity,
  ecosystemForBiome,
  evaluateEcologicalEnding,
  getGeneTrait,
} from './game/data/biodiversity';
import { ELEMENTS, elementLabel, type Element } from './game/data/elements';
import { getRelic, relicDescription, relicName } from './game/data/relics';
import { SPECIES, STARTER_SPECIES, isStarter, stageLore, stageName } from './game/data/species';
import {
  alive,
  canAfford,
  canUseCard,
  chooseManaGrowth,
  endTurn,
  getFighter,
  petMonster,
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
  avatarColorName,
  createPet,
  petStats,
  playerLevelProgress,
  stageOf,
} from './game/rules/progression';
import {
  beautyRespectBonus,
  formatClock,
  isNight,
  timePhase,
  willDisobey,
} from './game/rules/life';
import {
  doorAt,
  setTile,
  tileAt,
  type EncounterKind,
  type Encounter,
  type WildSpawn,
} from './game/rules/world';
import {
  acceptJob,
  addCard,
  anthropoceneReportForRun,
  applyCompostToGarden,
  applyCrystal,
  battleFromEncounter,
  betOnPetBattle,
  buryFallenPets,
  buildHydroDamInRun,
  buildMyHouse,
  buyApplianceItem,
  buyBuildingPermit,
  buyCar,
  buyLabCatalyst,
  buyMacabreItem,
  buyMaterialsForRun,
  buySeeds,
  buyShopItem,
  buyShopRobotInRun,
  buybackSeizedHouse,
  buyGlassPackingBox,
  buildProtagonistMirrorBoss,
  careForPet,
  changePetElement,
  chargeElementalTax,
  checkApartmentBrokerInRun,
  checkPermafrostEvent,
  checkSewerUnlock,
  chopTreeInRun,
  claimLabPod,
  clearLotInRun,
  collectDojoPet,
  completeJob,
  createReserveInRun,
  currentBiome,
  discardExcessItem,
  drinkWaterInRun,
  encounterFor,
  ensureActivePet,
  fastTravelByCar,
  fireEmployee,
  globalTempDeltaC,
  grantJobItem,
  handOutFlyersInRun,
  handleOwnedItem,
  improveSanitationInRun,
  installEnergyPlantInRun,
  harvestAndFeedHomeFood,
  healAtHospital,
  healParty,
  hireHumanEmployee,
  hireMasonForRun,
  isExtremeHeat,
  joinNgo,
  LAB_FEE,
  LAB_GENES_NEEDED,
  MACABRE_ITEM_PRICE,
  maintainBiomeInRun,
  makeCompost,
  MAX_INVENTORY_ITEMS,
  mineMineralsInRun,
  movePlayerToApartment,
  moveTo,
  moveToBench,
  moveToParty,
  openChest,
  partyAverageBeauty,
  payIptu,
  payNgoFineInRun,
  payUtilityBill,
  performMilitancyInRun,
  pickupGroundLitterInRun,
  plantHomeSeed,
  playerStatusScore,
  protestTrashWithNgo,
  recordWildKillInRun,
  recoverExtinctSpecies,
  recruitToNgo,
  recycleLitterInRun,
  repairBagacoInRun,
  replantTreeInRun,
  RESURRECT_FEE,
  RESURRECT_MACABRE_NEEDED,
  restoreBiomeWithGovernment,
  restoreSkeletonWithWitch,
  resurrectPetAtLab,
  reviveFossilAtLab,
  runMyShopShiftInRun,
  runRsaAuditInRun,
  searchForFossil,
  seasonForDay,
  sellMineralsInRun,
  setActivePet,
  startDojoTraining,
  startLabTransmodification,
  talkToConspiracyLeader,
  totalInventoryItems,
  treatEmployee,
  type NgoId,
  startRun,
  syncAfterBattle,
  takeCrystal,
  tickRunLife,
  usePotion,
  waitLabHours,
  winBattle,
  type Reward,
  type RunState,
} from './game/state/run';
import { ENERGY_SOURCE_LIST, energySourceForBiome, type EnergySourceId } from './game/rules/energy';
import {
  ANTHROPOCENE_MANIFESTO,
  SANITATION_UPGRADE_COST,
  sanitationQualityLabel,
} from './game/rules/hydroRisk';
import { defaultSave, loadSave, playerLevel, writeSave, type SaveData } from './game/state/save';
import { LANGS, LANG_NAMES, setLang, t, tutorialPages, type Lang } from './i18n';
import { input, type Action } from './input';
import type { TrackId } from './music';
import { BattleView } from './render/battleView';
import { Engine, type View } from './render/engine';
import { createHeroModel, type HeroModel } from './render/heroModel';
import { InteriorView } from './render/interiorView';
import { OverworldView } from './render/overworld';
import { skyTexture } from './render/pixelTextures';
import { initThumbnails, creatureThumbnail } from './render/thumbnails';
import { abilityCard, manaCost } from './ui/cards';
import { elementIcon, gameIcon } from './ui/icons';
import { createArcadeController, type ArcadeController } from './ui/arcadeGames';
import { openComicDialogue, openTestVisualNovelDialogue } from './ui/comicDialogue';
import { playIntroVideo } from './ui/introVideo';
import { playCutscene } from './ui/cutscene';
import { playDigivolveAnimation } from './ui/digivolve';
import { showItemGet } from './ui/itemGet';
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

/** Gem counts for the HUD, in element order using original universal SVG emblems. */
const gemIcons = (gems: Partial<Record<Element, number>>): string =>
  ELEMENTS.filter((e) => (gems[e] ?? 0) > 0)
    .map((e) => `<span class="gem-count">${elementIcon(e, 16)}${gems[e]}</span>`)
    .join(' ');

type Screen =
  | 'titulo'
  | 'tutorial'
  | 'preparar'
  | 'mundo'
  | 'interior'
  | 'batalha'
  | 'recompensa'
  | 'inventario'
  | 'personalizar'
  | 'status'
  | 'config'
  | 'derrota'
  | 'vitoria'
  | 'creditos';

export class Game {
  private save: SaveData = loadSave();
  private engine: Engine;
  private ui: UiRoot;
  private screen: Screen = 'titulo';
  private battleView = new BattleView();
  private overworld: OverworldView | null = null;
  private interior: InteriorView | null = null;
  private insideBuilding: BuildingKind | null = null;
  private run: RunState | null = null;
  private battle: BattleState | null = null;
  private encounter: Encounter | null = null;
  private encounterAt: { x: number; y: number } | null = null;
  private reward: Reward | null = null;
  private paused = false;
  private busy = false;
  private selectedCard: number | null = null;
  /** Petting (capture): the style menu is open, or a style was picked and awaits a target. */
  private petMenu = false;
  private petting: ManaType | null = null;
  private caster: string | null = null;
  private shown = new Map<string, { hp: number; shield: number }>();
  private summonElement = new Map<string, string>();
  private tutorialPage = 0;
  private confirmReset = false;
  private touchDir: { dx: number; dy: number } | null = null;
  private perf: HTMLElement;
  private perfOn = false;
  private avatarView:
    (View & { hero: HeroModel; previewWalk: boolean; previewSpin: boolean }) | null = null;
  private activeShop:
    | ShopId
    | 'cuidar'
    | 'jogos'
    | 'trabalhos'
    | 'banco_fin'
    | 'minhaloja'
    | 'laboratorio'
    | 'moradia'
    | 'prefeitura'
    | 'apostas'
    | 'garagem' = 'comida';
  private lastCustomerQuote = '';
  private invTab: 'pets' | 'itens' | 'estatuas' | 'ecologia' = 'pets';
  private invSelected = '';
  private activeShopPetUid: string | null = null;
  private arcade: ArcadeController | null = null;
  private clockHudTimer = 0;

  constructor(canvas: HTMLCanvasElement, uiEl: HTMLElement, perfEl: HTMLElement) {
    this.engine = new Engine(canvas);
    initThumbnails(this.engine.renderer);
    this.ui = new UiRoot(uiEl);
    this.perf = perfEl;
    this.applySettings();
    this.engine.onFrame = (dt) => this.frame(dt);
    input.on((a) => this.onAction(a));
    input.onGamepadChange((brand) => {
      if (brand) toast(`🎮 Controle ${brand} conectado! Use D-Pad/Analógico, A/B e L1/R1.`, 2800);
    });
    window.addEventListener('keydown', (e) => {
      if (e.code === 'F3') {
        e.preventDefault();
        this.perfOn = !this.perfOn;
        this.perf.hidden = !this.perfOn;
      } else if (
        e.code === 'KeyC' &&
        this.screen === 'mundo' &&
        !this.paused &&
        !this.busy &&
        this.run &&
        this.overworld
      ) {
        const ft = this.overworld.facingTile();
        if (tileAt(this.run.map, ft.x, ft.y) === 'arvore') {
          const res = chopTreeInRun(this.run, ft.x, ft.y);
          if (res.ok) {
            audio.play('hit');
            this.overworld.setMap(this.run.map, this.run.pos);
            toast(res.msg, 3400);
            this.showWorld();
          }
        }
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
    setLang(s.lang);
    this.engine.configure(s.resolution, s.fpsCap, s.postFx);
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
    if (this.screen === 'interior' && !this.paused && !this.busy && this.interior) {
      const dir = this.touchDir ?? input.direction();
      this.interior.moveInput(dir?.dx ?? 0, dir?.dy ?? 0, dt);
      if (this.interior.onExitMat) {
        this.exitBuilding();
      }
      return;
    }
    if (this.screen !== 'mundo' || this.paused || this.busy || !this.overworld) return;
    if (this.run) {
      const inTown = currentBiome(this.run) === 0 && this.run.pos.x <= 11;
      const alerts = tickRunLife(this.run, dt, inTown);
      this.overworld.setTimePhase(timePhase(this.run.clock));
      this.clockHudTimer += dt;
      if (this.clockHudTimer >= 0.6) {
        this.clockHudTimer = 0;
        const clk = this.ui.el.querySelector('.hud-clock');
        if (clk) clk.textContent = `${formatClock(this.run.clock)} · 🪙 ${this.run.coins}`;
      }
      if (alerts.length) {
        for (const msg of alerts) toast(msg, 3600);
        if (this.run.envSim.playerHydration <= 0) {
          this.gameOver('💀 Você morreu de desidratação por ficar sem beber água!');
          return;
        }
        if (this.run.party.length === 0) {
          this.gameOver('Todos os seus pets morreram...');
          return;
        }
        this.showWorld();
      }
    }
    const dir = this.touchDir ?? input.direction();
    if (!dir) return;
    const result = this.overworld.move(dir.dx, dir.dy);
    if (result === 'blocked') this.tryTalk();
  }

  private onAction(a: Action): void {
    if (this.screen === 'interior' && !this.paused) {
      if (a === 'cancel' || a === 'menu') this.exitBuilding();
      else if (a === 'confirm' && this.insideBuilding)
        this.openBuildingCounter(this.insideBuilding);
      return;
    }
    if (this.screen === 'mundo' && !this.paused) {
      if (a === 'menu' || a === 'cancel') this.openPause();
      else if (a === 'confirm') this.tryTalk();
      else if (a === 'tabNext') this.showInventory();
      return;
    }
    if (this.busy) return;
    // Universal Gamepad L1/R1 shoulder-bumper tab cycling in Inventory & Town Hub!
    if (a === 'tabPrev' || a === 'tabNext') {
      const dir = a === 'tabNext' ? 1 : -1;
      if (this.screen === 'inventario') {
        const list: (typeof this.invTab)[] = ['pets', 'itens', 'estatuas', 'ecologia'];
        this.invTab = list[(list.indexOf(this.invTab) + dir + list.length) % list.length];
        this.invSelected = '';
        this.showInventory();
        return;
      }
      if (this.paused && this.run) {
        const tabs: (typeof this.activeShop)[] = [
          'banco_fin',
          'minhaloja',
          'moradia',
          'laboratorio',
          'comida',
          'roupinhas',
          'beleza',
          'hospital',
          'livros',
          'jogos',
          'trabalhos',
          'cuidar',
        ];
        this.showTownHub(tabs[(tabs.indexOf(this.activeShop) + dir + tabs.length) % tabs.length]);
        return;
      }
    }
    this.ui.handleAction(a);
  }

  private showcase(): void {
    this.battleView.setBiome(0);
    this.battleView.setShowcaseHero(this.save.avatar.body, this.save.avatar.hat);
    // Always feature Caputino (orelhito) alongside the player's party on the Title Diorama!
    const showcaseIds = this.save.party.includes('orelhito')
      ? this.save.party
      : ['orelhito', ...this.save.party.slice(0, 2)];
    this.battleView.setup(
      showcaseIds.map((id, i) => ({
        uid: `show-${i}`,
        speciesId: id,
        level: 1,
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
    const foundPets = new Set(this.save.discoveredSpecies ?? this.save.party).size;
    const foundBiomes = Math.max(
      1,
      this.save.stats.biomesFound,
      (this.save.discoveredBiomes ?? [0]).length
    );
    this.ui.render(
      `<div class="title-screen">
        <div class="title-header">
          <h1 class="logo"><img src="${logoUrl}" alt="Elementa-Mon" draggable="false" /></h1>
          <p class="tagline">${t('tagline')}</p>
        </div>
        <nav class="menu title-menu">
          <button data-action="jogar" class="primary play-cta"><span class="cta-label">${t('play')}</span></button>
          <div class="menu-grid">
            <button data-action="intro" class="btn-wood"><span class="btn-ico">🎬</span><span>Introdução</span></button>
            <button data-action="teste_vn" class="btn-wood"><span class="btn-ico">💬</span><span>Diálogo Teste (VN)</span></button>
            <button data-action="tutorial" class="btn-wood"><span class="btn-ico">📖</span><span>${t('tutorial')}</span></button>
            <button data-action="personalizar" class="btn-wood"><span class="btn-ico">🖌️</span><span>${t('customize')}</span></button>
            <button data-action="status" class="btn-stone"><span>${t('status')}</span></button>
            <button data-action="config" class="btn-stone"><span class="btn-ico">⚙️</span><span>${t('settings')}</span></button>
            <button data-action="creditos" class="btn-wood">${t('credits')}</button>
            ${window.desktop ? `<button data-action="sair" class="btn-wood danger">${t('quit')}</button>` : ''}
          </div>
        </nav>
        <div class="player-chip discovery-chip">
          <span class="chip-lvl">✦ ${foundPets}/${SPECIES.length} pets · ${foundBiomes}/${BIOMES.length} biomas</span>
        </div>
      </div>`,
      {
        jogar: async () => {
          if (!this.save.tutorialSeen) {
            await playIntroVideo();
            this.showTutorial(true);
          } else {
            this.showBuilder();
          }
        },
        intro: () => void playIntroVideo(),
        teste_vn: () => void openTestVisualNovelDialogue(this.save.settings.lang),
        tutorial: () => this.showTutorial(false),
        personalizar: () => this.showCustomize(),
        status: () => this.showStatus(),
        config: () => this.showSettings(),
        creditos: () => this.showCredits(),
        sair: () => window.desktop?.quit(),
      },
      { focus: '.play-cta' }
    );
  }

  private showTutorial(thenPlay: boolean): void {
    this.setScreen('tutorial');
    const pages = tutorialPages();
    const page = pages[this.tutorialPage];
    const last = this.tutorialPage === pages.length - 1;
    this.ui.render(
      `<div class="panel narrow">
        <h2>${esc(page.title)}</h2>
        <p class="big-text">${esc(page.text)}</p>
        <div class="dots">${pages.map((_, i) => `<i class="${i === this.tutorialPage ? 'on' : ''}"></i>`).join('')}</div>
        <div class="row">
          <button data-action="voltar">${this.tutorialPage === 0 ? t('menu') : t('prev')}</button>
          <button data-action="proximo" class="primary">${last ? (thenPlay ? t('begin') : t('finish')) : t('next')}</button>
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
    const party = this.save.party.filter(isStarter).slice(0, MAX_PARTY);
    if (party.length === 0) party.push(...STARTER_SPECIES);
    const deck = this.save.deck.filter((id) => getCard(id).requiredLevel <= lvl);
    this.save.party = party;
    this.save.deck = deck;
    const errors = [...validateParty(party, lvl), ...validateDeck(deck, lvl)];
    const counts = new Map<string, number>();
    for (const id of deck) counts.set(id, (counts.get(id) ?? 0) + 1);

    const discoveredSp = new Set(this.save.discoveredSpecies ?? this.save.party);
    const speciesHtml = SPECIES.filter((s) => isStarter(s.id))
      .map((s) => {
        const locked = s.requiredLevel > lvl;
        const secret = locked && !discoveredSp.has(s.id);
        const on = party.includes(s.id);
        if (secret) {
          return `<button class="pick secret" disabled title="???">
          <span class="secret-icon">?</span><span>???</span>
          <small>Segredo</small>
        </button>`;
        }
        const thumb = creatureThumbnail(s.id, 0);
        return `<button class="pick ${on ? 'on' : ''}" data-action="pet" data-id="${s.id}" ${locked ? 'disabled' : ''}
        title="${esc(stageLore(s, 0))}">
        <img src="${thumb}" alt="" /><span>${elementIcon('neutro', 16)} ${esc(stageName(s, 0))}</span>
        ${locked ? `<small>🔒 ???</small>` : on ? `<small>${t('inTeam')}</small>` : ''}
      </button>`;
      })
      .join('');

    const discoveredCards = new Set(this.save.discoveredCards ?? this.save.deck);
    let secretCards = 0;
    const cardsHtml =
      CARDS.map((c) => {
        const n = counts.get(c.id) ?? 0;
        const locked = c.requiredLevel > lvl;
        if (locked && !discoveredCards.has(c.id)) {
          secretCards += 1;
          return '';
        }
        return `<div class="deck-row ${locked ? 'locked' : ''}">
        <span class="cost">${manaCost(c.cost)}</span>
        <span class="cname" title="${esc(cardLore(c))}">${elementIcon(c.element, 16)} ${esc(cardName(c))}${c.kind === 'invocacao' ? ` <em>${t('summonTag')}</em>` : ''}</span>
        ${
          locked
            ? `<small>🔒 ???</small>`
            : `
        <button data-action="menos" data-id="${c.id}" ${n === 0 ? 'disabled' : ''} aria-label="${t('remove')}">−</button>
        <b class="count">${n}</b>
        <button data-action="mais" data-id="${c.id}" ${canAddCard(deck, c.id, lvl) ? '' : 'disabled'} aria-label="${t('add')}">+</button>`
        }
      </div>`;
      }).join('') +
      (secretCards > 0
        ? `<div class="deck-row locked"><span class="cname">🔒 +${secretCards} cartas secretas para descobrir explorando...</span></div>`
        : '');

    this.ui.render(
      `<div class="panel wide builder">
        <h2>${t('builderTitle')}</h2>
        <section>
          <h3>${t('team')} <small>${t('teamCount', { n: party.length, max: MAX_PARTY })}</small></h3>
          <div class="picks">${speciesHtml}</div>
          <p class="hint">${t('starterHint')}</p>
        </section>
        <section>
          <h3>${t('deck')} <small>${t('deckCount', { n: deck.length, max: MAX_DECK })}</small></h3>
          <div class="deck-list">${cardsHtml}</div>
        </section>
        ${errors.length ? `<ul class="errors">${errors.map((e) => `<li>${esc(e)}</li>`).join('')}</ul>` : ''}
        <div class="row">
          <button data-action="voltar">${t('backMenu')}</button>
          <button data-action="padrao">${t('defaultDeck')}</button>
          <button data-action="comecar" class="primary" ${errors.length ? 'disabled' : ''}>${t('startRun')}</button>
        </div>
      </div>`,
      {
        voltar: () => this.showTitle(),
        pet: (el) => {
          const id = el.dataset.id as string;
          if (party.includes(id)) {
            if (party.length > 1) this.save.party = party.filter((p) => p !== id);
          } else if (party.length < MAX_PARTY) this.save.party = [...party, id];
          else toast(t('teamFull'));
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
        comecar: () => void this.beginRun(),
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
      scene.background = skyTexture(0x6fc2ff, 9);
      scene.add(new HemisphereLight(0xf2fbff, 0x6ea060, 1.3));
      const sun = new DirectionalLight(0xfff4dc, 2.5);
      sun.position.set(2, 5, 4);
      scene.add(sun);
      const camera = new PerspectiveCamera(30, 1, 0.1, 20);
      camera.position.set(0.46, 0.95, 3.55);
      camera.lookAt(0.36, 0.74, 0);
      const hero = createHeroModel(this.save.avatar.body, this.save.avatar.hat);
      hero.root.position.set(0.62, 0, 0);
      hero.root.rotation.y = 0.18;
      scene.add(hero.root);
      const view = {
        scene,
        camera,
        hero,
        previewWalk: false,
        previewSpin: false,
        update: (dt: number, time: number) => {
          if (view.previewSpin) hero.root.rotation.y = Math.sin(time * 0.75) * 0.75;
          hero.update(dt, time, view.previewWalk);
        },
        resize: (aspect: number) => {
          camera.aspect = aspect;
          camera.updateProjectionMatrix();
        },
      };
      this.avatarView = view;
    }
    const view = this.avatarView;
    view.hero.setColors(this.save.avatar.body, this.save.avatar.hat);
    this.engine.setView(view);

    const swatches = (slot: 'body' | 'hat') =>
      AVATAR_COLORS.map((c, i) => {
        const locked = c.level > lvl;
        const on = this.save.avatar[slot] === c.color;
        return `<button class="swatch ${on ? 'on' : ''}" style="--c:${hex(c.color)}" data-action="${slot}" data-color="${c.color}"
          ${locked ? 'disabled' : ''} title="${esc(avatarColorName(i))}${locked ? ` ${t('colorLevel', { n: c.level })}` : ''}">${locked ? '🔒' : ''}</button>`;
      }).join('');
    this.ui.render(
      `<div class="panel side-panel">
        <h2>${t('customize')}</h2>
        <h3>${t('outfit')}</h3><div class="swatches">${swatches('body')}</div>
        <h3>${t('cap')}</h3><div class="swatches">${swatches('hat')}</div>
        <h3>Animações</h3>
        <div class="row">
          <button data-action="anim" data-mode="idle">Respirar</button>
          <button data-action="anim" data-mode="walk">Caminhar</button>
          <button data-action="anim" data-mode="blink">Piscar</button>
          <button data-action="anim" data-mode="talk">Falar</button>
          <button data-action="anim" data-mode="startled">Assustar</button>
          <button data-action="anim" data-mode="attack">Combate</button>
        </div>
        <p class="hint">${t('colorsHint')}</p>
        <button data-action="voltar">${t('backMenu')}</button>
      </div>`,
      {
        body: (el) => this.setAvatarColor('body', Number(el.dataset.color)),
        hat: (el) => this.setAvatarColor('hat', Number(el.dataset.color)),
        anim: (el) => {
          const mode = el.dataset.mode;
          view.previewWalk = mode === 'walk';
          if (mode === 'idle' || mode === 'walk') view.hero.setExpression('normal');
          else if (mode === 'blink') view.hero.setExpression('blink');
          else if (mode === 'talk') view.hero.setExpression('talk');
          else if (mode === 'startled') view.hero.setExpression('startled');
          else if (mode === 'attack') {
            view.hero.setExpression('normal');
            view.hero.playAction('attack');
          }
        },
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
        name: t('unlockPet', { name: stageName(s, 0) }),
      })),
      ...CARDS.filter((c) => c.requiredLevel > p.level).map((c) => ({
        lvl: c.requiredLevel,
        name: t('unlockCard', { name: cardName(c) }),
      })),
      ...AVATAR_COLORS.map((c, i) => ({ c, i }))
        .filter(({ c }) => c.level > p.level)
        .map(({ c, i }) => ({
          lvl: c.level,
          name: t('unlockColor', { name: avatarColorName(i) }),
        })),
    ]
      .sort((a, b) => a.lvl - b.lvl)
      .slice(0, 6);
    this.ui.render(
      `<div class="panel narrow">
        <h2>${t('statusTitle')}</h2>
        <p class="big-text">${t('level', { n: `<b>${p.level}</b>` })}${p.level >= MAX_PLAYER_LEVEL ? ` ${t('levelMax')}` : ''}</p>
        ${bar(p.current, p.needed, 'xp')}
        <p class="hint">${p.level >= MAX_PLAYER_LEVEL ? t('topReached') : t('xpToNext', { n: p.needed - p.current })}</p>
        <dl class="stats">
          <dt>${t('statRuns')}</dt><dd>${st.runs}</dd>
          <dt>${t('statBossWins')}</dt><dd>${st.victories}</dd>
          <dt>${t('statBattlesWon')}</dt><dd>${st.battlesWon}</dd>
          <dt>${t('statBiomes')}</dt><dd>${st.biomesFound}/${BIOMES.length}</dd>
        </dl>
        ${next.length ? `<h3>${t('nextUnlocks')}</h3><ul class="unlocks">${next.map((n) => `<li><b>${t('lvShort', { n: n.lvl })}</b> ${esc(n.name)}</li>`).join('')}</ul>` : ''}
        <button data-action="voltar">${t('backMenu')}</button>
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
        <h2>${t('settings')}</h2>
        <label>${t('language')}
          <select data-input="idioma">
            ${LANGS.map((l) => opt(l, s.lang, LANG_NAMES[l])).join('')}
          </select>
        </label>
        <label>${t('volume')} <input type="range" min="0" max="1" step="0.05" value="${s.volume}" data-input="volume" /></label>
        <label>${t('resolution')}
          <select data-input="resolucao">
            ${opt('baixa', s.resolution, t('res240'))}
            ${opt('media', s.resolution, '75%')}
            ${opt('alta', s.resolution, '100%')}
          </select>
        </label>
        <label>${t('fpsLimit')}
          <select data-input="fps">${opt(30, s.fpsCap, '30 fps')}${opt(60, s.fpsCap, '60 fps')}</select>
        </label>
        <div class="row">
          <button data-action="musica">${t(s.music ? 'musicOn' : 'musicOff')}</button>
          <button data-action="tela">${t(s.fullscreen ? 'fullscreenOn' : 'fullscreenOff')}</button>
          <button data-action="efeitos">${t(s.postFx ? 'postFxOn' : 'postFxOff')}</button>
        </div>
        <h3>${t('soundTest')}</h3>
        <div class="row sound-test">
          ${(
            [
              ['menu', t('trackMenu')],
              ['mundo', t('trackWorld')],
              ['batalha', t('trackBattle')],
              ['chefe', t('trackBoss')],
              ['vitoria', t('trackVictory')],
            ] as const
          )
            .map(
              ([id, name]) => `<button data-action="faixa" data-track="${id}">♪ ${name}</button>`
            )
            .join('')}
        </div>
        <p class="hint">${t('f3Hint')}</p>
        <div class="row">
          <button data-action="voltar">${t('back')}</button>
          ${from === 'titulo' ? `<button data-action="apagar" class="danger">${this.confirmReset ? t('eraseConfirm') : t('erase')}</button>` : ''}
        </div>
      </div>`,
      {
        volume: (el) => {
          s.volume = Number((el as HTMLInputElement).value);
          this.applySettings();
          this.persist();
        },
        idioma: (el) => {
          s.lang = (el as HTMLSelectElement).value as Lang;
          this.applySettings();
          this.persist();
          this.showSettings(from);
          this.refocus('[data-input="idioma"]');
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
        faixa: (el) => {
          audio.unlock();
          audio.music(null);
          audio.music(el.dataset.track as TrackId);
        },
        musica: () => {
          s.music = !s.music;
          this.applySettings();
          this.persist();
          this.showSettings(from);
          this.refocus('[data-action="musica"]');
        },
        efeitos: () => {
          s.postFx = !s.postFx;
          this.applySettings();
          this.persist();
          this.showSettings(from);
          this.refocus('[data-action="efeitos"]');
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
          toast(t('erased'));
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
        <h2>${t('credits')}</h2>
        <p>${t('credits1')}</p>
        <p>${t('credits2')}</p>
        <p>${t('credits3')}</p>
        <p class="hint">${t('thanks')}</p>
        <button data-action="voltar">${t('backMenu')}</button>
      </div>`,
      { voltar: () => this.showTitle() },
      { back: 'voltar' }
    );
  }

  // ---------- run & overworld ----------

  private async beginRun(): Promise<void> {
    this.save.stats.runs += 1;
    this.persist();
    this.run = startRun([...this.save.party], [...this.save.deck], this.level, undefined, {
      bossesDefeated: this.save.bossesDefeated ?? 0,
      prisonCarryover: this.save.prisonCarryover ?? null,
    });
    if (this.save.prisonCarryover) {
      toast(
        '🚔 Você saiu da prisão em uma nova jornada roguelike mantendo seus pets e itens!',
        3400
      );
      this.save.prisonCarryover = null;
      this.persist();
    }
    if (!this.overworld) {
      this.overworld = new OverworldView(this.run.map, this.save.avatar);
      this.overworld.onArrive = (x, y) => this.onArrive(x, y);
    } else {
      this.overworld.setAvatar(this.save.avatar.body, this.save.avatar.hat);
      this.overworld.setMap(this.run.map);
    }
    this.save.stats.biomesFound = Math.max(this.save.stats.biomesFound, 1);
    await playCutscene({
      chapter: biomeName(0),
      subtitle: t('worldStart'),
    });
    toast(t('worldStart'), 3200);
    this.showWorld();
  }

  /** Zelda: Ocarina of Time-style celebration when the protagonist receives any item! */
  private celebrateItem(icon: string, name: string, subtitle?: string): void {
    this.overworld?.playHeroAction('celebrate');
    void showItemGet({ icon, name, subtitle });
  }

  /** Updates the 1 active 3D companion pet following the protagonist in the overworld. */
  private syncFollowerPet(): void {
    if (!this.run || !this.overworld) return;
    const active = ensureActivePet(this.run);
    this.overworld.setFollowerPet(
      active ? { speciesId: active.speciesId, level: active.level, element: active.element } : null
    );
  }

  private showWorld(): void {
    const run = this.run;
    if (!run || !this.overworld) return;
    this.setScreen('mundo');
    this.paused = false;
    this.busy = false;
    const biome = currentBiome(run);
    const bioEco = run.eco.biomeHealth[biome] ?? 100;
    audio.music(BIOMES[biome].track);
    audio.setEcoHealth(bioEco);
    this.overworld.setMudMode(run.hydro.mudBiomes.includes(currentBiome(run)));
    this.overworld.setEcoHealth(bioEco);
    this.syncFollowerPet();
    this.engine.setView(this.overworld);
    this.ui.navEnabled = true;
    const activePet = ensureActivePet(run);
    const party = run.party
      .map((p) => {
        const st = petStats(p);
        const outfit = p.outfit ? `${p.outfit} ` : '';
        const statusTag = p.hallucinating
          ? '🌀 '
          : p.mutation === 'zumbi'
            ? '🧟 '
            : p.depressed
              ? '😢 '
              : p.sick
                ? '🤒 '
                : '';
        const isActive = activePet?.uid === p.uid;
        return `<div class="mini ${p.hp <= 0 ? 'ko' : ''} ${isActive ? 'active-follower' : ''}">
          <img src="${creatureThumbnail(p.speciesId, stageOf(p.level), p.element)}" alt="" />
          <span class="mini-line">
            ${statusTag}${outfit}${elementIcon(p.element, 16)} ${esc(st.name)}
            <small>${t('lv', { n: p.level })} · ${gameIcon('food', 13)}${p.hunger ?? 100}% · ${gameIcon('happy', 13)}${p.happiness ?? 72}%</small>
            <button class="follow-btn ${isActive ? 'on' : ''}" data-action="seguir" data-uid="${p.uid}" title="${isActive ? 'Pet ativo seguindo você' : 'Definir como pet ativo no cenário'}">${gameIcon('follower', 14)}</button>
          </span>
          ${bar(p.hp, st.maxHp)}
        </div>`;
      })
      .join('');
    const stageDots = BIOMES.map(
      (_, i) =>
        `<i class="stage-dot ${i === biome ? 'now' : run.visited.includes(i) ? 'done' : ''}" title="${run.visited.includes(i) ? esc(biomeName(i)) : '???'}"></i>`
    ).join('');
    const prof = biomeEconomy(biome);
    if (biome === 0) run.economy.wallets[0] = run.coins;
    const localWallet = run.economy.wallets[biome];
    const nearDoor = doorAt(run.map, run.pos.x, run.pos.y);
    const doorPrompt = nearDoor
      ? `<button class="primary" data-action="entrar_porta" data-kind="${nearDoor}" style="position:fixed;left:50%;bottom:54px;transform:translateX(-50%);z-index:12">🚪 Entrar em ${esc(BUILDINGS[nearDoor].shortSign)} (Enter)</button>`
      : '';
    const facing = this.overworld.facingTile();
    const facingTree = !nearDoor && tileAt(run.map, facing.x, facing.y) === 'arvore';
    const treePrompt = facingTree
      ? `<button class="danger" data-action="coletar_arvore" style="position:fixed;left:50%;bottom:54px;transform:translateX(-50%);z-index:12">🪓 Coletar Madeira (C)</button>`
      : '';
    this.ui.render(
      `<div class="hud">
        <div class="hud-left">
          <div class="floor-head">
            <div class="floor">${esc(t('biomeHud', { name: biomeName(biome), n: biome + 1, max: BIOMES.length }))}</div>
            <div class="hud-clock">${seasonForDay(run.clock.day).icon} ${seasonForDay(run.clock.day).name} · ${formatClock(run.clock)} · ${WEATHER_META[run.eco.weather].icon} · 🌿${run.eco.biomeHealth[biome] ?? 100}% · ${prof.currencyIcon} ${localWallet} ${prof.currencyCode}</div>
            <div class="hud-clock" style="font-size:11px;opacity:0.92">${energySourceForBiome(run.energy, biome).icon} ${esc(energySourceForBiome(run.energy, biome).name)} · 🚰 Saneamento ${run.hydro.biomeSanitation[biome] ?? 50}% · 🌡️ +${globalTempDeltaC(run.climate, seasonForDay(run.clock.day).tempShiftC)}°C · 🌍 ${anthropoceneReportForRun(run).era}</div>
            <div class="stage-dots">${stageDots}</div>
          </div>
          <div class="party">${party}</div>
          <div class="items">🧪 ${run.potions} ${gemIcons(run.crystals)} ${run.relics.map((r) => `<span title="${esc(relicDescription(r))}">${getRelic(r).icon}</span>`).join('')}</div>
        </div>
        <div class="hud-right">
          <button class="hud-bench" data-action="banco">${gameIcon('bench', 16)} Mochila & Pets (${run.bench.length})</button>
          <button class="hud-menu" data-action="pausa">${t('menuButton')}</button>
        </div>
        ${doorPrompt}
        ${treePrompt}
        <div class="hud-hint">Ande até a porta das casas e aperte Enter para entrar · ${t('hudHint')}</div>
        <div class="dpad">
          <button data-dir="0,-1" aria-label="${t('up')}">▲</button>
          <button data-dir="-1,0" aria-label="${t('left')}">◀</button>
          <button data-dir="1,0" aria-label="${t('right')}">▶</button>
          <button data-dir="0,1" aria-label="${t('down')}">▼</button>
        </div>
      </div>`,
      {
        pausa: () => this.openPause(),
        entrar_porta: (el) => this.enterBuilding(el.dataset.kind as BuildingKind),
        coletar_arvore: () => {
          const ft = this.overworld?.facingTile();
          if (!ft) return;
          const res = chopTreeInRun(run, ft.x, ft.y);
          if (res.ok) {
            audio.play('hit');
            this.overworld?.setMap(run.map, run.pos);
            toast(res.msg, 3400);
            this.showWorld();
          }
        },
        banco: () => this.showInventory(),
        seguir: (el) => {
          const uid = el.dataset.uid as string;
          if (setActivePet(run, uid)) {
            const pet = run.party.find((p) => p.uid === uid);
            this.syncFollowerPet();
            audio.play('confirm');
            if (pet) toast(`🐾 ${petStats(pet).name} agora está seguindo você!`, 1800);
            this.showWorld();
          }
        },
      }
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
        <h2>${t('pause')}</h2>
        <nav class="menu">
          <button data-action="continuar">${t('resume')}</button>
          <button data-action="inventario">${t('inventory')}</button>
          <button data-action="config">${t('settings')}</button>
          <button data-action="desistir" class="danger">${t('giveUp')}</button>
        </nav>
      </div>`,
      {
        continuar: () => this.showWorld(),
        inventario: () => this.showInventory(),
        config: () => this.showSettings('pausa'),
        desistir: () => this.gameOver(t('gaveUp')),
      },
      { back: 'continuar' }
    );
  }

  /** Zelda: Breath of the Wild Sheikah Slate-inspired Inventory (Category Tabs + Square Grid + Inspector)! */
  private showInventory(): void {
    const run = this.run;
    if (!run) return;
    this.setScreen('inventario');
    const activePet = ensureActivePet(run);
    const tab = this.invTab;

    type SlotItem = {
      id: string;
      pic: string;
      qty?: string;
      tag?: string;
      title: string;
      desc: string;
      meta?: string;
      actionsHtml: string;
    };

    const slots: SlotItem[] = [];
    if (tab === 'pets') {
      for (const p of run.party) {
        const st = petStats(p);
        const isActive = activePet?.uid === p.uid;
        const mutTag =
          p.mutation === 'zumbi'
            ? '🧟'
            : p.depressed
              ? '😢'
              : p.sick
                ? '🤒'
                : p.mutation === 'mutante'
                  ? '☣️'
                  : p.mutation === 'geleca'
                    ? '🟢'
                    : '';
        const trait = getGeneTrait(p.geneTrait);
        slots.push({
          id: `party:${p.uid}`,
          pic: `<img src="${creatureThumbnail(p.speciesId, stageOf(p.level), p.element)}" alt="" />`,
          qty: `Nv${p.level}`,
          tag: isActive ? '🐾' : mutTag,
          title: `${elementIcon(p.element, 20)} ${esc(st.name)} ${mutTag}`,
          desc: `Equipe Ativa (${run.party.length}/${MAX_PARTY}) · HP ${p.hp}/${st.maxHp} · ATK ${st.attack} · DEF ${st.defense} · Gene: ${trait.icon} ${trait.name}`,
          meta: `${trait.desc} · 🍎 Fome: ${p.hunger ?? 100}% · 😊 Felicidade: ${p.happiness ?? 72}% · ✨ Beleza: ${p.beauty ?? 20}${p.hallucinating ? ' · 🌀 ALUCINANDO!' : ''}${p.mutation === 'zumbi' ? ' · 🧟 ZUMBI' : ''}${p.depressed ? ' · 😢 DEPRESSIVO (meia-vida diária!)' : ''}${p.sick ? ' · 🤒 DOENTE (cure no Hospital!)' : ''}`,
          actionsHtml: `<div class="row">
            <button class="primary" data-action="seguir" data-uid="${p.uid}" ${isActive || p.hp <= 0 ? 'disabled' : ''}>${gameIcon('follower', 14)} ${isActive ? 'Seguindo' : 'Seguir'}</button>
            <button data-action="pocao" data-uid="${p.uid}" ${run.potions > 0 && p.hp > 0 && p.hp < st.maxHp ? '' : 'disabled'}>🧪 Poção (${run.potions})</button>
            <button data-action="guardar" data-uid="${p.uid}" ${run.party.length <= 1 ? 'disabled' : ''}>${gameIcon('bench', 14)} Guardar no Banco</button>
          </div>`,
        });
      }
      for (const p of run.bench) {
        const st = petStats(p);
        slots.push({
          id: `bench:${p.uid}`,
          pic: `<img src="${creatureThumbnail(p.speciesId, stageOf(p.level), p.element)}" alt="" />`,
          qty: `Nv${p.level}`,
          tag: '📦',
          title: `${elementIcon(p.element, 20)} ${esc(st.name)} (Banco)`,
          desc: `Guardado no Banco Ilimitado · HP ${p.hp}/${st.maxHp} · ATK ${st.attack} · DEF ${st.defense}`,
          actionsHtml: `<div class="row">
            <button class="primary" data-action="retirar" data-uid="${p.uid}" ${run.party.length >= MAX_PARTY ? 'disabled' : ''}>➕ Colocar na Equipe</button>
          </div>`,
        });
      }
    } else if (tab === 'itens') {
      if (run.potions > 0) {
        slots.push({
          id: 'item:pocao',
          pic: `<span class="slot-ico">🧪</span>`,
          qty: `×${run.potions}`,
          title: '🧪 Poção de Cura',
          desc: 'Restaura +5 HP de um pet ferido da equipe.',
          actionsHtml: `<div class="row">${run.party
            .map((p) => {
              const st = petStats(p);
              return `<button data-action="pocao" data-uid="${p.uid}" ${p.hp <= 0 || p.hp >= st.maxHp ? 'disabled' : ''}>Usar em ${esc(st.name)}</button>`;
            })
            .join('')}</div>`,
        });
      }
      for (const [e, n] of Object.entries(run.crystals) as [Element, number][]) {
        if (n <= 0) continue;
        slots.push({
          id: `gem:${e}`,
          pic: `<span class="slot-ico">${elementIcon(e, 42)}</span>`,
          qty: `×${n}`,
          title: `${elementIcon(e, 20)} ${esc(t('gemName', { element: elementLabel(e) }))}`,
          desc: 'Gema elemental coletada no mundo. Pode infundir um pet na hora!',
          actionsHtml: `<div class="row">${run.party
            .map(
              (p) =>
                `<button data-action="gema" data-element="${e}" data-uid="${p.uid}" ${p.element === e ? 'disabled' : ''}>${esc(t('gemUseOn', { name: petStats(p).name }))}</button>`
            )
            .join('')}</div>`,
        });
      }
      for (const [id, n] of Object.entries(run.jobItems)) {
        if (n <= 0) continue;
        const it = getJobItem(id);
        if (!it) continue;
        slots.push({
          id: `job:${id}`,
          pic: `<span class="slot-ico">${it.icon}</span>`,
          qty: `×${n}`,
          title: `${it.icon} ${esc(it.name)}`,
          desc: `Item de Trabalho (${it.source}): ${it.hint}`,
          actionsHtml: `<button data-action="ir_trabalhos">📋 Abrir Trabalhos</button>`,
        });
      }
      for (const [el, n] of Object.entries(run.elementGenes) as [Element, number][]) {
        if (n <= 0) continue;
        slots.push({
          id: `gene:${el}`,
          pic: `<span class="slot-ico">${elementIcon(el, 38)}</span>`,
          qty: `🧬${n}`,
          title: `🧬 Genes de ${esc(elementLabel(el))}`,
          desc: `Material genético elemental para o Laboratório de Transmodificação (precisa de ${LAB_GENES_NEEDED}).`,
          actionsHtml: `<button data-action="ir_lab">🧬 Abrir Laboratório</button>`,
        });
      }
    } else if (tab === 'estatuas') {
      for (const st of run.eco.statues) {
        slots.push({
          id: `statue:${st.id}`,
          pic: `<span class="slot-ico">${st.icon}</span>`,
          tag: '🏠',
          title: `${st.icon} ${esc(st.name)}`,
          desc: 'Estátua decorativa criada no Laboratório! Embeleza automaticamente sua Casa e Minha Lojinha.',
          actionsHtml: `<button data-action="ir_minhaloja">🏪 Ver na Minha Lojinha</button>`,
        });
      }
      for (const r of run.relics) {
        const rel = getRelic(r);
        slots.push({
          id: `relic:${r}`,
          pic: `<span class="slot-ico">${rel.icon}</span>`,
          title: `${rel.icon} ${esc(relicName(r))}`,
          desc: relicDescription(r),
          actionsHtml: `<span class="hint">Efeito passivo ativo!</span>`,
        });
      }
    } else {
      const allPets = [...run.party, ...run.bench];
      const integrity = computeEcologicalIntegrity(run.eco, allPets);
      const projEnding = evaluateEcologicalEnding(integrity);
      const uniqueSp = new Set(allPets.map((p) => p.speciesId)).size;
      const uniqueGenes = new Set(allPets.map((p) => p.geneTrait).filter(Boolean)).size;
      slots.push({
        id: 'eco:global',
        pic: `<span class="slot-ico">${projEnding.icon}</span>`,
        qty: `${integrity}%`,
        title: `${projEnding.icon} Integridade Ecológica Global: ${integrity}%`,
        desc: `Final projetado ao zerar: ${projEnding.title} (${projEnding.subtitle})`,
        meta: `Biodiversidade na equipe/banco: ${uniqueSp}/${SPECIES.length} espécies · ${uniqueGenes} genes únicos · Clima: ${WEATHER_META[run.eco.weather].icon} ${WEATHER_META[run.eco.weather].name}`,
        actionsHtml: `<span class="hint">Mantenha a integridade ≥85% do início ao fim para o Final Verdadeiro mais feliz!</span>`,
      });
      BIOMES.forEach((_, i) => {
        const hp = run.eco.biomeHealth[i] ?? 100;
        const dead = run.eco.deadNpcBiomes.includes(i);
        const ecoInfo = ecosystemForBiome(i);
        slots.push({
          id: `eco:${i}`,
          pic: `<span class="slot-ico">${hp > 60 ? '🌿' : hp > 30 ? '🌫️' : '💀'}</span>`,
          qty: `${hp}%`,
          title: `${hp > 60 ? '🌿' : hp > 30 ? '🌫️' : '💀'} ${esc(biomeName(i))}`,
          desc: `Habitat: ${ecoInfo.habitat} · Flora: ${ecoInfo.flora}`,
          meta: `Espécie-chave: ${ecoInfo.keystone} · Nicho: ${ecoInfo.niche}${dead ? ' · 💀 COLAPSO: moradores pereceram!' : ''}`,
          actionsHtml: `<span class="hint">Saúde atual: ${hp}% · Relação Lojistas: ${run.eco.shopRelation} · Relação Lab: ${run.eco.labRelation}</span>`,
        });
      });
    }

    if (!slots.some((s) => s.id === this.invSelected)) {
      this.invSelected = slots[0]?.id ?? '';
    }
    const sel = slots.find((s) => s.id === this.invSelected) ?? slots[0];
    const invTabs: [typeof this.invTab, string][] = [
      ['pets', `🐾 Pets (${run.party.length}/${MAX_PARTY} · 📦${run.bench.length})`],
      ['itens', '🧪 Itens & Genes'],
      ['estatuas', `🗿 Estátuas & Relíquias (${run.eco.statues.length + run.relics.length})`],
      ['ecologia', '🌿 Ecologia'],
    ];

    this.ui.render(
      `<div class="botw-inv">
        <div class="botw-header">
          <h2>🎒 Inventário Sheikah</h2>
          <div class="botw-tabs">${invTabs.map(([id, lbl]) => `<button class="botw-tab ${tab === id ? 'on' : ''}" data-action="inv_tab" data-tab="${id}">${lbl}</button>`).join('')}</div>
          <button data-action="voltar">◀ Voltar</button>
        </div>
        <div class="botw-body">
          <div class="botw-grid">
            ${
              slots.length
                ? slots
                    .map(
                      (
                        s
                      ) => `<button class="botw-slot ${sel?.id === s.id ? 'on' : ''}" data-action="inv_sel" data-id="${esc(s.id)}">
                        ${s.tag ? `<span class="slot-tag">${s.tag}</span>` : ''}
                        ${s.pic}
                        ${s.qty ? `<span class="slot-qty">${s.qty}</span>` : ''}
                      </button>`
                    )
                    .join('')
                : `<p class="hint">Nenhum item nesta aba ainda.</p>`
            }
          </div>
          <div class="botw-detail">
            ${
              sel
                ? `<div class="botw-detail-pic">${sel.pic}</div>
                   <h3>${sel.title}</h3>
                   <p>${sel.desc}</p>
                   ${sel.meta ? `<p class="hint">${sel.meta}</p>` : ''}
                   ${sel.actionsHtml}`
                : `<p class="hint">Selecione um slot à esquerda para ver detalhes.</p>`
            }
          </div>
        </div>
      </div>`,
      {
        inv_tab: (el) => {
          this.invTab = el.dataset.tab as typeof this.invTab;
          this.invSelected = '';
          this.showInventory();
        },
        inv_sel: (el) => {
          this.invSelected = el.dataset.id as string;
          this.showInventory();
        },
        seguir: (el) => {
          if (setActivePet(run, el.dataset.uid as string)) {
            this.syncFollowerPet();
            audio.play('confirm');
          }
          this.showInventory();
        },
        guardar: (el) => {
          if (moveToBench(run, el.dataset.uid as string)) {
            this.syncFollowerPet();
            audio.play('confirm');
            toast('📦 Pet guardado no Banco!');
          }
          this.showInventory();
        },
        retirar: (el) => {
          if (moveToParty(run, el.dataset.uid as string)) {
            this.syncFollowerPet();
            audio.play('confirm');
            toast('✨ Pet adicionado à equipe ativa!');
          }
          this.showInventory();
        },
        pocao: (el) => {
          if (usePotion(run, el.dataset.uid as string)) {
            audio.play('heal');
            toast(t('potionUsed'));
          }
          this.showInventory();
        },
        gema: (el) => {
          const pet = run.party.find((p) => p.uid === el.dataset.uid);
          const element = el.dataset.element as Element;
          if (pet && applyCrystal(run, pet.uid, element)) {
            this.syncFollowerPet();
            audio.play('evolve');
            toast(t('gemApplied', { name: petStats(pet).name, element: elementLabel(element) }));
          }
          this.showInventory();
        },
        ir_trabalhos: () => this.showTownHub('trabalhos'),
        ir_lab: () => this.showTownHub('laboratorio'),
        ir_minhaloja: () => this.showTownHub('minhaloja'),
        voltar: () => this.showWorld(),
      },
      { back: 'voltar' }
    );
  }

  private onArrive(x: number, y: number): void {
    const run = this.run;
    if (!run || !this.overworld) return;
    const tile = tileAt(run.map, x, y);
    // Tactile grass footsteps SFX on meadow/tall-grass vs crisp path step!
    if (tile === 'grama' || tile === 'matoAlto') audio.pawStep(0.9);
    else audio.play('step');
    const before = currentBiome(run);
    const found = moveTo(run, x, y);
    if (found !== null) {
      this.addXp(XP_REWARD.bioma);
      this.save.stats.biomesFound = Math.max(this.save.stats.biomesFound, run.visited.length);
      this.save.discoveredBiomes = [...new Set([...(this.save.discoveredBiomes ?? [0]), found])];
      this.persist();
      audio.play('confirm');
      toast(t('biomeEntered', { name: biomeName(found) }), 2600);
      this.showWorld();
    } else if (currentBiome(run) !== before) {
      toast(biomeName(currentBiome(run)));
      this.showWorld();
    }
    if (tile === 'portal') {
      toast(t('bossAppeared'));
      void this.startBattle('chefe');
    } else {
      // Buried dinosaur fossil dig spots on the map!
      const fIdx = y * run.map.width + x;
      if (run.map.fossils[fIdx]) {
        delete run.map.fossils[fIdx];
        const fRes = searchForFossil(run);
        this.celebrateItem('🦴', 'Fóssil de Dinossauro', fRes.msg);
      } else {
        // Annoying apartment-broker NPCs handing out flyers on the street!
        const broker = checkApartmentBrokerInRun(run);
        if (broker) {
          toast(`🏢📄 ${broker.brokerName}: ${broker.quote} (+1 Panfleto no bolso!)`, 4800);
          audio.speak(broker.quote, this.save.settings.lang, 1.05);
        }
      }
      // Permafrost biogeochemical cycle check (cold zones can turn a pet into Ice!)
      const inPermafrost = currentBiome(run) === 6 || y <= 2;
      const pfMsg = checkPermafrostEvent(run.party, run.rng, inPermafrost);
      if (pfMsg) toast(pfMsg, 3600);
      // Update HUD prompt when stepping onto or off a physical building doorway
      if (doorAt(run.map, x, y) || this.ui.el.querySelector('[data-action="entrar_porta"]')) {
        this.showWorld();
      }
    }
  }

  /**
   * Physical item pickup sequence:
   * 1. Bend down ('pickup' animation) + item/chest opening SFX
   * 2. Turn toward the camera (4th-wall break!) and lift item high overhead with Zelda light rays!
   */
  private async pickupGroundItem(
    x: number,
    y: number,
    tile: 'cristal' | 'bau' | 'cura'
  ): Promise<void> {
    const run = this.run;
    if (!run || !this.overworld || this.busy) return;
    this.busy = true;
    // 1. Bend down to pick up / open the item on the ground
    this.overworld.playHeroAction('pickup', 0.45);
    audio.play(tile === 'bau' ? 'chestOpen' : 'pickup');
    await wait(380);
    // 2. Collect item, turn to face camera (4th-wall break!) and lift overhead!
    if (tile === 'cristal') {
      const element = takeCrystal(run, x, y);
      this.overworld.removeAt(x, y);
      this.overworld.faceCamera();
      if (element) {
        this.celebrateItem(
          elementIcon(element, 64),
          t('gemName', { element: elementLabel(element) }),
          'Gema elemental coletada no mapa!'
        );
      }
    } else if (tile === 'bau') {
      const loot = openChest(run);
      setTile(run.map, x, y, 'grama');
      this.overworld.removeAt(x, y);
      this.overworld.faceCamera();
      if (!run.completedJobs.includes('job_mira') && !(run.jobItems['flor_lunar'] > 0)) {
        grantJobItem(run, 'flor_lunar');
        this.celebrateItem('🪷', 'Flor Lunar', 'Item raro de Trabalho encontrado no baú!');
      } else if (loot.kind === 'carta') {
        this.celebrateItem('🃏', cardName(loot.cardId), 'Nova carta adicionada ao deck!');
      } else if (loot.kind === 'reliquia') {
        const r = getRelic(loot.relicId);
        this.celebrateItem(r.icon, relicName(loot.relicId), relicDescription(loot.relicId));
      } else if (loot.kind === 'cristal') {
        this.celebrateItem(
          elementIcon(loot.element, 64),
          t('gemName', { element: elementLabel(loot.element) }),
          'Gema elemental obtida do baú!'
        );
      } else {
        this.celebrateItem('🧪', 'Poção de Cura', 'Restaura vida dos seus pets!');
      }
    } else if (tile === 'cura') {
      healParty(run);
      setTile(run.map, x, y, 'caminho');
      this.overworld.removeAt(x, y);
      this.overworld.faceCamera();
      this.overworld.playHeroAction('celebrate', 1.2);
      audio.play('heal');
      toast(t('healed'));
    }
    this.busy = false;
    this.showWorld();
  }

  private tryTalk(): void {
    const run = this.run;
    if (!run || !this.overworld || this.overworld.moving || this.busy) return;
    // Standing directly on a physical building doorway -> enter that building!
    const standingDoor = doorAt(run.map, run.pos.x, run.pos.y);
    if (standingDoor) {
      this.enterBuilding(standingDoor);
      return;
    }
    const { x, y } = this.overworld.facingTile();
    const targetTile = tileAt(run.map, x, y);
    if (targetTile === 'cristal' || targetTile === 'bau' || targetTile === 'cura') {
      void this.pickupGroundItem(x, y, targetTile);
      return;
    }
    if (targetTile === 'treinador') {
      if (run.eco.deadNpcBiomes.includes(currentBiome(run))) {
        toast('💀 O colapso ambiental afastou e vitimou os moradores deste bioma...', 2800);
        return;
      }
      this.encounterAt = { x, y };
      void this.talkToNpc();
    } else if (targetTile === 'selvagem') {
      // Legends: Arceus-style direct interaction with a visible wild Elementa-Mon!
      const idx = y * run.map.width + x;
      const spawn = run.map.wildSpawns[idx];
      this.encounterAt = { x, y };
      if (isNight(run.clock)) toast('🌙 Noite perigosa! Pet selvagem hostil!', 2000);
      void this.startBattle('selvagem', 0, spawn);
    } else if (targetTile === 'predio') {
      const kind = run.map.buildings[y * run.map.width + x] ?? 'moradia';
      this.enterBuilding(kind);
    }
  }

  /** Physically enters a 3D establishment interior with its exclusive NPC, active 3D pet & unique props! */
  private enterBuilding(kind: BuildingKind): void {
    const run = this.run;
    if (!run) return;
    if (!this.interior) {
      this.interior = new InteriorView(this.save.avatar);
    } else {
      this.interior.setAvatar(this.save.avatar.body, this.save.avatar.hat);
    }
    const active = ensureActivePet(run);
    this.interior.setFollowerPet(
      active?.speciesId ?? null,
      active ? stageOf(active.level) : 0,
      active?.element ?? 'neutro'
    );
    this.interior.enter(kind);
    this.insideBuilding = kind;
    this.paused = false;
    this.busy = false;
    this.setScreen('interior');
    this.engine.setView(this.interior);
    audio.play('confirm');
    this.renderInteriorHud();
  }

  private exitBuilding(): void {
    this.insideBuilding = null;
    audio.play('back');
    this.showWorld();
  }

  /** Minimal RPG HUD inside a physical 3D building: talk to the exclusive NPC, challenge their pet party, or walk out! */
  private renderInteriorHud(): void {
    const kind = this.insideBuilding;
    const run = this.run;
    if (!kind || !run) return;
    const def = BUILDINGS[kind];
    this.ui.render(
      `<div class="hud">
        <div class="hud-left">
          <div class="floor-head">
            <div class="floor">${def.icon} ${esc(def.name)}</div>
            <div class="hud-clock">${esc(def.npc.name)} · ${esc(def.npc.role)}</div>
          </div>
        </div>
        <div class="hud-right">
          <button data-action="sair_casa">🚪 Sair (Esc)</button>
        </div>
        <div style="position:fixed;left:50%;bottom:48px;transform:translateX(-50%);display:flex;gap:8px;z-index:12">
          <button class="primary" data-action="falar_npc">💬 Falar com ${esc(def.npc.name)} (Enter)</button>
          <button data-action="desafiar_npc">⚔️ Desafiar ${esc(def.npc.name)}</button>
        </div>
        <div class="hud-hint">Ande pelo interior com WASD/Setas · Enter fala com ${esc(def.npc.name)} · Pise no tapete verde ou Esc para sair</div>
      </div>`,
      {
        falar_npc: () => this.openBuildingCounter(kind),
        desafiar_npc: () => this.challengeBuildingNpc(kind),
        sair_casa: () => this.exitBuilding(),
      }
    );
  }

  /** Challenges a physical establishment's exclusive NPC and their personal Pet Party to a 3D Pet Battle! */
  private challengeBuildingNpc(kind: BuildingKind): void {
    const def = BUILDINGS[kind];
    toast(
      `⚔️ ${def.npc.name} aceitou o desafio com sua equipe de ${def.npc.partySpecies.length} pets!`,
      2400
    );
    this.insideBuilding = null;
    void this.startBattle('treinador', 0);
  }

  /** Opens ONLY the focused RPG counter for the physical establishment the player walked into! */
  private openBuildingCounter(kind: BuildingKind): void {
    if (kind === 'dojo') {
      this.openDojoCounter();
      return;
    }
    if (kind === 'cemiterio') {
      this.openCemeteryWitchCounter();
      return;
    }
    if (kind === 'moradia') {
      this.openHomeUtilitiesCounter();
      return;
    }
    if (kind === 'reparo') {
      this.openRepairShopCounter();
      return;
    }
    const mapTab: Record<
      Exclude<BuildingKind, 'dojo' | 'cemiterio' | 'moradia' | 'reparo'>,
      typeof this.activeShop
    > = {
      banco: 'banco_fin',
      prefeitura: 'prefeitura',
      minhaloja: 'minhaloja',
      laboratorio: 'laboratorio',
      comida: 'comida',
      roupinhas: 'roupinhas',
      hospital: 'hospital',
      livros: 'livros',
      apostas: 'apostas',
      garagem: 'garagem',
    };
    this.showTownHub(mapTab[kind], true);
  }

  /** Dedicated physical counter inside 🥋 Dojo de Artes Marciais (Mestre Ryu). */
  private openDojoCounter(): void {
    const run = this.run;
    if (!run) return;
    this.paused = true;
    const bi = currentBiome(run);
    const prof = biomeEconomy(bi);
    if (bi === 0) run.economy.wallets[0] = run.coins;
    const wallet = run.economy.wallets[bi];
    const selPet = run.party.find((p) => p.uid === this.activeShopPetUid) ?? run.party[0];
    const slotsHtml = run.dojoSlots.length
      ? run.dojoSlots
          .map(
            (s) =>
              `<div class="shop-item" style="cursor:default">
                <b>🥋 ${esc(petStats(s.pet).name)} (${esc(s.artId)})</b>
                <small>${s.hoursRemaining <= 0 ? '✅ Treino concluído!' : `⏳ Faltam ${s.hoursRemaining}h`}</small>
                <button class="primary" data-action="dojo_collect" data-sid="${s.id}" ${s.hoursRemaining > 0 ? 'disabled' : ''}>Buscar Pet Graduado</button>
              </div>`
          )
          .join('')
      : '<p class="hint">Nenhum pet treinando no tatame agora.</p>';
    this.ui.render(
      `<div class="panel wide town-panel">
        <h2>🥋 Dojo de Artes Marciais · Mestre Ryu</h2>
        <p class="hint"><i>"Deixe seu pet treinando Karate, Muay Thai, Judô ou Kung Fu para aumentar HP, Força, Agilidade e Defesa!"</i></p>
        <div class="town-pets">${run.party
          .map(
            (p) =>
              `<button class="elem-pill ${p.uid === selPet?.uid ? 'on' : ''}" data-action="selpet" data-uid="${p.uid}">${esc(petStats(p).name)} (HP ${petStats(p).maxHp} · ATK ${petStats(p).attack} · DEF ${petStats(p).defense} · AGI ${p.agiMod ?? 0})</button>`
          )
          .join('')}</div>
        <div class="shop-grid">${MARTIAL_ARTS.map(
          (art) => `<div class="shop-item" style="cursor:default">
            <span class="shop-ico">${art.icon}</span>
            <b>${esc(art.name)}</b>
            <small>${esc(art.desc)}</small>
            <button class="primary" data-action="dojo_train" data-art="${art.id}" ${wallet < art.fee || run.party.length <= 1 ? 'disabled' : ''}>Treinar (${art.fee} ${prof.currencyCode})</button>
          </div>`
        ).join('')}</div>
        <h3 style="margin-top:12px">Pets no Tatame</h3>
        <div class="shop-grid">${slotsHtml}</div>
        <div class="row"><button data-action="fechar">◀ Voltar ao Interior do Dojo</button></div>
      </div>`,
      {
        selpet: (el) => {
          this.activeShopPetUid = el.dataset.uid ?? null;
          this.openDojoCounter();
        },
        dojo_train: (el) => {
          if (!selPet) return;
          const res = startDojoTraining(run, selPet.uid, el.dataset.art as MartialArtId);
          toast(res.msg, 3000);
          audio.play(res.ok ? 'confirm' : 'back');
          this.openDojoCounter();
        },
        dojo_collect: (el) => {
          const res = collectDojoPet(run, el.dataset.sid ?? '');
          toast(res.msg, 3200);
          audio.play(res.ok ? 'evolve' : 'back');
          this.openDojoCounter();
        },
        pickup_litter: () => {
          const r = pickupGroundLitterInRun(run, 0);
          toast(r.msg, 2400);
          audio.play(r.ok ? 'pickup' : 'back');
          this.openHomeUtilitiesCounter();
        },
        drink_water: () => {
          const r = drinkWaterInRun(run);
          toast(r.msg, 3600);
          if (r.died) {
            this.insideBuilding = null;
            this.gameOver(r.msg);
            return;
          }
          audio.play(r.poisoned ? 'hit' : 'heal');
          this.openHomeUtilitiesCounter();
        },
        make_compost: () => {
          const r = makeCompost(run.envSim);
          toast(r.msg, 2600);
          this.openHomeUtilitiesCounter();
        },
        use_compost: () => {
          const r = applyCompostToGarden(run);
          toast(r.msg, 2600);
          this.openHomeUtilitiesCounter();
        },
        discard_excess: () => {
          const r = discardExcessItem(run);
          toast(r.msg, 2600);
          this.openHomeUtilitiesCounter();
        },
        buy_box: () => {
          const r = buyGlassPackingBox(run);
          toast(r.msg, 2400);
          audio.play(r.ok ? 'confirm' : 'back');
          this.openHomeUtilitiesCounter();
        },
        rec_litter: (el) => {
          const r = recycleLitterInRun(
            run,
            Number(el.dataset.idx ?? 0),
            el.dataset.t as DisposalTarget
          );
          toast(r.msg, 3000);
          audio.play(r.ok && r.ecoDelta > 0 ? 'confirm' : 'back');
          this.openHomeUtilitiesCounter();
        },
        fechar: () => {
          this.paused = false;
          this.renderInteriorHud();
        },
      }
    );
  }

  /** Dedicated physical counter inside 🪦 Cemitério & Cabana da Bruxa (Bruxa Morgana). */
  private openCemeteryWitchCounter(): void {
    const run = this.run;
    if (!run) return;
    this.paused = true;
    const bi = currentBiome(run);
    const prof = biomeEconomy(bi);
    if (bi === 0) run.economy.wallets[0] = run.coins;
    const wallet = run.economy.wallets[bi];
    const skeletons = [...run.party, ...run.bench].filter((p) => p.mutation === 'esqueleto');
    const fossilReady = hasCompleteDinosaurFossil(run.biogeochem);
    const bonesSummary = ALL_FOSSIL_BONES.map(
      (b) => `${b}: ${run.biogeochem.fossilBones[b] ?? 0}/1`
    ).join(' · ');
    this.ui.render(
      `<div class="panel wide town-panel">
        <h2>🪦 Cemitério & Cabana da Bruxa · Morgana</h2>
        <p class="hint"><i>"Dinossauros revividos no Laboratório nascem como 💀 Esqueleto. Posso devolvê-los à vida normal por 55 ${prof.currencyCode} — mas há grande chance de virem 🔮 AMALDIÇOADOS (trocando ataques/espécie aleatoriamente a cada batalha)!"</i></p>
        <p class="hint">🦴 Seus Fósseis: <b>${bonesSummary}</b> ${fossilReady ? '· ✅ Completo! Leve ao Laboratório para reviver!' : ''}</p>
        <div class="row" style="margin-bottom:10px">
          <button data-action="dig_fossil">⛏️ Procurar Fósseis no Cemitério</button>
          ${fossilReady ? `<button class="primary" data-action="lab_dino">🧬 Enviar Fósseis ao Laboratório (65 ${prof.currencyCode})</button>` : ''}
        </div>
        ${
          skeletons.length
            ? `<div class="shop-grid">${skeletons
                .map(
                  (p) => `<div class="shop-item" style="cursor:default">
                    <span class="shop-ico">💀</span>
                    <b>${esc(petStats(p).name)} (Esqueleto)</b>
                    <small>Transformar em pet vivo normal (risco de Maldição 🔮)</small>
                    <button class="primary" data-action="witch_revive" data-uid="${p.uid}" ${wallet < 55 ? 'disabled' : ''}>🔮 Ritual da Bruxa (55 ${prof.currencyCode})</button>
                  </div>`
                )
                .join('')}</div>`
            : '<p class="hint">Você ainda não possui nenhum pet Dinossauro Esqueleto para o ritual.</p>'
        }
        <div class="row"><button data-action="fechar">◀ Voltar ao Cemitério</button></div>
      </div>`,
      {
        dig_fossil: () => {
          const r = searchForFossil(run);
          toast(r.msg, 2800);
          audio.play('chest');
          this.openCemeteryWitchCounter();
        },
        lab_dino: () => {
          const r = reviveFossilAtLab(run);
          toast(r.msg, 3400);
          audio.play(r.ok ? 'evolve' : 'back');
          this.openCemeteryWitchCounter();
        },
        witch_revive: (el) => {
          const r = restoreSkeletonWithWitch(run, el.dataset.uid ?? '');
          toast(r.msg, 3600);
          audio.play(r.ok ? 'evolve' : 'back');
          this.openCemeteryWitchCounter();
        },
        pickup_litter: () => {
          const r = pickupGroundLitterInRun(run, 0);
          toast(r.msg, 2400);
          audio.play(r.ok ? 'pickup' : 'back');
          this.openHomeUtilitiesCounter();
        },
        drink_water: () => {
          const r = drinkWaterInRun(run);
          toast(r.msg, 3600);
          if (r.died) {
            this.insideBuilding = null;
            this.gameOver(r.msg);
            return;
          }
          audio.play(r.poisoned ? 'hit' : 'heal');
          this.openHomeUtilitiesCounter();
        },
        make_compost: () => {
          const r = makeCompost(run.envSim);
          toast(r.msg, 2600);
          this.openHomeUtilitiesCounter();
        },
        use_compost: () => {
          const r = applyCompostToGarden(run);
          toast(r.msg, 2600);
          this.openHomeUtilitiesCounter();
        },
        discard_excess: () => {
          const r = discardExcessItem(run);
          toast(r.msg, 2600);
          this.openHomeUtilitiesCounter();
        },
        buy_box: () => {
          const r = buyGlassPackingBox(run);
          toast(r.msg, 2400);
          audio.play(r.ok ? 'confirm' : 'back');
          this.openHomeUtilitiesCounter();
        },
        rec_litter: (el) => {
          const r = recycleLitterInRun(
            run,
            Number(el.dataset.idx ?? 0),
            el.dataset.t as DisposalTarget
          );
          toast(r.msg, 3000);
          audio.play(r.ok && r.ecoDelta > 0 ? 'confirm' : 'back');
          this.openHomeUtilitiesCounter();
        },
        fechar: () => {
          this.paused = false;
          this.renderInteriorHud();
        },
      }
    );
  }

  /** Dedicated physical counter inside 🏡 Minha Casa: Water/Energy Bills, Appliances, Carbon, Recycling Bins & Home Seed Garden! */
  private openHomeUtilitiesCounter(): void {
    const run = this.run;
    if (!run) return;
    this.paused = true;
    const bi = currentBiome(run);
    const prof = biomeEconomy(bi);
    if (bi === 0) run.economy.wallets[0] = run.coins;
    const wallet = run.economy.wallets[bi];
    const util = computeUtilityImpact(run.utilities, bi);
    const readyCrops = run.biogeochem.garden.filter((c) => c.hoursRemaining <= 0).length;
    this.ui.render(
      `<div class="panel wide town-panel">
        <h2>🏡 Minha Casa · Água, Energia, Horta & Lixeiras Seletivas</h2>
        <div class="shop-card">
          <p>💧 Consumo Água: <b>${util.waterTotal}</b> · ⚡ Energia: <b>${util.energyTotal}</b> · 🏭 Itens CO₂: <b>${util.carbonCount}</b> · Dano Ambiental/dia: <b>−${util.ecoDamage}🌿</b></p>
          <p>🧾 Conta de Água/Luz para Prefeitura: <b>${run.utilities.billOwed} ${prof.currencyCode}</b> (Diária do bairro: ${util.bill}/dia)</p>
          <div class="row">
            <button class="primary" data-action="pay_util" ${run.utilities.billOwed <= 0 || wallet < run.utilities.billOwed ? 'disabled' : ''}>💧⚡ Pagar Conta (${run.utilities.billOwed})</button>
            <button data-action="ir_moradia">🏢 Apartamentos & Pedreiro</button>
          </div>
        </div>
        <div class="shop-card">
          <h3>🌱 Minha Horta Orgânica (Alimento Próprio · 0 Poluição!)</h3>
          <p>🥗 Alimentos colhidos: <b>${run.biogeochem.homeFood}</b> · Plantados: <b>${run.biogeochem.garden.length}</b> (${readyCrops} prontos!)</p>
          <div class="row" style="flex-wrap:wrap;gap:6px">
            ${SEEDS.map(
              (s) =>
                `<button data-action="buy_seed" data-sid="${s.id}" ${wallet < s.price ? 'disabled' : ''}>${s.icon} Comprar ${esc(s.name)} (${s.price})</button>
                 <button data-action="plant_seed" data-sid="${s.id}" ${(run.biogeochem.seeds[s.id] ?? 0) <= 0 ? 'disabled' : ''}>🌱 Plantar (${run.biogeochem.seeds[s.id] ?? 0})</button>`
            ).join('')}
            <button class="primary" data-action="harvest_feed" ${readyCrops === 0 && run.biogeochem.homeFood === 0 ? 'disabled' : ''}>🥗 Colher & Alimentar Pet</button>
          </div>
        </div>
        <div class="shop-card">
          <h3>🌱 Compostagem, Hidratação, Aterro & Mochila (${totalInventoryItems(run)}/${MAX_INVENTORY_ITEMS})</h3>
          <p>💧 Sua Hidratação: <b>${run.envSim.playerHydration}%</b> · Contaminação da Água: <b>${run.envSim.waterContamination[bi] ?? 0}%</b> · Solo: <b>${run.envSim.soilContamination[bi] ?? 0}%</b> · 🗑️ Aterro da Cidade: <b>${run.envSim.cityLandfills[bi] ?? 0}%</b></p>
          <p>🍂 Resíduos Orgânicos: <b>${run.envSim.organicWaste}</b> · 🌱 Compostagem: <b>${run.envSim.compost}</b> · 🔧 Bagaços p/ Reparo: <b>${run.envSim.spentBagaco.length}</b></p>
          <div class="row" style="flex-wrap:wrap;gap:6px">
            <button class="primary" data-action="drink_water">💧 Beber Água da Cidade</button>
            <button data-action="make_compost" ${run.envSim.organicWaste < 2 ? 'disabled' : ''}>🍂 Fazer Compostagem (2 orgânicos)</button>
            <button data-action="use_compost" ${run.envSim.compost <= 0 ? 'disabled' : ''}>🌱 Adubar Horta c/ Compostagem</button>
            <button class="danger" data-action="discard_excess">🗑️ Descartar Excesso (polui!)</button>
          </div>
        </div>
        <div class="shop-card">
          <h3>♻️ Lixo no Chão, Depósito Especial (Eletrônicos/Baterias/Vidro) & Caixas</h3>
          <p>🗑️ Lixo no chão: <b>${run.litter.groundLitter.length}</b> · Na mochila: <b>${run.litter.bagLitter.length}</b> · 📦 Caixas p/ Vidro: <b>${run.litter.packingBoxes}</b> · Reciclados: <b>${run.litter.recycledCount}</b></p>
          <div class="row" style="flex-wrap:wrap;gap:6px;margin-bottom:6px">
            <button data-action="pickup_litter" ${run.litter.groundLitter.length === 0 ? 'disabled' : ''}>✋ Recolher Lixo do Chão</button>
            <button data-action="buy_box" ${wallet < PACKING_BOX_PRICE ? 'disabled' : ''}>📦 Comprar Caixa p/ Vidro (${PACKING_BOX_PRICE} ${prof.currencyCode})</button>
          </div>
          ${
            run.litter.bagLitter.length
              ? run.litter.bagLitter
                  .map((k, idx) => {
                    const ld = LITTER_DEFS[k];
                    return `<div class="row" style="flex-wrap:wrap;gap:4px;margin-top:4px">
                      <span>${ld.icon} <b>${esc(ld.name)}</b>${ld.requiresBox ? ' (Exige 📦 Caixa!)' : ''}:</span>
                      <button data-action="rec_litter" data-idx="${idx}" data-t="lixeira_papel">🔵 Papel</button>
                      <button data-action="rec_litter" data-idx="${idx}" data-t="lixeira_plastico">🔴 Plástico</button>
                      <button data-action="rec_litter" data-idx="${idx}" data-t="lixeira_organico">🟤 Orgânico</button>
                      <button class="primary" data-action="rec_litter" data-idx="${idx}" data-t="deposito_especial">🏭 Depósito Especial (Eletr./Bat./Vidro)</button>
                    </div>`;
                  })
                  .join('')
              : '<p class="hint">Recolha o lixo do chão e destine corretamente — eletrônicos, baterias e vidros embalados vão no Depósito Especial!</p>'
          }
        </div>
        <h3>🏠 Meus Itens (Vender, Doar, Trocar, Leiloar ou Descartar na Lixeira Certa!)</h3>
        <div class="shop-grid">${
          run.utilities.ownedItems.length
            ? run.utilities.ownedItems
                .map((id) => {
                  const a = getAppliance(id);
                  if (!a) return '';
                  return `<div class="shop-item" style="cursor:default">
                    <span class="shop-ico">${a.icon}</span>
                    <b>${esc(a.name)}</b>
                    <small>Lixeira certa: ${RECYCLING_BIN_LABELS[a.correctBin]}</small>
                    <div class="row" style="flex-wrap:wrap;gap:4px">
                      <button data-action="item_op" data-id="${a.id}" data-op="vender">💰 Vender</button>
                      <button data-action="item_op" data-id="${a.id}" data-op="doar">🎁 Doar</button>
                      <button data-action="item_op" data-id="${a.id}" data-op="trocar">🔄 Trocar</button>
                      <button data-action="item_op" data-id="${a.id}" data-op="leiloar">🔨 Leiloar</button>
                    </div>
                    <div class="row" style="flex-wrap:wrap;gap:4px;margin-top:4px">
                      ${(['papel', 'plastico', 'vidro', 'organico', 'comum'] as RecyclingBin[])
                        .map(
                          (b) =>
                            `<button data-action="item_bin" data-id="${a.id}" data-bin="${b}">${RECYCLING_BIN_LABELS[b]}</button>`
                        )
                        .join('')}
                    </div>
                  </div>`;
                })
                .join('')
            : '<p class="hint">Nenhum item doméstico instalado.</p>'
        }</div>
        <h3 style="margin-top:10px">🛒 Comprar Eletrodomésticos & Itens de Casa</h3>
        <div class="shop-grid">${APPLIANCES.map(
          (a) => `<div class="shop-item" style="cursor:default">
            <span class="shop-ico">${a.icon}</span>
            <b>${esc(a.name)}</b>
            <small>${esc(a.desc)}</small>
            <button class="primary" data-action="buy_app" data-id="${a.id}" ${wallet < a.price ? 'disabled' : ''}>Comprar (${a.price} ${prof.currencyCode})</button>
          </div>`
        ).join('')}</div>
        <div class="row"><button data-action="fechar">◀ Voltar ao Interior da Casa</button></div>
      </div>`,
      {
        pay_util: () => {
          const r = payUtilityBill(run);
          toast(r.msg, 2800);
          audio.play(r.ok ? 'confirm' : 'back');
          this.openHomeUtilitiesCounter();
        },
        ir_moradia: () => this.showTownHub('moradia', true),
        buy_seed: (el) => {
          const r = buySeeds(run, el.dataset.sid ?? '');
          toast(r.msg, 2400);
          this.openHomeUtilitiesCounter();
        },
        plant_seed: (el) => {
          const r = plantHomeSeed(run, el.dataset.sid ?? '');
          toast(r.msg, 2400);
          this.openHomeUtilitiesCounter();
        },
        harvest_feed: () => {
          const r = harvestAndFeedHomeFood(run);
          toast(r.msg, 2600);
          audio.play(r.ok ? 'heal' : 'back');
          this.openHomeUtilitiesCounter();
        },
        buy_app: (el) => {
          const r = buyApplianceItem(run, el.dataset.id ?? '');
          toast(r.msg, 2600);
          this.openHomeUtilitiesCounter();
        },
        item_op: (el) => {
          const r = handleOwnedItem(
            run,
            el.dataset.id ?? '',
            el.dataset.op as 'vender' | 'doar' | 'trocar' | 'leiloar'
          );
          toast(r.msg, 2800);
          this.openHomeUtilitiesCounter();
        },
        item_bin: (el) => {
          const r = handleOwnedItem(
            run,
            el.dataset.id ?? '',
            'descartar',
            el.dataset.bin as RecyclingBin
          );
          toast(r.msg, 3000);
          this.openHomeUtilitiesCounter();
        },
        pickup_litter: () => {
          const r = pickupGroundLitterInRun(run, 0);
          toast(r.msg, 2400);
          audio.play(r.ok ? 'pickup' : 'back');
          this.openHomeUtilitiesCounter();
        },
        drink_water: () => {
          const r = drinkWaterInRun(run);
          toast(r.msg, 3600);
          if (r.died) {
            this.insideBuilding = null;
            this.gameOver(r.msg);
            return;
          }
          audio.play(r.poisoned ? 'hit' : 'heal');
          this.openHomeUtilitiesCounter();
        },
        make_compost: () => {
          const r = makeCompost(run.envSim);
          toast(r.msg, 2600);
          this.openHomeUtilitiesCounter();
        },
        use_compost: () => {
          const r = applyCompostToGarden(run);
          toast(r.msg, 2600);
          this.openHomeUtilitiesCounter();
        },
        discard_excess: () => {
          const r = discardExcessItem(run);
          toast(r.msg, 2600);
          this.openHomeUtilitiesCounter();
        },
        buy_box: () => {
          const r = buyGlassPackingBox(run);
          toast(r.msg, 2400);
          audio.play(r.ok ? 'confirm' : 'back');
          this.openHomeUtilitiesCounter();
        },
        rec_litter: (el) => {
          const r = recycleLitterInRun(
            run,
            Number(el.dataset.idx ?? 0),
            el.dataset.t as DisposalTarget
          );
          toast(r.msg, 3000);
          audio.play(r.ok && r.ecoDelta > 0 ? 'confirm' : 'back');
          this.openHomeUtilitiesCounter();
        },
        fechar: () => {
          this.paused = false;
          this.renderInteriorHud();
        },
      }
    );
  }

  /** Dedicated physical counter inside 🔧 Casa de Reparo (Mestre Jonas): reuse spent items ("bagaço") without polluting! */
  private openRepairShopCounter(): void {
    const run = this.run;
    if (!run) return;
    this.paused = true;
    const bi = currentBiome(run);
    const prof = biomeEconomy(bi);
    if (bi === 0) run.economy.wallets[0] = run.coins;
    const wallet = run.economy.wallets[bi];
    this.ui.render(
      `<div class="panel wide town-panel">
        <h2>🔧 Casa de Reparo & Reuso · Mestre Jonas</h2>
        <p class="hint"><i>"Traga o bagaço dos itens que você já consumiu — eu conserto por 10 ${prof.currencyCode} para você reutilizar sem gerar lixo no aterro!"</i></p>
        <div class="shop-grid">${
          run.envSim.spentBagaco.length
            ? run.envSim.spentBagaco
                .map(
                  (name, idx) => `<div class="shop-item" style="cursor:default">
                    <span class="shop-ico">🔧</span>
                    <b>${esc(name)}</b>
                    <small>Consertar para reutilizar (+1 item recuperado · 0 poluição)</small>
                    <button class="primary" data-action="repair_item" data-idx="${idx}" ${wallet < 10 ? 'disabled' : ''}>Consertar (10 ${prof.currencyCode})</button>
                  </div>`
                )
                .join('')
            : '<p class="hint">Nenhum bagaço para reparar agora. Consumir comidas/itens gera bagaço reutilizável!</p>'
        }</div>
        <div class="row"><button data-action="fechar">◀ Voltar ao Interior da Casa de Reparo</button></div>
      </div>`,
      {
        repair_item: (el) => {
          const r = repairBagacoInRun(run, Number(el.dataset.idx ?? 0));
          toast(r.msg, 2800);
          audio.play(r.ok ? 'confirm' : 'back');
          this.openRepairShopCounter();
        },
        fechar: () => {
          this.paused = false;
          this.renderInteriorHud();
        },
      }
    );
  }

  /** Biome Town Hub: Bank, Player Shop, Transmodification Lab, Shops, Games, Jobs & Care! */
  private showTownHub(
    tab:
      | ShopId
      | 'cuidar'
      | 'jogos'
      | 'trabalhos'
      | 'banco_fin'
      | 'minhaloja'
      | 'laboratorio'
      | 'moradia'
      | 'prefeitura'
      | 'apostas'
      | 'garagem' = this.activeShop,
    singleEstablishment = false
  ): void {
    const run = this.run;
    if (!run) return;
    this.arcade?.dispose();
    this.arcade = null;
    this.paused = true;
    this.activeShop = tab;
    const bi = currentBiome(run);
    const prof = biomeEconomy(bi);
    if (bi === 0) run.economy.wallets[0] = run.coins;
    const wallet = run.economy.wallets[bi];
    const syncCoins = () => {
      if (bi === 0) run.coins = run.economy.wallets[0];
    };

    if (!run.party.some((p) => p.uid === this.activeShopPetUid)) {
      this.activeShopPetUid = run.party[0]?.uid ?? null;
    }
    const selPet = run.party.find((p) => p.uid === this.activeShopPetUid) ?? run.party[0];
    const readyPods = run.labPods.filter((p) => p.hoursRemaining <= 0).length;
    const houseAlert = run.housing.damage !== 'nenhum' ? ' (!)' : '';
    const tabs: [
      (
        | ShopId
        | 'cuidar'
        | 'jogos'
        | 'trabalhos'
        | 'banco_fin'
        | 'minhaloja'
        | 'laboratorio'
        | 'moradia'
        | 'prefeitura'
        | 'apostas'
        | 'garagem'
      ),
      string,
    ][] = [
      ['banco_fin', '🏦 Banco'],
      ['prefeitura', '🏛️ Prefeitura'],
      ['moradia', `🏢 Moradia${houseAlert}`],
      ['garagem', '🚗 Carros & Status'],
      ['apostas', run.gambling.addicted ? '🎰 Apostas (Viciado!)' : '🎰 Apostas'],
      ['minhaloja', '🏪 Minha Lojinha'],
      ['laboratorio', readyPods > 0 ? `🧬 Laboratório (${readyPods}!)` : '🧬 Laboratório'],
      ['comida', '🍎 Comida'],
      ['roupinhas', '👗 Roupinhas'],
      ['beleza', '✨ Beleza'],
      ['hospital', '🏥 Hospital'],
      ['livros', '📚 Livros'],
      ['jogos', '🎪 Jogos'],
      ['trabalhos', '📋 Trabalhos'],
      ['cuidar', '💗 Cuidar'],
    ];

    const petBar = run.party
      .map((p) => {
        const st = petStats(p);
        const on = p.uid === selPet?.uid;
        return `<button class="elem-pill ${on ? 'on' : ''}" data-action="selpet" data-uid="${p.uid}">
          ${p.outfit ?? ''} ${esc(st.name)} (🍎${p.hunger ?? 100}% · 😊${p.happiness ?? 72}% · ✨${p.beauty ?? 20})
        </button>`;
      })
      .join('');

    let body: string;
    if (tab === 'jogos') {
      body = `<div id="arcade-mount"></div>`;
    } else if (tab === 'apostas') {
      const [fA, fB] = dailyMatchup(run.clock.day);
      const betDone = run.gambling.lastBetDay === run.clock.day;
      body = `<div class="shop-card">
          <h3>🎰 Casa de Apostas em Batalhas de Pets (Dia ${run.clock.day})</h3>
          <p class="hint">Apenas <b>1 aposta por dia</b> · Aposte qualquer quantia! É difícil vencer, mas paga alto. Apostar demais dá o título <b>🎲 Viciado em Apostas</b> e faz NPCs te evitarem!</p>
          <p>Apostas feitas: <b>${run.gambling.totalBets}</b> · Ganho: <b>+${run.gambling.totalWon}</b> · Perda: <b>−${run.gambling.totalLost}</b> ${run.gambling.addicted ? '· <b>⚠️ TÍTULO: VICIADO EM APOSTAS</b>' : ''}</p>
          ${run.gambling.lastSummary ? `<p class="hint"><i>${esc(run.gambling.lastSummary)}</i></p>` : ''}
          <div class="row" style="margin:8px 0">
            <label>Valor da aposta: <input id="bet-wager" type="number" min="1" max="${Math.max(1, wallet)}" value="${Math.min(20, Math.max(1, wallet))}" style="width:90px" /></label>
          </div>
          <div class="shop-grid">
            ${[fA, fB]
              .map(
                (f) => `<div class="shop-item" style="cursor:default">
                  <span class="shop-ico">${f.icon}</span>
                  <b>${esc(f.name)}</b>
                  <small>Cartel: ${esc(f.record)} · Odd <b>${f.odds.toFixed(2)}×</b></small>
                  <small>${esc(f.style)}</small>
                  <button class="primary" data-action="place_bet" data-fid="${f.id}" ${betDone || wallet <= 0 ? 'disabled' : ''}>${betDone ? 'Aposta de hoje feita' : `Apostar em ${esc(f.name)}`}</button>
                </div>`
              )
              .join('')}
          </div>
        </div>`;
    } else if (tab === 'garagem') {
      const pStatus = playerStatusScore(run);
      const activeCar = run.social.activeCarId ? getCar(run.social.activeCarId) : null;
      const npcRows = STORY_NPCS.map(
        (n) =>
          `<li><b>${esc(n.name)}</b> (${esc(n.alignment)} · ${esc(n.stereotype)} · 💖 ${esc(n.dere)}) — Status: <b>${run.social.npcStatus[n.id] ?? 20}</b> · Inveja: <b>${run.social.npcEnvy[n.id] ?? 5}%</b></li>`
      ).join('');
      const interRows = Object.entries(run.social.interNpcStatus)
        .map(([pair, val]) => `<span>${esc(pair)}: <b>${val}</b></span>`)
        .join(' · ');
      body = `<div class="shop-card">
          <h3>🚗 Concessionária, Fast Travel & Status Social</h3>
          <p>👑 Seu Status Social: <b>${pStatus}</b> · Carro atual: <b>${activeCar ? `${activeCar.icon} ${esc(activeCar.name)}` : 'Nenhum (a pé)'}</b></p>
          <p class="hint">Carros são caros e poluem muito, mas dão altíssimo Status e são o <b>único jeito de fazer Fast Travel entre bairros</b>! Luxo demais gera inveja — NPCs <b>Chaotic Evil</b> com muita inveja podem te roubar à noite!</p>
          ${
            activeCar
              ? `<div class="row" style="flex-wrap:wrap;gap:6px;margin-top:8px">
                  ${BIOMES.map(
                    (_b, idx) =>
                      `<button data-action="fast_travel" data-bi="${idx}" ${idx === bi ? 'disabled' : ''}>🚗 Ir para ${esc(biomeName(idx))} (−${activeCar.ecoDamageTrip}🌿)</button>`
                  ).join('')}
                </div>`
              : ''
          }
        </div>
        <div class="shop-grid">
          ${CAR_MODELS.map((c) => {
            const owned = run.social.cars.includes(c.id);
            return `<div class="shop-item" style="cursor:default">
              <span class="shop-ico">${c.icon}</span>
              <b>${esc(c.name)}</b>
              <small>${esc(c.desc)}</small>
              <button class="primary" data-action="buy_car" data-cid="${c.id}" ${owned || wallet < c.price ? 'disabled' : ''}>${owned ? 'Na Garagem ✔' : `Comprar (${c.price} ${prof.currencyCode})`}</button>
            </div>`;
          }).join('')}
        </div>
        <div class="shop-card" style="margin-top:10px">
          <h4>🎭 Alinhamentos, Estereótipos, Status & Inveja dos NPCs</h4>
          <ul style="font-size:.82rem;margin:6px 0;padding-left:18px">${npcRows}</ul>
          <p class="hint"><b>Status entre NPCs:</b> ${interRows}</p>
        </div>`;
    } else if (tab === 'prefeitura') {
      const pref = prefeituraForBiome(bi);
      const bioHp = run.eco.biomeHealth[bi] ?? 100;
      const musicMood = ecoMusicProfile(bioHp).moodLabel;
      const rightPct = 100 - pref.leftSharePct;
      const hasPermit = run.gov.permits.includes(bi);
      const ch = run.gov.customHouse;
      const cert = MATERIAL_BUNDLES.certificada;
      const clan = MATERIAL_BUNDLES.clandestina;
      const buyback = ch?.seizedByCity ? seizedHouseBuybackPrice(run.gov) : 0;
      body = `<div class="shop-card">
          <h3>🏛️ ${esc(pref.name)}</h3>
          <p>🗳️ <b>Posicionamento da Prefeitura:</b> ${pref.politicalLean === 'esquerda' ? '🔴' : '🔵'} ${esc(pref.politicalLabel)} · Bairro: <b>${pref.leftSharePct}% Esquerda / ${rightPct}% Direita</b></p>
          <p class="hint"><b>Lei Ambiental do Bairro:</b> ${esc(pref.lawDescription)}</p>
          <p>🌿 Saúde Ecológica: <b>${bioHp}%</b> · 🎵 Clima Musical: <b>${esc(musicMood)}</b> (Resiliência natural: +${pref.resiliencePerDay}%/dia se ≥45% · Em 0% é irreversível!)</p>
          <div class="row">
            <button class="primary" data-action="gov_restore" ${bioHp <= 0 || bioHp < 10 || bioHp >= 100 || wallet < pref.ecoRestoreFee ? 'disabled' : ''}>🌿 Reajuste Ambiental (${pref.ecoRestoreFee} ${prof.currencyCode})</button>
            <button data-action="gov_permit" ${hasPermit || wallet < pref.permitFee ? 'disabled' : ''}>📜 ${hasPermit ? 'Alvará Ativo ✔' : `Tirar Alvará (${pref.permitFee} ${prof.currencyCode})`}</button>
          </div>
        </div>
        <div class="shop-card">
          <h3>🏗️ Construir Casa Própria & IPTU</h3>
          <p class="hint">Materiais na obra: <b>${run.gov.materials ? `${run.gov.materials.source} (durabilidade ${run.gov.materials.durability})` : 'Nenhum'}</b></p>
          ${
            ch
              ? `<p>🏡 Casa própria (${ch.quality}): Condição <b>${ch.condition}%</b> · IPTU em aberto: <b>${ch.iptuOwed}</b> ${ch.seizedByCity ? '· <b>⚠️ TOMADA PELA PREFEITURA!</b>' : ch.collapsed ? '· <b>💥 DESABOU!</b>' : ''}</p>
                 <div class="row">
                   ${ch.iptuOwed > 0 && !ch.seizedByCity ? `<button class="primary" data-action="pay_iptu" ${wallet < ch.iptuOwed ? 'disabled' : ''}>🏛️ Pagar IPTU (${ch.iptuOwed})</button>` : ''}
                   ${ch.seizedByCity ? `<button class="primary" data-action="buyback_house" ${wallet < buyback ? 'disabled' : ''}>🏡 Recomprar Casa da Prefeitura (${buyback})</button>` : ''}
                 </div>`
              : `<div class="row">
                   <button class="primary" data-action="build_house" ${!hasPermit || !run.gov.materials ? 'disabled' : ''}>👷 Construir Casa com Pedreiro (~80 ${prof.currencyCode})</button>
                 </div>`
          }
        </div>
        <h3>🪵 Marcenaria Certificada vs 🪓 Beco do Lenhador Clandestino</h3>
        <div class="shop-grid">
          <div class="shop-item" style="cursor:default">
            <span class="shop-ico">${cert.icon}</span>
            <b>${esc(cert.seller)}</b>
            <small>${esc(cert.desc)}</small>
            <button class="primary" data-action="buy_mat" data-src="certificada" ${wallet < cert.basePrice ? 'disabled' : ''}>Comprar Certificado (${cert.basePrice} ${prof.currencyCode})</button>
          </div>
          <div class="shop-item" style="cursor:default">
            <span class="shop-ico">${clan.icon}</span>
            <b>${esc(clan.seller)}</b>
            <small>${esc(clan.desc)}</small>
            <button class="danger" data-action="buy_mat" data-src="clandestina" ${wallet < clan.basePrice ? 'disabled' : ''}>Comprar no Beco (${clan.basePrice} ${prof.currencyCode})</button>
          </div>
        </div>
        <div class="shop-card" style="margin-top:10px">
          <h3>🐾 ONGs Ambientais, Extinção & Fiscalização</h3>
          <p>💀 Espécies Extintas: <b>${run.ngo.extinctSpecies.length ? run.ngo.extinctSpecies.join(', ') : 'Nenhuma'}</b> · Multa ONG: <b>${run.ngo.fineOwed} ${prof.currencyCode}</b> · 🗑️ Aterro: <b>${run.envSim.cityLandfills[bi] ?? 0}%</b></p>
          <div class="row" style="flex-wrap:wrap;gap:6px;margin-bottom:6px">
            <button class="primary" data-action="ngo_protest">📢 Reclamar do Lixo c/ Grupo da ONG</button>
            <button data-action="do_militancy">📣 Militância Ambiental (Nível ${run.envSim.militancyLevel})</button>
            ${run.ngo.fineOwed > 0 ? `<button class="danger" data-action="pay_ngo_fine">⚖️ Pagar Multa da ONG (${run.ngo.fineOwed}) — Se não puder pagar, será PRESO!</button>` : ''}
          </div>
          <div class="shop-grid" style="margin-top:6px">
            ${NGOS.map((n) => {
              const joined = run.ngo.joinedNgos.includes(n.id);
              const rec = run.ngo.recruits[n.id].length;
              return `<div class="shop-item" style="cursor:default">
                <span class="shop-ico">${n.icon}</span>
                <b>${esc(n.name)}</b>
                <small>${esc(n.desc)} · Voluntários: <b>${rec}</b></small>
                <div class="row">
                  <button class="primary" data-action="join_ngo" data-nid="${n.id}" ${joined ? 'disabled' : ''}>${joined ? 'Membro ✔' : 'Participar'}</button>
                  ${joined ? `<button data-action="recruit_ngo" data-nid="${n.id}">🤝 Recrutar NPC</button>` : ''}
                </div>
              </div>`;
            }).join('')}
          </div>
          ${
            run.ngo.extinctSpecies.length
              ? `<div class="row" style="margin-top:6px">${run.ngo.extinctSpecies
                  .map(
                    (sp) =>
                      `<button class="primary" data-action="recover_sp" data-sp="${sp}">🐾 Recuperar ${esc(sp)} da Extinção</button>`
                  )
                  .join('')}</div>`
              : ''
          }
        </div>
        <div class="shop-card" style="margin-top:10px">
          <h3>🌍 Manutenção Urbano/Rural, Preservação Natural, Leis RSA & ESG</h3>
          <p>🏙️ Urbano: <b>${run.sustainability.urbanMaintenance[bi] ?? 50}%</b> · 🌾 Rural: <b>${run.sustainability.ruralMaintenance[bi] ?? 50}%</b> · 🏞️ Preservação Natural: <b>${run.sustainability.naturalReserves[bi] ? 'ATIVA ✔' : 'Não criada'}</b> · ⚖️ Seu RSA: <b>${run.sustainability.playerRsaScore}%</b></p>
          <div class="row" style="flex-wrap:wrap;gap:6px;margin-bottom:8px">
            <button data-action="maint_urb" ${wallet < MAINTENANCE_COST ? 'disabled' : ''}>🏙️ Manutenção Urbana (${MAINTENANCE_COST})</button>
            <button data-action="maint_rur" ${wallet < MAINTENANCE_COST ? 'disabled' : ''}>🌾 Manutenção Rural (${MAINTENANCE_COST})</button>
            <button class="primary" data-action="create_reserve" ${run.sustainability.naturalReserves[bi] || wallet < RESERVE_COST ? 'disabled' : ''}>🏞️ ${run.sustainability.naturalReserves[bi] ? 'Preservação Ativa ✔' : `Criar Preservação Natural (${RESERVE_COST})`}</button>
            <button data-action="rsa_audit">⚖️ Auditoria RSA (Você & NPCs)</button>
          </div>
          <p class="hint"><b>📊 ESG de Matérias-Primas:</b> ${RAW_MATERIALS_ESG.map((m) => `${m.icon} ${m.name} (<b>${esgScoreOf(m).grade}</b>)`).join(' · ')}</p>
          <p class="hint"><b>🏭 Menor Geração de Resíduo (Lojas & Fábricas):</b> ${rankLowestWasteProducers()
            .map(
              (p, idx) =>
                `${idx + 1}º ${p.icon} ${p.name} (<b>${p.wastePerUnit}g/un</b> · ${p.cleanerProduction ? 'P+L ✔' : 'Alto Resíduo'})`
            )
            .join(' · ')}</p>
        </div>
        <div class="shop-card" style="margin-top:10px">
          <h3>🌡️ Aquecimento Global, Extração Mineral & 🕵️ Sociedade Secreta</h3>
          <p>☁️ CO₂: <b>${run.climate.co2Atmosphere} ppm</b> · 💨 Metano (CH₄): <b>${run.climate.methaneAtmosphere}</b> · Temperatura: <b>+${globalTempDeltaC(run.climate, seasonForDay(run.clock.day).tempShiftC)}°C</b> (${seasonForDay(run.clock.day).icon} ${seasonForDay(run.clock.day).name}) ${isExtremeHeat(run.climate, seasonForDay(run.clock.day).tempShiftC) ? '· <b>🔥 CALOR EXTREMO!</b>' : ''}</p>
          <p class="hint">🧬 <b>Endemismo do Bairro:</b> Árvores (${BIOME_ENDEMISM[bi]?.endemicTrees.join(', ')}) · Minerais (${BIOME_ENDEMISM[bi]?.endemicMinerals.join(', ')}) · <b>Microendemismo exclusivo:</b> ${BIOME_ENDEMISM[bi]?.microendemicPet} & ${BIOME_ENDEMISM[bi]?.microendemicPlant}</p>
          <p>⛏️ Lotes: <b>${run.climate.lotsCleared}</b> · 🪓 Fragmentação: <b>${run.biosphere.choppedTrees.length} árvore(s) cortada(s)</b> (Mudas: ${run.biosphere.treeSaplings}) · Minérios: 🪨${run.climate.minerals.pedra} ⚙️${run.climate.minerals.metal} 🪙${run.climate.minerals.ouro} 💎${run.climate.minerals.pedra_preciosa}</p>
          <div class="row" style="flex-wrap:wrap;gap:6px">
            <button data-action="clear_lot">🪓 Capinar Lote (−6🌿 · +6 CO₂)</button>
            <button data-action="mine_lot" ${run.climate.lotsCleared <= 0 ? 'disabled' : ''}>⛏️ Extrair Minerais (−10🌿 · +10 CO₂)</button>
            <button class="primary" data-action="sell_minerals">💰 Vender Minérios</button>
            <button class="danger" data-action="build_hydro" ${run.biosphere.hydroDamsBuilt.includes(bi) || wallet < HYDRO_DAM_COST ? 'disabled' : ''}>🌊⚡ ${run.biosphere.hydroDamsBuilt.includes(bi) ? 'Hidrelétrica Ativa' : `Construir Hidrelétrica (${HYDRO_DAM_COST} · Inunda & +CH₄!)`}</button>
            <button data-action="replant_tree" ${run.biosphere.treeSaplings <= 0 || run.biosphere.choppedTrees.length === 0 ? 'disabled' : ''}>🌳 Replantar Árvore</button>
            <button data-action="conspiracy_talk">🕵️ Falar com Líder da Sociedade Secreta</button>
          </div>
          <hr style="opacity:0.2;margin:10px 0" />
          <h4>⚡ Matriz Energética do Bairro (Todas agridem o ambiente — umas mais, outras bem menos)</h4>
          <p class="hint">Usina ativa neste bairro: <b>${energySourceForBiome(run.energy, bi).icon} ${esc(energySourceForBiome(run.energy, bi).name)}</b> — ${esc(energySourceForBiome(run.energy, bi).desc)}</p>
          <p class="hint">🌦️ <b>Regime Hídrico & Barragens:</b> <b>${run.hydro.regime === 'estiagem' ? '🏜️ Estiagem (Seca Prolongada)' : run.hydro.regime === 'chuva_intensa' ? '🌧️ Chuva Intensa (Alagamentos!)' : '🌤️ Normal'}</b> · Ruas alagadas: <b>${run.hydro.floodedStreets}</b> · Armazenamento de água: <b>${run.hydro.waterStorageStatus}</b> · Risco de doenças: <b>${run.hydro.diseaseRisk}%</b> · Agricultura: <b>${Math.round(run.hydro.agricultureMultiplier * 100)}%</b>${run.hydro.thermalFallbackActive ? ' · <b>⚠️ Termoelétrica acionada (tarifa 1.8×)!</b>' : ''}${run.hydro.damBroken ? ` · <b>🚨 Barragem Rompida (NPCs mortos: ${run.hydro.deadNpcIds.length} · Sem casa: ${run.hydro.homelessNpcIds.length})</b>` : ` · Pressão da barragem: ${run.hydro.damRiskLevel}%`}</p>
          <p class="hint">🚰 <b>Saneamento Básico do Bairro:</b> <b>${run.hydro.biomeSanitation[bi] ?? 50}% (${sanitationQualityLabel(run.hydro.biomeSanitation[bi] ?? 50)})</b> · Descuido do governo na barragem: <b>${run.hydro.governmentNeglect}%</b> ${run.hydro.mudBiomes.includes(bi) ? '· <b>🟤 BAIRRO SOTERRADO EM LAMA!</b>' : ''}</p>
          <p class="hint">🌍 <b>Filosofia do Antropoceno (${anthropoceneReportForRun(run).score}/100 · ${anthropoceneReportForRun(run).era}):</b> ${esc(anthropoceneReportForRun(run).reflection)} <i>(${esc(ANTHROPOCENE_MANIFESTO)})</i></p>
          <div class="row" style="flex-wrap:wrap;gap:6px;margin-bottom:6px">
            <button data-action="improve_sanitation" ${(run.hydro.biomeSanitation[bi] ?? 50) >= 100 || wallet < SANITATION_UPGRADE_COST ? 'disabled' : ''}>🚰 Obra de Saneamento Básico (${SANITATION_UPGRADE_COST} · +20%)</button>
            <button data-action="flyer_job">📄 Panfletar no Emprego (+18 · NPCs acham chato!)</button>
            <button data-action="flyer_apt">🏢📄 Panfletar Venda de Apartamento (+15 · Chato!)</button>
            <button data-action="flyer_ngo">🌱📄 Panfletar Minha ONG (+1 Apoiador · Chato!)</button>
          </div>
          <p class="hint">📄 Panfletos recebidos de corretores chatos: <b>${run.flyers.receivedFlyers}</b> · Panfletos distribuídos por você: <b>${run.flyers.distributedFlyers}</b> (Nível de Chatice: <b>${run.flyers.annoyanceScore}</b>)</p>
          <div class="row" style="flex-wrap:wrap;gap:6px">${ENERGY_SOURCE_LIST.map((src) => {
            const active = run.energy.biomePlants[bi] === src.id;
            return `<button class="${src.impactLevel === 'muito_alto' || src.id === 'nuclear' ? 'danger' : ''}" data-action="install_energy" data-src="${src.id}" ${active || wallet < src.cost ? 'disabled' : ''}>${src.icon} ${esc(src.name)} (${active ? 'Ativa ✔' : `${src.cost} · −${src.ecoDamage}🌿`})</button>`;
          }).join('')}</div>
        </div>
        <div class="shop-card" style="margin-top:10px">
          <h3>🕳️ Missão Secreta: Esgoto Cyberpunk (64 Monstros Falantes)</h3>
          <p class="hint">Chefes principais derrotados: <b>${this.save.bossesDefeated ?? 0}/${BOSSES_TO_UNLOCK_SEWER}</b> ${run.sewer.unlocked ? '· ✅ DESBLOQUEADO!' : '· Derrote os 8 chefes para abrir o Esgoto Cyberpunk!'}</p>
          ${
            run.sewer.unlocked
              ? `<p>Bioma Cyberpunk: <b>${SEWER_BIOMES[run.sewer.currentSewerBiome].icon} ${esc(SEWER_BIOMES[run.sewer.currentSewerBiome].name)}</b> · Monstros Falantes enfrentados: <b>${run.sewer.defeatedIds.length}/64</b></p>
                 <div class="row" style="flex-wrap:wrap;gap:6px">
                   <button class="primary" data-action="sewer_battle">🤖 Enfrentar Monstro Falante #${Math.min(64, run.sewer.defeatedIds.length + 1)}</button>
                   <button class="danger" data-action="sewer_twist">🪞 Confrontar Vilão Final no Núcleo Espelho</button>
                 </div>`
              : ''
          }
        </div>`;
    } else if (tab === 'moradia') {
      const h = run.housing;
      const quote = masonQuotePrice(h);
      const dmgText =
        h.damage === 'goteira'
          ? '🌧️ GOTEIRA NO TELHADO! (Deixa seus pets de mau humor!)'
          : h.damage === 'infiltracao'
            ? '💧 INFILTRAÇÃO NO APARTAMENTO! (Vizinhos estão reclamando!)'
            : '✅ Estrutura em boas condições.';
      const aptCards = APARTMENTS.map(
        (a) => `<div class="shop-item" style="cursor:default">
          <span class="shop-ico">🏢</span>
          <b>${esc(a.name)}</b>
          <small>Idade do prédio: ${a.ageDays} dias · Vizinhos: ${esc(a.neighbors.join(', '))}</small>
          <div class="row">
            <button data-action="apt_rent" data-id="${a.id}" ${wallet < a.rentPerDay ? 'disabled' : ''}>🔑 Alugar (${a.rentPerDay}/dia)</button>
            <button class="primary" data-action="apt_buy" data-id="${a.id}" ${wallet < a.buyPrice ? 'disabled' : ''}>🏠 Comprar (${a.buyPrice})</button>
          </div>
        </div>`
      ).join('');
      body = `<div class="shop-card">
          <h3>${h.kind === 'apartamento' ? '🏢' : '🏡'} ${esc(h.name)} (${h.owned ? 'Próprio' : `Aluguel ${h.rentPerDay}/dia`})</h3>
          <p>Idade do imóvel: <b>${h.ageDays} dias</b> · Estado: <b>${dmgText}</b></p>
          ${h.neighborComplaint ? `<p class="hint"><b>${esc(h.neighborComplaint)}</b></p>` : ''}
          ${h.neighbors.length ? `<p class="hint"><b>Vizinhos no prédio:</b> ${esc(h.neighbors.join(' · '))}</p>` : ''}
          ${h.activeRepair ? `<p class="hint">👷 <b>Pedreiro trabalhando:</b> faltam ${h.activeRepair.hoursRemaining}h do jogo (${esc(h.activeRepair.note)})</p>` : ''}
          <p class="hint">Relação com o Pedreiro: <b>${h.masonRelation}</b> · Orçamento atual: <b>${quote} ${prof.currencyCode}</b> (pode cobrar caro, demorar dias ou te enrolar se você tratá-lo mal!)</p>
          <div class="row">
            <button data-action="mason_rel" data-delta="1">☕ Oferecer Café ao Pedreiro (+1)</button>
            <button data-action="mason_rel" data-delta="-2" class="danger">😠 Apressar Pedreiro (−2)</button>
            <button class="primary" data-action="hire_mason" ${h.damage === 'nenhum' || !!h.activeRepair || wallet < quote ? 'disabled' : ''}>👷 Chamar Pedreiro (${quote} ${prof.currencyCode})</button>
          </div>
        </div>
        <h3>🏢 Prédios & Apartamentos Disponíveis</h3>
        <div class="shop-grid">${aptCards}</div>`;
    } else if (tab === 'laboratorio') {
      const labPrice = localPrice(run.economy, bi, LAB_FEE);
      const reqCat = labCatalystForBiome(bi);
      const haveCat = reqCat ? (run.eco.catalysts[reqCat.id] ?? 0) : 1;
      const riskPct = selPet
        ? Math.round(
            computeLabAccidentChance({
              labRelation: run.eco.labRelation,
              hunger: selPet.hunger ?? 100,
              happiness: selPet.happiness ?? 72,
              beauty: selPet.beauty ?? 20,
              hpRatio: selPet.hp / Math.max(1, petStats(selPet).maxHp),
              weather: run.eco.weather,
            }) * 100
          )
        : 5;
      const geneCards = ELEMENTS.map((el) => {
        const have = run.elementGenes[el] ?? 0;
        const canStart =
          selPet &&
          run.party.length > 1 &&
          have >= LAB_GENES_NEEDED &&
          haveCat > 0 &&
          wallet >= labPrice &&
          selPet.element !== el;
        return `<div class="shop-item" style="cursor:default">
          <span class="shop-ico">${elementIcon(el, 32)}</span>
          <b>Genes de ${esc(elementLabel(el))}</b>
          <small>Coletados: <b>${have}/${LAB_GENES_NEEDED}</b></small>
          <button class="${canStart ? 'primary' : ''}" data-action="lab_start" data-el="${el}" ${canStart ? '' : 'disabled'}>
            🧬 Transmodificar (${labPrice} ${prof.currencyCode})
          </button>
        </div>`;
      }).join('');
      const podsHtml = run.labPods.length
        ? run.labPods
            .map((pod) => {
              const st = petStats(pod.pet);
              const done = pod.hoursRemaining <= 0;
              return `<div class="shop-card">
                <h4>${elementIcon(pod.targetElement, 20)} Cápsula: <b>${esc(st.name)}</b> → <b>${esc(elementLabel(pod.targetElement))}</b></h4>
                ${bar(pod.totalHours - pod.hoursRemaining, pod.totalHours, 'xp')}
                <p class="hint">${done ? '✨ Transmodificação completa! Pronto para retirar!' : `⏳ Incubando... Faltam <b>${pod.hoursRemaining}h</b> do jogo (explore ou aguarde aqui).`}</p>
                <div class="row">
                  ${
                    done
                      ? `<button class="primary" data-action="lab_claim" data-id="${pod.id}">✨ Retirar Pet Transformado!</button>`
                      : `<button data-action="lab_wait">⏳ Aguardar 2h na sala de espera</button>`
                  }
                </div>
              </div>`;
            })
            .join('')
        : `<p class="hint">Nenhuma cápsula ativa. Escolha um pet acima, junte ${LAB_GENES_NEEDED} genes de um elemento e inicie!</p>`;
      const resPrice = localPrice(run.economy, bi, RESURRECT_FEE);
      const macPrice = Math.max(
        1,
        Math.round(
          localPrice(run.economy, bi, MACABRE_ITEM_PRICE) *
            shopRelationPriceFactor(run.eco.shopRelation)
        )
      );
      const donorReady = selPet && selPet.hp >= petStats(selPet).maxHp;
      const graveHtml = run.graveyard.length
        ? run.graveyard
            .map((g, gi) => {
              const canRes =
                donorReady && run.macabreItems >= RESURRECT_MACABRE_NEEDED && wallet >= resPrice;
              return `<div class="shop-item" style="cursor:default">
                <span class="shop-ico">🪦</span>
                <b>${esc(g.name)}</b>
                <small>Causa: ${esc(g.cause)} (Dia ${g.day})</small>
                <small>Doador (100% HP): <b>${selPet ? esc(petStats(selPet).name) : '—'}</b> (${selPet ? `${selPet.hp}/${petStats(selPet).maxHp}` : '—'})</small>
                <button class="${canRes ? 'primary' : ''}" data-action="res_pet" data-idx="${gi}" ${canRes ? '' : 'disabled'}>
                  🧟 Ressuscitar como Zumbi (${resPrice} ${prof.currencyCode})
                </button>
              </div>`;
            })
            .join('')
        : `<p class="hint">Nenhum pet morto no memorial ainda.</p>`;

      body = `<div class="shop-card">
          <h3>🧬 Laboratório de Transmodificação Permanente</h3>
          <p class="hint">Clima: <b>${WEATHER_META[run.eco.weather].icon} ${WEATHER_META[run.eco.weather].name}</b> · Relação com Cientista: <b>${run.eco.labRelation}</b> · Risco de acidente: <b>${riskPct}%</b></p>
          <p class="hint">Atenção: tratar mal o cientista, clima extremo, fome, tristeza, pouco HP ou pouca beleza podem causar acidentes (morte, perda de atributos, virar outra espécie, mutante, estátua, doença ou geleca)!</p>
          <div class="row">
            <button data-action="lab_rel" data-delta="1">🤝 Elogiar Cientista (+1)</button>
            <button data-action="lab_rel" data-delta="-2" class="danger">😠 Tratar Mal (−2)</button>
            ${reqCat ? `<button data-action="buy_cat">${reqCat.icon} Comprar ${esc(reqCat.name)} (possui ${haveCat})</button>` : ''}
          </div>
        </div>
        <h3>🧪 Cápsulas de Incubação (${run.labPods.length})</h3>
        ${podsHtml}
        <h3>🧬 Banco de Genes Elementais</h3>
        <div class="shop-grid">${geneCards}</div>
        <div class="shop-card">
          <h3>🧟 Ressurreição por Troca Equivalente</h3>
          <p class="hint">Traga um pet morto de volta como <b>Zumbi</b>! Custa: <b>metade do HP</b> do pet selecionado acima (precisa estar com 100% HP — pode desenvolver <b>Depressão</b> com ciclo de meia-vida diário!), <b>${resPrice} ${prof.currencyCode}</b> e <b>${RESURRECT_MACABRE_NEEDED} Itens Macabros</b> (você tem: <b>${run.macabreItems}</b>).</p>
          <div class="row">
            <button data-action="buy_macabre" ${wallet < macPrice ? 'disabled' : ''}>🕯️ Comprar Item Macabro (${macPrice} ${prof.currencyCode})</button>
          </div>
        </div>
        <div class="shop-grid">${graveHtml}</div>`;
    } else if (tab === 'banco_fin') {
      const dep = run.economy.deposits[bi];
      const stockCards = STOCKS.map((st) => {
        const baseP = run.economy.stockPrices[st.id] ?? st.basePrice;
        const prevP = run.economy.prevStockPrices[st.id] ?? baseP;
        const diff = baseP - prevP;
        const localP = Math.max(1, Math.round(baseP / run.economy.rates[bi]));
        const owned = run.economy.shares[st.id] ?? 0;
        const trend = diff > 0 ? `▲ +${diff}` : diff < 0 ? `▼ ${diff}` : '• 0';
        return `<div class="shop-item" style="cursor:default">
          <b>${st.ticker} · ${esc(st.name)}</b>
          <small>${st.sector} · ${localP} ${prof.currencyCode} (${trend})</small>
          <small>Na carteira: <b>${owned}</b> ações</small>
          <div class="row">
            <button data-action="buy_stk" data-id="${st.id}" ${wallet < localP ? 'disabled' : ''}>📈 Comprar</button>
            <button data-action="sell_stk" data-id="${st.id}" ${owned <= 0 ? 'disabled' : ''}>📉 Vender</button>
          </div>
        </div>`;
      }).join('');
      const forexCards = BIOME_ECONOMIES.filter((b) => b.biomeIndex !== bi)
        .map((other) => {
          const r = run.economy.rates[other.biomeIndex];
          const pr = run.economy.prevRates[other.biomeIndex];
          const trend = r > pr ? '▲ valorizou' : r < pr ? '▼ desvalorizou' : '• estável';
          const have = run.economy.wallets[other.biomeIndex];
          return `<div class="shop-item" style="cursor:default">
            <b>${other.currencyIcon} ${other.currencyName} (${other.currencyCode})</b>
            <small>Cotação: ${r.toFixed(2)} FL (${trend}) · Saldo: <b>${have}</b></small>
            <button data-action="cambio" data-to="${other.biomeIndex}" ${wallet < 25 ? 'disabled' : ''}>💱 Trocar 25 ${prof.currencyCode}</button>
          </div>`;
        })
        .join('');
      body = `<div class="shop-card">
          <h3>🏦 ${esc(prof.bankName)} (${prof.currencyIcon} ${prof.currencyName})</h3>
          <p class="hint"><i>"${esc(prof.dialect.bankGreeting)}"</i></p>
          <p>Poupança: <b>${dep} ${prof.currencyCode}</b> · Juros: <b>${Math.round(prof.interestRate * 100)}%/dia</b> · Corretagem: <b>${Math.round(prof.brokerageFee * 100)}%</b> · Imposto da Lojinha: <b>${Math.round(prof.salesTax * 100)}%</b></p>
          <div class="row">
            <button class="primary" data-action="dep" data-amt="25" ${wallet < 25 ? 'disabled' : ''}>Depositar 25 ${prof.currencyCode}</button>
            <button class="primary" data-action="dep" data-amt="50" ${wallet < 50 ? 'disabled' : ''}>Depositar 50 ${prof.currencyCode}</button>
            <button data-action="sac" data-amt="25" ${dep < 25 ? 'disabled' : ''}>Sacar 25 ${prof.currencyCode}</button>
            <button data-action="sac" data-amt="${dep}" ${dep <= 0 ? 'disabled' : ''}>Sacar Tudo</button>
          </div>
        </div>
        <h3>📈 Bolsa de Ações (Corretagem ${Math.round(prof.brokerageFee * 100)}%)</h3>
        <div class="shop-grid">${stockCards}</div>
        <h3>💱 Câmbio de Moedas dos 7 Biomas</h3>
        <div class="shop-grid">${forexCards}</div>`;
    } else if (tab === 'minhaloja') {
      const goodsHtml = PLAYER_SHOP_GOODS.map((g) => {
        const qty = run.economy.myShopStock[g.id] ?? 0;
        const askBase = run.economy.myShopPrices[g.id] ?? g.suggestedPrice;
        const askLocal = localPrice(run.economy, bi, askBase);
        const costLocal = localPrice(run.economy, bi, g.baseCost);
        const estTax = Math.max(1, Math.round(askLocal * prof.salesTax));
        return `<div class="shop-item" style="cursor:default">
          <span class="shop-ico">${g.icon}</span>
          <b>${esc(g.name)}</b>
          <small>${esc(g.desc)}</small>
          <small>Estoque: <b>${qty}</b> · Preço: <b>${askLocal} ${prof.currencyCode}</b> (Imposto -${estTax})</small>
          <div class="row">
            <button data-action="preco" data-id="${g.id}" data-delta="-4">− Preço</button>
            <button data-action="preco" data-id="${g.id}" data-delta="4">+ Preço</button>
          </div>
          <div class="row">
            <button data-action="estocar" data-id="${g.id}" ${wallet < costLocal ? 'disabled' : ''}>📦 Estocar (${costLocal})</button>
            <button class="primary" data-action="vender" data-id="${g.id}" ${qty <= 0 ? 'disabled' : ''}>💰 Vender p/ NPC</button>
          </div>
        </div>`;
      }).join('');
      body = `<div class="shop-card">
          <h3>🏪 Minha Lojinha em ${esc(biomeName(bi))}</h3>
          <p class="hint"><b>Perfil dos clientes locais:</b> ${esc(prof.behavior)}</p>
          <p class="hint"><i>"${esc(this.lastCustomerQuote || prof.dialect.greeting)}"</i></p>
          <p>Imposto pago ao ${esc(prof.bankName)}: <b>${Math.round(prof.salesTax * 100)}%</b> por venda · Total vendido: <b>${run.economy.totalShopSales}</b> · Impostos pagos: <b>${run.economy.totalTaxPaid}</b></p>
          ${run.eco.statues.length ? `<p class="hint"><b>Decoração da Loja:</b> ${run.eco.statues.map((s) => `${s.icon} ${esc(s.name)}`).join(' · ')}</p>` : ''}
        </div>
        <div class="shop-card">
          <h3>👔 Gestão Empresarial: Funcionários, Salários & Robôs</h3>
          <p>Clientes furiosos que NUNCA mais voltam: <b>${run.business.bannedCustomers.length ? run.business.bannedCustomers.join(', ') : 'Nenhum'}</b></p>
          <div class="row" style="flex-wrap:wrap;gap:6px;margin-bottom:8px">
            ${HIREABLE_HUMANS.map(
              (h) =>
                `<button data-action="hire_emp" data-eid="${h.id}">👔 Contratar ${esc(h.name)} (${h.salary}/dia)</button>`
            ).join('')}
            <button data-action="buy_robot" ${wallet < ROBOT_BUY_PRICE ? 'disabled' : ''}>🤖 Comprar Robô (${ROBOT_BUY_PRICE})</button>
            <button class="primary" data-action="run_shift">💼 Abrir Expediente</button>
          </div>
          <div class="shop-grid">${
            run.business.employees.length
              ? run.business.employees
                  .map(
                    (e) => `<div class="shop-item" style="cursor:default">
                      <b>${e.kind === 'robo' ? '🤖' : '👔'} ${esc(e.name)}</b>
                      <small>${e.kind === 'robo' ? 'Sem salário · 35% chance de erro' : `Salário ${e.dailySalary}/dia · Moral ${e.morale}% · 95% precisão`}</small>
                      <div class="row" style="flex-wrap:wrap;gap:4px">
                        ${e.kind === 'humano' ? `<button data-action="treat_emp" data-eid="${e.id}" data-kind="elogiar">😊 Elogiar</button><button class="danger" data-action="treat_emp" data-eid="${e.id}" data-kind="maltratar">😠 Maltratar</button>` : ''}
                        <button data-action="fire_emp" data-eid="${e.id}">📋 Demitir</button>
                      </div>
                    </div>`
                  )
                  .join('')
              : '<p class="hint">Contrate funcionários humanos ou substitua por robôs mais baratos (mas sujeitos a erros!).</p>'
          }</div>
        </div>
        <div class="shop-grid">${goodsHtml}</div>`;
    } else if (tab === 'trabalhos') {
      const bagList = Object.entries(run.jobItems)
        .filter(([, n]) => n > 0)
        .map(([id, n]) => {
          const it = getJobItem(id);
          return it ? `<span class="gem-count">${it.icon} ${esc(it.name)} ×${n}</span>` : '';
        })
        .join(' ');
      body = `<p class="hint">NPCs pedem itens diferenciados (de lojas, avulsos no mapa, de outros trabalhos ou de batalhas). Entregue para ganhar moedas, XP e itens raros!</p>
        <p class="hint"><b>Itens de Trabalho na mochila:</b> ${bagList || 'Nenhum ainda.'}</p>
        <div class="shop-grid">
          ${JOBS.map((job) => {
            const done = run.completedJobs.includes(job.id);
            const active = run.activeJobs.includes(job.id);
            const need = getJobItem(job.needItemId);
            const have = run.jobItems[job.needItemId] ?? 0;
            const canTurnIn = !done && have >= job.needCount;
            const rewardIt = job.rewardItemId ? getJobItem(job.rewardItemId) : undefined;
            return `<div class="shop-item" style="cursor:default">
              <span class="shop-ico">${need?.icon ?? '📦'}</span>
              <b>${esc(job.title)}</b>
              <small><b>${esc(job.npcName)}:</b> ${esc(job.description)}</small>
              <small><i>Onde achar (${need?.source ?? ''}): ${esc(need?.hint ?? '')}</i></small>
              <small>Progresso: <b>${Math.min(have, job.needCount)}/${job.needCount}</b> · Prêmio: 🪙${job.rewardCoins}${rewardIt ? ` + ${rewardIt.icon} ${esc(rewardIt.name)}` : ''}</small>
              ${
                done
                  ? `<span class="shop-price">✅ Concluído</span>`
                  : canTurnIn
                    ? `<button class="primary" data-action="entregar" data-id="${job.id}">🎁 Entregar Item</button>`
                    : active
                      ? `<span class="shop-price">⏳ Em andamento</span>`
                      : `<button data-action="aceitar" data-id="${job.id}">📋 Aceitar Trabalho</button>`
              }
            </div>`;
          }).join('')}
        </div>`;
    } else if (tab === 'hospital') {
      const hospPrice = localPrice(run.economy, bi, HOSPITAL_COST);
      body = `<div class="shop-card">
        <h3>🏥 ${SHOP_META.hospital.name}</h3>
        <p>${SHOP_META.hospital.desc}</p>
        <button class="primary" data-action="curar" ${wallet < hospPrice ? 'disabled' : ''}>🏥 Curar toda a equipe (${prof.currencyIcon} ${hospPrice} ${prof.currencyCode})</button>
      </div>`;
    } else if (tab === 'cuidar') {
      const grave = run.graveyard.length
        ? `<div class="graveyard"><h4>🪦 Memorial dos Pets</h4><ul>${run.graveyard.map((g) => `<li><b>${esc(g.name)}</b> — ${esc(g.cause)} (Dia ${g.day})</li>`).join('')}</ul></div>`
        : '';
      body = selPet
        ? `<div class="shop-card">
            <h3>💗 Cuidar de ${selPet.outfit ?? ''} ${esc(petStats(selPet).name)}</h3>
            <p>🍎 Fome: <b>${selPet.hunger ?? 100}%</b> · 😊 Felicidade/Respeito: <b>${selPet.happiness ?? 72}%</b> · ✨ Beleza: <b>${selPet.beauty ?? 20}</b></p>
            <p class="hint">Pets muito felizes (≥80%) ficam mais fortes (+1 ATK/DEF). Pets tristes (&lt;25%) podem desobedecer!</p>
            <div class="row">
              <button class="primary" data-action="carinho">💗 Fazer Carinho (+12% 😊)</button>
              <button class="primary" data-action="brincar">🎾 Brincar (+18% 😊)</button>
            </div>
          </div>${grave}`
        : '<p>Nenhum pet vivo na equipe.</p>';
    } else {
      const meta = SHOP_META[tab];
      const items = itemsForShop(tab);
      const relFactor = shopRelationPriceFactor(run.eco.shopRelation);
      body = `<div class="shop-card">
          <p class="hint"><i>"${esc(prof.dialect.greeting)}"</i> — ${meta.desc}</p>
          <p class="hint">🌿 Saúde Ambiental do bioma: <b>${run.eco.biomeHealth[bi] ?? 100}%</b> · Relação com Lojista: <b>${run.eco.shopRelation}</b> (Preços ×${relFactor.toFixed(2)})</p>
          <div class="row">
            <button data-action="shop_rel" data-delta="1">🤝 Elogiar Lojista (+1)</button>
            <button data-action="shop_rel" data-delta="-2" class="danger">😠 Reclamar / Tratar Mal (−2)</button>
          </div>
        </div>
        <div class="shop-grid">
          ${items
            .map((it) => {
              const pLoc = Math.max(
                1,
                Math.round(localPrice(run.economy, bi, it.price) * relFactor)
              );
              const stock = run.eco.shopStock[it.id] ?? 3;
              const ecoDmg = it.ecoDamage ?? Math.max(1, Math.round(it.price / 9));
              const pl = verifyCleanerProduction(ecoDmg, false);
              return `<button class="shop-item" data-action="comprar" data-id="${it.id}" ${wallet < pLoc ? 'disabled' : ''}>
                <span class="shop-ico">${it.icon}</span>
                <b>${esc(it.name)}</b>
                <small>${esc(it.desc)}</small>
                <small>Estoque: <b>${stock}</b> · Impacto: <b>−${ecoDmg}🌿</b> · ${pl.label}</small>
                <span class="shop-price">${prof.currencyIcon} ${pLoc} ${prof.currencyCode}</span>
              </button>`;
            })
            .join('')}
        </div>`;
    }

    this.ui.render(
      `<div class="panel wide town-panel">
        <div class="town-head">
          <h2>🏘️ ${esc(biomeName(bi))} · ${esc(prof.bankName)}</h2>
          <span class="town-coins">${formatClock(run.clock)} · ${prof.currencyIcon} <b>${wallet} ${prof.currencyCode}</b> · ✨ Beleza: ${partyAverageBeauty(run)}</span>
        </div>
        <div class="town-tabs" ${singleEstablishment ? 'style="display:none"' : ''}>${tabs.map(([id, label]) => `<button class="elem-pill ${id === tab ? 'on' : ''}" data-action="tab" data-tab="${id}">${label}</button>`).join('')}</div>
        <div class="town-pets">${petBar}</div>
        ${body}
        <div class="row"><button data-action="voltar">${this.insideBuilding ? '◀ Voltar ao Interior' : '◀ Voltar ao Mapa'}</button></div>
      </div>`,
      {
        tab: (el) =>
          this.showTownHub(
            el.dataset.tab as
              | ShopId
              | 'cuidar'
              | 'jogos'
              | 'trabalhos'
              | 'banco_fin'
              | 'minhaloja'
              | 'laboratorio'
              | 'moradia'
              | 'prefeitura'
              | 'apostas'
              | 'garagem'
          ),
        place_bet: (el) => {
          const input = document.getElementById('bet-wager') as HTMLInputElement | null;
          const wager = Number(input?.value ?? 10);
          const res = betOnPetBattle(run, el.dataset.fid ?? '', wager);
          toast(res.msg, 3400);
          audio.play(res.won ? 'win' : 'back');
          this.showTownHub('apostas');
        },
        buy_car: (el) => {
          const res = buyCar(run, el.dataset.cid ?? '');
          toast(res.msg, 3200);
          audio.play(res.ok ? 'confirm' : 'back');
          this.showTownHub('garagem');
        },
        fast_travel: (el) => {
          const target = Number(el.dataset.bi ?? 0);
          const res = fastTravelByCar(run, target);
          toast(res.msg, 3000);
          if (res.ok) {
            this.overworld?.setMap(run.map, run.pos);
            audio.play('confirm');
            this.showWorld();
          }
        },
        gov_restore: () => {
          const res = restoreBiomeWithGovernment(run);
          syncCoins();
          audio.play(res.ok ? 'heal' : 'lose');
          toast(res.msg, 3400);
          this.showTownHub('prefeitura', Boolean(this.insideBuilding));
        },
        join_ngo: (el) => {
          const r = joinNgo(run.ngo, el.dataset.nid as NgoId);
          toast(r.msg, 2800);
          this.showTownHub('prefeitura', Boolean(this.insideBuilding));
        },
        hire_emp: (el) => {
          const r = hireHumanEmployee(run.business, el.dataset.eid ?? '');
          toast(r.msg, 2800);
          this.showTownHub('minhaloja', Boolean(this.insideBuilding));
        },
        fire_emp: (el) => {
          const r = fireEmployee(run.business, el.dataset.eid ?? '');
          toast(r.msg, 2600);
          this.showTownHub('minhaloja', Boolean(this.insideBuilding));
        },
        treat_emp: (el) => {
          const r = treatEmployee(
            run.business,
            el.dataset.eid ?? '',
            el.dataset.kind as 'elogiar' | 'maltratar'
          );
          if (r.gossipTriggered) {
            const bonds = (this.save.npcBonds ??= {});
            for (const n of STORY_NPCS) bonds[n.id] = (bonds[n.id] ?? 0) - 1;
            this.persist();
          }
          toast(r.msg, 3400);
          this.showTownHub('minhaloja', Boolean(this.insideBuilding));
        },
        buy_robot: () => {
          const r = buyShopRobotInRun(run);
          toast(r.msg, 3000);
          this.showTownHub('minhaloja', Boolean(this.insideBuilding));
        },
        run_shift: () => {
          const r = runMyShopShiftInRun(run);
          toast(r.msg, 3400);
          this.showTownHub('minhaloja', Boolean(this.insideBuilding));
        },
        ngo_protest: () => {
          const r = protestTrashWithNgo(run);
          toast(r.msg, 3400);
          this.showTownHub('prefeitura', Boolean(this.insideBuilding));
        },
        maint_urb: () => {
          const r = maintainBiomeInRun(run, 'urbano');
          toast(r.msg, 3000);
          this.showTownHub('prefeitura', Boolean(this.insideBuilding));
        },
        maint_rur: () => {
          const r = maintainBiomeInRun(run, 'rural');
          toast(r.msg, 3000);
          this.showTownHub('prefeitura', Boolean(this.insideBuilding));
        },
        create_reserve: () => {
          const r = createReserveInRun(run);
          toast(r.msg, 3200);
          this.showTownHub('prefeitura', Boolean(this.insideBuilding));
        },
        rsa_audit: () => {
          const r = runRsaAuditInRun(run);
          toast(r.msg, 3800);
          this.showTownHub('prefeitura', Boolean(this.insideBuilding));
        },
        clear_lot: () => {
          const r = clearLotInRun(run);
          toast(r.msg, 3000);
          this.showTownHub('prefeitura', Boolean(this.insideBuilding));
        },
        mine_lot: () => {
          const r = mineMineralsInRun(run);
          toast(r.msg, 3200);
          audio.play(r.ok ? 'chest' : 'back');
          this.showTownHub('prefeitura', Boolean(this.insideBuilding));
        },
        sell_minerals: () => {
          const r = sellMineralsInRun(run);
          toast(r.msg, 2800);
          audio.play(r.coins > 0 ? 'confirm' : 'back');
          this.showTownHub('prefeitura', Boolean(this.insideBuilding));
        },
        conspiracy_talk: () => {
          const quote = talkToConspiracyLeader(run.climate);
          toast(quote, 5600);
          audio.speak(quote, this.save.settings.lang, 0.92);
        },
        build_hydro: () => {
          const r = buildHydroDamInRun(run);
          toast(r.msg, 4000);
          if (r.ok) this.overworld?.setMap(run.map, run.pos);
          this.showTownHub('prefeitura', Boolean(this.insideBuilding));
        },
        install_energy: (el) => {
          const src = el.dataset.src as EnergySourceId;
          const r = installEnergyPlantInRun(run, src);
          toast(r.msg, 4200);
          if (r.ok) this.overworld?.setMap(run.map, run.pos);
          this.showTownHub('prefeitura', Boolean(this.insideBuilding));
        },
        improve_sanitation: () => {
          const r = improveSanitationInRun(run);
          toast(r.msg, 3400);
          this.showTownHub('prefeitura', Boolean(this.insideBuilding));
        },
        flyer_job: () => {
          const r = handOutFlyersInRun(run, 'emprego');
          const bonds = (this.save.npcBonds ??= {});
          for (const n of STORY_NPCS) bonds[n.id] = (bonds[n.id] ?? 0) + r.npcBondPenalty;
          this.persist();
          toast(r.msg, 3600);
          this.showTownHub('prefeitura', Boolean(this.insideBuilding));
        },
        flyer_apt: () => {
          const r = handOutFlyersInRun(run, 'apartamento');
          const bonds = (this.save.npcBonds ??= {});
          for (const n of STORY_NPCS) bonds[n.id] = (bonds[n.id] ?? 0) + r.npcBondPenalty;
          this.persist();
          toast(r.msg, 3600);
          this.showTownHub('prefeitura', Boolean(this.insideBuilding));
        },
        flyer_ngo: () => {
          const r = handOutFlyersInRun(run, 'ong');
          const bonds = (this.save.npcBonds ??= {});
          for (const n of STORY_NPCS) bonds[n.id] = (bonds[n.id] ?? 0) + r.npcBondPenalty;
          this.persist();
          toast(r.msg, 3600);
          this.showTownHub('prefeitura', Boolean(this.insideBuilding));
        },
        replant_tree: () => {
          const spot = run.biosphere.choppedTrees[0];
          if (!spot) return;
          const r = replantTreeInRun(run, spot.x, spot.y);
          toast(r.msg, 3000);
          if (r.ok) this.overworld?.setMap(run.map, run.pos);
          this.showTownHub('prefeitura', Boolean(this.insideBuilding));
        },
        do_militancy: () => {
          const r = performMilitancyInRun(run);
          if (r.npcBondPenalty < 0) {
            const bonds = (this.save.npcBonds ??= {});
            for (const n of STORY_NPCS) bonds[n.id] = (bonds[n.id] ?? 0) + r.npcBondPenalty;
            this.persist();
          }
          toast(r.msg, 3400);
          this.showTownHub('prefeitura', Boolean(this.insideBuilding));
        },
        recruit_ngo: (el) => {
          const nid = el.dataset.nid as NgoId;
          const pool = [
            'Lira',
            'Kael',
            'Mina',
            'Nádia',
            'Breno',
            'Padeiro Bento',
            'Estilista Nina',
          ];
          const nextNpc =
            pool.find((nm) => !run.ngo.recruits[nid].includes(nm)) ??
            `Voluntário #${run.ngo.recruits[nid].length + 1}`;
          const r = recruitToNgo(run.ngo, nid, nextNpc);
          toast(r.msg, 2600);
          this.showTownHub('prefeitura', Boolean(this.insideBuilding));
        },
        recover_sp: (el) => {
          const r = recoverExtinctSpecies(run.ngo, el.dataset.sp ?? '');
          toast(r.msg, 3200);
          this.showTownHub('prefeitura', Boolean(this.insideBuilding));
        },
        pay_ngo_fine: () => {
          const r = payNgoFineInRun(run);
          toast(r.msg, 3800);
          if (r.arrested) {
            // Roguelike Prison Game Over: save collected pets & items for the next run!
            this.save.prisonCarryover = {
              pets: [...run.party, ...run.bench],
              relics: [...run.relics],
              jobItems: { ...run.jobItems },
              potions: run.potions,
            };
            this.persist();
            this.insideBuilding = null;
            this.gameOver(
              '🚔 Você foi PRESO por não pagar a multa ambiental da ONG! (Seus pets e itens serão mantidos na próxima jornada roguelike!)'
            );
            return;
          }
          this.showTownHub('prefeitura', Boolean(this.insideBuilding));
        },
        sewer_battle: () => {
          const nextIdx = Math.min(TALKING_MONSTERS.length - 1, run.sewer.defeatedIds.length);
          const mon = TALKING_MONSTERS[nextIdx];
          if (!run.sewer.defeatedIds.includes(mon.id)) run.sewer.defeatedIds.push(mon.id);
          run.sewer.currentSewerBiome = mon.sewerBiomeIndex;
          toast(`🤖 ${mon.name} (${mon.role.toUpperCase()}): ${mon.quote}`, 4200);
          this.insideBuilding = null;
          void this.startBattle('treinador', 1);
        },
        sewer_twist: () => {
          const twist = buildProtagonistMirrorBoss(run.party);
          run.sewer.finalTwistRevealed = true;
          toast(`${twist.bossTitle}: ${twist.twistSpeech}`, 5000);
          this.insideBuilding = null;
          void this.startBattle('chefe', 1);
        },
        gov_permit: () => {
          const res = buyBuildingPermit(run);
          syncCoins();
          if (res.ok) this.celebrateItem('📜', 'Alvará de Construção', res.msg);
          else {
            audio.play('lose');
            toast(res.msg);
          }
          this.showTownHub('prefeitura');
        },
        buy_mat: (el) => {
          const res = buyMaterialsForRun(run, el.dataset.src as 'certificada' | 'clandestina');
          syncCoins();
          if (res.ok) {
            this.celebrateItem(
              el.dataset.src === 'certificada' ? '🪵' : '🪓',
              'Materiais de Obra',
              res.msg
            );
            for (const w of res.ecoWarnings ?? []) toast(w, 3200);
          } else {
            audio.play('lose');
            toast(res.msg);
          }
          this.showTownHub('prefeitura');
        },
        build_house: () => {
          const res = buildMyHouse(run);
          syncCoins();
          if (res.ok) this.celebrateItem('🏡', 'Casa Própria Construída!', res.msg);
          else {
            audio.play('lose');
            toast(res.msg, 3200);
          }
          this.showTownHub('prefeitura');
        },
        pay_iptu: () => {
          const res = payIptu(run);
          syncCoins();
          audio.play(res.ok ? 'confirm' : 'lose');
          toast(res.msg, 3000);
          this.showTownHub('prefeitura');
        },
        buyback_house: () => {
          const res = buybackSeizedHouse(run);
          syncCoins();
          audio.play(res.ok ? 'evolve' : 'lose');
          toast(res.msg, 3200);
          this.showTownHub('prefeitura');
        },
        apt_rent: (el) => {
          const res = movePlayerToApartment(run, el.dataset.id as string, 'alugar');
          syncCoins();
          audio.play(res.ok ? 'confirm' : 'lose');
          toast(res.msg, 3000);
          this.showTownHub('moradia');
        },
        apt_buy: (el) => {
          const res = movePlayerToApartment(run, el.dataset.id as string, 'comprar');
          syncCoins();
          audio.play(res.ok ? 'evolve' : 'lose');
          toast(res.msg, 3000);
          this.showTownHub('moradia');
        },
        mason_rel: (el) => {
          run.housing.masonRelation = Math.max(
            -5,
            Math.min(5, run.housing.masonRelation + Number(el.dataset.delta))
          );
          toast(`👷 Relação com o pedreiro agora é ${run.housing.masonRelation}.`);
          this.showTownHub('moradia');
        },
        hire_mason: () => {
          const res = hireMasonForRun(run);
          syncCoins();
          audio.play(res.ok ? 'confirm' : 'lose');
          toast(res.msg, 3600);
          this.showTownHub('moradia');
        },
        lab_start: (el) => {
          if (!selPet) return;
          const res = startLabTransmodification(run, selPet.uid, el.dataset.el as Element);
          syncCoins();
          this.syncFollowerPet();
          audio.play(res.ok ? 'evolve' : 'lose');
          toast(res.msg, 3400);
          this.showTownHub('laboratorio');
        },
        lab_wait: () => {
          const alerts = waitLabHours(run, 2);
          for (const a of alerts) toast(a, 2800);
          audio.play('confirm');
          this.showTownHub('laboratorio');
        },
        lab_rel: (el) => {
          run.eco.labRelation = Math.max(
            -5,
            Math.min(5, run.eco.labRelation + Number(el.dataset.delta))
          );
          toast(`🧬 Relação com o cientista agora é ${run.eco.labRelation}.`);
          this.showTownHub('laboratorio');
        },
        shop_rel: (el) => {
          run.eco.shopRelation = Math.max(
            -5,
            Math.min(5, run.eco.shopRelation + Number(el.dataset.delta))
          );
          toast(`🏪 Relação com o lojista agora é ${run.eco.shopRelation}.`);
          this.showTownHub(tab);
        },
        buy_cat: () => {
          const res = buyLabCatalyst(run, bi);
          syncCoins();
          audio.play(res.ok ? 'chest' : 'lose');
          toast(res.msg, 3000);
          this.showTownHub('laboratorio');
        },
        buy_macabre: () => {
          const res = buyMacabreItem(run);
          syncCoins();
          if (res.ok) this.celebrateItem('🕯️', 'Item Macabro', res.msg);
          else {
            audio.play('lose');
            toast(res.msg);
          }
          this.showTownHub('laboratorio');
        },
        res_pet: (el) => {
          if (!selPet) return;
          const res = resurrectPetAtLab(run, Number(el.dataset.idx), selPet.uid);
          syncCoins();
          if (res.ok && res.zombie) {
            this.syncFollowerPet();
            void playDigivolveAnimation({
              petName: `🧟 ${petStats(res.zombie).name}`,
              speciesId: res.zombie.speciesId,
              level: res.zombie.level,
              targetElement: 'fantasma',
            });
            toast(res.msg, 4200);
          } else {
            audio.play('lose');
            toast(res.msg, 3200);
          }
          this.showTownHub('laboratorio');
        },
        lab_claim: (el) => {
          const res = claimLabPod(run, el.dataset.id as string);
          if (res.ok && res.pet && res.element && res.outcome === 'sucesso') {
            this.syncFollowerPet();
            void playDigivolveAnimation({
              petName: petStats(res.pet).name,
              speciesId: res.pet.speciesId,
              level: res.pet.level,
              targetElement: res.element,
            });
            toast(res.msg, 3200);
          } else if (res.ok) {
            this.syncFollowerPet();
            audio.play(res.outcome === 'morte' ? 'lose' : 'encounter');
            toast(res.msg, 4200);
          } else {
            audio.play('lose');
            toast(res.msg);
          }
          this.showTownHub('laboratorio');
        },
        dep: (el) => {
          const res = depositAtBank(run.economy, bi, Number(el.dataset.amt));
          syncCoins();
          audio.play(res.ok ? 'confirm' : 'lose');
          toast(res.msg);
          this.showTownHub('banco_fin');
        },
        sac: (el) => {
          const res = withdrawFromBank(run.economy, bi, Number(el.dataset.amt));
          syncCoins();
          audio.play(res.ok ? 'confirm' : 'lose');
          toast(res.msg);
          this.showTownHub('banco_fin');
        },
        buy_stk: (el) => {
          const res = buyStock(run.economy, bi, el.dataset.id as string);
          syncCoins();
          audio.play(res.ok ? 'chest' : 'lose');
          toast(res.msg);
          this.showTownHub('banco_fin');
        },
        sell_stk: (el) => {
          const res = sellStock(run.economy, bi, el.dataset.id as string);
          syncCoins();
          audio.play(res.ok ? 'confirm' : 'lose');
          toast(res.msg);
          this.showTownHub('banco_fin');
        },
        cambio: (el) => {
          const res = exchangeCurrency(run.economy, bi, Number(el.dataset.to), 25);
          syncCoins();
          audio.play(res.ok ? 'confirm' : 'lose');
          toast(res.msg);
          this.showTownHub('banco_fin');
        },
        preco: (el) => {
          const id = el.dataset.id as string;
          const delta = Number(el.dataset.delta);
          const cur = run.economy.myShopPrices[id] ?? 26;
          run.economy.myShopPrices[id] = Math.max(8, Math.min(250, cur + delta));
          this.showTownHub('minhaloja');
        },
        estocar: (el) => {
          const res = restockMyShop(run.economy, bi, el.dataset.id as string);
          syncCoins();
          audio.play(res.ok ? 'chest' : 'lose');
          toast(res.msg);
          this.showTownHub('minhaloja');
        },
        vender: (el) => {
          const res = sellFromMyShop(run.economy, bi, el.dataset.id as string);
          syncCoins();
          if (res.ok) this.lastCustomerQuote = res.quote;
          audio.play(res.ok ? 'confirm' : 'lose');
          toast(res.msg, 3400);
          this.showTownHub('minhaloja');
        },
        aceitar: (el) => {
          if (acceptJob(run, el.dataset.id as string)) {
            audio.play('confirm');
            toast('📋 Trabalho aceito!');
          }
          this.showTownHub('trabalhos');
        },
        entregar: (el) => {
          const res = completeJob(run, el.dataset.id as string);
          if (res.ok) {
            if (res.rewardItem) {
              this.celebrateItem(
                res.rewardItem.icon,
                res.rewardItem.name,
                'Recompensa de Trabalho!'
              );
            } else {
              this.celebrateItem('🪙', 'Trabalho Concluído!', res.msg);
            }
          } else {
            audio.play('lose');
            toast(res.msg);
          }
          this.showTownHub('trabalhos');
        },
        selpet: (el) => {
          this.activeShopPetUid = el.dataset.uid as string;
          this.showTownHub(tab);
        },
        comprar: (el) => {
          const item = itemsForShop(tab as ShopId).find((i) => i.id === el.dataset.id);
          if (!item) return;
          const res = buyShopItem(run, item, this.activeShopPetUid ?? undefined);
          if (res.ok && item.teachesCardId) {
            this.save.discoveredCards = [
              ...new Set([...(this.save.discoveredCards ?? this.save.deck), item.teachesCardId]),
            ];
            this.persist();
          }
          if (res.ok) {
            this.celebrateItem(item.icon, item.name, res.msg);
          } else {
            audio.play('lose');
            toast(res.msg);
          }
          this.showTownHub(tab);
        },
        curar: () => {
          const res = healAtHospital(run);
          audio.play(res.ok ? 'heal' : 'lose');
          toast(res.msg);
          this.showTownHub('hospital');
        },
        carinho: () => {
          if (selPet && careForPet(run, selPet.uid, 'carinho')) {
            audio.play('heal');
            toast(`💗 ${petStats(selPet).name} adorou o carinho!`);
            this.showTownHub('cuidar');
          }
        },
        brincar: () => {
          if (selPet && careForPet(run, selPet.uid, 'brincar')) {
            audio.play('confirm');
            toast(`🎾 ${petStats(selPet).name} se divertiu muito brincando!`);
            this.showTownHub('cuidar');
          }
        },
        voltar: () => {
          this.arcade?.dispose();
          this.arcade = null;
          if (this.insideBuilding) {
            this.paused = false;
            this.renderInteriorHud();
          } else {
            this.showWorld();
          }
        },
      },
      { back: 'voltar' }
    );
    if (tab === 'jogos') {
      const mount = this.ui.el.querySelector<HTMLElement>('#arcade-mount');
      if (mount) {
        this.arcade = createArcadeController(run, () => {
          const coinsEl = this.ui.el.querySelector('.town-coins');
          if (coinsEl) {
            coinsEl.innerHTML = `${formatClock(run.clock)} · 🪙 <b>${run.coins}</b> · ✨ Beleza média: ${partyAverageBeauty(run)}`;
          }
        });
        this.arcade.render(mount);
      }
    }
  }

  /** Opens Gravity Rush comic dialogue with the biome's NPC (Friendship / Romance / Rivalry + Beauty bonus!). */
  private async talkToNpc(): Promise<void> {
    const run = this.run;
    if (!run) return;
    this.busy = true;
    const bi = currentBiome(run);
    const npc = npcForBiome(bi);
    const bonds = (this.save.npcBonds ??= {});
    const beautyBonus = beautyRespectBonus(partyAverageBeauty(run));
    const currentBond = (bonds[npc.id] ?? 0) + beautyBonus.bondBonus;
    if (beautyBonus.bondBonus > 0) {
      toast(`✨ ${npc.name} admirou a beleza dos seus pets! (+Carisma)`, 2400);
    }
    const outcome = await openComicDialogue(
      npc,
      currentBond,
      (nextScore) => {
        bonds[npc.id] = nextScore;
        if (nextScore >= 7 && run.stalkerNpcId !== npc.id) {
          run.stalkerNpcId = npc.id;
          toast(
            `👀 ${npc.name} gostou DEMAIS de você e virou STALKER — agora está te seguindo por toda parte!`,
            4200
          );
        }
        this.persist();
      },
      bi,
      {
        playerStatus: playerStatusScore(run),
        gamblingAddicted: run.gambling.addicted,
        npcStatus: run.social.npcStatus[npc.id] ?? 20,
        envy: run.social.npcEnvy[npc.id] ?? 5,
      }
    );
    if (outcome.healedByRomance) {
      healParty(run);
      audio.play('heal');
    }
    this.busy = false;
    if (outcome.action === 'duel') {
      void this.startBattle('treinador', outcome.difficultyDelta + beautyBonus.difficultyDelta);
    } else {
      this.showWorld();
    }
  }

  private addXp(amount: number): void {
    const before = this.level;
    this.save.playerXp += amount;
    if (this.run) this.run.playerLevel = this.level;
    if (this.level > before) toast(t('levelUp', { n: this.level }), 2600);
    this.persist();
  }

  // ---------- battle ----------

  private async startBattle(
    kind: EncounterKind,
    difficultyDelta = 0,
    wildSpawn?: WildSpawn
  ): Promise<void> {
    const run = this.run;
    if (!run) return;
    if (kind !== 'treinador' && kind !== 'selvagem') this.encounterAt = null;
    this.busy = true;
    this.touchDir = null;
    audio.play('encounter');
    document.body.classList.add('flash');
    await wait(450);
    document.body.classList.remove('flash');
    this.encounter = encounterFor(run, kind);
    if (kind === 'selvagem' && wildSpawn) {
      // Battle specifically the visible Legends: Arceus wild Elementa-Mon you approached!
      this.encounter.enemies = [createPet(wildSpawn.speciesId, wildSpawn.level, wildSpawn.element)];
    }
    if (difficultyDelta !== 0) {
      this.encounter.enemyPower = Math.max(0, this.encounter.enemyPower + difficultyDelta);
      if (difficultyDelta < 0 && this.encounter.enemies.length > 1) {
        this.encounter.enemies = this.encounter.enemies.slice(0, -1);
      }
    }
    // Record newly discovered species in the player's journal (secrets!)
    const seen = new Set(this.save.discoveredSpecies ?? this.save.party);
    for (const e of this.encounter.enemies) seen.add(e.speciesId);
    this.save.discoveredSpecies = [...seen];
    this.persist();
    this.battle = battleFromEncounter(run, this.encounter);
    this.selectedCard = null;
    this.caster = alive(this.battle.party)[0]?.uid ?? null;
    this.shown.clear();
    this.summonElement.clear();
    if (kind === 'chefe') this.battleView.setBiome(3);
    else this.battleView.setSky(BIOMES[this.encounter.biome].palette.sky);
    this.battleView.setup([
      ...this.battle.party.map((f) => ({
        uid: f.uid,
        speciesId: f.speciesId,
        level: f.level,
        side: 'player' as const,
        element: f.element,
      })),
      ...this.battle.enemies.map((f) => ({
        uid: f.uid,
        speciesId: f.speciesId,
        level: f.level,
        side: 'enemy' as const,
        element: f.element,
      })),
    ]);
    this.engine.setView(this.battleView);
    this.setScreen('batalha');
    audio.music(kind === 'chefe' ? 'chefe' : 'batalha');
    this.busy = false;
    const names = this.battle.enemies.map((e) => e.name).join(', ');
    this.renderBattle(
      kind === 'selvagem'
        ? t('wildAppeared', { names })
        : kind === 'chefe'
          ? t('bossSent', { names })
          : t('trainerSent', { names })
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
        ((kind === 'inimigo' && f.side === 'enemy') ||
          (kind === 'aliado' && f.side === 'player') ||
          (this.petting !== null && f.affectionMax !== undefined));
      const heart =
        f.affectionMax !== undefined
          ? `<span class="affection" title="${t('affection')}">💗 ${f.affection ?? 0}/${f.affectionMax}</span>${bar(f.affection ?? 0, f.affectionMax, 'afeto')}`
          : '';
      const isCaster = f.uid === this.caster;
      return `<button class="fighter ${f.side} ${ko ? 'ko' : ''} ${targetable ? 'target' : ''} ${isCaster ? 'caster' : ''}"
          data-action="fighter" data-uid="${f.uid}" ${ko || this.busy ? 'disabled' : ''}>
        <span class="fname">${elementIcon(f.element, 16)} ${esc(f.name)} <small>${t('lv', { n: f.level })}</small></span>
        <span class="fstats">${gameIcon('atk', 14)}${f.attack} ${gameIcon('def', 14)}${f.defense}${s.shield ? ` <b class="shield">+${s.shield}</b>` : ''}</span>
        ${bar(s.hp, f.maxHp)}<small class="hpnum">${s.hp}/${f.maxHp}</small>${heart}
        ${isCaster ? `<i class="tag">${t('usesCard')}</i>` : ''}${targetable ? `<i class="tag alvo">${t('target')}</i>` : ''}
      </button>`;
    };
    const mana = MANA_TYPES.map(
      (m) =>
        `<span class="mana-pill" style="--c:${MANA_INFO[m].color}" title="${manaName(m)}">${manaShort(m)} ${b.mana[m]}/${b.maxMana[m]}</span>`
    ).join('');
    const hand = b.hand
      .map((id, i) => {
        const caster = this.caster ? getFighter(b, this.caster) : undefined;
        const ok =
          canAfford(b.mana, getCard(id).cost) &&
          (!caster || canUseCard(caster, id)) &&
          b.phase === 'jogador' &&
          !this.busy;
        return `<button class="hand-card ${i === this.selectedCard ? 'selected' : ''}" data-action="carta" data-index="${i}" ${ok ? '' : 'disabled'}>${abilityCard(id)}</button>`;
      })
      .join('');
    const hint =
      message ||
      (b.phase === 'mana'
        ? t('chooseMana')
        : this.petting
          ? t('choosePetTarget')
          : card
            ? t(kind === 'inimigo' ? 'chooseEnemy' : 'chooseAlly', { card: cardName(card) })
            : t('choosePet'));
    const styles: Record<ManaType, string> = {
      corpo: t('petStyleCorpo'),
      ilusao: t('petStyleIlusao'),
      talento: t('petStyleTalento'),
    };
    const petModal =
      this.petMenu && b.phase === 'jogador' && !this.busy
        ? `<div class="modal"><div class="panel narrow">
            <h2>💗 ${t('petAction')}</h2><p>${t('petHow')}</p>
            <div class="row">${MANA_TYPES.map((m) => `<button data-action="estilo" data-type="${m}" style="--c:${MANA_INFO[m].color}" class="mana-btn pet-style" ${b.mana[m] < 1 ? 'disabled' : ''}>${esc(styles[m])}<br><small>${manaShort(m)} 1</small></button>`).join('')}</div>
            <div class="row"><button data-action="cancelar">${t('back')}</button></div>
          </div></div>`
        : '';
    const manaModal =
      b.phase === 'mana' && !this.busy && !b.winner
        ? `<div class="modal"><div class="panel narrow">
            <h2>${t('round', { n: b.round })}</h2><p>${t('whichMana')}</p>
            <div class="row">${MANA_TYPES.map((m) => `<button data-action="mana" data-type="${m}" style="--c:${MANA_INFO[m].color}" class="mana-btn">${manaName(m)}<br><small>${b.maxMana[m]} → ${Math.min(5, b.maxMana[m] + 1)}</small></button>`).join('')}</div>
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
            <div class="deck-info">🂠 ${b.deck.length} · ${t('discard', { n: b.discard.length })}${b.summons.length ? ` · ✨ ${b.summons.map((s) => `${esc(s.name)} (${s.turnsLeft})`).join(', ')}` : ''}</div>
            <div class="row">
              ${this.encounter?.kind === 'selvagem' ? `<button data-action="carinho" class="pet-btn" ${this.busy || b.phase !== 'jogador' ? 'disabled' : ''}>💗 ${t('petAction')}</button>` : ''}
              ${this.encounter?.kind === 'selvagem' ? `<button data-action="fugir" ${this.busy || b.phase !== 'jogador' ? 'disabled' : ''}>${t('flee')}</button>` : ''}
              <button data-action="fim" class="primary" ${this.busy || b.phase !== 'jogador' ? 'disabled' : ''}>${t('endTurn')}</button>
            </div>
          </div>
          <div class="hand">${hand}</div>
        </div>
        ${manaModal}${petModal}
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
          this.petMenu = false;
          this.petting = null;
          this.renderBattle();
        },
        carinho: () => {
          this.selectedCard = null;
          this.petting = null;
          this.petMenu = true;
          this.renderBattle();
        },
        estilo: (el) => {
          this.petMenu = false;
          this.petting = el.dataset.type as ManaType;
          const wild = alive(b.enemies).filter((f) => f.affectionMax !== undefined);
          if (wild.length === 1) void this.pet(wild[0].uid);
          else this.renderBattle();
        },
      },
      {
        back: 'cancelar',
        focus:
          b.phase === 'mana'
            ? '.mana-btn'
            : this.petMenu
              ? '.pet-style:not([disabled])'
              : this.selectedCard !== null || this.petting
                ? '.fighter.target'
                : '.hand-card:not([disabled])',
      }
    );
  }

  private onCard(index: number): void {
    const b = this.battle;
    if (!b || this.busy) return;
    this.petting = null;
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
    if (this.petting && f.side === 'enemy') {
      void this.pet(uid);
      return;
    }
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
      this.renderBattle(t('willUse', { name: f.name }));
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
    // Unhappy or hallucinating pets may refuse to obey commands in battle!
    const pet = this.run?.party.find((p) => p.uid === this.caster);
    if (pet?.hallucinating && Math.random() < 0.6) {
      this.selectedCard = null;
      audio.play('lose');
      toast(`🌀 ${petStats(pet).name} está alucinando e ignorou seu comando!`);
      return this.renderBattle();
    }
    if (pet && willDisobey(pet.happiness, Math.random())) {
      this.selectedCard = null;
      audio.play('lose');
      toast(`😤 ${petStats(pet).name} está triste e não te obedeceu! Dê carinho a ele!`);
      return this.renderBattle();
    }
    this.snapshot();
    const result = playCard(b, index, this.caster, target);
    this.selectedCard = null;
    if (!result.ok) {
      this.shown.clear();
      toast(result.error ?? t('cantPlay'));
      return this.renderBattle();
    }
    await this.animate(result.events);
  }

  /** Pets a wild monster with the chosen style (the current caster does the petting). */
  private async pet(targetUid: string): Promise<void> {
    const b = this.battle;
    const style = this.petting;
    this.petting = null;
    if (!b || !style) return;
    if (!this.caster || (getFighter(b, this.caster)?.hp ?? 0) <= 0)
      this.caster = alive(b.party)[0]?.uid ?? null;
    if (!this.caster) return;
    this.snapshot();
    const result = petMonster(b, this.caster, targetUid, style);
    if (!result.ok) {
      this.shown.clear();
      toast(result.error ?? t('cantPlay'));
      return this.renderBattle();
    }
    await this.animate(result.events);
  }

  private async onEndTurn(): Promise<void> {
    const b = this.battle;
    if (!b || this.busy) return;
    this.selectedCard = null;
    this.petting = null;
    this.petMenu = false;
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
          if (this.run) {
            const ecoDmg = cardEcoDamage(card.id, card.element);
            if (ecoDmg > 0) {
              const warns = damageBiomeEcology(this.run.eco, currentBiome(this.run), ecoDmg);
              for (const w of warns) toast(w, 3200);
            }
            const casterF = getFighter(b, ev.casterUid);
            const rawEl = card.element !== 'neutro' ? card.element : (casterF?.element ?? 'neutro');
            const usedEl = rawEl === 'radioativo' ? 'neutro' : rawEl;
            const taxMsg = chargeElementalTax(this.run, usedEl);
            if (taxMsg) toast(taxMsg, 2600);
          }
          msg(
            t('usedCard', { name: getFighter(b, ev.casterUid)?.name ?? '', card: cardName(card) })
          );
          await wait(250);
          break;
        }
        case 'turno':
          if (ev.side === 'enemy') msg(t('enemyTurn'));
          await wait(350);
          element = 'enemy';
          break;
        case 'dano': {
          const src = getFighter(b, ev.sourceUid);
          const el =
            this.summonElement.get(ev.sourceUid) ??
            (element === 'enemy' ? src?.element : element) ??
            'neutro';
          if (ev.dice) await this.showDiceClash(ev.dice, ev.amount + ev.absorbed);
          if (src) await this.battleView.attack(ev.sourceUid, ev.targetUid);
          audio.play(ev.amount > 0 ? 'hit' : 'confirm');
          const s = this.shown.get(ev.targetUid);
          if (s) {
            s.shield -= ev.absorbed;
            s.hp = Math.max(0, s.hp - ev.amount);
          }
          const p = at(ev.targetUid);
          floatText(
            ev.amount > 0
              ? `-${ev.amount}${ev.absorbed ? ` (🛡${ev.absorbed})` : ''}`
              : ev.absorbed > 0
                ? `🛡 -${ev.absorbed}`
                : '🛡 0',
            p.x,
            p.y,
            ev.amount > 0 ? 'dano' : 'escudo'
          );
          if (ev.multiplier > 1) floatText(t('superEffective'), p.x, p.y - 24, 'info');
          else if (ev.multiplier < 1) floatText(t('notEffective'), p.x, p.y - 24, 'info');
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
        case 'transformar': {
          const ally = getFighter(b, ev.targetUid);
          const p = at(ev.targetUid);
          audio.play('evolve');
          floatText(`✨ Forma de ${elementLabel(ev.element)}!`, p.x, p.y - 12, 'info');
          if (ally) {
            this.battleView.replace(ally.uid, ally.speciesId, ally.level, ev.element);
            await this.battleView.glow(ally.uid, 0xffb347);
          }
          refresh();
          break;
        }
        case 'comprar':
          toast(t('drew', { n: ev.count }), 1000);
          break;
        case 'invocar': {
          const summon = b.summons.find((s) => s.uid === ev.summonUid);
          this.summonElement.set(ev.summonUid, summon?.element ?? 'neutro');
          this.battleView.addSummon(summon?.element ?? 'neutro');
          msg(t('summonJoined', { name: ev.name }));
          await wait(400);
          break;
        }
        case 'invocacaoSaiu':
          this.battleView.removeSummon();
          msg(t('summonLeft'));
          await wait(250);
          break;
        case 'nocaute':
          msg(t('fainted', { name: getFighter(b, ev.uid)?.name ?? '' }));
          await this.battleView.faint(ev.uid);
          break;
        case 'carinho': {
          audio.play('heal');
          const p = at(ev.targetUid);
          floatText(ev.liked ? t('petLiked') : '+💗', p.x, p.y, 'cura');
          msg(
            t('petted', {
              name: getFighter(b, ev.casterUid)?.name ?? '',
              target: getFighter(b, ev.targetUid)?.name ?? '',
            })
          );
          await this.battleView.glow(ev.targetUid, 0xff8fc8);
          refresh();
          break;
        }
        case 'bravo': {
          const p = at(ev.uid);
          floatText(t('petAngry'), p.x, p.y - 24, 'info');
          break;
        }
        case 'capturado':
          audio.play('evolve');
          msg(t('petJoined', { name: ev.name }));
          toast(t('petJoined', { name: ev.name }), 2600);
          await this.battleView.glow(ev.uid, 0xff8fc8);
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

  /** Shows a snappy Neopets Battledome TCG dice clash (Attack Dice vs Defense Dice). */
  private async showDiceClash(
    dice: {
      attackDice: number[];
      defenseDice: number[];
      attackHits: number;
      defenseBlocks: number;
    },
    rawDamage: number
  ): Promise<void> {
    const fx = document.getElementById('fx');
    if (!fx) return;
    const renderDie = (face: number, kind: 'atk' | 'def') => {
      const cls = face >= 6 ? 'crit' : face >= 3 ? 'hit' : 'miss';
      const icon =
        face >= 6 ? (kind === 'atk' ? '💥' : '✨') : face >= 3 ? (kind === 'atk' ? '⚔' : '🛡') : '·';
      return `<span class="bd-die ${kind} ${cls}"><b>${face}</b><i>${icon}</i></span>`;
    };
    const el = document.createElement('div');
    el.className = 'dice-clash';
    el.innerHTML = `
      <div class="dice-row atk">
        <span class="dice-lbl">⚔ ${dice.attackHits}</span>
        <div class="dice-list">${dice.attackDice.map((d) => renderDie(d, 'atk')).join('')}</div>
      </div>
      <div class="dice-vs">${rawDamage > 0 ? `→ −${rawDamage}` : '🛡 BLOCK!'}</div>
      <div class="dice-row def">
        <span class="dice-lbl">🛡 ${dice.defenseBlocks}</span>
        <div class="dice-list">${dice.defenseDice.length ? dice.defenseDice.map((d) => renderDie(d, 'def')).join('') : '<span class="bd-die miss">—</span>'}</div>
      </div>
    `;
    fx.appendChild(el);
    await wait(620);
    el.classList.add('out');
    await wait(200);
    el.remove();
  }

  private flee(): void {
    const run = this.run;
    const b = this.battle;
    if (!run || !b) return;
    syncAfterBattle(run, b);
    toast(t('fled'));
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
      return this.gameOver(t('allFainted'));
    }
    audio.music('vitoria');
    const reward = winBattle(run, b, enc);
    const deadPets = buryFallenPets(run);
    for (const d of deadPets) toast(`🪦 ${d} morreu em batalha para sempre...`, 3600);
    const earnedCoins = enc.kind === 'chefe' ? 100 : enc.kind === 'treinador' ? 45 : 25;
    run.coins += earnedCoins;
    // Drop battle quest item ("Pena Reluzente") for Estilista Luma's job!
    if (!run.completedJobs.includes('job_luma') && !(run.jobItems['pena_reluzente'] > 0)) {
      grantJobItem(run, 'pena_reluzente');
      this.celebrateItem('🪶', 'Pena Reluzente', 'Item de Trabalho obtido na batalha!');
    }
    this.addXp(reward.xp);
    this.save.stats.battlesWon += 1;
    this.persist();
    if ((enc.kind === 'treinador' || enc.kind === 'selvagem') && this.encounterAt) {
      const idx = this.encounterAt.y * run.map.width + this.encounterAt.x;
      delete run.map.wildSpawns[idx];
      setTile(
        run.map,
        this.encounterAt.x,
        this.encounterAt.y,
        enc.kind === 'treinador' ? 'caminho' : 'grama'
      );
      this.overworld?.removeAt(this.encounterAt.x, this.encounterAt.y);
      this.encounterAt = null;
    }
    if (enc.kind === 'selvagem') {
      for (const enemy of enc.enemies) {
        const killRes = recordWildKillInRun(run, enemy.speciesId);
        if (killRes.msg) toast(killRes.msg, 4200);
      }
    }
    this.battle = null;
    if (enc.kind === 'chefe') {
      this.save.bossesDefeated = (this.save.bossesDefeated ?? 0) + 1;
      if (checkSewerUnlock(run.sewer, this.save.bossesDefeated)) {
        toast(
          '🕳️ MISSÃO SECRETA DESBLOQUEADA! O Esgoto Cyberpunk dos 64 Monstros Falantes foi aberto na Prefeitura!',
          4800
        );
      }
      this.persist();
      return this.victory();
    }
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
    const evoSwaps = reward.leveledUp
      .map((lp) => {
        const pet = run.party.find((p) => p.uid === lp.uid);
        const cur = pet?.element ?? lp.element;
        return `<div class="evo-swap">
          <div class="evo-head">✨ <b>${esc(lp.name)}</b> (Nv ${lp.level}) — Escolha ou troque o elemento:</div>
          <div class="evo-elems">
            ${ELEMENTS.map(
              (el) =>
                `<button class="elem-pill ${cur === el ? 'on' : ''}" data-action="elem" data-uid="${lp.uid}" data-el="${el}">${elementIcon(el, 16)} ${esc(elementLabel(el))}</button>`
            ).join('')}
          </div>
        </div>`;
      })
      .join('');
    this.ui.render(
      `<div class="panel wide reward">
        <h2>${t('victory')}</h2>
        <p>${reward.evolutions.length ? '✨ Seus pets evoluíram!' : t('petsGainedXp')}</p>
        ${reward.evolutions.map((e) => `<p class="evolve">✨ ${esc(e)}</p>`).join('')}
        ${evoSwaps}
        <h3>${choices.length ? t('pickCard') : t('deckFull')}</h3>
        <div class="choices">${choices.map((id) => `<button class="choice" data-action="carta" data-id="${id}">${abilityCard(id)}</button>`).join('')}</div>
        <div class="row"><button data-action="pular">${t('skipCard')}</button></div>
      </div>`,
      {
        elem: (el) => {
          const uid = el.dataset.uid as string;
          const element = el.dataset.el as Element;
          if (changePetElement(run, uid, element)) {
            audio.play('evolve');
            const pet = run.party.find((p) => p.uid === uid);
            toast(
              t('gemApplied', {
                name: pet ? petStats(pet).name : '',
                element: elementLabel(element),
              })
            );
            this.showReward();
          }
        },
        carta: (el) => {
          const id = el.dataset.id as string;
          addCard(run, id);
          this.save.discoveredCards = [
            ...new Set([...(this.save.discoveredCards ?? this.save.deck), id]),
          ];
          this.persist();
          toast(t('cardAdded', { name: cardName(id) }));
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
        <h2>${t('journeyEnd')}</h2>
        <p class="big-text">${esc(reason)}</p>
        <p>${t('runSummaryWorld', { n: run?.visited.length ?? 1, max: BIOMES.length, won: run?.battlesWon ?? 0, xp: run?.xpEarned ?? 0 })}</p>
        <p class="hint">${t('petsReset', { n: this.level })}</p>
        <div class="row">
          <button data-action="menu">${t('menu')}</button>
          <button data-action="denovo" class="primary">${t('retry')}</button>
        </div>
      </div>`,
      { menu: () => this.showTitle(), denovo: () => this.showBuilder() },
      { focus: '.primary' }
    );
    this.run = null;
  }

  private victory(): void {
    const run = this.run;
    const integrity = run ? computeEcologicalIntegrity(run.eco, [...run.party, ...run.bench]) : 100;
    const ending = evaluateEcologicalEnding(integrity);
    if (ending.bonusXp > 0) this.addXp(ending.bonusXp);
    this.save.stats.victories += 1;
    this.persist();
    window.desktop?.unlockAchievement?.('PRIMEIRA_VITORIA');
    this.setScreen('vitoria');
    audio.music('vitoria');
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
        <h2>${ending.icon} ${esc(ending.title)}</h2>
        <p class="big-text"><b>${esc(ending.subtitle)}</b> · 🌍 Integridade Ecológica: <b>${integrity}%</b></p>
        <p>${esc(ending.epilogue)}</p>
        <p class="hint">${t('victorySummary', { won: run?.battlesWon ?? 0, xp: (run?.xpEarned ?? 0) + ending.bonusXp, n: this.level })}</p>
        <div class="row">
          <button data-action="creditos">${t('credits')}</button>
          <button data-action="menu" class="primary">${t('menu')} ▶</button>
        </div>
      </div>`,
      { menu: () => this.showTitle(), creditos: () => this.showCredits() },
      { focus: '.primary' }
    );
    this.run = null;
  }
}
