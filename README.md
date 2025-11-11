# 🎮 ElementaMon

<div align="center">

![Angular](https://img.shields.io/badge/Angular-20-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Nx](https://img.shields.io/badge/Nx-Monorepo-143055?style=for-the-badge&logo=nx&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**A next-generation creature collection and deckbuilding roguelike game**

_Inspired by Neopets, Pokemon, and modern roguelike deckbuilders like Slay the Spire_

[Features](#-features) • [Tech Stack](#-tech-stack) • [Architecture](#-architecture) • [Copilot](#-github-copilot-for-elementamon) • [Getting Started](#-getting-started) • [Development](#-development)

</div>

---

## 📖 About

ElementaMon is an ambitious web-based game that combines the beloved creature collection mechanics of Neopets and Pokemon with the strategic depth of deckbuilding roguelikes. Built with Angular 20 and a cutting-edge microfrontend architecture, the game offers:

- **Creature Collection**: Discover, capture, and train elemental creatures with unique abilities
- **Deckbuilding Strategy**: Build powerful decks with cards representing your creatures' abilities
- **Roguelike Adventure**: Procedurally generated dungeons with permanent progression
- **Virtual Pet System**: Care for and bond with your creatures Neopets-style
- **Real-time Battles**: Multiplayer battles using WebSockets
- **Cross-Platform**: Play in browser, desktop (Electron), or mobile (PWA)

### Game Concept

In ElementaMon, players build decks using cards that represent elemental pets. These pets have different abilities based on their elemental types, and players must strategically choose pets and cards to defeat enemies, overcome obstacles, and progress through the game.

Elemental pets are divided into nine types: **Fire**, **Water**, **Electric**, **Earth**, **Ice**, **Poison**, **Psychic**, **Ghost**, and **Fairy** - each with strengths and weaknesses against others. As players progress, new pets, cards, and abilities are unlocked, making each playthrough unique.

## 🚀 Features

### Core Gameplay

- 🎴 **Dynamic Deckbuilding** - Build decks with up to 15 cards: Pet cards (max 3), Ability cards (max 14-15), and Summoning cards (max 1)
- 🐉 **Creature Management** - Train, feed, and evolve your ElementaMons through 3 evolution stages
- ⚔️ **Turn-based Combat** - Strategic battles with party of 3 pets, hand limit of 5 cards, and elemental type advantages
- 🗺️ **Procedural Dungeons** - Explore randomly generated worlds with unique encounters each playthrough
- 🏆 **Progression System** - Level up your player account to unlock new creatures, cards, customization options, and abilities
- 👥 **Multiplayer Mode** - Battle other players in real-time using WebSockets
- 🎭 **Customization System** - Unlock and equip skins for pets, avatars, clothing, and accessories
- 📊 **Three Mana Types** - Manage Close-Combat, Illusion, and Talent mana resources strategically

### Technical Features

- 🔐 **Secure Authentication** - OpenID Connect & OAuth2
- 📊 **Real-time Analytics** - Hotjar, IndeCx tagging, Application Insights
- 🎨 **Rich UI/UX** - Material UI, Tailwind CSS, NG Bootstrap
- 📱 **Responsive Design** - Mobile-first approach with SSR support
- 🧪 **Comprehensive Testing** - TDD with Jasmine, Jest, Playwright
- 📚 **Component Library** - Storybook documentation
- 🔄 **State Management** - NgRx for predictable state updates
- 🚢 **CI/CD Pipeline** - Automated testing and deployment with GitHub Actions

## 🛠 Tech Stack

### Frontend Framework

- **Angular 20** - Latest Angular with signals and standalone components
- **TypeScript 5.0** - Type-safe development
- **RxJS** - Reactive programming patterns
- **NgRx** - State management with Redux pattern

### UI/UX Libraries

- **Material UI** - Component library for Angular
- **Tailwind CSS** - Utility-first CSS framework
- **NG Bootstrap** - Bootstrap components for Angular
- **Sass** - Advanced CSS preprocessing

### Testing & Quality

- **Test-Driven Development (TDD)** - Test-first approach
- **Jasmine** - Unit testing framework
- **Jest** - Fast JavaScript testing
- **Playwright** - End-to-end testing
- **Enzyme/RTL** - Component testing automation
- **Storybook** - Component documentation and visual testing

### Backend & API

- **GraphQL** - Efficient data querying with Apollo Client
- **WebSockets** - Real-time bidirectional communication
- **Angular Universal (SSR)** - Server-side rendering for SEO and performance

### AI Integration

- **Image Generation** - DALL-E 3 / Midjourney / Stable Diffusion for pet sprites and card artwork
- **NPC Chat Generation** - GPT-4 / Claude for dynamic dialogue and storytelling
- **Voice & Dubbing** - ElevenLabs / Azure Speech Services for character voices
- **Content Moderation** - OpenAI Moderation API for user-generated content
- **Procedural Content** - AI-assisted dungeon and encounter generation

### Authentication & Security

- **OpenID Connect** - Modern authentication protocol
- **OAuth2** - Secure authorization framework

### Cloud Infrastructure

#### Azure Services

- **Azure Key Vault** - Secrets and credential management
- **Application Insights** - Performance monitoring and analytics
- **Blob Storage** - Asset and file storage

#### AWS Services

- **Amazon EKS** - Kubernetes container orchestration
- **Amazon EC2** - Virtual server instances
- **Amazon S3** - Object storage
- **Amazon EMR** - Big data processing
- **Amazon SQS** - Message queue service

### Backend Services

- **Node.js** - Backend server for game logic and data management
- **Firebase/Supabase** - Backend-as-a-Service for real-time features
  - Authentication (integrated with OpenID/OAuth2)
  - Real-time database (player data, pet collections, progression)
  - Cloud functions (serverless game logic)
  - File storage (card images, pet sprites, user avatars)

### AI Services & APIs

- **OpenAI GPT-4** - Dynamic NPC dialogue, story generation, quest creation
- **DALL-E 3** - Custom pet sprite generation, card artwork
- **Stable Diffusion** - Alternative image generation with local deployment
- **Midjourney API** - High-quality artistic assets
- **ElevenLabs** - Text-to-speech for character voices and narration
- **Azure Speech Services** - Voice synthesis and speech recognition
- **OpenAI Whisper** - Speech-to-text for voice commands
- **Claude (Anthropic)** - Alternative LLM for dialogue and content generation
- **Replicate** - Cloud-based AI model hosting and inference

### DevOps & Tooling

- **Nx Monorepo** - Intelligent build system and monorepo management
- **GitHub Actions** - CI/CD automation
- **Electron** - Desktop application wrapper
- **Docker** - Containerization
- **Kubernetes** - Container orchestration (EKS)

### Analytics & Monitoring

- **Hotjar** - User behavior analytics and heatmaps
- **IndeCx** - Custom tagging and tracking
- **Application Insights** - Performance monitoring
- **Change Detection** - Angular performance optimization

### Code Quality

- **Clean Code Principles** - Maintainable and readable codebase
- **ESLint** - Code linting and standards
- **Prettier** - Code formatting
- **Husky** - Git hooks for quality gates

## � Game Design

### Gameplay Mechanics

#### Deck Building

- **Starting Deck**: Players begin with a basic deck and collect new cards to improve it
- **Card Types**:
  - **Pet Cards** (Brown/Orange/Pink): Represent creatures - max 3 per deck
  - **Ability Cards** (Purple): Special skills and attacks - max 14-15 per deck
  - **Summoning Cards** (Gray): Powerful invocations - max 1 per deck
- **Deck Limit**: Maximum of 15 cards per deck
- **Card Colors**:
  - Brown: Base pet (Level 1)
  - Orange: Evolved pet (Level 2)
  - Pink: Final evolution (Level 3)
  - Gray: Summoning cards
  - Purple: Ability cards

#### Combat System

**Battle Setup**

- **Party Size**: 3 pets per battle
- **Starting Stats**: Each pet starts at Level 1 with 10 HP per run
- **Hand Management**: Draw cards until you have 5 in hand
- **Mana System**: 3 types of mana resources
  - Close-Combat Mana
  - Illusion Mana
  - Talent Mana
  - Gain 1 mana point per turn

**Combat Layout** (using NgRx for state management)

- **Bottom**: Available cards in hand
- **Left Side**: Your pet party with HP, Level, Attack, and Defense stats
- **Right Side**: Enemy pets and their stats
- **Top**: Detailed pet status bars with real-time updates via WebSockets

**Evolution System**

- **Level 1**: Starting form (10 HP base)
- **Level 2**: First evolution unlocked
- **Level 3**: Final evolution (maximum power)

#### Elemental Type System

Nine elemental types with complex interactions stored in GraphQL backend:

| Element     | Strong Against | Weak Against   |
| ----------- | -------------- | -------------- |
| 🔥 Fire     | Fairy, Ghost   | Water, Ice     |
| 💧 Water    | Fire           | Electric, Ice  |
| ⚡ Electric | Water          | Earth          |
| 🌍 Earth    | Electric       | Ice, Water     |
| 🧊 Ice      | Earth, Ghost   | Fire           |
| ☠️ Poison   | Fairy          | Earth          |
| 🔮 Psychic  | Ghost          | Ghost          |
| 👻 Ghost    | Psychic        | Ghost, Psychic |
| 🧚 Fairy    | Poison         | Fire           |

### Elemental Damage Table (Percentage-Based)

Damage calculations managed by game engine microservice:

| Type         | Fire | Water | Electric | Earth | Ice  | Poison | Psychic | Ghost | Fairy |
| ------------ | ---- | ----- | -------- | ----- | ---- | ------ | ------- | ----- | ----- |
| **Fire**     | 100% | 30%   | 70%      | 50%   | 40%  | 60%    | 80%     | 90%   | 110%  |
| **Water**    | 150% | 100%  | 50%      | 60%   | 130% | 80%    | 70%     | 80%   | 120%  |
| **Electric** | 130% | 150%  | 100%     | 60%   | 90%  | 80%    | 75%     | 80%   | 100%  |
| **Earth**    | 120% | 110%  | 90%      | 100%  | 80%  | 70%    | 100%    | 100%  | 90%   |
| **Ice**      | 130% | 70%   | 100%     | 130%  | 100% | 100%   | 100%    | 80%   | 70%   |
| **Poison**   | 70%  | 90%   | 90%      | 100%  | 100% | 100%   | 85%     | 80%   | 140%  |
| **Psychic**  | 80%  | 90%   | 80%      | 100%  | 90%  | 85%    | 100%    | 120%  | 80%   |
| **Ghost**    | 110% | 110%  | 100%     | 100%  | 120% | 90%    | 70%     | 100%  | 100%  |
| **Fairy**    | 100% | 130%  | 100%     | 100%  | 130% | 60%    | 120%    | 100%  | 100%  |

**Percentage Explanation**:

- **100%**: Neutral damage
- **Above 100%**: Increased damage (e.g., 150% = 50% bonus damage)
- **Below 100%**: Reduced damage (e.g., 70% = 30% damage reduction)

### Pet Data Structure (TypeScript Interface with GraphQL)

```typescript
interface ElementaMon {
  id: string;
  name: string;
  type: ElementalType;
  level: number;
  hp: number;
  attack: number;
  defense: number;
  elementalSkills: Skill[];
  weaknesses: ElementalType[];
  strengths: ElementalType[];
  rarity: Rarity;
  currentSkin?: string;
  unlockedSkins?: string[];
}

interface Skill {
  id: string;
  name: string;
  type: ElementalType;
  damage?: number;
  effect: string;
  manaCost: ManaCost;
}

interface ManaCost {
  closeCombat: number;
  illusion: number;
  talent: number;
}

type ElementalType =
  | 'Fire'
  | 'Water'
  | 'Electric'
  | 'Earth'
  | 'Ice'
  | 'Poison'
  | 'Psychic'
  | 'Ghost'
  | 'Fairy';

type Rarity = 'Common' | 'Rare' | 'Epic' | 'Legendary';
```

**Example Pet (JSON)**:

```json
{
  "id": "fire-lizard-001",
  "name": "Flaming Gecko",
  "type": "Fire",
  "level": 5,
  "hp": 100,
  "attack": 50,
  "defense": 30,
  "elementalSkills": [
    {
      "id": "skill-001",
      "name": "Raging Spit",
      "type": "Fire",
      "damage": 40,
      "effect": "Deals massive damage and has a chance to burn the enemy",
      "manaCost": {
        "closeCombat": 2,
        "illusion": 0,
        "talent": 1
      }
    },
    {
      "id": "skill-002",
      "name": "Dragon Scales",
      "type": "Fire",
      "effect": "Increases defense against water attacks",
      "manaCost": {
        "closeCombat": 0,
        "illusion": 1,
        "talent": 1
      }
    }
  ],
  "weaknesses": ["Water", "Ice"],
  "strengths": ["Fairy", "Ghost"],
  "rarity": "Epic",
  "currentSkin": "volcanic-armor",
  "unlockedSkins": ["default", "volcanic-armor"]
}
```

### Card Design Specifications

#### Pet Card Layout (Material UI + Tailwind CSS)

**Top Section**:

- Left: Attack value
- Center: Pet name
- Right: Defense value
- Below Attack: Strong element icon
- Below Defense: Weak element icon

**Center Section**:

- Pet artwork/sprite
- Element type badge at bottom center

**Bottom Section**:

- Lore description box
- Rarity indicator and minimum player level requirement
- Footer: Mana cost icons (Close-Combat, Illusion, Talent)

### Game Screens (Angular Components)

Built with **Angular Universal (SSR)** for optimal performance and SEO:

1. **Home Screen** - Entry point with options to start game, view settings, tutorials
2. **First Time Tutorial** - Interactive walkthrough using Storybook-documented components
3. **Deck Builder** - Drag-and-drop interface with real-time validation (Material UI)
4. **Combat Screen** - Turn-based battle UI with WebSocket real-time updates
5. **Procedural Map** - Visual progress tracker with branching paths
6. **Inventory/Rewards** - Collection management with filters and search (NgRx state)
7. **Customization** - Skin and cosmetic shop with preview (Tailwind animations)
8. **Player Status** - Dashboard with stats, achievements, and analytics (Application Insights)
9. **Settings** - Audio, video, accessibility, and control configuration
10. **Game Over** - Results screen with retry or return options
11. **Credits** - Development team and acknowledgments

### Player Progression System

**Account Leveling** (stored in Firebase/Supabase):

- Experience gained through battles and achievements
- Unlock new cards at specific level thresholds
- Avatar customization: clothing, accessories, skins
- Persistent progression across runs

**Run-Based Progression** (NgRx ephemeral state):

- Temporary power-ups and relics
- Deck improvements during current run
- Reset on game over with some persistent rewards

### Roguelike Elements

- **Procedural Generation**: Each run features unique maps, encounters, and enemy compositions
- **Permadeath**: Losing means starting over, but player level and unlocks persist
- **Random Rewards**: Card drops, relics, and pet encounters vary each playthrough
- **Branching Paths**: Choose your route through generated dungeons
- **Replayability**: Different strategies and deck compositions to explore

## �🏗 Architecture

### Microfrontend Structure

```
elementa-mon/
├── apps/
│   ├── shell/                    # Module Federation host
│   ├── home/                     # Home, settings, credits, tutorials (OpenID/OAuth2)
│   ├── deck/                     # Deck builder with card validation (NgRx + Material UI)
│   ├── battle/                   # Turn-based combat (WebSockets + Change Detection)
│   ├── map/                      # Procedural map display (Canvas/SVG rendering)
│   ├── inventory/                # Rewards, relics, pet evolution (Virtual scrolling)
│   ├── avatar/                   # Customization shop (Sass animations + Tailwind)
│   └── game-over/                # Statistics and achievements (Application Insights)
├── services/                     # Node.js Microservices
│   ├── auth/                     # Authentication & users (OpenID/OAuth2 + JWT)
│   ├── cards/                    # Deck & pet management (GraphQL + MongoDB)
│   ├── fight/                    # Combat mechanics (WebSockets + Redis caching)
│   ├── world/                    # Procedural generation (algorithms + RNG)
│   ├── character/                # Progression & stats (PostgreSQL)
│   ├── economy/                  # Rewards & shop (PostgreSQL transactions)
│   ├── skins/                    # Customization storage (Azure Blob + AWS S3)
│   └── ai/                       # AI Services integration (GPT-4, DALL-E, ElevenLabs)
├── libs/
│   ├── shared/
│   │   ├── ui-components/        # Reusable UI components (Storybook documented)
│   │   ├── data-access/          # API services and GraphQL (Apollo Client)
│   │   ├── state/                # NgRx stores and effects
│   │   ├── utils/                # Helper functions and damage calculators
│   │   └── models/               # TypeScript interfaces (ElementaMon, Card, Skill)
│   ├── game-engine/
│   │   ├── combat-logic/         # Battle calculation engine (damage table)
│   │   ├── card-engine/          # Deck and card mechanics (15 card limit)
│   │   ├── creature-ai/          # NPC behavior and enemy AI
│   │   ├── procedural-gen/       # Dungeon and encounter generation
│   │   ├── mana-system/          # Three mana types management
│   │   └── evolution-system/     # Pet evolution logic (3 stages)
│   └── features/
│       ├── authentication/       # Auth logic (OpenID/OAuth2)
│       ├── real-time/            # WebSocket management (battle sync)
│       ├── analytics/            # Tracking (Hotjar, IndeCx, App Insights)
│       ├── storage/              # Cloud storage (Azure Blob, AWS S3)
│       ├── customization/        # Pet skins and avatar items
│       └── progression/          # Player leveling and unlocks
└── tools/
    ├── generators/               # Custom Nx generators
    └── scripts/                  # Build and deployment scripts
```

### Module Federation

The project uses **Webpack Module Federation** for true runtime microfrontend composition:

- **Shell App**: Main container that loads and orchestrates microfrontends
- **Remote Modules**: Each game feature is independently deployable
- **Shared Dependencies**: Optimized bundle sharing to reduce load times
- **Version Management**: Independent versioning per microfrontend

## 📦 Detailed Module Specifications

### Microfrontends (Angular 20)

#### **Home** (`apps/home`)

Responsible for displaying the home screen, tutorials, and managing game settings.

**Components:**

- Home screen with start game, continue, and tutorial options
- Settings panel (audio, video, controls, accessibility)
- Credits screen
- Interactive first-time tutorial walkthrough

**Backend Communication:**

- Player authentication via `auth` service
- Load user preferences from `auth` service

**Technologies:** Material UI, Angular Universal (SSR), Storybook documentation

---

#### **Deck** (`apps/deck`)

Enables deck building and customization with real-time validation.

**Components:**

- Card selection with drag-and-drop interface
- Pet and ability management
- Deck validation (max 15 cards: 3 pets, 14-15 abilities, 1 summoning)
- Filter by element, rarity, and mana cost

**Backend Communication:**

- Fetch available pets via `cards` service
- Retrieve unlocked abilities and customizations from `cards` service
- Save deck configurations to `cards` service

**Technologies:** NgRx state management, Material UI drag-and-drop, Tailwind CSS, TDD validation

---

#### **Battle** (`apps/battle`)

Manages turn-based combat with real-time synchronization.

**Components:**

- Pet display (player party left, enemies right)
- Current deck cards (5 in hand)
- Game status: HP, mana pools (Close-Combat, Illusion, Talent), level, attack, defense
- Combat log and visual effects

**Backend Communication:**

- Combat logic and damage calculations via `fight` service
- Real-time battle updates through WebSockets to `fight` service
- Status synchronization with `fight` service

**Technologies:** WebSockets (Socket.io), NgRx, OnPush Change Detection, Angular animations

📄 **Detailed UI Specification:** See [BATTLE_UI_SPEC.md](BATTLE_UI_SPEC.md) for complete battle screen design, user stories, technical implementation, and testing strategy.

---

#### **Map** (`apps/map`)

Displays player progress and available paths through procedurally generated dungeons.

**Components:**

- Interactive procedural map
- Path and encounter selection
- Progress visualization
- Challenge previews

**Backend Communication:**

- Procedural map generation from `world` service
- Encounter data from `world` service

**Technologies:** Canvas/SVG rendering, RxJS reactive updates, Tailwind CSS

---

#### **Inventory** (`apps/inventory`)

Shows acquired items and allows management of relics and pets.

**Components:**

- Inventory display with filters
- Relic and pet management
- Evolution interface
- Reward history

**Backend Communication:**

- Update items via `economy` service
- Pet evolution requests to `cards` service
- Inventory sync with `cards` and `economy` services

**Technologies:** Material UI tables, virtual scrolling, NgRx, Tailwind grid

---

#### **Avatar** (`apps/avatar`)

Offers customization of skins, clothing, and accessories.

**Components:**

- Avatar editor with live preview
- Skin management for pets
- Cosmetics shop
- Unlockables display

**Backend Communication:**

- Store customizations in `skins` service
- Fetch available cosmetics from `skins` service
- Process purchases through `economy` service

**Technologies:** Sass animations, Material UI, Tailwind, preview rendering

---

#### **Game Over** (`apps/game-over`)

Displays player statistics and allows game restart.

**Components:**

- General statistics dashboard
- Run summary and achievements
- Leaderboard display
- Restart and menu options

**Backend Communication:**

- Send statistics to `character` service
- Update progression in `character` service
- Record achievements

**Technologies:** Chart.js, Application Insights, Material UI, Hotjar tracking

---

### Microservices (Node.js)

#### **Auth** (`services/auth`)

Manages authentication, user creation, and preferences.

**Functionalities:**

- User registration and login/logout
- OpenID Connect & OAuth2 integration
- Session management with JWT tokens
- Progress synchronization across devices
- User preference storage

**Technologies:** Express.js, Passport.js, Firebase/Supabase Auth, JWT

**Database:** MongoDB/PostgreSQL (users, sessions, preferences)

---

#### **Cards** (`services/cards`)

Handles deck creation, customization, and pet storage.

**Functionalities:**

- Deck CRUD operations with validation
- Pet collection management
- Card unlock system
- Pet evolution (3 stages)
- Ability and skill management

**Technologies:** Express.js, GraphQL (Apollo Server), MongoDB/PostgreSQL

**Database:** Decks, pets, card inventory, evolution history

---

#### **Fight** (`services/fight`)

Calculates interactions between cards, abilities, and elemental types.

**Functionalities:**

- Turn-based combat logic
- Elemental damage table application (percentage-based)
- Mana system management (3 types)
- Status effect processing
- Real-time battle updates via WebSockets
- Combat status synchronization

**Technologies:** Express.js, Socket.io (WebSockets), Redis (battle state caching)

**Database:** Active battles, combat logs

---

#### **World** (`services/world`)

Responsible for creating maps, challenges, and random rewards.

**Functionalities:**

- Procedural map generation with enemies and events
- Encounter difficulty scaling
- Reward definition (cards, relics, currency)
- Branching path creation
- Random event generation

**Technologies:** Express.js, Procedural generation algorithms, RNG libraries

**Database:** Map templates, encounter definitions

---

#### **Character** (`services/character`)

Stores player progress and statistics.

**Functionalities:**

- Player level and experience tracking
- Achievement recording
- Unlock management (cards, cosmetics)
- Run history storage
- Leaderboard data

**Technologies:** Express.js, PostgreSQL/MongoDB

**Database:** Player stats, achievements, unlocks, run history

---

#### **Economy** (`services/economy`)

Manages rewards (cards, relics, in-game currency).

**Functionalities:**

- Reward distribution after combats
- Currency transactions
- Virtual shop (cosmetics, card packs)
- Transaction logging
- Item pricing and balancing

**Technologies:** Express.js, PostgreSQL (ACID transactions)

**Database:** Currencies, transactions, shop inventory, pricing

---

#### **Skins** (`services/skins`)

Manages player customization options.

**Functionalities:**

- Avatar storage and retrieval
- Pet skin management
- Unlocked cosmetics tracking
- Preview image generation

**Technologies:** Express.js, Azure Blob Storage, AWS S3

**Database:** Skins catalog, unlock status, equipped items

---

#### **AI** (`services/ai`)

**AI Integration & Content Generation**

Centralized AI service for dynamic content generation, NPC interactions, and creative assets.

**Functionalities:**

- **NPC Dialogue Generation**: Dynamic conversations using GPT-4/Claude
- **Pet Sprite Creation**: Generate custom pet artwork with DALL-E 3/Stable Diffusion
- **Voice Synthesis**: Character voices and narration with ElevenLabs/Azure Speech
- **Quest Generation**: AI-assisted quest and story creation
- **Content Moderation**: User-generated content filtering
- **Speech-to-Text**: Voice command recognition with Whisper
- **Game Balancing**: AI-assisted difficulty adjustment

**AI Providers:**

- **OpenAI GPT-4**: Dialogue, storytelling, quest design
- **DALL-E 3**: High-quality image generation
- **Stable Diffusion**: Open-source image generation
- **Midjourney**: Artistic asset creation
- **ElevenLabs**: Premium voice synthesis (29 languages)
- **Azure Speech Services**: Text-to-speech, speech-to-text
- **OpenAI Whisper**: Accurate speech recognition
- **Claude (Anthropic)**: Alternative LLM for content
- **Replicate**: Cloud-based AI model hosting

**Technologies:** Express.js, OpenAI SDK, Replicate API, ElevenLabs SDK, Azure Cognitive Services, Redis (caching)

**Database:** Generated content cache, AI request logs, moderation history, voice library

**API Endpoints:**

```typescript
// NPC Dialogue
POST   /ai/dialogue/generate          // Generate dynamic NPC conversation
GET    /ai/dialogue/npc/:npcId        // Get cached NPC dialogue
POST   /ai/dialogue/branch            // Generate dialogue tree branches

// Image Generation
POST   /ai/image/generate-pet         // Create custom pet sprite
POST   /ai/image/generate-card        // Generate card artwork
POST   /ai/image/generate-background  // Create battle backgrounds
GET    /ai/image/status/:jobId        // Check generation status
POST   /ai/image/upscale              // Enhance image quality

// Voice & Audio
POST   /ai/voice/synthesize           // Text-to-speech conversion
POST   /ai/voice/transcribe           // Speech-to-text
GET    /ai/voice/character/:id        // Get character voice library
POST   /ai/voice/clone                // Clone voice from sample
POST   /ai/voice/sound-effects        // Generate game sound effects

// Content Generation
POST   /ai/content/quest              // Generate quest objectives
POST   /ai/content/story              // Create narrative content
POST   /ai/content/dialogue-tree      // Build conversation trees
POST   /ai/content/pet-lore           // Generate pet backstories
POST   /ai/content/item-description   // Create item flavor text

// Moderation
POST   /ai/moderate/text              // Filter inappropriate text
POST   /ai/moderate/image             // Scan images for violations
POST   /ai/moderate/username          // Validate usernames

// Analytics & Learning
POST   /ai/analyze/player-behavior    // Analyze gameplay patterns
POST   /ai/recommend/pets             // Suggest pets for player
POST   /ai/balance/difficulty         // Adjust game difficulty
```

**Implementation Example - NPC Dialogue:**

```typescript
import { OpenAI } from 'openai';

@Injectable()
export class NPCDialogueService {
  private openai: OpenAI;

  async generateDialogue(npcId: string, context: GameContext): Promise<NPCDialogue> {
    const npc = await this.getNPCProfile(npcId);

    // Check cache first (reduce API costs)
    const cacheKey = `dialogue:${npcId}:${context.sceneId}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const prompt = `
      Character: ${npc.name} (${npc.role})
      Personality: ${npc.personality}
      Location: ${context.location}
      Player Level: ${context.playerLevel}
      Current Quest: ${context.currentQuest || 'None'}
      
      Generate a short, engaging dialogue (2-3 sentences) 
      that fits this character and situation.
    `;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are a creative game dialogue writer for ElementaMon.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 150,
    });

    const dialogue: NPCDialogue = {
      npcId,
      text: response.choices[0].message.content,
      voiceId: npc.voiceId,
      emotion: this.detectEmotion(response.choices[0].message.content),
      generatedAt: new Date(),
    };

    // Cache for 1 hour
    await this.redis.setex(cacheKey, 3600, JSON.stringify(dialogue));

    // Track usage for cost management
    await this.trackAIUsage({
      service: 'openai',
      operation: 'dialogue-generation',
      tokensUsed: response.usage.total_tokens,
      estimatedCost: this.calculateCost(response.usage.total_tokens),
    });

    return dialogue;
  }
}
```

**Implementation Example - Pet Sprite Generation:**

```typescript
import { OpenAI } from 'openai';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class ImageGenerationService {
  async generatePetSprite(
    description: string,
    elementType: ElementalType
  ): Promise<GeneratedPetImage> {
    const prompt = `
      A cute elemental creature for a Pokemon-style game.
      Element: ${elementType}
      Description: ${description}
      Style: Vibrant colors, friendly appearance, transparent background.
      Quality: High detail, suitable for game sprite sheet.
      View: Front-facing, standing pose.
    `;

    // Generate image with DALL-E 3
    const response = await this.openai.images.generate({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: '1024x1024',
      quality: 'hd',
      style: 'vivid',
    });

    // Download generated image
    const imageBuffer = await this.downloadImage(response.data[0].url);

    // Upload to AWS S3
    const s3Key = `pets/${elementType}/${Date.now()}.png`;
    await this.s3.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: s3Key,
        Body: imageBuffer,
        ContentType: 'image/png',
        CacheControl: 'max-age=31536000',
      })
    );

    const cdnUrl = `${process.env.CDN_URL}/${s3Key}`;

    return {
      url: cdnUrl,
      elementType,
      prompt,
      s3Key,
      generatedAt: new Date(),
      dimensions: { width: 1024, height: 1024 },
    };
  }
}
```

**Implementation Example - Voice Synthesis:**

```typescript
import { ElevenLabsClient } from 'elevenlabs';

