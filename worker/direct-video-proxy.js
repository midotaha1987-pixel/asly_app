/* =====================================================================
   Lyra — Direct-video proxy (Cloudflare Worker)
   ---------------------------------------------------------------------
   المحرك المباشر: Gemini Omni 1.2 Flash (`gemini-omni-1.2-flash`).
   لماذا Omni؟ Google أوقفت Veo 3.1 في Gemini API في 22 أكتوبر 2026
   (veo-3.1-*-generate-preview لم تعد موجودة) وتوجّه المطوّرين إلى Omni.
   Veo 3.1 ما زال متاحاً فقط عبر Vertex AI / Gemini Enterprise — خيار
   مستقبلي، ولم يُبنَ هنا لأنه يحتاج إعداد فوترة GCP لا يملكه روني بعد.

   واجهة Omni (موثّقة في ai.google.dev/gemini-api/docs/omni — قُرئت 2026-11-20):
   - POST https://generativelanguage.googleapis.com/v1beta/interactions?key=KEY
   - الجسم: { model: 'gemini-omni-1.2-flash', input: '...',
               response_format: { type: 'video', aspect_ratio: '9:16',
                                  resolution: '720p'|'1080p'|'360p',
                                  duration: '8s' } }
     (المدة 3–15 ثانية، الافتراضي 10؛ الدقة الافتراضية 720p؛ نسبة العرض
     9:16 أو 16:9؛ الفيديو بصوت أصلي حتى 15 ثانية.)
   - الرد: { steps: [..., { type: 'model_output',
                 content: [{ type: 'video', mime_type: 'video/mp4',
                             data: '<base64>' }] }], id, status: 'completed' }
     الاستدعاء متزامن حسب مثال REST في المستندات — يعود الفيديو في الرد
     نفسه. الفيديو يُخزَّن في KV (base64) ويُنزَّل عبر /download.
   - الأسعار (ai.google.dev/gemini-api/docs/pricing — باقة مدفوعة فقط،
     بلا باقة مجانية): 720p ‏~0.07$/ثانية (كليب 8 ثوانٍ ≈ 0.56$)،
     360p ‏0.023$/ثانية (≈ 0.18$)، 1080p ‏0.104$/ثانية (≈ 0.83$).

   لماذا Worker؟ مفتاح Gemini لا يجوز أن يوجد داخل التطبيق أبداً (أي
   مفتاح في كود التطبيق يُسرق في دقائق). هذا الـ Worker هو الوسيط الوحيد:
   التطبيق يرسل الوصف فقط، والـ Worker يتحدث مع Google بالمفتاح.

   الأمان المالي (مهم):
   - سقف يومي عام (DAILY_VIDEO_CAP، افتراضي 5 مقاطع/يوم لكل التطبيق)
     = 5 × 0.56$ = 2.80$ كحد أقصى يومياً لو كلها 720p.
   - سقف لكل جهاز (PER_DEVICE_VIDEO_CAP، افتراضي 1 مقطع/يوم/جهاز).
   - مفتاح kill-switch: DIRECT_VIDEO_ENABLED=false يوقف كل شيء فوراً.
   - المفتاح في متغيرات بيئة الـ Worker فقط — أبداً في الكود أو التطبيق.
   - ملاحظة صادقة: إن انقطع الاتصال أثناء توليد Google، قد تُحاسَب
     Google على الكليب دون أن يصل — لذلك السقوف اليومية منخفضة عمداً،
     والعدّادات تُخصم فقط بعد وصول فيديو مكتمل.

   صندوق الفيديو المباشر المشترك (التمويل):
   - التطبيق يبلّغ عن كل إعلان مكتمل عبر POST /ad (إعلان واحد ≈ 0.002$).
   - أول PROFIT_RESERVE_USD (افتراضي 3$) من كل يوم ربح لصاحب التطبيق
     ولا تُنفَق على الفيديو المباشر أبداً. الباقي فقط يموّل الطابور
     بالترتيب (FIFO).
   - الطابور مخفي عن المستخدم تماماً: لا أرقام ولا مواقع ولا مواعيد —
     المستخدم يرى فقط «جاري تجهيز فيديوك» وإشعاراً عند الجاهزية.
   - إن كان الصندوق فاضياً، يرد /generate بـ 429 {code:'pool_empty'}
     دون أن يستهلك أي رصيد من Google؛ التطبيق يعلّق الطلب ويعيده تلقائياً.

   التبديل التلقائي اشتراك ↔ مجاني:
   - الفيديو المباشر يبدأ كاشتراك مدفوع (~50 ج/شهر عبر Google Play، عمولة Play ~15%).
   - الـ Worker يحسب الرصيد المقدَّر كل شهر: (إعلانات × 0.002$)
     + (اشتراكات × سعر الاشتراك بعد عمولة Play) − (إنفاق الفيديو الفعلي).
   - الحد الافتراضي = 30 يوماً × (تكلفة الفيديو اليومية المخططة + احتياطي
     الربح 3$) + هامش أمان 20%: أي 30 × (2.80$ + 3$) + 34.80$ ≈ 209$.
     عند بلوغ الحد يفتح الفيديو مجاناً للجميع تلقائياً، ويرجع للاشتراك إن نزل
     الرصيد تحت 90% من الحد (هستيريا 10% ضد التذبذب).
   - بصراحة: الرصيد تقديري — فلوس AdMob وPlay الحقيقية تصل لحساب روني
     البنكي شهرياً (بعد حد 100$)، وقد تختلف عن التقدير (قيمة الإعلان
     تتفاوت 0.001–0.003$، وسعر الصرف، وخصومات الترافيك غير الصالح).
     لذلك هامش الأمان 20% (≈ 6 أيام تشغيل) + السقوف اليومية الصارمة.
     عدّاد الاشتراكات نفسه تقديري من بلاغات التطبيق بعد تأكيد الدفع على
     الجهاز؛ التحقق من الخادم لمشتريات Play يحتاج Play Developer API
     (خطوة مستقبلية).

   النشر: راجع worker/README.md
   ===================================================================== */

