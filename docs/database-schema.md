# Database Schema

Sequelize models in `backend/src/models/` are the source of truth. Run `npm start` in `backend/` to sync tables locally (SQLite) or against Postgres via `DATABASE_URL`.

Reference SQL for Postgres is in [`schema.sql`](schema.sql).

## Tables

| Table | Purpose |
|-------|---------|
| `users` | Accounts (email/phone stored in `email` column) |
| `activities` | Recorded trail metadata |
| `activity_points` | Raw GPS points per activity |
| `activity_segments` | ~100m path chunks with GeoJSON `segmentPath` |
| `segment_feedbacks` | Binary ratings (`isInteresting`) per user per segment |

## Spatial data

- Production stores segment geometry as GeoJSON in `activity_segments.segment_path` (TEXT).
- `activities.start_location` is stored as a `"lat,lng"` string.
- PostGIS is optional for future spatial queries; see `docs/deployment.md` to enable the extension.

## Migrations

Legacy SQL files under `database/migrations/` are archived. Do not run them against the current app — they describe an older schema with predefined `segments` tables.
