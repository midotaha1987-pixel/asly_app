'use strict';
/* =====================================================================
   أصلي — اعمل فيديو بالذكاء الاصطناعي ببلاش (نسخة مجانية 100% — بلا خادم)
   كل شيء يعمل على جهاز المستخدم. لا مفاتيح، لا بطاقات، لا مدفوعات.
   المحرك المجاني: Pollinations Classic API (صور + محادثة).
   ===================================================================== */
const CONFIG = {
  appName: 'أصلي',
  imageBase: 'https://image.pollinations.ai/prompt',
  textUrl: 'https://text.pollinations.ai/openai/chat/completions',
  chatModel: 'openai',                 // GPT-OSS 20B — النموذج المجاني الوحيد في المسار المجهول
  imageSize: { w: 576, h: 1024 },      // حد المساحة المجانية 768×768 — 576×1024 = نفس المساحة
  exportSize: { w: 720, h: 1280 },     // 9:16 عمودي
  minIntervalMs: 46000,                // Pollinations المجاني: طلب واحد كل 45 ثانية تقريباً
  caps: { videosPerDay: 3, chatPerDay: 10, imagesPerDay: 10, previewPerDay: 5, chatAdBundle: 5 },
  // --- برو (اشتراك يدوي عبر واتساب الآن — فوترة Play لاحقاً عند النشر) ---
  pro: {
    priceEgp: 50, // السعر الشهري التقديري — روني يحدد السعر النهائي
    codePrefix: 'ASLY-PRO', // كود التفعيل اليدوي: روني يرسله للمشترك بعد الدفع
    extraStyles: ['noir', 'watercolor'], // أنماط إضافية تظهر لمشتركي برو فقط
    extraVoices: ['deep', 'bright'], // أصوات إضافية تظهر لمشتركي برو فقط
  },
  // --- تقسيم دخل الصندوق (بعد احتياطي روني 3$/يوم): 50% سعة Veo + 50% تطوير المزايا ---
  poolSplit: { improvementsPct: 50 },
  // --- AdMob: قيم مؤقتة — استبدلها بعد إنشاء حساب AdMob وبناء نسخة أندرويد ---
  admob: {
    appId: 'ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY',
    rewardedUnitId: 'ca-app-pub-XXXXXXXXXXXXXXXX/ZZZZZZZZZZ',
    bannerUnitId: 'ca-app-pub-XXXXXXXXXXXXXXXX/WWWWWWWWWW',
  },
  geminiModel: 'gemini-2.5-flash',
  geminiUrl: m => `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent`,
  // صندوق فيو المشترك: كل الإعلانات تصب في صندوق واحد.
  // أول 3$ من كل يوم ربح لصاحب التطبيق، والباقي يموّل فيديوهات Veo
  // بالترتيب (FIFO) — والطابور نفسه مخفي عن المستخدم تماماً.
  // التقدير: إعلان واحد ≈ 0.002$. يُدار من الـ Worker عند التفعيل.
  pool: { profitReserveUsd: 3, adValueUsd: 0.002 },
  // --- رقم واتساب للإعلانات المباشرة (ملف sponsors.json هو المصدر الأول) ---
  // ضع رقم روني هنا بصيغة دولية بدون + (مثال: 201001234567).
  // حتى يملأه روني، زر «أعلن معنا» يشرح ذلك ولا يفتح رابطاً مكسوراً.
  advertiseWhatsapp: '20XXXXXXXXXX',
  // --- Veo السينمائي: متوقف افتراضياً. للتفعيل: انشر الـ Worker في worker/veo-proxy.js
  // على Cloudflare (مفتاح Gemini في متغيرات بيئة الـ Worker فقط — أبداً داخل التطبيق)،
  // ثم ضع رابط الـ Worker في إعدادات التطبيق. بدون الرابط تبقى الميزة مغلقة.
  // --- اشتراك Veo الشهري عبر Google Play (in-app purchase) — قيم مؤقتة يحددها روني
  // في Play Console. السعر المقترح ~50 ج/شهر؛ Google Play تأخذ ~15% عمولة.
  // خطوة لاحقة (later): التطبيق حالياً ويب + PWA بدون Play — الاشتراك
  // لا يعمل إلا بعد النشر على Google Play (انظر DEPLOY.md).
  veo: {
    workerUrl: '',
    subscription: { productId: 'veo_monthly', priceEgp: 50, playFeePct: 15, later: true },
  },
};
/* ---------------- الترفيه: ترند، تحدي اليوم، نصائح عم أصلي ---------------- */
const TRENDING_PROMPTS = [
  'قط صغير يطبخ كشري في مطبخ مصري',
  'رجل خشبي يكتشف باور بانك مضروب',
  'روبوت يتعلم الرقص الشرقي',
  'سفينة فضاء تهبط في شارع مصري',
  'طفل يطير فوق أهرامات الجيزة',
  'قهوة بلدي تتكلم وتنصح الزبائن',
  'سمكة تسبح في السماء فوق النيل',
  'رجل آلي يبيع فول وطعمية',
];
const CHALLENGES = [
  'اصنع فيديو عن قط يبيع آيس كريم في الصيف',
  'اصنع فيديو عن بيت يطير فوق السحاب',
  'اصنع فيديو عن روبوت يتعلم الطبخ المصري',
  'اصنع فيديو عن سمكة تقود سيارة',
  'اصنع فيديو عن طفل يكتشف كنزاً في حديقة بيته',
  'اصنع فيديو عن قمر ينزل يشرب شاي في قهوة بلدي',
  'اصنع فيديو عن كتاب سحري يطير من المكتبة',
  'اصنع فيديو عن نملة تبني مدينة كاملة',
  'اصنع فيديو عن شجرة تتكلم مع العصافير',
  'اصنع فيديو عن رجل خشبي يفتح محل عصير',
  'اصنع فيديو عن غواصة صغيرة في كوباية شاي',
  'اصنع فيديو عن ساعة حائط تسافر عبر الزمن',
  'اصنع فيديو عن قطة تحرس مكتبة قديمة',
  'اصنع فيديو عن بالون يطير بصاحبه فوق المدينة',
];
const TIPS_VIDEO = [
  'اكتب فكرتك هنا يا باشا، وأنا أعمل الباقي 🙂',
  'الفكرة الحلوة نص الفيديو، والنص التاني التنفيذ — جرّب فكرة جاهزة من فوق 👆',
  'الوصف بالعربي أحسن — اكتب زي ما بتتكلم بالظبط.',
  'جرّب النمط الكرتوني لو الفكرة مضحكة، والسينمائي لو درامية.',
];
/* ---------------- تحدي الأسبوع (يتغير كل أسبوع) ---------------- */
const WEEKLY_CHALLENGES = [
  { theme: '🍦 الصيف', prompt: 'اصنع فيديو عن قط يبيع آيس كريم في الصيف' },
  { theme: '🏠 بيت يطير', prompt: 'اصنع فيديو عن بيت يطير فوق السحاب' },
  { theme: '🤖 روبوت طباخ', prompt: 'اصنع فيديو عن روبوت يتعلم الطبخ المصري' },
  { theme: '🐟 سمكة سائقة', prompt: 'اصنع فيديو عن سمكة تقود سيارة' },
  { theme: '💎 الكنز', prompt: 'اصنع فيديو عن طفل يكتشف كنزاً في حديقة بيته' },
  { theme: '🌙 القمر', prompt: 'اصنع فيديو عن قمر ينزل يشرب شاي في قهوة بلدي' },
  { theme: '📖 الكتاب السحري', prompt: 'اصنع فيديو عن كتاب سحري يطير من المكتبة' },
  { theme: '🐜 مدينة النمل', prompt: 'اصنع فيديو عن نملة تبني مدينة كاملة' },
  { theme: '🌳 الشجرة', prompt: 'اصنع فيديو عن شجرة تتكلم مع العصافير' },
  { theme: '🧃 محل العصير', prompt: 'اصنع فيديو عن رجل خشبي يفتح محل عصير' },
  { theme: '🚢 غواصة الشاي', prompt: 'اصنع فيديو عن غواصة صغيرة في كوباية شاي' },
  { theme: '⏰ الساعة', prompt: 'اصنع فيديو عن ساعة حائط تسافر عبر الزمن' },
  { theme: '🐱 حارسة المكتبة', prompt: 'اصنع فيديو عن قطة تحرس مكتبة قديمة' },
  { theme: '🎈 البالون', prompt: 'اصنع فيديو عن بالون يطير بصاحبه فوق المدينة' },
];
function weeklyChallenge() {
  // رقم الأسبوع من بداية السنة — يتغير التحدي كل يوم اثنين تقريباً
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const week = Math.floor((now - start) / (7 * 864e5));
  return WEEKLY_CHALLENGES[week % WEEKLY_CHALLENGES.length];
}
/* ---------------- قوالب جاهزة بضغطة واحدة ---------------- */
const TEMPLATES = [
  { id: 'story', icon: '🎬', title: 'فيديو قصة', desc: 'قصة قصيرة بمشاهد متتابعة', prompt: 'قصة قصيرة عن رجل خشبي صغير يتعلم الطيران فوق مدينة جميلة', style: 'cinematic' },
  { id: 'beforeafter', icon: '🔄', title: 'قبل وبعد', desc: 'تحويل واضح يلفت النظر', prompt: 'تحويل غرفة قديمة مظلمة إلى غرفة جميلة مضيئة، قبل وبعد', style: 'realistic' },
  { id: 'product', icon: '🛍️', title: 'إعلان منتج', desc: 'إعلان قصير جذاب لمنتج', prompt: 'إعلان قصير جذاب عن باور بانك صغير قوي يشحن الهاتف ثلاث مرات', style: 'cinematic' },
  { id: 'greeting', icon: '💌', title: 'بطاقة تهنئة', desc: 'تهنئة لمناسبة سعيدة', prompt: 'بطاقة تهنئة جميلة بعيد ميلاد سعيد مع بالونات وهدايا ملونة', style: 'cartoon' },
  { id: 'ask', icon: '❓', title: 'اسأل أصلي', desc: 'سؤال وجواب مبسط', prompt: 'سؤال وجواب: هل الباور بانك المضروب خطر على الهاتف؟ اشرح ببساطة', style: 'cartoon' },
];
/* ---------------- أمثلة جاهزة للمبتدئين ---------------- */
const EXAMPLES = [
  { icon: '🐱', title: 'قط يطبخ كشري', prompt: 'قط صغير يطبخ كشري في مطبخ مصري' },
  { icon: '🌇', title: 'غروب النيل', prompt: 'غروب شمس فوق النيل بقارب شراعي' },
  { icon: '🤖', title: 'روبوت يرقص', prompt: 'روبوت يتعلم الرقص الشرقي' },
  { icon: '🚀', title: 'سفينة فضاء', prompt: 'سفينة فضاء تهبط في شارع مصري' },
  { icon: '☕', title: 'قهوة تتكلم', prompt: 'قهوة بلدي تتكلم وتنصح الزبائن' },
  { icon: '🐟', title: 'سمكة في السماء', prompt: 'سمكة تسبح في السماء فوق النيل' },
];
/* ---------------- عجلة الحظ (لفّة مجانية كل يوم) ---------------- */
const WHEEL_PRIZES = [
  { label: '+1 🎥', kind: 'videos', n: 1 },
  { label: '+2 🎥', kind: 'videos', n: 2 },
  { label: '+1 🖼️', kind: 'images', n: 1 },
  { label: '+5 💬', kind: 'chat', n: 5 },
  { label: '+1 🎥', kind: 'videos', n: 1 },
  { label: 'حظ أوفر 😅', kind: 'none', n: 0 },
  { label: '+3 🎥', kind: 'videos', n: 3 },
  { label: '+1 🎥', kind: 'videos', n: 1 },
];
/* ---------------- أنماط صوت الراوي (للقراءة الحيّة فقط) ---------------- */
const VOICE_STYLES = {
  normal: { label: 'صوت عادي', rate: 1.0, pitch: 1.0 },
  excited: { label: 'صوت حماسي 🎉', rate: 1.15, pitch: 1.1 },
  calm: { label: 'صوت هادئ 🌙', rate: 0.85, pitch: 0.9 },
  deep: { label: 'صوت عميق 🎙️ (برو)', rate: 0.8, pitch: 0.7 }, // برو فقط
  bright: { label: 'صوت مشرق ✨ (برو)', rate: 1.2, pitch: 1.3 }, // برو فقط
};
let selectedVoiceStyle = 'normal';
/* ---------------- واجهة المميزين (تُقرأ من featured.json — روني يحدّثها) ---------------- */
const FEATURED_DEFAULT = [
  { title: 'غروب النيل', creator: 'فريق أصلي', theme: 'منظر طبيعي', img: 'featured-1.jpg', prompt: 'غروب شمس فوق النيل بقارب شراعي' },
  { title: 'عم أصلي بالعدسة', creator: 'فريق أصلي', theme: 'شخصية', img: 'featured-2.jpg', prompt: 'رجل خشبي صغير بعدسة مكبرة يكتشف الفرق بين الأصلي والمضروب' },
  { title: 'القط الشيف', creator: 'فريق أصلي', theme: 'كرتوني', img: 'featured-3.jpg', prompt: 'قط صغير يطبخ كشري في مطبخ مصري' },
];
/* ---------------- نص مشاركة جاهز يروّج للتطبيق ---------------- */
function shareCaption(prompt) {
  return `🎬 عملت الفيديو ده بتطبيق «أصلي» — اعمل فيديو بالذكاء الاصطناعي ببلاش!\n📝 الفكرة: ${prompt}\n⬇️ حمّل التطبيق من هنا: ${getAppLink()}\n📘 وتابع صفحة «أصلى مش مضروب»: https://facebook.com/people/أصلى-مش-مضروب/61571405720824/`;
}
const TIPS_CHAT = [
  'اسألني عن أفكار فيديوهات — أنا مليان أفكار!',
  'ممكن تسألني: اكتب لي سكربت لفيديو عن… وأنا أكتبه لك.',
  'لو عايز تعرف الفرق بين الأصلي والمضروب في أي منتج، اسألني!',
];
const TIPS_GALLERY = [
  'فيديوهاتك محفوظة على جهازك بس — حمّلها قبل ما تمسح التطبيق.',
  'شارك فيديو على واتساب أو فيسبوك وخد فيديو إضافي هدية 🎁',
  'أحسن فيديو عندك؟ شاركه مع صحابك من هنا.',
];
const TIPS_SETTINGS = [
  'الإعلانات عندنا بمزاجك — تشاهدها لما تحب، ومفيش إعلان إجباري أبداً.',
  'مفتاح Gemini المجاني اختياري — التطبيق شغال ببلاش من غيره.',
  'خد نص نهاية الحلقة من هنا وحطه في وصف فيديوهاتك على فيسبوك.',
];
const FUN_MSGS = [
  'عم أصلي بيشغّل الكاميرا… 🎥',
  'بيظبط الإضاءة… 💡',
  'بيقول للموديل: ابتسم! 😄',
  'بيمسح العدسة… 🔍',
  'بيحط اللمسات الأخيرة… ✨',
  'بيراجع المشهد الأخير… 🎬',
  'بيجهّز المفاجأة… 🎁',
];
const LEVELS = [
  [0, '🌱 مبتدئ'], [3, '🎬 صانع'], [10, '⭐ مبدع'], [25, '🌟 نجم'], [50, '👑 أسطورة'],
];
const MILESTONES = { 3: 1, 7: 2, 14: 3, 30: 5 }; // سلسلة أيام → فيديوهات إضافية

const LS = {
  get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
};
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const sleep = ms => new Promise(r => setTimeout(r, ms));
const todayKey = () => new Date().toISOString().slice(0, 10);
function uid() { return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8); }
function deviceId() {
  let id = LS.get('asly_device', null);
  if (!id) { id = 'ASLY-' + Math.random().toString(36).slice(2, 10).toUpperCase(); LS.set('asly_device', id); }
  return id;
}
function toast(msg, ms = 4500) {
  const t = $('#toast'); t.textContent = msg; t.classList.remove('hidden');
  clearTimeout(t._h); t._h = setTimeout(() => t.classList.add('hidden'), ms);
}

/* ---------------- Content filter (Arabic + English) ---------------- */
// قاعدة روني: محتوى محترم فقط — لا شيء غير لائق في الصور أو الفيديو أو المحادثة.
// ملاحظة بأمانة: الفلتر قائمة كلمات + فحص تركيبات (طفل + محتوى جنسي/رومانسي).
// يمنع معظم المحاولات الواضحة، لكنه لا يضمن 100%: التلميحات غير المباشرة أو
// الكلمات الجديدة قد تفلت، وخدمة Pollinations نفسها قد ترفض أو تمرّر أحياناً.
const REFUSAL = 'عذراً، الطلب ده مش مناسب لتطبيق أصلي 🙂';
const BLOCKED = [
  // جنسي / إباحي / عري
  'جنس', 'جنسية', 'إباح', 'عاري', 'عارية', 'عريان', 'عري', 'سكس', 'بورن', 'شهوة',
  'إغراء', 'عاهرة', 'دعارة', 'لواط', 'سحاق', 'استمناء', 'إباحية',
  'sex', 'porn', 'nude', 'naked', 'erotic', 'explicit', 'fetish', 'bdsm', 'escort',
  'prostitute', 'xxx', 'nsfw', 'orgasm', 'topless', 'undress', 'strip',
  // عنف / دم / أسلحة
  'قتل', 'اقتل', 'دم', 'دماء', 'دموي', 'تفجير', 'قنبلة', 'سلاح', 'رصاص', 'ذبح',
  'تعذيب', 'أشلاء', 'جثة', 'جثث', 'مذبحة', 'مسدس', 'بندقية', 'رشاش', 'صاروخ',
  'مدفع', 'سكين', 'خنجر', 'قطع رأس',
  'kill', 'murder', 'bomb', 'weapon', 'gun', 'blood', 'torture', 'terror',
  'gore', 'corpse', 'dismember', 'behead', 'bloodbath', 'massacre', 'slaughter', 'brutal',
  'pistol', 'rifle', 'shotgun', 'machine gun', 'grenade', 'missile', 'firearm', 'dagger',
  // كراهية / إهانة / ألفاظ بذيئة
  'كراهية', 'كره', 'أكره', 'اكره', 'يكره', 'تكره', 'نكره', 'أحتقر', 'احتقر', 'عنصري', 'عنصرية', 'شتيمة', 'سباب', 'إهانة', 'احتقار',
  'hate', 'racist', 'fuck', 'shit', 'bitch', 'whore', 'slut', 'bastard', 'dick', 'pussy',
  // إيذاء النفس / مخدرات / كحول
  'انتحار', 'انتحر', 'مخدر', 'حشيش', 'كوكايين', 'هيروين', 'أفيون', 'خمر', 'بيرة', 'ويسكي', 'كحول',
  'suicide', 'self-harm', 'drugs', 'cocaine', 'heroin', 'cannabis', 'marijuana', 'weed', 'opium',
  'alcohol', 'beer', 'wine', 'whiskey', 'vodka',
  // أطفال — محتوى غير لائق (كلمات صريحة وحدها تُحظر دائماً)
  'lolita', 'child porn', 'teen sex', 'underage',
];
// أي تركيبة "طفل + محتوى جنسي/رومانسي" تُحظر حتى لو كانت الكلمات منفردة بريئة
const CHILD_TERMS = ['طفل', 'طفلة', 'أطفال', 'قاصر', 'صغير', 'صغيرة', 'child', 'kid', 'minor', 'boy', 'girl', 'baby', 'teen'];
const CHILD_BAD_TERMS = ['جنس', 'عاري', 'عارية', 'عري', 'سكس', 'قبلة', 'رومانسي', 'حب', 'sex', 'nude', 'naked', 'kiss', 'romantic', 'love', 'dating', 'hot'];
function filterCheck(text) {
  const t = (text || '').toLowerCase();
  const hit = BLOCKED.find(w => t.includes(w.toLowerCase()));
  if (hit) return { ok: false, word: hit };
  const hasChild = CHILD_TERMS.some(w => t.includes(w.toLowerCase()));
  const hasBad = CHILD_BAD_TERMS.some(w => t.includes(w.toLowerCase()));
  if (hasChild && hasBad) return { ok: false, word: 'child+inappropriate' };
  return { ok: true };
}

