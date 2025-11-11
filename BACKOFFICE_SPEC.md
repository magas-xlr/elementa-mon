# 🎛️ ElementaMon Backoffice - Admin Platform Specification

**Employee Management & Support Dashboard**

---

## 📖 Overview

The ElementaMon Backoffice is a comprehensive admin platform built with modern web technologies to manage game operations, support players, monitor systems, and analyze data. This internal tool empowers employees to efficiently handle customer support, content moderation, game balance, and business analytics.

### Purpose

- **Customer Support**: Handle player tickets, account issues, and in-game problems
- **Content Moderation**: Review user-generated content and AI-generated assets
- **Game Management**: Balance game mechanics, manage events, and update content
- **Analytics & Reporting**: Monitor KPIs, player behavior, and system health
- **User Management**: Handle accounts, bans, refunds, and permissions
- **Operations**: Monitor microservices, AI costs, and infrastructure

---

## 🏗️ Technology Stack

### Option 1: Next.js 15 (Recommended) ⭐

**Best for: Full-stack, SEO, performance, and rapid development**

#### Frontend

- **Next.js 15** - React framework with App Router
- **React 19** - Latest React with Server Components
- **TypeScript 5.0** - Type safety
- **Tailwind CSS 4** - Utility-first styling
- **shadcn/ui** - High-quality component library
- **Radix UI** - Accessible primitives
- **Recharts** - Data visualization
- **TanStack Query (React Query)** - Data fetching & caching
- **Zustand** - Lightweight state management
- **React Hook Form** - Form handling with validation
- **Zod** - Schema validation

#### Backend (Next.js API Routes)

- **Next.js API Routes** - Serverless functions
- **Prisma ORM** - Database toolkit
- **tRPC** - End-to-end type-safe APIs
- **NextAuth.js** - Authentication
- **PostgreSQL** - Primary database
- **Redis** - Caching & sessions

#### Infrastructure

- **Vercel** - Deployment & hosting
- **GitHub Actions** - CI/CD
- **Docker** - Containerization
- **Turborepo** - Monorepo build system

---

### Option 2: React (Vite) + Express

**Best for: Maximum flexibility and microservice integration**

#### Frontend

- **Vite 6** - Fast build tool
- **React 19** - UI library
- **TypeScript 5.0** - Type safety
- **React Router v7** - Client-side routing
- **Material UI v6** - Enterprise component library
- **Recharts** - Charts and graphs
- **TanStack Query** - Server state management
- **Redux Toolkit** - Global state (if needed)
- **Formik + Yup** - Forms and validation
- **Axios** - HTTP client

#### Backend

- **Express.js** - Node.js framework
- **TypeScript** - Type safety
- **Prisma** - ORM
- **Passport.js** - Authentication
- **Bull** - Job queue with Redis
- **Winston** - Logging
- **Helmet** - Security middleware
- **Rate Limiting** - API protection

#### Infrastructure

- **AWS ECS** - Container orchestration
- **Nginx** - Reverse proxy
- **GitHub Actions** - CI/CD
- **Docker Compose** - Local development

---

### Option 3: Astro + React Islands

**Best for: Static content with interactive islands, optimal performance**

#### Frontend

- **Astro 4** - Static site generator
- **React 19** - Interactive islands
- **TypeScript 5.0** - Type safety
- **Tailwind CSS** - Styling
- **Nanostores** - Tiny state management
- **Preact** - Lightweight React alternative for islands
- **Chart.js** - Lightweight charts

#### Backend

- **Astro Server Endpoints** - API routes
- **Supabase** - Backend-as-a-Service
- **PostgreSQL** - Database (via Supabase)
- **Redis** - Caching

#### Infrastructure

- **Netlify/Vercel** - Static hosting with edge functions
- **GitHub Actions** - CI/CD

---

## 🎯 Recommended: Next.js 15 Architecture

### Project Structure

