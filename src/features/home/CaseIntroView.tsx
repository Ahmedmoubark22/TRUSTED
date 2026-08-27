import { Button, PlaceholderNote, Screen } from '../../components';
import { useCaseDefinition, useDispatch } from '../../app/hooks';

export function CaseIntroView() {
  const dispatch = useDispatch();
  const def = useCaseDefinition();

  if (!def) return null;

  return (
    <Screen
      kicker="Case 001"
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
          <p key={i}>{paragraph}</p>
        ))}
      </div>
      {def.isPlaceholder ? <PlaceholderNote>Case text is scaffolding, not final writing.</PlaceholderNote> : null}
    </Screen>
  );
}
