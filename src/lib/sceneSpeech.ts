/**
 * Agnes-friendly speech policy for storyboard scenes:
 * (1) Prefer converting narration → short character dialogue
 * (2) If pure narration is unavoidable → keep mouth closed + English soft subtitle
 * (3) Hard-cap spoken content and duration to ≤ 5 seconds
 */

export const MAX_SCENE_SECONDS = 5;
export const MAX_SPOKEN_CHARS = 15; // ~5s of natural Chinese speech

/** Pure environment / cinematic description — should stay as narration (EN subtitle), not forced lip-sync. */
const ENVIRONMENT_HINT =
  /雨|風|雪|雷|霧|夜|晨|黃昏|天空|街燈|霓虹|積水|寂靜|遠方|鏡頭|空鏡|風景|城市|辦公室外|走廊|背景|氛圍|音樂|雷鳴|月光|陽光|雲|海|山/;

function stripQuotes(s: string): string {
  return (s || "")
    .trim()
    .replace(/^[「『"']+/, "")
    .replace(/[」』"']+$/, "")
    .trim();
}

/** Truncate Chinese/English text to a speakable length (≤ MAX_SPOKEN_CHARS). */
export function truncateSpokenText(text: string, maxChars = MAX_SPOKEN_CHARS): string {
  const t = stripQuotes(text);
  if (!t) return "";
  if (t.length <= maxChars) return t;
  // Prefer cut at punctuation
  const slice = t.slice(0, maxChars);
  const punct = Math.max(slice.lastIndexOf("，"), slice.lastIndexOf("。"), slice.lastIndexOf("、"), slice.lastIndexOf(","), slice.lastIndexOf("."));
  if (punct >= 6) return slice.slice(0, punct);
  return slice;
}

/**
 * Heuristic English soft-subtitle from Chinese narration (no network).
 * Good enough for on-player overlay; split-novel AI can override with better subtitleEn.
 */
export function roughNarrationToEnglish(narration: string): string {
  const t = stripQuotes(narration);
  if (!t) return "";
  // If already mostly ASCII, keep as-is (truncated)
  const asciiRatio = (t.match(/[\x00-\x7F]/g) || []).join("").length / Math.max(1, t.length);
  if (asciiRatio > 0.7) return truncateSpokenText(t, 80);

  // Lightweight keyword map for common cinematic phrases; fall back to labeled Chinese snippet
  const map: [RegExp, string][] = [
    [/雨/, "Rain falls"],
    [/夜|深夜/, "At night"],
    [/風/, "Wind blows"],
    [/雷/, "Thunder rumbles"],
    [/寂靜|安靜/, "Silence settles"],
    [/霓虹/, "Neon lights shimmer"],
    [/積水/, "Puddles reflect the city"],
    [/明白|理解|意識到/, "The truth sinks in"],
    [/離開|出走/, "A choice to leave"],
    [/害怕|恐懼|緊張/, "Tension builds"],
    [/回憶|想起/, "A memory surfaces"],
  ];
  const hits: string[] = [];
  for (const [re, en] of map) {
    if (re.test(t) && !hits.includes(en)) hits.push(en);
    if (hits.length >= 2) break;
  }
  if (hits.length) return hits.join(". ") + ".";
  // Fallback: short bilingual cue so player always has EN line
  return `Narration: ${truncateSpokenText(t, 24)}`;
}

export type SpeechNormalizeInput = {
  dialogue?: string;
  narration?: string;
  character?: string;
  durationSeconds?: number;
  subtitleEn?: string;
  actionPrompt?: string;
  visualPrompt?: string;
};

export type SpeechNormalizeResult = SpeechNormalizeInput & {
  /** true if this shot must use English soft subtitle (no spoken dialogue for Agnes lip-sync) */
  useEnglishSubtitle: boolean;
  /** how we resolved speech */
  speechMode: "dialogue" | "inner" | "narration_subtitle" | "silent";
};

/**
 * Apply product rules:
 * 1) Prefer turning narration into short character dialogue when it can be spoken in-character
 * 2) If remaining pure narration → English subtitle + closed-mouth hints
 * 3) Cap duration ≤ 5s and spoken text length
 */
/**
 * What text to show as soft subtitle on the video player.
 * Prefer English subtitleEn; fall back so the player never looks "empty" when there is speech/narration.
 */
export function getDisplaySubtitle(scene: {
  dialogue?: string;
  narration?: string;
  subtitleEn?: string;
}): string {
  const en = (scene.subtitleEn || "").trim();
  if (en) return en;

  const dialogue = (scene.dialogue || "").trim();
  const narration = (scene.narration || "").trim();

  // Pure narration shot → English soft subtitle
  if (narration && !dialogue) {
    return roughNarrationToEnglish(narration) || narration;
  }

  // Narration + dialogue → subtitle for narrative beat
  if (narration) {
    return roughNarrationToEnglish(narration) || narration;
  }

  // Spoken dialogue (including 內心) → still show a readable caption line
  // (after rule-1 conversion, most text lives in dialogue, so without this users see "no subtitles")
  if (dialogue) {
    const bare = dialogue.replace(/^[（(]\s*(?:內心|心想|內心對話)[：:]\s*/, "").replace(/[）)]$/, "").trim();
    const asEn = roughNarrationToEnglish(bare);
    // Prefer EN-ish line; if heuristic only echoes Chinese, show Chinese dialogue as soft caption
    if (asEn && !asEn.startsWith("Narration:")) return asEn;
    return bare || dialogue;
  }

  return "";
}

export function normalizeSceneSpeech(input: SpeechNormalizeInput): SpeechNormalizeResult {
  let dialogue = stripQuotes(input.dialogue || "");
  let narration = stripQuotes(input.narration || "");
  let subtitleEn = (input.subtitleEn || "").trim();
  let actionPrompt = input.actionPrompt || "";
  let visualPrompt = input.visualPrompt || "";
  const character = (input.character || "").trim();

  // Hard-cap duration
  let durationSeconds = typeof input.durationSeconds === "number" && !isNaN(input.durationSeconds)
    ? input.durationSeconds
    : 4;
  durationSeconds = Math.max(3, Math.min(MAX_SCENE_SECONDS, Math.round(durationSeconds)));

  // Truncate existing dialogue
  if (dialogue) {
    dialogue = truncateSpokenText(dialogue);
  }

  // (1) Prefer: empty dialogue + has narration → convert to spoken dialogue when not pure environment
  if (!dialogue && narration) {
    const isEnv = ENVIRONMENT_HINT.test(narration) && narration.length <= 40 && !/[「」『』"']/.test(narration);
    const looksLikeThought = /想|心裡|內心|默念|意識到|明白了|難道|原來/.test(narration);

    if (!isEnv) {
      const spoken = truncateSpokenText(narration);
      if (looksLikeThought) {
        dialogue = `(內心：${spoken})`;
      } else {
        // Frame as first-person line the on-screen character can say
        dialogue = spoken.startsWith("我") || spoken.startsWith("你") || spoken.startsWith("他") || spoken.startsWith("她")
          ? spoken
          : spoken;
      }
      narration = "";
    } else {
      // (2) Unavoidable narration → keep + English soft subtitle
      narration = truncateSpokenText(narration, 20);
      if (!subtitleEn) subtitleEn = roughNarrationToEnglish(narration);
    }
  }

  // Mutual exclusion: if both remain, keep dialogue, drop narration to speech track rules
  if (dialogue && narration) {
    // Prefer dialogue; move leftover env cue to subtitle only if short
    if (!subtitleEn && ENVIRONMENT_HINT.test(narration)) {
      subtitleEn = roughNarrationToEnglish(narration);
    }
    narration = "";
  }

  // Inner monologue: closed mouth
  const isInner = dialogue.startsWith("(") || dialogue.startsWith("（");
  let speechMode: SpeechNormalizeResult["speechMode"] = "silent";
  let useEnglishSubtitle = false;

  if (dialogue && !isInner) {
    speechMode = "dialogue";
    useEnglishSubtitle = true;
    // Soft EN caption for player (not burned into video)
    if (!subtitleEn) {
      const bare = truncateSpokenText(dialogue);
      subtitleEn = roughNarrationToEnglish(bare);
      if (!subtitleEn || subtitleEn.startsWith("Narration:")) {
        // Keep a visible caption even if EN heuristic is weak
        subtitleEn = bare;
      }
    }
    // Reinforce lip-sync in action if missing
    if (actionPrompt && !/lip|speak|mouth|talking/i.test(actionPrompt)) {
      actionPrompt = `${actionPrompt} The character speaks the line "${dialogue}" with natural lip sync.`;
    }
  } else if (dialogue && isInner) {
    speechMode = "inner";
    useEnglishSubtitle = true;
    if (!subtitleEn) {
      const bare = dialogue.replace(/^[（(][^：:]*[：:]?\s*/, "").replace(/[）)]$/, "").trim();
      subtitleEn = roughNarrationToEnglish(bare) || bare;
    }
    if (actionPrompt && !/closed mouth|no lip/i.test(actionPrompt)) {
      actionPrompt = `${actionPrompt} No character is talking, no lip movement, closed mouth, deep thoughtful expression, silent action.`;
    }
  } else if (narration) {
    speechMode = "narration_subtitle";
    useEnglishSubtitle = true;
    if (!subtitleEn) subtitleEn = roughNarrationToEnglish(narration);
    if (actionPrompt && !/closed mouth|no lip/i.test(actionPrompt)) {
      actionPrompt = `${actionPrompt} No character is talking, no lip movement, closed mouth, silent action.`;
    }
    // Do NOT ask Agnes to burn subtitles into pixels — soft overlay only
    if (visualPrompt && !/no subtitles|clean video/i.test(visualPrompt)) {
      visualPrompt = `${visualPrompt} completely clean video, no burned-in subtitles, no on-screen text.`;
    }
  } else {
    speechMode = "silent";
  }

  // Re-cap duration by text length (~3 chars/sec Chinese, min 3 max 5)
  const spokenLen = (dialogue.replace(/^[（(]|[）)]$/g, "").length || narration.length);
  if (spokenLen > 0) {
    const est = Math.ceil(spokenLen / 3) + 1;
    durationSeconds = Math.max(3, Math.min(MAX_SCENE_SECONDS, est));
  }

  return {
    dialogue,
    narration,
    character,
    durationSeconds,
    subtitleEn: useEnglishSubtitle ? subtitleEn : (subtitleEn || undefined),
    actionPrompt,
    visualPrompt,
    useEnglishSubtitle,
    speechMode,
  };
}
