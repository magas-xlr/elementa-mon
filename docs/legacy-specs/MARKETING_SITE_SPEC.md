# 🌐 ElementaMon Marketing Site - Landing Page & Marketing Platform

**Public-Facing Marketing Website & Player Acquisition**

---

## 📖 Overview

The ElementaMon Marketing Site is a high-performance, SEO-optimized public website designed to attract new players, showcase game features, and drive conversions. Built with Nuxt 3 and modern web technologies, it delivers exceptional performance, accessibility, and user experience across all devices.

### Purpose

- **Player Acquisition**: Convert visitors into registered players
- **Brand Awareness**: Showcase ElementaMon's unique features and gameplay
- **SEO Optimization**: Rank high in search engines for creature collection games
- **Community Building**: Engage with social media and content
- **Content Marketing**: Blog, guides, patch notes, events
- **Press & Media**: Press kits, media assets, partner information

---

## 🏗️ Technology Stack

### Recommended: Nuxt 3 (Full-Stack Framework) ⭐

**Best for: SSR/SSG, SEO, performance, and Vue.js ecosystem**

#### Frontend

- **Nuxt 3** - Vue.js meta-framework with hybrid rendering
- **Vue 3** - Composition API with `<script setup>`
- **TypeScript 5.0** - Type safety
- **Tailwind CSS 4** - Utility-first styling
- **Nuxt UI** - Pre-built Vue components
- **VueUse** - Composition utilities
- **Pinia** - Vue state management
- **Vite 6** - Fast build tooling

#### Rendering Strategies

- **SSG (Static Site Generation)** - Pre-render static pages
- **SSR (Server-Side Rendering)** - Dynamic content on-demand
- **ISR (Incremental Static Regeneration)** - Update static pages periodically
- **SPA (Client-Side)** - Interactive sections (game preview)

#### Content Management

- **Nuxt Content** - Markdown/YAML-based CMS
- **Strapi** - Headless CMS (optional for complex content)
- **Cloudinary** - Image/video optimization and CDN
- **Git-based CMS** - Tina CMS or Decap CMS

#### SEO & Analytics

- **Nuxt SEO** - Meta tags, Open Graph, Twitter Cards
- **Google Analytics 4** - User behavior tracking
- **Google Tag Manager** - Marketing tags
- **Hotjar** - Heatmaps and session recordings
- **Plausible Analytics** - Privacy-friendly analytics (alternative)

#### Performance & Optimization

- **Nuxt Image** - Automatic image optimization
- **PWA Module** - Progressive Web App capabilities
- **Critical CSS** - Above-the-fold optimization
- **Font Optimization** - Self-host fonts with `@nuxtjs/fontaine`
- **Lazy Loading** - Images, videos, components
- **Code Splitting** - Route-based splitting

#### Infrastructure

- **Vercel/Netlify** - Edge deployment with CDN
- **Cloudflare Pages** - Global CDN with Workers
- **GitHub Actions** - CI/CD automation
- **Docker** - Containerization (if self-hosted)

---

## 🎨 Design System & UI/UX

### Visual Identity

**Brand Colors**:

```typescript
const colors = {
  // Primary brand colors
  primary: {
    50: '#fef2f2',
    500: '#ef4444', // Fire Red
    600: '#dc2626',
    700: '#b91c1c',
  },
  secondary: {
    50: '#eff6ff',
    500: '#3b82f6', // Water Blue
    600: '#2563eb',
    700: '#1d4ed8',
  },
  accent: {
    50: '#f0fdf4',
    500: '#10b981', // Earth Green
    600: '#059669',
    700: '#047857',
  },

  // Elemental colors (match game)
  fire: '#ff4500',
  water: '#1e90ff',
  electric: '#ffd700',
  earth: '#8b4513',
  ice: '#00ced1',
  poison: '#9370db',
  psychic: '#ff69b4',
  ghost: '#483d8b',
  fairy: '#ffb6c1',

  // Neutrals
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    500: '#6b7280',
    900: '#111827',
  },
};
```

**Typography**:

```typescript
const typography = {
  fontFamily: {
    display: ['Montserrat', 'sans-serif'], // Headlines
    body: ['Inter', 'system-ui', 'sans-serif'], // Body text
    mono: ['JetBrains Mono', 'monospace'], // Code
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
    '6xl': '3.75rem',
    '7xl': '4.5rem',
  },
};
```

### Component Library: Nuxt UI

Pre-built components:

- Button, Input, Select, Checkbox, Radio
- Card, Modal, Dropdown, Tooltip
- Accordion, Tabs, Carousel
- Navigation, Breadcrumbs, Pagination
- Alert, Badge, Avatar
- Form validation
- Dark mode support

### Animation & Interactions

**Libraries**:

- **@vueuse/motion** - Vue motion animations
- **GSAP** - Professional animations
- **Lottie** - JSON-based animations
- **AOS (Animate On Scroll)** - Scroll animations

**Animation Patterns**:

- Fade in on scroll
- Parallax effects
- Hover transitions
- Micro-interactions
- Loading skeletons
- Page transitions

---

## 📱 Page Structure & Features

### 1. Home Page (Hero Landing)

**Above the Fold**:

