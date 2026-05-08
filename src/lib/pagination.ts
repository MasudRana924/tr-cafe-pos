/** Compact pagination range for UI (e.g. 1 … 4 5 6 … 20). */
export function getPageItems(page: number, totalPages: number): Array<number | "…"> {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const set = new Set<number>([1, totalPages, page - 1, page, page + 1]);
  const pages = Array.from(set)
    .filter((p) => p >= 1 && p <= totalPages)
    .sort((a, b) => a - b);
  const out: Array<number | "…"> = [];
  for (let i = 0; i < pages.length; i++) {
    const cur = pages[i];
    const prev = pages[i - 1];
    if (i > 0 && cur - prev! > 1) out.push("…");
    out.push(cur);
  }
  return out;
}
