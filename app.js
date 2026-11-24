'use strict';
/* =====================================================================
   علم ينتفع به — دار القرآن الكريم: تعلّم القرآن والتجويد والحديث والسلوكيات (نسخة مجانية 100% — بلا خادم)
   كل شيء يعمل على جهاز المستخدم. لا مفاتيح، لا بطاقات، لا مدفوعات.
   المحرك المجاني: Pollinations (محادثة المعلم).
   ===================================================================== */
const CONFIG = {
  appName: 'علم ينتفع به',
  textUrl: 'https://text.pollinations.ai/openai/chat/completions',
  chatModel: 'openai',                 // GPT-OSS 20B — النموذج المجاني الوحيد في المسار المجهول
  minIntervalMs: 46000,                // Pollinations المجاني: طلب واحد كل 45 ثانية تقريباً
  caps: { chatPerDay: 20, chatAdBundle: 5 },
  // --- AdMob: معرّفات حقيقية — تُدار من الكود فقط، ولا تظهر للمستخدم أبداً ---
  admob: {
    appId: 'ca-app-pub-9117972626650086~8368459382', // AdMob App ID الحقيقي (تطبيق علم ينتفع به — أندرويد)
    rewardedUnitId: 'ca-app-pub-9117972626650086/3449185524', // وحدة علم ينتفع به rewarded الحقيقية
    bannerUnitId: 'ca-app-pub-9117972626650086/9739261706', // وحدة علم ينتفع به Banner الحقيقية
  },
  // --- AdSense (نسخة الويب): يُملأ بعد موافقة AdSense — معرّف الناشر + الشريحة ---
  adsense: {
    clientId: '', // مثال: ca-pub-5356390506906623
    slotId: '',   // مثال: 1234567890
  },
  geminiModel: 'gemini-2.5-flash',
  geminiUrl: m => `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent`,
  // --- تسجيل الدخول بجوجل (OAuth 2.0) — بديل لصق مفتاح Gemini ---
  // زرار «سجّل دخول بجوجل» يفتح موافقة Google مرة واحدة؛ التوكن يُحفظ على
  // جهاز المستخدم فقط. القيمتان غير موجودتين بعد — أنشئهما روني مرة واحدة
  // من حساب Google (دليل GOOGLE_OAUTH_SETUP.md — مجاني، بدون بطاقة) ثم
  // ضعهما هنا. حتى ذلك الحين زر الدخول يظهر «بيتجهز» ولا يعمل دخولاً وهمياً.
  // الصدق: حصة Gemini API «لكل مشروع» لا «لكل مستخدم» — كل مستخدمي التطبيق
  // يتشاركون حصة هذا المشروع؛ التطبيق يوضح ذلك للمستخدم ويوجّهه للوضع
  // المجاني عند نفادها. لا يُشحَن أي سر داخل التطبيق أبداً.
  googleOAuth: {
    clientId: '861564155318-a6gc16lfql2jah6ijcdpufpm904efb0a.apps.googleusercontent.com',
    projectId: 'lyra-515316',
  },
  // --- رقم واتساب للإعلانات المباشرة (ملف sponsors.json هو المصدر الأول) ---
  // ضع رقم روني هنا بصيغة دولية بدون + (مثال: 201001234567).
  // حتى يملأه روني، زر «أعلن معنا» يشرح ذلك ولا يفتح رابطاً مكسوراً.
  advertiseWhatsapp: '20XXXXXXXXXX',
};
/* =====================================================================
   تسجيل الدخول بجوجل (OAuth 2.0) — بديل لصق مفتاح Gemini (v1.13.0)
   الفكرة: زرار «سجّل دخول بجوجل» → موافقة Google مرة واحدة → توكن وصول
   قصير العمر يُحفظ على جهاز المستخدم فقط → كل طلبات Gemini تُرسَل به
   (Authorization: Bearer + x-goog-user-project) بدل لصق مفتاح API.
   الصدق أولاً (يُعرض في التطبيق نفسه): حصة Gemini API تُحسب «لكل مشروع»
   لا «لكل مستخدم» — كل مستخدمي التطبيق يتشاركون حصة مشروع Google Cloud
   الخاص بروني. عند نفادها تظهر رسالة ودودة ويبقى الوضع المجاني يعمل.
   الإعداد: العميل (client ID) والمشروع (project ID) غير موجودين بعد —
   يُنشئهما روني مرة واحدة من حساب Google (دليل GOOGLE_OAUTH_SETUP.md).
   حتى ذلك الحين زر الدخول يظهر «بيتجهز» ولا يعمل دخولاً وهمياً أبداً.
   الأمان: لا يُشحَن أي سر داخل التطبيق؛ التوكن قصير العمر ويُحفظ
   على الجهاز فقط، ولا يُسجَّل في أي سجل (logs).
   ===================================================================== */
