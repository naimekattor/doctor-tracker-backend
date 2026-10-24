import 'dotenv/config';

/**
 * Render Keep-Alive Ping Script
 * Periodically sends GET /api/health to prevent Render free tier from sleeping.
 * Render idle sleep threshold: 15 minutes.
 * Ping interval: 12 minutes (720,000 ms).
 */

const TARGET_URL = process.env.RENDER_EXTERNAL_URL || process.env.PUBLIC_API_URL || process.env.API_URL || 'https://doctor-tracker-api.onrender.com';
const INTERVAL_MS = parseInt(process.env.KEEP_ALIVE_INTERVAL_MS, 10) || 12 * 60 * 1000; // 12 minutes

const cleanUrl = TARGET_URL.replace(/\/+$/, '');
const healthEndpoint = `${cleanUrl}/api/health`;

async function ping() {
  const timestamp = new Date().toISOString();
  try {
    const t0 = performance.now();
    const res = await fetch(healthEndpoint, {
      headers: {
        'User-Agent': 'DoctorTracker-KeepAlive/1.0',
      },
    });
    const duration = (performance.now() - t0).toFixed(0);

    if (res.ok) {
      console.log(`[${timestamp}] ✓ Keep-alive ping successful: HTTP ${res.status} (${duration}ms) -> ${healthEndpoint}`);
    } else {
      console.warn(`[${timestamp}] ⚠ Keep-alive ping returned non-200: HTTP ${res.status} (${duration}ms)`);
    }
  } catch (err) {
    console.error(`[${timestamp}] ✗ Keep-alive ping error: ${err.message}`);
  }
}

console.log('====================================================');
console.log('   DOCTOR TRACKER — RENDER KEEP-ALIVE WORKER        ');
console.log('====================================================');
console.log(`Target Endpoint: ${healthEndpoint}`);
console.log(`Interval:        ${INTERVAL_MS / 60000} minutes`);
console.log('Worker started. Press Ctrl+C to terminate.\n');

// Initial ping on start
ping();

// Recurring timer
setInterval(ping, INTERVAL_MS);
