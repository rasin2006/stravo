import React, { useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { LatLngBounds } from 'leaflet';
import L from 'leaflet';
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

function pinFill(pin, selected) {
  if (selected) return '#2563EB';
  if (pin.isInteresting === true) return '#16A34A';
  if (pin.isInteresting === false) return '#DC2626';
  return '#64748B';
}

function createPinIcon(pin, selected) {
  const fill = pinFill(pin, selected);
  const stroke = selected ? '#1D4ED8' : '#FFFFFF';

  return L.divIcon({
    className: '',
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="34" height="42" viewBox="0 0 34 42" aria-hidden="true">
      <path d="M17 0C8.82 0 2.5 6.32 2.5 14.5c0 9.75 14.5 27.5 14.5 27.5S31.5 24.25 31.5 14.5C31.5 6.32 25.18 0 17 0z" fill="${fill}" stroke="${stroke}" stroke-width="2"/>
      <circle cx="17" cy="14.5" r="5.5" fill="white" fill-opacity="0.95"/>
    </svg>`,
    iconSize: [34, 42],
    iconAnchor: [17, 42],
    popupAnchor: [0, -44],
  });
}

function PinPopup({ pinIndex, pin, onRate, onRemove, onDismiss }) {
  return (
    <div className="min-w-[168px] p-1">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-foreground">Pin {pinIndex + 1}</p>
        <button
          type="button"
          onClick={onDismiss}
          className="text-xs font-semibold text-muted hover:text-foreground"
        >
          Done
        </button>
      </div>
      <p className="mb-2 text-[10px] text-muted">Drag pin to move · tap map to add more</p>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onRate(true)}
          className={`min-h-[40px] rounded-md text-xs font-semibold ${
            pin.isInteresting === true
              ? 'bg-primary text-primary-foreground'
              : 'bg-primary/15 text-primary'
          }`}
        >
          Green
        </button>
        <button
          type="button"
          onClick={() => onRate(false)}
          className={`min-h-[40px] rounded-md text-xs font-semibold ${
            pin.isInteresting === false
              ? 'bg-destructive text-white'
              : 'border border-destructive text-destructive'
          }`}
        >
          Red
        </button>
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="mt-2 w-full min-h-[36px] text-xs font-semibold text-destructive"
      >
        Remove pin
      </button>
    </div>
  );
}

function DraggablePin({
  pin,
  pinIndex,
  selected,
  readOnly,
  onSelect,
  onMove,
  onRate,
  onRemove,
  onDismiss,
}) {
  const markerRef = useRef(null);
  const icon = useMemo(() => createPinIcon(pin, selected), [pin, selected]);

  useEffect(() => {
    const marker = markerRef.current;
    if (!marker) return;
    if (selected) marker.openPopup();
    else marker.closePopup();
  }, [selected, pin.latitude, pin.longitude]);

  return (
    <Marker
      ref={markerRef}
      position={[pin.latitude, pin.longitude]}
      icon={icon}
      draggable={!readOnly}
      eventHandlers={{
        click: (e) => {
          L.DomEvent.stopPropagation(e.originalEvent);
          onSelect(pin.id);
        },
        dragstart: () => onSelect(pin.id),
        dragend: (e) => {
          const { lat, lng } = e.target.getLatLng();
          onMove(pin.id, lat, lng);
        },
      }}
    >
      {selected && (
        <Popup
          className="manual-pin-popup"
          closeButton={false}
          autoClose={false}
          closeOnClick={false}
          offset={[0, 0]}
        >
          <PinPopup
            pin={pin}
            pinIndex={pinIndex}
            onRate={onRate}
            onRemove={onRemove}
            onDismiss={onDismiss}
          />
        </Popup>
      )}
    </Marker>
  );
}

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

function FitPins({ pins, mapPaddingBottom = 100 }) {
  const map = useMap();
  const lastLen = useRef(0);

  useEffect(() => {
    if (pins.length < 1 || pins.length === lastLen.current) return;
    lastLen.current = pins.length;
    const coords = pins.map((p) => [p.latitude, p.longitude]);
    const padding = [40, 40, mapPaddingBottom, 40];
    if (coords.length === 1) {
      map.setView(coords[0], Math.max(map.getZoom(), USER_ZOOM), { animate: true });
      return;
    }
    map.fitBounds(coords, { padding, maxZoom: CAMBODIA_MAX_ZOOM });
  }, [pins, map, mapPaddingBottom]);

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

export default function ManualPinMap({
  pins,
  selectedPinId,
  onAddPin,
  onSelectPin,
  onMovePin,
  onRatePin,
  onRemovePin,
  onDismissPin,
  readOnly = false,
  mapPaddingBottom = 100,
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
        minZoom={CAMBODIA_MIN_ZOOM}
        maxNativeZoom={CAMBODIA_TILE_MAX_ZOOM}
        maxZoom={CAMBODIA_MAX_ZOOM}
        keepBuffer={1}
        updateWhenIdle
        updateWhenZooming={false}
      />
      <InitialUserZoom userLocation={userLocation} />
      <FitPins pins={pins} mapPaddingBottom={mapPaddingBottom} />
      <UserLocationLayer onLocation={onUserLocation} onError={onLocationError} />
      <LocateMeButton location={userLocation} zoom={USER_ZOOM} />
      {!readOnly && <MapClickHandler onAddPin={onAddPin} disabled={readOnly} />}
      {pathPositions.length > 1 && (
        <Polyline
          positions={pathPositions}
          pathOptions={{ color: '#2563EB', weight: 5, opacity: 0.9, dashArray: '8 6' }}
        />
      )}
      {pins.map((pin, index) => (
        <DraggablePin
          key={pin.id}
          pin={pin}
          pinIndex={index}
          selected={pin.id === selectedPinId}
          readOnly={readOnly}
          onSelect={onSelectPin}
          onMove={onMovePin}
          onRate={(value) => onRatePin(pin.id, value)}
          onRemove={() => onRemovePin(pin.id)}
          onDismiss={onDismissPin}
        />
      ))}
    </MapContainer>
  );
}
