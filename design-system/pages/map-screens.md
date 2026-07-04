# Map Screens — Page Overrides

Overrides `design-system/MASTER.md` for Record, Explore, and map-heavy views.

## Layout

- Use `useSafeAreaInsets()` for top overlays — never hardcode `top: 48`.
- Bottom sheets sit flush to the screen content area (tab bar is outside the pane).
- Map polylines: 4px default, 6px when selected; route blue `#2563EB`.

## Icons

- Tab bar: Ionicons only (`TabBarIcon` component).
- Locate control: `LocateButton` (44×44pt minimum).
- Status chips: vector icon or colored dot — no unicode bullets (`●`, `◎`).

## Interaction

- Recording banner: full-width, `colors.recording`, tappable to return to Record tab.
- Binary rating buttons: min 56pt height, thumbs-up/down icons with labels.
- Modal bottom sheet scrim: `rgba(15, 23, 42, 0.5)` (50%).

## Accessibility

- All map controls need `accessibilityRole` and descriptive `accessibilityLabel`.
- Polylines are tappable — selected segment should be announced via sheet title.
