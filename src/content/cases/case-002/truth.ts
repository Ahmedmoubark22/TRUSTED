import type { CaseTruth } from '../../types';

/**
 * Case 002 — what actually happened.
 *
 * The approved resolution, authored as data. The engine never asks which case
 * this is; it walks `facts` in `revealOrder` and shows one at a time.
 *
 * Two things this deliberately is not, exactly as in Case 001:
 *
 *   - It is not a verdict. مصطفى moved the envelope, and the reveal never
 *     calls him a thief and never calls him stupid. He did a small frightened
 *     thing and could not take it back.
 *   - It is not affected by the vote. The same seven truths come out in the
 *     same order whoever the room named. The vote only changes the one line
 *     that describes what the room found.
 *
 * The layers run outward in time — tonight, then three months, then two years
 * — and inward in blame, ending on nobody. Nothing was stolen; the thing that
 * broke the جمعية was a reasonable man asking to see the numbers.
 */
export const CASE_002_TRUTH: CaseTruth = {
  immediateAnswerCharacterId: 'mostafa',
  immediateFactId: 'who-moved-the-envelope',
  immediateActionPhrase: 'حرّك الظرف',

  facts: [
    {
      id: 'who-moved-the-envelope',
      question: 'مين حرّك الظرف؟',
      statement: 'مصطفى شاله.',
      importance: 'immediate',
      relatedEvidenceIds: ['e04', 'e05'],
      relatedCharacterIds: ['mostafa'],
      revealOrder: 0,
      explanation:
        'الظرف مكانش مسروق. الظرف كان مخبّي. قام مع اللي قايمين، بس مشي في الاتجاه التاني. دخل الحمام الصغير، وحطّ الظرف ورا السخان بإيد بترعش، ورجع قعد مكانه.',
    },

    {
      id: 'not-a-theft',
      question: 'خده ليه؟',
      statement: 'مش عشان الفلوس. عشان يوقف العدّ.',
      importance: 'core',
      relatedEvidenceIds: ['e05', 'e04'],
      relatedCharacterIds: ['mostafa'],
      revealOrder: 1,
      explanation:
        'لما نبيل قال «نعدّه قدام بعض»، الأوضة كلها سمعت طلب عادي. راجل واحد بس سمع حكم. مصطفى بقاله تلات شهور مش دافع — مش كسل ولا نصب، الشغل وقف، والبيت عايز، والكلام اللي بيتقال في العمارة أتقل من الفلوس نفسها. في اللحظة اللي اتقال فيها «نعدّوا»، فهم إن الدفتر هيتفتح، والإمضا الناقصة هتتشاف، والسؤال هيتسأل قدام ستة ناس. مقدرش. مأخدش مليم. عمره ما فتح الظرف. هو بس كان عايز الليلة تعدّي.',
    },

    {
      id: 'the-money-went-in',
      question: 'طب والـ٤٥ ألف؟',
      statement: 'مكانتش طالعة. كانت داخلة.',
      importance: 'core',
      relatedEvidenceIds: ['e01', 'e03'],
      relatedCharacterIds: ['souad', 'mostafa'],
      revealOrder: 2,
      explanation:
        'اللي مصطفى مكنش يعرفه، إن في حد كان ماشي وراه ويسدّ اللي هو سايبه. سعاد حطّت من فلوسها هي: ١٥,٠٠٠ في الشهر التالت، و١٥,٠٠٠ في الخامس، و١٥,٠٠٠ في السابع. تلاتة في خمستاشر ألف = ٤٥,٠٠٠ جنيه من جيبها، من غير ما تقول لحد، ومن غير ما تطلب منه حاجة. وكتبت جنب اسمه «تم» بقلم جاف أسود، ونسيت الإمضا. النسيان ده هو اللي فضحها في الآخر.',
    },

    {
      id: 'right-number-wrong-direction',
      question: 'يبقى نبيل كان بيحسب صح؟',
      statement: 'الرقم صح. الاتجاه غلط.',
      importance: 'core',
      relatedEvidenceIds: ['e03', 'e01'],
      relatedCharacterIds: ['nabil'],
      revealOrder: 3,
      explanation:
        'عدّ بعينه ٧٥ ألف في تلات ليالي، والدفتر بيقول ٩٠. الفرق ٤٥ ألف — رقم حقيقي مش وهم. الحساب بتاعه كان مظبوط من أوله لآخره، بس هو قراه بالمقلوب. شاف فلوس بتتحرك في الضلمة فقال «حد بيسرق». ونبيل نفسه كان بيخبّي حاجة: خمس شهور وهو قاعد في البيت، ومحدش في العمارة يعرف. عشان كده كان مصمّم إن الحسابات تبقى نضيفة — عشان لو الكلام اتفتح على حد، ميبقاش هو. الخوف بيخلّي الناس تدقّق أكتر، وتفهم أقل.',
    },

    {
      id: 'hoda-was-the-one-waiting',
      question: 'وهدى؟',
      statement: 'هي الوحيدة اللي مخدتش دورها.',
      importance: 'core',
      relatedEvidenceIds: ['e05', 'e02'],
      relatedCharacterIds: ['hoda'],
      revealOrder: 4,
      explanation:
        'الظرف رجع مقفول ومختوم زي ما هو، والـ٩٠,٠٠٠ كاملة، مفيش مليم ناقص. هدى آخر واحدة في الدور، وهي الوحيدة اللي لسه مخدتش حاجة خالص من الجمعية — والوحيدة اللي كانت مستنية الفلوس دي فعلًا.',
    },

    {
      id: 'the-older-story',
      question: 'وفي حتة أخيرة محدش سألها؟',
      statement: 'من سنتين، حد تاني اتأخر. وكمان محدش عرف.',
      importance: 'core',
      relatedEvidenceIds: ['e01'],
      relatedCharacterIds: ['souad'],
      revealOrder: 5,
      explanation:
        'من سنتين، ولمدة شهرين، حد تاني من اللي في العمارة اتأخر عن الدفع. ووقتها كمان، الدفتر كتب «تم». وكمان محدش عرف. سعاد ماسكة الجمعية بقالها سنة… بس هي ماسكة أسرار الناس من قبل كده بكتير.',
    },

    {
      id: 'what-broke-it',
      question: 'طب مين اللي كسر الجمعية؟',
      statement: 'محدش سرق حاجة.',
      importance: 'deeper',
      relatedEvidenceIds: ['e01', 'e02', 'e03', 'e04', 'e05'],
      relatedCharacterIds: ['souad', 'hoda', 'mostafa', 'nabil'],
      revealOrder: 6,
      explanation:
        'مصطفى حرّك الظرف عشان يوقف العدّ، مش عشان الفلوس. سعاد دفعت ٤٥,٠٠٠ من فلوسها وكتبت «تم». نبيل حسب صح وفهم غلط، وكان بيخبّي إنه قاعد من خمس شهور. هدى الوحيدة اللي مخدتش دورها، والوحيدة اللي كانت مستنية الفلوس فعلًا. والـ٩٠,٠٠٠ رجعت كاملة. الجمعية استمرت — بس بعد الليلة دي، محدش طلب يعدّ الفلوس قدام حد تاني.',
    },
  ],
};
