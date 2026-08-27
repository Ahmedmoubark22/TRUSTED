import { Button, Screen } from '../../components';
import {
  inspectableEvidence,
  isEvidenceFullyInspected,
  visibleFragments,
} from '../../engine/selectors';
import { useCaseDefinition, useDispatch, useGameState } from '../../app/hooks';
import { EvidenceViewer } from './EvidenceViewer';

/**
 * The object in front of the table.
 *
 * One object at a time, dominating the screen. The view asks the engine which
 * object it may show and gets back exactly one or nothing — it never receives
 * the case's evidence list, so there is no future object in scope here to
 * accidentally render, hide, count or label.
 */
export function EvidenceView() {
  const state = useGameState();
  const dispatch = useDispatch();
  const def = useCaseDefinition();

  const evidence = inspectableEvidence(state, def);
  if (!evidence) return null;

  const fragments = visibleFragments(state, evidence);
  const complete = isEvidenceFullyInspected(state, evidence);

  return (
    <Screen
      kicker="On the table"
      title={fragments.length === 0 ? 'Something has surfaced' : evidence.title}
      lede={
        fragments.length === 0
          ? 'Hold it where everyone can see it.'
          : undefined
      }
      actions={
        complete ? (
          <Button
            variant="primary"
            onClick={() => dispatch({ type: 'PLACE_EVIDENCE', evidenceId: evidence.id })}
          >
            Put it on the table
          </Button>
        ) : (
          <Button variant="ghost" onClick={() => dispatch({ type: 'CLOSE_EVIDENCE' })}>
            Not yet
          </Button>
        )
      }
    >
      <EvidenceViewer
        evidence={evidence}
        fragments={fragments}
        complete={complete}
        onInspect={() => dispatch({ type: 'INSPECT_EVIDENCE', evidenceId: evidence.id })}
      />
    </Screen>
  );
}
