/* =====================================================================
   أصلي — Veo proxy (Cloudflare Worker)
   ---------------------------------------------------------------------
   لماذا Worker؟ مفتاح Gemini لا يجوز أن يوجد داخل التطبيق أبداً (أي
   مفتاح في كود التطبيق يُسرق في دقائق). هذا الـ Worker هو الوسيط الوحيد:
   التطبيق يرسل الوصف فقط، والـ Worker يتحدث مع Google بالمفتاح.

   الأمان المالي (مهم):
   - سقف يومي عام (DAILY_VEO_CAP، افتراضي 5 مقاطع/يوم لكل التطبيق)
     = 5 × 0.40$ = 2$ كحد أقصى يومياً لو كلها Lite.
   - سقف لكل جهاز (PER_DEVICE_VEO_CAP، افتراضي 1 مقطع/يوم/جهاز).
   - مفتاح kill-switch: VEO_ENABLED=false يوقف كل شيء فوراً.
   - المفتاح في متغيرات بيئة الـ Worker فقط — أبداً في الكود أو التطبيق.

   صندوق فيو المشترك (التمويل):
   - التطبيق يبلّغ عن كل إعلان مكتمل عبر POST /ad (إعلان واحد ≈ 0.002$).
   - أول PROFIT_RESERVE_USD (افتراضي 3$) من كل يوم ربح لصاحب التطبيق
     ولا تُنفَق على Veo أبداً. الباقي فقط يموّل الطابور بالترتيب (FIFO).
   - الطابور مخفي عن المستخدم تماماً: لا أرقام ولا مواقع ولا مواعيد —
     المستخدم يرى فقط «جاري تجهيز فيديوك» وإشعاراً عند الجاهزية.
   - إن كان الصندوق فاضياً، يرد /generate بـ 429 {code:'pool_empty'}
     دون أن يستهلك أي رصيد من Google؛ التطبيق يعلّق الطلب ويعيده تلقائياً.

   التبديل التلقائي اشتراك ↔ مجاني (Veo auto-switch):
   - Veo تبدأ كاشتراك مدفوع (~50 ج/شهر عبر Google Play، عمولة Play ~15%).
   - الـ Worker يحسب الرصيد المقدَّر كل شهر: (إعلانات × 0.002$)
     + (اشتراكات × سعر الاشتراك بعد عمولة Play) − (إنفاق Veo الفعلي).
   - الحد الافتراضي = 30 يوماً × (تكلفة Veo اليومية المخططة + احتياطي
     الربح 3$) + هامش أمان 20%: أي 30 × (2$ + 3$) + 30$ = 180$.
     عند بلوغ الحد يفتح Veo مجاناً للجميع تلقائياً، ويرجع للاشتراك إن نزل
     الرصيد تحت 90% من الحد (هستيريا 10% ضد التذبذب).
   - بصراحة: الرصيد تقديري — فلوس AdMob وPlay الحقيقية تصل لحساب روني
     البنكي شهرياً (بعد حد 100$)، وقد تختلف عن التقدير (قيمة الإعلان
     تتفاوت 0.001–0.003$، وسعر الصرف، وخصومات الترافيك غير الصالح).
     لذلك هامش الأمان 20% (≈ 6 أيام تشغيل) + السقوف اليومية الصارمة.
     عدّاد الاشتراكات نفسه تقديري من بلاغات التطبيق بعد تأكيد الدفع على
     الجهاز؛ التحقق من الخادم لمشتريات Play يحتاج Play Developer API
     (خطوة مستقبلية).

   النماذج (تحقق منها وقت النشر — Google قد تستبدل معرّفات preview):
   - lite: veo-3.1-lite-generate-preview  (8 ثوانٍ 720p ≈ 0.40$)
   - fast: veo-3.1-fast-generate-preview  (8 ثوانٍ 1080p ≈ 0.96$)
   معرّفات GA البديلة إن تقاعدت الـ preview:
   - veo-3.1-lite-generate-001 / veo-3.1-fast-generate-001

   النشر: راجع worker/README.md
   ===================================================================== */

