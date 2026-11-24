/* ============================================================
   رحلة القرآن — التجويد للأطفال على مرحلتين (نموذج أولي)
   ============================================================
   الطريقة: «طريقة التعلم — من فيديوهات التطبيق نفسه»
   (learning_method_spec.md, 2026-11-23) + وثيقة إنستنكت
   «التجويد للأطفال على مرحلتين» — الخطوة 1 فقط: نموذج صغير
   (مرحلتان، 3 محطات)، لا نشر قبل موافقة معلم تجويد.

   حلقة الدرس اليومي (6 خطوات + افتتاحية — كل خطوة شاشة
   واحدة، جملة توجيه واحدة):
   0. الافتتاحية (سريعة): بطاقة الدرس + هدف المحطة +
      مراجعة سؤال واحد من الدرس اللي فات.
   1. اسمع: زر واحد كبير، القارئ الحقيقي يقرأ المقطع كاملًا
      مرة واحدة بسرعته الأصلية — لا تشغيل تلقائي.
   2. ردّد (تلقين): عبارة قصيرة 3 مرات («قولها ورايا»)، ثم
      المقطع كاملًا مرة. التلقين بصوت القارئ المعتمد من واجهة
      التطبيق نفسها (الحصري/العفاسي) — لا يعتمد النموذج على
      أي فيديو تلقين أطفال (قريش ×10 محذوف، الإخلاص ×10 خاص،
      والتلقين موجود في التطبيق للعصر فقط).
   3. احفظ بالاسترجاع: الآية تتغطى، الطفل يسمّعها من ذاكرته
      (تسجيل اختياري)، ثم يكشفها ويقارن بنفسه. زرّا المقارنة
      منفصلان («صوت القارئ» / «صوتي»)، وسؤال الملاحظة الواحد.
   4. افهم: معنى واحد من التفسير الميسر + سؤال تطبيق واحد.
      المرحلة الثانية تضيف هنا اسم الحكم وسببه.
   5. تدريب + سؤال استرجاع: تدريب «بيّن الحكم» (4–6 مواضع
      حقيقية من السورة نفسها)، ثم سؤال استرجاع واحد.
   6. الختام + المراجعة المتباعدة: يوم، ثم 3 أيام، ثم أسبوع
      (سَبَق/سَبْقي/مَنْزِل)؛ والغياب لا يمحو النجوم.

   أدوات من الفيديوهات: عدّاد الأصابع للحركتين، «جرّب بنفسك»،
   «فكّ شفرة البيت» (مرحلة ثانية)، لون ثابت + تسمية لكل حكم
   (مع التسمية دائمًا — لا اعتماد على اللون وحده)، بطاقة
   «ازاي أعرف الحكم في المصحف؟»، بطاقة «عارف إن…؟»، تحذير
   «خد بالك!» قبل الغلطة الشائعة، هدف بشري لكل محطة.

   صوت التعليمات: تسجيلات روني نفسه (لما يبعتها) — لحد ما
   يبعتها، التعليمات مكتوبة على الشاشة بس، من غير أي صوت آلي.

   حدود المقارنة الذاتية: الطفل يجرّب ويسجّل ويسمع صوته جنب
   صوت القارئ ويقارن بأذنه، ويجاوب على سؤال الملاحظة الواحد.
   التطبيق لا يقول «صح» أو «غلط» على تلاوته أبدًا، ولا يعرض
   نسبة صحة — الحكم على التسميع للمعلم وحده. التسجيل مؤقت
   على الجهاز ويُحذف عند مغادرة الدرس، ولا يُرفع ولا يُشارك
   ولا يُحلَّل.

   قاعدة اللام الشمسية والقمرية (مراجعة 2026-11-23 ضد
   quran-uthmani): الأمثلة في باب اللام صحيحة وكاملة —
   «ٱلْقَمَرُ» (54:1) قمرية تُظهر، «وَٱلشَّمْسُ» (36:38)
   شمسية تُدغم، «قُلْ نَعَمْ» (37:18) لام فعل تُظهر.
   والنموذج يمثّل القاعدة صح: اللام الشمسية تُدغم
   (الشمس تُنطق «أَشَّمْسُ»)، واللام القمرية تُظهر
   (القمر تُنطق «أَلْقَمَرُ») — انظر darJrnLamNote.

   المصادر: نص القرآن والتفسير الميسر والصوت من AlQuran Cloud
   (الطبعة المثبتة quran-uthmani، القارئ من واجهة التطبيق) عبر
   دارFetchSurah — لا يُكتب نص قرآني في هذا الملف؛ المواضع
   تُحسب برقم الآية ورقم الكلمة من النص المجلب، ومواضع
   التدريب تُكتشف آليًا من النص نفسه. ألفاظ الأحكام للمرحلة
   الثانية من متن تحفة الأطفال (DAR_MATN)؛ حكم القلقلة سجل
   محلي بانتظار اعتماد المعلم (لا باب له في المتن داخل التطبيق).
   لا صوت آلي على نص ديني أبدًا.
   ============================================================ */

/* ---------- البيانات: المحطات بترتيب التدريس (114 ← 113 ← 112) ---------- */
const DAR_JRN_STATIONS = [
  { surah: 114, goal: 'بعد ما تخلص السورة دي، هتقدر تعلّمها لأخوك', fact: 'عارف إن… سورة الناس آخر سورة في المصحف؟', lessons: [
    { id: 'n1', kind: 'listen', t1: 'أذني تسمع، وفمي يقلّد', s1: 'هنسمع سورة الناس كلها، وبعدين نقلّدها آية آية.' },
    { id: 'n2', kind: 'ghunnah', ayah: 1, wordIdx: 3, t1: 'اسمع الرنين الهادئ', s1: 'في صوت بيرنّ بهدوء — اسمعه من القارئ.' },
    { id: 'n3', kind: 'madd', ayah: 1, wordIdx: 1, t1: 'طريق قصير نكمله بهدوء', s1: 'في صوت بيتمدّ شوية وإحنا ماشيين — اسمعه كويس.' },
  ]},
  { surah: 113, goal: 'بعد ما تخلص السورة دي، هتقدر تقرأها لصاحبك وتعلّمها له', fact: 'عارف إن… سورتا الفلق والناس اسمهم المعوذتين؟', lessons: [
    { id: 'f1', kind: 'listen', t1: 'أذني تسمع، وفمي يقلّد', s1: 'هنسمع سورة الفلق كلها، وبعدين نقلّدها آية آية.' },
    { id: 'f2', kind: 'madd', ayah: 2, wordIdx: 2, t1: 'طريق قصير نكمله بهدوء', s1: 'في صوت بيتمدّ شوية وإحنا ماشيين — اسمعه كويس.' },
    { id: 'f3', kind: 'qalqalah', ayah: 2, wordIdx: 3, waqf: true, t1: 'كرة ترتد ارتدادًا خفيفًا', s1: 'لما نقف في آخر الآية، في حرف بينطّ نطّة خفيفة — اسمعه.' },
    { id: 'f4', kind: 'ghunnah', ayah: 4, wordIdx: 2, t1: 'اسمع الرنين الهادئ', s1: 'في صوت بيرنّ بهدوء — اسمعه من القارئ.' },
  ]},
  { surah: 112, goal: 'بعد ما تخلص السورة دي، هتقدر تعلّمها لأخوك الصغير', fact: 'عارف إن… سورة الإخلاص أربع آيات بس؟', lessons: [
    { id: 'i1', kind: 'listen', t1: 'أذني تسمع، وفمي يقلّد', s1: 'هنسمع سورة الإخلاص كلها، وبعدين نقلّدها آية آية.' },
    { id: 'i2', kind: 'madd', ayah: 4, wordIdx: 3, t1: 'طريق قصير نكمله بهدوء', s1: 'في صوت بيتمدّ شوية وإحنا ماشيين — اسمعه كويس.' },
    { id: 'i3', kind: 'qalqalah', ayah: 3, wordIdx: 1, t1: 'كرة ترتد ارتدادًا خفيفًا', s1: 'في حرف بينطّ نطّة خفيفة — اسمعه.' },
  ]},
];

/* ---------- بيانات الأحكام للمرحلة الثانية ----------
   المد والغنة: الاسم والشرح من متن تحفة الأطفال (DAR_MATN).
   القلقلة: سجل محلي بانتظار اعتماد المعلم. */
