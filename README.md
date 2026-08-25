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

- Gita
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

---

# 10. How to open the project in VS Code

## Step 1 — Extract the ZIP

Extract the project somewhere simple, for example:

```text
Documents/
└── prajna-chatbot-gpt/
```

Do not work directly inside the ZIP.

---

## Step 2 — Install Node.js

Install a current supported Node.js LTS release.

Then open Command Prompt/PowerShell and check:

```bash
node --version
npm --version
```

---

## Step 3 — Open the project

In VS Code:

```text
File
→ Open Folder
→ prajna-chatbot-gpt
```

---

# 11. Install dependencies

Open the VS Code terminal:

```text
Terminal
→ New Terminal
```

Run:

```bash
npm install
```

This reads `package.json` and installs the project's dependencies.

---

# 12. Configure Gemini API key

Create a file in the project root:

```text
.env
```

or use the environment-variable mechanism provided by your hosting platform.

Use:

```env
GEMINI_API_KEY=YOUR_REAL_GEMINI_API_KEY
```

Do **not** upload this secret to GitHub.

The existing `.env.example` is a template only.

---

# 13. Run the project

In the VS Code terminal:

```bash
npm run dev
```

Your `package.json` defines this as:

```bash
tsx server.ts
```

The Express server starts Vite for development and serves the application.

Open the local address shown in the terminal.

---

# 14. How to modify the project

Do not randomly edit files.

Use this rule:

```text
Want to change appearance?
        ↓
component .tsx / index.css

Want to change text/content?
        ↓
data/*.ts or component

Want to change AI behavior?
        ↓
server.ts + geminiService.ts

Want to add a new feature?
        ↓
component + service + App.tsx

Want to change user/session behavior?
        ↓
authService.ts

Want to change Gita content?
        ↓
gitaChaptersData.ts / shlokasData.ts
```

---

# 15. Example: change the application name

Search the entire project in VS Code:

```text
Ctrl + Shift + F
```

Search:

```text
Bharat GPT
```

Then replace only the user-facing names with:

```text
Prajna Chatbot GPT
```

Do not blindly replace internal storage keys such as:

```text
bharat_gpt_vault
bharat_gpt_current_session_v1
```

Changing those can affect existing browser data.

---

# 16. Example: add a new language

Languages are represented by the `IndicLanguageCode` type in:

```text
src/types.ts
```

Then check:

```text
src/data/configData.ts
```

and the language selector in:

```text
src/components/Header.tsx
```

The backend prompt/logic may also need to understand the new language.

A language change is therefore not always a one-file modification.

---

# 17. Example: change Gita content

Go to:

```text
src/data/gitaChaptersData.ts
```

or:

```text
src/data/shlokasData.ts
```

Edit the corresponding object.

Example pattern:

```ts
{
  id: "example-id",
  source: "Bhagavad Gita",
  chapterVerse: "Chapter X, Verse Y",
  theme: "Example",
  sanskrit: "...",
  transliteration: "...",
}
```

Save the file.

Vite's development server should automatically reload the page.

---

# 18. Example: change the chat AI behavior

There are two important files:

```text
src/services/geminiService.ts
server.ts
```

The frontend decides what to send.

The backend decides how Gemini is called.

For example:

```text
ChatSection
    ↓
geminiService
    ↓
/api/chat
    ↓
server.ts
    ↓
Gemini
```

If you want to change the AI's personality, instructions, model selection, fallback behavior, or search mode, inspect `server.ts`.

---

# 19. How to add a new feature

Use this sequence:

```text
1. Decide the feature
2. Create a React component
3. Add shared types in types.ts if required
4. Add data if the feature uses static content
5. Create a service if backend/API logic is required
6. Add API endpoint in server.ts if required
7. Import the component into App.tsx
8. Add navigation if required
9. Test locally
10. Run lint
11. Build
12. Commit to Git
13. Deploy
```

---

# 20. Production build

Before deployment, test:

```bash
npm run lint
```

Then:

```bash
npm run build
```

The project currently builds:

```text
Vite frontend
+
bundled server
```

The output includes:

```text
dist/
```

The package script creates:

```text
dist/server.cjs
```

The production start command is:

```bash
npm start
```