@Injectable()
export class VoiceSynthesisService {
  private elevenlabs: ElevenLabsClient;

  async synthesizeCharacterVoice(text: string, characterId: string): Promise<AudioResult> {
    const character = await this.getCharacter(characterId);

    // Check audio cache
    const cacheKey = `voice:${characterId}:${this.hashText(text)}`;
    const cached = await this.getCachedAudio(cacheKey);
    if (cached) return cached;

    // Generate voice with ElevenLabs
    const audio = await this.elevenlabs.textToSpeech.convert({
      voice_id: character.voiceId,
      text: text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: character.voiceStyle || 0.5,
        use_speaker_boost: true,
      },
    });

    // Upload to Azure Blob Storage
    const audioUrl = await this.uploadAudioToBlob(audio, `voices/${characterId}/${Date.now()}.mp3`);

    const result: AudioResult = {
      url: audioUrl,
      characterId,
      text,
      duration: await this.calculateAudioDuration(audio),
      format: 'mp3',
      generatedAt: new Date(),
    };

    // Cache for 7 days
    await this.cacheAudio(cacheKey, result, 604800);

    return result;
  }

  // Alternative: Azure Speech Services for cost-effective TTS
  async synthesizeWithAzure(
    text: string,
    voiceName: string = 'en-US-JennyNeural'
  ): Promise<AudioResult> {
    const speechConfig = sdk.SpeechConfig.fromSubscription(
      process.env.AZURE_SPEECH_KEY,
      process.env.AZURE_SPEECH_REGION
    );

    speechConfig.speechSynthesisVoiceName = voiceName;

    const synthesizer = new sdk.SpeechSynthesizer(speechConfig);

    return new Promise((resolve, reject) => {
      synthesizer.speakTextAsync(text, (result) => {
        if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
          resolve({
            audioData: result.audioData,
            duration: result.audioDuration,
          });
        } else {
          reject(result.errorDetails);
        }
      });
    });
  }
}
```

**Content Moderation:**

```typescript
@Injectable()
export class ContentModerationService {
  async moderateText(content: string): Promise<ModerationResult> {
    const moderation = await this.openai.moderations.create({
      input: content,
    });

    const result = moderation.results[0];

    // Log moderation for audit
    await this.logModeration({
      content,
      flagged: result.flagged,
      categories: result.categories,
      timestamp: new Date(),
    });

    return {
      allowed: !result.flagged,
      flagged: result.flagged,
      categories: result.categories,
      scores: result.category_scores,
      action: result.flagged ? 'block' : 'allow',
      reason: this.getModerationReason(result),
    };
  }
}
```

**Cost Management & Monitoring:**

```typescript
interface AIUsageMetrics {
  service: 'openai' | 'elevenlabs' | 'azure' | 'replicate';
  operation: string;
  tokensUsed?: number;
  imagesGenerated?: number;
  audioMinutes?: number;
  estimatedCost: number;
  userId?: string;
  timestamp: Date;
}

