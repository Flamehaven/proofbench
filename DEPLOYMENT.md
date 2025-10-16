# ProofBench 3.7.2 Production Deployment Guide

## Overview

ProofBench is a hybrid proof verification system combining symbolic (Pyodide/SymPy) and semantic (LLM consensus) reasoning. This guide covers production deployment procedures.

## Architecture

- **Frontend**: React 18.3.1 + TypeScript 5.5.3
- **Build Tool**: Vite 5.3.3
- **Styling**: Emotion 11.14 (CSS-in-JS)
- **State Management**: TanStack Query 5.90.2
- **Testing**: Vitest 2.0.1 (21/21 tests passing)
- **Documentation**: Storybook 9.1.10

## Prerequisites

### System Requirements
- Node.js 20.x or higher
- npm 10.x or higher
- 2GB+ RAM for build process
- Git for version control

### Production Environment
- Static file hosting (Netlify, Vercel, AWS S3, Nginx, etc.)
- HTTPS enabled
- CDN recommended for global distribution
- Backup strategy for build artifacts

## Environment Configuration

### Step 1: Copy Environment Template
```bash
cp .env.example .env
```

### Step 2: Configure Production Variables

Edit `.env` with production values:

```bash
# Production API endpoint
VITE_API_BASE_URL=https://api.proofbench.your-domain.com/api/v1

# Production API key (obtain from backend team)
VITE_API_KEY=your-production-api-key-here

# Set to production mode (disables MSW mocking)
VITE_API_MODE=production

# Optional: API timeout (default 30000ms)
VITE_API_TIMEOUT=30000

# Optional: Disable API debug logs in production
VITE_API_DEBUG=false
```

### Step 3: Verify Configuration

Check that all variables are set correctly:
```bash
cat .env | grep -v "^#" | grep -v "^$"
```

## Build Process

### Development Build (with hot reload)
```bash
npm install
npm run dev
```
Access at: http://localhost:5173

### Production Build
```bash
# Install dependencies
npm ci

# Run type checking
npx tsc --noEmit

# Run tests
npm run test

# Build for production
npm run build
```

Build output: `dist/` directory (213.22 kB gzipped)

### Verify Build
```bash
# Preview production build locally
npm run preview
```
Access at: http://localhost:4173

## Deployment Options

### Option 1: Static File Server (Nginx)

1. **Build the application**:
```bash
npm run build
```

2. **Copy dist/ to web server**:
```bash
scp -r dist/* user@server:/var/www/proofbench/
```

3. **Nginx configuration** (`/etc/nginx/sites-available/proofbench`):
```nginx
server {
    listen 443 ssl http2;
    server_name proofbench.your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    root /var/www/proofbench;
    index index.html;

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

4. **Enable and restart**:
```bash
sudo ln -s /etc/nginx/sites-available/proofbench /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Option 2: Netlify

1. **Install Netlify CLI**:
```bash
npm install -g netlify-cli
```

2. **Build and deploy**:
```bash
npm run build
netlify deploy --prod --dir=dist
```

3. **Or configure `netlify.toml`**:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Option 3: Vercel

1. **Install Vercel CLI**:
```bash
npm install -g vercel
```

2. **Deploy**:
```bash
vercel --prod
```

3. **Or configure `vercel.json`**:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Option 4: AWS S3 + CloudFront

1. **Build application**:
```bash
npm run build
```

2. **Upload to S3**:
```bash
aws s3 sync dist/ s3://proofbench-production/ --delete
```

3. **Configure CloudFront** for SPA routing and HTTPS

4. **Invalidate cache**:
```bash
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

## CI/CD Pipeline

### GitHub Actions Workflow

The project includes `.github/workflows/ci-cd.yml` with automated:

- **Code Quality**: TypeScript type checking on every push
- **Testing**: 21 unit/integration tests with coverage reports
- **Storybook Build**: Component documentation verification
- **Staging Deployment**: Automatic on `develop` branch
- **Production Deployment**: Manual approval on `main` branch

### Required GitHub Secrets

Configure in repository Settings > Secrets and variables > Actions:

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `VITE_API_BASE_URL` | Production API endpoint | `https://api.proofbench.com/api/v1` |
| `VITE_API_KEY` | Production API key | `prod-key-abc123...` |
| `STAGING_API_BASE_URL` | Staging API endpoint | `https://staging-api.proofbench.com/api/v1` |
| `STAGING_API_KEY` | Staging API key | `staging-key-xyz789...` |

