import type { ReactNode } from 'react';

interface CardProps {
  title?: string;
  meta?: string;
  muted?: boolean;
  locked?: boolean;
  children?: ReactNode;
}

export function Card({ title, meta, muted, locked, children }: CardProps) {
  const classes = ['card', muted ? 'card--muted' : '', locked ? 'card--locked' : '']
    .filter(Boolean)
    .join(' ');
  return (
    <div className={classes}>
      {title ? <p className="card__title">{title}</p> : null}
      {meta ? <p className="card__meta">{meta}</p> : null}
      {children}
    </div>
  );
}