const MODEL_ID = 'gemini-omni-1.2-flash';
const INTERACTIONS_URL = 'https://generativelanguage.googleapis.com/v1beta/interactions';
// الجودات: الاسم في التطبيق → الدقة + التكلفة (كليب 8 ثوانٍ)
const QUALITIES = {
  hd720: { resolution: '720p', costUsd: 0.56 },
  hd1080: { resolution: '1080p', costUsd: 0.83 },
  sd360: { resolution: '360p', costUsd: 0.18 }, // احتياطي مستقبلي — غير معروض في التطبيق الآن
};
const AD_VALUE_USD = 0.002; // تقدير إيراد إعلان مكافأة واحد في مصر

// كلمات محظورة بسيطة — الفلتر الكامل في التطبيق؛ هذا خط دفاع ثانٍ
const BLOCKED = ['sex', 'porn', 'nude', 'naked', 'kill', 'murder', 'bomb', 'weapon', 'gun',
  'جنس', 'سكس', 'عاري', 'قتل', 'قنبلة', 'سلاح'];

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}
function todayKey() { return new Date().toISOString().slice(0, 10); }

async function getCount(kv, key) {
  const v = await kv.get(key);
  return v ? parseInt(v, 10) || 0 : 0;
}

/* استخراج الفيديو (base64) من رد Interactions API */
function extractVideo(interaction) {
  if (!interaction || !Array.isArray(interaction.steps)) return null;
  for (const step of interaction.steps) {
    if (step.type !== 'model_output' || !Array.isArray(step.content)) continue;
    for (const part of step.content) {
      if (part.type === 'video' && part.data) {
        return { data: part.data, mime: part.mime_type || 'video/mp4' };
      }
    }
  }
  return null;
}

