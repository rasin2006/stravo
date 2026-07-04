import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, CircleMarker, useMap } from 'react-leaflet';
import { LatLngBounds } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import UserLocationLayer, { LocateMeButton } from './UserLocationLayer';
import {
  CAMBODIA_CENTER,
  CAMBODIA_LEAFLET_BOUNDS,
  CAMBODIA_MIN_ZOOM,
  CAMBODIA_TILE_MAX_ZOOM,
  CAMBODIA_MAX_ZOOM,
} from '../config/cambodia';

const cambodiaBounds = new LatLngBounds(
  CAMBODIA_LEAFLET_BOUNDS[0],
  CAMBODIA_LEAFLET_BOUNDS[1]
);

const USER_ZOOM = 16;

function InitialUserZoom({ userLocation }) {
  const map = useMap();
  const hasZoomed = useRef(false);

  useEffect(() => {
    if (!userLocation || hasZoomed.current) return;
    map.setView([userLocation.latitude, userLocation.longitude], USER_ZOOM, { animate: true });
    hasZoomed.current = true;
  }, [userLocation, map]);

  return null;
}

function FitRecordingPath({ points, isRecording }) {
  const map = useMap();
  const lastLen = useRef(0);

  useEffect(() => {
    if (points.length < 2 || points.length === lastLen.current) return;
    lastLen.current = points.length;
    if (!isRecording) return;
    const coords = points.map((p) => [p.latitude, p.longitude]);
    map.fitBounds(coords, { padding: [100, 100], maxZoom: CAMBODIA_MAX_ZOOM });
  }, [points, isRecording, map]);

  return null;
}

function placeColor(place) {
  if (place.isInteresting === true) return { color: '#16A34A', fillColor: '#22C55E' };
  if (place.isInteresting === false) return { color: '#DC2626', fillColor: '#EF4444' };
  return { color: '#D97706', fillColor: '#F59E0B' };
}

export default function RecordMap({
  points,
  places = [],
  isRecording,
  userLocation,
  onUserLocation,
  onLocationError,
}) {
  const center = userLocation
    ? [userLocation.latitude, userLocation.longitude]
    : [CAMBODIA_CENTER.latitude, CAMBODIA_CENTER.longitude];
  const zoom = userLocation ? USER_ZOOM : CAMBODIA_MIN_ZOOM;
  const pathPositions = points.map((p) => [p.latitude, p.longitude]);

  return (
    <MapContainer
      center={center}
      zoom={zoom}
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
        minZoom={CAMBODIA_MIN_ZOOM}
        maxNativeZoom={CAMBODIA_TILE_MAX_ZOOM}
        maxZoom={CAMBODIA_MAX_ZOOM}
        keepBuffer={1}
        updateWhenIdle
        updateWhenZooming={false}
      />
      <InitialUserZoom userLocation={userLocation} />
      <FitRecordingPath points={points} isRecording={isRecording} />
      <UserLocationLayer onLocation={onUserLocation} onError={onLocationError} />
      <LocateMeButton location={userLocation} zoom={USER_ZOOM} />
      {pathPositions.length > 1 && (
        <Polyline
          positions={pathPositions}
          pathOptions={{ color: '#2563EB', weight: 5, opacity: 0.9 }}
        />
      )}
      {places.map((place) => {
        const { color, fillColor } = placeColor(place);
        return (
          <CircleMarker
            key={place.id}
            center={[place.latitude, place.longitude]}
            radius={10}
            pathOptions={{
              color,
              fillColor,
              fillOpacity: 0.85,
              weight: 2,
            }}
          />
        );
      })}
    </MapContainer>
  );
}
