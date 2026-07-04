import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, CircleMarker, useMap, useMapEvents } from 'react-leaflet';
import { LatLngBounds } from 'leaflet';
import 'leaflet/dist/leaflet.css';
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

function FitPins({ pins }) {
  const map = useMap();
  const lastLen = useRef(0);

  useEffect(() => {
    if (pins.length < 1 || pins.length === lastLen.current) return;
    lastLen.current = pins.length;
    const coords = pins.map((p) => [p.latitude, p.longitude]);
    if (coords.length === 1) {
      map.setView(coords[0], Math.max(map.getZoom(), USER_ZOOM), { animate: true });
      return;
    }
    map.fitBounds(coords, { padding: [100, 100], maxZoom: CAMBODIA_MAX_ZOOM });
  }, [pins, map]);

  return null;
}

function MapClickHandler({ onAddPin, disabled }) {
  useMapEvents({
    click(e) {
      if (disabled) return;
      onAddPin({ latitude: e.latlng.lat, longitude: e.latlng.lng });
    },
  });
  return null;
}

function pinColor(pin, selectedId) {
  if (pin.id === selectedId) return { color: '#2563EB', fillColor: '#3B82F6' };
  if (pin.isInteresting === true) return { color: '#16A34A', fillColor: '#22C55E' };
  if (pin.isInteresting === false) return { color: '#DC2626', fillColor: '#EF4444' };
  return { color: '#64748B', fillColor: '#94A3B8' };
}

export default function ManualPinMap({
  pins,
  selectedPinId,
  onAddPin,
  onSelectPin,
  readOnly = false,
  userLocation,
  onUserLocation,
  onLocationError,
}) {
  const center = userLocation
    ? [userLocation.latitude, userLocation.longitude]
    : [CAMBODIA_CENTER.latitude, CAMBODIA_CENTER.longitude];
  const zoom = userLocation ? USER_ZOOM : CAMBODIA_MIN_ZOOM;
  const pathPositions = pins.map((p) => [p.latitude, p.longitude]);

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      minZoom={CAMBODIA_MIN_ZOOM}
      maxZoom={CAMBODIA_MAX_ZOOM}
      maxBounds={cambodiaBounds}
      maxBoundsViscosity={1}
      className="relative h-full w-full cursor-crosshair"
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
      <InitialUserZoom userLocation={userLocation} />
      <FitPins pins={pins} />
      <UserLocationLayer onLocation={onUserLocation} onError={onLocationError} />
      <LocateMeButton location={userLocation} zoom={USER_ZOOM} />
      {!readOnly && <MapClickHandler onAddPin={onAddPin} disabled={readOnly} />}
      {pathPositions.length > 1 && (
        <Polyline
          positions={pathPositions}
          pathOptions={{ color: '#2563EB', weight: 5, opacity: 0.9, dashArray: '8 6' }}
        />
      )}
      {pins.map((pin) => {
        const { color, fillColor } = pinColor(pin, selectedPinId);
        return (
          <CircleMarker
            key={pin.id}
            center={[pin.latitude, pin.longitude]}
            radius={12}
            pathOptions={{
              color,
              fillColor,
              fillOpacity: 0.9,
              weight: 2,
            }}
            eventHandlers={{
              click: (e) => {
                e.originalEvent.stopPropagation();
                onSelectPin?.(pin.id);
              },
            }}
          />
        );
      })}
    </MapContainer>
  );
}