```
backoffice/
├── apps/
│   ├── admin/                          # Main admin dashboard (Next.js)
│   │   ├── src/
│   │   │   ├── app/                    # Next.js App Router
│   │   │   │   ├── (auth)/            # Auth routes group
│   │   │   │   │   ├── login/
│   │   │   │   │   └── layout.tsx
│   │   │   │   ├── (dashboard)/       # Dashboard routes group
│   │   │   │   │   ├── layout.tsx     # Shared dashboard layout
│   │   │   │   │   ├── page.tsx       # Dashboard home
│   │   │   │   │   ├── players/       # Player management
│   │   │   │   │   ├── support/       # Support tickets
│   │   │   │   │   ├── moderation/    # Content moderation
│   │   │   │   │   ├── analytics/     # Analytics & reports
│   │   │   │   │   ├── content/       # Game content management
│   │   │   │   │   ├── system/        # System monitoring
│   │   │   │   │   └── settings/      # Settings
│   │   │   │   ├── api/               # API routes
│   │   │   │   │   ├── auth/
│   │   │   │   │   ├── players/
│   │   │   │   │   ├── tickets/
│   │   │   │   │   ├── analytics/
│   │   │   │   │   └── trpc/         # tRPC endpoints
│   │   │   │   ├── layout.tsx         # Root layout
│   │   │   │   └── page.tsx           # Home redirect
│   │   │   ├── components/
│   │   │   │   ├── ui/                # shadcn/ui components
│   │   │   │   ├── layout/            # Layout components
│   │   │   │   │   ├── sidebar.tsx
│   │   │   │   │   ├── header.tsx
│   │   │   │   │   └── breadcrumbs.tsx
│   │   │   │   ├── players/           # Player-specific components
│   │   │   │   ├── tickets/           # Ticket components
│   │   │   │   ├── charts/            # Chart components
│   │   │   │   └── moderation/        # Moderation components
│   │   │   ├── lib/
│   │   │   │   ├── api/               # API clients
│   │   │   │   ├── hooks/             # Custom React hooks
│   │   │   │   ├── utils/             # Utility functions
│   │   │   │   ├── validations/       # Zod schemas
│   │   │   │   └── trpc/              # tRPC setup
│   │   │   ├── server/
│   │   │   │   ├── routers/           # tRPC routers
│   │   │   │   ├── services/          # Business logic
│   │   │   │   └── db/                # Database access
│   │   │   ├── types/
│   │   │   └── styles/
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── migrations/
│   │   ├── public/
│   │   ├── next.config.js
│   │   ├── tsconfig.json
│   │   └── package.json
├── packages/
│   ├── shared-types/                   # Shared TypeScript types
│   ├── ui-components/                  # Shared UI components
│   └── api-client/                     # Shared API client
├── docker/
│   ├── Dockerfile.admin
│   └── docker-compose.yml
├── .github/
│   └── workflows/
│       └── deploy-backoffice.yml
├── turbo.json
└── package.json
```

---

## 🎨 UI/UX Design System

### Color Palette

```typescript
const colors = {
  // Brand colors
  primary: {
    50: '#f0f9ff',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
  },

  // Status colors
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',

  // Semantic colors
  critical: '#dc2626',
  moderate: '#f59e0b',
  low: '#10b981',

  // Background
  background: '#f9fafb',
  surface: '#ffffff',
  elevated: '#f3f4f6',

  // Text
  text: {
    primary: '#111827',
    secondary: '#6b7280',
    tertiary: '#9ca3af',
  },
};
```

### Typography

```typescript
const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'monospace'],
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
  },
};
```

### Component Library: shadcn/ui

Pre-built components:

- Button, Input, Select, Checkbox, Radio
- Dialog, Sheet, Popover, Dropdown Menu
- Table, Data Table (with sorting, filtering, pagination)
- Card, Tabs, Accordion
- Toast notifications
- Badge, Avatar, Skeleton
- Form with validation
- Command palette (Cmd+K)

---

## 📱 Features & Modules

### 1. Dashboard (Home)

**Overview Screen**

```typescript
interface DashboardMetrics {
  activeUsers: {
    current: number;
    trend: number; // % change
    sparkline: number[];
  };
  activeTickets: {
    total: number;
    urgent: number;
    trend: number;
  };
  revenue: {
    today: number;
    month: number;
    trend: number;
  };
  aiCosts: {
    today: number;
    month: number;
    budget: number;
    percentUsed: number;
  };
  systemHealth: {
    status: 'healthy' | 'degraded' | 'down';
    services: ServiceStatus[];
  };
}
```

