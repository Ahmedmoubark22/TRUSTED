import type { EvidenceDefinition } from '../../types';

/**
 * Case 002 — the objects on the table.
 *
 * Five approved objects. `requires` chains them in the authored order:
 * الدفتر → كشف الأدوار → إيصال القاعة → شاشة الموبايل → الظرف.
 *
 * Every object is built the same way the approved package writes it: a first
 * fragment for «اللي باين» — what the room sees at a glance — and a second for
 * «اللي بيبان لما تدقّق», which is never said aloud until somebody actually
 * examines that object. That split is the whole reason the objects are worth
 * picking up, so it is structural here rather than a note in the copy.
 *
 * Two objects carry a third fragment, and both are mechanics rather than
 * surface detail: E01 closes on the reclassification that re-reads E05, and
 * E04 closes on the cross-reference back to E01's phone numbers. Neither can
 * fire unless the table has actually read the object it depends on.
 *
 * Public by construction. Everything here is read out loud to the whole room,
 * so nothing a single character privately knows may appear — the private half
 * of this case lives in `./briefings.ts` and never travels with the case
 * definition.
 */
export const CASE_002_EVIDENCE: EvidenceDefinition[] = [
  {
    id: 'e01',
    type: 'notebook',
    title: 'الدفتر',
    description: 'كشكول جمعية غلافه كحلي، بخط سعاد.',
    fragments: [
      {
        caption: 'اللي باين',
        lines: [
          'الصفحة الأولى فيها أسامي الستة وأرقام تليفوناتهم بخط سعاد.',
          'وبعدها جدول الشهور، وجنب كل اسم كلمة «تم» بقلم جاف أزرق، وإمضا صغيرة جنبها.',
        ],
      },
      {
        caption: 'اللي بيبان لما تدقّق',
        lines: [
          'في تلات شهور — ٣ و٥ و٧ — اسم مصطفى مكتوب جنبه «تم» من غير إمضا.',
          'التلات «تم» دول مكتوبين بقلم جاف أسود، مش الأزرق اللي في باقي الدفتر، وبنفس خط سعاد.',
          'في نفس التلات شهور، سطر سعاد مكتوب فيه ٣٠,٠٠٠ مش ١٥,٠٠٠ — والصفر الزيادة متكتّب فوق رقم قديم.',
          'رقم تليفون مصطفى في الصفحة الأولى آخره ٤ أرقام واضحة — احفظوها، هتلزم.',
        ],
      },
      {
        caption: 'آلية إعادة التصنيف — من الدفتر للظرف',
        lines: [
          'أول ما الفرق بتاع الـ٤٥,٠٠٠ يتقال بصوت عالي في الأوضة، الظرف بيتحوّل من «قضية سرقة» لـ«قضية إخفاء»، وبيتفتح فيه تفصيلة زيادة.',
          'من غير الخطوة دي، الظرف بيفضل مقفول على مستوى «حد خد الفلوس».',
        ],
      },
    ],
    requires: [],
    discussionPrompt: 'سعاد، ليه «تم» بتاعت مصطفى من غير إمضا؟',
  },

  {
    id: 'e02',
    type: 'list',
    title: 'كشف الأدوار',
    description: 'ورقة مطبوعة معلّقة على باب المطبخ من أول السنة.',
    fragments: [
      {
        caption: 'اللي باين',
        lines: [
          'الشهر ١ — سعاد',
          'الشهر ٢ — مصطفى',
          'الشهر ٣ — جار (مش قاعد معانا)',
          'الشهر ٤ — نبيل',
          'الشهر ٥ — جارة (مش قاعدة معانا)',
          'الشهر ٦ — —',
          'الشهر ٧ — —',
          'الشهر ده — هدى',
        ],
      },
      {
        caption: 'اللي بيبان لما تدقّق',
        lines: [
          'مصطفى استلم دوره من بدري — الشهر التاني. يعني خد الـ٩٠ ألف بتاعته، وبعدها بشهور بطّل يدفع.',
          'هدى آخر واحدة في الدور — هي الوحيدة اللي لسه مخدتش حاجة خالص.',
          'جنب اسم مصطفى علامة قلم صغيرة، مش بخط سعاد.',
        ],
      },
    ],
    requires: ['e01'],
    discussionPrompt: 'هدى، إنتي الوحيدة اللي مخدتيش دورك. ده بيحطّك فين في الحكاية؟',
  },

  {
    id: 'e03',
    type: 'receipt',
    title: 'إيصال القاعة',
    description: 'إيصال إيجار القاعة الصغيرة، ٥٠ جنيه، بتاريخ الشهر اللي فات.',
    fragments: [
      {
        caption: 'اللي باين',
        lines: ['إيصال عادي خالص. مبلغ تافه. مفيش فيه حاجة.'],
      },
      {
        caption: 'اللي بيبان لما تدقّق — اقلب الإيصال',
        lines: [
          'حسبة بخط نبيل:',
          '٦ × ١٥٠٠٠ = ٩٠٠٠٠',
          'عدّيت بعنيا:',
          'شهر ٣ ← ٧٥٠٠٠',
          'شهر ٥ ← ٧٥٠٠٠',
          'شهر ٧ ← ٧٥٠٠٠',
          'الناقص: ١٥٠٠٠ × ٣ = ٤٥٠٠٠',
          'الدفتر: ٩٠٠٠٠ ✔',
          'اللي استلم: ٩٠٠٠٠ ✔',
          'يبقى مين اللي بيسدّ الفرق؟',
          'وتحتيها بخط أصغر ومضغوط: «اللي ماسك الدفتر.»',
        ],
      },
    ],
    requires: ['e02'],
    discussionPrompt: 'طب الـ٤٥ ألف راحوا فين؟',
  },

  {
    id: 'e04',
    type: 'phoneScreen',
    title: 'شاشة الموبايل',
    description: 'موبايل متحط على طرف الترابيزة، والشاشة نوّرت لوحدها. مش باين بتاع مين.',
    fragments: [
      {
        caption: 'اللي باين',
        lines: [
          'إشعار واتساب. الرقم مش متسجّل باسم، بس آخر أربع أرقام باينة على الشاشة:',
          '«متقلقش. غطّيتها. متقولش لحد.»',
        ],
      },
      {
        caption: 'اللي بيبان لما تدقّق',
        lines: [
          'تحتيه إشعار تاني من تطبيق توظيف: «٣ وظايف جديدة تناسب سيرتك الذاتية.»',
          'تاريخ رسالة الواتساب: الشهر السابع.',
          'الأربع أرقام اللي على الشاشة = آخر أربع أرقام في رقم مصطفى المكتوب في أول صفحة في الدفتر.',
          'يعني الرسالة دي متبعوتة لمصطفى، والموبايل ده بتاع اللي باعتها.',
        ],
      },
      {
        caption: 'الربط',
        lines: [
          'الربط ده مش بيتقفل غير لو حد فتح الدفتر وشاشة الموبايل مع بعض.',
          'لو الدفتر متفتحش، الأربع أرقام مش هيبقى ليها أي معنى.',
        ],
      },
    ],
    requires: ['e03'],
    discussionPrompt: 'مصطفى، إنت ساكت من ساعة ما قال يعدّوا. ليه؟',
  },

  {
    id: 'e05',
    type: 'envelope',
    title: 'الظرف',
    description: 'ظرف ورق مقوّى بني، مكتوب عليه بخط سعاد: «جمعية — دور هدى — ٩٠,٠٠٠».',
    fragments: [
      {
        caption: 'اللي باين أول ما يختفي',
        lines: ['مكانه فاضي على الترابيزة، والشاي اللي كان جنبه لسه سخن.'],
      },
      {
        caption: 'اللي بيبان لما يتلاقى',
        lines: [
          'الظرف ورا السخّان في حمام الضيوف الصغير.',
          'مقفول ومختوم زي ما هو.',
          'الـ٩٠,٠٠٠ كاملة. مفيش مليم ناقص.',
          'ركن الظرف من تحت مبلول ومتربّش من ورا السخان.',
          'على وشّه أثر إيد عرقانة، ومفيش أي محاولة فتح خالص.',
        ],
      },
      {
        caption: 'بعد إعادة التصنيف من الدفتر',
        lines: [
          'الظرف ما بقاش «الفلوس اللي اتسرقت» — بقى «الفلوس اللي حد استعجل يبعّدها عن العدّ».',
          'السؤال بيتغيّر من «مين عايز الـ٩٠ ألف؟» لـ«مين مكانش قادر يستحمل العدّ يحصل؟»',
        ],
      },
    ],
    requires: ['e04'],
    discussionPrompt: 'الظرف رجع مقفول ومفيش مليم ناقص. اللي عايز يسرق بيعمل كده؟',
  },
];