const DAR_JRN_RULES = {
  madd: { chapterId: 'aqsaam-madd', ruleName: 'المد الطبيعي (الأصلي)',
    nameQ: 'اسم الحكم ده إيه؟',
    nameOpts: ['المد الطبيعي (الأصلي)', 'الإدغام', 'الإخفاء'],
    reasonQ: 'ليه الحكم ده هنا؟',
    reasonOpts: ['حرف المد جا لوحده، من غير همزة ولا سكون بعده', 'جا همزة بعد حرف المد', 'الحرف مشدد'] },
  ghunnah: { chapterId: 'mushaddad', ruleName: 'غُنّة النون المشددة',
    nameQ: 'اسم الحكم ده إيه؟',
    nameOpts: ['غُنّة النون المشددة', 'الإظهار الحلقي', 'القلقلة'],
    reasonQ: 'ليه الحكم ده هنا؟',
    reasonOpts: ['النون عليها شدة', 'النون ساكنة', 'بعد النون حرف من حروف الحلق'] },
  qalqalah: { chapterId: null, ruleName: 'القلقلة', teacherReview: 'pending',
    plain: 'لو حرف من حروف «قطب جد» (القاف والطاء والباء والجيم والدال) جه ساكن، بننطقه بنطّة خفيفة — زي الكرة لما ترتد مرة واحدة.',
    nameQ: 'اسم الحكم ده إيه؟',
    nameOpts: ['القلقلة', 'المد الطبيعي', 'الإقلاب'],
    reasonQ: 'ليه الحكم ده هنا؟',
    reasonOpts: ['الحرف ساكن، ومن حروف «قطب جد»', 'الحرف مشدد', 'جا همزة بعد الحرف'] },
};
/* لون ثابت + تسمية لكل حكم (التسمية مع اللون دائمًا) */
const DAR_JRN_RULE_STYLE = {
  listen: { color: '#0B3D2E', label1: 'استماع', label2: 'الاستماع' },
  madd: { color: '#2E7D32', label1: 'صوت بيتمدّ', label2: 'المد الطبيعي' },
  ghunnah: { color: '#B8860B', label1: 'رنين', label2: 'غُنّة النون المشددة' },
  qalqalah: { color: '#1565C0', label1: 'نطّة', label2: 'القلقلة' },
};
/* محتوى تعليمي لكل حكم: صيغة أولى بلا أسماء، وصيغة ثانية بالأسماء */
const DAR_JRN_TEACH = {
  madd: {
    knowHow: { s1: 'دور على حرف بيتمدّ — ألف بعد فتحة، أو واو بعد ضمة، أو ياء بعد كسرة.', s2: 'دور على ألف أو واو أو ياء ساكنة بعد حركة زيها: فتحة قبل الألف، وضمة قبل الواو، وكسرة قبل الياء.' },
    fact: { s1: 'عارف إن… الصوت الممدود بيتمدّ حركتين بس؟', s2: 'عارف إن… حروف المد تلاتة بس: الألف والواو والياء؟' },
    warn: { s1: 'خد بالك! ما تمدّش الصوت أكتر من حركتين — حركتين بس.', s2: 'خد بالك! ما تمدّش أكتر من حركتين — المد الطبيعي حركتان فقط.' },
    tryIt: 'جرّب بنفسك: مدّ الصوت وعدّ حركتين على صوابعك.',
    letters: 'الألف والواو والياء',
    whyNamed: 'سُمّي طبيعيًا لأنه بييجي لوحده من غير سبب — لا همزة ولا سكون بعده.',
    howSay: 'بنمدّه حركتين بس.' },
  ghunnah: {
    knowHow: { s1: 'دور على نون أو ميم عليها شدة — الشدة يعني الصوت بيرنّ.', s2: 'دور على نون أو ميم عليها شدة ( ّ ) — الشدة علامة الغنة.' },
    fact: { s1: 'عارف إن… الصوت ده بيطلع من مناخيرنا؟', s2: 'عارف إن… المتن سمّى النون والميم المشددتين «حرفا غُنّة»؟' },
    warn: { s1: 'خد بالك! الصوت ده من الأنف، مش من الحلق — وما تضغطش على الشفتين قوي.', s2: 'خد بالك! الغُنّة من الأنف، مش من الحلق — وما تضغطش على الشفتين قوي.' },
    tryIt: 'جرّب بنفسك: قول «أَمْ… أَنْ…» وحسّ الرنين من مناخيرك.',
    letters: 'النون والميم',
    whyNamed: 'سُمّيت غُنّة لأن صوتها بيرنّ من الأنف.',
    howSay: 'بنغنّيها حركتين.' },
  qalqalah: {
    knowHow: { s1: 'دور على حرف عليه سكون بينطّ — أو في آخر الآية لما نقف.', s2: 'دور على حرف من «قطب جد» عليه سكون ( ْ ) — أو في آخر الآية لما نقف.' },
    fact: { s1: 'عارف إن… النطّة دي خفيفة أوي — زي الكرة لما ترتد مرة واحدة؟', s2: 'عارف إن… حروف القلقلة خمسة بس، مجموعة في كلمة «قطب جد»؟' },
    warn: { s1: 'خد بالك! النطّة خفيفة — ما تزودش حرف بعدها.', s2: 'خد بالك! القلقلة نطّة خفيفة — ما تزودش حرف بعدها.' },
    tryIt: 'جرّب بنفسك: قول الحرف ونطّه نطّة خفيفة.',
    letters: 'القاف والطاء والباء والجيم والدال',
    whyNamed: 'سُمّيت قلقلة لأن الحرف بيترجرج — بينطّ نطّة خفيفة.',
    howSay: 'بننطقها بنطّة خفيفة.' },
};
/* حروف اللام القمرية (من بيت المتن) والشمسية — لملاحظة النطق */
const DAR_JRN_LAM_QAM = ['ا', 'ب', 'غ', 'ح', 'ج', 'ك', 'و', 'خ', 'ف', 'ع', 'ق', 'ي', 'م', 'ه'];
const DAR_JRN_LAM_SHAM = ['ت', 'ث', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ل', 'ن'];
const DAR_JRN_STEP_NAMES = ['افتتاحية', 'اسمع', 'ردّد', 'احفظ', 'افهم', 'تدريب', 'ختام'];

/* ---------- المرحلة والتقدم (تخزين محلي) ---------- */
const DAR_JRN_STAGE_KEY = 'asly_journey_stage';
const DAR_JRN_PROG_KEY = 'asly_journey_progress';
function darJrnStage() {
  try { const v = localStorage.getItem(DAR_JRN_STAGE_KEY); return v === '2' ? 2 : 1; } catch (e) { return 1; }
}
function darJrnSetStage(v) {
  try { localStorage.setItem(DAR_JRN_STAGE_KEY, String(v === 2 ? 2 : 1)); } catch (e) {}
  darJrnRenderSettingsHint();
  if (darJrnView === 'map') darJrnRenderMap();
  else if (darJrnRun) darJrnRenderStep();
  darJourneyHomeCard();
}
function darJrnProg() {
  try { return JSON.parse(localStorage.getItem(DAR_JRN_PROG_KEY) || '{}'); } catch (e) { return {}; }
}
function darJrnSaveProg(p) { try { localStorage.setItem(DAR_JRN_PROG_KEY, JSON.stringify(p)); } catch (e) {} }
function darJrnLessonState(id) {
  const p = darJrnProg();
  const l = (p.lessons || {})[id];
  return l || { stars: [false, false, false], know: [false, false, false], reviews: 0, due: null, teacherReviewed: false, obs: '' };
}
function darJrnFlat() {
  const out = [];
  DAR_JRN_STATIONS.forEach(function (st, sIdx) {
    st.lessons.forEach(function (ls, lIdx) { out.push({ station: st, lesson: ls, sIdx: sIdx, lIdx: lIdx }); });
  });
  return out;
}
function darJrnLessonById(id) {
  const f = darJrnFlat().filter(function (x) { return x.lesson.id === id; })[0];
  return f || null;
}
function darJrnIsOpen(id) {
  const flat = darJrnFlat();
  const i = flat.findIndex(function (x) { return x.lesson.id === id; });
  if (i <= 0) return true;
  const p = darJrnProg();
  if ((p.overrides || {})[id]) return true;
  return !!darJrnLessonState(flat[i - 1].lesson.id).stars[0];
}
function darJrnStationState(sIdx) {
  const st = DAR_JRN_STATIONS[sIdx];
  const p = darJrnProg();
  if ((p.stations || {})[st.surah] && p.stations[st.surah].teacherReviewed) return 'راجعها المعلم';
  const today = darTodayStr();
  let attempted = false;
  for (const ls of st.lessons) {
    const s = darJrnLessonState(ls.id);
    if (s.due && s.due <= today) return 'موعد مراجعة';
    if (s.stars[0]) attempted = true;
  }
  return attempted ? 'أتدرب' : 'جديدة';
}
function darJrnRulePlain(kind) {
  const r = DAR_JRN_RULES[kind];
  if (!r) return '';
  if (r.chapterId) {
    const ch = (typeof DAR_MATN !== 'undefined' ? DAR_MATN.chapters : []).filter(function (c) { return c.id === r.chapterId; })[0];
    if (ch) {
      const rule = (ch.rules || []).filter(function (ru) { return ru.name === r.ruleName; })[0];
      if (rule) return rule.plain || '';
    }
  }
  return r.plain || '';
}
/* بيت المتن لنشاط «فكّ شفرة البيت» (من DAR_MATN حرفيًا) */
function darJrnDecodeVerse(kind) {
  if (kind === 'madd') {
    const ch = (typeof DAR_MATN !== 'undefined' ? DAR_MATN.chapters : []).filter(function (c) { return c.id === 'aqsaam-madd'; })[0];
    if (!ch) return null;
    const v = (ch.verses || []).filter(function (vs) { return vs.join(' ').indexOf('وَايٍ') !== -1; })[0];
    return v ? { lines: v, key: 'وَايٍ', letters: ['و', 'ا', 'ي'] } : null;
  }
  if (kind === 'ghunnah') {
    const ch = (typeof DAR_MATN !== 'undefined' ? DAR_MATN.chapters : []).filter(function (c) { return c.id === 'mushaddad'; })[0];
    if (!ch) return null;
    const v = (ch.verses || []).filter(function (vs) { return vs.join(' ').indexOf('شُدِّدَا') !== -1; })[0];
    return v ? { lines: v, keys: ['مِيمًا', 'نُونًا'], letters: ['م', 'ن'] } : null;
  }
  if (kind === 'qalqalah') return { lines: null, key: 'قطب جد', letters: ['ق', 'ط', 'ب', 'ج', 'د'] };
  return null;
}

/* ---------- كشف مواضع الحكم في النص المجلب (للتدريب) ---------- */
function darJrnWordMatches(word, kind, isFinal) {
  if (kind === 'ghunnah') return word.indexOf('ن\u0651') !== -1 || word.indexOf('م\u0651') !== -1;
  if (kind === 'madd') {
    if (/[\u064e]ا/.test(word)) return true;
    if (/[\u064e]\u0670/.test(word)) return true;
    if (/[\u064f]و(?![\u064e\u064f\u0650])/.test(word)) return true;
    if (/[\u0650]ي(?![\u064e\u064f\u0650])/.test(word)) return true;
    if (/[\u0650]ى/.test(word)) return true;
    return false;
  }
  if (kind === 'qalqalah') {
    if (/[قطبجد]\u0652/.test(word)) return true;
    if (isFinal && /[قطبجد][\u064b-\u0652\u0670]*$/.test(word)) return true;
    return false;
  }
  return false;
}
/* ملاحظة نطق اللام في الكلمة: شمسية تُدغم، قمرية تُظهر.
   علامة الرسم العثماني: اللام الشمسية تُكتب بلا سكون (ٱل + حرف
   مشدد)، واللام القمرية تُكتب بالسكون (ٱلْ). */
function darJrnLamNote(word, stage) {
  if (!word || word.charAt(0) !== '\u0671' || word.charAt(1) !== 'ل') return '';
  let next, said;
  if (word.charAt(2) === '\u0652') { /* لام عليها سكون -> قمرية */
    next = word.charAt(3);
    if (DAR_JRN_LAM_QAM.indexOf(next) === -1) return '';
    said = 'أَ' + word.slice(1);
    return stage === 1
      ? 'اسمع: اللام هنا بتتقال واضحة — «' + said + '»'
      : 'اللام هنا قمرية — بتتظهر: تُنطق «' + said + '»';
  }
  /* لام بلا سكون -> شمسية */
  next = word.charAt(2);
  if (DAR_JRN_LAM_SHAM.indexOf(next) === -1) return '';
  said = 'أَ' + word.slice(2);
  return stage === 1
    ? 'اسمع: اللام هنا مش بتتقال — الصوت «' + said + '»'
    : 'اللام هنا شمسية — بتتدغم: تُنطق «' + said + '»';
}

/* ---------- الصوت: مقرئ حقيقي فقط من واجهة التطبيق (عنصر صوت منفصل) ---------- */
let darJrnAudio = null;
function darJrnStopAudio() {
  if (darJrnAudio) { try { darJrnAudio.pause(); } catch (e) {} darJrnAudio = null; }
}
function darJrnPlayUrl(url, onended) {
  darJrnStopAudio();
  if (!url) { if (onended) onended(); return; }
  try {
    darJrnAudio = new Audio(url);
    darJrnAudio.onended = function () { darJrnAudio = null; if (onended) onended(); };
    darJrnAudio.onerror = function () { darJrnAudio = null; if (onended) onended(); };
    const pr = darJrnAudio.play();
    if (pr && pr.catch) pr.catch(function () { darJrnAudio = null; if (onended) onended(); });
  } catch (e) { if (onended) onended(); }
}
function darJrnAyahAudio(d, ayahN) {
  const a = (d.ayahs || []).filter(function (x) { return x.numberInSurah === ayahN; })[0];
  return a ? a.audio : '';
}

/* ---------- التسجيل: مؤقت على الجهاز، يُحذف عند مغادرة الدرس ---------- */
let darJrnRec = null, darJrnRecChunks = [], darJrnRecStream = null;
function darJrnStopRec() {
  try { if (darJrnRec && darJrnRec.state !== 'inactive') darJrnRec.stop(); } catch (e) {}
  darJrnRec = null;
  if (darJrnRecStream) { try { darJrnRecStream.getTracks().forEach(function (t) { t.stop(); }); } catch (e) {} darJrnRecStream = null; }
}
function darJrnStartRec() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    toast('الميكروفون مش متاح على جهازك — تقدر تكمل بالاستماع والتقليد من غير تسجيل');
    return;
  }
  navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
    darJrnRecStream = stream;
    darJrnRecChunks = [];
    try { darJrnRec = new MediaRecorder(stream); } catch (e) { if (darJrnRun) { darJrnRun.recState = 'idle'; darJrnRenderStep(); } toast('الميكروفون مش متاح — تقدر تكمل بالاستماع والتقليد من غير تسجيل'); return; }
    darJrnRec.ondataavailable = function (e) { if (e.data && e.data.size) darJrnRecChunks.push(e.data); };
    darJrnRec.onstop = function () {
      try {
        const blob = new Blob(darJrnRecChunks, { type: darJrnRec.mimeType || 'audio/webm' });
        if (darJrnRun && darJrnRun.recUrl) { try { URL.revokeObjectURL(darJrnRun.recUrl); } catch (e) {} }
        if (darJrnRun) darJrnRun.recUrl = URL.createObjectURL(blob);
      } catch (e) {}
      darJrnRenderStep();
    };
    darJrnRec.start();
    darJrnRenderStep();
  }).catch(function () {
    if (darJrnRun) { darJrnRun.recState = 'idle'; darJrnRenderStep(); }
    toast('الميكروفون مش متاح — تقدر تكمل بالاستماع والتقليد من غير تسجيل');
  });
}
/* تنظيف كامل عند مغادرة الدرس: إيقاف الصوت والتسجيل وحذف التسجيل. */
function darJrnCleanup() {
  darJrnStopAudio();
  darJrnStopRec();
  if (darJrnRun && darJrnRun.recUrl) { try { URL.revokeObjectURL(darJrnRun.recUrl); } catch (e) {} }
  darJrnRun = null;
  darJrnView = 'map';
}