const GOOGLE_OAUTH_SCOPES = 'openid email profile https://www.googleapis.com/auth/cloud-platform';
const GOOGLE_TOKEN_KEY = 'darquran_google_token';
const GOOGLE_QUOTA_EXHAUSTED_MSG = '⏳ الحصة المشتركة من Google خلصت النهاردة — جرّب تاني بكرة، أو استخدم الوضع المجاني (Pollinations) دلوقتي';
function googleOAuthConfigured() {
  const c = CONFIG.googleOAuth || {};
  const looksPlaceholder = v => !v || /PASTE|XXXX|example/i.test(v);
  return !looksPlaceholder(c.clientId) && !looksPlaceholder(c.projectId);
}
function googleStoredToken() {
  try { return LS.get(GOOGLE_TOKEN_KEY, null); } catch (e) { return null; }
}
function googleSignedIn() {
  const t = googleStoredToken();
  return !!(t && t.access_token && t.expires_at && t.expires_at - Date.now() > 5 * 60 * 1000);
}
function googleAccountLabel() {
  const t = googleStoredToken();
  if (!t) return '';
  return t.name ? `${t.name}${t.email ? ' (' + t.email + ')' : ''}` : (t.email || 'حساب Google');
}
function clearGoogleToken() {
  try { LS.set(GOOGLE_TOKEN_KEY, null); } catch (e) { /* تجاهل */ }
  renderGoogleAuthUI();
}
/* تحميل مكتبة Google Identity Services عند الحاجة فقط (لا تُحمَّل لكل الزوار). */
let _gisPromise = null;
function loadGoogleIdentity() {
  if (window.google && window.google.accounts && window.google.accounts.oauth2) return Promise.resolve();
  if (_gisPromise) return _gisPromise;
  _gisPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true; s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('تعذّر تحميل خدمة تسجيل دخول Google — تحقق من الإنترنت وحاول مجدداً'));
    document.head.appendChild(s);
  });
  return _gisPromise;
}
let _googleTokenClient = null;
function requestGoogleAccessToken(opts = {}) {
  return loadGoogleIdentity().then(() => new Promise((resolve, reject) => {
    if (!_googleTokenClient) {
      _googleTokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CONFIG.googleOAuth.clientId,
        scope: GOOGLE_OAUTH_SCOPES,
        callback: () => {},
        error_callback: () => {},
      });
    }
    const client = _googleTokenClient;
    client.callback = (resp) => {
      if (resp && resp.access_token) {
        const rec = { access_token: resp.access_token, expires_at: Date.now() + (Number(resp.expires_in || 3600) * 1000), email: '', name: '' };
        LS.set(GOOGLE_TOKEN_KEY, rec);
        renderGoogleAuthUI();
        fetchGoogleProfile(rec.access_token);
        resolve(rec);
      } else {
        reject(new Error('لم يكتمل تسجيل الدخول — حاول مرة أخرى'));
      }
    };
    client.error_callback = (err) => {
      reject(new Error('تعذّر تسجيل الدخول بجوجل — ' + ((err && (err.message || err.error)) || 'حاول مرة أخرى')));
    };
    try { client.requestAccessToken({ prompt: opts.prompt || 'consent' }); }
    catch (e) { reject(e); }
  }));
}
/* اسم/إيميل الحساب للعرض فقط — فشلها لا يمنع الدخول. */
async function fetchGoogleProfile(token) {
  try {
    const res = await fetch('https://openidconnect.googleapis.com/v1/userinfo', { headers: { Authorization: 'Bearer ' + token } });
    if (!res.ok) return;
    const j = await res.json();
    const rec = googleStoredToken();
    if (rec && rec.access_token === token) {
      rec.email = j.email || ''; rec.name = j.name || '';
      LS.set(GOOGLE_TOKEN_KEY, rec);
      renderGoogleAuthUI();
    }
  } catch (e) { /* العرض فقط — تجاهل */ }
}
/* يرجع توكن صالحاً، أو null. interactive=true يفتح نافذة الموافقة (من نقرة فقط). */
async function ensureGoogleToken(opts = {}) {
  const stored = googleStoredToken();
  if (stored && stored.access_token && stored.expires_at && stored.expires_at - Date.now() > 5 * 60 * 1000) return stored.access_token;
  if (!googleOAuthConfigured()) return null;
  if (stored && stored.access_token) {
    try { const rec = await requestGoogleAccessToken({ prompt: '' }); return rec.access_token; }
    catch (e) { return null; }
  }
  if (opts.interactive) {
    const rec = await requestGoogleAccessToken({ prompt: 'consent' });
    return rec.access_token;
  }
  return null;
}
async function googleSignIn() {
  if (!googleOAuthConfigured()) { toast('⏳ تسجيل الدخول بجوجل لسه بيتجهز — صاحب التطبيق بيكمّل الإعداد (مرة واحدة)'); return false; }
  try {
    await requestGoogleAccessToken({ prompt: 'consent' });
    toast('✅ تم تسجيل دخولك بجوجل — الوضع الذكي مفعّل');
    return true;
  } catch (err) {
    console.warn('[google-auth]', err && err.message);
    toast('⚠️ ' + (err.message || 'تعذّر تسجيل الدخول — حاول مرة أخرى'));
    return false;
  }
}
async function googleSignOut() {
  const t = googleStoredToken();
  try {
    if (t && t.access_token && window.google && window.google.accounts && window.google.accounts.oauth2) {
      google.accounts.oauth2.revoke(t.access_token, () => {});
    }
  } catch (e) { /* تجاهل */ }
  clearGoogleToken();
  toast('تم تسجيل خروجك من Google — رجعت للوضع المجاني');
}
/* مصادقة Gemini: توكن Google أولاً، ثم مفتاح متقدم، ثم خطأ ودود. */
async function getGeminiAuth(opts = {}) {
  const token = await ensureGoogleToken(opts);
  if (token) return { via: 'oauth', token };
  const key = (settings().geminiKey || '').trim();
  if (key) return { via: 'key', key };
  const err = new Error('سجّل دخولك بجوجل أولاً من زر «سجّل دخول بجوجل» — بدون لصق أي مفتاح');
  err.code = 'NO_GEMINI_AUTH';
  throw err;
}
/* طلب Gemini واحد بالمصادقة الصحيحة + ترجمة أخطاء HTTP لرسائل عربية ودودة. */
async function geminiFetch(url, options = {}, authOpts = {}) {
  const auth = await getGeminiAuth(authOpts);
  const headers = { ...(options.headers || {}) };
  let fullUrl = url;
  if (auth.via === 'oauth') {
    headers.Authorization = 'Bearer ' + auth.token;
    headers['x-goog-user-project'] = CONFIG.googleOAuth.projectId;
  } else {
    fullUrl = url + (url.includes('?') ? '&' : '?') + 'key=' + encodeURIComponent(auth.key);
  }
  let res = await fetch(fullUrl, { ...options, headers });
  if (res.status === 401 && auth.via === 'oauth') {
    clearGoogleToken();
    const token2 = await ensureGoogleToken({ interactive: false });
    if (token2) {
      headers.Authorization = 'Bearer ' + token2;
      res = await fetch(fullUrl, { ...options, headers });
    }
  }
  if (!res.ok) {
    const t = await res.text().catch(() => '');
    if (res.status === 401) throw new Error('انتهت جلسة دخول Google — سجّل دخولك مرة أخرى من زر «سجّل دخول بجوجل»');
    if (res.status === 403) throw new Error('حساب Google هذا غير مصرّح له بعد — تأكد من إضافته في إعدادات التطبيق (دليل الإعداد) أو جرّب حساباً آخر');
    if (res.status === 429) throw new Error(GOOGLE_QUOTA_EXHAUSTED_MSG);
    if (res.status === 400) throw new Error('طلب غير صحيح من Google — جرّب وصفاً آخر');
    throw new Error('Google: HTTP ' + res.status + ' ' + t.slice(0, 120));
  }
  return res;
}
/* تحديث كل أزرار/حالات تسجيل الدخول بجوجل في التطبيق (شات + صور + من صورة + إعدادات). */
function renderGoogleAuthUI() {
  const configured = googleOAuthConfigured();
  const signedIn = googleSignedIn();
  const label = googleAccountLabel();
  document.querySelectorAll('[data-google-signin]').forEach(btn => {
    // زر الدخول الوحيد في الهيدر — يبقى قابلاً للنقر حتى قبل اكتمال إعداد
    // OAuth: النقرة تعرض تنبيه الإعداد (googleSignIn) بدل زر معطّل بلا رد.
    btn.disabled = false;
    if (!signedIn) btn.innerHTML = configured
      ? '<span class="g-mark">G</span> <span class="gsi-full">سجّل دخول بجوجل</span><span class="gsi-short">دخول</span>'
      : '<span class="g-mark">G</span> <span class="gsi-full">تسجيل الدخول — بيتجهز…</span><span class="gsi-short">بيتجهز…</span>';
    btn.classList.toggle('hidden', signedIn);
  });
  document.querySelectorAll('[data-google-signout]').forEach(btn => {
    btn.classList.toggle('hidden', !signedIn);
  });
  document.querySelectorAll('[data-google-account]').forEach(el => {
    el.textContent = signedIn ? ('مسجّل دخول ✓ ' + label) : '';
    el.classList.toggle('hidden', !signedIn);
  });
  document.querySelectorAll('[data-google-setup-note]').forEach(el => {
    el.classList.toggle('hidden', configured || signedIn);
  });
  const st = $('#googleAuthStatus');
  if (st) {
    st.textContent = signedIn ? ('مسجّل دخول بجوجل ✓ ' + label)
      : !configured ? '⏳ تسجيل الدخول بجوجل لسه بيتجهز — صاحب التطبيق بيكمّل الإعداد (مرة واحدة، مجاناً).'
      : 'مش مسجّل دخول — دوس الزر وسجّل بحساب Google، وبعدها اسأل المعلم على طول من غير أي مفتاح.';
  }
  const act = $('#chatSmartActivate');
  if (act) act.classList.toggle('hidden', !(signedIn && (settings().chatProvider || 'pollinations') !== 'gemini'));
  renderChatEngine();
}
/* ---------------- الترفيه: ترند، تحدي اليوم، نصائح يومية ---------------- */
const TIPS_CHAT = [
  'اسألني عن أي حكم تجويد — أشرحه لك ببساطة مع مثال.',
  'ممكن تسألني: ما معنى آية…؟ وأنا أشرحها لك.',
  'لو عايز خطة حفظ لجزء عمّ، اسألني وأنا أرتّبها معك!',
];
const TIPS_SETTINGS = [
  'الإعلانات عندنا بمزاجك — تشاهدها لما تحب، ومفيش إعلان إجباري أبداً.',
  'تسجيل دخولك بجوجل اختياري — التطبيق شغال ببلاش من غيره.',
  'خد نص الدعوة للتطبيق من هنا وشاركه مع من تحب.',
];
const LEVELS = [
  [0, '🌱 مبتدئ'], [3, '📖 مواظب'], [10, '⭐ مجتهد'], [25, '🌟 حافظ'], [37, '👑 خاتم جزء عمّ'],
];
const MILESTONES = { 3: 1, 7: 2, 14: 3, 30: 5 }; // سلسلة أيام متتالية — المكافأة: +5 رسائل «اسأل المعلم» عند كل محطة

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
const REFUSAL = 'عذراً، الطلب ده مش مناسب لتطبيق علم ينتفع به 🙂';
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
  return all[todayKey()] || { chat: 0 };
}
function bumpUsage(kind) {
  const all = LS.get('asly_usage', {});
  const d = todayKey();
  all[d] = all[d] || { chat: 0 };
  all[d][kind] = (all[d][kind] || 0) + 1;
  LS.set('asly_usage', all);
  updateCapsBadge();
}
function extraBonus() { return LS.get('asly_bonus_extra', { chat: 0 }); }
function bonusChat() { return extraBonus().chat || 0; }
function addChatBonus(n, why) {
  const b = extraBonus(); b.chat = (b.chat || 0) + n; LS.set('asly_bonus_extra', b);
  updateCapsBadge();
  if (why) toast(`🎁 +${n} رسائل محادثة — ${why}`);
}
function chatRemaining() {
  return Math.max(0, CONFIG.caps.chatPerDay - (usageToday().chat || 0) + bonusChat());
}
function updateCapsBadge() {
  const cr2 = chatRemaining();
  $('#capChat').textContent = `${cr2}/${CONFIG.caps.chatPerDay}`;
  const cr = $('#chatRemaining');
  if (cr) cr.textContent = `• باقي لك ${cr2} رسايل مجانية النهاردة`;
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
    // Quran app: streak milestones grant +5 «اسأل المعلم» messages, not video credits
    if (typeof addChatBonus === 'function') addChatBonus(5, `سلسلة ${s.streak} أيام متتالية! 🔥`);
  }
  if (s.streak >= 7) awardBadge('streak7', '🔥 7 أيام متتالية');
  LS.set('asly_streak', s);
  updateStreakBadge();
}
function updateStreakBadge() { const el = $('#streakBadge'); if (el) el.textContent = currentStreak(); }
function stats() { return LS.get('asly_stats', { totalChats: 0, badges: [] }); }
function saveStats(s) { LS.set('asly_stats', s); }
function levelFor(n) {
  let label = LEVELS[0][1];
  for (const [min, l] of LEVELS) if (n >= min) label = l;
  return label;
}
function darLessonsDoneCount() { try { return (typeof darGetLesson === 'function') ? (darGetLesson().done || []).length : 0; } catch (e) { return 0; } }
function updateLevelBadge() { const el = $('#levelBadge'); if (el) el.textContent = levelFor(darLessonsDoneCount()); }
function awardBadge(id, label) {
  const s = stats();
  if ((s.badges || []).includes(id)) return;
  s.badges = [...(s.badges || []), id];
  saveStats(s);
  toast(`🏅 وسام جديد: ${label}!`);
}
/* الأوسمة الممنوحة في التطبيق — تُحفظ على الجهاز (لا توجد صفحة عرض لها بعد) */
const BADGE_DEFS = [
  ['firstChat', '💬 أول محادثة'],
  ['streak7', '🔥 7 أيام متتالية'],
];
const DAR_QURAN_TABS = ['quran', 'lesson', 'journey', 'tajweed', 'hadith', 'exercises'];
function darShowQuranSubnav(show) {
  const sn = document.getElementById('quranSubnav');
  if (sn) sn.classList.toggle('hidden', !show);
  if (show) {
    const active = document.querySelector('.tab-pane.active');
    const cur = active ? active.id.replace('tab-', '') : 'quran';
    document.querySelectorAll('#quranSubnav .subtab').forEach(function (b) {
      b.classList.toggle('active', b.dataset.tab === cur);
    });
  }
}
function darSwitchPane(tab) {
  if (typeof darJrnCleanup === 'function') darJrnCleanup(); // مغادرة درس الرحلة = حذف التسجيل المؤقت
  document.querySelectorAll('.tab-pane').forEach(function (x) { x.classList.remove('active'); });
  const pane = document.getElementById('tab-' + tab);
  if (pane) pane.classList.add('active');
  window.scrollTo(0, 0);
  darShowQuranSubnav(DAR_QURAN_TABS.indexOf(tab) !== -1);
  if (tab === 'lesson' && typeof darEnsureLesson === 'function') darEnsureLesson();
  if (tab === 'journey' && typeof darEnsureJourney === 'function') darEnsureJourney();
  if (tab === 'manners' && typeof darEnsureManners === 'function') darEnsureManners();
  if (tab === 'exercises' && typeof darEnsureExercises === 'function') darEnsureExercises();
  if (tab === 'home' && typeof darEnsureHome === 'function') darEnsureHome();
  if (tab === 'home' && typeof darJourneyHomeCard === 'function') darJourneyHomeCard();
}
$$('.tab').forEach(function (b) { b.addEventListener('click', function () {
  $$('.tab').forEach(function (x) { x.classList.remove('active'); });
  b.classList.add('active');
  darSwitchPane(b.dataset.tab);
}); });
$$('.subtab').forEach(function (b) { b.addEventListener('click', function () {
  document.querySelectorAll('#quranSubnav .subtab').forEach(function (x) { x.classList.remove('active'); });
  b.classList.add('active');
  // يبقى زر «قسم القرآن» العلوي مفعّلاً أثناء التنقل داخل القسم
  const top = document.querySelector('.tab[data-tab="quran"]');
  if (top) { $$('.tab').forEach(function (x) { x.classList.remove('active'); }); top.classList.add('active'); }
  darSwitchPane(b.dataset.tab);
}); });

