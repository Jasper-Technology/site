# Jasper Documentation

Documentation site for Jasper, built with Docusaurus.

## Local Development

```bash
npm install
npm start
```

The site will be available at `http://localhost:3000`.

## Build

```bash
npm run build
```

This generates static content into the `build` directory.

## Deployment

This site is deployed to Cloudflare Pages at `docs.jaspertech.org`.

### Cloudflare Pages Configuration

**Build Settings:**
- **Build command:** `cd docs && npm ci && npm run build`
- **Output directory:** `docs/build`
- **Root directory:** `/` (root of repository)
- **Node version:** 20.x

### Manual Deployment

If you need to deploy manually:

```bash
cd docs
npm ci
npm run build
# Then upload the build/ directory to Cloudflare Pages
```

## Project Structure

```
docs/
├── docs/              # Documentation markdown files
├── src/               # Source files (CSS, etc.)
├── static/            # Static assets (images, etc.)
├── docusaurus.config.ts  # Docusaurus configuration
└── sidebars.ts        # Sidebar navigation structure
```
