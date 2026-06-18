import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Volume2, Sparkles, X, Check } from "lucide-react";
import { WordData } from "../types";

interface KidsPhoneticTipProps {
  word: WordData;
  onPlayWord: (wordText: string, wordId: string) => void;
  playingWordId: string | null;
  onClose: () => void;
}

interface QuranTutor {
  id: string;
  name: string;
  emoji: string;
  description: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  accentColor: string;
  greeting: string;
}

const QURAN_TUTORS: QuranTutor[] = [
  {
    id: "yusuf",
    name: "Teacher Yusuf ✨",
    emoji: "✨",
    description: "Wise & gentle recitation guide",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-300",
    textColor: "text-emerald-950",
    accentColor: "bg-emerald-500",
    greeting: "Assalamu Alaikum! Let's explore the beautiful secret of this word's pronunciation with wisdom and peace! 📜",
  },
  {
    id: "maha",
    name: "Teacher Maha 🌸",
    emoji: "🌸",
    description: "Warm, supportive & loving guide",
    bgColor: "bg-pink-50",
    borderColor: "border-pink-300",
    textColor: "text-pink-950",
    accentColor: "bg-pink-500",
    greeting: "Assalamu Alaikum, dear! Say it beautifully and with a joyful smile! You are doing an amazing job with the words of Allah! 💖",
  },
  {
    id: "khalid",
    name: "Teacher Khalid 🕌",
    emoji: "🕌",
    description: "Clear & fluent tajweed expert",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-300",
    textColor: "text-indigo-950",
    accentColor: "bg-indigo-505",
    greeting: "Assalamu Alaikum! Pronounce cleanly, with a strong voice and a brave heart from your throat! You've got this! 💪",
  },
  {
    id: "ahmed",
    name: "Teacher Ahmed 📚",
    emoji: "📚",
    description: "Patient, patient & gentle mentor",
    bgColor: "bg-sky-50",
    borderColor: "border-sky-300",
    textColor: "text-sky-950",
    accentColor: "bg-sky-500",
    greeting: "Assalamu Alaikum! Inshallah, we will practice with utmost patience. Say it softly and nicely, just like a calm gentle breeze! ❄️",
  },
  {
    id: "hamood",
    name: "Teacher Hamood 🎈",
    emoji: "🎈",
    description: "High energy & happy companion",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-300",
    textColor: "text-amber-950",
    accentColor: "bg-amber-500",
    greeting: "Ahlan wa Sahlan! Let's recite together with high energy and joy! Repeating after me is as fun as a flying balloon! 🎈",
  },
];

