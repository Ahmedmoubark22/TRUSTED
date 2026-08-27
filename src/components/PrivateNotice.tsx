interface PrivateNoticeProps {
  /** The one person who should be looking at the device right now. */
  playerName: string;
}

/**
 * The pass-and-play guard rail. Private information is the whole game, so the
 * warning is a shared component rather than per-screen copy.
 */
export function PrivateNotice({ playerName }: PrivateNoticeProps) {
  return (
    <p className="private-notice">
      This screen is for <strong>{playerName}</strong> only. Everyone else, look away.
    </p>
  );
}
