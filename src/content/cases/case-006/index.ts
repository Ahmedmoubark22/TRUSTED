/**
 * Case 006 — «ليلة الحنة».
 *
 * The bride's henna night. A stained dress, a deleted message, and four
 * friends each holding a secret. Two rounds, four players, one culprit who
 * acts on what she thinks nobody else knows.
 *
 * A room voting at random catches the culprit 50% of the time — see
 * `randomRoomWinOdds`, which a test holds inside a band.
 *
 * Who did it is deliberately not in this file: see `src/content/culprits.ts`.
 */
import type { CaseDefinition } from '../../types';
import { CASE_006_CHARACTERS } from './characters';
import { CASE_006_EVIDENCE } from './evidence';
import { CASE_006_TRUTH } from './truth';

export const CASE_006: CaseDefinition = {
  id: 'case-006',
  title: 'ليلة الحنة',
  subtitle: 'الفستان كان أبيض الساعة واحدة. الصبح، لأ.',

  mode: 'interrogation',
  rounds: 2,
  castKind: 'friends',
  castGender: 'women',

  intro: [
    'الليلة كانت ليلة حنة دينا. والفرح بكرة الساعة ٨.',
    'أم سيد الحنانة مشيت الساعة ١٢، وسابت كوباية حنة فاضلة في المطبخ.',
    'أربع صاحبات باتوا مع دينا على مراتب في الصالة، زي ما وعدوها من أيام الجامعة: رنا، وياسمين، وشهد، ومي.',
    'والكل عارف إن ياسمين كانت مخطوبة لمروان، العريس، قبل ما يعرف دينا.',
    'الساعة واحدة، دينا ورّتهم الفستان للمرة الأخيرة. كان متعلق في كيسه على باب الدولاب، وكان أبيض.',
    'الساعة ٧ الصبح، دينا دخلت أوضتها تبص عليه.',
    'على صدر الفستان، بقعة حنة كبيرة. متدعكة بالطول.',
    'دينا قافلة على نفسها الحمام ومش راضية تفتح لحد. والمصوّر جاي الساعة ٣.',
    'هتفتحوا حاجتين. بعد كل واحدة، هتسألوا بعض، وبعدين هتسمّوا واحدة.',
    'اللي تسمّوها بتخرج من دايرة الشك — وتقول حاجة واحدة قبل ما تخرج.',
    'عندكم محاولتين. وواحدة فيكم عارفة بالظبط البقعة دي جت إزاي.',
  ],

  // Authored for exactly four. Every character is dealt.
  minPlayers: 4,
  maxPlayers: 4,
  estimatedMinutes: 20,

  characters: CASE_006_CHARACTERS,
  evidence: CASE_006_EVIDENCE,

  decisionQuestion: 'مين بوّظت الفستان؟',

  truth: CASE_006_TRUTH,

  // Structure final, prose final.
  isPlaceholder: false,
};
