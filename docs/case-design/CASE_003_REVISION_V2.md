# CASE 003 — «الفويس» · REVISION V2

> **Design document only.** Nothing in `src/`, no tests, no engine change, nothing
> committed. Supersedes the v1 Case 003 document as the design source of truth;
> the v1 story, cast and canonical truth are unchanged except where an approved
> revision (C1, C2, C3, C5, C6, C7) requires it.

---

## 1. Case identity

| | |
|---|---|
| **Title** | **«الفويس»** |
| **English working label** | The Voice Note |
| **Players** | 4 |
| **Target play time** | 15–20 minutes |
| **Central question** | **مين سرّب الفويس؟** |
| **Setting** | قعدة خطوبة، بعد ما التصوير خلص |
| **Public evidence objects** | 3 (EV-1, EV-2, EV-5) |
| **Private information** | 2 (EV-3 → ياسر، EV-4 → كريم) |
| **Truth facts** | 7 |
| **Immediate answer** | `mona` |

---

## 2. Canonical truth

**منى هي اللي سرّبت الفويس.** Unchanged, and not negotiable.

She did not do it to hurt Omar. Two weeks before the engagement she asked him to
tell Salma about the company's trouble; he refused. When the voice note reached
her, she decided the truth had to arrive in the room one way or another — so she
put it there without her name on it.

Everything below exists to make that answer **earned rather than announced**.

---

## 3. Gameplay thesis

v1's thesis was right and is kept:

> **The Voice Note is not a case about finding a secret. It is a case about
> deciding which secret is worth exposing.**

What v1 got wrong was the ballot. The question on the ballot is *who leaked it*,
and in v1 every piece of evidence bearing on that question pointed at one
person. The room could be divided about which secret mattered, but never about
who did it.

v2's correction, in one line:

> **Two people had the key. Three people had a reason. All four have something
> they would rather the room did not ask about.**

---

## 4. Revised four-player cast

| | Character | Relation | One-line role |
|---|---|---|---|
| 1 | **منى** | أخت عمر | The answer. Has access, opportunity, motive and an unstable story. |
| 2 | **تهاني** | خالة سلمى | **Now co-admin.** Knew early, said nothing, and needs the question closed fast. |
| 3 | **ياسر** | ابن عم سلمى | Holds the strongest private weapon, and a second one he doesn't know is a weapon. |
| 4 | **كريم** | شريك عمر | Profits from the crisis looking severe. The only person who could have made the recording. |

**Mandatory public fact, read aloud before play (revised for C1):**

> **منى هي اللي عملت جروب العيلتين قبل الخطوبة بيومين — وضافت تهاني أدمن معاها
> عشان التنسيق.**

This is the single most important sentence in the case. It is not evidence; it
is the ground everything stands on, and it must be said in a flat voice, once,
to everybody.

---

## 5. Knowledge graph

`K` = holds as fact · `B✗` = sincerely believes something false · `S` = suspects · `—` = blind

| # | Fact | منى | تهاني | ياسر | كريم |
|---|---|:--:|:--:|:--:|:--:|
| 1 | منى عملت الجروب | K | K | K | K |
| 2 | تهاني أدمن كمان | K | K | K | K |
| 3 | **منى سرّبت الفويس** | **K** | — | S (weak) | — |
| 4 | تهاني عرفت بالأزمة قبل الخطوبة بأسبوع | — | **K** | **K** | — |
| 5 | ياسر معاه رسالة تثبت ده | — | — | **K** | — |
| 6 | كريم عنده مصلحة مالية في استمرار الخوف | — | — | — | **K** |
| 7 | الأزمة مؤقتة مش إفلاس | — | — | — | **K** |
| 8 | خناقة منى وعمر قبل الخطوبة بأسبوعين | **K** | S (لاحظت توتر) | **K** (سمع، مش فاهم) | — |
| 9 | سبب الخناقة | **K** | — | — | — |
| 10 | كريم كان بيسأل عن وضع الشركة | S | — | **K** | K |

**Read row 3.** Only one person knows the answer, and the one person who
suspects it isn't sure and isn't safe to say so.

**Read rows 8 and 9.** The motive now has two routes into the room — Mona's
mouth, or Yasser's ears. Neither is guaranteed. That is the C6 fix.

**Read row 2.** This is the whole of C1, and it changes the case.

---

## 6. Character objectives

Each objective is **active** — something to achieve — rather than defensive.

**منى** — Get through the evening without the room settling on her. If that
fails, make sure the room understands she was protecting Salma rather than
punishing Omar. *Being exposed and understood beats being unsuspected and
misread* — this is now her primary win condition, not her consolation prize.

**تهاني** — Get **somebody** identified, quickly, before the question turns
from *مين سرّب؟* to *وإنتي كنتي عارفة إمتى؟*. She is the engine of the case's
tempo and the reason the room moves at all.

