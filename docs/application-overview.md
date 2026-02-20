# 💻 Application Overview

## Data model

The application contains the following models:

- User - can have one of these roles:
  - `ADMIN` can:
    - create/edit action plans
    - upload/complete appointments
    - cancel appointments that regular user cant cancel (< 24 h)
    - creata and assign rdns
  - `USER` - can:
    - create/delete files
    - book services
    - cancel appointments
    - view action plans

- Action Plan: represents a plan created by `ADMIN` for user based on data

## Get Started

Prerequisites:

- Bun 1.3+

To set up the app execute the following commands.

```bash
cp .env.example .env
bun install
```

##### `bun run dev`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

##### `bun run build`

Builds the app for production to the `dist` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

See the section about [deployment](https://vitejs.dev/guide/static-deploy) for more information.
