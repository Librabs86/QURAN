import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import fs from "fs";
import { SURAH_LIST } from "./src/surahsData";
import { SURAH_AN_NAS } from "./src/data";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Persistent disk-backed cache to completely avoid repeated Gemini API billing/quota limits
const CACHE_FILE = path.join(process.cwd(), "gemini_data_cache.json");
let persistentCache = {
  words: {} as Record<string, any>,
  audio: {} as Record<string, string>,
  surahs: {} as Record<string, any>,
};

function loadPersistentCache() {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const data = fs.readFileSync(CACHE_FILE, "utf-8");
      const parsed = JSON.parse(data);
      persistentCache = {
        words: parsed.words || {},
        audio: parsed.audio || {},
        surahs: parsed.surahs || {},
      };
      console.log(`[Cache] Loaded persistent cache: ${Object.keys(persistentCache.words).length} words, ${Object.keys(persistentCache.audio).length} audio, ${Object.keys(persistentCache.surahs).length} surahs.`);
    }
  } catch (err) {
    console.error("[Cache] Failed to load persistent cache:", err);
  }
}

function savePersistentCache() {
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(persistentCache, null, 2), "utf-8");
  } catch (err) {
    console.error("[Cache] Failed to save persistent cache:", err);
  }
}

// Initial load on server startup
loadPersistentCache();

