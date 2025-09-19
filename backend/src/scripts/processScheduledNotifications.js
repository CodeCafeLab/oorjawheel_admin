import dotenv from 'dotenv';
dotenv.config();

import { getScheduledNotifications, markNotificationAsSent } from '../models/notificationModel.js';
import { sendFcmMessage } from '../services/fcmService.js';

const TEST_FCM_TOKEN = process.env.TEST_FCM_TOKEN || null;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function processOne(n) {
  const token = TEST_FCM_TOKEN;
  if (!token) {
    // eslint-disable-next-line no-console
    console.warn(`Skip notification ${n.id}: no TEST_FCM_TOKEN set`);
    return { id: n.id, status: 'skipped', reason: 'no_token' };
  }
  const isImage = Boolean(n.image_url);
  const type = isImage ? 'image' : 'text';
  const title = n.title;
  const description = n.description || '';
  const image = n.image_url || undefined;
  await sendFcmMessage({ type, title, description, image, token });
  await markNotificationAsSent(n.id);
  return { id: n.id, status: 'sent' };
}

async function main() {
  const items = await getScheduledNotifications();
  if (!items.length) {
    // eslint-disable-next-line no-console
    console.log('No scheduled notifications to process');
    return;
  }
  // eslint-disable-next-line no-console
  console.log(`Processing ${items.length} scheduled notifications...`);

  const concurrency = 3;
  const queue = items.slice();
  const results = [];

  async function worker() {
    while (queue.length) {
      const n = queue.shift();
      try {
        const r = await processOne(n);
        results.push(r);
      } catch (err) {
        results.push({ id: n.id, status: 'failed', error: err.message });
      }
      await sleep(50);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, () => worker()));
  // eslint-disable-next-line no-console
  console.log('Done', results);
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});