**ياسر** — Decide which person he is willing to damage. He can hurt Tahani
(EV-3) or point at Mona (the argument he overheard). Doing nothing is a real
option with real consequences.

**كريم** — Keep the crisis looking serious without ever being asked *why he
cares how serious it looks*.

---

## 7. Character manipulation plans

### 7.1 منى

**Access** co-admin (one of two) · **Opportunity** screenshot at 2 seconds ·
**Behavior** the phone story · **Motive** the argument.

**The bind that makes her playable.** Her briefed safe line is
**«الموبايل كان على الترابيزة»**. Her *best* answer to the 2-second screenshot is
"I was already holding my phone" — which is true, and which she cannot say
without unpicking her own line. **Her strongest defence and her lie occupy the
same sentence.** She must choose which to protect, and EV-5 eventually chooses
for her.

- **Truthful but defensive-sounding:** «أنا اللي عملت الجروب، أيوه. وتهاني أدمن
  زيي بالظبط.» — true, verifiable, and it reads as passing the parcel.
- **Safe lie:** الموبايل كان على الترابيزة.
- **Strategic disclosure:** that she was angry with Omar, without saying why.
  Buys credibility, opens the worst question in the case.
- **Reason to withhold the motive:** the moment the room hears *why* she was
  angry, access + opportunity + motive close around her.
- **Accusation she can make:** كريم كان بيسأل عن أرقام الشركة الأسبوع اللي فات
  — she believes it is a bluff. It is true. It also invites *"وإنتِ ليه كنتِ
  بتتكلمي مع كريم في أرقام الشركة؟"*

**She is not doomed at minute two.** With a second admin in the room, EV-1 no
longer names her, and her first real problem is EV-2 — which she can survive if
she is willing to spend the lie.

### 7.2 تهاني

**Now a genuine suspect, not a bystander with a secret.**

The theory against her is complete and a table will find it:

> She knew a week early and said nothing. Then the guilt — or the fear of being
> the one who knew — turned. An anonymous voice note puts the truth in the room
> **without her name on it.** And the person pushing hardest to find "the
> leaker" is the person who most needs the question closed.

Access ✅ (co-admin) · Opportunity ✅ (9 seconds) · Motive ✅ (say it without
owning it) · Behavior ✅ (she pushes, and pushing looks like deflection).

- **Safe lie:** when her worry started. «أنا بقالي يومين حاسة إن في حاجة.»
- **Strategic disclosure:** admit she knew, but compress the timeline — pre-empts
  EV-3 at the cost of confirming she stayed silent.
- **Accusation she can make:** the 2-second screenshot. Devastating and
  double-edged — it is also the most aggressive thing anyone says all evening.
- **Danger:** EV-3 in Yasser's hands.

### 7.3 ياسر

**Two weapons, and using either one costs him.**

1. **EV-3** — Tahani's message, seven days before the engagement. Destroys her
   position and his relationship with her family.
2. **The argument** — he heard Mona and Omar shouting two weeks before, heard
   Salma's name, did **not** hear the subject. Cheap to spend, and it hands the
   room Mona's motive without Mona.

**The self-inflicted wound.** Firing EV-3 raises the question *how do you have a
photograph of your aunt's private messages?* — and a man who reads other
people's phones becomes a man who could have obtained a recording of Omar. **His
strongest play is the one that makes him a suspect.** That is the best bind in
the case and it is entirely his to trigger.

- **Disclosure ladder (retained from v1, it is excellent):** full reveal → hint
  («في حد هنا كان عارف قبلنا بأسبوع») → silent threat («أنا عارف حاجة، بس مش
  وقتها») → silence.
- **Safe lie:** how he knows. «حد قالّي.»

### 7.4 كريم

**Not a decoy. The only person who could have made the recording.**

The voice note is Omar talking about the company's finances. A table that asks
*where does a recording like that even come from?* arrives at his business
partner. He cannot be the sender (not an admin) — but "he made it and gave it to
someone" is a live, unfalsifiable theory, and his own behaviour feeds it.

- **Truthful but alarming:** «للأمانة، مش قد إيه الوضع مطمّن.» True. Leaves the
  fear alive. Costs him nothing until somebody asks why he keeps saying it.
- **Discovery route (C5):** he asked Yasser earlier that evening whether Omar had
  *"talked to anybody about the company"* — an ordinary question that becomes a
  strange one in hindsight, and Yasser can raise it for free. Plus EV-5 places
  him on the balcony on a call at 9:47.
- **Reason to avoid explaining:** the moment the room learns the crisis is
  temporary, his opportunity dies. Silence is worth money to him, right up until
  it costs more than the money.
- **Accusation he can make:** «ياسر بيسأل عن مواعيد وموبايلات الناس. حد لاحظ؟»

---

