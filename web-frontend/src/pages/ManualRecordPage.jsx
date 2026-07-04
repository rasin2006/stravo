import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ManualPinMap from '../components/ManualPinMap';
import Button from '../components/ui/Button';
import { uploadActivity } from '../services/api';
import { getToken, isLoggedIn, login, register, logout } from '../services/auth';
import {
  formatDistance,
  pathDistanceMeters,
  pinsToUploadPoints,
  pinPlaceFeedback,
} from '../utils/mapUtils';
import { isValidIdentifier } from '../utils/authIdentifier';

function createPin(latitude, longitude) {
  return {
    id: `pin-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    latitude,
    longitude,
    isInteresting: null,
  };
}

function TrailControls({
  title,
  onTitleChange,
  pins,
  distance,
  locationError,
  message,
  uploading,
  loggedIn,
  authMode,
  name,
  identifier,
  password,
  authError,
  authLoading,
  onUndoLast,
  onClear,
  onUpload,
  onAuthModeChange,
  onNameChange,
  onIdentifierChange,
  onPasswordChange,
  onAuthSubmit,
  onExplore,
  showAuth,
}) {
  return (
    <div className="flex flex-col gap-3">
      <input
        type="text"
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        placeholder="Trail name"
        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm font-semibold text-foreground outline-none placeholder:text-muted focus:ring-2 focus:ring-primary"
      />

      <div className="flex flex-wrap gap-2 text-sm">
        <span className="rounded-pill bg-background px-3 py-1 font-semibold text-foreground">
          {pins.length} pin{pins.length === 1 ? '' : 's'}
        </span>
        <span className="rounded-pill bg-background px-3 py-1 font-semibold text-foreground">
          {formatDistance(distance)}
        </span>
      </div>

      {locationError && <p className="text-xs text-destructive">Location: {locationError}</p>}

      <p className="text-sm text-muted">
        Tap the map to drop pins. Drag a pin to move it — a rating popup appears above the
        selected pin.
      </p>

      <div className="grid grid-cols-3 gap-2">
        <Button variant="outline" disabled={pins.length === 0 || uploading} onClick={onUndoLast}>
          Undo
        </Button>
        <Button variant="outline" disabled={pins.length === 0 || uploading} onClick={onClear}>
          Clear
        </Button>
        <Button disabled={pins.length < 2 || uploading} onClick={onUpload}>
          {uploading ? '…' : 'Upload'}
        </Button>
      </div>

      {message && <p className="text-sm text-muted">{message}</p>}

      {message.startsWith('Uploaded') && (
        <button
          type="button"
          onClick={onExplore}
          className="min-h-[44px] text-sm font-semibold text-primary"
        >
          Explore community trails →
        </button>
      )}

      {showAuth && (
        <div className="border-t border-border pt-3">
          <div className="mb-3 flex rounded-lg bg-background p-1">
            <button
              type="button"
              onClick={() => onAuthModeChange('login')}
              className={`flex-1 min-h-[40px] rounded-md py-1.5 text-xs font-semibold ${
                authMode === 'login' ? 'bg-surface text-primary shadow-sm' : 'text-muted'
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => onAuthModeChange('register')}
              className={`flex-1 min-h-[40px] rounded-md py-1.5 text-xs font-semibold ${
                authMode === 'register' ? 'bg-surface text-primary shadow-sm' : 'text-muted'
              }`}
            >
              Register
            </button>
          </div>
          <form onSubmit={onAuthSubmit} className="space-y-2">
            {authMode === 'register' && (
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => onNameChange(e.target.value)}
                required
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            )}
            <input
              type="text"
              placeholder="Email or phone"
              value={identifier}
              onChange={(e) => onIdentifierChange(e.target.value)}
              autoComplete="username"
              required
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              required
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
            {authError && <p className="text-xs text-destructive">{authError}</p>}
            <button
              type="submit"
              disabled={authLoading}
              className="w-full min-h-[44px] rounded-pill bg-primary py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
            >
              {authLoading ? 'Please wait…' : authMode === 'register' ? 'Create account' : 'Sign in'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default function ManualRecordPage() {
  const navigate = useNavigate();
  const [pins, setPins] = useState([]);
  const [selectedPinId, setSelectedPinId] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [title, setTitle] = useState('Manual trail');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [locationError, setLocationError] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());
  const [authMode, setAuthMode] = useState('login');
  const [name, setName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const distance = pathDistanceMeters(pins);

  useEffect(() => {
    function handleUnauthorized() {
      setLoggedIn(false);
      setMessage('Your session expired. Sign in again to upload.');
    }
    window.addEventListener('stravo:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('stravo:unauthorized', handleUnauthorized);
  }, []);

  function handleAddPin({ latitude, longitude }) {
    const pin = createPin(latitude, longitude);
    setPins((prev) => [...prev, pin]);
    setSelectedPinId(pin.id);
    setMessage('');
  }

  function handleUndoLast() {
    setPins((prev) => {
      const next = prev.slice(0, -1);
      if (selectedPinId && !next.some((pin) => pin.id === selectedPinId)) {
        setSelectedPinId(next[next.length - 1]?.id ?? null);
      }
      return next;
    });
    setMessage('');
  }

  function handleClear() {
    if (pins.length === 0) return;
    if (!window.confirm('Clear all pins?')) return;
    setPins([]);
    setSelectedPinId(null);
    setMessage('');
  }

  function handleRatePin(pinId, isInteresting) {
    setPins((prev) =>
      prev.map((pin) => (pin.id === pinId ? { ...pin, isInteresting } : pin))
    );
  }

  function handleMovePin(pinId, latitude, longitude) {
    setPins((prev) =>
      prev.map((pin) => (pin.id === pinId ? { ...pin, latitude, longitude } : pin))
    );
  }

  function handleRemovePin(pinId) {
    setPins((prev) => prev.filter((pin) => pin.id !== pinId));
    if (selectedPinId === pinId) setSelectedPinId(null);
  }

  async function handleAuthSubmit(e) {
    e.preventDefault();
    setAuthError('');
    if (!isValidIdentifier(identifier)) {
      setAuthError('Enter a valid email or phone number');
      return;
    }
    setAuthLoading(true);
    try {
      if (authMode === 'register') {
        await register(name, identifier, password);
      } else {
        await login(identifier, password);
      }
      setLoggedIn(true);
      setMessage('');
    } catch (err) {
      setAuthError(err.response?.data?.message || err.message);
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleUpload() {
    if (pins.length < 2) {
      setMessage('Drop at least two pins to create a trail.');
      setPanelOpen(true);
      return;
    }
    if (!getToken()) {
      setMessage('Sign in below to upload your trail.');
      setPanelOpen(true);
      return;
    }

    setUploading(true);
    setMessage('');
    try {
      const points = pinsToUploadPoints(pins);
      const placeFeedback = pinPlaceFeedback(pins);
      const activity = await uploadActivity(
        title.trim() || 'Untitled manual trail',
        points,
        placeFeedback
      );
      setMessage(
        `Uploaded "${activity.title}" with ${activity.activitySegments?.length ?? 0} segments from ${pins.length} pins.`
      );
      setPins([]);
      setSelectedPinId(null);
      setPanelOpen(true);
    } catch (err) {
      setMessage(err.response?.data?.message || err.message);
      setPanelOpen(true);
    } finally {
      setUploading(false);
    }
  }

  const controlProps = {
    title,
    onTitleChange: setTitle,
    pins,
    distance,
    locationError,
    message,
    uploading,
    loggedIn,
    authMode,
    name,
    identifier,
    password,
    authError,
    authLoading,
    onUndoLast: handleUndoLast,
    onClear: handleClear,
    onUpload: handleUpload,
    onAuthModeChange: (mode) => {
      setAuthMode(mode);
      setAuthError('');
    },
    onNameChange: setName,
    onIdentifierChange: setIdentifier,
    onPasswordChange: setPassword,
    onAuthSubmit: handleAuthSubmit,
    onExplore: () => navigate('/explore'),
    showAuth: !loggedIn && pins.length >= 2,
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="flex shrink-0 items-center justify-between border-b border-border bg-surface px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-sm font-medium text-primary hover:underline">
            Home
          </Link>
          <Link to="/record" className="text-sm font-medium text-primary hover:underline">
            GPS record
          </Link>
          <h1 className="font-display text-lg font-bold text-foreground sm:text-xl">
            Manual pins
          </h1>
        </div>
        {loggedIn ? (
          <button
            type="button"
            onClick={() => {
              logout();
              setLoggedIn(false);
            }}
            className="min-h-[44px] text-sm font-semibold text-primary"
          >
            Sign out
          </button>
        ) : (
          <span className="text-xs text-muted">Sign in to upload</span>
        )}
      </header>

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <div className="relative min-h-0 flex-1">
          <ManualPinMap
            pins={pins}
            selectedPinId={selectedPinId}
            onAddPin={handleAddPin}
            onSelectPin={setSelectedPinId}
            onMovePin={handleMovePin}
            onRatePin={handleRatePin}
            onRemovePin={handleRemovePin}
            onDismissPin={() => setSelectedPinId(null)}
            userLocation={userLocation}
            onUserLocation={setUserLocation}
            onLocationError={setLocationError}
            mapPaddingBottom={panelOpen ? 280 : 72}
          />

          {/* Mobile: compact bottom bar + collapsible panel */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1001] md:hidden">
            <div className="pointer-events-auto border-t border-border bg-surface/95 shadow-sheet backdrop-blur-sm">
              <button
                type="button"
                onClick={() => setPanelOpen((open) => !open)}
                className="flex w-full items-center justify-between gap-3 px-4 py-3"
              >
                <div className="min-w-0 text-left">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {title || 'Manual trail'}
                  </p>
                  <p className="text-xs text-muted">
                    {pins.length} pin{pins.length === 1 ? '' : 's'} · {formatDistance(distance)}
                  </p>
                </div>
                <span className="shrink-0 text-xs font-semibold text-primary">
                  {panelOpen ? 'Hide ▾' : 'Trail ▴'}
                </span>
              </button>

              {panelOpen && (
                <div className="max-h-[40vh] overflow-y-auto border-t border-border px-4 pb-4 pt-3">
                  <TrailControls {...controlProps} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Desktop: fixed sidebar — never covers the map */}
        <aside className="hidden w-80 shrink-0 overflow-y-auto border-l border-border bg-surface p-4 md:block">
          <TrailControls {...controlProps} />
        </aside>
      </div>
    </div>
  );
}