/* ---------------- Daily caps + bonus balance (per device, local) ---------------- */
function usageToday() {
  const all = LS.get('asly_usage', {});
  return all[todayKey()] || { videos: 0, chat: 0, images: 0 };
}
function bumpUsage(kind) {
  const all = LS.get('asly_usage', {});
  const d = todayKey();
  all[d] = all[d] || { videos: 0, chat: 0, images: 0 };
  all[d][kind] += 1;
  LS.set('asly_usage', all);
  updateCapsBadge();
}
function bonusBalance() { return (LS.get('asly_bonus', { balance: 0 }).balance) || 0; }
/* مكافآت إضافية من عجلة الحظ: صور ورسائل محادثة (الفيديوهات لها رصيدها الخاص أعلاه) */
function extraBonus() { return LS.get('asly_bonus_extra', { images: 0, chat: 0 }); }
function bonusImages() { return extraBonus().images || 0; }
function bonusChat() { return extraBonus().chat || 0; }
function addImageBonus(n, why) {
  const b = extraBonus(); b.images = (b.images || 0) + n; LS.set('asly_bonus_extra', b);
  updateImagesRemaining(); updateCapsBadge();
  if (why) toast(`🎁 +${n} صورة إضافية — ${why}`);
}
function addChatBonus(n, why) {
  const b = extraBonus(); b.chat = (b.chat || 0) + n; LS.set('asly_bonus_extra', b);
  updateCapsBadge();
  if (why) toast(`🎁 +${n} رسائل محادثة — ${why}`);
}
function chatRemaining() {
  if (isPro()) return Infinity; // برو: محادثة بلا حدود
  return Math.max(0, CONFIG.caps.chatPerDay - (usageToday().chat || 0) + bonusChat());
}
function imagesRemaining() {
  return Math.max(0, CONFIG.caps.imagesPerDay - (usageToday().images || 0) + bonusImages());
}
/* ---------------- برو (Pro) — تفعيل يدوي بكود من روني، بوابة واحدة ---------------- */
// التفعيل الآن: المشترك يضغط «اشترك في برو» → واتساب لروني → يدفع → روني
// يرسل له كوداً يبدأ بـ ASLY-PRO → يدخله في الإعدادات → برو مفعّل على جهازه.
// عند النشر على Play لاحقاً تُستبدل هذه الخطوة بفوترة Play دون تغيير بوابات المزايا.
function isPro() { return LS.get('asly_pro', false) === true; }
function proWhatsAppLink() {
  const n = advertiseNumber(); // من sponsors.json أولاً، ثم CONFIG — '' إن كان لا يزال placeholder
  return n ? `https://wa.me/${n}?text=${encodeURIComponent('عاوز أشترك في برو — تطبيق أصلي')}` : null;
}
function activatePro(code) {
  const c = (code || '').trim().toUpperCase();
  if (c && c.startsWith(CONFIG.pro.codePrefix)) {
    LS.set('asly_pro', true);
    LS.set('asly_pro_code', c); // الكود المستخدم يُحفظ على الجهاز (لروني: تتبّع أي مشترك بكوده)
    updateCapsBadge(); applyAdsVisibility(); renderPro();
    toast('⭐ أهلاً بك في برو! كل المزايا مفتوحة دلوقتي');
    return true;
  }
  toast('⚠️ الكود ده مش صحيح — تأكد من الكود اللي بعتتهولك روني');
  return false;
}
function deactivatePro() { LS.set('asly_pro', false); LS.set('asly_pro_code', null); updateCapsBadge(); applyAdsVisibility(); renderPro(); toast('تم إيقاف برو على هذا الجهاز'); }
/* ---------------- عرض برو: شارة + مقارنة مجاني/برو + تفعيل بالكود ---------------- */
function renderPro() {
  const pro = isPro();
  // عناصر برو فقط (أنماط وأصوات إضافية) تظهر لمشتركي برو فقط
  $$('.pro-only').forEach(el => el.classList.toggle('hidden', !pro));
  const badge = $('#proBadge');
  if (badge) { badge.textContent = pro ? '⭐ برو مفعّل' : '⭐ برو'; badge.classList.toggle('pro-on', pro); }
  // معرّف الجهاز: روني يطلبه من المشترك ليعرف جهازه عند التفعيل اليدوي
  const devEl = $('#deviceIdLine');
  if (devEl) devEl.textContent = `🆔 معرّف جهازك: ${deviceId()} — أرسله لروني عند الاشتراك في برو، وسيُرسل لك كود التفعيل الخاص بك.`;
  const usedEl = $('#proCodeUsed');
  if (usedEl) usedEl.textContent = pro ? `كود برو المفعّل على هذا الجهاز: ${LS.get('asly_pro_code', '') || '—'}` : '';
  const state = $('#proState');
  if (state) state.textContent = pro
    ? '⭐ برو مفعّل على هذا الجهاز — محادثة بلا حدود، معاينات بلا حدود، بلا إعلانات، تنزيل HD، وأنماط وأصوات إضافية.'
    : `مجاني: فيديوهات (3 إعلانات = فيديو)، محادثة ${CONFIG.caps.chatPerDay} رسائل/يوم، 5 معاينات برومبت/يوم، بانر إعلاني. برو (~${CONFIG.pro.priceEgp} ج/شهر): كل شيء بلا حدود وبلا إعلانات + Veo عند توفره + تنزيل HD + أنماط وأصوات إضافية + وصول مبكر للبرومبتات الجديدة.`;
  const subBtn = $('#proSubscribeBtn');
  if (subBtn) {
    subBtn.classList.toggle('hidden', pro);
    const link = proWhatsAppLink();
    subBtn.onclick = () => {
      if (!link) { toast('⚠️ رقم واتساب روني لم يُضبط بعد في sponsors.json — راجع الإعدادات'); return; }
      window.open(link, '_blank');
      toast('📱 أكمل الاشتراك مع روني على واتساب — سيُرسل لك كود التفعيل');
    };
  }
  const codeRow = $('#proCodeRow');
  if (codeRow) codeRow.classList.toggle('hidden', pro);
  const offBtn = $('#proDeactivateBtn');
  if (offBtn) offBtn.classList.toggle('hidden', !pro);
}
const _proActivateBtn = document.querySelector('#proActivateBtn');
if (_proActivateBtn) _proActivateBtn.addEventListener('click', () => {
  const inp = $('#proCodeInput');
  if (inp) activatePro(inp.value);
});
const _proDeactivateBtn = document.querySelector('#proDeactivateBtn');
if (_proDeactivateBtn) _proDeactivateBtn.addEventListener('click', deactivatePro);
const _proBtnHeader = document.querySelector('#proBadge');
if (_proBtnHeader) _proBtnHeader.addEventListener('click', () => {
  const el = $('#proSection');
  document.querySelector('[data-tab="settings"]').click();
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
});
/* ---------------- نقاط Veo (إعلان = نقطة، دخول يومي = 5) ---------------- */
const VEO_COSTS = { lite: 200, fast: 480 }; // نقطة = إعلان واحد (0.002$ تقريباً)
function veoCredits() { return (LS.get('asly_credits', { balance: 0 }).balance) || 0; }
function addVeoCredits(n, why) {
  const c = LS.get('asly_credits', { balance: 0, earned: 0 });
  c.balance = (c.balance || 0) + n;
  c.earned = (c.earned || 0) + n;
  LS.set('asly_credits', c);
  renderVeoCard();
  if (why) toast(`⭐ +${n} نقطة Veo — ${why}`);
}
function spendVeoCredits(n) {
  const c = LS.get('asly_credits', { balance: 0, earned: 0 });
  if ((c.balance || 0) < n) return false;
  c.balance -= n;
  LS.set('asly_credits', c);
  renderVeoCard();
  return true;
}
/* ---------------- لوحة الرصيد — عدّادات محلية (تقديرات فقط) ---------------- */
// كل الأرقام تقديرية: إعلان واحد ≈ 0.002$، وVeo Lite 0.40$ / Fast 0.96$.
// لا يوجد تحويل تلقائي من AdMob إلى Google Cloud — روني يشحن بنفسه.
function monthKey() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; }
function moneyStats() {
  const m = LS.get('asly_money', { adsTotal: 0, adsMonth: 0, veoMonthClips: 0, veoMonthUsd: 0, month: null });
  if (m.month !== monthKey()) {
    m.adsMonth = 0; m.veoMonthClips = 0; m.veoMonthUsd = 0; m.month = monthKey();
    LS.set('asly_money', m);
  }
  return m;
}
function bumpMoneyAd() {
  const m = moneyStats();
  m.adsTotal = (m.adsTotal || 0) + 1;
  m.adsMonth = (m.adsMonth || 0) + 1;
  LS.set('asly_money', m);
}
function bumpMoneyVeo(quality) {
  const m = moneyStats();
  m.veoMonthClips = (m.veoMonthClips || 0) + 1;
  m.veoMonthUsd = +((m.veoMonthUsd || 0) + (VEO_COSTS[quality] || 0.40)).toFixed(2);
  LS.set('asly_money', m);
}
function touchDailyVeoBonus() {
  // مكافأة الدخول اليومي: 5 نقاط Veo مرة واحدة في اليوم
  const last = LS.get('asly_credits_daily', null);
  if (last === todayKey()) return;
  LS.set('asly_credits_daily', todayKey());
  addVeoCredits(5, 'مكافأة الدخول اليومي 🎁');
}
function addBonus(n, why) {
  const b = LS.get('asly_bonus', { balance: 0, earned: 0 });
  b.balance = (b.balance || 0) + n;
  b.earned = (b.earned || 0) + n;
  LS.set('asly_bonus', b);
  updateCapsBadge();
  if (why) toast(`🎁 +${n} فيديو إضافي — ${why}`);
}
function videosRemaining() {
  if (isPro()) return Infinity; // برو: فيديوهات بلا إعلانات وبلا حد يومي
  // رصيد فيديوهاتك = نقاط الفيديو المكتسبة (إعلانات/دعوات/مشاركات/عجلة) — بحد أقصى 3 توليدات في اليوم
  return Math.max(0, Math.min(bonusBalance(), CONFIG.caps.videosPerDay - usageToday().videos));
}
function consumeVideoSlot() {
  // كل فيديو يستهلك نقطة فيديو واحدة
  bumpUsage('videos');
  const b = LS.get('asly_bonus', { balance: 0, earned: 0 });
  b.balance = Math.max(0, (b.balance || 0) - 1);
  LS.set('asly_bonus', b);
  updateCapsBadge();
}
function updateCapsBadge() {
  const u = usageToday();
  $('#capVideos').textContent = isPro() ? '∞' : videosRemaining();
  const cr2 = chatRemaining();
  $('#capChat').textContent = isPro() ? '∞' : `${cr2}/${CONFIG.caps.chatPerDay}`;
  const cr = $('#chatRemaining');
  if (cr) cr.textContent = isPro() ? '• برو: محادثة بلا حدود ⭐' : `• باقي لك ${cr2} رسايل مجانية النهاردة`;
  updateStreakBadge();
  updateLevelBadge();
}

/* ---------------- Streak + levels + badges ---------------- */
function streakState() { return LS.get('asly_streak', { lastActiveDay: null, streak: 0, granted: [] }); }
function currentStreak() {
  const s = streakState();
  if (!s.lastActiveDay) return 0;
  const y = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
  return (s.lastActiveDay === todayKey() || s.lastActiveDay === y) ? s.streak : 0;
}
function touchStreak() {
  const s = streakState();
  const today = todayKey();
  if (s.lastActiveDay === today) return;
  const y = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
  s.streak = (s.lastActiveDay === y) ? (s.streak || 0) + 1 : 1;
  s.lastActiveDay = today;
  if (MILESTONES[s.streak] && !(s.granted || []).includes(s.streak)) {
    s.granted = [...(s.granted || []), s.streak];
    addBonus(MILESTONES[s.streak], `سلسلة ${s.streak} أيام متتالية! 🔥`);
  }
  if (s.streak >= 7) awardBadge('streak7', '🔥 7 أيام متتالية');
  LS.set('asly_streak', s);
  updateStreakBadge();
}
function updateStreakBadge() { const el = $('#streakBadge'); if (el) el.textContent = currentStreak(); }
function stats() { return LS.get('asly_stats', { totalVideos: 0, totalChats: 0, totalShares: 0, badges: [] }); }
function saveStats(s) { LS.set('asly_stats', s); }
function levelFor(n) {
  let label = LEVELS[0][1];
  for (const [min, l] of LEVELS) if (n >= min) label = l;
  return label;
}
function updateLevelBadge() { const el = $('#levelBadge'); if (el) el.textContent = levelFor(stats().totalVideos); }
function awardBadge(id, label) {
  const s = stats();
  if ((s.badges || []).includes(id)) return;
  s.badges = [...(s.badges || []), id];
  saveStats(s);
  renderBadges();
  toast(`🏅 وسام جديد: ${label}!`);
}
/* الأوسمة ظاهرة على الرئيسية — لا تُمنح في الخفاء. المقفول يظهر باهتاً مع قفل. */
const BADGE_DEFS = [
  ['firstVideo', '🎬 أول فيديو'],
  ['tenVideos', '🏆 10 فيديوهات'],
  ['firstShare', '📣 أول مشاركة'],
  ['firstChat', '💬 أول محادثة'],
  ['wheelWin', '🎡 لفّة محظوظة'],
  ['streak7', '🔥 7 أيام متتالية'],
];
function renderBadges() {
  const row = $('#badgesRow');
  if (!row) return;
  const earned = stats().badges || [];
  row.innerHTML = '';
  for (const [id, label] of BADGE_DEFS) {
    const el = document.createElement('span');
    const got = earned.includes(id);
    el.className = 'badge-chip' + (got ? ' earned' : ' locked');
    el.textContent = (got ? label : '🔒 ' + label);
    row.appendChild(el);
  }
}
/* إحصاءات البطل — أرقام صادقة من هذا الجهاز فقط (لا أرقام مستخدمين وهمية). */
function updateHeroStats() {
  const v = $('#heroVideos'); if (v) v.textContent = stats().totalVideos || 0;
  const s = $('#heroStreak'); if (s) s.textContent = currentStreak();
  const l = $('#heroLevel'); if (l) l.textContent = levelFor(stats().totalVideos);
}

/* ---------------- IndexedDB (videos + reports) ---------------- */
let dbPromise = null;
function openDB() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open('asly_db', 3);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('videos')) db.createObjectStore('videos', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('reports')) db.createObjectStore('reports', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('images')) db.createObjectStore('images', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('previews')) db.createObjectStore('previews', { keyPath: 'id' }); // معاينات برومبتات المكتبة (blob صورة + تاريخ)
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}
async function idbPut(store, value) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite');
    tx.objectStore(store).put(value);
    tx.oncomplete = resolve; tx.onerror = () => reject(tx.error);
  });
}
async function idbAll(store) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction(store, 'readonly').objectStore(store).getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}
async function idbGet(store, key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction(store, 'readonly').objectStore(store).get(key);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}
async function idbDelete(store, key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite');
    tx.objectStore(store).delete(key);
    tx.oncomplete = resolve; tx.onerror = () => reject(tx.error);
  });
}

/* ---------------- Tabs ---------------- */
$$('.tab').forEach(b => b.addEventListener('click', () => {
  $$('.tab').forEach(x => x.classList.remove('active'));
  $$('.tab-pane').forEach(x => x.classList.remove('active'));
  b.classList.add('active');
  $('#tab-' + b.dataset.tab).classList.add('active');
  if (b.dataset.tab === 'gallery') renderGallery();
  if (b.dataset.tab === 'images') { renderImages(); updateImagesRemaining(); }
}));

/* ---------------- Settings ---------------- */
function loadSettings() {
  const s = LS.get('asly_settings', {});
  if (s.geminiKey) $('#geminiKey').value = s.geminiKey;
  if (s.userName) $('#userName').value = s.userName;
  if (s.chatProvider) {
    const r = document.querySelector(`input[name="chatProvider"][value="${s.chatProvider}"]`);
    if (r) r.checked = true;
  }
  if (s.admobAppId) $('#admobAppId').value = s.admobAppId;
  if (s.admobRewardedId) $('#admobRewardedId').value = s.admobRewardedId;
  if (s.admobBannerId) $('#admobBannerId').value = s.admobBannerId;
  if (s.adsenseClientId) $('#adsenseClientId').value = s.adsenseClientId;
  if (s.adsenseSlotId) $('#adsenseSlotId').value = s.adsenseSlotId;
  if (s.veoWorkerUrl) $('#veoWorkerUrl').value = s.veoWorkerUrl;
  const vm = $('#veoManualOn');
  if (vm) vm.checked = !!s.veoManualOn;
}
function saveSettings(showMsg = true) {
  LS.set('asly_settings', {
    geminiKey: $('#geminiKey').value.trim(),
    userName: $('#userName').value.trim(),
    chatProvider: (document.querySelector('input[name="chatProvider"]:checked') || {}).value || 'pollinations',
    admobAppId: $('#admobAppId').value.trim(),
    admobRewardedId: $('#admobRewardedId').value.trim(),
    admobBannerId: $('#admobBannerId').value.trim(),
    adsenseClientId: $('#adsenseClientId').value.trim(),
    adsenseSlotId: $('#adsenseSlotId').value.trim(),
    veoWorkerUrl: $('#veoWorkerUrl').value.trim(),
    veoManualOn: !!($('#veoManualOn') && $('#veoManualOn').checked),
  });
  applyAdsVisibility();
  applyAdsenseVisibility();
  renderVeoCard();
  renderPoolStatus();
  renderMoneyDashboard();
  if (showMsg) toast('✅ تم حفظ الإعدادات على جهازك');
}
$('#saveSettings').addEventListener('click', () => saveSettings());
function settings() { return LS.get('asly_settings', {}); }

/* ---------------- Ads visibility: no placeholders shown to users ---------------- */
// البانر وزر "شاهد إعلاناً" يظهران فقط بعد حفظ معرّفات AdMob حقيقية.
// قبل ذلك لا يرى المستخدم أي صندوق إعلاني فارغ — التطبيق يبدو مكتملاً.
function hasRealAds() {
  const s = settings();
  const bad = v => !v || /X{4,}/.test(v);
  return !bad(s.admobRewardedId) && !bad(s.admobBannerId);
}
function applyAdsVisibility() {
  // برو: بلا إعلانات إطلاقاً — البانر وزر مشاهدة الإعلان يختفيان
  const show = hasRealAds() && !isPro();
  const banner = $('#bannerAd');
  if (banner) banner.classList.toggle('hidden', !show);
  const watch = $('#watchAdBtn');
  if (watch) watch.classList.toggle('hidden', !show);
}

/* ---------------- إعلانات الويب (AdSense) — خانة واحدة أسفل «الرائج الآن» ---------------- */
// تظهر فقط بعد موافقة AdSense ووضع معرّف ناشر حقيقي في الإعدادات.
// قبل ذلك لا يرى المستخدم أي صندوق إعلاني فارغ. سكربت AdSense يُحقن
// مرة واحدة فقط عند وجود معرّف حقيقي (قبلها لا يُحمَّل شيء).
function hasRealAdsense() {
  const s = settings();
  const bad = v => !v || /X{4,}/.test(v);
  return !bad(s.adsenseClientId) && !bad(s.adsenseSlotId);
}
let adsenseScriptLoaded = false;
function applyAdsenseVisibility() {
  const show = hasRealAdsense();
  const slot = $('#adsenseSlot');
  if (slot) slot.classList.toggle('hidden', !show);
  if (show && !adsenseScriptLoaded) {
    adsenseScriptLoaded = true;
    try {
      const sc = document.createElement('script');
      sc.async = true;
      sc.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + encodeURIComponent(settings().adsenseClientId);
      sc.crossOrigin = 'anonymous';
      document.head.appendChild(sc);
      sc.onload = () => { try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) {} };
    } catch (e) { /* الإعلان اختياري — فشله لا يوقف التطبيق */ }
  }
}

/* ---------------- تثبيت PWA — «أضف للشاشة الرئيسية» ---------------- */
// التطبيق صفحة ويب كاملة تعمل من غير تثبيت، ويمكن تثبيتها كأيقونة (PWA).
// في المتصفحات الداعمة يطلق حدث beforeinstallprompt عند توفر شروط التثبيت
// (HTTPS + manifest + service worker)؛ في آيفون/المتصفحات الأخرى نعرض
// الخطوات اليدوية. البطاقة لا تزعج المستخدم: «لاحقاً» تخفيها نهائياً.
let deferredInstallPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
  showInstallCard();
});
window.addEventListener('appinstalled', () => {
  deferredInstallPrompt = null;
  hideInstallCard();
});
function showInstallCard() {
  if (LS.get('asly_install_dismissed', false)) return;
  const c = $('#installCard');
  if (c) c.classList.remove('hidden');
}
function hideInstallCard() {
  const c = $('#installCard');
  if (c) c.classList.add('hidden');
}
async function installApp() {
  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    const choice = await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    if (choice && choice.outcome === 'accepted') {
      hideInstallCard();
      toast('✅ تم تثبيت «أصلي» على شاشتك 🎉');
    }
    return;
  }
  // بلا حدث تثبيت (آيفون أو متصفح لا يدعمه) — أظهر الخطوات اليدوية
  const steps = $('#installSteps');
  if (steps) {
    steps.classList.remove('hidden');
    steps.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

/* ---------------- Pollinations rate-limit aware fetch ---------------- */
let lastImageAt = 0, lastTextAt = 0;
async function pollinationsFetch(url, opts, kind) {
  // kind: 'image' | 'text' — حد مستقل لكل نوع، طلب واحد كل 45 ثانية
  const last = kind === 'image' ? lastImageAt : lastTextAt;
  let wait = Math.max(0, (last + CONFIG.minIntervalMs) - Date.now());
  if (wait > 0) {
    if (kind === 'image') setQueueNote(`⏳ انتظار ${Math.ceil(wait / 1000)} ثانية — الحد المجاني يسمح بصورة كل 45 ثانية…`);
    await sleep(wait);
  }
  for (let attempt = 0; attempt < 3; attempt++) {
    let res;
    try {
      res = await fetch(url, opts);
    } catch (e) {
      // خطأ شبكة مؤقت — أعد المحاولة بعد انتظار قصير
      if (attempt < 2) { await sleep(15000); continue; }
      throw e;
    }
    if (kind === 'image') lastImageAt = Date.now(); else lastTextAt = Date.now();
    if (res.status === 402 || res.status === 429) {
      const ra = parseInt(res.headers.get('Retry-After') || '45', 10) || 45;
      setQueueNote(`⏳ الحد المجاني ممتلئ مؤقتاً — إعادة المحاولة بعد ${ra} ثانية…`);
      await sleep(ra * 1000 + 1000);
      continue;
    }
    if (res.status >= 500 && attempt < 2) {
      // الخدمة المجانية تتعطل أحياناً (503) — انتظر وأعد المحاولة بدل الفشل فوراً
      setQueueNote(`⏳ الخدمة المجانية مشغولة (خطأ ${res.status}) — إعادة المحاولة بعد 20 ثانية…`);
      await sleep(20000);
      continue;
    }
    return res;
  }
  throw new Error('تعذّر الوصول بعد 3 محاولات — جرّب لاحقاً');
}

/* ---------------- Video generation ---------------- */
const QUALITY_SUFFIX = 'professional quality, sharp details, good lighting, clean composition, balanced colors, polished result';
const STYLE_PROMPTS = {
  cinematic: 'cinematic film still, dramatic lighting, shallow depth of field, movie quality',
  cartoon: 'colorful 3D cartoon style, Pixar-like, cheerful, smooth shapes',
  realistic: 'photorealistic, natural light, detailed, real photography',
  anime: 'anime style, vibrant colors, detailed anime illustration',
  noir: 'film noir style, high contrast black and white, dramatic shadows, moody atmosphere', // برو فقط
  watercolor: 'soft watercolor painting style, gentle brush strokes, dreamy pastel colors', // برو فقط
};
const SCENE_SUFFIX = [
  'wide establishing shot, beginning of the scene',
  'close-up detail shot, middle of the action',
  'dramatic final scene, emotional climax',
];
let selectedStyle = 'cinematic';
$$('#styleChips .chip').forEach(c => c.addEventListener('click', () => {
  $$('#styleChips .chip').forEach(x => x.classList.remove('active'));
  c.classList.add('active');
  selectedStyle = c.dataset.style;
}));
$('#prompt').addEventListener('input', e => { $('#promptCount').textContent = `${e.target.value.length}/300`; });

function setQueueStep(i, state, text) {
  const li = $('#queueSteps').children[i];
  if (!li) return;
  li.className = state;
  if (text) li.textContent = text;
}
function setQueueNote(t) {
  const a = $('#queueNote'); if (a) a.textContent = t || '';
  const b = $('#imageQueueNote'); if (b) b.textContent = t || '';
}
function setQueueProgress(p) {
  const a = $('#queueProgress'); if (a) a.style.width = Math.round(p * 100) + '%';
  const b = $('#imageQueueProgress'); if (b) b.style.width = Math.round(p * 100) + '%';
}

function imageUrlFor(prompt, style, scene, seed) {
  const full = `${STYLE_PROMPTS[style]}, ${prompt}, ${SCENE_SUFFIX[scene]}, ${QUALITY_SUFFIX}, vertical 9:16 portrait`;
  return `${CONFIG.imageBase}/${encodeURIComponent(full)}?width=${CONFIG.imageSize.w}&height=${CONFIG.imageSize.h}&seed=${seed}&safe=true`;
}
function imageUrlForSingle(prompt, style, aspect, seed) {
  // صور التبويب المخصص: safe=true دائماً + تحسين الجودة تلقائياً
  const size = aspect === 'square' ? { w: 768, h: 768 } : { w: 576, h: 1024 };
  const orient = aspect === 'square' ? 'square 1:1' : 'vertical 9:16 portrait';
  const full = `${STYLE_PROMPTS[style]}, ${prompt}, ${QUALITY_SUFFIX}, ${orient}`;
  return `${CONFIG.imageBase}/${encodeURIComponent(full)}?width=${size.w}&height=${size.h}&seed=${seed}&safe=true`;
}
async function loadImageBlob(url) {
  const res = await pollinationsFetch(url, {}, 'image');
  if (!res.ok) throw new Error('تعذّر إنشاء الصورة (HTTP ' + res.status + ')');
  const blob = await res.blob();
  if (!blob.type.startsWith('image/')) throw new Error('الرد لم يكن صورة — أعد المحاولة');
  return blob;
}
/* ترجمة الوصف العربي إلى إنجليزي قبل توليد الصور — نموذج الصور المجاني لا يفهم
   العربية ويعيد صوراً غير متعلقة بالوصف (تم التحقق: وصف عربي عن غروب النيل أعاد
   صورة امرأة بحجاب أبيض، بينما نفس الوصف بالإنجليزي أعاد غروباً صحيحاً).
   الترجمة عبر نفس واجهة النص المجانية، وتُحفظ في ذاكرة مؤقتة لكل وصف. */
const TRANSLATE_CACHE = new Map();
function hasArabic(t) { return /[\u0600-\u06FF]/.test(t); }
async function translatePromptToEnglish(text) {
  if (!hasArabic(text)) return text;
  // مسار سريع: برومبتات المكتبة عندها ترجمة إنجليزية جاهزة في prompts.json
  // (لا استدعاء API ولا انتظار 45 ثانية) — يطبَّق أيضاً على أي وصف مطابق.
  const lib = (PROMPTS_DATA.prompts || []).find(p => (p.text_ar || '').trim() === text.trim());
  if (lib && lib.text_en) return lib.text_en;
  const cached = TRANSLATE_CACHE.get(text);
  if (cached) return cached;
  try {
    setQueueNote('🌐 بترجّم الوصف للإنجليزي عشان الصورة تطلع مظبوطة…');
    const res = await pollinationsFetch(CONFIG.textUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: CONFIG.chatModel,
        messages: [
          { role: 'system', content: 'You translate Arabic image prompts to English. Reply with ONLY the English translation, no explanations, no quotes.' },
          { role: 'user', content: text },
        ],
        temperature: 0.2, max_tokens: 120,
      }),
    }, 'text');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    let en = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
    en = String(en || '').trim().replace(/^["'«»]+|["'«»]+$/g, '').replace(/^Translation:\s*/i, '').trim();
    if (!en || hasArabic(en)) throw new Error('ترجمة غير صالحة');
    TRANSLATE_CACHE.set(text, en);
    return en;
  } catch (e) {
    console.warn('تعذّرت الترجمة، سأستخدم الوصف الأصلي:', e);
    return text; // بدل الفشل: جرّب الوصف الأصلي
  }
}
function blobToImage(blob) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('تعذّر قراءة الصورة'));
    img.src = url;
  });
}

