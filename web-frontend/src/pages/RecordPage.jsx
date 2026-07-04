import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import RecordMap from '../components/RecordMap';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import BinaryRatingButtons from '../components/BinaryRatingButtons';
import { uploadActivity } from '../services/api';
import {
  subscribeRecording,
  startRecording,
  stopRecording,
  clearRecording,
  getRecordingDurationSeconds,
  ratePlace,
  getPlaceFeedback,
} from '../services/gpsRecording';
import { getToken, isLoggedIn, login, register, logout } from '../services/auth';
import { formatDistance, formatDuration, pathDistanceMeters } from '../utils/mapUtils';
import { isValidIdentifier } from '../utils/authIdentifier';

export default function RecordPage() {
  const navigate = useNavigate();
  const [recordingState, setRecordingState] = useState({
    isRecording: false,
    points: [],
    places: [],
    startedAt: null,
    stopProgress: { elapsedSeconds: 0, requiredSeconds: 30, isHolding: false },
  });
  const [pendingUpload, setPendingUpload] = useState(null);
  const [duration, setDuration] = useState(0);
  const [title, setTitle] = useState('Forest walk');
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
  const [tabHiddenWarning, setTabHiddenWarning] = useState(false);

  const { isRecording, points, places, stopProgress } = recordingState;
  const displayPoints = pendingUpload ?? points;
  const pendingPlace = places.find((p) => p.isInteresting === null) ?? null;
  const unratedPlaces = places.filter((p) => p.isInteresting === null);

  useEffect(() => subscribeRecording(setRecordingState), []);

  useEffect(() => {
    if (!isRecording) return undefined;
    const interval = setInterval(() => {
      setDuration(getRecordingDurationSeconds());
    }, 1000);
    return () => clearInterval(interval);
  }, [isRecording]);

  useEffect(() => {
    function handleVisibility() {
      setTabHiddenWarning(isRecording && document.hidden);
    }
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [isRecording]);

  useEffect(() => {
    function handleUnauthorized() {
      setLoggedIn(false);
      setMessage('Your session expired. Sign in again to upload.');
    }
    window.addEventListener('stravo:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('stravo:unauthorized', handleUnauthorized);
  }, []);

  async function handleStart() {
    setMessage('');
    setPendingUpload(null);
    clearRecording();
    const ok = await startRecording(setLocationError);
    if (ok) setDuration(0);
  }

  function handleStop() {
    const recorded = stopRecording();
    if (recorded.length < 2) {
      setMessage('Not enough GPS data — walk a little longer before saving.');
      clearRecording();
      setPendingUpload(null);
      return;
    }
    setPendingUpload(recorded);
    setDuration(getRecordingDurationSeconds());
  }

  function handleDiscard() {
    if (!window.confirm('Discard this recording? Your GPS points will be lost.')) return;
    clearRecording();
    setPendingUpload(null);
    setMessage('');
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
    const toUpload = pendingUpload ?? points;
    if (!toUpload || toUpload.length < 2) {
      setMessage('Record a trail first.');
      return;
    }
    if (!getToken()) {
      setMessage('Sign in below to upload your trail.');
      return;
    }

    setUploading(true);
    setMessage('');
    try {
      const placeFeedback = getPlaceFeedback();
      const activity = await uploadActivity(title.trim() || 'Untitled walk', toUpload, placeFeedback);
      setMessage(
        `Uploaded "${activity.title}" with ${activity.activitySegments?.length ?? 0} segments and ${places.length} place${places.length === 1 ? '' : 's'}.`
      );
      clearRecording();
      setPendingUpload(null);
    } catch (err) {
      setMessage(err.response?.data?.message || err.message);
    } finally {
      setUploading(false);
    }
  }

  const distance = pathDistanceMeters(displayPoints);
  const showStart = !isRecording && !pendingUpload;
  const showStop = isRecording;
  const showUpload = !isRecording && pendingUpload;

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="flex shrink-0 items-center justify-between border-b border-border bg-surface px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-sm font-medium text-primary hover:underline">
            Home
          </Link>
          <h1 className="font-display text-lg font-bold text-foreground sm:text-xl">Record trail</h1>
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
        <RecordMap
          points={displayPoints}
          places={places}
          isRecording={isRecording}
          userLocation={userLocation}
          onUserLocation={setUserLocation}
          onLocationError={setLocationError}
        />

        {tabHiddenWarning && (
          <div className="absolute left-4 right-4 top-4 z-[1001] rounded-lg bg-recording px-4 py-2 text-center text-sm font-semibold text-white shadow-sheet">
            Keep this tab open while recording — background tabs may pause GPS.
          </div>
        )}

        <Card className="absolute bottom-4 left-4 right-4 z-[1001] mx-auto max-w-lg shadow-sheet sm:left-6 sm:right-6">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Trail name (e.g. Forest walk)"
            disabled={isRecording}
            className="mb-3 w-full border-0 bg-transparent text-lg font-semibold text-foreground outline-none placeholder:text-muted disabled:opacity-60"
          />

          <div className="mb-3 flex flex-wrap gap-2 text-sm">
            <span className="rounded-pill bg-background px-3 py-1 font-semibold text-foreground">
              {formatDistance(distance)}
            </span>
            <span className="rounded-pill bg-background px-3 py-1 font-semibold text-foreground">
              {formatDuration(duration)}
            </span>
            {isRecording && (
              <span className="rounded-pill bg-recording/15 px-3 py-1 font-semibold text-recording">
                Recording
              </span>
            )}
            {places.length > 0 && (
              <span className="rounded-pill bg-amber-500/15 px-3 py-1 font-semibold text-amber-700">
                {places.length} place{places.length === 1 ? '' : 's'}
              </span>
            )}
            {pendingUpload && (
              <span className="rounded-pill bg-primary/10 px-3 py-1 font-semibold text-primary">
                Ready to upload
              </span>
            )}
          </div>

          {locationError && (
            <p className="mb-2 text-xs text-destructive">Location: {locationError}</p>
          )}

          {showStart && (
            <>
              <p className="mb-3 text-sm text-muted">
                Allow location access, then tap start when you begin walking. Pauses of 30s within
                ~10 m auto-record places you can rate instantly.
              </p>
              <Button className="w-full" onClick={handleStart}>
                Start recording
              </Button>
            </>
          )}

          {showStop && pendingPlace && (
            <div className="mb-3 rounded-lg border-2 border-primary/40 bg-primary/5 p-3">
              <p className="font-display text-base font-bold text-foreground">Place recorded</p>
              <p className="mt-1 text-sm text-muted">
                You paused ~30s in a ~10 m area. Rate it now or review later.
              </p>
              <div className="mt-3">
                <BinaryRatingButtons
                  positiveLabel="Interesting"
                  negativeLabel="Not interesting"
                  onPositive={() => ratePlace(pendingPlace.id, true)}
                  onNegative={() => ratePlace(pendingPlace.id, false)}
                />
              </div>
            </div>
          )}

          {showStop && !pendingPlace && stopProgress?.isHolding && (
            <p className="mb-3 rounded-lg bg-background px-3 py-2 text-sm text-muted">
              Holding still… {stopProgress.elapsedSeconds}s / {stopProgress.requiredSeconds}s to
              record a place
            </p>
          )}

          {showStop && (
            <>
              <p className="mb-3 text-sm text-muted">
                Tap stop when you finish walking. Places appear on the map — green = interesting,
                red = not.
              </p>
              {unratedPlaces.length > 1 && (
                <p className="mb-3 text-xs text-muted">
                  {unratedPlaces.length} places waiting for review.
                </p>
              )}
              <Button variant="outline" className="w-full" onClick={handleStop}>
                Stop recording
              </Button>
            </>
          )}

          {showUpload && pendingPlace && (
            <div className="mb-3 rounded-lg border-2 border-primary/40 bg-primary/5 p-3">
              <p className="font-display text-base font-bold text-foreground">Rate this place</p>
              <div className="mt-3">
                <BinaryRatingButtons
                  positiveLabel="Interesting"
                  negativeLabel="Not interesting"
                  onPositive={() => ratePlace(pendingPlace.id, true)}
                  onNegative={() => ratePlace(pendingPlace.id, false)}
                />
              </div>
            </div>
          )}

          {showUpload && places.length > 0 && (
            <div className="mb-3 rounded-lg bg-background p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                Recorded places ({places.length})
              </p>
              <ul className="mt-2 space-y-2">
                {places.map((place, index) => (
                  <li
                    key={place.id}
                    className="flex items-center justify-between gap-2 text-sm"
                  >
                    <span className="text-foreground">Place {index + 1}</span>
                    {place.isInteresting === null ? (
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => ratePlace(place.id, true)}
                          className="min-h-[36px] rounded-md bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground"
                        >
                          Green
                        </button>
                        <button
                          type="button"
                          onClick={() => ratePlace(place.id, false)}
                          className="min-h-[36px] rounded-md border border-destructive px-2 py-1 text-xs font-semibold text-destructive"
                        >
                          Red
                        </button>
                      </div>
                    ) : (
                      <span
                        className={`text-xs font-semibold ${
                          place.isInteresting ? 'text-primary' : 'text-destructive'
                        }`}
                      >
                        {place.isInteresting ? 'Interesting' : 'Not interesting'}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {showUpload && (
            <>
              <p className="mb-3 text-sm text-muted">
                Review your route on the map, then upload or discard.
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button className="flex-1" disabled={uploading} onClick={handleUpload}>
                  {uploading ? 'Uploading…' : 'Upload trail'}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  disabled={uploading}
                  onClick={handleDiscard}
                >
                  Discard
                </Button>
              </div>
              {message.startsWith('Uploaded') && (
                <button
                  type="button"
                  onClick={() => navigate('/explore')}
                  className="mt-3 min-h-[44px] text-sm font-semibold text-primary"
                >
                  Explore community trails →
                </button>
              )}
            </>
          )}

          {message && <p className="mt-3 text-sm text-muted">{message}</p>}

          {!loggedIn && showUpload && (
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