**Components:**

- Real-time metrics cards
- Activity feed
- Quick actions menu
- Service status indicators
- Recent tickets/alerts
- Performance charts (last 24h)

---

### 2. Player Management

**Player Search & Filtering**

```typescript
interface PlayerSearchParams {
  query?: string; // Email, username, ID
  level?: { min: number; max: number };
  accountStatus?: 'active' | 'suspended' | 'banned';
  createdDate?: { from: Date; to: Date };
  lastLogin?: { from: Date; to: Date };
  purchaseHistory?: 'paid' | 'free';
  tags?: string[];
}
```

**Player Detail View**

- Account overview (ID, email, username, status)
- Profile information (level, experience, join date)
- Gameplay statistics (wins, losses, hours played)
- Inventory (pets, cards, items)
- Purchase history
- Transaction log
- Support ticket history
- Account actions (suspend, ban, unban, delete)
- Add internal notes
- Send in-game mail

**Quick Actions:**

- Grant items/currency
- Adjust level/experience
- Reset password
- Verify email
- Enable/disable account
- Apply compensations

---

### 3. Support Ticket System

**Ticket Dashboard**

```typescript
interface SupportTicket {
  id: string;
  ticketNumber: string;
  playerId: string;
  playerEmail: string;
  playerUsername: string;
  category: TicketCategory;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'pending' | 'resolved' | 'closed';
  subject: string;
  description: string;
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
  firstResponseTime?: number; // minutes
  resolvedAt?: Date;
  tags: string[];
  attachments: Attachment[];
}

type TicketCategory =
  | 'account_issue'
  | 'payment_issue'
  | 'technical_bug'
  | 'gameplay_question'
  | 'report_player'
  | 'content_issue'
  | 'feature_request'
  | 'other';
```

**Features:**

- Ticket queue with filters and sorting
- Auto-assignment based on category
- Real-time ticket updates (WebSocket)
- Internal notes (not visible to player)
- Canned responses library
- Ticket templates
- SLA tracking (response time, resolution time)
- Email integration
- Attachment support
- Ticket history and audit log
- Escalation workflow
- Merge duplicate tickets

**Ticket Detail View:**

- Player information sidebar
- Conversation thread
- Rich text editor
- File attachments
- Quick actions (grant items, adjust account)
- Internal notes
- Status and priority controls
- Assignment dropdown
- Related tickets

---

### 4. Content Moderation

**Moderation Queue**

```typescript
interface ModerationItem {
  id: string;
  type: 'user_content' | 'ai_generated' | 'report';
  contentType: 'username' | 'pet_name' | 'deck_name' | 'chat_message' | 'sprite' | 'dialogue';
  content: string | { url: string };
  submittedBy: string;
  submittedAt: Date;
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  moderatedBy?: string;
  moderatedAt?: Date;
  reason?: string;
  aiModerationScore: {
    hate: number;
    harassment: number;
    selfHarm: number;
    sexual: number;
    violence: number;
    overall: number;
  };
  reportCount?: number;
  reports?: PlayerReport[];
}

interface PlayerReport {
  reportedBy: string;
  reason: string;
  timestamp: Date;
  evidence?: string[];
}
```

**Features:**

- Moderation queue with filtering
- Bulk actions (approve/reject multiple)
- AI-assisted flagging (OpenAI Moderation API)
- Image preview and analysis
- Text content review
- Player report management
- Auto-moderation rules
- Pattern detection (banned words, regex)
- History of moderated content
- Appeal system

**Content Types to Moderate:**

- User-submitted names (pets, decks, usernames)
- AI-generated pet sprites (before publishing)
- AI-generated NPC dialogue (quality check)
- Chat messages (reports)
- Custom pet descriptions
- Player-to-player communications

---

### 5. Analytics & Reporting

**Player Analytics**