function pickMime() {
  const candidates = [
    'video/mp4;codecs="avc1.42E01E,mp4a.40.2"', 'video/mp4',
    'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm',
  ];
  for (const m of candidates) {
    try { if (MediaRecorder.isTypeSupported(m)) return m; } catch (e) {}
  }
  return '';
}
function mimeExt(mime) { return mime.includes('mp4') ? 'mp4' : 'webm'; }

function speakLive(text) {
  // (ب) قراءة حيّة بصوت الجهاز — تُسمَع أثناء التشغيل فقط، ولا تُحفظ داخل الفيديو
  // أنماط الراوي (عادي/حماسي/هادئ) تتحكم في سرعة الصوت وحدّته فقط.
  try {
    if (!('speechSynthesis' in window)) return false;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const picked = (LS.get('asly_voice_name', null));
    let ar = picked ? voices.find(v => v.name === picked) : null;
    if (!ar) ar = voices.find(v => (v.lang || '').toLowerCase().startsWith('ar'));
    if (ar) u.voice = ar;
    u.lang = (ar && ar.lang) || 'ar-EG';
    const style = VOICE_STYLES[selectedVoiceStyle] || VOICE_STYLES.normal;
    u.rate = style.rate;
    u.pitch = style.pitch;
    window.speechSynthesis.speak(u);
    return true;
  } catch (e) { return false; }
}
function populateVoicePicker() {
  const sel = $('#voicePick');
  if (!sel) return;
  const fill = () => {
    const voices = listArabicVoices();
    const saved = LS.get('asly_voice_name', '');
    sel.innerHTML = '';
    if (!voices.length) {
      sel.innerHTML = '<option value="">لا توجد أصوات عربية على هذا الجهاز</option>';
      sel.disabled = true;
      return;
    }
    sel.disabled = false;
    sel.innerHTML = '<option value="">صوت الجهاز الافتراضي</option>' +
      voices.map(v => `<option value="${escapeHtml(v)}" ${v === saved ? 'selected' : ''}>${escapeHtml(v)}</option>`).join('');
  };
  fill();
  try {
    if ('speechSynthesis' in window) window.speechSynthesis.onvoiceschanged = fill;
  } catch (e) {}
  sel.onchange = () => { LS.set('asly_voice_name', sel.value || null); };
}

/* ---------------- موسيقى خلفية مولّدة داخل الجهاز (WebAudio — بدون ملفات) ---------------- */
// 4 ألحان بسيطة مولّدة بأوسيلاتور — لا ملفات ولا حقوق نشر ولا خادم.
// تُخلط بصوت منخفض تحت التعليق، وتُسجَّل داخل الفيديو عبر MediaStreamDestination.
// تحذير مهم (مُثبَت بالتجربة 2026-11-20): إن كان الـ AudioContext متوقفاً
// (suspended — بلا تفاعل حقيقي من المستخدم) فمسار الصوت المتوقف يُفسد التسجيل
// كله: صفر بايت أو فيديو مضغوط زمنياً (64 إطاراً بدل 192). لذلك renderVideo
// لا يُدخل مسار الموسيقى في التسجيل إلا إذا كان الـ context يعمل فعلاً
// (state === 'running') — على الهاتف بعد ضغطة «اعمل الفيديو» يعمل عادةً،
// وفي المتصفح بلا تفاعل تُسقَط الموسيقى ويُصدَّر الفيديو سليماً بدونها.
const MUSIC_MOODS = {
  calm:     { label: 'هادئة 🌙', bpm: 60,  notes: [261.6, 329.6, 392.0, 329.6, 293.7, 246.9], wave: 'sine',     gain: 0.10 },
  happy:    { label: 'حماسية 🎉', bpm: 120, notes: [523.3, 659.3, 784.0, 659.3, 587.3, 698.5, 784.0, 1046.5], wave: 'triangle', gain: 0.12 },
  dramatic: { label: 'درامية 🎭', bpm: 80,  notes: [220.0, 261.6, 207.7, 246.9, 196.0, 233.1], wave: 'sawtooth', gain: 0.06 },
  festive:  { label: 'احتفالية 🎊', bpm: 140, notes: [392.0, 523.3, 659.3, 784.0, 659.3, 523.3, 587.3, 784.0], wave: 'square', gain: 0.05 },
};
let musicCtx = null, musicTimer = null;
function startMusic(mood) {
  stopMusic();
  const m = MUSIC_MOODS[mood];
  if (!m) return null;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    musicCtx = new AC();
    if (musicCtx.resume) musicCtx.resume().catch(() => {});
    const dest = musicCtx.createMediaStreamDestination();
    const master = musicCtx.createGain();
    master.gain.value = m.gain;
    master.connect(dest);
    const beat = 60 / m.bpm;
    let step = 0;
    const playNote = () => {
      if (!musicCtx) return;
      const freq = m.notes[step % m.notes.length];
      const o = musicCtx.createOscillator();
      const g = musicCtx.createGain();
      o.type = m.wave; o.frequency.value = freq;
      const t = musicCtx.currentTime;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(1, t + 0.05);
      g.gain.exponentialRampToValueAtTime(0.001, t + beat * 0.95);
      o.connect(g); g.connect(master);
      o.start(t); o.stop(t + beat);
      step++;
    };
    playNote();
    musicTimer = setInterval(playNote, beat * 1000);
    return dest.stream;
  } catch (e) { console.warn('music failed', e); return null; }
}
function stopMusic() {
  if (musicTimer) { clearInterval(musicTimer); musicTimer = null; }
  if (musicCtx) { try { musicCtx.close(); } catch (e) {} musicCtx = null; }
}

/* ---------------- الكابشن التلقائي (زي كاب كت — لأن معظم الناس تشاهد بدون صوت) ---------------- */
// نص التعليق يُقسَّم على المشاهد (سطر لكل مشهد) ويُحرَق في الفيديو بخلفية داكنة.
function captionChunks(text, n) {
  const words = String(text || '').split(/\s+/).filter(Boolean);
  if (!words.length) return Array(n).fill('');
  const per = Math.max(1, Math.ceil(words.length / n));
  const out = [];
  for (let i = 0; i < n; i++) out.push(words.slice(i * per, (i + 1) * per).join(' '));
  return out;
}
function wrapText(ctx, text, maxW) {
  const words = String(text).split(/\s+/);
  const lines = []; let cur = '';
  for (const w of words) {
    const t = cur ? cur + ' ' + w : w;
    if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; }
    else cur = t;
  }
  if (cur) lines.push(cur);
  return lines.slice(0, 2);
}

