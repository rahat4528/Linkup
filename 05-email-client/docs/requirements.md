# Email Client — Specifications

## 1. Executive Summary

The Email Client (`05-email-client`) is a full-featured webmail communications platform. It provides IMAP/SMTP synchronization, conversation threading based on standardized RFC email headers, draft autosaving, strict sandboxed HTML sanitization, custom labeled taxonomy, and unified mailbox folders.

---

## 2. Functional Requirements

### 2.1 Mail Provider Integrations (IMAP & SMTP)
- **SMTP Sending**: Send email with multi-recipient targeting (`to`, `cc`, `bcc`), subject, plaintext, sanitized HTML body, attachments, and thread reference headers (`In-Reply-To`, `References`).
- **IMAP Ingestion**: Synchronize incoming messages into local database storage with date-based incremental polling (`since`).

### 2.2 Standardized Conversation Threading
- **RFC 2822 / 5322 Thread Topology**:
  - Direct reply chaining via `In-Reply-To` and `References` headers.
  - Subject normalization: strip leading prefixes (`Re:`, `RE:`, `Fwd:`, `FW:`, `[EXTERNAL]`).
  - Messages sharing the same conversation chain are grouped into a single unified thread.

### 2.3 Folders & Custom Labels
- **System Folders**: `INBOX`, `SENT`, `DRAFTS`, `TRASH`, `SPAM`, `STARRED`, `ARCHIVE`.
- **Custom Labels**: User-defined colored tags (e.g. `Work`, `Finance`, `Personal`) that can be applied independently of folders.
- **Actions**: Mark as read/unread, star/unstar, archive, move to trash/spam.

### 2.4 Rich Draft Composer & Autosave
- **Autosave Engine**: Client autosaves draft mutations every few seconds or on keystroke pause.
- **Draft Versioning**: Updating a draft replaces previous draft content atomically without spawning orphan records.

### 2.5 Sandboxed HTML Email Sanitization & Privacy
- **HTML Sanitization**: All incoming HTML email content is stripped of dangerous elements (`<script>`, `<iframe>`, `<object>`, `<embed>`, inline event handlers like `onload`, `onerror`).
- **External Resource Proxying/Blocking**: External images (`<img src="http...">`) are blocked by default to prevent tracking pixels, with a user prompt to explicitly unblock images.

### 2.6 Full-Text Email Search
- Fast keyword search matching against sender, recipient, subject, body content, and applied labels.
