import { useState } from 'react';
import { Button, CharacterPortrait, Screen } from '../../components';
import type { CharacterId } from '../../content/types';
import { accusableCharacters, accusedCharacter, lastPlacedEvidence } from '../../engine/selectors';
import { useCaseDefinition, useDispatch, useGameState } from '../../app/hooks';

/**
 * The quiet screen.
 *
 * Discussion is the part of TRUSTED that happens between people, so the device
 * gets out of the way: the object that just landed, the question it raised,
 * whoever the room is currently naming, and one way out. No chat, no timer, no
 * turn order — the group decides when it is done, and says so.
 *
 * Naming somebody is deliberately *behind* a tap rather than on the screen.
 * A list of four faces sitting permanently under the prompt turns a
 * conversation into a form to be filled in; the room should be arguing, and
 * reaching for the phone only once it has something to put on the record.
 */
export function DiscussionView() {
  const state = useGameState();
  const dispatch = useDispatch();
  const def = useCaseDefinition();

  // Purely a view mode: which of the two faces of this screen is showing.
  // Nothing here is a gameplay fact, so nothing here belongs in game state.
  const [choosing, setChoosing] = useState(false);

  const latest = lastPlacedEvidence(state, def);
  const accused = accusedCharacter(state, def);

  if (choosing) {
    return (
      <AccusationPicker
        options={accusableCharacters(state, def)}
        current={accused?.id}
        onPick={(characterId) => {
          dispatch({ type: 'SET_ACCUSATION', characterId });
          setChoosing(false);
        }}
        onCancel={() => setChoosing(false)}
      />
    );
  }

  return (
    <Screen
      kicker={latest ? latest.title : undefined}
      title="Discuss"
      actions={
        <>
          <Button variant="primary" onClick={() => dispatch({ type: 'DISCUSSION_COMPLETE' })}>
            We&rsquo;re ready
          </Button>
          <Button variant="ghost" onClick={() => setChoosing(true)}>
            {accused ? 'Name someone else' : 'Name someone'}
          </Button>
        </>
      }
    >
      <div className="discuss">
        <p className="discuss__prompt" dir="auto">
          {latest?.discussionPrompt ?? 'What do you think?'}
        </p>
      </div>

      {accused ? <AccusationBanner name={accused.name} /> : null}
    </Screen>
  );
}

/**
 * What the room is saying, stated plainly.
 *
 * Says "not the vote" every single time it appears. The one thing this
 * feature must never do is let a table believe it has already decided.
 */
function AccusationBanner({ name }: { name: string }) {
  return (
    <div className="accusation">
      <p className="accusation__label">The room is naming</p>
      <p className="accusation__name" dir="auto">
        {name}
      </p>
      <p className="accusation__note">
        Said out loud, not voted. Anyone can argue it round to someone else.
      </p>
    </div>
  );
}

interface AccusationPickerProps {
  options: ReturnType<typeof accusableCharacters>;
  current: CharacterId | undefined;
  onPick: (characterId: CharacterId) => void;
  onCancel: () => void;
}

/**
 * Choosing a name.
 *
 * Structurally the ballot's twin, and pointedly not its equal: it is shown to
 * the whole table rather than to one pair of hands, it takes effect the moment
 * it is tapped, and it can be undone by the next person who argues better.
 * Nobody is excluded from the list — the room may name anyone, including the
 * character sitting behind the phone.
 */
function AccusationPicker({ options, current, onPick, onCancel }: AccusationPickerProps) {
  return (
    <Screen
      kicker="Out loud, together"
      title="Who is the room naming?"
      lede="This is not the vote. It is what the table is saying right now, and it can change as often as the argument does."
      actions={
        <Button variant="ghost" onClick={onCancel}>
          Back to the discussion
        </Button>
      }
    >
      <ul className="ballot">
        {options.map((character) => {
          const isCurrent = current === character.id;
          return (
            <li key={character.id}>
              <button
                type="button"
                className={`ballot__option${isCurrent ? ' ballot__option--selected' : ''}`}
                aria-pressed={isCurrent}
                onClick={() => onPick(character.id)}
              >
                <CharacterPortrait name={character.name} />
                <span className="ballot__name" dir="auto">
                  {character.name}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="ballot__note">Nobody votes yet. The vote comes later, in private.</p>
    </Screen>
  );
}