/* ---------------- Settings ---------------- */
function loadSettings() {
  const s = LS.get('asly_settings', {});
  if (s.geminiKey) $('#geminiKey').value = s.geminiKey;
  if (s.userName) $('#userName').value = s.userName;
  if (s.chatProvider) {
    const r = document.querySelector(`input[name="chatProvider"][value="${s.chatProvider}"]`);
    if (r) r.checked = true;
  }
}
function saveSettings(showMsg = true) {
  LS.set('asly_settings', {
    geminiKey: $('#geminiKey').value.trim(),
    userName: $('#userName').value.trim(),
    chatProvider: (document.querySelector('input[name="chatProvider"]:checked') || {}).value || 'pollinations',
  });
  applyAdsVisibility();
  applyAdsenseVisibility();
  renderGoogleAuthUI();
  if (showMsg) toast('✅ تم حفظ الإعدادات على جهازك');
}
$('#saveSettings').addEventListener('click', () => saveSettings());
function settings() {
  // معرّفات AdMob/AdSense: من الكود (CONFIG) أولاً، ثم أي قيمة محفوظة قديماً.
  // (معرّفات AdMob الحقيقية في CONFIG تكفي — لا حاجة لأي حفظ يدوي.)
  const s = LS.get('asly_settings', {});
  return { ...s,
    admobAppId: CONFIG.admob.appId,
    admobRewardedId: CONFIG.admob.rewardedUnitId,
    admobBannerId: CONFIG.admob.bannerUnitId,
    adsenseClientId: CONFIG.adsense.clientId || s.adsenseClientId || '',
    adsenseSlotId: CONFIG.adsense.slotId || s.adsenseSlotId || '' };
}

