# Adriatica Real Estate

Premium real estate platform for property listings in Kosovo and the region. Built for fast browsing, multilingual support, and a clean admin workflow.

## Tech Stack

- **Next.js 15** (App Router)
- **React 18** + **TypeScript**
- **Tailwind CSS**
- **Firebase** — Firestore (listings DB) + Firebase Auth (admin authentication)
- **Cloudinary** — image hosting and on-the-fly optimization
- **i18next** — multilingual support (Albanian, English, German, Serbian)

## Features

- Public listings grid with search, type, category, location, and price filters
- Pagination (cursor-based, 24 listings per page)
- Listing detail page with image gallery, features, and WhatsApp contact
- Contact page with property request, offer, and general contact forms
- Scroll-aware transparent navbar (hero integration)
- Admin system: triple-click logo ? PIN modal ? Firebase login ? dashboard
- Admin dashboard: create, edit, delete, mark as sold, extend listings
- Fully responsive (mobile-first)
- SSR-safe i18n with suppressHydrationWarning

## Getting Started

### Prerequisites

- Node.js 18+
- Firebase project (Firestore + Auth enabled)
- Cloudinary account

### Install

```bash
npm install
```

### Environment Variables

Create a `.env.local` file in the root:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=

NEXT_PUBLIC_WHATSAPP_NUMBER=38349210337

NEXT_PUBLIC_ADMIN_PIN=
```

### Run locally

```bash
npm run dev
```

Open http://localhost:3000.

### Build for production

```bash
npm run build
npm start
```

## Project Structure

```
app/
  layout.tsx          # Root layout, metadata, providers
  page.tsx            # Homepage — listings grid + hero
  contact/            # Contact page (3-tab form)
  listings/[id]/      # Listing detail page
  admin/              # Protected admin dashboard

components/
  Navbar.tsx          # Scroll-aware transparent navbar
  Footer.tsx          # Site footer
  HeroSection.tsx     # Homepage hero with animated counters
  ListingCard.tsx     # Listing grid card
  ListingFilters.tsx  # Search + filter bar
  ImageGallery.tsx    # Detail page image viewer
  WhatsAppButton.tsx  # Floating WhatsApp CTA
  admin/              # AdminAccessModal, AdminDashboard, AdminListingForm
  forms/              # ContactForm, PropertyRequestForm, PropertyOfferForm

hooks/
  useListingFilters.ts  # Filter + search logic
  useCountAnimation.ts  # Animated number counter

lib/
  firebase.ts         # Firebase app singleton
  firestore.ts        # All Firestore read/write functions
  cloudinary.ts       # Image URL optimizer
  utils.ts            # formatPrice, isNegotiablePrice, formatTimestamp

contexts/
  AuthContext.tsx     # Firebase Auth state + login/logout

types/
  index.ts            # Listing, ListingFormData, DisplayStatus types

i18n/
  locales/            # sq.json, en.json, de.json, sr.json
```

## Deployment (Vercel)

1. Push to GitHub
2. Import repo at https://vercel.com
3. Add all environment variables in Vercel project settings
4. Deploy — Vercel auto-detects Next.js, no additional config needed

## Branch Strategy

| Branch | Purpose |
|---|---|
| `main` | Production — stable, deployed to Vercel |
| `develop` | Active development — merged to main when stable |

## Security Notes

- Firebase Auth is the real admin gate
- Firestore rules restrict writes to the admin email only
- Never commit .env.local — it is gitignored

---

(c) 2026 Adriatica Real Estate