## 8. Revised evidence architecture

Three public objects, chained. Two private holdings that live in briefings and
are spent by speaking, not by being rendered.

### EV-1 — السكرين شوت *(public · `phoneScreen` · requires: —)*

**Visible:** رسالة صوتية من رقم مش متسجّل باسم. اتبعتت 9:47. اتمسحت 9:49.

**On inspection:** الرقم اتضاف للجروب **مباشرة بواسطة أدمن** — مش عن طريق لينك
دعوة. الرقم خرج من الجروب 9:50، وعشان كده **مبقاش باين أنهي أدمن ضافه.**

> **C1 in one line.** The group has two admins. The evidence proves an admin did
> it and cannot say which. It establishes **capability, shared by two people**,
> and nothing else.

### EV-2 — مين شاف الفويس قبل ما يتمسح *(public · `list` · requires: EV-1)*

**Visible:** أربعة أخدوا سكرين شوت قبل الحذف — منى، تهاني، ياسر، كريم.

**On inspection — التوقيتات:**

| | بعد وصول الفويس بـ | التفسير المتاح |
|---|---|---|
| **منى** | **٢ ثانية** | لا تفسير معلن — موبايلها المفروض كان على الترابيزة |
| **تهاني** | ٩ ثواني | كانت بتكلم البوفيه على الواتساب |
| **كريم** | ٤٧ ثانية | كان بره على التليفون |
| **ياسر** | ١ دقيقة و٥٠ ثانية | كان بيسلّم على ناس |

Two defensible timings (Tahani, Yasser), one neutral (Karim), one outlier
(Mona). **And the counter-argument is real:** somebody who planned this would
not screenshot their own leak in two seconds. A sharp table can argue the
outlier *clears* her. That argument is available and it is not stupid.

### EV-5 — صورة من صور الخطوبة، ٩:٤٧ *(public · `photograph` · requires: EV-2)*

**Visible:** صورة واسعة اتاخدت 9:47 بالظبط.

**On inspection:**
- **منى** عند طاولة الشاي، **والموبايل في إيدها**.
- **كريم** بره على البلكونة، **بيتكلم في التليفون**.
- **ياسر** واقف عند الباب، الموبايل مش باين.
- **تهاني** مش ظاهرة في الصورة خالص.

> **C2 in one line.** Mona was briefed to say the phone was on the table. It is
> in her hand. The contradiction fires whether or not the player improvises,
> because it contradicts the exact sentence she was given.

The object also does three secondary jobs without being three objects: it puts
Karim on a call at the exact minute (C5), it fails to account for Tahani, and it
gives Mona back — too late — the explanation she has already spent.

### EV-3 — رسالة تهاني *(private · ياسر)*

Message between Tahani and a friend, seven days before the engagement:
> «لازم نتجوز الأول، بعدين نتصرف في موضوع الشغل بتاعه.»

Proves she knew. **Does not prove she leaked.** Held in Yasser's briefing; spent
by saying it. Because it is *claimed* rather than displayed, Tahani can dispute
it — which is better for the game than a rendered artefact would be.

### EV-4 — مسودة الاتفاق *(private · كريم)*

Draft partnership agreement, two weeks before the engagement: a third partner
may sell his share if the crisis continues. Karim buys low if the fear holds.

Never obligatory. Now **probeable** (C5): Yasser's memory of Karim's question,
and Karim's call in EV-5.

---

## 9. Evidence ambiguity matrix

| | Fact | First reading | Plausible wrong reading | Suspicion ↑ | Suspicion ↓ | New question | Reinterpreted by | Load-bearing? |
|---|---|---|---|---|---|---|---|---|
| **EV-1** | رقم مجهول اتضاف بواسطة أدمن | منى عملت الجروب — يبقى هي | تهاني أدمن برضه؛ ولا واحدة فيهم لازم تكون الفاعلة | منى، تهاني | ياسر، كريم | مين فيهم الاتنين؟ | EV-2 التوقيتات | **نعم — access** |
| **EV-2** | ٢ / ٩ / ٤٧ / ١١٠ ثانية | منى كانت مستنية | اللي مخطط مبيصوّرش في تانيتين؛ تهاني ٩ ثواني كمان سريعة | منى، تهاني | ياسر | ليه واحدة كانت أسرع كده؟ | EV-5 (الموبايل في إيدها) | **نعم — opportunity** |
| **EV-5** | الموبايل في إيد منى؛ كريم على التليفون؛ تهاني مش في الصورة | منى كدبت | «قصدي كنت بعيدة عن الجروب» — تصحيح ضعيف بس ممكن | منى، كريم، تهاني | ياسر | إيه اللي اتقال تاني مش مظبوط؟ | لا شيء — نهائي | **نعم — behavior** |
| **EV-3** | تهاني عرفت قبل بأسبوع | تهاني ليها مصلحة تسكت | معرفة ≠ تسريب | تهاني، **وياسر نفسه** | منى | إزاي ياسر شايف رسايلها؟ | لحظة كشفه | لا — leverage |
| **EV-4** | كريم بيكسب لو الأزمة فضلت باينة خطيرة | كريم بيستغل صاحبه | مصلحة ≠ تسريب؛ وهو مش أدمن | كريم | منى، تهاني | التسجيل ده أصلًا جه منين؟ | كشف كريم الاختياري | لا — leverage |

