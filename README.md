# Max Mani

Static marketing site for Max Mani, a nail salon in Naples, FL.

## Stack

Astro 5 + Tailwind 3 + React 19 (islands only). Static output.

## Develop

```sh
pnpm install
pnpm dev      # http://localhost:4321
```

## Build

```sh
pnpm build    # emits to dist/
pnpm preview  # serves dist/ locally
```

## Deploy

Out of scope for this repo — upload `dist/` to S3 behind CloudFront manually.

## Open items

See `PLAN.md` and the TODO markers in `src/lib/config.ts` for outstanding
values the user still needs to provide (Zaera URLs, Lambda URL, logo, fonts).
