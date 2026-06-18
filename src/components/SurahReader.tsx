import { useState, useEffect } from "react";
import { AyahData, WordData, Bookmark } from "../types";
import KidsPhoneticTip from "./KidsPhoneticTip";
import { Play, Volume2, BookOpen, AlertCircle, Type, Loader2, Bookmark as BookmarkIcon, Award, Heart, CheckCircle } from "lucide-react";

interface SurahReaderProps {
  surahData: AyahData[];
  onPlayWord: (wordText: string, wordId: string) => void;
  onPlayAyah: (ayahNumber: number) => void;
  playingWordId: string | null;
  playingAyahIndex: number | null;
  loading: boolean;
  surahNum: number;
  surahName: string;
  surahArabic: string;
  surahEnglish: string;
  surahType: string;
  loadingSurah: boolean;
  onLoadAyahAnalysis?: (ayahNumber: number) => void;
  bookmarks: Bookmark[];
  onToggleBookmark: (ayahNumber: number, text: string, translation: string) => void;
  isKidsMode?: boolean;
  onCompleteSurah?: (surahNum: number) => void;
  completedSurahs?: number[];
}

function getOrdinalSuffix(i: number) {
  const j = i % 10,
    k = i % 100;
  if (j === 1 && k !== 11) {
    return "st";
  }
  if (j === 2 && k !== 12) {
    return "nd";
  }
  if (j === 3 && k !== 13) {
    return "rd";
  }
  return "th";
}