const MODEL_IDS = {
  lite: 'veo-3.1-lite-generate-preview',
  fast: 'veo-3.1-fast-generate-preview',
};
const COSTS = { lite: 0.40, fast: 0.96 }; // دولار لكل مقطع 8 ثوانٍ (للعرض فقط)
const AD_VALUE_USD = 0.002; // تقدير إيراد إعلان مكافأة واحد في مصر
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

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

/* ---------------- حساب وضع Veo (اشتراك / مجاني) من الرصيد المقدَّر ---------------- */
function computeVeoMode(counters, env) {
  const reserveUsd = parseFloat(env.PROFIT_RESERVE_USD || '3');
  const bufferPct = parseFloat(env.BUFFER_PCT || '20') / 100;
  const plannedDaily = parseFloat(env.PLANNED_DAILY_VEO_USD || '2');
  const subPrice = parseFloat(env.SUB_PRICE_USD || '1');
  const playFee = parseFloat(env.PLAY_FEE_PCT || '15') / 100;
  // الحد = 30 يوماً × (تكلفة Veo اليومية المخططة + احتياطي الربح) + هامش أمان
  const base30 = 30 * (plannedDaily + reserveUsd);
  const bufferUsd = base30 * bufferPct;
  const thresholdUsd = env.FREE_THRESHOLD_USD ? parseFloat(env.FREE_THRESHOLD_USD) : base30 + bufferUsd;
  const poolMonthUsd = counters.adsMonth * AD_VALUE_USD;
  const subsRevenueUsd = counters.subsMonth * subPrice * (1 - playFee);
  const balanceUsd = poolMonthUsd + subsRevenueUsd - counters.veoMonthUsd;
  return {
    thresholdUsd: +thresholdUsd.toFixed(2),
    bufferUsd: +bufferUsd.toFixed(2),
    plannedDailyVeoUsd: plannedDaily,
    reserveUsd,
    poolMonthUsd: +poolMonthUsd.toFixed(3),
    subsRevenueUsd: +subsRevenueUsd.toFixed(3),
    balanceUsd: +balanceUsd.toFixed(3),
    lowerUsd: +(thresholdUsd * 0.9).toFixed(2), // الرجوع للاشتراك عند 90% من الحد
  };
}
async function getVeoMode(kv, env) {
  const day = todayKey();
  const month = day.slice(0, 7);
  const adsMonth = await getCount(kv, `ads-month:${month}`);
  const subsMonth = await getCount(kv, `subs:${month}`);
  const veoMonthClips = await getCount(kv, `veo:global-month:${month}`);
  const veoUsdRaw = await kv.get(`veo:usd-month:${month}`);
  const veoMonthUsd = veoUsdRaw ? parseFloat(veoUsdRaw) || 0 : 0;
  const c = computeVeoMode({ adsMonth, subsMonth, veoMonthUsd }, env);
  const lastMode = (await kv.get('veo:mode')) || 'subscription';
  let mode = lastMode;
  if (lastMode === 'free') { if (c.balanceUsd < c.lowerUsd) mode = 'subscription'; }
  else { if (c.balanceUsd >= c.thresholdUsd) mode = 'free'; }
  if (mode !== lastMode) await kv.put('veo:mode', mode);
  return { mode, ...c, adsMonth, subsMonth, veoMonthClips, veoMonthUsd: +veoMonthUsd.toFixed(2) };
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { headers: CORS });

    const url = new URL(request.url);
    const kv = env.VEO_KV;
    const dailyCap = parseInt(env.DAILY_VEO_CAP || '5', 10);
    const perDeviceCap = parseInt(env.PER_DEVICE_VEO_CAP || '1', 10);
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

      // ---------------- POST /sub (بلاغ اشتراك Veo — تقديري، بعد تأكيد الدفع في Play) ----------------
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
        const mode = await getVeoMode(kv, env);
        return json({ subsMonth: mode.subsMonth, subsRevenueUsd: mode.subsRevenueUsd, mode: mode.mode, balanceUsd: mode.balanceUsd, thresholdUsd: mode.thresholdUsd });
      }

      // ---------------- GET /pool (حالة صندوق فيو المشترك) ----------------
      if (request.method === 'GET' && url.pathname.endsWith('/pool')) {
        const day = todayKey();
        const used = await getCount(kv, `veo:global:${day}`);
        const ads = await getCount(kv, `ads:${day}`);
        const poolUsd = ads * AD_VALUE_USD;
        const availableUsd = Math.max(0, poolUsd - reserveUsd);
        const vm = await getVeoMode(kv, env);
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
          affordableLite: Math.floor(availableUsd / COSTS.lite),
          adsMonth: vm.adsMonth,
          poolMonthUsd: vm.poolMonthUsd,
          veoMonthClips: vm.veoMonthClips,
          veoMonthUsd: vm.veoMonthUsd,
          subsMonth: vm.subsMonth,
          subsRevenueUsd: vm.subsRevenueUsd,
          mode: vm.mode,
          balanceUsd: vm.balanceUsd,
          thresholdUsd: vm.thresholdUsd,
          bufferUsd: vm.bufferUsd,
          lowerUsd: vm.lowerUsd,
          plannedDailyVeoUsd: vm.plannedDailyVeoUsd,
        });
      }
    }

    const key = env.GEMINI_API_KEY;
    if (!key) return json({ error: 'Worker غير مهيأ: GEMINI_API_KEY مفقود' }, 500);
    if ((env.VEO_ENABLED || 'true') !== 'true') return json({ error: 'Veo متوقف مؤقتاً' }, 503);
    if (!kv) return json({ error: 'Worker غير مهيأ: ربط KV (VEO_KV) مفقود' }, 500);

    try {
      // ---------------- POST /generate ----------------
      if (request.method === 'POST' && url.pathname.endsWith('/generate')) {
        let body;
        try { body = await request.json(); } catch { return json({ error: 'JSON غير صالح' }, 400); }
        const device = String(body.device || '').slice(0, 64);
        const prompt = String(body.prompt || '').trim();
        const quality = body.quality === 'fast' ? 'fast' : 'lite';
        if (!device) return json({ error: 'device مفقود' }, 400);
        if (prompt.length < 3 || prompt.length > 500) return json({ error: 'الوصف يجب أن يكون بين 3 و500 حرف' }, 400);
        const low = prompt.toLowerCase();
        if (BLOCKED.some(w => low.includes(w))) return json({ error: 'الوصف مرفوض' }, 400);

        // السقوف الصارمة — قبل أي اتصال بـ Google
        const day = todayKey();
        const globalCount = await getCount(kv, `veo:global:${day}`);
        if (globalCount >= dailyCap) {
          return json({ error: 'وصلنا لسقف Veo اليوم — جرّب غداً', code: 'daily_cap' }, 429);
        }
        const devCount = await getCount(kv, `veo:dev:${device}:${day}`);
        if (devCount >= perDeviceCap) {
          return json({ error: 'وصلت لسقف Veo اليوم لهذا الجهاز', code: 'device_cap' }, 429);
        }

        // صندوق فيو: هل يكفي الرصيد بعد احتياطي الربح (3$)؟ إن لم يكفِ،
        // لا نستهلك شيئاً من Google — نرد pool_empty ويعلّق التطبيق الطلب.
        const adsToday = await getCount(kv, `ads:${day}`);
        const poolUsd = adsToday * AD_VALUE_USD;
        const availableUsd = Math.max(0, poolUsd - reserveUsd);
        if (availableUsd < COSTS[quality]) {
          return json({
            error: 'الصندوق فاضي دلوقتي — فيديوك هيتعمل أول ما يتجمع رصيد',
            code: 'pool_empty', poolUsd: +poolUsd.toFixed(3), reserveUsd,
            availableUsd: +availableUsd.toFixed(3),
          }, 429);
        }

        const model = MODEL_IDS[quality];
        const genRes = await fetch(
          `${GEMINI_BASE}/${model}:predictLongRunning`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
            body: JSON.stringify({
              instances: [{ prompt }],
              parameters: {
                aspectRatio: body.aspectRatio || '9:16',
                durationSeconds: 8,
              },
            }),
          }
        );
        if (!genRes.ok) {
          const t = await genRes.text().catch(() => '');
          return json({ error: `Google: HTTP ${genRes.status} ${t.slice(0, 200)}` }, 502);
        }
        const gen = await genRes.json();
        const opName = gen && gen.name;
        if (!opName) return json({ error: 'رد غير متوقع من Google' }, 502);

        // سجّل العملية والعدّادات (تنتهي بعد 48 ساعة)
        await kv.put(`op:${opName}`, JSON.stringify({ device, quality, createdAt: Date.now() }), { expirationTtl: 172800 });
        await kv.put(`veo:global:${day}`, String(globalCount + 1), { expirationTtl: 172800 });
        await kv.put(`veo:dev:${device}:${day}`, String(devCount + 1), { expirationTtl: 172800 });
        // عدّادات الشهر (للوحة الرصيد — تنتهي بعد ~31 يوماً)
        const month = day.slice(0, 7);
        const veoMonthClips = (await getCount(kv, `veo:global-month:${month}`)) + 1;
        await kv.put(`veo:global-month:${month}`, String(veoMonthClips), { expirationTtl: 2678400 });
        const veoUsdRaw = await kv.get(`veo:usd-month:${month}`);
        const veoUsdNew = (veoUsdRaw ? parseFloat(veoUsdRaw) || 0 : 0) + COSTS[quality];
        await kv.put(`veo:usd-month:${month}`, String(+veoUsdNew.toFixed(2)), { expirationTtl: 2678400 });
        return json({ operation: opName, quality, costUsd: COSTS[quality] });
      }

      // ---------------- GET /status?op=... ----------------
      if (request.method === 'GET' && url.pathname.endsWith('/status')) {
        const op = url.searchParams.get('op') || '';
        if (!op) return json({ error: 'op مفقود' }, 400);
        const rec = await kv.get(`op:${op}`);
        if (!rec) return json({ error: 'عملية غير معروفة' }, 404);
        const opRes = await fetch(`${GEMINI_BASE}/${op}`, { headers: { 'x-goog-api-key': key } });
        if (!opRes.ok) return json({ status: 'processing' });
        const data = await opRes.json();
        if (data.error) return json({ status: 'failed', error: data.error.message || 'فشل توليد Veo' });
        if (!data.done) return json({ status: 'processing' });
        const sample = data.response && data.response.generateVideoResponse &&
          data.response.generateVideoResponse.generatedSamples &&
          data.response.generateVideoResponse.generatedSamples[0];
        if (!sample || !sample.video || !sample.video.uri) {
          return json({ status: 'failed', error: 'اكتملت العملية بدون فيديو' });
        }
        return json({ status: 'done', download: `/download?op=${encodeURIComponent(op)}` });
      }

      // ---------------- GET /download?op=... ----------------
      if (request.method === 'GET' && url.pathname.endsWith('/download')) {
        const op = url.searchParams.get('op') || '';
        if (!op) return json({ error: 'op مفقود' }, 400);
        const rec = await kv.get(`op:${op}`);
        if (!rec) return json({ error: 'عملية غير معروفة' }, 404);
        const opRes = await fetch(`${GEMINI_BASE}/${op}`, { headers: { 'x-goog-api-key': key } });
        if (!opRes.ok) return json({ error: 'تعذّر التحقق من العملية' }, 502);
        const data = await opRes.json();
        const sample = data.response && data.response.generateVideoResponse &&
          data.response.generateVideoResponse.generatedSamples &&
          data.response.generateVideoResponse.generatedSamples[0];
        const uri = sample && sample.video && sample.video.uri;
        if (!uri) return json({ error: 'الفيديو غير جاهز بعد' }, 404);
        const videoRes = await fetch(`${uri}:download?alt=media`, { headers: { 'x-goog-api-key': key } });
        if (!videoRes.ok) return json({ error: `تعذّر تحميل الفيديو: HTTP ${videoRes.status}` }, 502);
        return new Response(videoRes.body, {
          headers: {
            ...CORS,
            'Content-Type': 'video/mp4',
            'Content-Disposition': 'attachment; filename="asly-veo.mp4"',
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
