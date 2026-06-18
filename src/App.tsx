import { useState, useRef, useEffect } from "react";
import { SURAH_AN_NAS } from "./data";
import { VoiceName, Bookmark } from "./types";
import { fetchRecitation, speakArabicLocalDirectly } from "./utils/audio";
import SurahReader from "./components/SurahReader";
import TajweedGuide from "./components/TajweedGuide";
import PracticePanel from "./components/PracticePanel";
import Confetti from "./components/Confetti";
import { VirtueBadgeShelf, VirtueBadgeUnlockModal, VIRTUE_BADGES, VirtueBadge } from "./components/VirtueBadges";
import { Book, Play, Pause, RefreshCw, AlertTriangle, Sparkles, Volume2, ShieldCheck, ChevronDown, ListCheck, Bookmark as BookmarkIcon } from "lucide-react";

export default function App() {
  const [selectedVoice, setSelectedVoice] = useState<VoiceName>("Charon");
  const [playingWordId, setPlayingWordId] = useState<string | null>(null);
  const [playingAyahIndex, setPlayingAyahIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isFullSurahPlaying, setIsFullSurahPlaying] = useState<boolean>(false);
  const [quotaLimitExceeded, setQuotaLimitExceeded] = useState<boolean>(false);
  const [isKidsMode, setIsKidsMode] = useState<boolean>(true);
  const [confettiTrigger, setConfettiTrigger] = useState<number>(0);

  // Dynamic 114 Surahs catalog state
  const [surahList, setSurahList] = useState<any[]>([]);
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number>(114);
  const [surahData, setSurahData] = useState<any[]>(SURAH_AN_NAS);
  const [surahListLoading, setSurahListLoading] = useState<boolean>(false);
  const [loadingSurah, setLoadingSurah] = useState<boolean>(false);
  const [activeSurahMeta, setActiveSurahMeta] = useState<any>({
    number: 114,
    name: "An-Nas",
    english: "Mankind",
    arabic: "سُورَةُ النَّاسِ",
    verses: 6,
    type: "Meccan",
  });

  const activeAudioRef = useRef<HTMLAudioElement | null>(null);
  const fetchedAyahsRef = useRef<Set<string>>(new Set());

  // Bookmarks state (loaded/saved persistently inside localStorage)
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => {
    try {
      const stored = localStorage.getItem("quran_ayah_bookmarks");
      return stored ? JSON.parse(stored) : [];
    } catch (err) {
      console.error("Failed to parse stored bookmarks", err);
      return [];
    }
  });

  // Virtue Badges state
  const [completedSurahs, setCompletedSurahs] = useState<number[]>([]);
  const [unlockedBadgeToShow, setUnlockedBadgeToShow] = useState<VirtueBadge | null>(null);

  const handleCompleteSurah = (surahNum: number) => {
    if (completedSurahs.includes(surahNum)) return;
    const updated = [...completedSurahs, surahNum];
    setCompletedSurahs(updated);

    // Look if any badge was newly unlocked with this new list count!
    const badge = VIRTUE_BADGES.find((b) => b.requiredSurahs === updated.length);
    if (badge) {
      setUnlockedBadgeToShow(badge);
      setConfettiTrigger((prev) => prev + 1);
    }
  };

  useEffect(() => {
    try {
      localStorage.setItem("quran_ayah_bookmarks", JSON.stringify(bookmarks));
    } catch (err) {
      console.error("Failed to save bookmarks to localStorage", err);
    }
  }, [bookmarks]);

  const handleToggleBookmark = (ayahNumber: number, text: string, translation: string) => {
    const isBookmarked = bookmarks.some(
      (b) => b.surahNumber === selectedSurahNumber && b.ayahNumber === ayahNumber
    );

    if (isBookmarked) {
      setBookmarks((prev) =>
        prev.filter(
          (b) => !(b.surahNumber === selectedSurahNumber && b.ayahNumber === ayahNumber)
        )
      );
    } else {
      const newBookmark: Bookmark = {
        surahNumber: selectedSurahNumber,
        surahName: activeSurahMeta.name,
        ayahNumber,
        text,
        translation,
      };
      setBookmarks((prev) => [...prev, newBookmark]);
    }
  };

  const handleRemoveBookmark = (surahNumber: number, ayahNumber: number) => {
    setBookmarks((prev) =>
      prev.filter(
        (b) => !(b.surahNumber === surahNumber && b.ayahNumber === ayahNumber)
      )
    );
  };

  // Stop any active audio playbacks instantly
  const stopAllAudio = () => {
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current = null;
    }
    setPlayingWordId(null);
    setPlayingAyahIndex(null);
    setIsFullSurahPlaying(false);
  };

  // 1. Fetch 114 Surahs Catalog on Mount
  useEffect(() => {
    const loadSurahList = async () => {
      setSurahListLoading(true);
      try {
        const res = await fetch("/api/surahs");
        const data = await res.json();
        if (data.surahs) {
          setSurahList(data.surahs);
        }
      } catch (err) {
        console.error("Failed to load surah list catalog:", err);
      } finally {
        setSurahListLoading(false);
      }
    };
    loadSurahList();
  }, []);

  // 2. Fetch specific Surah detail on change
  useEffect(() => {
    const loadSurahDetails = async () => {
      stopAllAudio();
      setLoadingSurah(true);
      setError(null);
      fetchedAyahsRef.current.clear(); // Reset background fetch caches

      try {
        const res = await fetch(`/api/surah/${selectedSurahNumber}`);
        const data = await res.json();
        if (data.error) {
          throw new Error(data.error);
        }
        setSurahData(data.ayahs);
        setActiveSurahMeta(data.surah);
      } catch (err: any) {
        console.error("Error loading surah details:", err);
        setError(err.message || "Failed to retrieve surah content. Please verify internet connection.");
      } finally {
        setLoadingSurah(false);
      }
    };

    loadSurahDetails();
  }, [selectedSurahNumber]);

  // 3. Dynamic on-demand tokenization of an individual Ayah (lazy loader to avoid background 429 rate limit storms)
  const fetchAyahWords = async (ayahNumber: number) => {
    if (!surahData || surahData.length === 0) return;
    const ayah = surahData.find((a) => a.number === ayahNumber);
    if (!ayah) return;

    // Skip if words are already populated and are not placeholders
    if (ayah.words && ayah.words.length > 0 && !ayah.words[0].id.startsWith("placeholder-")) {
      return;
    }

    const cacheKey = `${selectedSurahNumber}-${ayahNumber}`;
    if (fetchedAyahsRef.current.has(cacheKey)) return;
    fetchedAyahsRef.current.add(cacheKey);

    try {
      const res = await fetch(`/api/surah/${selectedSurahNumber}/ayah/${ayahNumber}/words`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: ayah.text, translation: ayah.translation })
      });
      const result = await res.json();
      
      if (result && result.words) {
        setSurahData(prev => prev.map(item => 
          item.number === ayahNumber 
            ? { ...item, words: result.words, tajweedRules: result.tajweedRules || [] } 
            : item
        ));
      }
    } catch (err) {
      console.error(`Failed loading words for Ayah ${ayahNumber}:`, err);
      // Allow re-fetch on future click attempts if failed
      fetchedAyahsRef.current.delete(cacheKey);
    }
  };

  // UI warm-up: Load only the very first active Ayah words when Surah is selected
  useEffect(() => {
    if (surahData && surahData.length > 0) {
      const targetWarmup = surahData.length > 1 ? 1 : 0;
      fetchAyahWords(targetWarmup);
    }
  }, [selectedSurahNumber, surahData.length]);

  // Play an individual word
  const handlePlayWord = async (wordText: string, wordId: string) => {
    stopAllAudio();
    setLoading(true);
    setError(null);
    setPlayingWordId(wordId);

    if (quotaLimitExceeded) {
      try {
        await speakArabicLocalDirectly(wordText);
      } catch (fallbackErr: any) {
        console.error("Local speech synthesis fallback failed:", fallbackErr);
        setError("Recitation temporary unavailable. Please verify API key setup.");
      } finally {
        setPlayingWordId(null);
        setLoading(false);
      }
      return;
    }

    try {
      const audioUrl = await fetchRecitation(wordText, selectedVoice);
      const audio = new Audio(audioUrl);
      activeAudioRef.current = audio;

      audio.onended = () => {
        setPlayingWordId(null);
        activeAudioRef.current = null;
      };

      await audio.play();
    } catch (err: any) {
      if (err.code === "QUOTA_EXCEEDED") {
        setQuotaLimitExceeded(true);
      }
      console.warn("Gemini TTS rate limited - using high-reliability browser text-to-speech fallback:", err);
      try {
        await speakArabicLocalDirectly(wordText);
      } catch (fallbackErr: any) {
        console.error("Local speech synthesis fallback failed:", fallbackErr);
        setError("Recitation temporary unavailable. Please verify API key setup.");
      }
      setPlayingWordId(null);
    } finally {
      setLoading(false);
    }
  };

  // Play an individual Ayah (and lazy-load its words breakdown concurrently)
  const handlePlayAyah = async (ayahNumber: number) => {
    stopAllAudio();
    setLoading(true);
    setError(null);
    setPlayingAyahIndex(ayahNumber);

    // Warm up the words details for this Ayah as soon as user plays it
    fetchAyahWords(ayahNumber);

    const ayah = surahData.find((v) => v.number === ayahNumber);
    if (!ayah) {
      setLoading(false);
      setPlayingAyahIndex(null);
      return;
    }

    if (quotaLimitExceeded) {
      try {
        await speakArabicLocalDirectly(ayah.text);
      } catch (fallbackErr: any) {
        console.error("Local speech synthesis fallback failed:", fallbackErr);
        setError("Verse recitation is unavailable. Please verify API key setup.");
      } finally {
        setPlayingAyahIndex(null);
        setLoading(false);
      }
      return;
    }

    try {
      const audioUrl = await fetchRecitation(ayah.text, selectedVoice);
      const audio = new Audio(audioUrl);
      activeAudioRef.current = audio;

      audio.onended = () => {
        setPlayingAyahIndex(null);
        activeAudioRef.current = null;
      };

      await audio.play();
    } catch (err: any) {
      if (err.code === "QUOTA_EXCEEDED") {
        setQuotaLimitExceeded(true);
      }
      console.warn("Gemini TTS rate limited - using high-reliability browser text-to-speech fallback:", err);
      try {
        await speakArabicLocalDirectly(ayah.text);
      } catch (fallbackErr: any) {
        console.error("Local speech synthesis fallback failed:", fallbackErr);
        setError("Verse recitation is unavailable. Please verify API key setup.");
      }
      setPlayingAyahIndex(null);
    } finally {
      setLoading(false);
    }
  };

  // Play the full Surah sequentially with fallbacks for high load
  const handlePlayFullSurah = async () => {
    stopAllAudio();
    setIsFullSurahPlaying(true);
    setError(null);

    const playStep = async (index: number) => {
      if (!isFullSurahPlaying) return;
      if (index >= surahData.length) {
        setIsFullSurahPlaying(false);
        setPlayingAyahIndex(null);
        setConfettiTrigger((p) => p + 1);
        return;
      }

      const currentAyah = surahData[index];
      setPlayingAyahIndex(currentAyah.number);
      setLoading(true);

      // Lazy-fetch words breakdown for this active verse
      fetchAyahWords(currentAyah.number);

      if (quotaLimitExceeded) {
        try {
          setLoading(false);
          await speakArabicLocalDirectly(currentAyah.text);
          setTimeout(() => {
            if (isFullSurahPlaying) {
              playStep(index + 1);
            }
          }, 1200);
        } catch (fallbackErr) {
          console.error("Local speech synthesis fallback failed in sequence:", fallbackErr);
          setError("Sequence stopped. Recitation limit reached.");
          setIsFullSurahPlaying(false);
          setPlayingAyahIndex(null);
        }
        return;
      }

      try {
        const audioUrl = await fetchRecitation(currentAyah.text, selectedVoice);
        setLoading(false);

        const audio = new Audio(audioUrl);
        activeAudioRef.current = audio;

        audio.onended = () => {
          setTimeout(() => {
            if (isFullSurahPlaying) {
              playStep(index + 1);
            }
          }, 1200);
        };

        await audio.play();
      } catch (err: any) {
        if (err.code === "QUOTA_EXCEEDED") {
          setQuotaLimitExceeded(true);
        }
        console.warn("Gemini TTS rate limited during sequence - falling back to browser text-to-speech:", err);
        try {
          setLoading(false);
          await speakArabicLocalDirectly(currentAyah.text);
          setTimeout(() => {
            if (isFullSurahPlaying) {
              playStep(index + 1);
            }
          }, 1200);
        } catch (fallbackErr) {
          console.error("Local speech synthesis fallback failed in sequence:", fallbackErr);
          setError("Sequence stopped. Recitation rate limit reached.");
          setIsFullSurahPlaying(false);
          setPlayingAyahIndex(null);
        }
      }
    };

    playStep(0);
  };

  // Adapter for Coach panel to utilize SpeechSynthesis fallbacks during Practice
  const handlePlayAyahWithCallback = (
    ayahNumber: number,
    voice: string,
    onEnd: (duration: number) => void,
    onReady: () => void
  ): HTMLAudioElement | null => {
    stopAllAudio();
    setError(null);
    setPlayingAyahIndex(ayahNumber);

    // Warm up words breakdown for practice Ayah
    fetchAyahWords(ayahNumber);

    const run = async () => {
      const ayah = surahData.find((v) => v.number === ayahNumber);
      if (!ayah) return;

      if (quotaLimitExceeded) {
        try {
          onReady();
          await speakArabicLocalDirectly(ayah.text);
        } catch (fallbackErr) {
          console.error("Local speech synthesis coach fallback failed:", fallbackErr);
        }
        setPlayingAyahIndex(null);
        onEnd(4);
        return;
      }

      try {
        const audioUrl = await fetchRecitation(ayah.text, voice);
        onReady();

        const audio = new Audio(audioUrl);
        activeAudioRef.current = audio;

        audio.onended = () => {
          setPlayingAyahIndex(null);
          activeAudioRef.current = null;
          onEnd(audio.duration || 4);
        };

        await audio.play();
      } catch (err: any) {
        if (err.code === "QUOTA_EXCEEDED") {
          setQuotaLimitExceeded(true);
        }
        console.warn("TTS rate limited in coach recitation - falling back to browser TTS:", err);
        try {
          onReady();
          await speakArabicLocalDirectly(ayah.text);
        } catch (fallbackErr) {
          console.error("Local speech synthesis coach fallback failed:", fallbackErr);
        }
        setPlayingAyahIndex(null);
        onEnd(4); // Call anyway to avoid sticking the countdown Timer
      }
    };

    run();
    return new Audio();
  };

  // Helper to recite hints during Practice Memorization Quiz
  const handlePlayQuizHint = async (text: string, onEnded?: () => void): Promise<void> => {
    stopAllAudio();
    setLoading(true);
    setError(null);
    return new Promise(async (resolve) => {
      let finished = false;
      const done = () => {
        if (finished) return;
        finished = true;
        setLoading(false);
        if (onEnded) onEnded();
        resolve();
      };

      if (quotaLimitExceeded) {
        try {
          await speakArabicLocalDirectly(text);
          done();
        } catch (fallbackErr) {
          console.error("Local speech synthesis quiz fallback failed:", fallbackErr);
          setError("Recitation temporary unavailable. Please verify API key setup.");
          done();
        }
        return;
      }

      try {
        const audioUrl = await fetchRecitation(text, selectedVoice);
        const audio = new Audio(audioUrl);
        activeAudioRef.current = audio;
        audio.onended = () => {
          activeAudioRef.current = null;
          done();
        };
        audio.onerror = () => {
          activeAudioRef.current = null;
          done();
        };
        await audio.play();
      } catch (err: any) {
        if (err.code === "QUOTA_EXCEEDED") {
          setQuotaLimitExceeded(true);
        }
        console.warn("TTS limit or error - falling back to browser speech synthesis", err);
        try {
          await speakArabicLocalDirectly(text);
          done();
        } catch (fallbackErr) {
          console.error("Local speech synthesis quiz fallback failed:", fallbackErr);
          setError("Recitation temporary unavailable. Please verify API key setup.");
          done();
        }
      }
    });
  };

  // Helper trigger to play a specific custom sample in Tajweed Masterclass
  const handlePlayTajweedSample = async (sampleText: string, label: string) => {
    setPlayingWordId(label);
    setLoading(true);
    setError(null);

    if (quotaLimitExceeded) {
      try {
        await speakArabicLocalDirectly(sampleText);
      } catch (fallbackErr) {
        console.error("Local speech synthesis fallback for Tajweed sample failed:", fallbackErr);
        setError("Recitation temporary unavailable. Please verify API key setup.");
      } finally {
        setPlayingWordId(null);
        setLoading(false);
      }
      return;
    }

    try {
      const audioUrl = await fetchRecitation(sampleText, selectedVoice);
      const audio = new Audio(audioUrl);
      activeAudioRef.current = audio;

      audio.onended = () => {
        setPlayingWordId(null);
        activeAudioRef.current = null;
      };

      await audio.play();
    } catch (err: any) {
      if (err.code === "QUOTA_EXCEEDED") {
        setQuotaLimitExceeded(true);
      }
      console.error("Play Tajweed Sample Error:", err);
      try {
        await speakArabicLocalDirectly(sampleText);
      } catch (fallbackErr) {
        console.error("Local speech synthesis fallback for Tajweed sample failed:", fallbackErr);
        setError(err.message || "Could not recite tajweed audio.");
      }
      setPlayingWordId(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`relative min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col justify-between overflow-hidden transition-all duration-300 ${
      isKidsMode ? "text-slate-900" : "text-slate-100"
    }`}>
      {/* Kids Mode Glittering / Cosmic Dark Mode Fullscreen Background */}
      <div className={`fixed inset-0 -z-50 transition-all duration-1000 ${
        isKidsMode 
          ? "glitter-rainbow-bg" 
          : "bg-[#020617]"
      }`}></div>

      {/* Floating Sparkling Star Particles for Glittery Screen Effect */}
      {isKidsMode && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-40">
          <span className="sparkling-element absolute text-rose-400 text-3xl font-bold top-[6%] left-[4%]">⭐</span>
          <span className="sparkling-element absolute text-purple-400 text-4xl font-bold top-[12%] right-[8%] [animation-delay:0.5s]">✨</span>
          <span className="sparkling-element absolute text-yellow-500 text-3xl font-bold bottom-[15%] left-[6%] [animation-delay:1.2s]">🌟</span>
          <span className="sparkling-element absolute text-cyan-400 text-2.5xl font-bold bottom-[22%] right-[5%] [animation-delay:0.8s]">⭐</span>
          <span className="sparkling-element absolute text-pink-400 text-4.5xl font-bold top-[42%] left-[2%] [animation-delay:1.5s]">✨</span>
          <span className="sparkling-element absolute text-emerald-400 text-3xl font-bold top-[55%] right-[5%] [animation-delay:2s]">🌟</span>
          <span className="sparkling-element absolute text-amber-500 text-3.5xl font-bold bottom-[42%] left-[8%] [animation-delay:0.3s]">⭐</span>
        </div>
      )}

      {/* Decorative Atmospheric Glow Blobs for Frosted Glass Theme */}
      {!isKidsMode && (
        <>
          <div className="absolute top-[5%] left-[-15%] w-[400px] h-[400px] bg-indigo-900/20 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="absolute bottom-[10%] right-[-15%] w-[500px] h-[500px] bg-teal-900/15 rounded-full blur-[120px] pointer-events-none"></div>
          <div className="absolute top-[55%] left-[25%] w-[300px] h-[300px] bg-purple-900/10 rounded-full blur-[110px] pointer-events-none"></div>
        </>
      )}

      {/* Top Header inside a gorgeous glass container */}
      <header className={`z-10 mb-8 backdrop-blur-xl border rounded-[32px] p-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 shadow-2xl transition-all duration-300 ${
        isKidsMode
          ? "bg-white/90 border-indigo-150 shadow-indigo-100/40"
          : "bg-white/5 border border-white/10"
      }`}>
        <div>
          <div className="flex items-center gap-2 font-semibold text-xs tracking-wider uppercase">
            <Book className={`w-4 h-4 ${isKidsMode ? "text-indigo-600 animate-bounce" : "text-teal-350"}`} />
            <span className={isKidsMode ? "text-indigo-800 font-extrabold" : "text-teal-400"}>
              {isKidsMode ? "🎈 Interactive Kids Quran Learning Zone" : "Sacred Texts Learning & Practice Center"}
            </span>
          </div>
          <h1 className={`text-2xl md:text-4xl font-black mt-1.5 flex items-center gap-2 ${
            isKidsMode ? "glow-title-rainbow" : "text-white font-extrabold"
          }`}>
            {isKidsMode ? "🍭 Quran Teacher" : "Quran teacher"}
          </h1>
          <p className={`text-sm mt-1 max-w-2xl leading-normal ${
            isKidsMode ? "text-[#334155] font-semibold" : "text-slate-305"
          }`}>
            {isKidsMode
              ? "Choose your favourite tutor! Repeat verses with happy counting balloons, and tap beautiful colored words to hear correct pronunciation!"
              : "Master authentic classical pronunciation with slow, child-friendly recitation parameters. Powered by Gemini TTS & deep learning NLP parsing engines covering all 114 Surahs."}
          </p>
        </div>

        {/* Global Control Station */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Kids Mode Toggle Button */}
          <button
            id="kids-mode-toggle"
            onClick={() => setIsKidsMode(!isKidsMode)}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black transition-all shadow-md cursor-pointer transform hover:scale-105 active:scale-95 ${
              isKidsMode
                ? "bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 border-b-4 border-indigo-850 text-white"
                : "bg-white/10 hover:bg-white/20 text-slate-200 border border-white/15"
            }`}
          >
            <span>{isKidsMode ? "🦄 Kids Style: Active 🌈" : "🧸 Switch to Kids Mode"}</span>
          </button>

          {/* Complete Recite Trigger */}
          {isFullSurahPlaying ? (
            <button
              id="stop-full-recitation-btn"
              onClick={stopAllAudio}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all shadow-md border cursor-pointer ${
                isKidsMode
                  ? "bg-slate-900 border-b-4 border-slate-705 text-white"
                  : "bg-slate-900/90 text-white hover:bg-slate-800 border-white/10"
              }`}
            >
              <Pause className="w-3.5 h-3.5" />
              Stop Recitation
            </button>
          ) : (
            <button
              id="play-full-recitation-btn"
              onClick={handlePlayFullSurah}
              disabled={loading}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black transition-all shadow-lg hover:scale-[1.02] cursor-pointer ${
                isKidsMode
                  ? "bg-emerald-500 border-b-4 border-emerald-700 text-white"
                  : "bg-teal-500 hover:bg-teal-450 text-slate-950 shadow-teal-550/20"
              }`}
            >
              <Volume2 className={`w-4 h-4 text-slate-950 ${isFullSurahPlaying ? "animate-pulse" : ""}`} />
              Recite Full Chapter
            </button>
          )}

          {/* Quick Clear */}
          {(playingWordId || playingAyahIndex !== null || isFullSurahPlaying) && (
            <button
              id="clear-all-audio-btn"
              onClick={stopAllAudio}
              className={`px-3.5 py-3 border rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                isKidsMode
                  ? "bg-white/80 hover:bg-white border-slate-200 text-slate-705"
                  : "bg-white/5 hover:bg-white/10 border-white/10 text-slate-200"
              }`}
            >
              Stop Reciting
            </button>
          )}
        </div>
      </header>

      {/* Main Grid Body */}
      <main className="z-10 space-y-8 flex-1">
        
        {/* Searchable Surah Directory Card (Frosted glass controls) */}
        <div 
          className={`border rounded-[32px] p-6 shadow-xl space-y-4 transition-all duration-300 ${
            isKidsMode
              ? "bg-white/80 border-indigo-150 text-slate-900"
              : "backdrop-blur-xl bg-white/5 border border-white/10 text-slate-100"
          }`} 
          id="surah-selector-panel"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className={`text-lg font-bold flex items-center gap-2 ${isKidsMode ? "text-indigo-900 text-lg" : "text-white"}`}>
                <ListCheck className={`w-5 h-5 ${isKidsMode ? "text-indigo-650" : "text-teal-400"}`} />
                {isKidsMode ? "📖 Pick any Chapter of the Qur'an! 🥰" : "Select Practice Sūrah (114 Catalog)"}
              </h2>
              <p className={`text-xs mt-0.5 ${isKidsMode ? "text-slate-650 font-medium" : "text-slate-305"}`}>
                {isKidsMode 
                  ? "Pick any of the 114 beautiful surahs of the Quran. The computer will read it with slow, beautiful pronunciation guides." 
                  : "Browse any of the 114 chapters. The system dynamically streams authentic Uthmani scripts and generates custom word-by-word Tajweed details."}
              </p>
            </div>

            {/* Selector Dropdown with elegant wrapper */}
            <div className="relative w-full sm:w-80">
              <select
                id="surah-directory-select"
                value={selectedSurahNumber}
                onChange={(e) => setSelectedSurahNumber(parseInt(e.target.value, 10))}
                className={`w-full outline-hidden px-4 py-3 text-xs font-black rounded-2xl cursor-pointer appearance-none shadow-md transition-all ${
                  isKidsMode
                    ? "bg-white border-2 border-indigo-300 hover:border-indigo-500 text-indigo-950"
                    : "bg-slate-950/90 text-slate-150 border border-white/10 hover:border-teal-400/50 text-white focus:ring-2 focus:ring-teal-400"
                }`}
              >
                {surahList.length > 0 ? (
                  surahList.map((s) => (
                    <option key={s.number} value={s.number} className={isKidsMode ? "bg-white text-slate-900" : "bg-slate-950 text-white"}>
                      {s.number}. {s.name} ({s.english}) — {s.arabic}
                    </option>
                  ))
                ) : (
                  <option value={114} className={isKidsMode ? "bg-white text-slate-900" : "bg-slate-950 text-white"}>114. Al-Nas (Mankind) — سُورَةُ النَّاسِ</option>
                )}
              </select>
              <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-slate-400">
                <ChevronDown className={`w-4 h-4 ${isKidsMode ? "text-indigo-600" : "text-teal-300"}`} />
              </div>
            </div>
          </div>

          {/* Preset shortcuts grid */}
          <div className={`flex flex-wrap items-center gap-2 pt-1.5 border-t text-xs ${
            isKidsMode ? "border-indigo-150 text-slate-700" : "border-white/5 text-slate-400"
          }`} id="quick-links">
            <span className={`font-semibold text-[10px] uppercase tracking-wider ${isKidsMode ? "text-indigo-800" : "text-teal-400/90"}`}>
              {isKidsMode ? "⭐ Try these favorites first:" : "Quick Presets:"}
            </span>
            {[
              { num: 1, label: "Al-Fatihah (1)" },
              { num: 36, label: "Ya-Sin (36)" },
              { num: 55, label: "Ar-Rahman (55)" },
              { num: 67, label: "Al-Mulk (67)" },
              { num: 112, label: "Al-Ikhlas (112)" },
              { num: 113, label: "Al-Falaq (113)" },
              { num: 114, label: "An-Nas (114)" },
            ].map((preset) => (
              <button
                key={preset.num}
                onClick={() => setSelectedSurahNumber(preset.num)}
                className={`px-3 py-1.5 rounded-xl border text-[11px] font-black tracking-wide transition-all cursor-pointer ${
                  selectedSurahNumber === preset.num
                    ? isKidsMode
                      ? "bg-indigo-600 border-indigo-700 text-white shadow-md scale-102"
                      : "bg-teal-500/25 border-teal-400 text-teal-300 font-extrabold"
                    : isKidsMode
                    ? "bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100"
                    : "bg-white/5 border-white/5 hover:border-white/10 text-slate-300 hover:text-white"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* My Bookmarks Section */}
          {bookmarks.length > 0 && (
            <div className="pt-3 border-t border-white/5 space-y-2" id="bookmarks-section">
              <span className="font-semibold text-[10px] uppercase tracking-wider text-amber-400/90 flex items-center gap-1.5 font-mono">
                <BookmarkIcon className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                My Bookmarks ({bookmarks.length})
              </span>
              <div className="flex flex-wrap gap-2">
                {bookmarks.map((b) => (
                  <button
                    key={`${b.surahNumber}-${b.ayahNumber}`}
                    onClick={() => {
                      setSelectedSurahNumber(b.surahNumber);
                      // Scroll to specific ayah block cleanly
                      setTimeout(() => {
                        const el = document.getElementById(`ayah-block-${b.ayahNumber}`);
                        if (el) {
                          el.scrollIntoView({ behavior: "smooth", block: "center" });
                        }
                      }, 500);
                    }}
                    className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl border border-white/5 bg-amber-500/10 hover:bg-amber-500/15 border-amber-500/15 hover:border-amber-400/30 text-slate-200 transition-all cursor-pointer group"
                  >
                    <span className="font-mono text-[10.5px] text-amber-300 font-extrabold flex items-center gap-1">
                      {b.surahName} {b.ayahNumber}
                    </span>
                    <span className="text-[10.5px] text-slate-400 overflow-hidden text-ellipsis max-w-[150px] whitespace-nowrap group-hover:text-slate-200" dir="rtl">
                      {b.text}
                    </span>
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveBookmark(b.surahNumber, b.ayahNumber);
                      }}
                      className="text-slate-400 hover:text-red-400 hover:bg-white/10 rounded-full w-4 h-4 flex items-center justify-center font-bold text-xs font-mono transition-colors"
                      title="Remove Bookmark"
                    >
                      ×
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Fallback Auto-Activation Banner */}
        {quotaLimitExceeded && (
          <div className="bg-amber-950/45 backdrop-blur-xl border border-amber-500/30 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg shadow-amber-950/20" id="quota-limit-banner">
            <div className="flex gap-3">
              <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
              <div>
                <h4 className="font-bold text-amber-200 text-sm flex items-center gap-2">
                  High-Reliability Fallback Mode Auto-Activated
                  <span className="bg-amber-400 text-amber-950 text-[9px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider animate-bounce">
                    Active
                  </span>
                </h4>
                <p className="text-xs text-amber-300 mt-1 leading-relaxed max-w-3xl">
                  You are currently using the Gemini Free Tier. Your daily API limit of text-to-speech requests has been exhausted. To ensure your learning and recitation is never disrupted, we have <strong>automatically transitioned to local browser text-to-speech synthesis</strong>! Every button, surah, ayah, and classroom tip will continue working seamlessly in high-fidelity classical Arabic.
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setQuotaLimitExceeded(false)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold text-xs rounded-xl transition-all shadow-md shrink-0 hover:scale-[1.02]"
            >
              Try Gemini Mode Again
            </button>
          </div>
        )}

        {/* Error Notification Alert */}
        {error && (
          <div className="bg-red-950/65 backdrop-blur border border-red-500/30 rounded-xl p-4 flex gap-3 relative mr-2" id="error-alert">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-red-200 text-sm">Gemini Service Notification</h4>
              <p className="text-xs text-red-300 mt-1 pr-6 leading-relaxed">
                {error}
                <br />
                <span className="font-semibold block mt-1 text-slate-300">
                  Ensure you are connected to the internet and your <strong>GEMINI_API_KEY</strong> has been verified inside of Settings &gt; Secrets panel.
                </span>
              </p>
              <button
                onClick={() => setError(null)}
                className="absolute top-2 right-2 text-red-300 hover:text-white font-bold text-xs"
              >
                ✕ Close
              </button>
            </div>
          </div>
        )}

        {/* Global Loading Overlay inside action cards */}
        {loading && (
          <div className="fixed bottom-6 right-6 z-50 bg-slate-950/90 backdrop-blur text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-white/10 animate-bounce">
            <RefreshCw className="w-4 h-4 animate-spin text-teal-450" />
            <span className="text-xs font-semibold font-mono tracking-wide text-teal-300">
              Teacher is speaking...
            </span>
          </div>
        )}

        {/* Informative Intro Cards (Bento-styled) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="surah-intel-bento">
          <div className="backdrop-blur-md bg-white/5 border border-white/10 p-5 rounded-2xl flex items-start gap-3.5 shadow-md">
            <div className="p-2.5 bg-teal-500/10 rounded-xl text-teal-400 shrink-0 border border-teal-500/10">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">About Surah {activeSurahMeta.name}</h3>
              <p className="text-slate-300 text-xs mt-1 leading-normal">
                This beautiful <strong>{activeSurahMeta.type}</strong> chapter contains <strong>{activeSurahMeta.verses}</strong> verses. Perfectly formatted for repetitive pronunciation cycles.
              </p>
            </div>
          </div>

          <div className="backdrop-blur-md bg-white/5 border border-white/10 p-5 rounded-2xl flex items-start gap-3.5 shadow-md">
            <div className="p-2.5 bg-teal-500/10 rounded-xl text-teal-400 shrink-0 border border-teal-500/10">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Pure Teacher Recitation</h3>
              <p className="text-slate-300 text-xs mt-1 leading-normal">
                We invoke Gemini TTS to speak clear classical vocal tones, with correct elongations/madd, throat articulations, and perfect nasal counts.
              </p>
            </div>
          </div>

          <div className="backdrop-blur-md bg-white/5 border border-white/10 p-5 rounded-2xl flex items-start gap-3.5 shadow-md">
            <div className="p-2.5 bg-teal-500/10 rounded-xl text-teal-400 shrink-0 border border-teal-500/10">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Interactive Playback</h3>
              <p className="text-slate-300 text-xs mt-1 leading-normal">
                Click any word below in the Mushaf to inspect phonetic transliterations, individual meanings, matching Tajweed markings, and articulation rules.
              </p>
            </div>
          </div>
        </div>

        {/* Mushaf & Reader Section */}
        <section className="grid grid-cols-1 lg:grid-cols-1 gap-8">
          <SurahReader
            surahData={surahData}
            onPlayWord={handlePlayWord}
            onPlayAyah={handlePlayAyah}
            playingWordId={playingWordId && playingWordId.startsWith("word-box-") ? playingWordId : null} 
            playingAyahIndex={playingAyahIndex}
            loading={loading}
            surahNum={selectedSurahNumber}
            surahName={activeSurahMeta.name}
            surahArabic={activeSurahMeta.arabic}
            surahEnglish={activeSurahMeta.english}
            surahType={activeSurahMeta.type}
            loadingSurah={loadingSurah}
            onLoadAyahAnalysis={fetchAyahWords}
            bookmarks={bookmarks}
            onToggleBookmark={handleToggleBookmark}
            isKidsMode={isKidsMode}
            onCompleteSurah={handleCompleteSurah}
            completedSurahs={completedSurahs}
          />
        </section>

        {/* Repeat practice loop section */}
        <section>
          <PracticePanel
            surahData={surahData}
            selectedVoice={selectedVoice}
            onVoiceChange={setSelectedVoice}
            onPlayAyahWithCallback={handlePlayAyahWithCallback}
            loading={loading}
            onSetLoading={setLoading}
            isKidsMode={isKidsMode}
            onCelebrate={() => setConfettiTrigger((p) => p + 1)}
          />
        </section>

        {/* Tajweed Articulation class guide section */}
        <section>
          <TajweedGuide
            onPlaySample={handlePlayTajweedSample}
            playingLabel={playingWordId}
            loading={loading}
            isKidsMode={isKidsMode}
          />
        </section>

        {/* Kids Mode Virtue Badge Shelf */}
        {isKidsMode && (
          <section className="mt-4">
            <VirtueBadgeShelf completedSurahs={completedSurahs} surahList={surahList} />
          </section>
        )}

      </main>

      {/* Confetti Explosion Component */}
      <Confetti trigger={confettiTrigger} />

      {/* Virtue Badge Unlock Modal Overlay */}
      <VirtueBadgeUnlockModal badge={unlockedBadgeToShow} onClose={() => setUnlockedBadgeToShow(null)} />

      {/* Footer */}
      <footer className="z-10 mt-12 pt-6 border-t border-white/5 text-center text-xs text-slate-500">
        <p>© Classical Arabic Recital Practice Coach. Accuracy first. Verified against standard Mushaf. Utilizes models/gemini-3.1-flash-tts-preview.</p>
        <p className="mt-1 text-[10px]">Designed patiently using premium frosted glass appearance for peaceful, immersive visual focus.</p>
      </footer>
    </div>
  );
}
