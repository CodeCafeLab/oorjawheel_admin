/* global importScripts */
// Firebase Messaging service worker for background notifications
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

// Firebase config - will be injected at build time
const firebaseConfig = {
  apiKey: "AIzaSyB38lw_nFnx8es2Pmy8D0O-dPYQH_HnEQw",
  authDomain: "oorjawheel-db6ab.firebaseapp.com",
  projectId: "oorjawheel-db6ab",
  storageBucket: "oorjawheel-db6ab.firebasestorage.app",
  messagingSenderId: "461129703137",
  appId: "1:461129703137:web:f18212eda3c4eefaa3a1a0"
};

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


