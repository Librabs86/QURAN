export interface WordData {
  id: string; // unique identifier
  text: string; // Arabic word text (e.g. قُلْ)
  transliteration: string; // phonetic spelling
  translation: string; // english meaning
  tajweedRule: string; // specific tajweed coloring or instruction category
  tajweedDetail: string; // exact explanation of how to pronounce and why
  makhraj: string; // articulation point category (Throat, Tongue, Lips, etc.)
  makhrajDetail: string; // deep explanation of articulation point
}

export interface AyahData {
  number: number; // 1 to 6 (or 0 for Bismillah)
  text: string; // whole verse text
  translation: string; // verse translation
  words: WordData[]; // word list
  tajweedRules: string[]; // key tajweed rules present in this ayah
}

export type VoiceName = "Kore" | "Charon" | "Puck" | "Fenrir" | "Zephyr" | "Aoede";

export interface VoiceOption {
  name: VoiceName;
  displayName: string;
  gender: "Male" | "Female";
  tag: "Male Teacher" | "Female Teacher" | "Kid Reciter";
  description: string;
}

export interface Bookmark {
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  text: string;
  translation: string;
}
