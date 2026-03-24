# DECISIONS.md

Architecture and UX decisions log.

## 2026-03-24 - Rename product to ReqLite
- Decision: desktop product name is `ReqLite`.
- Why: shorter, cleaner branding for sharing releases.
- Applied in:
- `src-tauri/tauri.conf.json` (`productName`, window title, identifier)
- release workflow naming

## 2026-03-24 - Split App into hook + memoized components
- Decision: keep `App.tsx` as thin composition layer.
- Why: reduce complexity and accidental re-render coupling.
- Implementation:
- business logic moved to `src/hooks/usePostmanLite.ts`
- UI split to `WorkspaceHeader`, `TabStrip`, `RequestPanel`, `ResponsePanel`, `JsonCodeEditor`

## 2026-03-24 - Headers input as row-form, not raw JSON
- Decision: headers edited via structured key/value rows.
- Why: better usability for cookie/token scenarios.
- Compatibility: old `headersText` from local storage is migrated in load path.

## 2026-03-24 - Stable callbacks and state access for async actions
- Decision: use `useCallback` and `tabsRef` for request operations.
- Why: avoid stale closure issues and reduce unnecessary listener rebinds.

## 2026-03-24 - Debounced localStorage writes
- Decision: tab persistence writes are delayed by short timeout.
- Why: avoid heavy write bursts during typing.
