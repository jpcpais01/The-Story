import "server-only";
import { getApps, initializeApp, cert, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

export const isFirebaseAdminConfigured = Boolean(projectId && clientEmail && privateKey);

let app: App | null = null;
let adminDb: Firestore | null = null;

if (isFirebaseAdminConfigured) {
  app =
    getApps()[0] ??
    initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    });
  adminDb = getFirestore(app);
}

// Deliberately does NOT import firebase-admin/auth here -- that pulls in
// jwks-rsa/jose, and every *.server.ts read (used by nearly every page)
// imports this module. Auth-only routes should import from ./admin-auth
// instead, so a problem in that dependency chain can't take down public reads.
export { app, adminDb };
