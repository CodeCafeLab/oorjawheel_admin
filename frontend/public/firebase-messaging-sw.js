/* global importScripts */
// Firebase Messaging service worker for background notifications
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

// Firebase config - will be injected at build time or fetched from server
const firebaseConfig = {
  apiKey: "AIzaSyB38lw_nFnx8es2Pmy8D0O-dPYQH_HnEQw",
  authDomain: "oorjawheel-db6ab.firebaseapp.com",
  projectId: "oorjawheel-db6ab",
  storageBucket: "oorjawheel-db6ab.firebasestorage.app",
  messagingSenderId: "461129703137",
  appId: "1:461129703137:web:f18212eda3c4eefaa3a1a0"
};

// Try to fetch config from the server if we're on the production URL
if (self.location.hostname === 'ow.codecafelab.in') {
  fetch('https://ow.codecafelab.in/api/settings/notifications')
    .then(response => response.json())
    .then(data => {
      if (data && data.data) {
        const config = {
          apiKey: data.data.firebase_api_key,
          authDomain: data.data.firebase_auth_domain,
          projectId: data.data.firebase_project_id,
          storageBucket: data.data.firebase_storage_bucket,
          messagingSenderId: data.data.firebase_sender_id || data.data.firebase_project_number,
          appId: data.data.firebase_app_id
        };
        // Re-initialize with the fetched config
        firebase.initializeApp(config);
      }
    })
    .catch(err => console.error('Failed to fetch Firebase config:', err));
}

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Background message received:', payload);
  
  const { notification = {}, data = {} } = payload;
  const title = notification.title || 'Notification';
  const options = {
    body: notification.body || '',
    icon: '/favicon.ico',
    image: notification.image || data.image,
    data: data || {},
    badge: '/favicon.ico'
  };
  
  self.registration.showNotification(title, options);
});


