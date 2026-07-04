import React from 'react';
import { Link } from 'react-router-dom';

export default function ActivityDetailPage() {
  return (
    <div className="min-h-screen bg-background px-6 py-10">
      <Link to="/" className="text-sm font-medium text-primary hover:underline">
        ← Home
      </Link>
      <h1 className="mt-4 font-display text-2xl font-bold">Activity Detail</h1>
      <p className="mt-2 text-muted">Activity details will appear here.</p>
    </div>
  );
}
