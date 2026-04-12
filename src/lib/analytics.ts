import { FirebaseAnalytics } from '@capacitor-community/firebase-analytics';
import { Capacitor } from '@capacitor/core';

export const initAnalytics = async () => {
  if (Capacitor.isNativePlatform()) {
    // On native platforms, the configuration is typically picked up from google-services.json / GoogleService-Info.plist
    // But we can still initialize it if needed.
    return;
  }

  // For web, you might need to provide the configuration
  // FirebaseAnalytics.initializeFirebase(firebaseConfig);
};

export const logEvent = async (name: string, params: any = {}) => {
  try {
    await FirebaseAnalytics.logEvent({
      name,
      params,
    });
  } catch (e) {
    console.error('Failed to log analytics event', e);
  }
};

export const setUserId = async (userId: string) => {
  try {
    await FirebaseAnalytics.setUserId({
      userId,
    });
  } catch (e) {
    console.error('Failed to set user id', e);
  }
};

export const setUserProperty = async (name: string, value: string) => {
  try {
    await FirebaseAnalytics.setUserProperty({
      name,
      value,
    });
  } catch (e) {
    console.error('Failed to set user property', e);
  }
};

export const setScreenName = async (screenName: string) => {
  try {
    await FirebaseAnalytics.setScreenName({
      screenName,
    });
  } catch (e) {
    console.error('Failed to set screen name', e);
  }
};
