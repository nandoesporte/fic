export const splitOptions = (content?: string): string[] => {
  if (!content) return [];
  const normalized = String(content).replace(/\r\n/g, "\n").trim();
  // Prefer blank lines as separators; fallback to single newlines
  const hasBlankLines = /\n{2,}/.test(normalized);
  const parts = (hasBlankLines ? normalized.split(/\n{2,}/) : normalized.split(/\n/));
  return parts.map((p) => p.trim()).filter((p) => p.length > 0);
};
