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
 */

const KIND_LABELS: Record<CastKind, string> = {
  family: 'عيلة',
  neighbours: 'جيران',
  friends: 'أصحاب',
  colleagues: 'زمايل شغل',
  strangers: 'ناس ما تعرفش بعض',
};

const GENDER_LABELS: Record<CastGender, string> = {
  women: 'بنات',
  men: 'شباب',
  mixed: 'مختلط',
};

/** The size a case is authored for, as a label — "5" or "4–6". */
export function playerCountLabel(def: CaseDefinition): string {
  return def.minPlayers === def.maxPlayers
    ? `${def.minPlayers}`
    : `${def.minPlayers}–${def.maxPlayers}`;
}

/**
 * The one line under a case's title.
 *
 * Player count first, because that is the question a group actually has to
 * answer before anything else — there are five of us, what can we play?
 */
export function caseMetaLine(def: CaseDefinition): string {
  const parts = [`${playerCountLabel(def)} لاعيبة`];
  if (def.castKind) parts.push(KIND_LABELS[def.castKind]);
  if (def.castGender) parts.push(GENDER_LABELS[def.castGender]);
  parts.push(`~${def.estimatedMinutes} د`);
  if (def.mode === 'interrogation') parts.push('استجواب');
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
