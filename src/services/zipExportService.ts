import JSZip from "jszip";
import { ZERO_TO_HERO_MASTER_GUIDE } from "../data/masterGuideData";

export const STEP_BY_STEP_VS_CODE_TUTORIAL = `# BHARAT GPT: STEP-BY-STEP VS CODE SETUP & MODULE CONNECTION GUIDE

This document explains **how every single module in Bharat GPT connects to the next**, and **how to open, modify, and customize the code in VS Code**.

---

## 🧭 1. APPLICATION EXECUTION LIFECYCLE (HOW EVERYTHING CONNECTS)

\`\`\`
                                  [ index.html ]
                                        │
                                  [ src/main.tsx ]
                                        │
                                  [ src/App.tsx ]
                                        │
                     ┌──────────────────┴──────────────────┐
          [ User Not Authenticated ]             [ User Authenticated ]
                     │                                     │
            [ src/LoginPage.tsx ]                          ├── [ src/Header.tsx ] (Tabs, Audio, Profile)
                     │                                     │
            (Sign In / Register)                           ├── [ src/ChatSection.tsx ] (AI Personas)
                     │                                     ├── [ src/ExplorerSection.tsx ] (Heritage)
         (Stores session in Storage)                       ├── [ src/StorytellerSection.tsx ] (Katha)
                     │                                     ├── [ src/GitaWisdomSection.tsx ] (18 Chapters)
                     └────────────────► [ App.tsx ]        ├── [ src/QuizSection.tsx ] (Gyan Pariksha)
                                                           ├── [ src/TranslateStudio.tsx ] (Bhasha)
                                                           ├── [ src/SavedVaultSection.tsx ] (PDF Engine)
                                                           ├── [ src/AdminPanel.tsx ] (Super Admin Only)
                                                           └── [ src/Footer.tsx ]
\`\`\`

### Step-by-Step Connection Details:
1. **Index Entry Point (\`index.html\` & \`src/main.tsx\`)**:
   - Boots React 18 in \`StrictMode\`, injects Indic Google Fonts (Cinzel, Rozha One, Poppins), and mounts \`App.tsx\`.

2. **The Root Orchestrator (\`src/App.tsx\`)**:
   - Manages \`currentUser\`, \`activeTab\`, \`selectedLanguage\`, and \`savedItems\`.
   - **Authentication Gate**: Checks \`getCurrentUser()\` from \`authService.ts\`. If \`null\`, it immediately renders \`<LoginPage />\`.
   - Once authenticated, it renders \`<Header />\` and dynamically mounts the active tab component.

3. **Module 1: Authentication Gate (\`src/components/LoginPage.tsx\`)**:
   - Fields: **1. Full Name**, **2. Google Email ID**, **3. Password / 6-digit PIN**.
   - Validates input and calls \`registerUser()\` or \`loginUser()\` from \`src/services/authService.ts\`.
   - On success, invokes \`onLoginSuccess(user)\`, transitioning the state inside \`App.tsx\`.

4. **Module 2: Sacred Header (\`src/components/Header.tsx\`)**:
   - Provides tab navigation buttons.
   - Contains the **Tanpura Drone Audio Toggle** linked to \`src/services/audioSynth.ts\`.
   - Displays the logged-in user badge and **Logout** button.
   - If \`currentUser.role === 'admin'\`, dynamically exposes the **Admin Panel** tab.

5. **Module 3: Indic AI Chatroom (\`src/components/ChatSection.tsx\`)**:
   - Lets users choose from 5 personas (\`scholar\`, \`sage\`, \`chronicler\`, \`sciences\`, \`storyteller\`).
   - Dispatches prompts to \`src/services/geminiService.ts\` with custom Indic system instructions.
   - Offers 1-click bookmarks directly to the \`SavedVaultSection\`.

6. **Module 4: Bhagavad Gita Oracle & Tracker (\`src/components/GitaWisdomSection.tsx\`)**:
   - Loads canonical shlokas from \`src/data/gitaChaptersData.ts\` and \`src/data/shlokasData.ts\`.
   - Tracks chapter completion in browser storage.
   - Triggers procedural temple bell chimes on verse bookmarking.

7. **Module 5: Smriti Kosh & PDF Compiler (\`src/components/SavedVaultSection.tsx\`)**:
   - Aggregates saved verses, stories, and heritage artifacts.
   - Connects to \`src/services/pdfExportService.ts\` using \`jsPDF\` to compile offline PDF booklets.

8. **Module 6: Super Admin Control Suite (\`src/components/AdminPanel.tsx\`)**:
   - Master login: \`manavhulsure80@gmail.com\` / \`Bharatgpt@sarm\`.
   - Allows updating admin credentials, viewing/deleting user accounts, and downloading this ZIP package.

---

## 💻 2. HOW TO OPEN AND ALTER THIS CODE IN VS CODE

### Step 1: Open the Project in VS Code
1. Open **Visual Studio Code**.
2. Click **File -> Open Folder...** and select the \`bharat-gpt\` directory.
3. Open the integrated terminal (\`Ctrl + \`\` or \`Cmd + \`\`).

### Step 2: Install Node Dependencies
\`\`\`bash
npm install
\`\`\`

### Step 3: Configure Environment Key
Create a file named \`.env\` in the project root:
\`\`\`env
GEMINI_API_KEY="your-gemini-api-key-here"
\`\`\`

### Step 4: Run the Development Server
\`\`\`bash
npm run dev
\`\`\`
Visit \`http://localhost:3000\` in your web browser.

---

## 🎨 3. HOW TO CUSTOMIZE SPECIFIC FEATURES IN VS CODE

### A. How to change the Default Admin Credentials:
1. Open \`src/services/authService.ts\`.
2. Locate \`DEFAULT_ADMIN_CONFIG\`:
\`\`\`typescript
const DEFAULT_ADMIN_CONFIG: AdminCredentials = {
  email: "your_new_email@gmail.com",
  password: "YourNewPassword123",
  updatedAt: new Date().toISOString(),
};
\`\`\`

### B. How to add a New AI Persona:
1. Open \`src/data/configData.ts\`.
2. In \`AI_PERSONAS\`, add your new persona with prompt instructions:
\`\`\`typescript
{
  id: "ayurveda_vaidya",
  name: "Ayurvedic Vaidya (वैद्य)",
  title: "Ancient Master of Healing & Herbs",
  description: "Rooted in Charaka & Sushruta Samhita...",
  systemPrompt: "You are a master Vaidya speaking with Ayurvedic wisdom...",
  avatar: "🌿"
}
\`\`\`

### C. How to change Theme Colors (Saffron / Gold):
1. Open \`src/index.css\` or your component class names.
2. Tailwind classes used: \`bg-[#070b14]\` (canvas), \`border-amber-500/30\` (borders), \`text-amber-300\` (gold text).

---
`;

