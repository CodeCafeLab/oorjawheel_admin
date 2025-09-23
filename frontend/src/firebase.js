// Firebase client SDK (web) setup for Messaging
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import { getClientFirebaseConfig } from '@/lib/firebase-config';

let firebaseAppPromise;
async function ensureApp() {
  if (firebaseAppPromise) return firebaseAppPromise;
  firebaseAppPromise = (async () => {
    const cfg = await getClientFirebaseConfig();
    if (!cfg) throw new Error('Firebase config not available');
    return initializeApp(cfg);
  })();
  return firebaseAppPromise;
}

export async function getMessagingToken(vapidKey) {
  const supported = await isSupported();
  if (!supported) return null;
  const app = await ensureApp();
  const messaging = getMessaging(app);
  try {
    const token = await getToken(messaging, { 
      vapidKey: vapidKey || (await getClientFirebaseConfig())?.vapidKey,
      serviceWorkerRegistration: await navigator.serviceWorker.register('/firebase-messaging-sw.js')
    });
    return token || null;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error getting FCM token', error);
    return null;
  }
}

export async function onForegroundMessage(callback) {
  const supported = await isSupported();
  if (!supported) return () => {};
  const app = await ensureApp();
  const messaging = getMessaging(app);
  return onMessage(messaging, (payload) => callback(payload));
}


