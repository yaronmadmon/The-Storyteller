/**
 * Deterministic depth heuristics (non-AI).
 * Depth reflects how "developed" a chapter is: length, structure, checklist coverage.
 * Calibrated for classic chapter lengths: ~500 low, ~1000 average, ~1500 sufficient, ~2500 rich.
 */

export function getWordCount(text: string | null): number {
  if (!text?.trim()) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function getDepthScore(
  polished: string | null,
  checklist: string[]
): number {
  if (!polished?.trim()) return 0;
  const words = getWordCount(polished);
  const paragraphs = polished.trim().split(/\n\n+/).filter((p) => p.trim()).length;

  // Word component: 0–70 points. ~500 low, ~1000 average, ~1500 sufficient, ~2100+ caps at 70
  const wordScore = Math.min(70, Math.floor(words / 30));

  // Paragraph structure: up to 15 points (multiple paragraphs = better structure)
  const paragraphScore = Math.min(15, paragraphs * 3);

  // Checklist coverage: up to 15 points (enough words per goal)
  const checklistSize = checklist.length || 1;
  const minWordsPerGoal = 30;
  const expectedMinWords = checklistSize * minWordsPerGoal;
  const checklistScore = words >= expectedMinWords ? 15 : Math.floor((words / expectedMinWords) * 15);

  return Math.min(100, wordScore + paragraphScore + checklistScore);
}

export function getDepthLabel(score: number): string {
  if (score >= 80) return "Chapter-ready";
  if (score >= 60) return "Solid";
  if (score >= 40) return "Building";
  if (score >= 20) return "Short";
  return "Just started";
}
