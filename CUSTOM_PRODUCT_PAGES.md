# Custom Product Pages — Danceify v3.0

Four CPPs, one per ASA campaign. Each CPP gets a unique App Store URL you point its campaign's ad creative at. The point of CPPs isn't to be different for difference's sake — it's to match the **mental state of the searcher** so the page reinforces the ad they just clicked.

**Rule of thumb:** the first screenshot must answer the searcher's exact query in under one second. If a "dancing dog" searcher lands on a CPP showing a K-Pop selfie, you've wasted the click.

Each CPP below lists:
- **Name** (internal, App Store Connect)
- **Hook** (the one promise)
- **Promotional Text** (170 chars, editable post-launch)
- **Screenshot brief** (6 frames, what each shows + on-screen copy)
- **App Preview script** (15–30s, the only video that matters is the first 2s)
- **ASA pairing** (which campaign + keyword cluster drives traffic here)

---

## Brand Spec — Kinetic Mono

This is the design system the app actually uses. Hand this section to whoever's designing the screenshots so they don't drift toward generic "AI app" pastel-gradient territory.

### Visual feel
Dark, monolithic, brutalist-mono with a single hot-pink accent. Think Berlin techno-club poster, not soft tech-startup. The home screen is near-black with a magenta CTA — that's the look. Do not introduce additional gradients, glows, or pastel hues. The discipline is the brand.

### Color palette (hex)

| Token | Hex | Use |
|---|---|---|
| `bg` | `#0A0A0C` | Page background. Near-black, not pure black. |
| `card` | `#111114` | Slightly lifted surface (cards, list rows) |
| `ink` | `#FAFAFA` | Primary text. Off-white, not pure white. |
| `dim` | `#FAFAFA` @ 55% opacity | Secondary text, captions |
| `faint` | `#FAFAFA` @ 35% opacity | Tertiary text, hints |
| `line` | `#FFFFFF` @ 8% opacity | Hairline rules and dividers |
| `accent` | `#FF2D6F` | The single hot-pink accent. CTAs, status dots, brand marks. |

### The one gradient
Used only on the primary CTA button and brand surfaces. Vertical, top-to-bottom:
- 0% → `#FF4A83`
- 50% → `#FF2D6F`
- 100% → `#E51E5E`

No other gradients exist in the system. Don't invent any for the screenshots.

### Typography

| Role | Font | Weight | Notes |
|---|---|---|---|
| Display headline | Inter Display (or Neue Haas Grotesk Display Pro) | 900 / Black | Condensed width. Tight tracking (≈ −4% em). Tight leading (≈ 0.92×). |
| Wordmark | Inter Display | 900 / Black | NOT condensed. The Danceify wordmark — see home screen reference. |
| Body | SF Pro / Inter | 600 / Semibold | Standard system body weight. |
| Caption / mono | SF Mono / JetBrains Mono | 400 / Regular | UPPERCASE, tracked +1.5pt to +2pt. Used for "DANCEIFY · v3.0", "01 STEPS", etc. |

The mono uppercase caption with wide tracking is a brand signature — every screenshot's small-text overlays should use it. Don't substitute a regular sans.

### Geometry & spacing
- Page horizontal padding: 22pt
- Common gaps: 8 / 12 / 14 / 18 / 22pt (literal values, not a 4/8 grid — keep this slightly off so the layout feels hand-set, not template-y)
- Corner radius: 16–24pt for cards, 0pt for full-bleed media
- Hairline borders: 1pt at 8% white

### Brand motifs to reuse on screenshots
- **Pulsing magenta status dot** — small filled circle, 8pt diameter, accent color, soft glow. Pairs with brand mark in headers.
- **"©26 EST NYC"** — mono caption block, right-aligned to the wordmark
- **Marquee ticker** — `● BEAT · MOVE · LOOP · SHARE` style horizontal scroller, mono uppercase, accent dot bullets
- **Numbered steps** — `01`, `02`, `03` — display-weight numerals, oversized

