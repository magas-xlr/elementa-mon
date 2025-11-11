# 🌐 ElementaMon Marketing Site - Quick Reference

**Public-Facing Website for Player Acquisition & Brand Awareness**

---

## 📚 What Was Created

1. **MARKETING_SITE_SPEC.md** - Complete marketing site specification (12,000+ lines)
2. **MARKETING_SITE_SUMMARY.md** - This quick reference guide

---

## 🎯 Purpose

The ElementaMon Marketing Site is a high-performance, SEO-optimized public website to:

- Attract and convert new players
- Showcase game features and gameplay
- Rank high in search engines
- Build community engagement
- Provide content (blog, guides, news)
- Support press and media relations

---

## 🏗️ Technology Stack

**Framework**: Nuxt 3 (Vue.js meta-framework) ⭐

**Frontend**:

- Vue 3 with Composition API
- TypeScript 5.0
- Tailwind CSS 4
- Nuxt UI (component library)
- VueUse (utilities)
- Pinia (state management)

**Rendering**:

- SSG (Static Site Generation) - Pre-rendered pages
- SSR (Server-Side Rendering) - Dynamic content
- ISR (Incremental Static Regeneration)
- SPA (Client-side) - Interactive sections

**Content Management**:

- Nuxt Content (Markdown/YAML CMS)
- Cloudinary (Image/video CDN)

**SEO & Analytics**:

- Nuxt SEO module
- Google Analytics 4
- Google Tag Manager
- Hotjar (heatmaps)

**Performance**:

- Nuxt Image (automatic optimization)
- PWA Module
- Critical CSS
- Font optimization
- Lazy loading
- Code splitting

**Deployment**:

- Vercel (recommended)
- Netlify (alternative)
- Cloudflare Pages

---

## 📱 Key Pages & Features

### 1. Home Page (Hero Landing)

```vue
<template>
  <section class="hero min-h-screen">
    <h1 class="text-7xl">Collect. Build. Battle.</h1>
    <p class="text-2xl">Strategic creature collection meets deckbuilding</p>
    <UButton size="xl">Play Free Now</UButton>
    <video autoplay loop muted>
      <source src="/gameplay-preview.mp4" />
    </video>
  </section>
</template>
```

**Features**:

- Animated hero with floating pets
- Gameplay video preview
- Strategic CTAs (Play Now, Watch Trailer)
- Social proof (10,000+ players)
- Feature highlights grid
- Interactive pet showcase

### 2. Features Page

- Game mechanics explained
- Interactive demonstrations
- Video clips
- Comparison sliders
- Elemental type chart
- Card preview

### 3. Pokédex / Pet Gallery

- Searchable pet database
- Filter by element/rarity
- Pet detail modals
- 3D model viewer
- Stats visualization
- Evolution trees

### 4. Guides & Wiki

- Getting started tutorials
- Strategy guides
- Deck building tips
- Battle tactics
- Pet recommendations
- Markdown-based content

### 5. Community Hub

- Featured content
- Creator spotlights
- Discord integration
- Social media feed
- Fan art gallery
- User deck submissions

### 6. News & Blog

- Patch notes
- Dev blogs
- Game updates
- New pet reveals
- Event announcements
- Strategy articles

### 7. Download Page

- Multi-platform support (Web, Desktop, Mobile)
- System requirements
- Direct downloads
- App store links

### 8. Press Kit

- Media assets
- Logos & branding
- Screenshots
- Trailers
- Fact sheet
- Press contacts

### 9. Legal Pages

- Privacy Policy
- Terms of Service
- Cookie Policy
- GDPR compliance

---

## 🎨 Design System

**Brand Colors**:

```typescript
{
  primary: '#ef4444',    // Fire Red
  secondary: '#3b82f6',  // Water Blue
  accent: '#10b981',     // Earth Green

  // Elemental colors (match game)
  fire: '#ff4500',
  water: '#1e90ff',
  electric: '#ffd700',
  // ... 9 elements total
}
```

