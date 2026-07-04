# Database Schema

## Tables

- `users`
- `activities`
- `activity_points`
- `segments`
- `activity_segments`
- `segment_feedbacks`

## Spatial support

- `start_location` and `end_location` use PostGIS `geography(POINT, 4326)`.
- PostGIS enables map queries and geospatial path matching.