async function renderVideo(images, durationSec, narration, voiceMode, opts = {}) {
  const W = (opts && opts.w) || CONFIG.exportSize.w;
  const H = (opts && opts.h) || CONFIG.exportSize.h;
  const captionsOn = !(opts && opts.captions === false);
  const captionLines = captionsOn ? captionChunks(narration, images.length) : [];
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  const seg = durationSec / images.length;

  // Audio: (ج) تسجيل صوت المستخدم فقط يُحفظ داخل الفيديو
  let micStream = null;
  if (voiceMode === 'mic') {
    try {
      micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (e) {
      toast('⚠️ لم يُسمح بالميكروفون — سيُصدَّر الفيديو بدون صوت');
    }
  }
  // موسيقى خلفية مولّدة داخل الجهاز (إن اختارها المستخدم) — تُدخَل في التسجيل
  // فقط إذا كان الـ AudioContext يعمل فعلاً؛ مسار صوت متوقف يُفسد التسجيل كله
  // (صفر بايت أو فيديو مضغوط زمنياً — مثبت بالتجربة). بلا تفاعل حقيقي يبقى
  // الـ context متوقفاً، فتُسقَط الموسيقى ويُصدَّر الفيديو سليماً بدونها.
  let musicStream = null, musicIncluded = false;
  if (opts.music && opts.music !== 'none') {
    musicStream = startMusic(opts.music);
    if (musicStream && musicCtx) {
      if (musicCtx.state !== 'running') {
        try { await Promise.race([musicCtx.resume(), sleep(800)]); } catch (e) {}
      }
      if (musicCtx.state === 'running') musicIncluded = true;
      else { stopMusic(); musicStream = null; }
    }
  }
  // التقاط يدوي للإطارات: captureStream(0) + requestFrame() بعد كل رسمة.
  // (كان خطأً: captureStream(24) مع حلقة requestAnimationFrame — في الأجهزة
  // البطيئة أو المتصفح بلا رأس يرسم أقل من 24 إطاراً/ثانية، فيُضغَط الفيديو
  // زمنياً: 64 إطاراً في 8 ثوانٍ أصبحت 2.65 ثانية بدل 8. الآن كل رسمة = إطار
  // واحد مختوم بوقت الجدار الحقيقي، فالمدة صحيحة دائماً حتى لو انخفضت
  // سرعة الإطارات — والتعليق/الموسيقى يبقيان متزامنين لأن الحلقة زمنية.)
  // إن لم يدعم المتصفح requestFrame نعود للالتقاط التلقائي 24fps.
  let canvasStream = canvas.captureStream(0);
  let videoTrack = canvasStream.getVideoTracks()[0];
  const manualFrames = !!(videoTrack && typeof videoTrack.requestFrame === 'function');
  if (!manualFrames) { canvasStream = canvas.captureStream(24); videoTrack = canvasStream.getVideoTracks()[0]; }
  const tracks = [...canvasStream.getVideoTracks()];
  if (micStream) tracks.push(...micStream.getAudioTracks().filter(t => t.readyState === 'live'));
  if (musicIncluded && musicStream) tracks.push(...musicStream.getAudioTracks().filter(t => t.readyState === 'live'));
  const stream = new MediaStream(tracks);
  const mime = pickMime();
  const rec = new MediaRecorder(stream, mime ? { mimeType: mime, videoBitsPerSecond: isPro() ? 5_000_000 : 3_000_000 } : undefined); // برو: HD ‏5Mbps؛ مجاني: 3Mbps (كافٍ لشرائح Ken Burns، وأخف على مُرمّز البرمجيات — كان 5Mbps يُسقِط إطارات على الأجهزة الضعيفة)
  const chunks = [];
  rec.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
  const stopped = new Promise(r => { rec.onstop = r; });
  rec.start(250);

  if (voiceMode === 'live') speakLive(narration);

  const t0 = performance.now();
  const FPS = 24;
  const stepMs = 1000 / FPS;
  // حلقة زمنية بـ setTimeout (لا تعتمد على requestAnimationFrame إطلاقاً —
  // فهو يتوقف في التبويب الخفي/بلا رأس، ويتباطأ مع الرسم الثقيل).
  // كل تكرار: ارسم إطاراً واحداً ← اطلب التقاطه ← انتظر الخطوة التالية.
  await new Promise((resolve, reject) => {
    let taintChecked = false;
    function tick() {
      try {
        const t = (performance.now() - t0) / 1000;
        if (t >= durationSec) return resolve();
        const idx = Math.min(images.length - 1, Math.floor(t / seg));
        const p = (t - idx * seg) / seg; // 0..1 داخل المقطع
        const img = images[idx];
      // Ken Burns: تكبير/تصغير/انزلاق بالتناوب
      const dir = idx % 3;
      let scale, dx = 0, dy = 0;
      if (dir === 0) { scale = 1.02 + 0.13 * p; }
      else if (dir === 1) { scale = 1.15 - 0.13 * p; }
      else { scale = 1.08; dx = (p - 0.5) * W * 0.06; }
      const base = Math.max(W / img.naturalWidth, H / img.naturalHeight);
      const dw = img.naturalWidth * base * scale, dh = img.naturalHeight * base * scale;
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, W, H);
      ctx.drawImage(img, (W - dw) / 2 + dx, (H - dh) / 2 + dy, dw, dh);
      // الكابشن: سطر التعليق الخاص بهذا المشهد (فوق شريط العلامة)
      const capFont = Math.round(30 * (W / 720));
      const labelH = Math.round(44 * (H / 1280));
      if (captionsOn && captionLines[idx]) {
        ctx.font = `bold ${capFont}px system-ui, sans-serif`;
        ctx.textAlign = 'center';
        const lines = wrapText(ctx, captionLines[idx], W - 60);
        const lineH = Math.round(capFont * 1.25);
        const boxH = lines.length * lineH + 18;
        const boxY = H - labelH - 18 - boxH - 12;
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(0, boxY, W, boxH);
        ctx.fillStyle = '#fff';
        lines.forEach((ln, li) => ctx.fillText(ln, W / 2, boxY + 18 + lineH * (li + 1) - 8));
      }
      // علامة «صُنع بتطبيق أصلي» — تُحرَق في كل إطار (إعلان مجاني للتطبيق مع كل مشاركة)
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.fillRect(0, H - labelH - 18, W, labelH);
      ctx.fillStyle = '#fff';
      ctx.font = `bold ${Math.round(24 * (W / 720))}px system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('صُنع بتطبيق أصلي • AI generated', W / 2, H - 18 - Math.round(labelH * 0.32));
      // حارس التلوث (taint): لو رُسمت صورة من مصدر خارجي بدون CORS يتلوث
      // الـ canvas فيُصدَّر الفيديو فارغاً بصمت — نكشف ذلك من أول إطار
      // ونفشل بصوت عالٍ بدل ملف 0 بايت. (الصور الحقيقية تأتي كـ blob: نظيفة.)
      if (!taintChecked) {
        taintChecked = true;
        try { ctx.getImageData(0, 0, 1, 1); }
        catch (e) { return reject(new Error('تعذّر تسجيل الفيديو: الصور من مصدر خارجي بدون صلاحية — جرّب مرة أخرى')); }
      }
      if (videoTrack && typeof videoTrack.requestFrame === 'function') videoTrack.requestFrame();
      setTimeout(tick, stepMs);
      } catch (err) { reject(err); }
    }
    tick();
  });
  if (micStream) micStream.getTracks().forEach(t => t.stop());
  stopMusic();
  try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch (e) {}
  rec.stop();
  await stopped;
  const type = mime || 'video/webm';
  return { blob: new Blob(chunks, { type }), mime: type, musicIncluded };
}

function showAdGate(adIndex = 1, adTotal = 1) {
  return new Promise(resolve => {
    const modal = $('#adModal');
    modal.classList.remove('hidden');
    const prog = $('#adProgress');
    if (prog) prog.textContent = adTotal > 1 ? `إعلان ${adIndex} من ${adTotal} — فيديوك جاهز بعد الثالث 🎬` : '';
    const pl = $('#adPoolLine');
    if (pl) pl.textContent = POOL_LINE;
    let left = 5;
    $('#adTimer').textContent = left;
    const btn = $('#adContinue');
    btn.disabled = true;
    btn.textContent = 'متابعة ⏳';
    const h = setInterval(() => {
      left -= 1;
      if (left <= 0) {
        clearInterval(h);
        $('#adTimer').textContent = '0';
        btn.disabled = false;
        btn.textContent = 'متابعة ✨';
      } else {
        $('#adTimer').textContent = left;
      }
    }, 1000);
    btn.onclick = () => { modal.classList.add('hidden'); clearInterval(h); resolve(true); };
    $('#adCancel').onclick = () => { modal.classList.add('hidden'); clearInterval(h); resolve(false); };
  });
}

/* ---------------- نموذج التمويل: 3 إعلانات متتالية = فيديو واحد ---------------- */
// كل إعلان مشاهَد = +1 نقطة Veo؛ كل 3 إعلانات متتالية = +1 نقطة فيديو.
// التقدّم يُحفظ لليوم نفسه (إعلان 1 من 3، ثم 2 من 3…) — ويتصفّر عند اكتمال
// المجموعة أو عند توليد فيديو. حد مجموعات الإعلانات: 3 مجموعات/يوم (9 إعلانات).
const ADS_PER_VIDEO = 3;
const AD_SETS_PER_DAY = 3;
function adProgress() {
  const p = LS.get('asly_ad_progress', { count: 0, date: null });
  if (p.date !== todayKey()) return { count: 0, date: todayKey() };
  return p;
}
function adSetsToday() {
  const s = LS.get('asly_ad_sets', {});
  return s[todayKey()] || 0;
}
function updateAdProgressNote() {
  const el = $('#adProgressNote');
  if (!el) return;
  const c = adProgress().count;
  el.textContent = c === 0
    ? '🎬 كل فيديو يحتاج مشاهدة 3 إعلانات ورا بعض (أو مكافأة من دعوة/مشاركة/عجلة).'
    : `🎬 تقدّمك: شاهدت إعلان ${c} من 3 — باقي ${ADS_PER_VIDEO - c} إعلان للفيديو الجاي.`;
}
/* ---------------- إعلان واحد (فتح معاينات / رسائل محادثة) ---------------- */
// كل مشاهدة إعلان — من أي مكان في التطبيق — تدخل الصندوق المشترك نفسه
// (bumpMoneyAd + pingAdToWorker)، فتقرّب فتح Veo للجميع. سطر ودود يذكّر
// المستخدم بذلك حيث يظهر زر الإعلان.
const POOL_LINE = '💚 مشاهدتك دي بتساعد تفتح فيديوهات فيو للكل — وإعلاناتكم بتطوّر التطبيق وتسرّع الفيديوهات';
async function watchSingleAd(reason) {
  const watched = await showAdGate(1, 1);
  if (!watched) return false;
  addVeoCredits(1, 'شاهدت إعلاناً ⭐');
  bumpMoneyAd();
  pingAdToWorker();
  // مكافأة متنوعة أحياناً (20%): رسائل أو معاينات مضاعفة بدلاً من الحزمة العادية
  const doubled = Math.random() < 0.2;
  if (reason === 'chat') {
    const n = doubled ? CONFIG.caps.chatAdBundle * 2 : CONFIG.caps.chatAdBundle;
    addChatBonus(n, doubled ? 'مكافأة مضاعفة! 🎉' : 'إعلان واحد');
    toast(doubled ? `🎉 مكافأة مضاعفة! +${n} رسائل محادثة` : `🎁 +${n} رسائل محادثة — ${POOL_LINE}`);
  } else if (reason === 'preview') {
    // الرصيد يُضاف في unlockPreviews؛ هنا فقط نعيد الرسم عبر القيمة الراجعة
  }
  const btn = $('#chatUnlockBtn');
  if (btn && chatRemaining() > 0) btn.classList.add('hidden');
  updateCapsBadge();
  return true;
}
// زر فتح رسائل المحادثة (يظهر فقط عند انتهاء الحد اليومي)
const _chatUnlockBtn = document.querySelector('#chatUnlockBtn');
if (_chatUnlockBtn) _chatUnlockBtn.addEventListener('click', async () => {
  _chatUnlockBtn.disabled = true;
  try { await watchSingleAd('chat'); } finally { _chatUnlockBtn.disabled = false; }
});

async function watchAdsForVideo() {
  // يشاهد المستخدم 3 إعلانات ورا بعض؛ كل إعلان = +1 نقطة Veo، والمجموعة = +1 فيديو
  for (let i = adProgress().count; i < ADS_PER_VIDEO; i++) {
    const watched = await showAdGate(i + 1, ADS_PER_VIDEO);
    if (!watched) { updateAdProgressNote(); return false; }
    addVeoCredits(1, 'شاهدت إعلاناً ⭐');
    bumpMoneyAd(); // عدّاد لوحة الرصيد (تقدير: إعلان ≈ 0.002$)
    pingAdToWorker(); // بلاغ لمحاسبة صندوق فيو (فقط مع AdMob حقيقي + Veo مفعّل)
    const p = adProgress();
    p.count = i + 1; p.date = todayKey();
    LS.set('asly_ad_progress', p);
    updateAdProgressNote();
  }
  // اكتملت المجموعة
  LS.set('asly_ad_progress', { count: 0, date: todayKey() });
  if (adSetsToday() < AD_SETS_PER_DAY) {
    const s = LS.get('asly_ad_sets', {});
    s[todayKey()] = (s[todayKey()] || 0) + 1;
    LS.set('asly_ad_sets', s);
    addBonus(1, 'شاهدت 3 إعلانات متتالية 🎬');
  } else {
    toast('⭐ وصلت لحد فيديوهات الإعلانات اليوم (3) — لكن نقاط Veo بتتحفظ');
  }
  updateAdProgressNote();
  return true;
}

/* ---------------- صندوق فيو المشترك (طابور مخفي + احتياطي ربح 3$) ---------------- */
// الصندوق يموّل فيديوهات Veo بالترتيب (FIFO) من إيراد الإعلانات المقدَّر
// (إعلان واحد ≈ 0.002$). أول 3$ من كل يوم ربح لصاحب التطبيق ولا تُنفَق
// على Veo أبداً. المستخدم لا يرى أي أرقام طابور أو مواقع أو مواعيد —
// فقط حالة صادقة بسيطة. الأرقام الفعلية تأتي من الـ Worker عند تفعيل Veo.
async function renderPoolStatus() {
  const el = $('#poolStatus');
  if (!el) return;
  const reserve = CONFIG.pool.profitReserveUsd;
  const fallback = `📦 صندوق فيو: إعلاناتكم تموّل فيديوهات Veo السينمائية — أول ${reserve}$ يومياً ربح لصاحب التطبيق، والباقي يموّل الفيديوهات بالترتيب. تُفعّل الميزة مع مفتاح Gemini.`;
  if (!veoEnabled()) { el.textContent = fallback; return; }
  try {
    const res = await fetch(veoWorkerUrl().replace(/\/$/, '') + '/pool');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const d = await res.json();
    const poolUsd = (d.poolUsd != null ? d.poolUsd : 0).toFixed(2);
    el.textContent = `📦 صندوق فيو اليوم: إيراد مقدَّر ~$${poolUsd} من الإعلانات (منها ${reserve}$ احتياطي الربح) — والفيديوهات السينمائية تُجهَّز بالترتيب.`;
  } catch (e) {
    el.textContent = fallback;
  }
}
/* ---------------- لوحة الرصيد لروني (تقديرات — ليست أرقام AdMob/Google الحقيقية) ---------------- */
async function renderMoneyDashboard() {
  const poolEl = $('#moneyPoolMonth'), adsEl = $('#moneyAdsMonth'),
    spendEl = $('#moneyVeoSpend'), profitEl = $('#moneyProfit'), noteEl = $('#moneyNote');
  if (!poolEl) return;
  const m = moneyStats();
  let adsMonth = m.adsMonth || 0, veoClips = m.veoMonthClips || 0, veoUsd = m.veoMonthUsd || 0;
  let source = 'هذا الجهاز فقط';
  // إن وُجد رابط Worker، خذ الأرقام العامة (كل المستخدمين) منه
  const wurl = veoWorkerUrl();
  if (wurl) {
    try {
      const res = await fetch(wurl.replace(/\/$/, '') + '/pool');
      if (res.ok) {
        const d = await res.json();
        if (d.adsMonth != null) { adsMonth = d.adsMonth; veoClips = d.veoMonthClips || 0; veoUsd = d.veoMonthUsd || 0; source = 'الـ Worker (كل المستخدمين)'; }
        if (d.mode) LS.set('asly_veo_mode', { mode: d.mode, balanceUsd: d.balanceUsd || 0, thresholdUsd: d.thresholdUsd || 0, subsMonth: d.subsMonth || 0, updatedAt: new Date().toISOString() });
      }
    } catch (e) { /* بلا Worker — استخدم أرقام الجهاز */ }
  }
  const poolUsd = adsMonth * CONFIG.pool.adValueUsd;
  const dayOfMonth = new Date().getDate();
  const profit = Math.min(poolUsd, CONFIG.pool.profitReserveUsd * dayOfMonth);
  // حلقة الدخل: الإيراد → ربح روني (3$/يوم) → المتبقي ينقسم: 50% سعة Veo + 50% تطوير مزايا
  const rest = Math.max(0, poolUsd - profit - veoUsd);
  const veoShare = rest * (100 - CONFIG.poolSplit.improvementsPct) / 100;
  const improveShare = rest * CONFIG.poolSplit.improvementsPct / 100;
  poolEl.textContent = `~$${poolUsd.toFixed(2)}`;
  adsEl.textContent = `${adsMonth} إعلان`;
  spendEl.textContent = `~$${(+veoUsd).toFixed(2)} (${veoClips} مقطع)`;
  profitEl.textContent = `~$${profit.toFixed(2)}`;
  const veoRow = $('#moneyVeoShare'), impRow = $('#moneyImproveShare');
  if (veoRow) veoRow.textContent = `~$${veoShare.toFixed(2)} — سعة Veo إضافية`;
  if (impRow) impRow.textContent = `~$${improveShare.toFixed(2)} — تطوير مزايا أسرع`;
  const loopEl = $('#moneyLoop');
  if (loopEl) loopEl.textContent = `🔄 حلقة الدخل: إيراد ~$${poolUsd.toFixed(2)} → ربحك ~$${profit.toFixed(2)} → سعة Veo ~$${veoShare.toFixed(2)} + تطوير المزايا ~$${improveShare.toFixed(2)} — كل إعلان يطوّر التطبيق ويسرّع الفيديوهات.`;
  const modeRow = $('#moneyVeoMode'), balRow = $('#moneyBalance');
  const info = veoModeInfo();
  if (modeRow) modeRow.textContent = veoMode() === 'free' ? '🎉 مجاني للجميع' : '⭐ اشتراك';
  if (balRow) balRow.textContent = `~$${(info.balanceUsd || 0).toFixed(2)} / ~$${(info.thresholdUsd || 0).toFixed(2)}`;
  if (noteEl) noteEl.textContent = `⏳ تقديرات من ${source} — إعلان ≈ 0.002$، وVeo Lite 0.40$ / Fast 0.96$. الأرقام الحقيقية في لوحتي AdMob وGoogle Cloud فقط.`;
}

/* بلاغ إكمال إعلان إلى الـ Worker (لمحاسبة الصندوق) — فقط عند وجود
   إعلانات AdMob حقيقية وVeo مفعّل؛ فشل البلاغ لا يوقف أي تدفق. */
async function pingAdToWorker() {
  if (!veoEnabled() || !hasRealAds()) return;
  try {
    await fetch(veoWorkerUrl().replace(/\/$/, '') + '/ad', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ device: deviceId() }),
    });
  } catch (e) { /* محاسبة الصندوق اختيارية */ }
}

async function generateVideo() {
  const prompt = $('#prompt').value.trim();
  if (!prompt) { toast('✏️ اكتب وصف الفيديو أولاً'); return; }
  const f = filterCheck(prompt);
  if (!f.ok) { toast(REFUSAL); return; }
  if (videosRemaining() <= 0) {
    if (usageToday().videos >= CONFIG.caps.videosPerDay) {
      toast(`⏳ وصلت لحد الفيديوهات اليوم (${CONFIG.caps.videosPerDay}) — جرّب غداً`);
      return;
    }
    // لا يوجد رصيد فيديو — شاهد 3 إعلانات ورا بعض للحصول على فيديو
    toast('🎬 شاهد 3 إعلانات قصيرة ورا بعض — وفيديوك يبدأ بعدها مباشرة');
    const got = await watchAdsForVideo();
    if (!got || videosRemaining() <= 0) return;
  }

  // الوضع السهل: التطبيق يختار النمط والمدة والصوت تلقائياً من الفكرة
  const easy = appMode() === 'easy';
  let duration = parseInt($('#duration').value, 10);
  let voiceMode = $('#voiceMode').value;
  let narration = $('#narration').value.trim() || prompt;
  let aspect = ($('#aspectPick') ? $('#aspectPick').value : 'portrait');
  let music = ($('#musicPick') ? $('#musicPick').value : 'none');
  let captions = !($('#captionsToggle') && !$('#captionsToggle').checked);
  if (easy) {
    setStyle(autoStyleFor(prompt));
    duration = 8;
    voiceMode = 'live';
    // نص التعليق: ما كتبه كاتب السيناريو إن وُجد، وإلا نفس وصف الفيديو
    narration = $('#narration').value.trim() || prompt;
    aspect = 'portrait';
    if (music === 'none') music = 'calm'; // الوضع السهل: موسيقى هادئة تلقائياً
    captions = true;
  }
  const ASPECT_SIZES = { portrait: { w: 720, h: 1280 }, square: { w: 720, h: 720 }, wide: { w: 1280, h: 720 } };
  const size = ASPECT_SIZES[aspect] || ASPECT_SIZES.portrait;
  // ثبّت النمط لحظة البدء — التوليد يستغرق دقائق، وأي ضغطة قالب أثناءه
  // يجب ألا تغيّر نمط الصور أو سجل الفيديو (كان خطأً: النمط يُقرأ عند النهاية)
  const genStyle = selectedStyle;
  const btn = $('#generateBtn');
  btn.disabled = true;
  $('#resultBox').classList.add('hidden');
  const qb = $('#queueBox');
  qb.classList.remove('hidden');
  $('#queueSteps').innerHTML = `
    <li class="active">1️⃣ إنشاء الصورة 1 من 3…</li>
    <li>2️⃣ إنشاء الصورة 2 من 3…</li>
    <li>3️⃣ إنشاء الصورة 3 من 3…</li>
    <li>🎬 تجميع الفيديو والحركة…</li>`;
  setQueueProgress(0.05);
  setQueueNote('الصور تُنشأ واحدة كل 45 ثانية تقريباً (حد النسخة المجانية) — لا تغلق الصفحة.');
  // رسائل مرحة من عم أصلي أثناء الانتظار
  let funIdx = 0;
  const funTimer = setInterval(() => {
    const note = $('#queueNote').textContent || '';
    if (!note.startsWith('⏳') && !note.startsWith('❌')) {
      setQueueNote(FUN_MSGS[funIdx % FUN_MSGS.length]);
      funIdx++;
    }
  }, 2600);
  const seed = Math.floor(Math.random() * 100000);
  const apiPrompt = await translatePromptToEnglish(prompt);
  try {
    const images = [];
    // صورة مختارة من تبويب الصور؟ تكون هي المشهد الأول، ونولّد مشهدين فقط
    const firstSceneId = LS.get('asly_first_scene', null);
    if (firstSceneId) {
      try {
        const rec = await idbGet('images', firstSceneId);
        if (rec && rec.blob) {
          images.push(await blobToImage(rec.blob));
          setQueueStep(0, 'done', '✅ المشهد الأول: صورتك المختارة');
        }
      } catch (e) { /* تجاهل — نولّد 3 مشاهد عادية */ }
    }
    for (let i = images.length; i < 3; i++) {
      setQueueStep(i, 'active', `${['1️⃣','2️⃣','3️⃣'][i]} إنشاء الصورة ${i + 1} من 3…`);
      setQueueProgress(0.1 + (i / 3) * 0.5);
      const url = imageUrlFor(apiPrompt, genStyle, i, seed + i * 7919);
      const blob = await loadImageBlob(url);
      images.push(await blobToImage(blob));
      setQueueStep(i, 'done', `✅ الصورة ${i + 1} جاهزة`);
      setQueueProgress(0.1 + ((i + 1) / 3) * 0.5);
    }
    setQueueStep(3, 'active', '🎬 تجميع الفيديو والحركة…');
    setQueueNote(voiceMode === 'mic' ? '🎤 تحدّث الآن — يتم تسجيل صوتك مع الفيديو…' : voiceMode === 'live' ? '🎙️ يُقرأ التعليق الآن بصوت جهازك…' : '🎬 جارٍ تسجيل الفيديو…');
    const { blob, mime, musicIncluded } = await renderVideo(images, duration, narration, voiceMode, { w: size.w, h: size.h, captions, music });
    const id = uid();
    const record = {
      id, prompt, style: genStyle, duration, mime, aspect, music, musicInVideo: !!musicIncluded,
      ext: mimeExt(mime), createdAt: new Date().toISOString(), blob,
    };
    await idbPut('videos', record);
    consumeVideoSlot();
    LS.set('asly_first_scene', null);
    renderFirstSceneNote();
    touchStreak();
    const st = stats();
    const prevLevel = levelFor(st.totalVideos);
    st.totalVideos = (st.totalVideos || 0) + 1;
    saveStats(st);
    if (levelFor(st.totalVideos) !== prevLevel) toast(`🎉 مستوى جديد: ${levelFor(st.totalVideos)}!`);
    if (st.totalVideos === 1) awardBadge('firstVideo', '🎬 أول فيديو');
    if (st.totalVideos === 10) awardBadge('tenVideos', '🏆 10 فيديوهات');
    setQueueStep(3, 'done', '✅ تم!');
    setQueueProgress(1);
    setQueueNote('');
    const url = URL.createObjectURL(blob);
    const v = $('#resultVideo');
    v.src = url;
    const musicNote = $('#musicNote');
    if (musicNote) {
      if (music && music !== 'none' && !musicIncluded) {
        musicNote.textContent = '🎵 الموسيقى لم تعمل في هذا المتصفح — الفيديو بدون موسيقى (على الهاتف بعد ضغطة زر الإنشاء تعمل عادةً).';
        musicNote.classList.remove('hidden');
      } else musicNote.classList.add('hidden');
    }
    $('#resultBox').classList.remove('hidden');
    $('#downloadBtn').onclick = () => downloadBlob(blob, `asly-${id}.${record.ext}`);
    $('#shareBtn').onclick = () => shareVideo(blob, record);
    $('#reportBtn').onclick = () => reportVideo(id);
    $('#shareWaBtn').onclick = () => shareToChannel('whatsapp', record);
    $('#shareFbBtn').onclick = () => shareToChannel('facebook', record);
    if (voiceMode !== 'mic') toast('ℹ️ الفيديو بدون تعليق محفوظ — فعّل «تسجيل صوتك» لحفظ التعليق داخل الفيديو.');
    window.__asly.lastVideo = record;
    renderGallery();
    renderFeatured(); // «الرائج الآن»: فيديوهاتك الأخيرة تظهر هنا
    renderResultAffiliate(prompt); // رابط «اشتري الأصلي» المناسب لموضوع الفيديو
    updateHeroStats();
  } catch (err) {
    console.error(err);
    toast('❌ ' + (err.message || 'حدث خطأ — جرّب مرة أخرى'));
    setQueueNote('❌ ' + (err.message || 'حدث خطأ'));
  } finally {
    clearInterval(funTimer);
    btn.disabled = false;
  }
}
$('#generateBtn').addEventListener('click', generateVideo);

function downloadBlob(blob, filename) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}
/* علامة «صُنع بتطبيق أصلي» على الصور — تُحرَق في نسخة التحميل/المشاركة */
async function watermarkImageBlob(blob) {
  try {
    const img = await blobToImage(blob);
    const c = document.createElement('canvas');
    c.width = img.naturalWidth; c.height = img.naturalHeight;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const barH = Math.max(36, Math.round(c.height * 0.045));
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(0, c.height - barH, c.width, barH);
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${Math.round(barH * 0.5)}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('صُنع بتطبيق أصلي • AI generated', c.width / 2, c.height - barH * 0.28);
    return new Promise(res => c.toBlob(b => res(b || blob), 'image/jpeg', 0.92));
  } catch (e) { return blob; }
}
async function downloadWatermarkedImage(blob, filename) {
  downloadBlob(await watermarkImageBlob(blob), filename);
}
async function shareVideo(blob, record) {
  const file = new File([blob], `asly-${record.id}.${record.ext}`, { type: blob.type });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try { await navigator.share({ files: [file], title: 'فيديو أصلي', text: shareCaption(record.prompt) }); return; } catch (e) {}
  }
  downloadBlob(blob, file.name);
  toast('📥 تم تحميل الفيديو — شاركه من معرض جهازك');
}
async function reportVideo(id) {
  const reason = prompt('ما المشكلة في هذا الفيديو؟ (اختياري)');
  await idbPut('reports', { id: uid(), videoId: id, reason: reason || '', createdAt: new Date().toISOString() });
  toast('🚩 تم إرسال البلاغ — شكراً لك');
}

/* ---------------- Referral (دعوة أصدقاء — +1 لكل طرف) ---------------- */
function myRefCode() {
  let code = LS.get('asly_refcode', null);
  if (!code) { code = 'ASLY-' + deviceId().slice(-6).toUpperCase(); LS.set('asly_refcode', code); }
  return code;
}
function getAppLink() {
  try {
    const u = new URL(location.href);
    if (u.protocol.startsWith('http') && !/localhost|127\.0\.0\.1/.test(u.hostname)) return u.origin + u.pathname;
  } catch (e) {}
  return location.href.split('?')[0];
}
function renderReferral() {
  const link = getAppLink() + '?ref=' + myRefCode();
  const input = $('#inviteLink');
  if (input) input.value = link;
  const info = $('#claimInfo');
  const myConfirm = LS.get('asly_my_confirm', null);
  const pending = LS.get('asly_pending_ref', null);
  if (info) {
    if (myConfirm) info.textContent = `📩 رمز تأكيدك (أرسله لصاحب الدعوة ليحصل على مكافأته): ${myConfirm}`;
    else if (pending) info.textContent = `📩 وصلت بدعوة من صديق! اضغط «تأكيد» لتحصل على +1 فيديو أنت وهو.`;
    else info.textContent = '';
  }
  const statsEl = $('#refStats');
  if (statsEl) statsEl.textContent = `أصدقاء انضموا بدعوتك: ${LS.get('asly_ref_claimed', []).length} • مكافآت حصلت عليها: ${(LS.get('asly_bonus', { earned: 0 }).earned) || 0}`;
}
function checkRefParam() {
  try {
    const ref = new URL(location.href).searchParams.get('ref');
    if (ref && ref !== myRefCode()) LS.set('asly_pending_ref', ref);
  } catch (e) {}
}
$('#copyInvite').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText($('#inviteLink').value); toast('📋 تم نسخ رابط الدعوة'); }
  catch (e) { $('#inviteLink').select(); toast('📋 انسخ الرابط يدوياً'); }
});
$('#claimBtn').addEventListener('click', () => {
  const input = $('#claimInput').value.trim();
  const pending = LS.get('asly_pending_ref', null);
  if (pending) {
    // أنا الضيف: أؤكد الدعوة — +1 لي، ورمز تأكيد لصاحب الدعوة
    const confirmCode = 'ASLY-' + pending.replace(/^ASLY-/, '') + '-' + deviceId().slice(-4).toUpperCase();
    LS.set('asly_my_confirm', confirmCode);
    LS.set('asly_pending_ref', null);
    addBonus(1, 'انضممت بدعوة صديق 🎁');
    renderReferral();
    return;
  }
  // أنا صاحب الدعوة: أدخل رمز التأكيد الذي أرسله لي صديقي
  const m = input.match(/^ASLY-([A-Z0-9]+)-([A-Z0-9]{4})$/i);
  const claimed = LS.get('asly_ref_claimed', []);
  if (!m || claimed.includes(input.toUpperCase())) { toast('⚠️ رمز غير صالح أو مستخدم من قبل'); return; }
  claimed.push(input.toUpperCase());
  LS.set('asly_ref_claimed', claimed);
  addBonus(1, 'صديقك انضم بدعوتك 🎁');
  renderReferral();
});

/* ---------------- Share-to-unlock (مشاركة = +1 فيديو) ---------------- */
function shareToChannel(channel, record) {
  const link = getAppLink();
  const text = shareCaption(record.prompt);
  const url = channel === 'whatsapp'
    ? 'https://wa.me/?text=' + encodeURIComponent(text)
    : 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(link) + '&quote=' + encodeURIComponent(text);
  window.open(url, '_blank', 'noopener');
  const today = todayKey();
  const shares = LS.get('asly_shares', {});
  const key = `${today}:${record.id}:${channel}`;
  const todayCount = Object.keys(shares).filter(k => k.startsWith(today + ':')).length;
  if (shares[key]) { toast('حصلت على مكافأة هذه المشاركة من قبل 🙂'); return; }
  if (todayCount >= 3) { toast('وصلت لحد مكافآت المشاركة اليوم (3) — جرّب غداً'); return; }
  shares[key] = 1;
  LS.set('asly_shares', shares);
  const st = stats();
  st.totalShares = (st.totalShares || 0) + 1;
  saveStats(st);
  if (st.totalShares === 1) awardBadge('firstShare', '📣 أول مشاركة');
  addBonus(1, 'شاركت الفيديو 🎁');
}

/* ---------------- إعلان اختياري: 3 إعلانات = فيديو + 3 نقاط Veo ---------------- */
$('#watchAdBtn').addEventListener('click', async () => {
  await watchAdsForVideo();
});

/* ---------------- الوضع السهل / المتقدم ---------------- */
function appMode() { return LS.get('asly_mode', 'easy'); }
function setAppMode(mode) {
  LS.set('asly_mode', mode);
  document.body.classList.toggle('mode-easy', mode === 'easy');
  document.body.classList.toggle('mode-advanced', mode === 'advanced');
  $$('.mode-btn').forEach(b => b.classList.toggle('active', b.dataset.mode === mode));
  const note = $('#modeNote');
  if (note) note.textContent = mode === 'easy'
    ? '😊 الوضع السهل: اكتب فكرتك فقط، والتطبيق يختار النمط والمدة والصوت تلقائياً.'
    : '🛠️ الوضع المتقدم: تحكم كامل في النمط والمدة والصوت والنص.';
}
function autoStyleFor(prompt) {
  const p = (prompt || '');
  if (/كرتون|أنمي|انمي|مضحك|ضحك|أطفال|اطفال|قط|قطة/.test(p)) return 'cartoon';
  if (/أنمي|انمي/.test(p)) return 'anime';
  if (/طبيع|حقيق|صورة فوتو|منظر/.test(p)) return 'realistic';
  return 'cinematic';
}
$$('.mode-btn').forEach(b => b.addEventListener('click', () => setAppMode(b.dataset.mode)));

/* ---------------- معالج البداية (3 خطوات — للمبتدئين) ---------------- */
const wiz = { step: 1, idea: '', style: 'cinematic' };
function wizardDone() { return !!LS.get('asly_wizard_done', false); }
function showWizard() {
  const m = $('#wizardModal');
  if (!m) return;
  wiz.step = 1; wiz.idea = ''; wiz.style = 'cinematic';
  m.classList.remove('hidden');
  wizardStep(1);
}
function hideWizard() { const m = $('#wizardModal'); if (m) m.classList.add('hidden'); }
function wizardStep(n) {
  wiz.step = n;
  [1, 2, 3].forEach(i => {
    const pane = $('#wizStep' + i);
    if (pane) pane.classList.toggle('hidden', i !== n);
  });
  const dots = $$('.wiz-dot');
  dots.forEach((d, i) => d.classList.toggle('active', i + 1 === n));
  if (n === 3) {
    const sum = $('#wizSummary');
    if (sum) sum.innerHTML = `💡 فكرتك: <b>${escapeHtml(wiz.idea || '—')}</b><br>🎨 النمط: <b>${escapeHtml(STYLE_NAMES_AR[wiz.style] || wiz.style)}</b><br>🎬 الفيديو مجاني بالكامل — ستشاهد 3 إعلانات قصيرة ورا بعض أولاً، وهي اللي بتدفع ثمنه.`;
  }
}
const STYLE_NAMES_AR = { cinematic: 'سينمائي 🎥', cartoon: 'كرتوني 🎨', realistic: 'واقعي 📷', anime: 'أنمي ✨' };
function wizardApplyAndClose() {
  if (wiz.idea.trim()) applyPrompt(wiz.idea.trim(), wiz.style);
  LS.set('asly_wizard_done', true);
  hideWizard();
}
function initWizard() {
  const idea = $('#wizIdea');
  if (!idea) return;
  // أمثلة جاهزة داخل الخطوة 1
  const ex = $('#wizExamples');
  if (ex) {
    ex.innerHTML = '';
    for (const e of EXAMPLES) {
      const b = document.createElement('button');
      b.className = 'example-card';
      b.innerHTML = `<span class="ex-icon">${e.icon}</span><b>${e.title}</b><small>${e.prompt}</small>`;
      b.onclick = () => { idea.value = e.prompt; wiz.idea = e.prompt; };
      ex.appendChild(b);
    }
  }
  // بطاقات النمط المصوّرة في الخطوة 2
  const styles = $('#wizStyles');
  if (styles) {
    styles.innerHTML = '';
    for (const [key, label] of Object.entries(STYLE_NAMES_AR)) {
      const card = document.createElement('button');
      card.className = 'style-card' + (key === wiz.style ? ' active' : '');
      card.dataset.style = key;
      card.innerHTML = `<span class="style-visual style-${key}">${{ cinematic: '🎥', cartoon: '🎨', realistic: '📷', anime: '✨' }[key]}</span><b>${label}</b>`;
      card.onclick = () => {
        wiz.style = key;
        $$('#wizStyles .style-card').forEach(x => x.classList.toggle('active', x.dataset.style === key));
      };
      styles.appendChild(card);
    }
  }
  $('#wizNext1').onclick = () => {
    wiz.idea = idea.value.trim();
    if (!wiz.idea) { toast('✏️ اكتب فكرتك أولاً — أو اضغط مثالاً جاهزاً'); return; }
    wizardStep(2);
  };
  $('#wizNext2').onclick = () => wizardStep(3);
  $('#wizBack2').onclick = () => wizardStep(1);
  $('#wizBack3').onclick = () => wizardStep(2);
  $('#wizGo').onclick = () => {
    wizardApplyAndClose();
    setTimeout(() => $('#generateBtn').click(), 300);
  };
  $$('.wiz-skip').forEach(b => b.onclick = () => wizardApplyAndClose());
  $('#wizMic').onclick = (e) => toggleDictation(idea, e.currentTarget);
}

/* ---------------- الإدخال الصوتي (Web Speech API) ---------------- */
// يعمل في كروم على أندرويد/سطح المكتب حيث يدعمه المتصفح. في نسخة APK يحتاج
// إضافة @capacitor-community/speech-recognition (مثل تطبيقي جاد ثيرم والرضوان).
// ملاحظة بأمانة: التسجيل الصوتي على هاتف روني لم يُختبر بعد — لا نعد بنجاحه.
let activeRec = null;
function toggleDictation(inputEl, btn) {
  if (activeRec) { try { activeRec.stop(); } catch (e) {} return; }
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    toast('🎤 المتصفح ده مش بيدعم الإدخال الصوتي — جرّب كروم على أندرويد. (في نسخة التطبيق يحتاج إضافة مخصصة — ولم يُختبر على الهاتف بعد.)');
    return;
  }
  try {
    const rec = new SR();
    rec.lang = 'ar-EG';
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    activeRec = rec;
    const base = inputEl.value ? inputEl.value + ' ' : '';
    let finalText = '';
    const setBtn = (t) => { if (btn) btn.textContent = t; };
    setBtn('🔴 بيسمع…');
    rec.onresult = (e) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += t + ' ';
        else interim += t;
      }
      inputEl.value = base + finalText + interim;
      inputEl.dispatchEvent(new Event('input'));
    };
    rec.onend = () => { activeRec = null; setBtn('🎤'); };
    rec.onerror = (e) => {
      activeRec = null; setBtn('🎤');
      const msg = e.error === 'not-allowed' ? '🎤 الميكروفون مرفوض — اسمح به من إعدادات المتصفح'
        : e.error === 'no-speech' ? '🎤 ما سمعتش حاجة — جرّب تاني'
        : e.error === 'network' ? '🎤 الإدخال الصوتي يحتاج إنترنت — تحقق من الاتصال'
        : '🎤 تعذّر الإدخال الصوتي (' + e.error + ') — جرّب الكتابة';
      toast(msg);
    };
    rec.start();
  } catch (e) {
    activeRec = null;
    toast('🎤 تعذّر تشغيل الإدخال الصوتي على هذا الجهاز');
  }
}
function renderTrending() {
  const strip = $('#trendingStrip');
  if (!strip) return;
  strip.innerHTML = '';
  for (const p of TRENDING_PROMPTS) {
    const b = document.createElement('button');
    b.className = 'trend-chip';
    b.textContent = p;
    b.onclick = () => {
      $('#prompt').value = p;
      $('#promptCount').textContent = `${p.length}/300`;
      $('#prompt').scrollIntoView({ behavior: 'smooth', block: 'center' });
    };
    strip.appendChild(b);
  }
}
function renderChallenge() {
  // تحدي الأسبوع — يتغير كل أسبوع؛ أحسن الأعمال تظهر في «واجهة المميزين»
  const c = weeklyChallenge();
  const title = $('#challengeTitle');
  if (title) title.textContent = `🏆 تحدي الأسبوع: ${c.theme}`;
  const el = $('#challengeText');
  if (el) el.textContent = c.prompt;
  const note = $('#challengeNote');
  if (note) note.textContent = '🏅 شارك في التحدي واعمل فيديو على الموضوع — أحسن الأعمال تظهر في «واجهة المميزين» تحت.';
  const btn = $('#challengeTry');
  if (btn) btn.onclick = () => {
    applyPrompt(c.prompt, 'cinematic');
  };
}
/* تعبئة فكرة في حقل الوصف (وتطبيق النمط) — تُستخدم من الترند والتحدي والقوالب والأمثلة */
function applyPrompt(prompt, style) {
  $('#prompt').value = prompt;
  $('#promptCount').textContent = `${prompt.length}/300`;
  if (style) setStyle(style);
  $('#prompt').scrollIntoView({ behavior: 'smooth', block: 'center' });
}
function setStyle(style) {
  selectedStyle = style;
  LS.set('asly_fav_style', style); // عم أصلي يفتكر النمط اللي بتحبه
  $$('#styleChips .chip').forEach(x => x.classList.toggle('active', x.dataset.style === style));
}
/* ---------------- الإعلانات المباشرة (رعاة — ملف sponsors.json) ---------------- */
// مكانان فقط كحد أقصى، وبذوق: (أ) بطاقة «برعاية» على الرئيسية، (ب) قالب
// واحد برعاية في القوالب. كلاهما يُقرأ من sponsors.json الذي يعدّله روني.
// عندما تكون القائمة فارغة لا يظهر أي مكان رعاية أصلاً.
let SPONSORS_DATA = { advertiseWhatsapp: '', sponsors: [] };
function advertiseNumber() {
  const fromFile = String(SPONSORS_DATA.advertiseWhatsapp || '');
  if (fromFile && !/X/.test(fromFile)) return fromFile.replace(/\D/g, '');
  const fromCfg = String(CONFIG.advertiseWhatsapp || '');
  if (fromCfg && !/X/.test(fromCfg)) return fromCfg.replace(/\D/g, '');
  return '';
}
function advertiseLink() {
  const num = advertiseNumber();
  if (!num) return '';
  return `https://wa.me/${num}?text=${encodeURIComponent('عاوز أعلن في تطبيق أصلي')}`;
}
function openAdvertise() {
  const link = advertiseLink();
  if (!link) { toast('📢 روني لسه مضافش رقم الواتساب للإعلانات — تابعنا قريباً'); return false; }
  window.open(link, '_blank', 'noopener');
  return true;
}
function activeSponsors() {
  const today = todayKey();
  return (SPONSORS_DATA.sponsors || []).filter(s => {
    if (!s || !s.name) return false;
    if (s.start && today < s.start) return false;
    if (s.end && today > s.end) return false;
    return true;
  });
}
function renderSponsorCard(list) {
  const card = $('#sponsorCard');
  if (!card) return;
  const act = list || activeSponsors();
  if (!act.length) { card.classList.add('hidden'); return; }
  const s = act[0];
  card.classList.remove('hidden');
  const img = $('#sponsorImg');
  if (img) { img.src = s.image || 'asly.png'; img.alt = s.name; }
  const nm = $('#sponsorName'); if (nm) nm.textContent = s.name;
  const ds = $('#sponsorDesc'); if (ds) ds.textContent = s.tagline || 'راعٍ رسمي لتطبيق أصلي';
  card.onclick = () => { if (s.link) window.open(s.link, '_blank', 'noopener'); };
}
async function loadSponsors() {
  try {
    const res = await fetch('sponsors.json', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data === 'object') SPONSORS_DATA = data;
    }
  } catch (e) { /* ملف غير متاح (file://) — استخدم الافتراضي الفارغ */ }
  renderSponsorCard();
  renderTemplates(); // القالب المدعوم يعتمد على الرعاة
}

/* ---------------- روابط تابعة «اشتري الأصلي» (affiliates.json) ---------------- */
// روابط حقيقية لصفحات بحث في المتاجر (ليست روابط وهمية أبداً) — العمولة
// تُحسب فقط بعد أن يضع روني معرّفاته الحقيقية في affiliates.json.
// القسم كله مخفي حتى يضع معرّفاً حقيقياً واحداً على الأقل.
// قواعد صارمة: بلا مختصرات روابط، بلا نوافذ منبثقة، بلا أزرار تحميل وهمية —
// كل ذلك يضر بثقة المستخدمين وموافقة AdSense. مع إفصاح واضح أن الروابط تابعة.
let AFFILIATES_DATA = { amazonTag: '', jumiaId: '', jumiaAffiliateParam: '', youtubeUrl: '', products: [] };
async function loadAffiliates() {
  try {
    const res = await fetch('affiliates.json', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data === 'object') AFFILIATES_DATA = data;
    }
  } catch (e) { /* ملف غير متاح (file://) — القسم يبقى مخفياً */ }
  renderAffiliates();
  renderYoutubeBtn();
}
function hasRealAffiliate() {
  const d = AFFILIATES_DATA || {};
  const bad = v => !v || /PLACEHOLDER|X{4,}/i.test(v);
  return !bad(d.amazonTag) || !bad(d.jumiaId);
}
function affiliateLinks(p) {
  const d = AFFILIATES_DATA || {};
  const out = {};
  if (d.amazonTag && !/PLACEHOLDER|X{4,}/i.test(d.amazonTag)) {
    out.amazon = 'https://www.amazon.eg/s?k=' + encodeURIComponent(p.amazonQuery || p.name) + '&tag=' + encodeURIComponent(d.amazonTag);
  }
  if (d.jumiaId && !/PLACEHOLDER/i.test(d.jumiaId)) {
    out.jumia = 'https://www.jumia.com.eg/catalog/?q=' + encodeURIComponent(p.jumiaQuery || p.name) + (d.jumiaAffiliateParam ? '&' + d.jumiaAffiliateParam.replace(/^&/, '') : '');
  }
  return out;
}
function affiliateCardHTML(p) {
  const links = affiliateLinks(p);
  const btns = [];
  if (links.amazon) btns.push(`<a class="btn small" href="${escapeHtml(links.amazon)}" target="_blank" rel="noopener sponsored">🛒 Amazon.eg</a>`);
  if (links.jumia) btns.push(`<a class="btn small" href="${escapeHtml(links.jumia)}" target="_blank" rel="noopener sponsored">🛒 Jumia</a>`);
  if (!btns.length) return '';
  return `<div class="affiliate-card"><b>🛒 ${escapeHtml(p.name)}</b><small>${escapeHtml(p.desc || '')}</small><div class="row btns">${btns.join('')}</div></div>`;
}
function renderAffiliates() {
  const sec = $('#affiliateSection');
  if (!sec) return;
  if (!hasRealAffiliate()) { sec.classList.add('hidden'); sec.innerHTML = ''; return; }
  const prods = (AFFILIATES_DATA.products || []).slice(0, 3);
  const cards = prods.map(affiliateCardHTML).filter(Boolean).join('');
  if (!cards) { sec.classList.add('hidden'); return; }
  sec.innerHTML = `<div class="field-label">🛒 اشتري الأصلي</div><div class="affiliate-grid">${cards}</div>
    <div class="hint">🔗 روابط تابعة: قد نربح عمولة صغيرة من مشترياتك بدون أي تكلفة إضافية عليك — والمنتجات هنا أصلية ومجرّبة في حلقات «أصلي يا باشا».</div>`;
  sec.classList.remove('hidden');
}
function affiliateForPrompt(prompt) {
  if (!hasRealAffiliate()) return null;
  const p = (prompt || '').toLowerCase();
  return (AFFILIATES_DATA.products || []).find(pr => (pr.keywords || []).some(k => p.includes(String(k).toLowerCase()))) || null;
}
function renderResultAffiliate(prompt) {
  const box = $('#resultAffiliate');
  if (!box) return;
  const pr = affiliateForPrompt(prompt);
  box.innerHTML = pr ? affiliateCardHTML(pr) : '';
}
function renderYoutubeBtn() {
  const btn = $('#youtubeBtn');
  if (!btn) return;
  const url = (AFFILIATES_DATA.youtubeUrl || '').trim();
  if (/^https?:\/\//.test(url)) {
    btn.href = url;
    btn.classList.remove('hidden');
  } else {
    btn.classList.add('hidden');
  }
}

/* ---------------- مكتبة البرومبتات اليومية (v1.8) ---------------- */
// ---------------- مكتبة البرومبتات v3 — prompts.json مصدر الحقيقة الوحيد ----------------
// المخطط v3 (توافقي رجعياً مع v1): {id, text_ar, text_en, kind, category, tags,
// season, trend, date, preview}. حقول اختيارية لها قيم افتراضية آمنة، والبرومبت
// المخالف لفلتر الأمان يُستبعد تلقائياً — فاستبدال prompts.json يومياً آمن.
// - برومبت اليوم: يوم السنة % حجم المجموعة (فيديو + صورة كل يوم).
// - مجموعة اليوم: 12 برومبت تدور كل يوم (إزاحة = يوم السنة × 12).
// - التجديد الأسبوعي: ترتيب المجموعة يُخلَط كل أسبوع ببذرة رقم الأسبوع.
// - المواسم: الموسم الحالي من PROMPTS_DATA.seasons يرفع برومبتاته أولاً،
//   وشريط «موسمي» يعرضه. «ترند اليوم» = برومبتات trend بتاريخ اليوم.
// - المعاينة: صورة لكل بطاقة (توليد كسول + كاش IndexedDB) + معاينة حركة
//   2.5 ثانية Ken Burns لبرومبتات الفيديو عند الضغط. برومبت اليوم دائماً جاهز.
// - الربح: أول 5 معاينات/يوم مجاناً (تتدوّر يومياً)؛ بعدها إعلان واحد = 5
//   معاينات إضافية. برو: معاينات بلا حدود.
let PROMPTS_DATA = { categories: [], seasons: [], prompts: [] };
let libKind = 'video';
let libCat = 'all';
let libShowAll = false;
let libSeason = 'all'; // 'all' | season id — مرشح الموسم
function dayOfYear(d = new Date()) { return Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 864e5); }
function weekOfYear(d = new Date()) { return Math.ceil(dayOfYear(d) / 7); }
function mulberry32(a) { return function() { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function seededShuffle(arr, seed) {
  const a = [...arr]; const rnd = mulberry32(seed);
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
function normPrompt(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const textAr = (raw.text_ar || raw.text || '').trim();
  const textEn = (raw.text_en || '').trim();
  if (!textAr) return null;
  return {
    id: String(raw.id || ('p' + Math.abs(hashStr(textAr)))),
    kind: raw.kind === 'image' ? 'image' : 'video',
    category: raw.category || raw.cat || 'story',
    text_ar: textAr, text_en: textEn,
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    season: raw.season || 'evergreen',
    trend: raw.trend || null,
    date: raw.date || null,
    preview: raw.preview || 'auto',
    style: raw.style || null,
  };
}
function hashStr(s) { let h = 0; for (let i = 0; i < s.length; i++) { h = (h << 5) - h + s.charCodeAt(i); h |= 0; } return h; }
// الموسم الحالي من تعريف المواسم (نطاقات تواريخ/أشهر) — يتبع التقويم تلقائياً
function seasonNow(d = new Date()) {
  const seasons = PROMPTS_DATA.seasons || [];
  const mmdd = String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const m = d.getMonth() + 1;
  for (const s of seasons) {
    if (!s || s.id === 'evergreen') continue;
    if (s.start && s.end) {
      const inRange = s.start <= s.end ? (mmdd >= s.start && mmdd <= s.end) : (mmdd >= s.start || mmdd <= s.end);
      if (inRange) return s.id;
    } else if (Array.isArray(s.months) && s.months.includes(m)) return s.id;
    else if (s.date === d.toISOString().slice(0, 10)) return s.id;
  }
  return 'evergreen';
}
function seasonLabel(id) {
  const s = (PROMPTS_DATA.seasons || []).find(x => x.id === id);
  return s ? s.label : id;
}
function orderedPrompts(kind, d = new Date()) {
  // خلط أسبوعي + رفع موسمي: برومبتات الموسم الحالي أولاً، ثم الباقي
  const pool = PROMPTS_DATA.prompts.filter(p => p.kind === kind);
  const shuffled = seededShuffle(pool, weekOfYear(d) * 1000 + d.getFullYear());
  const now = seasonNow(d);
  if (now !== 'evergreen') {
    const seasonal = shuffled.filter(p => p.season === now);
    const rest = shuffled.filter(p => p.season !== now);
    return [...seasonal, ...rest];
  }
  return shuffled;
}
function dailyPrompt(kind, d = new Date()) {
  const pool = orderedPrompts(kind, d);
  if (!pool.length) return null;
  return pool[dayOfYear(d) % pool.length];
}
function todaysTrends(d = new Date()) {
  const today = d.toISOString().slice(0, 10);
  return PROMPTS_DATA.prompts.filter(p => p.trend && (!p.date || p.date === today));
}
function dailyLibrarySet(kind, cat, d = new Date(), showAll = libShowAll) {
  let pool = orderedPrompts(kind, d);
  if (cat !== 'all') pool = pool.filter(p => p.category === cat);
  if (libSeason !== 'all') pool = pool.filter(p => p.season === libSeason);
  if (showAll || pool.length <= 12) return pool;
  const n = 12, off = (dayOfYear(d) * n) % pool.length;
  const out = [];
  for (let i = 0; i < n; i++) out.push(pool[(off + i) % pool.length]);
  return out;
}
function catLabel(catId) {
  const c = (PROMPTS_DATA.categories || []).find(x => x.id === catId);
  return c ? c.label : catId;
}
async function loadPrompts() {
  try {
    const r = await fetch('prompts.json', { cache: 'no-store' });
    const data = await r.json();
    const ok = (data.prompts || [])
      .map(normPrompt).filter(Boolean)
      .filter(p => filterCheck(p.text_ar).ok && (!p.text_en || filterCheck(p.text_en).ok));
    PROMPTS_DATA = { categories: data.categories || [], seasons: data.seasons || [], prompts: ok };
  } catch (e) { PROMPTS_DATA = { categories: [], seasons: [], prompts: [] }; }
  renderPromptLibrary();
  renderLibraryTeaser();
  ensureDailyPreviews();
}
/* ---------------- معاينات البرومبتات: صورة كسولة + حركة 2.5 ثانية ---------------- */
// الكاش: IndexedDB store «previews» {id, blob, at}. أول 5 معاينات/يوم مجاناً
// (مجموعة المعاينات المجانية تتدوّر يومياً ببذرة يوم السنة)؛ بعدها إعلان
// واحد = 5 معاينات إضافية (بمكافأة متنوعة أحياناً). برو بلا حدود.
// برومبت اليوم (فيديو + صورة) تُولَّد معاينته فور تحميل المكتبة.
const PREVIEW_FREE = () => CONFIG.caps.previewPerDay;
function previewDayKey(d = new Date()) { return d.toISOString().slice(0, 10); }
function previewFreeSet(d = new Date()) {
  // أول 5 معاينات مجانية من مجموعة اليوم نفسها (3 فيديو + 2 صورة) —
  // تتجدد يومياً مع المجموعة، فالمستخدم يرى المجاني دائماً في أول ما يفتح المكتبة
  const v = dailyLibrarySet('video', 'all', d).slice(0, 3);
  const i = dailyLibrarySet('image', 'all', d).slice(0, 2);
  return new Set(v.concat(i).map(p => p.id));
}
function previewsUsedToday() {
  const rec = LS.get('asly_preview_used', { day: '', ids: [] });
  if (rec.day !== previewDayKey()) return [];
  return rec.ids || [];
}
function extraPreviewLeft(d = new Date()) {
  // رصيد إعلانات مستهلك: المعاينات غير المجانية التي شوهدت اليوم تخصم من الرصيد الممنوح
  const b = LS.get('asly_bonus_extra', {});
  const granted = b.preview || 0;
  const freeSet = previewFreeSet(d);
  const extraUsed = previewsUsedToday().filter(id => !freeSet.has(id)).length;
  return Math.max(0, granted - extraUsed);
}
function previewsRemaining() {
  if (isPro()) return Infinity;
  const freeSet = previewFreeSet();
  const freeViewed = previewsUsedToday().filter(id => freeSet.has(id)).length;
  return Math.max(0, PREVIEW_FREE() - freeViewed + extraPreviewLeft());
}
function markPreviewUsed(id) {
  const key = previewDayKey();
  const rec = LS.get('asly_preview_used', { day: '', ids: [] });
  if (rec.day !== key) { rec.day = key; rec.ids = []; }
  if (!rec.ids.includes(id)) { rec.ids.push(id); LS.set('asly_preview_used', rec); }
}
function previewIsFree(id, d = new Date()) {
  if (isPro()) return true;
  if (previewFreeSet(d).has(id)) return true;
  return extraPreviewLeft(d) > 0; // رصيد إعلانات فقط يفتح أي برومبت — وليس رصيد اليوم المجاني
}
async function idbGet(store, key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction(store, 'readonly').objectStore(store).get(key);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}
async function idbDelete(store, key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite');
    tx.objectStore(store).delete(key);
    tx.oncomplete = resolve; tx.onerror = () => reject(tx.error);
  });
}
async function getCachedPreview(id) {
  try {
    const rec = await idbGet('previews', id);
    if (rec && rec.blob) return rec.blob;
  } catch (e) { /* الكاش اختياري — الفشل لا يوقف المعاينة */ }
  return null;
}
async function generatePreviewBlob(p) {
  // صورة المعاينة من text_en الجاهز (لا ترجمة) + تحسين الجودة نفسه،
  // وبذرة ثابتة من معرّف البرومبت حتى تبقى المعاينة نفسها عند كل تحميل
  const en = p.text_en || await translatePromptToEnglish(p.text_ar);
  const url = imageUrlForSingle(en, 'cinematic', p.kind === 'image' ? 'square' : 'portrait', Math.abs(hashStr(p.id)) % 100000);
  const blob = await loadImageBlob(url);
  return blob;
}
async function ensurePreview(p) {
  const cached = await getCachedPreview(p.id);
  if (cached) return cached;
  const blob = await generatePreviewBlob(p);
  try { await idbPut('previews', { id: p.id, blob, at: Date.now() }); } catch (e) { /* تجاهل */ }
  return blob;
}
// برومبت اليوم دائماً جاهز: معاينتاه تُولَّدان فور تحميل المكتبة (خلفية، بلا حظر)
async function ensureDailyPreviews() {
  for (const kind of ['video', 'image']) {
    const p = dailyPrompt(kind);
    if (!p) continue;
    try { await ensurePreview(p); } catch (e) { /* تُعاد عند العرض */ }
    const card = document.querySelector(`.daily-prompt[data-pid="${p.id}"] .daily-preview`);
    if (card) fillPreviewImg(card, p);
  }
}
function fillPreviewImg(box, p) {
  if (!box || box.dataset.done) return;
  ensurePreview(p).then(blob => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const img = document.createElement('img');
    img.src = url; img.alt = p.text_ar; img.loading = 'lazy';
    box.innerHTML = ''; box.appendChild(img); box.dataset.done = '1';
    if (p.kind === 'video') {
      const badge = document.createElement('button');
      badge.className = 'motion-badge'; badge.textContent = '▶️ شوف الحركة (3 ث)';
      badge.onclick = (ev) => { ev.stopPropagation(); playMotionPreview(box, p, blob); };
      box.appendChild(badge);
    }
  }).catch(() => { box.innerHTML = '<span class="preview-fallback">🖼️</span>'; });
}
// معاينة الحركة: Ken Burns 2.5 ثانية فوق صورة المعاينة (نفس محرك الفيديو مصغّراً)
let motionTimer = null;
function playMotionPreview(box, p, blob) {
  if (motionTimer) { clearInterval(motionTimer); motionTimer = null; }
  const img = new Image();
  img.onload = () => {
    const cv = document.createElement('canvas');
    cv.width = 360; cv.height = 640; cv.className = 'motion-canvas';
    box.innerHTML = ''; box.appendChild(cv);
    const ctx = cv.getContext('2d');
    const t0 = performance.now(), dur = 2500;
    motionTimer = setInterval(() => {
      const t = (performance.now() - t0) / dur;
      if (t >= 1) { clearInterval(motionTimer); motionTimer = null; fillPreviewImg(box, p); return; }
      const zoom = 1 + 0.12 * t; // تكبير بطيء من 1 إلى 1.12
      const w = cv.width * zoom, h = cv.height * zoom;
      const dx = (cv.width - w) / 2, dy = (cv.height - h) / 2;
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, cv.width, cv.height);
      ctx.drawImage(img, dx, dy, w, h);
      ctx.fillStyle = 'rgba(0,0,0,.55)';
      ctx.fillRect(0, cv.height - 34, cv.width, 34);
      ctx.fillStyle = '#fff'; ctx.font = 'bold 15px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('صُنع بتطبيق أصلي • AI', cv.width / 2, cv.height - 13);
    }, 42);
  };
  img.src = URL.createObjectURL(blob);
}
/* ---------------- عرض المكتبة: تبويب مستقل + بطاقة يومية مصغّرة على الرئيسية ---------------- */
function promptCardEl(p) {
  const card = document.createElement('div');
  card.className = 'prompt-card';
  card.dataset.pid = p.id;
  const free = previewIsFree(p.id);
  const seasonChip = p.season && p.season !== 'evergreen' ? `<span class="prompt-season">${escapeHtml(seasonLabel(p.season))}</span>` : '';
  const trendChip = p.trend ? `<span class="prompt-trend">🔥 ${escapeHtml(p.trend)}</span>` : '';
  card.innerHTML = `<div class="prompt-preview" data-pid="${p.id}">${free ? '<span class="preview-loading">⏳ جاري تجهيز المعاينة…</span>' : '<span class="preview-locked">🔒 المعاينة مقفولة — إعلان واحد يفتح 5 معاينات</span>'}</div>
    <span class="prompt-cat">${escapeHtml(catLabel(p.category))}</span>${seasonChip}${trendChip}
    <p>${escapeHtml(p.text_ar)}</p>
    <div class="row btns"><button class="btn small btn-primary use-btn">▶️ استخدمه</button><button class="btn small copy-btn">📋 انسخ</button>${free ? '' : '<button class="btn small unlock-btn">📺 افتح المعاينة</button>'}</div>`;
  card.querySelector('.use-btn').onclick = () => useLibraryPrompt(p);
  card.querySelector('.copy-btn').onclick = () => copyLibraryPrompt(p);
  const unlock = card.querySelector('.unlock-btn');
  if (unlock) unlock.onclick = () => unlockPreviews(card, p);
  return card;
}
async function unlockPreviews(card, p) {
  // إعلان واحد = 5 معاينات إضافية (أحياناً مكافأة متنوعة: رسائل محادثة أو نقطة سلسلة)
  const ok = await watchSingleAd('preview');
  if (!ok) return;
  const b = LS.get('asly_bonus_extra', {});
  b.preview = (b.preview || 0) + CONFIG.caps.previewPerDay;
  LS.set('asly_bonus_extra', b);
  toast('🎁 المعاينات اتفتحت — استمتع!');
  renderPromptLibrary();
}
function renderPromptLibrary() {
  const sec = $('#promptLibrary');
  if (!sec) return;
  // بطاقتا برومبت اليوم (فيديو + صورة) — معاينتاهما دائماً جاهزتان
  const dailyEl = $('#dailyPromptCard');
  if (dailyEl) {
    dailyEl.innerHTML = '';
    for (const [p, tag] of [[dailyPrompt('video'), '🎬 فيديو'], [dailyPrompt('image'), '🖼️ صورة']]) {
      if (!p) continue;
      const card = document.createElement('div');
      card.className = 'daily-prompt';
      card.dataset.pid = p.id;
      card.innerHTML = `<div class="daily-preview" data-pid="${p.id}"><span class="preview-loading">⏳ جاري تجهيز المعاينة…</span></div>
        <span class="daily-tag">${tag} • برومبت اليوم ✨</span><p>${escapeHtml(p.text_ar)}</p>
        <div class="row btns"><button class="btn small btn-primary use-btn">▶️ استخدمه</button><button class="btn small copy-btn">📋 انسخ</button></div>`;
      card.querySelector('.use-btn').onclick = () => useLibraryPrompt(p);
      card.querySelector('.copy-btn').onclick = () => copyLibraryPrompt(p);
      dailyEl.appendChild(card);
      fillPreviewImg(card.querySelector('.daily-preview'), p);
    }
  }
  // تبويبا النوع
  const kv = $('#libKindVideo'), ki = $('#libKindImage');
  if (kv) kv.classList.toggle('active', libKind === 'video');
  if (ki) ki.classList.toggle('active', libKind === 'image');
  // شرائح التصنيفات
  const catsEl = $('#libCats');
  if (catsEl) {
    catsEl.innerHTML = '';
    const all = document.createElement('button');
    all.className = 'chip' + (libCat === 'all' ? ' active' : '');
    all.textContent = '📚 الكل';
    all.onclick = () => { libCat = 'all'; renderPromptLibrary(); };
    catsEl.appendChild(all);
    for (const c of (PROMPTS_DATA.categories || [])) {
      const b = document.createElement('button');
      b.className = 'chip' + (libCat === c.id ? ' active' : '');
      b.textContent = c.label;
      b.onclick = () => { libCat = c.id; renderPromptLibrary(); };
      catsEl.appendChild(b);
    }
  }
  // شريط الموسم الحالي
  const seasonEl = $('#libSeasonStrip');
  if (seasonEl) {
    const now = seasonNow();
    const seasons = (PROMPTS_DATA.seasons || []).filter(s => s.id !== 'evergreen');
    seasonEl.innerHTML = '';
    const mk = (id, label) => {
      const b = document.createElement('button');
      b.className = 'chip' + (libSeason === id ? ' active' : '');
      b.textContent = label;
      b.onclick = () => { libSeason = id; renderPromptLibrary(); };
      seasonEl.appendChild(b);
    };
    mk('all', '📅 الكل');
    if (now !== 'evergreen') mk(now, `🎉 ${seasonLabel(now)} — الموسم الحالي`);
    for (const s of seasons) if (s.id !== now) mk(s.id, s.label);
  }
  // شريط ترند اليوم
  const trendEl = $('#libTrendStrip');
  if (trendEl) {
    const trends = todaysTrends();
    trendEl.innerHTML = trends.length ? '<b>🔥 ترند اليوم:</b> ' + trends.map(p => escapeHtml(p.trend)).filter((v, i, a) => a.indexOf(v) === i).join(' • ') : '';
    trendEl.classList.toggle('hidden', !trends.length);
  }
  // عدّاد المعاينات المجانية
  const pvEl = $('#previewCount');
  if (pvEl) pvEl.textContent = isPro() ? 'برو: معاينات بلا حدود ⭐' : `👁️ معاينات مجانية اليوم: ${previewsRemaining()} — إعلان واحد = 5 معاينات`;
  // شبكة البرومبتات (مجموعة اليوم أو الكل) — معاينة كسولة عند الظهور
  const grid = $('#promptGrid');
  if (grid) {
    grid.innerHTML = '';
    const list = dailyLibrarySet(libKind, libCat);
    for (const p of list) grid.appendChild(promptCardEl(p));
    observePreviewBoxes(grid);
  }
  const total = PROMPTS_DATA.prompts.filter(p => p.kind === libKind && (libCat === 'all' || p.category === libCat)).length;
  const countEl = $('#libCount');
  if (countEl) countEl.textContent = libShowAll ? `عرض الكل — ${total} برومبت` : `مجموعة اليوم — 12 برومبت جديد كل يوم (الكل: ${total})`;
  const more = $('#libShowAllBtn');
  if (more) more.textContent = libShowAll ? '📅 عرض مجموعة اليوم فقط' : `📚 عرض كل البرومبتات (${total})`;
}
// توليد كسول: المعاينة تُولَّد فقط عندما تظهر البطاقة على الشاشة (لا حظر للمكتبة)
let previewObserver = null;
function observePreviewBoxes(root) {
  if (!('IntersectionObserver' in window)) {
    root.querySelectorAll('.prompt-preview').forEach(box => {
      const p = PROMPTS_DATA.prompts.find(x => x.id === box.dataset.pid);
      if (p && previewIsFree(p.id)) { markPreviewUsed(p.id); fillPreviewImg(box, p); }
    });
    return;
  }
  if (previewObserver) previewObserver.disconnect();
  previewObserver = new IntersectionObserver(entries => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      const box = e.target;
      previewObserver.unobserve(box);
      const p = PROMPTS_DATA.prompts.find(x => x.id === box.dataset.pid);
      if (!p || !previewIsFree(p.id)) continue;
      markPreviewUsed(p.id);
      fillPreviewImg(box, p);
    }
  }, { rootMargin: '200px' });
  root.querySelectorAll('.prompt-preview').forEach(box => {
    const p = PROMPTS_DATA.prompts.find(x => x.id === box.dataset.pid);
    if (p && previewIsFree(p.id)) previewObserver.observe(box);
  });
}
// بطاقة مصغّرة على الرئيسية: برومبت اليوم + زر يفتح تبويب البرومبتات
function renderLibraryTeaser() {
  const el = $('#libraryTeaser');
  if (!el) return;
  const p = dailyPrompt('video');
  el.innerHTML = p
    ? `<b>✨ برومبت اليوم:</b> ${escapeHtml(p.text_ar)} <button class="btn small btn-primary" id="teaserUseBtn">▶️ استخدمه</button> <button class="btn small" id="teaserOpenBtn">📚 كل البرومبتات</button>`
    : '<b>📚 مكتبة البرومبتات:</b> أفكار جديدة كل يوم <button class="btn small" id="teaserOpenBtn">افتح المكتبة</button>';
  const use = $('#teaserUseBtn');
  if (use) use.onclick = () => useLibraryPrompt(p);
  const open = $('#teaserOpenBtn');
  if (open) open.onclick = () => document.querySelector('[data-tab="prompts"]').click();
}
function useLibraryPrompt(p) {
  if (!filterCheck(p.text_ar).ok) { toast(REFUSAL); return; }
  if (p.kind === 'image') {
    document.querySelector('[data-tab="images"]').click();
    $('#imagePrompt').value = p.text_ar;
    $('#imagePrompt').scrollIntoView({ behavior: 'smooth', block: 'center' });
    toast('✅ البرومبت جاهز في تبويب الصور — اضغط «أنشئ الصورة»');
  } else {
    applyPrompt(p.text_ar, p.style || null);
    toast('✅ البرومبت جاهز — اضغط «أنشئ الفيديو»');
  }
}
function copyLibraryPrompt(p) {
  const done = () => toast('📋 تم نسخ البرومبت');
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(p.text_ar).then(done, () => fallbackCopyText(p.text_ar, done));
  } else fallbackCopyText(p.text_ar, done);
}
function fallbackCopyText(text, done) {
  try {
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    document.execCommand('copy'); document.body.removeChild(ta); done();
  } catch (e) { toast('⚠️ انسخ يدوياً: ' + text); }
}
function renderTemplates() {
  const grid = $('#templatesGrid');
  if (!grid) return;
  grid.innerHTML = '';
  for (const t of TEMPLATES) {
    const card = document.createElement('button');
    card.className = 'template-card';
    card.innerHTML = `<span class="tpl-icon">${t.icon}</span><b>${t.title}</b><small>${t.desc}</small>`;
    card.onclick = () => {
      applyPrompt(t.prompt, t.style);
      toast(`✅ قالب «${t.title}» جاهز — اضغط «أنشئ الفيديو»`);
    };
    grid.appendChild(card);
  }
  // قالب برعاية — واحد فقط كحد أقصى (من sponsors.json)، ومميز بعلامة «برعاية»
  const sp = activeSponsors().find(s => s.template && s.template.prompt);
  if (sp) {
    const t = sp.template;
    const card = document.createElement('button');
    card.className = 'template-card sponsored';
    card.innerHTML = `<span class="tpl-icon">${escapeHtml(t.icon || '🤝')}</span><b>${escapeHtml(t.title || 'قالب برعاية')}</b><small>برعاية ${escapeHtml(sp.name)} • ${escapeHtml(t.desc || '')}</small>`;
    card.onclick = () => {
      applyPrompt(t.prompt, t.style || null);
      toast(`✅ قالب برعاية «${sp.name}» جاهز — اضغط «أنشئ الفيديو»`);
    };
    grid.appendChild(card);
  }
}
function renderExamples() {
  const grid = $('#examplesGrid');
  if (!grid) return;
  grid.innerHTML = '';
  for (const e of EXAMPLES) {
    const card = document.createElement('button');
    card.className = 'example-card';
    card.innerHTML = `<span class="ex-icon">${e.icon}</span><b>${e.title}</b><small>${e.prompt}</small>`;
    card.onclick = () => {
      applyPrompt(e.prompt, null);
      toast(`✅ مثال جاهز — غيّر الكلمات كما تحب ثم اضغط «أنشئ الفيديو»`);
    };
    grid.appendChild(card);
  }
}
async function renderFeatured() {
  const grid = $('#featuredGrid');
  if (!grid) return;
  let list = FEATURED_DEFAULT;
  try {
    const res = await fetch('featured.json', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length) list = data;
    }
  } catch (e) { /* ملف غير متاح (file://) — استخدم القائمة المدمجة */ }
  grid.innerHTML = '';
  for (const f of list.slice(0, 6)) {
    const card = document.createElement('div');
    card.className = 'featured-card';
    card.innerHTML = `
      <img src="${escapeHtml(f.img || 'asly.png')}" alt="${escapeHtml(f.title || '')}" loading="lazy">
      <div class="feat-body"><b>${escapeHtml(f.title || '')}</b>
      <small>👤 ${escapeHtml(f.creator || 'فريق أصلي')} • ${escapeHtml(f.theme || '')}</small>
      <button class="btn small">🔁 ريمكس</button></div>`;
    card.querySelector('button').onclick = () => {
      if (f.prompt) applyPrompt(f.prompt, null);
      if (f.url) window.open(f.url, '_blank', 'noopener');
    };
    grid.appendChild(card);
  }
  // أمثلة البطل — أول 3 أعمال في مقدمة الصفحة (اضغط أي صورة لتبدأ منها)
  const heroEx = $('#heroExamples');
  if (heroEx) {
    heroEx.innerHTML = '';
    for (const f of list.slice(0, 3)) {
      const b = document.createElement('button');
      b.className = 'hero-example';
      b.innerHTML = `<img src="${escapeHtml(f.img || 'asly.png')}" alt="${escapeHtml(f.title || '')}" loading="lazy"><span>${escapeHtml(f.title || '')}</span>`;
      b.onclick = () => { if (f.prompt) applyPrompt(f.prompt, null); document.querySelector('#prompt').scrollIntoView({ behavior: 'smooth', block: 'center' }); };
      heroEx.appendChild(b);
    }
  }
  const note = $('#featuredNote');
  if (note) note.textContent = '✨ أعمال مميزة من مجتمع «أصلي» — اضغط «ريمكس» لتأخذ أي عمل كبداية وتعمل نسختك. لتحديث القائمة، عدّل ملف featured.json في مجلد التطبيق. (ملاحظة صادقة: بلا خادم، لا توجد قائمة رائجة عامة من فيديوهات كل المستخدمين — القائمة هنا مختارات روني + فيديوهاتك أنت.)';
  // «الرائج الآن» — فيديوهاتك الأخيرة تظهر هنا أولاً (محلياً على جهازك)
  const mine = $('#trendingMine');
  if (mine) {
    try {
      const vids = (await idbAll('videos')).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 3);
      if (vids.length) {
        mine.innerHTML = '<div class="field-label">🎬 آخر فيديوهاتك</div><div class="trending-mine-grid"></div>';
        const g = mine.querySelector('.trending-mine-grid');
        for (const v of vids) {
          const card = document.createElement('div');
          card.className = 'trending-mine-card';
          const url = URL.createObjectURL(v.blob);
          card.innerHTML = `<video src="${url}" controls playsinline preload="metadata"></video><small>📝 ${escapeHtml(v.prompt.slice(0, 40))}</small>`;
          g.appendChild(card);
        }
      } else {
        mine.innerHTML = '<div class="hint">🎬 لسه معملتش فيديو — فكرتك الأولى فوق 👆</div>';
      }
    } catch (e) { mine.innerHTML = ''; }
  }
}
/* ---------------- عجلة الحظ ---------------- */
function wheelState() { return LS.get('asly_wheel', { lastSpin: null, spins: 0 }); }
function canSpinWheel() { return wheelState().lastSpin !== todayKey(); }
function renderWheel() {
  const btn = $('#wheelSpinBtn');
  if (!btn) return;
  const can = canSpinWheel();
  btn.disabled = !can;
  btn.textContent = can ? '🎡 لفّ العجلة (لفّة مجانية اليوم)' : '✅ لففت اليوم — عُد غداً للفّة جديدة 🎡';
  const info = $('#wheelInfo');
  if (info) info.textContent = can ? 'لفّة واحدة مجانية كل يوم — مكافآت: فيديوهات وصور ورسائل إضافية 🎁' : `آخر لفّة: ${wheelState().lastSpin} • مجموع اللفّات: ${wheelState().spins}`;
}
function spinWheel() {
  if (!canSpinWheel()) { toast('لففت اليوم بالفعل — عُد غداً 🎡'); return; }
  const wheel = $('#wheel');
  const btn = $('#wheelSpinBtn');
  btn.disabled = true;
  const prizeIdx = Math.floor(Math.random() * WHEEL_PRIZES.length);
  const segAngle = 360 / WHEEL_PRIZES.length;
  const target = 360 * 5 + (360 - prizeIdx * segAngle - segAngle / 2);
  wheel.style.transition = 'transform 4s cubic-bezier(0.15, 0.9, 0.25, 1)';
  wheel.style.transform = `rotate(${target}deg)`;
  setTimeout(() => {
    const prize = WHEEL_PRIZES[prizeIdx];
    const st = wheelState();
    st.lastSpin = todayKey();
    st.spins = (st.spins || 0) + 1;
    LS.set('asly_wheel', st);
    if (prize.kind === 'videos') addBonus(prize.n, 'عجلة الحظ 🎡');
    else if (prize.kind === 'images') addImageBonus(prize.n, 'عجلة الحظ 🎡');
    else if (prize.kind === 'chat') addChatBonus(prize.n, 'عجلة الحظ 🎡');
    else toast('😅 حظ أوفر المرة الجاية — جرّب غداً!');
    if (prize.kind !== 'none') awardBadge('wheelWin', '🎡 لفّة محظوظة');
    renderWheel();
  }, 4200);
}

