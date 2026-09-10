import type { CaseTruth } from '../../types';

/**
 * Case 007 — النهائي (The Final).
 *
 * Seven facts in reveal order.
 */
export const CASE_007_TRUTH: CaseTruth = {
  immediateAnswerCharacterId: 'amr',
  immediateFactId: 'who',
  immediateActionPhrase: 'باع الماتش',

  facts: [
    {
      id: 'who',
      question: 'مين باع الماتش؟',
      statement: 'عمرو.',
      importance: 'immediate',
      relatedEvidenceIds: ['e01', 'e02'],
      relatedCharacterIds: ['amr'],
      revealOrder: 0,
      explanation:
        'قبض تلاتين ألف من سامح ابن الحاج صبري قبل النهائي بيومين. وماكانش محتاج يلمس الكورة: قالهم إن الحارس إيده مكسورة، وخرج الدقيقة ٢٠ بإصابة مش موجودة، وساب الجزا لأكتر واحد مهزوز في الملعب.',
    },
    {
      id: 'how',
      question: 'إزاي تبيع ماتش وإنت برّه الملعب؟',
      statement: 'باع أسرار أصحابه.',
      importance: 'core',
      relatedEvidenceIds: ['e01'],
      relatedCharacterIds: ['amr', 'ali', 'youssef'],
      revealOrder: 1,
      explanation:
        'إيد علي المكسورة كانت سر محدش يعرفه غير عمرو. الفريق التاني فضل يشوط من بعيد، على الشمال، لحد ما الجون دخل. ورهان يوسف كان سر تاني، فاداله الجزا وهو عارف إنه هيترعش.',
    },
    {
      id: 'why',
      question: 'ليه؟',
      statement: 'شغله، وتلاتين ألف.',
      importance: 'core',
      relatedEvidenceIds: [],
      relatedCharacterIds: ['amr'],
      revealOrder: 2,
      explanation:
        'عمرو شغال في معرض الحاج صبري. سامح خيّره: تكسبونا وماتجيش المعرض تاني، أو تخسروا وتقبض. عمرو قعد ليلتين يقول لنفسه إن ده ماتش كورة في الشارع. وأصحابه دفعوا تمنه.',
    },
    {
      id: 'the-message',
      question: 'ومين بعت السكرين؟',
      statement: 'سامح نفسه.',
      importance: 'core',
      relatedEvidenceIds: ['e02'],
      relatedCharacterIds: ['amr'],
      revealOrder: 3,
      explanation:
        'سامح كان مراهن إن فريقكم يخسر بفرق جونين. الجزا اللي ضاع خلّى الماتش يخلص بجون واحد، وسامح خسر رهانه. فبعت السكرين من رقم تاني عشان عمرو يشيلها لوحده. اللي اشتراه هو اللي فضحه.',
    },
    {
      id: 'ziad',
      question: 'وزياد؟',
      statement: 'اتشال عشان علي يلعب.',
      importance: 'deeper',
      relatedEvidenceIds: ['e01'],
      relatedCharacterIds: ['amr', 'hossam'],
      revealOrder: 4,
      explanation:
        'زياد كان الحارس الاحتياطي الوحيد. لو كان في القايمة، علي كان هيقعد على الدكة بإيده المكسورة، والتسديدات البعيدة كانت هتقابل إيدين سليمة. حسام قعد الليلة كلها فاكر إن عمرو ظلم أخوه. عمرو ماظلمهوش. استخدمه.',
    },
    {
      id: 'the-others',
      question: 'وليه كل واحد فيهم كان شكله بايع؟',
      statement: 'عشان كل واحد كان شايل حاجة عن التانيين.',
      importance: 'deeper',
      relatedEvidenceIds: [],
      relatedCharacterIds: ['ali', 'youssef', 'hossam'],
      revealOrder: 5,
      explanation:
        'علي دفع قسط بفلوس جمعية أمه. يوسف راهن بمرتبه. حسام رايح الفريق التاني. تلاتة أصحاب من الابتدائي، كل واحد فيهم كان عنده سبب يبيع، ومحدش فيهم باع. واللي باع كان الوحيد اللي محدش شك فيه: الكابتن.',
    },
    {
      id: 'the-choice',
      question: 'عمرو كان ممكن يرفض؟',
      statement: 'آه. ويخسر شغله.',
      importance: 'deeper',
      relatedEvidenceIds: [],
      relatedCharacterIds: ['amr', 'ali'],
      revealOrder: 6,
      explanation:
        'ده كان اختيار صعب، وأي حد ممكن يفهمه. اللي خلّاه جريمة مش التلاتين ألف. إنه قعد في الأوضة دي وسمع علي بيتّهم بسبب إيده، وهو اللي باع إيده.',
    },
  ],
};