/* ---------- حالة الجولة الحالية ---------- */
let darJrnView = 'map';
let darJrnRun = null;
function darJrnNewRun(loc, d, pd) {
  const stage = darJrnStage();
  const disp = darDisplayAyahs(d).ayahs;
  const lesson = loc.lesson;
  const targetAyahN = lesson.kind === 'listen' ? 1 : lesson.ayah;
  const ayah = disp.filter(function (a) { return a.n === targetAyahN; })[0] || disp[0];
  const words = ayah ? darWords(ayah.text) : [];
  const targetIdx = lesson.kind === 'listen' ? words.length - 1 : (lesson.wordIdx || 0);
  const targetWord = words[targetIdx] || '';
  /* المقطع: آية أو آيتان (الهدف + التالية إن وجدت)؛ درس الاستماع: السورة كاملة */
  const segment = lesson.kind === 'listen' ? disp.slice() : disp.filter(function (a) { return a.n === targetAyahN || a.n === targetAyahN + 1; });
  /* مواضع التدريب «بيّن الحكم»: كلمات حقيقية من السورة نفسها */
  const tiles = [];
  if (lesson.kind !== 'listen') {
    const correct = [], other = [];
    disp.forEach(function (a) {
      const ws = darWords(a.text);
      ws.forEach(function (w, i) {
        if (darJrnWordMatches(w, lesson.kind, i === ws.length - 1)) { if (correct.indexOf(w) === -1) correct.push(w); }
        else if (other.indexOf(w) === -1) other.push(w);
      });
    });
    const picks = correct.slice(0, 4);
    const fill = other.slice(0, Math.min(6 - picks.length, Math.max(2, 4 - picks.length)));
    picks.concat(fill).sort(function () { return Math.random() - 0.5; }).forEach(function (w) {
      tiles.push({ w: w, correct: correct.indexOf(w) !== -1, found: false, wrong: false });
    });
  }
  const flat = darJrnFlat();
  const idx = flat.findIndex(function (x) { return x.lesson.id === lesson.id; });
  const prev = idx > 0 ? flat[idx - 1] : null;
  /* سؤال مراجعة واحد من الدرس اللي فات (للافتتاحية) */
  let reviewQ = null;
  if (prev) {
    const prevDisp = darDisplayAyahs(pd || d).ayahs;
    if (prev.lesson.kind === 'listen') {
      const names = DAR_JRN_STATIONS.map(function (st) { return darSurahBare((DAR_SURAHS.filter(function (s) { return s.n === st.surah; })[0] || {}).name); });
      const aName = darSurahBare((DAR_SURAHS.filter(function (s) { return s.n === prev.station.surah; })[0] || {}).name);
      const opts = names.slice().sort(function () { return Math.random() - 0.5; });
      reviewQ = { q: 'فاكر السورة اللي فاتت كانت إيه؟', opts: opts, a: opts.indexOf(aName) };
    } else if (stage === 1) {
      const pa = prevDisp.filter(function (a) { return a.n === prev.lesson.ayah; })[0] || prevDisp[0];
      const pw = darWords(pa.text);
      const target = pw[prev.lesson.wordIdx] || '';
      const all = [];
      prevDisp.forEach(function (a) { darWords(a.text).forEach(function (w) { if (w !== target && all.indexOf(w) === -1) all.push(w); }); });
      const opts = [target].concat(all.slice(0, 2)).sort(function () { return Math.random() - 0.5; });
      reviewQ = { q: 'فاكر الدرس اللي فات؟ سمعت الصوت ده فين؟', opts: opts, a: opts.indexOf(target) };
    } else {
      const names = Object.keys(DAR_JRN_RULES).map(function (k) { return DAR_JRN_RULES[k].ruleName; });
      const aName = DAR_JRN_RULES[prev.lesson.kind].ruleName;
      const opts = names.slice().sort(function () { return Math.random() - 0.5; });
      reviewQ = { q: 'فاكر الدرس اللي فات؟ اسم الحكم كان إيه؟', opts: opts, a: opts.indexOf(aName) };
    }
  }
  return {
    loc: loc, d: d, disp: disp, ayah: ayah, words: words, targetIdx: targetIdx, targetWord: targetWord,
    segment: segment, tiles: tiles, prev: prev, reviewQ: reviewQ,
    step: 0, stage: stage, visited: [true],
    stars: [false, false, false], know: [false, false, false],
    played: false, repeatCount: 0, repeatDone: false, segmentDone: false,
    revealed: false, thinkDone: false, retrievalDone: false, recUrl: null, recState: 'idle',
    obs: '', saved: false, reviewDone: false, reviewSkipped: false,
    drillPhase: 'tiles', decodeDone: false, decodeFound: [], tryDone: false, fingers: [false, false],
    dueNow: (function () { const s = darJrnLessonState(lesson.id); return !!(s.due && s.due <= darTodayStr()); })(),
  };
}

