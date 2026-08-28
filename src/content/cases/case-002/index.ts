/**
 * Case 002 — «الدور».
 *
 * Four-player case, authored in Egyptian Arabic. Characters, private
 * briefings, five objects and the seven-layer resolution are all approved
 * content (see `./characters.ts`, `./briefings.ts`, `./evidence.ts` and
 * `./truth.ts`). Nothing in this case is scaffolding.
 *
 * It asks its own decision question — «مين حرّك الظرف؟» — rather than the
 * product default. The ballot and the grading are unchanged: the room still
 * names a character, and that name is still read against `truth`.
 */
import type { CaseDefinition } from '../../types';
import { CASE_002_CHARACTERS } from './characters';
import { CASE_002_EVIDENCE } from './evidence';
import { CASE_002_TRUTH } from './truth';

export const CASE_002: CaseDefinition = {
  id: 'case-002',
  title: 'الدور',
  subtitle: 'كل واحد جه دوره.',
  intro: [
    'الجمعية بقالها سنة شغّالة.',
    'ستة جيران في نفس العمارة. كل واحد بيدفع ١٥,٠٠٠ جنيه في الشهر، وآخر الشهر بيتجمّع ٩٠,٠٠٠ ويروحوا لواحد فيهم حسب الدور.',
    'الليلة الدور على هدى.',
    'الظرف متحطّ على الترابيزة، والشاي متصبوب، والقعدة ماشية عادي… لحد ما نبيل قال جملة واحدة:',
    '«قبل ما الظرف يتسلّم، تعالوا نعدّه قدام بعض. مش عشان حاجة — عشان الذمة تبرأ.»',
    'سكتت الأوضة شوية. حد قال «ماشي يا عم». حد قال «وإيه لزومه دلوقتي؟». وقاموا يجيبوا الدفتر ويولّعوا نور الصالة.',
    'خمس دقايق. مش أكتر.',
    'ولما رجعوا… الظرف مش على الترابيزة.',
    'السؤال اللي في الأوضة دلوقتي: «مين خد الـ٩٠ ألف؟»',
    'بس اللي هيوصل للحقيقة، هو اللي هيسأل السؤال التاني: «مين كان خايف إن الـ٤٥ ألف تتفهم؟»',
  ],

  // Authored for exactly four players: four characters, four briefings. The
  // full جمعية is six; أم نادر and رمضان are absent tonight and are never dealt.
  minPlayers: 4,
  maxPlayers: 4,
  estimatedMinutes: 50,

  characters: CASE_002_CHARACTERS,

  evidence: CASE_002_EVIDENCE,

  decisionQuestion: 'مين حرّك الظرف؟',

  truth: CASE_002_TRUTH,

  isPlaceholder: false,
};