export default function SurahReader({
  surahData,
  onPlayWord,
  onPlayAyah,
  playingWordId,
  playingAyahIndex,
  loading,
  surahNum,
  surahName,
  surahArabic,
  surahEnglish,
  surahType,
  loadingSurah,
  onLoadAyahAnalysis,
  bookmarks,
  onToggleBookmark,
  isKidsMode = true,
  onCompleteSurah,
  completedSurahs = [],
}: SurahReaderProps) {
  const [selectedWord, setSelectedWord] = useState<WordData | null>(null);
  const [fontSize, setFontSize] = useState<"md" | "lg" | "xl">("lg");
  const [audioMode, setAudioMode] = useState<"word" | "ayah">("ayah");

  // Keep selectedWord up to date or reset on surah change
  useEffect(() => {
    setSelectedWord(null);
  }, [surahNum]);

  // Sync selected word if the parent loaded its real breakdown data
  useEffect(() => {
    if (!selectedWord) return;
    for (const ayah of surahData) {
      if (ayah.words && ayah.words.length > 0) {
        // Look for the loaded word (either matches by real ID or by sequence if selected was a placeholder)
        const found = ayah.words.find(w => w.id === selectedWord.id || (selectedWord.id.startsWith("placeholder-") && w.text === selectedWord.text));
        if (found && !found.id.startsWith("placeholder-")) {
          setSelectedWord(found);
          break;
        }
      }
    }
  }, [surahData]);

  const fontSizes = {
    md: { arabic: "text-2xl", sub: "text-xs" },
    lg: { arabic: "text-3xl md:text-4xl", sub: "text-sm" },
    xl: { arabic: "text-4xl md:text-5xl", sub: "text-base" },
  };

  const handleWordClick = (word: WordData, ayahNum: number) => {
    setSelectedWord(word);
    if (onLoadAyahAnalysis && (word.id.startsWith("placeholder-") || !word.id.startsWith("word-box-"))) {
      onLoadAyahAnalysis(ayahNum);
    }
    if (audioMode === "word" || isKidsMode) {
      onPlayWord(word.text, word.id);
    }
  };

  return (
    <div className="space-y-6" id="surah-reader">
      {/* Settings Row (Kids Grad or Frosted Glass Header) */}
      <div 
        className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 rounded-[24px] transition-all duration-300 ${
          isKidsMode 
            ? "bg-gradient-to-r from-teal-100 via-sky-100 to-amber-100 border-4 border-dashed border-teal-400/50 text-slate-800 shadow-md" 
            : "backdrop-blur-md bg-white/5 border border-white/10 text-slate-100"
        }`}
      >
        <div className="flex items-center gap-2">
          <BookOpen className={`w-5 h-5 ${isKidsMode ? "text-teal-600" : "text-teal-400"}`} />
          <span className={`text-sm font-bold ${isKidsMode ? "text-slate-900" : "text-slate-100"}`}>
            {isKidsMode ? "🎈 Learning & Playing Setup" : "Reading Options"}
          </span>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto justify-start sm:justify-end">
          {/* Audio mode selector */}
          <div className={`flex p-1 rounded-xl border transition-all ${isKidsMode ? "bg-teal-500/10 border-teal-400/30" : "bg-black/30 border-white/5"}`}>
            <button
              id="audio-mode-ayah"
              onClick={() => setAudioMode("ayah")}
              className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                audioMode === "ayah"
                  ? isKidsMode
                    ? "bg-rose-500 text-white shadow-md font-extrabold translate-y-[-1px]"
                    : "bg-teal-500 text-slate-950 shadow-md font-extrabold"
                  : isKidsMode
                    ? "text-slate-600 hover:text-slate-950"
                    : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Interactive Verses
            </button>
            <button
              id="audio-mode-word"
              onClick={() => setAudioMode("word")}
              className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                audioMode === "word"
                  ? isKidsMode
                    ? "bg-teal-500 text-slate-950 shadow-md font-extrabold translate-y-[-1px]"
                    : "bg-teal-500 text-slate-950 shadow-md font-extrabold"
                  : isKidsMode
                    ? "text-slate-600 hover:text-slate-950"
                    : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Word-by-Word
            </button>
          </div>

          {/* Size controls */}
          <div className={`flex items-center gap-1.5 border-l pl-4 ${isKidsMode ? "border-slate-300" : "border-white/10"}`}>
            <Type className={`w-3.5 h-3.5 ${isKidsMode ? "text-slate-600" : "text-slate-400"}`} />
            <select
              id="font-size-select"
              value={fontSize}
              onChange={(e) => setFontSize(e.target.value as "md" | "lg" | "xl")}
              className={`text-xs font-bold bg-transparent border rounded-lg py-1 px-2 focus:ring-2 focus:ring-teal-400 cursor-pointer focus:outline-none ${
                isKidsMode ? "text-slate-800 border-slate-300 bg-white" : "text-slate-200 border-white/10"
              }`}
            >
              <option value="md" className={isKidsMode ? "bg-white text-slate-800" : "bg-slate-900 text-slate-100"}>
                {isKidsMode ? "🎈 Standard Text" : "Sized Medium"}
              </option>
              <option value="lg" className={isKidsMode ? "bg-white text-slate-800" : "bg-slate-900 text-slate-100"}>
                {isKidsMode ? "🌟 Large Text" : "Sized Large"}
              </option>
              <option value="xl" className={isKidsMode ? "bg-white text-slate-800" : "bg-slate-900 text-slate-100"}>
                {isKidsMode ? "👑 Gigantic Text" : "Sized Huge"}
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Mushaf Frame inside glass/cloud box */}
      <div 
        className={`backdrop-blur-xl transition-all duration-300 border rounded-[32px] p-6 lg:p-10 relative shadow-2xl overflow-hidden min-h-[300px] ${
          isKidsMode 
            ? "bg-white/95 border-4 border-dashed border-sky-300 shadow-xl shadow-sky-100/30 text-slate-900" 
            : "bg-white/5 border border-white/10 text-slate-100"
        }`}
      >
        {loadingSurah ? (
          <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-sm z-30 flex flex-col justify-center items-center gap-3">
            <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
            <p className={`text-sm font-semibold font-mono ${isKidsMode ? "text-teal-650" : "text-slate-300"}`}>
              {isKidsMode ? "🎨 Preparing beautiful verses for you..." : "Retrieving script from authentic records..."}
            </p>
          </div>
        ) : null}

        {/* Subtle decorative glow overlays inside the frame */}
        <div className="absolute top-[-10%] right-[-10%] w-[200px] h-[200px] bg-teal-500/5 rounded-full blur-[40px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[200px] h-[200px] bg-indigo-500/5 rounded-full blur-[40px] pointer-events-none"></div>

        <div className={`text-center mb-8 border-b pb-5 max-w-sm mx-auto ${isKidsMode ? "border-amber-200" : "border-white/10"}`}>
          <span className={`text-[10px] uppercase tracking-widest font-extrabold font-mono ${isKidsMode ? "text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full border border-indigo-100" : "text-teal-400/80"}`}>
            {isKidsMode ? `✨ Chapter ${surahNum} of 114 ✨` : `${surahNum}${getOrdinalSuffix(surahNum)} Chapter of Al-Qur'an`}
          </span>
          <h1 className={`text-3xl font-serif font-bold mt-2.5 tracking-wide ${isKidsMode ? "text-teal-700 drop-shadow-sm" : "text-white drop-shadow-[0_2px_8px_rgba(20,184,166,0.2)]"}`}>
            {surahArabic}
          </h1>
          <span className={`text-xs tracking-tight italic ${isKidsMode ? "text-slate-550 font-medium" : "text-slate-405"}`}>
            {isKidsMode ? `🎈 Surah ${surahName} (${surahEnglish})` : `Surah ${surahName} (${surahEnglish})`} — {surahType} Period
          </span>
        </div>

        {/* Mushaf content */}
        <div className={`space-y-6 md:space-y-8 ${loadingSurah ? "opacity-30" : "transition-opacity"}`} dir="rtl">

          {surahData.map((ayah, aIdx) => {
            const isPlayingAyah = playingAyahIndex === ayah.number;
            const isBismillah = ayah.number === 0;

            // Kid-friendly color presets for each ayah
            const kidColors = [
              { bg: "bg-amber-50/85 hover:bg-amber-100/90 border-amber-200 hover:border-amber-300 text-amber-950", badge: "bg-amber-500 text-white", label: "⭐ Ayah", emoji: "⭐" },
              { bg: "bg-sky-50/85 hover:bg-sky-100/90 border-sky-200 hover:border-sky-300 text-sky-950", badge: "bg-sky-500 text-white", label: "🐳 Ayah", emoji: "🐳" },
              { bg: "bg-pink-50/85 hover:bg-pink-100/90 border-pink-200 hover:border-pink-300 text-pink-950", badge: "bg-pink-500 text-white", label: "🌸 Ayah", emoji: "🌸" },
              { bg: "bg-emerald-50/85 hover:bg-emerald-100/90 border-emerald-200 hover:border-emerald-300 text-emerald-950", badge: "bg-emerald-500 text-white", label: "🌿 Ayah", emoji: "🌿" },
              { bg: "bg-purple-50/85 hover:bg-purple-100/90 border-purple-200 hover:border-purple-300 text-purple-950", badge: "bg-purple-500 text-white", label: "🔮 Ayah", emoji: "🔮" },
              { bg: "bg-orange-50/85 hover:bg-orange-100/90 border-orange-200 hover:border-orange-300 text-orange-950", badge: "bg-orange-500 text-white", label: "🍊 Ayah", emoji: "🍊" },
            ];
            const kidColor = isBismillah 
              ? { bg: "bg-rose-50/90 border-rose-200 hover:border-rose-300 text-rose-950", badge: "bg-rose-500 text-white", label: "🎉 Prelude", emoji: "🎉" }
              : kidColors[(ayah.number - 1) % kidColors.length] || kidColors[0];

            return (
              <div
                key={ayah.number}
                id={`ayah-block-${ayah.number}`}
                className={`py-5 px-5 md:px-7 rounded-[24px] border-2 transition-all duration-300 relative ${
                  isPlayingAyah
                    ? isKidsMode
                      ? "bg-rose-100/90 border-rose-400 scale-[1.01] shadow-lg shadow-rose-200/50 text-rose-950"
                      : "bg-white/5 border border-teal-500/30 shadow-lg shadow-teal-500/5"
                    : isKidsMode
                    ? `${kidColor.bg}`
                    : isBismillah
                    ? "text-center"
                    : "hover:bg-white/[0.02] border border-transparent hover:border-white/5 text-slate-100"
                }`}
              >
                {/* Play full verse trigger */}
                <div className="flex gap-4 items-center justify-between xl:justify-start flex-row-reverse mb-4" dir="ltr">
                  <div className="flex items-center gap-1.5">
                    {isBismillah ? (
                      isKidsMode ? (
                        <span className="text-[11px] font-extrabold bg-rose-500 text-white px-3 py-1 rounded-full uppercase tracking-wider animate-bounce shadow">
                          {kidColor.emoji} Bismillah
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono font-bold bg-white/10 text-slate-300 px-2 py-0.5 rounded-full uppercase border border-white/5">
                          Prologue
                        </span>
                      )
                    ) : (
                      isKidsMode ? (
                        <span className={`text-[11px] font-extrabold px-3 py-1 rounded-full shadow border border-white/15 text-white ${kidColor.badge}`}>
                          {kidColor.label} {ayah.number}
                        </span>
                      ) : (
                        <span className="text-xs font-mono font-bold bg-teal-500/20 text-teal-300 px-2.5 py-0.5 rounded-full border border-teal-500/25">
                          Ayah {ayah.number}
                        </span>
                      )
                    )}

                    <button
                      id={`play-ayah-icon-${ayah.number}`}
                      onClick={() => onPlayAyah(ayah.number)}
                      disabled={loading}
                      className={`p-1.5 rounded-full transition-all flex items-center justify-center cursor-pointer ${
                        isPlayingAyah 
                          ? isKidsMode
                            ? "text-rose-600 bg-white shadow-inner scale-110"
                            : "text-teal-400 bg-white/10 shadow-inner"
                          : isKidsMode
                            ? "text-indigo-500 hover:text-indigo-700 hover:bg-indigo-100/50 hover:scale-110"
                            : "text-slate-400 hover:text-white hover:bg-white/10"
                      }`}
                      title="Recite full verse"
                    >
                      {isPlayingAyah ? (
                        <Volume2 className="w-4 h-4 animate-bounce" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </button>

                    {!isBismillah && (() => {
                      const isBookmarked = bookmarks?.some(
                        (b) => b.surahNumber === surahNum && b.ayahNumber === ayah.number
                      );
                      return (
                        <button
                          id={`bookmark-ayah-${ayah.number}`}
                          onClick={() => onToggleBookmark(ayah.number, ayah.text, ayah.translation)}
                          className={`p-1.5 rounded-full transition-all flex items-center justify-center cursor-pointer ${
                            isBookmarked 
                              ? isKidsMode
                                ? "text-amber-500 bg-white shadow-inner"
                                : "text-amber-400 bg-amber-500/10 shadow-inner" 
                              : isKidsMode
                                ? "text-slate-400 hover:text-amber-500 hover:bg-amber-100/50"
                                : "text-slate-400 hover:text-amber-400 hover:bg-white/10"
                          }`}
                          title={isBookmarked ? "Remove Bookmark" : "Bookmark this Ayah"}
                        >
                          <BookmarkIcon className={`w-4 h-4 ${isBookmarked ? "fill-amber-400" : ""}`} />
                        </button>
                      );
                    })()}
                  </div>
                  
                  {/* English meaning of verse */}
                  {!isBismillah && (
                    <p className={`text-xs text-left line-clamp-1 hover:line-clamp-none transition-all cursor-help ${
                      isKidsMode 
                        ? "text-slate-700 hover:text-slate-950 font-bold" 
                        : "text-slate-300 hover:text-white"
                    }`} title={ayah.translation}>
                      {isKidsMode ? `💡 meaning: "${ayah.translation}"` : ayah.translation}
                    </p>
                  )}
                </div>

                {/* Arabic Words Layout */}
                <div
                  className={`flex flex-wrap items-center justify-center ${
                    isBismillah ? "justify-center" : "gap-y-4 gap-x-3"
                  } leading-relaxed`}
                >
                  {(() => {
                    const displayWords = (ayah.words && ayah.words.length > 0)
                      ? ayah.words
                      : (ayah.text || "").split(" ").map((w, index) => ({
                          id: `placeholder-${ayah.number}-${index}`,
                          text: w,
                          transliteration: "Loading...",
                          translation: "Analyzing...",
                          tajweedRule: "None",
                          tajweedDetail: "AI background analysis in progress. Please wait...",
                          makhraj: "None",
                          makhrajDetail: "Analyzing articulation..."
                        }));

                    const wordKidsColors = [
                      { text: "text-rose-800", border: "border-pink-300", bg: "bg-rose-50/95" },
                      { text: "text-indigo-850", border: "border-indigo-250", bg: "bg-indigo-50/95" },
                      { text: "text-emerald-850", border: "border-emerald-250", bg: "bg-emerald-50/95" },
                      { text: "text-amber-850", border: "border-amber-300", bg: "bg-amber-50/90" },
                      { text: "text-purple-850", border: "border-purple-250", bg: "bg-purple-50/95" },
                      { text: "text-cyan-850", border: "border-cyan-250", bg: "bg-cyan-50/95" },
                    ];

                    return displayWords.map((word, wIdx) => {
                      const isPlayingWord = playingWordId === word.id;
                      const isSelected = selectedWord?.id === word.id;
                      const isPlaceholder = word.id.startsWith("placeholder-");
                      
                      const kidColorSet = wordKidsColors[wIdx % wordKidsColors.length];

                      return (
                        <div
                          key={word.id}
                          onClick={() => handleWordClick(word, ayah.number)}
                          className={`group cursor-pointer text-center inline-block transition-all focus:outline-none p-1.5 rounded-[22px] ${
                            isKidsMode
                              ? `${kidColorSet.bg} border-2 ${kidColorSet.border} shadow-sm hover:scale-[1.06] hover:shadow-indigo-100/40 duration-200`
                              : ""
                          } ${
                            isPlaceholder ? "animate-pulse" : ""
                          }`}
                          id={`word-box-${word.id}`}
                        >
                          {/* Arabic text with beautiful vocalization */}
                          <span
                            className={`font-serif leading-loose block transition-all rounded-xl ${
                              fontSizes[fontSize].arabic
                            } ${
                              isPlayingWord
                                ? isKidsMode
                                  ? "text-rose-700 bg-rose-200/90 shadow-inner px-2 py-0.5 rounded-xl scale-110 font-black animate-pulse"
                                  : "text-teal-300 border-b-2 border-teal-400 font-bold bg-teal-500/20 px-2.5 scale-105 shadow-md"
                                : isSelected
                                ? isKidsMode
                                  ? "text-indigo-900 bg-indigo-150/90 shadow-inner px-2 py-0.5 rounded-xl font-bold"
                                  : "text-teal-400 border-b-2 border-teal-400 font-bold px-1"
                                : isKidsMode
                                ? `${kidColorSet.text} font-bold hover:scale-105 duration-150`
                                : "text-slate-100 hover:text-teal-350 hover:scale-[1.02]"
                            }`}
                          >
                            {word.text}
                          </span>

                          {/* Transliteration subtitle */}
                          <span
                            className={`font-mono block tracking-tight group-hover:scale-105 duration-200 mt-1 transition-colors ${
                              isPlaceholder 
                                ? "text-slate-400/40" 
                                : isKidsMode
                                ? "text-slate-600 font-extrabold text-[11px]"
                                : "text-slate-400 group-hover:text-teal-350"
                            } ${fontSizes[fontSize].sub}`}
                            dir="ltr"
                          >
                            {word.transliteration}
                          </span>
                        </div>
                      );
                    });
                  })()}

                  {/* End of Verse Ornate Circle symbol */}
                  {!isBismillah && (
                    <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold select-none mx-2 ${
                      isKidsMode 
                        ? "bg-amber-300 text-amber-950 border-2 border-amber-500 shadow-md animate-bounce text-[12px]" 
                        : "border border-white/20 bg-white/5 text-[10px] text-slate-300 font-mono"
                    }`}>
                      {isKidsMode ? `🎈 ${ayah.number}` : ayah.number}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Kids Mode Beautiful Surah Completion Card */}
        {isKidsMode && (
          <div className="mt-8 p-6 rounded-[32px] border-4 border-dashed border-pink-300 bg-gradient-to-r from-pink-50 via-purple-50 to-indigo-50 flex flex-col items-center text-center shadow-lg relative overflow-hidden">
            {/* Ambient stars */}
            <span className="sparkling-element absolute text-xl text-yellow-400 top-2 left-6">⭐</span>
            <span className="sparkling-element absolute text-xl text-pink-400 bottom-3 right-8 [animation-delay:0.7s]">✨</span>
            <span className="sparkling-element absolute text-xl text-indigo-400 top-4 right-10 [animation-delay:1.4s]">🌟</span>

            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-md border-2 border-pink-200 mb-3 transform rotate-3">
              🎉
            </div>

            <h3 className="text-lg font-black text-indigo-950">You're doing amazing! 🌈</h3>
            <p className="text-xs font-semibold text-slate-650 max-w-md mt-1 mb-4">
              Finish reading or listening to <span className="font-extrabold text-indigo-700">Surah {surahName}</span> carefully, then tap the button below to add it to your beautiful Virtue Badges list!
            </p>

            {completedSurahs.includes(surahNum) ? (
              <div className="bg-emerald-500 text-white font-black text-xs px-6 py-3 rounded-2xl shadow-md border-b-4 border-emerald-700 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-white stroke-[3] animate-bounce" />
                Completed & Saved on Shelf! 🕌⭐
              </div>
            ) : (
              <button
                onClick={() => onCompleteSurah && onCompleteSurah(surahNum)}
                className="px-8 py-3.5 bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 text-white rounded-2xl text-xs font-black shadow-lg border-b-4 border-indigo-850 hover:scale-[1.03] active:scale-95 transition-all cursor-pointer flex items-center gap-2"
              >
                <Award className="w-4 h-4 animate-spin text-pink-200" />
                I Have Completed This Surah! 🎉
              </button>
            )}
          </div>
        )}
      </div>

      {/* Selected Word Detail Card / Tooltip Box */}
      <div id="word-detail-container" className="transition-all duration-300">
        {selectedWord ? (
          <div className={`p-5 md:p-6 rounded-[28px] border-2 shadow-2xl relative transition-all duration-300 ${
            isKidsMode
              ? "bg-gradient-to-br from-[#f0fdf4] to-[#f0f9ff] border-emerald-300 text-slate-900 shadow-xl shadow-emerald-100/35"
              : "backdrop-blur-xl bg-slate-950/40 border border-white/10 text-white"
          }`}>
            <button
              id="close-word-desc-btn"
              onClick={() => setSelectedWord(null)}
              className={`absolute top-4 right-4 text-xs px-2.5 py-1 rounded-xl transition-all cursor-pointer border ${
                isKidsMode 
                  ? "text-slate-600 bg-white hover:bg-slate-100 border-slate-300 hover:text-slate-900 shadow-sm" 
                  : "text-slate-450 hover:text-white bg-white/5 hover:bg-white/10 border-white/10"
              }`}
              title="Clear selection"
            >
              ✕ Clear Selection
            </button>
            
            <div className={`flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4 border-b ${
              isKidsMode ? "border-emerald-250" : "border-white/10"
            }`}>
              <div className="space-y-1">
                <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                  isKidsMode ? "bg-emerald-500 text-white shadow-sm" : "bg-teal-500 text-slate-950"
                }`}>
                  {isKidsMode ? "📚 Word Adventure Explorer 📚" : "Word Breakdown"}
                </span>
                <div className="flex flex-wrap items-baseline gap-3 pt-1">
                  <h3 className={`text-3xl font-serif font-bold ${isKidsMode ? "text-teal-700" : "text-teal-300"}`} dir="rtl">
                    {selectedWord.text}
                  </h3>
                  <span className={`text-lg font-mono font-bold ${isKidsMode ? "text-indigo-600" : "text-teal-300"}`}>
                    ({selectedWord.transliteration})
                  </span>
                </div>
                <p className={`text-sm ${isKidsMode ? "text-slate-700 font-semibold" : "text-slate-300"}`}>
                  Defines as: <span className={`font-extrabold italic ${isKidsMode ? "text-emerald-700 font-black text-base" : "text-white"}`}>"{selectedWord.translation}"</span>
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  id="play-desc-word-btn"
                  onClick={() => onPlayWord(selectedWord.text, selectedWord.id)}
                  disabled={loading}
                  className={`flex items-center gap-1.5 px-5 py-2.5 rounded-2xl font-bold text-xs transition-all cursor-pointer shadow-md ${
                    playingWordId === selectedWord.id
                      ? "bg-rose-500 border-b-4 border-rose-700 text-white animate-pulse"
                      : isKidsMode
                        ? "bg-indigo-500 hover:bg-indigo-600 border-b-4 border-indigo-700 hover:scale-105 active:scale-95 text-white"
                        : "bg-white/10 hover:bg-white/20 border border-white/10 text-white"
                  }`}
                >
                  <Volume2 className="w-4 h-4" />
                  {playingWordId === selectedWord.id ? "Playing audio..." : "Hear Pronunciation"}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 text-xs">
              <div className={`p-4 rounded-2xl border-2 ${
                isKidsMode 
                  ? "bg-amber-50/80 border-dashed border-amber-300 text-slate-800" 
                  : "bg-black/30 border border-white/5 text-slate-100"
              }`}>
                <h4 className={`font-mono font-bold mb-1 flex items-center gap-1.5 ${isKidsMode ? "text-amber-700 font-extrabold" : "text-teal-400"}`}>
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-ping"></span>
                  {isKidsMode ? "✨ Pronunciation Secret Rule:" : "Tajweed Pronunciation Rule:"}
                </h4>
                <p className={`text-[12px] font-extrabold mb-1.5 ${isKidsMode ? "text-amber-800" : "text-white"}`}>{selectedWord.tajweedRule}</p>
                <p className={`leading-relaxed text-[11px] ${isKidsMode ? "text-slate-650" : "text-slate-300"}`}>
                  {selectedWord.tajweedDetail}
                </p>
              </div>

              <div className={`p-4 rounded-2xl border-2 ${
                isKidsMode 
                  ? "bg-sky-50/80 border-dashed border-sky-300 text-slate-800" 
                  : "bg-black/30 border border-white/5 text-slate-100"
              }`}>
                <h4 className={`font-mono font-bold mb-1 flex items-center gap-1.5 ${isKidsMode ? "text-sky-700 font-extrabold" : "text-teal-400"}`}>
                  <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-ping"></span>
                  {isKidsMode ? "👅 Tongue & Mouth Action Gym:" : "Makhraj (Articulation Point):"}
                </h4>
                <p className={`text-[12px] font-extrabold mb-1.5 ${isKidsMode ? "text-sky-800" : "text-white"}`}>{selectedWord.makhraj}</p>
                <p className={`leading-relaxed text-[11px] ${isKidsMode ? "text-slate-650" : "text-slate-300"}`}>
                  {selectedWord.makhrajDetail}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className={`border-2 border-dashed rounded-[24px] p-6 text-center transition-all duration-300 ${
            isKidsMode
              ? "bg-indigo-50/70 border-indigo-200 text-indigo-950"
              : "backdrop-blur-md bg-white/5 border-white/10 text-slate-300"
          }`}>
            <AlertCircle className={`w-6 h-6 mx-auto mb-2 ${isKidsMode ? "text-indigo-500 animate-bounce" : "text-teal-400"}`} />
            <p className={`text-xs font-bold ${isKidsMode ? "text-slate-800" : "text-slate-300"}`}>
              {isKidsMode 
                ? "💡 Adventure Game Tip: Tap on any beautiful Arabic word above in the cloud frame to see its secret meaning, English spelling translation, and tongue gymnastic tricks! ⭐"
                : "💡 Tip: Click on any Arabic word above in the Mushaf frame to view its literal transliteration, English meaning, correct Tajweed rule, and throat or tongue articulation details!"}
            </p>
          </div>
        )}
      </div>

      {/* Kids Mode Phonetic Tips Pop-up Overlay */}
      {isKidsMode && selectedWord && (
        <KidsPhoneticTip
          word={selectedWord}
          onPlayWord={onPlayWord}
          playingWordId={playingWordId}
          onClose={() => setSelectedWord(null)}
        />
      )}
    </div>
  );
}