/* ---------- الخريطة ---------- */
function darJrnLessonTitle(ls, stage) {
  if (stage === 2) {
    if (ls.kind === 'listen') return 'الاستماع';
    return DAR_JRN_RULES[ls.kind].ruleName;
  }
  return ls.t1;
}
function darEnsureJourney() {
  const host = document.getElementById('journeyContent');
  if (!host) return;
  if (darJrnRun) { darJrnRenderStep(); return; }
  darJrnRenderMap();
}
function darJrnRenderMap() {
  darJrnView = 'map';
  const host = document.getElementById('journeyContent');
  if (!host) return;
  const stage = darJrnStage();
  const flat = darJrnFlat();
  const done = flat.filter(function (f) { return darJrnLessonState(f.lesson.id).stars[0]; }).length;
  const skills1 = 'الاستماع • صوت بيتمدّ • رنين هادئ • نطّة خفيفة';
  const skills2 = 'الاستماع • المد الطبيعي • غُنّة النون المشددة • القلقلة';
  let h = '<div class="dar-section-intro"><h3 class="dar-h3">🗺️ رحلتي مع القرآن</h3>'
    + '<p>رحلة تبدأ بالسماع والتقليد — كل درس خطوات قليلة وواضحة، وجملة توجيه واحدة في كل شاشة.</p>'
    + '<p><strong>المرحلة الحالية:</strong> ' + (stage === 1 ? 'الأولى — اسمع وقلّد (6–9 سنوات)' : 'الثانية — اكتشف وطبّق (10–14 سنة)') + '</p>'
    + '<p><strong>المهارات في المحطات الثلاث:</strong> ' + darEsc(stage === 1 ? skills1 : skills2) + '</p>'
    + '<p>التقدم: ' + done + ' من ' + flat.length + ' درس.</p>'
    + '<p class="hint">لا نغلق القراءة أو الاستماع لأي سورة — السور كلها مفتوحة في المصحف. الدرس اللي بعده بيتفتح لما تخلّص الدرس اللي قبله، أو بموافقة المعلم.</p></div>'
    + darNoTtsLine()
    + '<div class="dar-jrn-map-tools"><button class="dar-btn" id="darJrnChangeStageBtn" onclick="darJrnChangeStage()">👶 تغيير المرحلة (لولي الأمر أو المعلم)</button></div>';
  DAR_JRN_STATIONS.forEach(function (st, sIdx) {
    const surah = DAR_SURAHS.filter(function (s) { return s.n === st.surah; })[0] || { name: '', ayahs: 0 };
    const state = darJrnStationState(sIdx);
    h += '<div class="dar-jrn-station"><div class="dar-jrn-station-head"><span class="dar-jrn-station-name">المحطة ' + (sIdx + 1) + ' — ' + darEsc(darSurahBare(surah.name)) + '</span>'
      + '<span class="dar-jrn-state">' + darEsc(state) + '</span></div>'
      + '<div class="dar-jrn-goal">🎯 ' + darEsc(st.goal) + '</div>'
      + '<div class="hint">' + surah.ayahs + ' آيات</div>';
    st.lessons.forEach(function (ls) {
      const s = darJrnLessonState(ls.id);
      const open = darJrnIsOpen(ls.id);
      const stars = s.stars.filter(Boolean).length;
      const due = !!(s.due && s.due <= darTodayStr());
      const pend = ls.kind === 'qalqalah';
      const style = DAR_JRN_RULE_STYLE[ls.kind];
      h += '<div class="dar-jrn-lesson-row">'
        + '<div class="dar-jrn-lesson-info"><div class="dar-jrn-lesson-title"><span class="dar-jrn-tag" style="border-color:' + style.color + ';color:' + style.color + '">' + darEsc(stage === 1 ? style.label1 : style.label2) + '</span> ' + darEsc(darJrnLessonTitle(ls, stage)) + '</div>'
        + '<div class="hint">' + darEsc(stage === 1 ? ls.s1 : (ls.kind === 'listen' ? 'هنسمع السورة كاملة ونقلّدها.' : darJrnRulePlain(ls.kind))) + '</div>'
        + (pend ? '<div class="dar-jrn-pend">' + (stage === 1 ? '⏳ بانتظار اعتماد المعلم' : '⏳ هذا الحكم بانتظار اعتماد معلم التجويد') + '</div>' : '')
        + '<div class="dar-jrn-stars">' + (stars ? '⭐'.repeat(stars) : '○ ○ ○') + ' <span class="hint">(' + stars + ' من 3)</span>'
        + (due ? ' <span class="dar-jrn-due">🔁 موعد مراجعة</span>' : '')
        + (s.teacherReviewed ? ' <span class="dar-jrn-due">✓ راجعه المعلم</span>' : '') + '</div></div>'
        + '<button class="dar-btn dar-jrn-start" data-lesson="' + ls.id + '" onclick="darJrnOpenLesson(\'' + ls.id + '\')">'
        + (open ? (due ? '🔁 راجع' : (stars ? 'كمّل' : 'ابدأ')) : '🔒 مقفول') + '</button></div>';
    });
    h += '</div>';
  });
  host.innerHTML = h;
  window.__darJrnMap = { stage: stage, done: done, total: flat.length };
}

/* ---------- فتح درس ---------- */
function darJrnOpenLesson(id) {
  if (!darJrnIsOpen(id)) {
    if (confirm('الدرس ده لسه مقفول — خلّص الدرس اللي قبله الأول.\nهل أنت المعلم أو ولي الأمر وعايز تفتحه دلوقتي؟')) {
      const p = darJrnProg(); p.overrides = p.overrides || {}; p.overrides[id] = true; darJrnSaveProg(p);
      toast('المعلم فتح الدرس');
    } else { return; }
  }
  const loc = darJrnLessonById(id);
  if (!loc) return;
  darJrnCleanup();
  const host = document.getElementById('journeyContent');
  if (host) host.innerHTML = '<div class="dar-loading">بنجهّز الدرس…</div>';
  darFetchSurah(loc.station.surah).then(function (d) {
    const flat = darJrnFlat();
    const idx = flat.findIndex(function (x) { return x.lesson.id === id; });
    const prev = idx > 0 ? flat[idx - 1] : null;
    if (prev && prev.station.surah !== loc.station.surah) {
      return darFetchSurah(prev.station.surah).then(function (pd) {
        darJrnRun = darJrnNewRun(loc, d, pd);
        darJrnRenderStep();
      });
    }
    darJrnRun = darJrnNewRun(loc, d, d);
    darJrnRenderStep();
  }).catch(function () {
    if (host) host.innerHTML = '<div class="dar-error">تعذّر تحميل السورة — تأكد من الاتصال وحاول تاني.</div><button class="dar-btn" onclick="darJrnRenderMap()">رجوع للخريطة</button>';
  });
}
function darJrnGoStep(n) {
  if (!darJrnRun) return;
  darJrnRun.step = Math.max(0, Math.min(6, n));
  darJrnRun.visited[darJrnRun.step] = true;
  darJrnRenderStep();
}

