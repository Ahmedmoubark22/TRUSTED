import { Button, Screen } from '../../components';
import { accusedCharacter, hasUnplacedEvidence, tableEvidence } from '../../engine/selectors';
import { useCaseDefinition, useDispatch, useGameState } from '../../app/hooks';

/**
 * The shared environment: what the room has established so far.
 *
 * It shows the objects that have been placed and nothing else. There is no
 * "1 of 3", no greyed-out slot and no locked card — a counter would tell the
 * table how much is still coming, which is a leak in a slower costume. The
 * table simply does not know whether the next tap brings out another object or
 * ends the investigation, and `hasUnplacedEvidence` is a boolean so this view
 * cannot find out either.
 */
export function TableView() {
  const state = useGameState();
  const dispatch = useDispatch();
  const def = useCaseDefinition();

  const placed = tableEvidence(state, def);
  const more = hasUnplacedEvidence(state, def);
  const accused = accusedCharacter(state, def);

  return (
    <Screen
      kicker={def?.title}
      title="The table"
      lede={
        placed.length === 0
          ? 'Everyone has read their briefing. Nothing has been proved yet.'
          : 'What everyone has seen, in the order it surfaced.'
      }
      actions={
        more ? (
          <Button variant="primary" onClick={() => dispatch({ type: 'OPEN_EVIDENCE' })}>
            {placed.length === 0 ? 'Begin' : 'Something else has surfaced'}
          </Button>
        ) : (
          <Button variant="primary" onClick={() => dispatch({ type: 'READY_TO_DECIDE' })}>
            We are ready to decide
          </Button>
        )
      }
    >
      {placed.length === 0 ? (
        <p className="table__empty">The table is empty.</p>
      ) : (
        <ol className="table__objects">
          {placed.map((item) => (
            <li className={`table__object table__object--${item.type}`} key={item.id} dir="auto">
              <span className="table__object-title">{item.title}</span>
              <span className="table__object-note">{item.description}</span>
            </li>
          ))}
        </ol>
      )}

      {/* Read-only here. The table is the shared record of where the room has
          got to, and who it is currently naming is part of that — but changing
          it belongs to the conversation, not to this screen. */}
      {accused ? (
        <p className="table__accusation">
          The room is naming{' '}
          <span className="table__accusation-name" dir="auto">
            {accused.name}
          </span>
          . Not a vote.
        </p>
      ) : null}
    </Screen>
  );
}
