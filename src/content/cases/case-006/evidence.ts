import type { EvidenceDefinition } from '../../types';

/**
 * Case 006 — ليلة الحنة (The Henna Night).
 *
 * Two objects, one per round, chaining from e01 to e02.
 * Each implicates multiple characters. Structure real, prose final.
 */
export const CASE_006_EVIDENCE: EvidenceDefinition[] = [
  {
    id: 'e01',
    type: 'photograph',
    title: 'صور الصبح',
    description: 'دينا صوّرت صورتين الساعة ٧، قبل ما تقفل على نفسها الحمام.',
    fragments: [
      {
        caption: 'الصورة الأولى — الفستان',
        lines: [
          'بقعة حنة بني محمر على الصدر.',
          'متدعكة بالطول، مش نقطة وقعت.',
        ],
      },
      {
        caption: 'نفس الصورة — الكيس',
        lines: [
          'الكيس مقفول من فوق.',
          'بس في سوستة صغيرة من تحت، مفتوحة لآخرها.',
          'ومطبوع على الكيس: «أتيليه شهد».',
        ],
      },
      {
        caption: 'الصورة التانية — الصالة',
        lines: [
          'كوباية الحنة اللي كانت في المطبخ، فاضية ومتمسحة من جوه، جنب مرتبة ياسمين.',
        ],
      },
    ],
    requires: [],
    implicates: ['shahd', 'yasmin'],
    discussionPrompt:
      'الكيس اتفتح من سوستة مش باينة، والكوباية باتت جنب ياسمين. مين يعرف الكيس ده من جوه؟',
  },
  {
    id: 'e02',
    type: 'phoneScreen',
    title: 'جروب «حنة ديدي»',
    description: 'جروب الشلة على واتساب. آخر رسايل قبل الفجر.',
    fragments: [
      {
        caption: 'الساعة ٢:٤٧',
        lines: ['رنا: «حد صاحي؟»', 'محدش رد.'],
      },
      {
        caption: 'الساعة ٣:٠٥',
        lines: [
          'مي نزّلت ستوري: البلكونة ضلمة، ومكتوب «صاحية لوحدي كالعادة».',
        ],
      },
      {
        caption: 'الساعة ٣:٢٠',
        lines: ['ياسمين: «تم حذف هذه الرسالة»'],
      },
    ],
    requires: ['e01'],
    implicates: ['rana', 'mai', 'yasmin'],
    discussionPrompt:
      'تلاتة كانوا صاحيين الساعة ٣. واحدة فيهم كانت عايزة تتأكد إن محدش صاحي.',
  },
];