```typescript
interface PlayerAnalytics {
  totalPlayers: number;
  activeUsers: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  retention: {
    day1: number;
    day7: number;
    day30: number;
  };
  demographics: {
    countries: Record<string, number>;
    platforms: Record<string, number>;
  };
  churn: {
    rate: number;
    reasons: Record<string, number>;
  };
}
```

**Gameplay Analytics**

```typescript
interface GameplayAnalytics {
  battles: {
    total: number;
    pvp: number;
    pve: number;
    avgDuration: number;
  };
  decks: {
    mostPopularCards: CardStats[];
    elementalDistribution: Record<ElementalType, number>;
    avgDeckPower: number;
  };
  pets: {
    mostOwned: PetStats[];
    mostUsedInBattle: PetStats[];
    evolutionRate: number;
  };
  progression: {
    avgLevel: number;
    completionRates: Record<string, number>;
  };
}
```

**Revenue Analytics**

```typescript
interface RevenueAnalytics {
  revenue: {
    total: number;
    daily: TimeSeries[];
    monthly: TimeSeries[];
  };
  arpu: number; // Average Revenue Per User
  arppu: number; // Average Revenue Per Paying User
  conversionRate: number;
  ltv: number; // Lifetime Value
  topSpenders: PlayerRevenue[];
  purchaseDistribution: {
    items: Record<string, number>;
    categories: Record<string, number>;
  };
}
```

**AI Cost Analytics**

```typescript
interface AICostAnalytics {
  totalCost: number;
  breakdown: {
    dialogue: number;
    images: number;
    voice: number;
    moderation: number;
  };
  byProvider: Record<string, number>;
  trend: TimeSeries[];
  efficiency: {
    cacheHitRate: number;
    avgCostPerRequest: number;
    costPerUser: number;
  };
  budget: {
    monthly: number;
    used: number;
    remaining: number;
  };
}
```

**Reporting Features:**

- Interactive charts (Recharts)
- Date range selector
- Export to CSV/PDF
- Scheduled reports (email)
- Custom dashboards
- Real-time metrics
- Funnel analysis
- Cohort analysis
- A/B test results

---

### 6. Game Content Management

**Card Management**

```typescript
interface CardManagement {
  id: string;
  name: string;
  type: CardType;
  elementalType: ElementalType;
  manaCost: ManaCost;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  description: string;
  effects: CardEffect[];
  artwork: string; // URL
  balanceStats: {
    pickRate: number;
    winRate: number;
    avgDamage: number;
  };
  status: 'active' | 'disabled' | 'testing';
}
```

**Features:**

- Card CRUD operations
- Balance adjustments (stats, costs)
- A/B testing different card versions
- Card performance analytics
- Artwork approval workflow
- Bulk import/export
- Version history
- Rollback functionality

**Pet Management**

- Pet species CRUD
- Evolution tree editor
- Stat balancing
- Sprite management
- Skill assignment
- Spawn rate configuration

**Event Management**

- Create/edit special events
- Set time windows
- Configure rewards
- Limited-time content
- Seasonal events
- Battle tournaments

**Economy Management**

- Item pricing
- Currency balancing
- Shop inventory
- Special offers/bundles
- Daily deals configuration
- Drop rate tables

---

### 7. System Monitoring

**Service Health Dashboard**

```typescript
interface ServiceHealth {
  services: {
    name: string;
    status: 'healthy' | 'degraded' | 'down';
    uptime: number;
    responseTime: number;
    errorRate: number;
    lastCheck: Date;
  }[];
  infrastructure: {
    cpu: number;
    memory: number;
    disk: number;
    network: number;
  };
  databases: {
    name: string;
    type: 'postgresql' | 'mongodb' | 'redis';
    status: string;
    connections: number;
    queryTime: number;
  }[];
}
```

**Features:**

- Real-time service status
- Performance metrics
- Error logs viewer
- Request tracing
- Database query analyzer
- API endpoint monitoring
- WebSocket connection tracking
- Cache hit/miss rates
- Alert configuration
- Incident management

**Log Viewer**

- Centralized log aggregation
- Search and filtering
- Log levels (debug, info, warn, error)
- Stack trace viewer
- Export logs
- Real-time tail

