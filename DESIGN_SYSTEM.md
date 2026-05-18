# It's An Problem — Design System

> "Either you can rant about a problem or you can do something about it."

A working design system for **It's An Problem** (working names: IAP / TAP / ATP, also seen as `thatsanproblem.com`)

> **About the name.** "It's An Problem" is *intentionally* ungrammatical — the founder is playing with the wrongness. "That's a problem" → "That's an problem." Don't autocorrect it in copy, alt text, or anywhere else. The grammatical mistake **is** the brand.

 — an anonymous problem-sharing platform aimed initially at college students. Users post problems anonymously, friends and strangers comment with their names, and good advice earns visible reputation points.

This system formalizes the visual language already present in the codebase (indigo gradient, soft slate cards, rounded surfaces) and extends it with a real type system, a warm coral accent, an icon strategy, and a UI kit.

---

## Source materials

| Source | What's in it |
|---|---|
| **GitHub** — [BhupendraNegi/itsanproblem](https://github.com/BhupendraNegi/itsanproblem) | Rails 8 API backend + React 19 / Vite / TypeScript frontend. Imported files in `frontend/` (read-only reference). |
| **Founder brief** | Pasted from the user; captures the *why* (people love to vent), the *who* (college students first), the *tension* (anonymity vs friend-graph signal), and open questions about incentives and AI. |

The reader is encouraged to **explore the GitHub repo directly** — there is more nuance there than I could capture in this README, especially in `backend/app/` (Rails models, controllers) and the tiny `frontend/src/` tree.

---

## What this system covers

- **Foundations** — colors, type, spacing, radii, shadows, motion (`colors_and_type.css`)
- **Brand** — wordmark, monogram, mascot speech bubble, gradient (`assets/`)
- **Components** — buttons, inputs, alerts, post card, comment item, nav, auth panel — implemented as JSX in `ui_kits/web_app/`
- **A working UI kit** — interactive prototype at `ui_kits/web_app/index.html` covering the auth screen → composer → feed → post-detail flow
- **Preview cards** — every concept above also lives as a small HTML card in `preview/` so the Design System tab renders thumbnails

---

## What's *not* here (yet)

The codebase is early. These pieces don't exist in the repo and are **out of scope** for this design system — I called them out so it's clear what's intentionally blank vs missing:

- **Friend graph / DM-style "tell a friend anonymously"** — described in the brief but no UI or routes exist for it.
- **Reputation points on profiles** — mentioned, no data model.
- **Profile pages** — no `/users/:id` screen in the React tree.
- **AI-trained advisor** — long-term vision; no API surface.
- **Logo / brand mark** — none in `frontend/public`; I designed a placeholder monogram (`assets/logo-iap.svg`) and a mascot speech bubble (`assets/mascot-speech.svg`). Both are *placeholders, not finals* — flag for replacement.

---

## Index

```
.
├── README.md                    ← you are here
├── SKILL.md                     ← Agent-Skill manifest (drop-in for Claude Code)
├── colors_and_type.css          ← all design tokens, semantic + raw
├── fonts/README.md              ← font story + substitution flag
├── assets/                      ← logos, mascot, icons (SVG)
│   ├── logo-iap.svg
│   ├── logo-iap-mark.svg
│   ├── mascot-speech.svg
│   ├── pattern-quote.svg
│   └── icons/                   ← lucide subset, used in UI kit
├── preview/                     ← Design System tab cards (one HTML each)
│   ├── brand-*.html
│   ├── color-*.html
│   ├── type-*.html
│   ├── spacing-*.html
│   └── component-*.html
└── ui_kits/
    └── web_app/
        ├── README.md
        ├── index.html           ← interactive click-thru prototype
        ├── Navbar.jsx
        ├── AuthPanel.jsx
        ├── Composer.jsx
        ├── PostCard.jsx
        ├── CommentItem.jsx
        ├── Alert.jsx
        ├── EmptyState.jsx
        └── tokens.css           ← imports colors_and_type.css + kit-local rules
```

---

## CONTENT FUNDAMENTALS — voice and tone

The codebase has a small but consistent voice. It is **direct, casual, second-person, and slightly self-aware**. It does not try to soften the product — the literal app title is *"It's An Problem"*, the README opens with "Either you can rant about a problem or you can do something about it," and the founder's brief uses the word "drag" (rant) freely.

### Voice rules

- **Plain, short sentences.** No marketing fluff. "Anonymous problem board" (six words) sits under the title — that's the bar.
- **Second person, addressing the user.** "Write a comment with your name." "You must be signed in to comment."
- **Title Case for primary CTAs, sentence case for everything else.** "Sign In", "Create Account", "Add comment", "Refresh". Notice the inconsistency in the codebase ("Add comment" vs "Sign In") — formalize this: **Title Case for primary actions**, **Sentence case for secondary actions and labels**.
- **No emoji in product chrome.** The README uses emoji for marketing (✅, 🎨, 🚀); the app surface itself uses zero. Hold that line.
- **No exclamation points** except when they're load-bearing (the brand mark itself is a contraction-shouted "It's An Problem").
- **Never autocorrect the brand name.** "It's An Problem" (not "It's A Problem") — the wrongness is the point. Same goes for the URL `thatsanproblem.com`.
- **State is narrated honestly.** "Posting...", "Commenting...", "Loading...". No "Saving your beautiful thoughts ✨" — that's not us.

### Specific copy patterns

| Situation | Pattern | Example from codebase |
|---|---|---|
| Empty state | Single line, no period | "No comments yet." |
| Field meta | Past tense, lowercase, mid-dot separator | "Posted anonymously · 11/3/2025, 8:42 PM" |
| Auth panel intro | One sentence, what + why | "Register or log in, then share your anonymous post and let others comment with their name." |
| Validation error | Imperative, no apology | "You must be signed in to comment" |
| Success alert | Past-tense fact | "Post created" (recommend; not in codebase yet) |
| Section header | Two words, sentence case | "Latest posts", "Create Post" (existing inconsistency — recommend "Latest posts" / "New post") |

### Vibe

The product is for venting. The copy should feel like a friend who isn't going to lecture you — not therapy, not corporate, not edgy-meme either. **"Honest neighbor"** is the target. The accent coral and the mascot speech-bubble carry warmth so the words don't have to.

---

## VISUAL FOUNDATIONS

### Colors

The codebase's existing palette: indigo `#4338ca → #6366f1` (primary + gradient), slate neutrals from `#111827` down to `#f9fafb`, amber + emerald + (implied) red for alerts. **I kept all of these as-is** and added one new family: **coral** (`#f97066` lead), the "vent" accent. Coral never replaces indigo — it punctuates. A "hot post" badge, the mascot's tongue, the reaction count when something blows up.

Full scales and semantic aliases live in `colors_and_type.css`. Always reference the **semantic** tokens (`--bg-card`, `--fg1`, `--primary`) in component code, not the raw scales.

### Type

- **Display: Bricolage Grotesque** (variable; we use weights 500–800 and stretch 75–100). Brand-defining headline face. Slightly weird, condensible, modern.
- **Body: Inter** (already in `App.css`). Untouched.
- **Mono: JetBrains Mono.** Used sparingly — anonymous handles ("anon_a91f"), post IDs in URLs, timestamps in dev/admin views.

Both Bricolage and JetBrains Mono are **substitutions** — not present in the original codebase. Confirm or swap via the `--font-display` and `--font-mono` CSS variables.

### Spacing

A 4px base scale, exposed as `--space-1` (4px) through `--space-16` (64px). Default card padding is `--space-6` (24px). Default gap inside a vertical stack is `--space-4` (16px).

### Backgrounds

The product runs on **soft surfaces**, not photography. Default page background is the `--gradient-page` (`#eef2ff → #f8fafc`, top to bottom) — pulled directly from `App.css body`. Card backgrounds are pure white. **No full-bleed imagery, no repeating textures.** The one exception is the auth-screen splash, where the brand gradient (`--gradient-brand`) takes up the top band behind the wordmark.

### Animation & motion

The codebase has one transition rule: `transition: all 0.3s ease` on the navbar logout button. Formalize:

- **Standard motion:** `220ms` with `cubic-bezier(0.2, 0.8, 0.2, 1)` (snappy, slight overshoot ease).
- **Fast motion** (hover state, focus ring): `140ms`.
- **No bounces, no springs, no Lottie.** Fades, scales, and translates only.
- **Reduced motion:** all transitions collapse to `0ms` when `prefers-reduced-motion: reduce`.

### Hover & press states

- **Buttons (primary):** hover darkens by one indigo step (`--indigo-700` → `--indigo-800`). Press shrinks `transform: scale(0.98)`.
- **Buttons (outline / mode toggle):** hover swaps border to `--indigo-700`, background to `--slate-100`. Active state fills with `--indigo-700`.
- **Inputs:** focus ring is `--shadow-ring-focus` (`0 0 0 3px rgba(67, 56, 202, 0.10)`), border becomes `--indigo-700`, background turns white. This is from `App.css` verbatim.
- **Logout / on-color buttons:** hover lightens the translucent fill from `rgba(255,255,255,0.2)` to `0.3`. From `App.css` verbatim.

### Borders & radii

- Default border is **1px solid `--slate-200`**. Inputs use **1px solid `--slate-300`**.
- **Radii are generous and consistent.** Cards = `1rem`. Inputs = `0.85rem`. Mode buttons = `0.75rem`. Primary buttons = `999px` (pill). This is the most distinctive thing about the brand visually — *everything is rounded, nothing is pill-only*.

### Shadows

Two shadow tokens drive 90% of elevation:

- `--shadow-card: 0 20px 60px rgba(15, 23, 42, 0.06)` — soft, *long* throw shadow on every card.
- `--shadow-nav: 0 4px 12px rgba(67, 56, 202, 0.15)` — colored shadow under the indigo nav, so the gradient bleeds into the page.

A focus ring shadow (`--shadow-ring-focus`) for inputs, and a `--shadow-pop` for menus/tooltips, complete the system.

### Transparency & blur

Used **only on the indigo navbar** — translucent white pills for logout (`rgba(255,255,255,0.2)`). No backdrop-filter blur anywhere. Don't introduce glassmorphism — it fights the soft-card aesthetic.

### Imagery

There is no photography in the codebase. The mascot (`assets/mascot-speech.svg`) and a quote pattern (`assets/pattern-quote.svg`) are the only "illustrations." If photography is added later: **warm, candid, low-contrast.** No stock-photo office shots.

### Layout rules

- The navbar is **fixed**, 80px tall, full-width, with a max-content container at 1600px.
- Content sits in `.app-shell` with `padding: 0 5%`. There is no hard max-width on the feed — the page is fluid.
- Mobile (<720px): navbar becomes 100px (stacks brand + user info), single-column grid.

---

## ICONOGRAPHY

The codebase ships **zero icons.** No SVG sprite, no icon font, no emoji in the UI. The only image asset is `frontend/public/vite.svg` (the default Vite favicon — not part of the brand).

**Strategy for this design system:**

1. **Recommend [Lucide](https://lucide.dev) as the icon set** — stroke-based, 24×24, 2px stroke. It pairs cleanly with the rounded soft-card aesthetic without dragging the design toward iOS or Material.
2. **Substitution flagged.** I copied a small working subset into `assets/icons/` (sourced from Lucide's open repo) so the UI kit doesn't depend on a CDN. The kit uses these inline. If the brand later picks a different icon family, swap the contents of `assets/icons/` and the kit picks it up.
3. **No emoji in product chrome.** (Repeated from Content Fundamentals because it's important — easy to slip into "🔥 hot posts" and lose the tone.)
4. **No unicode characters as icons** (no `·` separator → use `<span class="dot">`, no `→` arrows → use the Lucide `arrow-right`).

Icon usage rules:

- Default size: **20×20** inline with text, **24×24** standalone.
- Stroke 2px, color matches surrounding text (`currentColor`).
- Never tinted with brand colors except in CTAs (where they inherit `var(--fg-on-primary)`).

Logo assets (placeholders — flag for replacement):

- `assets/logo-iap.svg` — wordmark, "it's an problem." with the period as a coral dot.
- `assets/logo-iap-mark.svg` — IAP monogram, indigo on white.
- `assets/mascot-speech.svg` — frowning speech-bubble character.

---

## How to use this system

1. **Mocks / prototypes:** copy `colors_and_type.css` into the root of the prototype, drop the `<link>` from `fonts/README.md` in `<head>`, and use the semantic tokens (`var(--primary)`, `var(--bg-card)`, etc).
2. **Production code:** the same `colors_and_type.css` is the source of truth. The JSX in `ui_kits/web_app/` is *cosmetic, not implementation* — copy markup + classes, write your own state/data layer.
3. **New screens / features:** check `preview/` first to see if a component pattern already exists. If you need a new one, add a small preview card alongside the existing ones so the system stays self-documenting.

See **SKILL.md** for the Agent-Skill manifest that makes this system invocable as a Claude Code skill.
