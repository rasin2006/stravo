import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Card from '../components/ui/Card';
import { formatDistance } from '../utils/mapUtils';

export default function DashboardPage() {
  const [segments, setSegments] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/segments')
      .then((res) => setSegments(res.data))
      .catch((err) => setError(err.message));
  }, []);

  const rated = segments.filter((s) => s.scorePercent != null);
  const topRated = [...rated].sort((a, b) => b.scorePercent - a.scorePercent).slice(0, 5);
  const avgLength =
    segments.length > 0
      ? segments.reduce((sum, s) => sum + Number(s.lengthMeters || 0), 0) / segments.length
      : 0;
  const avgScore =
    rated.length > 0
      ? Math.round(rated.reduce((sum, s) => sum + s.scorePercent, 0) / rated.length)
      : null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center gap-4">
          <Link to="/" className="text-sm font-medium text-primary hover:underline">
            ← Home
          </Link>
          <h1 className="font-display text-xl font-bold">Segment Analytics</h1>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-6 py-10">
        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <p className="text-sm text-muted">Total segments</p>
            <p className="font-display text-3xl font-bold text-primary">{segments.length}</p>
          </Card>
          <Card>
            <p className="text-sm text-muted">Avg segment length</p>
            <p className="font-display text-3xl font-bold text-primary">
              {formatDistance(avgLength)}
            </p>
          </Card>
          <Card>
            <p className="text-sm text-muted">Avg interest score</p>
            <p className="font-display text-3xl font-bold text-primary">
              {avgScore != null ? `${avgScore}%` : '—'}
            </p>
          </Card>
        </div>

        <Card>
          <h2 className="font-display text-lg font-semibold">Top-rated segments</h2>
          {topRated.length === 0 ? (
            <p className="mt-4 text-sm text-muted">No rated segments yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {topRated.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between border-b border-border pb-3 last:border-0"
                >
                  <span className="font-mono text-sm text-muted">{s.id.slice(0, 8)}…</span>
                  <span className="text-sm font-semibold text-primary">{s.scorePercent}%</span>
                  <span className="text-sm text-muted">{formatDistance(s.lengthMeters)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h2 className="font-display text-lg font-semibold">Length distribution</h2>
          <div className="mt-4 flex h-32 items-end gap-2">
            {[50, 75, 100, 125, 150].map((bucket) => {
              const count = segments.filter((s) => {
                const len = Number(s.lengthMeters || 0);
                return len >= bucket - 25 && len < bucket + 25;
              }).length;
              const height = segments.length ? (count / segments.length) * 100 : 0;
              return (
                <div key={bucket} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-md bg-primary transition-all"
                    style={{ height: `${Math.max(height, 4)}%` }}
                  />
                  <span className="text-xs text-muted">{bucket}m</span>
                </div>
              );
            })}
          </div>
        </Card>
      </main>
    </div>
  );
}
