import dotenv from 'dotenv';
dotenv.config();
const FCM_SERVER_BASE_URL = process.env.FCM_SERVER_BASE_URL || 'http://localhost:5055';
export async function sendFcmMessage({ type, title, description, image, token }) {
    const res = await fetch(`${FCM_SERVER_BASE_URL}/send-notification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, title, description, image, token })
    });
    if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`FCM server error ${res.status}: ${text}`);
    }
    return res.json();
}
