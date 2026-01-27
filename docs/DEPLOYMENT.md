# Deployment Guide for /docs

The documentation site is served at `jaspertech.org/docs` as a subdirectory of the main site.

## Configuration

- **URL:** `https://jaspertech.org`
- **Base URL:** `/docs/`
- **Full docs URL:** `https://jaspertech.org/docs`

## Deployment Options

### Option 1: Build as part of main site (Recommended)

1. **Add docs build to main site's build process:**

   Update your main site's `package.json`:
   ```json
   {
     "scripts": {
       "build": "tsc -b && vite build",
       "build:docs": "cd docs && npm ci && npm run build",
       "build:all": "npm run build:docs && npm run build && npm run copy:docs",
       "copy:docs": "cp -r docs/build/* public/docs/"
     }
   }
   ```

2. **Netlify build settings:**
   - **Build command:** `npm run build:all`
   - **Publish directory:** `dist` (or your main site's output)

3. **Ensure `public/docs/` exists** and contains the built docs

### Option 2: Separate build, copy manually

1. **Build docs:**
   ```bash
   cd docs
   npm ci
   npm run build
   ```

2. **Copy to main site:**
   ```bash
   cp -r docs/build/* public/docs/
   ```

3. **Commit and push** - Netlify will deploy

### Option 3: Netlify build hook

Configure Netlify to build both:

1. **Main site build command:** `npm run build && cd docs && npm ci && npm run build && cd .. && cp -r docs/build dist/docs`
2. **Publish directory:** `dist`

## Redirects

The `public/_redirects` file includes:
```
/docs/*    /docs/index.html   200
```

This ensures all `/docs/*` routes serve the Docusaurus SPA correctly.

## Troubleshooting

### Docs show 404

- Verify `baseUrl: '/docs/'` in `docusaurus.config.ts`
- Check that docs are built to `docs/build/`
- Ensure docs are copied to `public/docs/` or `dist/docs/`
- Verify redirects are configured correctly

### Assets not loading

- Check that `baseUrl` includes trailing slash: `/docs/`
- Verify asset paths in build output
- Check browser console for 404 errors

### Build fails

- Ensure Node 20.x is used
- Run `npm ci` in docs directory first
- Check for TypeScript errors