```vue
<template>
  <section class="hero from-fire to-water min-h-screen bg-gradient-to-br">
    <!-- Animated background with floating pets -->
    <div class="container mx-auto px-4 py-20">
      <motion-div :initial="{ opacity: 0, y: 50 }" :enter="{ opacity: 1, y: 0 }" :duration="1000">
        <h1 class="mb-6 text-7xl font-bold text-white">Collect. Build. Battle.</h1>
        <p class="mb-8 max-w-2xl text-2xl text-white/90">
          Embark on an epic adventure with ElementaMon - where creature collection meets strategic
          deckbuilding.
        </p>

        <!-- CTA Buttons -->
        <div class="flex gap-4">
          <UButton size="xl" color="primary" @click="navigateTo('/play')"> Play Free Now </UButton>
          <UButton size="xl" variant="outline" @click="scrollToFeatures"> Watch Trailer </UButton>
        </div>

        <!-- Social Proof -->
        <div class="mt-8 flex items-center gap-6">
          <div class="flex -space-x-2">
            <img
              v-for="i in 5"
              :key="i"
              :src="`/avatars/${i}.jpg`"
              class="h-12 w-12 rounded-full border-2 border-white"
            />
          </div>
          <p class="text-white">Join <strong>10,000+</strong> players worldwide</p>
        </div>
      </motion-div>

      <!-- Animated game preview -->
      <div class="mt-12">
        <video autoplay loop muted playsinline class="rounded-2xl shadow-2xl">
          <source src="/videos/gameplay-preview.mp4" type="video/mp4" />
        </video>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const scrollToFeatures = () => {
  document.getElementById('features')?.scrollIntoView({
    behavior: 'smooth',
  });
};
</script>
```

**Key Features Section**:

- 3-column feature grid with icons
- Animated counters (10,000+ players, 200+ pets, etc.)
- Interactive pet showcase carousel
- Element type visualization
- Video gameplay clips

**How It Works**:

- Step-by-step visual guide
- Interactive tutorial preview
- Animated battle simulation
- Deck building demo

**Featured Pets Showcase**:

- 3D carousel of popular pets
- Elemental type filtering
- Hover animations
- Link to full Pokédex

---

### 2. Features Page

**Game Mechanics**:

```vue
<template>
  <div class="features-grid">
    <FeatureCard
      v-for="feature in features"
      :key="feature.id"
      :icon="feature.icon"
      :title="feature.title"
      :description="feature.description"
      :image="feature.image"
      :video="feature.video"
    />
  </div>
</template>

<script setup lang="ts">
const features = [
  {
    id: 1,
    icon: '🎴',
    title: 'Deckbuilding Strategy',
    description:
      'Build powerful decks with 15 cards combining pets, abilities, and summoning cards.',
    image: '/images/deckbuilding.jpg',
    video: '/videos/deck-preview.mp4',
  },
  {
    id: 2,
    icon: '🐉',
    title: 'Creature Collection',
    description: 'Discover and collect 200+ unique ElementaMons across 9 elemental types.',
    image: '/images/collection.jpg',
  },
  {
    id: 3,
    icon: '⚔️',
    title: 'Turn-Based Combat',
    description: 'Master strategic battles with 3-pet teams and elemental advantages.',
    image: '/images/battle.jpg',
  },
  {
    id: 4,
    icon: '🗺️',
    title: 'Roguelike Adventure',
    description:
      'Explore procedurally generated dungeons with permadeath and permanent progression.',
    image: '/images/dungeon.jpg',
  },
  {
    id: 5,
    icon: '✨',
    title: 'Pet Evolution',
    description: 'Evolve your pets through 3 stages, unlocking new abilities and forms.',
    image: '/images/evolution.jpg',
  },
  {
    id: 6,
    icon: '👥',
    title: 'Real-Time Multiplayer',
    description: 'Battle other players in ranked matches with live synchronization.',
    image: '/images/pvp.jpg',
  },
];
</script>
```

**Interactive Comparisons**:

- Before/After evolution sliders
- Damage calculator widget
- Elemental type chart (interactive)
- Card preview on hover

---

### 3. Pokédex / Pet Gallery

**Pet Browser**:

```vue
<template>
  <div class="pokedex-page">
    <!-- Filters -->
    <div class="filters mb-8">
      <USelectMenu
        v-model="selectedElement"
        :options="elementTypes"
        placeholder="Filter by Element"
      />
      <USelectMenu v-model="selectedRarity" :options="rarityTypes" placeholder="Filter by Rarity" />
      <UInput
        v-model="searchQuery"
        placeholder="Search pets..."
        icon="i-heroicons-magnifying-glass"
      />
    </div>

    <!-- Pet Grid -->
    <div class="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4">
      <PetCard v-for="pet in filteredPets" :key="pet.id" :pet="pet" @click="openPetModal(pet)" />
    </div>

    <!-- Pet Detail Modal -->
    <UModal v-model="isPetModalOpen">
      <PetDetailView :pet="selectedPet" />
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Pet, ElementalType } from '@/types';

const selectedElement = ref<ElementalType | null>(null);
const selectedRarity = ref<string | null>(null);
const searchQuery = ref('');
const isPetModalOpen = ref(false);
const selectedPet = ref<Pet | null>(null);

// Fetch pets from API or static JSON
const { data: pets } = await useFetch<Pet[]>('/api/pets');

const filteredPets = computed(() => {
  return (
    pets.value?.filter((pet) => {
      const matchesElement = !selectedElement.value || pet.elementalType === selectedElement.value;
      const matchesRarity = !selectedRarity.value || pet.rarity === selectedRarity.value;
      const matchesSearch =
        !searchQuery.value || pet.name.toLowerCase().includes(searchQuery.value.toLowerCase());

      return matchesElement && matchesRarity && matchesSearch;
    }) || []
  );
});

const openPetModal = (pet: Pet) => {
  selectedPet.value = pet;
  isPetModalOpen.value = true;
};
</script>
```

**Pet Detail View**:

