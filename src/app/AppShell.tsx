import type { ReactNode } from 'react';
import { PHASE_META, type PhaseMeta } from '../engine/phases';
import { useGameState } from './hooks';

/**
 * The header for a session waiting to be picked up. The phase underneath is
 * still VOTING, and saying so here would tell the room the device is on a
 * ballot when it is not.
 */
const RECOVERY_META: PhaseMeta = {
  title: 'Unfinished',
  hint: 'This game was left part-way.',
  isPrivate: false,
};

interface AppShellProps {
  children: ReactNode;
  footer?: ReactNode;
}

/**
 * Mobile-first frame: a single column capped to a phone width, a sticky
 * header showing where the table is in the case, and a footer slot the dev
 * bar occupies during development.
 */
export function AppShell({ children, footer }: AppShellProps) {
  const state = useGameState();
  const meta = state.recoveryRequired ? RECOVERY_META : PHASE_META[state.phase];

  return (
    <div className="app">
      <header className="app__bar">
        <p className="app__eyebrow">{meta.hint}</p>
        <p className="app__title">{meta.title}</p>
      </header>
      <main className="app__main">{children}</main>
      {footer}
    </div>
  );
}
