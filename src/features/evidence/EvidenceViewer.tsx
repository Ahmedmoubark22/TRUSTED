import type { EvidenceDefinition, EvidenceFragment } from '../../content/types';
import { CONTINUE_LABELS, OPEN_LABELS } from '../../engine/evidence';

interface EvidenceViewerProps {
  evidence: EvidenceDefinition;
  /** Only the fragments the table has actually uncovered. */
  fragments: EvidenceFragment[];
  /** True once there is nothing left to uncover. */
  complete: boolean;
  /** Uncover the next fragment. */
  onInspect: () => void;
}

/**
 * The one way evidence is ever shown.
 *
 * There is no InvitationScreen, PhotographScreen or LetterScreen and there
 * should never be one. An object's `type` picks a stylesheet rule and a verb
 * ("Open the card", "Look closer", "Unfold the page"); everything else — the
 * sealed state, the tap-to-uncover, the fragments — is identical for every
 * object in every case. A new kind of object is content plus a CSS rule.
 *
 * The object itself is the button. There is no "inspect" control beside it to
 * aim at: the whole thing is the tap target, which is what makes it feel like
 * picking something up rather than operating a form.
 *
 * Only `fragments` is rendered, and the caller passes just the uncovered ones.
 * Nothing is drawn and then hidden.
 */
export function EvidenceViewer({ evidence, fragments, complete, onInspect }: EvidenceViewerProps) {
  const sealed = fragments.length === 0;
  const label = sealed
    ? (OPEN_LABELS[evidence.type] ?? 'Open it')
    : (CONTINUE_LABELS[evidence.type] ?? 'Keep looking');

  return (
    <article className={`evidence evidence--${evidence.type}`}>
      <button
        type="button"
        className="evidence__object"
        onClick={onInspect}
        disabled={complete}
        aria-label={complete ? `${evidence.title}, fully examined` : `${label}: ${evidence.title}`}
      >
        <span className="evidence__plate" aria-hidden="true">
          {evidence.imageSrc ? (
            <img className="evidence__image" src={evidence.imageSrc} alt="" loading="lazy" />
          ) : null}
        </span>

        <span className="evidence__title">{evidence.title}</span>
        <span className="evidence__description">{evidence.description}</span>

        {sealed ? (
          <span className="evidence__cue">{label}</span>
        ) : (
          <span className="evidence__reading">
            {fragments.map((fragment, i) => (
              // Index-keyed on purpose: fragments only ever append, and a
              // fragment's identity is its position on the object.
              <span className="evidence__fragment" key={i}>
                <span className="evidence__caption">{fragment.caption}</span>
                {fragment.lines.map((line, j) => (
                  <span className="evidence__line" key={j}>
                    {line}
                  </span>
                ))}
              </span>
            ))}
            {complete ? null : <span className="evidence__cue">{label}</span>}
          </span>
        )}
      </button>
    </article>
  );
}