/* ---------------- حساب وضع الفيديو المباشر (اشتراك / مجاني) من الرصيد المقدَّر ---------------- */
function computeVideoMode(counters, env) {
  const reserveUsd = parseFloat(env.PROFIT_RESERVE_USD || '3');
  const bufferPct = parseFloat(env.BUFFER_PCT || '20') / 100;
  const plannedDaily = parseFloat(env.PLANNED_DAILY_VIDEO_USD || '2.8');
  const subPrice = parseFloat(env.SUB_PRICE_USD || '1');
  const playFee = parseFloat(env.PLAY_FEE_PCT || '15') / 100;
  // الحد = 30 يوماً × (تكلفة الفيديو اليومية المخططة + احتياطي الربح) + هامش أمان
  const base30 = 30 * (plannedDaily + reserveUsd);
  const bufferUsd = base30 * bufferPct;
  const thresholdUsd = env.FREE_THRESHOLD_USD ? parseFloat(env.FREE_THRESHOLD_USD) : base30 + bufferUsd;
  const poolMonthUsd = counters.adsMonth * AD_VALUE_USD;
  const subsRevenueUsd = counters.subsMonth * subPrice * (1 - playFee);
  const balanceUsd = poolMonthUsd + subsRevenueUsd - counters.videoMonthUsd;
  return {
    thresholdUsd: +thresholdUsd.toFixed(2),
    bufferUsd: +bufferUsd.toFixed(2),
    plannedDailyVideoUsd: plannedDaily,
    reserveUsd,
    poolMonthUsd: +poolMonthUsd.toFixed(3),
    subsRevenueUsd: +subsRevenueUsd.toFixed(3),
    balanceUsd: +balanceUsd.toFixed(3),
    lowerUsd: +(thresholdUsd * 0.9).toFixed(2), // الرجوع للاشتراك عند 90% من الحد
  };
}
async function getVideoMode(kv, env) {
  const day = todayKey();
  const month = day.slice(0, 7);
  const adsMonth = await getCount(kv, `ads-month:${month}`);
  const subsMonth = await getCount(kv, `subs:${month}`);
  const videoMonthClips = await getCount(kv, `video:global-month:${month}`);
  const videoUsdRaw = await kv.get(`video:usd-month:${month}`);
  const videoMonthUsd = videoUsdRaw ? parseFloat(videoUsdRaw) || 0 : 0;
  const c = computeVideoMode({ adsMonth, subsMonth, videoMonthUsd }, env);
  const lastMode = (await kv.get('video:mode')) || 'subscription';
  let mode = lastMode;
  if (lastMode === 'free') { if (c.balanceUsd < c.lowerUsd) mode = 'subscription'; }
  else { if (c.balanceUsd >= c.thresholdUsd) mode = 'free'; }
  if (mode !== lastMode) await kv.put('video:mode', mode);
  return { mode, ...c, adsMonth, subsMonth, videoMonthClips, videoMonthUsd: +videoMonthUsd.toFixed(2) };
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { headers: CORS });

    const url = new URL(request.url);
    const kv = env.VIDEO_KV;
    const dailyCap = parseInt(env.DAILY_VIDEO_CAP || '5', 10);
    const perDeviceCap = parseInt(env.PER_DEVICE_VIDEO_CAP || '1', 10);
    const reserveUsd = parseFloat(env.PROFIT_RESERVE_USD || '3');

    // ---- هذه النقاط لا تحتاج مفتاح Gemini (محاسبة الصندوق فقط) ----
    if (kv) {
      // ---------------- POST /ad (بلاغ إكمال إعلان — لمحاسبة الصندوق) ----------------
      if (request.method === 'POST' && url.pathname.endsWith('/ad')) {
        const day = todayKey();
        const month = day.slice(0, 7);
        const ads = (await getCount(kv, `ads:${day}`)) + 1;
        await kv.put(`ads:${day}`, String(ads), { expirationTtl: 172800 });
        const adsMonth = (await getCount(kv, `ads-month:${month}`)) + 1;
        await kv.put(`ads-month:${month}`, String(adsMonth), { expirationTtl: 2678400 }); // ~31 يوم
        const poolUsd = ads * AD_VALUE_USD;
        return json({ adsToday: ads, poolUsd: +poolUsd.toFixed(3), reserveUsd, availableUsd: +Math.max(0, poolUsd - reserveUsd).toFixed(3), adsMonth, poolMonthUsd: +(adsMonth * AD_VALUE_USD).toFixed(3) });
      }

      // ---------------- POST /sub (بلاغ اشتراك — تقديري، بعد تأكيد الدفع في Play) ----------------
      // يُرسله التطبيق بعد أن يؤكد Play Billing الدفع على الجهاز. اشتراك واحد
      // لكل جهاز في الشهر (التجديد يبلّغ مرة أخرى الشهر التالي).
      if (request.method === 'POST' && url.pathname.endsWith('/sub')) {
        const day = todayKey();
        const month = day.slice(0, 7);
        let body = {};
        try { body = await request.json(); } catch { body = {}; }
        const device = String(body.device || '').slice(0, 64);
        if (!device) return json({ error: 'device مفقود' }, 400);
        const already = await kv.get(`subs-dev:${device}:${month}`);
        if (!already) {
          const subsMonth = (await getCount(kv, `subs:${month}`)) + 1;
          await kv.put(`subs:${month}`, String(subsMonth), { expirationTtl: 2678400 });
          await kv.put(`subs-dev:${device}:${month}`, '1', { expirationTtl: 2678400 });
        }
        const mode = await getVideoMode(kv, env);
        return json({ subsMonth: mode.subsMonth, subsRevenueUsd: mode.subsRevenueUsd, mode: mode.mode, balanceUsd: mode.balanceUsd, thresholdUsd: mode.thresholdUsd });
      }

      // ---------------- GET /pool (حالة صندوق الفيديو المباشر المشترك) ----------------
      if (request.method === 'GET' && url.pathname.endsWith('/pool')) {
        const day = todayKey();
        const used = await getCount(kv, `video:global:${day}`);
        const ads = await getCount(kv, `ads:${day}`);
        const poolUsd = ads * AD_VALUE_USD;
        const availableUsd = Math.max(0, poolUsd - reserveUsd);
        const vm = await getVideoMode(kv, env);
        return json({
          date: day,
          dailyCap,
          perDeviceCap,
          usedToday: used,
          remaining: Math.max(0, dailyCap - used),
          adsToday: ads,
          poolUsd: +poolUsd.toFixed(3),
          reserveUsd,
          availableUsd: +availableUsd.toFixed(3),
          affordableHd720: Math.floor(availableUsd / QUALITIES.hd720.costUsd),
          adsMonth: vm.adsMonth,
          poolMonthUsd: vm.poolMonthUsd,
          videoMonthClips: vm.videoMonthClips,
          videoMonthUsd: vm.videoMonthUsd,
          subsMonth: vm.subsMonth,
          subsRevenueUsd: vm.subsRevenueUsd,
          mode: vm.mode,
          balanceUsd: vm.balanceUsd,
          thresholdUsd: vm.thresholdUsd,
          bufferUsd: vm.bufferUsd,
          lowerUsd: vm.lowerUsd,
          plannedDailyVideoUsd: vm.plannedDailyVideoUsd,
        });
      }
    }

    const key = env.GEMINI_API_KEY;
    if (!key) return json({ error: 'Worker غير مهيأ: GEMINI_API_KEY مفقود' }, 500);
    if ((env.DIRECT_VIDEO_ENABLED || 'true') !== 'true') return json({ error: 'الفيديو المباشر متوقف مؤقتاً' }, 503);
    if (!kv) return json({ error: 'Worker غير مهيأ: ربط KV (VIDEO_KV) مفقود' }, 500);

    try {
      // ---------------- POST /generate ----------------
      // استدعاء متزامن واحد إلى Interactions API (حسب مثال REST في المستندات).
      // يعود الفيديو base64 في الرد؛ يُخزَّن في KV ويُرجَع معرّف العملية.
      if (request.method === 'POST' && url.pathname.endsWith('/generate')) {
        let body;
        try { body = await request.json(); } catch { return json({ error: 'JSON غير صالح' }, 400); }
        const device = String(body.device || '').slice(0, 64);
        const prompt = String(body.prompt || '').trim();
        const quality = QUALITIES[body.quality] ? body.quality : 'hd720';
        if (!device) return json({ error: 'device مفقود' }, 400);
        if (prompt.length < 3 || prompt.length > 500) return json({ error: 'الوصف يجب أن يكون بين 3 و500 حرف' }, 400);
        const low = prompt.toLowerCase();
        if (BLOCKED.some(w => low.includes(w))) return json({ error: 'الوصف مرفوض' }, 400);

        // السقوف الصارمة — قبل أي اتصال بـ Google
        const day = todayKey();
        const globalCount = await getCount(kv, `video:global:${day}`);
        if (globalCount >= dailyCap) {
          return json({ error: 'وصلنا لسقف الفيديو المباشر اليوم — جرّب غداً', code: 'daily_cap' }, 429);
        }
        const devCount = await getCount(kv, `video:dev:${device}:${day}`);
        if (devCount >= perDeviceCap) {
          return json({ error: 'وصلت لسقف الفيديو المباشر اليوم لهذا الجهاز', code: 'device_cap' }, 429);
        }

        // صندوق الفيديو: هل يكفي الرصيد بعد احتياطي الربح (3$)؟ إن لم يكفِ،
        // لا نستهلك شيئاً من Google — نرد pool_empty ويعلّق التطبيق الطلب.
        const adsToday = await getCount(kv, `ads:${day}`);
        const poolUsd = adsToday * AD_VALUE_USD;
        const availableUsd = Math.max(0, poolUsd - reserveUsd);
        if (availableUsd < QUALITIES[quality].costUsd) {
          return json({
            error: 'الصندوق فاضي دلوقتي — فيديوك هيتعمل أول ما يتجمع رصيد',
            code: 'pool_empty', poolUsd: +poolUsd.toFixed(3), reserveUsd,
            availableUsd: +availableUsd.toFixed(3),
          }, 429);
        }

        const genRes = await fetch(
          `${INTERACTIONS_URL}?key=${encodeURIComponent(key)}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: MODEL_ID,
              input: prompt,
              response_format: {
                type: 'video',
                aspect_ratio: body.aspectRatio || '9:16',
                resolution: QUALITIES[quality].resolution,
                duration: '8s',
              },
            }),
          }
        );
        if (!genRes.ok) {
          const t = await genRes.text().catch(() => '');
          return json({ error: `Google: HTTP ${genRes.status} ${t.slice(0, 200)}` }, 502);
        }
        const interaction = await genRes.json();
        const video = extractVideo(interaction);
        const opId = (interaction && interaction.id) || `omni-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
        if (!video) {
          // رد غير مكتمل (نادر — الاستدعاء متزامن حسب المستندات): احفظ المعرّف
          // وأبلغ «قيد المعالجة»؛ التطبيق يستطلع /status دون إعادة إرسال.
          await kv.put(`op:${opId}`, JSON.stringify({ device, quality, interactionId: opId, createdAt: Date.now() }), { expirationTtl: 172800 });
          return json({ operation: opId, quality, status: 'processing' }, 202);
        }

        // سجّل الفيديو والعدّادات (الفيديو ينتهي بعد 48 ساعة)
        await kv.put(`video:${opId}`, video.data, { expirationTtl: 172800 });
        await kv.put(`op:${opId}`, JSON.stringify({ device, quality, createdAt: Date.now() }), { expirationTtl: 172800 });
        await kv.put(`video:global:${day}`, String(globalCount + 1), { expirationTtl: 172800 });
        await kv.put(`video:dev:${device}:${day}`, String(devCount + 1), { expirationTtl: 172800 });
        // عدّادات الشهر (للوحة الرصيد — تنتهي بعد ~31 يوماً)
        const month = day.slice(0, 7);
        const videoMonthClips = (await getCount(kv, `video:global-month:${month}`)) + 1;
        await kv.put(`video:global-month:${month}`, String(videoMonthClips), { expirationTtl: 2678400 });
        const videoUsdRaw = await kv.get(`video:usd-month:${month}`);
        const videoUsdNew = (videoUsdRaw ? parseFloat(videoUsdRaw) || 0 : 0) + QUALITIES[quality].costUsd;
        await kv.put(`video:usd-month:${month}`, String(+videoUsdNew.toFixed(2)), { expirationTtl: 2678400 });
        return json({ operation: opId, quality, costUsd: QUALITIES[quality].costUsd, status: 'done' });
      }

      // ---------------- GET /status?op=... ----------------
      if (request.method === 'GET' && url.pathname.endsWith('/status')) {
        const op = url.searchParams.get('op') || '';
        if (!op) return json({ error: 'op مفقود' }, 400);
        const rec = await kv.get(`op:${op}`);
        if (!rec) return json({ error: 'عملية غير معروفة' }, 404);
        const video = await kv.get(`video:${op}`);
        if (video) return json({ status: 'done', download: `/download?op=${encodeURIComponent(op)}` });
        return json({ status: 'processing' });
      }

      // ---------------- GET /download?op=... ----------------
      if (request.method === 'GET' && url.pathname.endsWith('/download')) {
        const op = url.searchParams.get('op') || '';
        if (!op) return json({ error: 'op مفقود' }, 400);
        const rec = await kv.get(`op:${op}`);
        if (!rec) return json({ error: 'عملية غير معروفة' }, 404);
        const b64 = await kv.get(`video:${op}`);
        if (!b64) return json({ error: 'الفيديو غير جاهز بعد' }, 404);
        const bin = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
        return new Response(bin, {
          headers: {
            ...CORS,
            'Content-Type': 'video/mp4',
            'Content-Disposition': 'attachment; filename="lyra-omni.mp4"',
            'Cache-Control': 'no-store',
          },
        });
      }

      return json({ error: 'مسار غير معروف — استخدم /generate أو /status أو /download أو /pool أو /ad أو /sub' }, 404);
    } catch (err) {
      return json({ error: 'خطأ داخلي في الـ Worker: ' + (err.message || err) }, 500);
    }
  },
};
