/**
 * Case 008 — «عجل العيد».
 *
 * An Eid morning in an apartment building. A shared calf disappears from the
 * garage. Six neighbours, four rounds, two culprits who must both be caught.
 *
 * A room voting at random catches the culprits 40% of the time.
 *
 * Who did it is deliberately not in this file: see `src/content/culprits.ts`.
 */
import type { CaseDefinition } from '../../types';
import { CASE_008_CHARACTERS } from './characters';
import { CASE_008_EVIDENCE } from './evidence';
import { CASE_008_TRUTH } from './truth';

export const CASE_008: CaseDefinition = {
  id: 'case-008',
  title: 'عجل العيد',
  subtitle: 'سبع شقق دفعت فيه. والجراج الصبح فاضي.',

  mode: 'interrogation',
  rounds: 4,
  castKind: 'neighbours',
  castGender: 'mixed',

  intro: [
    'النهارده أول يوم العيد، والساعة ٦ الصبح.',
    'عمارة ١٤ اشتركت في عجل، زي كل سنة: سبع أسهم، كل سهم خمسة وعشرين ألف.',
    'الحاج فكري صاحب العمارة هو اللي جمع الفلوس، وجاب العجل من التاجر من تلات أيام، وقال إن وزنه ٤٥٠ كيلو.',
    'العجل بات في جراج العمارة، مربوط في العمود. الجراج تحت شباك أبلة سناء، وأوضة عم سعيد البواب جنب بابه.',
    'من تلات ليالي والعمارة مش نايمة من صوته. وأبلة سناء قالت قدام الكل: «لو فضل ليلة كمان، هفتحله الباب بإيدي.»',
    'وشيرين، اللي في الدور الرابع، كاتبة على صفحتها إنه هيتدبح على جثتها.',
    'الساعة ٦، عم سعيد فتح قفل الجراج عشان الجزار. العمود فاضي، والحبل مقطوع.',
    'في العمارة الصبح ده ستة: الحاج فكري، وأبلة سناء اللي ساكنة من أربعين سنة، وماجد بتاع الديليفري، وشيرين، ونيفين الساكنة الجديدة، وعم سعيد.',
    'الجزار جاي بعد الصلاة. وسبع عيلات مستنيين نصيبهم.',
    'هتفتحوا أربع حاجات. بعد كل واحدة، هتسألوا بعض، وبعدين هتسمّوا واحد.',
    'اللي تسمّوه بيخرج من دايرة الشك — ويقول حاجة واحدة قبل ما يخرج.',
    'عندكم أربع محاولات. واتنين فيكم عارفين العجل فين دلوقتي. لازم تمسكوا الاتنين.',
  ],

  minPlayers: 6,
  maxPlayers: 6,
  estimatedMinutes: 40,

  characters: CASE_008_CHARACTERS,
  evidence: CASE_008_EVIDENCE,

  decisionQuestion: 'مين ورا اختفاء العجل؟',

  truth: CASE_008_TRUTH,

  isPlaceholder: false,
};
