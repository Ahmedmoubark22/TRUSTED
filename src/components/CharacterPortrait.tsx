interface CharacterPortraitProps {
  name: string;
}

/**
 * Stand-in portrait art.
 *
 * Real portraits are not drawn yet, so a character reads as a marked plate
 * rather than a bullet point — enough presence to be picked out at a glance
 * on a phone. Swapping in artwork later is a change to this one component.
 */
export function CharacterPortrait({ name }: CharacterPortraitProps) {
  const initial = name.trim().charAt(0).toUpperCase();
  return (
    <span className="portrait" aria-hidden="true">
      {initial}
    </span>
  );
}