/* ---------------- Veo السينمائي (مدفوع بالإعلانات — متوقف حتى يفعّله روني) ---------------- */
// الحساب بأمانة: إعلان واحد ≈ 0.002$، فيديو Veo Lite (8 ثوانٍ 720p) = 0.40$
// أي 200 إعلان، وفيديو Veo Fast (8 ثوانٍ 1080p) = 0.96$ أي 480 إعلاناً.
// لا نعد أبداً بـ«إعلان واحد = فيديو Veo». المفتاح لا يوجد في التطبيق أبداً:
// الطلبات تمر عبر Cloudflare Worker (worker/veo-proxy.js) يحمل المفتاح في
// متغيرات البيئة ويفرض سقفاً يومياً عاماً وسقفاً لكل جهاز حتى لا تتضخم فاتورة Google.
function veoWorkerUrl() {
  return (settings().veoWorkerUrl || '').trim() || CONFIG.veo.workerUrl || '';
}
// Veo لا تعمل إلا بشرطين معاً: رابط Worker + تفعيل يدوي من روني بعد أن
// يشحن رصيد Google Cloud بنفسه من أرباح الإعلانات. لا خصم تلقائي أبداً.
function veoEnabled() { return !!veoWorkerUrl() && !!settings().veoManualOn; }
/* ---------------- وضع Veo: اشتراك ↔ مجاني (تبديل تلقائي من الـ Worker) ---------------- */
// الوضع يُحسب في الـ Worker من الرصيد المقدَّر (إعلانات + اشتراكات − إنفاق Veo):
// عند بلوغ الحد (30 يوم فيو + احتياطي 3$/يوم + هامش أمان 20%) يفتح مجاناً
// للجميع تلقائياً، ويرجع للاشتراك إن نزل الرصيد. التطبيق يحفظ آخر وضع معروف
// محلياً ليبقى مستقراً بلا إنترنت. الافتراضي: اشتراك.
function veoMode() {
  const m = LS.get('asly_veo_mode', null);
  return (m && m.mode === 'free') ? 'free' : 'subscription';
}
function veoModeInfo() { return LS.get('asly_veo_mode', { mode: 'subscription', balanceUsd: 0, thresholdUsd: 0 }); }
function isVeoSubscribed() { return !!settings().veoSubscribed; }
async function refreshVeoMode() {
  const wurl = veoWorkerUrl();
  if (!wurl) return;
  try {
    const res = await fetch(wurl.replace(/\/$/, '') + '/pool');
    if (!res.ok) return;
    const d = await res.json();
    if (d.mode) {
      LS.set('asly_veo_mode', { mode: d.mode, balanceUsd: d.balanceUsd || 0, thresholdUsd: d.thresholdUsd || 0, subsMonth: d.subsMonth || 0, updatedAt: new Date().toISOString() });
      renderVeoCard();
      renderMoneyDashboard();
    }
  } catch (e) { /* بلا Worker — يبقى آخر وضع معروف */ }
}
/* ---------------- اشتراك Veo (Google Play in-app purchase — placeholder في الويب) ---------------- */
// في نسخة الأندرويد (Capacitor) يستدعي زر الاشتراك Play Billing بالمنتج
// CONFIG.veo.subscription.productId، ولا يُفعَّل الاشتراك إلا بعد تأكيد الدفع
// من Play. في نسخة الويب لا يوجد دفع حقيقي — الزر يشرح ذلك فقط.
// ملاحظة صادقة: الـ Worker لا يستطيع التحقق من مشتريات Play من الخادم
// بدون Play Developer API + service account (خطوة مستقبلية)؛ عدّاد
// الاشتراكات فيه تقديري من بلاغات التطبيق بعد تأكيد الدفع على الجهاز.
function startSubscription() {
  toast(`⭐ اشتراك Veo (${CONFIG.veo.subscription.priceEgp} ج/شهر) خطوة لاحقة — بعد نشر التطبيق على Google Play. التطبيق حالياً ويب + PWA، وVeo متوقفة حتى ذلك الحين.`);
}
function setSubscribed(on) {
  const s = settings();
  s.veoSubscribed = !!on;
  LS.set('asly_settings', s);
  if (on) pingSubToWorker();
  renderVeoCard();
}
async function pingSubToWorker() {
  if (!veoWorkerUrl()) return;
  try {
    await fetch(veoWorkerUrl().replace(/\/$/, '') + '/sub', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ device: deviceId(), productId: CONFIG.veo.subscription.productId }),
    });
  } catch (e) { /* بلاغ اختياري */ }
}
function renderVeoCard() {
  const bal = $('#veoCredits'); if (bal) bal.textContent = veoCredits();
  const bar = $('#veoProgress'); if (bar) bar.style.width = Math.min(100, veoCredits() / VEO_COSTS.lite * 100) + '%';
  const need = $('#veoNeed');
  const mode = veoMode();
  const sub = isVeoSubscribed() || isPro(); // برو يشمل Veo عند توفره (تفعيل يدوي الآن، Play لاحقاً)
  if (need) {
    const left = Math.max(0, VEO_COSTS.lite - veoCredits());
    if (!veoEnabled()) {
      need.textContent = `باقي لك ${left} إعلان عشان فيديو Veo Lite — والميزة نفسها قادمة قريباً (روني يفعّلها بعد شحن رصيد Google Cloud من أرباح الإعلانات).`;
    } else if (mode === 'free') {
      need.textContent = left === 0 ? '✅ معاك نقاط كافية لفيديو Veo Lite!' : `باقي لك ${left} إعلان عشان فيديو Veo Lite (200 نقطة)`;
    } else {
      need.textContent = sub
        ? (left === 0 ? '✅ معاك نقاط كافية لفيديو Veo Lite!' : `باقي لك ${left} إعلان عشان فيديو Veo Lite (200 نقطة)`)
        : `⭐ فيو للمشتركين — الاشتراك خطوة لاحقة بعد النشر على Google Play (${CONFIG.veo.subscription.priceEgp} ج/شهر)، أو استنى لما تتفتح مجاناً.`;
    }
  }
  const modeEl = $('#veoModeStatus');
  if (modeEl) {
    if (!veoEnabled()) {
      modeEl.textContent = '🔒 فيو قادمة قريباً ⏳';
    } else if (mode === 'free') {
      modeEl.textContent = '🎉 فيديوهات فيو مجانية دلوقتي — بدون اشتراك، استمتع!';
    } else {
      const info = veoModeInfo();
      modeEl.textContent = sub
        ? '⭐ اشتراكك مفعّل — فيديوهات فيو متاحة لك 🎬'
        : `⏳ جاري تجهيز فيديوك — فيو هتتفتح مجاناً لما يكمل الصندوق (الرصيد المقدَّر ~$${(info.balanceUsd || 0).toFixed(2)} من حد ~$${(info.thresholdUsd || 0).toFixed(2)}).`;
    }
  }
  const off = $('#veoOffNote');
  if (off) off.classList.toggle('hidden', veoEnabled());
  const subBtn = $('#veoSubscribeBtn');
  if (subBtn) subBtn.classList.toggle('hidden', !veoEnabled() || mode === 'free' || sub);
  const liteBtn = $('#veoLiteBtn'), fastBtn = $('#veoFastBtn');
  const canUse = veoEnabled() && (mode === 'free' || sub);
  if (liteBtn) liteBtn.disabled = !canUse || veoCredits() < VEO_COSTS.lite;
  if (fastBtn) fastBtn.disabled = !canUse || veoCredits() < VEO_COSTS.fast;
}
/* ---------------- طابور Veo الخفي (المستخدم لا يرى إلا «جاري تجهيز فيديوك») ---------------- */
// خلف الكواليس: FIFO + احتياطي ربح 3$/يوم (يُدار في الـ Worker). المستخدم لا
// يرى أبداً رقماً في الطابور أو موقعاً أو موعداً — فقط حالة «جاري تجهيز
// فيديوك» برسائل مرحة، وإشعار عند الجاهزية. إن كان الصندوق فاضياً، يُحفظ
// الطلب معلّقاً محلياً ويُعاد تلقائياً عند فتح التطبيق (دون أن يُرفَض أحد).
const VEO_FUN = ['عم أصلي بيجهّز الكاميرا السينمائية… 🎥', 'بنظبط الإضاءة زي الأفلام… 💡', 'المخرج بيقول: أكشن! 🎬', 'بنركّب المشاهد… ✨', 'شوية صبر يا باشا، الفيلم بيستوي… 🍿'];
async function waitVeoDone(base, op, note) {
  // استطلاع الحالة كل 10 ثوانٍ (حتى 6 دقائق) — بلا عدّاد وبلا موعد ظاهر
  for (let i = 0; i < 36; i++) {
    await sleep(10000);
    if (note) note.textContent = '⏳ جاري تجهيز فيديوك… ' + VEO_FUN[i % VEO_FUN.length];
    const st = await fetch(base + '/status?op=' + encodeURIComponent(op));
    if (!st.ok) continue;
    const s = await st.json();
    if (s.status === 'done' && s.download) {
      const vb = await fetch(base + s.download);
      if (!vb.ok) throw new Error('تعذّر تحميل الفيديو من الـ Worker');
      return vb.blob();
    }
    if (s.status === 'failed') throw new Error(s.error || 'فشل توليد Veo');
  }
  throw new Error('veo_timeout');
}
async function saveVeoVideo(blob, prompt, quality) {
  bumpMoneyVeo(quality); // عدّاد إنفاق Veo المقدَّر في لوحة الرصيد
  const id = uid();
  const record = { id, prompt, style: 'veo-' + quality, duration: 8, mime: 'video/mp4', ext: 'mp4', createdAt: new Date().toISOString(), blob };
  await idbPut('videos', record);
  const st2 = stats(); st2.totalVideos = (st2.totalVideos || 0) + 1; saveStats(st2);
  touchStreak();
  const v = $('#resultVideo'); v.src = URL.createObjectURL(blob);
  $('#resultBox').classList.remove('hidden');
  $('#downloadBtn').onclick = () => downloadBlob(blob, `asly-veo-${id}.mp4`);
  $('#shareBtn').onclick = () => shareVideo(blob, record);
  $('#reportBtn').onclick = () => reportVideo(id);
  $('#shareWaBtn').onclick = () => shareToChannel('whatsapp', record);
  $('#shareFbBtn').onclick = () => shareToChannel('facebook', record);
  window.__asly.lastVideo = record;
  renderGallery();
  return record;
}
async function processPendingVeo() {
  const p = LS.get('asly_veo_pending', null);
  if (!p || !veoEnabled()) return;
  const base = veoWorkerUrl().replace(/\/$/, '');
  try {
    let op = p.operation || null;
    if (!op) {
      // طلب لم يُرسَل بعد (الصندوق كان فاضياً) — أعد إرساله بهدوء
      const res = await fetch(base + '/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device: p.device || deviceId(), prompt: p.prompt, quality: p.quality, aspectRatio: '9:16', durationSeconds: 8 }),
      });
      if (res.status === 429) return; // الصندوق لسه فاضي — نحاول في الفتحة الجاية
      if (!res.ok) { LS.set('asly_veo_pending', null); return; }
      const data = await res.json();
      if (!data.operation) { LS.set('asly_veo_pending', null); return; }
      op = data.operation;
      LS.set('asly_veo_pending', { ...p, operation: op });
    }
    const blob = await waitVeoDone(base, op, null);
    LS.set('asly_veo_pending', null);
    await saveVeoVideo(blob, p.prompt, p.quality);
    toast('⭐ فيديو Veo السينمائي جاهز! لقيناه في معرضك 🎬');
    renderVeoCard();
  } catch (e) {
    if (String(e.message || '') === 'veo_timeout') return; // العملية مستمرة — نحاول لاحقاً
    LS.set('asly_veo_pending', null); // فشل حقيقي — لا نعلّق المستخدم للأبد
  }
}
async function requestVeo(quality) {
  if (!veoEnabled()) { toast('⭐ ميزة Veo قادمة قريباً ⏳ — روني يفعّلها يدوياً بعد شحن رصيد Google Cloud من أرباح الإعلانات.'); return; }
  const note = $('#veoStatus');
  if (veoMode() === 'subscription' && !isVeoSubscribed()) {
    toast('⭐ فيو للمشتركين حالياً — اشترك من الزر فوق، أو استنى لما تتفتح مجاناً ⏳');
    if (note) note.textContent = '⏳ جاري تجهيز فيديوك — فيو هتتفتح مجاناً لما يكمل الصندوق ✨';
    return;
  }
  const url = veoWorkerUrl();
  const cost = VEO_COSTS[quality];
  if (veoCredits() < cost) { toast(`⭐ تحتاج ${cost} نقطة لفيديو Veo ${quality === 'lite' ? 'Lite' : 'Fast'} — معاك ${veoCredits()} نقطة. شاهد إعلانات لتجميع النقاط.`); return; }
  const prompt = $('#prompt').value.trim();
  if (!prompt) { toast('✏️ اكتب فكرة الفيديو أولاً'); return; }
  if (!filterCheck(prompt).ok) { toast(REFUSAL); return; }
  if (!spendVeoCredits(cost)) return;
  const btn = quality === 'lite' ? $('#veoLiteBtn') : $('#veoFastBtn');
  if (btn) btn.disabled = true;
  try {
    if (note) note.textContent = '⏳ جاري تجهيز فيديوك… ' + VEO_FUN[0];
    const base = url.replace(/\/$/, '');
    const res = await fetch(base + '/generate', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ device: deviceId(), prompt, quality, aspectRatio: '9:16', durationSeconds: 8 }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      if (res.status === 429 && body.includes('pool_empty')) throw new Error('pool_empty');
      throw new Error('Worker: HTTP ' + res.status + ' ' + body.slice(0, 150));
    }
    const data = await res.json();
    if (!data.operation) throw new Error('رد غير متوقع من الـ Worker');
    const blob = await waitVeoDone(base, data.operation, note);
    await saveVeoVideo(blob, prompt, quality);
    if (note) note.textContent = '✅ فيديو Veo جاهز! ⭐';
    toast('⭐ فيديو Veo السينمائي جاهز!');
    renderVeoCard();
  } catch (err) {
    console.error(err);
    if (String(err.message || '') === 'pool_empty') {
      // الصندوق فاضي دلوقتي — لا نرفض المستخدم: نرجّع نقاطه ونعلّق الطلب
      addVeoCredits(cost, 'استرجاع نقاط — الصندوق فاضي مؤقتاً');
      LS.set('asly_veo_pending', { prompt, quality, device: deviceId(), createdAt: new Date().toISOString() });
      if (note) note.textContent = '⏳ جاري تجهيز فيديوك — هنبلغك أول ما يجهز ✨';
      toast('⏳ جاري تجهيز فيديوك — هنبلغك أول ما يجهز ✨');
      return;
    }
    if (String(err.message || '') === 'veo_timeout') {
      // العملية مستمرة عند Google — علّقها لتُستكمل في الخلفية
      LS.set('asly_veo_pending', { prompt, quality, device: deviceId(), createdAt: new Date().toISOString() });
      if (note) note.textContent = '⏳ جاري تجهيز فيديوك — هنبلغك أول ما يجهز ✨';
      toast('⏳ جاري تجهيز فيديوك — هنبلغك أول ما يجهز ✨');
      return;
    }
    // فشل حقيقي — استرجاع النقاط
    addVeoCredits(cost, 'استرجاع نقاط بعد فشل Veo');
    if (note) note.textContent = '❌ ' + (err.message || 'تعذّر توليد Veo');
    toast('❌ ' + (err.message || 'تعذّر توليد Veo'));
  } finally {
    renderVeoCard();
  }
}
/* ---------------- كاتب السيناريو (AI script writer — زي كاب كت) ---------------- */
// يحوّل فكرة من سطر واحد إلى سيناريو 3 مشاهد + نص تعليق جاهز للقراءة.
// يستخدم نفس المحادثة المجانية (Pollinations) — بلا مفتاح وبلا تكلفة.
async function writeScript() {
  const idea = $('#prompt').value.trim();
  if (!idea) { toast('✏️ اكتب فكرتك أولاً — سطر واحد يكفي، وأنا أكتب السيناريو'); return; }
  const f = filterCheck(idea);
  if (!f.ok) { toast(REFUSAL); return; }
  const btn = $('#scriptBtn');
  btn.disabled = true;
  const old = btn.textContent;
  btn.textContent = '✍️ بكتب السيناريو…';
  try {
    const reply = await chatPollinations([
      { role: 'user', content: `اكتب سيناريو فيديو قصير (3 مشاهد) عن: ${idea}\nاكتب بهذا الشكل بالضبط:\nالمشهد 1: [وصف المشهد بالإنجليزية البسيطة للصور]\nالمشهد 2: [وصف المشهد]\nالمشهد 3: [وصف المشهد]\nالتعليق: [نص التعليق بالعربية الفصحى المبسطة، جملتان أو ثلاث، يصلح للقراءة الصوتية]` },
    ]);
    const narr = (reply.match(/التعليق:\s*([\s\S]*)/) || [])[1];
    if (narr && narr.trim()) {
      $('#narration').value = narr.trim().slice(0, 300); // يُستخدم كتعليق حتى في الوضع السهل
    }
    LS.set('asly_last_script', reply.slice(0, 1000));
    toast('✅ السيناريو جاهز — نص التعليق اتملأ تلقائياً، اضغط «أنشئ الفيديو»');
    return reply;
  } catch (err) {
    console.error(err);
    toast('❌ ' + (err.message || 'تعذّر كتابة السيناريو — جرّب لاحقاً'));
    throw err;
  } finally {
    btn.disabled = false;
    btn.textContent = old;
  }
}
$('#scriptBtn').addEventListener('click', writeScript);