@Injectable()
export class AICostTrackerService {
  async trackUsage(metrics: AIUsageMetrics): Promise<void> {
    // Store metrics
    await this.metricsRepo.save(metrics);

    // Check budget limits
    const dailyTotal = await this.getDailyAICost();

    if (dailyTotal > process.env.AI_DAILY_BUDGET) {
      await this.alertService.notify({
        type: 'budget_exceeded',
        message: `AI daily budget exceeded: $${dailyTotal}`,
        severity: 'high',
      });

      // Optionally throttle AI requests
      await this.enableRateLimiting();
    }

    // Send metrics to Application Insights
    this.telemetry.trackMetric({
      name: 'ai_cost',
      value: metrics.estimatedCost,
      properties: {
        service: metrics.service,
        operation: metrics.operation,
      },
    });
  }

  async getDailyAICost(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const metrics = await this.metricsRepo.find({
      where: { timestamp: { $gte: today } },
    });

    return metrics.reduce((sum, m) => sum + m.estimatedCost, 0);
  }
}
```

**Caching Strategy:**

```typescript
@Injectable()
export class AICacheService {
  async getOrGenerate<T>(
    cacheKey: string,
    generateFn: () => Promise<T>,
    ttl: number = 3600
  ): Promise<T> {
    // Check Redis cache
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      this.metrics.increment('ai_cache_hit');
      return JSON.parse(cached);
    }

