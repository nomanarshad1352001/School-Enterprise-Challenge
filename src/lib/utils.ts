/* Small shared helpers: downloads, CSV building and formatting.
   All client-side, so exports work even on flaky connections. */

/** Trigger a browser download of any text content. */
export function downloadText(filename: string, content: string, mime = "text/plain") {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 800);
}

/** Convert an array of flat objects into CSV text. */
export function toCSV(rows: Record<string, unknown>[]): string {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const esc = (v: unknown) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [headers.join(",")];
  for (const r of rows) lines.push(headers.map((h) => esc(r[h])).join(","));
  return lines.join("\n");
}

/** Generate a realistic (dummy) document body for evidence downloads. */
export function dummyDoc(title: string, meta: Record<string, string>): string {
  const lines = Object.entries(meta).map(([k, v]) => `${k.padEnd(16, " ")}: ${v}`);
  return [
    "SCHOOL ENTERPRISE CHALLENGE",
    "=======================",
    "",
    title,
    "",
    ...lines,
    "",
    "— Demo build: this file was generated in the browser. —",
  ].join("\n");
}

const NF = new Intl.NumberFormat("en-GB");

export const fmtNum = (n: number) => NF.format(n);

export const fmtDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
};

let idCounter = 0;
export const uid = (prefix = "id") => `${prefix}-${Date.now().toString(36)}-${(idCounter++).toString(36)}`;

/** Stable initials for avatars. */
export const initials = (name: string) =>
  name.split(" ").map((p) => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();

/** Very small moderation layer (Section 10): returns the matched term or null.
 *  Production would extend this list and combine it with a hosted classifier —
 *  anything flagged also lands in the human review queue, never auto-hidden. */
const MODERATION_TERMS = [
  "idiot", "stupid", "hate you", "shut up", "dumb",
  "idiota", "tonto", "estúpido", "cállate", "odio",
];
export function moderationHit(text: string): string | null {
  const lower = ` ${text.toLowerCase()} `;
  return MODERATION_TERMS.find((term) => lower.includes(` ${term}`)) ?? null;
}

/** Human file sizes, e.g. "2.4 MB". */
export const fmtSize = (bytes: number) =>
  bytes >= 1_000_000 ? `${(bytes / 1_000_000).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1000))} KB`;

/** Decide the submission kind from a file. */
export function kindOfFile(file: File): "image" | "document" | "video" {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  return "document";
}

export interface CompressedImage {
  dataUrl: string;
  bytes: number; // approximate size of the compressed JPEG
  width: number;
  height: number;
}

/**
 * Compress an image IN THE BROWSER (canvas) before "upload".
 * Keeps data usage tiny on 3G — a 4 MB phone photo becomes ~20–60 KB.
 * maxDim 480 keeps enough detail for judging while staying storable.
 */
export async function compressImage(file: File, maxDim = 480, quality = 0.62): Promise<CompressedImage> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Could not read image"));
      el.src = url;
    });
    const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
    const w = Math.max(1, Math.round(img.width * scale));
    const h = Math.max(1, Math.round(img.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    canvas.getContext("2d")?.drawImage(img, 0, 0, w, h);
    const dataUrl = canvas.toDataURL("image/jpeg", quality);
    // a base64 char encodes ~0.75 bytes
    return { dataUrl, bytes: Math.round(dataUrl.length * 0.75), width: img.width, height: img.height };
  } finally {
    URL.revokeObjectURL(url);
  }
}