$('#surpriseBtn').addEventListener('click', () => {
  const all = [...TRENDING_PROMPTS, ...CHALLENGES];
  const p = all[Math.floor(Math.random() * all.length)];
  $('#prompt').value = p;
  $('#promptCount').textContent = `${p.length}/300`;
  toast('🎲 فكرة اليوم: ' + p);
});
function renderTips() {
  const day = Math.floor(Date.now() / 864e5);
  const set = (id, arr) => { const el = $(id); if (el) el.textContent = arr[day % arr.length]; };
  set('#tipVideo', TIPS_VIDEO);
  set('#tipChat', TIPS_CHAT);
  set('#tipGallery', TIPS_GALLERY);
  set('#tipSettings', TIPS_SETTINGS);
  set('#tipImages', TIPS_IMAGES);
}

/* ---------------- End-card (نص نهاية الحلقة) ---------------- */
function fillEndCard() {
  const el = $('#endCardText');
  if (!el) return;
  el.value = `🎬 جرّب تطبيق «أصلي» — اعمل فيديو بالذكاء الاصطناعي ببلاش:\n${getAppLink()}\n📘 وتابع صفحة «أصلى مش مضروب» على فيسبوك:\nhttps://facebook.com/people/أصلى-مش-مضروب/61571405720824/`;
}
$('#copyEndCard').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText($('#endCardText').value); toast('📋 تم نسخ نص نهاية الحلقة'); }
  catch (e) { toast('⚠️ انسخ النص يدوياً'); }
});

