import { useState } from "react";
import { ARTICULATION_POINTS_GUIDE } from "../data";
import { Play, Volume2, HelpCircle } from "lucide-react";

interface TajweedGuideProps {
  onPlaySample: (text: string, label: string) => void;
  playingLabel: string | null;
  loading: boolean;
  isKidsMode?: boolean;
}

export default function TajweedGuide({ onPlaySample, playingLabel, loading, isKidsMode = true }: TajweedGuideProps) {
  const [selectedMakhraj, setSelectedMakhraj] = useState(0);

  const keyVowelsAndRules = [
    {
      title: "Ghunnah (غنة - Nasal Hum 👃)",
      rule: "Hold a sweet hum inside your nose for 2 counts when you see a double Noon (نّ) or double Meem (مّ)!",
      description: "In Surah An-Nas, this occurs beautifully in the word 'An-Nas' (ٱلنَّاسِ) which appears 6 times, and 'Al-Jinnah' (ٱلْجِنَّةِ). Make a lovely vibrating sound!",
      exampleText: "ٱلنَّاسِ",
      exampleLabel: "Ghunnah (An-Nas)"
    },
    {
      title: "Ikhfa (إخفاء - Concealment/Hide-and-Seek 🙈)",
      rule: "Partially hide the Noon letter sound when followed by one of the 15 secret letters, without your tongue touching the roof of your mouth!",
      description: "Look at Ayah 4: 'min sharri' (مِن شَرِّ). The secret is to let the sound flow softly and float in the mouth for 2 happy counts.",
      exampleText: "مِن شَرِّ",
      exampleLabel: "Ikhfa (Min Sharri)"
    },
    {
      title: "Tafkhim & Tarqiq (Bold & Smiling Vowels 🌟)",
      rule: "Make your mouth full and round for heavy letters (Tafkhim), but thin and flat like a beautiful smile for light letters (Tarqiq)!",
      description: "The crown 'Qaf' (ق) in 'Qul' (قُلْ) is exceptionally bold, strong, and full-mouthed! While the 'Seen' (س) is a soft, light, and beautiful whistling sound. Remember to smile to make 'Seen' light! ✨",
      exampleText: "قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ",
      exampleLabel: "Tafkhim (Qul)"
    }
  ];

  const getKidMakhrajName = (idx: number, originalName: string) => {
    switch (idx) {
      case 0: return "🌸 Chest Balloon (Al-Jawf)";
      case 1: return "🗣️ Throat Gym (Al-Halq)";
      case 2: return "👅 Tongue Acrobatics (Al-Lisan)";
      case 3: return "💋 Lip Wave Dance (Al-Shafatayn)";
      default: return originalName;
    }
  };

  return (
    <div 
      className={`transition-all duration-300 rounded-[32px] p-6 lg:p-8 border shadow-xl ${
        isKidsMode
          ? "bg-gradient-to-br from-[#fdf4ff] via-[#fff5f5] to-emerald-50/70 border-pink-200 shadow-pink-100/30 text-slate-950"
          : "backdrop-blur-xl bg-white/5 border border-white/10 text-slate-100"
      }`} 
      id="tajweed-guide"
    >
      <div className={`border-b pb-5 mb-6 ${isKidsMode ? "border-pink-205" : "border-white/10"}`}>
        <h2 className={`text-xl font-bold flex items-center gap-2 ${isKidsMode ? "text-pink-900 text-2xl" : "text-white"}`}>
          <span className={`w-3 h-7 rounded-full inline-block ${isKidsMode ? "bg-pink-500 animate-bounce" : "bg-teal-400"}`}></span>
          {isKidsMode ? "🎨 Fun Tajweed Rules & Mouth Gym Secrets! ⭐" : "Tajweed & Articulation Masterclass"}
        </h2>
        <p className={`text-sm ${isKidsMode ? "text-slate-705 font-medium" : "text-slate-300"} mt-1`}>
          {isKidsMode 
            ? "Learn the magical letters of the alphabet, where sounds are born, and play vocal audio clips!" 
            : "Learn correct pronunciation, makharij (articulation points), and classical rules for Surah An-Nas."}
        </p>
      </div>

      {/* Articulation Points Interactive Grid */}
      <div className="mb-10">
        <h3 className={`text-xs font-black uppercase tracking-wider mb-4 flex items-center gap-2 ${
          isKidsMode ? "text-pink-850" : "text-teal-400"
        }`}>
          {isKidsMode ? "🎪 Tap are to explore where sounds are born:" : "Interactive Makhārij Guide (Arabic Phonetics)"}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
          {ARTICULATION_POINTS_GUIDE.map((pt, idx) => {
            const isSelected = selectedMakhraj === idx;
            return (
              <button
                key={pt.name}
                id={`makhraj-tab-${idx}`}
                onClick={() => setSelectedMakhraj(idx)}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? isKidsMode
                      ? "bg-white border-4 border-pink-400 text-pink-950 font-black scale-[1.01] shadow-md"
                      : "bg-teal-500/15 border-teal-500/40 ring-1 ring-teal-500/25 text-white font-bold"
                    : isKidsMode
                    ? "bg-white/50 hover:bg-white border-pink-100 text-slate-800 hover:shadow-xs"
                    : "bg-white/5 hover:bg-white/10 border-white/10 text-slate-300"
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-[10px] font-mono font-black ${isSelected ? (isKidsMode ? "text-pink-600" : "text-teal-350") : "text-slate-450"}`}>
                    Part {idx + 1}
                  </span>
                  <span className="text-sm font-serif font-bold text-pink-600">{pt.arabic}</span>
                </div>
                <h4 className="text-xs font-black leading-tight">
                  {isKidsMode ? getKidMakhrajName(idx, pt.name) : pt.name}
                </h4>
              </button>
            );
          })}
        </div>

        {/* Selected Articulation Point Details */}
        <div className={`rounded-3xl p-5 md:p-6 transition-all duration-300 border ${
          isKidsMode 
            ? "bg-white/80 border-pink-200 text-slate-900 shadow-inner" 
            : "backdrop-blur-lg bg-black/35 border border-white/10"
        }`}>
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
            <div>
              <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wide border ${
                isKidsMode 
                  ? "bg-pink-100 border-pink-200 text-pink-700" 
                  : "bg-teal-500/15 text-teal-300 border border-teal-500/20"
              }`}>
                {isKidsMode ? "🎈 Sound Birthplace" : "Makhraj Point"}
              </span>
              <h4 className={`text-lg font-black mt-2.5 flex items-center gap-2 ${isKidsMode ? "text-pink-950 font-black" : "text-white"}`}>
                {isKidsMode ? getKidMakhrajName(selectedMakhraj, ARTICULATION_POINTS_GUIDE[selectedMakhraj].name) : `${ARTICULATION_POINTS_GUIDE[selectedMakhraj].name} (${ARTICULATION_POINTS_GUIDE[selectedMakhraj].arabic})`}
              </h4>
            </div>
            <div className={`flex flex-wrap gap-1.5 px-3.5 py-2.5 rounded-2xl border shadow-sm ${
              isKidsMode ? "bg-white border-pink-250" : "bg-white/5 border border-white/10"
            }`}>
              <span className={`text-xs font-bold self-center mr-1 ${isKidsMode ? "text-slate-600" : "text-slate-450 font-mono"}`}>
                {isKidsMode ? "👶 Secret magic letters:" : "Letters born here:"}
              </span>
              {ARTICULATION_POINTS_GUIDE[selectedMakhraj].letters.map((char) => (
                <span key={char} className={`w-8 h-8 flex items-center justify-center text-sm font-serif font-black rounded-lg border shadow-xs transform hover:scale-110 duration-200 ${
                  isKidsMode 
                    ? "bg-[#fff1f2] border-pink-200 text-pink-600" 
                    : "bg-white/10 border border-white/10 text-teal-350"
                }`}>
                  {char}
                </span>
              ))}
            </div>
          </div>

          <p className={`text-sm leading-relaxed mb-5 ${isKidsMode ? "text-[#334155] font-semibold" : "text-slate-305"}`}>
            {ARTICULATION_POINTS_GUIDE[selectedMakhraj].description}
          </p>

          <div className={`rounded-2xl border p-4 ${
            isKidsMode ? "bg-pink-50/60 border-pink-200/50" : "bg-black/20 border border-white/5"
          }`}>
            <h5 className={`text-xs font-extrabold uppercase tracking-wide mb-3 flex items-center gap-1.5 ${
              isKidsMode ? "text-pink-800" : "text-slate-400"
            }`}>
              <HelpCircle className={`w-4 h-4 inline animate-pulse ${isKidsMode ? "text-pink-550" : "text-teal-400"}`} /> 
              {isKidsMode ? "📣 Tap to hear the magical sounds of these letters:" : "Listen to Articulation Examples:"}
            </h5>
            <div className="space-y-2.5">
              {ARTICULATION_POINTS_GUIDE[selectedMakhraj].examples.map((ex, i) => {
                const sampleText = ex.split(" (")[0];
                const matches = ex.match(/\(([^)]+)\)/);
                const exampleNotes = matches ? matches[1] : "";
                const uniqueId = `makhraj-ex-${selectedMakhraj}-${i}`;

                return (
                  <div key={ex} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    isKidsMode 
                      ? "bg-white/80 border-pink-100 hover:border-pink-300 hover:shadow-xs" 
                      : "hover:bg-white/5 border border-transparent hover:border-white/10"
                  }`}>
                     <div className="flex items-center gap-3">
                      <span className={`text-lg font-serif font-black ${isKidsMode ? "text-pink-900" : "text-white"}`}>{sampleText}</span>
                      <span className={`text-xs pl-2 border-l italic ${
                        isKidsMode ? "border-pink-200 text-slate-550 font-medium" : "border-white/10 text-slate-450"
                      }`}>
                        {exampleNotes}
                      </span>
                    </div>
                    <button
                      id={`play-makhraj-btn-${selectedMakhraj}-${i}`}
                      onClick={() => onPlaySample(sampleText, uniqueId)}
                      disabled={loading}
                      className={`flex items-center gap-1.5 text-xs px-4 py-2 rounded-xl font-bold transition-all cursor-pointer shadow-sm ${
                        playingLabel === uniqueId
                          ? isKidsMode
                            ? "bg-rose-500 border-b-2 border-rose-750 text-white font-extrabold scale-102"
                            : "bg-teal-555 text-slate-950 bg-teal-450"
                          : isKidsMode
                            ? "bg-[#fff1f2] hover:bg-[#ffe4e6] text-pink-700 border border-pink-200 hover:scale-[1.02]"
                            : "bg-white/10 hover:bg-white/20 text-slate-200"
                      }`}
                    >
                      {playingLabel === uniqueId ? (
                        <>
                          <Volume2 className="w-3.5 h-3.5 animate-bounce" />
                          Playing...
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 text-pink-500" />
                          Hear Rule
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Rules Master Column */}
      <div>
        <h3 className={`text-xs font-black uppercase tracking-wider mb-4 ${
          isKidsMode ? "text-[#701a75]" : "text-teal-400"
        }`}>
          {isKidsMode ? "📚 Special Quranic Secret Rules in An-Nas:" : "Qur'anic Tajweed Rules Found in Surah"}
        </h3>
        <div className="space-y-4">
          {keyVowelsAndRules.map((keyRule, idx) => (
            <div
              key={keyRule.title}
              id={`tajweed-rule-card-${idx}`}
              className={`border transition-all duration-300 rounded-3xl p-4 md:p-5 hover:shadow-md ${
                isKidsMode
                  ? "bg-[#faf5ff] hover:bg-[#f5ebff] border-purple-200/60"
                  : "backdrop-blur-md bg-white/5 border border-white/10 hover:border-white/20 hover:shadow-lg"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2.5">
                <h4 className={`font-bold text-sm flex items-center gap-1.5 ${isKidsMode ? "text-[#581c87]" : "text-white"}`}>
                  <span className={`w-2 h-2 rounded-full animate-ping ${isKidsMode ? "bg-purple-500" : "bg-teal-400"}`}></span>
                  {keyRule.title}
                </h4>
                <button
                  id={`play-rule-btn-${idx}`}
                  onClick={() => onPlaySample(keyRule.exampleText, `rule-ex-${idx}`)}
                  disabled={loading}
                  className={`self-start sm:self-auto flex items-center gap-1.5 text-xs px-4 py-2 rounded-xl transition-all cursor-pointer border shadow-sm ${
                    playingLabel === `rule-ex-${idx}`
                      ? isKidsMode
                        ? "bg-purple-600 text-white font-bold"
                        : "bg-teal-500 text-slate-950 font-bold border-transparent"
                      : isKidsMode
                        ? "bg-[#f3e8ff] hover:bg-[#e9d5ff] border-purple-350 text-purple-700"
                        : "bg-white/10 hover:bg-white/20 border-white/10 text-slate-200"
                  }`}
                >
                  <Play className={`w-2.5 h-2.5 inline ${isKidsMode ? "text-purple-600" : ""}`} />
                  {playingLabel === `rule-ex-${idx}` ? "Reciting..." : "Listen Practice word"}
                </button>
              </div>
              <div className="text-xs space-y-1.5 leading-relaxed">
                <p className={isKidsMode ? "text-slate-800" : "text-slate-222"}>
                  <span className={`font-extrabold ${isKidsMode ? "text-purple-700 font-black text-[12.5px]" : "text-teal-350"}`}>
                    {isKidsMode ? "👉 Simple secret instruction:" : "Rule:"}
                  </span> {keyRule.rule}
                </p>
                <p className={isKidsMode ? "text-slate-650" : "text-slate-400"}>{keyRule.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
