import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

export default function HomePage() {
  const [health, setHealth] = useState('checking...');
  const [segmentCount, setSegmentCount] = useState(null);

  useEffect(() => {
    api
      .get('/health')
      .then(() => setHealth('connected'))
      .catch(() => setHealth('offline'));

    api
      .get('/segments')
      .then((res) => setSegmentCount(res.data.length))
      .catch(() => setSegmentCount(0));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <span className="font-display text-xl font-bold text-primary">Stravo</span>
          <nav className="flex gap-4 text-sm font-medium">
            <Link to="/record" className="text-foreground hover:text-primary">
              Record
            </Link>
            <Link to="/record/manual" className="text-foreground hover:text-primary">
              Manual pins
            </Link>
            <Link to="/explore" className="text-foreground hover:text-primary">
              Explore
            </Link>
            <Link to="/dashboard" className="text-foreground hover:text-primary">
              Dashboard
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-12 px-6 py-16 md:grid-cols-2 md:items-center">
        <div>
          <h1 className="font-display text-4xl font-bold leading-tight text-foreground md:text-5xl">
            Discover trails others have walked
          </h1>
          <p className="mt-4 text-lg text-muted">
            Crowdsourced trail discovery for off-grid areas. Record paths in your browser or
            mobile app, then explore community-rated segments on the map.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/record">
              <Button>Record trail</Button>
            </Link>
            <Link to="/record/manual">
              <Button variant="outline">Drop pins manually</Button>
            </Link>
            <Link to="/explore">
              <Button variant="outline">Explore map</Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="ghost">View analytics</Button>
            </Link>
          </div>
          <p className="mt-6 text-sm text-muted">API status: {health}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <p className="font-display text-3xl font-bold text-primary">
              {segmentCount ?? '—'}
            </p>
            <p className="mt-1 text-sm text-muted">Trail segments mapped</p>
          </Card>
          <Card>
            <p className="font-display text-3xl font-bold text-primary">Community</p>
            <p className="mt-1 text-sm text-muted">Rated by hikers in the field</p>
          </Card>
          <Card className="sm:col-span-2">
            <p className="font-display text-lg font-semibold">How it works</p>
            <ol className="mt-3 space-y-2 text-sm text-muted">
              <li>1. Record a walk on the web or mobile app</li>
              <li>2. Paths split into ~100m segments automatically</li>
              <li>3. Community rates segments as interesting or not</li>
              <li>4. Explore the best trails on the map</li>
            </ol>
          </Card>
        </div>
      </main>
    </div>
  );
}
