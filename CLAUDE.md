# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

KeuanganKu (Cashly) is a personal finance management application built with Next.js 15, Supabase for backend/auth, and deployed to Cloudflare Pages. The app allows users to track income, expenses, account balances, and visualize spending patterns.

## Development Commands

- `npm run dev` - Start development server with Turbopack on port 9002
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking
- `npm run pages:build` - Build for Cloudflare Pages deployment
- `npm run pages:dev` - Watch mode for Cloudflare Pages development

## Architecture

### Database & Authentication
- **Supabase** is the backend (PostgreSQL database + Auth)
- Server-side Supabase client created via `@/lib/supabase/server` using `@supabase/ssr` for Next.js
- All database queries are in `src/lib/supabase/queries.ts` and use server actions
- Authentication routes: `/auth/callback` and `/auth/confirm` handle OAuth and email verification
- Middleware (`src/middleware.ts`) handles session management for all routes

### Data Models
Key types defined in `src/lib/types.ts`:
- **Account**: Cash/bank accounts with initial balance and optional owner tags
- **Transaction**: Income/expense records linked to accounts with categories and dates
- **Transfer**: Special transaction type that creates paired income/expense entries

Database schema uses snake_case (e.g., `account_id`, `owner_tag`) which is mapped to camelCase in TypeScript.

### Application Structure
- **Pages/Routes**: Located in `src/app/` following Next.js App Router conventions
- **Components**: UI components in `src/components/`, shadcn/ui components in `src/components/ui/`
- **Server Actions**: Each page folder contains an `actions.ts` for server-side mutations
- **Constants**: Transaction categories defined in `src/lib/constants.ts`

### Key Features
- Multi-account support with owner tags for shared finances
- Transaction categorization (income: salary, investment, etc.; expenses: food, transportation, etc.)
- Transfer functionality between accounts
- Date-based filtering and visualization
- Mobile-first responsive design with bottom navigation

### Styling
- Tailwind CSS with custom design system
- Primary color: Soft blue (#64B5F6)
- Background: Light blue-gray (#ECEFF1)
- Accent: Orange (#FFB74D)
- Font: PT Sans (configured in components)

### Edge Runtime
Auth routes (`/auth/callback`, `/auth/confirm`) and dynamic transaction pages use Edge Runtime for better performance on Cloudflare Pages.

## Important Notes

- All user-specific data queries must filter by `user_id` from `supabase.auth.getUser()`
- Use `unstable_noStore()` from `next/cache` for data fetching to ensure fresh data
- Owner tags are optional and used for filtering shared accounts/transactions
- The app uses Indonesian language for UI text