which runs:

```bash
node dist/server.cjs
```

---

# 21. Recommended GitHub setup

Create a new GitHub repository such as:

```text
prajna-chatbot-gpt
```

From the project folder:

```bash
git init
git add .
git commit -m "Initial Prajna Chatbot GPT project"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```

Before pushing, verify that secrets are ignored.

Never commit:

```text
.env
.env.local
API keys
real passwords
private credentials
```

---

# 22. Recommended `.gitignore`

Make sure your `.gitignore` contains at least:

```gitignore
node_modules/
dist/
.env
.env.local
*.log
.DS_Store
```

---

# 23. Deploying to Render

Because this project contains an Express backend, deploy it as a **Web Service**, not just as a static site.

Render's documentation confirms that Express applications can be deployed as Node web services. citeturn0search0turn0search1

Recommended settings for this project:

```text
Service Type:
Web Service

Environment:
Node

Build Command:
npm install && npm run build

Start Command:
npm start
```

Add the environment variable:

```text
GEMINI_API_KEY = your_real_key
```

Render requires the web service to listen on the supplied port/host; the project already uses an Express server architecture intended for this style of deployment. citeturn0search1

After deployment:

```text
GitHub push
    ↓
Render build
    ↓
npm install
    ↓
npm run build
    ↓
npm start
    ↓
Live Prajna GPT website
```

Official Render deployment guide:

https://render.com/docs/deploy-node-express-app

---

# 24. Alternative: Google Cloud Run

This project can also be deployed as a Node.js service on Google Cloud Run.

Google's current Node.js Cloud Run documentation supports deploying Node.js applications from source. citeturn0search5

The general flow is:

```bash
npm install
npm run build
```

Then configure your Cloud Run service with:

```text
GEMINI_API_KEY
```

and deploy the project as a web service.

Official guide:

https://docs.cloud.google.com/run/docs/quickstarts/build-and-deploy/deploy-nodejs-service

---

# 25. Very important: current authentication limitation

The current `authService.ts` is designed like a client-side prototype.

It uses browser storage.

That means:

```text
localStorage ≠ secure database
localStorage ≠ secure authentication
```

For a college project/demo, this is understandable.

For a public production application, implement:

```text
React
  ↓
Express API
  ↓
Authentication system
  ↓
Database
  ↓
Password hashing
  ↓
Secure session/JWT
```

Recommended future database options:

- PostgreSQL
- MongoDB
- Firebase Authentication
- Supabase Auth

---

# 26. Important security issue to fix before public release

The uploaded source contains a default admin credential configuration in:

```text
src/services/authService.ts
```

Do not keep a real admin password hardcoded in source code.

For a public GitHub repository:

1. Remove the real credential.
2. Store secrets in environment variables.
3. Store users/admins in a database.
4. Hash passwords.
5. Never return passwords to the frontend.
6. Rotate any secret that has already been exposed.

---

# 27. How to troubleshoot

## Error: `npm` is not recognized

Node.js is not installed correctly or is not in PATH.

Check:

```bash
node --version
npm --version
```

---

## Error: module not found

Run:

```bash
npm install
```

Then restart VS Code if necessary.

---

## AI does not answer

Check:

```text
GEMINI_API_KEY
```

Then check the terminal running the server.

Also test:

```text
/api/health
```

---

## Page is blank

Open:

```text
Browser
→ F12
→ Console
```

Look for the first red error.

Also check the VS Code terminal.

---

## Changes are not appearing

Try:

```text
Ctrl + C
npm run dev
```

Then refresh the browser.

---

## Build fails

Run:

```bash
npm run lint
```

Then:

```bash
npm run build
```

Fix the first TypeScript error before working on later errors.

---

# 28. Beginner modification workflow

Use this exact workflow every time:

```text
STEP 1
Open VS Code

STEP 2
Open the Prajna project folder

STEP 3
Run:
npm install

STEP 4
Run:
npm run dev

STEP 5
Open the website

STEP 6
Decide exactly what you want to change

STEP 7
Find the responsible file using:
Ctrl + Shift + F

STEP 8
Make one small change

STEP 9
Save:
Ctrl + S

STEP 10
Check the browser

STEP 11
If something breaks, read:
Browser Console + VS Code Terminal

STEP 12
When finished:
npm run lint

STEP 13
Then:
npm run build

STEP 14
Commit to GitHub

STEP 15
Deploy
```

