# OTA Setup Guide

## 1. Prerequisites
- `react-native-fs`
- `@react-native-async-storage/async-storage`

## 2. Bundle Generation Command
Run this command to create a new OTA bundle:

```bash
mkdir -p ota
npx react-native bundle \
  --platform android \
  --dev false \
  --entry-file index.js \
  --bundle-output ota/android.bundle \
  --assets-dest ota/assets
```

## 3. Deployment
1. Upload `ota/android.bundle` to Supabase.
2. Update `latest.json` with the new version and bundle URL.

## 4. Testing
- Run in release mode: `npx react-native run-android --mode release`
- Watch logs: `adb logcat | grep OTA`
- Restart app after download to apply changes.
