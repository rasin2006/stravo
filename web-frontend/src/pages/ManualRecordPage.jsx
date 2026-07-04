import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ManualPinMap from '../components/ManualPinMap';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import BinaryRatingButtons from '../components/BinaryRatingButtons';
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

export default function ManualRecordPage() {
  const navigate = useNavigate();
  const [pins, setPins] = useState([]);
  const [selectedPinId, setSelectedPinId] = useState(null);
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

  const selectedPin = pins.find((pin) => pin.id === selectedPinId) ?? null;
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

  function handleRatePin(isInteresting) {
    if (!selectedPinId) return;
    setPins((prev) =>
      prev.map((pin) => (pin.id === selectedPinId ? { ...pin, isInteresting } : pin))
    );
  }

  function handleRemoveSelected() {
    if (!selectedPinId) return;
    setPins((prev) => prev.filter((pin) => pin.id !== selectedPinId));
    setSelectedPinId(null);
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
      return;
    }
    if (!getToken()) {
      setMessage('Sign in below to upload your trail.');
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
    } catch (err) {
      setMessage(err.response?.data?.message || err.message);
    } finally {
      setUploading(false);
    }
  }

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

      <div className="relative min-h-0 flex-1">
        <ManualPinMap
          pins={pins}
          selectedPinId={selectedPinId}
          onAddPin={handleAddPin}
          onSelectPin={setSelectedPinId}
          userLocation={userLocation}
          onUserLocation={setUserLocation}
          onLocationError={setLocationError}
        />

        <Card className="absolute bottom-4 left-4 right-4 z-[1001] mx-auto max-w-lg shadow-sheet sm:left-6 sm:right-6">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Trail name (e.g. Ridge path)"
            className="mb-3 w-full border-0 bg-transparent text-lg font-semibold text-foreground outline-none placeholder:text-muted"
          />

          <div className="mb-3 flex flex-wrap gap-2 text-sm">
            <span className="rounded-pill bg-background px-3 py-1 font-semibold text-foreground">
              {pins.length} pin{pins.length === 1 ? '' : 's'}
            </span>
            <span className="rounded-pill bg-background px-3 py-1 font-semibold text-foreground">
              {formatDistance(distance)}
            </span>
          </div>

          {locationError && (
            <p className="mb-2 text-xs text-destructive">Location: {locationError}</p>
          )}

          <p className="mb-3 text-sm text-muted">
            Tap the map to drop pins along a trail. No GPS needed — useful for planning or
            sketching routes from memory.
          </p>

          {selectedPin && (
            <div className="mb-3 rounded-lg border border-border bg-background p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-foreground">
                  Pin {pins.findIndex((pin) => pin.id === selectedPin.id) + 1}
                </p>
                <button
                  type="button"
                  onClick={handleRemoveSelected}
                  className="text-xs font-semibold text-destructive"
                >
                  Remove
                </button>
              </div>
              <p className="mt-1 font-mono text-xs text-muted">
                {selectedPin.latitude.toFixed(5)}, {selectedPin.longitude.toFixed(5)}
              </p>
              <p className="mt-3 text-sm font-semibold text-foreground">Rate this pin</p>
              <div className="mt-2">
                <BinaryRatingButtons
                  positiveLabel="Interesting"
                  negativeLabel="Not interesting"
                  onPositive={() => handleRatePin(true)}
                  onNegative={() => handleRatePin(false)}
                />
              </div>
              {selectedPin.isInteresting !== null && (
                <p className="mt-2 text-xs text-muted">
                  Marked as {selectedPin.isInteresting ? 'interesting' : 'not interesting'}
                </p>
              )}
            </div>
          )}

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              className="flex-1"
              disabled={pins.length === 0 || uploading}
              onClick={handleUndoLast}
            >
              Undo last
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              disabled={pins.length === 0 || uploading}
              onClick={handleClear}
            >
              Clear all
            </Button>
            <Button
              className="flex-1"
              disabled={pins.length < 2 || uploading}
              onClick={handleUpload}
            >
              {uploading ? 'Uploading…' : 'Upload trail'}
            </Button>
          </div>

          {message && <p className="mt-3 text-sm text-muted">{message}</p>}

          {message.startsWith('Uploaded') && (
            <button
              type="button"
              onClick={() => navigate('/explore')}
              className="mt-3 min-h-[44px] text-sm font-semibold text-primary"
            >
              Explore community trails →
            </button>
          )}

          {!loggedIn && pins.length >= 2 && (
            <div className="mt-4 border-t border-border pt-4">
              <div className="mb-3 flex rounded-lg bg-background p-1">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setAuthError('');
                  }}
                  className={`flex-1 min-h-[44px] rounded-md py-1.5 text-xs font-semibold transition-colors ${
                    authMode === 'login' ? 'bg-surface text-primary shadow-sm' : 'text-muted'
                  }`}
                >
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('register');
                    setAuthError('');
                  }}
                  className={`flex-1 min-h-[44px] rounded-md py-1.5 text-xs font-semibold transition-colors ${
                    authMode === 'register' ? 'bg-surface text-primary shadow-sm' : 'text-muted'
                  }`}
                >
                  Register
                </button>
              </div>
              <form onSubmit={handleAuthSubmit} className="space-y-2">
                {authMode === 'register' && (
                  <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  />
                )}
                <input
                  type="text"
                  placeholder="Email or phone number"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  autoComplete="username"
                  required
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                />
                {authError && <p className="text-xs text-destructive">{authError}</p>}
                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full min-h-[44px] rounded-pill bg-primary py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
                >
                  {authLoading
                    ? 'Please wait…'
                    : authMode === 'register'
                      ? 'Create account'
                      : 'Sign in'}
                </button>
              </form>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
