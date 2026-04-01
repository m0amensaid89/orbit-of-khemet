# Orbit of Khemet

> *7 Heroes. 85 Agents. One Unified AI System.*

**Live URL:** [orbit-of-khemet.vercel.app](https://orbit-of-khemet.vercel.app)

Orbit of Khemet is the official public web platform for the **Empire Engine**. It is a dynamic, high-performance web platform that gamifies AI workflows by routing requests through a structured hierarchy of specialized AI personas (Heroes) and their micro-agents.

Designed with a Gilded HUD interface — drawing heavily from dark cyber-Egyptian futurist themes — it provides a centralized command center to tackle business, marketing, engineering, and logic challenges.

---

## The 7 Heroes of Khemet

The platform is divided into 7 distinct domains, each guarded by a specialized AI Hero. Together, they command a total of 85 micro-agents.

1. **THOREN (The Law)** - *Financial governance, legal frameworks, brand protection, and technical systems design.*
2. **RAMET (The Stabilizer)** - *E-commerce optimization, career stabilization, and operational resilience.*
3. **NEXAR (The Destabilizer)** - *Disruptive marketing, competitive strategy, and aggressive growth.*
4. **LYRA (Visionary Systems Architect)** - *Social media growth architecture, content creation systems, and viral engineering.*
5. **KAIRO (Precision Stream Warrior)** - *Data analytics, performance optimization, and surgical precision intervention.*
6. **NEFRA (Precision Stream Warrior - Synthesis)** - *Customer relationship management, pattern finding, and cross-silo synthesis.*
7. **HORUSEN (The Guardian Script)** - *Ancient business wisdom, LinkedIn authority, and foundational strategy.*

---

## Tech Stack

*   **Framework:** Next.js 14 (App Router)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS & shadcn/ui
*   **Authentication & Database:** Supabase
*   **AI Routing:** OpenRouter & Vercel AI SDK
*   **Animations:** framer-motion

---

## Architecture Overview

1.  **Smart 5-Tier AI Routing:**
    The core chat API (`/api/chat/route.ts`) dynamically classifies user input complexity across 5 tiers. Requests are then routed via OpenRouter to specific models optimized for the task:
    *   **Tier 1 & 2 (Quick / Standard):** Google Gemini 2.5 Flash
    *   **Tier 3 & 4 (Complex / Creative):** OpenAI GPT-4o / Anthropic Claude 3.5 Sonnet
    *   **Tier 5 (Deep Reasoning):** OpenAI o3-mini

    *(Note: The platform is actively preparing to transition to Xiaomi MiMo-V2 models).*

2.  **Energy System:**
    User activity is metered by a 'Grid Energy' daily credit system. Different AI models and task complexities deduct varying amounts of energy from the user's daily pool.

3.  **Hero System Prompts:**
    Each interaction is heavily contextualized by a Master System Prompt and Hero-specific philosophies defined in `src/lib/heroes.ts` and `src/lib/agents.ts`, ensuring AI outputs align with the chosen Hero's personality and domain expertise.

---

## Getting Started

Follow these instructions to set up the Orbit of Khemet platform locally.

### Prerequisites

Ensure you have Node.js (v18+) and npm installed. You will also need an active Supabase project and an OpenRouter API key.

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory based on `.env.example`. You will need to populate the following variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# OpenRouter
OPENROUTER_API_KEY=your-openrouter-key

# Optional: Add other keys as required by your specific integrations
```

### 3. Database Migration

Run the Supabase migrations to set up the `profiles` table and necessary auth triggers (if utilizing Supabase CLI).

```bash
supabase start
supabase db push
```
*(Alternatively, you can manually execute the SQL scripts found in your Supabase dashboard).*

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## Scripts & Validation

*   **Build:** `npm run build` (Ensures zero-config deployment on Vercel)
*   **Type Check:** `npx tsc --noEmit`
*   **Lint:** `npm run lint`

*Remember: Always verify that HTTP headers in external fetch calls use standard ASCII characters to prevent `ByteString` API crashes.*
