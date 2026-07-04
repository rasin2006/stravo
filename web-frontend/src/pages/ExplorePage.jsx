import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { submitSegmentFeedback } from '../services/api';
import { getToken, isLoggedIn, login, logout, register } from '../services/auth';
import SegmentMap from '../components/SegmentMap';
import Card from '../components/ui/Card';
import BinaryRatingButtons from '../components/BinaryRatingButtons';
import { formatDistance } from '../utils/mapUtils';
import { isValidIdentifier } from '../utils/authIdentifier';

export default function ExplorePage() {
  const [segments, setSegments] = useState([]);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const [minScore, setMinScore] = useState(0);
  const [search, setSearch] = useState('');
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());
  const [authMode, setAuthMode] = useState('login');
  const [name, setName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState('');

  useEffect(() => {
    api
      .get('/segments')
      .then((res) => setSegments(res.data))
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    function handleUnauthorized() {
      setLoggedIn(false);
      setFeedbackMsg('Your session expired. Sign in again to rate segments.');
    }
    window.addEventListener('stravo:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('stravo:unauthorized', handleUnauthorized);
  }, []);

  const filtered = useMemo(() => {
    return segments.filter((s) => {
      const scoreOk = minScore === 0 || (s.scorePercent != null && s.scorePercent >= minScore);
      const searchOk = !search || s.id.toLowerCase().includes(search.toLowerCase());
      return scoreOk && searchOk;
    });
  }, [segments, minScore, search]);

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
    } catch (err) {
      setAuthError(err.response?.data?.message || err.message);
    } finally {
      setAuthLoading(false);
    }
  }

  function switchAuthMode(mode) {
    setAuthMode(mode);
    setAuthError('');
  }

  async function handleFeedback(isInteresting) {
    if (!selected) return;
    if (!getToken()) {
      setFeedbackMsg('Sign in below to rate segments.');
      return;
    }
    setSubmitting(true);
    setFeedbackMsg('');
    try {
      const result = await submitSegmentFeedback(selected.id, isInteresting);
      setFeedbackMsg(
        result.updated ? 'Rating updated.' : 'Thanks — your rating was saved.'
      );
      const { data } = await api.get('/segments');
      setSegments(data);
      const updated = data.find((s) => s.id === selected.id);
      if (updated) setSelected(updated);
    } catch (err) {
      setFeedbackMsg(err.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="flex items-center justify-between border-b border-border bg-surface px-6 py-4">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-sm font-medium text-primary hover:underline">
            ← Home
          </Link>
          <h1 className="font-display text-xl font-bold text-foreground">Explore Segments</h1>
        </div>
        <span className="text-sm text-muted">{filtered.length} segments</span>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="flex w-80 shrink-0 flex-col border-r border-border bg-surface">
          {!loggedIn && (
            <div className="border-b border-border p-4">
              <div className="mb-3 flex rounded-lg bg-background p-1">
                <button
                  type="button"
                  onClick={() => switchAuthMode('login')}
                  className={`flex-1 min-h-[44px] rounded-md py-1.5 text-xs font-semibold transition-colors ${
                    authMode === 'login'
                      ? 'bg-surface text-primary shadow-sm'
                      : 'text-muted'
                  }`}
                >
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={() => switchAuthMode('register')}
                  className={`flex-1 min-h-[44px] rounded-md py-1.5 text-xs font-semibold transition-colors ${
                    authMode === 'register'
                      ? 'bg-surface text-primary shadow-sm'
                      : 'text-muted'
                  }`}
                >
                  Register
                </button>
              </div>

              <form onSubmit={handleAuthSubmit} className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                  {authMode === 'register' ? 'Create an account to rate' : 'Sign in to rate'}
                </p>
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
                  inputMode="text"
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
                  className="w-full min-h-[44px] rounded-pill bg-primary py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
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

          {loggedIn && (
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <span className="text-xs text-muted">Signed in</span>
              <button
                type="button"
                onClick={() => {
                  logout();
                  setLoggedIn(false);
                }}
                className="text-xs font-semibold text-primary"
              >
                Sign out
              </button>
            </div>
          )}

          <div className="space-y-3 border-b border-border p-4">
            <input
              type="text"
              placeholder="Search by ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
            <label className="block text-xs font-semibold uppercase tracking-wide text-muted">
              Min score: {minScore}%
              <input
                type="range"
                min="0"
                max="100"
                step="10"
                value={minScore}
                onChange={(e) => setMinScore(Number(e.target.value))}
                className="mt-1 w-full accent-primary"
              />
            </label>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {error && <p className="text-sm text-destructive">{error}</p>}
            {locationError && (
              <p className="mb-2 text-xs text-muted">Location: {locationError}</p>
            )}
            {filtered.length === 0 && !error && (
              <p className="text-sm text-muted">No segments yet. Record a path from the mobile app.</p>
            )}
            <ul className="space-y-2">
              {filtered.map((segment) => (
                <li key={segment.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelected(segment);
                      setFeedbackMsg('');
                    }}
                    onMouseEnter={() => setSelected(segment)}
                    className={`w-full min-h-[44px] rounded-lg border p-3 text-left transition-colors ${
                      selected?.id === segment.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-background hover:border-primary/40'
                    }`}
                  >
                    <p className="font-mono text-xs text-muted">{segment.id.slice(0, 8)}…</p>
                    <p className="mt-1 text-sm font-semibold text-foreground">
                      {formatDistance(segment.lengthMeters)}
                    </p>
                    <p className="text-xs text-muted">
                      {segment.scorePercent != null
                        ? `${segment.scorePercent}% interesting · ${segment.feedbackCount} ratings`
                        : 'Unrated'}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <main className="relative flex-1">
          <SegmentMap
            segments={filtered}
            selectedId={selected?.id}
            onSelect={(segment) => {
              setSelected(segment);
              setFeedbackMsg('');
            }}
            userLocation={userLocation}
            onUserLocation={setUserLocation}
            onLocationError={setLocationError}
          />
          {selected && (
            <Card className="absolute bottom-6 left-6 right-6 max-w-md shadow-sheet">
              <p className="font-display text-lg font-bold">Segment {selected.id.slice(0, 8)}…</p>
              <p className="mt-1 text-sm text-muted">
                {formatDistance(selected.lengthMeters)}
                {selected.scorePercent != null
                  ? ` · ${selected.scorePercent}% interesting`
                  : ' · Unrated'}
              </p>
              {selected.feedbackCount > 0 && (
                <p className="mt-1 text-xs text-muted">{selected.feedbackCount} community ratings</p>
              )}
              <p className="mt-4 text-sm font-semibold text-foreground">Was this segment interesting?</p>
              <div className="mt-3">
                <BinaryRatingButtons
                  onPositive={() => handleFeedback(true)}
                  onNegative={() => handleFeedback(false)}
                  loading={submitting}
                  disabled={!loggedIn && !getToken()}
                />
              </div>
              {feedbackMsg && <p className="mt-2 text-xs text-muted">{feedbackMsg}</p>}
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
