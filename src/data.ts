import { AyahData, VoiceOption } from "./types";

export const VOICES: VoiceOption[] = [
  { name: "Charon", displayName: "Teacher Khalid (Sheikh Khalid)", tag: "Male Teacher", gender: "Male", description: "Deep, calm, and beautifully clear classical male voice" },
  { name: "Zephyr", displayName: "Teacher Ahmed (Sheikh Ahmed)", tag: "Male Teacher", gender: "Male", description: "Soft, patient, and gentle recitation voice" },
  { name: "Kore", displayName: "Teacher Maha (Sheikha Maha)", tag: "Female Teacher", gender: "Female", description: "Warm, comforting, and clear female educational teacher" },
  { name: "Aoede", displayName: "Teacher Yusuf (Sheikh Yusuf)", tag: "Male Teacher", gender: "Male", description: "Expressive, slow-paced, and highly precise recitation guide" },
  { name: "Puck", displayName: "Teacher Hamood (Young Qari Hamood)", tag: "Kid Reciter", gender: "Male", description: "Bright, innocent, and sweet child-like voice for young learners" },
];

export const SURAH_AN_NAS: AyahData[] = [
  {
    number: 0,
    text: "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ",
    translation: "In the name of Allah, the Entirely Merciful, the Especially Merciful.",
    tajweedRules: ["Basmalah", "Madd Arid Lis-Sukun", "Lafdh Al-Jalalah (Light)"],
    words: [
      {
        id: "0-1",
        text: "بِسْمِ",
        transliteration: "Bismi",
        translation: "In the name",
        tajweedRule: "Tarqiq (Light)",
        tajweedDetail: "Pronounce with a light, clear sound. The letter 'Ba' and 'Mina' are thin.",
        makhraj: "Lips & Tongue",
        makhrajDetail: "Produced by closing the lips gently (Ba) and from the front of the tongue (Seen, Meem)."
      },
      {
        id: "0-2",
        text: "ٱللَّهِ",
        transliteration: "Llāh",
        translation: "of Allah",
        tajweedRule: "Lafdh Al-Jalalah (Light)",
        tajweedDetail: "The name of Allah is pronounced light (Tarqiq) here because it is preceded by a kasrah (i-sound in Bismi).",
        makhraj: "Throat",
        makhrajDetail: "The concluding 'Ha' is produced from the deepest part of the throat."
      },
      {
        id: "0-3",
        text: "ٱلرَّحْمَـٰنِ",
        transliteration: "Ar-Raḥmān",
        translation: "the Entirely Merciful",
        tajweedRule: "Tafkhim & Madd",
        tajweedDetail: "The letter 'Ra' is heavy (Tafkhim) due to fatha. The small 'Alif above the 'Meem' is natural elongation (Madd Tabi'i), hold for 2 counts.",
        makhraj: "Throat & Tongue",
        makhrajDetail: "'Ḥa' comes from the middle throat (sharp friction). 'Ra' is from the tip of the tongue striking the palate."
      },
      {
        id: "0-4",
        text: "ٱلرَّحِيمِ",
        transliteration: "Ar-Raḥīm",
        translation: "the Especially Merciful",
        tajweedRule: "Madd 'Arid Lis-Sukun",
        tajweedDetail: "Upon stopping at the end of the phrase, elongate the 'Ya' vowel for 2, 4, or 6 counts (Madd 'Arid Lis-Sukun).",
        makhraj: "Throat & Lips",
        makhrajDetail: "'Ya' is from the center of the tongue. 'Meem' is produced by simple resting lip closure."
      }
    ]
  },
  {
    number: 1,
    text: "قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ",
    translation: "Say, 'I seek refuge in the Lord of mankind,'",
    tajweedRules: ["Tafkhim (Heavy Qaf)", "Madd Tabi'i", "Tarqiq (Ra with kasrah)", "Ghunnah (Shaddah on Noon)"],
    words: [
      {
        id: "1-1",
        text: "قُلْ",
        transliteration: "Qul",
        translation: "Say",
        tajweedRule: "Tafkhim (Heavy)",
        tajweedDetail: "The letter 'Qaf' (ق) is a heavy throat-tongue letter ( خص ضغط قظ). It must be pronounced robustly, distinct from a light 'Kaf' (ك). The 'Lam' is light.",
        makhraj: "Back of Tongue",
        makhrajDetail: "'Qaf' is produced from the back of the tongue hitting the soft palate (deepest tongue point)."
      },
      {
        id: "1-2",
        text: "أَعُوذُ",
        transliteration: "A'ūdhu",
        translation: "I seek refuge",
        tajweedRule: "Throat & Madd",
        tajweedDetail: "Distinguish between 'Hamzah' (أ) from the deepest throat and 'Ayn' (ع) from the middle throat. The 'Waw' is sustained for 2 counts (Madd Tabi'i). Pronounce 'Dhal' (ذ) softly using the tongue tip.",
        makhraj: "Throat & Tongue-tip",
        makhrajDetail: "'Ayn' is from the mid-throat, while 'Dhal' is produced by placing the tongue tip against the edges of the upper front teeth."
      },
      {
        id: "1-3",
        text: "بِرَبِّ",
        transliteration: "Birabbi",
        translation: "in the Lord of",
        tajweedRule: "Double letter & Tafkhim",
        tajweedDetail: "'Ra' (ر) has fatha and is heavy. Double 'Ba' has Shaddah; merge them smoothly into a single strong letter with temporary pressure.",
        makhraj: "Tongue & Lips",
        makhrajDetail: "'Ra' is articulated near the tip/top of the tongue striking the palate. 'Ba' is from the contact of both lips."
      },
      {
        id: "1-4",
        text: "ٱلنَّاسِ",
        transliteration: "An-Nās",
        translation: "mankind",
        tajweedRule: "Ghunnah (Shaddah)",
        tajweedDetail: "Noon has a Shaddah (نّ). This is a MUST-hold rule: produce a clear nasal sound (Ghunnah) from the nasal cavity for a full 2 counts. Elongate 'Alif' upon stopping.",
        makhraj: "Nasal Cavity & Tongue",
        makhrajDetail: "Ghunnah nasalization comes strictly from the nose (Khaishoom). 'Seen' is from the tongue tip close to lower teeth."
      }
    ]
  },
  {
    number: 2,
    text: "مَلِكِ ٱلنَّاسِ",
    translation: "The Sovereign of mankind,",
    tajweedRules: ["Tarqiq (Light letters)", "Ghunnah (Shaddah on Noon)", "Madd 'Arid"],
    words: [
      {
        id: "2-1",
        text: "مَلِكِ",
        transliteration: "Maliki",
        translation: "The King / Sovereign",
        tajweedRule: "Tarqiq (Light)",
        tajweedDetail: "All letters in 'Maliki' are light and short. Pronounce the 'Kaf' with a sharp, soft sound towards the front of the mouth, not heavy.",
        makhraj: "Lips & Tongue",
        makhrajDetail: "'Meem' is from the lips. 'Lam' is from the side/tip of the tongue. 'Kaf' is from the back of the tongue but lower than Qaf."
      },
      {
        id: "2-2",
        text: "ٱلنَّاسِ",
        transliteration: "An-Nās",
        translation: "mankind",
        tajweedRule: "Ghunnah (Shaddah)",
        tajweedDetail: "Ensure the Shaddah on Noon (نّ) is held for 2 beats with standard gentle nasalization. Stop at the end with a soft breath on 'Seen' (Hams).",
        makhraj: "Nasal Cavity",
        makhrajDetail: "Nasal sound for the double Noon, then the tongue rests near the inner gums for the whistling letter 'Seen'."
      }
    ]
  },
  {
    number: 3,
    text: "إِلَـٰهِ ٱلنَّاسِ",
    translation: "The God of mankind,",
    tajweedRules: ["Madd Tabi'i", "Ghunnah (Shaddah on Noon)", "Madd 'Arid"],
    words: [
      {
        id: "3-1",
        text: "إِلَـٰهِ",
        transliteration: "Ilāhi",
        translation: "The God",
        tajweedRule: "Madd (Elongation)",
        tajweedDetail: "The superscript 'Alif' above 'Lam' denotes a natural elongation of 2 counts. The 'Ha' at the end is a soft throat letter.",
        makhraj: "Throat & Tongue",
        makhrajDetail: "'Hamzah' (إ) and 'Ha' (هـ) are born in the bottom-most throat. 'Lam' is from the tongue tip.",
        
      },
      {
        id: "3-2",
        text: "ٱلنَّاسِ",
        transliteration: "An-Nās",
        translation: "mankind",
        tajweedRule: "Ghunnah & Madd 'Arid",
        tajweedDetail: "Emphasize the beautiful, patient Ghunnah nasal hum on 'Noon' (نّ). Prolong the vowel smoothly for a respectful finish.",
        makhraj: "Nasal Cavity & Throat",
        makhrajDetail: "Nasal hum from the nostril cavity merged seamlessly with the steady sibilant whispy seen sound."
      }
    ]
  },
  {
    number: 4,
    text: "مِن شَرِّ ٱلْوَسْوَاسِ ٱلْخَنَّاسِ",
    translation: "From the evil of the retreating whisperer -",
    tajweedRules: ["Ikhfa (Noon Sakinah)", "Tarqiq (Ra with kasrah)", "Izhar Qamari", "Tafkhim (Heavy Kha)", "Ghunnah (Shaddah on Noon)"],
    words: [
      {
        id: "4-1",
        text: "مِن",
        transliteration: "Min",
        translation: "From",
        tajweedRule: "Ikhfa (Concealment)",
        tajweedDetail: "Noon Sakinah followed by letter 'Sheen'. Do NOT make 'Noon' sound clear. Partially hide the 'Noon' sound inside the nose, preparing your mouth for 'Sheen' with a 2-beat nasal resonance.",
        makhraj: "Nasal Cavity / Tongue",
        makhrajDetail: "Hold the sound in the nose. The tongue does not touch the palate as it prepares for the open mouth position of 'Sheen'."
      },
      {
        id: "4-2",
        text: "شَرِّ",
        transliteration: "Sharri",
        translation: "the evil of",
        tajweedRule: "Double letter & Tarqiq (Light)",
        tajweedDetail: "The letter 'Ra' is double with Shaddah and carries a kasrah under it, which means it MUST be pronounced light and thin (Tarqiq), not vibrated heavily.",
        makhraj: "Tongue & Center Mouth",
        makhrajDetail: "'Sheen' is from the center of the tongue (causing air to spread - Tafash-shee). 'Ra' is near the tip of the tongue."
      },
      {
        id: "4-3",
        text: "ٱلْوَسْوَاسِ",
        transliteration: "Al-Waswāsi",
        translation: "the whisperer",
        tajweedRule: "Izhar Qamari (Clear)",
        tajweedDetail: "The 'L' of 'Al' is clearly pronounced because 'Waw' is a lunar-consonant. The 'Seen' has a soft whistling trait (Safeer) and should sound crisp.",
        makhraj: "Lips & Tongue tip",
        makhrajDetail: "'Waw' is from rounding the two lips. 'Seen' is whistling from the tip of the tongue close to the sharp upper teeth."
      },
      {
        id: "4-4",
        text: "ٱلْخَنَّاسِ",
        transliteration: "Al-Khannās",
        translation: "the returning/retreating",
        tajweedRule: "Tafkhim & Ghunnah",
        tajweedDetail: "The letter 'Kha' (خ) is a heavy throat letter, make it full-mouthed (Tafkhim). It is followed by 'Noon' with Shaddah (نّ), which needs the essential 2 counts nasal Ghunnah.",
        makhraj: "Upper Throat & Nasal",
        makhrajDetail: "'Kha' is upper throat (producing a light scraping sound). Noon Shaddah utilizes the nose cavity."
      }
    ]
  },
  {
    number: 5,
    text: "ٱلَّذِى يُوَسْوِسُ فِى صُدُورِ ٱلنَّاسِ",
    translation: "Who whispers into the breasts of mankind -",
    tajweedRules: ["Madd Tabi'i", "Tafkhim (Heavy Sad)", "Tarqiq (Ra)", "Ghunnah (Shaddah on Noon)"],
    words: [
      {
        id: "5-1",
        text: "ٱلَّذِى",
        transliteration: "Alladhī",
        translation: "Who",
        tajweedRule: "Madd (Elongation)",
        tajweedDetail: "Pronounce 'Dhal' (ذ) softly with the tongue-tip gently touching the top teeth, then elongate the 'Ya' for 2 counts which is a standard natural Madd.",
        makhraj: "Tongue-tip",
        makhrajDetail: "Tip of the tongue contacts the upper incisors for 'Dhal'."
      },
      {
        id: "5-2",
        text: "يُوَسْوِسُ",
        transliteration: "Yuwaswisu",
        translation: "whispers",
        tajweedRule: "Tarqiq (Light)",
        tajweedDetail: "All letters are light. Keep the pacing slow and pronounce each vowel (dammah, fatha, kasrah, dammah) with exact individual timings.",
        makhraj: "Lips & Tongue",
        makhrajDetail: "Combination of lip rounding for 'Waw' and sharp tongue whistle for 'Seen'."
      },
      {
        id: "5-3",
        text: "فِى",
        transliteration: "Fī",
        translation: "into",
        tajweedRule: "Madd Tabi'i",
        tajweedDetail: "Elongate the 'Ya' vowel for 2 simple counts under normal flowing conditions (Natural Madd).",
        makhraj: "Lips & Teeth",
        makhrajDetail: "'Fa' is articulated by touching the inner edge of the lower lip with the tips of the upper front teeth."
      },
      {
        id: "5-4",
        text: "صُدُورِ",
        transliteration: "Ṣudūri",
        translation: "the breasts of",
        tajweedRule: "Tafkhim (Heavy) & Tarqiq (Light)",
        tajweedDetail: "The letter 'Sad' (ص) is heavy and whistled; do not soften it into a 'Seen' (س). The 'Daal' is light and prolonged. The final 'Ra' is light due to the kasrah.",
        makhraj: "Tongue-tip & Palate",
        makhrajDetail: "'Sad' is tongue tip closer to lower teeth with back of tongue raised to the roof grid. 'Daal' is front of tongue tip touching gums."
      },
      {
        id: "5-5",
        text: "ٱلنَّاسِ",
        transliteration: "An-Nās",
        translation: "mankind",
        tajweedRule: "Ghunnah",
        tajweedDetail: "Ensure the Noon with Shaddah receives its full-duration nasal hum. Make sure not to rush this last word of the verse.",
        makhraj: "Nasal Cavity",
        makhrajDetail: "Steady nasal bypass through the nostrils with crisp concluding Seen breath."
      }
    ]
  },
  {
    number: 6,
    text: "مِنَ ٱلْجِنَّةِ وَٱلنَّاسِ",
    translation: "From among the jinn and mankind.\"",
    tajweedRules: ["Izhar Qamari", "Ghunnah (Shaddah on both Noons)", "Madd 'Arid Lis-Sukun"],
    words: [
      {
        id: "6-1",
        text: "مِنَ",
        transliteration: "Mina",
        translation: "From among",
        tajweedRule: "Tarqiq (Light)",
        tajweedDetail: "Slight fatha vowel on the 'Noon'. Simple light articulation.",
        makhraj: "Tongue & Lips",
        makhrajDetail: "Simple tongue contact with inner upper gums."
      },
      {
        id: "6-2",
        text: "ٱلْجِنَّةِ",
        transliteration: "Al-Jinnati",
        translation: "the jinn",
        tajweedRule: "Izhar Qamari & Ghunnah",
        tajweedDetail: "'Al' is clearly pronounced because 'Jeem' is lunar. Double Noon (نّ) has a strong Shaddah, held strictly for 2 counts with beautiful nasalization of the voice.",
        makhraj: "Tongue & Nose",
        makhrajDetail: "'Jeem' is produced from the center of the tongue. Ghunnah utilizes the nose cavity."
      },
      {
        id: "6-3",
        text: "وَٱلنَّاسِ",
        transliteration: "Wan-Nās",
        translation: "and mankind",
        tajweedRule: "Merged Noon & Ghunnah",
        tajweedDetail: "The 'Al' is skipped. Sound directly goes from 'Waw' to double 'Noon' (نّ) with full, respectful 2 beats Ghunnah. Hold the natural elongation, letting the sound rest on 'Seen'.",
        makhraj: "Lips, Nose & Tongue",
        makhrajDetail: "Lip rounding of 'Waw' moves immediately into the nasal hum of double 'Noon', ending with tip-of-tongue 'Seen' whistle."
      }
    ]
  }
];

