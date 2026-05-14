import { Capacitor } from '@capacitor/core';

export const initAnalytics = async () => {
  // Analytics only works on native (Android/iOS) via google-services.json
  // Nothing to initialize on web
};

export const logEvent = async (name: string, params: any = {}) => {
  if (!Capacitor.isNativePlatform()) return;
  try {
    const { FirebaseAnalytics } = await import('@capacitor-community/firebase-analytics');
    await FirebaseAnalytics.logEvent({ name, params });
  } catch (e) {
    console.error('Failed to log analytics event', e);
  }
};

export const setUserId = async (userId: string) => {
  if (!Capacitor.isNativePlatform()) return;
  try {
    const { FirebaseAnalytics } = await import('@capacitor-community/firebase-analytics');
    await FirebaseAnalytics.setUserId({ userId });
  } catch (e) {
    console.error('Failed to set user id', e);
  }
};

export const setUserProperty = async (name: string, value: string) => {
  if (!Capacitor.isNativePlatform()) return;
  try {
    const { FirebaseAnalytics } = await import('@capacitor-community/firebase-analytics');
    await FirebaseAnalytics.setUserProperty({ name, value });
  } catch (e) {
    console.error('Failed to set user property', e);
  }
};

export const setScreenName = async (screenName: string) => {
  if (!Capacitor.isNativePlatform()) return;
  try {
    const { FirebaseAnalytics } = await import('@capacitor-community/firebase-analytics');
    await FirebaseAnalytics.setScreenName({ screenName });
  } catch (e) {
    console.error('Failed to set screen name', e);
  }
};
