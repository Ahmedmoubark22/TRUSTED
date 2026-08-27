import type { EvidenceDefinition } from '../../types';

/**
 * Case 001 — the objects on the table.
 *
 * Three approved objects for this slice. `requires` chains them in the
 * authored order: invitation → photograph → letter. Adding a fourth object is
 * content, not code.
 *
 * Public by construction. Everything here is read out loud to the whole room,
 * so nothing a single character privately knows may appear — the private half
 * of this case lives in `./briefings.ts` and never travels with the case
 * definition. Each object raises a question; none of them answers one.
 */
export const CASE_001_EVIDENCE: EvidenceDefinition[] = [
  {
    id: 'e01',
    type: 'invitation',
    title: 'The Invitation',
    description: 'A folded card, addressed by hand. The fold is soft from being opened more than once.',
    fragments: [
      {
        caption: 'The front of the card',
        lines: [
          'One year tonight.',
          'The family asks you to come to the house.',
          'Nothing formal. Nothing said aloud that does not need to be.',
        ],
      },
      {
        caption: 'The back of the card',
        lines: [
          'Four places were set.',
          'Maya. Omar. Youssef.',
          'And a fourth name, added later, in different ink: Samir.',
          'No family name. No explanation.',
        ],
      },
    ],
    requires: [],
    discussionPrompt: 'Who added the fourth name?',
  },

  {
    id: 'e02',
    type: 'photograph',
    title: 'The Photograph',
    description: 'A small print, creased across one corner, kept somewhere it would not be found by accident.',
    fragments: [
      {
        caption: 'The photograph',
        lines: [
          'Faris, younger, on a balcony in summer.',
          'Beside him a boy of nine or ten, squinting into the light.',
          "Faris's hand rests on the boy's shoulder. Nobody else is in the frame.",
        ],
      },
      {
        caption: 'Written on the back',
        lines: [
          'A date. Seventeen years ago.',
          "Beneath it, in Faris's handwriting: “S — the summer I could not say it.”",
        ],
      },
    ],
    requires: ['e01'],
    discussionPrompt: 'Who is the boy in the photograph?',
  },

  {
    id: 'e03',
    type: 'letter',
    title: 'The Letter',
    description: 'One page, folded four times. Whoever kept it kept it for a long while.',
    fragments: [
      {
        caption: 'The page begins',
        lines: [
          'I have been careful for a long time. I am tired of being careful.',
          'There are things in this house that are only true because nobody says them.',
        ],
      },
      {
        caption: 'Lower down the page',
        lines: [
          'I finally know who betrayed me.',
          'I am writing it down so that it cannot be argued with afterwards.',
          'It began the year that—',
        ],
      },
      {
        caption: 'Where the page ends',
        lines: [
          'The sentence carries on onto a second page.',
          'The second page is not here.',
        ],
      },
    ],
    requires: ['e02'],
    discussionPrompt: 'The page did not tear itself. Where is the rest of it?',
  },
];