- 3D pet model viewer (Three.js)
- Stats visualization (radar chart)
- Evolution tree
- Ability descriptions
- Lore and backstory
- Unlock requirements

---

### 4. Gameplay Guide / Wiki

**Content Structure**:

```yaml
# content/guides/getting-started.md
---
title: Getting Started with ElementaMon
description: Learn the basics of gameplay, deck building, and your first battle
category: beginner
tags: [tutorial, basics, deckbuilding]
author: ElementaMon Team
publishedAt: 2025-11-01
image: /images/guides/getting-started.jpg
---

# Getting Started with ElementaMon

Welcome to ElementaMon! This guide will help you understand...

## Your First Pet

When you start the game, you'll choose one of three starter pets...

## Building Your Deck

Decks in ElementaMon consist of:
- **3 Pet Cards** - Your battle companions
- **12 Ability Cards** - Attacks and effects
- **1 Summoning Card** (optional) - Powerful one-time effects
```

**Interactive Wiki**:

- Search functionality
- Category browsing
- Tag filtering
- Related articles
- Table of contents
- Dark mode support
- Print-friendly version

---

### 5. Community & Social

**Community Hub**:

```vue
<template>
  <div class="community-page">
    <!-- Featured Content -->
    <section class="featured mb-12">
      <h2 class="mb-6 text-4xl font-bold">Community Highlights</h2>
      <div class="grid gap-6 md:grid-cols-3">
        <ContentCard v-for="content in featuredContent" :key="content.id" :content="content" />
      </div>
    </section>

    <!-- Creator Spotlights -->
    <section class="creators mb-12">
      <h2 class="mb-6 text-4xl font-bold">Content Creators</h2>
      <div class="flex gap-4 overflow-x-auto">
        <CreatorCard v-for="creator in creators" :key="creator.id" :creator="creator" />
      </div>
    </section>

    <!-- Discord Integration -->
    <section class="discord">
      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <h3 class="mb-2 text-2xl font-bold">Join Our Discord</h3>
            <p class="text-gray-600">
              Connect with 5,000+ players, share strategies, and get support
            </p>
          </div>
          <UButton size="xl" color="purple" icon="i-simple-icons-discord" @click="openDiscord">
            Join Discord
          </UButton>
        </div>
      </UCard>
    </section>

    <!-- Social Feed -->
    <section class="social-feed mt-12">
      <h2 class="mb-6 text-4xl font-bold">Latest from Social</h2>
      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <SocialPost v-for="post in socialPosts" :key="post.id" :post="post" />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
// Fetch community content
const { data: featuredContent } = await useFetch('/api/community/featured');
const { data: creators } = await useFetch('/api/community/creators');
const { data: socialPosts } = await useFetch('/api/social/feed');

const openDiscord = () => {
  window.open('https://discord.gg/elementamon', '_blank');
};
</script>
```

**Social Features**:

- Twitter/X feed integration
- YouTube video embeds
- Twitch streams
- Fan art gallery
- User deck submissions
- Tournament results

---

### 6. News & Blog

**Blog System**:

```vue
<template>
  <div class="blog-page">
    <!-- Hero Article -->
    <article class="hero-article mb-12">
      <img :src="featuredArticle.image" class="h-96 w-full rounded-2xl object-cover" />
      <div class="mt-6">
        <UBadge color="primary">Featured</UBadge>
        <h1 class="mb-4 mt-4 text-5xl font-bold">
          {{ featuredArticle.title }}
        </h1>
        <p class="mb-4 text-xl text-gray-600">
          {{ featuredArticle.excerpt }}
        </p>
        <div class="flex items-center gap-4">
          <img :src="featuredArticle.author.avatar" class="h-12 w-12 rounded-full" />
          <div>
            <p class="font-semibold">{{ featuredArticle.author.name }}</p>
            <p class="text-sm text-gray-500">
              {{ formatDate(featuredArticle.publishedAt) }}
            </p>
          </div>
        </div>
      </div>
    </article>

    <!-- Article Grid -->
    <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      <BlogCard v-for="article in articles" :key="article.id" :article="article" />
    </div>

    <!-- Pagination -->
    <UPagination v-model="currentPage" :total="totalArticles" :page-size="pageSize" class="mt-12" />
  </div>
</template>

<script setup lang="ts">
// Fetch blog articles from Nuxt Content
const { data: articles } = await queryContent('/blog').sort({ publishedAt: -1 }).limit(9).find();

const featuredArticle = articles.value?.[0];
</script>
```

**Content Categories**:

- Patch Notes
- Dev Blogs
- Game Updates
- Balance Changes
- New Pet Reveals
- Event Announcements
- Community Spotlights
- Strategy Guides

---

### 7. Download / Play Page

**Multi-Platform CTA**:

```vue
<template>
  <div class="download-page">
    <div class="mb-12 text-center">
      <h1 class="mb-4 text-6xl font-bold">Start Playing Now</h1>
      <p class="text-2xl text-gray-600">Available on Web, Desktop, and Mobile</p>
    </div>

    <!-- Platform Cards -->
    <div class="mb-16 grid gap-8 md:grid-cols-3">
      <UCard>
        <template #header>
          <div class="text-center">
            <Icon name="i-heroicons-computer-desktop" class="mb-4 text-6xl" />
            <h3 class="text-2xl font-bold">Web Browser</h3>
          </div>
        </template>
        <p class="mb-4 text-center text-gray-600">
          Play instantly in your browser. No download required.
        </p>
        <UButton block size="lg" @click="playInBrowser"> Play in Browser </UButton>
        <p class="mt-2 text-center text-sm text-gray-500">Chrome, Firefox, Safari, Edge</p>
      </UCard>

      <UCard>
        <template #header>
          <div class="text-center">
            <Icon name="i-heroicons-computer-desktop-20-solid" class="mb-4 text-6xl" />
            <h3 class="text-2xl font-bold">Desktop App</h3>
          </div>
        </template>
        <p class="mb-4 text-center text-gray-600">Enhanced performance with offline support.</p>
        <div class="space-y-2">
          <UButton block size="lg" color="blue" @click="downloadWindows">
            <Icon name="i-simple-icons-windows" /> Windows
          </UButton>
          <UButton block size="lg" color="gray" @click="downloadMac">
            <Icon name="i-simple-icons-apple" /> macOS
          </UButton>
          <UButton block size="lg" color="orange" @click="downloadLinux">
            <Icon name="i-simple-icons-linux" /> Linux
          </UButton>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <div class="text-center">
            <Icon name="i-heroicons-device-phone-mobile" class="mb-4 text-6xl" />
            <h3 class="text-2xl font-bold">Mobile</h3>
          </div>
        </template>
        <p class="mb-4 text-center text-gray-600">Play on the go with native mobile apps.</p>
        <div class="space-y-2">
          <UButton block size="lg" color="blue" @click="openAppStore">
            <Icon name="i-simple-icons-apple" /> App Store
          </UButton>
          <UButton block size="lg" color="green" @click="openPlayStore">
            <Icon name="i-simple-icons-googleplay" /> Google Play
          </UButton>
        </div>
        <p class="mt-2 text-center text-sm text-gray-500">iOS 15+ / Android 10+</p>
      </UCard>
    </div>

    <!-- System Requirements -->
    <UCard>
      <template #header>
        <h3 class="text-2xl font-bold">System Requirements</h3>
      </template>
      <div class="grid gap-8 md:grid-cols-2">
        <div>
          <h4 class="mb-2 font-bold">Minimum</h4>
          <ul class="space-y-1 text-gray-600">
            <li>OS: Windows 10 / macOS 11 / Ubuntu 20.04</li>
            <li>Processor: Intel Core i3 / AMD Ryzen 3</li>
            <li>Memory: 4 GB RAM</li>
            <li>Graphics: Integrated Graphics</li>
            <li>Storage: 2 GB available space</li>
            <li>Internet: Broadband connection</li>
          </ul>
        </div>
        <div>
          <h4 class="mb-2 font-bold">Recommended</h4>
          <ul class="space-y-1 text-gray-600">
            <li>OS: Windows 11 / macOS 14 / Ubuntu 22.04</li>
            <li>Processor: Intel Core i5 / AMD Ryzen 5</li>
            <li>Memory: 8 GB RAM</li>
            <li>Graphics: NVIDIA GTX 1050 / AMD RX 560</li>
            <li>Storage: 5 GB available space</li>
            <li>Internet: Broadband connection</li>
          </ul>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
const playInBrowser = () => {
  navigateTo('https://play.elementamon.com');
};

const downloadWindows = () => {
  window.location.href = '/downloads/ElementaMon-Setup.exe';
};

const downloadMac = () => {
  window.location.href = '/downloads/ElementaMon.dmg';
};

const downloadLinux = () => {
  window.location.href = '/downloads/elementamon.AppImage';
};

const openAppStore = () => {
  window.open('https://apps.apple.com/app/elementamon', '_blank');
};

const openPlayStore = () => {
  window.open('https://play.google.com/store/apps/details?id=com.elementamon', '_blank');
};
</script>
```

---

### 8. Press & Media Kit

**Press Resources**:

```vue
<template>
  <div class="press-page">
    <div class="mb-12">
      <h1 class="mb-4 text-5xl font-bold">Press Kit</h1>
      <p class="text-xl text-gray-600">
        Media assets and information for journalists, content creators, and partners
      </p>
    </div>

    <!-- Quick Facts -->
    <UCard class="mb-12">
      <template #header>
        <h2 class="text-3xl font-bold">Quick Facts</h2>
      </template>
      <dl class="grid gap-4 md:grid-cols-2">
        <div>
          <dt class="font-bold text-gray-700">Developer</dt>
          <dd class="text-gray-600">ElementaMon Studios</dd>
        </div>
        <div>
          <dt class="font-bold text-gray-700">Release Date</dt>
          <dd class="text-gray-600">December 2025 (Early Access)</dd>
        </div>
        <div>
          <dt class="font-bold text-gray-700">Platforms</dt>
          <dd class="text-gray-600">Web, Windows, macOS, Linux, iOS, Android</dd>
        </div>
        <div>
          <dt class="font-bold text-gray-700">Genre</dt>
          <dd class="text-gray-600">Creature Collection, Deckbuilding Roguelike</dd>
        </div>
        <div>
          <dt class="font-bold text-gray-700">Price</dt>
          <dd class="text-gray-600">Free-to-Play with Optional Cosmetics</dd>
        </div>
        <div>
          <dt class="font-bold text-gray-700">Languages</dt>
          <dd class="text-gray-600">English, Spanish, Portuguese, French, German, Japanese</dd>
        </div>
      </dl>
    </UCard>

    <!-- Media Assets -->
    <div class="mb-12">
      <h2 class="mb-6 text-3xl font-bold">Media Assets</h2>
      <div class="grid gap-6 md:grid-cols-2">
        <UCard>
          <template #header>
            <h3 class="text-xl font-bold">Logos & Branding</h3>
          </template>
          <p class="mb-4 text-gray-600">Official logos in various formats and sizes</p>
          <UButton block @click="downloadAsset('logos')"> Download Logos (ZIP) </UButton>
        </UCard>

        <UCard>
          <template #header>
            <h3 class="text-xl font-bold">Screenshots</h3>
          </template>
          <p class="mb-4 text-gray-600">High-resolution gameplay screenshots</p>
          <UButton block @click="downloadAsset('screenshots')">
            Download Screenshots (ZIP)
          </UButton>
        </UCard>

        <UCard>
          <template #header>
            <h3 class="text-xl font-bold">Trailers & Videos</h3>
          </template>
          <p class="mb-4 text-gray-600">Gameplay trailers and promotional videos</p>
          <UButton block @click="downloadAsset('videos')"> Download Videos (ZIP) </UButton>
        </UCard>

        <UCard>
          <template #header>
            <h3 class="text-xl font-bold">Fact Sheet</h3>
          </template>
          <p class="mb-4 text-gray-600">Detailed information about the game</p>
          <UButton block @click="downloadAsset('factsheet')"> Download PDF </UButton>
        </UCard>
      </div>
    </div>

    <!-- Contact Information -->
    <UCard>
      <template #header>
        <h2 class="text-3xl font-bold">Press Contact</h2>
      </template>
      <div class="space-y-4">
        <div>
          <p class="font-bold">General Inquiries</p>
          <a href="mailto:press@elementamon.com" class="text-primary hover:underline">
            press@elementamon.com
          </a>
        </div>
        <div>
          <p class="font-bold">Partnership Opportunities</p>
          <a href="mailto:partnerships@elementamon.com" class="text-primary hover:underline">
            partnerships@elementamon.com
          </a>
        </div>
        <div>
          <p class="font-bold">Creator Program</p>
          <a href="mailto:creators@elementamon.com" class="text-primary hover:underline">
            creators@elementamon.com
          </a>
        </div>
      </div>
    </UCard>
  </div>
</template>
```