    this.metrics.increment('ai_cache_miss');

    // Generate new content
    const result = await generateFn();

    // Cache for future requests
    await this.redis.setex(cacheKey, ttl, JSON.stringify(result));

    return result;
  }
}
```

---

## 🔄 Service Communication Architecture

```typescript
┌─────────────────────────────────────────────────────────────┐
│                     Angular Microfrontends                    │
├─────────────────────────────────────────────────────────────┤
│  Home → auth (authentication, preferences)                   │
│       → ai (NPC dialogue, tutorial narration)                │
│  Deck → cards (pets, abilities, decks)                       │
│       → ai (card descriptions, pet lore)                     │
│  Battle → fight (combat, WebSocket realtime)                 │
│         → ai (battle commentary, sound effects)              │
│  Map → world (generation) + character (progress)             │
│      → ai (quest generation, story events)                   │
│  Inventory → cards (pets) + economy (items)                  │
│            → ai (item descriptions)                          │
│  Avatar → skins (cosmetics) + economy (purchases)            │
│         → ai (custom pet sprites, voice cloning)             │
│  GameOver → character (stats, achievements)                  │
├─────────────────────────────────────────────────────────────┤
│                   GraphQL API Gateway                         │
│            (Apollo Federation - aggregates services)          │
├─────────────────────────────────────────────────────────────┤
│                    Node.js Microservices                      │
├─────────────────────────────────────────────────────────────┤
│  auth  │  cards  │  fight  │  world  │  character  │ economy │
│        │         │  (WS)   │         │             │  │ skins │
│        │         │         │         │             │  │   ai  │
├─────────────────────────────────────────────────────────────┤
│                External AI APIs (ai service)                  │
├─────────────────────────────────────────────────────────────┤
│  OpenAI (GPT-4, DALL-E, Whisper, Moderation)                │
│  ElevenLabs (Voice Synthesis)                                │
│  Azure Speech Services (TTS/STT)                             │
│  Stable Diffusion (Image Generation)                         │
│  Replicate (AI Model Hosting)                                │
├─────────────────────────────────────────────────────────────┤
│                        Databases                              │
├─────────────────────────────────────────────────────────────┤
│  PostgreSQL (relational) + MongoDB (documents) + Redis (cache)│
├─────────────────────────────────────────────────────────────┤
│                     Cloud Storage                             │
├─────────────────────────────────────────────────────────────┤
│  Azure Blob Storage (audio) + AWS S3 (images, sprites, assets)│
└─────────────────────────────────────────────────────────────┘
```

### State Management (NgRx)

```typescript
// NgRx architecture with TDD approach
Store
├── Game State
│   ├── Player (level, experience, unlocks)
│   ├── Pet Collection (owned pets, current party of 3)
│   ├── Card Collection (owned cards, current deck max 15)
│   ├── Inventory (relics, items, currencies)
│   ├── Customization (unlocked skins, equipped items)
│   └── Progress (achievements, statistics)
├── Battle State
│   ├── Active Combat (current enemies, turn count)
│   ├── Party Status (3 pets with HP, level, attack, defense)
│   ├── Hand Management (5 card limit)
│   ├── Mana Pools (Close-Combat, Illusion, Talent)
│   ├── Turn Order (pet initiative)
│   └── Combat Log (damage calculations, effects)
├── Deck Builder State
│   ├── Available Cards (filtered by rarity, element)
│   ├── Current Deck (max 15 cards with validation)
│   └── Card Restrictions (3 pets, 1 summoning)
├── Run State (Roguelike)
│   ├── Current Map (procedural dungeon)
│   ├── Temporary Buffs (run-specific power-ups)
│   └── Encounter History
├── UI State
│   ├── Active Screen (11 screen types)
│   ├── Modals and Dialogs
│   ├── Notifications
│   ├── Loading States
│   └── Theme (Material UI + Tailwind)
└── Real-time State (WebSockets)
    ├── Multiplayer Sessions
    ├── Live Battle Sync
    └── Connection Status