/* ---------------- Images tab ---------------- */
const TIPS_IMAGES = [
  'الصورة الحلوة بتبدأ بوصف واضح — اكتب التفاصيل اللي شايفها بعينك.',
  'جرّب النمط الواقعي للصور الطبيعية، والكرتوني للصور المضحكة.',
  'أي صورة تعجبك اضغط «استخدمها في فيديو» وهتبقى أول مشهد 🎬',
];
let selectedImageStyle = 'cinematic';
$$('#imageStyleChips .chip').forEach(c => c.addEventListener('click', () => {
  $$('#imageStyleChips .chip').forEach(x => x.classList.remove('active'));
  c.classList.add('active');
  selectedImageStyle = c.dataset.istyle;
}));
$('#imagePrompt').addEventListener('input', e => { $('#imagePromptCount').textContent = `${e.target.value.length}/300`; });
function updateImagesRemaining() {
  const el = $('#imagesRemaining');
  if (el) el.textContent = `متبقٍ اليوم: ${imagesRemaining()} صورة`;
}
function renderFirstSceneNote() {
  const note = $('#firstSceneNote');
  if (!note) return;
  note.classList.toggle('hidden', !LS.get('asly_first_scene', null));
}
$('#clearFirstScene').addEventListener('click', () => {
  LS.set('asly_first_scene', null);
  renderFirstSceneNote();
  toast('تم إلغاء الصورة المختارة كمشهد أول');
});
async function generateImage() {
  const prompt = $('#imagePrompt').value.trim();
  if (!prompt) { toast('✏️ اكتب وصف الصورة أولاً'); return; }
  const f = filterCheck(prompt);
  if (!f.ok) { toast(REFUSAL); return; }
  if ((usageToday().images || 0) >= CONFIG.caps.imagesPerDay + bonusImages()) {
    toast(`⏳ وصلت لحد الصور اليوم (${CONFIG.caps.imagesPerDay} صور) — جرّب غداً`);
    return;
  }
  const aspect = $('#imageAspect').value;
  const btn = $('#generateImageBtn');
  btn.disabled = true;
  $('#imageResult').classList.add('hidden');
  $('#imageQueue').classList.remove('hidden');
  setQueueProgress(0.05);
  setQueueNote('الصور تُنشأ واحدة كل 45 ثانية تقريباً (حد النسخة المجانية) — لا تغلق الصفحة.');
  try {
    const seed = Math.floor(Math.random() * 100000);
    const apiPrompt = await translatePromptToEnglish(prompt);
    const url = imageUrlForSingle(apiPrompt, selectedImageStyle, aspect, seed);
    const blob = await loadImageBlob(url);
    const id = uid();
    const record = { id, prompt, style: selectedImageStyle, aspect, createdAt: new Date().toISOString(), blob };
    await idbPut('images', record);
    bumpUsage('images');
    updateImagesRemaining();
    setQueueProgress(1);
    setQueueNote('');
    $('#resultImage').src = URL.createObjectURL(blob);
    $('#imageResult').classList.remove('hidden');
    $('#imageDownloadBtn').onclick = () => downloadWatermarkedImage(blob, `asly-img-${id}.jpg`);
    $('#imageShareBtn').onclick = () => shareImage(blob, record);
    $('#useInVideoBtn').onclick = () => useImageInVideo(id);
    $('#imageReportBtn').onclick = () => reportImage(id);
    window.__asly.lastImage = record;
    renderImages();
  } catch (err) {
    console.error(err);
    toast('❌ ' + (err.message || 'حدث خطأ — جرّب مرة أخرى'));
    setQueueNote('❌ ' + (err.message || 'حدث خطأ'));
  } finally {
    btn.disabled = false;
  }
}
$('#generateImageBtn').addEventListener('click', generateImage);
async function renderImages() {
  const grid = $('#imagesGrid');
  if (!grid) return;
  const list = (await idbAll('images')).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  $('#imagesEmpty').classList.toggle('hidden', list.length > 0);
  grid.innerHTML = '';
  for (const v of list) {
    const card = document.createElement('div');
    card.className = 'gallery-card';
    const url = URL.createObjectURL(v.blob);
    card.innerHTML = `
      <img src="${url}" alt="صورة مولّدة بالذكاء الاصطناعي">
      <div class="meta">🤖 AI generated<br>📝 ${escapeHtml(v.prompt.slice(0, 60))}<br>🕐 ${new Date(v.createdAt).toLocaleString('ar-EG')}</div>
      <div class="actions">
        <button data-act="dl">⬇️ تحميل</button>
        <button data-act="share">🔗 مشاركة</button>
        <button data-act="use">🎬 في فيديو</button>
        <button data-act="report">🚩 إبلاغ</button>
        <button data-act="del">🗑️ حذف</button>
      </div>`;
    card.querySelector('[data-act="dl"]').onclick = () => downloadWatermarkedImage(v.blob, `asly-img-${v.id}.jpg`);
    card.querySelector('[data-act="share"]').onclick = () => shareImage(v.blob, v);
    card.querySelector('[data-act="use"]').onclick = () => useImageInVideo(v.id);
    card.querySelector('[data-act="report"]').onclick = () => reportImage(v.id);
    card.querySelector('[data-act="del"]').onclick = async () => {
      if (confirm('حذف هذه الصورة؟')) { await idbDelete('images', v.id); renderImages(); }
    };
    grid.appendChild(card);
  }
}
async function useImageInVideo(id) {
  const rec = await idbGet('images', id);
  if (!rec) { toast('⚠️ الصورة غير موجودة'); return; }
  LS.set('asly_first_scene', id);
  renderFirstSceneNote();
  $('#prompt').value = rec.prompt;
  $('#promptCount').textContent = `${rec.prompt.length}/300`;
  document.querySelector('[data-tab="video"]').click();
  toast('✅ الصورة هتكون أول مشهد في الفيديو — اضغط «أنشئ الفيديو»');
}
async function shareImage(blob, record) {
  const marked = await watermarkImageBlob(blob);
  const file = new File([marked], `asly-img-${record.id}.jpg`, { type: 'image/jpeg' });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try { await navigator.share({ files: [file], title: 'صورة أصلي', text: shareCaption(record.prompt) }); return; } catch (e) {}
  }
  downloadBlob(marked, file.name);
  toast('📥 تم تحميل الصورة — شاركها من معرض جهازك');
}
async function reportImage(id) {
  const reason = prompt('ما المشكلة في هذه الصورة؟ (اختياري)');
  await idbPut('reports', { id: uid(), imageId: id, reason: reason || '', createdAt: new Date().toISOString() });
  toast('🚩 تم إرسال البلاغ — شكراً لك');
}

