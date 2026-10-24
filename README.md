# HOT BUN — smash burgers, loud flavours

A bold, animated, frontend-only restaurant website: online ordering, table bookings and a staff panel. HOT BUN is a fictional burger joint built as a portfolio piece. All data is mocked and payments run in test mode.

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS 3 · Framer Motion · Zustand · React Hook Form + Zod · Lucide icons

---

## Getting started

Requires **Node.js 18.18+** (developed on Node 24).

```bash
npm install
npm run dev          # http://localhost:3000
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build (also type-checks and lints) |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |

Optional: set `NEXT_PUBLIC_SITE_URL` (for example `https://hotbun.example`) so canonical URLs, Open Graph tags and the sitemap use the real domain.

### Demo tour

1. **Intro:** on your first visit in a browser session, a burger assembles itself layer by layer (bun, smashed patties, melting cheese, lettuce, tomato, bouncing top bun, steam) before the site is revealed. Skip with the button, a click or any key. Open a new tab or private window to see it again.
2. **Home:** hover **Menu** in the floating nav for the mega-menu, then watch the split-letter headline, scroll to see the burger parallax, the crossed scrolling bands (they speed up as you scroll), the pinned sideways dish gallery, the count-up stats and the photo wipe in "Our story". Click any link to see the curtain page transition.
3. **Order:** on `/menu`, tap **Add** (the photo flies into your cart). Open the cart, check out with test card `4242 4242 4242 4242` (or press **Use test card**), then watch the order move from Received to On the grill to Ready (about 25 seconds).
4. **Book:** on `/reservations`, Mondays and holiday closures are disabled and some time slots show as full. The place card fills in as you type, then flips over to confirm. **Add to calendar** downloads an `.ics` file.
5. **Staff panel:** go to `/admin` and press **Fill demo credentials** (`owner@hotbun.example` / `smash-it`).
   - **Menu:** toggle a dish's availability, then open `/menu` (even in another tab). It's sold out there immediately.
   - **Orders:** your test order is on the rail. Advance it and the guest's tracker follows.
   - **Reset demo data** (sidebar) restores the original sample data.
6. **Error states:** add `?fail=menu` (or `orders`, `reservations`, `dashboard`, `all`) to any URL to make that resource's requests fail.

---

## Where the mock API lives

```
lib/api/
├── client.ts        # latency simulation, ApiError, ?fail= switch
├── mock-db.ts       # localStorage-backed "database" + change subscription
├── menu.ts          # getMenu, updateDish, createDish, deleteDish
├── orders.ts        # listOrders, getOrder, createOrder, updateOrderStatus
├── reservations.ts  # getAvailability, createReservation, listReservations, updateReservationStatus
├── dashboard.ts     # getDashboardStats
└── index.ts         # menuApi, ordersApi, reservationsApi, dashboardApi
```

Every function is `async` and returns plain typed data (see `lib/types.ts`), the same shape a `fetch` wrapper would return. Each one has a comment naming the REST endpoint it stands in for, for example:

```ts
// Real API: GET /api/menu
export async function getMenu() { ... }
```

**To connect a real backend,** replace the function bodies with `fetch` calls. Components and stores only import from `@/lib/api`, so nothing else changes. Seed data lives in `/data` (20 dishes across 6 categories). Sample orders and bookings are generated relative to the current time, so the demo never looks stale.

Related pieces to swap when going live:

| Mock | Replace with |
| --- | --- |
| `mock-db.ts` change events (`subscribeToDb`) | WebSocket / SSE / polling for live orders |
| `CardFields.tsx` (styled card form) | Your payment provider's hosted element. Never handle raw card numbers |
| `lib/store/admin-auth.ts` (fake login) | A real auth provider, plus middleware protecting `/admin` |
| `PhotoDrop.tsx` (data-URL upload) | Upload to S3/Cloudinary and store the URL |
| Unsplash photos in `data/menu.ts` | The client's own photography. `DishImage` takes any URL (add the host in `next.config.ts`) |

## Project structure

```
app/
  (site)/              # public site: home, menu, checkout, order/[id], reservations
  admin/               # staff panel: login, dashboard, menu, orders, reservations
  opengraph-image.tsx  # generated social card · sitemap.ts · robots.ts · icon.svg
components/
  motion/              # Kinetic (SplitText, Magnetic, Tilt, Marquee, Counter, Parallax,
                       # ScrollProgress), PageTransition, Reveal
  site/BurgerIntro.tsx # the animated first-visit intro (SVG, transform/opacity only)
  ui/ brand/ site/ home/ menu/ cart/ checkout/ order/ reservations/ admin/
data/                  # mock menu (+ photo URLs), restaurant info, sample orders & bookings
lib/
  api/                 # mock API layer (above)
  store/               # Zustand: cart (persisted), menu (shared), fly-to-cart, admin session
  schemas.ts           # Zod schemas for every form
tailwind.config.ts     # all design tokens
```

