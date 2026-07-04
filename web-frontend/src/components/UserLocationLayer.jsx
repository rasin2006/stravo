import { useEffect, useState } from 'react';
import { Circle, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';

function createUserIcon() {
  return L.divIcon({
    className: '',
    html: '<div style="width:16px;height:16px;border-radius:50%;background:#2563EB;border:3px solid white;box-shadow:0 0 6px rgba(0,0,0,0.35)"></div>',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

export default function UserLocationLayer({ onLocation, onError }) {
  const [location, setLocation] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      onError?.('Geolocation is not supported in this browser');
      return undefined;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const next = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        };
        setLocation(next);
        onLocation?.(next);
      },
      (err) => onError?.(err.message),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [onLocation, onError]);

  if (!location) return null;

  return (
    <>
      <Marker position={[location.latitude, location.longitude]} icon={createUserIcon()} />
      <Circle
        center={[location.latitude, location.longitude]}
        radius={Math.min(location.accuracy || 30, 100)}
        pathOptions={{ color: '#2563EB', fillColor: '#2563EB', fillOpacity: 0.12, weight: 1 }}
      />
    </>
  );
}

export function LocateMeButton({ location }) {
  const map = useMap();

  if (!location) return null;

  return (
    <button
      type="button"
      onClick={() =>
        map.setView([location.latitude, location.longitude], Math.max(map.getZoom(), 14), {
          animate: true,
        })
      }
      className="absolute right-4 top-4 z-[1000] rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold text-primary shadow-card"
    >
      My location
    </button>
  );
}
