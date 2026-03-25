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

## 2026-03-24 - Guided auth helper for non-technical API testing
- Decision: keep a dedicated Bearer token field while preserving editable header rows.
- Why: managers can set auth quickly, while power users keep full header control.
- Implementation:
- Bearer token input syncs `Authorization` header automatically
- headers remain editable as key/value rows

## 2026-03-24 - Minimal-by-default request workflow
- Decision: switch to a cleaner, Insomnia-like minimal surface with progressive disclosure.
- Why: user feedback showed that too much copy and too many visible actions caused confusion.
- Implementation:
- default view now emphasizes only method, URL, send, and compact utilities
- optional complexity moved to collapsible `Body`, `Auth`, and `Headers` sections
- response area simplified to core badges (status, time, size) plus raw headers/body

## 2026-03-25 - Lazy-load CodeMirror editor runtime
- Decision: load `JsonCodeEditor` via dynamic import (`LazyJsonCodeEditor`) instead of bundling it into initial app chunk.
- Why: reduce startup JS size and avoid paying editor cost before user needs it.
- Implementation:
- `RequestPanel` and `ResponsePanel` now render `LazyJsonCodeEditor`
- response editor is mounted only when a response exists

## 2026-03-25 - Guard response auto-formatting and persistence pressure
- Decision: auto pretty-format only JSON responses up to `256KB`, and schedule tab persistence with longer debounce + idle callback.
- Why: large body parsing and frequent localStorage writes were avoidable CPU work during active typing/testing flows.
- Implementation:
- added `shouldAutoFormatResponseBody` helper in `src/lib/tab-utils.ts`
- `usePostmanLite` now applies conditional formatting and writes tabs with `700ms` debounce + `requestIdleCallback`