**Typography**:

- Display: Montserrat (headlines)
- Body: Inter (text)
- Mono: JetBrains Mono (code)

**Component Library**: Nuxt UI

- Button, Input, Card, Modal
- Navigation, Dropdown, Tabs
- Alert, Badge, Avatar
- Form validation
- Dark mode support

---

## 🚀 Performance Targets

**Lighthouse Scores**:

- Performance: 95+
- Accessibility: 100
- Best Practices: 100
- SEO: 100

**Core Web Vitals**:

- First Contentful Paint: <1.5s
- Time to Interactive: <3.5s
- Cumulative Layout Shift: <0.1

---

## 📊 SEO Optimization

**Features**:

- Server-side rendering (SSR)
- Meta tags & Open Graph
- Structured data (Schema.org)
- Automatic sitemap generation
- robots.txt
- Canonical URLs
- Social media cards

**Example**:

```typescript
useSeoMeta({
  title: 'ElementaMon - Collect, Build, Battle',
  description: 'Strategic creature collection game',
  ogImage: '/og-image.jpg',
  twitterCard: 'summary_large_image',
});
```

---

## 🎯 Conversion Optimization

**Primary CTAs**:

1. "Play Free Now" - Main action
2. "Watch Trailer" - Engagement
3. "Join Discord" - Community
4. "Download Game" - Direct install

**A/B Testing**:

```typescript
const { variant } = useABTest('hero-cta', ['play-now', 'start-adventure']);
```

**Newsletter Signup**:

- Email capture
- Mailchimp/SendGrid integration
- Confirmation emails

**Analytics Tracking**:

```typescript
// Track key events
trackEvent('download_game', { platform: 'windows' });
trackEvent('video_start', { video_id: 'gameplay-trailer' });
trackEvent('sign_up', { method: 'email' });
```

---

## 🌍 Internationalization

**Supported Languages**:

- English (default)
- Español (Spanish)
- Português (Portuguese)
- Français (French)
- Deutsch (German)
- 日本語 (Japanese)

**Implementation**:

```vue
<template>
  <h1>{{ $t('home.hero.title') }}</h1>
</template>
```

**Configuration**:

```typescript
i18n: {
  locales: ['en', 'es', 'pt', 'fr', 'de', 'ja'],
  defaultLocale: 'en',
  strategy: 'prefix_except_default',
}
```

---

## 📦 Project Structure

```
marketing-site/
├── assets/               # CSS, images, fonts
├── components/           # Vue components
│   ├── ui/              # UI components
│   ├── layout/          # Header, Footer, Nav
│   ├── home/            # Home page components
│   ├── pets/            # Pet components
│   └── shared/          # Shared components
├── composables/          # Vue composables
├── content/              # Markdown content
│   ├── blog/
│   ├── guides/
│   └── legal/
├── layouts/              # Page layouts
├── pages/                # Routes
│   ├── index.vue        # Home
│   ├── features.vue
│   ├── pokedex/
│   ├── guides/
│   ├── blog/
│   ├── community.vue
│   ├── download.vue
│   └── press.vue
├── plugins/              # Nuxt plugins
├── public/               # Static assets
├── server/               # API routes
│   └── api/
├── stores/               # Pinia stores
├── types/                # TypeScript types
├── nuxt.config.ts        # Nuxt configuration
└── package.json
```

---

## 🛠️ Development Setup

### Prerequisites

```bash
Node.js >= 22.11.0
pnpm >= 9.0.0
```

### Installation

```bash
# Clone repository
git clone https://github.com/magas-xlr/elementa-mon.git
cd elementa-mon/marketing-site

# Install dependencies
pnpm install

# Set up environment
cp .env.example .env

# Start development
pnpm dev
```

### Commands

