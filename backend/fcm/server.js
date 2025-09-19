import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import admin from 'firebase-admin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Initialize Firebase Admin SDK using service account JSON (v1 API)
// Prefer GOOGLE_APPLICATION_CREDENTIALS env; fallback to local service-account.json
const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
  ? path.resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS)
  : path.resolve(__dirname, 'service-account.json');

if (!admin.apps.length) {
  const serviceAccountRaw = fs.readFileSync(credentialsPath, 'utf-8');
  const serviceAccount = JSON.parse(serviceAccountRaw);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'fcm-server', timestamp: new Date().toISOString() });
});

app.post('/send-notification', async (req, res) => {
  try {
    const { type, title, description, image, token } = req.body || {};

    if (!token) {
      return res.status(400).json({ error: 'Missing token' });
    }
    if (!title || !description) {
      return res.status(400).json({ error: 'Missing title or description' });
    }
    if (type !== 'text' && type !== 'image') {
      return res.status(400).json({ error: "type must be 'text' or 'image'" });
    }

    const includeImage = type === 'image' && typeof image === 'string' && image.trim().length > 0;

    // Cross-platform message with proper platform overrides
    const message = {
      token,
      notification: {
        title: title,
        body: description,
        ...(includeImage ? { imageUrl: image } : {}),
      },
      // Web
      webpush: {
        notification: {
          title: title,
          body: description,
          ...(includeImage ? { image: image } : {}),
        },
        fcmOptions: {},
      },
      // Android
      android: {
        notification: {
          title: title,
          body: description,
          ...(includeImage ? { imageUrl: image } : {}),
          channelId: 'default',
          priority: 'HIGH',
        },
        priority: 'high',
      },
      // iOS
      apns: {
        payload: {
          aps: {
            alert: { title: title, body: description },
            sound: 'default',
          },
        },
        fcmOptions: includeImage ? { imageUrl: image } : undefined,
      },
      data: {
        type,
        ...(includeImage ? { image } : {}),
      },
    };

    const id = await admin.messaging().send(message);
    return res.json({ id, status: 'sent' });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('send-notification error', err);
    return res.status(500).json({ error: 'Internal error sending notification' });
  }
});

const PORT = process.env.FCM_PORT || 5055;
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`FCM server running on http://localhost:${PORT}`);
});



