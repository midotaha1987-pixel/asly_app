// Native AdMob bridge for the Android (Capacitor) build of «علم ينتفع به».
// Bundled by esbuild into vendor/native-ads.js (loaded by index.html as a
// plain <script>). On the website this file is inert: isNative() is false
// and every method returns false without touching the network — the web
// app keeps its existing demo-ad flow untouched.
// NOTE: any change to this file triggers the Android APK workflow
// (.github/workflows/build-android-apk.yml) — it rebuilds + republishes
// the debug APK to release v2.0.0-android.
//
// Policy (standing, do not relax):
// - family-safe, child-directed (tagForChildDirectedTreatment), non-personalized (npa)
// - banner: non-Quran screens only (home / learn list / settings) — the app
//   calls showBanner()/hideBanner() on every pane switch
// - rewarded: opt-in only, +5 «اسأل المعلم» messages; NO interstitials
// - AdMob real IDs come from CONFIG.admob in app.js (same values)
import { AdMob, AdmobConsentStatus, BannerAdSize, BannerAdPosition } from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';

const BANNER_ID = 'ca-app-pub-9117972626650086/9739261706';
const REWARDED_ID = 'ca-app-pub-9117972626650086/3449185524';

let initialized = false;
let bannerVisible = false;

// ---- Diagnostics (read-only): why ads do/don't show ----
// Rony installed the APK and saw no ads at all, with no consent popup.
// Nothing here changes ad behaviour — it only records what happened, so
// Settings can show it in plain words via window.DarAds.status().
const diag = {
  initialized: false,
  canRequestAds: null,      // true | false | null (not asked yet)
  consentStatus: null,      // e.g. 'REQUIRED' | 'NOT_REQUIRED' | 'OBTAINED' | null
  consentFormAvailable: null,
  banner: 'not-requested',  // 'not-requested' | 'shown' | 'failed' | 'hidden'
  lastError: null,          // short string of the last failed step, or null
  lastStep: null,           // 'consent' | 'initialize' | 'banner' | 'rewarded' | null
};

function shortErr(e) {
  if (e == null) return 'unknown error';
  const m = (e && e.message) ? e.message : String(e);
  return m.slice(0, 160);
}

function status() {
  return {
    platform: isNative() ? 'native' : 'web',
    initialized: initialized,
    canRequestAds: diag.canRequestAds,
    consent: { status: diag.consentStatus, formAvailable: diag.consentFormAvailable },
    banner: diag.banner,
    lastError: diag.lastError,
    lastStep: diag.lastStep,
  };
}

function isNative() {
  try { return Capacitor.isNativePlatform(); } catch (e) { return false; }
}

async function ensureInit() {
  if (initialized) return true;
  if (!isNative()) return false;
  try {
    let consent = await AdMob.requestConsentInfo();
    diag.consentStatus = consent.status || null;
    diag.consentFormAvailable = !!consent.isConsentFormAvailable;
    diag.canRequestAds = !!consent.canRequestAds;
    if (consent.isConsentFormAvailable && consent.status === AdmobConsentStatus.REQUIRED) {
      consent = await AdMob.showConsentForm();
      diag.consentStatus = consent.status || diag.consentStatus;
      diag.canRequestAds = !!consent.canRequestAds;
    }
    if (!consent.canRequestAds) {
      diag.lastError = 'canRequestAds=false — لم يُسمح بطلب الإعلانات (موافقة الإعلانات غير ممنوحة)';
      diag.lastStep = 'consent';
      return false;
    }
    await AdMob.initialize({ tagForChildDirectedTreatment: true });
    initialized = true;
    diag.initialized = true;
    return true;
  } catch (e) {
    diag.lastError = 'initialize: ' + shortErr(e);
    diag.lastStep = 'initialize';
    return false;
  }
}

async function showBanner() {
  if (!(await ensureInit())) return false;
  try {
    await AdMob.showBanner({
      adId: BANNER_ID,
      adSize: BannerAdSize.ADAPTIVE_BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      margin: 0,
      npa: true,
    });
    bannerVisible = true;
    diag.banner = 'shown';
    return true;
  } catch (e) {
    diag.banner = 'failed';
    diag.lastError = 'banner: ' + shortErr(e);
    diag.lastStep = 'banner';
    return false;
  }
}

async function hideBanner() {
  if (!bannerVisible) return;
  try { await AdMob.hideBanner(); } catch (e) { /* already hidden */ }
  bannerVisible = false;
  diag.banner = 'hidden';
}

// Shows the real rewarded ad. Returns { ok: true } only when the user
// watched it to the reward point; any failure/decline returns ok: false
// and the caller falls back to the web demo gate.
async function showRewarded() {
  if (!(await ensureInit())) return { ok: false, reason: 'unavailable' };
  try {
    await AdMob.prepareRewardVideoAd({ adId: REWARDED_ID, npa: true });
    await AdMob.showRewardVideoAd();
    return { ok: true };
  } catch (e) {
    diag.lastError = 'rewarded: ' + shortErr(e);
    diag.lastStep = 'rewarded';
    return { ok: false, reason: 'failed' };
  }
}

window.DarAds = { isNative, showBanner, hideBanner, showRewarded, status };
