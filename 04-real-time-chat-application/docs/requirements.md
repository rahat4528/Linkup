# Real-Time Chat Application — Specifications

## 1. Executive Summary

The Real-Time Chat Application (`04-real-time-chat-application`) is a high-performance instant messaging system providing real-time peer-to-peer and multi-participant communication. It guarantees message delivery, ordered conversation streams, delivery/read receipts, presence/typing indicators, group role administration, and message search.

---

## 2. Functional Requirements

### 2.1 Real-Time Messaging & Reconnection Catch-Up
- **Handshake Authentication**: WebSocket connections must present valid JWT tokens at handshake.
- **Message Delivery Lifecycle**:
  - `SENT`: Server acknowledged and saved message to persistent store.
  - `DELIVERED`: Delivered to recipient's active socket or push queue.
  - `READ`: Marked read by recipient upon viewing conversation.
- **Reconnection Catch-Up**: Clients reconnecting after drops can supply a `since` timestamp or cursor to fetch all missed messages in order.

### 2.2 Ephemeral State Management (Redis)
- **Presence**: Track online/offline status with automated heartbeat timeouts (e.g. 60-second TTL).
- **Typing Indicators**: Ephemeral typing notifications automatically expiring after 5 seconds of inactivity.

### 2.3 Group Conversations & Role-Based Administration
- **Conversation Types**: `DIRECT` (1:1) and `GROUP` (multi-participant).
- **Roles in Groups**:
  - `OWNER` / `ADMIN`: Can add/remove members, update group title/avatar, promote/demote admins, or transfer ownership.
  - `MEMBER`: Can send messages, view participants, leave group.
- **System Events**: Group actions emit system audit events (`MEMBER_JOINED`, `MEMBER_REMOVED`, `ROLE_CHANGED`).

### 2.4 Rich Messaging & Reactions
- **Message Editing**: Authors can edit messages; edits append an `(edited)` flag.
- **Soft Deletion**: Message content replaced with `This message was deleted` tombstone; preserves timeline sequence.
- **Emoji Reactions**: Users can react with emojis (e.g. 👍, ❤️, 😂, 🎉); reactions aggregate into counts with reactor IDs.
- **Full-Text Message Search**: Search messages across all user's conversations with keyword filtering.

---

## 3. Data Integrity & Authorization

- Every room join and message dispatch is verified on the server: a user cannot send or read messages in a conversation they are not an active member of.
- Idempotent message delivery via client-generated `clientMessageId`.
