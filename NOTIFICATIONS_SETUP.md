# Notifications Setup Guide

## Issue
Starting with Expo SDK 53, `expo-notifications` remote push notifications functionality was removed from Expo Go. This means you'll see warnings when running the app in Expo Go.

## Quick Fix (Current Implementation)
The app now includes conditional logic that:
- Detects when running in Expo Go
- Shows a user-friendly message about notification limitations
- Allows the app to continue working without breaking

## Full Solution: Development Build

To get full notification functionality, you need to create a development build.

### Prerequisites
1. Install EAS CLI: `npm install -g @expo/eas-cli`
2. Create an Expo account and login: `eas login`

### Step 1: Configure EAS
```bash
cd quisipp-delivery-partner
eas build:configure
```

### Step 2: Update app.json for notifications
The app.json is already configured with notification plugins and permissions.

### Step 3: Build for Android
```bash
# For development build
eas build --platform android --profile development

# For preview build (like production but installable via APK)
eas build --platform android --profile preview
```

### Step 4: Build for iOS (if needed)
```bash
# For development build
eas build --platform ios --profile development

# For preview build
eas build --platform ios --profile preview
```

### Step 5: Install the development build
1. Download the APK/IPA from the EAS build dashboard
2. Install it on your device
3. Run `npx expo start --dev-client` to connect to your development build

## Testing Notifications

### Local Notifications (Work in both Expo Go and dev builds)
```typescript
import { scheduleLocalNotification } from './utils/notifications';

// Schedule a notification
await scheduleLocalNotification(
  "Test Notification",
  "This is a test message",
  { orderId: "123" },
  5 // 5 seconds delay
);
```

### Push Notifications (Only work in development builds)
```typescript
import { getExpoPushToken } from './utils/notifications';

// Get push token (only works in dev builds)
const token = await getExpoPushToken();
if (token) {
  console.log("Push token:", token);
  // Send this token to your backend server
}
```

## Alternative: Use Expo Dev Client

If you want to test with a pre-built development client:

1. Install Expo Dev Client from app stores:
   - [Android](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - [iOS](https://apps.apple.com/app/expo-go/id982107779)

2. Run your project:
   ```bash
   npx expo start --dev-client
   ```

## Notification Features Available

### In Expo Go (Limited)
- ✅ Local notifications
- ✅ Notification permissions
- ❌ Push notifications
- ❌ Push tokens

### In Development Build (Full)
- ✅ Local notifications
- ✅ Notification permissions
- ✅ Push notifications
- ✅ Push tokens
- ✅ Background notifications
- ✅ Notification channels (Android)

## Troubleshooting

### Common Issues
1. **"expo-notifications functionality is not fully supported"**
   - This is expected in Expo Go with SDK 53+
   - Use a development build for full functionality

2. **Build fails**
   - Make sure you have the latest EAS CLI: `npm install -g @expo/eas-cli@latest`
   - Check your app.json configuration
   - Ensure all plugins are properly configured

3. **Notifications not working in dev build**
   - Check device notification permissions
   - Verify the notification channel setup (Android)
   - Test with local notifications first

### Getting Help
- [Expo Notifications Documentation](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Development Builds Guide](https://docs.expo.dev/develop/development-builds/introduction/)

## Current App Behavior

The app now gracefully handles the notification limitation:
1. Detects if running in Expo Go
2. Shows informative alerts instead of errors
3. Continues normal operation
4. Provides full notification support in development builds

This ensures your app works in both environments while encouraging users to use development builds for the best experience.