### What to avoid
- Pastel backgrounds, soft pinks, mint, lavender — wrong app
- Drop shadows on text — never used in the app
- Multiple gradients — only the magenta sheen exists
- Rounded sans body type — use only the mono caption for small uppercase text
- Generic "AI sparkle" iconography — we don't use sparkles, glows, or starburst graphics
- Skeuomorphic phone frames inside screenshots (no fake hands, no fake bezels-within-bezels)

### Reference asset
The home-screen capture below shows the exact treatment to match:
- Black background with subtle ghosted dancer silhouette
- Magenta dot + mono `DANCEIFY · v3.0` caption top-left
- Massive condensed-black `DANCE / ⚡FY.` wordmark
- Magenta `START SESSION` CTA with the camera icon
- `01`, `02`, `03`, `04` step rows in mono caps with chevron-right indicators

A designer can pull a still of the home screen directly from the running app, or from this commit's screenshots folder once you ship them.

---

## CPP 1 — "Dancing Dog"
**The viral hook. Highest unique value. No real incumbent on these searches.**

### Name (internal)
`v3-dancing-dog`

### Hook
Your dog stands up on its hind legs and dances like a person — in 60 seconds, from one photo.

### Promotional Text (170 chars)
> Make your dog dance like a person. Drop a photo, pick a style, AI does the rest in 60 seconds. K-Pop, Hip-Hop, Salsa & 13 more. Cancel anytime.
*(148 chars)*

### Screenshot brief (6 frames, 1290×2796 / iPhone 6.7")

| # | What's on screen | Copy overlay (top) | Note |
|---|---|---|---|
| 1 | A real generated dog video frame — golden retriever upright on hind legs mid-K-Pop move, paws raised | **"YOUR DOG. DANCING.<br>FOR REAL."** | This single frame is the entire pitch. No app chrome — just the result. |
| 2 | Side-by-side: original dog photo (sitting) → arrow → generated dancing-dog frame | "ONE PHOTO IN.<br>VIRAL VIDEO OUT." | Proof: real input → real output. |
| 3 | Subject picker UI on the photo upload screen, "Dog" tile selected | "BUILT FOR DOGS.<br>NOT JUST RESKINNED." | The competitive moat — emphasize the dog mode is purpose-built. |
| 4 | Style picker grid showing K-Pop / Hip-Hop / Salsa / Flamenco tiles | "16 DANCE STYLES.<br>YES, BALLET TOO." | Reinforce variety without listing all 16. |
| 5 | Result screen with dog video + share sheet open (TikTok / Instagram / Messages icons visible) | "POST IT. SHARE IT.<br>WATCH IT GO." | The implicit promise: this becomes a viral post. |
| 6 | Pricing card / paywall — Creation Weekly $2.99 first week highlighted | "$2.99<br>FIRST WEEK." | Soft pricing reveal — no surprise post-install. |

### App Preview script (30s, portrait)

| Time | Visual | Text on screen |
|---|---|---|
| 0:00–0:02 | Dog dancing video, full screen, no UI | (none — let the visual do the work) |
| 0:02–0:05 | Quick cut: user opens app, taps "Start Session" | — |
| 0:05–0:08 | Photo picker → user selects a sitting-dog photo | — |
| 0:08–0:11 | Subject picker: tap "Dog" | "PICK DOG" |
| 0:11–0:14 | Dance style grid → tap "K-Pop" | "PICK STYLE" |
| 0:14–0:17 | Loading bar / progress (compressed) | "AI GENERATES" |
| 0:17–0:25 | Final dog-dancing video plays full screen | "ONE PHOTO. ONE TAP." |
| 0:25–0:30 | App icon + "Danceify — Make Your Dog Dance" lockup | end card |

**Critical:** the first 2 seconds must show a real dog actually dancing. App Store auto-plays previews muted on the search results page — if frame 1 isn't the dog, the autoplay fails to convert.

### ASA pairing
- **Campaign:** Pets / Dog Discovery
- **Keyword cluster:** `dancing dog`, `dog dance`, `dog dance video`, `dog video maker`, `pet video`, `dog meme generator`, `make dog dance`, `funny dog video`
- **Bid posture:** aggressive on `dancing dog` (low competition, high intent, perfect match to the page)

---

