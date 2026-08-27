import type { ReactNode } from 'react';

interface ScreenProps {
  kicker?: string;
  title: string;
  lede?: string;
  children?: ReactNode;
  /** Rendered in the sticky action area at the bottom of the screen. */
  actions?: ReactNode;
}

/** The single page layout every phase view uses. */
export function Screen({ kicker, title, lede, children, actions }: ScreenProps) {
  return (
    <section className="screen">
      <header className="screen__header">
        {kicker ? <p className="screen__kicker">{kicker}</p> : null}
        <h1 className="screen__title">{title}</h1>
        {lede ? <p className="screen__lede">{lede}</p> : null}
      </header>
      <div className="screen__body">{children}</div>
      {actions ? <div className="screen__actions">{actions}</div> : null}
    </section>
  );
}
