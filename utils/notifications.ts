import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";

// Check if we're running in Expo Go
const isExpoGo = Constants.appOwnership === "expo";

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Get the Expo push token for sending notifications
 * Only works in development builds, not in Expo Go
 */
export async function getExpoPushToken(): Promise<string | null> {
  if (isExpoGo) {
    console.warn("Push tokens are not available in Expo Go. Use a development build.");
    return null;
  }

  try {
    const { data: token } = await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId,
    });
    console.log("Expo Push Token:", token);
    return token;
  } catch (error) {
    console.error("Error getting push token:", error);
    return null;
  }
}

/**
 * Schedule a local notification
 * This works in both Expo Go and development builds
 */
export async function scheduleLocalNotification(
  title: string,
  body: string,
  data?: any,
  seconds: number = 0
): Promise<string | null> {
  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger: seconds > 0 ? { seconds } : null,
    });
    return notificationId;
  } catch (error) {
    console.error("Error scheduling notification:", error);
    return null;
  }
}

/**
 * Cancel a scheduled notification
 */
export async function cancelNotification(notificationId: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.error("Error canceling notification:", error);
  }
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error("Error canceling all notifications:", error);
  }
}

/**
 * Get notification permissions status
 */
export async function getNotificationPermissions(): Promise<Notifications.NotificationPermissionsStatus | null> {
  try {
    return await Notifications.getPermissionsAsync();
  } catch (error) {
    console.error("Error getting notification permissions:", error);
    return null;
  }
}

/**
 * Check if the app can send notifications
 */
export async function canSendNotifications(): Promise<boolean> {
  if (isExpoGo) {
    // Local notifications work in Expo Go, but push notifications don't
    const permissions = await getNotificationPermissions();
    return permissions?.status === "granted";
  }

  // In development builds, both local and push notifications work
  const permissions = await getNotificationPermissions();
  return permissions?.status === "granted";
}

/**
 * Show a simple notification about delivery updates
 */
export async function showDeliveryNotification(
  type: "new_order" | "order_update" | "delivery_complete",
  message: string,
  orderId?: string
): Promise<void> {
  const canSend = await canSendNotifications();
  if (!canSend) {
    console.warn("Cannot send notifications - permissions not granted");
    return;
  }

  let title = "Quisipp Delivery";
  switch (type) {
    case "new_order":
      title = "New Delivery Request";
      break;
    case "order_update":
      title = "Delivery Update";
      break;
    case "delivery_complete":
      title = "Delivery Complete";
      break;
  }

  await scheduleLocalNotification(title, message, { orderId, type });
}
