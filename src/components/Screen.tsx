import type { ReactNode } from 'react';

interface ScreenProps {
  kicker?: string;
  title: string;
  lede?: string;
  children?: ReactNode;
  /** Rendered in the sticky action area at the bottom of the screen. */
  actions?: ReactNode;
}

/**
 * The single page layout every phase view uses.
 *
 * `dir="auto"` on the authored text: a case may be written in Arabic, and the
 * heading of an Arabic case has to lay out right-to-left while the surrounding
 * English chrome does not. Inferring per block from the text itself keeps that
 * a property of the content rather than a mode the whole app has to be put in.
 */
export function Screen({ kicker, title, lede, children, actions }: ScreenProps) {
  return (
    <section className="screen">
      <header className="screen__header">
        {kicker ? (
          <p className="screen__kicker" dir="auto">
            {kicker}
          </p>
        ) : null}
        <h1 className="screen__title" dir="auto">
          {title}
        </h1>
        {lede ? (
          <p className="screen__lede" dir="auto">
            {lede}
          </p>
        ) : null}
      </header>
      <div className="screen__body">{children}</div>
      {actions ? <div className="screen__actions">{actions}</div> : null}
    </section>
  );
}
