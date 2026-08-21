import { AiMode, ChatMessage, GroundingSource, IndicLanguageCode, PersonaType, ShlokaItem, StoryScene } from "../types";

export interface ChatResponse {
  text: string;
  persona: PersonaType;
  language: IndicLanguageCode;
  mode?: AiMode;
  sources?: GroundingSource[];
  thoughtProcess?: string;
  error?: string;
}

export async function sendChatMessage(
  message: string,
  persona: PersonaType,
  language: IndicLanguageCode,
  history: ChatMessage[],
  mode: AiMode = "balanced"
): Promise<ChatResponse> {
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, persona, language, history, mode }),
    });

    if (!res.ok) {
      throw new Error(`Chat API error with status: ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (err: any) {
    console.error("sendChatMessage error:", err);
    return {
      text: `**[Namaste!]** We encountered an unexpected network issue communicating with the Indic AI server. Please verify your connection or retry.\n\n*In the meantime, you can explore the curated Heritage Explorer, Gyan Pariksha quiz, or Gita Shloka Oracle!*`,
      persona,
      language,
      mode,
      error: err.message,
    };
  }
}

/**
 * Transcribe audio blob with Gemini Flash Multimodal Speech-to-Text
 */
export async function transcribeAudio(
  audioBlob: Blob,
  language: IndicLanguageCode = "English"
): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64Audio = reader.result as string;
        const res = await fetch("/api/transcribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            audioData: base64Audio,
            mimeType: audioBlob.type || "audio/webm",
            language,
          }),
        });

        const contentType = res.headers.get("content-type") || "";
        if (!res.ok || !contentType.includes("application/json")) {
          console.warn(`Transcription API returned status ${res.status} with content-type: ${contentType}`);
          resolve("");
          return;
        }

        const data = await res.json();
        resolve(data?.text || "");
      } catch (err) {
        console.warn("transcribeAudio error:", err);
        resolve("");
      }
    };
    reader.onerror = (e) => {
      console.warn("Audio file reader error:", e);
      resolve("");
    };
    reader.readAsDataURL(audioBlob);
  });
}

export async function generateStoryScene(params: {
  theme: string;
  prompt: string;
  language: IndicLanguageCode;
  currentScene: number;
  previousChoice: string;
  storyContext: string;
}): Promise<StoryScene> {
  try {
    const res = await fetch("/api/story", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      throw new Error(`Story API error: ${res.status}`);
    }

    const data = await res.json();
    if (data && data.narrative && Array.isArray(data.choices) && data.choices.length > 0) {
      return data;
    }
    throw new Error("Invalid story structure received");
  } catch (err: any) {
    console.warn("generateStoryScene fallback activated:", err);
    // Graceful fallback scene
    return {
      title: "The Quest for the Sun Pearl (सूर्य मणि)",
      chapter: `Scene ${params.currentScene}: The Forest of Shadows`,
      narrative: `Under the ancient Banyan tree whose roots reached deep into the sacred earth, Prince Vikram adjusted his bow. The hermit had foretold that the Sun Pearl was guarded by the riddle of the Seven Rivers. Every whisper of the monsoon wind seemed to carry the voice of ancestors reminding him that courage without humility is like a sword without a hilt.\n\nAs the golden deer vanished into the mist, three separate paths unfolded before him.`,
      moralOrWisdom: "धैर्यं यस्य पिता क्षमा च जननी — Where patience is the father and forgiveness the mother, righteousness always prevails.",
      characterQuote: "A warrior's truest armor is a mind untouched by anger.",
      speaker: "Prince Vikram",
      choices: [
        { id: "A", text: "Follow the sacred river bed towards the mountain caves", theme: "Dharma & Wisdom" },
        { id: "B", text: "Seek counsel from the secluded ashram of Sage Gautama", theme: "Humility & Learning" },
        { id: "C", text: "Scale the misty cliffs directly before sunset", theme: "Valor & Speed" },
      ],
      isEnding: false,
    };
  }
}

export async function fetchShlokaGuidance(query: string, language: IndicLanguageCode): Promise<ShlokaItem> {
  try {
    const res = await fetch("/api/shloka", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, language }),
    });

    if (!res.ok) {
      throw new Error(`Shloka API error: ${res.status}`);
    }

    const data = await res.json();
    return {
      id: "shloka-" + Date.now(),
      source: data.source || "Bhagavad Gita",
      chapterVerse: data.chapterVerse || "",
      theme: data.theme || "Wisdom & Life Guidance",
      sanskrit: data.sanskrit || "",
      transliteration: data.transliteration || "",
      wordMeaning: data.wordMeaning || [],
      translation: data.translation || "",
      context: data.context || "",
      lifeGuidance: data.lifeGuidance || "",
    };
  } catch (err: any) {
    console.error("fetchShlokaGuidance error:", err);
    return {
      id: "fallback-shloka",
      source: "Bhagavad Gita, Chapter 2, Verse 47",
      theme: "Right Action & Freedom from Fear",
      sanskrit: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।\nमा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥",
      transliteration: "karmaṇy-evādhikāras te mā phaleṣu kadācana |\nmā karma-phala-hetur bhūr mā te saṅgo 'stv akarmaṇi ||",
      wordMeaning: [
        { word: "कर्मणि (karmaṇi)", meaning: "in duty" },
        { word: "एव (eva)", meaning: "alone" },
        { word: "अधिकारः (adhikāraḥ)", meaning: "right" },
        { word: "मा फलेषु (mā phaleṣu)", meaning: "never in fruits" },
      ],
      translation: "You have a right to perform your prescribed duty, but you are not entitled to the fruits of action.",
      context: "Counsel given by Sri Krishna to Arjuna on navigating high-pressure decisions.",
      lifeGuidance: "• Focus completely on the effort and craftsmanship without paralyzing anxiety over the final outcome.",
    };
  }
}

export async function translateIndicText(text: string, targetLanguage: IndicLanguageCode, sourceLanguage: IndicLanguageCode = "English") {
  try {
    const res = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, targetLanguage, sourceLanguage }),
    });

    if (!res.ok) {
      throw new Error(`Translate API error: ${res.status}`);
    }

    return await res.json();
  } catch (err: any) {
    console.error("translateIndicText error:", err);
    return {
      translatedText: text,
      transliteration: text,
      culturalNotes: "Translation preview mode.",
      keyTerms: [],
      politeRegister: "Standard",
    };
  }
}

export async function fetchDynamicQuiz(category: string, difficulty: string) {
  try {
    const res = await fetch("/api/quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, difficulty }),
    });

    if (!res.ok) throw new Error("Quiz fetch failed");
    return await res.json();
  } catch (err) {
    console.error("fetchDynamicQuiz error:", err);
    return { questions: [] };
  }
}
