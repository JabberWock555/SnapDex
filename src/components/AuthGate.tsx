import React, { useState } from 'react';
import { GoogleAuthProvider, signInWithPopup, signInWithCredential } from 'firebase/auth';
import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { Aperture, LogIn } from 'lucide-react';
import { auth } from '../lib/firebase';

async function googleSignIn() {
  if (Capacitor.isNativePlatform()) {
    // Native Android/iOS — use the Capacitor plugin for proper OAuth flow
    const result = await FirebaseAuthentication.signInWithGoogle();
    const idToken = result.credential?.idToken;
    if (!idToken) throw new Error('No ID token returned from Google Sign-In');
    // Link the native result with the Firebase Web SDK so onAuthStateChanged fires
    const credential = GoogleAuthProvider.credential(idToken);
    await signInWithCredential(auth, credential);
  } else {
    // Web browser — popup works fine
    await signInWithPopup(auth, new GoogleAuthProvider());
  }
}

export default function AuthGate() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await googleSignIn();
    } catch (err) {
      console.error('Sign-in failed:', err);
      setError('Sign-in failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#171717] flex flex-col items-center justify-center px-6">
      <div className="flex items-center gap-3 mb-10">
        <Aperture className="w-10 h-10 text-blue-500" />
        <h1 className="text-3xl font-bold text-white tracking-tight">SnapDex</h1>
      </div>

      <div className="w-full max-w-sm bg-[#181818] border border-gray-800 rounded-2xl p-8 flex flex-col items-center gap-6">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-white mb-2">Welcome back</h2>
          <p className="text-sm text-gray-400">Sign in to access your scanned contacts across devices.</p>
        </div>

        {error && (
          <p className="text-sm text-red-400 bg-red-900/30 border border-red-800 rounded-lg px-4 py-2 w-full text-center">
            {error}
          </p>
        )}

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white text-gray-900 rounded-xl font-medium hover:bg-gray-100 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          {loading ? (
            <span className="text-sm">Signing in...</span>
          ) : (
            <>
              {/* Google "G" SVG */}
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.35-8.16 2.35-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              <span className="text-sm">Continue with Google</span>
              <LogIn className="w-4 h-4 ml-auto" />
            </>
          )}
        </button>
      </div>

      <p className="mt-6 text-xs text-gray-600 text-center max-w-xs">
        Your contacts are stored privately and only accessible to you.
      </p>
    </div>
  );
}