**Alert Management**

- Configure alert thresholds
- Notification channels (email, Slack, SMS)
- Alert history
- On-call schedules
- Escalation policies

---

### 8. User Management (Internal)

**Employee Accounts**

```typescript
interface EmployeeAccount {
  id: string;
  email: string;
  fullName: string;
  role: EmployeeRole;
  permissions: Permission[];
  department: string;
  status: 'active' | 'inactive';
  lastLogin: Date;
  createdAt: Date;
}

type EmployeeRole =
  | 'super_admin'
  | 'admin'
  | 'support_agent'
  | 'content_moderator'
  | 'game_designer'
  | 'data_analyst'
  | 'developer';

type Permission =
  | 'view_players'
  | 'edit_players'
  | 'ban_players'
  | 'view_tickets'
  | 'assign_tickets'
  | 'resolve_tickets'
  | 'moderate_content'
  | 'edit_game_content'
  | 'view_analytics'
  | 'manage_events'
  | 'system_admin';
```

**Features:**

- Employee account management
- Role-based access control (RBAC)
- Permission granularity
- Activity audit log
- Two-factor authentication (2FA)
- SSO integration (Google Workspace, Azure AD)
- Session management
- Password policies

---

### 9. Settings & Configuration

**General Settings**

- Game constants (max hand size, turn timer, etc.)
- Feature flags (enable/disable features)
- Maintenance mode
- Message of the day
- Rate limiting configuration

**Email Templates**

- Welcome email
- Password reset
- Purchase confirmation
- Event announcements
- Support notifications

**Notification Settings**

- Push notification templates
- In-game notifications
- Email campaign management

**API Configuration**

- External API keys (OpenAI, ElevenLabs, etc.)
- Rate limits
- Webhook configurations
- CORS settings

---

## 🔐 Authentication & Authorization

### NextAuth.js Configuration

```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import AzureADProvider from 'next-auth/providers/azure-ad';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          hd: 'elementamon.com', // Restrict to company domain
        },
      },
    }),
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
      tenantId: process.env.AZURE_AD_TENANT_ID,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // Validate against employee database
        const employee = await validateEmployee(credentials);
        return employee;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.permissions = user.permissions;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.role = token.role;
      session.user.permissions = token.permissions;
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

### Role-Based Access Control

```typescript
// lib/auth/permissions.ts
export const PERMISSIONS = {
  PLAYERS: {
    VIEW: 'players:view',
    EDIT: 'players:edit',
    BAN: 'players:ban',
    DELETE: 'players:delete',
    GRANT_ITEMS: 'players:grant_items',
  },
  TICKETS: {
    VIEW: 'tickets:view',
    ASSIGN: 'tickets:assign',
    RESPOND: 'tickets:respond',
    RESOLVE: 'tickets:resolve',
    DELETE: 'tickets:delete',
  },
  MODERATION: {
    VIEW: 'moderation:view',
    APPROVE: 'moderation:approve',
    REJECT: 'moderation:reject',
    BAN_USER: 'moderation:ban_user',
  },
  CONTENT: {
    VIEW: 'content:view',
    EDIT: 'content:edit',
    CREATE: 'content:create',
    DELETE: 'content:delete',
    PUBLISH: 'content:publish',
  },
  ANALYTICS: {
    VIEW: 'analytics:view',
    EXPORT: 'analytics:export',
  },
  SYSTEM: {
    VIEW: 'system:view',
    CONFIGURE: 'system:configure',
    MAINTENANCE: 'system:maintenance',
  },
};

