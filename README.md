# Mountains, Lakes & Waterfalls of Bangladesh

Interactive 3D terrain viewer built with [Procedural GL JS](https://github.com/felixpalmer/procedural-gl-js).

## Local Development

1. Get a free API key from [OpenTopography](https://opentopography.org/)
2. Clone the repo and create your `.env` file:
   ```bash
   cp .env.example .env
   # Edit .env and paste your API key
   ```
3. Install and run:
   ```bash
   npm install
   npm run dev
   ```

## Deploy to GitHub Pages

Your API key is kept out of the repo using **GitHub Secrets**:

1. Go to your repo → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Name: `VITE_API_KEY`, Value: your OpenTopography key
4. Go to **Settings** → **Pages** → set Source to **GitHub Actions**
5. Push to `main` — the workflow builds and deploys automatically

## Important Note on API Key Visibility

The `.env` / GitHub Secrets approach keeps the key **out of your source code and git history**. However, because this is a client-side app, the key is embedded in the built JavaScript served to browsers. Anyone inspecting the page can find it. For a free, rate-limited key like OpenTopography's, this is generally acceptable. If you need true key protection, you would need a server-side proxy.
