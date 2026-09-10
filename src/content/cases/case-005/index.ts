/**
 * Case 005 — «الشبكة».
 *
 * The network of family, business, and hidden money. Five people, three rounds,
 * one culprit who takes what his family has kept hidden. Structure finished,
 * prose provisional.
 *
 * A room voting at random catches the culprit 60% of the time — see
 * `randomRoomWinOdds`, which a test holds inside a band.
 *
 * Who did it is deliberately not in this file: see `src/content/culprits.ts`.
 */
import type { CaseDefinition } from '../../types';
import { CASE_005_CHARACTERS } from './characters';
import { CASE_005_EVIDENCE } from './evidence';
import { CASE_005_TRUTH } from './truth';

export const CASE_005: CaseDefinition = {
  id: 'case-005',
  title: 'الشبكة',
  subtitle: 'خمس ناس، فلوس مخبية، وواحد ما يقدرش يستنى.',

  mode: 'interrogation',
  rounds: 3,
  castKind: 'family',
  castGender: 'mixed',

  intro: [
    'خمس ناس في عايلة واحدة — والعايلة دي فيها أسرار كتيرة.',
    'فلوس مخبية من سنين، وكل واحد فيهم حط يده عليها.',
    'اليومة دي، حد منهم أخذ فلوس كتيرة — من دار الصاغة.',
    'الفاتورة بإسمه. السجل بيقول إنه كان هناك. والشبكة كلها بتشير إليه.',
    'بس كل واحد من الباقيين عارف حاجة عن الحاجة دي.',
    'وكل واحد فيهم لهم سبب يسكّتوا.',
    'هتفتحوا تلات حاجات. بعد كل واحدة، هتسألوا بعض.',
    'وبعدين هتسمّوا واحد.',
    'اللي تسمّوه بيخرج — ويقول حاجة واحدة قبل ما يخرج.',
    'عندكم تلات محاولات. والشبكة دي كاملة.',
    'واحد فيكم عارف الحقيقة — وهو عايز يعدّي الجولات من غير ما حد يشوفه.',
    'فلوس العايلة دي — كان الأمل إنها تاني ليها. بس غِيرت إيد، ودلوقتي تاني الكل.',
  ],

  // Authored for exactly five. Every character is dealt.
  minPlayers: 5,
  maxPlayers: 5,
  estimatedMinutes: 30,

  characters: CASE_005_CHARACTERS,
  evidence: CASE_005_EVIDENCE,

  decisionQuestion: 'مين أخذ الفلوس؟',

  truth: CASE_005_TRUTH,

  // Structure final, prose provisional.
  isPlaceholder: true,
};