export const ROLE_PERMISSIONS = {
  super_admin: Object.values(PERMISSIONS).flatMap((p) => Object.values(p)),
  admin: [
    ...Object.values(PERMISSIONS.PLAYERS),
    ...Object.values(PERMISSIONS.TICKETS),
    ...Object.values(PERMISSIONS.MODERATION),
    ...Object.values(PERMISSIONS.CONTENT),
    ...Object.values(PERMISSIONS.ANALYTICS),
    PERMISSIONS.SYSTEM.VIEW,
  ],
  support_agent: [
    PERMISSIONS.PLAYERS.VIEW,
    PERMISSIONS.PLAYERS.EDIT,
    PERMISSIONS.PLAYERS.GRANT_ITEMS,
    ...Object.values(PERMISSIONS.TICKETS),
  ],
  content_moderator: [
    PERMISSIONS.PLAYERS.VIEW,
    ...Object.values(PERMISSIONS.MODERATION),
    PERMISSIONS.TICKETS.VIEW,
  ],
  game_designer: [
    PERMISSIONS.PLAYERS.VIEW,
    ...Object.values(PERMISSIONS.CONTENT),
    PERMISSIONS.ANALYTICS.VIEW,
  ],
  data_analyst: [
    PERMISSIONS.PLAYERS.VIEW,
    PERMISSIONS.ANALYTICS.VIEW,
    PERMISSIONS.ANALYTICS.EXPORT,
  ],
  developer: [PERMISSIONS.PLAYERS.VIEW, PERMISSIONS.SYSTEM.VIEW, PERMISSIONS.ANALYTICS.VIEW],
};
```

### Permission Middleware

```typescript
// lib/auth/middleware.ts
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function requirePermission(permission: string) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    throw new Error('Unauthorized');
  }

  const hasPermission = session.user.permissions.includes(permission);

  if (!hasPermission) {
    throw new Error('Forbidden: Insufficient permissions');
  }

  return session.user;
}

// Usage in API route
export async function GET(request: Request) {
  await requirePermission(PERMISSIONS.PLAYERS.VIEW);

  // Handle request
}
```

---

## 🛠️ Development Setup

### Prerequisites

```bash
Node.js >= 22.11.0
pnpm >= 9.0.0 (recommended over npm)
PostgreSQL >= 16
Redis >= 7
Docker >= 24.0 (optional)
```

### Installation

```bash
# Clone repository
git clone https://github.com/magas-xlr/elementa-mon.git
cd elementa-mon/backoffice

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Set up database
pnpm prisma migrate dev
pnpm prisma db seed

# Start development server
pnpm dev
```

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/elementamon_backoffice"
REDIS_URL="redis://localhost:6379"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
AZURE_AD_CLIENT_ID="your-azure-client-id"
AZURE_AD_CLIENT_SECRET="your-azure-client-secret"
AZURE_AD_TENANT_ID="your-tenant-id"

# Game API (connect to ElementaMon microservices)
GAME_API_URL="http://localhost:3001/graphql"
GAME_API_KEY="your-api-key"

# External Services
OPENAI_API_KEY="sk-..."
ELEVENLABS_API_KEY="..."

# Email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="noreply@elementamon.com"
SMTP_PASSWORD="your-password"

# Monitoring
SENTRY_DSN="your-sentry-dsn"

# Feature Flags
NEXT_PUBLIC_ENABLE_AI_MODERATION="true"
```

### Development Commands

```bash
# Development
pnpm dev                  # Start dev server (http://localhost:3000)
pnpm dev:turbo            # Start with Turbo (faster rebuilds)

# Building
pnpm build                # Build for production
pnpm start                # Start production server

# Database
pnpm prisma:migrate       # Run migrations
pnpm prisma:studio        # Open Prisma Studio (DB GUI)
pnpm prisma:seed          # Seed database

# Testing
pnpm test                 # Run unit tests
pnpm test:e2e             # Run E2E tests (Playwright)
pnpm test:coverage        # Generate coverage report

# Code Quality
pnpm lint                 # Run ESLint
pnpm lint:fix             # Fix ESLint errors
pnpm format               # Format with Prettier
pnpm typecheck            # TypeScript type checking

# Docker
pnpm docker:up            # Start all services
pnpm docker:down          # Stop all services
```

---

## 📊 Database Schema (Prisma)

### Core Models

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Employee accounts
model Employee {
  id            String    @id @default(cuid())
  email         String    @unique
  fullName      String
  passwordHash  String?
  role          Role
  department    String?
  status        Status    @default(ACTIVE)
  permissions   String[]
  lastLogin     DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  tickets       Ticket[]  @relation("AssignedTickets")
  moderations   Moderation[]
  auditLogs     AuditLog[]

  @@index([email])
  @@index([role])
}

