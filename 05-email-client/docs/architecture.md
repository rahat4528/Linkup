# Email Client — Architecture

## 1. System Overview

```
[ Next.js Client ] <---> [ Express API Gateway ]
                                │
        ┌───────────────────────┼────────────────────────┐
        ▼                       ▼                        ▼
 [ IMAP / SMTP ]       [ PostgreSQL 16 ]           [ Redis 7 ]
 GreenMail Server      - Threads & Messages        - Fast Caching
 or Live Mail Host     - Folders & Labels          - Draft Lock TTL
                       - Drafts & Attachments
```

---

## 2. Threading Resolution Algorithm

When a message is received or created:
1. Normalize subject:
   `normalized = subject.replace(/^(re|fwd|fw):\s*/i, '').trim()`
2. Check `In-Reply-To` and `References` headers against existing message IDs.
3. If an existing message matches any reference, assign the new message to that message's `threadId`.
4. If no reference matches, search for an existing thread sharing the same `normalizedSubject` and participants.
5. If no match is found, allocate a new `threadId`.
