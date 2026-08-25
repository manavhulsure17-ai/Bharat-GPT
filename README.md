# Prajna Chatbot GPT

Prajna Chatbot GPT is a full-stack Indic AI assistant built with **React + TypeScript + Vite** on the frontend and **Node.js + Express + Google Gemini API** on the backend.

The project combines AI chat with Indic languages, cultural/heritage exploration, Bhagavad Gita content, stories, quizzes, translation, text-to-speech, saved items, search, history, Vedic wisdom, PDF/ZIP export, and an admin area.

> **Important:** The uploaded project contains the complete source code. This README is a beginner-friendly map of that code. You do **not** need to understand every file before running the project.

---

## 1. What technology does this project use?

| Part | Technology | Purpose |
|---|---|---|
| Frontend | React 19 + TypeScript | User interface |
| Build tool | Vite | Development server and production build |
| Styling | Tailwind CSS 4 + CSS | UI design |
| Backend | Node.js + Express | API server |
| AI | `@google/genai` / Gemini | Chat, story, translation and other AI operations |
| Icons | Lucide React | Icons |
| Charts | Recharts | Admin analytics |
| Animation | Motion | UI animation |
| PDF | jsPDF | Export saved content |
| ZIP | JSZip | Export project/user content |
| Audio | Web Speech API + Web Audio API | TTS and Indian-style ambient audio |
| Local storage | Browser `localStorage` | Demo authentication/session/preferences/saved items |

---

# 2. First understand the project in one picture

```text
USER
  |
  v
index.html
  |
  v
src/main.tsx
  |
  v
src/App.tsx
  |
  +-------------------- Login --------------------+
  |                                                |
  v                                                v
LoginPage.tsx                              Main application
                                                  |
                 +--------------------------------+-------------------------------+
                 |                |                |              |               |
                 v                v                v              v               v
              Chat            Explorer          Gita          Stories          Quiz
                 |                |                |              |               |
                 +----------------+----------------+--------------+---------------+
                                                  |
                                                  v
                                         Services / Data
                                                  |
                         +----------------+---------+----------------+
                         |                |                          |
                         v                v                          v
                   Local data       Browser APIs              Express backend
                                                                  |
                                                                  v
                                                            Gemini API
```

The most important idea is:

**`main.tsx` starts the app → `App.tsx` controls the application → components display features → services contain logic → data files contain curated content → `server.ts` talks to Gemini.**

---

# 3. Project folder structure

```text
prajna-chatbot-gpt/
│
├── package.json
├── bun.lock
├── tsconfig.json
├── vite.config.ts
├── index.html
├── server.ts
├── .env.example
├── .gitignore
├── README.md
│
├── assets/
│   └── .aistudio/
│
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── index.css
    ├── types.ts
    │
    ├── components/
    │   ├── AdminAnalyticsDashboard.tsx
    │   ├── AdminPanel.tsx
    │   ├── AudioTTSPlayerBar.tsx
    │   ├── ChatSection.tsx
    │   ├── DeploymentModal.tsx
    │   ├── ExplorerSection.tsx
    │   ├── Footer.tsx
    │   ├── GitaWisdomSection.tsx
    │   ├── GlobalSearchModal.tsx
    │   ├── Header.tsx
    │   ├── LoginPage.tsx
    │   ├── QrModal.tsx
    │   ├── QuizSection.tsx
    │   ├── SavedVaultSection.tsx
    │   ├── SkeletonLoader.tsx
    │   ├── StorytellerSection.tsx
    │   ├── TodayInHistoryCard.tsx
    │   ├── TranslateStudio.tsx
    │   └── VedicWisdomWidget.tsx
    │
    ├── data/
    │   ├── configData.ts
    │   ├── gitaChaptersData.ts
    │   ├── heritageData.ts
    │   ├── masterGuideData.ts
    │   ├── quizData.ts
    │   ├── shlokasData.ts
    │   ├── todayInHistoryData.ts
    │   └── vedicWisdomData.ts
    │
    └── services/
        ├── authService.ts
        ├── audioSynth.ts
        ├── geminiService.ts
        ├── historyService.ts
        ├── pdfExportService.ts
        ├── searchService.ts
        ├── vedicWisdomService.ts
        └── zipExportService.ts
```

---

# 4. What each important file does

## Root files

### `package.json`
This is the project's dependency and command file.

Important commands:

```bash
npm install
npm run dev
npm run build
npm start
npm run lint
```

### `index.html`
The browser starts here. It contains the HTML element:

```html
<div id="root"></div>
```

React inserts the application into this element.

### `src/main.tsx`
This is the React entry point.

It loads:

```text
App.tsx
index.css
```

and renders `<App />`.

### `src/App.tsx`
This is the **main controller of the frontend**.

It manages:

- login state
- active tab
- selected language
- theme
- saved items
- search
- navigation
- audio
- logout
- opening each major feature

If you want to understand the overall application flow, start with this file.

### `src/types.ts`
Contains TypeScript definitions shared by the application.

Examples:

- user
- chat message
- language
- persona
- AI mode
- saved item
- navigation tab
- history item

When you add a new shared object to the application, this is usually the first file to inspect.

### `src/index.css`
Global styling and Tailwind/CSS-related styles.

---

# 5. Components: what users see

## `LoginPage.tsx`
Displays registration/login UI.

## `Header.tsx`
Top navigation.

It connects the user to:

- Chat
- Explorer
- Stories
- Gita
- Quiz
- Translate
- Vault
- Admin

It also contains language/theme/audio/search controls.

## `ChatSection.tsx`
Main AI chat interface.