enum Role {
  SUPER_ADMIN
  ADMIN
  SUPPORT_AGENT
  CONTENT_MODERATOR
  GAME_DESIGNER
  DATA_ANALYST
  DEVELOPER
}

enum Status {
  ACTIVE
  INACTIVE
  SUSPENDED
}

// Support tickets
model Ticket {
  id              String        @id @default(cuid())
  ticketNumber    String        @unique
  playerId        String
  playerEmail     String
  playerUsername  String
  category        TicketCategory
  priority        Priority
  status          TicketStatus
  subject         String
  description     String
  assignedToId    String?
  assignedTo      Employee?     @relation("AssignedTickets", fields: [assignedToId], references: [id])
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  firstResponseAt DateTime?
  resolvedAt      DateTime?
  tags            String[]

  messages        TicketMessage[]
  attachments     Attachment[]

  @@index([playerId])
  @@index([status])
  @@index([assignedToId])
  @@index([createdAt])
}

enum TicketCategory {
  ACCOUNT_ISSUE
  PAYMENT_ISSUE
  TECHNICAL_BUG
  GAMEPLAY_QUESTION
  REPORT_PLAYER
  CONTENT_ISSUE
  FEATURE_REQUEST
  OTHER
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

enum TicketStatus {
  OPEN
  PENDING
  RESOLVED
  CLOSED
}

model TicketMessage {
  id          String   @id @default(cuid())
  ticketId    String
  ticket      Ticket   @relation(fields: [ticketId], references: [id], onDelete: Cascade)
  authorId    String
  authorType  String   // "employee" | "player"
  content     String
  isInternal  Boolean  @default(false)
  createdAt   DateTime @default(now())

  @@index([ticketId])
}

model Attachment {
  id          String   @id @default(cuid())
  ticketId    String
  ticket      Ticket   @relation(fields: [ticketId], references: [id], onDelete: Cascade)
  filename    String
  url         String
  size        Int
  mimeType    String
  uploadedAt  DateTime @default(now())

  @@index([ticketId])
}

// Content moderation
model Moderation {
  id              String            @id @default(cuid())
  type            ModerationType
  contentType     ContentType
  content         String
  contentUrl      String?
  submittedBy     String            // Player ID
  submittedAt     DateTime          @default(now())
  status          ModerationStatus
  moderatedById   String?
  moderatedBy     Employee?         @relation(fields: [moderatedById], references: [id])
  moderatedAt     DateTime?
  reason          String?
  aiScores        Json?             // AI moderation scores
  reportCount     Int               @default(0)

  reports         PlayerReport[]

  @@index([status])
  @@index([submittedAt])
  @@index([moderatedById])
}

enum ModerationType {
  USER_CONTENT
  AI_GENERATED
  PLAYER_REPORT
}

enum ContentType {
  USERNAME
  PET_NAME
  DECK_NAME
  CHAT_MESSAGE
  SPRITE
  DIALOGUE
  DESCRIPTION
}

enum ModerationStatus {
  PENDING
  APPROVED
  REJECTED
  FLAGGED
}

model PlayerReport {
  id            String      @id @default(cuid())
  moderationId  String
  moderation    Moderation  @relation(fields: [moderationId], references: [id], onDelete: Cascade)
  reportedBy    String      // Player ID
  reason        String
  evidence      String[]
  timestamp     DateTime    @default(now())

  @@index([moderationId])
}

// Audit logs
model AuditLog {
  id          String   @id @default(cuid())
  employeeId  String
  employee    Employee @relation(fields: [employeeId], references: [id])
  action      String
  resource    String
  resourceId  String?
  changes     Json?
  ipAddress   String?
  userAgent   String?
  timestamp   DateTime @default(now())

  @@index([employeeId])
  @@index([timestamp])
  @@index([resource])
}

// Analytics cache (for expensive queries)
model AnalyticsCache {
  id          String   @id @default(cuid())
  key         String   @unique
  data        Json
  expiresAt   DateTime
  createdAt   DateTime @default(now())

  @@index([key])
  @@index([expiresAt])
}
```

---

## 🚀 Deployment

### Vercel Deployment (Recommended)

```bash
# Install Vercel CLI
pnpm install -g vercel

# Deploy to production
vercel --prod

# Environment variables are configured in Vercel dashboard
```

**Vercel Configuration** (`vercel.json`):

```json
{
  "buildCommand": "pnpm turbo run build",
  "outputDirectory": "apps/admin/.next",
  "devCommand": "pnpm dev",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "DATABASE_URL": "@database-url",
    "NEXTAUTH_SECRET": "@nextauth-secret"
  }
}
```

### Docker Deployment

**Dockerfile:**

```dockerfile
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
RUN pnpm prisma generate
RUN pnpm build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma

