/**
 * Converts raw 16-bit mono PCM base64 data to a browser-playable RIFF WAV Blob URL.
 */
export function pcmToWav(pcmBase64: string, sampleRate: number = 24000): string {
  const binaryString = window.atob(pcmBase64);
  const len = binaryString.length;
  const buffer = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    buffer[i] = binaryString.charCodeAt(i);
  }

  const wavHeader = new ArrayBuffer(44);
  const view = new DataView(wavHeader);

  // RIFF identifier "RIFF"
  view.setUint32(0, 0x52494646, false); 
  // File size - 8
  view.setUint32(4, 36 + len, true);
  // Format "WAVE"
  view.setUint32(8, 0x57415645, false); 
  // Subchunk1 ID "fmt "
  view.setUint32(12, 0x666d7420, false); 
  // Subchunk1 Size (16 for PCM)
  view.setUint32(16, 16, true);
  // Audio format (1 for PCM)
  view.setUint16(20, 1, true); 
  // Number of channels (1 for Mono)
  view.setUint16(22, 1, true); 
  // Sample rate (24000 for Gemini TTS)
  view.setUint32(24, sampleRate, true);
  // Byte rate = SampleRate * NumChannels * BitsPerSample/8 = 24000 * 1 * 2 = 48000
  view.setUint32(28, sampleRate * 2, true);
  // Block align = NumChannels * BitsPerSample/8 = 2
  view.setUint16(32, 2, true);
  // Bits per sample (16)
  view.setUint16(34, 16, true);
  // Subchunk2 ID "data"
  view.setUint32(36, 0x64617461, false); 
  // Subchunk2 Size
  view.setUint32(40, len, true);

  const combined = new Uint8Array(44 + len);
  combined.set(new Uint8Array(wavHeader), 0);
  combined.set(buffer, 44);

  const blob = new Blob([combined], { type: "audio/wav" });
  return URL.createObjectURL(blob);
}

/**
 * Call the backend server to generate recitation using Gemini TTS
 */
export async function fetchRecitation(text: string, voice: string): Promise<string> {
  const response = await fetch("/api/recite", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text, voice }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const err = new Error(errorData.error || "Failed to generate audio recitation.");
    if (response.status === 429 || errorData.code === "QUOTA_EXCEEDED") {
      (err as any).code = "QUOTA_EXCEEDED";
    }
    throw err;
  }

  const data = await response.json();
  if (!data.audio) {
    throw new Error("No recitation audio received from server.");
  }

  return pcmToWav(data.audio, 24000);
}

/**
 * Speech Synthesis fallback to play classical Arabic text locally in the browser should Gemini TTS be unavailable.
 */
export function speakArabicLocalDirectly(text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return reject(new Error("Local Speech Synthesis is not supported in this browser."));
    }

    try {
      // Cancel any ongoing speaking to avoid overlapping
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ar-SA"; // Set lang to Arabic (Saudi Arabia)
      utterance.rate = 0.70; // Child-friendly slower rate
      utterance.pitch = 1.0;

      // Try to find native or high-quality Arabic voices
      const voices = window.speechSynthesis.getVoices();
      const arVoice = voices.find((v) => v.lang.startsWith("ar"));
      if (arVoice) {
        utterance.voice = arVoice;
      }

      utterance.onend = () => {
        resolve();
      };

      utterance.onerror = (e) => {
        console.error("Local SpeechSynthesis playback error:", e);
        reject(e);
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      reject(err);
    }
  });
}
