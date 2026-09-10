import type { CaseTruth } from '../../types';

/**
 * Case 006 — ليلة الحنة (The Henna Night).
 *
 * Seven facts in reveal order: who, why, the-cup, the-deleted, the-irony,
 * the-others, and dina.
 *
 * Prose final, structure real.
 */
export const CASE_006_TRUTH: CaseTruth = {
  immediateAnswerCharacterId: 'rana',
  immediateFactId: 'who',
  immediateActionPhrase: 'بوّظت الفستان',

  facts: [
    {
      id: 'who',
      question: 'مين بوّظت الفستان؟',
      statement: 'رنا.',
      importance: 'immediate',
      relatedEvidenceIds: ['e01', 'e02'],
      relatedCharacterIds: ['rana'],
      revealOrder: 0,
      explanation:
        'الساعة ٢:٤٧ اتأكدت إن محدش صاحي. الساعة ٣:١٠ جابت كوباية الحنة من المطبخ، وفتحت الكيس من السوستة المخفية اللي عرفتها وهي بتعلّقه مع شهد، ودعكت الحنة على الصدر. ورجّعت الكوباية جنب مرتبة ياسمين.',
    },
    {
      id: 'why',
      question: 'ليه؟',
      statement: 'عشان الفرح يتأجل.',
      importance: 'core',
      relatedEvidenceIds: [],
      relatedCharacterIds: ['rana'],
      revealOrder: 1,
      explanation:
        'من أسبوع شافت رسايل بين مروان وبنت تانية. قالت لدينا، ودينا قالتلها إنها غيرانة. رنا حسبتها: من غير فستان، الفرح يتأجل أسبوع. وأسبوع كفاية تجيب الدليل اللي دينا مش هتقدر تكذّبه.',
    },
    {
      id: 'the-cup',
      question: 'والكوباية؟',
      statement: 'اتحطت جنب ياسمين بقصد.',
      importance: 'core',
      relatedEvidenceIds: ['e01'],
      relatedCharacterIds: ['rana', 'yasmin'],
      revealOrder: 2,
      explanation:
        'مكانتش هناك وياسمين نايمة. رنا اختارت أسهل واحدة الأوضة هتصدّق عليها: خطيبة مروان القديمة. ودي الحتة اللي بتخلي اللي عملته جريمة مش غلطة: كانت مستعدة صاحبتها تشيلها.',
    },
    {
      id: 'the-deleted',
      question: 'والرسالة اللي ياسمين مسحتها؟',
      statement: 'كانت هتقول لدينا نفس الحاجة.',
      importance: 'core',
      relatedEvidenceIds: ['e02'],
      relatedCharacterIds: ['yasmin', 'rana'],
      revealOrder: 3,
      explanation:
        'ياسمين سابت مروان من سنتين لنفس السبب. جت الليلة دي عشان تحذّر دينا، وكتبتلها الساعة ٣:٢٠، وبعتتها على الجروب بالغلط، ومسحتها. رنا وياسمين كانوا عايزين نفس الحاجة، وكل واحدة فيهم فاكرة إنها لوحدها.',
    },
    {
      id: 'the-irony',
      question: 'يعني رنا كان عندها حق؟',
      statement: 'في مروان، آه. في اللي عملته، لأ.',
      importance: 'deeper',
      relatedEvidenceIds: [],
      relatedCharacterIds: ['rana', 'yasmin'],
      revealOrder: 4,
      explanation:
        'الدليل اللي كانت بتدوّر عليه كان نايم على بعد مرتبتين منها. لو كانت سألت ياسمين سؤال واحد كمان بدل ما تشيل الكوباية، دينا كانت عرفت الحقيقة من غير ما فستانها يتبوّظ، ومن غير ما صاحبتها تتّهم.',
    },
    {
      id: 'the-others',
      question: 'وباقي البنات؟',
      statement: 'كل واحدة كانت شايلة حاجة عن دينا.',
      importance: 'deeper',
      relatedEvidenceIds: [],
      relatedCharacterIds: ['shahd', 'mai', 'yasmin', 'rana'],
      revealOrder: 5,
      explanation:
        'شهد رقّعت حرقة في الديل ومقالتش. مي مسافرة الأسبوع الجاي ومقالتش. ياسمين عارفة عن مروان ومقالتش. ورنا قالت، ولما محدش صدّقها، عملت اللي عملته. أربع صاحبات بيحبوا دينا، وكل واحدة فيهم خبّت عنها حاجة عشان «مش وقته».',
    },
    {
      id: 'dina',
      question: 'ودينا؟',
      statement: 'لسه في الحمام. ولسه مش عارفة غير البقعة.',
      importance: 'deeper',
      relatedEvidenceIds: [],
      relatedCharacterIds: ['rana', 'yasmin'],
      revealOrder: 6,
      explanation:
        'الفستان ممكن يتنضف في يومين، أو شهد تغيّر الصدر كله. بس لما دينا تخرج، الكلام مش هيبقى عن الفستان. هيبقى عن مين فيهم هتقولها الحقيقة عن مروان الأول.',
    },
  ],
};
