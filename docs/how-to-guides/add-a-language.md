# How to add a new language (e.g. French)

Time needed: ~20 minutes for a full platform translation. No code changes.

## Steps

1. Open `src/lib/i18n.ts`.
2. Find the `es` dictionary (it starts with `const es: Dict = {`).
3. Copy the whole `en` dictionary and paste it below `es`, renaming it to `fr`
   (see the comment at the top of the file).
4. Translate every value on the right-hand side. Keep the keys (left side)
   exactly as they are — the keys are what the code looks up. Keep any
   `{placeholders}` like `{milestone}` untouched.
5. Register the language in the same file:
   - In `LANGS`, add `{ id: "fr", label: "Français", short: "FR" }`.
   - In `STRINGS`, add your dictionary: `export const STRINGS = { en, es, fr };`
6. Open `src/lib/types.ts` and add `"fr"` to `Lang`.
   Also update `LocalText` if it has fixed `en`/`es` fields — better: keep
   translating content via the Admin → Programme editor.
7. Save and reload. The EN/ES toggle in the top bar becomes EN/ES/FR.

## Notes

- Missing keys fall back to English automatically, so you can translate
  gradually and ship safely.
- Milestone names/guidance are content, not UI: edit them per language in
  **Admin → Programme** (no file changes needed).
