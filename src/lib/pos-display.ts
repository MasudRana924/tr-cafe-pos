/** POS grid: treat short strings as emoji "images" from API. */
export function isEmoji(val: unknown) {
  return typeof val === "string" && val.trim().length > 0 && val.trim().length <= 4;
}

export function productFallbackEmoji(p: { category?: string }) {
  const cat = String(p?.category ?? "").toLowerCase();
  if (cat.includes("drink") || cat.includes("beverage")) return "🥤";
  if (cat.includes("dessert")) return "🍰";
  if (cat.includes("snack")) return "🥪";
  return "🍔";
}