/* ---------------- P5: نسخة احتياطية من التقدّم (تصدير/استيراد) ---------------- */
// Progress lives ONLY on this device (localStorage). Export downloads one
// JSON file with everything; import restores it. The Google sign-in token
// is NOT exported (short-lived — sign in again on the new device), and the
// device id is NOT exported either (each device keeps its own).
const DAR_PROGRESS_KEYS = [
  'asly_settings', 'asly_streak', 'asly_stats', 'asly_usage', 'asly_bonus_extra',
  'asly_install_dismissed', 'dar_textsize', 'darquran_chats', 'asly_chat',
  'darquran_lesson', 'darquran_mem', 'darquran_manners_done', 'darquran_reciter',
  'darquran_hard_words',
];
function darExportProgress() {
  const data = { app: 'علم ينتفع به', version: '2.0.0', exportedAt: new Date().toISOString(), progress: {} };
  for (const k of DAR_PROGRESS_KEYS) {
    try { const v = localStorage.getItem(k); if (v !== null) data.progress[k] = JSON.parse(v); } catch (e) {}
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const stamp = new Date().toISOString().slice(0, 10);
  downloadBlob(blob, `ilm-yantaf3-bihi-backup-${stamp}.json`);
  toast('💾 تم تنزيل نسخة احتياطية من تقدّمك');
  return data;
}
async function darImportProgress(obj) {
  if (!obj || typeof obj !== 'object' || !obj.progress || typeof obj.progress !== 'object') {
    toast('⚠️ ملف غير صالح — اختر ملف النسخة الاحتياطية الصحيح');
    return false;
  }
  let n = 0;
  for (const k of DAR_PROGRESS_KEYS) {
    if (Object.prototype.hasOwnProperty.call(obj.progress, k)) {
      try { localStorage.setItem(k, JSON.stringify(obj.progress[k])); n++; } catch (e) {}
    }
  }
  if (!n) { toast('⚠️ الملف لا يحتوي أي تقدّم معروف'); return false; }
  loadSettings();
  initTextSize();
  updateCapsBadge();
  renderChat(); renderChatList(); renderChatEngine();
  toast(`✅ تم استرجاع تقدّمك (${n} عنصراً) — أعد تحميل الصفحة لرؤية كل شيء`);
  return true;
}

/* ---------------- Ads visibility: زر المشاهدة ظاهر دائماً (v1.10) ---------------- */
// خطأ كان يخفي حلقة الإعلانات كلها: الزر والبانر كانا يظهران فقط بعد حفظ
// معرّفات AdMob حقيقية — والمستخدم بلا معرّفات لا يجد أي إعلان أصلاً.
// الإصلاح: زر «شاهد إعلاناً» ظاهر دائماً، والإعلانات
// المعروضة بلا معرّفات موسومة بوضوح «إعلان تجريبي» داخل النافذة.
// البانر يبقى مخفياً حتى معرّف حقيقي (لا صندوق فارغ).
function hasRealAds() {
  const s = settings();
  const bad = v => !v || /X{4,}/.test(v);
  return !bad(s.admobRewardedId) && !bad(s.admobBannerId);
}
function applyAdsVisibility() {
  // التطبيق مجاني بالكامل بدعم الإعلانات: البانر يظهر فقط بمعرّف حقيقي،
  // وزر مشاهدة الإعلان (المكافأة الاختيارية) ظاهر دائماً.
  // لا إعلانات إطلاقاً على صفحات القرآن — لا يوجد عنصر بانر فيها أصلاً.
  const banner = $('#bannerAd');
  if (banner) banner.classList.toggle('hidden', !hasRealAds());
  const watch = $('#watchAdBtn');
  if (watch) watch.classList.remove('hidden');
}

/* ---------------- إعلانات الويب (AdSense) — خانة واحدة في الصفحة الرئيسية ---------------- */
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
  // البانر موجود في الصفحة الرئيسية فقط — أبداً على صفحات القرآن.
  const ins = slot ? slot.querySelector('ins.adsbygoogle') : null;
  if (ins && show) {
    ins.setAttribute('data-ad-client', settings().adsenseClientId);
    ins.setAttribute('data-ad-slot', settings().adsenseSlotId);
  }
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
      toast('✅ تم تثبيت علم ينتفع به على شاشتك 🎉');
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
  // kind: 'text' — طلب واحد كل 45 ثانية (حد Pollinations المجاني)
  const last = kind === 'image' ? lastImageAt : lastTextAt;
  let wait = Math.max(0, (last + CONFIG.minIntervalMs) - Date.now());
  if (wait > 0) {
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
      await sleep(ra * 1000 + 1000);
      continue;
    }
    if (res.status >= 500 && attempt < 2) {
      // الخدمة المجانية تتعطل أحياناً (503) — انتظر وأعد المحاولة بدل الفشل فوراً
      await sleep(20000);
      continue;
    }
    return res;
  }
  throw new Error('تعذّر الوصول بعد 3 محاولات — جرّب لاحقاً');
}

function showAdGate(adIndex = 1, adTotal = 1) {
  return new Promise(resolve => {
    const modal = $('#adModal');
    modal.classList.remove('hidden');
    const prog = $('#adProgress');
    if (prog) prog.textContent = '';
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

const POOL_LINE = '💚 مشاهدتك دي بتساعد تطوّر التطبيق وتفتح مزايا جديدة للكل';
/* ---------------- إعلان واحد (فتح رسائل محادثة إضافية) ---------------- */
// إعلان اختياري بمكافأة: مشاهدة واحدة = +5 رسائل «اسأل المعلم» (أو +10
// بمكافأة مضاعفة أحياناً 20%). لا إعلانات إجبارية في التطبيق أبداً.
async function watchSingleAd(reason) {
  const watched = await showAdGate(1, 1);
  if (!watched) return false;
  // المكافأة دائماً +5 رسائل كما يعد الإعلان — لا مضاعفة عشوائية.
  if (reason === 'chat') {
    const n = CONFIG.caps.chatAdBundle;
    addChatBonus(n, 'إعلان واحد');
    toast(`🎁 +${n} رسائل محادثة — ${POOL_LINE}`);
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



function downloadBlob(blob, filename) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}
function getAppLink() {
  try {
    const u = new URL(location.href);
    if (u.protocol.startsWith('http') && !/localhost|127\.0\.0\.1/.test(u.hostname)) return u.origin + u.pathname;
  } catch (e) {}
  return location.href.split('?')[0];
}
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
function advertiseNumber() {
  const fromCfg = String(CONFIG.advertiseWhatsapp || '');
  if (fromCfg && !/X/.test(fromCfg)) return fromCfg.replace(/\D/g, '');
  return '';
}
function advertiseLink() {
  const num = advertiseNumber();
  if (!num) return '';
  return `https://wa.me/${num}?text=${encodeURIComponent('عاوز أعلن في تطبيق علم ينتفع به')}`;
}
function openAdvertise() {
  const link = advertiseLink();
  if (!link) { toast('📢 روني لسه مضافش رقم الواتساب للإعلانات — تابعنا قريباً'); return false; }
  window.open(link, '_blank', 'noopener');
  return true;
}
let AFFILIATES_DATA = { amazonTag: '', jumiaId: '', jumiaAffiliateParam: '', youtubeUrl: '', products: [] };
async function loadAffiliates() {
  try {
    const res = await fetch('affiliates.json', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data === 'object') AFFILIATES_DATA = data;
    }
  } catch (e) { /* ملف غير متاح (file://) — القسم يبقى مخفياً */ }
  renderYoutubeBtn();
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

function renderTips() {
  const day = Math.floor(Date.now() / 864e5);
  const set = (id, arr) => { const el = $(id); if (el) el.textContent = arr[day % arr.length]; };
  set('#tipChat', TIPS_CHAT);
  set('#tipSettings', TIPS_SETTINGS);
}

/* ---------------- نص دعوة للتطبيق ---------------- */
function fillEndCard() {
  const el = $('#endCardText');
  if (!el) return;
  el.value = `🕌 جرّب تطبيق «علم ينتفع به» — دار القرآن الكريم: تعلّم القرآن والتجويد والحديث والسلوكيات من مصادر موثوقة:\n${getAppLink()}\n📘 وتابع صفحة «أصلى مش مضروب» على فيسبوك:\nhttps://facebook.com/people/أصلى-مش-مضروب/61571405720824/`;
}
$('#copyEndCard').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText($('#endCardText').value); toast('📋 تم نسخ نص الدعوة'); }
  catch (e) { toast('⚠️ انسخ النص يدوياً'); }
});

/* ---------------- Gallery ---------------- */
function escapeHtml(s) {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/* ---------------- Chat v2 — ChatGPT-style ---------------- */
/* محادثات متعددة (localStorage) + بث حي + ماركداون + نسخ/إعادة/تعديل.
   المحرك الافتراضي المجاني Pollinations (بلا دخول)؛ الوضع الذكي الأعلى
   بتسجيل دخول بجوجل (Gemini 2.5 Flash) — أو مفتاح متقدم من الإعدادات.
   بصراحة: لا ذاكرة بين المحادثات، ولا بحث حي على الإنترنت، ولا تحليل
   ملفات — الإجابات من النموذج وسياق المحادثة الحالية فقط. */
const CHAT_SYSTEM = `أنت «المعلم»، معلم قرآن وتجويد وحديث نبوي في تطبيق «علم ينتفع به»، تتحدث العربية بلهجة مصرية خفيفة وواضحة (وبالفصحى المبسطة عندما يُطلب ذلك).
أسلوبك:
- إجابات منظمة وخطوة بخطوة: عناوين قصيرة، قوائم مرقّمة، وخلاصة في النهاية عند الحاجة.
- اشرح معنى الآيات وأحكام التجويد والحديث بأسلوب مبسط يناسب المبتدئ، واذكر دائماً أن النص الكامل موجود في تبويب «القرآن الكريم» في التطبيق.
- إن كان الطلب غامضاً، اسأل سؤالاً توضيحياً واحداً محدداً بدل التخمين.
- إن أخطأ المستخدم في معلومة، صحّحه بلطف واذكر الصحيح.
- ركّز على المطلوب فقط — بلا حشو ولا مقدمات طويلة.
- التزم بالمحتوى المحترم فقط: ارفض بلطف أي طلب جنسي أو عنيف أو مسيء أو متعلق بالأطفال بشكل غير لائق.
- أجب بالعربية دائماً ما لم يطلب المستخدم لغة أخرى.
- شجّع المتعلم بلطف على المحاولة، واثنِ على الجهد لا على الذكاء — ولا تستخدم ألقاباً مثل «عبقري» أو «شاطر».
قاعدة صارمة لا استثناء فيها — اقرأها جيداً:
- لا تنقل أبداً أي آية قرآنية أو حديث نبوي أو بيت من متن تحفة الأطفال من ذاكرتك، لا كاملاً ولا جزئياً، ولا بالمعنى الحرفي — حتى لو طلب المستخدم ذلك صراحة.
- إذا سُئلت عن نص آية أو حديث أو بيت من المتن، قل بوضوح: «النص الموثوق موجود في تبويب القرآن الكريم في التطبيق — افتح السورة أو الكتاب هناك واقرأه من المصدر»، ثم اشرح المعنى أو الحكم بكلامك أنت فقط دون نقل النص.
- لا تخترع أرقام آيات أو أحاديث أو أسانيد أو درجات صحة — إن لم يكن عندك مصدر معتمد داخل التطبيق للسؤال، قل حرفياً: «لا أعلم — لا يوجد مصدر معتمد عندي لهذا السؤال».
- لا تستخدم أي صوت آلي لقراءة القرآن أو الحديث — المحادثة نصية فقط.
حدودك (قلها بصراحة إن سُئلت): لا ذاكرة بين المحادثات، ولا بحث حي على الإنترنت، ولا تحليل ملفات، ولا نقل نصوص دينية من الذاكرة — النصوص في التطبيق فقط.`;
const CHAT_CONTEXT_MSGS = 20; // آخر 20 رسالة تُرسَل للنموذج (سياق أطول لمتابعة «وكمل» و«اشرح أكتر»)
const CHAT_EXAMPLES = [
  'اشرح لي حكم الإخفاء في النون الساكنة',
  'ما معنى آية «إياك نعبد وإياك نستعين» في سورة الفاتحة؟',
  'كيف أبدأ حفظ جزء عمّ؟',
  'ما الفرق بين المد المتصل والمد المنفصل؟',
];

/* ----- مخزن المحادثات المتعددة ----- */
function chatStore() {
  let s = LS.get('darquran_chats', null);
  if (!s || !Array.isArray(s.chats)) {
    s = { chats: [], activeId: null };
    const legacy = LS.get('asly_chat', []);
    if (Array.isArray(legacy) && legacy.length) {
      const firstUser = legacy.find(m => m.role === 'user');
      s.chats.push({ id: uid(), title: firstUser ? chatTitleFor(firstUser.text) : 'محادثة قديمة', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), messages: legacy.slice(-100) });
    }
    if (!s.chats.length) s.chats.push({ id: uid(), title: 'محادثة جديدة', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), messages: [] });
    s.activeId = s.chats[0].id;
    LS.set('darquran_chats', s);
  }
  return s;
}
function saveChatStore(s) { LS.set('darquran_chats', s); }
function activeChat() {
  const s = chatStore();
  let c = s.chats.find(x => x.id === s.activeId);
  if (!c) { c = s.chats[0]; if (c) s.activeId = c.id; }
  return c || null;
}
function chatTitleFor(text) { const t = String(text || '').trim().replace(/\s+/g, ' '); return t.length > 28 ? t.slice(0, 28) + '…' : (t || 'محادثة جديدة'); }
/* توافقية: chatHistory/saveChatHistory تعملان على المحادثة النشطة،
   وتُبقي مفتاح asly_chat القديم متزامناً (تستخدمه الفحوصات والإحصاءات). */
