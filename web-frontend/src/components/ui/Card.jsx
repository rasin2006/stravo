import React from 'react';

export default function Card({ children, className = '', onClick }) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`rounded-lg border border-border bg-surface p-4 shadow-card ${onClick ? 'cursor-pointer text-left transition-opacity hover:opacity-90' : ''} ${className}`}
    >
      {children}
    </Tag>
  );
}
