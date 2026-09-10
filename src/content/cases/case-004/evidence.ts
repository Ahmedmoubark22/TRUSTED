import type { EvidenceDefinition } from '../../types';

/**
 * Case 004 — three objects, one per round.
 *
 * The rule that separates these from Cases 001–003: **every object implicates
 * at least two people, and none of them settles anything.** The earlier cases
 * run a `requires` chain that narrows until one name is left; here the chain
 * only sets the order, and what actually narrows the room is the elimination.
 * An object that named one person would answer the case in round one and
 * leave the other two rounds with nothing to interrogate.
 *
 * `implicates` is authored design metadata about a shared object rather than
 * anybody's private knowledge, so the interrogation screen is free to read it
 * out — and `tests/rounds.test.ts` holds the floor of two.
 *
 * Placeholder prose, real structure.
 */
export const CASE_004_EVIDENCE: EvidenceDefinition[] = [
  {
    id: 'e01',
    type: 'form',
    title: 'التقرير المبدئي',
    description: 'ورقة واحدة، متطبوعة، متنيلة من تحت.',
    fragments: [
      {
        caption: 'فوق',
        lines: ['الوفاة بين الساعة ٢:٠٠ و٣:٣٠.'],
      },
      {
        caption: 'تحت السطر التالت',
        lines: [
          'الإصابة اللي في مؤخرة الراس مش متسقة مع الوقوع من على السلم.',
          'يعني: مش حادثة.',
        ],
      },
      {
        caption: 'على الجنب، بخط اليد',
        lines: ['في الوقت ده، اتنين بس قالوا إنهم كانوا صاحيين — وسام وندى.'],
      },
    ],
    requires: [],
    implicates: ['wessam', 'nada'],
    discussionPrompt: 'الرواية اتغيرت. مين كان صاحي، ومين قال إنه كان نايم؟',
  },
  {
    id: 'e02',
    type: 'phoneScreen',
    title: 'كشف الراوتر',
    description: 'البيت فيه راوتر واحد. أي تليفون بيتفصل لما صاحبه يبعد عنه.',
    fragments: [
      {
        caption: 'النافذة من ٢:٠٠ لـ ٣:٣٠',
        lines: ['تلات تليفونات اتفصلوا واتوصلوا تاني في النص ساعة دي.'],
      },
      {
        caption: 'الأسماء',
        lines: ['طارق — ٢:١٢', 'هالة — ٢:٤٠', 'عصام — ٢:٥٥'],
      },
      {
        caption: 'ملحوظة تحت الجدول',
        lines: ['الكشف بيقول إن حد اتحرك. مبيقولش راح فين.'],
      },
    ],
    requires: ['e01'],
    implicates: ['tarek', 'hala', 'essam'],
    discussionPrompt: 'تلاتة اتحركوا. واحد منهم بس محتاج يفسّر أكتر من التانيين.',
  },
  {
    id: 'e03',
    type: 'phoneScreen',
    title: 'تليفون المؤسس',
    description: 'الشاشة لسه شغالة. البطارية ١١٪.',
    fragments: [
      {
        caption: 'آخر حاجة اتكتبت — ومتبعتتش',
        lines: ['«أنا آسف. مكانش قصدي تعرف كده.»'],
      },
      {
        caption: 'مكالمة اترفضت، ٢:٥١',
        lines: ['رقم عصام.'],
      },
      {
        caption: 'قبلها بساعة',
        lines: ['رسالة اتبعتت لوسام: «بكرة الصبح هقول لهم.»'],
      },
    ],
    requires: ['e02'],
    implicates: ['essam', 'wessam'],
    discussionPrompt: 'الرسالة كانت لمين؟ ومين كان عارف إنها جاية؟',
  },
];