**Clarity check.** Every object states a plain fact a player can repeat from
memory. The difficulty is interpretive throughout; no object requires careful
re-reading to be understood.

---

## 10. Accusation map

The engine's accusation is public, revisable, and separate from the vote. Three
designed moments, none forced.

### First accusation — after EV-1 (≈ minute 5)

**Points at:** منى **or** تهاني. Genuinely either.

Mona is the obvious first name (she made the group), and the counter arrives
within one sentence: *"وتهاني أدمن زيي."* A room that names Mona here is doing
so on the weaker half of the evidence, and somebody will say so.

**This is the C1 payoff.** In v1 the first accusation was Mona and never moved.

### Mid-case accusation — after EV-2 and the private pressure (≈ minute 10)

**Legitimate reasons for the standing accusation to move:**

- Mona's 2 seconds against Tahani's 9 — narrows it toward Mona;
- …unless someone argues the outlier is too obvious to be the culprit;
- Yasser hints at or fires EV-3 → Tahani's early knowledge lands → **the "she
  wanted it said without saying it" theory becomes the room's best story**;
- Karim's evasions surface → *"where did the recording come from?"* → the
  partner;
- Yasser fires EV-3 and is asked how he got it → suspicion rebounds onto him.

**Counter-accusation that can overturn a Mona accusation:** Tahani's early
knowledge combined with her co-admin access. It is complete, it is
evidence-backed, and **it is wrong** — which is exactly what the case needs.

### Final accusation — after EV-5 and the confrontation (≈ minute 14)

EV-5 restores Mona as the strongest single theory, but only for a table that
has kept hold of the earlier threads. A room that spent Act 3 on Tahani will
often arrive at the vote still holding her.

**All four are reachable as the final public accusation:**

| Accused | Route | Strength |
|---|---|---|
| **منى** | access + opportunity + behavior + motive | Complete |
| **تهاني** | access + opportunity + motive (say-without-owning) + deflection | **Complete, and wrong** |
| **كريم** | motive + origin-of-the-recording + evasion | Partial — no access |
| **ياسر** | demonstrated access to private material, self-inflicted | Weak, but earned |

---

## 11. Defense map

| | Safe to admit | Must avoid | Reduces suspicion | Accidentally increases it | Dangerous if exposed |
|---|---|---|---|---|---|
| **منى** | إنها عملت الجروب؛ إن تهاني أدمن | سبب الخناقة؛ الموبايل | «تهاني أدمن زيي بالظبط» — صح ومتحقق منه | تصحيح روايتها بعد الصورة | إنها اتخانقت مع عمر عشان يقول لسلمى |
| **تهاني** | إنها كانت قلقانة | **إمتى** عرفت | «أنا آخر واحدة كانت عايزة الخطوبة تتلغبط» | الضغط الزيادة عشان حد يتحدد بسرعة | EV-3 |
| **ياسر** | إنه كان بيسأل كتير | إزاي عرف حاجات عن تهاني | إنه أبطأ واحد في السكرين شوت (١:٥٠) | كشف EV-3 نفسه | إنه بيبص في موبايلات الناس |
| **كريم** | إنه شريك عمر وقلقان | مصلحته المالية؛ إن الأزمة مؤقتة | إنه مش أدمن — مقدرش يضيف الرقم أصلًا | «مش قد إيه الوضع مطمّن» متكررة | مسودة الاتفاق |

**Karim's defence is the strongest in the case** — he genuinely could not have
added the number — which is why his suspicion has to come from the recording's
origin rather than from access. That asymmetry is intentional.

---

## 12. Strategic disclosure map

