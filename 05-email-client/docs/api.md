# Email Client — API Reference

## 1. Authentication
- `POST /api/auth/register` — Create user account.
- `POST /api/auth/login` — Authenticate and receive JWT.

## 2. Emails & Threads
- `GET /api/emails` — List threads/emails by folder (`folder=INBOX|SENT|DRAFTS|TRASH|SPAM|STARRED|ARCHIVE`) or label (`labelId`).
- `GET /api/threads/:threadId` — Retrieve all messages in a conversation thread in chronological order.
- `POST /api/emails/send` — Send email via SMTP adapter.
- `PATCH /api/emails/:id/star` — Toggle starred status.
- `PATCH /api/emails/:id/read` — Toggle read/unread status.
- `PATCH /api/emails/:id/folder` — Move email to folder (`INBOX`, `ARCHIVE`, `TRASH`, `SPAM`).

## 3. Drafts
- `POST /api/drafts` — Create or autosave a draft.
- `GET /api/drafts/:id` — Retrieve draft.
- `DELETE /api/drafts/:id` — Discard draft.

## 4. Labels
- `GET /api/labels` — List user's custom labels.
- `POST /api/labels` — Create new label (name, color).
- `POST /api/emails/:id/labels` — Assign label to email.
- `DELETE /api/emails/:id/labels/:labelId` — Remove label from email.

## 5. Search
- `GET /api/search?q={query}` — Full-text search across subject, sender, body, and labels.
