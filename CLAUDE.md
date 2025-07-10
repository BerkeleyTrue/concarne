# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development server**: `npm run dev` (uses Next.js turbo mode)
- **Build**: `npm run build`
- **Production preview**: `npm run preview` (builds and starts)
- **Type checking**: `npm run tc` or `tsc --noEmit`
- **Linting**: `npm run lint` (check) or `npm run lint:fix` (auto-fix)
- **Formatting**: `npm run format:check` or `npm run format:write`
- **Full check**: `npm run check` (runs lint + type check)

## Database Commands

- **Generate migrations**: `npm run db:generate`
- **Run migrations**: `npm run db:migrate`
- **Push schema**: `npm run db:push`
- **Studio**: `npm run db:studio`

## Architecture Overview

**Concarne** is a Next.js 15 personal fasting and weight tracking application built with:

- **Framework**: Next.js 15 with App Router
- **Database**: SQLite with Drizzle ORM
- **API**: tRPC for type-safe APIs
- **Styling**: Tailwind CSS with custom Catppuccin color scheme
- **UI**: Radix UI components with shadcn/ui patterns
- **State Management**: React Query via tRPC
- **Typography**: FiraCode font family

### Key Architecture Patterns

**Database Schema** (`src/server/db/schema.ts`):
- Users table with height and authentication
- Data table for weight entries (linked to users)
- Fasts table for fasting session tracking
- Uses table prefix `concarne_` for multi-project schema

**API Structure** (`src/server/api/`):
- **root.ts**: Main router combining all sub-routers
- **routers/**: Modular API endpoints
  - `auth.ts`: User authentication
  - `data.ts`: Weight data management
  - `fast.ts`: Fasting session tracking
  - `dev.ts`: Development utilities

**Frontend Organization**:
- **App Router**: Pages in `src/app/` (main, auth, fast, timer, weight)
- **Components**: Reusable UI in `src/components/` and `src/components/ui/`
- **Providers**: tRPC and theme providers in `src/app/providers.tsx`
- **Custom Layout**: Gradient background with sidebar navigation

### Key Features

- Weight tracking with charting (Recharts)
- Intermittent fasting timer and session management
- CSV import/export functionality for weight data
- User authentication with height tracking
- Responsive design with mobile-first approach

### Development Notes

- Uses pnpm as package manager
- TypeScript with strict configuration
- ESLint with Next.js, TypeScript, and Drizzle rules
- No test framework currently configured
- Custom color scheme using CSS variables (Catppuccin theme)
- Database migrations stored in `drizzle/` directory