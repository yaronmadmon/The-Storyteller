export function buildRewriteSystemPrompt(
  bookType: string,
  description: string,
  introAnswers: Record<string, string> | null = null
): string {
  let introBlock = "";
  if (introAnswers && Object.keys(introAnswers).length > 0) {
    const lines = Object.entries(introAnswers)
      .filter(([, v]) => v?.trim())
      .map(([k, v]) => `- ${k}: ${v.trim()}`);
    if (lines.length > 0) {
      introBlock = `\n\n**Author context (use for tone and consistency; do not invent from this):**\n${lines.join("\n")}\n`;
    }
  }

  return `You are helping write a ${bookType} book. The book is about: ${description}${introBlock}

Your task is to transform raw spoken transcription into polished, professional prose. Follow these rules strictly:

**Clean**: Remove "um", "uh", "like", false starts, repetition, and verbal filler.
**Structure**: Break into clear paragraphs. Add logical flow and transitions.
**Enhance**: Add sensory details and emotional resonance where appropriate. Use vivid, precise language.
**Preserve**: Never invent facts, events, or details. Keep the user's core story, chronology, and emotional truth. Maintain their personality and voice.
**Guardrails**: If something is unclear or missing, do not assume or invent. Preserve gaps; do not fill them with made-up content. When in doubt, keep the user's words.
**Format**: Use proper punctuation, grammar, capitalization, and dialogue formatting.

Output ONLY the polished text. No meta-commentary, no explanations. Never auto-generate narrative the user did not provide.`;
}

export function buildRewriteUserPrompt(
  chapterTitle: string,
  instructions: string,
  checklist: string[],
  transcription: string,
  style?: string
): string {
  let prompt = `Chapter: ${chapterTitle}
Instructions: ${instructions}

Checklist items to ensure are reflected (if the user addressed them):
${checklist.map((c) => `- ${c}`).join("\n")}

Raw transcription:
---
${transcription}
---`;

  if (style && style !== "default") {
    const styleInstructions: Record<string, string> = {
      casual:
        "Apply a more casual tone: use contractions (I'm, don't, can't), conversational phrases, shorter sentences, less formal vocabulary. Sound like a friend telling a story.",
      formal:
        "Apply a more formal tone: use full words (I am, do not, cannot), professional tone, longer complex sentences, elevated vocabulary.",
      humor:
        "Add wit and humor: include witty observations, self-deprecating moments where appropriate, lighter tone, playful language—while preserving the emotional truth of the story.",
      darker:
        "Make it darker: emphasize struggles, add heavier emotional weight, more serious tone, raw unflinching honesty. Don't soften the difficult parts.",
      simplify:
        "Simplify: use shorter sentences, simpler words, clear direct language. Make it easier to read without losing meaning.",
    };
    prompt += `\n\nStyle override: ${styleInstructions[style] ?? style}`;
  }

  return prompt;
}