## CPP 2 — "Dancing Baby"
**Parents. Wide audience, high share-rate, sentimental conversion.**

### Name (internal)
`v3-dancing-baby`

### Hook
Watch your baby bust a move — and stay a baby. No creepy AI aging.

### Promotional Text (170 chars)
> Turn your baby's photo into an adorable dance video. AI keeps them a baby — no aging, no creepy adult moves. Just bouncing, clapping, joyful baby energy.
*(166 chars)*

### Screenshot brief (6 frames)

| # | What's on screen | Copy overlay | Note |
|---|---|---|---|
| 1 | Generated baby video frame — clapping, smiling, bouncing | **"YOUR BABY.<br>DANCING."** | Pure emotional hook. |
| 2 | Original baby photo → arrow → dancing-baby frame | "ONE PHOTO. ONE TAP." | Show the transformation. |
| 3 | Subject picker, "Baby" tile selected | "BUILT FOR BABIES.<br>BABY-SAFE AI." | The "no aging" promise — addresses parent anxiety. |
| 4 | Style grid: focus on baby-friendly styles (Bollywood, Hula, Salsa, Hip-Hop) | "16 STYLES.<br>ALL BABY-APPROVED." | Implicit safety reassurance. |
| 5 | Result + share sheet (Messages thread to "Mom 💕" visible) | "TEXT IT TO GRANDMA." | Use case: text grandma. The actual workflow. |
| 6 | Pricing — Creation Weekly $2.99 first week highlighted | "$2.99<br>FIRST WEEK." | — |

### App Preview script (30s)
Same structure as Dog, but use a baby-photo flow. Show a parent/grandparent reaction shot at 0:23 if you can fake one — emotional response > seeing the dance again. End card: "Danceify — Watch Your Baby Dance".

### ASA pairing
- **Campaign:** Parents / Baby Discovery
- **Keyword cluster:** `baby dance`, `dancing baby`, `baby video`, `baby photo to video`, `baby dance video`, `baby gif maker`, `cute baby video`
- **Bid posture:** moderate. Parents convert well but the keyword space is more competitive than dog.

---

## CPP 3 — "TikTok & K-Pop"
**Trend chasers. Highest volume keywords, hardest CAC.**

### Name (internal)
`v3-tiktok-kpop`

### Hook
Drop a selfie. Get a viral TikTok dance you couldn't pull off in real life.

### Promotional Text (170 chars)
> The K-Pop choreography you'd never attempt IRL — generated from one selfie. 16 styles incl. K-Pop, Hip-Hop, TikTok Viral. Cancel anytime.
*(140 chars)*

### Screenshot brief (6 frames)

| # | What's on screen | Copy overlay | Note |
|---|---|---|---|
| 1 | Generated K-Pop dance video frame — sharp, on-beat, idol-grade | **"YOUR FACE.<br>K-POP MOVES."** | Lead with the visual flex. |
| 2 | TikTok-style result video frame with watermark mocked at corner | "MADE-FOR-FYP." | Speak the audience's language. |
| 3 | Style picker: K-Pop, Hip-Hop, TikTok Viral, Flamenco tiles highlighted | "16 STYLES.<br>EVERY VIBE." | — |
| 4 | Music picker — show track selection + tempo slider | "PICK A SONG.<br>MATCH THE BPM." | The music sync is a quiet differentiator. |
| 5 | Result with share sheet, TikTok icon prominent | "ONE TAP TO TIKTOK." | — |
| 6 | Pricing — Pro $7.99/mo + 7-day trial | "TRY 7 DAYS FREE." | Aggressive trial offer for higher-intent traffic. |

### App Preview script (30s)
Match TikTok pacing — fast cuts, beat-synced, big text. End card: "Danceify — Drop a Selfie. Get a Dance."

### ASA pairing
- **Campaign:** Discovery / Trend
- **Keyword cluster:** `K-pop dance`, `TikTok dance maker`, `AI dance video`, `dance generator`, `dance video maker`, `dance challenge`, `viral dance`
- **Bid posture:** disciplined. This space has competitors. Lean on `K-pop dance` (more specific, lower CPT) over generic `dance video`.

