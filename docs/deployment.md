# Deployment

## Staging

Staging is deployed automatically via **Vercel** when changes are pushed to `main`.

- URL: https://app.superpower-staging.com
- Feature branch previews are generated automatically for every PR.

## Production

Production is deployed to **AWS CloudFront** manually:

```bash
make deploy/app/prd
```

This must be run from the `main` branch with a clean working tree that is up to date with `origin/main`.
