/**
 * Case 004 — «آخر واحد شافه».
 *
 * The collection's first `interrogation` case, and a **trial**: the structure
 * is finished and the prose is not. Rounds, evidence with `implicates`, five
 * briefings with elimination cards and one culprit who knows — all real, all
 * playable end to end. The writing is placeholder, which is what
 * `isPlaceholder` says, and it is here to be felt at a table before five
 * finished briefings get written against a loop nobody has played yet.
 *
 * Three rounds, five suspects, one culprit. A room voting at random catches
 * him 60% of the time — see `randomRoomWinOdds`, which a test holds inside a
 * band so a case cannot ship unwinnable or unlosable.
 *
 * Who did it is deliberately not in this file, and not anywhere a view can
 * reach: see `src/content/culprits.ts`.
 */
import type { CaseDefinition } from '../../types';
import { CASE_004_CHARACTERS } from './characters';
import { CASE_004_EVIDENCE } from './evidence';
import { CASE_004_TRUTH } from './truth';

export const CASE_004: CaseDefinition = {
  id: 'case-004',
  title: 'آخر واحد شافه',
  subtitle: 'واحد فيكم عارف. وهو قاعد معاكم دلوقتي.',

  mode: 'interrogation',
  rounds: 3,
  castKind: 'colleagues',
  castGender: 'mixed',

  intro: [
    'خمس زمايل في شركة إنتاج صغيرة، وآخر ليلة تصوير في بيت مستأجر بعيد عن أي حاجة.',
    'معاهم مؤسس الشركة — الراجل اللي جمعهم كلهم، والوحيد اللي بيقرر.',
    'الصبح، اتلاقى ميت تحت السلم.',
    'الرواية إنه وقع. ودي رواية معقولة: سلم قديم، وضلمة، وواحد في الستين.',
    'ولازم تتقال حاجة بصوت واضح قدام الكل قبل ما نبدأ: البيت مكانش فيه حد غيركم الخمسة.',
    'وفي حاجة تانية محدش فيكم يعرفها لحد دلوقتي — بس هتعرفوها.',
    'كل واحد فيكم قعد معاه على انفراد بالليل. وكل واحد فيكم فاكر إنه الوحيد اللي عمل كده.',
    'هتفتحوا تلات حاجات. بعد كل واحدة، هتسألوا بعض، وبعدين هتسمّوا واحد.',
    'اللي تسمّوه بيخرج من دايرة الشك — ويقول حاجة واحدة قبل ما يخرج.',
    'عندكم تلات محاولات. وواحد فيكم عارف بالظبط إنه محتاج يعدّيهم.',
  ],

  // Authored for exactly five. Every character is dealt, which is what keeps
  // the culprit always in the room.
  minPlayers: 5,
  maxPlayers: 5,
  estimatedMinutes: 30,

  characters: CASE_004_CHARACTERS,
  evidence: CASE_004_EVIDENCE,

  decisionQuestion: 'مين عمل كده؟',

  truth: CASE_004_TRUTH,

  // Structure final, prose provisional. This is the trial, not the case.
  isPlaceholder: true,
};