| Player | Disclosure | Class | Effect on the room |
|---|---|---|---|
| منى | «تهاني أدمن زيي» | **Safe** | Halves EV-1 instantly. Her single best move. |
| منى | «كنت زعلانة من عمر» | **Risky** | Buys honesty credit, opens *ليه؟* — the worst question available to her |
| منى | «كنت ماسكة الموبايل» | **Dangerous** | Explains the 2 seconds; destroys her own line. **Her best defence and her lie are the same sentence.** |
| منى | سبب الخناقة | **Fatal** | Completes the case against her |
| تهاني | «أنا كنت قلقانة» | **Safe** | Sympathetic, vague |
| تهاني | «عرفت قبل الخطوبة» (بتوقيت مضغوط) | **Risky** | Pre-empts EV-3; confirms she stayed silent |
| تهاني | ثانيتين يا منى | **Risky** | Strongest attack available; makes her look like she is hunting |
| تهاني | التوقيت الحقيقي | **Dangerous** | Hands the room its second complete theory — about her |
| ياسر | «أنا أبطأ واحد صوّر» | **Safe** | Cheap, true, clears him on opportunity |
| ياسر | خناقة منى وعمر | **Risky** | Gives the room Mona's motive for free; invites *وإنت كنت فين؟* |
| ياسر | تلميح لـEV-3 | **Risky** | Leverage without a target — pure pressure |
| ياسر | EV-3 كامل | **Dangerous** | Detonates Tahani **and turns the room onto him** |
| كريم | «أنا مش أدمن» | **Safe** | Structurally clears him of the mechanism |
| كريم | «مش قد إيه الوضع مطمّن» | **Safe once, risky repeated** | Keeps the fear alive; repetition invites *إنت مستفيد إزاي؟* |
| كريم | إن الأزمة مؤقتة | **Dangerous** | Calms the room, kills his opportunity, and triggers *وإنت عارف ده من إمتى؟* |
| كريم | مسودة الاتفاق | **Fatal to his objective** | Only worth it if he is about to be named |

**The disclosure the case is built around:** Karim telling the truth is
*expensive but not incriminating*; Yasser telling the truth is *free but
relationally ruinous*; Mona telling the truth is *fatal*. Three different shapes
of honesty at one table.

---

## 13. Confrontation round

One beat, announced by the app before the decision. Each player picks **one**.
Neither option reveals the solution; neither is obviously optimal.

| | **A — protects / stabilises** | **B — creates pressure** |
|---|---|---|
| **منى** | «أنا كنت زعلانة من عمر قبل الخطوبة، وده ملوش علاقة بالفويس.» → controls the framing of her motive before Yasser can · but confirms the conflict exists | «كريم سألني عن أرقام الشركة الأسبوع اللي فات.» → real pressure on Karim (and it is true) · but *"وإنتِ ليه بتتكلمي معاه في الأرقام؟"* |
| **تهاني** | «كنت حاسة إن في حاجة، بس ده ملوش علاقة بمين سرّب.» → partial admission, pre-empts EV-3 · but confirms early knowledge | «منى أخدت سكرين شوت في تانيتين. تانيتين.» → strongest attack in the case · but she looks like she is closing a question about herself |
| **ياسر** | «أنا سمعت منى وعمر بيتخانقوا قبل الخطوبة بأسبوعين. مسمعتش على إيه.» → gives the room value cheaply, keeps EV-3 in reserve, deflects from himself | كشف EV-3 → destroys Tahani · costs the relationship **and** invites *إزاي شفت رسايلها؟* |
| **كريم** | «أنا لسه مراجعتش الأرقام كويس.» → protects the opportunity · but a third evasion starts to register | «حد لاحظ إن ياسر بيسأل عن مواعيد وموبايلات الناس؟» → moves the pressure · but announces he is playing |

**Mona's A is the case's hinge.** Choosing it hands the room her motive in her
own words and framing — which is the only version of exposure she can survive.
Choosing B keeps her hidden a little longer and leaves the motive for Yasser to
deliver in someone else's framing. There is no safe answer.

---

## 14. Evidence order

Approved C7 ordering, mapped onto the existing engine's phases. **No new phases.**

| Act | Beat | Engine phase | Object |
|---|---|---|---|
| 1 | **ACCESS** — مين كان أدمن؟ | EVIDENCE → DISCUSSION | **EV-1** |
| 2 | **OPPORTUNITY** — ليه واحدة كانت أسرع؟ | EVIDENCE → DISCUSSION | **EV-2** |
| 3 | **HIDDEN KNOWLEDGE** — مين كان عارف قبلنا؟ | *(same discussion, driven by the prompt)* | EV-3 / EV-4 pressure |
| 4 | **MOTIVE** — الخناقة كانت على إيه؟ | *(same discussion)* | Yasser's memory / Mona's admission |
| 5 | **BEHAVIOR** — الموبايل كان فين؟ | EVIDENCE → DISCUSSION | **EV-5** |
| 6 | **CONFRONTATION** | DECISION_READY | A/B, one each |
| 7 | **FINAL ACCUSATION** | (accusation is live throughout) | — |
| 8 | **PRIVATE VOTE** | VOTING | — |
| 9 | **REVEAL** | VOTE_REVEAL → TRUTH_REVEAL | accused → voted → truth |

Acts 3 and 4 are **not** separate objects — they are the conversation the EV-2
discussion prompt opens. This keeps the case inside the engine's existing
three-object chain and avoids inventing evidence to carry a beat that dialogue
already carries.

