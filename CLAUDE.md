# KPW Textil Veredeler Pro

Professional textile embellishment configurator with AI-powered design tools, Shopify integration, and dynamic pricing.

## Tech Stack

- **Framework:** React 19, TypeScript 5.2 (strict mode)
- **Build:** Vite 5, Tailwind CSS 4
- **State:** Zustand 5 + Zundo (undo/redo, 50 snapshot limit)
- **AI:** Google GenAI SDK (Gemini 2.5 Flash) for blueprint generation and logo analysis
- **Icons:** Lucide React
- **Routing:** React Router 7

## Scripts

```bash
npm run dev       # Vite dev server (localhost:5173)
npm run build     # Production build to dist/
npm run preview   # Preview production build
npm run lint      # ESLint strict (--max-warnings 0)
```

## Environment

- `VITE_GEMINI_API_KEY` — required for Gemini AI features

## Architecture

### Routes

| Route       | Component    | Purpose                                |
|-------------|--------------|----------------------------------------|
| `/`         | Root loader  | Detects Shopify params, redirects      |
| `/upload`   | UploadPage   | Product image / Shopify URL upload     |
| `/config`   | ConfigPage   | Canvas + sidebar for logo placement    |
| `/checkout` | CheckoutPage | Order summary + contact form           |

### State Stores (Zustand)

- **useConfigStore** — Product images, logos, quantities, pricing, blueprint status (with undo/redo)
- **useContactStore** — Contact form fields
- **useUiStore** — Zoom, modals, errors, canvas dimensions

### Key Directories

```
src/
├── components/    # UI (canvas/, sidebar/, upload/, config/, checkout/, print/)
├── stores/        # Zustand stores
├── services/      # Gemini AI service, image utilities
├── hooks/         # useBlueprintGeneration, useImageDimensions, usePricing
├── router/        # Route definitions and guards
├── types/         # TypeScript types (LogoObject, RefinementType, ContactFormData)
└── lib/           # Constants, pricing logic, URL parser
```

## Conventions

- Path alias: `@/*` maps to `src/*`
- UI language: German (`lang="de"`)
- Strict TypeScript: no unused locals/params, no fallthrough cases
- Tailwind for all styling
- Refinement types: `Stick` (embroidery) and `Druck` (print)
- Pricing: Stick €5/item (MOQ 5), Druck €3/item