export async function generateFullProjectZip(): Promise<Blob> {
  const zip = new JSZip();

  // Root documentation files
  zip.file("README.md", ZERO_TO_HERO_MASTER_GUIDE);
  zip.file("VS_CODE_STEP_BY_STEP_GUIDE.md", STEP_BY_STEP_VS_CODE_TUTORIAL);
  zip.file(".env.example", "GEMINI_API_KEY=\n");
  zip.file("package.json", JSON.stringify({
    name: "bharat-gpt",
    private: true,
    version: "1.0.0",
    type: "module",
    scripts: {
      dev: "tsx server.ts",
      build: "vite build && esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs",
      start: "node dist/server.cjs",
      lint: "tsc --noEmit"
    },
    dependencies: {
      "@google/genai": "^2.4.0",
      "canvas-confetti": "^1.9.4",
      "express": "^4.21.2",
      "jspdf": "^4.2.1",
      "jszip": "^3.10.1",
      "lucide-react": "^0.546.0",
      "motion": "^12.23.24",
      "react": "^19.0.1",
      "react-dom": "^19.0.1",
      "react-markdown": "^10.1.0",
      "vite": "^6.2.3"
    },
    devDependencies: {
      "@tailwindcss/vite": "^4.1.14",
      "@types/node": "^22.14.0",
      "esbuild": "^0.25.0",
      "tailwindcss": "^4.1.14",
      "tsx": "^4.21.0",
      "typescript": "~5.8.2"
    }
  }, null, 2));

  // Instructions on Module Connectors
  const moduleGuides = zip.folder("MODULE_GUIDES_AND_EXPLANATIONS");
  moduleGuides?.file("01_LOGIN_PAGE_AND_AUTH_GATE.md", `# MODULE 1: LOGIN PAGE & AUTHENTICATION GATE

## Purpose
Enforces secure login before any user can view or use the Bharat GPT features.

## Source Code Location:
- UI Component: \`src/components/LoginPage.tsx\`
- Logic Service: \`src/services/authService.ts\`

## How it attaches to App.tsx:
In \`src/App.tsx\`:
\`\`\`tsx
if (!currentUser) {
  return <LoginPage onLoginSuccess={(user) => setCurrentUser(user)} />;
}
\`\`\`

## What is used:
- HTML5 localStorage session tokens
- Admin Master Password Override (\`Bharatgpt@sarm\`)
- 6-character PIN / Password validation
- Temple Bell audio feedback upon authentication
`);

  moduleGuides?.file("02_BHARAT_AI_CHAT_ENGINE.md", `# MODULE 2: BHARAT AI CHAT ENGINE & PERSONAS

## Purpose
Conversational civilizational intelligence with 5 custom personas.

## Source Code Location:
- UI Component: \`src/components/ChatSection.tsx\`
- API Integration: \`src/services/geminiService.ts\`
- Personas & Prompts: \`src/data/configData.ts\`

## How it works:
Sends user prompt + selected persona system instructions to Gemini 3.7 Flash using the official @google/genai SDK.
`);

  moduleGuides?.file("03_GITA_18_CHAPTERS_AND_AUDIO.md", `# MODULE 3: BHAGAVAD GITA ORACLE & TANPURA SYNTH

## Purpose
18-chapter tracker and life dilemma guidance rooted in Sanskrit shlokas.

## Source Code Location:
- UI Component: \`src/components/GitaWisdomSection.tsx\`
- Audio Synthesizer: \`src/services/audioSynth.ts\`
- Verses Data: \`src/data/gitaChaptersData.ts\` & \`src/data/shlokasData.ts\`

## Audio Synthesis Details:
Uses browser Web Audio API to create 4 harmonic oscillators creating a pure Tanpura drone at 138.59 Hz (C#) without requiring external audio files.
`);

  moduleGuides?.file("04_SMRITI_KOSH_PDF_ENGINE.md", `# MODULE 4: SMRITI KOSH VAULT & PDF EXPORTER

## Purpose
Stores user bookmarks and compiles formatted A4 PDF booklets.

## Source Code Location:
- UI Component: \`src/components/SavedVaultSection.tsx\`
- PDF Generator: \`src/services/pdfExportService.ts\`
`);

  moduleGuides?.file("05_SUPER_ADMIN_CONSOLE.md", `# MODULE 5: SUPER ADMIN CONTROL SUITE

## Purpose
Administrative dashboard for managing users, changing admin credentials, and monitoring system health.

## Source Code Location:
- UI Component: \`src/components/AdminPanel.tsx\`
- Credentials: \`manavhulsure80@gmail.com\` / \`Bharatgpt@sarm\`
`);

  const content = await zip.generateAsync({ type: "blob" });
  return content;
}
