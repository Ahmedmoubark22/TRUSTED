import type { CaseTruth } from '../../types';

/**
 * Case 005 — الشبكة (The Network).
 *
 * Seven facts in reveal order: who, when, why, why-today, the-choice,
 * the-money, and nour's fear.
 *
 * Placeholder prose, real structure.
 */
export const CASE_005_TRUTH: CaseTruth = {
  immediateAnswerCharacterId: 'hassan',
  immediateFactId: 'who',
  immediateActionPhrase: 'أخذ الفلوس',

  facts: [
    {
      id: 'who',
      question: 'مين أخذ الفلوس من دار الصاغة؟',
      statement: 'حسّان.',
      importance: 'immediate',
      relatedEvidenceIds: ['e02', 'e03'],
      relatedCharacterIds: ['hassan'],
      revealOrder: 0,
      explanation:
        'الفاتورة بإسمه، والسجل بيقول إنه دخل واتحرك في الوقت ده. التليفون بيقول إنه قريب من المكان. الاتنين مع بعض بيقولوا إنه أخذها.',
    },
    {
      id: 'not-today',
      question: 'الفلوس دي كانت فيها ليه؟',
      statement: 'هي موجودة من أسبوعين.',
      importance: 'core',
      relatedEvidenceIds: ['e01', 'e02'],
      relatedCharacterIds: ['hassan', 'malak'],
      revealOrder: 1,
      explanation:
        'الصائغ عرض الحلي دي من أسبوعين في المتجر. حسّان عارف الموضة دي، وملاك رايته يسأل عنها. الفلوس اللي ودع هي اللي جمعتها نادية من العايلة.',
    },
    {
      id: 'why',
      question: 'ليه احتاج حسّان الفلوس دي؟',
      statement: 'عشان داين على الشركة.',
      importance: 'core',
      relatedEvidenceIds: ['e03'],
      relatedCharacterIds: ['hassan'],
      revealOrder: 2,
      explanation:
        'حسّان داين بـ 200 ألف جنيه على الشركة. الفلوس دي طريقة سريعة يسدد منها — بدون ما حد يعرف الحقيقة. الصفقة بتاعة الصائغ عارفة بس إنه عاوز يجهز فلوس.',
    },
    {
      id: 'why-today',
      question: 'ليه اليومة دي بالذات؟',
      statement: 'عشان أم مراته شايفة الحاجات دي اليوم.',
      importance: 'core',
      relatedEvidenceIds: [],
      relatedCharacterIds: ['hassan', 'nadia'],
      revealOrder: 3,
      explanation:
        'أم مراته جاية من الريف اليوم — هتقيم في البيت أسبوع. إذا شافت الفلوس دي عند العايلة، هتسأل قرشين. حسّان بيعرف إن الوقت بتاعه ضيّق — خمس ساعات بس قبل ما تيجي أم مراته.',
    },
    {
      id: 'the-choice',
      question: 'إذاً، كان عنده خيارات تانية؟',
      statement: 'كان عنده خيار — هرب.',
      importance: 'deeper',
      relatedEvidenceIds: [],
      relatedCharacterIds: ['hassan', 'sohair'],
      revealOrder: 4,
      explanation:
        'حسّان قال لسهير إنه قاصد يهرب. معاه جواز قديم، وفلوس في تليفون — يكفي يوضيه من القاهرة. بس لما إتفتحت الفاتورة — عرف إن ما فيش حد هيصدّقه لو قال إنه هرب.',
    },
    {
      id: 'the-money',
      question: 'والفلوس اللي في العايلة دي؟',
      statement: 'كل واحد فيهم عنده فلوس مخبية.',
      importance: 'deeper',
      relatedEvidenceIds: [],
      relatedCharacterIds: ['hassan', 'nadia', 'kareem', 'malak', 'sohair'],
      revealOrder: 5,
      explanation:
        'والدة حسّان عندها فلوس من شغل قديم. نادية خبيّة فلوس من راتبها. كريم عنده فلوس من شغل بره. ملاك عندها فلوس اشتراك. كل واحد خايف من التاني — فالحاجة دي شبكة كاملة.',
    },
    {
      id: 'nour',
      question: 'وسهير — شنقها ليه؟',
      statement: 'عشان خايفة إنه بيهرب — وتركها.',
      importance: 'deeper',
      relatedEvidenceIds: [],
      relatedCharacterIds: ['hassan', 'sohair'],
      revealOrder: 6,
      explanation:
        'سهير متجوزة حسّان من سنة، والعايلة كلها قالت إنه بيصرفها من شغله. بس هي شُفت الفاتورة — عرفت إنه ماخد 50 ألف. وعرفت إنه لا بيصرفها، ولا بيحب الشركة بتاعته، ولا بيحب حاجة غير نفسه.',
    },
  ],
};
