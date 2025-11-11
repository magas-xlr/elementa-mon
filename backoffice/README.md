# 🎛️ Backoffice - Admin Dashboard

Next.js 15 admin platform for employee operations and game management.

## 📖 Overview

Internal admin tool for:

- **Customer Support** - Ticket management
- **Content Moderation** - AI-assisted review
- **Player Management** - Account operations
- **Analytics** - Metrics and reporting
- **Game Content** - CMS for cards, pets, events
- **System Monitoring** - Service health

## 🏗️ Technology Stack

### Frontend

- **Next.js 15** - React framework with App Router
- **React 19** - UI library with Server Components
- **TypeScript 5.0** - Type safety
- **Tailwind CSS 4** - Utility-first styling
- **shadcn/ui** - Component library
- **Radix UI** - Accessible primitives
- **Recharts** - Data visualization
- **TanStack Query** - Data fetching & caching
- **Zustand** - State management

### Backend

- **Next.js API Routes** - Serverless functions
- **Prisma ORM** - Database toolkit
- **tRPC** - Type-safe APIs
- **NextAuth.js** - Authentication
- **PostgreSQL** - Primary database
- **Redis** - Caching & sessions

### Infrastructure

- **Vercel** - Deployment & hosting
- **Docker** - Containerization
- **GitHub Actions** - CI/CD

---

## 📁 Project Structure

```
backoffice/
├── apps/
│   └── admin/                          # Main admin app
│       ├── src/
│       │   ├── app/                    # Next.js App Router
│       │   │   ├── (auth)/            # Auth routes group
│       │   │   │   ├── login/
│       │   │   │   └── layout.tsx
│       │   │   ├── (dashboard)/       # Dashboard routes
│       │   │   │   ├── layout.tsx     # Dashboard layout
│       │   │   │   ├── page.tsx       # Dashboard home
│       │   │   │   ├── players/       # Player management
│       │   │   │   ├── support/       # Support tickets
│       │   │   │   ├── moderation/    # Content moderation
│       │   │   │   ├── analytics/     # Analytics
│       │   │   │   ├── content/       # Game content CMS
│       │   │   │   ├── system/        # System monitoring
│       │   │   │   └── settings/      # Settings
│       │   │   ├── api/               # API routes
│       │   │   │   ├── auth/
│       │   │   │   ├── trpc/         # tRPC endpoints
│       │   │   │   └── webhooks/
│       │   │   ├── layout.tsx         # Root layout
│       │   │   └── page.tsx           # Home redirect
│       │   ├── components/
│       │   │   ├── ui/                # shadcn/ui components
│       │   │   ├── layout/            # Layout components
│       │   │   ├── players/           # Player components
│       │   │   ├── tickets/           # Ticket components
│       │   │   └── charts/            # Chart components
│       │   ├── lib/
│       │   │   ├── api/               # API clients
│       │   │   ├── hooks/             # Custom hooks
│       │   │   ├── utils/             # Utilities
│       │   │   ├── validations/       # Zod schemas
│       │   │   └── trpc/              # tRPC setup
│       │   ├── server/
│       │   │   ├── routers/           # tRPC routers
│       │   │   ├── services/          # Business logic
│       │   │   └── db/                # Database access
│       │   ├── types/
│       │   └── styles/
│       ├── prisma/
│       │   ├── schema.prisma
│       │   └── migrations/
│       ├── public/
│       ├── next.config.js
│       └── package.json
└── packages/
    ├── shared-types/                   # Shared types
    └── ui-components/                  # Shared components
```

---

## 🎨 Features

### 1. Dashboard (Home)

- Real-time metrics cards
- Active users, tickets, revenue
- AI cost tracking
- Service health indicators
- Activity feed
- Quick actions

### 2. Player Management

**Search & Filtering**:

- Email, username, ID search
- Level, status, purchase filters
- Advanced filters

**Player Detail View**:

- Account overview
- Gameplay statistics
- Inventory viewer
- Purchase history
- Ticket history
- Quick actions (ban, grant items, etc.)

### 3. Support Ticket System

**Features**:

- Ticket queue with filters
- Auto-assignment
- Real-time updates (WebSocket)
- Canned responses
- SLA tracking
- Internal notes
- Attachment support
- Email integration

**Ticket Detail**:

- Conversation thread
- Rich text editor
- Quick actions
- Status controls
- Related tickets

### 4. Content Moderation

**Moderation Queue**:

- User content review
- AI-generated content approval
- Player reports
- AI-assisted flagging (OpenAI)
- Bulk actions
- Pattern detection

**Content Types**:

- Usernames
- Pet names
- Deck names
- Chat messages
- AI sprites
- AI dialogue

### 5. Analytics & Reporting

**Player Analytics**:

- Total players
- Active users (DAU/MAU)
- Retention (D1/D7/D30)
- Demographics
- Churn rate

**Gameplay Analytics**:

- Battle statistics
- Popular cards/pets
- Deck compositions
- Progression rates

**Revenue Analytics**:

- Total revenue
- ARPU/ARPPU
- Conversion rate
- LTV
- Top spenders

**AI Cost Analytics**:

- Breakdown by service
- Budget tracking
- Efficiency metrics

### 6. Game Content Management

**Card Management**:

- CRUD operations
- Balance adjustments
- A/B testing
- Performance analytics
- Artwork approval

**Pet Management**:

- Pet species CRUD
- Evolution tree editor
- Stat balancing
- Sprite management

**Event Management**:

- Create/edit events
- Time windows
- Rewards configuration
- Limited-time content

### 7. System Monitoring

**Service Health**:

- Real-time status
- Performance metrics
- Error logs
- API monitoring
- Database queries
- Alert configuration

**Log Viewer**:

- Centralized logs
- Search and filtering
- Stack traces
- Export logs

### 8. User Management (Internal)

**Employee Accounts**:

- Account management
- RBAC (Role-Based Access Control)
- 2FA
- SSO integration
- Activity audit log

**Roles**:

- Super Admin
- Admin
- Support Agent
- Content Moderator
- Game Designer
- Data Analyst
- Developer

---

## 🔐 Authentication

### NextAuth.js Configuration

```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import AzureADProvider from 'next-auth/providers/azure-ad';

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
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

### Permission System

```typescript
// lib/auth/permissions.ts
export const PERMISSIONS = {
  PLAYERS: {
    VIEW: 'players:view',
    EDIT: 'players:edit',
    BAN: 'players:ban',
    GRANT_ITEMS: 'players:grant_items',
  },
  TICKETS: {
    VIEW: 'tickets:view',
    ASSIGN: 'tickets:assign',
    RESOLVE: 'tickets:resolve',
  },
  MODERATION: {
    VIEW: 'moderation:view',
    APPROVE: 'moderation:approve',
    REJECT: 'moderation:reject',
  },
  CONTENT: {
    VIEW: 'content:view',
    EDIT: 'content:edit',
    PUBLISH: 'content:publish',
  },
};
```

---

## 📊 Database Schema (Prisma)

```prisma
// prisma/schema.prisma

model Employee {
  id            String    @id @default(cuid())
  email         String    @unique
  fullName      String
  role          Role
  permissions   String[]
  lastLogin     DateTime?
  createdAt     DateTime  @default(now())

  tickets       Ticket[]
  auditLogs     AuditLog[]
}

enum Role {
  SUPER_ADMIN
  ADMIN
  SUPPORT_AGENT
  CONTENT_MODERATOR
  GAME_DESIGNER
  DATA_ANALYST
}

model Ticket {
  id              String        @id @default(cuid())
  ticketNumber    String        @unique
  playerId        String
  category        TicketCategory
  priority        Priority
  status          TicketStatus
  subject         String
  description     String
  assignedToId    String?
  assignedTo      Employee?     @relation(fields: [assignedToId], references: [id])
  createdAt       DateTime      @default(now())

  messages        TicketMessage[]
}

model Moderation {
  id              String            @id @default(cuid())
  type            ModerationType
  contentType     ContentType
  content         String
  status          ModerationStatus
  moderatedById   String?
  moderatedBy     Employee?         @relation(fields: [moderatedById], references: [id])
  aiScores        Json?
  submittedAt     DateTime          @default(now())
}
```

---

## 🚀 Development

### Setup

```powershell
# Install dependencies
pnpm install

# Set up environment
cp .env.example .env.local
# Edit .env.local

# Set up database
pnpm prisma migrate dev
pnpm prisma db seed

# Start development server
pnpm dev
```

### Commands

```powershell
pnpm dev                  # Start dev server (http://localhost:3000)
pnpm build                # Build for production
pnpm start                # Start production server
pnpm prisma:migrate       # Run migrations
pnpm prisma:studio        # Open Prisma Studio
pnpm test                 # Run tests
pnpm lint                 # Lint code
pnpm format               # Format code
```

---

## 🔒 Security

1. **Authentication**:
   - 2FA for all admin accounts
   - SSO with company domain restriction
   - Session timeout (30 minutes)
   - Log all authentication attempts

2. **Authorization**:
   - Principle of least privilege
   - RBAC
   - Audit all sensitive actions
   - IP whitelist for production

3. **Data Protection**:
   - Encrypt sensitive data
   - HTTPS only (TLS 1.3)
   - Input sanitization
   - Rate limiting
   - CORS configuration

---

## 📈 Performance

1. **Next.js Optimizations**:
   - Server Components
   - Static page generation
   - Image optimization
   - Code splitting
   - Edge functions

2. **Database Optimization**:
   - Index frequently queried fields
   - Connection pooling
   - Redis caching
   - Read replicas

3. **Monitoring**:
   - Application Insights
   - Real User Monitoring
   - Core Web Vitals

---

## 🎯 Best Practices

1. **Use Server Components** for data fetching
2. **Implement RBAC** for all sensitive operations
3. **Log all admin actions** for audit trail
4. **Use tRPC** for type-safe APIs
5. **Implement pagination** for large datasets
6. **Use Redis caching** for expensive queries
7. **Validate all inputs** with Zod
8. **Handle errors gracefully**
9. **Write tests** for critical flows
10. **Document all features**

---

## 📚 Resources

- **Next.js**: https://nextjs.org/docs
- **shadcn/ui**: https://ui.shadcn.com
- **Prisma**: https://www.prisma.io/docs
- **NextAuth**: https://next-auth.js.org
- **tRPC**: https://trpc.io/docs
