import type { CaseDefinition, CastGender, CastKind } from './types';

/**
 * How the catalogue describes a case to somebody choosing one.
 *
 * The collection is being written to vary deliberately — four players and six,
 * a room of friends and a family, a table of women and a mixed one — and a
 * group picking a case for tonight is picking on exactly those axes. So they
 * are authored metadata rather than something inferred from a cast list, and
 * they are turned into words here, once, instead of in whichever screen
 * happens to be showing them.
 *
 * The words are English, because this is **chrome**. Everything the app says
 * in its own voice — buttons, phase headers, the rules of a round — is
 * English; Arabic is reserved for what a case *is*: its title, its subtitle,
 * its briefings, the text on its objects. A card that read
 * `4 لاعيبة · جيران · مختلط` put the shell's voice into the content's
 * language, which is how "4–4 players" got read as a bug in the first place
 * rather than as a line nobody could parse.
 */

const KIND_LABELS: Record<CastKind, string> = {
  family: 'family',
  neighbours: 'neighbours',
  friends: 'friends',
  colleagues: 'colleagues',
  strangers: 'strangers',
};

const GENDER_LABELS: Record<CastGender, string> = {
  women: 'women',
  men: 'men',
  mixed: 'mixed',
};

/**
 * A seat count as words — "4 players", or "4–6 players" for a case that
 * genuinely takes a range.
 *
 * The range is the exception in this collection, not the format: briefings are
 * authored per character, so most cases are written for one exact number of
 * seats. Printing `min–max` unconditionally turned that into "4–4 players".
 */
export function playerCountLabel(min: number, max: number = min): string {
  const seats = min === max ? `${min}` : `${min}–${max}`;
  return `${seats} player${max === 1 ? '' : 's'}`;
}

/**
 * The one line under a case's title.
 *
 * Player count first, because that is the question a group actually has to
 * answer before anything else — there are five of us, what can we play?
 */
export function caseMetaLine(def: CaseDefinition): string {
  const parts = [playerCountLabel(def.minPlayers, def.maxPlayers)];
  if (def.castKind) parts.push(KIND_LABELS[def.castKind]);
  if (def.castGender) parts.push(GENDER_LABELS[def.castGender]);
  parts.push(`~${def.estimatedMinutes} min`);
  // Named rather than left implicit: a case played in rounds against somebody
  // who knows they are the answer is a different evening from one played
  // together, and a group should know which they are picking.
  if (def.mode === 'interrogation') parts.push('rounds');
  return parts.join(' · ');
}

/**
 * The cases, grouped by how many people they seat.
 *
 * Grouped rather than filtered: a group of five should see what it can play
 * at the top of a section, not have to work a control to find out. Sections
 * come out smallest first, and a case that seats a range appears under its
 * minimum — which is the number that decides whether tonight works.
 */
export function casesByPlayerCount(
  cases: readonly CaseDefinition[],
): { count: number; cases: CaseDefinition[] }[] {
  const groups = new Map<number, CaseDefinition[]>();
  for (const def of cases) {
    const group = groups.get(def.minPlayers) ?? [];
    group.push(def);
    groups.set(def.minPlayers, group);
  }
  return [...groups.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([count, group]) => ({ count, cases: group }));
}