USER nextjs
EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

**docker-compose.yml:**

```yaml
version: '3.8'

services:
  backoffice:
    build: .
    ports:
      - '3000:3000'
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/elementamon_backoffice
      - REDIS_URL=redis://redis:6379
      - NEXTAUTH_URL=https://admin.elementamon.com
    depends_on:
      - db
      - redis
    restart: unless-stopped

  db:
    image: postgres:16-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=elementamon_backoffice
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    ports:
      - '5432:5432'
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    ports:
      - '6379:6379'
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

---

## 🔒 Security Best Practices

1. **Authentication**
   - Enforce 2FA for all admin accounts
   - Use SSO with company email domain restriction
   - Implement session timeout (30 minutes)
   - Log all authentication attempts

2. **Authorization**
   - Principle of least privilege
   - Role-based access control (RBAC)
   - Audit all sensitive actions
   - IP whitelist for production access

3. **Data Protection**
   - Encrypt sensitive data at rest
   - Use HTTPS only (TLS 1.3)
   - Sanitize all user inputs
   - Rate limiting on all endpoints
   - CORS configuration for API

4. **Monitoring**
   - Log all admin actions
   - Alert on suspicious activity
   - Regular security audits
   - Penetration testing

---

## 📈 Performance Optimization

1. **Next.js Optimizations**
   - Static page generation where possible
   - Server Components for data fetching
   - Image optimization with next/image
   - Code splitting and lazy loading
   - Edge functions for global performance

2. **Database Optimization**
   - Index frequently queried fields
   - Connection pooling (Prisma)
   - Query optimization
   - Redis caching for expensive queries
   - Read replicas for analytics

3. **Caching Strategy**
   - Redis for session storage
   - API response caching (React Query)
   - Static asset caching (CDN)
   - Database query result caching

4. **Monitoring**
   - Application Insights integration
   - Performance metrics tracking
   - Real User Monitoring (RUM)
   - Core Web Vitals tracking

---

## 📚 Additional Resources

- **Next.js Documentation**: https://nextjs.org/docs
- **shadcn/ui Components**: https://ui.shadcn.com
- **Prisma ORM**: https://www.prisma.io/docs
- **NextAuth.js**: https://next-auth.js.org
- **tRPC**: https://trpc.io/docs
- **Recharts**: https://recharts.org
- **Turborepo**: https://turbo.build/repo/docs

---

## 🎯 Summary

The ElementaMon Backoffice is a **Next.js 15** full-stack application providing:

✅ **Player Management** - View, edit, support players
✅ **Support System** - Ticket management with SLA tracking
✅ **Content Moderation** - AI-assisted review workflow
✅ **Analytics Dashboard** - Real-time metrics and reporting
✅ **Game Content CMS** - Manage cards, pets, events
✅ **System Monitoring** - Service health and performance
✅ **RBAC** - Role-based access control
✅ **Type Safety** - End-to-end TypeScript with Prisma
✅ **Modern UI** - shadcn/ui + Tailwind CSS
✅ **Scalable** - Vercel Edge + PostgreSQL + Redis

**Tech Stack**: Next.js 15, React 19, TypeScript, Prisma, PostgreSQL, Redis, NextAuth.js, tRPC, shadcn/ui, Tailwind CSS, Recharts

**Estimated Development Time**: 8-12 weeks for MVP with 2-3 full-stack developers
