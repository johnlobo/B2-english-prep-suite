import type { Request, Response, NextFunction } from 'express';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { adminAuth, adminDb } from './firebaseAdmin';

// Mirrors ADMIN_BOOTSTRAP_EMAIL / isAdmin() in src/lib/userSession.ts and firestore.rules — the
// bootstrap admin email is authoritative before any Firestore user doc exists, same as elsewhere.
const ADMIN_BOOTSTRAP_EMAIL = 'admin@b2mastery.es';

export interface AuthedRequest extends Request {
  firebaseUser?: DecodedIdToken;
}

/**
 * Verifies the Firebase ID token in the Authorization: Bearer header. These endpoints previously
 * had no auth of their own and relied entirely on the reverse proxy (nginx + Authelia) to gate
 * access — when Authelia started failing intermittently, that left the app unusable with no
 * fallback. Now the endpoints are self-sufficient: they work whether or not there's anything in
 * front of them at all.
 */
export async function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  if (!adminAuth) {
    return res.status(500).json({ error: 'El servidor no tiene configurado FIREBASE_SERVICE_ACCOUNT_KEY_BASE64.' });
  }

  const match = (req.headers.authorization || '').match(/^Bearer (.+)$/);
  if (!match) {
    return res.status(401).json({ error: 'Falta el token de autenticación.' });
  }

  try {
    req.firebaseUser = await adminAuth.verifyIdToken(match[1]);
    next();
  } catch (err) {
    console.warn('Rejected request with invalid Firebase ID token:', err);
    res.status(401).json({ error: 'Token de autenticación inválido o caducado.' });
  }
}

/** Chain after requireAuth. Same admin definition as isAdmin() in firestore.rules. */
export async function requireAdmin(req: AuthedRequest, res: Response, next: NextFunction) {
  const decoded = req.firebaseUser;
  if (!decoded) {
    return res.status(401).json({ error: 'Falta el token de autenticación.' });
  }
  if (decoded.email === ADMIN_BOOTSTRAP_EMAIL) {
    return next();
  }

  try {
    const userDoc = await adminDb!.collection('users').doc(decoded.uid).get();
    if (userDoc.exists && userDoc.data()?.role === 'admin') {
      return next();
    }
  } catch (err) {
    console.error('Error checking admin role for', decoded.uid, err);
  }

  res.status(403).json({ error: 'Esta acción está reservada a administradores.' });
}