export const ARTICULATION_POINTS_GUIDE = [
  {
    name: "Al-Halq (The Throat)",
    arabic: "الحلق",
    letters: ["ء", "هـ", "ع", "ح", "غ", "خ"],
    description: "Crucial for correct recitation. Divided into three sub-areas: deepest throat (ء, هـ), middle throat (ع, ح), and upper throat closest to mouth (غ, خ). Must not be distorted or softened.",
    examples: ["أَعُوذُ (A'udhu - ع from mid-throat)", "مِنَ ٱلْخَنَّاسِ (Khannas - خ from upper throat)"]
  },
  {
    name: "Al-Lisan (The Tongue)",
    arabic: "اللسان",
    letters: ["ق", "ك", "ج", "ش", "ي", "ض", "ل", "ن", "ر", "ط", "د", "ت", "ص", "س", "ز", "ظ", "ذ", "ث"],
    description: "The largest articulation zone. Contains 10 articulation points for 18 letters. For An-Nas, pay close attention to heavy 'Qaf' (ق) vs 'Kaf' (ك), and 'Seen' (س) vs 'Sad' (ص).",
    examples: ["قُلْ (Heavy Qaf from deep tongue)", "يُوَسْوِسُ (Seen with clear whistling safeer)"]
  },
  {
    name: "Al-Shafatain (The Lips)",
    arabic: "الشفتان",
    letters: ["ب", "م", "ف", "و"],
    description: "Letters produced strictly by the dynamic interaction of the lips: closing together (ب, م), drawing the teeth to the lip (ف), or rounding the lips (و).",
    examples: ["بِرَبِّ (Birabbi - clean double lip contact)", "ٱلْوَسْوَاسِ (Rounded lips for Waw)"]
  },
  {
    name: "Al-Khaishoom (Nasal Cavity)",
    arabic: "الخيشوم",
    letters: ["نّ", "مّ"],
    description: "The nose tunnel or nasal cavity. No letters are physically spoken here, but the sound of Ghunnah (nasalized humming sound) is produced strictly here. Essential for Shaddah on Noon in 'An-Nas'.",
    examples: ["ٱلنَّاسِ (An-Nās - hold the humming sound for 2 counts)"]
  }
];
