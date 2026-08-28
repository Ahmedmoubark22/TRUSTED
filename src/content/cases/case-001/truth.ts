import type { CaseTruth } from '../../types';

/**
 * Case 001 — what actually happened.
 *
 * The approved resolution, authored as data. The engine never asks which case
 * this is; it walks `facts` in `revealOrder` and shows one at a time.
 *
 * Two things this deliberately is not:
 *
 *   - It is not a verdict. Omar took the letter, but he is not a villain and
 *     the reveal never calls him one. The case is about people choosing
 *     protection over honesty, and every one of them did it for a reason.
 *   - It is not affected by the vote. The same seven truths come out in the
 *     same order whoever the room named. The vote only changes the one line
 *     that describes what the room found.
 *
 * The layers run outward: what happened tonight, then why, then the older
 * wrong underneath it, then the people who each kept a piece of it quiet.
 */
export const CASE_001_TRUTH: CaseTruth = {
  immediateAnswerCharacterId: 'omar',
  immediateFactId: 'who-took-the-letter',
  immediateActionPhrase: 'took the letter',

  facts: [
    {
      id: 'who-took-the-letter',
      question: 'Who took the letter?',
      statement: 'Omar took it.',
      importance: 'immediate',
      relatedEvidenceIds: ['e03'],
      relatedCharacterIds: ['omar'],
      revealOrder: 0,
      explanation:
        'Omar realised the letter had resurfaced. During the gathering he went into the study and took it.',
    },

    {
      id: 'why-omar-took-it',
      question: 'Why?',
      statement: 'Not to bury the truth.',
      importance: 'core',
      relatedEvidenceIds: ['e03'],
      relatedCharacterIds: ['omar'],
      revealOrder: 1,
      explanation:
        'He feared an unfinished letter would do what the last one did: land on the wrong person. Half the story would have accused someone all over again, and exposed several people without the context that explained them.',
    },

    {
      id: 'nadia-was-not-responsible',
      question: 'Who was blamed the first time?',
      statement: 'Nadia. She had done nothing.',
      importance: 'core',
      relatedEvidenceIds: [],
      relatedCharacterIds: [],
      revealOrder: 2,
      explanation:
        'When the altered financial records came to light, Nadia was publicly blamed for the damage. She was not responsible for any of it, and nobody corrected the record.',
    },

    {
      id: 'omar-altered-the-records',
      question: 'Then who was?',
      statement: 'Omar altered the records.',
      importance: 'core',
      relatedEvidenceIds: [],
      relatedCharacterIds: ['omar'],
      revealOrder: 3,
      explanation:
        'He did it trying to shield someone and head off something worse. Faris discovered the records had been changed, and Faris knew it was Omar. He let Nadia carry the blame anyway.',
    },

    {
      id: 'youssef-kept-the-letter',
      question: 'Where had the letter been?',
      statement: 'Youssef had it for years.',
      importance: 'core',
      relatedEvidenceIds: ['e03'],
      relatedCharacterIds: ['youssef', 'maya'],
      revealOrder: 4,
      explanation:
        'Faris wrote it privately about what he had found and gave it to Youssef before he died. Youssef hid it for years, certain he was protecting the family. It surfaced again only when Maya found it in the study and read as far as the tear.',
    },

    {
      id: 'samir-is-faris-son',
      question: 'And the fourth name on the invitation?',
      statement: 'Samir is Faris’s son.',
      importance: 'core',
      relatedEvidenceIds: ['e01', 'e02'],
      relatedCharacterIds: ['samir'],
      revealOrder: 5,
      explanation:
        'Samir found the evidence connecting him to Faris and came to the house looking for the truth about a father who never said so out loud. He did not tell the room who he was either.',
    },

    {
      id: 'the-chain-of-silence',
      question: 'So who did the damage?',
      statement: 'Everyone who chose to protect it.',
      importance: 'deeper',
      relatedEvidenceIds: ['e01', 'e02', 'e03'],
      relatedCharacterIds: ['maya', 'omar', 'youssef', 'samir'],
      revealOrder: 6,
      explanation:
        'The missing page was the context — the part that would have made the rest make sense. That is what Faris was really writing about. Not one person’s betrayal, but a line of people who each decided that someone was better off not knowing, and handed the silence on.',
    },
  ],
};