/* ---------- شاشة الدرس ---------- */
function darJrnRenderStep() {
  const host = document.getElementById('journeyContent');
  if (!host || !darJrnRun) { darJrnRenderMap(); return; }
  const r = darJrnRun;
  const ls = r.loc.lesson;
  const stage = r.stage;
  const title = darJrnLessonTitle(ls, stage);
  const surahName = darSurahBare((DAR_SURAHS.filter(function (s) { return s.n === r.loc.station.surah; })[0] || {}).name);
  const style = DAR_JRN_RULE_STYLE[ls.kind];
  let pills = '<div class="dar-jrn-steps">' + DAR_JRN_STEP_NAMES.map(function (nm, i) {
    return '<button class="dar-jrn-pill' + (r.step === i ? ' cur' : '') + (r.visited[i] ? ' seen' : '') + '" onclick="darJrnGoStep(' + i + ')">' + (i + 1) + ' ' + nm + '</button>';
  }).join('') + '</div>';
  let h = '<div class="dar-jrn-lesson">' + pills
    + '<h3 class="dar-h3"><span class="dar-jrn-tag" style="border-color:' + style.color + ';color:' + style.color + '">' + darEsc(stage === 1 ? style.label1 : style.label2) + '</span> ' + darEsc(title) + ' <span class="hint">— سورة ' + darEsc(surahName) + '</span></h3>'
    + (r.dueNow ? '<div class="dar-jrn-due">🔁 مراجعة — راجعناها قبل كده، ودلوقتي وقت المراجعة.</div>' : '')
    + '<div id="darJrnStep">' + darJrnStepHtml() + '</div>'
    + '<div class="dar-jrn-nav">'
    + (r.step > 0 ? '<button class="dar-btn" onclick="darJrnGoStep(' + (r.step - 1) + ')">‹ اللي فاتت</button>' : '<span></span>')
    + (r.step < 6 ? '<button class="dar-btn dar-btn-primary" onclick="darJrnGoStep(' + (r.step + 1) + ')">التالي ›</button>' : '<button class="dar-btn" onclick="darJrnBackMap()">رجوع للخريطة</button>')
    + '</div></div>';
  host.innerHTML = h;
  if (r.step === 6) darJrnRenderEndInto();
}
function darJrnStepHtml() {
  const r = darJrnRun;
  if (!r) return '';
  if (r.step === 0) return darJrnStepOpening();
  if (r.step === 1) return darJrnStepListen();
  if (r.step === 2) return darJrnStepRepeat();
  if (r.step === 3) return darJrnStepMemorize();
  if (r.step === 4) return darJrnStepUnderstand();
  if (r.step === 5) return darJrnStepDrill();
  return darJrnStepClosing();
}

/* خطوة 0 — الافتتاحية (سريعة): بطاقة الدرس + الهدف + مراجعة سؤال واحد من الدرس اللي فات */
function darJrnStepOpening() {
  const r = darJrnRun, ls = r.loc.lesson;
  const style = DAR_JRN_RULE_STYLE[ls.kind];
  let h = '<div class="dar-jrn-instr">النهاردة هنتعلم صوت واحد بس</div>'
    + '<div class="dar-jrn-story"><div class="dar-jrn-story-t">' + darEsc(ls.t1) + '</div><p>' + darEsc(ls.s1) + '</p></div>'
    + '<div class="dar-jrn-goal">🎯 ' + darEsc(r.loc.station.goal) + '</div>'
    + '<p><span class="dar-jrn-tag" style="border-color:' + style.color + ';color:' + style.color + '">' + darEsc(r.stage === 1 ? style.label1 : style.label2) + '</span></p>';
  if (!r.prev) {
    h += '<div class="dar-fb-good">ده أول درس في الرحلة — يلا نبدأ!</div>';
  } else if (r.reviewDone) {
    h += '<div class="dar-fb-good">فاكر صح 👏 — يلا نبدأ الدرس الجديد.</div>';
  } else {
    const q = r.reviewQ;
    h += '<div class="dar-jrn-review"><div class="dar-jrn-story-t">🔁 مراجعة سريعة للدرس اللي فات</div>'
      + '<p>' + darEsc(q.q) + '</p>'
      + q.opts.map(function (o, i) { return '<button class="dar-choice" onclick="darJrnReviewAnswer(' + i + ')">' + darEsc(o) + '</button>'; }).join('')
      + '<div id="darJrnRevFb"></div>'
      + '<button class="dar-btn" onclick="darJrnReviewSkip()">مش فاكر — كمّل</button></div>';
  }
  h += '<button class="dar-btn dar-btn-primary dar-jrn-big" onclick="darJrnGoStep(1)">يلا نسمع ›</button>';
  return h;
}
function darJrnReviewAnswer(i) {
  const r = darJrnRun;
  const fb = document.getElementById('darJrnRevFb');
  if (i === r.reviewQ.a) { r.reviewDone = true; darJrnRenderStep(); }
  else if (fb) { fb.innerHTML = '<div class="dar-fb-soft">مش دي — فكّر تاني، أو كمّل عادي.</div>'; }
}
function darJrnReviewSkip() { darJrnRun.reviewSkipped = true; darJrnGoStep(1); }

/* خطوة 1 — اسمع: زر واحد كبير، المقطع كامل مرة بسرعته الأصلية، لا تشغيل تلقائي */
function darJrnStepListen() {
  const r = darJrnRun;
  const segHtml = r.segment.map(function (a) { return '<div class="dar-ayah-text">' + darEsc(a.text) + '</div>'; }).join('');
  return '<div class="dar-jrn-instr">اسمع الأول</div>'
    + segHtml
    + '<button class="dar-btn dar-btn-primary dar-jrn-big" id="darJrnListenBtn" onclick="darJrnPlaySegment()">▶ اسمع القارئ — ' + darEsc(darReciterName()) + '</button>'
    + (r.played ? '<div class="dar-fb-good">⭐ استمعت — تقدر تسمع تاني لو عايز.</div>' : '<p class="hint">القارئ الحقيقي يقرأ المقطع كامل مرة واحدة، بسرعته الأصلية.</p>')
    + '<div class="hint">التلاوة بصوت مقرئ حقيقي — لا صوت آلي.</div>';
}
function darJrnPlaySegment() {
  const r = darJrnRun;
  if (!r) return;
  const list = r.segment.filter(function (a) { return a.audio; });
  let i = 0;
  const next = function () {
    if (darJrnRun !== r) return; // الطفل ساب الدرس — وقّف السلسلة
    if (i >= list.length) { r.played = true; r.stars[0] = true; darJrnRenderStep(); return; }
    darJrnPlayUrl(list[i].audio, function () { i++; setTimeout(next, 400); });
  };
  next();
  toast('بيشتغل صوت القارئ…');
}

/* خطوة 2 — ردّد (تلقين): عبارة قصيرة 3 مرات، ثم المقطع كامل مرة */
function darJrnStepRepeat() {
  const r = darJrnRun, ls = r.loc.lesson;
  const teach = ls.kind === 'listen' ? null : DAR_JRN_TEACH[ls.kind];
  const warn = teach ? teach.warn[r.stage === 1 ? 's1' : 's2'] : 'خد بالك! اسمع الآية كلها الأول قبل ما تردد.';
  const lam = darJrnLamNote(r.targetWord, r.stage);
  let h = '<div class="dar-jrn-instr">ردّد ورا القارئ</div>'
    + '<div class="dar-jrn-warn">⚠️ ' + darEsc(warn) + '</div>'
    + '<div class="dar-ayah-text">' + darEsc(r.ayah.text) + '</div>'
    + (lam ? '<div class="dar-jrn-lam">🔊 ' + darEsc(lam) + '</div>' : '');
  if (r.repeatCount < 3) {
    h += '<p>القارئ يقول العبارة، وانت تقولها وراه — 3 مرات.</p>'
      + '<button class="dar-btn dar-btn-primary dar-jrn-big" id="darJrnSayBtn" onclick="darJrnRepeatSay()">▶ قولها ورايا — مرة ' + (r.repeatCount + 1) + ' من 3</button>'
      + '<p class="hint">قولها بصوتك بعد ما تسمعها.</p>';
  } else if (!r.segmentDone) {
    h += '<div class="dar-fb-good">خلّصت 3 مرات 👏 — دلوقتي المقطع كامل مرة.</div>'
      + '<button class="dar-btn dar-btn-primary dar-jrn-big" id="darJrnSegBtn" onclick="darJrnRepeatSegment()">▶ المقطع كامل مرة</button>';
  } else {
    h += '<div class="dar-fb-good">⭐ كرّرت — برافو 👏</div>';
  }
  if ((ls.kind === 'madd' || ls.kind === 'ghunnah')) h += darJrnFingersHtml();
  return h;
}
function darJrnRepeatSay() {
  const r = darJrnRun;
  if (!r || r.repeatCount >= 3) return;
  r.repeatCount++;
  darJrnPlayUrl(r.ayah.audio, function () {});
  darJrnRenderStep();
}
function darJrnRepeatSegment() {
  const r = darJrnRun;
  if (!r) return;
  const list = r.segment.filter(function (a) { return a.audio; });
  let i = 0;
  const next = function () {
    if (darJrnRun !== r) return; // الطفل ساب الدرس — وقّف السلسلة
    if (i >= list.length) { r.segmentDone = true; r.stars[1] = true; r.repeatDone = true; darJrnRenderStep(); return; }
    darJrnPlayUrl(list[i].audio, function () { i++; setTimeout(next, 400); });
  };
  next();
}
/* عدّاد الأصابع للحركتين */
function darJrnFingersHtml() {
  const r = darJrnRun;
  const done = r.fingers[0] && r.fingers[1];
  return '<div class="dar-jrn-fingers"><div class="dar-jrn-story-t">👆 عدّ على صوابعك وانت بتقولها</div>'
    + '<div class="row"><button class="dar-btn col dar-jrn-finger' + (r.fingers[0] ? ' on' : '') + '" onclick="darJrnFinger(0)">☝️ 1</button>'
    + '<button class="dar-btn col dar-jrn-finger' + (r.fingers[1] ? ' on' : '') + '" onclick="darJrnFinger(1)">☝️ 2</button></div>'
    + (done ? '<div class="dar-fb-good">حركتين — صح 👏</div>' : '<p class="hint">اضغط على كل صباع وانت بتقول الصوت.</p>') + '</div>';
}
function darJrnFinger(i) { darJrnRun.fingers[i] = true; darJrnRenderStep(); }