function chatHistory() { const c = activeChat(); return c ? c.messages : []; }
function saveChatHistory(h) {
  const s = chatStore();
  const c = s.chats.find(x => x.id === s.activeId) || s.chats[0];
  if (c) { c.messages = h.slice(-100); c.updatedAt = new Date().toISOString(); saveChatStore(s); }
  LS.set('asly_chat', h.slice(-50));
}
function newChat() {
  const s = chatStore();
  const c = { id: uid(), title: 'محادثة جديدة', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), messages: [] };
  s.chats.unshift(c); s.activeId = c.id; saveChatStore(s);
  renderChatList(); renderChat(); renderChatEngine();
  return c;
}
function switchChat(id) {
  const s = chatStore();
  if (!s.chats.some(x => x.id === id)) return false;
  s.activeId = id; saveChatStore(s);
  renderChatList(); renderChat();
  return true;
}
function renameChat(id, title) {
  const s = chatStore();
  const c = s.chats.find(x => x.id === id);
  if (!c) return false;
  const t = String(title || '').trim();
  if (!t) return false;
  c.title = t.slice(0, 60); c.updatedAt = new Date().toISOString();
  saveChatStore(s); renderChatList();
  return true;
}
function deleteChat(id) {
  const s = chatStore();
  if (s.chats.length <= 1) { toast('⚠️ لا يمكن حذف آخر محادثة — أنشئ واحدة جديدة أولاً'); return false; }
  s.chats = s.chats.filter(x => x.id !== id);
  if (s.activeId === id) s.activeId = s.chats[0].id;
  saveChatStore(s); renderChatList(); renderChat();
  return true;
}
function clearActiveChat() {
  const c = activeChat(); if (!c) return;
  c.messages = []; c.title = 'محادثة جديدة'; c.updatedAt = new Date().toISOString();
  saveChatHistory([]);
  renderChatList(); renderChat();
}

