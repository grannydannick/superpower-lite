# Deployment

All deployments are handled by **Vercel**. Environment variables are managed in the Vercel dashboard (sourced from **Doppler**).

## Environments

| Environment | Trigger               | Domain                             | Doppler Config |
| ----------- | --------------------- | ---------------------------------- | -------------- |
| Preview     | Push to any PR branch | Auto-generated `*.vercel.app` URL  | `stg`          |
| Staging     | Push to `main`        | https://app.superpower-staging.com | `stg`          |
| Production  | Manual promotion      | https://app.superpower.com         | `prd`          |

## Vercel Project

- **Team**: `superpowerdotcom`
- **Project**: `superpower-app`
- **GitHub Repo**: `superpowerdotcom/superpower-app`
- **Node Version**: 20.x
- **Framework**: Vite

## CLI Setup

To use the Vercel CLI for promotions or rollbacks:

```bash
# Install and authenticate
bunx vercel login

# Switch to the team
bunx vercel teams switch superpowerdotcom

# Link this repo to the project (one-time)
bunx vercel link
# Select: superpowerdotcom → superpower-app
```

## Preview Deployments

Automatically created for every pull request. Each PR gets a unique `*.vercel.app` URL shown in the PR checks. Uses the same environment variables as staging (Doppler `stg` profile).

## Staging

Staging is a custom pre-production environment in Vercel that tracks the `main` branch. Every push to `main` triggers an automatic deployment.

- URL: https://app.superpower-staging.com

## Production

Production deploys are **manual** -- you promote a verified staging deployment to production. This ensures nothing goes to production without being tested on staging first.

### Via Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/superpowerdotcom/superpower-app)
2. Find the staging deployment you want to promote
3. Click **"Promote to Production"**

### Via CLI

```bash
# List recent deployments
bunx vercel ls

# Promote a specific deployment to production
bunx vercel promote <deployment-url>
```

> Requires CLI setup (see above).

## Rollbacks

To roll back production to a previous deployment:

### Via Dashboard

Go to the [Deployments page](https://vercel.com/superpowerdotcom/superpower-app/deployments), find the previous production deployment, and promote it.

### Via CLI

```bash
# Find the deployment URL you want to roll back to
bunx vercel ls

# Promote it
bunx vercel promote <previous-deployment-url>
```
