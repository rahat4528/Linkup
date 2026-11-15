# Video Conferencing App - Test Suite

## Test Architecture
- **Unit Tests (`backend/tests/unit/`)**:
  - `room-manager.spec.ts`: Validates meeting room creation, direct admission, waiting room queueing, host departures and automatic host succession, and hand raising.
  - `host-controls.spec.ts`: Tests host privileges: admitting from waiting room, rejecting, remote participant muting, participant expulsion, and enforcement of non-host permission barriers.
  - `meeting-service.spec.ts`: Tests `xxx-yyyy-zzz` room code generation, WebRTC join JWT token issuing/verification, and microphone VU meter level evaluation.
- **Integration Tests (`backend/tests/integration/`)**:
  - `room-api.spec.ts`: Tests room creation, room status queries, and join token generation via supertest.
  - `device-preview-api.spec.ts`: Tests audio device test evaluation endpoint.
  - `auth-api.spec.ts`: Tests user registration, login, and authenticated profile queries.

## Execution
Run all tests:
```bash
cd backend && npm test
```
