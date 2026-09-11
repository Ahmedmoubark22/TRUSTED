import type { EvidenceDefinition } from '../../types';

/**
 * Case 005 — الشبكة (The Network).
 *
 * Three objects, one per round, chaining from e01 to e02 to e03.
 * Each implicates multiple characters. Structure real, prose placeholder.
 */
export const CASE_005_EVIDENCE: EvidenceDefinition[] = [
  {
    id: 'e01',
    type: 'phoneScreen',
    title: 'نقلة التليفون',
    description: 'موقع الرقم الأخير اللي اتنقل من الشبكة قبل الحادثة بدقيقتين.',
    fragments: [
      {
        caption: 'الموقع الحالي',
        lines: ['القرب من دار الصاغة — في حي الشرقية.'],
      },
      {
        caption: 'الوقت',
        lines: ['8:45 مساء — دقيقتين بالظبط قبل اللي حصل.'],
      },
      {
        caption: 'الخريطة توضح',
        lines: [
          'اتنين من الخمسة كانوا قريبين من المكان ده — حسّان وملاك.',
          'التلاتة التانيين كانوا بعيدين.',
        ],
      },
    ],
    requires: [],
    implicates: ['hassan', 'malak'],
    discussionPrompt: 'مين كان عند دار الصاغة في الوقت ده؟',
  },
  {
    id: 'e02',
    type: 'list',
    title: 'سجل الأنشطة',
    description: 'سجل الحركات في دار الصاغة — كل واحد دخل وطلع كام.',
    fragments: [
      {
        caption: 'بين 8:30 و8:50',
        lines: ['ملاك — دخلت 8:32، طلعت 8:41', 'حسّان — دخل 8:37، طلع 8:51'],
      },
      {
        caption: 'المفاجأة',
        lines: [
          'في شخص تالت — محدش من الخمسة بس اسمه مسجّل هنا.',
          'دخل 8:34، وطلع 8:47.',
        ],
      },
      {
        caption: 'الملحوظة من المتحدث',
        lines: [
          'قال إن التلات دخلات متشابهة كتير — واحد بعد التاني بفترات قصيرة.',
          'وفي عجلة في الحركات ده.',
        ],
      },
    ],
    requires: ['e01'],
    implicates: ['hassan', 'malak', 'nadia'],
    discussionPrompt: 'ليه كل واحد من الاتنين راح دار الصاغة؟',
  },
  {
    id: 'e03',
    type: 'receipt',
    title: 'فاتورة من الصائغ',
    description: 'إيصال يد من دار الصاغة — مكتوب عليه اسم وتاريخ.',
    fragments: [
      {
        caption: 'المجموع',
        lines: ['٥٠,٠٠٠ جنيه — فلوس كتيرة.'],
      },
      {
        caption: 'اسم المشتري',
        lines: ['حسّان المنصور — وده بيوقع الحاجة.'],
      },
      {
        caption: 'التاريخ والملحوظة',
        lines: [
          'التاريخ ده مكتوب 8:45 بالظبط.',
          'في تعليق بخط اليد: «تم السداد نقداً — بتاع الصفقة.»',
        ],
      },
    ],
    requires: ['e02'],
    implicates: ['hassan', 'nadia', 'kareem'],
    discussionPrompt: 'الفلوس دي من فين؟ ولمين حقيقي؟',
  },
];
