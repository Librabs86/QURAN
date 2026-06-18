import { useState, useEffect, useRef } from "react";
import { AyahData, VoiceOption, VoiceName } from "../types";
import { VOICES } from "../data";
import { Play, Pause, Square, Volume2, Mic, RotateCcw, Sparkles } from "lucide-react";

interface PracticePanelProps {
  surahData: AyahData[];
  selectedVoice: VoiceName;
  onVoiceChange: (voice: VoiceName) => void;
  onPlayAyahWithCallback: (
    ayahNumber: number,
    voice: VoiceName,
    onEnd: (duration: number) => void,
    onReady: () => void
  ) => HTMLAudioElement | null;
  loading: boolean;
  onSetLoading: (val: boolean) => void;
  isKidsMode?: boolean;
  onCelebrate?: () => void;
}

export default function PracticePanel({
  surahData,
  selectedVoice,
  onVoiceChange,
  onPlayAyahWithCallback,
  loading,
  onSetLoading,
  isKidsMode = true,
  onCelebrate,
}: PracticePanelProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAyahIdx, setCurrentAyahIdx] = useState<number | null>(null);
  const [sessionPhase, setSessionPhase] = useState<"idle" | "playing" | "repeating" | "paused">("idle");
  const [pauseDuration, setPauseDuration] = useState<number>(1.5); // Multiplier of audio duration
  const [countdown, setCountdown] = useState<number>(0);

  const activeAudioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Clean play states on unmount or manual stops
  const stopPractice = () => {
    setIsPlaying(false);
    setSessionPhase("idle");
    setCurrentAyahIdx(null);
    setCountdown(0);

    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current = null;
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    
    onSetLoading(false);
  };

  const handlePauseToggle = () => {
    if (sessionPhase === "playing" && activeAudioRef.current) {
      activeAudioRef.current.pause();
      setSessionPhase("paused");
    } else if (sessionPhase === "paused" && activeAudioRef.current) {
      activeAudioRef.current.play();
      setSessionPhase("playing");
    }
  };

  const startPractice = () => {
    stopPractice();
    setIsPlaying(true);
    // Start with Ayah 1 (we can skip Ayah 0 Bismillah for repetition flow, or start at Bismillah).
    // Let's start with Ayah 0 to be complete, then proceed!
    runPracticeStep(0);
  };

  const runPracticeStep = (ayahIndex: number) => {
    if (ayahIndex >= surahData.length) {
      // Completed full Surah!
      stopPractice();
      if (onCelebrate) {
        onCelebrate();
      }
      return;
    }

    setCurrentAyahIdx(ayahIndex);
    setSessionPhase("playing");
    onSetLoading(true);

    const audioObj = onPlayAyahWithCallback(
      surahData[ayahIndex].number,
      selectedVoice,
      // onEnd callback:
      (duration) => {
        onSetLoading(false);
        const repeatTime = Math.max(3, Math.round(duration * pauseDuration));
        setSessionPhase("repeating");
        setCountdown(repeatTime);

        // Track countdown second by second
        let timeLeft = repeatTime;
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = setInterval(() => {
          timeLeft -= 1;
          setCountdown(Math.max(0, timeLeft));
        }, 1000);

        // Schedule next verse after repetition wait
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
          runPracticeStep(ayahIndex + 1);
        }, repeatTime * 1000);
      },
      // onReady callback:
      () => {
        onSetLoading(false);
      }
    );

    if (audioObj) {
      activeAudioRef.current = audioObj;
    } else {
      stopPractice();
    }
  };

  useEffect(() => {
    return () => {
      if (activeAudioRef.current) activeAudioRef.current.pause();
      if (timerRef.current) clearTimeout(timerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, []);

  // Kid character voice display names & avatars
  const getKidVoiceDetail = (name: VoiceName) => {
    switch (name) {
      case "Charon": return { name: "🕌 Teacher Khalid", desc: "Steady, deep, and beautifully clear male teacher recitation" };
      case "Zephyr": return { name: "📚 Teacher Ahmed", desc: "Soft, gentle, and super patient educational recitation teacher" };
      case "Kore": return { name: "🌸 Teacher Maha", desc: "Very warm, comforting, clear and friendly female teacher" };
      case "Aoede": return { name: "✨ Teacher Yusuf", desc: "Expressive, slow-paced, storybook gentle recitation guide" };
      case "Puck": return { name: "🎈 Teacher Hamood", desc: "A sweet, bright, and happy youth-like playful reciter" };
      default: return { name: "🌟 Blessed Reciter", desc: "Beautiful learning voice" };
    }
  };

  return (
    <div 
      className={`transition-all duration-300 rounded-[32px] p-6 shadow-xl border ${
        isKidsMode
          ? "bg-gradient-to-br from-indigo-50/90 to-blue-50/90 border-blue-250 shadow-blue-100/30 text-slate-950"
          : "backdrop-blur-xl bg-white/5 border border-white/10 text-slate-100"
      }`} 
      id="practice-panel"
    >
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b mb-6 ${
        isKidsMode ? "border-indigo-150" : "border-white/10"
      }`}>
        <div>
          <h3 className={`text-base font-bold flex items-center gap-1.5 ${isKidsMode ? "text-indigo-900 text-lg" : "text-white"}`}>
            <Mic className={`w-5 h-5 animate-pulse ${isKidsMode ? "text-indigo-600" : "text-teal-400"}`} />
            {isKidsMode ? "🎤 Practice Game: Repeat & Win! 🌟" : "Repeat & Learn Session Coach"}
          </h3>
          <p className={`text-xs ${isKidsMode ? "text-slate-705 font-medium" : "text-slate-300"} mt-0.5`}>
            {isKidsMode 
              ? "🎈 Listen to your Mu'allim guide carefully, then read out loud when the happy balloon countdown rings! ✨" 
              : "Perfect for kids and beginners. Listen carefully, then repeat each verse during the calm countdown."}
          </p>
        </div>
        
        {/* Play/Stop Controller */}
        <div className="flex gap-2">
          {isPlaying ? (
            <button
              id="btn-stop-practice"
              onClick={stopPractice}
              className={`flex items-center gap-1.5 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-md cursor-pointer ${
                isKidsMode 
                  ? "bg-slate-900 border-b-4 border-slate-755 hover:bg-slate-800 text-white" 
                  : "bg-slate-900 hover:bg-slate-800 text-white border border-white/10"
              }`}
            >
              <Square className="w-3.5 h-3.5 fill-current text-rose-450" />
              Stop Practicing
            </button>
          ) : (
            <button
              id="btn-start-practice"
              onClick={startPractice}
              disabled={loading}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black transition-all shadow-lg cursor-pointer transform hover:scale-105 active:scale-95 ${
                isKidsMode
                  ? "bg-rose-500 border-b-4 border-rose-700 hover:bg-rose-600 text-white"
                  : "bg-teal-500 hover:bg-teal-450 text-slate-950 shadow-teal-500/15"
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              {isKidsMode ? "🎉 Play Interactive Game Now!" : "Begin Repeat Session"}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Side: Voice & Spacing Selection */}
        <div className="space-y-4">
          <div>
            <label className={`block text-xs font-bold uppercase tracking-wide mb-2 ${
              isKidsMode ? "text-indigo-950 font-black text-sm" : "text-slate-400"
            }`}>
              {isKidsMode ? "🧸 Choose your favourite tutor! ✨" : "Select Qualified Teacher Voice:"}
            </label>
            <div className="grid grid-cols-1 gap-2">
              {VOICES.map((v) => {
                const isSelected = selectedVoice === v.name;
                const kidDetails = getKidVoiceDetail(v.name);
                return (
                  <button
                    key={v.name}
                    id={`voice-btn-${v.name}`}
                    disabled={isPlaying}
                    onClick={() => onVoiceChange(v.name)}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? isKidsMode
                          ? "bg-white border-4 border-indigo-400 scale-[1.01] shadow-lg text-indigo-950 font-black"
                          : "bg-teal-500/15 border-teal-500/40 ring-1 ring-teal-500/25 text-white"
                        : isPlaying
                        ? "bg-white/5 border-white/5 opacity-40 cursor-not-allowed text-slate-400"
                        : isKidsMode
                        ? "bg-white/50 hover:bg-white border-slate-200 text-slate-800 hover:shadow-md"
                        : "bg-white/5 hover:bg-white/10 border-white/10 text-slate-200"
                    }`}
                  >
                    <div className="space-y-1 text-left">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className={`text-xs font-black ${isSelected && isKidsMode ? "text-indigo-900" : ""}`}>
                          {isKidsMode ? kidDetails.name : v.displayName}
                        </span>
                        <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full border leading-none ${
                          v.tag === "Kid Reciter"
                            ? "bg-sky-500/10 border-sky-500/20 text-sky-600 font-bold"
                            : v.tag === "Female Teacher"
                            ? "bg-pink-500/10 border-pink-500/20 text-pink-600 font-bold"
                            : "bg-teal-500/10 border-teal-500/20 text-teal-600 font-bold"
                        }`}>
                          {v.tag}
                        </span>
                      </div>
                      <span className={`text-[10.5px] block leading-tight ${isKidsMode ? "text-slate-500" : "text-slate-400"}`}>
                        {isKidsMode ? kidDetails.desc : v.description}
                      </span>
                    </div>
                    {isSelected && (
                      <Volume2 className={`w-4 h-4 flex-shrink-0 ml-2 ${isKidsMode ? "text-indigo-600 animate-bounce" : "text-teal-400"}`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className={`block text-xs font-bold uppercase tracking-wide mb-2 ${
              isKidsMode ? "text-slate-700" : "text-slate-500"
            }`}>
              {isKidsMode ? "⏳ Practice Pause Time (Wait for Me):" : "Teacher Repetition Pause Gap:"}
            </label>
            <div className={`flex p-1 rounded-2xl border transition-all ${
              isKidsMode ? "bg-indigo-950/5 border-indigo-200" : "bg-black/40 border-white/5"
            }`}>
              {[
                { label: isKidsMode ? "⚡ Run Fast" : "1.0x (Standard)", value: 1.0 },
                { label: isKidsMode ? "🌸 Perfect for Kids ✨" : "1.5x (Better for Kids)", value: 1.5 },
                { label: isKidsMode ? "🐌 Nice & Unhurried" : "2.0x (Slow & Ample)", value: 2.0 },
              ].map((gap) => (
                <button
                  key={gap.value}
                  id={`pause-btn-${gap.value}`}
                  disabled={isPlaying}
                  onClick={() => setPauseDuration(gap.value)}
                  className={`flex-1 text-[11px] py-2 rounded-xl font-bold transition-all text-center cursor-pointer ${
                    pauseDuration === gap.value
                      ? isKidsMode
                        ? "bg-indigo-500 text-white font-extrabold shadow-md"
                        : "bg-teal-500 text-slate-950 font-extrabold shadow"
                      : isPlaying
                      ? "text-slate-600 cursor-not-allowed opacity-35"
                      : isKidsMode
                      ? "text-slate-600 hover:text-slate-900"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {gap.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Progress Status / Audio Wave visualizer */}
        <div className={`flex flex-col justify-center items-center rounded-3xl border p-6 text-center shadow-inner ${
          isKidsMode 
            ? "bg-white/70 border-indigo-250 min-h-[220px]" 
            : "bg-black/30 border border-white/10"
        }`}>
          {isPlaying && currentAyahIdx !== null ? (
            <div className="space-y-5 w-full">
              <div>
                <span className={`text-[10px] uppercase tracking-wide font-extrabold px-2.5 py-0.5 rounded-full ${
                  isKidsMode ? "bg-indigo-100 text-indigo-800 border border-indigo-200" : "text-slate-400 font-semibold"
                }`}>
                  {isKidsMode ? "🌟 LIVE PRACTICE ADVENTURE 🌟" : "Session Live Program"}
                </span>
                <p className={`text-xs mt-1 font-bold ${isKidsMode ? "text-slate-800" : "text-slate-300"}`}>
                  Verse {currentAyahIdx === 0 ? "Bismillah (Prelude)" : `Ayah ${currentAyahIdx}`} of 6
                </p>
                <div className={`mt-3 p-3 rounded-2xl border max-w-xs mx-auto ${
                  isKidsMode ? "bg-[#fcfdfd] border-indigo-150" : "bg-white/5 border-white/10"
                }`}>
                  <p className={`font-serif text-lg font-bold ${isKidsMode ? "text-teal-700" : "text-teal-300"}`} dir="rtl">
                    {surahData[currentAyahIdx].text}
                  </p>
                </div>
              </div>

              {/* Status Display Area */}
              <div className="relative">
                {sessionPhase === "playing" ? (
                  <div className="space-y-2">
                    <div className={`inline-flex items-center justify-center p-3.5 rounded-full animate-pulse border ${
                      isKidsMode ? "bg-rose-100 text-rose-550 border-rose-200/50" : "bg-teal-500/10 text-teal-400 border-teal-500/20"
                    }`}>
                      <Volume2 className="w-6 h-6" />
                    </div>
                    <p className={`text-sm font-extrabold ${isKidsMode ? "text-slate-900" : "text-white"}`}>
                      {isKidsMode ? "👂 Shh... Listen to your Teacher! 👂" : "Listen quietly to the recitation..."}
                    </p>
                    <p className="text-xs text-slate-500 font-bold leading-tight">
                      {isKidsMode ? "Reciting... Speak/pronounce along in your heart." : "The teacher is reciting. Pronounce in your heart."}
                    </p>
                  </div>
                ) : sessionPhase === "repeating" ? (
                  <div className="space-y-2 animate-bounce">
                    <div className={`inline-flex items-center justify-center p-3.5 rounded-full border ${
                      isKidsMode ? "bg-emerald-100 text-emerald-600 border-emerald-300" : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                    }`}>
                      <Mic className="w-6 h-6 animate-pulse text-emerald-600" />
                    </div>
                    <p className={`text-sm font-black ${isKidsMode ? "text-emerald-700" : "text-emerald-400"}`}>
                      {isKidsMode ? "📢 Your Turn! Repeat Out Loud!" : "Repeat Out Loud now!"}
                    </p>
                    <div className={`text-xl font-mono font-black ${isKidsMode ? "text-indigo-600 animate-pulse" : "text-emerald-300 font-bold"}`}>
                      🎈 {countdown} seconds left...
                    </div>
                    <div className={`w-full max-w-xs h-2 rounded-full mx-auto overflow-hidden border ${
                      isKidsMode ? "bg-slate-200 border-slate-300" : "bg-white/10 border-transparent"
                    }`}>
                      <div
                        className={`h-full transition-all duration-1000 ${
                          isKidsMode 
                            ? "bg-gradient-to-r from-emerald-450 to-indigo-500" 
                            : "bg-emerald-450 shadow-[0_0_8px_rgba(52,211,153,0.6)]"
                        }`}
                        style={{ width: `${(countdown / (3 + Math.round(5 * pauseDuration))) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="flex items-center justify-center gap-1.5">
                {surahData.map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 rounded-full transition-all ${
                      i === currentAyahIdx
                        ? isKidsMode
                          ? "w-8 bg-indigo-500"
                          : "w-6 bg-teal-400"
                        : i < currentAyahIdx
                        ? "w-2.5 bg-emerald-500"
                        : isKidsMode
                        ? "w-2 bg-indigo-200/50"
                        : "w-2 bg-white/10"
                    }`}
                  ></div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4 max-w-sm">
              <div className={`inline-flex items-center justify-center p-3.5 rounded-full border ${
                isKidsMode ? "bg-amber-100 text-amber-600 border-amber-200" : "bg-teal-500/10 text-teal-400 border-teal-500/20"
              }`}>
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 className={`text-sm font-extrabold ${isKidsMode ? "text-slate-900 text-base" : "text-white"}`}>
                {isKidsMode ? "🎈 Repeating Session Game: Idle" : "Practice Repetition mode is Idle"}
              </h4>
              <p className={`text-xs leading-normal ${isKidsMode ? "text-slate-605 font-medium" : "text-slate-300"}`}>
                {isKidsMode
                  ? "Tap 'Play Interactive Game' above! Your chosen friendly guide will read each verse beautifully, then give you generous playtime with a happy countdown to repeat it out loud! 🌟"
                  : "Click the top button 'Begin Repeat Session' to start. Your guide will sequentially read each verse of Surah An-Nas and pause beautifully, giving you time to practice perfect tajweed and pronunciation."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
