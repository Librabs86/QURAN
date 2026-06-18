import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Trophy, Award, Lock, BookOpen, Check, PartyPopper } from "lucide-react";

export interface VirtueBadge {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  requiredSurahs: number;
  colorClass: string;
  bgGradient: string;
  shadowColor: string;
  islamicGreeting: string;
  virtueExplanation: string;
}

export const VIRTUE_BADGES: VirtueBadge[] = [
  {
    id: "faithful-starter",
    title: "Faithful Starter",
    subtitle: "Sabiq (Forerunner) 🌿",
    emoji: "🌿",
    requiredSurahs: 1,
    colorClass: "text-emerald-700",
    bgGradient: "from-emerald-400 via-teal-500 to-green-500",
    shadowColor: "shadow-emerald-200/50",
    islamicGreeting: "Bismillah & SubhanAllah! ✨",
    virtueExplanation: "You completed your very first Surah in this session! May Allah bless you as you begin your glowing journey with the Quran.",
  },
  {
    id: "patient-learner",
    title: "Patient Learner",
    subtitle: "As-Sabir (The Patient) 🐢",
    emoji: "🐢",
    requiredSurahs: 2,
    colorClass: "text-indigo-700",
    bgGradient: "from-sky-400 via-indigo-500 to-purple-500",
    shadowColor: "shadow-purple-200/50",
    islamicGreeting: "MashAllah, TabarakAllah! ❄️",
    virtueExplanation: "You completed 2 Surahs in this session! Your incredible focus and patience are beautiful traits loved deeply by Allah.",
  },
  {
    id: "qari-star",
    title: "Qari Star",
    subtitle: "Al-Mu'allim Al-Saghir 🌟",
    emoji: "🌟",
    requiredSurahs: 3,
    colorClass: "text-sky-700",
    bgGradient: "from-amber-400 via-orange-500 to-rose-500",
    shadowColor: "shadow-amber-200/50",
    islamicGreeting: "Allahu Akbar! Outstanding! 🎉",
    virtueExplanation: "Superb! You completed 3 surahs in a single session. Your voice coordinates beautiful, glowing words that light up your home like a night star!",
  },
  {
    id: "light-of-quran",
    title: "Light of Quran",
    subtitle: "Noor Al-Qur'an ✨",
    emoji: "✨",
    requiredSurahs: 4,
    colorClass: "text-amber-700",
    bgGradient: "from-yellow-300 via-pink-400 to-purple-600",
    shadowColor: "shadow-yellow-200/40",
    islamicGreeting: "SubhanAllahi wa BiHamdihi! 💖",
    virtueExplanation: "Sublime! 4 Surahs in one session is a true blessing. Your warm heart is illuminated with the sweet light of recitation, bringing happiness to everyone.",
  },
  {
    id: "quran-champion",
    title: "Quran Champion",
    subtitle: "Al-Batal Al-Mu'min 🏆",
    emoji: "🏆",
    requiredSurahs: 5,
    colorClass: "text-rose-700",
    bgGradient: "from-cyan-400 via-teal-400 to-indigo-600",
    shadowColor: "shadow-indigo-200/50",
    islamicGreeting: "Allahu Akbar! True Champion! 👑",
    virtueExplanation: "Incredible efforts! You completed 5 unique Surahs in this learning session. May Allah fill memory and soul with infinite peace and understanding!",
  }
];

interface VirtueBadgeShelfProps {
  completedSurahs: number[];
  surahList: any[];
}