/* خطوة 3 — احفظ بالاسترجاع: الآية تتغطى، تسجيل اختياري، كشف ومقارنة بنفسه */
function darJrnStepMemorize() {
  const r = darJrnRun;
  const dots = r.words.map(function () { return '•'; }).join(' ');
  const shown = r.revealed ? darEsc(r.ayah.text) : '<span class="dar-jrn-dots">' + dots + '</span>';
  const recBtn = r.recState === 'rec'
    ? '<button class="dar-btn dar-jrn-big" id="darJrnRecBtn" onclick="darJrnStopRec();darJrnRun.recState=\'idle\';darJrnRenderStep()">⏹ إيقاف التسجيل</button><div class="dar-jrn-recing">🔴 بيسجّل… اضغط إيقاف لما تخلّص</div>'
    : '<button class="dar-btn dar-jrn-big" id="darJrnRecBtn" onclick="darJrnRun.recState=\'rec\';darJrnStartRec()">🎤 سجّل وانت بتسمّع (اختياري)</button>';
  let h = '<div class="dar-jrn-instr">سمّع الآية من ذاكرتك</div>'
    + '<p>الآية متغطية — قولها من ذاكرتك، وبعدين اكشفها وقارن بنفسك. ده استرجاع، مش إعادة قراءة.</p>'
    + '<div class="dar-ayah-text">' + shown + '</div>'
    + recBtn
    + (r.revealed
      ? '<div class="dar-fb-good">قارنت بنفسك — دي ملاحظتك انت، ومفيش حد بيصحح تلاوتك غير المعلم.</div>'
        + '<div class="row"><button class="dar-btn col" id="darJrnPlayModelBtn" onclick="darJrnPlayUrl(darJrnRun.ayah.audio, function(){})">▶ صوت القارئ</button>'
        + '<button class="dar-btn col" id="darJrnPlayMineBtn" onclick="darJrnPlayMine()">▶ صوتي</button></div>'
        + '<p class="hint">التسجيل للمقارنة على جهازك بس، ويُحذف لما تسيب الدرس — مش بيترفع ولا بيتشارك ولا بيتحلّل.</p>'
        + '<div class="dar-jrn-obs-q">هل سمعت الفرق في هذا الموضع؟</div>'
        + ['أيوه، سمعت فرق', 'سمعت شوية', 'مش سامع فرق'].map(function (o, i) {
          return '<button class="dar-choice dar-jrn-obs' + (r.obs === o ? ' correct' : '') + '" onclick="darJrnObs(' + i + ')">' + o + '</button>';
        }).join('')
        + (r.obs ? '<div class="dar-fb-good">شكراً — دي ملاحظتك انت. والمعلم هو اللي يراجع التسميع.</div>' : '')
      : '<button class="dar-btn dar-btn-primary dar-jrn-big" id="darJrnRevealBtn" onclick="darJrnReveal()">اكشف الآية وقارن بنفسك</button>');
  return h;
}
function darJrnReveal() { darJrnRun.revealed = true; darJrnRenderStep(); }
function darJrnPlayMine() {
  const r = darJrnRun;
  if (!r) return;
  if (!r.recUrl) { toast('سجّل صوتك الأول — وبعدين اسمعه'); return; }
  darJrnPlayUrl(r.recUrl, function () {});
}
function darJrnObs(i) {
  const r = darJrnRun;
  r.obs = ['أيوه، سمعت فرق', 'سمعت شوية', 'مش سامع فرق'][i];
  darJrnRenderStep();
  toast('شكراً — دي ملاحظتك انت، والمعلم هو اللي يراجع التسميع');
}

/* خطوة 4 — افهم: معنى واحد من التفسير الميسر + سؤال تطبيق (والمرحلة الثانية: اسم الحكم وسببه) */
function darJrnStepUnderstand() {
  const r = darJrnRun, ls = r.loc.lesson;
  const style = DAR_JRN_RULE_STYLE[ls.kind];
  const taf = r.ayah.tafsir || '';
  let h = '<div class="dar-jrn-instr">افهم معنى الآية</div>'
    + '<div class="dar-section-intro"><div class="dar-jrn-story-t">📘 معنى الآية (التفسير الميسر):</div>'
    + (taf ? '<p>' + darEsc(taf) + '</p>' : '<p class="hint">المعنى مش متاح دلوقتي — اسأل المعلم.</p>') + '</div>'
    + '<div class="dar-jrn-story"><div class="dar-jrn-story-t">🤔 فكّر</div><p>الآية دي بتعلّمنا إيه؟ وهنعمل إيه بيها في يومنا؟</p></div>'
    + (r.thinkDone
      ? '<div class="dar-fb-good">فكّرت فيها — الفهم معنى وتطبيق، مش حفظ تعريف.</div>'
      : '<button class="dar-btn dar-btn-primary dar-jrn-big" id="darJrnThinkBtn" onclick="darJrnThink()">فكّرت فيها ✓</button>');
  if (ls.kind !== 'listen') {
    const teach = DAR_JRN_TEACH[ls.kind];
    if (r.stage === 2) {
      h += '<div class="dar-jrn-card" style="border-color:' + style.color + '"><div class="dar-jrn-story-t">' + darEsc(DAR_JRN_RULES[ls.kind].ruleName) + '</div>'
        + '<p>' + darEsc(darJrnRulePlain(ls.kind)) + '</p>'
        + '<p><strong>حروفه:</strong> ' + darEsc(teach.letters) + '</p>'
        + '<p><strong>ليه سُمّي كده؟</strong> ' + darEsc(teach.whyNamed) + '</p>'
        + '<p><strong>ازاي بننطقه؟</strong> ' + darEsc(teach.howSay) + '</p></div>';
    }
    h += '<div class="dar-jrn-card" style="border-color:' + style.color + '"><div class="dar-jrn-story-t">🔍 ' + (r.stage === 1 ? 'ازاي أعرف الصوت ده في المصحف؟' : 'ازاي أعرف الحكم في المصحف؟') + '</div>'
      + '<p>' + darEsc(teach.knowHow[r.stage === 1 ? 's1' : 's2']) + '</p></div>';
    h += '<div class="dar-jrn-card"><div class="dar-jrn-story-t">💡 ' + darEsc(teach.fact[r.stage === 1 ? 's1' : 's2']) + '</div></div>';
  } else {
    h += '<div class="dar-jrn-card"><div class="dar-jrn-story-t">💡 ' + darEsc(r.loc.station.fact) + '</div></div>';
  }
  return h;
}
function darJrnThink() { darJrnRun.thinkDone = true; darJrnRenderStep(); }

