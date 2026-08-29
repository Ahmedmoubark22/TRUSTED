import type { CaseTruth } from '../../types';

/**
 * Case 003 — what actually happened.
 *
 * The approved seven-fact resolution from Revision v2, authored as data. The
 * engine never asks which case this is; it walks `facts` in `revealOrder` and
 * shows one at a time.
 *
 * Two things this deliberately is not, exactly as in Cases 001 and 002:
 *
 *   - It is not a verdict. منى leaked the voice note, and the reveal explains
 *     her without excusing her. Nobody in this case is a villain; three of the
 *     four were protecting something reasonable, badly.
 *   - It is not affected by the vote. The same seven truths come out in the
 *     same order whoever the room named — and this case in particular expects
 *     rooms to name تهاني, because the theory against her is complete.
 *
 * The last fact is the closer: it re-reads the whole evening and turns the
 * question round. Everybody at that table decided what سلمى should know.
 */
export const CASE_003_TRUTH: CaseTruth = {
  immediateAnswerCharacterId: 'mona',
  immediateFactId: 'who-leaked',
  immediateActionPhrase: 'سرّب الفويس',

  facts: [
    {
      id: 'who-leaked',
      question: 'مين سرّب الفويس؟',
      statement: 'منى سرّبته.',
      importance: 'immediate',
      relatedEvidenceIds: ['ev-1', 'ev-2', 'ev-5'],
      relatedCharacterIds: ['mona'],
      revealOrder: 0,
      explanation:
        'هي اللي عملت الجروب، وهي واحدة من الأدمنين، وهي اللي ضافت الرقم المجهول. وكانت ماسكة الموبايل في إيدها لما الفويس نزل — عشان هي اللي كانت مستنياه. الثانيتين مكانوش سرعة بديهة، كانوا رجل واقفة على المكان الصح في الوقت الصح. وبعدها بدقيقتين، الرقم خرج والفويس اتمسح.',
    },

    {
      id: 'not-revenge',
      question: 'ليه؟',
      statement: 'مش عشان تأذي عمر. عشان سلمى تعرف قبل ما تتجوز.',
      importance: 'core',
      relatedEvidenceIds: [],
      relatedCharacterIds: ['mona'],
      revealOrder: 1,
      explanation:
        'منى مكنش عندها أي مشكلة مع جواز أخوها. كان عندها مشكلة واحدة بس: إن البنت داخلة على حياة كاملة وهي مش عارفة حاجة أساسية. وهي شايفة إن الحقيقة دي مش ملك عمر لوحده — لأنها بتخص واحدة تانية هتعيش نتيجتها. عشان كده محطتش اسمها على الرسالة: هي مكنتش عايزة تكسب خناقة، كانت عايزة المعلومة توصل.',
    },

    {
      id: 'the-argument',
      question: 'الخناقة كانت على إيه؟',
      statement: 'طلبت منه يقول لسلمى. رفض.',
      importance: 'core',
      relatedEvidenceIds: [],
      relatedCharacterIds: ['mona'],
      revealOrder: 2,
      explanation:
        'قبل الخطوبة بأسبوعين، قعدت مع أخوها وقالتله إن البنت لازم تعرف قبل ما تقول آه. قالها هيقولها بعد الخطوبة. قالتله ده مش نفس الحاجة. الخناقة خلصت من غير ما حد يقتنع، وهي فضلت شايلة الموضوع جواها أسبوعين. ولما الفويس نزل في إيدها، شافت إن الحقيقة بقت قدامها جاهزة — فقررت تقولها بطريقتها هي.',
    },

    {
      id: 'tahani-knew',
      question: 'وتهاني؟',
      statement: 'عرفت قبل الخطوبة بأسبوع وسكتت — عشان الخطوبة تتم الأول.',
      importance: 'core',
      relatedEvidenceIds: ['ev-1', 'ev-2'],
      relatedCharacterIds: ['tahani'],
      revealOrder: 3,
      explanation:
        'تهاني مسرّبتش حاجة. هي بس عرفت قبل الكل بأسبوع، وقررت إن الأحسن للبنت إن الخطوبة تتم الأول ويتصرفوا بعد كده. وعشان كده كانت هي أكتر واحدة في الأوضة عايزة حد يتحدد بسرعة — كل دقيقة تعدّي، السؤال بيبعد عن «مين سرّب؟» ويقرّب من «وإنتي كنتي عارفة إمتى؟». الضغط اللي كانت بتعمله عشان تحمي نفسها هو نفسه اللي خلا الطاولة تشك فيها. وهي أدمن زي منى بالظبط — يعني نظرية كاملة، ومتقفلة، وغلط.',
    },

    {
      id: 'yasser-chose',
      question: 'وياسر؟',
      statement: 'كان ماسك الدليل من الأول، وكان بيختار بين الحقيقة وعلاقته.',
      importance: 'core',
      relatedEvidenceIds: [],
      relatedCharacterIds: ['yasser', 'tahani'],
      revealOrder: 4,
      explanation:
        'الرسالة اللي شافها على موبايل تهاني كانت كفاية تقلب القعدة. وكان سامع كمان خناقة منى وعمر من أسبوعين، ومكانش عارف إنها المفتاح. كل الليلة وهو بيوزن حاجة واحدة: أكشف وأخسر ناس بحبها، ولا أسكت وأسيب حد يتحاسب على حاجة ممكن يكون معملهاش. ولو كان كشف، أول سؤال كان هييجي عليه هو: وإنت إزاي شايف رسايلها؟',
    },

    {
      id: 'karim-counted',
      question: 'وكريم؟',
      statement: 'كان عارف إن الأزمة مؤقتة، وكانت مصلحته إنها تفضل باينة خطيرة.',
      importance: 'core',
      relatedEvidenceIds: ['ev-5'],
      relatedCharacterIds: ['karim'],
      revealOrder: 5,
      explanation:
        'كريم مسرّبش الفويس، ومكانش يقدر أصلًا — هو مش أدمن. بس هو الوحيد اللي كان عارف إن دي أزمة سيولة مؤقتة مش إفلاس، والوحيد اللي كان بيكسب لو الخوف فضل عايش: مسودة اتفاق بتخلي الشريك التالت يبيع حصته بسعر واطي. عشان كده كان هادي طول الليلة، ومش لأنه بريء بس. كل جملة قالها كانت صح — واللي مقالهوش هو اللي كان بيشتغل لصالحه.',
    },

    {
      id: 'who-decided-for-her',
      question: 'طب مين قرر بدل سلمى؟',
      statement:
        'كلهم. كل واحد قرر إن سلمى تعرف أو متعرفش حسب اللي يريحه هو. منى بس هي اللي قررت إنها تعرف.',
      importance: 'deeper',
      relatedEvidenceIds: ['ev-1', 'ev-2', 'ev-5'],
      relatedCharacterIds: ['mona', 'tahani', 'yasser', 'karim'],
      revealOrder: 6,
      explanation:
        'عمر قرر إنها متعرفش لحد ما الخطوبة تخلص. تهاني قررت إنها متعرفش عشان الجواز يتم. كريم قرر إنها متعرفش عشان الخوف يفضل عايش. ياسر قرر يستنى ويشوف. وكل واحد فيهم كان شايف إن قراره هو الأرحم. منى بس هي اللي قررت إنها تعرف — ودي كانت برضه حاجة قررتها بدلها. أربع ناس قعدوا في نفس الأوضة، وكل واحد كان ماسك حتة من حياة بنت مش قاعدة معاهم.',
    },
  ],
};
