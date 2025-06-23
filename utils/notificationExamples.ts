/**
 * Example usage of notification utilities
 * This file shows how to use the notification functions in your app
 */

import {
  getExpoPushToken,
  scheduleLocalNotification,
  showDeliveryNotification,
  canSendNotifications,
  cancelAllNotifications
} from './notifications';

/**
 * Initialize notifications when the app starts
 * Call this in your App.tsx or main component
 */
export async function initializeNotifications() {
  // Check if we can send notifications
  const canSend = await canSendNotifications();
  console.log('Can send notifications:', canSend);

  // Get push token (only works in development builds)
  const pushToken = await getExpoPushToken();
  if (pushToken) {
    console.log('Push token received:', pushToken);
    // TODO: Send this token to your backend server
    // await sendTokenToServer(pushToken);
  }
}

/**
 * Example: Show notification when a new delivery request comes in
 */
export async function notifyNewDeliveryRequest(orderDetails: {
  orderId: string;
  customerName: string;
  address: string;
  amount: number;
}) {
  await showDeliveryNotification(
    'new_order',
    `New delivery request from ${orderDetails.customerName} - $${orderDetails.amount}`,
    orderDetails.orderId
  );
}

/**
 * Example: Show notification when delivery status changes
 */
export async function notifyDeliveryStatusUpdate(
  orderId: string,
  status: 'picked_up' | 'in_transit' | 'delivered'
) {
  let message = '';
  switch (status) {
    case 'picked_up':
      message = 'Order has been picked up and is on the way!';
      break;
    case 'in_transit':
      message = 'Order is in transit to the customer.';
      break;
    case 'delivered':
      message = 'Order has been successfully delivered!';
      break;
  }

  await showDeliveryNotification('order_update', message, orderId);
}

/**
 * Example: Schedule a reminder notification
 */
export async function scheduleDeliveryReminder(
  orderId: string,
  customerName: string,
  delayInMinutes: number = 30
) {
  await scheduleLocalNotification(
    'Delivery Reminder',
    `Don't forget to deliver the order for ${customerName}`,
    { orderId, type: 'reminder' },
    delayInMinutes * 60 // Convert minutes to seconds
  );
}

/**
 * Example: Clear all notifications when user logs out
 */
export async function clearAllNotifications() {
  await cancelAllNotifications();
  console.log('All notifications cleared');
}

/**
 * Example: Send push token to your backend server
 * Replace this with your actual API endpoint
 */
async function sendTokenToServer(token: string) {
  try {
    // Replace with your actual API endpoint
    const response = await fetch('https://your-api.com/push-tokens', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token,
        platform: 'mobile',
        // Add user ID or other identifying information
      }),
    });

    if (response.ok) {
      console.log('Push token sent to server successfully');
    } else {
      console.error('Failed to send push token to server');
    }
  } catch (error) {
    console.error('Error sending push token to server:', error);
  }
}

/**
 * Example: Handle incoming notifications when app is in foreground
 * Add this to your App.tsx
 */
export function setupNotificationListeners() {
  // This would typically be set up in your main App component
  // import * as Notifications from 'expo-notifications';
  
  // const notificationListener = useRef<Notifications.Subscription>();
  // const responseListener = useRef<Notifications.Subscription>();

  // useEffect(() => {
  //   // Listen for notifications when app is in foreground
  //   notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
  //     console.log('Notification received:', notification);
  //   });

  //   // Listen for user tapping on notifications
  //   responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
  //     console.log('Notification response:', response);
  //     const data = response.notification.request.content.data;
  //     
  //     // Handle navigation based on notification data
  //     if (data.orderId) {
  //       // Navigate to order details screen
  //       navigation.navigate('OrderDetails', { orderId: data.orderId });
  //     }
  //   });

  //   return () => {
  //     if (notificationListener.current) {
  //       Notifications.removeNotificationSubscription(notificationListener.current);
  //     }
  //     if (responseListener.current) {
  //       Notifications.removeNotificationSubscription(responseListener.current);
  //     }
  //   };
  // }, []);
}