### Deployment Workflow

1. **Development**: Work on feature branches
2. **Pull Request**: Create PR to `develop` branch
3. **CI Checks**: Automated quality, tests, Storybook build
4. **Merge to Develop**: Triggers staging deployment
5. **Testing on Staging**: Verify functionality
6. **Merge to Main**: Create PR from `develop` to `main`
7. **Production Build**: Automated build on main branch
8. **Manual Approval**: Review and approve production deployment
9. **Deploy**: Production deployment with zero downtime

## Post-Deployment Verification

### Health Checks

1. **Application loads**:
```bash
curl -I https://proofbench.your-domain.com
```
Expected: HTTP 200 OK

2. **API connectivity**:
```bash
curl https://proofbench.your-domain.com/api/v1/health
```
Expected: JSON response with backend status

3. **Static assets**:
```bash
curl -I https://proofbench.your-domain.com/assets/index-*.js
```
Expected: HTTP 200 with proper cache headers

### Functional Testing

1. Navigate to dashboard: `/`
2. Verify proof run list loads
3. Click on a proof run to see details
4. Check LII/LCI metrics display
5. Verify step-by-step analysis panels
6. Test justification graph rendering
7. Submit a test proof for verification

### Performance Monitoring

- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3.5s
- **Bundle Size**: ~213 kB (within target)
- **Lighthouse Score**: Aim for 90+ in all categories

## Rollback Procedure

### Quick Rollback (Nginx/Static Server)

1. **Keep previous build**:
```bash
mv dist dist-backup-v3.7.1
```

2. **Deploy new version**:
```bash
npm run build
mv dist dist-v3.7.2
ln -sf dist-v3.7.2 dist
```

3. **Rollback if needed**:
```bash
ln -sf dist-backup-v3.7.1 dist
sudo systemctl restart nginx
```

### Git-Based Rollback

1. **Identify last working commit**:
```bash
git log --oneline
```

2. **Revert to previous version**:
```bash
git revert <commit-hash>
git push origin main
```

3. **CI/CD will auto-redeploy**

## Security Checklist

- [ ] HTTPS enabled with valid certificate
- [ ] Environment variables not committed to Git
- [ ] API keys rotated and stored securely
- [ ] CORS configured on backend API
- [ ] CSP (Content Security Policy) headers set
- [ ] Dependency vulnerabilities checked (`npm audit`)
- [ ] Secrets stored in GitHub Secrets (not in code)
- [ ] Access logs enabled for audit trail
- [ ] Backup strategy implemented

## Monitoring and Logging

### Recommended Tools

- **Error Tracking**: Sentry, Rollbar
- **Performance**: Google Analytics, Mixpanel
- **Uptime**: UptimeRobot, Pingdom
- **Logs**: CloudWatch, Papertrail, Loggly

### Setup Example (Sentry)

1. Install SDK:
```bash
npm install @sentry/react
```

2. Initialize in `src/main.tsx`:
```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: import.meta.env.MODE,
  tracesSampleRate: 0.1,
});
```

## Troubleshooting

### Build Fails

**Problem**: `tsc` type errors
**Solution**: Run `npx tsc --noEmit` to see detailed errors

**Problem**: Out of memory during build
**Solution**: Increase Node memory: `NODE_OPTIONS=--max_old_space_size=4096 npm run build`

### Runtime Errors

**Problem**: "Cannot connect to API"
**Solution**: Check `VITE_API_BASE_URL` is correct and backend is running

**Problem**: Blank white screen
**Solution**: Check browser console for errors, verify all assets loaded

### Performance Issues

**Problem**: Slow initial load
**Solution**: Enable CDN, verify gzip/brotli compression, use code splitting

**Problem**: High memory usage
**Solution**: Check for memory leaks in React components, optimize large data rendering

## Support and Maintenance

- **Bug Reports**: Create GitHub issues with reproduction steps
- **Feature Requests**: Submit to product team for roadmap consideration
- **Security Issues**: Email security@your-domain.com (do not create public issues)
- **Documentation**: Update this file when deployment process changes

## Version History

- **v3.7.2** (2025-10-16): Production-ready release with complete CI/CD pipeline
  - 21/21 tests passing
  - TypeScript compilation successful
  - Storybook documentation complete
  - All Phase 1-3 tasks completed

---

**Last Updated**: 2025-10-16
**Maintained By**: ProofBench DevOps Team