**Discussion prompts (one per object, per the current content model):**

- after **EV-1** → «الأدمن اتنين. مين فيهم كان ماسك الموبايل الساعة ٩:٤٧؟»
- after **EV-2** → «ثانيتين وتسع ثواني. مين فينا كان عارف حاجة قبل ما الفويس ينزل؟»
- after **EV-5** → «إيه تاني اللي اتقال النهاردة ومش متطابق مع الصورة؟»

---

## 15. Gameplay timeline — 15–20 minutes

| Segment | Budget | What happens |
|---|---|---|
| Intro + the public admin fact | **1.5 min** | Read aloud. The two-admin sentence lands here. |
| Private briefings (4 × pass-and-play) | **3 min** | ~45s each, sealed gate between |
| Act 1 — EV-1 + discussion | **2.5 min** | First accusation forms |
| Act 2 — EV-2 + discussion (Acts 3–4) | **4 min** | The long beat. Private pressure, motive surfaces or doesn't |
| Act 5 — EV-5 + discussion | **3 min** | Mona's story breaks |
| Act 6 — Confrontation | **1.5 min** | One line each |
| Act 8 — Private vote | **1.5 min** | Pass and play |
| Act 9 — Reveal (accused → voted → truth) | **2.5 min** | 7 truth steps |
| | **≈ 19.5 min** | Within target; Act 2 absorbs a fast or slow table |

Act 2 is deliberately the widest window: it is where the case is actually
played. The additional time over v1 comes from **discussion room, not more
reading** — the reading total is slightly *lower* than v1 because EV-3 and EV-4
are no longer presented as screens.

---

## 16. Replay variants

Each variant changes **who is suspected**, not merely the order of reveal.

**A — ياسر يضرب مبكر.** EV-3 in Act 2. Tahani is exposed before she can compress
her timeline; the "she said it without owning it" theory becomes dominant and
the room may never return to Mona. *Likely final accusation: تهاني.*

**B — ياسر ساكت تمامًا.** No private information reaches the table. The case runs
purely on EV-1/EV-2/EV-5, motive never surfaces, and the room votes on access +
behaviour alone. *Likely: منى, but thinly reasoned and often split.*

**C — ياسر يدّي الخناقة بس.** Motive lands without Tahani being touched. This is
the cleanest path to the truth and the least dramatic evening. *Likely: منى.*

**D — كريم يقول الحقيقة.** The crisis is temporary; the room relaxes, then turns:
*"وإنت عارف ده من إمتى وساكت؟"* Karim becomes the standing accusation for a
stretch. *Likely: كريم mid-case, منى or تهاني at the vote.*

**E — كريم يحمي مصلحته للآخر.** The fear stays alive, his evasions accumulate, and
the recording-origin question lands hard. *Likely: كريم or منى.*

**F — منى تهاجم.** She spends her B on Karim early. It works — and it exposes how
closely she has been watching him. *Likely: split منى / كريم.*

**G — منى تلعب دفاع بحت.** No accusations; she only explains EV-2 and EV-5.
Hardest to play, safest against a sharp table, and it makes Tahani the loudest
voice in the room — which draws attention to Tahani. *Likely: تهاني.*

**Five of seven variants produce a non-Mona standing accusation at some point.**
That is the measure v1 failed.

---

## 17. Fairness audit

| Requirement | Route | Status |
|---|---|---|
| **Access** — Mona **or** Tahani had it | EV-1 (admin-added, admin unidentifiable) + the public two-admin fact | ✅ **Shared, as required** |
| **Opportunity** — several people were positioned | EV-2, four named times | ✅ |
| **Motive** — Mona wanted Salma to know | **Two routes:** Mona's confrontation A, **or** Yasser's overheard argument | ✅ **No longer dependent on Mona alone (C6)** |
| **Behavior** — a real contradiction | EV-5 vs the exact briefed sentence | ✅ **Fires regardless of improvisation (C2)** |
| Tahani is a believable suspect | access + opportunity + motive + deflection | ✅ Complete and wrong |
| Karim is a believable suspect | motive + recording origin + evasion | ✅ Partial, honest |
| Yasser is a believable suspect | self-inflicted via EV-3 | ✅ Earned |
| **Mona is the only complete explanation** | only she has all four, and only she has a motive that fits an *anonymous* leak | ✅ |

**Can it be solved too early?** No. EV-1 no longer names anybody.

**Can a smart group reach a wrong theory and recover?** Yes — the Tahani theory
is complete, and EV-5 provides the route back without invalidating the detour.

**Does any conclusion depend on information a player may reasonably never
reveal?** No longer. Motive has two independent routes; the case is solvable on
public evidence alone (Variant B), and richer when private information moves.

---

## 18. No-facilitator audit

