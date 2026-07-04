import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, useMap } from 'react-leaflet';
import { LatLngBounds } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getSegmentScoreColor } from '../utils/mapUtils';
import UserLocationLayer, { LocateMeButton } from './UserLocationLayer';
import {
  CAMBODIA_CENTER,
  CAMBODIA_LEAFLET_BOUNDS,
  CAMBODIA_MIN_ZOOM,
  CAMBODIA_MAX_ZOOM,
} from '../config/cambodia';

const cambodiaBounds = new LatLngBounds(
  CAMBODIA_LEAFLET_BOUNDS[0],
  CAMBODIA_LEAFLET_BOUNDS[1]
);

function MapOverlays({ userLocation, onUserLocation, onLocationError }) {
  return (
    <>
      <UserLocationLayer onLocation={onUserLocation} onError={onLocationError} />
      <LocateMeButton location={userLocation} />
    </>
  );
}

function FitBounds({ segments, selectedId }) {
  const map = useMap();

  useEffect(() => {
    const coords = segments.flatMap((s) => {
      const path = s.segmentPath;
      if (!path?.coordinates) return [];
      return path.coordinates.map(([lng, lat]) => [lat, lng]);
    });

    if (coords.length > 0) {
      map.fitBounds(coords, { padding: [40, 40], maxZoom: CAMBODIA_MAX_ZOOM });
    }
  }, [segments, map]);

  useEffect(() => {
    if (!selectedId) return;
    const segment = segments.find((s) => s.id === selectedId);
    const path = segment?.segmentPath;
    if (!path?.coordinates?.length) return;
    const coords = path.coordinates.map(([lng, lat]) => [lat, lng]);
    map.fitBounds(coords, { padding: [80, 80], maxZoom: CAMBODIA_MAX_ZOOM });
  }, [selectedId, segments, map]);

  return null;
}

export default function SegmentMap({ segments, selectedId, onSelect, userLocation, onUserLocation, onLocationError }) {
  return (
    <MapContainer
      center={[CAMBODIA_CENTER.latitude, CAMBODIA_CENTER.longitude]}
      zoom={CAMBODIA_MIN_ZOOM}
      minZoom={CAMBODIA_MIN_ZOOM}
      maxZoom={CAMBODIA_MAX_ZOOM}
      maxBounds={cambodiaBounds}
      maxBoundsViscosity={1}
      className="relative h-full w-full"
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        bounds={cambodiaBounds}
        keepBuffer={1}
        updateWhenIdle
        updateWhenZooming={false}
      />
      <FitBounds segments={segments} selectedId={selectedId} />
      <MapOverlays
        userLocation={userLocation}
        onUserLocation={onUserLocation}
        onLocationError={onLocationError}
      />
      {segments.map((segment) => {
        const path = segment.segmentPath;
        if (!path?.coordinates?.length) return null;
        const positions = path.coordinates.map(([lng, lat]) => [lat, lng]);
        const isSelected = selectedId === segment.id;
        return (
          <Polyline
            key={segment.id}
            positions={positions}
            pathOptions={{
              color: getSegmentScoreColor(segment),
              weight: isSelected ? 6 : 4,
              opacity: 0.9,
            }}
            eventHandlers={{
              click: () => onSelect(segment),
            }}
          />
        );
      })}
    </MapContainer>
  );
}
