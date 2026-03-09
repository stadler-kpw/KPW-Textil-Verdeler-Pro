# KPW Textil Veredeler Pro

Professional textile embellishment configurator with Shopify integration, B2B inquiry flow, and dynamic pricing.

## Tech Stack

- **Framework:** React 19, TypeScript 5.2 (strict mode)
- **Build:** Vite 5, Tailwind CSS 4
- **State:** Zustand 5 + Zundo (undo/redo, 50 snapshot limit)
- **PDF:** html2canvas-pro + jsPDF (client-side PDF generation)
- **Email:** Resend SDK (via Vercel Serverless Function)
- **Icons:** Lucide React
- **Routing:** React Router 7
- **Deployment:** Vercel (static + serverless functions)

## Scripts

```bash
npm run dev       # Vite dev server (localhost:5173)
npm run build     # Production build to dist/
npm run preview   # Preview production build
npm run lint      # ESLint strict (--max-warnings 0)
```

## Environment

- `RESEND_API_KEY` — required for email sending (server-side only, in `.env.local` or Vercel env vars)

## Architecture

### Routes

| Route       | Component    | Purpose                                |
|-------------|--------------|----------------------------------------|
| `/`         | Root loader  | Detects Shopify params, redirects      |
| `/upload`   | UploadPage   | Product image / Shopify URL upload     |
| `/config`   | ConfigPage   | Canvas + sidebar for logo placement    |
| `/checkout` | CheckoutPage | Order summary + contact form + email   |

### API Routes (Vercel Serverless)

| Route              | Purpose                                        |
|--------------------|------------------------------------------------|
| `/api/send-inquiry`| Receives form data + PDF base64, sends via Resend |

### State Stores (Zustand)

- **useConfigStore** — Product images, logos, quantities, pricing (with undo/redo)
- **useContactStore** — Contact form fields
- **useUiStore** — Zoom, modals, errors, canvas dimensions

### Key Directories

```
src/
├── components/    # UI (canvas/, sidebar/, upload/, config/, checkout/, print/)
├── stores/        # Zustand stores
├── services/      # PDF generation, inquiry/email service, image utilities
├── hooks/         # useImageDimensions, usePricing
├── router/        # Route definitions and guards
├── types/         # TypeScript types (LogoObject, RefinementType, ContactFormData)
└── lib/           # Constants, pricing logic, URL parser
api/
└── send-inquiry.ts  # Vercel serverless function (Resend email)
```

### Inquiry Flow

1. Product images come from URL params (`?images=img1,img2,img3,img4&sizes=S,M,L&price=25`)
2. First 4 images map to views: Vorderseite, Links, Rechts, Rückseite
3. User configures logos, positions, refinement types, quantities
4. On checkout: client generates PDF from PrintableQuote, sends to `/api/send-inquiry`
5. Email with PDF attachment goes to `office@kp-workwear.com`

## Conventions

- Path alias: `@/*` maps to `src/*`
- UI language: German (`lang="de"`)
- Strict TypeScript: no unused locals/params, no fallthrough cases
- Tailwind for all styling
- Refinement types: `Stick` (embroidery) and `Druck` (print)
- Pricing: Stick €5/item (MOQ 5), Druck €3/item
