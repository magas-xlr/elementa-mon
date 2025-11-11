# 🌐 Marketing Site - Landing Page & Marketing Platform

Nuxt 3 static/hybrid website for player acquisition and community engagement.

## 📖 Overview

Public-facing marketing website for:

- **Player Acquisition** - Convert visitors to players
- **Brand Awareness** - Showcase game features
- **SEO Optimization** - Rank high in search engines
- **Community Building** - Social media engagement
- **Content Marketing** - Blog, guides, patch notes
- **Press & Media** - Press kits, media assets

## 🏗️ Technology Stack

### Frontend

- **Nuxt 3** - Vue.js meta-framework
- **Vue 3** - Composition API with `<script setup>`
- **TypeScript 5.0** - Type safety
- **Tailwind CSS 4** - Utility-first styling
- **Nuxt UI** - Pre-built Vue components
- **VueUse** - Composition utilities
- **Pinia** - State management

### Rendering

- **SSG** - Static Site Generation
- **SSR** - Server-Side Rendering
- **ISR** - Incremental Static Regeneration
- **SPA** - Client-side for interactive sections

### Content Management

- **Nuxt Content** - Markdown/YAML CMS
- **Cloudinary** - Image/video CDN
- **Git-based CMS** - Tina CMS or Decap CMS

### SEO & Analytics

- **Nuxt SEO** - Meta tags, Open Graph
- **Google Analytics 4** - User behavior tracking
- **Google Tag Manager** - Marketing tags
- **Hotjar** - Heatmaps and recordings
- **Plausible** - Privacy-friendly analytics

### Performance

- **Nuxt Image** - Image optimization
- **PWA Module** - Progressive Web App
- **Critical CSS** - Above-the-fold optimization
- **Font Optimization** - Self-hosted fonts
- **Lazy Loading** - Images, videos, components

### Infrastructure

- **Vercel/Netlify** - Edge deployment with CDN
- **Cloudflare Pages** - Global CDN
- **GitHub Actions** - CI/CD

---

## 📁 Project Structure

```
marketing-site/
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
└── package.json
```

---

## 🎨 Pages

### 1. Home Page (Hero Landing)

**Above the Fold**:

- Animated hero with gradient background
- Main headline: "Collect. Build. Battle."
- Primary CTA: "Play Free Now"
- Secondary CTA: "Watch Trailer"
- Social proof: "Join 10,000+ players"
- Animated gameplay video preview

**Features Section**:

- 3-column feature grid with icons
- Animated counters (players, pets, etc.)
- Interactive pet carousel
- Element type visualization

**How It Works**:

- Step-by-step visual guide
- Interactive tutorial preview
- Animated battle simulation

### 2. Features Page

**Game Mechanics**:

- Deckbuilding strategy
- Creature collection
- Turn-based combat
- Roguelike adventure
- Pet evolution
- Real-time multiplayer

**Interactive Comparisons**:

- Before/After evolution sliders
- Damage calculator widget
- Elemental type chart
- Card preview on hover

### 3. Pokédex / Pet Gallery

**Pet Browser**:

- Grid layout with filters
- Element type filtering
- Rarity filtering
- Search functionality
- 3D pet model viewer (Three.js)

**Pet Detail View**:

- Stats visualization (radar chart)
- Evolution tree
- Ability descriptions
- Lore and backstory

### 4. Gameplay Guide / Wiki

**Content Structure**:

- Markdown-based articles
- Search functionality
- Category browsing
- Tag filtering
- Table of contents
- Dark mode support

**Topics**:

- Getting started
- Deckbuilding
- Battle tactics
- Pet evolution
- Elemental types
- Card types

### 5. Community & Social

**Community Hub**:

- Featured content
- Creator spotlights
- Discord integration
- Social feed (Twitter/X, YouTube)
- Fan art gallery
- User deck submissions

### 6. News & Blog

**Blog System**:

- Hero featured article
- Article grid with pagination
- Category filtering
- RSS feed

**Content Categories**:

- Patch notes
- Dev blogs
- Game updates
- Balance changes
- New pet reveals
- Event announcements

### 7. Download / Play Page

**Multi-Platform CTA**:

- Web browser (instant play)
- Desktop apps (Windows, macOS, Linux)
- Mobile apps (iOS, Android)
- System requirements

### 8. Press & Media Kit

**Press Resources**:

- Quick facts
- Media assets (logos, screenshots, videos)
- Fact sheet (PDF)
- Press contact information

### 9. Legal Pages

- Privacy Policy
- Terms of Service
- Cookie Policy
- DMCA Policy
- COPPA Compliance
- GDPR Information
- Refund Policy

