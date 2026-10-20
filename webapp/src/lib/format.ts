/** A short, readable reference for a long record ID, e.g. shortRef("REQ", "29144646-47bc-…") -> "REQ-29144646". */
export function shortRef(prefix: string, id: string | undefined) {
  if (!id) return prefix;
  const head = id.split("-")[0] ?? id;
  return `${prefix}-${head.slice(0, 8).toUpperCase()}`;
}
