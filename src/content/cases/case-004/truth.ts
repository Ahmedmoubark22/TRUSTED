import type { CaseTruth } from '../../types';

/**
 * Case 004 — what actually happened.
 *
 * One thing here is knowingly unfinished, and it is written down rather than
 * glossed: **these facts name عصام, and they travel on the public case
 * definition.** The engine no longer does — it adjudicates against
 * `getCulprits`, which is private — so no screen and no careless prop spread
 * can leak the answer during play. But a determined player with devtools can
 * still read this file's text out of the bundle before the reveal, which is a
 * gap a competitive case does not have in a `reveal` case, where the truth is
 * the payload and nobody was racing for it. Closing it means putting the truth
 * facts behind the same narrow lookup, and that is a change to the reveal
 * screen rather than to this file.
 *
 * Placeholder prose, real structure.
 */
export const CASE_004_TRUTH: CaseTruth = {
  immediateAnswerCharacterId: 'essam',
  immediateFactId: 'who',
  immediateActionPhrase: 'كان على السلم',

  facts: [
    {
      id: 'who',
      question: 'مين كان آخر واحد شافه؟',
      statement: 'عصام.',
      importance: 'immediate',
      relatedEvidenceIds: ['e02', 'e03'],
      relatedCharacterIds: ['essam'],
      revealOrder: 0,
      explanation:
        'اتحرك ٢:٥٥، وكلّمه ٢:٥١ والمكالمة اترفضت. مفيش حد بعده. الكشف بيقول إنه اتحرك، والتليفون بيقول إنه حاول، والاتنين مع بعض بيقولوا إنه طلع.',
    },
    {
      id: 'why',
      question: 'ليه؟',
      statement: 'عشان اسمه مكانش في الصفقة.',
      importance: 'core',
      relatedEvidenceIds: ['e03'],
      relatedCharacterIds: ['essam'],
      revealOrder: 1,
      explanation:
        'الشركة اتباعت. عشرين سنة، وفي الورق اللي هيتوقّع الصبح مفيش سطر واحد فيه اسمه. عرف بالليل، مستناش الصبح.',
    },
    {
      id: 'not-planned',
      question: 'كان ناوي؟',
      statement: 'لأ.',
      importance: 'core',
      relatedEvidenceIds: ['e01'],
      relatedCharacterIds: ['essam'],
      revealOrder: 2,
      explanation:
        'خناقة على بسطة سلم، ودفعة واحدة. التقرير بيقول إن الإصابة مش من الوقعة — بس ده مبيقولش إن حد كان مستني. اللي كان مقصود هو اللي حصل بعدها.',
    },
    {
      id: 'the-message',
      question: 'والرسالة اللي متبعتتش، كانت لمين؟',
      statement: 'ليه هو.',
      importance: 'core',
      relatedEvidenceIds: ['e03'],
      relatedCharacterIds: ['essam', 'wessam'],
      revealOrder: 3,
      explanation:
        '«أنا آسف. مكانش قصدي تعرف كده» — دي مكانتش لوسام ولا لندى. كان بيكتبها لعصام، ومكمّلهاش. المكالمة اللي رفضها الساعة ٢:٥١ كانت من الراجل اللي هو قاعد يكتبله اعتذار. رفضها عشان لسه مخلصش الجملة.',
    },
    {
      id: 'the-silence',
      question: 'فأمتى بقت جريمة؟',
      statement: 'لما رجع أوضته وسكت.',
      importance: 'deeper',
      relatedEvidenceIds: [],
      relatedCharacterIds: ['essam'],
      revealOrder: 4,
      explanation:
        'الجريمة في القضية دي مش الدفعة. الدفعة كانت تانية واحدة. الجريمة كانت الست ساعات اللي بعدها، واللي فيهم قعد يسمع الأربعة التانيين بيتهموا بعض.',
    },
    {
      id: 'the-meetings',
      question: 'وليه كل واحد فيهم كان شايف نفسه أقرب واحد ليه؟',
      statement: 'عشان كل واحد فيهم قعد معاه لوحده في نفس الليلة.',
      importance: 'deeper',
      relatedEvidenceIds: [],
      relatedCharacterIds: ['wessam', 'nada', 'tarek', 'hala', 'essam'],
      revealOrder: 5,
      explanation:
        'خمس قعدات، من ١٢:٤٠ لـ ٢:٥٥، واحدة ورا التانية. وكل واحد فيهم طلع من قعدته وهو فاكر إنه الوحيد اللي اتقاله. الراجل قضى آخر ليلة في حياته وهو بيقول لخمس ناس نفس الحاجة بخمس طرق — وكل واحد فيهم سمعها على إنها سر.',
    },
    {
      id: 'the-others',
      question: 'وباقي الأربعة؟',
      statement: 'كلهم كدبوا. ولا واحد فيهم كدب على ده.',
      importance: 'deeper',
      relatedEvidenceIds: ['e01', 'e02'],
      relatedCharacterIds: ['wessam', 'nada', 'tarek', 'hala'],
      revealOrder: 6,
      explanation:
        'فرق في ميزانية، عرض شغل، خناقة اتسمعت من ورا باب، ورجوع من قدام المكتب من غير ما حد يخبط. أربع حاجات، كل واحدة كانت كفاية تخلي صاحبها يبان مذنب — ومحدش فيهم كان.',
    },
  ],
};
