# How to edit a milestone (no developer needed)

Milestones are data, not code. TAMTF staff manage them from the admin panel.

## Edit names, guidance, points or deadline

1. Sign in as an admin → open **Admin → Programme**.
2. Find the milestone. Edit the EN/ES name, points, or deadline inline.
3. Click **Save** — changes apply instantly to every team's Journey page.

## Reorder milestones

Use the small up/down arrows on the left of each milestone card. The horizontal
stepper on the team Journey page updates immediately.

## Open or close submissions

Flip the switch on the milestone card. Closed milestones stay visible but are
not editable by teams (they see a "locked" badge), so everyone knows what's coming.

## Change what evidence a milestone requires

Each card shows chips for what it accepts (Photos / Documents / Video link).
Editing support for these chips lives behind the same screen — ask your AI
coding tool to expose `accepts` as checkboxes (it is three lines in
`src/app/app/admin/page.tsx`).

## Change the scoring rubric for a milestone

1. Open **Admin → Review**.
2. Pick the milestone in the rubric editor dropdown.
3. Edit criterion names (EN + ES), add a criterion (max 6) or remove one.

Scores are always normalised to 100, so changing the number of criteria is safe.

## Danger zone

- Renaming a milestone does not affect past scores or history.
- Deleting a milestone mid-cycle is not allowed by design — close it instead.