---

### 9. Legal Pages

**Required Pages**:

- Privacy Policy
- Terms of Service
- Cookie Policy
- DMCA Policy
- COPPA Compliance
- GDPR Information
- Refund Policy

**Example Privacy Policy**:

```vue
<template>
  <div class="legal-page mx-auto max-w-4xl py-12">
    <h1 class="mb-8 text-5xl font-bold">Privacy Policy</h1>

    <ContentDoc path="/legal/privacy-policy" />

    <div class="mt-12 rounded-lg bg-gray-100 p-6">
      <p class="text-sm text-gray-600">Last Updated: November 11, 2025</p>
      <p class="mt-2 text-sm text-gray-600">
        For questions about this policy, contact
        <a href="mailto:privacy@elementamon.com" class="text-primary hover:underline">
          privacy@elementamon.com
        </a>
      </p>
    </div>
  </div>
</template>
```

---

## 🚀 Technical Implementation

### Project Structure

```
marketing-site/
├── .nuxt/                          # Build output
├── assets/
│   ├── css/
│   │   └── main.css                # Tailwind CSS
│   ├── images/
│   ├── videos/
│   └── fonts/
├── components/
│   ├── ui/                         # UI components
│   │   ├── Button.vue
│   │   ├── Card.vue
│   │   └── Modal.vue
│   ├── layout/                     # Layout components
│   │   ├── Header.vue
│   │   ├── Footer.vue
│   │   └── Navigation.vue
│   ├── home/                       # Home page components
│   │   ├── Hero.vue
│   │   ├── Features.vue
│   │   └── PetShowcase.vue
│   ├── pets/                       # Pet components
│   │   ├── PetCard.vue
│   │   ├── PetGrid.vue
│   │   └── PetDetailModal.vue
│   └── shared/                     # Shared components
│       ├── SocialShare.vue
│       ├── NewsletterSignup.vue
│       └── VideoPlayer.vue
├── composables/
│   ├── useAnalytics.ts
│   ├── useSEO.ts
│   └── useAnimation.ts
├── content/                        # Markdown content
│   ├── blog/
│   ├── guides/
│   ├── legal/
│   └── press/
├── layouts/
│   ├── default.vue                 # Default layout
│   ├── landing.vue                 # Landing page layout
│   └── blog.vue                    # Blog layout
├── pages/
│   ├── index.vue                   # Home page
│   ├── features.vue                # Features page
│   ├── pokedex/
│   │   ├── index.vue               # Pet gallery
│   │   └── [id].vue                # Pet detail
│   ├── guides/
│   │   ├── index.vue               # Guides index
│   │   └── [slug].vue              # Guide detail
│   ├── blog/
│   │   ├── index.vue               # Blog index
│   │   └── [slug].vue              # Article detail
│   ├── community.vue               # Community page
│   ├── download.vue                # Download page
│   ├── press.vue                   # Press kit
│   └── legal/
│       ├── privacy.vue
│       └── terms.vue
├── plugins/
│   ├── analytics.client.ts         # Google Analytics
│   ├── gtm.client.ts               # Tag Manager
│   └── hotjar.client.ts            # Hotjar
├── public/
│   ├── robots.txt
│   ├── sitemap.xml
│   ├── favicon.ico
│   └── og-image.jpg
├── server/
│   ├── api/
│   │   ├── pets.ts                 # Pets API
│   │   ├── newsletter.ts           # Newsletter signup
│   │   └── contact.ts              # Contact form
│   └── middleware/
├── stores/
│   ├── pets.ts                     # Pet store (Pinia)
│   └── ui.ts                       # UI state
├── types/
│   ├── pets.ts
│   └── content.ts
├── utils/
│   ├── formatting.ts
│   └── validation.ts
├── app.vue                         # Root component
├── nuxt.config.ts                  # Nuxt configuration
├── tailwind.config.ts              # Tailwind config
├── tsconfig.json                   # TypeScript config
└── package.json
```