| Discoverable without steering? | |
|---|---|
| Mona's access | ✅ EV-1 + mandatory public fact |
| Tahani's access | ✅ same |
| Opportunity | ✅ EV-2 |
| Motive | ✅ two routes (C6) |
| Behavioral contradiction | ✅ EV-5 vs a briefed line |
| The combination | ✅ discussion prompts push the joins without naming anyone |

The app handles all structural facilitation: phase progression, evidence
release, the private-briefing gate, the confrontation announcement, the sealed
vote, and the reveal. **A human facilitator needs to know nothing about the
solution** — they hand the phone around and read the intro aloud.

The one thing the app cannot do is force a player to spend private information,
and it should not. An unused EV-3 is a legitimate outcome.

---

## 19. Engine-fit audit

**Verdict: A — no engine changes required.**

| Requirement | Existing support |
|---|---|
| 3 public evidence objects, chained | `EvidenceDefinition.requires` ✅ |
| Evidence types needed | `phoneScreen`, `list`, `photograph` — **all three already exist** ✅ |
| Two-layer reveal per object (باين / بيبان لما تدقّق) | `fragments[]` ✅ |
| Private information per character | `PrivateBriefing` ✅ — EV-3/EV-4 live in `knows` / `hiding` |
| Case-specific decision question «مين سرّب الفويس؟» | `CaseDefinition.decisionQuestion` ✅ |
| Public, revisable accusation | `SET_ACCUSATION`, allowed in TABLE/EVIDENCE/DISCUSSION ✅ |
| Accusation ≠ vote | `accusation` separate from `votes` ✅ |
| Private vote + handoff gate | ✅ |
| Reveal: accused → voted → truth | Implemented in the current `VoteRevealView` ✅ |
| 7 truth facts | `CaseTruth.facts` ✅ |
| Session isolation / recovery | ✅ |
| Confrontation A/B round | **Briefing text + one facilitator line.** No phase, no event, no state. |

**Nothing new is required.** Two content-model notes for implementation:

1. The discussion-prompt field holds one string per object, so Case 003 gets
   three prompts (§14). The Acts 3–4 conversation is carried by the EV-2 prompt.
   This is the same limitation flagged during Case 002 and it is survivable here.
2. `tests/reveal.test.tsx` currently asserts a 7-fact truth for Cases 001 and 002
   by name; adding Case 003 means extending that list. Test bookkeeping, not
   architecture.

**Proposed truth facts (7):**

| # | id | Question | Statement |
|---|---|---|---|
| 0 | `who-leaked` | مين سرّب الفويس؟ | منى سرّبته. |
| 1 | `not-revenge` | ليه؟ | مش عشان تأذي عمر. عشان سلمى تعرف قبل ما تتجوز. |
| 2 | `the-argument` | الخناقة كانت على إيه؟ | طلبت منه يقول لسلمى. رفض. |
| 3 | `tahani-knew` | وتهاني؟ | عرفت قبل الخطوبة بأسبوع وسكتت — عشان الخطوبة تتم الأول. |
| 4 | `yasser-chose` | وياسر؟ | كان ماسك الدليل من الأول، وكان بيختار بين الحقيقة وعلاقته. |
| 5 | `karim-counted` | وكريم؟ | كان عارف إن الأزمة مؤقتة، وكانت مصلحته إنها تفضل باينة خطيرة. |
| 6 | `who-decided-for-her` | طب مين قرر بدل سلمى؟ | كلهم. كل واحد قرر إن سلمى تعرف أو متعرفش حسب اللي يريحه هو. منى بس هي اللي قررت إنها تعرف. |

Fact 6 is the closer: it re-reads the whole evening and it does not let Mona off.

---

## 20. Exact content changes from v1

| # | Change | Approved as |
|---|---|---|
| 1 | Mona added **تهاني as co-admin**; the mandatory public fact is rewritten to say so | **C1** |
| 2 | EV-1's inspection layer now says the adding admin is **unidentifiable** (the number left at 9:50) | **C1** |
| 3 | Mona's safe lie changed to **«الموبايل كان على الترابيزة»** | **C2** |
| 4 | EV-5's contradiction re-aimed at that exact sentence | **C2** |
| 5 | EV-2 names **all four** with times: 2s / 9s / 47s / 1m50s, with defensible explanations for Tahani and Yasser | **C3** |
| 6 | EV-5 additionally shows **Karim on a call** and **Tahani absent from frame** | **C3 / C5** |
| 7 | Karim asked Yasser that evening whether Omar had spoken to anyone about the company | **C5** |
| 8 | Yasser overheard **Mona and Omar arguing** two weeks before — heard Salma's name, not the subject | **C6** |
| 9 | Yasser's confrontation **A** changed from a self-protective non-statement to spending the overheard argument | **C6** |
| 10 | EV-3 and EV-4 reclassified as **private briefing knowledge**, not evidence screens | Approved direction |
| 11 | Evidence chain fixed as EV-1 → EV-2 → EV-5, with EV-5 last | **C7** |
| 12 | Runtime rebudgeted from 12–15 to **15–20**, with Act 2 as the widest window | Approved |
| 13 | Mona's win condition: "exposed but understood" promoted to **primary** | Review recommendation |
| 14 | Karim gains the **recording-origin** theory as his suspicion route | Review recommendation |
| 15 | Yasser gains **self-inflicted suspicion** when he fires EV-3 | Review recommendation |

