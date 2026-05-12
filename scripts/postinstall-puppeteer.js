/**
 * Avoid failing `npm ci` on minimal VPS images when Chrome is not needed at install time.
 * Set PUPPETEER_SKIP_DOWNLOAD=1 (recommended in production) or rely on CI=true.
 */
const { execSync } = require('child_process');

const skip =
  process.env.PUPPETEER_SKIP_DOWNLOAD === '1' ||
  process.env.CI === 'true' ||
  process.env.NODE_ENV === 'production';

if (skip) {
  console.log(
    '[postinstall] Skipping Puppeteer browser download (PUPPETEER_SKIP_DOWNLOAD/CI/production).',
  );
  process.exit(0);
}

try {
  execSync('npx puppeteer browsers install chrome', { stdio: 'inherit' });
} catch (e) {
  console.warn(
    '[postinstall] Puppeteer browser install failed; coupon PDF may need Chrome/Chromium on the server.',
    (e && e.message) || e,
  );
  process.exit(0);
}