export default function KidsPhoneticTip({
  word,
  onPlayWord,
  playingWordId,
  onClose,
}: KidsPhoneticTipProps) {
  const [selectedTutor, setSelectedTutor] = useState<QuranTutor>(QURAN_TUTORS[0]);
  const [hasSaidIt, setHasSaidIt] = useState<boolean>(false);

  // Analyze word to get playful kid tips
  const getKidsPhoneticAnalysis = (w: WordData) => {
    const text = (w.text || "").trim();
    const trans = (w.transliteration || "").toLowerCase();

    // 1. Qaf (ق)
    if (trans.includes("q") || text.includes("ق")) {
      return {
        letterName: "Qāf (ق)",
        comparison: "a deep, bouncy chest sound",
        technique: "Make a sound back near your throat! Let it pop like a beautiful giant bubble: 'Qaf-Qaf'!",
        emoji: "🎈",
      };
    }
    // 2. Sheen (ش)
    if (trans.includes("sh") || text.includes("ش")) {
      return {
        letterName: "Sheen (ش)",
        comparison: "our secret quiet sound 'shhh' in 'shoe' 👟",
        technique: "Say 'Shhh' gently, like you are telling your toys to be quiet during bedtime: 'Shush-shush'!",
        emoji: "🤫",
      };
    }
    // 3. Seen (س)
    if (trans.includes("s") || text.includes("س")) {
      return {
        letterName: "Seen (س)",
        comparison: "the sweet 's' sound in 'sun' or 'smile' ☀️",
        technique: "Press your teeth together lightly and blow cool air to make a happy whistling sound: 'Sssss-smile'!",
        emoji: "☀️",
      };
    }
    // 4. Ayn (ع)
    if (trans.includes("'") || trans.includes("`") || text.includes("ع")) {
      return {
        letterName: "‘Ayn (ع)",
        comparison: "a deep, warm gulp sound",
        technique: "Squeeze the middle of your neck gently and say 'Aaa', like swallowing a delicious spoonful of chocolate pudding! 🍫",
        emoji: "🍫",
      };
    }
    // 5. Breathy Haa (ح)
    if (trans.includes("ḥ") || trans.includes("h_") || text.includes("ح")) {
      return {
        letterName: "Ḥā (ح)",
        comparison: "a soft, clean breathing whisper",
        technique: "Blow warm air onto your fingers as if you are warming them up on a snowy day: 'Hhhh-warm'!",
        emoji: "❄️",
      };
    }
    // 6. Kha (خ)
    if (trans.includes("kh") || text.includes("خ")) {
      return {
        letterName: "Khā (خ)",
        comparison: "a tickly, sleepy snore",
        technique: "Make a tiny, tickly snore sound at the back of your roof, like a gentle, sleepy resting sigh: 'Khhh-Khhh'!",
        emoji: "💤",
      };
    }
    // 7. Ghayn (غ)
    if (trans.includes("gh") || text.includes("غ")) {
      return {
        letterName: "Ghayn (غ)",
        comparison: "a playful gurgling sound",
        technique: "Pretend you are gargling cool water or brushing your teeth: 'Gh-Gh-Gargle'!",
        emoji: "💧",
      };
    }
    // 8. Ra (ر)
    if (trans.includes("r") || text.includes("ر")) {
      return {
        letterName: "Rā (ر)",
        comparison: "a happy, purring drumbeat",
        technique: "Let the tip of your tongue tap the roof of your mouth quickly, like a neat and steady drumroll: 'Rr-Rr-Roll'!",
        emoji: "🥁",
      };
    }
    // 9. Ba (ب)
    if (trans.includes("b") || text.includes("b") || text.includes("ب")) {
      return {
        letterName: "Bā (ب)",
        comparison: "the 'b' sound in 'balloon' or 'bubble' 🎈",
        technique: "Close your lips softly, then pop them open like a friendly bubble popping! 'Ba-Ba'!",
        emoji: "🎈",
      };
    }
    // 10. Meem (م)
    if (trans.includes("m") || text.includes("م")) {
      return {
        letterName: "Meem (م)",
        comparison: "the 'm' sound in 'yummy' or 'melon' 🍉",
        technique: "Press your lips together and hum 'Mmmm', as if tasting delicious ice cream! Yum!",
        emoji: "🍨",
      };
    }
    // 11. Noon (ن)
    if (trans.includes("n") || text.includes("ن")) {
      return {
        letterName: "Noon (ن)",
        comparison: "the 'n' sound in 'nice' or 'new' ✨",
        technique: "Touch your tongue right behind your upper front teeth and hum so it makes your nose tickle!",
        emoji: "✨",
      };
    }
    // 12. Lam (ل)
    if (trans.includes("l") || text.includes("ل")) {
      return {
        letterName: "Lām (ل)",
        comparison: "the 'l' sound in 'light' or 'lollipop' 🍭",
        technique: "Touch the tip of your tongue quickly underneath the roof of your mouth and sing: 'La-La-La'!",
        emoji: "🎵",
      };
    }
    // 13. Waw (و)
    if (trans.includes("w") || trans.includes("u_") || text.includes("و")) {
      return {
        letterName: "Wāw (و)",
        comparison: "the 'w' sound in 'wind' or 'waves' 🌊",
        technique: "Make a cute circle with your lips like you are whistling, then slide your lips open: 'Oo-Waa'!",
        emoji: "🍉",
      };
    }
    // 14. Ya (ي)
    if (trans.includes("y") || trans.includes("i_") || text.includes("ي")) {
      return {
        letterName: "Yā (ي)",
        comparison: "the 'y' sound in 'yes' or 'yellow' 🌟",
        technique: "Pull the corners of your cheeks up in a warm smiley face and say 'Y-Y-Yes'!",
        emoji: "💛",
      };
    }
    // 15. Sod (ص)
    if (trans.includes("ṣ") || text.includes("ص")) {
      return {
        letterName: "Ṣād (ص)",
        comparison: "a strong, heavy whistle",
        technique: "Fill your cheeks with air to make a thick, deep 'S' sound,, like a steam engine train: 'Sss-Choo'!",
        emoji: "🚂",
      };
    }
    // 16. Dod (ض)
    if (trans.includes("ḍ") || text.includes("ض")) {
      return {
        letterName: "Ḍād (ض)",
        comparison: "a strong, robust 'D' sound",
        technique: "Press the side of your tongue against your upper chew-teeth to make a deep, thick drumbeat sound!",
        emoji: "🥁",
      };
    }
    // 17. To (ط)
    if (trans.includes("ṭ") || text.includes("ط")) {
      return {
        letterName: "Ṭā (ط)",
        comparison: "a heavy, popping raindrop sound",
        technique: "Make a strong, heavy 'T' sound that pops like a big raindrop hitting a bright green leaf: 'T-T'!",
        emoji: "💧",
      };
    }
    // 18. Tho (ظ)
    if (trans.includes("ẓ") || text.includes("ظ")) {
      return {
        letterName: "Ẓā (ظ)",
        comparison: "a thick, dark humming sound",
        technique: "Bite the tip of your tongue gently and buzz. Make your mouth wide and bold with great confidence! 🌟",
        emoji: "🌟",
      };
    }
    // 19. Dhal (ذ)
    if (trans.includes("dh") || text.includes("ذ")) {
      return {
        letterName: "Dhāl (ذ)",
        comparison: "the warm 'th' sound in 'this' or 'there' 👉",
        technique: "Stick the very tip of your tongue under your teeth gently and blow! It's a soft, buzzy, tickly sound.",
        emoji: "👉",
      };
    }
    // 20. Tha (ث)
    if (trans.includes("th") || text.includes("ث")) {
      return {
        letterName: "Thā (ث)",
        comparison: "the soft 'th' sound in 'think' or 'thank you' 🌸",
        technique: "Put the tip of your tongue under your front teeth and blow out cool air, just like saying 'three'!",
        emoji: "🌸",
      };
    }
    // 21. Standard Haa (ه)
    if (trans.includes("h") || text.includes("ه")) {
      return {
        letterName: "Hā (ه)",
        comparison: "a happy, warm laugh",
        technique: "Giggly laugh: 'Ha-Ha-Ha'! It is a soft, deep breathy laugh directly from the back of your throat.",
        emoji: "😄",
      };
    }
    // 22. Ta (ت)
    if (trans.includes("t") || text.includes("ت")) {
      return {
        letterName: "Tā (ت)",
        comparison: "the light clock-ticking 't' in 'toy' 🧸",
        technique: "Tap your tongue behind your upper teeth quickly and lightly, like a little toy clock: 'T-T-Tick'!",
        emoji: "🧸",
      };
    }
    // 23. Da (د)
    if (trans.includes("d") || text.includes("د")) {
      return {
        letterName: "Dāl (د)",
        comparison: "the light jumpy 'd' in 'drum' 🥁",
        technique: "Tap your tongue bouncy like a cheerful little drumbeat of beautiful, clear, joyful notes!",
        emoji: "🥁",
      };
    }
    // 24. Jeem (ج)
    if (trans.includes("j") || text.includes("ج")) {
      return {
        letterName: "Jeem (ج)",
        comparison: "the bouncy 'j' in 'jump' or 'jelly' 🍯",
        technique: "Say 'J' confidently, bouncing the middle part of your tongue down from the roof of your mouth!",
        emoji: "🤸",
      };
    }
    // 25. Faa (ف)
    if (trans.includes("f") || text.includes("ف")) {
      return {
        letterName: "Fā (ف)",
        comparison: "the fly-away 'f' in 'fly' or 'friends' 🎈",
        technique: "Touch your front teeth to your lower lip and blow cool air outwards: 'Ffff'!",
        emoji: "🎈",
      };
    }

    // Default Fallback
    return {
      letterName: w.tajweedRule && w.tajweedRule !== "None" ? w.tajweedRule : "Fusha sound",
      comparison: `the beautiful letters of ${w.transliteration}`,
      technique: "Break down the voice sound slowly and follow after the teacher with small steps!",
      emoji: "⭐️",
    };
  };

  const analysis = getKidsPhoneticAnalysis(word);
  const isCurrentlyPlaying = playingWordId === word.id;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-lg overflow-hidden bg-white border-4 border-indigo-400 rounded-[36px] shadow-2xl"
      >
        {/* Playful header */}
        <div className="bg-gradient-to-r from-pink-400 via-purple-500 to-indigo-500 px-6 py-5 flex justify-between items-center text-white">
          <div className="flex items-center gap-2">
            <span className="text-2xl">✨</span>
            <div>
              <h3 className="text-lg font-black tracking-wide">Phonetic Word Fun Finder!</h3>
              <p className="text-xs font-bold text-pink-100">Unlock the secrets behind the sounds!</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 active:scale-90 rounded-full transition-all cursor-pointer"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Word Display Section */}
        <div className="bg-indigo-50/50 p-6 text-center border-b-2 border-dashed border-indigo-100">
          <div className="flex justify-center items-center gap-3 mb-1" dir="rtl">
            <span className="text-4xl font-serif font-black text-indigo-950 bg-white px-4 py-2 rounded-2xl shadow-inner border border-indigo-100">
              {word.text}
            </span>
            <span className="text-2xl font-mono text-indigo-600 font-extrabold" dir="ltr">
              ({word.transliteration})
            </span>
          </div>
          <p className="text-sm font-black text-slate-700 mt-2">
            Means: <span className="text-indigo-600 underline font-black">"{word.translation}"</span>
          </p>
        </div>

        {/* Tutor Selection Rows */}
        <div className="px-6 pt-4 pb-2">
          <p className="text-[11px] font-black uppercase tracking-wider text-indigo-700 mb-2">
            Choose your favourite tutor! ✨
          </p>
          <div className="grid grid-cols-4 gap-2">
            {QURAN_TUTORS.map((t) => {
              const isSelected = selectedTutor.id === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setSelectedTutor(t);
                    setHasSaidIt(false);
                  }}
                  className={`flex flex-col items-center p-2 rounded-2xl border-2 transition-all cursor-pointer ${
                    isSelected
                      ? "bg-indigo-600 border-indigo-700 text-white shadow-md scale-105"
                      : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                  }`}
                >
                  <span className="text-2xl mb-1">{t.emoji.split(" ")[0]}</span>
                  <span className="text-[9px] font-black text-center truncate w-full">
                    {t.name.split(" ")[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Speech bubble from selected Tutor */}
        <div className="px-6 py-3">
          <div className={`p-4 rounded-3xl border-2 relative ${selectedTutor.bgColor} ${selectedTutor.borderColor} ${selectedTutor.textColor}`}>
            {/* Conversation tip */}
            <p className="text-[11px] font-black text-indigo-500 mb-1 flex items-center gap-1">
              <span>{selectedTutor.name} says:</span>
            </p>
            <p className="text-xs font-semibold leading-relaxed mb-3">
              "{selectedTutor.greeting}"
            </p>

            <hr className={`border-t-2 border-dashed my-2 ${selectedTutor.borderColor}`} />

            {/* Phonetic Breakdown */}
            <div className="space-y-2 mt-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">{analysis.emoji}</span>
                <span className="text-xs font-black">
                  Our Special Sound: <span className="underline">{analysis.letterName}</span>
                </span>
              </div>
              <p className="text-xs font-bold pl-7">
                It sounds like: <span className="text-indigo-600 text-[13px] font-black">{analysis.comparison}</span>
              </p>
              <p className="text-xs text-slate-700 pl-7 leading-relaxed font-medium">
                👉 <span className="font-extrabold text-slate-900">{analysis.technique}</span>
              </p>

              {/* Tajweed Helper info */}
              {word.tajweedRule && word.tajweedRule !== "None" && (
                <div className={`mt-3 p-2.5 rounded-xl text-[11px] font-bold flex items-start gap-2 ${
                  word.tajweedRule === "Ghunnah" ? "bg-rose-100 text-rose-950 border border-rose-200" :
                  word.tajweedRule === "Qalqalah" ? "bg-amber-100 text-amber-950 border border-amber-200" :
                  word.tajweedRule === "Madd" ? "bg-indigo-100 text-indigo-950 border border-indigo-200" :
                  "bg-emerald-100 text-emerald-950 border border-emerald-200"
                }`}>
                  <Sparkles className="w-3.5 h-3.5 mt-0.5 shrink-0 animate-spin" />
                  <div>
                    <span className="font-black uppercase tracking-wider">{word.tajweedRule} Rule Alert: </span>
                    {word.tajweedRule === "Ghunnah" ? "Hum it in your nose beautifully like a buzzing honeybee! 🐝" :
                     word.tajweedRule === "Qalqalah" ? "Let the sound bounce back like a trampoline bouncy ball! 🏀" :
                     word.tajweedRule === "Madd" ? "Stretch the sound out like a long, tall giraffe neck! 🦒" :
                     word.tajweedDetail}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Button Row */}
        <div className="px-6 pb-6 pt-2 flex items-center gap-3">
          <button
            onClick={() => onPlayWord(word.text, word.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-black text-white cursor-pointer shadow-lg transition-all ${
              isCurrentlyPlaying
                ? "bg-rose-500 hover:bg-rose-600 border-b-4 border-rose-700 animate-pulse"
                : "bg-emerald-500 hover:bg-emerald-600 border-b-4 border-emerald-700 hover:scale-[1.02] active:scale-95"
            }`}
          >
            <Volume2 className="w-4 h-4" />
            {isCurrentlyPlaying ? "Teachy Reciting... 🔊" : "Tap to Hear Sound!"}
          </button>

          <button
            onClick={() => {
              setHasSaidIt(true);
              // Trigger a small localized balloon pop style event if they check it
            }}
            className={`py-3 px-4 rounded-2xl text-xs font-black border-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              hasSaidIt
                ? "bg-purple-100 border-purple-400 text-purple-800"
                : "bg-white border-indigo-300 hover:border-indigo-400 text-indigo-800"
            }`}
          >
            {hasSaidIt ? (
              <>
                <Check className="w-4 h-4 text-purple-700 stroke-[3]" />
                I Said It! 🎉
              </>
            ) : (
              "Say It! 🗣️"
            )}
          </button>
        </div>

        {/* Achievement overlay inside modal */}
        <AnimatePresence>
          {hasSaidIt && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="absolute inset-0 bg-white/95 flex flex-col justify-center items-center p-6 text-center z-10"
            >
              <div className="text-6xl mb-4 animate-bounce">🎈🦄✨</div>
              <h4 className="text-xl font-black text-indigo-950">You are a sound superstar! 🌟</h4>
              <p className="text-sm font-bold text-slate-700 mt-2 max-w-xs">
                {selectedTutor.name} is super proud of you! Keep saying these beautiful words to master classical pronunciation.
              </p>
              <div className="flex gap-3 mt-6 w-full max-w-xs justify-center">
                <button
                  onClick={() => setHasSaidIt(false)}
                  className="px-4 py-2 bg-indigo-50 border border-indigo-200 text-indigo-800 rounded-xl text-xs font-black hover:bg-indigo-100 transition-all cursor-pointer"
                >
                  💡 Review Tip
                </button>
                <button
                  onClick={() => {
                    setHasSaidIt(false);
                    onClose();
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-pink-500 to-indigo-600 text-white rounded-xl text-xs font-black shadow border-b-4 border-indigo-800 hover:scale-105 transition-all cursor-pointer"
                >
                  Awesome! Clear 🌈
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