**Unchanged:** the premise, the cast, the canonical truth, the voice note itself,
the 9:47/9:49 timeline, the central question, and the case's thesis.

---

## 21. Remaining risks

1. **Tahani's theory may be too good.** It is complete, evidence-backed and
   wrong — which is the point — but a table that lands on it after EV-3 may
   never leave. Mitigated by EV-5 arriving after, and by fact 3 of the reveal
   explaining her honestly rather than mocking the room. **Accepted risk, and
   arguably the best thing in the case.**
2. **Three discussion prompts for five acts.** Acts 3–4 ride on the EV-2 prompt.
   If playtests show that beat collapsing, the fix is the `discussionPrompts[]`
   content-model question already outstanding from Case 002 — not new evidence.
3. **Karim can still no-op.** A player who says nothing all game is unpunished by
   the rules, though now probeable from two directions. Social, not mechanical.
4. **Mona's 2 seconds may still read as decisive** to a fast table. The
   too-obvious-to-be-guilty counter-argument exists but is not authored into any
   briefing; consider seeding it in Karim's or Yasser's notes at implementation.
5. **19.5 minutes is at the top of the band.** A slow four-player table will run
   over. Act 2 is the compressible segment.
6. **The recording's origin is deliberately never answered.** Nobody learns who
   made the voice note or how Mona got it. This is intentional — it is the thread
   that keeps Karim live — but a table may find it unsatisfying. Flagging rather
   than resolving, because resolving it would need new evidence.

---

## 22. Design quality audit

| | |
|---|---|
| 1. Can every character influence suspicion? | ✅ منى (bluff), تهاني (EV-2), ياسر (two weapons), كريم (evasion + counter) |
| 2. Can every character be credibly accused? | ✅ Two complete, one partial, one earned |
| 3. Can every character credibly defend themselves? | ✅ Karim strongest, Mona weakest by design |
| 4. Can a player hide useful information? | ✅ EV-3, EV-4, the argument, the motive |
| 5. Can a player weaponize private information? | ✅ EV-3 is the model case |
| 6. Can the public accusation legitimately change? | ✅ **The C1 fix. Five of seven variants move it.** |
| 7. Can the final vote differ from the accusation? | ✅ See below |
| 8. Can a smart group reach a wrong theory and recover? | ✅ Tahani theory → EV-5 → back |
| 9. Materially different second session? | ✅ Variants A/B/D/G produce different suspects, not just different order |
| 10. Is Mona's reveal satisfying rather than inevitable? | ✅ Fact 6 re-reads the evening; she is exposed, explained, and not excused |

### Accusation → vote divergence (legitimate examples)

**Example 1 — the room talks itself onto Tahani.**
Yasser fires EV-3 in Act 2. Public accusation settles on **تهاني**. EV-5 lands
late and two players quietly change their minds in the booth.
> Accused **تهاني** · Votes **منى 2 / تهاني 2** · Truth **منى**

**Example 2 — the room is right out loud and wrong in private.**
Public accusation **منى** after EV-5. But Tahani's confrontation B has just made
her look like a hunter, and Yasser's silence reads as protection.
> Accused **منى** · Votes **تهاني 3 / منى 1** · Truth **منى**
> *"We accused the wrong person."*

Both arise from players reasoning about **who leaked the voice note** — not from
answering a different question. That was the failure mode in v1's divergence and
it is closed.

---

## Final recommendation

# **PASS**

Ready for one-run implementation.

The v1 review's blocking fault — a ballot question with only one evidentially
supported answer — is closed by C1, and closed cheaply: one story fact, one
sentence in the public setup, one edit to EV-1's inspection layer. Everything
downstream (a second complete theory, a mobile accusation, legitimate
accusation/vote divergence, real replay variance) follows from that single
change.

C2 repairs an object that did not work. C3 turns a spotlight into a comparison.
C5 and C6 close the two gaps where the case depended on a player choosing to
speak. C7 puts the strongest contradiction last, where it belongs.

Three public objects, two private holdings, seven truth facts, zero engine
changes, zero new evidence types. The case now fits the TRUSTED architecture
exactly as it stands.

The risks in §21 are real but none of them is structural, and the largest of them
— that a room falls in love with the Tahani theory — is the case working as
designed.

---

**END — CASE 003 «الفويس» REVISION V2**