// Lazy-initialization of Gemini client to prevent crashes if key is initially empty
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is not configured in the system Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Recite Arabic/Quranic text endpoint using gemini-3.1-flash-tts-preview with persistent cache
app.post("/api/recite", async (req, res): Promise<any> => {
  const { text, voice = "Kore", speed = "slow" } = req.body;

  if (!text || typeof text !== "string" || text.trim() === "") {
    return res.status(400).json({ error: "Text is required for recitation." });
  }

  const cacheKey = `${text.trim()}-${voice}-${speed}`;
  if (persistentCache.audio[cacheKey]) {
    return res.json({ audio: persistentCache.audio[cacheKey], cached: true });
  }

  try {
    const ai = getAiClient();
    
    let instructorRole = "You are a professional, highly qualified Arabic Qur'an teacher teaching young children and non-Arabic-speaking beginners.";
    if (voice === "Puck") {
      instructorRole = "You are a gifted young child (Qari under 10 years old) reciting with a sweet, highly natural, youthful and gentle classical Arabic tone. Use high-clarity pronunciation and excellent basic tajweed rules.";
    } else if (voice === "Kore") {
      instructorRole = "You are an experienced Arabic female teacher (an expert Qari'ah) speaking in a warm, patient, caring, and gentle motherly/educational tone. Your pronunciation is pure classical Fusha with immaculate tajweed makharij. Speak slowly as if sitting directly with a group of dear children.";
    } else if (voice === "Aoede") {
      instructorRole = "You are an expert female Arabic teacher with exceptional command of classical Arabic pronunciation. Speak in a comforting, gentle, and slow educational cadence, emphasizing pristine makharij and emotional warmth.";
    } else if (voice === "Charon") {
      instructorRole = "You are a senior male Arabic teacher and Qari with a deep, calm, highly patient, and professional classical tone. Guide children gently and with absolute clarity and warmth.";
    } else if (voice === "Zephyr") {
      instructorRole = "You are a gentle, patient, and warm male Arabic Qur'an tutor. Speak very slowly, carefully, and clearly, with a comforting reassuring smile in your breath control, ideal for young children to repeat after.";
    }

    // Construct a rich prompt that instructs the TTS system to sound like a reverent Quran teacher
    const prompt = `${instructorRole}
Deliver the following text strictly observing these professional Arabic articulation instructions:
1. Authentic Classical Pronunciation: Do not use any casual colloquial dialects, regional colloquialisms, or non-Arabic-accented pronunciations. It must be classical Arabic with correct Tajweed rules.
2. Natural, Gentle, Human Delivery: Speak with natural breath control, a comforting tone, and an encouraging educational rhythm. The voice must sound like a real caring teacher, not metallic, synthetic, emotionless, or robotic.
3. Perfect Makhārij (Articulation Points) of Letters:
   - Pay special attention to throat letters like ء (Hamzah), هـ (Haa), ع (Ayn), ح (Haa-breathy), غ (Ghayn), and خ (Khaa-raspy). Produce them precisely from their correct positions in the throat. Ensure standard soft 'h' (ه) is easily distinguished from crisp breathy 'h' (ح), and 'Hamzah' (أ) from 'Ayn' (ع).
4. Tafkhīm (Heavy letters) & Tarqiq (Light letters):
   - Pronounce heavy letters (خ, ص, ض, ط, ظ, غ, ق) with proper full-mouthed deep resonance (Tafkhim), but do not make them cartoonish or exaggerated.
   - Pronounce light letters with soft, light, clear, and precise resonance (Tarqiq).
   - Ensure the auditory contrast is pristine between similar letters: س vs ص, ت vs ط, د vs ض, ذ/ز vs ظ,ك vs ق.
5. Calm Pacing and Natural Pauses: Speak very slowly. Leave natural pauses after letter clips for a child to listen and repeat.
6. Audio Ambiance: Keep the output completely clean and silent in the background with no music, no electronic effects, no echo, and no background noise.

Produce purely the audio reciting this exact text, without any introductory words or translation:
${text.trim()}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      throw new Error("No audio was returned from the Gemini TTS model.");
    }

    // Cache to memory & save on disk persistent file
    persistentCache.audio[cacheKey] = base64Audio;
    savePersistentCache();

    res.json({ audio: base64Audio, cached: false });
  } catch (error: any) {
    const errStr = (error.message || String(error)).toLowerCase();
    const isQuota = errStr.includes("429") || errStr.includes("quota") || errStr.includes("resource_exhausted") || errStr.includes("limit") || (error.status && String(error.status).includes("RESOURCE_EXHAUSTED"));
    if (isQuota) {
      console.warn(`[TTS Warning] Gemini TTS quota exceeded. Client will use high-reliability local browser text-to-speech fallback.`);
      res.status(429).json({
        error: error.message || "You exceeded your current Gemini TTS free tier quota (10 requests/day). Falling back to browser speech synthesis.",
        code: "QUOTA_EXCEEDED"
      });
    } else {
      console.error("Gemini TTS Error:", error);
      res.status(500).json({
        error: error.message || "Failed to generate recitation with Gemini TTS.",
      });
    }
  }
});

// Endpoint 1: Get catalog of all 114 Surahs
app.get("/api/surahs", (req, res) => {
  res.json({ surahs: SURAH_LIST });
});

// Endpoint 2: Get basic verses of a Surah (dynamic Uthmani + translation fetch style)
app.get("/api/surah/:number", async (req, res): Promise<any> => {
  const number = parseInt(req.params.number, 10);
  if (isNaN(number) || number < 1 || number > 114) {
    return res.status(400).json({ error: "Invalid Surah number. Must be 1 to 114." });
  }

  // Surah An-Nas is served with pristine hand-crafted quality instantly
  if (number === 114) {
    return res.json({
      surah: {
        number: 114,
        name: "An-Nas",
        english: "Mankind",
        arabic: "سُورَةُ النَّاسِ",
        verses: 6,
        type: "Meccan",
      },
      ayahs: SURAH_AN_NAS,
    });
  }

  // Check in-memory cache
  if (persistentCache.surahs[number]) {
    return res.json(persistentCache.surahs[number]);
  }

  try {
    const meta = SURAH_LIST.find((s) => s.number === number);
    if (!meta) {
      return res.status(404).json({ error: "Surah not found in database." });
    }

    console.log(`Fetching Surah ${number} (${meta.name}) verses from AlQuran API...`);
    const quranRes = await fetch(`https://api.alquran.cloud/v1/surah/${number}/editions/quran-uthmani,en.sahih`);
    const json = (await quranRes.json()) as any;

    if (json.code !== 200 || !json.data || json.data.length < 2) {
      throw new Error(`Failed to retrieve authentic scripts: ${JSON.stringify(json)}`);
    }

    const arabAyahs = json.data[0].ayahs;
    const engAyahs = json.data[1].ayahs;

    let ayahsList = arabAyahs.map((a: any, idx: number) => ({
      number: a.numberInSurah,
      text: a.text,
      translation: engAyahs[idx]?.text || "",
      words: [],
      tajweedRules: [],
    }));

    // Beautifully prepended Bismillah splitting standard
    if (number !== 1 && number !== 9 && ayahsList.length > 0) {
      const firstText = ayahsList[0].text;
      const bismillah1 = "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ";
      const bismillah2 = "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ";

      let found = false;
      let stripped = firstText;

      if (firstText.startsWith(bismillah1)) {
        stripped = firstText.substring(bismillah1.length).trim();
        found = true;
      } else if (firstText.startsWith(bismillah2)) {
        stripped = firstText.substring(bismillah2.length).trim();
        found = true;
      } else {
        const idx1 = firstText.indexOf("ٱلرَّحِيمِ");
        const idx2 = firstText.indexOf("الرَّحِيمِ");
        if (idx1 !== -1 && idx1 < 45) {
          stripped = firstText.substring(idx1 + "ٱلرَّحِيمِ".length).trim();
          found = true;
        } else if (idx2 !== -1 && idx2 < 45) {
          stripped = firstText.substring(idx2 + "الرَّحِيمِ".length).trim();
          found = true;
        }
      }

      if (found) {
        ayahsList[0].text = stripped;
        // Prepend Bismillah at index 0
        ayahsList.unshift({
          number: 0,
          text: "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ",
          translation: "In the name of Allah, the Entirely Merciful, the Especially Merciful.",
          words: [],
          tajweedRules: ["Basmalah"],
        });
      }
    }

    const result = {
      surah: meta,
      ayahs: ayahsList,
    };

    // Cache the parsed surah
    persistentCache.surahs[number] = result;
    savePersistentCache();
    res.json(result);
  } catch (err: any) {
    console.error(`Error loading Surah ${number}:`, err);
    res.status(500).json({ error: err.message || "Could not retrieve surah from public records." });
  }
});

