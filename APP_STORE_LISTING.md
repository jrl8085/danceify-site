# App Store Listing — Copy this into App Store Connect

Source-of-truth for the v5.8 ASC listing. Update this file alongside any future ASC metadata change so future-you (or future-Claude) has the current copy in one place.

## App Name
Danceify - AI Dance Videos

## Subtitle (30 chars max)
Make Your Dog Dance With AI
*(27 chars. Alternates: "Dance Anyone — Even Your Dog" / "Pets, Babies, You — Dancing")*

## Promotional Text (170 chars, can be updated without review)
Pick a photo, pick a style, watch it dance. K-Pop, Salsa, Bollywood, Hip-Hop. Creation Weekly $2.99 your first week, then $9.99/wk — cancel anytime.
*(148 chars)*

## Description (4000 chars max)
Make ANYONE dance — even your dog or cat. Powered by AI.

Pick a photo. Pick a dance style. Tap CREATE. In about a minute, AI turns the subject into a real dancer with full choreography and music. Works on adults, babies, dogs, and cats — each with the right anatomy and movement.

HOW IT WORKS
1. Pick a photo from your library or snap a new one
2. Pick a dance style — 19 to choose from
3. Tap CREATE — AI generates your video in about a minute
4. Save to Camera Roll or share anywhere

INSIDE THE APP
- 19 cinematic dance styles, refreshed regularly
- 10-second clips with full audio, HD output
- Background-safe — lock your phone, get notified when ready
- Works on adults, babies, dogs, and cats
- Privacy-first — photos process securely and are never sold
- No sign-up required — start dancing in seconds

WEEKLY MEMBERSHIPS (auto-renew)
- Creation — $9.99/week (try your first week for $2.99)
- Advanced — $14.99/week
Higher tiers grant more coins per week.

MONTHLY & YEARLY
- Creation Monthly — $29.99/month (12,000 coins)
- Creation Yearly — $149.99/year (62,400 coins · best long-term value)

ONE-TIME COIN PACKS (never expire)
- Refill packs — $2.99 / $7.99 / $17.99 / $39.99 / $99.99

Coins fuel every dance. Subscription coins refresh on each renewal. Pack coins are yours forever.

Payment will be charged to your Apple Account at confirmation of purchase. Subscriptions automatically renew unless canceled at least 24 hours before the end of the current period. Your account will be charged for renewal within 24 hours prior to the end of the current period. You can manage and cancel subscriptions in your Account Settings on the App Store.

Terms: https://jrl8085.github.io/danceify-site/terms.html
Privacy: https://jrl8085.github.io/danceify-site/privacy.html

## What's New in v5.8 (4000 chars max)
Streamlined subscription flow and performance improvements. Keep dancing.

## Keywords (100 chars max, comma-separated)
dog,cat,ai,kpop,bollywood,salsa,hiphop,baby,viral,photo,video,reel,music,dancer,trend
*(85 chars. Cat kept per founder rule — paused product but copy stays.)*

## Category
Primary: Entertainment
Secondary: Photo & Video

## Age Rating
4+ (no objectionable content)

## Copyright
2026 Danceify

## Support URL
https://jrl8085.github.io/danceify-site/support.html

## Marketing URL
https://jrl8085.github.io/danceify-site/

---

## App Review Notes (4000 chars max)
Paste this into the "Notes for Review" field when submitting:

```
v5.8 removes the free-first-dance path that was introduced in v5.2. All generations now require coins from a subscription or one-time coin pack. Change details:

1) NO FREE GENERATION
The startGeneration Cloud Function no longer grants a free generation to new users. Every dance requires coins to be debited from the user's balance (subscription-granted or purchased via a coin pack). The `wasFreeGeneration` field on generation documents is retained (always false in v5.8) for historical compatibility with legacy data.

2) ONBOARDING PAYWALL WITH DISMISSAL
Onboarding is 4 screens: Hook, Proof, Social, Paywall. The paywall screen presents the full v4.7 subscription ladder — Creation Weekly $2.99 intro (per Apple 3.1.2(a) Pay-As-You-Go), Advanced Weekly, Creation Monthly, Creation Yearly — plus a de-emphasized "Not now" link that dismisses the paywall (Guideline 3.1.2(b) escape path). Users who dismiss land on Home with a 0-coin balance; tapping any template surfaces the paywall via out_of_coins.

3) COINS, NOT DANCES
All paywall and balance copy uses coin amounts (e.g. "3,000 coins/week") instead of derived dance counts. Matches the v4.7 coin economy described in the App Store description.

4) PRIVACY — NO TRACKING
The binary does not track users under Apple's framework. Verified by code audit:
- NSUserTrackingUsageDescription is absent from the Info.plist and all framework Info.plists. No ATT prompt is shown.
- Zero references to ATTrackingManager, ASIdentifierManager, or advertisingIdentifier anywhere in the codebase. No IDFA is ever requested or read.
- Firebase Analytics is explicitly disabled via IS_ANALYTICS_ENABLED=false in GoogleService-Info.plist.
- No third-party advertising SDKs are linked or initialized (no AdMob, no Meta SDK, no Branch, etc.). The Google Ads on-device conversion SDK is linked transitively via Firebase but is never initialized or invoked.
- Apple Search Ads attribution uses Apple's privacy-preserving AdServices framework (AAAttribution.attributionToken), which is explicitly excluded from tracking per Apple's definition.
- PostHog is used for in-app analytics and session replay. Session replay masks all text inputs and all images; the user's photo never appears in replays. PostHog data is not linked to data from other apps and is not shared with data brokers.

The App Privacy declaration remains tracking=No, aligned with the binary.

5) STOREKIT
STOREKIT_ALLOW_XCODE_RECEIPTS is OFF in the production grantCoinPack Cloud Function. Receipt verification uses real Apple JWS.

REVIEWER SIGN-IN
Anonymous Firebase Auth on launch is invisible to normal users — the app boots straight into onboarding with no sign-in screen. To exercise paid-state flows (paywall, restore, refund-push), there is a hidden reviewer login. Credentials:
- review-expired-sub@danceify.app / Danceify2026!
This account has an expired subscription so restore, re-subscribe, refund-push, and paywall flows can all be tested.

PAID FLOW TEST PATH
1. Delete the app, reinstall.
2. Swipe through onboarding (Hook, Proof, Social).
3. On the paywall (screen 4), subscribe to Creation Weekly $2.99 intro to seed the coin balance.
4. Pick any non-cinematic template, upload a photo, tap CREATE.
5. Generation completes in 3-7 minutes and coins are debited from the balance.
```

---

## App Privacy declaration

Tracking: **No** (audit-verified per the Privacy section in Review Notes above).

Data Collected (linked to user via anonymous Firebase Auth UID):
- Contact Info — Email Address (reviewer-login flow only)
- Identifiers — User ID (Firebase Anonymous Auth UID)
- Purchases — Purchase History

Data Collected (not linked to identity):
- Identifiers — Device ID (PostHog $device_id; app-generated UUID)
- Diagnostics — Crash Data, Performance Data, Other Diagnostic Data
- Usage Data — Product Interaction (PostHog events)
- User Content — Photos or Videos (uploaded for AI processing)

All identifiers are app-generated or Apple-provided privacy-preserving tokens; no IDFA is ever requested.
