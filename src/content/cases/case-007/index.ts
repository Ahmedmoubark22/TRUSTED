/**
 * Case 007 — «النهائي».
 *
 * The final match of the neighbourhood Ramadan tournament. Four childhood
 * friends, one captain, one sold them all. Two rounds, four players.
 *
 * A room voting at random catches the culprit 50% of the time.
 *
 * Who did it is deliberately not in this file: see `src/content/culprits.ts`.
 */
import type { CaseDefinition } from '../../types';
import { CASE_007_CHARACTERS } from './characters';
import { CASE_007_EVIDENCE } from './evidence';
import { CASE_007_TRUTH } from './truth';

export const CASE_007: CaseDefinition = {
  id: 'case-007',
  title: 'النهائي',
  subtitle: 'خسرنا بجون. وواحد فينا قبض تمنه.',

  mode: 'interrogation',
  rounds: 2,
  castKind: 'friends',
  castGender: 'men',

  intro: [
    'نهائي دورة رمضان في الحي. بعد التراويح، والشارع كله واقف على الرصيف.',
    'الجايزة خمسين ألف وكاس، وفريق الشارع وصل النهائي لأول مرة من عشر سنين.',
    'الفريق التاني فريق المعرض. راعيه الحاج صبري صاحب معرض العربيات، وابنه سامح هو اللي ماسكه.',
    'خسرتوا ٢–١. جون من تسديدة ضعيفة، وجون في مرماكم، وجزا ضاع في آخر دقيقة.',
    'بعد الماتش بساعة، الحاج ممدوح منظّم الدورة جاله سكرين من رقم مش متسجل، ومعاه جملة واحدة: «فريقكم اتباع. اسألوا نفسكم.»',
    'الحاج ممدوح وقّف فلوس المركز التاني، وقال إن الفريق مش هيلعب الدورة الجاية لحد ما يطلع مين.',
    'أربعة لعبوا النهائي من أول دقيقة: عمرو مجدي الكابتن، وعلي منصور الحارس، ويوسف سمير المهاجم، وحسام عادل في الدفاع.',
    'أصحاب من أيام الابتدائي، وبيلعبوا مع بعض من قبل ما يعرفوا يربطوا الجزمة.',
    'هتفتحوا حاجتين. بعد كل واحدة، هتسألوا بعض، وبعدين هتسمّوا واحد.',
    'اللي تسمّوه بيخرج من دايرة الشك — ويقول حاجة واحدة قبل ما يخرج.',
    'عندكم محاولتين. وواحد فيكم عارف بالظبط التلاتين ألف راحوا فين.',
  ],

  minPlayers: 4,
  maxPlayers: 4,
  estimatedMinutes: 20,

  characters: CASE_007_CHARACTERS,
  evidence: CASE_007_EVIDENCE,

  decisionQuestion: 'مين باع الماتش؟',

  truth: CASE_007_TRUTH,

  isPlaceholder: false,
};