// Endpoint 3: Dynamic AI word-by-word breakdown for any selected Ayah
app.post("/api/surah/:number/ayah/:ayahNum/words", async (req, res): Promise<any> => {
  const number = parseInt(req.params.number, 10);
  const ayahNum = parseInt(req.params.ayahNum, 10);
  const { text, translation } = req.body;

  if (isNaN(number) || isNaN(ayahNum)) {
    return res.status(400).json({ error: "Invalid surah or ayah parameters." });
  }

  // Surah An-Nas has offline premium data
  if (number === 114) {
    const parentAyah = SURAH_AN_NAS.find((a) => a.number === ayahNum);
    if (parentAyah) {
      return res.json({ words: parentAyah.words, tajweedRules: parentAyah.tajweedRules });
    }
  }

  // Handle standard Bismillah across all Surahs (always identical to avoid API calls)
  if (ayahNum === 0) {
    const bismillahAyah = SURAH_AN_NAS.find((a) => a.number === 0);
    if (bismillahAyah) {
      return res.json({ words: bismillahAyah.words, tajweedRules: bismillahAyah.tajweedRules });
    }
  }

  const cacheKey = `${number}-${ayahNum}`;
  if (persistentCache.words[cacheKey]) {
    return res.json(persistentCache.words[cacheKey]);
  }

  try {
    const ai = getAiClient();

    const prompt = `Analyze the following Arabic Qur'an verse from Surah ${number}, Ayah ${ayahNum}:
Arabic Verse: "${text || ""}"
English Translation: "${translation || ""}"

Deconstruct this Arabic verse word-by-word in sequence from right-to-left.
For each individual word of the verse, output:
1. "text": The exact Arabic word. Make sure it matches the spelling and vowel markers (harakat) perfectly.
2. "transliteration": Clear phonics/transliteration in English letters.
3. "translation": Precise single word-by-word English meaning.
4. "tajweedRule": A primary Tajweed rule applicable to this word if any (select from: "Ghunnah", "Ikhfa", "Madd", "Tafkhim", "Tarqiq", "Qalqalah", "None").
5. "tajweedDetail": Short explanation of how to pronounce and why the rule applies.
6. "makhraj": The primary articulation point (e.g. "Throat", "Tongue", "Lips", "Nasal Cavity", "None").
7. "makhrajDetail": Short instruction on exactly where/how in the mouth/throat this word is articulated.

Also suggest 2 to 3 main tajweed rule keywords present inside this verse overall.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            words: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING },
                  transliteration: { type: Type.STRING },
                  translation: { type: Type.STRING },
                  tajweedRule: { type: Type.STRING },
                  tajweedDetail: { type: Type.STRING },
                  makhraj: { type: Type.STRING },
                  makhrajDetail: { type: Type.STRING },
                },
                required: ["text", "transliteration", "translation", "tajweedRule", "tajweedDetail", "makhraj", "makhrajDetail"],
              },
            },
            tajweedRules: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ["words", "tajweedRules"],
        },
      },
    });

    const dataText = response.text;
    if (!dataText) {
      throw new Error("No data returned from Gemini analysis.");
    }

    const payload = JSON.parse(dataText.trim());

    // Fix up IDs so they are unique
    payload.words = payload.words.map((w: any, idx: number) => ({
      ...w,
      id: `word-box-${number}-${ayahNum}-${idx}`,
    }));

    // Cache results and persist to disk
    persistentCache.words[cacheKey] = payload;
    savePersistentCache();
    res.json(payload);
  } catch (err: any) {
    console.error(`AI word breakdown error for Surah ${number} Ayah ${ayahNum}:`, err);
    // Graceful fallback if Gemini or network fails slightly, so the user can still read the verse
    const fallback = {
      words: (text || "").split(" ").map((w: string, idx: number) => ({
        id: `word-box-${number}-${ayahNum}-${idx}`,
        text: w,
        transliteration: "...",
        translation: "...",
        tajweedRule: "None",
        tajweedDetail: "Connect to the internet to load AI analysis of this word.",
        makhraj: "None",
        makhrajDetail: "Connect to the internet to load makhraj details of this word.",
      })),
      tajweedRules: ["Recitation"],
    };
    res.json(fallback);
  }
});

// Serve static assets in production or mount Vite middleware in development
const startServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT} [NODE_ENV=${process.env.NODE_ENV || "development"}]`);
  });
};

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
