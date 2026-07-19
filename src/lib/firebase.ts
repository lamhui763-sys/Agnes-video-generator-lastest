/**
 * Firebase is now FULLY OPTIONAL.
 * This app no longer depends on Google AI Studio / Gen Lang Client.
 * All core features work with localStorage + Catbox only.
 * 
 * If you want to use your own Firebase later, set the env vars or replace the config.
 * Currently everything is stubbed so the app never tries to connect to the old AI Studio project.
 */

// Stub implementations so the rest of the app doesn't crash
export const db: any = {
  // no-op stubs
};

export const auth: any = {
  currentUser: null,
  onAuthStateChanged: (cb: any) => {
    // Immediately call with null (guest mode)
    setTimeout(() => cb(null), 0);
    return () => {};
  },
};

export const googleProvider: any = {};

export function signInWithPopup(_auth: any, _provider: any) {
  console.warn('[Firebase] Auth is disabled (detached from AI Studio). Using local/guest mode.');
  return Promise.reject(new Error('Firebase Auth is disabled. App runs in local mode.'));
}

export function signOut(_auth: any) {
  return Promise.resolve();
}

export function onAuthStateChanged(_auth: any, callback: (user: any) => void) {
  // Always run as guest
  setTimeout(() => callback(null), 0);
  return () => {};
}

// Keep the old config commented for reference if user wants to reconnect their own project later
/*
const firebaseConfig = {
  projectId: "YOUR_OWN_PROJECT_ID",
  appId: "YOUR_APP_ID",
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  // Do NOT use AI Studio named databaseId
};
*/
