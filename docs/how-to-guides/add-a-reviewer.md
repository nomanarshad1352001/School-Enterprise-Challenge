# How to add a new reviewer (judge)

Two minutes, no developer needed.

## 1. Create their account

1. Sign in as an admin → **Admin → People**.
2. Use the "Add staff account" row: name, email, and role **Judge**.
3. They appear at the top of the people table and can sign in immediately
   (in the demo, via the persona picker; in production, via an email link).

## 2. Assign submissions to them

**Automatic (default):** new submissions are auto-assigned by region — the
reviewer list lives in `src/lib/mock.ts` (`REVIEWERS`, one constant array;
an AI tool can add a name in seconds, and in production this becomes a table).

**Manual:** open **Admin → Review**. The first card shows every reviewer with
their total queue, pending count and average turnaround time. Use the dropdown
on any pending submission to reassign it (useful when a judge goes on holiday).

## 3. Check their work is fair

- The same card's **avg. turnaround** column shows how fast each judge works.
- Every score a judge gives is appended to the submission's **audit trail**
  (visible on the reviewed page), so you can always see who scored what, when.
- Rubric changes (Admin → Review → rubric editor) affect all future scoring;
  past score events are never altered.

## 4. Remove or pause a reviewer

Suspending their account in **Admin → People** stops them signing in; their
un-reviewed submissions can be bulk-reassigned in **Admin → Review**.