/* ---------------- Gallery ---------------- */
async function renderGallery() {
  const grid = $('#galleryGrid');
  const list = (await idbAll('videos')).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  $('#galleryEmpty').classList.toggle('hidden', list.length > 0);
  grid.innerHTML = '';
  for (const v of list) {
    const card = document.createElement('div');
    card.className = 'gallery-card';
    const url = URL.createObjectURL(v.blob);
    card.innerHTML = `
      <video src="${url}" controls playsinline preload="metadata"></video>
      <div class="meta">🤖 AI generated<br>📝 ${escapeHtml(v.prompt.slice(0, 60))}<br>🕐 ${new Date(v.createdAt).toLocaleString('ar-EG')} • ${v.duration} ث</div>
      <div class="actions">
        <button data-act="dl">⬇️ تحميل</button>
        <button data-act="share">🔗 مشاركة</button>
        <button data-act="remix">🔁 ريمكس</button>
        <button data-act="report">🚩 إبلاغ</button>
        <button data-act="del">🗑️ حذف</button>
      </div>`;
    card.querySelector('[data-act="dl"]').onclick = () => downloadBlob(v.blob, `asly-${v.id}.${v.ext}`);
    card.querySelector('[data-act="share"]').onclick = () => shareVideo(v.blob, v);
    card.querySelector('[data-act="remix"]').onclick = () => remixVideo(v);
    card.querySelector('[data-act="report"]').onclick = () => reportVideo(v.id);
    card.querySelector('[data-act="del"]').onclick = async () => {
      if (confirm('حذف هذا الفيديو؟')) { await idbDelete('videos', v.id); renderGallery(); }
    };
    grid.appendChild(card);
  }
}
/* ---------------- ريمكس (بروح الدويتو/الستيتش — نسخة محلية بدون خادم) ---------------- */
// يأخذ فكرة أي فيديو (من معرضك أو من واجهة المميزين) كبداية، ويفتح تبويب
// الإنشاء بالوصف والنمط جاهزين — غيّر الكلمات واعمل نسختك الخاصة.
function remixVideo(v) {
  if (!v) return;
  $('#prompt').value = v.prompt || '';
  $('#promptCount').textContent = `${($('#prompt').value.length)}/300`;
  if (v.style && STYLE_NAMES_AR[v.style]) setStyle(v.style);
  document.querySelector('[data-tab="video"]').click();
  $('#prompt').scrollIntoView({ behavior: 'smooth', block: 'center' });
  toast('🔁 ريمكس: خدت الفكرة كبداية — غيّر فيها واعمل نسختك الخاصة');
}
function escapeHtml(s) {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/* ---------------- Chat ---------------- */
function chatHistory() { return LS.get('asly_chat', []); }
function saveChatHistory(h) { LS.set('asly_chat', h.slice(-50)); }
function renderChat() {
  const log = $('#chatLog');
  log.innerHTML = '';
  const hist = chatHistory();
  // ترحيب شخصي باسم المستخدم عندما تكون المحادثة فارغة (ذاكرة محلية فقط)
  if (!hist.length) {
    const name = (settings().userName || '').trim();
    const greet = document.createElement('div');
    greet.className = 'msg sys';
    greet.textContent = name
      ? `أهلاً يا ${name}! 👋 أنا عم أصلي — شريكك الإبداعي. أقدر أكتبلك سكربت فيديو كامل، أحسّن برومبت، أكتب كابشن تسويقي، أخطط معاك، ألخّص، وأترجم. جرّب واحد من دول:`
      : 'أهلاً بيك! 👋 أنا عم أصلي — شريكك الإبداعي. أقدر أكتبلك سكربت فيديو كامل، أحسّن برومبت، أكتب كابشن تسويقي، أخطط معاك، ألخّص، وأترجم. جرّب واحد من دول:';
    log.appendChild(greet);
    const ex = document.createElement('div');
    ex.className = 'chat-examples';
    for (const q of CHAT_EXAMPLES) {
      const b = document.createElement('button');
      b.className = 'chip example-q';
      b.textContent = q;
      b.onclick = () => { $('#chatInput').value = q; sendChat(); };
      ex.appendChild(b);
    }
    log.appendChild(ex);
  }
  for (const m of hist) {
    const div = document.createElement('div');
    div.className = 'msg ' + (m.role === 'user' ? 'user' : m.role === 'sys' ? 'sys' : 'bot');
    div.textContent = m.text;
    log.appendChild(div);
  }
  log.scrollTop = log.scrollHeight;
  updateCapsBadge();
}
const CHAT_EXAMPLES = [
  'اكتبلي سكربت فيديو عن قط بيطبخ كشري',
  'حسّن البرومبت ده: غروب شمس على النيل',
  'اكتبلي كابشن تسويقي لفيديو عن باور بانك أصلي',
  'خطط لي أسبوع محتوى لقناة عن الأكل المصري',
];
const CHAT_SYSTEM = `أنت «عم أصلي»، شريك إبداعي خبير يتحدث العربية بلهجة مصرية خفيفة وواضحة.
قدراتك: تكتب سكربتات فيديو كاملة (مشاهد + تعليق صوتي)، تحسّن برومبتات الصور والفيديو، تكتب كابشنات وأفكار تسويقية، تجيب عن الأسئلة، تخطط وتلخّص وتترجم، وتتابع الطلبات متعددة الخطوات خطوة بخطوة.
قواعدك:
- أعطِ إجابات كاملة ومفيدة فعلاً، لا سطراً واحداً مختصراً عندما يطلب المستخدم عملاً (سكربت، خطة، تحسين). استخدم عناوين وقوائم مرقّمة عند الحاجة.
- عند كتابة سكربت فيديو: قسّمه إلى 3 مشاهد بوصف بصري لكل مشهد، ثم نص تعليق جاهز للقراءة.
- عند تحسين برومبت: أعطِ النسخة المحسّنة بالإنجليزية (لأن مولّد الصور يفهم الإنجليزية أفضل) مع شرح موجز بالعربية لما غيّرته.
- التزم بالمحتوى المحترم فقط: ارفض بلطف أي طلب جنسي أو عنيف أو مسيء أو متعلق بالأطفال بشكل غير لائق.
- تذكّر سياق المحادثة وابنِ عليه؛ إن طلب المستخدم تعديلاً على إجابة سابقة، عدّلها ولا تبدأ من الصفر.
- أجب بالعربية دائماً ما لم يطلب المستخدم لغة أخرى.`;
async function chatPollinations(messages) {
  const res = await pollinationsFetch(CONFIG.textUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: CONFIG.chatModel,
      messages: [{ role: 'system', content: CHAT_SYSTEM }, ...messages],
      temperature: 0.7, max_tokens: 1200,
    }),
  }, 'text');
  if (!res.ok) {
    const t = await res.text().catch(() => '');
    throw new Error('تعذّر الاتصال بالمحادثة (HTTP ' + res.status + ') ' + (t ? '— ' + t.slice(0, 120) : ''));
  }
  const data = await res.json();
  const text = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
  if (!text) throw new Error('رد فارغ من النموذج');
  return String(text).trim();
}
async function chatGemini(messages) {
  const key = (settings().geminiKey || '').trim();
  if (!key) throw new Error('لم تضف مفتاح Gemini بعد — أضفه من الإعدادات (مجاني من Google AI Studio)');
  const contents = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));
  const res = await fetch(CONFIG.geminiUrl(CONFIG.geminiModel) + '?key=' + encodeURIComponent(key), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: CHAT_SYSTEM }] },
      contents,
      generationConfig: { maxOutputTokens: 1200, temperature: 0.7 },
    }),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => '');
    throw new Error('Gemini: HTTP ' + res.status + ' ' + t.slice(0, 150));
  }
  const data = await res.json();
  const text = data && data.candidates && data.candidates[0] && data.candidates[0].content &&
    data.candidates[0].content.parts && data.candidates[0].content.parts.map(p => p.text || '').join('');
  if (!text) throw new Error('رد فارغ من Gemini');
  return String(text).trim();
}
async function sendChat() {
  const input = $('#chatInput');
  const text = input.value.trim();
  if (!text) return;
  const f = filterCheck(text);
  if (!f.ok) {
    const h = chatHistory();
    h.push({ role: 'sys', text: REFUSAL });
    saveChatHistory(h);
    renderChat();
    return;
  }
  if (chatRemaining() <= 0) {
    // الحد اليومي خلص — إعلان واحد = حزمة رسائل إضافية (أحياناً مكافأة مضاعفة)
    const btn = $('#chatUnlockBtn');
    if (btn) btn.classList.remove('hidden');
    toast(`⏳ خلصت رسايلك المجانية النهاردة (${CONFIG.caps.chatPerDay}) — شاهد إعلاناً واحداً واحصل على ${CONFIG.caps.chatAdBundle} رسائل إضافية 🎁`);
    return;
  }
  input.value = '';
  const hist = chatHistory();
  hist.push({ role: 'user', text });
  saveChatHistory(hist);
  renderChat();
  const btn = $('#chatSend');
  btn.disabled = true;
  try {
    const provider = (settings().chatProvider || 'pollinations');
    const msgs = hist.filter(m => m.role !== 'sys').slice(-16).map(m => ({ role: m.role, content: m.text }));
    const reply = provider === 'gemini' ? await chatGemini(msgs) : await chatPollinations(msgs);
    const h2 = chatHistory();
    h2.push({ role: 'assistant', text: reply });
    saveChatHistory(h2);
    bumpUsage('chat');
    const st = stats();
    st.totalChats = (st.totalChats || 0) + 1;
    saveStats(st);
    if (st.totalChats === 1) awardBadge('firstChat', '💬 أول محادثة');
    renderChat();
  } catch (err) {
    console.error(err);
    const h2 = chatHistory();
    h2.push({ role: 'sys', text: '⚠️ ' + (err.message || 'تعذّر الاتصال — جرّب لاحقاً') });
    saveChatHistory(h2);
    renderChat();
  } finally {
    btn.disabled = false;
  }
}
$('#chatSend').addEventListener('click', sendChat);
$('#chatInput').addEventListener('keydown', e => { if (e.key === 'Enter') sendChat(); });
$('#chatClear').addEventListener('click', () => {
  if (confirm('مسح كل المحادثة؟')) { saveChatHistory([]); renderChat(); }
});

/* ---------------- Voice list note (speechSynthesis) ---------------- */
function listArabicVoices() {
  try {
    return (window.speechSynthesis ? window.speechSynthesis.getVoices() : [])
      .filter(v => (v.lang || '').toLowerCase().startsWith('ar'))
      .map(v => `${v.name} (${v.lang})`);
  } catch (e) { return []; }
}

/* ---------------- Init ---------------- */
loadSettings();
checkRefParam();
setAppMode(appMode());
const favStyle = LS.get('asly_fav_style', null); // النمط المفضل من آخر مرة
if (favStyle && STYLE_NAMES_AR[favStyle]) setStyle(favStyle);
renderReferral();
renderTrending();
renderChallenge();
renderTemplates();
renderExamples();
renderFeatured();
renderWheel();
renderBadges(); // الأوسمة ظاهرة على الرئيسية
updateHeroStats();
renderVeoCard();
renderPoolStatus();
renderMoneyDashboard();
renderPro(); // شارة برو + مقارنة مجاني/برو + عناصر برو فقط
refreshVeoMode(); // مزامنة وضع فيو (اشتراك/مجاني) من الـ Worker
loadSponsors();
loadPrompts(); // مكتبة البرومبتات اليومية (prompts.json)
loadAffiliates(); // روابط «اشتري الأصلي» + زر يوتيوب (مخفيان حتى تُوضع معرّفات حقيقية)
processPendingVeo(); // استئناف طلبات Veo المعلّقة بهدوء (الطابور الخفي)
updateAdProgressNote();
touchDailyVeoBonus();
renderTips();
fillEndCard();
renderFirstSceneNote();
updateImagesRemaining();
applyAdsVisibility();
applyAdsenseVisibility();
updateCapsBadge();
renderChat();
renderGallery();
populateVoicePicker();
initWizard();
if (!LS.get('asly_wizard_done', false)) showWizard();
$('#voiceHint').textContent = 'بدون صوت: الفيديو يُصدَّر صامتاً. التعليق الحي يُسمَع أثناء التشغيل فقط ولا يُحفظ داخل الملف. تسجيل الصوت يُحفظ داخل الفيديو. (لا يوجد تعليق صوتي جاهز مجاناً من Pollinations — الصوت الجاهز يحتاج مفتاحاً مدفوعاً.)';
// أزرار الميكروفون (الإدخال الصوتي)
$('#micPrompt').addEventListener('click', (e) => toggleDictation($('#prompt'), e.currentTarget));
$('#micImage').addEventListener('click', (e) => toggleDictation($('#imagePrompt'), e.currentTarget));
$('#micChat').addEventListener('click', (e) => toggleDictation($('#chatInput'), e.currentTarget));
// نمط صوت الراوي
const vsSel = $('#voiceStyle');
if (vsSel) vsSel.addEventListener('change', () => { selectedVoiceStyle = vsSel.value; });
// عجلة الحظ
const wheelBtn = $('#wheelSpinBtn');
if (wheelBtn) wheelBtn.addEventListener('click', spinWheel);
// زر «أعلن معنا» الوحيد — في الصفحة الرئيسية (إعلانات مباشرة — واتساب روني)
const heroCta = $('#heroCta');
if (heroCta) heroCta.onclick = () => {
  if (!wizardDone()) { showWizard(); return; }
  const p = $('#prompt');
  if (p) { p.scrollIntoView({ behavior: 'smooth', block: 'center' }); p.focus({ preventScroll: true }); }
};
const heroInstallBtn = $('#heroInstallBtn');
if (heroInstallBtn) heroInstallBtn.onclick = () => installApp();
// مكتبة البرومبتات: تبويبا النوع + زر عرض الكل/مجموعة اليوم
const libKv = $('#libKindVideo');
if (libKv) libKv.onclick = () => { libKind = 'video'; libShowAll = false; renderPromptLibrary(); };
const libKi = $('#libKindImage');
if (libKi) libKi.onclick = () => { libKind = 'image'; libShowAll = false; renderPromptLibrary(); };
const libMore = $('#libShowAllBtn');
if (libMore) libMore.onclick = () => { libShowAll = !libShowAll; renderPromptLibrary(); };
const advBtn = $('#advertiseBtn');
if (advBtn) advBtn.addEventListener('click', openAdvertise);
// زر تحديث لوحة الرصيد
const moneyBtn = $('#moneyRefresh');
if (moneyBtn) moneyBtn.addEventListener('click', () => { renderMoneyDashboard(); toast('🔄 تم تحديث أرقام لوحة الرصيد (تقديرات)'); });
// زر الاشتراك في Veo (Play Billing في نسخة الأندرويد — شرح فقط في الويب)
const subBtn = $('#veoSubscribeBtn');
if (subBtn) subBtn.addEventListener('click', startSubscription);
// أزرار تثبيت PWA
const installNow = $('#installNowBtn');
if (installNow) installNow.addEventListener('click', installApp);
const installLater = $('#installLaterBtn');
if (installLater) installLater.addEventListener('click', () => { LS.set('asly_install_dismissed', true); hideInstallCard(); });
const installAppBtn = $('#installAppBtn');
if (installAppBtn) installAppBtn.addEventListener('click', () => { LS.set('asly_install_dismissed', false); installApp(); });
// أزرار Veo
const liteBtn = $('#veoLiteBtn');
if (liteBtn) liteBtn.addEventListener('click', () => requestVeo('lite'));
const fastBtn = $('#veoFastBtn');
if (fastBtn) fastBtn.addEventListener('click', () => requestVeo('fast'));
// إعادة جولة التعريف من الإعدادات
const wizAgain = $('#showWizardAgain');
if (wizAgain) wizAgain.addEventListener('click', () => showWizard());

/* Test hooks for automated verification (not part of the UI) */
window.__asly = {
  config: CONFIG,
  version: '1.9.1-asly',
  state: () => ({ caps: usageToday(), bonus: bonusBalance(), remaining: videosRemaining(), streak: currentStreak(), level: levelFor(stats().totalVideos), chatCount: chatHistory().length, device: deviceId(), refCode: myRefCode(), credits: veoCredits(), mode: appMode(), wheelCanSpin: canSpinWheel(), badges: stats().badges || [], pro: isPro(), chatRemaining: chatRemaining(), previewsRemaining: previewsRemaining() }),
  applyAdsVisibility,
  hasRealAds,
  filterCheck,
  translatePromptToEnglish,
  watermarkImageBlob,
  shareCaption,
  weeklyChallenge,
  appMode,
  setAppMode,
  autoStyleFor,
  showWizard,
  hideWizard,
  wizardState: () => ({ ...wiz }),
  spinWheel,
  veoCredits,
  addVeoCredits,
  veoEnabled,
  renderVeoCard,
  renderPoolStatus,
  watchAdsForVideo,
  adProgress,
  videosRemaining,
  requestVeo,
  listArabicVoices,
  // خطافات الميزات الجديدة (v1.3)
  writeScript,
  startMusic,
  stopMusic,
  musicState: () => (musicCtx ? musicCtx.state : 'off'),
  loadPrompts, renderPromptLibrary, useLibraryPrompt, copyLibraryPrompt,
  dailyPrompt: (kind, date) => { const p = dailyPrompt(kind, date ? new Date(date) : new Date()); return p ? { id: p.id, text: p.text_ar, text_en: p.text_en } : null; },
  dailySetIds: (kind, cat, date) => dailyLibrarySet(kind, cat || 'all', date ? new Date(date) : new Date()).map(p => p.id),
  promptStats: () => ({ total: PROMPTS_DATA.prompts.length, video: PROMPTS_DATA.prompts.filter(p => p.kind === 'video').length, image: PROMPTS_DATA.prompts.filter(p => p.kind === 'image').length, blocked: PROMPTS_DATA.prompts.filter(p => !filterCheck(p.text_ar).ok).length, seasons: [...new Set(PROMPTS_DATA.prompts.map(p => p.season))], trends: PROMPTS_DATA.prompts.filter(p => p.trend).length }),
  // خطافات المكتبة v3 + برو + الربح (v1.9)
  seasonNow, todaysTrends, previewsRemaining, previewIsFree, ensurePreview, getCachedPreview,
  isPro, activatePro, deactivatePro, renderPro, watchSingleAd, chatRemaining, previewsUsedToday, deviceId,
  promptText: (id) => { const p = PROMPTS_DATA.prompts.find(x => x.id === id); return p ? { ar: p.text_ar, en: p.text_en, season: p.season, category: p.category, kind: p.kind } : null; },
  MUSIC_MOODS,
  captionChunks,
  renderSponsors: (data) => { SPONSORS_DATA = data; renderSponsorCard(); renderTemplates(); return activeSponsors(); },
  advertiseLink,
  openAdvertise,
  loadSponsors,
  processPendingVeo,
  remixVideo,
  renderChat,
  renderVideo,
  // خطافات لوحة الرصيد (v1.4)
  moneyStats,
  renderMoneyDashboard,
  // خطافات وضع فيو والاشتراك (v1.5)
  veoMode,
  veoModeInfo,
  isVeoSubscribed,
  setSubscribed,
  startSubscription,
  refreshVeoMode,
  // خطافات التثبيت والإعلانات والروابط التابعة (v1.6)
  installApp,
  showInstallCard,
  hideInstallCard,
  installPromptAvailable: () => !!deferredInstallPrompt,
  applyAdsenseVisibility,
  hasRealAdsense,
  renderAffiliates,
  affiliateForPrompt,
  renderResultAffiliate,
  setAffiliatesForTest: (d) => { AFFILIATES_DATA = d; renderAffiliates(); renderYoutubeBtn(); },
  generateTestVideo: async (opts) => {
    const prompt = (opts && opts.prompt) || 'رجل خشبي صغير يفتح باور بانك';
    const apiPrompt = await translatePromptToEnglish(prompt);
    const duration = (opts && opts.duration) || 8;
    const aspect = (opts && opts.aspect) || 'portrait';
    const sizes = { portrait: { w: 720, h: 1280 }, square: { w: 720, h: 720 }, wide: { w: 1280, h: 720 } };
    const size = sizes[aspect] || sizes.portrait;
    const images = [];
    for (let i = 0; i < 3; i++) {
      const blob = await loadImageBlob(imageUrlFor(apiPrompt, selectedStyle, i, 12345 + i * 7919));
      images.push(await blobToImage(blob));
    }
    const out = await renderVideo(images, duration, prompt, 'none', {
      w: size.w, h: size.h,
      captions: !(opts && opts.captions === false),
      music: (opts && opts.music) || 'none',
    });
    const rec = { id: uid(), prompt, style: selectedStyle, duration, aspect, mime: out.mime, musicInVideo: !!out.musicIncluded, ext: mimeExt(out.mime), createdAt: new Date().toISOString(), blob: out.blob };
    window.__asly.lastVideo = rec;
    return { ...out, width: size.w, height: size.h, record: rec };
  },
  generateTestImage: async (opts) => {
    const prompt = (opts && opts.prompt) || 'غروب شمس فوق النيل';
    const apiPrompt = await translatePromptToEnglish(prompt);
    const blob = await loadImageBlob(imageUrlForSingle(apiPrompt, 'cinematic', 'portrait', 777));
    return { blob, size: blob.size, type: blob.type };
  },
  listArabicVoices,
};