---

### Nuxt Configuration

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  // Modules
  modules: [
    '@nuxt/content', // Content management
    '@nuxt/image', // Image optimization
    '@nuxtjs/tailwindcss', // Tailwind CSS
    '@nuxt/ui', // Nuxt UI
    '@vueuse/nuxt', // VueUse utilities
    '@pinia/nuxt', // State management
    'nuxt-seo', // SEO optimization
    '@nuxtjs/robots', // robots.txt
    '@nuxtjs/sitemap', // Sitemap generation
    'nuxt-gtag', // Google Analytics
    '@nuxtjs/fontaine', // Font optimization
    '@vite-pwa/nuxt', // PWA support
  ],

  // App configuration
  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      title: 'ElementaMon - Collect, Build, Battle',
      meta: [
        {
          name: 'description',
          content:
            'Join the epic creature collection adventure combining deckbuilding strategy with roguelike gameplay.',
        },
        { name: 'theme-color', content: '#ef4444' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
      ],
    },
  },

  // Rendering
  ssr: true,

  // Nitro (server)
  nitro: {
    compressPublicAssets: true,
    prerender: {
      crawlLinks: true,
      routes: ['/', '/features', '/pokedex', '/guides', '/community', '/download'],
    },
  },

  // Nuxt Content
  content: {
    highlight: {
      theme: 'github-dark',
      preload: ['typescript', 'javascript', 'vue'],
    },
    markdown: {
      toc: {
        depth: 3,
        searchDepth: 3,
      },
    },
  },

  // Image optimization
  image: {
    cloudinary: {
      baseURL: 'https://res.cloudinary.com/elementamon/image/upload/',
    },
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536,
    },
  },

  // SEO
  seo: {
    siteName: 'ElementaMon',
    siteUrl: 'https://elementamon.com',
    description: 'Join the epic creature collection adventure',
    image: '/og-image.jpg',
    twitter: '@ElementaMon',
    locale: 'en_US',
  },

  // Google Analytics
  gtag: {
    id: 'G-XXXXXXXXXX',
  },

  // PWA
  pwa: {
    manifest: {
      name: 'ElementaMon',
      short_name: 'ElementaMon',
      description: 'Collect, Build, Battle',
      theme_color: '#ef4444',
      icons: [
        {
          src: '/icon-192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: '/icon-512.png',
          sizes: '512x512',
          type: 'image/png',
        },
      ],
    },
    workbox: {
      navigateFallback: '/',
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/api\.elementamon\.com\/.*/,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'api-cache',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 3600, // 1 hour
            },
          },
        },
      ],
    },
  },

  // Development
  devtools: { enabled: true },

  // TypeScript
  typescript: {
    strict: true,
    typeCheck: true,
  },

  // Experimental features
  experimental: {
    payloadExtraction: true,
    renderJsonPayloads: true,
    typedPages: true,
  },
});
```

---

## 📊 SEO Optimization

### Meta Tags & Open Graph

```vue
<script setup lang="ts">
useSeoMeta({
  title: 'ElementaMon - Collect, Build, Battle',
  description:
    'Join the epic creature collection adventure combining deckbuilding strategy with roguelike gameplay.',
  ogTitle: 'ElementaMon - Collect, Build, Battle',
  ogDescription: 'Join the epic creature collection adventure',
  ogImage: 'https://elementamon.com/og-image.jpg',
  ogUrl: 'https://elementamon.com',
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterSite: '@ElementaMon',
  twitterCreator: '@ElementaMon',
});