---

## 🚀 Development

### Setup

```powershell
# Install dependencies
pnpm install

# Set up environment
cp .env.example .env
# Edit .env

# Start development server
pnpm dev
```

Server runs at: **http://localhost:3000**

### Commands

```powershell
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

---

## 📊 SEO Optimization

### Meta Tags

```vue
<script setup lang="ts">
useSeoMeta({
  title: 'ElementaMon - Collect, Build, Battle',
  description: 'Join the epic creature collection adventure',
  ogTitle: 'ElementaMon - Collect, Build, Battle',
  ogDescription: 'Join the epic creature collection adventure',
  ogImage: 'https://elementamon.com/og-image.jpg',
  ogUrl: 'https://elementamon.com',
  twitterCard: 'summary_large_image',
  twitterSite: '@ElementaMon',
});
</script>
```

### Structured Data

```typescript
useSchemaOrg([
  defineOrganization({
    name: 'ElementaMon',
    url: 'https://elementamon.com',
    logo: 'https://elementamon.com/logo.png',
    sameAs: ['https://twitter.com/ElementaMon', 'https://discord.gg/elementamon'],
  }),
  defineWebSite({
    name: 'ElementaMon',
    url: 'https://elementamon.com',
  }),
]);
```

---

## 🎯 Conversion Optimization

### Call-to-Action Strategies

**Primary CTAs**:

1. "Play Free Now" - Above fold
2. "Watch Trailer" - Secondary action
3. "Join Discord" - Community
4. "Download Game" - Direct download

### A/B Testing

```typescript
// composables/useABTest.ts
export const useABTest = (testName: string, variants: string[]) => {
  const variant = useState(`ab-${testName}`, () => {
    const stored = useCookie(`ab-${testName}`).value;
    if (stored && variants.includes(stored)) return stored;

    const newVariant = variants[Math.floor(Math.random() * variants.length)];
    useCookie(`ab-${testName}`).value = newVariant;

    useGtag().event('ab_test_assign', {
      test_name: testName,
      variant: newVariant,
    });

    return newVariant;
  });

  return { variant };
};
```

### Newsletter Signup

```vue
<template>
  <form @submit.prevent="handleSubmit">
    <UInput v-model="email" type="email" placeholder="your@email.com" required />
    <UButton type="submit" :loading="loading">
      {{ success ? 'Subscribed!' : 'Subscribe' }}
    </UButton>
  </form>
</template>

<script setup lang="ts">
const email = ref('');
const loading = ref(false);
const success = ref(false);

const handleSubmit = async () => {
  loading.value = true;
  try {
    await $fetch('/api/newsletter/subscribe', {
      method: 'POST',
      body: { email: email.value },
    });
    success.value = true;
    useGtag().event('newsletter_signup');
  } catch (e) {
    // Handle error
  } finally {
    loading.value = false;
  }
};
</script>
```

---

## 📈 Analytics

### Google Analytics 4

```typescript
// composables/useAnalytics.ts
export const useAnalytics = () => {
  const gtag = useGtag();

  const trackPageView = (pageName: string) => {
    gtag.pageview({
      page_title: pageName,
      page_location: window.location.href,
    });
  };

  const trackEvent = (eventName: string, params?: Record<string, any>) => {
    gtag.event(eventName, params);
  };

  const trackDownload = (platform: string) => {
    gtag.event('download_game', {
      platform,
      download_type: 'direct',
    });
  };

  return { trackPageView, trackEvent, trackDownload };
};
```

---

## ⚡ Performance

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
  alt="Fire Dragon"
  width="400"
  height="400"
  format="webp"
  loading="lazy"
/>
```

**Code Splitting**:

```vue
<script setup>
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

## 🌍 Internationalization

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
  },
});
```

---

## 🎯 Best Practices

1. **Use SSG** for static pages (home, features, legal)
2. **Use SSR** for dynamic content (blog, guides)
3. **Optimize images** with Nuxt Image
4. **Lazy load** below-the-fold content
5. **Implement PWA** for offline support
6. **Use Lighthouse CI** in CI/CD
7. **Monitor Core Web Vitals**
8. **A/B test CTAs**
9. **Track conversions**
10. **Keep SEO updated**

---

## 📚 Resources

- **Nuxt 3**: https://nuxt.com/docs
- **Nuxt UI**: https://ui.nuxt.com
- **Nuxt Content**: https://content.nuxt.com
- **Nuxt SEO**: https://nuxtseo.com
- **VueUse**: https://vueuse.org
- **Pinia**: https://pinia.vuejs.org
