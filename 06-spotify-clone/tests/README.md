# Audio Catalog & Playback Test Matrix

This directory orchestrates automated tests verifying playback queue operations, Fisher-Yates shuffling, playlist position reindexing, user library collections, and catalog search.

## Test Suites

| Suite | Category | Focus |
|---|---|---|
| `queue-shuffle.spec.ts` | Unit | Queue prioritization, Up Next dequeueing, Fisher-Yates shuffle & restore |
| `repeat-modes.spec.ts` | Unit | Repeat transitions (`OFF`, `ALL`, `ONE`) |
| `playlist-reorder.spec.ts` | Unit | Deterministic playlist position reindexing on drag-and-drop / shift |
| `playback-catalog.spec.ts` | Integration | Track metadata, album ordering, and stream URL adapter resolution |
| `playlist-management.spec.ts` | Integration | End-to-end playlist creation, track addition, reorder API, track deletion |
| `user-library.spec.ts` | Integration | Like/unlike tracks, save/unsave albums |
| `search-browse.spec.ts` | Integration | Search across tracks, albums, artists; category gradient browsing |

## Running Tests

From this directory:
```bash
npm test
```

Or from `backend`:
```bash
cd ../backend && npm test
```