useSchemaOrg([
  // Organization
  defineOrganization({
    name: 'ElementaMon',
    url: 'https://elementamon.com',
    logo: 'https://elementamon.com/logo.png',
    sameAs: [
      'https://twitter.com/ElementaMon',
      'https://facebook.com/ElementaMon',
      'https://instagram.com/ElementaMon',
      'https://discord.gg/elementamon',
    ],
  }),

  // WebSite
  defineWebSite({
    name: 'ElementaMon',
    url: 'https://elementamon.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://elementamon.com/search?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  }),

  // VideoGame
  defineProduct({
    name: 'ElementaMon',
    description: 'Creature collection deckbuilding roguelike game',
    image: 'https://elementamon.com/og-image.jpg',
    brand: 'ElementaMon Studios',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
  }),
]);
</script>
```

### Sitemap Generation

```typescript
// server/routes/sitemap.xml.ts
export default defineEventHandler(async (event) => {
  const sitemap = [
    { loc: '/', priority: 1.0, changefreq: 'daily' },
    { loc: '/features', priority: 0.8, changefreq: 'weekly' },
    { loc: '/pokedex', priority: 0.8, changefreq: 'weekly' },
    { loc: '/guides', priority: 0.7, changefreq: 'weekly' },
    { loc: '/blog', priority: 0.7, changefreq: 'daily' },
    { loc: '/community', priority: 0.6, changefreq: 'weekly' },
    { loc: '/download', priority: 0.9, changefreq: 'weekly' },
  ];

  // Add blog posts
  const articles = await queryContent('/blog').find();
  articles.forEach((article) => {
    sitemap.push({
      loc: `/blog/${article._path}`,
      priority: 0.6,
      changefreq: 'monthly',
      lastmod: article.publishedAt,
    });
  });

  // Add pets
  const pets = await $fetch('/api/pets');
  pets.forEach((pet) => {
    sitemap.push({
      loc: `/pokedex/${pet.id}`,
      priority: 0.5,
      changefreq: 'monthly',
    });
  });

  // Generate XML
  const xml = generateSitemapXML(sitemap);

  event.node.res.setHeader('Content-Type', 'application/xml');
  return xml;
});
```

---

## 🎯 Conversion Optimization

### Call-to-Action Strategies

**Primary CTAs**:

1. "Play Free Now" - Above fold, high contrast
2. "Watch Trailer" - Secondary action
3. "Join Discord" - Community engagement
4. "Download Game" - Direct download

**A/B Testing**:

```typescript
// composables/useABTest.ts
export const useABTest = (testName: string, variants: string[]) => {
  const selectedVariant = useState(`ab-${testName}`, () => {
    // Get from cookie or randomly assign
    const stored = useCookie(`ab-${testName}`).value;
    if (stored && variants.includes(stored)) {
      return stored;
    }

    const variant = variants[Math.floor(Math.random() * variants.length)];
    useCookie(`ab-${testName}`).value = variant;

    // Track in analytics
    useGtag().event('ab_test_assign', {
      test_name: testName,
      variant: variant,
    });

    return variant;
  });

  return { variant: selectedVariant };
};
```

**Usage**:

```vue
<script setup>
const { variant } = useABTest('hero-cta', ['play-now', 'start-adventure']);
</script>

<template>
  <UButton v-if="variant === 'play-now'"> Play Free Now </UButton>
  <UButton v-else> Start Your Adventure </UButton>
</template>
```

### Newsletter Signup

```vue
<template>
  <div class="newsletter-signup">
    <UCard>
      <form @submit.prevent="handleSubmit">
        <h3 class="mb-4 text-2xl font-bold">Stay Updated</h3>
        <p class="mb-4 text-gray-600">Get the latest news, updates, and exclusive content</p>

        <div class="flex gap-2">
          <UInput
            v-model="email"
            type="email"
            placeholder="your@email.com"
            required
            :disabled="loading"
          />
          <UButton type="submit" :loading="loading" :disabled="success">
            {{ success ? 'Subscribed!' : 'Subscribe' }}
          </UButton>
        </div>

        <p v-if="error" class="mt-2 text-sm text-red-500">
          {{ error }}
        </p>
      </form>
    </UCard>
  </div>
</template>

<script setup lang="ts">
const email = ref('');
const loading = ref(false);
const success = ref(false);
const error = ref('');

const handleSubmit = async () => {
  loading.value = true;
  error.value = '';

  try {
    await $fetch('/api/newsletter/subscribe', {
      method: 'POST',
      body: { email: email.value },
    });

    success.value = true;

    // Track conversion
    useGtag().event('newsletter_signup', {
      method: 'homepage_form',
    });

    // Reset after 3 seconds
    setTimeout(() => {
      email.value = '';
      success.value = false;
    }, 3000);
  } catch (e) {
    error.value = 'Failed to subscribe. Please try again.';
  } finally {
    loading.value = false;
  }
};
</script>
```

---

## 📈 Analytics & Tracking

### Google Analytics 4

```typescript
// composables/useAnalytics.ts
export const useAnalytics = () => {
  const gtag = useGtag();

  const trackPageView = (pageName: string) => {
    gtag.pageview({
      page_title: pageName,
      page_location: window.location.href,
      page_path: window.location.pathname,
    });
  };

  const trackEvent = (eventName: string, params?: Record<string, any>) => {
    gtag.event(eventName, params);
  };

  const trackDownload = (platform: string) => {
    gtag.event('download_game', {
      platform: platform,
      download_type: 'direct',
    });
  };

  const trackVideoPlay = (videoId: string, videoTitle: string) => {
    gtag.event('video_start', {
      video_id: videoId,
      video_title: videoTitle,
    });
  };

  const trackOutboundLink = (url: string, linkText: string) => {
    gtag.event('click', {
      event_category: 'outbound',
      event_label: url,
      link_text: linkText,
    });
  };

  return {
    trackPageView,
    trackEvent,
    trackDownload,
    trackVideoPlay,
    trackOutboundLink,
  };
};
```

### Conversion Tracking

```typescript
// Track key conversions
const { trackEvent } = useAnalytics();

// Game start
trackEvent('begin_game', {
  platform: 'web',
  referrer: document.referrer,
});

// Account creation
trackEvent('sign_up', {
  method: 'email',
});

// First purchase
trackEvent('purchase', {
  transaction_id: 'TXN-123',
  value: 9.99,
  currency: 'USD',
  items: [{ item_name: 'Starter Pack' }],
});
```

---

## 🚀 Performance Optimization

### Lighthouse Score Targets

- **Performance**: 95+
- **Accessibility**: 100
- **Best Practices**: 100
- **SEO**: 100

### Optimization Techniques

**Image Optimization**:

```vue
<NuxtImg
  src="/pets/fire-dragon.jpg"
  alt="Fire Dragon Pet"
  width="400"
  height="400"
  format="webp"
  quality="80"
  loading="lazy"
  :modifiers="{ fit: 'cover' }"
/>
```

**Critical CSS**:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  experimental: {
    inlineSSRStyles: false,
  },
  css: ['~/assets/css/critical.css'],
});
```

**Code Splitting**:

```vue
<script setup>
// Lazy load heavy components
const PetViewer3D = defineAsyncComponent(() => import('~/components/pets/PetViewer3D.vue'));
</script>
```

**Font Loading**:

```vue
<script setup>
useHead({
  link: [
    {
      rel: 'preload',
      as: 'font',
      type: 'font/woff2',
      href: '/fonts/inter-var.woff2',
      crossorigin: 'anonymous',
    },
  ],
});
</script>
```

---

## 🔒 Security

### Content Security Policy

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  app: {
    head: {
      meta: [
        {
          'http-equiv': 'Content-Security-Policy',
          content: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: https://res.cloudinary.com",
            "font-src 'self' data:",
            "connect-src 'self' https://api.elementamon.com",
            "media-src 'self' https://cdn.elementamon.com",
          ].join('; '),
        },
      ],
    },
  },
});
```

### Rate Limiting

```typescript
// server/middleware/rateLimit.ts
export default defineEventHandler(async (event) => {
  const ip = getRequestIP(event);
  const path = event.node.req.url;

  // Rate limit API endpoints
  if (path?.startsWith('/api/')) {
    const requests = await redis.incr(`rate-limit:${ip}`);

    if (requests === 1) {
      await redis.expire(`rate-limit:${ip}`, 60); // 1 minute window
    }

    if (requests > 100) {
      throw createError({
        statusCode: 429,
        statusMessage: 'Too Many Requests',
      });
    }
  }
});
```

---

## 🌍 Internationalization (i18n)

### Multi-Language Support

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxtjs/i18n'],

  i18n: {
    locales: [
      { code: 'en', iso: 'en-US', file: 'en.json', name: 'English' },
      { code: 'es', iso: 'es-ES', file: 'es.json', name: 'Español' },
      { code: 'pt', iso: 'pt-BR', file: 'pt.json', name: 'Português' },
      { code: 'fr', iso: 'fr-FR', file: 'fr.json', name: 'Français' },
      { code: 'de', iso: 'de-DE', file: 'de.json', name: 'Deutsch' },
      { code: 'ja', iso: 'ja-JP', file: 'ja.json', name: '日本語' },
    ],
    defaultLocale: 'en',
    strategy: 'prefix_except_default',
    langDir: 'locales/',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      alwaysRedirect: true,
      fallbackLocale: 'en',
    },
  },
});
```

