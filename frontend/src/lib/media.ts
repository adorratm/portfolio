const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

/** Proje görsel URL'sini imageUrl veya imageKey üzerinden çözümler. */
export function resolveProjectImageUrl(project: {
  imageUrl?: string | null;
  imageKey?: string | null;
}): string | null {
  if (project.imageUrl?.trim()) return project.imageUrl.trim();
  if (project.imageKey?.trim()) {
    return `${API_BASE}/media/files/${project.imageKey.trim()}`;
  }
  return null;
}
