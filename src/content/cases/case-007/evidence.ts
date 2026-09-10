import type { EvidenceDefinition } from '../../types';

/**
 * Case 007 — النهائي (The Final).
 *
 * Two objects, one per round, chaining from e01 to e02.
 */
export const CASE_007_EVIDENCE: EvidenceDefinition[] = [
  {
    id: 'e01',
    type: 'form',
    title: 'ورقة الحكم',
    description: 'تقرير الحكم الرسمي عن النهائي، متعلّق على باب القهوة.',
    fragments: [
      {
        caption: 'الأهداف',
        lines: [
          '١٥ — هدف للفريق. يوسف.',
          '٣٤ — هدف للخصم. تسديدة من برّه الصندوق، على إيد الحارس الشمال. الحارس: علي.',
          '٧١ — هدف في مرماه. المدافع: حسام.',
        ],
      },
      {
        caption: 'ضربة الجزاء',
        lines: ['٩٠+٢ — ضربة جزاء للفريق. المسدد: يوسف. ضايعة.'],
      },
      {
        caption: 'التغييرات',
        lines: [
          '٢٠ — خروج الكابتن عمرو، إصابة في الرجل.',
          'الحارس الاحتياطي: مفيش. زياد اتشال من القايمة قبل النهائي.',
        ],
      },
    ],
    requires: [],
    implicates: ['ali', 'hossam', 'youssef'],
    discussionPrompt:
      'تلات غلطات في ماتش واحد. واحدة بس فيهم اتقبض تمنها.',
  },
  {
    id: 'e02',
    type: 'phoneScreen',
    title: 'السكرين',
    description:
      'اللي وصل للحاج ممدوح من الرقم المش متسجل، بعد الماتش بساعة.',
    fragments: [
      {
        caption: 'التحويل',
        lines: [
          'إنستاباي — تحويل ناجح — ٣٠,٠٠٠ جنيه.',
          'من: س**** ص****',
          'إلى: ع**** م****',
        ],
      },
      {
        caption: 'التاريخ',
        lines: ['قبل النهائي بيومين، الساعة ١١:٤٠ بالليل.'],
      },
      {
        caption: 'تحت السكرين',
        lines: ['«فريقكم اتباع. اسألوا نفسكم.»'],
      },
    ],
    requires: ['e01'],
    implicates: ['amr', 'ali'],
    discussionPrompt:
      'اتنين في الفريق اسمهم بيبدأ بـ ع وم. مين فيهم كان محتاج تلاتين ألف؟ ومين اللي بعت؟',
  },
];