export function VirtueBadgeShelf({ completedSurahs, surahList }: VirtueBadgeShelfProps) {
  const completedCount = completedSurahs.length;

  return (
    <div className="w-full bg-white/95 rounded-[36px] border-4 border-indigo-200 p-6 md:p-8 shadow-xl transition-all relative overflow-hidden">
      {/* Decorative background vectors */}
      <div className="absolute top-[-20%] right-[-10%] w-[150px] h-[150px] bg-indigo-200/25 rounded-full blur-[30px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-[150px] h-[150px] bg-pink-200/25 rounded-full blur-[30px] pointer-events-none"></div>

      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b-2 border-dashed border-indigo-100 pb-5 mb-6">
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100 mb-1.5 inline-block">
            🏅 Spiritual Milestones
          </span>
          <h2 className="text-xl md:text-2xl font-black text-indigo-950 flex items-center gap-2">
            My Virtue Badges Shelf
          </h2>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">
            Complete beautiful Surahs in a single session to unlock special high-achievement awards!
          </p>
        </div>
        <div className="bg-indigo-600 text-white px-5 py-3 rounded-2xl flex items-center gap-3 shadow-md border-b-4 border-indigo-800 shrink-0">
          <BookOpen className="w-5 h-5 text-indigo-100 animate-pulse" />
          <div className="text-left">
            <p className="text-[10px] uppercase font-black tracking-wider text-indigo-200">Session Progress</p>
            <p className="text-sm font-black text-white">
              {completedCount} {completedCount === 1 ? "Surah" : "Surahs"} Completed
            </p>
          </div>
        </div>
      </div>

      {/* Session tracker of actual names */}
      {completedCount > 0 && (
        <div className="mb-6 p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex flex-wrap items-center gap-2">
          <span className="text-xs font-black text-indigo-700">Completed This Session:</span>
          {completedSurahs.map((num) => {
            const mappedName = surahList.find((s) => s.number === num)?.english || `Surah ${num}`;
            return (
              <span
                key={num}
                className="text-xs font-bold bg-white text-indigo-950 px-3 py-1 rounded-xl shadow-sm border border-indigo-100 flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[3]" />
                {mappedName}
              </span>
            );
          })}
        </div>
      )}

      {/* Badges Display Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {VIRTUE_BADGES.map((badge) => {
          const isUnlocked = completedCount >= badge.requiredSurahs;
          return (
            <motion.div
              key={badge.id}
              whileHover={{ y: -5 }}
              className={`relative flex flex-col justify-between p-5 rounded-[28px] border-2 transition-all overflow-hidden ${
                isUnlocked
                  ? `bg-gradient-to-br ${badge.bgGradient} border-transparent text-white shadow-lg ${badge.shadowColor}`
                  : "bg-slate-50 border-slate-200 text-slate-400"
              }`}
            >
              <div>
                {/* Visual state for badge: lock or emoji */}
                <div className="flex justify-between items-start mb-3">
                  {isUnlocked ? (
                    <span className="w-11 h-11 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-3xl shadow-sm">
                      {badge.emoji}
                    </span>
                  ) : (
                    <span className="w-11 h-11 bg-slate-200/80 rounded-2xl flex items-center justify-center text-slate-400">
                      <Lock className="w-5 h-5" />
                    </span>
                  )}
                  <div className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    isUnlocked ? "bg-white/20 text-white" : "bg-slate-200/70 text-slate-500"
                  }`}>
                    {badge.requiredSurahs} {badge.requiredSurahs === 1 ? "Surah" : "Surahs"}
                  </div>
                </div>

                <h3 className={`font-black text-sm tracking-wide ${isUnlocked ? "text-white" : "text-slate-600"}`}>
                  {badge.title}
                </h3>
                <p className={`text-[10px] font-bold ${isUnlocked ? "text-indigo-100/95" : "text-slate-400"}`}>
                  {badge.subtitle}
                </p>
                <p className={`text-[11px] leading-snug mt-2 ${isUnlocked ? "text-white/90" : "text-slate-400/80 font-medium"}`}>
                  {isUnlocked ? badge.virtueExplanation.slice(0, 60) + "..." : "Unlock by reciting beautiful suras with patience."}
                </p>
              </div>

              {/* Progress alert at bottom */}
              <div className="mt-4 pt-3 border-t border-dashed border-black/10 flex items-center justify-between text-[10px] font-extrabold font-mono">
                {isUnlocked ? (
                  <span className="text-white bg-white/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Check className="w-3 h-3 stroke-[3]" /> UNLOCKED
                  </span>
                ) : (
                  <span className="text-slate-500 bg-slate-200/50 px-2 py-0.5 rounded-md">
                    LOCKED ({badge.requiredSurahs - completedCount} more)
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

interface VirtueBadgeUnlockModalProps {
  badge: VirtueBadge | null;
  onClose: () => void;
}

export function VirtueBadgeUnlockModal({ badge, onClose }: VirtueBadgeUnlockModalProps) {
  if (!badge) return null;

  return (
    <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0, y: 30 }}
        className="w-full max-w-md bg-white border-4 border-amber-300 rounded-[42px] overflow-hidden shadow-2xl relative text-center"
      >
        {/* Colorful visual top background */}
        <div className={`bg-gradient-to-br ${badge.bgGradient} p-8 text-white relative`}>
          {/* Decorative design elements */}
          <div className="absolute top-[10%] left-[8%] sparkling-element text-4xl">⭐</div>
          <div className="absolute top-[20%] right-[12%] sparkling-element text-3xl [animation-delay:0.5s]">✨</div>
          <div className="absolute bottom-[10%] left-[15%] sparkling-element text-3xl [animation-delay:1s]">🌟</div>

          {/* Large Floating Badge Avatar */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="w-24 h-24 bg-white/25 rounded-[32px] mx-auto flex items-center justify-center text-6xl shadow-xl border-4 border-white/50 mb-4"
          >
            {badge.emoji}
          </motion.div>

          <span className="text-2xl font-black drop-shadow-sm">{badge.islamicGreeting}</span>
          <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#fdf4ff]/90 mt-1">
            New Virtue Badge Unlocked!
          </p>
        </div>

        {/* Info detail and explanations */}
        <div className="p-8">
          <h3 className="text-2xl font-black text-indigo-950">{badge.title}</h3>
          <span className="text-xs font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3.5 py-1.5 rounded-full border border-indigo-100 inline-block mt-1">
            {badge.subtitle}
          </span>

          <p className="text-sm font-bold text-slate-700 mt-6 leading-relaxed bg-slate-50 p-4 rounded-3xl border border-dashed border-slate-200">
            "{badge.virtueExplanation}"
          </p>

          <div className="mt-8 flex flex-col gap-2">
            <button
              onClick={onClose}
              className="w-full py-4 px-6 bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 text-white rounded-2xl text-sm font-black shadow-lg border-b-4 border-indigo-850 transform hover:scale-[1.03] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <PartyPopper className="w-5 h-5 animate-bounce" />
              Alhamdulillah! Awesome! 🎉
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
