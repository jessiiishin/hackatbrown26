# Deploying Munch (Frontend + Backend)

Deploy the **backend** first so you have an API URL, then build and deploy the **frontend** with that URL.

---

## 1. Deploy the backend (e.g. Render)

### Option A: Render (recommended, free tier)

1. **Sign up**: [render.com](https://render.com) (GitHub login is easiest).

2. **New Web Service**:
   - Dashboard → **New** → **Web Service**.
   - Connect your GitHub repo and select this repository.

3. **Configure the service**:
   - **Name**: e.g. `munch-api` (or any name).
   - **Root Directory**: `backend`.
   - **Runtime**: **Node**.
   - **Build Command**: `npm install`.
   - **Start Command**: `npm start`.
   - **Instance type**: Free.

4. **Environment variables** (in Render dashboard → **Environment**):
   - `GOOGLE_PLACES_API_KEY` = your Google Cloud API key (Places + Distance Matrix + Directions enabled).

5. **Create Web Service**. Render will build and deploy. Note the URL, e.g.:
   - `https://munch-api.onrender.com`

6. **Test**: Open `https://your-service.onrender.com/places/restaurants?city=Providence&budgetTier=$` in a browser. You should get JSON (or an error that mentions API key, not 404).

---

### Option B: Railway, Fly.io, or Heroku

- **Railway**: Connect repo, set root to `backend`, add `GOOGLE_PLACES_API_KEY`, deploy.
- **Fly.io**: Use a `Dockerfile` or `fly.toml` in `backend/`; set env with `fly secrets set GOOGLE_PLACES_API_KEY=...`.
- **Heroku**: `heroku create`, set root/buildpack for Node, then `heroku config:set GOOGLE_PLACES_API_KEY=...` and deploy.

Use the **backend URL** from whichever option you chose (e.g. `https://munch-api.onrender.com`) in the next step.

---

## 2. Deploy the frontend (GitHub Pages)

The frontend already uses **gh-pages** and **munchymunchy.tech** (see `CNAME`). You only need to point it at your deployed backend.

### 2.1 Set the API URL and build

The app uses `VITE_API_URL` for all API calls. Set it to your **backend URL** (no trailing slash).

**Option 1 – One-off build from your machine**

In the **frontend** folder, set the variable and build:

```bash
cd frontend
# Windows (PowerShell)
$env:VITE_API_URL="https://YOUR-BACKEND-URL.onrender.com"; $env:VITE_GOOGLE_MAPS_API_KEY="YOUR_GOOGLE_MAPS_KEY"; npm run build

# macOS / Linux
VITE_API_URL=https://YOUR-BACKEND-URL.onrender.com VITE_GOOGLE_MAPS_API_KEY=your_key npm run build
```

Replace:
- `YOUR-BACKEND-URL.onrender.com` with your real backend URL (e.g. `munch-api.onrender.com`).
- `your_key` with your Google Maps JavaScript API key.

**Option 2 – Use a `.env.production` file (recommended)**

Create `frontend/.env.production` (do **not** commit real keys if the repo is public; use GitHub Actions secrets instead for CI):

```env
VITE_API_URL=https://YOUR-BACKEND-URL.onrender.com
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_js_api_key
```

Then from `frontend/` run:

```bash
npm run build
```

Vite will use `.env.production` when you run `vite build` (and when `npm run build` runs it).

### 2.2 Deploy to GitHub Pages

From the **project root** (parent of `frontend/`):

```bash
cd frontend
npm run deploy
```

This runs `predeploy` (build) then `gh-pages -d build`, publishing the `build` folder to the `gh-pages` branch. Your site will be at **https://munchymunchy.tech** (or your GitHub Pages URL if you haven’t set up the custom domain).

### 2.3 If you use GitHub Actions (optional)

You can build and deploy on every push to `main` and keep secrets out of the repo:

1. In the repo: **Settings** → **Secrets and variables** → **Actions** → add:
   - `VITE_API_URL` = your backend URL (e.g. `https://munch-api.onrender.com`)
   - `VITE_GOOGLE_MAPS_API_KEY` = your Maps JavaScript API key

2. Create `.github/workflows/deploy.yml` (see below) so the workflow builds with these secrets and deploys the `frontend/build` output to GitHub Pages.

Example workflow (create the file if you want CI deploy):

```yaml
name: Deploy frontend to GitHub Pages
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json
      - name: Install frontend deps
        run: npm ci
        working-directory: frontend
      - name: Build frontend
        run: npm run build
        working-directory: frontend
        env:
          VITE_API_URL: ${{ secrets.VITE_API_URL }}
          VITE_GOOGLE_MAPS_API_KEY: ${{ secrets.VITE_GOOGLE_MAPS_API_KEY }}
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: frontend/build
```

---

## Checklist

| Step | What to do |
|------|------------|
| 1 | Deploy backend (e.g. Render), get URL |
| 2 | Set `GOOGLE_PLACES_API_KEY` on backend |
| 3 | Set `VITE_API_URL` and `VITE_GOOGLE_MAPS_API_KEY` for frontend build |
| 4 | Run `npm run build` in `frontend/` |
| 5 | Run `npm run deploy` from `frontend/` (or use the GitHub Action) |
| 6 | Open https://munchymunchy.tech and test (search, itinerary, map) |

---

## Troubleshooting

- **CORS**: Backend already allows all origins (`Access-Control-Allow-Origin: *`). If you restrict it later, add your frontend origin (e.g. `https://munchymunchy.tech`).
- **API 404**: Confirm backend URL has no trailing slash and that routes match (e.g. `/itinerary`, `/places/restaurants`).
- **Maps not loading**: Ensure `VITE_GOOGLE_MAPS_API_KEY` is set at **build** time and that Maps JavaScript API (and any other required APIs) are enabled in Google Cloud.
- **Render free tier**: The service may sleep after inactivity; the first request after sleep can be slow.
