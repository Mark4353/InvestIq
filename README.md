# InvestIQ

React + TypeScript + Vite app with an Express API for auth and transactions.

## Local development

Create a `.env` file from `.env.example`, then run:

```sh
npm run dev
```

This starts both the Express API on `http://localhost:5000` and the Vite client.

## Build

```sh
npm run build
```

## Deploy

```sh
npm run deploy
```

GitHub Pages serves only the frontend. For auth and transaction APIs in production, deploy the server separately and set `VITE_API_BASE` to that backend URL.
