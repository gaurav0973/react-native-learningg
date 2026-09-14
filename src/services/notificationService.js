import { PermissionsAndroid, Platform } from 'react-native';
import notifee, { AndroidStyle, TriggerType } from '@notifee/react-native';

const LUNCH_REMINDER_ID = 'lunch-reminder';

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

/**
 * Schedule Notification
 * - this notification happens later
 * - How ?
 *  -   current time
 *  - save trigger time
 *  - android stores alarm
 *  - Future notification appears
 */

function getNextLunchTime() {
  const date = new Date();

  date.setHours(13, 0, 0, 0);

  if (date.getTime() <= Date.now()) {
    date.setDate(date.getDate() + 1);
  }

  return date;
}

export async function scheduleLunchReminder() {
  const lunchTime = getNextLunchTime();

  await notifee.createTriggerNotification(
    {
      id: LUNCH_REMINDER_ID,
      title: '🍔 Lunch Time!',
      body: 'Your favorite restaurants are waiting for you.',
      android: {
        channelId: 'offers',
      },
    },
    {
      type: TriggerType.TIMESTAMP,
      timestamp: lunchTime.getTime(),
    },
  );

  return lunchTime;
}

export async function cancelLunchReminder() {
  await notifee.cancelTriggerNotification(LUNCH_REMINDER_ID);
}

/*
  - Different types of notifcations 
*/

/**
 * Basic notification
 * - app welcoe
 * - order added
 * - payment successful
 */
export async function showBasicNotification(title, body) {
  await notifee.displayNotification({
    title,
    body,
    android: {
      channelId: 'general',
    },
  });
}


/**
 * Big text notification 
 *    - fastival salees
 *    - long coupan descrition
 */
export async function showBigTextOffer() {
  await notifee.displayNotification({
    title: "🔥 Independence Day Sale",
    body: "Flat ₹150 OFF",
    android: {
      channelId: "offers",
      style: {
        type: AndroidStyle.BIGTEXT,
        text:
          "Get Flat ₹150 OFF on orders above ₹299. Valid today between 11 AM and 11 PM on Pizza, Burger, Biryani and much more.",
      },
    },
  });
}


/**
 * Image notificationn 
  - Pizza banner 
  - burger combo 
  - flash sale 
 */

export async function showOfferImage() {
    await notifee.displayNotification({
      title: "🍕 Pizza Party",
      body: "Buy 1 Get 1 Free",
      android: {
        channelId: "offers",
        style: {
          type: AndroidStyle.BIGPICTURE,
          picture: "my-image-url"
        },
      },
    });
  }


/**
 * Inbox / Multiple Messages
 *  - 3 new offers 
 *  - multiple restaurat discount 
Instead of 3 notification, show one grouped notification 
 */

export async function groupedNotification(){
  await notifee.displayNotification({
    title: "🍕 Pizza Party",
      body: "Buy 1 Get 1 Free",
      android: {
        channelId: "offers",
        style: {
          type: AndroidStyle.INBOX,
          lines: [
            "🍕 Pizza Hut - Flat ₹120 OFF",
            "🍔 Burger King - Buy 1 Get 1",
            "🥗 Subway - 40% OFF Today",
          ],
        }
      },
  })
}

/**
 * Progress Notification
 * - Food delivery timeline 
 */

export async function progressNotification(){
  await notifee.displayNotification({
    id: "same", // Updating notification by ID instead of creating a new one is a common production pattern.
    title: "Preparing Your Order",
    body: "Burger Combo",
    android: {
      channelId: "orders",
      progress: {
        max: 100,
        current: 30,
      },
      ongoing: true, //ongoing notificaiton
      autoCancel: false
    },
  });
}

/**
 * Scheduled Notification
 */

export async function scheduleDailyLunchReminder() {
  // const trigger = 

  // await notifee.createTriggerNotification(
  //   notification,
  //   trigger
  // );
}

/**
 * Action Notifications
 * android: {
  channelId: "offers",

  actions: [
    {
      title: "View Offer",
      pressAction: {
        id: "view-offer",
      },
    },

    {
      title: "Dismiss",
      pressAction: {
        id: "dismiss-offer",
      },
    },
  ],
}
 */