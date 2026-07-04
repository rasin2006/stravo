# Record Page Overrides

Inherits from `MASTER.md`.

## Layout

- Full-screen map as canvas
- Floating bottom sheet for title + stats (never scroll-to-record)
- Amber FAB (idle) / green pill (recording) centered above tab bar
- GPS signal indicator top-right

## Map

- `react-native-maps` with user location enabled
- Live polyline in route blue (`#2563EB`) while recording
- Terrain or standard map type

## Stats bar

Show: distance (km), duration (mm:ss), recording dot — not raw point count.
