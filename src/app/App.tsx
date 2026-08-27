import { AppShell } from './AppShell';
import { PhaseRouter } from './PhaseRouter';
import { DevBar } from './dev/DevBar';
import { isDevMode } from './dev/devMode';

export function App() {
  return (
    <AppShell footer={isDevMode() ? <DevBar /> : null}>
      <PhaseRouter />
    </AppShell>
  );
}
