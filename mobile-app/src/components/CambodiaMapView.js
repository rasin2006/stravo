import React, { forwardRef, useRef } from 'react';
import MapView from 'react-native-maps';
import {
  CAMBODIA_DEFAULT_REGION,
  CAMBODIA_MIN_ZOOM,
  CAMBODIA_MAX_ZOOM,
  clampToCambodia,
} from '../config/cambodia';

/**
 * MapView locked to Cambodia — only loads tiles for the visible country area.
 */
const CambodiaMapView = forwardRef(function CambodiaMapView(
  { initialRegion, onRegionChangeComplete, ...props },
  ref
) {
  const mapRef = useRef(null);
  const clamping = useRef(false);

  function setMapRef(node) {
    mapRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  }

  function handleRegionChangeComplete(region) {
    const clamped = clampToCambodia(region);
    const moved =
      Math.abs(clamped.latitude - region.latitude) > 0.0001 ||
      Math.abs(clamped.longitude - region.longitude) > 0.0001;

    if (moved && mapRef.current && !clamping.current) {
      clamping.current = true;
      mapRef.current.animateToRegion(clamped, 150);
      setTimeout(() => {
        clamping.current = false;
      }, 200);
    }

    onRegionChangeComplete?.(clamped);
  }

  return (
    <MapView
      ref={setMapRef}
      initialRegion={clampToCambodia(initialRegion || CAMBODIA_DEFAULT_REGION)}
      onRegionChangeComplete={handleRegionChangeComplete}
      minZoomLevel={CAMBODIA_MIN_ZOOM}
      maxZoomLevel={CAMBODIA_MAX_ZOOM}
      {...props}
    />
  );
});

export default CambodiaMapView;