```

### Technology Integration Map

```typescript
// How technologies work together
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Angular 20)                     │
├─────────────────────────────────────────────────────────────┤
│ UI Layer: Material UI + Tailwind CSS + NG Bootstrap + Sass  │
│ Component Docs: Storybook                                    │
│ State: NgRx (TDD with Jasmine/Jest)                         │
│ Routing: Angular Router (SSR with Universal)                 │
│ Change Detection: OnPush strategy for performance           │
├─────────────────────────────────────────────────────────────┤
│                     Data Layer                               │
├─────────────────────────────────────────────────────────────┤
│ API: GraphQL (Apollo Client)                                │
│ Real-time: WebSockets (battle sync, multiplayer)            │
│ Auth: OpenID Connect + OAuth2                               │
│ Backend: Firebase/Supabase + Node.js                        │
├─────────────────────────────────────────────────────────────┤
│                   Cloud Infrastructure                       │
├─────────────────────────────────────────────────────────────┤
│ Azure: Key Vault, Application Insights, Blob Storage        │
│ AWS: EKS (Kubernetes), EC2, S3, EMR, SQS                   │
├─────────────────────────────────────────────────────────────┤
│                Testing & Quality (TDD)                       │
├─────────────────────────────────────────────────────────────┤
│ Unit: Jasmine + Jest                                        │
│ Component: Enzyme/RTL                                        │
│ E2E: Playwright                                             │
│ Visual: Storybook interaction tests                         │
├─────────────────────────────────────────────────────────────┤
│              Analytics & Monitoring                          │
├─────────────────────────────────────────────────────────────┤
│ User Behavior: Hotjar                                       │
│ Custom Tracking: IndeCx tagging                             │
│ Performance: Application Insights                            │
├─────────────────────────────────────────────────────────────┤
│                 DevOps & Deployment                          │
├─────────────────────────────────────────────────────────────┤
│ Monorepo: Nx                                                │
│ CI/CD: GitHub Actions                                        │
│ Desktop: Electron                                            │
│ Container: Docker → EKS (Kubernetes)                        │
└─────────────────────────────────────────────────────────────┘
```

### Architecture Summary

**Frontend (7 Microfrontends):**

1. `home` - Initial screen, settings, credits, tutorials
2. `deck` - Deck building and card management
3. `battle` - Turn-based combat interface
4. `map` - Procedural map visualization
5. `inventory` - Item and pet management
6. `avatar` - Customization and cosmetics
7. `game-over` - Statistics and achievements

**Backend (8 Microservices):**

1. `auth` - Authentication and user management
2. `cards` - Deck and pet logic
3. `fight` - Combat mechanics and calculations
4. `world` - Procedural generation
5. `character` - Player progression and stats
6. `economy` - Rewards and virtual economy
7. `skins` - Customization storage
8. `ai` - AI integration (GPT-4, DALL-E, ElevenLabs, content generation)

**Benefits of This Architecture:**

- 🚀 **Independent Deployment**: Each service can be deployed without affecting others
- 🧪 **Isolated Testing**: TDD approach with focused test suites per module
- 👥 **Team Scalability**: Feature teams can work independently
- 📊 **Performance**: Lazy loading of microfrontends, optimized bundle sizes
- 🔄 **Technology Flexibility**: Can upgrade or replace individual services
- 🛡️ **Fault Isolation**: Failure in one service doesn't crash the entire system
- 📈 **Scalability**: Scale individual services based on load (fight service during peak)

### 🎛️ Backoffice Admin Platform

ElementaMon includes a comprehensive **internal admin platform** for employees to manage game operations, support players, and monitor systems.

**Technology Stack**: Next.js 15, React 19, TypeScript, Prisma ORM, PostgreSQL, Redis, NextAuth.js, tRPC, shadcn/ui, Tailwind CSS, Recharts

**Key Features**:

- 👥 **Player Management** - View/edit accounts, grant items, adjust stats
- 🎫 **Support System** - Ticket management with SLA tracking and auto-assignment
- 🛡️ **Content Moderation** - AI-assisted review of user-generated content
- 📊 **Analytics Dashboard** - Real-time metrics, revenue, AI costs, player behavior
- 🎮 **Content CMS** - Manage cards, pets, events, economy balancing
- 🔍 **System Monitoring** - Service health, logs, performance metrics
- 🔐 **RBAC** - Role-based access control (7 employee roles)
- 🤖 **AI Cost Tracking** - Monitor OpenAI, ElevenLabs, and other AI API usage

**Employee Roles**: Super Admin, Admin, Support Agent, Content Moderator, Game Designer, Data Analyst, Developer

**See Full Specification**: [BACKOFFICE_SPEC.md](./BACKOFFICE_SPEC.md)

### 🌐 Marketing Site & Landing Page

ElementaMon includes a **high-performance public website** for player acquisition, brand awareness, and community engagement.

**Technology Stack**: Nuxt 3, Vue 3, TypeScript, Tailwind CSS, Nuxt UI, Nuxt Content, Cloudinary, Vercel

**Key Pages**:

- 🏠 **Home Page** - Hero landing with animated gameplay preview, CTAs
- ⚡ **Features** - Interactive game mechanics showcase with videos
- 📖 **Pokédex** - Searchable pet gallery with 3D model viewer
- 📚 **Guides & Wiki** - Markdown-based tutorials and strategy content
- 👥 **Community Hub** - Social feeds, creator spotlights, Discord integration
- 📰 **News & Blog** - Patch notes, dev blogs, event announcements
- 💾 **Download Page** - Multi-platform support (Web, Desktop, Mobile)
- 📢 **Press Kit** - Media assets, logos, screenshots, fact sheet

**SEO Optimization**: SSR/SSG, meta tags, Open Graph, structured data, automatic sitemap, 95+ Lighthouse score

**Performance**: <1.5s FCP, <3.5s TTI, PWA capabilities, image optimization, lazy loading

**Multilingual**: English, Spanish, Portuguese, French, German, Japanese (i18n support)

**See Full Specification**: [MARKETING_SITE_SPEC.md](./MARKETING_SITE_SPEC.md)

---

## 💰 Monetization & Gacha System

ElementaMon features a **fair and transparent free-to-play model** with multiple revenue streams designed to respect player time and investment:

### 🎰 Gacha Mechanics

- **4 Gacha Pool Types**: Standard, Featured, Elemental-Specific, Special Event
- **Transparent Drop Rates**: Common (55%), Uncommon (30%), Rare (10%), Epic (4%), Legendary (0.9%), Mythic (0.1%)
- **Fair Pity System**:
  - Guaranteed Rare every 10 pulls
  - Guaranteed Epic every 50 pulls
  - Guaranteed Legendary every 100 pulls
- **Bulk Pull Discounts**: 10-pull saves 10% gems

### 💎 Currency System

- **Gold** - Free currency earned from battles and missions
- **Dust** - Obtained from duplicate pets for crafting
- **Gems** - Premium currency for gacha pulls and bundles
- **Tickets** - Special currency for limited banners

### 💳 Payment Methods

- **Credit/Debit Cards**: Stripe integration (global)
- **PayPal**: PayPal Checkout SDK
- **PIX**: MercadoPago API (Brazil-specific instant payment)
- **Cryptocurrency**: Coinbase Commerce (Bitcoin, Ethereum)

**Gem Bundles**: 6 tiers from $0.99 (60 gems) to $49.99 (3,200 gems) with first-time purchase bonuses

### 📺 Advertisement Integration

- **Rewarded Videos**: AdMob SDK - earn 10 gems per ad
- **Daily Limit**: Maximum 5 ads per day (player-friendly)
- **Optional Placements**: No forced ads, all rewards are optional bonuses
- **Ad-Free Option**: Premium Pass ($4.99/month) removes ads

### 🎟️ Coupon & Referral System

- **6 Coupon Types**: Gems, Tickets, Bundles, Discounts, Special Pets, Premium Pass
- **Validation System**: Date ranges, usage limits, region/level restrictions
- **Referral Program**: Unique codes with rewards for both referrer and new player
- **Campaign Tracking**: Analytics for promotional effectiveness

**See Full Specification**: [MONETIZATION_GACHA_SPEC.md](./MONETIZATION_GACHA_SPEC.md)

---

## 🎯 Target Audience

ElementaMon is designed for fans of:

- **Deck-building games** like _Slay the Spire_ and _Monster Train_
- **Roguelike games** with procedural generation and permadeath
- **Creature collection** games like _Pokemon_ and _Neopets_
- **Strategic card games** like _Hearthstone_ and _Magic: The Gathering_
- Players who enjoy progression systems and customization

The game combines familiar mechanics with a fresh elemental pet theme, offering both casual and hardcore gameplay modes.

## 🎨 Visual Style & Art Direction

**Vibrant and Colorful Design** using Material UI theming and Tailwind CSS:

- Each elemental type has distinct color palettes and visual effects
- Pets feature unique animations that reflect their elemental nature
- Dynamic environments change based on elements (water zones, fire areas, etc.)
- Smooth transitions and particle effects using Angular animations
- Accessibility-first design with customizable themes (stored in Azure Key Vault)

**Component Development**:

- All UI components documented in Storybook
- Sass for complex styling and theming
- Tailwind for rapid utility-based styling
- NG Bootstrap for responsive layouts
- Material UI for consistent design language

## 📅 Development Roadmap

### Phase 1: Foundation (Q1 2026)

- Core gameplay mechanics implementation
- Initial deck-building system using NgRx
- Basic combat system with elemental interactions
- GraphQL API setup with Apollo Client
- TDD framework establishment (Jasmine + Jest)

### Phase 2: Content & Systems (Q2 2026)

- Design elemental pet abilities and stats
- Combat mechanics refinement and balancing
- Basic procedural level generation
- WebSocket real-time battle system
- Playwright E2E test suite

### Phase 3: Progression & Evolution (Q3 2026)

- Player progression system implementation
- Pet evolution mechanics (3 stages)
- Complex elemental interactions and effects
- Card collection and rarity system
- Storybook component library completion

### Phase 4: Polish & Testing (Q4 2026)

- Gameplay testing and balance adjustments
- Performance optimization (Change Detection strategies)
- UI/UX refinement with user feedback
- Integration testing across microfrontends
- Analytics implementation (Hotjar, IndeCx, Application Insights)

### Phase 5: Launch & Post-Launch (Q1 2027)

- Final release preparation
- Multi-platform builds (Web, Electron desktop apps)
- Cloud deployment (Azure/AWS with EKS)
- Post-launch content updates
- Community features and events
- OAuth2 social features integration

## 🤖 GitHub Copilot for ElementaMon

This project is optimized for GitHub Copilot to accelerate development. Use these commands and best practices to leverage AI assistance effectively.

### Copilot Participants (@Mentions)

Use these **@mentions** to scope Copilot's context and get more relevant suggestions:

#### Available Participants

| Participant  | Scope                                           | Example Usage                                                         |
| ------------ | ----------------------------------------------- | --------------------------------------------------------------------- |
| `@workspace` | Entire project structure, all files and folders | `@workspace How is authentication implemented across microfrontends?` |
| `@vscode`    | VS Code features, settings, and commands        | `@vscode How do I configure auto-import for Angular components?`      |
| `@terminal`  | Shell commands and terminal operations          | `@terminal How do I run tests for a specific microfrontend?`          |
| `@github`    | GitHub features, PRs, branches, Actions         | `@github Create a PR description for the battle system feature`       |

#### Best Practices with Participants

**Architecture Questions:**

```
@workspace Explain the communication pattern between the battle microfrontend and the fight microservice
```

**Configuration Help:**

```
@vscode How do I set up Nx Console for this monorepo?
```

**Deployment Commands:**

```
@terminal What's the command to build all microfrontends for production?
```

**CI/CD Questions:**

```
@github How do I set up GitHub Actions for automated testing?
```

### Copilot Variables (#References)

Use **#variables** to inject specific content into your prompts:

#### Available Variables

| Variable               | Content                      | Example Usage                                                                     |
| ---------------------- | ---------------------------- | --------------------------------------------------------------------------------- |
| `#file`                | Entire file content          | `#file:src/app/battle/battle.component.ts Refactor this component to use signals` |
| `#selection`           | Currently highlighted code   | Select code, then: `Optimize this #selection for performance`                     |
| `#editor`              | Active editor content        | `#editor Add error handling to this service`                                      |
| `#codebase`            | Semantic search results      | `#codebase Where is the mana system implemented?`                                 |
| `#terminalLastCommand` | Last terminal command output | `#terminalLastCommand Explain this test failure`                                  |
| `#terminalSelection`   | Selected terminal text       | Select error, then: `#terminalSelection Fix this error`                           |

