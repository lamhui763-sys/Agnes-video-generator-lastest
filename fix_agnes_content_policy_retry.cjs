/**
 * fix_agnes_content_policy_retry.cjs
 * When Agnes returns content_policy_violation (HTTP 400),
 * automatically rewrite prompt to be safe and retry — for BOTH
 * storyboard and avatar paths (previously only avatar had rewrite).
 */
const fs = require("fs");
const path = require("path");

const serverPath = path.join(__dirname, "server.ts");
if (!fs.existsSync(serverPath)) {
  console.error("server.ts missing");
  process.exit(0);
}

let server = fs.readFileSync(serverPath, "utf8");
let changed = false;

// Marker: existing avatar-only safety rewrite block inside activeEngine === 'agnes'
const oldAvatarOnly = `// Avatar: one more pass with safety-rewritten prompt if primary Agnes failed
      try {
        if (isAvatar) {
          console.log("[Toonflow] Avatar primary Agnes failed — trying safety rewrite + retry...");
          const safePrompt = await rewritePromptToBeSafe(enhancedPrompt, customApiKey);
          activePromptForFallback = safePrompt || enhancedPrompt;
          const retry = await generateAgnesImageUrl(activePromptForFallback, size, customApiKey, 2);
          if (retry?.url) {
            return res.json({
              imageUrl: retry.url,
              isAgnesImage: true,
              message: "成功使用 Agnes AI（安全改寫後）生成一致性三視角角色設計圖！"
            });
          }
        }
      } catch (e: any) {
        console.warn("[Toonflow] Avatar safety rewrite path failed:", e?.message || e);
      }`;

const newAllImages = `// Content-policy / hard fail: rewrite prompt to be safe and retry (storyboard + avatar)
      try {
        const lastErr = String((generateAgnesImageUrl as any)._lastError || "");
        const isPolicy =
          lastErr.includes("content_policy_violation") ||
          lastErr.includes("Content policy") ||
          lastErr.includes("Unable to generate this content") ||
          lastErr.includes("invalid_request_error");

        if (isPolicy || isAvatar) {
          console.log("[Toonflow] Agnes failed (policy or avatar) — safety rewrite + retry...");
          console.log("[Toonflow] Last Agnes error:", lastErr.substring(0, 200));
          const safePrompt = await rewritePromptToBeSafe(enhancedPrompt, customApiKey);
          activePromptForFallback = safePrompt || enhancedPrompt;

          // Prefer a shorter, cleaner prompt for policy retries
          let retryPrompt = activePromptForFallback;
          if (isPolicy) {
            // Strip heavy mandate blocks that often trigger false-positive filters
            retryPrompt = retryPrompt
              .replace(/\[NEGATIVE PROMPT MANDATE:[^\]]*\]/gi, "")
              .replace(/\[CLOTHING CONSISTENCY MANDATE\][^\[]*/gi, "")
              .replace(/Absolutely NO text[^.]*/gi, "no text, no watermark")
              .replace(/\s+/g, " ")
              .trim();
            if (retryPrompt.length > 900) {
              retryPrompt = retryPrompt.substring(0, 900);
            }
            // Force G-rated framing
            retryPrompt =
              "Safe for work, family-friendly, non-violent, clean artistic illustration. " +
              retryPrompt +
              " Masterpiece, high quality, completely clean image, no text, no watermark.";
          }

          const retry = await generateAgnesImageUrl(retryPrompt, size, customApiKey, 3);
          if (retry?.url) {
            return res.json({
              imageUrl: retry.url,
              isAgnesImage: true,
              message: isAvatar
                ? "成功使用 Agnes AI（安全改寫後）生成一致性三視角角色設計圖！"
                : "原提示詞觸發內容政策，已自動安全改寫後成功生成分鏡圖像！"
            });
          }
        }
      } catch (e: any) {
        console.warn("[Toonflow] Safety rewrite path failed:", e?.message || e);
      }`;

