/**
 * @format
 */

import { AppRegistry, LogBox } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { createStore } from 'redux';
import allReducers from './src/reducers/index.js';
import { Provider } from 'react-redux';
import notifee, { EventType, AndroidStyle, AndroidColor, AndroidCategory, AndroidImportance } from '@notifee/react-native';
import axios from 'axios';
import { reject, api_url, logo } from './src/config/Constants';
import BackgroundTimer from 'react-native-background-timer';
import messaging from '@react-native-firebase/messaging';

// Suppress all logs
LogBox.ignoreAllLogs();

// Create Redux store
const store = createStore(allReducers);

async function checkNotificationPermission() {
	console.log('permission check');
	const settings = await notifee.getNotificationSettings();
	
	if (settings.authorizationStatus === AuthorizationStatus.DENIED) {
	  const newSettings = await notifee.requestPermission();
	  if (newSettings.authorizationStatus === AuthorizationStatus.AUTHORIZED || newSettings.authorizationStatus === AuthorizationStatus.PROVISIONAL) {
		console.log('Permission granted');
	  } else {
		console.log('Permission denied');
	  }
	} else {
	  console.log('Permission already granted');
	}
  }
  
  checkNotificationPermission();

// Create a notification channel for Android
async function createNotificationChannel() {
  await notifee.createChannel({
    id: 'booking_notification',
    name: 'Channel with custom sound',
    sound: 'uber',
    vibration: true,
    lights: true,
    lightColor: AndroidColor.RED,
    category: AndroidCategory.CALL,
    importance: AndroidImportance.HIGH,
    style: { type: AndroidStyle.BIGPICTURE, picture: logo },
  });
}

createNotificationChannel();

// Function to display notification
const showNotification = async (id, title, body) => {
  try {
    await notifee.displayNotification({
      id: id,
      title: title,
      body: body,
      android: {
        channelId: 'booking_notification',
        sound: 'uber',
        loopSound: true,
        lights: [AndroidColor.RED, 300, 600],
        category: AndroidCategory.CALL,
        importance: AndroidImportance.HIGH,
        style: { type: AndroidStyle.BIGPICTURE, picture: 'https://my-cdn.com/user/123/upload/456.png' },
        actions: [
          {
            title: 'View Detail',
            pressAction: {
              id: 'detail',
              launchActivity: 'default'
            },
          },
        ],
      },
    });
  } catch (error) {
    console.log(error);
  }
}

// Handle incoming messages
const onMessageReceived = async (message) => {
 // await messaging().registerDeviceForRemoteMessages();
  console.log(message, 'message');
  try {
    await notifee.displayNotification({
      title: message.notification.title,
      body: message.notification.body,
      android: {
        channelId: 'booking_notification',
      },
    });
  } catch (error) {
    console.log(error);
  }
  // try{
  //   showNotification(message.messageId, 'Booking Alert!', 'Hi You received new booking');
  // }catch(error){
  //   console.log(error);
  // }
  

}

messaging().onMessage(onMessageReceived);

messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log(remoteMessage, 'remotemessage');
  const { data } = remoteMessage;
  console.log(data, 'data');
  if (data) {
    const { id, type, driver_id } = data;
    console.log('id' + id);
    console.log('type' + type);
    if (type == 1 && id) {
      showNotification(id, 'Booking Alert!', 'Hi You received new booking');
      console.log('timer_executed');
      const timeoutId = BackgroundTimer.setTimeout(() => {
        console.log('Execute reject driver');
        callReject(id, driver_id);
        notifee.cancelNotification(id);
      }, 10000);
    } else if (type == 2 && id) {
      notifee.cancelNotification(id);
    }
  }
});

// Function to call reject API
const callReject = async (id, driver_id) => {
  console.log(api_url + reject);
  try {
    const response = await axios.post(api_url + reject, { trip_id: id, driver_id: driver_id, from: 1 });
    console.log(response.data);
    BackgroundTimer.stop();
  } catch (error) {
    console.log(error);
  }
}

// Handle background events
notifee.onBackgroundEvent(async ({ type, detail }) => {
  const { notification, pressAction } = detail;

  // Handle the background events if needed
  if (type === EventType.DELIVERED) {
    console.log('notification id : ' + notification.id);
    setTimeout(async () => {
      console.log('settimeout called');
      console.log('notification id : ' + notification.id);
      callReject(notification.id)
      notifee.cancelNotification(notification.id)
    }, 30 * 1000);
  }
});

// App component with Redux Provider
const HeadlessCheck = ({ isHeadless }) => {
  if (isHeadless) {
    return null; // App launched in background by iOS, ignore
  } else {
    return (
      <Provider store={store}>
        <App />
      </Provider>
    );
  }
}

AppRegistry.registerComponent(appName, () => HeadlessCheck);