---

# 29. The best learning order for you

Do NOT try to learn all 56 files at once.

Learn in this order:

```text
1. index.html
2. src/main.tsx
3. src/App.tsx
4. src/components/Header.tsx
5. src/components/LoginPage.tsx
6. src/components/ChatSection.tsx
7. src/services/geminiService.ts
8. server.ts
9. src/types.ts
10. src/data/*.ts
11. remaining components
12. remaining services
```

Once you understand these first eight files, the rest of the project becomes much easier.

---

# 30. Simplified architecture

```text
                 PRAJNA CHATBOT GPT
                         |
          +--------------+--------------+
          |                             |
       FRONTEND                       BACKEND
          |                             |
       React                         Express
          |                             |
     TypeScript                    server.ts
          |                             |
    App.tsx                       Gemini API
          |                             |
   Components                    AI responses
          |
      Services
          |
    Local Data
```

---

# 31. Feature map

| Feature | Main frontend file | Service/data |
|---|---|---|
| Login | `LoginPage.tsx` | `authService.ts` |
| AI Chat | `ChatSection.tsx` | `geminiService.ts`, `server.ts` |
| Heritage | `ExplorerSection.tsx` | `heritageData.ts` |
| Gita | `GitaWisdomSection.tsx` | `gitaChaptersData.ts`, `shlokasData.ts` |
| Stories | `StorytellerSection.tsx` | `geminiService.ts`, `server.ts` |
| Quiz | `QuizSection.tsx` | `quizData.ts`, `server.ts` |
| Translation | `TranslateStudio.tsx` | `server.ts` |
| Saved Vault | `SavedVaultSection.tsx` | localStorage, `pdfExportService.ts` |
| Audio | `AudioTTSPlayerBar.tsx` | `audioSynth.ts` |
| Search | `GlobalSearchModal.tsx` | `searchService.ts` |
| History | `TodayInHistoryCard.tsx` | `historyService.ts`, `todayInHistoryData.ts` |
| Vedic Wisdom | `VedicWisdomWidget.tsx` | `vedicWisdomService.ts`, `vedicWisdomData.ts` |
| Admin | `AdminPanel.tsx` | `AdminAnalyticsDashboard.tsx`, `authService.ts` |
| PDF | Vault UI | `pdfExportService.ts` |
| ZIP | Export UI | `zipExportService.ts` |

---

# 32. What you should change first

If this is your college/project submission, I recommend doing these changes in this order:

### Phase 1 — Make the identity consistent

Change visible branding to:

```text
Prajna Chatbot GPT
```

Do not blindly rename internal storage keys.

### Phase 2 — Secure secrets

Remove real credentials from source.

### Phase 3 — Improve authentication

Move authentication to a real backend/database.

### Phase 4 — Test every feature

Test:

```text
Login
Chat
Language selection
Gita
Stories
Quiz
Translation
Search
Audio
Save
PDF
Admin
Logout
```

### Phase 5 — Production deployment

Build:

```bash
npm run build
```

Deploy the server as a web service.

---

# 33. One-sentence explanation for your project presentation

> **Prajna Chatbot GPT is a full-stack Indic AI assistant that combines Gemini-powered conversational intelligence with Indian languages, heritage, Bhagavad Gita wisdom, storytelling, quizzes, translation, audio narration, search, and personalized saved knowledge in one platform.**

---

# 34. Final beginner rule

When you are confused, remember:

```text
UI problem?
→ components/

AI/API problem?
→ services/ + server.ts

Content problem?
→ data/

Navigation/state problem?
→ App.tsx

TypeScript error?
→ types.ts

Design problem?
→ index.css / component classes

Login problem?
→ authService.ts + LoginPage.tsx

Deployment problem?
→ package.json + server.ts + environment variables
```

You do **not** need to understand the entire codebase before making your first change.

Start with:

```text
main.tsx
→ App.tsx
→ ChatSection.tsx
→ geminiService.ts
→ server.ts
```

That path teaches you the core architecture of Prajna Chatbot GPT.
