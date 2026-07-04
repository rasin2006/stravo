import React from 'react';

const variants = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
  accent: 'bg-accent text-accent-foreground hover:bg-accent/90',
  outline: 'border border-border bg-transparent text-foreground hover:bg-background',
  ghost: 'bg-transparent text-primary hover:bg-background',
};

export default function Button({
  children,
  variant = 'primary',
  className = '',
  disabled = false,
  ...props
}) {
  return (
    <button
      type="button"
      className={`inline-flex min-h-[44px] items-center justify-center rounded-pill px-6 py-3 text-sm font-semibold transition-colors duration-200 disabled:opacity-50 ${variants[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
