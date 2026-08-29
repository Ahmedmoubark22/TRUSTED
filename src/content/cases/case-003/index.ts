/**
 * Case 003 — «الفويس».
 *
 * Four-player case, authored in Egyptian Arabic, implementing the approved
 * Revision v2. Characters, private briefings, three public objects and the
 * seven-layer resolution are all authored content (see `./characters.ts`,
 * `./briefings.ts`, `./evidence.ts` and `./truth.ts`). Nothing here is
 * scaffolding.
 *
 * Two things distinguish it from the earlier cases, and both are content
 * rather than machinery:
 *
 *   - Only three objects reach the table. The other two pieces of information
 *     the case turns on — تهاني's message and كريم's draft agreement — are
 *     private holdings in two briefings, spent by being *said*. The app cannot
 *     make a player spend them, and deliberately does not try.
 *   - There is a confrontation beat before the vote. It is one announced line
 *     (`confrontationPrompt`) plus an A/B each player already read in their own
 *     briefing. No phase, no event, no state.
 *
 * It asks its own decision question — «مين سرّب الفويس؟» — and the ballot and
 * grading are unchanged: the room names a character, and that name is read
 * against `truth`.
 */
import type { CaseDefinition } from '../../types';
import { CASE_003_CHARACTERS } from './characters';
import { CASE_003_EVIDENCE } from './evidence';
import { CASE_003_TRUTH } from './truth';

export const CASE_003: CaseDefinition = {
  id: 'case-003',
  title: 'الفويس',
  subtitle: 'حد قرر إن الحقيقة لازم تتقال — من غير ما يحط اسمه عليها.',
  intro: [
    'خطوبة سلمى وعمر خلصت بقالها حوالي نص ساعة. الصور اتاخدت، والجرن اتوزّع، والعيلتين قاعدين مع بعض لأول مرة في قعدة كبيرة.',
    'قبل الخطوبة بيومين، اتعمل جروب واتساب كبير للعيلتين عشان التنسيق.',
    'ومعلومة مهمة لازم تتقال بصوت واضح قدام الكل قبل ما نبدأ: منى هي اللي عملت جروب العيلتين، وضافت تهاني أدمن معاها عشان التنسيق. يعني الجروب فيه أدمنين، مش واحد.',
    'الساعة ٩:٤٧ بالليل، نزل في الجروب فويس ميسج من رقم مجهول. مدته حوالي ٤٠ ثانية.',
    'الصوت مش واضح بالكامل بسبب دوشة المكان، بس اللي اتفهم منه إن عمر بيتكلم عن أزمة مالية كبيرة في شركته، وإنه كان ناوي يخبّي الموضوع عن سلمى لحد ما الخطوبة تخلص.',
    'بعد دقيقتين، الفويس اتمسح. بس أربعة كانوا شافوه وأخدوا سكرين شوت قبل ما يتمسح.',
    'والسؤال دلوقتي مش «هل عمر عنده أزمة مالية؟» — ده بقى معروف.',
    'السؤال هو: مين سرّب الفويس للجروب؟',
    'كل واحد فيكم عنده سبب يخاف من سؤال مختلف، وكل واحد عنده معلومة يقدر يستعملها ضد حد تاني. بس واحد بس فيكم هو اللي سرّب.',
  ],

  // Authored for exactly four players: four characters, four briefings.
  minPlayers: 4,
  maxPlayers: 4,
  estimatedMinutes: 20,

  characters: CASE_003_CHARACTERS,

  evidence: CASE_003_EVIDENCE,

  decisionQuestion: 'مين سرّب الفويس؟',

  // Act 6. Said out loud by whoever is holding the device, to the whole table;
  // what each player may actually choose between is private to their briefing.
  confrontationPrompt:
    'آخر جولة قبل التصويت. كل واحد فيكم يقول حاجة واحدة بس من اللي كانوا في الورقة بتاعته: حاجة تحميه، أو حاجة تحطّ الضغط على حد تاني. واحدة بس — مش الاتنين.',

  truth: CASE_003_TRUTH,

  isPlaceholder: false,
};