```bash
pnpm dev          # Development server (localhost:3000)
pnpm build        # Production build
pnpm generate     # Static site generation
pnpm preview      # Preview production
pnpm lint         # Lint code
pnpm typecheck    # Type checking
pnpm test         # Run tests
```

---

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install CLI
npm install -g vercel

# Deploy
vercel --prod
```

### Netlify

```bash
# Install CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod
```

### Docker

```bash
# Build image
docker build -t elementamon-marketing .

# Run container
docker run -p 3000:3000 elementamon-marketing
```

---

## 📈 Success Metrics

**Traffic KPIs**:

- Monthly unique visitors
- Page views
- Bounce rate (<40%)
- Session duration (>3 min)

**Conversion KPIs**:

- CTA click-through rate (>5%)
- Newsletter signup (>2%)
- Download/signup conversion (>10%)

**Engagement KPIs**:

- Video play rate (>30%)
- Guide completions
- Community visits
- Discord joins

**Technical KPIs**:

- Lighthouse Performance (>95)
- FCP (<1.5s)
- TTI (<3.5s)
- All Core Web Vitals green

---

## 🤖 GitHub Copilot Integration

### Quick Prompts for Marketing Site

**1. Create a new page**

```
@workspace Create a new /tournaments page in #file:pages/ showing upcoming
and past ElementaMon tournaments with registration
```

**2. Add a component**

```
Create a PetComparison component that shows side-by-side stats of two pets
with radar charts using Recharts
```

**3. Optimize SEO**

```
@workspace Add complete SEO meta tags and structured data for the
#file:pages/pokedex/[id].vue pet detail page
```

**4. Add analytics**

```
Add GA4 event tracking for all CTA buttons on #file:pages/index.vue
using the useAnalytics composable
```

**5. Create content**

```
Create a new blog post in #file:content/blog/ about the new Ice-type pets
with frontmatter including title, description, author, date, and tags
```

---

## 📚 Documentation Structure

```
elementa-mon/
├── README.md                          # Main project overview
├── MARKETING_SITE_SPEC.md             # Complete marketing site spec
├── MARKETING_SITE_SUMMARY.md          # This quick reference
├── BACKOFFICE_SPEC.md                 # Admin platform spec
├── BACKOFFICE_SUMMARY.md              # Backoffice quick ref
├── .github/
│   └── copilot-instructions.md        # AI assistant context
└── marketing-site/                     # Marketing site project
    └── [Nuxt 3 project files]
```

---

## ⚡ Quick Start Checklist

1. ✅ Review MARKETING_SITE_SPEC.md
2. ✅ Set up Nuxt 3 project structure
3. ✅ Configure environment variables
4. ✅ Install dependencies
5. ✅ Create design system (colors, typography)
6. ✅ Build component library
7. ✅ Implement home page
8. ✅ Add SEO optimization
9. ✅ Set up analytics
10. ✅ Configure deployment
11. ✅ Add content (blog, guides)
12. ✅ Test performance (Lighthouse)
13. ✅ Deploy to production

---

## 🎯 Key Benefits

✅ **High Performance** - 95+ Lighthouse, <3s load time
✅ **SEO Optimized** - SSR, meta tags, structured data
✅ **Conversion Focused** - Strategic CTAs, A/B testing
✅ **Mobile First** - Responsive, PWA capabilities
✅ **Content Rich** - Blog, guides, community
✅ **Multilingual** - 6+ languages supported
✅ **Secure** - CSP, rate limiting, HTTPS
✅ **Scalable** - Edge deployment, CDN

---

## 📞 Support

**Documentation**: See MARKETING_SITE_SPEC.md for complete details

**Nuxt Resources**:

- Nuxt 3 Docs: https://nuxt.com/docs
- Nuxt UI: https://ui.nuxt.com
- Nuxt Content: https://content.nuxt.com

**Development Time**: 6-8 weeks for MVP (2 frontend developers)

---

**Last Updated**: November 11, 2025