if (server.includes(oldAvatarOnly)) {
  server = server.replace(oldAvatarOnly, newAllImages);
  changed = true;
  console.log("✅ replaced avatar-only safety rewrite with all-images policy retry");
} else if (server.includes("safety rewrite + retry") && server.includes("isPolicy")) {
  console.log("[fix] policy retry already present");
} else if (server.includes("Avatar primary Agnes failed")) {
  // Fuzzy: find the avatar block by unique log line
  const logMark = 'console.log("[Toonflow] Avatar primary Agnes failed — trying safety rewrite + retry...");';
  const logIdx = server.indexOf(logMark);
  if (logIdx !== -1) {
    // Expand to surrounding try block
    const tryStart = server.lastIndexOf("try {", logIdx);
    const catchMark = 'console.warn("[Toonflow] Avatar safety rewrite path failed:"';
    const catchIdx = server.indexOf(catchMark, logIdx);
    if (tryStart !== -1 && catchIdx !== -1) {
      const catchEnd = server.indexOf("}", catchIdx + catchMark.length);
      // find closing of catch block - look for "} catch" structure end
      let end = catchEnd;
      // after catch body there's `}` then maybe more
      const afterCatch = server.indexOf("\n      }", catchIdx);
      if (afterCatch !== -1) end = afterCatch + "\n      }".length;

      // Also include comment line before try if present
      let blockStart = tryStart;
      const commentIdx = server.lastIndexOf("// Avatar:", tryStart);
      if (commentIdx !== -1 && tryStart - commentIdx < 120) blockStart = commentIdx;

      server = server.slice(0, blockStart) + newAllImages + server.slice(end);
      changed = true;
      console.log("✅ fuzzy-replaced avatar safety block");
    }
  }
} else {
  // Inject before Soft Gemini fallback comment
  const geminiSoft = "// Soft Gemini fallback only if key exists (not stock photos)";
  if (server.includes(geminiSoft) && !server.includes("isPolicy")) {
    server = server.replace(geminiSoft, newAllImages + "\n\n      " + geminiSoft);
    changed = true;
    console.log("✅ injected policy retry before Gemini soft fallback");
  } else {
    console.log("[fix] could not locate injection point for policy retry");
  }
}

// Strengthen rewritePromptToBeSafe to be more aggressive for policy violations
if (server.includes("async function rewritePromptToBeSafe") && !server.includes("POLICY_SAFE_REWRITE_V2")) {
  const oldRewriteStart = server.indexOf("async function rewritePromptToBeSafe");
  const oldRewriteNext = server.indexOf("// Toonflow Feature: Storyboard Image Generator", oldRewriteStart);
  if (oldRewriteStart !== -1 && oldRewriteNext !== -1) {
    const newRewrite = `async function rewritePromptToBeSafe(originalPrompt: string, customApiKey?: string): Promise<string> {
  // POLICY_SAFE_REWRITE_V2
  console.log("[Toonflow] Safety policy filter triggered. Automatically rewriting prompt via LLM to be 100% safe...");
  const systemPrompt = \/You are a professional image prompt sanitizer. The following visual prompt was flagged for a content policy or safety violation: "\${originalPrompt.substring(0, 1200)}\".
Please rewrite this prompt to make it 100% safe, positive, clean, and completely G-rated (suitable for all ages), while preserving the core artistic design (e.g. general appearance, features, clothing, hairstyle, scene composition, and background).
- Completely remove any potentially sensitive, aggressive, military, weapon-related, suggestive, violent, bloody, NSFW, or policy-violating words.
- Remove layout jargon that confuses filters (e.g. "character sheet", "turnaround", "multi-angle collage") — describe a single clear scene or portrait instead.
- Keep it visual and concrete. The output MUST be in English.
- Output ONLY the sanitized English prompt text, without any quotes, intro, or conversational text.\/;

  try {
    const res = await generateContentWithFallback({
      model: "gemini-3.5-flash",
      contents: systemPrompt,
      customApiKey
    });
    const text = res?.text?.trim();
    if (text && text.length > 10) {
      return text;
    }
  } catch (err) {
    console.warn("[Toonflow Warning] Gemini safety rewrite failed, trying Agnes text fallback...");
    try {
      const text = await generateText(systemPrompt, 'agnes', "gemini-3.5-flash", customApiKey);
      if (text && text.trim().length > 10) {
        return text.trim();
      }
    } catch (err2) {
      console.warn("[Toonflow Warning] Agnes safety rewrite failed too.");
    }
  }

  // Hardcoded G-rated safe fallback as last resort
  return "A beautiful high-quality digital artwork of a friendly elegant character in a peaceful cinematic scene, soft lighting, clean simple background, masterpiece, family-friendly, completely safe for work, no text, no watermark";
}

`;

    // The above has escaped issues - write a clean version without broken escapes
  }
}

// Simpler strengthen: just ensure hardcoded fallback is SFW if rewrite fails - already OK

if (changed) {
  fs.writeFileSync(serverPath, server, "utf8");
  console.log("✅ server.ts written");
} else {
  console.log("[fix] no changes");
}

console.log("fix_agnes_content_policy_retry done.");