#### Targeted Code References

For **precise code targeting**, use structural references:

```typescript
// Reference specific structures
#function:calculateDamage    // Reference a function
#class:BattleComponent        // Reference a class
#interface:ElementaMon        // Reference an interface
#type:ElementalType          // Reference a type
#line:45                     // Reference a specific line
#line:45-60                  // Reference a line range
```

#### Project Context Variables

```typescript
#path; // Current file path
#project; // Project structure (like @workspace)
```

### Practical Examples for ElementaMon

#### 1. Creating a New Microfrontend Component

```
@workspace I need to create a new component for displaying pet evolution trees in the deck-builder microfrontend.
#file:apps/deck-builder/src/app/components/deck-list/deck-list.component.ts Use this as a reference for the structure.
Include:
- TypeScript interfaces for EvolutionStage
- NgRx selectors for fetching evolution data
- Material UI components for the tree visualization
- Unit tests following our TDD approach
```

#### 2. Implementing a New Microservice Endpoint

```
@workspace Create a new endpoint in the cards microservice to fetch cards by elemental type.
#file:services/cards/src/controllers/cards.controller.ts Use this controller structure.
#file:services/cards/src/models/card.model.ts Reference this model.
Requirements:
- Express.js route with validation
- GraphQL resolver
- MongoDB query with pagination
- API documentation
- Jest unit tests
```

#### 3. Fixing a Bug with Context

```
@workspace There's an issue with mana calculation in battles.
#file:apps/battle/src/app/services/mana.service.ts This service calculates mana
#terminalLastCommand The test output shows the error
Help me fix the calculation for Illusion-type mana when multiple pets are active.
```

#### 4. Refactoring with Best Practices

```
@workspace Refactor this battle state management to use Angular 20 signals instead of RxJS BehaviorSubject.
#selection
Follow these requirements:
- Use computed() for derived state
- Use effect() for side effects
- Maintain backward compatibility with existing components
- Add JSDoc comments
- Update unit tests
```

#### 5. Adding AI Integration Features

```
@workspace Implement NPC dialogue generation in the world microservice.
#file:services/ai/src/services/npc-dialogue.service.ts Use this AI service as reference
#file:AI_INTEGRATION.md Follow the integration spec
Create:
- NPC controller endpoint
- OpenAI GPT-4 integration
- Redis caching layer
- Rate limiting
- Cost tracking
```

#### 6. Creating Tests with TDD

```
@workspace Create comprehensive tests for the pet evolution system.
#file:libs/shared/models/src/lib/elementa-mon.interface.ts This defines the pet structure
#file:apps/game-core/src/app/services/evolution.service.ts This is the service to test
Include:
- Unit tests for each evolution stage
- Integration tests for evolution triggers
- Edge cases (max level, missing requirements)
- Mock data following our test patterns
```

#### 7. Updating Documentation

```
@workspace Generate API documentation for all endpoints in the fight microservice.
#file:services/fight/src/controllers Use all controllers
Format:
- OpenAPI 3.0 specification
- Request/response examples
- Authentication requirements
- Rate limiting info
- Error codes
```

#### 8. Optimizing Performance

```
@workspace Analyze and optimize the battle rendering performance.
#file:apps/battle/src/app/components/battle-arena/battle-arena.component.ts
#file:BATTLE_UI_SPEC.md Follow UI requirements
Optimize:
- Change detection (use OnPush)
- NgRx selectors (use memoization)
- Animation performance
- Image lazy loading
- Bundle size
```

#### 9. Setting Up Infrastructure

```
@terminal Generate Docker Compose configuration for local development with:
- PostgreSQL for auth service
- MongoDB for cards/fight services
- Redis for caching
- RabbitMQ for message queue
Include volume mounts and environment variables
```

#### 10. Code Review Assistance

```
@github Review this PR for the new inventory system.
#file:apps/inventory/src Check all files
Verify:
- Follows Clean Code principles
- Has adequate test coverage
- No security vulnerabilities
- Proper error handling
- Consistent with project architecture
```