/* خطوة 5 — تدريب «بيّن الحكم» + سؤال استرجاع */
function darJrnStepDrill() {
  const r = darJrnRun, ls = r.loc.lesson;
  if (ls.kind === 'listen') return darJrnStepDrillListen();
  const style = DAR_JRN_RULE_STYLE[ls.kind];
  const teach = DAR_JRN_TEACH[ls.kind];
  const lam = darJrnLamNote(r.targetWord, r.stage);
  let h = '<div class="dar-jrn-instr">' + (r.stage === 1 ? 'سمعت الصوت ده فين؟' : 'بيّن الحكم') + '</div>'
    + '<div class="dar-jrn-card"><div class="dar-jrn-story-t">✋ جرّب بنفسك</div><p>' + darEsc(teach.tryIt) + '</p>'
    + '<button class="dar-btn" id="darJrnTryBtn" onclick="darJrnPlayUrl(darJrnRun.ayah.audio, function(){})">▶ اسمع الصوت</button> '
    + (r.tryDone ? '<span class="dar-fb-good">جرّبتها 👏</span>' : '<button class="dar-btn" onclick="darJrnRun.tryDone=true;darJrnRenderStep()">جرّبتها ✓</button>')
    + '</div>'
    + '<p>اضغط على الكلمات اللي فيها الصوت — من آيات حقيقية في السورة.</p>'
    + '<div class="dar-jrn-tiles">' + r.tiles.map(function (t, i) {
      return '<button class="dar-jrn-tile' + (t.found ? ' found' : '') + (t.wrong ? ' wrong' : '') + '" style="' + (t.found ? 'border-color:' + style.color + ';color:' + style.color : '') + '" onclick="darJrnTileTap(' + i + ')"' + (t.found || t.wrong ? ' disabled' : '') + '>' + darEsc(t.w) + (t.found ? ' ✓' : '') + '</button>';
    }).join('') + '</div>'
    + (lam ? '<div class="dar-jrn-lam">🔊 ' + darEsc(lam) + '</div>' : '')
    + '<div id="darJrnDrillFb">' + (r.know[0] ? '<div class="dar-fb-good">برافو — لقيت كل المواضع 👏</div>' : '') + '</div>';
  if ((ls.kind === 'madd' || ls.kind === 'ghunnah')) h += darJrnFingersHtml();
  if (r.stage === 2) h += darJrnDecodeHtml();
  if (r.stage === 2 && r.know[0] && !r.know[1]) {
    const rule = DAR_JRN_RULES[ls.kind];
    h += '<div class="dar-jrn-instr">' + darEsc(rule.nameQ) + '</div>'
      + rule.nameOpts.map(function (o, i) { return '<button class="dar-choice" onclick="darJrnNameAnswer(' + i + ')">' + darEsc(o) + '</button>'; }).join('')
      + '<div id="darJrnQFb"></div>';
  }
  if (r.stage === 2 && r.know[1] && !r.know[2]) {
    const rule = DAR_JRN_RULES[ls.kind];
    h += '<div class="dar-jrn-instr">' + darEsc(rule.reasonQ) + '</div>'
      + '<div class="dar-fb-good">الاسم صح 👏 — دلوقتي السبب.</div>'
      + rule.reasonOpts.map(function (o, i) { return '<button class="dar-choice" onclick="darJrnReasonAnswer(' + i + ')">' + darEsc(o) + '</button>'; }).join('')
      + '<div id="darJrnQFb"></div>';
  }
  if (r.stage === 2 && r.know[2]) h += '<div class="dar-fb-good">نقاط الفهم: موضع ✓ / اسم ✓ / سبب ✓</div>';
  h += darJrnRetrievalHtml();
  return h;
}
function darJrnTileTap(i) {
  const r = darJrnRun;
  const t = r.tiles[i];
  if (!t || t.found || t.wrong) return;
  if (t.correct) {
    t.found = true;
    if (r.tiles.filter(function (x) { return x.correct && !x.found; }).length === 0) {
      r.know[0] = true;
      toast('برافو — لقيت كل المواضع 👏');
    }
  } else {
    t.wrong = true;
    toast('مش دي — اسمع تاني وحاول');
  }
  darJrnRenderStep();
}
function darJrnNameAnswer(i) {
  const r = darJrnRun;
  const fb = document.getElementById('darJrnQFb');
  if (i === 0) { r.know[1] = true; darJrnRenderStep(); }
  else if (fb) { fb.innerHTML = '<div class="dar-fb-soft">مش ده الاسم — فكّر تاني في اللي سمعته.</div>'; }
}
function darJrnReasonAnswer(i) {
  const r = darJrnRun;
  const fb = document.getElementById('darJrnQFb');
  if (i === 0) { r.know[2] = true; darJrnRenderStep(); }
  else if (fb) { fb.innerHTML = '<div class="dar-fb-soft">مش ده السبب — ارجع للشرح وفكّر تاني.</div>'; }
}
/* فكّ شفرة البيت (مرحلة ثانية): استخراج الحروف من بيت المتن */
function darJrnDecodeHtml() {
  const r = darJrnRun, ls = r.loc.lesson;
  const dec = darJrnDecodeVerse(ls.kind);
  if (!dec) return '';
  let h = '<div class="dar-jrn-card"><div class="dar-jrn-story-t">🔓 فكّ شفرة البيت</div>';
  if (dec.lines) {
    h += '<p class="dar-matn-line">«' + darEsc(dec.lines[0]) + '<br>' + darEsc(dec.lines[1]) + '»</p>'
      + '<p class="hint">اضغط على الحروف المخفية عشان تكشفها — واقرأ البيت مع معلمك وردّد وراه (التطبيق ما يقرأش المتن بصوت آلي).</p>';
  } else {
    h += '<p class="hint">اضغط على الحروف المخفية عشان تكشفها — الكلمة اللي بتجمع الحروف هي «قطب جد».</p>';
  }
  h += '<div class="dar-jrn-tiles">' + dec.letters.map(function (L, i) {
    const found = r.decodeFound.indexOf(i) !== -1;
    return '<button class="dar-jrn-tile' + (found ? ' found' : '') + '" onclick="darJrnDecodeTap(' + i + ')"' + (found ? ' disabled' : '') + '>' + (found ? darEsc(L) : '؟') + '</button>';
  }).join('') + '</div>';
  if (r.decodeDone) h += '<div class="dar-fb-good">فكّيت الشفرة 👏 — الحروف: ' + darEsc(dec.letters.join('، ')) + '</div>';
  h += '</div>';
  return h;
}
function darJrnDecodeTap(i) {
  const r = darJrnRun;
  if (r.decodeFound.indexOf(i) === -1) r.decodeFound.push(i);
  const dec = darJrnDecodeVerse(r.loc.lesson.kind);
  if (dec && r.decodeFound.length >= dec.letters.length) { r.decodeDone = true; toast('فكّيت الشفرة 👏'); }
  darJrnRenderStep();
}
/* تدريب درس الاستماع: اسمع آية، وحددها من بين ثلاث */
function darJrnStepDrillListen() {
  const r = darJrnRun;
  const pool = r.disp.slice(0, 3);
  const target = pool[1] || pool[0];
  r.listenTarget = target;
  let h = '<div class="dar-jrn-instr">اسمع الآية، واضغط عليها</div>'
    + '<button class="dar-btn dar-jrn-big" onclick="darJrnPlayUrl(darJrnRun.listenTarget.audio, function(){})">▶ اسمع الآية</button>'
    + pool.map(function (a) {
      return '<button class="dar-choice dar-ayah-text" style="text-align:right" onclick="darJrnListenDrillTap(' + a.n + ')">' + darEsc(a.text) + '</button>';
    }).join('')
    + (r.know[0] ? '<div class="dar-fb-good">صح، دي الآية اللي سمعتها 👏</div>' : '<p class="hint">اسمع كويس، وبعدين اضغط على الآية.</p>');
  h += darJrnRetrievalHtml();
  return h;
}
function darJrnListenDrillTap(n) {
  const r = darJrnRun;
  if (n === r.listenTarget.n) { r.know[0] = true; darJrnRenderStep(); }
  else { toast('لسه — اسمع تاني وحاول'); }
}
/* سؤال الاسترجاع: أكمل الآية */
function darJrnRetrievalHtml() {
  const r = darJrnRun;
  if (!r.retrievalChoices) {
    const all = [];
    r.disp.forEach(function (a) { darWords(a.text).forEach(function (w) { if (w !== r.targetWord && all.indexOf(w) === -1) all.push(w); }); });
    r.retrievalChoices = [r.targetWord].concat(all.slice(0, 2)).sort(function () { return Math.random() - 0.5; });
  }
  const blanked = r.words.map(function (w, i) { return i === r.targetIdx ? '_____ ' : darEsc(w) + ' '; }).join('');
  return '<div class="dar-jrn-instr">أكمل الآية</div>'
    + '<p>الاسترجاع هو اللي بيثبّت الحفظ — كمّل الكلمة الناقصة.</p>'
    + '<div class="dar-ayah-text">' + blanked + '</div>'
    + r.retrievalChoices.map(function (w) {
      return '<button class="dar-choice dar-jrn-ret-choice" data-w="' + darEsc(w) + '" onclick="darJrnRetrievalPick(this)">' + darEsc(w) + '</button>';
    }).join('')
    + '<div id="darJrnRetFb">' + (r.retrievalDone ? '<div class="dar-fb-good">صح 👏 — ⭐ راجعت.</div>' : '') + '</div>';
}
function darJrnRetrievalPick(btn) {
  const r = darJrnRun;
  const w = btn.getAttribute('data-w');
  if (w === r.targetWord) {
    r.stars[2] = true; r.retrievalDone = true;
    darJrnRenderStep();
  } else {
    btn.classList.add('wrong'); btn.disabled = true;
    const fb = document.getElementById('darJrnRetFb');
    if (fb) fb.innerHTML = '<div class="dar-fb-soft">حاول تاني — ارجع اسمع الآية لو عايز.</div>';
  }
}

