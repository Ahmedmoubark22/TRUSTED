import type { EvidenceDefinition } from '../../types';

/**
 * Case 003 — the objects on the table.
 *
 * Three public objects, chained: EV-1 → EV-2 → EV-5, in the approved C7 order.
 * The numbering is the approved design's own and is kept: EV-3 and EV-4 exist,
 * but they are private holdings that live in `./briefings.ts` and are spent by
 * a player *saying* them. They are deliberately not objects here — a rendered
 * artefact cannot be disputed, and both of them are worth more as a claim.
 *
 * Every object is built the same way Case 002 builds one: a first fragment for
 * «اللي باين», and a second for «اللي بيبان لما تدقّق» that is never said aloud
 * until somebody actually examines the object.
 *
 * The chain carries the three beats the case is built from — access,
 * opportunity, behaviour — and each object states a plain fact a player can
 * repeat from memory. The difficulty is interpretive throughout; no object
 * needs re-reading to be understood, and no object names the culprit.
 *
 * Public by construction. Nothing a single character privately knows may
 * appear here.
 */
export const CASE_003_EVIDENCE: EvidenceDefinition[] = [
  {
    id: 'ev-1',
    type: 'phoneScreen',
    title: 'السكرين شوت',
    description: 'سكرين شوت من جروب العيلتين، متبعوت من واحد من اللي قاعدين.',
    fragments: [
      {
        caption: 'اللي باين',
        lines: [
          'رسالة صوتية من رقم مش متسجّل باسم.',
          'اتبعتت ٩:٤٧. مدتها ٤٠ ثانية تقريبًا.',
          'اتمسحت ٩:٤٩.',
        ],
      },
      {
        caption: 'اللي بيبان لما تدقّق — تفاصيل العضوية',
        lines: [
          'الرقم اتضاف للجروب مباشرة بواسطة أدمن. مش عن طريق لينك دعوة.',
          'الرقم خرج من الجروب ٩:٥٠، وأول ما خرج، سجل الإضافة راح معاه.',
          'يعني باين إن أدمن هو اللي ضافه — بس مبقاش باين أنهي أدمن.',
          'والجروب فيه أدمنين: منى وتهاني.',
        ],
      },
    ],
    requires: [],
    discussionPrompt: 'الأدمن اتنين. مين فيهم كان ماسك الموبايل الساعة ٩:٤٧؟',
  },

  {
    id: 'ev-2',
    type: 'list',
    title: 'مين شاف الفويس قبل ما يتمسح',
    description: 'كشف بأسامي اللي أخدوا سكرين شوت في الدقيقتين اللي قبل الحذف.',
    fragments: [
      {
        caption: 'اللي باين',
        lines: [
          'أربعة أخدوا سكرين شوت قبل ما الفويس يتمسح:',
          'منى',
          'تهاني',
          'كريم',
          'ياسر',
        ],
      },
      {
        caption: 'اللي بيبان لما تدقّق — التوقيتات',
        lines: [
          'منى — بعد وصول الفويس بـ٢ ثانية. مفيش تفسير معلن.',
          'تهاني — بعد ٩ ثواني. كانت بتكلم البوفيه على الواتساب.',
          'كريم — بعد ٤٧ ثانية. كان بره على التليفون.',
          'ياسر — بعد ١ دقيقة و٥٠ ثانية. كان بيسلّم على ناس.',
        ],
      },
    ],
    requires: ['ev-1'],
    discussionPrompt: 'ثانيتين وتسع ثواني. مين فينا كان عارف حاجة قبل ما الفويس ينزل؟',
  },

  {
    id: 'ev-5',
    type: 'photograph',
    title: 'صورة من صور الخطوبة — ٩:٤٧',
    description: 'صورة واسعة من صور المصوّر، الوقت المكتوب عليها ٩:٤٧ بالظبط.',
    fragments: [
      {
        caption: 'اللي باين',
        lines: [
          'صورة عامة للقعدة، اتاخدت ٩:٤٧ بالظبط — نفس دقيقة الفويس.',
          'الأوضة مليانة، والناس واقفة ومتفرّقة.',
        ],
      },
      {
        caption: 'اللي بيبان لما تدقّق — كل واحد كان فين',
        lines: [
          'منى عند طاولة الشاي، والموبايل في إيدها. مش على الترابيزة.',
          'كريم بره على البلكونة، بيتكلم في التليفون.',
          'ياسر واقف عند الباب، وموبايله مش باين في الصورة.',
          'تهاني مش ظاهرة في الصورة خالص.',
        ],
      },
    ],
    requires: ['ev-2'],
    discussionPrompt: 'إيه تاني اللي اتقال النهاردة ومش متطابق مع الصورة؟',
  },
];
