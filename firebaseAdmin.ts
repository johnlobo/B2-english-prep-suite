import { initializeApp, cert, getApps, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

// Service account credentials, base64-encoded to avoid JSON-in-env-var quoting/newline issues.
// Generate one in the Firebase Console: Project Settings > Service Accounts > Generate new
// private key, then `base64 -w0 service-account.json` (or equivalent) into
// FIREBASE_SERVICE_ACCOUNT_KEY_BASE64. Without it, requireAuth/requireAdmin fail closed (500)
// rather than silently allowing unauthenticated requests through.
function loadServiceAccount(): object | null {
  const base64 = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64;
  if (!base64) return null;
  try {
    return JSON.parse(Buffer.from(base64, 'base64').toString('utf-8'));
  } catch (err) {
    console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY_BASE64:', err);
    return null;
  }
}

const serviceAccount = loadServiceAccount();

let app: App | null = null;
if (serviceAccount) {
  app = getApps()[0] ?? initializeApp({ credential: cert(serviceAccount as any) });
} else {
  console.error(
    'FIREBASE_SERVICE_ACCOUNT_KEY_BASE64 is not set — server-side auth (requireAuth/requireAdmin) will reject every request.'
  );
}

export const adminAuth: Auth | null = app ? getAuth(app) : null;
export const adminDb: Firestore | null = app ? getFirestore(app) : null;
