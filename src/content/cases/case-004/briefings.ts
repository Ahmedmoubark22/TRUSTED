import type { PrivateBriefing } from '../../types';

/**
 * Case 004 — five private briefings, and one of them says "you did it".
 *
 * The thing that separates these from Cases 001–003: in a competitive case the
 * culprit **has to know**. You cannot ask somebody to win by not being caught
 * and then withhold from them what they are hiding. That is why the parked
 * «مين كان سايق؟» could not be played this way — its answer was authored not
 * to know he was the answer, and that is a `reveal` case's privilege.
 *
 * Every briefing carries an `onEliminated` card. It is the price the room pays
 * itself for a wrong vote: the person struck off gives up one real thing on
 * the way out, so a round the room got wrong still moves the case.
 *
 * Placeholder prose, real structure.
 */
export const CASE_004_BRIEFINGS: Record<string, PrivateBriefing> = {
  wessam: {
    characterId: 'wessam',
    identity: 'إنت وسام. منتج منفذ، وإنت اللي ماسك فلوس الشغل كلها.',
    knows: [
      'المؤسس بعتلك رسالة الساعة ١:٥٠: «بكرة الصبح هقول لهم».',
      'إنت قلت إنك كنت صاحي. ودي الحقيقة.',
    ],
    believes: ['اللي هو كان هيقوله الصبح هو إنه باع الشركة.'],
    hiding: ['في فرق في الميزانية بقاله تلات شهور، وإنت عارف بيه.'],
    goal: 'ماحدش يفتح سيرة الفلوس قبل ما تعرف إنت الأول هو كان هيقول إيه.',
    onEliminated:
      'قبل ما يمشي، وسام قال: «الرسالة اللي وصلتني الساعة ١:٥٠ مكانتش لوحدها. كان بعت نفس الكلام لواحد تاني — وشفت الاسم.»',
  },

  nada: {
    characterId: 'nada',
    identity: 'إنتي ندى. المخرجة. الفيلم ده مشروعك من سنتين.',
    knows: [
      'كان هيشيلك من المشروع، وقالهالك في وشك امبارح.',
      'إنتي كنتي صاحية، وقلتي كده من الأول.',
    ],
    believes: ['اللي حصل ليه علاقة بحاجة اتقالت في القعدة اللي قبل الأخيرة.'],
    hiding: ['سمعتي صوت خناقة، وعرفتي الصوتين، ومقلتيش.'],
    goal: 'الأوضة تشوفك بتساعدي — من غير ما توصلوا للحظة اللي كنتي فيها بره أوضتك.',
    onEliminated:
      'قبل ما تمشي، ندى قالت: «الخناقة اللي سمعتها مكانتش جنب السلم. كانت جوه المكتب — والباب كان مقفول من جوه.»',
  },

  tarek: {
    characterId: 'tarek',
    identity: 'إنت طارق. مدير التصوير. وعندك عرض من شركة تانية مستخبيه.',
    knows: ['المؤسس عرف بالعرض. قالك كده الساعة ١٢ بالليل.'],
    believes: ['وسام هو اللي وشوش عليك، لأن محدش غيره كان يعرف.'],
    hiding: ['اتحركت ٢:١٢ — نزلت تجيب كارت الكاميرا من العربية. ومعندكش حاجة تثبت ده.'],
    goal: 'تفضل مصدَّق من غير ما تشرح ليه كنت بره البيت في الوقت ده.',
    onEliminated:
      'قبل ما يمشي، طارق قال: «وأنا راجع من العربية، كان في نور في المكتب. ولما طلعت، كان مطفي.»',
  },

  hala: {
    characterId: 'hala',
    identity: 'إنتي هالة. الكاتبة. والفكرة كلها فكرتك.',
    knows: ['اسمه هو اللي على الفكرة، مش اسمك. وده بقاله سنة.'],
    believes: ['كان ناوي يعتذر لحد. مش عارفة لمين.'],
    hiding: ['اتحركتي ٢:٤٠ عشان تكلميه. وصلتي لباب المكتب وسمعتي صوتين، فرجعتي.'],
    goal: 'الأوضة تفهم إنك رجعتي — من غير ما تسألك رجعتي ليه.',
    onEliminated:
      'قبل ما تمشي، هالة قالت: «الصوت التاني اللي سمعته من ورا الباب كان بيقول جملة واحدة: عشرين سنة.»',
  },

  essam: {
    characterId: 'essam',
    identity:
      'إنت عصام. أقدم واحد في الشركة، وصاحب المؤسس من عشرين سنة. **وإنت اللي عملتها.**',
    knows: [
      'عرفت بالليل إنه باع الشركة، وإن اسمك مش في الصفقة.',
      'طلعتله المكتب ٢:٥٥. اتخانقتوا على بسطة السلم. دفعته. ومكنش قصدك.',
      'رجعت أوضتك، ونمت. أو قعدت. مش فاكر.',
    ],
    believes: ['محدش شافك. ودي مش حقيقة، دي أملك.'],
    hiding: ['كل حاجة. وأخطر حاجة إن مكالمتك الساعة ٢:٥١ مسجلة على تليفونه.'],
    goal:
      'تعدّي تلات جولات من غير ما الأوضة تسمّيك. إنت مش محتاج تكسب النقاش — إنت محتاج ماحدش يقفل عليك.',
    onEliminated:
      'عصام مقالش حاجة. قعد على الكرسي اللي جنب الباب وحط إيديه على وشه. وده كان كفاية.',
  },
};
