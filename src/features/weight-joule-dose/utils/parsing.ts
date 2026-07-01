export function toNum(value: string): number {
  const raw = String(value ?? "").trim();
  if (!raw) return NaN;
  const normalized = raw.replace(/\s+/g, "").replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : NaN;
}
