# PR Description

## Summary
This PR includes the remaining frontend changes for dashboard mobile UX and auth validation support.

## What changed
- Added mobile drawer protection so `mobile-bottom-bar-toggle` is only emitted on dashboard.
- Added dashboard-only FAB hide behavior when Pharma P.O.S menu opens.
- Added CSS hidden state for the FAB with `dashboard-refresh-fab--hidden`.
- Added token validation through `useTokenValidation()` before rendering protected pages.
- Improved auth token handling in `src/features/auth/api.ts` for flexible `/api/login` and `/api/set_branch` responses.
- Cleared `preBranchToken` after branch selection and ensured profile is loaded before navigation.

## Files changed
- `src/components/layout/mobile-bottom-bar.tsx`
- `src/features/auth/api.ts`
- `src/features/auth/hooks/useTokenValidation.ts`
- `src/features/auth/pages/branch-selection-page.tsx`
- `src/features/dashboard/pages/dashboard-page.tsx`
- `src/index.css`
- `DEVELOPMENT_LOG.md`

## Notes
- The branch `main` already contains these updates.
- Commit messages:
  - `docs: update development log with dashboard FAB mobile menu protection`
  - `chore: push pending feature changes including dashboard FAB and auth validation updates`

## Test
- Verified build with `npm run build` successfully.
