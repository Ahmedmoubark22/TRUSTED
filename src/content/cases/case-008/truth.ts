import type { CaseTruth } from '../../types';

/**
 * Case 008 — عجل العيد (Eid Calf).
 *
 * Seven facts in reveal order. Two culprits: sanaa and maged.
 * immediateAnswerCharacterId is sanaa, but the 'who' statement names both.
 */
export const CASE_008_TRUTH: CaseTruth = {
  immediateAnswerCharacterId: 'sanaa',
  immediateFactId: 'who',
  immediateActionPhrase: 'خدوا العجل',

  facts: [
    {
      id: 'who',
      question: 'مين ورا اختفاء العجل؟',
      statement: 'أبلة سناء وماجد.',
      importance: 'immediate',
      relatedEvidenceIds: ['e01', 'e02', 'e04'],
      relatedCharacterIds: ['sanaa', 'maged'],
      revealOrder: 0,
      explanation:
        'ماجد قطع الحبل الساعة ٣:٣٠ وطلّعه في نص نقل مع صاحبه، وباعه لجزار في بولاق بـ١٣٠ ألف. الفلوس دخلت محفظة أبلة سناء، لأن محفظة ماجد واقفة. وهي فضلت في الشباك تراقب لحد ما خلصوا.',
    },
    {
      id: 'the-door',
      question: 'والقفل اللي كان مقفول؟',
      statement: 'الباب كان مفتوح طول الليل.',
      importance: 'core',
      relatedEvidenceIds: ['e01'],
      relatedCharacterIds: ['saeed'],
      revealOrder: 1,
      explanation:
        'عم سعيد بيركّن ميكروباصين في الجراج كل ليلة من ورا الحاج فكري، وبيسيب الباب لنصه لحد ٥. قفله الساعة ٥ من غير ما يبص جوه. المفتاح عمره ما كان السؤال.',
    },
    {
      id: 'why-maged',
      question: 'ماجد ليه؟',
      statement: 'تسعين ألف ديون.',
      importance: 'core',
      relatedEvidenceIds: [],
      relatedCharacterIds: ['maged'],
      revealOrder: 2,
      explanation:
        'أبليكيشن السلف وقف محفظته وبقى يبعت رسايل لأمه. ماجد كان محتاج فلوس كبيرة في ليلة واحدة، والعجل كان مربوط تحت بيته.',
    },
    {
      id: 'why-sanaa',
      question: 'وأبلة سناء؟',
      statement: 'عشان العمارة تشوف الحاج فكري على حقيقته.',
      importance: 'core',
      relatedEvidenceIds: ['e03'],
      relatedCharacterIds: ['sanaa', 'fikry'],
      revealOrder: 3,
      explanation:
        'فكري بقاله سنتين عايز يرميها في الشارع. العجل كان فلوس الجيران في إيد فكري؛ لو اختفى، أول سؤال هيتسأل لفكري. ولما ماجد لقى الفاتورة في شوال العلف، اكتشفت إن فكري فعلًا خد من فلوسهم، فحطتها على السلم عشان الكل يشوفها.',
    },
    {
      id: 'the-35',
      question: 'والـ٣٥ ألف اللي فكري خدها؟',
      statement: 'راحت للمحامي. في قضية طرد أبلة سناء.',
      importance: 'deeper',
      relatedEvidenceIds: ['e03'],
      relatedCharacterIds: ['fikry', 'sanaa'],
      revealOrder: 4,
      explanation:
        'فكري دفع أتعاب القضية من فلوس عجل الجيران، وأبلة سناء واحدة منهم. يعني سناء كانت بتدفع من سهمها تمن المحامي اللي بيطردها. لا هي عارفة، ولا هو قال.',
    },
    {
      id: 'the-building',
      question: 'وليه كله كان شكله حرامي؟',
      statement: 'عشان كله كان محتاج حاجة من العجل ده.',
      importance: 'deeper',
      relatedEvidenceIds: [],
      relatedCharacterIds: ['shereen', 'nevine', 'saeed', 'fikry'],
      revealOrder: 5,
      explanation:
        'شيرين كانت متفقة مع ملجأ ياخده بعد الصلاة. نيفين كانت بتبيع سهمها من ورا الكل عشان مدرسة ابنها. عم سعيد كان بياكل عيش من الجراج بالليل. وفكري كان هيتفضح عند الميزان. ستة جيران، كل واحد فيهم كان عنده سبب، واتنين بس اللي اتحركوا.',
    },
    {
      id: 'the-calf',
      question: 'والعجل؟',
      statement: 'عند الجزار في بولاق. لسه عايش.',
      importance: 'deeper',
      relatedEvidenceIds: ['e04'],
      relatedCharacterIds: ['sanaa', 'maged'],
      revealOrder: 6,
      explanation:
        'الجزار مش هيدبحه لحد ما حد يروح. الـ١٣٠ ألف لسه في محفظة أبلة سناء. وسبع عيلات صحيوا يوم العيد على جراج فاضي، وأول حاجة عملوها إنهم بصّوا لبعض.',
    },
  ],
};