/* ----- ماركداون آمن (هروب HTML أولاً، ثم تنسيق) ----- */
const _codeRegistry = [];
function mdRender(text) {
  const src = String(text || '');
  _codeRegistry.length = 0;
  // 1) كتل الكود ```lang ... ```
  const parts = src.split(/```(\w*)\n?([\s\S]*?)```/g);
  let html = '';
  for (let i = 0; i < parts.length; i += 3) {
    html += mdInlineBlock(parts[i] || '');
    if (i + 2 < parts.length) {
      const lang = (parts[i + 1] || '').trim();
      const code = parts[i + 2] || '';
      const idx = _codeRegistry.push(code) - 1;
      html += `<pre class="code-block"><code>${escapeHtml(code)}</code><button class="copy-code" data-code-idx="${idx}" type="button">📋 نسخ الكود</button>${lang ? `<span class="code-lang">${escapeHtml(lang)}</span>` : ''}</pre>`;
    }
  }
  return html;
}
function mdInlineBlock(seg) {
  const lines = escapeHtml(seg).split('\n');
  let out = '', inList = false, para = [];
  const flushPara = () => { if (para.length) { out += `<p>${para.join('<br>')}</p>`; para = []; } };
  const flushList = () => { if (inList) { out += '</ul>'; inList = false; } };
  for (const raw of lines) {
    const line = raw.trim();
    const h = line.match(/^(#{1,3})\s+(.+)$/);
    const li = line.match(/^[-*•]\s+(.+)$/);
    const oli = line.match(/^\d+[.)]\s+(.+)$/);
    if (h) { flushPara(); flushList(); out += `<h${h[1].length + 2}>${mdInline(h[2])}</h${h[1].length + 2}>`; }
    else if (li || oli) { flushPara(); if (!inList) { out += '<ul>'; inList = true; } out += `<li>${mdInline((li || oli)[1])}</li>`; }
    else if (!line) { flushPara(); flushList(); }
    else { flushList(); para.push(mdInline(line)); }
  }
  flushPara(); flushList();
  return out;
}
function mdInline(s) {
  return s
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
}

/* ----- عرض المحادثة النشطة ----- */
function renderChat() {
  const log = $('#chatLog');
  if (!log) return;
  log.innerHTML = '';
  const hist = chatHistory();
  if (!hist.length) {
    const name = (settings().userName || '').trim();
    const greet = document.createElement('div');
    greet.className = 'msg sys';
    greet.textContent = name
      ? `أهلاً يا ${name}! 👋 أنا المعلم — معلمك في القرآن والتجويد والحديث. أشرح لك الأحكام ومعاني الآيات، وأساعدك في الحفظ خطوة بخطوة. تذكّر: النصوص الموثوقة تجدها في تبويب «القرآن الكريم». جرّب واحد من دول:`
      : 'أهلاً بيك! 👋 أنا المعلم — معلمك في القرآن والتجويد والحديث. أشرح لك الأحكام ومعاني الآيات، وأساعدك في الحفظ خطوة بخطوة. تذكّر: النصوص الموثوقة تجدها في تبويب «القرآن الكريم». جرّب واحد من دول:';
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
  hist.forEach((m, idx) => {
    const div = document.createElement('div');
    div.className = 'msg ' + (m.role === 'user' ? 'user' : m.role === 'sys' ? 'sys' : 'bot');
    div.dataset.idx = idx;
    const body = document.createElement('div');
    body.className = 'msg-body';
    if (m.role === 'assistant') body.innerHTML = mdRender(m.text);
    else body.textContent = m.text;
    div.appendChild(body);
    const acts = document.createElement('div');
    acts.className = 'msg-actions';
    if (m.role === 'user') {
      acts.innerHTML = `<button data-act="edit" type="button">✏️ تعديل</button><button data-act="copy" type="button">📋 نسخ</button><button data-act="delete" class="danger" type="button">🗑️ حذف</button>`;
    } else if (m.role === 'assistant' && m.text) {
      acts.innerHTML = `<button data-act="edit" type="button">✏️ تعديل</button><button data-act="copy" type="button">📋 نسخ</button><button data-act="regen" type="button">🔄 إعادة الإجابة</button><button data-act="delete" class="danger" type="button">🗑️ حذف</button>`;
    }
    if (acts.children.length) div.appendChild(acts);
    log.appendChild(div);
  });
  log.scrollTop = log.scrollHeight;
  updateCapsBadge();
}
function renderChatList(filter) {
  const list = $('#chatList');
  if (!list) return;
  const q = String(filter || $('#chatSearch')?.value || '').trim().toLowerCase();
  const s = chatStore();
  list.innerHTML = '';
  const shown = s.chats.filter(c => !q || c.title.toLowerCase().includes(q) || c.messages.some(m => (m.text || '').toLowerCase().includes(q)));
  if (!shown.length) { list.innerHTML = '<div class="chat-list-empty">لا توجد محادثات مطابقة</div>'; return; }
  for (const c of shown) {
    const item = document.createElement('div');
    item.className = 'chat-item' + (c.id === s.activeId ? ' active' : '');
    const firstUser = c.messages.find(m => m.role === 'user');
    item.innerHTML = `<div class="chat-item-title">${escapeHtml(c.title)}</div><div class="chat-item-sub">${escapeHtml(firstUser ? (firstUser.text || '').slice(0, 40) : 'محادثة جديدة')}</div>`;
    const row = document.createElement('div');
    row.className = 'chat-item-acts';
    const rn = document.createElement('button'); rn.type = 'button'; rn.textContent = '✏️'; rn.title = 'إعادة تسمية';
    rn.onclick = (e) => { e.stopPropagation(); const t = prompt('اسم جديد للمحادثة:', c.title); if (t != null) renameChat(c.id, t); };
    const del = document.createElement('button'); del.type = 'button'; del.textContent = '🗑️'; del.title = 'حذف';
    del.onclick = (e) => { e.stopPropagation(); if (confirm('حذف هذه المحادثة؟')) deleteChat(c.id); };
    row.appendChild(rn); row.appendChild(del);
    item.appendChild(row);
    item.onclick = () => switchChat(c.id);
    list.appendChild(item);
  }
}
function chatEngineLabel() {
  const p = settings().chatProvider || 'pollinations';
  return p === 'gemini' ? 'Gemini 2.5 Flash — الوضع الذكي الأعلى' : 'Pollinations المجاني';
}
function renderChatEngine() {
  const name = $('#chatEngineName');
  if (name) name.textContent = chatEngineLabel();
  const card = $('#chatSmartCard');
  const p = settings().chatProvider || 'pollinations';
  const toggle = $('#chatEngineToggle');
  if (toggle) toggle.textContent = p === 'gemini' ? '⭐ الوضع الذكي مفعّل — رجوع للمجاني' : '⭐ الوضع الذكي الأعلى';
  // البطاقة تظهر لتسجيل الدخول طالما الوضع الذكي مختار ولم يُسجَّل دخول بعد؛
  // وتختفي فقط بعد الدخول (الوضع الذكي يعمل فعلاً).
  if (card) card.classList.toggle('hidden', !(p === 'gemini' && !googleSignedIn()));
}
function setChatProvider(p) {
  const s = settings();
  s.chatProvider = p === 'gemini' ? 'gemini' : 'pollinations';
  LS.set('asly_settings', s);
  renderChatEngine();
}

/* ----- البث الحي (streaming) مع إيقاف ----- */
let chatAbort = null;
let chatStreaming = false;
function showChatTyping(show) {
  const log = $('#chatLog');
  if (!log) return;
  let t = log.querySelector('.msg.typing');
  if (show && !t) {
    t = document.createElement('div');
    t.className = 'msg bot typing';
    t.innerHTML = '<div class="msg-body"><span class="typing-dots"><i></i><i></i><i></i></span> المعلم بيكتب…</div>';
    log.appendChild(t);
    log.scrollTop = log.scrollHeight;
  } else if (!show && t) t.remove();
}
function updateLastBubble(partial) {
  const log = $('#chatLog');
  if (!log) return;
  const bots = log.querySelectorAll('.msg.bot:not(.typing)');
  const last = bots[bots.length - 1];
  if (last) {
    const body = last.querySelector('.msg-body');
    if (body) body.innerHTML = mdRender(partial);
    log.scrollTop = log.scrollHeight;
  }
}
async function chatPollinationsStream(messages, onToken, signal, extraSystem) {
  const res = await pollinationsFetch(CONFIG.textUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal,
    body: JSON.stringify({
      model: CONFIG.chatModel,
      messages: [{ role: 'system', content: CHAT_SYSTEM + (extraSystem ? '\n\n' + extraSystem : '') }, ...messages],
      temperature: 0.7, max_tokens: 1200, stream: true,
    }),
  }, 'text');
  if (!res.ok || !res.body) throw new Error('stream-unavailable');
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = '', out = '', sawStream = false;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const lines = buf.split('\n');
    buf = lines.pop();
    for (const line of lines) {
      const t = line.trim();
      if (!t.startsWith('data:')) continue;
      const d = t.slice(5).trim();
      if (!d || d === '[DONE]') continue;
      try {
        const j = JSON.parse(d);
        const c = (j.choices && j.choices[0] && (j.choices[0].delta?.content || j.choices[0].message?.content)) || '';
        if (c) { sawStream = true; out += c; onToken(out); }
      } catch (e) { /* سطر غير JSON — تجاهل */ }
    }
  }
  if (!sawStream) throw new Error('stream-unavailable');
  return out.trim();
}
async function chatGeminiStream(messages, onToken, signal, extraSystem) {
  const contents = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${CONFIG.geminiModel}:streamGenerateContent?alt=sse`;
  const res = await geminiFetch(url, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, signal,
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: CHAT_SYSTEM + (extraSystem ? '\n\n' + extraSystem : '') }] },
      contents,
      generationConfig: { maxOutputTokens: 1200, temperature: 0.7 },
    }),
  }, { interactive: true });
  if (!res.body) throw new Error('stream-unavailable');
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = '', out = '', sawStream = false;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const lines = buf.split('\n');
    buf = lines.pop();
    for (const line of lines) {
      const t = line.trim();
      if (!t.startsWith('data:')) continue;
      const d = t.slice(5).trim();
      if (!d || d === '[DONE]') continue;
      try {
        const j = JSON.parse(d);
        const parts = j.candidates?.[0]?.content?.parts || [];
        const c = parts.map(p => p.text || '').join('');
        if (c) { sawStream = true; out += c; onToken(out); }
      } catch (e) { /* تجاهل */ }
    }
  }
  if (!sawStream) throw new Error('stream-unavailable');
  return out.trim();
}
// رد كامل مرة واحدة (بدون بث) — يستخدمه كاتب السيناريو ورجوع البث عند الفشل.
async function chatPollinations(messages, extraSystem) {
  const res = await pollinationsFetch(CONFIG.textUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: CONFIG.chatModel,
      messages: [{ role: 'system', content: CHAT_SYSTEM + (extraSystem ? '\n\n' + extraSystem : '') }, ...messages],
      temperature: 0.7, max_tokens: 1200,
    }),
  }, 'text');
  if (!res.ok) throw new Error('تعذّر الاتصال بنموذج المحادثة (HTTP ' + res.status + ')');
  const j = await res.json();
  const text = (j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content) || '';
  if (!text.trim()) throw new Error('رد فارغ من نموذج المحادثة');
  return text.trim();
}
async function chatGemini(messages, extraSystem) {
  const contents = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));
  const res = await geminiFetch(CONFIG.geminiUrl(CONFIG.geminiModel), {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: CHAT_SYSTEM + (extraSystem ? '\n\n' + extraSystem : '') }] },
      contents,
      generationConfig: { maxOutputTokens: 1200, temperature: 0.7 },
    }),
  }, { interactive: false });
  const j = await res.json();
  const parts = j.candidates?.[0]?.content?.parts || [];
  const text = parts.map(p => p.text || '').join('');
  if (!text.trim()) throw new Error('رد فارغ من Gemini');
  return text.trim();
}
async function streamChatReply(messages, onToken, signal, extraSystem) {
  const provider = settings().chatProvider || 'pollinations';
  try {
    return provider === 'gemini'
      ? await chatGeminiStream(messages, onToken, signal, extraSystem)
      : await chatPollinationsStream(messages, onToken, signal, extraSystem);
  } catch (e) {
    if (e && (e.name === 'AbortError' || (signal && signal.aborted))) throw e;
    if (e && e.code === 'NO_GEMINI_AUTH') throw e; // بلا مصادقة لا رجوع — لا نافذة دخول ثانية
    // البث غير مدعوم هنا — رجوع للرد الكامل مرة واحدة
    return provider === 'gemini' ? await chatGemini(messages, extraSystem) : await chatPollinations(messages, extraSystem);
  }
}

/* ----- إرسال + إعادة + تعديل ----- */
async function streamReply(countUsage) {
  const hist = chatHistory();
  // P6 — RAG gate: أجب فقط من نصوص التطبيق المعتمدة. إن لم يوجد مصدر،
  // اعرض الرفض مباشرة بلا استدعاء للنموذج وبلا خصم من رصيد الرسائل.
  // سؤال متابعة بلا كلمات محتوى («اشرح أكتر») يعيد استخدام آخر سؤال له محتوى.
  let extraSystem = '';
  if (typeof darAnswerFromSources === 'function') {
    const userMsgs = hist.filter(m => m.role === 'user');
    let qText = userMsgs.length ? userMsgs[userMsgs.length - 1].text : '';
    if (typeof darRagTokens === 'function' && !darRagTokens(qText).length && userMsgs.length > 1) {
      for (let i = userMsgs.length - 2; i >= 0; i--) {
        if (darRagTokens(userMsgs[i].text).length) { qText = userMsgs[i].text; break; }
      }
    }
    if (qText) {
      showChatTyping(true);
      let rag = null;
      try { rag = await darAnswerFromSources(qText); } catch (e) { rag = null; }
      showChatTyping(false);
      if (rag && rag.refusal) {
        const h2 = chatHistory();
        h2.push({ role: 'sys', text: (typeof DAR_RAG_NO_SOURCE !== 'undefined') ? DAR_RAG_NO_SOURCE : 'لا أعلم — لا يوجد مصدر معتمد عندي لهذا السؤال' });
        saveChatHistory(h2);
        renderChat();
        return null;
      }
      if (rag && rag.passages && rag.passages.length && typeof darRagSystemBlock === 'function') {
        extraSystem = darRagSystemBlock(rag.passages);
      }
    }
  }
  const msgs = hist.filter(m => m.role !== 'sys').slice(-CHAT_CONTEXT_MSGS).map(m => ({ role: m.role, content: m.text }));
  const h2 = chatHistory();
  h2.push({ role: 'assistant', text: '' });
  saveChatHistory(h2);
  renderChat();
  showChatTyping(true);
  const stopBtn = $('#chatStop');
  if (stopBtn) stopBtn.classList.remove('hidden');
  const sendBtn = $('#chatSend');
  if (sendBtn) sendBtn.disabled = true;
  chatStreaming = true;
  const ctrl = new AbortController();
  chatAbort = ctrl;
  let full = '';
  let aborted = false;
  try {
    full = await streamChatReply(msgs, (partial) => { full = partial; showChatTyping(false); updateLastBubble(partial); }, ctrl.signal, extraSystem);
  } catch (err) {
    if (err && (err.name === 'AbortError' || ctrl.signal.aborted)) {
      aborted = true;
    } else {
      console.error(err);
      const h3 = chatHistory();
      if (h3.length && h3[h3.length - 1].role === 'assistant' && !h3[h3.length - 1].text) h3.pop();
      h3.push({ role: 'sys', text: '⚠️ ' + (err.message || 'تعذّر الاتصال — جرّب لاحقاً') });
      saveChatHistory(h3);
      renderChat();
      return null;
    }
  } finally {
    chatStreaming = false;
    chatAbort = null;
    showChatTyping(false);
    if (stopBtn) stopBtn.classList.add('hidden');
    if (sendBtn) sendBtn.disabled = false;
  }
  const h3 = chatHistory();
  const last = h3[h3.length - 1];
  if (last && last.role === 'assistant') {
    last.text = (full || last.text || '').trim();
    if (aborted && last.text) last.text += '\n\n(تم الإيقاف — الإجابة غير مكتملة)';
    if (!last.text) h3.pop();
  }
  saveChatHistory(h3);
  if (countUsage && last && last.text) {
    bumpUsage('chat');
    const st = stats();
    st.totalChats = (st.totalChats || 0) + 1;
    saveStats(st);
    if (st.totalChats === 1) awardBadge('firstChat', '💬 أول محادثة');
  }
  renderChat();
  return last ? last.text : null;
}
async function sendChat() {
  const input = $('#chatInput');
  if (!input) return;
  const text = input.value.trim();
  if (!text || chatStreaming) return;
  const f = filterCheck(text);
  if (!f.ok) {
    const h = chatHistory();
    h.push({ role: 'sys', text: REFUSAL });
    saveChatHistory(h);
    renderChat();
    return;
  }
  if (chatRemaining() <= 0) {
    const btn = $('#chatUnlockBtn');
    if (btn) btn.classList.remove('hidden');
    toast(`⏳ خلصت رسايلك المجانية النهاردة (${CONFIG.caps.chatPerDay}) — شاهد إعلاناً واحداً واحصل على ${CONFIG.caps.chatAdBundle} رسائل إضافية 🎁`);
    return;
  }
  input.value = '';
  const hist = chatHistory();
  hist.push({ role: 'user', text });
  const c = activeChat();
  if (c && c.title === 'محادثة جديدة') { c.title = chatTitleFor(text); saveChatStore(chatStore()); renderChatList(); }
  saveChatHistory(hist);
  renderChat();
  await streamReply(true);
}
async function regenerateMessage(idx) {
  if (chatStreaming) return null;
  const hist = chatHistory();
  if (idx == null) idx = hist.length - 1;
  if (idx < 0 || hist[idx].role !== 'assistant') return null;
  const kept = hist.slice(0, idx);
  saveChatHistory(kept);
  renderChat();
  return streamReply(false); // الإعادة لا تستهلك من الحد اليومي
}
async function editUserMessage(idx, newText) {
  if (chatStreaming) return null;
  const hist = chatHistory();
  if (idx < 0 || hist[idx].role !== 'user') return null;
  const t = String(newText || '').trim();
  if (!t) return null;
  const f = filterCheck(t);
  if (!f.ok) { toast(REFUSAL); return null; }
  const kept = hist.slice(0, idx);
  kept.push({ role: 'user', text: t });
  saveChatHistory(kept);
  renderChat();
  return streamReply(false);
}
/* تعديل ردّ المعلم: يحدَّث النص في مكانه فقط — بلا توليد جديد وبلا استهلاك.
   يمرّ على نفس فحص المحتوى؛ عند الفشل يُحفَظ النص الأصلي كما هو. */
async function editAssistantMessage(idx, newText) {
  if (chatStreaming) return null;
  const hist = chatHistory();
  if (idx < 0 || hist[idx].role !== 'assistant') return null;
  const t = String(newText || '').trim();
  if (!t) return null;
  const f = filterCheck(t);
  if (!f.ok) { toast(REFUSAL); return null; }
  hist[idx].text = t;
  saveChatHistory(hist);
  renderChat();
  return t;
}
/* حذف رسالة واحدة فقط من السجل — بلا استدعاء للنموذج وبلا تغيير في الحد اليومي. */
function deleteMessage(idx) {
  if (chatStreaming) { toast('⏳ استنى المعلم يخلّص الكتابة الأول'); return false; }
  const hist = chatHistory();
  if (idx < 0 || idx >= hist.length) return false;
  hist.splice(idx, 1);
  saveChatHistory(hist);
  renderChat();
  return true;
}
$('#chatSend').addEventListener('click', sendChat);
$('#chatInput').addEventListener('keydown', e => { if (e.key === 'Enter') sendChat(); });
$('#chatStop').addEventListener('click', () => { if (chatAbort) chatAbort.abort(); });
$('#chatClear').addEventListener('click', () => {
  if (confirm('مسح هذه المحادثة؟')) clearActiveChat();
});
$('#chatNewBtn').addEventListener('click', () => newChat());
$('#chatSearch').addEventListener('input', () => renderChatList());
$('#chatEngineToggle').addEventListener('click', () => {
  const p = settings().chatProvider || 'pollinations';
  if (p === 'gemini') { setChatProvider('pollinations'); toast('رجعت للمحرك المجاني (Pollinations)'); return; }
  const card = $('#chatSmartCard');
  if (card) card.classList.toggle('hidden');
});
/* زرار «سجّل دخول بجوجل» موحّد في كل التطبيق (شات + صور + من صورة + إعدادات):
   نقرة واحدة تفتح موافقة Google؛ لا دخول وهمي ولا لصق مفاتيح في المسار العادي. */
document.addEventListener('click', async (e) => {
  const si = e.target.closest('[data-google-signin]');
  if (si) {
    if (si.disabled) return;
    const ok = await googleSignIn();
    if (ok && si.dataset.setSmart === '1') setChatProvider('gemini');
    renderGoogleAuthUI();
    return;
  }
  const so = e.target.closest('[data-google-signout]');
  if (so) { await googleSignOut(); renderGoogleAuthUI(); }
});
const _chatSmartActivate = $('#chatSmartActivate');
if (_chatSmartActivate) _chatSmartActivate.addEventListener('click', () => {
  setChatProvider('gemini');
  toast('⭐ الوضع الذكي الأعلى مفعّل — إجابات أقوى من Gemini 2.5 Flash');
});
$('#chatSmartCancel').addEventListener('click', () => { const card = $('#chatSmartCard'); if (card) card.classList.add('hidden'); });
/* أفعال الرسائل (نسخ / إعادة / تعديل) — تفويض نقر واحد على السجل */
$('#chatLog').addEventListener('click', async (e) => {
  const copyCode = e.target.closest('.copy-code');
  if (copyCode) {
    const code = _codeRegistry[Number(copyCode.dataset.codeIdx)] || '';
    try { await navigator.clipboard.writeText(code); toast('📋 تم نسخ الكود'); }
    catch (err) { toast('⚠️ تعذّر النسخ في هذا المتصفح'); }
    return;
  }
  const btn = e.target.closest('[data-act]');
  if (!btn) return;
  const msgEl = btn.closest('.msg');
  if (!msgEl) return;
  const idx = Number(msgEl.dataset.idx);
  const hist = chatHistory();
  const m = hist[idx];
  if (!m) return;
  const act = btn.dataset.act;
  if (act === 'copy') {
    try { await navigator.clipboard.writeText(m.text); toast('📋 تم النسخ'); }
    catch (err) { toast('⚠️ تعذّر النسخ في هذا المتصفح'); }
  } else if (act === 'regen') {
    await regenerateMessage(idx);
  } else if (act === 'delete') {
    if (confirm('حذف هذه الرسالة؟')) deleteMessage(idx);
  } else if (act === 'edit') {
    const body = msgEl.querySelector('.msg-body');
    if (!body || msgEl.querySelector('.msg-edit')) return;
    const isUser = m.role === 'user';
    const ta = document.createElement('textarea');
    ta.className = 'msg-edit';
    ta.value = m.text;
    ta.rows = 3;
    const row = document.createElement('div');
    row.className = 'msg-edit-row';
    row.innerHTML = `<button class="btn-primary small" data-edit-save type="button">${isUser ? 'إرسال التعديل' : 'حفظ التعديل'}</button><button class="btn small" data-edit-cancel type="button">إلغاء</button>`;
    body.textContent = '';
    body.appendChild(ta);
    body.appendChild(row);
    ta.focus();
    row.querySelector('[data-edit-save]').onclick = async () => {
      if (isUser) await editUserMessage(idx, ta.value);
      else await editAssistantMessage(idx, ta.value);
    };
    row.querySelector('[data-edit-cancel]').onclick = () => renderChat();
  }
});

function initTextSize() {
  const apply = (v) => {
    const val = (v === 'small' || v === 'large') ? v : 'medium';
    document.documentElement.setAttribute('data-textsize', val);
    try { localStorage.setItem('dar_textsize', val); } catch (e) {}
    $$('.textsize-btn').forEach(b => b.classList.toggle('active', b.dataset.textsize === val));
  };
  let v = 'medium';
  try { v = localStorage.getItem('dar_textsize') || 'medium'; } catch (e) {}
  apply(v);
  $$('.textsize-btn').forEach(b => b.addEventListener('click', () => { apply(b.dataset.textsize); toast('✅ تم تغيير حجم الخط'); }));
}

/* ---------------- Init ---------------- */
loadSettings();
initTextSize();
loadAffiliates(); // زر يوتيوب (مخفي حتى يُوضع رابط حقيقي في affiliates.json)
renderTips();
fillEndCard();
applyAdsVisibility();
applyAdsenseVisibility();
updateCapsBadge();
renderChat();
renderChatList();
renderChatEngine();
renderGoogleAuthUI(); // حالات زر «سجّل دخول بجوجل» (بيتجهز / دخول / مسجّل)
// أزرار الميكروفون (الإدخال الصوتي)
$('#micChat').addEventListener('click', (e) => toggleDictation($('#chatInput'), e.currentTarget));
// زر «أعلن معنا» الوحيد — في قسم القرآن (إعلانات مباشرة — واتساب روني)
const advBtn = $('#advertiseBtn');
if (advBtn) advBtn.addEventListener('click', openAdvertise);
// أزرار تثبيت PWA
const installNow = $('#installNowBtn');
if (installNow) installNow.addEventListener('click', installApp);
const installLater = $('#installLaterBtn');
if (installLater) installLater.addEventListener('click', () => { LS.set('asly_install_dismissed', true); hideInstallCard(); });
const installAppBtn = $('#installAppBtn');
if (installAppBtn) installAppBtn.addEventListener('click', () => { LS.set('asly_install_dismissed', false); installApp(); });
// نسخة احتياطية من التقدّم (تصدير/استيراد)
const expBtn = $('#darExportBtn');
if (expBtn) expBtn.addEventListener('click', darExportProgress);
const impInput = $('#darImportFile');
if (impInput) impInput.addEventListener('change', async () => {
  const f = impInput.files && impInput.files[0];
  if (!f) return;
  try {
    const obj = JSON.parse(await f.text());
    await darImportProgress(obj);
  } catch (e) { toast('⚠️ تعذّر قراءة الملف — تأكد أنه ملف النسخة الاحتياطية'); }
  impInput.value = '';
});

/* Test hooks for automated verification (not part of the UI) */
window.__asly = {
  config: CONFIG,
  version: '2.0.0',
  state: () => ({ caps: usageToday(), streak: currentStreak(), level: levelFor(darLessonsDoneCount()), chatCount: chatHistory().length, device: deviceId(), badges: (stats().badges || []), chatRemaining: chatRemaining() }),
  applyAdsVisibility,
  hasRealAds,
  filterCheck,
  advertiseLink,
  openAdvertise,
  renderChat,
  renderChatList, renderChatEngine, newChat, renameChat, deleteChat, switchChat,
  // خطافات تسجيل الدخول بجوجل
  googleOAuthConfigured, googleSignedIn, googleAccountLabel, googleSignIn, googleSignOut,
  getGeminiAuth, geminiFetch, renderGoogleAuthUI, ensureGoogleToken, googleStoredToken,
  GOOGLE_QUOTA_EXHAUSTED_MSG,
  chatStore, chatEngineLabel, setChatProvider, mdRender, regenerateMessage, editUserMessage, editAssistantMessage, deleteMessage,
  chatSendTest: async (text) => { const inp = $('#chatInput'); if (inp) inp.value = text; await sendChat(); return chatHistory(); },
  stopChat: () => { if (chatAbort) chatAbort.abort(); },
  isChatStreaming: () => chatStreaming,
  // خطافات التثبيت والإعلانات
  installApp,
  showInstallCard,
  hideInstallCard,
  installPromptAvailable: () => !!deferredInstallPrompt,
  applyAdsenseVisibility,
  hasRealAdsense,
  renderYoutubeBtn,
  watchSingleAd, chatRemaining, deviceId,
  // خطافات دروس القرآن والنسخة الاحتياطية (لاختبار المسار والسلسلة والاستيراد)
  darGetLesson: () => (typeof darGetLesson === 'function' ? darGetLesson() : null),
  darExportProgress,
  darImportProgress: async (d) => darImportProgress(d),
};
