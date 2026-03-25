# Orbit of Khemet

The official public web platform for the Empire Engine. Command the full council of 85 Ancient Egyptian AI agents or operate within the specialized orbits of the 7 Heroes of Khemet. Built with Next.js 15 (App Router), TypeScript, Tailwind CSS, and shadcn/ui.

## Features

- **Dark Cyber-Egyptian Theme:** Deep black, metallic gold, neon glow, and subtle pyramid/circuit patterns.
- **Hero Hub (`/hub`):** A cinematic grid to select your avatar and specialized agent group.
- **Master Orbit (`/chat`):** A modern chat interface powered by Gemini 2.5 Pro, orchestrating 85 specialized agents.
- **Responsive Design:** Flawless experience across desktop and mobile devices.

## Requirements

- Node.js (v20 or higher recommended)
- A Google Gemini API Key

## How to Run Locally

1. **Clone the repository and install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment Variables:**
   - Copy the example environment file:
     ```bash
     cp .env.example .env.local
     ```
   - Open `.env.local` and add your Google Gemini API Key:
     ```env
     GEMINI_API_KEY=your_actual_gemini_api_key_here
     ```

3. **Logo Image:**
   - Ensure the official golden circuit-falcon logo is present at `public/logo.png`. If it is missing, upload your `logo.png` to the `public/` directory before starting the application.

4. **Start the Development Server:**
   ```bash
   npm run dev
   ```

5. **Access the Platform:**
   - Open [http://localhost:3000](http://localhost:3000) in your browser to enter the Orbit.

## How to Add Your Own `GEMINI_API_KEY`

1. Go to Google AI Studio to get an API key.
2. Create a `.env.local` file in the root of the project.
3. Add the following line to the file, replacing the placeholder with your actual key:
   `GEMINI_API_KEY="AIzaSyYourActualKey..."`

## Vercel Deployment (One-Click Ready)

This project is 100% Vercel-ready with zero extra configuration required.

1. Push your code to a GitHub repository.
2. Log in to [Vercel](https://vercel.com).
3. Click **Add New** -> **Project**.
4. Import your GitHub repository.
5. In the **Environment Variables** section, add:
   - Name: `GEMINI_API_KEY`
   - Value: `[your_gemini_api_key]`
6. Click **Deploy**.

Vercel will automatically detect the Next.js framework, build the project, and deploy it to a live URL.

## Architecture

- **`src/app/`**: Next.js App Router structure (Pages, Layouts, API routes).
- **`src/app/api/chat/route.ts`**: The core AI orchestration endpoint.
- **`src/lib/agents.ts`**: Contains the Master System Prompt and the full roster of 85 Ancient Egyptian-named agents.
- **`src/components/`**: Reusable UI components (shadcn/ui, Footer).