**Usage**:

```vue
<template>
  <div>
    <h1>{{ $t('home.hero.title') }}</h1>
    <p>{{ $t('home.hero.description') }}</p>
  </div>
</template>
```

---

## 📦 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

**vercel.json**:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".output/public",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nuxtjs",
  "regions": ["iad1", "sfo1", "lhr1"],
  "rewrites": [{ "source": "/(.*)", "destination": "/" }],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### Netlify

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = ".output/public"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

### Docker

```dockerfile
# Dockerfile
FROM node:22-alpine AS base
RUN npm install -g pnpm

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/.output /app/.output

EXPOSE 3000
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000

CMD ["node", ".output/server/index.mjs"]
```

---

## 📚 Development Workflow

### Quick Start

```bash
# Clone repository
git clone https://github.com/magas-xlr/elementa-mon.git
cd elementa-mon/marketing-site

# Install dependencies
pnpm install

# Set up environment
cp .env.example .env
# Edit .env with your configuration

# Start development server
pnpm dev
```

Server runs at: **http://localhost:3000**

### Development Commands

```bash
pnpm dev                  # Development server with HMR
pnpm build                # Production build
pnpm generate             # Static site generation
pnpm preview              # Preview production build
pnpm lint                 # ESLint
pnpm lint:fix             # Fix ESLint errors
pnpm format               # Format with Prettier
pnpm typecheck            # TypeScript type checking
pnpm test                 # Run tests (Vitest)
pnpm analyze              # Bundle analyzer
```

### Environment Variables

```env
# .env
NUXT_PUBLIC_SITE_URL=https://elementamon.com
NUXT_PUBLIC_API_URL=https://api.elementamon.com
NUXT_PUBLIC_GAME_URL=https://play.elementamon.com

# Analytics
NUXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NUXT_PUBLIC_GTM_ID=GTM-XXXXXXX
NUXT_PUBLIC_HOTJAR_ID=XXXXXXX

# CMS (optional)
STRAPI_URL=https://cms.elementamon.com
STRAPI_API_TOKEN=your-token

# Cloudinary
CLOUDINARY_CLOUD_NAME=elementamon
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret

# Email
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-api-key
```

---

## 🎯 Success Metrics

### Key Performance Indicators (KPIs)

**Traffic Metrics**:

- Monthly unique visitors
- Page views
- Bounce rate (<40% target)
- Average session duration (>3 min target)

**Conversion Metrics**:

- Click-through rate on CTAs (>5% target)
- Newsletter signup rate (>2% target)
- Download/signup conversion (>10% target)
- Social media follows

**Engagement Metrics**:

- Video play rate (>30% target)
- Guide page completions
- Community page visits
- Discord join rate

**Technical Metrics**:

- Lighthouse Performance (>95)
- First Contentful Paint (<1.5s)
- Time to Interactive (<3.5s)
- Core Web Vitals (all green)

---

## 📋 Summary

The ElementaMon Marketing Site is a **Nuxt 3** static/hybrid application providing:

✅ **High Performance** - 95+ Lighthouse score, optimized images, lazy loading
✅ **SEO Optimized** - SSR/SSG, meta tags, structured data, sitemap
✅ **Conversion Focused** - Strategic CTAs, A/B testing, analytics
✅ **Content Rich** - Blog, guides, pet gallery, community hub
✅ **Mobile First** - Responsive design, PWA capabilities
✅ **Multilingual** - 6+ language support with i18n
✅ **Secure** - CSP, rate limiting, HTTPS
✅ **Scalable** - Edge deployment, CDN, caching

**Tech Stack**: Nuxt 3, Vue 3, TypeScript, Tailwind CSS, Nuxt UI, Nuxt Content, Cloudinary, Vercel

**Estimated Development Time**: 6-8 weeks for MVP with 2 frontend developers