/* خطوة 6 — الختام + المراجعة المتباعدة */
function darJrnStepClosing() {
  return '<div class="dar-jrn-instr">الختام</div><div id="darJrnEnd"></div>';
}
function darJrnRenderEndInto() {
  const host = document.getElementById('darJrnEnd');
  if (!host || !darJrnRun) return;
  const r = darJrnRun, ls = r.loc.lesson;
  const prev = darJrnLessonState(ls.id);
  const starRow = ['استمعت', 'كرّرت', 'راجعت'].map(function (nm, i) {
    return '<span class="dar-jrn-star' + (r.stars[i] ? ' on' : '') + '">' + (r.stars[i] ? '⭐ ' : '○ ') + nm + '</span>';
  }).join(' ');
  const knowRow = r.stage === 2 && ls.kind !== 'listen'
    ? '<p><strong>نقاط الفهم (منفصلة عن النجوم):</strong> موضع ' + (r.know[0] ? '✓' : '○') + ' / اسم ' + (r.know[1] ? '✓' : '○') + ' / سبب ' + (r.know[2] ? '✓' : '○') + '</p>'
      + '<p class="hint">' + darEsc(darJrnRulePlain(ls.kind)) + '</p>'
    : '';
  const teacherCard = prev.teacherReviewed
    ? '<div class="dar-fb-good">✓ راجعه المعلم</div>'
    : '<div class="dar-jrn-teacher-pending">📋 التسميع مع المعلم لم يراجع بعد</div>';
  const endLine = r.stage === 1
    ? '<div class="dar-jrn-endline">أحسنت المحاولة، نسمع تاني؟</div>'
    : '<div class="dar-jrn-endline">نتيجة الفهم: ' + r.know.filter(Boolean).length + ' من 3 — ' + darEsc(ls.kind === 'listen' ? 'استمعت وقلّدت السورة.' : darJrnRulePlain(ls.kind)) + '</div>';
  const nextFlat = darJrnFlat();
  const idx = nextFlat.findIndex(function (x) { return x.lesson.id === ls.id; });
  const nextLesson = nextFlat[idx + 1];
  const dueText = r.saved
    ? (function () { const s = darJrnLessonState(ls.id); return s.due ? '📅 المراجعة الجاية: ' + s.due + ' — وبعدها بعد 3 أيام، ثم بعد أسبوع.' : '📅 خلّصت دورة المراجعة — راجع من الخريطة وقت ما تحب.'; })()
    : '📅 بعد ما تخلّص الدرس، هيرجع لك للمراجعة بعد يوم، ثم بعد 3 أيام، ثم بعد أسبوع.';
  host.innerHTML = '<div class="dar-jrn-endcard">'
    + (r.obs ? '<div class="dar-fb-good">شكراً — دي ملاحظتك انت. والمعلم هو اللي يراجع التسميع.</div>' : '<p class="hint">ملاحظتك عن الفرق بتتسجل في خطوة «احفظ».</p>')
    + '<div class="dar-jrn-stars-big">' + starRow + '</div>' + knowRow + teacherCard + endLine
    + '<p class="hint">' + dueText + '</p>'
    + '<details class="dar-jrn-teacher"><summary>للمعلم / ولي الأمر</summary>'
    + '<p class="hint">ملاحظة الطفل عن الفرق: ' + darEsc(r.obs || 'لسه ما جاوبش') + '</p>'
    + '<p class="hint">نقاط النطق من تقييم المعلم فقط — التطبيق لا يحكم على التلاوة.</p>'
    + '<div class="row"><button class="dar-btn col" onclick="darJrnTeacherReviewed()">✓ راجعه المعلم</button>'
    + '<button class="dar-btn col" onclick="darJrnTeacherUnlock()">افتح الدرس التالي</button></div></details>'
    + (r.saved
      ? '<div class="dar-fb-good">✓ الدرس اتحسب.</div>'
        + (nextLesson ? '<button class="dar-btn dar-btn-primary dar-jrn-big" id="darJrnNextLessonBtn" onclick="darJrnOpenLesson(\'' + nextLesson.lesson.id + '\')">الدرس التالي ›</button>' : '')
        + '<button class="dar-btn dar-jrn-big" id="darJrnBackMap" onclick="darJrnBackMap()">رجوع للخريطة</button>'
      : '<button class="dar-btn dar-btn-primary dar-jrn-big" id="darJrnFinishBtn" onclick="darJrnFinish()">✓ خلّصت الدرس</button>')
    + '</div>';
}
function darJrnFinish() {
  const r = darJrnRun;
  if (!r) return;
  if (!r.stars[0]) { toast('اسمع الدرس الأول عشان يتحسب — ارجع لخطوة «اسمع»'); darJrnGoStep(1); return; }
  const id = r.loc.lesson.id;
  const p = darJrnProg(); p.lessons = p.lessons || {};
  const prev = darJrnLessonState(id);
  const today = darTodayStr();
  let rec;
  if (r.dueNow) {
    const nr = (prev.reviews || 0) + 1;
    rec = { stars: r.stars, know: r.know, reviews: nr, due: nr === 1 ? darAddDays(today, 3) : nr === 2 ? darAddDays(today, 7) : null, teacherReviewed: prev.teacherReviewed, obs: r.obs };
  } else {
    rec = { stars: r.stars, know: r.know, reviews: 0, due: darAddDays(today, 1), teacherReviewed: prev.teacherReviewed, obs: r.obs };
  }
  p.lessons[id] = rec;
  darJrnSaveProg(p);
  r.saved = true;
  darJrnRenderStep();
  darJourneyHomeCard();
}
function darJrnTeacherReviewed() {
  const r = darJrnRun;
  if (!r) return;
  const p = darJrnProg(); p.lessons = p.lessons || {};
  const prev = darJrnLessonState(r.loc.lesson.id);
  prev.teacherReviewed = true;
  p.lessons[r.loc.lesson.id] = prev;
  p.stations = p.stations || {};
  p.stations[r.loc.station.surah] = { teacherReviewed: true };
  darJrnSaveProg(p);
  toast('المعلم سجّل المراجعة');
  darJrnRenderStep();
}
function darJrnTeacherUnlock() {
  const flat = darJrnFlat();
  const idx = flat.findIndex(function (x) { return x.lesson.id === darJrnRun.loc.lesson.id; });
  const next = flat[idx + 1];
  if (!next) { toast('ده آخر درس في المحطات الثلاث'); return; }
  const p = darJrnProg(); p.overrides = p.overrides || {}; p.overrides[next.lesson.id] = true; darJrnSaveProg(p);
  toast('المعلم فتح الدرس التالي');
}
function darJrnBackMap() { darJrnCleanup(); darJrnRenderMap(); }

/* ---------- بطاقة الرئيسية + الإعدادات ---------- */
function darJourneyHomeCard() {
  const host = document.getElementById('darJourneyHome');
  if (!host) return;
  const stage = darJrnStage();
  const flat = darJrnFlat();
  const done = flat.filter(function (f) { return darJrnLessonState(f.lesson.id).stars[0]; }).length;
  const today = darTodayStr();
  const due = flat.filter(function (f) { const s = darJrnLessonState(f.lesson.id); return s.due && s.due <= today; })[0];
  const next = due || flat.filter(function (f) { return !darJrnLessonState(f.lesson.id).stars[0]; })[0];
  host.innerHTML = '<div class="dar-jrn-home"><div class="dar-jrn-home-t">🗺️ رحلتي مع القرآن</div>'
    + '<p class="dar-jrn-streak">🔥 <span id="streakBadge">0</span> • <span id="levelBadge">مبتدئ</span></p>'
    + '<p>' + (stage === 1 ? 'المرحلة الأولى: اسمع وقلّد' : 'المرحلة الثانية: اكتشف وطبّق')
    + ' — ' + done + ' من ' + flat.length + ' درس.</p>'
    + '<div class="dar-jrn-progress"><span style="width:' + Math.round((flat.length ? done / flat.length : 0) * 100) + '%"></span></div>'
    + (next ? '<p class="hint">الجاي: سورة ' + darEsc(darSurahBare((DAR_SURAHS.filter(function (s) { return s.n === next.station.surah; })[0] || {}).name)) + ' — ' + darEsc(darJrnLessonTitle(next.lesson, stage)) + '</p>' : '<p class="hint">خلّصت المحطات الثلاث — راجع من الخريطة.</p>')
    + '<button class="dar-btn dar-btn-primary dar-jrn-big" id="darJrnContinueBtn" onclick="darJrnContinue()">أكمل من هنا</button>'
    + '<p class="hint">المرحلة يختارها ولي الأمر من الإعدادات.</p></div>';
  if (typeof updateStreakBadge === 'function') updateStreakBadge();
  if (typeof updateLevelBadge === 'function') updateLevelBadge();
}
function darJrnContinue() {
  const flat = darJrnFlat();
  const today = darTodayStr();
  const due = flat.filter(function (f) { const s = darJrnLessonState(f.lesson.id); return s.due && s.due <= today; })[0];
  const next = due || flat.filter(function (f) { return !darJrnLessonState(f.lesson.id).stars[0]; })[0];
  darSwitchTab('journey');
  if (next) darJrnOpenLesson(next.lesson.id);
}
function darJrnChangeStage() {
  if (confirm('هذا الإعداد لولي الأمر أو المعلم.\nهل أنت ولي الأمر أو المعلم؟')) {
    darSwitchTab('settings');
    const el = document.getElementById('journeyStageRow');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}
function darJrnRenderSettingsHint() {
  const el = document.getElementById('journeyStageHint');
  if (el) el.textContent = 'المرحلة الحالية: ' + (darJrnStage() === 1 ? 'الأولى — اسمع وقلّد (6–9 سنوات)' : 'الثانية — اكتشف وطبّق (10–14 سنة)');
}
function darJrnBindSettings() {
  document.querySelectorAll('input[name="journeyStage"]').forEach(function (radio) {
    radio.checked = (radio.value === String(darJrnStage()));
    radio.addEventListener('change', function () {
      if (radio.checked) { darJrnSetStage(Number(radio.value)); toast('تم تغيير المرحلة — الدروس هتتغير شكلها'); }
    });
  });
  darJrnRenderSettingsHint();
}

/* ---------- تهيئة ---------- */
document.addEventListener('DOMContentLoaded', function () {
  darJrnBindSettings();
  darJourneyHomeCard();
});
window.__darJrn = { stations: DAR_JRN_STATIONS, rules: DAR_JRN_RULES, teach: DAR_JRN_TEACH, stage: darJrnStage, prog: darJrnProg, flat: darJrnFlat, lamNote: darJrnLamNote, wordMatches: darJrnWordMatches };
