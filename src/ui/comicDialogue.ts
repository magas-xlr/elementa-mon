import { audio } from '../audio';
import { getLang, LANGS, LANG_NAMES, type Lang } from '../i18n';
import {
  bondDifficultyDelta,
  bondLabel,
  bondTier,
  npcAlignmentTreatment,
  npcGovernmentOpinion,
  POLITICAL_STANCE_LABELS,
  type NpcProfile,
} from '../game/data/npcs';
import { prefeituraForBiome } from '../game/data/governance';
import { esc } from './dom';

export type HeroPortraitMood =
  'neutral' | 'sleepy' | 'laugh' | 'angry' | 'sad' | 'cheer' | 'surprised' | 'thinking' | 'excited';

/** Animated 2D-rigged transparent WebP portraits of the protagonist for Visual Novel dialogues! */
export const HERO_PORTRAITS: Record<HeroPortraitMood, string> = {
  neutral: '/portraits/hero/neutral.webp?v=3',
  sleepy: '/portraits/hero/sleepy.webp?v=3',
  laugh: '/portraits/hero/laugh.webp?v=3',
  angry: '/portraits/hero/angry.webp?v=3',
  sad: '/portraits/hero/sad.webp?v=3',
  cheer: '/portraits/hero/cheer.webp?v=3',
  surprised: '/portraits/hero/surprised.webp?v=3',
  thinking: '/portraits/hero/thinking.webp?v=3',
  excited: '/portraits/hero/excited.webp?v=3',
};

/**
 * Gravity Rush-inspired comic-book dialogue UI:
 * - Tilted bande-dessinée / manga panels with crisp ink borders & halftone paper sheen
 * - Expressive Trails in the Sky / Xenoblade-style painted anime bust portrait
 * - Directional speech bubbles + dramatic onomatopoeia (SFX) callouts
 * - Interactive choices to build Friendship (🤝), Romance (💖), or Rivalry (🔥),
 *   directly affecting whether the duel becomes easier or harder!
 */

const portraitCache = new Map<string, string>();

