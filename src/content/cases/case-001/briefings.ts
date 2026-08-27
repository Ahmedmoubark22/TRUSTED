import type { CharacterId, PrivateBriefing } from '../../types';

/**
 * Case 001 — private briefings.
 *
 * PROTOTYPE CONTENT. This is the approved four-player slice, reproduced
 * exactly. Nothing here is expanded, embellished, or invented.
 *
 * This module is imported only by `src/content/briefings.ts`, which gates
 * access behind a single lookup. Nothing else should import it — pulling this
 * record into a component would put every character's secret in reach of a
 * view that has no business seeing it.
 */
export const CASE_001_BRIEFINGS: Record<CharacterId, PrivateBriefing> = {
  maya: {
    characterId: 'maya',
    identity: 'Maya Rahman',
    knows: [
      'You found an old envelope in the family study.',
      "Inside was part of Faris's letter.",
      'The letter says: "I finally know who betrayed me."',
      'The final page is missing.',
      'You noticed Omar behaving strangely after you mentioned the letter.',
    ],
    believes: ['Omar knows what happened.'],
    hiding: ['You read part of the letter before telling everyone.'],
    goal: 'Find out what Faris was trying to reveal.',
  },

  omar: {
    characterId: 'omar',
    identity: 'Omar Rahman',
    knows: [
      'You altered financial records years ago.',
      'Faris knew about it.',
      'You took the letter tonight.',
      'You know the missing page could expose several relationships.',
    ],
    believes: ['The complete truth could destroy the family.'],
    hiding: ['You took the letter.'],
    goal: 'Prevent the group from reaching a destructive false conclusion while protecting your own secret.',
  },

  youssef: {
    characterId: 'youssef',
    identity: 'Youssef Adel',
    knows: [
      'Faris gave you the letter before his death.',
      'You kept it hidden for years.',
      'You know Nadia was not responsible for the old financial problem.',
      "You know more about Samir's connection to Faris than you initially admit.",
    ],
    believes: ['Some truths can cause more damage if revealed without context.'],
    hiding: ['You knew about the letter for years and deliberately kept it hidden.'],
    goal: 'Control how the truth emerges.',
  },

  samir: {
    characterId: 'samir',
    identity: 'Samir',
    knows: [
      'Faris was your biological father.',
      'You discovered evidence connecting you to him.',
      'You believe the letter may explain why he never acknowledged you publicly.',
    ],
    believes: ["The letter may contain the answer you've been looking for."],
    hiding: ['Your true relationship to Faris.'],
    goal: 'Discover what your father wanted you to know.',
  },
};