---

## CPP 4 — "Make Anyone Dance" (Brand / Default)
**Branded search + category browsers + the page Custom Product Pages defaults to when there's no campaign-specific match.**

### Name (internal)
`v3-make-anyone-dance`

### Hook
Anyone in a photo. Any dance style. One tap.

### Promotional Text (170 chars)
> Drop any photo — selfie, friend, baby, dog. Pick from 16 dance styles. AI generates a real dance video in 60 seconds. Cancel anytime.
*(141 chars)*

### Screenshot brief (6 frames)

| # | What's on screen | Copy overlay | Note |
|---|---|---|---|
| 1 | Triptych — adult selfie dancing, baby dancing, dog dancing, all in frame | **"ANYONE.<br>EVERY DANCE."** | The breadth pitch. |
| 2 | Subject picker UI with all three tiles visible | "ADULT. BABY. DOG.<br>YOUR PICK." | — |
| 3 | Style grid showing all 16 tiles | "16 STYLES.<br>EVERY MOOD." | — |
| 4 | Generation progress / loading screen | "60 SECONDS.<br>NO ANIMATION SKILLS." | Speak to the "I can't make videos" anxiety. |
| 5 | Result + music picker | "PAIR WITH MUSIC.<br>SHARE ANYWHERE." | — |
| 6 | Pricing card — show Lite $2.99, Pro $7.99, Creator $14.99 side-by-side | "FROM $2.99/MO.<br>CANCEL ANYTIME." | Show price ladder for branded searchers comparing. |

### App Preview script (30s)
Three quick demos — adult, baby, dog — then style/music/share. End card: "Danceify — Make Anyone Dance".

### ASA pairing
- **Campaign:** Brand + Broad / Category
- **Keyword cluster:** `danceify`, `danceify app`, `AI dance app`, `photo to video`, `photo to dance`, `dance app`, `make photo dance`
- **Bid posture:** brand keywords get max bid (cheap, defensive — competitor brand-jacking is a real risk). Broad/category bids stay disciplined.

---

## Implementation order

If you only have time to ship 1 CPP at launch, ship **CPP 1 (Dancing Dog)** — it's the only one with no real incumbent and the highest visual differentiation. The other three can roll out as ASA campaigns mature.

If you have time for 2, add **CPP 4 (Make Anyone Dance)** — covers branded search, which always converts highest.

CPP 2 (Baby) and CPP 3 (TikTok/K-Pop) come third and fourth — both work, both need their respective ASA campaigns spun up to feed them.

---

## A few production notes

- **Screenshot tool:** create the screenshots once in Figma at 1290×2796 (iPhone 15 Pro Max), then auto-resize down for the smaller required sizes. App Store Connect requires either 6.7" + 6.5" + 5.5" sets or 6.9" + 6.5". Do 6.7" first — it's mandatory.
- **Real video frames > mocked frames.** For each CPP's screenshot 1, use an actual generated video frame from the app. The "this is real" feeling matters more than the production polish.
- **App Preview videos must be portrait, 15–30 seconds, no UI chrome on top of UI chrome (no fake hands tapping fake screens).** Apple rejects them. Use the actual app screen recording.
- **The 6.7" preview is the hero.** That's what shows up in search results when ASA matches a keyword. The other sizes are fallbacks.
- **Promotional text is editable post-review** — use this for ASA-matched seasonality (Black Friday, Christmas, Valentine's "make your partner dance") without going through review again.
- **A CPP URL looks like:** `https://apps.apple.com/app/id[appID]?ppid=[productPageID]`. Get the `ppid` from App Store Connect after the page is approved, paste it into the matching ASA campaign's "Custom Product Page" field.

---

## What I'd skip

- **Holiday/seasonal CPPs at launch.** You don't have the data yet to know what converts. Ship core 4, run for 30 days, then make a Christmas / Valentine's variant once you have a baseline.
- **Friends/group photo CPP.** The AI generates from one subject — pretending it does multiple bodies dishonestly invites refunds and 1-star reviews.
- **Creator-tier CPP.** Creator is an upsell, not an acquisition target. Don't burn a CPP slot on it.
