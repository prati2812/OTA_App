import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OTA_VERSION_KEY = 'OTA_VERSION';
const BUNDLE_NAME = 'latest.bundle';
const BUNDLE_PATH = `${RNFS.DocumentDirectoryPath}/${BUNDLE_NAME}`;
const LATEST_JSON_URL = 'https://oboukwrotebhzxpuvrev.supabase.co/storage/v1/object/public/ota/latest.json';

interface LatestUpdate {
  version: string;
  bundleUrl: string;
}

const isNewerVersion = (latest: string, current: string | null) => {
  if (!current) return true; // Always update if no current version
  const latestParts = latest.split('.').map(Number);
  const currentParts = current.split('.').map(Number);
  
  for (let i = 0; i < Math.max(latestParts.length, currentParts.length); i++) {
    const l = latestParts[i] || 0;
    const c = currentParts[i] || 0;
    if (l > c) return true;
    if (l < c) return false;
  }
  return false;
};

export const checkForOTAUpdate = async () => {
  console.log('[OTA] Checking for updates...');
  try {
    // 1. Fetch latest.json with cache-buster
    const url = `${LATEST_JSON_URL}?t=${Date.now()}`;
    console.log('[OTA] Fetching from:', url);
    const response = await fetch(url);
    const latest: LatestUpdate = await response.json();
    console.log('[OTA] Latest version available:', latest.version);

    // 2. Compare OTA version
    const currentVersion = await AsyncStorage.getItem(OTA_VERSION_KEY);
    console.log('[OTA] Current local OTA version:', currentVersion);

    if (isNewerVersion(latest.version, currentVersion)) {
      console.log(`[OTA] New version found (${latest.version} > ${currentVersion}). Downloading bundle...`);
      await downloadBundle(latest.bundleUrl, latest.version);
    } else {
      console.log('[OTA] App is up to date.');
    }
  } catch (error) {
    console.error('[OTA] Update check failed:', error);
  }
};

const downloadBundle = async (url: string, version: string) => {
  try {
    // 0. Remove validation file before starting
    if (await RNFS.exists(`${BUNDLE_PATH}.valid`)) {
      await RNFS.unlink(`${BUNDLE_PATH}.valid`);
    }

    const download = RNFS.downloadFile({
      fromUrl: url,
      toFile: BUNDLE_PATH,
      begin: (res) => {
        console.log('[OTA] Download started', res.contentLength);
      },
      progress: (res) => {
        const percentage = (res.bytesWritten / res.contentLength) * 100;
        console.log(`[OTA] Progress: ${percentage.toFixed(2)}%`);
      },
    });

    const result = await download.promise;

    if (result.statusCode === 200) {
      console.log('[OTA] Bundle downloaded successfully to:', BUNDLE_PATH);
      // 3. Create validation file
      await RNFS.writeFile(`${BUNDLE_PATH}.valid`, '1', 'utf8');
      // 4. Save OTA version
      await AsyncStorage.setItem(OTA_VERSION_KEY, version);
      console.log('[OTA] Version updated to:', version);
      console.log('[OTA] Please restart the app to apply the update.');
    } else {
      console.error('[OTA] Download failed with status:', result.statusCode);
    }
  } catch (error) {
    console.error('[OTA] Bundle download error:', error);
    // Cleanup if failed
    if (await RNFS.exists(BUNDLE_PATH)) {
      await RNFS.unlink(BUNDLE_PATH);
    }
  }
};

/**
 * Helper to check if a local bundle exists and is valid
 */
export const getLocalBundlePath = async () => {
  const exists = await RNFS.exists(BUNDLE_PATH);
  if (exists) {
    return BUNDLE_PATH;
  }
  return null;
};

import { DevSettings } from 'react-native';

/**
 * Helper to reload the app.
 * Note: In production, React Native doesn't have a built-in restart.
 * This works in Dev mode. For production, consider 'react-native-restart' library.
 */
export const reloadApp = () => {
  if (__DEV__) {
    DevSettings.reload();
  } else {
    console.log('[OTA] Restart required to apply update.');
  }
};
