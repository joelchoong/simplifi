# MyTax Next Steps

Last updated: 2026-06-15

## Current State

The MyTax section now has a working planner UI with:

- Year of Assessment switching.
- Relief categories and sub-items based on HASiL relief schedules.
- Receipt upload flow with a confirmation/edit modal.
- Receipt listing, preview, delete and export actions.
- Supabase persistence code for `tax_receipts` and private `receipts` storage.
- A daily GitHub Actions keep-alive workflow for Supabase.

## Immediate Setup

1. Apply the Supabase migration.

   Migration file:

   ```text
   supabase/migrations/20260613000000_create_tax_receipts.sql
   ```

   Expected result:

   - `public.tax_receipts` table exists.
   - `receipts` storage bucket exists and is private.
   - RLS policies allow authenticated users to access only their own rows.
   - Storage policies allow authenticated users to access only files under their own `user_id/` folder.

2. Confirm GitHub Actions keep-alive is enabled.

   Workflow file:

   ```text
   .github/workflows/supabase-keepalive.yml
   ```

   Expected result:

   - Runs daily at 12:10 AM Malaysia time.
   - Can also be run manually through GitHub Actions.
   - Uses anon/public key only, so RLS remains enforced.

3. Add or verify GitHub repository secrets.

   Recommended secrets:

   ```text
   SUPABASE_URL
   SUPABASE_ANON_KEY
   ```

   The workflow has public fallbacks, but secrets are better if keys are rotated later.

## Persistence Work

1. Verify receipt upload end to end.

   Acceptance criteria:

   - Upload a receipt.
   - Confirm category, sub-item and amount.
   - Refresh the page.
   - Receipt still appears in the receipt list.
   - Category totals still include the saved receipt.
   - Preview opens from Supabase signed URL.
   - Delete removes both the database row and storage file.

2. Decide whether manual `+ add` claims should persist.

   Current behavior:

   - Receipt-backed claims persist through `tax_receipts`.
   - Auto-calculated claims persist implicitly from profile income/age.
   - Manual `+ add` entries without uploaded receipts are local UI state only.

   Recommended next step:

   - Add a `tax_claim_entries` table for manual claims that do not have documents yet.
   - Link entries by `user_id`, `tax_year`, `category_id`, `sub_item_id`.
   - Optional: allow entries to be later attached to a receipt.

3. Add save state clarity.

   Acceptance criteria:

   - Receipt confirmation button shows saving state.
   - Failed storage upload shows a user-friendly error.
   - Failed database insert cleans up uploaded storage file if possible.
   - The receipt list has a loading state during initial fetch.

## OCR And Categorisation

1. Replace filename-based detection with real document parsing.

   Current behavior:

   - Category and amount are guessed from the filename.

   Recommended next step:

   - Extract text from PDFs/images.
   - Detect merchant, amount, receipt date and likely relief sub-item.
   - Keep the confirmation modal as the human review step.

2. Store OCR metadata.

   Use the existing `metadata jsonb` column in `tax_receipts`.

   Suggested fields:

   ```json
   {
     "merchant": "Example Clinic",
     "receipt_date": "2026-02-14",
     "detected_amount": 120,
     "detected_category_id": "medical",
     "detected_sub_item_id": "medical_dental",
     "confidence": 0.82,
     "raw_text": "..."
   }
   ```

3. Show confidence in the modal.

   Acceptance criteria:

   - High-confidence matches are preselected quietly.
   - Low-confidence matches show a subtle review hint.
   - Users can always override category and amount.

## Claims And Caps

1. Enforce category and sub-item caps consistently.

   Acceptance criteria:

   - Receipt amount can exceed the relief cap, but applied relief is capped.
   - UI shows receipt amount and claimable amount separately where needed.
   - Parent category caps and sub-limits are both respected.

2. Improve children and per-child relief handling.

   Current behavior:

   - Per-child categories are represented as sub-items with limits.

   Recommended next step:

   - Add quantity support for per-child claims.
   - Example: `2 children x RM2,000 = RM4,000`.

3. Separate tax relief amount from receipt amount.

   Recommended schema change:

   - Keep `amount` as receipt/document amount.
   - Add `claim_amount` for the amount applied to relief.

## Security And Privacy

1. Confirm RLS in Supabase dashboard.

   Acceptance criteria:

   - Anonymous users cannot read `tax_receipts`.
   - User A cannot read User B rows.
   - User A cannot create signed URLs for User B files.
   - Storage bucket remains private.

2. Avoid service-role keys in the frontend or GitHub Actions keep-alive.

   Keep-alive should use only:

   ```text
   SUPABASE_ANON_KEY
   ```

3. Add a small privacy note inside the receipt modal or receipts sheet.

   Suggested copy:

   ```text
   Receipts are stored privately and are only accessible from your account.
   ```

## UX Polish

1. Remove any duplicate year indicators.

   Goal:

   - Keep one clear year selector.
   - Avoid repeating `YA 2025 HASiL` beside another year selector.

2. Standardise icon styling.

   Goal:

   - All category icons use the same visual treatment.
   - Prefer neutral icon containers with category colour used for progress or values only.

3. Make the receipt list easier to scan.

   Suggested improvements:

   - Group by relief category.
   - Add amount totals per category.
   - Add search by merchant/file name.
   - Add filters for unreviewed, reviewed and exported.

## Testing Checklist

Manual test cases:

- New user with no receipts sees empty state.
- User uploads image receipt and confirms it.
- User uploads PDF receipt and previews it.
- User changes category after upload and saves changes.
- User deletes receipt and refreshes page.
- User exports receipts zip.
- User switches between YA 2025 and YA 2024.
- User cannot see another user's receipts.

Automated test ideas:

- Unit test cap calculations.
- Unit test filename/OCR categorisation fallback.
- Integration test `ApiService.tax` mapping.
- Component test receipt confirmation modal state.

## Suggested Implementation Order

1. Apply and verify Supabase migration.
2. Confirm upload, reload, preview and delete work in production.
3. Add manual claim persistence table.
4. Add receipt amount versus claim amount separation.
5. Add OCR extraction and metadata storage.
6. Add polish: filters, grouping, consistent icon treatment and privacy copy.
