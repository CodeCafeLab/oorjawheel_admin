// Firebase client SDK (web) setup for Messaging
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';

// Firebase web app config from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const firebaseApp = initializeApp(firebaseConfig);

export async function getMessagingToken(vapidKey) {
  const supported = await isSupported();
  if (!supported) return null;

  const messaging = getMessaging(firebaseApp);
  try {
    const token = await getToken(messaging, { 
      vapidKey,
      serviceWorkerRegistration: await navigator.serviceWorker.register('/firebase-messaging-sw.js')
    });
    return token || null;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error getting FCM token', error);
    return null;
  }
}

export function onForegroundMessage(callback) {
  return isSupported().then((supported) => {
    if (!supported) return () => {};
    const messaging = getMessaging(firebaseApp);
    return onMessage(messaging, (payload) => callback(payload));
  });
}