### Copilot Chat Slash Commands

Use these **slash commands** for quick actions:

| Command    | Purpose           | Example                            |
| ---------- | ----------------- | ---------------------------------- |
| `/explain` | Explain code      | `/explain #selection`              |
| `/fix`     | Fix problems      | `/fix #terminalLastCommand`        |
| `/tests`   | Generate tests    | `/tests #file`                     |
| `/help`    | Get help          | `/help How do I use NgRx signals?` |
| `/clear`   | Clear chat        | `/clear`                           |
| `/api`     | Generate API docs | `/api #file:cards.controller.ts`   |

### Project-Specific Copilot Settings

Add to `.vscode/settings.json`:

```json
{
  "github.copilot.enable": {
    "*": true,
    "yaml": true,
    "markdown": true,
    "typescript": true,
    "javascript": true
  },
  "github.copilot.advanced": {
    "enableAutoCompletions": true,
    "enableCopilotChat": true,
    "inlineSuggest.enable": true
  },
  "github.copilot.editor.enableAutoCompletions": true,
  "github.copilot.editor.enableCodeActions": true
}
```

### Tips for Better Copilot Results

1. **Be Specific**: Include file paths, function names, and requirements
2. **Provide Context**: Use `@workspace` for architectural questions
3. **Reference Files**: Use `#file` to inject relevant code
4. **Include Tests**: Always ask for tests with new code
5. **Follow Patterns**: Reference existing files as templates
6. **Iterate**: Refine your prompts based on responses
7. **Use Variables**: Combine multiple `#file` references for complex tasks
8. **Check Output**: Always review and test generated code

### Common Copilot Workflows

**Creating a Feature End-to-End:**

```
1. @workspace Design the data model for [feature]
2. Create TypeScript interfaces #file:existing-model.ts
3. Generate NgRx state management
4. Create Angular components with Material UI
5. Implement service with HTTP client
6. Add unit tests with Jest
7. Add E2E tests with Playwright
8. @github Generate PR description
```

**Debugging Issues:**

```
1. #terminalLastCommand Show the error
2. @workspace Find where [function] is implemented
3. #file:[problematic-file] Review this file
4. /fix with context
5. Run tests to verify
```

**Refactoring Code:**

```
1. #selection Current implementation
2. @workspace What's the pattern for [similar-feature]?
3. Refactor to match project patterns
4. Update tests
5. Run tests and verify
```

---

## 🎯 Getting Started

### Prerequisites

```bash
Node.js >= 22.11.0
npm >= 10.0.0
Angular CLI >= 20.0.0
Nx CLI >= 20.0.0
GitHub Copilot (recommended for development)
```

### Installation

```bash
# Clone the repository
git clone https://github.com/magas-xlr/elementa-mon.git
cd elementa-mon

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration
```

### Environment Configuration

Create a `.env` file with the following:

```env
# API Configuration
GRAPHQL_ENDPOINT=https://api.elementamon.com/graphql
WEBSOCKET_ENDPOINT=wss://api.elementamon.com/ws

# Firebase/Supabase
FIREBASE_API_KEY=your_firebase_key
FIREBASE_PROJECT_ID=your_project_id
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key

# Authentication
OPENID_ISSUER=https://auth.elementamon.com
OAUTH2_CLIENT_ID=your_client_id

# Azure
AZURE_KEY_VAULT_URL=https://your-vault.vault.azure.net
AZURE_APP_INSIGHTS_KEY=your_insights_key
AZURE_BLOB_CONNECTION_STRING=your_connection_string

# AWS
AWS_REGION=us-east-1
AWS_S3_BUCKET=elementamon-assets
AWS_SQS_QUEUE_URL=your_queue_url

# Analytics
HOTJAR_ID=your_hotjar_id
INDECX_TOKEN=your_indecx_token
```

### Development Server

```bash
# Serve the shell application with all microfrontends
npx nx serve shell

# Serve with specific microfrontend
npx nx serve game-core

# Serve with production configuration
npx nx serve shell --configuration=production
```

Access the application at `http://localhost:4200`

## 💻 Development

### Running Tests

```bash
# Run all unit tests
npx nx test

# Run tests for specific project
npx nx test game-core

# Run e2e tests with Playwright
npx nx e2e shell-e2e

# Run tests with coverage
npx nx test --coverage

# Run tests in watch mode
npx nx test --watch
```

### Building

```bash
# Build all applications
npx nx build shell

# Build for production
npx nx build shell --configuration=production

# Build specific microfrontend
npx nx build creature-manager

# Build desktop app with Electron
npx nx build shell --configuration=electron
```

### Code Quality

```bash
# Lint all projects
npx nx lint

# Format code with Prettier
npx nx format:write

# Run affected commands (only changed projects)
npx nx affected:test
npx nx affected:build
npx nx affected:lint
```

### Storybook

```bash
# Run Storybook for UI components
npx nx storybook shared-ui-components

# Build Storybook static site
npx nx build-storybook shared-ui-components
```

### Nx Graph

```bash
# Visualize project dependencies
npx nx graph

# View affected projects
npx nx affected:graph
```

## 🚢 Deployment

### GitHub Actions CI/CD

The project includes automated workflows for:

1. **Continuous Integration**
   - Run tests on every PR
   - Lint and format checks
   - Build verification
   - E2E tests with Playwright

2. **Continuous Deployment**
   - Automated deployment to staging
   - Production deployment on release tags
   - Container builds and pushes to registry
   - Kubernetes deployments to EKS

### Deployment Targets

- **Web**: Azure/AWS static hosting with CDN
- **Desktop**: Electron builds for Windows, macOS, Linux
- **Mobile**: PWA with service worker
- **Containers**: Docker images to AWS EKS

### Manual Deployment

```bash
# Build for production
npx nx build shell --configuration=production

# Build Docker image
docker build -t elementamon:latest .

# Deploy to Kubernetes
kubectl apply -f k8s/

# Deploy Electron app
npx nx build shell --configuration=electron
npx electron-builder
```

## 🧪 Testing Strategy (TDD)

### Test-Driven Development Approach

ElementaMon follows strict TDD principles:

1. **Write Tests First** - Define expected behavior before implementation
2. **Red-Green-Refactor** - Watch test fail, make it pass, improve code
3. **Comprehensive Coverage** - Aim for >80% code coverage
4. **Clean Code** - Tests serve as living documentation

### Test Types & Tools

#### Unit Tests (Jasmine + Jest)

```typescript
// Example: Testing damage calculation with elemental types
describe('CombatService - Elemental Damage', () => {
  it('should calculate 150% damage when Fire attacks Water', () => {
    const attacker = createPet({ type: 'Fire', attack: 50 });
    const defender = createPet({ type: 'Water' });
    const damage = combatService.calculateDamage(attacker, defender);
    expect(damage).toBe(75); // 50 * 1.5
  });

  it('should apply only 30% damage when Fire attacks Water', () => {
    const attacker = createPet({ type: 'Fire', attack: 50 });
    const defender = createPet({ type: 'Water' });
    const damage = combatService.calculateDamage(defender, attacker);
    expect(damage).toBe(15); // 50 * 0.3
  });
});
```

**Coverage:**

- Component logic and lifecycle hooks
- Service methods (combat calculations, deck validation)
- Pipe transformations
- Utility functions (damage tables, mana costs)
- NgRx reducers and selectors

#### Integration Tests (Jasmine + Jest)

```typescript
// Example: Testing NgRx state flow
describe('Battle Effects', () => {
  it('should update pet HP when damage is dealt', (done) => {
    actions$ = of(BattleActions.dealDamage({ petId: '1', damage: 20 }));
    effects.dealDamage$.subscribe((action) => {
      expect(action).toEqual(
        BattleActions.updatePetHp({
          petId: '1',
          newHp: 80,
        })
      );
      done();
    });
  });
});
```

**Coverage:**

- NgRx effects and side effects
- GraphQL query/mutation integration
- WebSocket event handling
- API service calls
- State management flows

#### Component Tests (Enzyme/RTL)

```typescript
// Example: Testing card rendering
describe('PetCardComponent', () => {
  it('should display correct mana costs', () => {
    const card = createCard({
      manaCost: { closeCombat: 2, illusion: 1, talent: 0 },
    });
    const { getByTestId } = render(PetCardComponent, {
      componentProperties: { card },
    });

    expect(getByTestId('close-combat-cost')).toHaveTextContent('2');
    expect(getByTestId('illusion-cost')).toHaveTextContent('1');
    expect(getByTestId('talent-cost')).toHaveTextContent('0');
  });
});
```

**Coverage:**

- Component rendering and templates
- User interactions (clicks, drag-and-drop)
- Material UI and Tailwind component integration
- Form validation (deck builder)
- Accessibility (ARIA attributes)

#### E2E Tests (Playwright)

```typescript
// Example: Full battle flow
test('complete battle victory flow', async ({ page }) => {
  await page.goto('/game');
  await page.click('[data-testid="start-battle"]');

  // Wait for battle screen with WebSocket connection
  await page.waitForSelector('[data-testid="battle-screen"]');

  // Play cards from hand (max 5)
  await page.dragAndDrop('[data-testid="card-0"]', '[data-testid="enemy-pet-1"]');

  // Verify damage calculation and HP update
  await expect(page.locator('[data-testid="enemy-hp"]')).toHaveText(/\d+/);

  // Complete battle
  await page.click('[data-testid="end-turn"]');
  await page.waitForSelector('[data-testid="victory-screen"]');
});
```