---

## Design decisions

**Concept.** HOT BUN is a loud, cheeky smash-burger joint: double-smashed patties, Nashville hot chicken, loaded fries and spoon-thick shakes. The design borrows from street posters and stickers to match.

**Visual language: bold and bright.** Thick ink outlines with hard offset "sticker" shadows (`shadow-pop`), slightly rotated badges, halftone dot textures, and real food photography in circles and rounded frames. Buttons lift on hover and press down into their shadow on click.

**Color.**

| Token | Hex | Role |
| --- | --- | --- |
| `cream` / `card` | `#FFFDF7` / `#FFFFFF` | Backgrounds, cards |
| `ink` | `#111111` | Text, outlines, dark bands (18.9:1 on cream) |
| `muted` | `#4B4B4B` | Secondary text (8.6:1) |
| `tomato` | `#D63A24` | **Actions only.** Order, Book, Pay, Add (4.7:1 with white) |
| `mustard` | `#FFC83D` | Highlights, stickers, focus on dark |
| `sauce` | `#F26A21` | Dashboard chart (validated on white) |
| `lettuce` / `chili` | `#17703D` / `#B3340F` | Vegetarian / spicy tags (5.3:1 and 5.1:1 on their tints) |

All text pairs meet WCAG AA, and form-field outlines meet the 3:1 rule for UI components.

**Typography.** Bricolage Grotesque at weight 800, slightly condensed, for poster-style uppercase headlines. DM Sans for readable body and UI text. IBM Plex Mono for prices, tickets and labels.

**Motion: bold and cinematic.**
- A first-visit intro: an SVG burger assembles itself (squash-and-stretch "smash", melting cheese, bouncing bun), then the screen lifts away and the hero animates in.
- A two-tier header: a live announcement strip (open status, rotating promos) and a floating pill nav with a sliding hover highlight and a photo mega-menu.
- Native scrolling (instant response) with a scroll-progress bar.
- A tomato curtain wipe between pages (skipped on first load so the page appears instantly).
- Spring-driven split-letter headline reveals.
- The hero burger sinks, grows and twists with scroll, with mouse-driven depth parallax.
- A spinning circular sticker and wobbling badges.
- Crossed scrolling bands that react to scroll speed and direction.
- A pinned section where dishes slide sideways as you scroll down.
- Count-up stats, and a photo that zooms out while a tomato panel wipes off it.
- Magnetic buttons, 3D-tilting dish cards with photo zoom, and the add-to-cart flight.
- Animated order, booking and confirmation states.

Everything animates `transform` / `opacity` only. With `prefers-reduced-motion`, the intro, scroll-linked effects, the cart flight and transforms are switched off, and content still appears.

**Performance.** Measured in Edge while wheel-scrolling the home page. The original smooth-scroll library (Lenis) forced a scroll write every frame and made the wheel feel delayed, so it was removed in favour of native scrolling. A spinning full-width gradient was made static, and the scrolling text bands pause when off screen. Result on a normal machine: about 56 fps while scrolling, with no main-thread long tasks. Judge speed with `npm run build && npm start`; `npm run dev` is much slower by design.

**Why it converts.**
- Order and Book are always one tap away: the hero's "most ordered" quick-add, a sticky mobile cart bar, and a sticky mobile Pay bar.
- Opening status, pickup time, delivery fee and the full total are visible before payment, so there are no surprise costs.
- Sold-out dishes stay visible but disabled, and a cart item that sells out mid-order is flagged before payment.
- Real appetising photography, plus social proof (rating and stats, labelled as sample data).

**Accessibility.** Semantic landmarks and a skip link. Every input has a label and inline, announced errors. Drawers trap focus and return it to the opener. The calendar supports arrow-key navigation. Segmented controls, tips, time slots and seating use native radio inputs. Cart changes are announced to screen readers. Status always pairs an icon with a label. Touch targets are 44px+, and focus rings are visible.

**SEO.** Per-page metadata and canonical URLs, Open Graph and Twitter tags, a generated social image, schema.org `Restaurant` JSON-LD, `sitemap.xml`, and a `robots.txt` that keeps checkout and admin out of the index.

**Credits.** Food photography from [Unsplash](https://unsplash.com), used under the Unsplash License.
