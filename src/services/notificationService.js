import { PermissionsAndroid, Platform } from 'react-native';
import notifee from '@notifee/react-native';

// Permission Function
export async function requestNotificationPermission() {
  if (Platform.OS !== 'android') {
    return true;
  }
  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
  );

  return granted === PermissionsAndroid.RESULTS.GRANTED;
}

// Notoficatin Channel
/**
 * Params
 *  - id => internal identifier
 *  - name => visible inside android setting
 *  - inportance => controls visibility
 *      - 5 => Heads-up notification
 *      - 4 => sound + notification drawer
 *      - 3 => notification drawer only
 *      - 2 => silent notification
 */
export async function createNotificationChannels() {
  await notifee.createChannel({
    id: 'orders',
    name: 'Orders',
    importance: 4,
  });

  await notifee.createChannel({
    id: 'offers',
    name: 'Offers',
    importance: 3,
  });

  await notifee.createChannel({
    id: 'cart',
    name: 'Cart Updates',
    importance: 3,
  });
}

/**
 * Now lets create notifications
 * - title: Notification heading
 * - body: Notification description
 * - channelId: which android channel to use
 */

// test
export async function showWelcomeNotification() {
  await notifee.displayNotification({
    title: '🎉 Welcome to Foodie!',
    body: "Explore restaurants and discover today's offers.",
    android: {
      channelId: 'offers',
    },
  });
}

export async function showCartNotification(foodName) {
  await notifee.displayNotification({
    title: '🛒 Added to Cart',
    body: `${foodName} has been added to your cart.`,
    android: {
      channelId: 'cart',
    },
  });
}

export async function showOfferNotification(title, discount) {
  await notifee.displayNotification({
    title: "🔥 Today's Offer",
    body: `${discount} OFF on ${title}`,
    android: {
      channelId: 'offers',
    },
  });
}
