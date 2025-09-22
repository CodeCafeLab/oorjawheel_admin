import { getAdminNotificationSettings } from '@/actions/settings'

export type FirebaseClientConfig = {
  apiKey: string
  authDomain: string
  projectId: string
  storageBucket: string
  messagingSenderId: string
  appId: string
  measurementId?: string
  vapidKey?: string
}

export async function getClientFirebaseConfig(): Promise<FirebaseClientConfig | null> {
  try {
    const n = await getAdminNotificationSettings()
    if (n && n.firebase_api_key) {
      return {
        apiKey: n.firebase_api_key,
        authDomain: n.firebase_auth_domain,
        projectId: n.firebase_project_id,
        storageBucket: n.firebase_storage_bucket,
        messagingSenderId: n.firebase_sender_id || n.firebase_project_number,
        appId: n.firebase_app_id,
        measurementId: n.firebase_measurement_id,
        vapidKey: n.firebase_vapid_key,
      }
    }
  } catch {}

  // Fallback to env
  if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
    return {
      apiKey: String(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
      authDomain: String(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || ''),
      projectId: String(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || ''),
      storageBucket: String(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || ''),
      messagingSenderId: String(process.env.NEXT_PUBLIC_FIREBASE_SENDER_ID || ''),
      appId: String(process.env.NEXT_PUBLIC_FIREBASE_APP_ID || ''),
      measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    }
  }

  return null
}


