# max-mani infra

CDK app for the maxmanicure.com static site + contact-form Lambda.

## One-time setup

```bash
cd infra
cp config.example.ts config.local.ts   # then edit with real account / zone / emails
pnpm install
pnpm cdk bootstrap aws://$(node -e "console.log(require('./config.local').localConfig.account)")/us-east-1 --profile maxmani
```

`config.local.ts` is gitignored — it holds the AWS account ID, Route 53 hosted zone ID, and SES sender/recipient emails. See `config.example.ts` for the schema.

## Deploy

From the repo root:

```bash
pnpm build                          # astro build -> dist/
cd infra
pnpm cdk diff --profile maxmani     # review changes
pnpm cdk deploy --profile maxmani
```

On the very first deploy, the stack outputs `ContactFunctionUrl`. Paste it into
`LAMBDA_SUBMIT_URL` in `src/lib/config.ts`, then run `pnpm build && pnpm cdk deploy --profile maxmani` once more so the rebuilt site ships with the real Lambda URL.

## Stack

`MaxManiSite` in `us-east-1` (account from `config.local.ts`):

- S3 bucket (private) for built site
- CloudFront distribution with OAC, aliased to `maxmanicure.com` + `www.maxmanicure.com`
- ACM cert (us-east-1) DNS-validated via the Route 53 hosted zone
- Route 53 A/AAAA aliases for apex + www
- CloudFront Function that rewrites pretty URLs to `/index.html`
- Contact-form Lambda (Node 20) behind a Function URL with CORS, IAM-scoped to `ses:SendEmail` on the verified SES identities

## Domain / SES

- Hosted zone: `maxmanicure.com`, auto-created by Route 53 Registrar (zone ID in `config.local.ts`)
- SES identities (us-east-1) must be verified before the Lambda can send — both FROM and TO addresses are set in `config.local.ts`
