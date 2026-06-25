# SnapFix Frontend

React + Vite frontend for SnapFix.

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure the local backend URL in `.env`:
   ```env
   VITE_API_BASE_URL=http://localhost:8080
   ```

3. Start the dev server:
   ```bash
   npm run dev
   ```

## Vercel Deployment

The production build is configured to call:

```env
VITE_API_BASE_URL=https://snapfix-backend-1k9b.onrender.com
```

Vercel settings:

- Framework Preset: `Vite`
- Install Command: `npm install`
- Build Command: `npm run build`
- Output Directory: `dist`

`vercel.json` rewrites all routes to `index.html`, so React Router paths such as `/citizen/home`, `/worker/tasks`, and `/admin/reports` work after refresh or direct navigation.

## Backend Requirement

The backend must allow the deployed Vercel frontend origin in CORS. After deployment, add your Vercel URL, for example:

```text
https://your-vercel-project.vercel.app
```

If you add a custom domain later, add that domain to backend CORS too.