/** Paints a clean Trails in the Sky / Xenoblade-style anime bust portrait for a comic panel. */
function npcPortrait(npc: NpcProfile, blushing = false): string {
  const key = `${npc.id}:${blushing ? 1 : 0}`;
  const hit = portraitCache.get(key);
  if (hit) return hit;

  const w = 180;
  const h = 180;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Comic halftone / warm sunlit backdrop
  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, '#fff4dc');
  bg.addColorStop(1, npc.accentColor);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Subtle diagonal comic speed-lines
  ctx.strokeStyle = 'rgba(255,255,255,0.28)';
  ctx.lineWidth = 3;
  for (let i = -h; i < w + h; i += 18) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i - 60, h);
    ctx.stroke();
  }

  const cx = w / 2;
  const ink = '#332438';
  ctx.strokeStyle = ink;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Trails in the Sky Bracer cloak & collar
  const outfitHex = `#${npc.outfitColor.toString(16).padStart(6, '0')}`;
  ctx.fillStyle = outfitHex;
  ctx.beginPath();
  ctx.moveTo(cx - 56, h);
  ctx.quadraticCurveTo(cx - 48, 126, cx, 122);
  ctx.quadraticCurveTo(cx + 48, 126, cx + 56, h);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Cream scarf/collar + gold clasp
  ctx.fillStyle = '#fff5dc';
  ctx.beginPath();
  ctx.ellipse(cx, 128, 30, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#f5cd5b';
  ctx.beginPath();
  ctx.arc(cx, 134, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Back hair silhouette
  ctx.fillStyle = npc.hairColor;
  ctx.beginPath();
  ctx.ellipse(cx, 82, 46, 48, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Neck + tapered anime face
  ctx.fillStyle = '#fde4cc';
  ctx.fillRect(cx - 10, 108, 20, 20);
  ctx.beginPath();
  ctx.moveTo(cx - 34, 72);
  ctx.quadraticCurveTo(cx - 34, 112, cx, 118);
  ctx.quadraticCurveTo(cx + 34, 112, cx + 34, 72);
  ctx.quadraticCurveTo(cx + 34, 42, cx, 42);
  ctx.quadraticCurveTo(cx - 34, 42, cx - 34, 72);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Expressive anime eyes (Trails in the Sky style)
  for (const side of [-1, 1]) {
    const ex = cx + side * 15;
    const ey = 84;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(ex, ey, 8.5, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = npc.eyeColor;
    ctx.beginPath();
    ctx.ellipse(ex, ey + 1, 6.2, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#221728';
    ctx.beginPath();
    ctx.ellipse(ex, ey, 3.2, 4.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(ex + side * 2.5, ey - 3.5, 2.5, 0, Math.PI * 2);
    ctx.fill();
    // Upper eyelash arc
    ctx.strokeStyle = ink;
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.arc(ex, ey + 1, 9.5, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();
    // Blush (stronger when flirting/romantic!)
    ctx.fillStyle = blushing ? 'rgba(255, 108, 148, 0.55)' : 'rgba(255, 150, 170, 0.35)';
    ctx.beginPath();
    ctx.ellipse(ex + side * 5, ey + 13, 8, 4, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Warm smile
  ctx.strokeStyle = '#a85a60';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.arc(cx, 101, 7, 0.2, Math.PI - 0.2);
  ctx.stroke();

  // Sweeping anime bangs over forehead
  ctx.fillStyle = npc.hairColor;
  ctx.strokeStyle = ink;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(cx - 38, 68);
  ctx.quadraticCurveTo(cx - 28, 32, cx, 32);
  ctx.quadraticCurveTo(cx + 28, 32, cx + 38, 68);
  ctx.lineTo(cx + 22, 58);
  ctx.lineTo(cx + 10, 72);
  ctx.lineTo(cx, 56);
  ctx.lineTo(cx - 12, 72);
  ctx.lineTo(cx - 24, 58);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  const url = canvas.toDataURL('image/webp', 0.88);
  portraitCache.set(key, url);
  return url;
}

export interface ComicOutcome {
  action: 'duel' | 'leave';
  bondScore: number;
  difficultyDelta: number;
  healedByRomance: boolean;
}

/**
 * Opens an interactive Gravity Rush-style comic-book conversation with an NPC.
 * Players can chat repeatedly to build Friendship or Romance (or provoke a Rivalry),
 * then choose to Duel (with difficulty scaled by bond!) or keep exploring.
 */
export function openComicDialogue(
  npc: NpcProfile,
  initialBond: number,
  onBondChange: (newScore: number) => void,
  biomeIndex = npc.biome,
  socialContext?: {
    playerStatus: number;
    gamblingAddicted: boolean;
    npcStatus: number;
    envy: number;
  }
): Promise<ComicOutcome> {
  return new Promise((resolve) => {
    const pref = prefeituraForBiome(biomeIndex);
    const govOpinion = npcGovernmentOpinion(npc, pref);
    const alignInfo = npcAlignmentTreatment(
      npc,
      socialContext?.playerStatus ?? 0,
      socialContext?.gamblingAddicted ?? false
    );
    let bond = initialBond + alignInfo.bondMod;
    let healedByRomance = false;
    let panelText = alignInfo.refusesFavors
      ? `Hmm... ouvi dizer que você virou Viciado em Apostas. Desculpe, mas prefiro não me envolver com gente assim.`
      : bondTier(bond) === 'namoro'
        ? npc.romanceLine
        : bondTier(bond) === 'amigo'
          ? npc.friendLine
          : npc.politicalTalk === 'obcecado'
            ? `${npc.introPanels[0].text} ${govOpinion.quote}`
            : npc.introPanels[0].text;
    let panelSfx = npc.introPanels[0].sfx ?? '';
    let step = bondTier(bond) === 'estranho' && npc.introPanels.length > 1 ? 0 : 1;
    let blushing = bondTier(bond) === 'namoro';
    let heroMood: HeroPortraitMood = alignInfo.refusesFavors
      ? 'sad'
      : bondTier(bond) === 'namoro'
        ? 'cheer'
        : bondTier(bond) === 'amigo'
          ? 'laugh'
          : 'neutral';

    const overlay = document.createElement('div');
    overlay.className = 'vn-overlay';
    document.body.appendChild(overlay);

    let typeTimer: number | null = null;
    let voiceMuted = false;
    const npcPitch = npc.id === 'breno' || npc.id === 'kael' ? 0.92 : 1.12;

    const clearType = () => {
      if (typeTimer !== null) {
        window.clearInterval(typeTimer);
        typeTimer = null;
      }
    };

    const close = (action: 'duel' | 'leave') => {
      clearType();
      audio.stopSpeech();
      window.removeEventListener('keydown', onKey);
      overlay.remove();
      resolve({
        action,
        bondScore: bond,
        difficultyDelta: bondDifficultyDelta(bond),
        healedByRomance,
      });
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        e.preventDefault();
        close('leave');
      }
    };
    window.addEventListener('keydown', onKey);

    const render = () => {
      clearType();
      const diff = bondDifficultyDelta(bond);
      const diffBadge =
        diff < 0
          ? '🌿 Duelo amistoso (mais fácil)'
          : diff > 0
            ? '🔥 Duelo intenso (mais difícil)'
            : '⚔️ Duelo equilibrado';

      const bodyHtml =
        step === 0
          ? `<div class="vn-actions">
              <button class="primary" data-comic="next">Continuar ▶</button>
              <button data-comic="leave">Sair</button>
            </div>`
          : `<div class="vn-choices">
              ${npc.choices
                .map(
                  (c, idx) =>
                    `<button class="vn-choice" data-choice="${idx}">${esc(c.label)}</button>`
                )
                .join('')}
              <button class="vn-choice" data-politics="1">🏛️ "O que você acha da ${esc(pref.name)}?"</button>
            </div>
            <div class="vn-actions">
              <button class="primary" data-comic="duel">⚔️ Duelar (${diffBadge})</button>
              <button data-comic="leave">◀ Continuar explorando</button>
            </div>`;

      // Shantae / Visual Novel layout: NPC on the left, text box center, borderless Protagonist ALWAYS on the RIGHT!
      overlay.innerHTML = `
        <div class="vn-stage">
          <div class="vn-portrait-side">
            <img src="${npcPortrait(npc, blushing)}" alt="${esc(npc.name)}" />
            ${panelSfx ? `<span class="vn-sfx">${esc(panelSfx)}</span>` : ''}
          </div>
          <div class="vn-box">
            <div class="vn-header">
              <div class="vn-nameplate">${esc(npc.name)}</div>
              <span class="vn-meta">${esc(npc.title)} · ${esc(npc.alignment)} · ${esc(npc.stereotype)} · 💖 ${esc(npc.dere)} · ${POLITICAL_STANCE_LABELS[npc.politics]}</span>
              <span class="bond-badge tier-${bondTier(bond)}">${bondLabel(bond)} (${bond})</span>
              <button class="vn-voice-btn" data-voice="1" title="Dublagem (${getLang().toUpperCase()})">${voiceMuted ? '🔇' : '🔊'}</button>
            </div>
            <p class="vn-sub">${esc(alignInfo.note)}${socialContext ? ` · Status: <b>${socialContext.npcStatus}</b> · Inveja: <b>${socialContext.envy}%</b>` : ''}</p>
            <div class="vn-text" data-skip="1"></div>
            ${bodyHtml}
          </div>
          <div class="vn-hero-side">
            <img src="${HERO_PORTRAITS[heroMood]}" alt="Protagonista" />
          </div>
        </div>
      `;

      // Typewriter streaming text effect — strictly ONE letter at a time, starting immediately with voice!
      const textEl = overlay.querySelector<HTMLElement>('.vn-text');
      const fullText = panelText;
      let cursor = 0;
      if (textEl) {
        textEl.textContent = '';
        typeTimer = window.setInterval(() => {
          cursor += 1;
          if (cursor >= fullText.length) {
            textEl.textContent = fullText;
            clearType();
          } else {
            textEl.textContent = fullText.slice(0, cursor);
          }
        }, 28);
        textEl.addEventListener('click', () => {
          clearType();
          textEl.textContent = fullText;
        });
      }

      // Speak the line in the active game language (all 7 languages supported!)
      if (!voiceMuted) {
        audio.speak(fullText, getLang(), npcPitch);
      }

      overlay.querySelector('[data-voice]')?.addEventListener('click', () => {
        voiceMuted = !voiceMuted;
        if (voiceMuted) audio.stopSpeech();
        else audio.speak(fullText, getLang(), npcPitch);
        const btn = overlay.querySelector('[data-voice]');
        if (btn) btn.textContent = voiceMuted ? '🔇' : '🔊';
      });

      overlay.querySelector('[data-comic="next"]')?.addEventListener('click', () => {
        step = 1;
        panelText = npc.introPanels[1]?.text ?? panelText;
        panelSfx = npc.introPanels[1]?.sfx ?? '';
        render();
      });

      overlay.querySelectorAll<HTMLButtonElement>('[data-choice]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const ch = npc.choices[Number(btn.dataset.choice)];
          if (!ch) return;
          bond = Math.max(-3, Math.min(8, bond + ch.bondDelta));
          onBondChange(bond);
          blushing = ch.bondDelta >= 2 || bondTier(bond) === 'namoro';
          heroMood =
            ch.bondDelta >= 2
              ? 'excited'
              : ch.bondDelta > 0
                ? 'laugh'
                : ch.bondDelta < 0
                  ? 'angry'
                  : 'thinking';
          panelText = ch.reply;
          panelSfx = ch.sfx ?? '';
          if (bondTier(bond) === 'namoro' && !alignInfo.refusesFavors) {
            healedByRomance = true;
            panelText += ` 💖 (${npc.dere}: sua equipe recuperou as energias!)`;
          }
          render();
        });
      });

      overlay.querySelector('[data-politics]')?.addEventListener('click', () => {
        panelText = govOpinion.quote;
        panelSfx =
          npc.politicalTalk === 'obcecado'
            ? 'DEBATE!'
            : npc.politicalTalk === 'evita'
              ? 'SHHH...'
              : 'HM...';
        heroMood = npc.politicalTalk === 'obcecado' ? 'surprised' : 'thinking';
        render();
      });

      overlay.querySelector('[data-comic="duel"]')?.addEventListener('click', () => close('duel'));
      overlay
        .querySelector('[data-comic="leave"]')
        ?.addEventListener('click', () => close('leave'));
    };

    render();
  });
}

const TEST_VN_SCRIPT: Record<
  Lang,
  readonly { mood: HeroPortraitMood; sfx: string; text: string }[]
> = {
  pt: [
    {
      mood: 'sleepy',
      sfx: 'ZzZ...',
      text: 'Uaaaaah... ai, que soninhooo... bom dia, Vila da Brisa... nossa, já tá um calorão hoje!',
    },
    {
      mood: 'surprised',
      sfx: '!!',
      text: 'QUÊÊÊ?! ESPERA AÍ!! O nível da barragem subiu demais e os pets selvagens estão enlouquecendo!!',
    },
    {
      mood: 'thinking',
      sfx: '?',
      text: 'Hummmm... deixa eu pensar bem! Se a prefeitura ignorar o saneamento e a energia limpa, o Antropoceno vai virar tudo de cabeça pra baixo!',
    },
    {
      mood: 'angry',
      sfx: 'GRR!',
      text: 'AH, MAS DE JEITO NENHUM!! Não vou deixar ninguém poluir o nosso prado nem abandonar os pets! Bora cobrar a Prefeitura AGORA MESMO!!',
    },
    {
      mood: 'excited',
      sfx: '✨',
      text: 'EBAAAA!! ISSO AÍ!! Com a minha equipe de Elementa-Mons e boas escolhas, a gente VAI SALVAR ESSE MUNDO!! Vamos nessa!!',
    },
  ],
  en: [
    {
      mood: 'sleepy',
      sfx: 'ZzZ...',
      text: 'Yaaaaawn... ohhh, I am sooo sleepy... good morning, Breeze Village... whoa, it is already super hot today!',
    },
    {
      mood: 'surprised',
      sfx: '!!',
      text: 'WHAAAT?! WAIT A SECOND!! The dam water level shot way up and the wild pets are freaking out!!',
    },
    {
      mood: 'thinking',
      sfx: '?',
      text: 'Hmmmm... let me think carefully! If City Hall ignores sanitation and clean energy, the Anthropocene is going to flip everything upside down!',
    },
    {
      mood: 'angry',
      sfx: 'GRR!',
      text: 'OH, NO WAY!! I am NOT letting anyone pollute our meadow or abandon the pets! We are marching straight to City Hall RIGHT NOW!!',
    },
    {
      mood: 'excited',
      sfx: '✨',
      text: "WOOHOO!! YEAH!! With my Elementa-Mon team and smart choices, we are TOTALLY going to save this world!! Let's go!!",
    },
  ],
  es: [
    {
      mood: 'sleepy',
      sfx: 'ZzZ...',
      text: 'Ayyyy... qué sueñitooo... buenos días, Villa Brisa... vaya, ¡ya hace un calor terrible hoy!',
    },
    {
      mood: 'surprised',
      sfx: '!!',
      text: '¡¿QUÉÉÉ?! ¡¡ESPERA UN SEGUNDO!! ¡El nivel de la represa subió demasiado y las mascotas salvajes están súper alteradas!!',
    },
    {
      mood: 'thinking',
      sfx: '?',
      text: 'Hmmmm... ¡déjame pensar bien! Si el gobierno ignora el saneamiento y la energía limpia, ¡el Antropoceno lo cambiará todo!',
    },
    {
      mood: 'angry',
      sfx: 'GRR!',
      text: '¡¡NI HABLAR!! ¡No dejaré que nadie contamine nuestro prado ni abandone a las mascotas! ¡Vamos al Ayuntamiento AHORA MISMO!!',
    },
    {
      mood: 'excited',
      sfx: '✨',
      text: '¡¡YUPIII!! ¡¡ESO ES!! ¡Con mi equipo de Elementa-Mons y buenas decisiones, VAMOS A SALVAR ESTE MUNDO!! ¡¡Vamos allá!!',
    },
  ],
  fr: [
    {
      mood: 'sleepy',
      sfx: 'ZzZ...',
      text: "Oh là lààà... j'ai tellement sommeiiil... bonjour, Village de la Brise... ouh, il fait déjà super chaud aujourd'hui !",
    },
    {
      mood: 'surprised',
      sfx: '!!',
      text: 'QUOI ?! ATTENDS UNE SECONDE !! Le niveau du barrage a beaucoup trop monté et les familiers sauvages paniquent !!',
    },
    {
      mood: 'thinking',
      sfx: '?',
      text: "Hmmmm... laisse-moi bien réfléchir ! Si la mairie ignore l'assainissement et l'énergie propre, l'Anthropocène va tout bouleverser !",
    },
    {
      mood: 'angry',
      sfx: 'GRR!',
      text: 'AH NON, HORS DE QUESTION !! Personne ne va polluer notre prairie ni abandonner les familiers ! On file à la Mairie TOUT DE SUITE !!',
    },
    {
      mood: 'excited',
      sfx: '✨',
      text: "YOUPI !! GÉNIAL !! Avec mon équipe d'Elementa-Mons et de bons choix, on VA SAUVER CE MONDE !! C'est parti !!",
    },
  ],
  de: [
    {
      mood: 'sleepy',
      sfx: 'ZzZ...',
      text: 'Ojee... ich bin noch sooo müdeee... guten Morgen, Brisendorf... boah, es ist heute schon richtig heiß!',
    },
    {
      mood: 'surprised',
      sfx: '!!',
      text: 'WAAAS?! WARTE MAL!! Der Wasserstand am Staudamm ist viel zu hoch und die wilden Pets drehen völlig durch!!',
    },
    {
      mood: 'thinking',
      sfx: '?',
      text: 'Hmmmm... lass mich mal überlegen! Wenn das Rathaus Abwasser und saubere Energie ignoriert, stellt das Anthropozän alles auf den Kopf!',
    },
    {
      mood: 'angry',
      sfx: 'GRR!',
      text: 'AUF GAR KEINEN FALL!! Niemand darf unsere Wiese verschmutzen oder die Pets im Stich lassen! Ab zum Rathaus, SOFORT!!',
    },
    {
      mood: 'excited',
      sfx: '✨',
      text: "JUHUUU!! JA!! Mit meinem Elementa-Mon-Team und klugen Entscheidungen RETTEN WIR DIESE WELT!! Los geht's!!",
    },
  ],
  ru: [
    {
      mood: 'sleepy',
      sfx: 'ZzZ...',
      text: 'Оййй... как же хочется спааать... доброе утро, Деревня Бриза... ого, сегодня уже такая жара!',
    },
    {
      mood: 'surprised',
      sfx: '!!',
      text: 'ЧТООО?! ПОГОДИ-КА!! Уровень воды в плотине взлетел до предела, и дикие питомцы просто в панике!!',
    },
    {
      mood: 'thinking',
      sfx: '?',
      text: 'Хмммм... дай-ка подумать! Если власти проигнорируют санитарию и чистую энергию, Антропоцен перевернёт здесь всё вверх дном!',
    },
    {
      mood: 'angry',
      sfx: 'GRR!',
      text: 'НУ УЖ НЕТ!! Я никому не позволю загрязнять наш луг и бросать питомцев! Идём в мэрию ПРЯМО СЕЙЧАС!!',
    },
    {
      mood: 'excited',
      sfx: '✨',
      text: 'УРААА!! ДА!! С моей командой Элемента-Монов и верными решениями мы ТОЧНО СПАСЁМ ЭТОТ МИР!! Вперёд!!',
    },
  ],
  zh: [
    {
      mood: 'sleepy',
      sfx: 'ZzZ...',
      text: '唔啊……还是好困呀……早安，微风村……哇，今天怎么已经这么热啦！',
    },
    {
      mood: 'surprised',
      sfx: '!!',
      text: '什——么？！等一下！！水坝的水位涨得太高了，野生宠物们全都吓坏啦！！',
    },
    {
      mood: 'thinking',
      sfx: '?',
      text: '嗯……让我好好想想！如果政府忽视基础卫生和清洁能源，人类世一定会把这里彻底改变的！',
    },
    {
      mood: 'angry',
      sfx: 'GRR!',
      text: '绝对不行！！我绝不让任何人污染我们的草地、抛弃宠物！我们现在就去市政厅讨个说法！！',
    },
    {
      mood: 'excited',
      sfx: '✨',
      text: '太棒啦！！冲呀！！有我的元素萌宠小队和明智的选择，我们一定能拯救这个世界！！出发吧！！',
    },
  ],
};

/**
 * Interactive Visual Novel Test Dialogue showcasing the keyed-out hero expression portraits
 * AND real pre-generated neural voice dubbing in all 7 supported languages!
 */
export function openTestVisualNovelDialogue(initialLang: Lang = getLang()): Promise<void> {
  return new Promise((resolve) => {
    let lang: Lang = initialLang;
    let idx = 0;
    let typeTimer: number | null = null;
    let currentAudio: HTMLAudioElement | null = null;

    const overlay = document.createElement('div');
    overlay.className = 'vn-overlay';
    document.body.appendChild(overlay);

    const stopPlayback = () => {
      if (typeTimer !== null) {
        window.clearInterval(typeTimer);
        typeTimer = null;
      }
      if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
      }
      audio.stopSpeech();
    };

    const close = () => {
      stopPlayback();
      window.removeEventListener('keydown', onKey);
      overlay.remove();
      resolve();
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        e.preventDefault();
        close();
      }
    };
    window.addEventListener('keydown', onKey);

    const playVoice = (l: Lang, lineIndex: number, fallbackText: string) => {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
      }
      audio.stopSpeech();
      // Cache-bust param so updated exaggerated anime MP3s play immediately without browser cache!
      const clip = new Audio(`/voices/test/${l}_${lineIndex}.mp3?v=3`);
      currentAudio = clip;
      void clip.play().catch(() => {
        audio.speak(fallbackText, l, 1.2);
      });
    };

    const bounceTransition = (after: () => void) => {
      const heroEl = overlay.querySelector<HTMLElement>('.vn-hero-side');
      if (!heroEl) {
        after();
        return;
      }
      heroEl.classList.add('vn-leaving');
      window.setTimeout(after, 195);
    };

    const startTypewriter = (textEl: HTMLElement | null, fullText: string) => {
      if (typeTimer !== null) {
        window.clearInterval(typeTimer);
        typeTimer = null;
      }
      if (!textEl) return;
      textEl.textContent = '';
      let cursor = 0;
      // Strictly 1 letter at a time!
      typeTimer = window.setInterval(() => {
        cursor += 1;
        if (cursor >= fullText.length) {
          textEl.textContent = fullText;
          if (typeTimer !== null) {
            window.clearInterval(typeTimer);
            typeTimer = null;
          }
        } else {
          textEl.textContent = fullText.slice(0, cursor);
        }
      }, 28);
    };

    const render = () => {
      stopPlayback();
      const script = TEST_VN_SCRIPT[lang] ?? TEST_VN_SCRIPT.pt;
      const line = script[idx];
      const langButtons = LANGS.map(
        (l) =>
          `<button class="elem-pill ${l === lang ? 'on' : ''}" data-vn-lang="${l}" style="padding:3px 9px;font-size:11px">${l.toUpperCase()} · ${LANG_NAMES[l]}</button>`
      ).join('');

      // Protagonist portrait ALWAYS on the RIGHT, borderless!
      overlay.innerHTML = `
        <div class="vn-stage">
          <div class="vn-box">
            <div class="vn-header">
              <div class="vn-nameplate">Protagonista · ${esc(line.mood.toUpperCase())} (${idx + 1}/${script.length})</div>
              <button class="vn-voice-btn" data-replay="1" title="Ouvir dublagem novamente">🔊 Ouvir Dublagem</button>
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:5px;margin:6px 0 8px">${langButtons}</div>
            <div class="vn-text" data-skip="1"></div>
            <div class="vn-actions">
              <button data-prev="1" ${idx === 0 ? 'disabled' : ''}>◀ Anterior</button>
              <button class="primary" data-next="1">${idx === script.length - 1 ? 'Concluir Teste ✔' : 'Próxima Fala ▶'}</button>
              <button data-close="1">Fechar</button>
            </div>
          </div>
          <div class="vn-hero-side">
            <img src="${HERO_PORTRAITS[line.mood]}" alt="Protagonista (${line.mood})" />
            <span class="vn-sfx">${esc(line.sfx)}</span>
          </div>
        </div>
      `;

      const textEl = overlay.querySelector<HTMLElement>('.vn-text');
      // Immediately start 1-by-1 letter animation AND voice dubbing together!
      startTypewriter(textEl, line.text);
      playVoice(lang, idx, line.text);

      textEl?.addEventListener('click', () => {
        if (typeTimer !== null) {
          window.clearInterval(typeTimer);
          typeTimer = null;
        }
        textEl.textContent = line.text;
      });

      overlay.querySelector('[data-replay]')?.addEventListener('click', () => {
        startTypewriter(textEl, line.text);
        playVoice(lang, idx, line.text);
      });
      overlay.querySelectorAll<HTMLButtonElement>('[data-vn-lang]').forEach((b) => {
        b.addEventListener('click', () => {
          lang = b.dataset.vnLang as Lang;
          render();
        });
      });
      overlay.querySelector('[data-prev]')?.addEventListener('click', () => {
        if (idx > 0) {
          bounceTransition(() => {
            idx -= 1;
            render();
          });
        }
      });
      overlay.querySelector('[data-next]')?.addEventListener('click', () => {
        if (idx < script.length - 1) {
          bounceTransition(() => {
            idx += 1;
            render();
          });
        } else {
          bounceTransition(close);
        }
      });
      overlay
        .querySelector('[data-close]')
        ?.addEventListener('click', () => bounceTransition(close));
    };

    render();
  });
}
