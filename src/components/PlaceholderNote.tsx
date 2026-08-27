interface PlaceholderNoteProps {
  children: string;
}

/**
 * Marks scaffolding that the content and visual passes are expected to
 * replace. Visible on purpose — silent placeholders get shipped.
 */
export function PlaceholderNote({ children }: PlaceholderNoteProps) {
  return <p className="placeholder-note">▚ {children}</p>;
}
