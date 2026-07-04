# Architecture

Stravo is designed as a three-tier application:

- Mobile app: React Native client for rural path recording, map navigation, and feedback.
- Web frontend: React web portal for exploring paths, activity history, and segment analytics.
- Backend API: Node.js/Express service with PostgreSQL/PostGIS for spatial data and feedback aggregation.

Key concepts:

- Activities represent recorded user trails.
- Segments represent reusable rural path sections.
- Feedback drives segment scoring and discovery.
