import { Button, CharacterPortrait, Screen } from '../../components';
import { charactersByIds, lastEliminationWasCulprit } from '../../engine/selectors';
import { useCaseDefinition, useDispatch, useEliminationCard, useGameState } from '../../app/hooks';

/**
 * What the name just cost.
 *
 * The round's payoff, and the reason a wrong vote is not a wasted one: whoever
 * the room struck off gives up a card on the way out, so the case moves
 * forward whether or not the room was right.
 *
 * The screen never editorialises. It says who was named, whether they were one
 * of the people the case is about, reads their card, and offers one way on.
 * Whether the case is over was decided by the reducer before this rendered —
 * this view does not compute it and cannot change it.
 */
export function EliminationView() {
  const state = useGameState();
  const dispatch = useDispatch();
  const def = useCaseDefinition();
  const card = useEliminationCard();

  const named = state.lastEliminated
    ? charactersByIds(def, [state.lastEliminated])[0]
    : undefined;
  const wasCulprit = lastEliminationWasCulprit(state);
  const finished = state.outcome !== null && state.outcome !== 'RUNNING';

  return (
    <Screen
      kicker={`Round ${state.round} of ${state.totalRounds}`}
      title={named ? named.name : 'Nobody'}
      lede={
        named
          ? undefined
          : 'The room could not agree, so nobody was struck off. The round is gone all the same.'
      }
      actions={
        <Button variant="primary" onClick={() => dispatch({ type: 'ADVANCE_ROUND' })}>
          {finished ? 'What actually happened' : 'Next round'}
        </Button>
      }
    >
      {named ? (
        <div className="rounds__verdict">
          <CharacterPortrait name={named.name} />
          <p
            className={`rounds__badge${wasCulprit ? ' rounds__badge--culprit' : ''}`}
            dir="auto"
          >
            {wasCulprit ? 'You were right.' : 'They did not do it.'}
          </p>
        </div>
      ) : null}

      {card ? (
        <div className="rounds__card">
          <p className="rounds__card-label">On the way out, they said</p>
          <p className="rounds__card-text" dir="auto">
            {card}
          </p>
        </div>
      ) : null}
    </Screen>
  );
}
