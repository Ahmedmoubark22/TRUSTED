import { Button, PlaceholderNote, Screen } from '../../components';
import { useCaseDefinition, useDispatch } from '../../app/hooks';

export function CaseIntroView() {
  const dispatch = useDispatch();
  const def = useCaseDefinition();

  if (!def) return null;

  return (
    <Screen
      kicker={caseLabel(def.id)}
      title={def.title}
      lede={def.subtitle}
      actions={
        <>
          <Button variant="primary" onClick={() => dispatch({ type: 'INTRO_COMPLETE' })}>
            Set up the table
          </Button>
          <Button variant="ghost" onClick={() => dispatch({ type: 'BACK_TO_HOME' })}>
            Back
          </Button>
        </>
      }
    >
      <div className="stack">
        {def.intro.map((paragraph, i) => (
          <p key={i} dir="auto">
            {paragraph}
          </p>
        ))}
      </div>
      {def.isPlaceholder ? <PlaceholderNote>Case text is scaffolding, not final writing.</PlaceholderNote> : null}
    </Screen>
  );
}

/**
 * "case-002" → "Case 002".
 *
 * Read off the case's own id rather than hard-coded, so a second case does not
 * open under the first one's number.
 */
function caseLabel(caseId: string): string {
  const number = caseId.replace(/^case-/, '');
  return `Case ${number}`;
}
