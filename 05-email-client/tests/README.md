# Email Client Test Matrix

This directory orchestrates automated tests for RFC 5322 conversation threading, HTML sanitization, IMAP/SMTP mail provider integration, draft autosaving, and folder/label taxonomy.

## Test Suites

| Suite | Category | Focus |
|---|---|---|
| `conversation-threading.spec.ts` | Unit | RFC threading via `In-Reply-To`, `References`, and normalized Subject |
| `html-sanitizer.spec.ts` | Unit | XSS tag stripping (`<script>`, inline handlers) and external image blocking |
| `draft-autosave.spec.ts` | Unit | Draft atomic updates without duplication, draft discard cleanups |
| `mail-adapter.spec.ts` | Integration | SMTP dispatch contracts, IMAP date-based mail fetching |
| `email-lifecycle.spec.ts` | Integration | End-to-end send, star/unstar, read/unread, move to folder, thread views |
| `labels-folders.spec.ts` | Integration | Custom label creation, thread assignment, filtering by labelId |
| `search-filtering.spec.ts` | Integration | Full-text search across subject, sender, body text, and labels |

## Running Tests

From this directory:
```bash
npm test
```

Or from `backend`:
```bash
cd ../backend && npm test
```