This is the most important frontend AI feature.

The flow is approximately:

```text
User enters question
        ↓
ChatSection.tsx
        ↓
geminiService.ts
        ↓
POST /api/chat
        ↓
server.ts
        ↓
Gemini API
        ↓
server response
        ↓
ChatSection displays answer
```

## `ExplorerSection.tsx`
Cultural and heritage exploration.

Uses local curated data and can send questions back to the AI chat.

## `GitaWisdomSection.tsx`
Bhagavad Gita chapters, verses and explanations.

Main data source:

```text
src/data/gitaChaptersData.ts
src/data/shlokasData.ts
```

## `StorytellerSection.tsx`
AI storytelling and story themes.

It communicates with the backend story endpoint.

## `QuizSection.tsx`
Quiz interface.

Main data source:

```text
src/data/quizData.ts
```

## `TranslateStudio.tsx`
Translation interface.

It uses the backend translation endpoint.

## `SavedVaultSection.tsx`
Displays saved items.

The current implementation stores saved items in browser `localStorage`.

## `AdminPanel.tsx`
Administrative interface.

## `AdminAnalyticsDashboard.tsx`
Analytics/charts for the admin area.

## `TodayInHistoryCard.tsx`
Displays historical information for the selected date and connects to the history service.

## `VedicWisdomWidget.tsx`
Displays daily Vedic wisdom.

## `AudioTTSPlayerBar.tsx`
Audio controls:

- play
- pause
- resume
- stop
- speed
- ambient drone

## `GlobalSearchModal.tsx`
Global search interface.

Keyboard shortcuts include:

```text
Ctrl + K
Cmd + K
/
```

## `DeploymentModal.tsx`
Displays deployment/setup information inside the application.

## `QrModal.tsx`
QR-code related UI.

## `Footer.tsx`
Application footer.

## `SkeletonLoader.tsx`
Loading placeholders.

---

# 6. Services: the logic layer

The services folder is extremely important.

## `geminiService.ts`

Frontend-to-backend AI communication.

It sends requests such as:

```text
POST /api/chat
POST /api/story
POST /api/shloka
POST /api/translate
POST /api/quiz
```

The frontend should **not** expose the Gemini API key.

The API key belongs on the server.

---

## `authService.ts`

Handles the current project's browser-based authentication logic.

It manages:

- registered users
- current session
- preferred language
- admin credentials

### Important security warning

The current source code uses `localStorage` for authentication and contains a default admin configuration in source code.

That is acceptable for a **college/demo prototype**, but it is **not suitable as production-grade authentication**.

Before making Prajna GPT a real public product, replace this with:

```text
Frontend
   ↓
Secure backend authentication
   ↓
Database
   ↓
Hashed passwords
   ↓
Secure session/JWT
```

Never publish real passwords, API keys, or secret credentials to GitHub.

---

## `audioSynth.ts`

Implements browser audio and speech synthesis.

It uses browser capabilities rather than sending every TTS operation to Gemini.

---

## `historyService.ts`

Loads "Today in History" information.

It also has local fallback data so the application can continue functioning when the API endpoint is unavailable.

---

## `vedicWisdomService.ts`

Loads daily Vedic wisdom.

It calls:

```text
GET /api/daily-vedic-wisdom
```

and falls back to local data.

---

## `searchService.ts`

Searches curated local knowledge including:

-  Bhagvat Gita
- stories
- history
- heritage

This is different from the AI chat.

**Search = deterministic local content discovery.**

**Chat = generative AI response.**

---

## `pdfExportService.ts`

Creates PDF files from saved content using jsPDF.

---

## `zipExportService.ts`

Creates ZIP exports using JSZip.

It also contains a large built-in VS Code/tutorial document.

---

# 7. Data files

The `src/data/` folder contains content rather than application logic.

## `gitaChaptersData.ts`
Bhagavad Gita chapter/verse information.

## `shlokasData.ts`
Shloka collection.

## `vedicWisdomData.ts`
Vedic verses and daily wisdom.

## `heritageData.ts`
Indian cultural/heritage content.

## `todayInHistoryData.ts`
Historical events.

## `quizData.ts`
Quiz questions.

## `configData.ts`
Application configuration/content configuration.

## `masterGuideData.ts`
Large built-in guide content.

---

# 8. The backend: `server.ts`

This file is the bridge between the browser and Gemini.

The backend uses:

```text
Express
+
GoogleGenAI
+
dotenv
```

The server reads:

```text
GEMINI_API_KEY
```

from environment variables.

It exposes these important API routes:

```text
GET  /api/health

POST /api/chat
POST /api/transcribe
POST /api/story
POST /api/shloka
POST /api/translate
POST /api/quiz

GET  /api/daily-vedic-wisdom
GET  /api/today-in-history
```

The production build also serves the compiled frontend.

---

# 9. How an AI question travels through the application

Example:

User asks:

```text
Explain the meaning of Karma Yoga.
```

The actual process is:

```text
1. User
   ↓
2. ChatSection.tsx
   ↓
3. sendChatMessage()
   ↓
4. src/services/geminiService.ts
   ↓
5. fetch("/api/chat")
   ↓
6. server.ts
   ↓
7. Gemini client
   ↓
8. Gemini model
   ↓
9. server.ts receives response
   ↓
10. JSON response
   ↓
11. geminiService.ts
   ↓
12. ChatSection.tsx
   ↓
13. User sees answer
```

This is the single most important architecture to understand.

---..............................................................................................



That path teaches you the core architecture of Prajna Chatbot GPT.
