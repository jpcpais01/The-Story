// One-time setup script: grants your Firebase Auth account the `admin` custom
// claim that firestore.rules and the API routes check for.
//
// Usage (after filling in .env.local and creating your admin user in the
// Firebase console under Authentication -> Users):
//   node scripts/set-admin-claim.mjs you@example.com

import "dotenv/config";
import { cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const email = process.argv[2];
if (!email) {
  console.error("Usage: node scripts/set-admin-claim.mjs <admin-email>");
  process.exit(1);
}

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!projectId || !clientEmail || !privateKey) {
  console.error(
    "Missing FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY in .env.local"
  );
  process.exit(1);
}

initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });

const auth = getAuth();
const user = await auth.getUserByEmail(email);
await auth.setCustomUserClaims(user.uid, { admin: true });

console.log(`Granted admin claim to ${email} (uid: ${user.uid}).`);
console.log("Sign out and back in on the site for the new claim to take effect.");
