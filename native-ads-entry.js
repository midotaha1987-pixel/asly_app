// Native AdMob bridge for the Android (Capacitor) build of «علم ينتفع به».
// Bundled by esbuild into vendor/native-ads.js (loaded by index.html as a
// plain <script>). On the website this file is inert: isNative() is false
// and every method returns false without touching the network — the web
// app keeps its existing demo-ad flow untouched.
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

function isNative() {
  try { return Capacitor.isNativePlatform(); } catch (e) { return false; }
}

async function ensureInit() {
  if (initialized) return true;
  if (!isNative()) return false;
  try {
    let consent = await AdMob.requestConsentInfo();
    if (consent.isConsentFormAvailable && consent.status === AdmobConsentStatus.REQUIRED) {
      consent = await AdMob.showConsentForm();
    }
    if (!consent.canRequestAds) return false;
    await AdMob.initialize({ tagForChildDirectedTreatment: true });
    initialized = true;
    return true;
  } catch (e) {
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
    return true;
  } catch (e) {
    return false;
  }
}

async function hideBanner() {
  if (!bannerVisible) return;
  try { await AdMob.hideBanner(); } catch (e) { /* already hidden */ }
  bannerVisible = false;
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
    return { ok: false, reason: 'failed' };
  }
}

window.DarAds = { isNative, showBanner, hideBanner, showRewarded };
