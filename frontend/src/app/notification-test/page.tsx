'use client';

import { useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, isSupported } from 'firebase/messaging';
import { getClientFirebaseConfig } from '@/lib/firebase-config';

export default function NotificationTestPage() {
  const [token, setToken] = useState<string>('');
  const [permission, setPermission] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [lastNotification, setLastNotification] = useState<any>(null);

  useEffect(() => {
    async function init() {
      try {
        // Request notification permission
        const permissionResult = await Notification.requestPermission();
        setPermission(permissionResult);

        if (permissionResult === 'granted') {
          const cfg = await getClientFirebaseConfig();
          if (!cfg) {
            setError('Firebase credentials not found. Please save credentials in Settings → Notifications.');
            return;
          }
          const app = initializeApp(cfg);
          const messaging = getMessaging(app);

          // Get FCM token
          const fcmToken = await getToken(messaging, { vapidKey: cfg.vapidKey });
          if (fcmToken) {
            setToken(fcmToken);
          } else {
            setError('Failed to get FCM token');
          }
        } else {
          setError('Notification permission denied');
        }
      } catch (err) {
        setError(`Error: ${err instanceof Error ? err.message : String(err)}`);
        console.error('FCM Error:', err);
      }
    }

    init();
  }, []);

  const sendTestNotification = async () => {
    if (!token) {
      setError('No FCM token available');
      return;
    }

    try {
      const base = process.env.NEXT_PUBLIC_FCM_SERVER_BASE_URL || 'http://localhost:5055';
      // FCM server exposes /send-notification
      const response = await fetch(`${base}/send-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          title: 'Test Notification',
          description: 'This is a test notification from your app!',
          type: 'text'
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Notification sent:', result);
        alert('Notification sent successfully!');
      } else {
        const text = await response.text().catch(()=> '');
        setError(`Failed to send notification: ${response.status} ${text}`);
      }
    } catch (err) {
      setError(`Send error: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const copyToken = () => {
    navigator.clipboard.writeText(token);
    alert('Token copied to clipboard!');
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Notification Test</h1>
      
      <div className="space-y-4">
        <div>
          <strong>Permission Status:</strong> {permission || 'Checking...'}
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        {token && (
          <div>
            <strong>FCM Token:</strong>
            <div className="bg-gray-100 p-4 rounded mt-2 break-all text-sm">
              {token}
            </div>
            <button 
              onClick={copyToken}
              className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2"
            >
              Copy Token
            </button>
            <button 
              onClick={sendTestNotification}
              className="mt-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Send Test Notification
            </button>
          </div>
        )}

        {lastNotification && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            <strong>Last Notification:</strong>
            <pre className="mt-2 text-sm">{JSON.stringify(lastNotification, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