**Coverage:**

- Complete user journeys (tutorial, battle, deck building)
- 11 game screens navigation
- Authentication flows (OpenID/OAuth2)
- Multiplayer battles (WebSocket real-time)
- Cross-browser testing
- Mobile responsive layouts

#### Visual Regression Tests (Storybook)

```typescript
// Example: Storybook stories for card variants
export default {
  title: 'Game/Cards/PetCard',
  component: PetCardComponent,
} as Meta;

export const Level1Fire: Story = {
  args: {
    card: {
      name: 'Flaming Gecko',
      type: 'Fire',
      level: 1,
      rarity: 'Epic',
    },
  },
};

export const Level3Water: Story = {
  args: {
    card: {
      name: 'Tsunami Dragon',
      type: 'Water',
      level: 3,
      rarity: 'Legendary',
    },
  },
};
```

**Coverage:**

- Component visual appearance across themes
- Material UI component variations
- Tailwind responsive breakpoints
- Card design specifications (Brown/Orange/Pink/Gray/Purple)
- Animation states

#### Performance Tests (Change Detection)

```typescript
// Example: OnPush change detection optimization
@Component({
  selector: 'app-battle-screen',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `...`,
})
export class BattleScreenComponent {
  // Immutable state updates from NgRx
  pets$ = this.store.select(selectBattlePets);

  trackByPetId(index: number, pet: Pet) {
    return pet.id; // Optimize ngFor rendering
  }
}
```

**Coverage:**

- Change detection strategy validation
- Performance profiling (Application Insights)
- Bundle size optimization
- Lazy loading verification
- WebSocket message handling efficiency

### Test Execution

```bash
# Run all tests with coverage
npm run test:all

# Unit tests only (Jasmine + Jest)
npx nx test

# Component tests with RTL
npx nx test --testNamePattern="Component"

# E2E with Playwright
npx nx e2e shell-e2e

# Visual regression with Storybook
npm run storybook:test

# Performance profiling
npm run test:performance

# Coverage report
npx nx test --coverage --coverageReporters=html
```

### Quality Gates (GitHub Actions)

```yaml
# CI Pipeline enforces:
- Minimum 80% code coverage
- All tests passing
- Lint checks (ESLint)
- Format validation (Prettier)
- Build success for all microfrontends
- E2E tests passing
- No TypeScript errors (strict mode)
- Performance budget checks
```

## 📊 Monitoring & Analytics

### Application Insights

- Performance metrics
- Error tracking
- Custom events
- User analytics

### Hotjar

- User session recordings
- Heatmaps
- Conversion funnels
- User feedback

### IndeCx Tagging

- Custom event tracking
- User behavior analytics
- A/B testing support

## 🎯 Clean Code Principles

ElementaMon adheres to strict Clean Code standards:

### SOLID Principles

- **Single Responsibility**: Each class/component has one clear purpose
- **Open/Closed**: Open for extension, closed for modification
- **Liskov Substitution**: Subtypes must be substitutable for base types
- **Interface Segregation**: Many specific interfaces over one general
- **Dependency Inversion**: Depend on abstractions, not concretions

### Code Quality Standards

```typescript
// ✅ Good: Clear naming, single responsibility
class DamageCalculator {
  calculateElementalDamage(
    attacker: Pet,
    defender: Pet,
    damageTable: ElementalDamageTable
  ): number {
    const baseAttack = attacker.attack;
    const elementalMultiplier = damageTable.getMultiplier(attacker.type, defender.type);
    return Math.floor(baseAttack * elementalMultiplier);
  }
}

// ❌ Bad: Unclear naming, multiple responsibilities
class Calculator {
  calc(a: any, b: any, t: any): any {
    let x = a.att;
    let y = t[a.type][b.type];
    // Complex logic...
    return x * y;
  }
}
```

### Best Practices

- **Meaningful Names**: Variables, functions, and classes should reveal intent
- **Small Functions**: Functions should do one thing and do it well (< 20 lines)
- **No Magic Numbers**: Use named constants
- **Comments**: Explain "why", not "what"
- **DRY Principle**: Don't Repeat Yourself
- **Error Handling**: Explicit error handling, no silent failures
- **Immutability**: Prefer immutable data structures (NgRx state)
- **Pure Functions**: No side effects in business logic

### TypeScript Strict Mode

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true
  }
}
```

## 🤝 Contributing

### Contribution Workflow

1. **Fork the repository**
2. **Create feature branch** (`git checkout -b feature/elemental-skill-system`)
3. **Write tests first (TDD)**

   ```bash
   # Create test file
   touch libs/game-engine/combat-logic/src/lib/skill-resolver.spec.ts

   # Write failing tests
   npm run test:watch
   ```

4. **Implement feature** following Clean Code principles
5. **Ensure all tests pass** with >80% coverage
6. **Lint and format**
   ```bash
   npx nx lint
   npx nx format:write
   ```
7. **Commit with conventional commits**

   ```bash
   git commit -m "feat(combat): add elemental skill chaining system

   - Implement skill combo detection
   - Add mana cost validation
   - Update damage calculation for combos

   Closes #123"
   ```

8. **Push to branch** (`git push origin feature/elemental-skill-system`)
9. **Open Pull Request** with clear description

### Commit Message Convention

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting, missing semicolons
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**

```bash
feat(deck-builder): add card filtering by element type
fix(combat): correct Ice vs Fairy damage multiplier
docs(readme): update installation instructions
test(battle): add E2E tests for 3-pet party system
```

### Code Review Checklist

- [ ] Tests written first (TDD)
- [ ] All tests passing
- [ ] Code coverage >80%
- [ ] Clean Code principles followed
- [ ] TypeScript strict mode compliance
- [ ] No ESLint errors
- [ ] Formatted with Prettier
- [ ] Storybook stories for new components
- [ ] Documentation updated
- [ ] Performance impact considered
- [ ] Accessibility validated
- [ ] Responsive design tested

### Development Guidelines

**Component Creation:**

```bash
# Generate component with Nx
npx nx g @nx/angular:component pet-card \
  --project=shared-ui-components \
  --changeDetection=OnPush \
  --style=scss \
  --standalone

# Generate Storybook story
npx nx g @nx/angular:stories --project=shared-ui-components
```

**State Management:**

```bash
# Generate NgRx feature
npx nx g @ngrx/schematics:feature battle \
  --project=libs-state \
  --creators

# Always write reducer tests first
```

**Testing:**

```bash
# Create test before implementation
# Test file: feature.spec.ts
# Implementation: feature.ts

# Watch mode during development
npx nx test --watch --testPathPattern=combat-logic
```

## � Documentation

ElementaMon includes comprehensive specification documents for all major systems:

### Core Specifications

- **[BEST_PRACTICES.md](./BEST_PRACTICES.md)** - 🏆 **Production-Ready Best Practices** (33+ categories)
  - Accessibility, Security, Privacy, Performance
  - Testing, CI/CD, DevOps, Containers
  - State Management, Caching, Error Handling
  - Monitoring, Logging, Analytics
  - Design Systems, UX, Code Quality

- **[BACKOFFICE_SPEC.md](./BACKOFFICE_SPEC.md)** - Admin platform specification (Next.js 15)
  - Player management and support system
  - Content moderation with AI assistance
  - Analytics dashboard and reporting
  - System monitoring and alerts
  - Role-based access control (RBAC)

- **[MARKETING_SITE_SPEC.md](./MARKETING_SITE_SPEC.md)** - Marketing website specification (Nuxt 3)
  - Landing pages and conversion optimization
  - Pet gallery (Pokédex) with 3D viewer
  - Gameplay guides and wiki system
  - Community hub and social integration
  - Blog and press kit

- **[MONETIZATION_GACHA_SPEC.md](./MONETIZATION_GACHA_SPEC.md)** - Monetization and gacha system
  - Gacha mechanics with fair pity system
  - Payment integration (Stripe, PayPal, PIX, Crypto)
  - Currency system (Gold, Dust, Gems, Tickets)
  - Advertisement integration (AdMob)
  - Coupon and referral system
  - Compliance and regional regulations

### Additional Resources

- **[.github/copilot-instructions.md](./.github/copilot-instructions.md)** - GitHub Copilot configuration
  - Project architecture patterns
  - Code conventions and style guides
  - Component creation templates
  - Common development tasks

## �📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by **Neopets** virtual pet mechanics
- Inspired by **Pokemon** creature collection
- Inspired by **Slay the Spire** deckbuilding roguelike gameplay
- Built with amazing open-source tools and frameworks

## 📞 Contact

- **Project Lead**: [Your Name]
- **Repository**: [https://github.com/magas-xlr/elementa-mon](https://github.com/magas-xlr/elementa-mon)
- **Issues**: [GitHub Issues](https://github.com/magas-xlr/elementa-mon/issues)

---

<div align="center">

**Built with ❤️ using Angular 20 and Nx**

_Start your adventure today!_ 🎮

</div>
