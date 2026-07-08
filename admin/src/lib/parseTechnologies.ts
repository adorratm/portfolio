/** Virgülle ayrılmış teknoloji metnini diziye çevirir. */
export const parseTechnologies = (text: string): string[] =>
  text
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

/** Harici URL'ye protokol yoksa https:// ekler. */
export const normalizeExternalUrl = (url: string): string | undefined => {
  const trimmed = url.trim();
  if (!trimmed) return undefined;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
};
