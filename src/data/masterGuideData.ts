export const ZERO_TO_HERO_MASTER_GUIDE = `# PRAJNA BHARAT GPT: 0% TO 100% COMPLETE BUILD, ARCHITECTURE & DEPLOYMENT MASTER GUIDE

---

## 🏛️ 1. OVERVIEW & CIVILIZATIONAL VISION (0% - 10%)

### What is Prajna BharatGPT?
**Prajna BharatGPT (प्रज्ञा भारत ज्ञान प्रकाश)** is a modern, high-performance, full-stack Indic Artificial Intelligence & Civilizational Knowledge Web Application. It bridges ancient Indian heritage (Vedas, Upanishads, Bhagavad Gita, Epics, Sanskrit science, architecture, astronomy, and Ayurveda) with cutting-edge Generative AI powered by Google DeepMind's **Gemini 3.7 Flash**.

### Core Pillars:
1. **Indic Civilizational AI Engine (संवाद)**: Five contextual personas (*Vedic Scholar, Forest Hermitage Sage, Imperial Chronicler, Ancient Scientist, Mythological Bard*) with dynamic temperature, token limits, and authentic Indic thinking models.
2. **Heritage & Ancient Science Explorer (विरासत)**: Interactive catalog of architectural wonders, ancient metallurgical breakthroughs, astronomical instruments, and dynasties with one-click deep-dive inquiries.
3. **Interactive Katha Storyteller (कथा-वाचन)**: Multi-branch narrative engine generating moral stories with character dialogues and ethical reflections.
4. **Bhagavad Gita Oracle & 18 Chapters Tracker (अष्टादश अध्याय)**: Life dilemma solver rooted in the Gita with audio chanting synthesized drones and a visual progress tracker.
5. **Gyan Pariksha (ज्ञान परीक्षा)**: Real-time interactive Indic trivia with streaks, instant Sanskrit etymologies, and dynamic generation.
6. **Bhasha Sangam Indic Translator (भाषा संगम)**: Multi-script translation and cultural nuance breakdowns across 12 classical and modern Indian languages.
7. **Smriti Kosh Vault & PDF Engine (स्मृति कोष)**: Local persistence vault with instant printable A4 PDF export capabilities.
8. **Admin Control Suite & RBAC Authentication**: Secure gatekeeping with user role separation and master admin override.

---

## 🛠️ 2. COMPLETE TECHNOLOGY STACK (10% - 25%)

| Layer | Technology | Purpose & Why Chosen |
| :--- | :--- | :--- |
| **Frontend Framework** | **React 18 (TypeScript)** | Component-driven UI, state management, strict type safety |
| **Build Tool & Dev Server**| **Vite** | Lightning-fast HMR, optimized tree-shaking, fast container builds |
| **Styling & Design System**| **Tailwind CSS** | Custom saffron-gold palette (\`#070b14\`, \`#d97706\`, \`#f59e0b\`), responsive typography |
| **AI SDK & Model** | **@google/genai & Gemini 3.7 Flash**| High speed, deep Indic context, multi-turn reasoning, low latency |
| **Audio Synthesizer** | **Web Audio API** | Real-time procedural Tanpura 4-string acoustic drone & brass temple bell synth (0 external audio dependencies) |
| **PDF Generation Engine**| **jsPDF** | Client-side vector PDF document compiler with custom Indic styling |
| **Iconography** | **lucide-react** | Clean, lightweight vector iconography for all interfaces |
| **Data Persistence** | **HTML5 localStorage + Session Engine**| Offline-first zero-latency storage for user profiles, vaults, and preferences |

---

## 📁 3. PROJECT DIRECTORY STRUCTURE EXPLAINED (25% - 40%)

\`\`\`
├── index.html                   # HTML Entry point with Google Fonts (Cinzel, Rozha One, Poppins)
├── package.json                 # Project manifests, scripts, dependencies
├── vite.config.ts               # Vite configuration plugin
├── tsconfig.json                # TypeScript compiler configuration
├── metadata.json                # AI Studio Application metadata
├── src/
│   ├── main.tsx                 # React root DOM rendering entry point
│   ├── App.tsx                  # Root orchestration, navigation state, global theme
│   ├── index.css                # Tailwind imports & custom Indic royal typography
│   ├── types.ts                 # Central TypeScript interfaces (User, GitaChapter, ChatMessage, etc.)
│   ├── components/
│   │   ├── LoginPage.tsx        # Authentication Gate & Account Creator
│   │   ├── AdminPanel.tsx       # Super Admin Control Suite & Master Guide Viewer
│   │   ├── Header.tsx           # Sacred Sanskrit header, language picker, audio controls
│   │   ├── ChatSection.tsx      # Multi-Persona Indic AI Chatroom
│   │   ├── ExplorerSection.tsx  # Monument & Ancient Science Gallery
│   │   ├── StorytellerSection.tsx # Interactive Episodic Katha Narrator
│   │   ├── GitaWisdomSection.tsx# Bhagavad Gita Oracle & 18 Chapters Progress Tracker
│   │   ├── QuizSection.tsx      # Vedic & Indian History Trivia Challenge
│   │   ├── TranslateStudio.tsx  # Indic Multilingual Translation Suite
│   │   ├── SavedVaultSection.tsx# Smriti Kosh Bookmarks & PDF Export
│   │   ├── DeploymentModal.tsx  # Quick setup modal
│   │   └── Footer.tsx           # Civilizational footer & links
│   ├── data/
│   │   ├── configData.ts        # Persona prompts, language scripts, system instructions
│   │   ├── gitaChaptersData.ts  # Complete data for all 18 Chapters of the Bhagavad Gita
│   │   ├── shlokasData.ts       # Canonical Sanskrit verses, transliterations, meanings
│   │   ├── heritageData.ts      # Indian monuments, metallurgy, astronomy, and dynasties
│   │   ├── quizData.ts          # Static seed questions and categories
│   │   └── masterGuideData.ts   # This 0-100% master guide
│   └── services/
│       ├── authService.ts       # User registration, login, admin password management
│       ├── geminiService.ts     # Google GenAI SDK calls & prompt engineering
│       ├── audioSynth.ts        # Procedural Web Audio Tanpura & Temple Bell synthesizer
│       └── pdfExportService.ts  # Custom jsPDF generator for offline reading
\`\`\`

---

## 🔑 4. AUTHENTICATION & ADMIN ROLES (40% - 55%)

### Default Admin Credentials:
- **Admin Email**: \`manavhulsure80@gmail.com\`
- **Admin Password / PIN**: \`Bharatgpt@sarm\`
- **Capabilities**:
  - Full access to all 7 Prajna BharatGPT modules.
  - Access to the dedicated **Admin Control Panel**.
  - Ability to view and manage all registered user accounts.
  - Ability to change the Admin Email ID and Password at any time.
  - Telemetry monitoring (AI model latency, memory footprint, session logs).
  - One-click export of the 0-100% Master Deployment Guide.

### User Account Creation:
- New users can register with:
  1. **Full Name**
  2. **Google Email ID**
  3. **Password or 6-digit PIN**
- Existing users can log in with their Email/Name and PIN.

---

## ⚡ 5. STEP-BY-STEP LOCAL DEVELOPMENT SETUP (55% - 70%)

To run this application on any local machine (Mac, Windows, Linux):

### Step 1: Install Node.js
Ensure you have **Node.js (v18 or higher)** installed:
\`\`\`bash
node -v
npm -v
\`\`\`

### Step 2: Extract & Open Project
\`\`\`bash
cd prajna-bharatgpt-app
\`\`\`

### Step 3: Install Dependencies
\`\`\`bash
npm install
\`\`\`

### Step 4: Configure Gemini API Key
Create a \`.env\` file in the root directory:
\`\`\`env
GEMINI_API_KEY="AIzaSyYourSecretGeminiAPIKeyHere"
\`\`\`
*(Get your free API key from [Google AI Studio](https://aistudio.google.com/app/apikey))*

### Step 5: Start Local Development Server
\`\`\`bash
npm run dev
\`\`\`
Open your browser at: **\`http://localhost:3000\`**

---

## 🚀 6. PRODUCTION DEPLOYMENT & HOSTING GUIDE (70% - 90%)

### Option A: Deploy to Google Cloud Run (Recommended for AI Studio apps)
1. **Install Google Cloud CLI**:
   \`\`\`bash
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID
   \`\`\`
2. **Build and Deploy with Cloud Build**:
   \`\`\`bash
   gcloud run deploy prajna-bharatgpt \\
     --source . \\
     --platform managed \\
     --region asia-east1 \\
     --allow-unauthenticated \\
     --set-env-vars GEMINI_API_KEY="YOUR_API_KEY"
   \`\`\`

### Option B: Deploy to Vercel (Single-Click Web Hosting)
1. Push your repository to GitHub:
   \`\`\`bash
   git init
   git add .
   git commit -m "Initial Prajna BharatGPT Release"
   git branch -M main
   git remote add origin https://github.com/your-username/prajna-bharatgpt.git
   git push -u origin main
   \`\`\`
2. Go to [Vercel](https://vercel.com) -> **Add New Project** -> Import GitHub Repo.
3. Add Environment Variable:
   - Name: \`GEMINI_API_KEY\`
   - Value: \`your_gemini_api_key\`
4. Click **Deploy**. Vercel will automatically build the static bundle and assign a custom HTTPS domain (e.g., \`https://prajna-bharatgpt.vercel.app\`).

### Option C: Deploy with Docker Container
Create a \`Dockerfile\` in the root:
\`\`\`dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
\`\`\`
Build & run:
\`\`\`bash
docker build -t prajna-bharatgpt:latest .
docker run -p 3000:80 prajna-bharatgpt:latest
\`\`\`

---

## 🌟 7. HOW TO MAKE PRAJNA BHARATGPT A SCALABLE SUCCESS (90% - 100%)

1. **Persistent Cloud Database (Firebase / Cloud SQL)**:
   - Connect Firestore to sync user profiles and bookmarked vaults across multiple devices.
2. **Voice Recognition & Speech Synthesis**:
   - Integrate Web Speech API or Gemini Live Audio for natural Sanskrit/Hindi vocal dialogue.
3. **Custom Domain & Branding**:
   - Link a domain like \`prajnabharatgpt.ai\` or \`prajnabharatgpt.in\` via Google Cloud DNS or Cloudflare.
4. **Community Contributed Epics**:
   - Enable users to submit local regional folk tales, temple histories, and philosophical commentaries.

---

*Compiled with devotion for Indian Heritage, Philosophy & AI Innovation.*
`;
