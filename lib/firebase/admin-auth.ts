import "server-only";
import { getAuth, type Auth } from "firebase-admin/auth";
import { app, isFirebaseAdminConfigured } from "./admin";

// Isolated from admin.ts on purpose -- only the routes that actually verify
// ID tokens should pay for loading this (see the comment in admin.ts).
export const adminAuth: Auth | null = isFirebaseAdminConfigured && app ? getAuth(app) : null;
