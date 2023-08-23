import { Platform,  AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Navigation } from 'react-native-navigation';
const CONST = require('../constant/const');

//import FCM, {FCMEvent, RemoteNotificationResult, WillPresentNotificationResult, NotificationType, NotificationActionType, NotificationActionOption, NotificationCategoryOption} from "react-native-fcm";
import messaging from '@react-native-firebase/messaging';

let lastGoogleId = '';
let isShowNotification = true;

AsyncStorage.getItem('lastNotification').then(data=>{
  if(data){
    // if notification arrives when app is killed, it should still be logged here
    console.log('notif -- last notification - ', JSON.parse(data));
    AsyncStorage.removeItem('lastNotification');
  }
})

AsyncStorage.getItem('lastMessage').then(data=>{
  if(data){
    // if notification arrives when app is killed, it should still be logged here
    console.log('notif -- last message- ', JSON.parse(data));
    AsyncStorage.removeItem('lastMessage');
  }
})

export function registerKilledListener(){

  // these callback will be triggered even when app is killed
  // FCM.on(FCMEvent.Notification, notif => {
  //   console.log("notif -- Notification registerKilledListener ***** -- ", notif);
  //
  //   AsyncStorage.setItem('lastNotification', JSON.stringify(notif));
  //   if(notif.opened_from_tray){
  //     setTimeout(()=>{
  //       if(notif._actionIdentifier === 'reply'){
  //         if(AppState.currentState !== 'background'){
  //           console.log('notif -- User replied -'+ JSON.stringify(notif._userText))
  //           // alert('User replied '+ JSON.stringify(notif._userText));
  //         } else {
  //           AsyncStorage.setItem('lastMessage', JSON.stringify(notif._userText));
  //         }
  //       }
  //       if(notif._actionIdentifier === 'view'){
  //         // alert("User clicked View in App");
  //       }
  //       if(notif._actionIdentifier === 'dismiss'){
  //         // alert("User clicked Dismiss");
  //       }
  //     }, 1000)
  //   }
  // });
}

function showNotification(title, body, data, componentId) {
  if(data.opened_from_tray){
    setTimeout(()=>{
        Navigation.setStackRoot(componentId, {
          component: {
            id: 'home',
            name: 'home',
          }
        });
    }, 500)
  }
}

// these callback will be triggered only when app is foreground or background
export function registerAppListener(navigation,componentId){

    messaging().onMessage(async remoteMessage => {
      console.log('onMessage 59: ', JSON.stringify(remoteMessage));
      const { title, body } = remoteMessage.notification;
      const data = remoteMessage.data;
      this.showNotification(title, body, data, componentId);
    });

    messaging().onNotificationOpenedApp(remoteMessage => {
        console.log('onMessage 66: ', JSON.stringify(remoteMessage));
        console.log('onMessage 68: ', remoteMessage.notification);
        setTimeout(()=>{
         //parent.getHomeCategoryData()
         Navigation.push(componentId, {
           component: {
             id: CONST.HomeScreen,
             name: CONST.HomeScreen,
           }
         });
       }, 0)
    });

    messaging().getInitialNotification().then(remoteMessage => {
       if (remoteMessage) {
         console.log('onMessage 72:'+JSON.stringify(remoteMessage), remoteMessage.notification);

         const { title, body } = remoteMessage.notification;
         const data = remoteMessage.data;
         this.showNotification(title, body, data, componentId);
       }
   });

  // FCM.on(FCMEvent.Notification, notif => {
  //   console.log("notif -- Notification ***** -- ", notif);
  //
  //   if(Platform.OS ==='ios' && notif._notificationType === NotificationType.WillPresent && !notif.local_notification){
  //     // this notification is only to decide if you want to show the notification when user if in foreground.
  //     // usually you can ignore it. just decide to show or not.
  //     notif.finish(WillPresentNotificationResult.All)
  //     return;
  //   }
  //   if(Platform.OS ==='ios'){
  //           switch(notif._notificationType){
  //             case NotificationType.Remote:
  //               if(notif.opened_from_tray){
  //                 setTimeout(()=>{
  //                     Navigation.setStackRoot(componentId, {
  //                       component: {
  //                         id: 'home',
  //                         name: 'home',
  //                       }
  //                     });
  //                 }, 500)
  //               }
  //               notif.finish(RemoteNotificationResult.NewData) //other types available: RemoteNotificationResult.NewData, RemoteNotificationResult.ResultFailed
  //               break;
  //             case NotificationType.NotificationResponse:
  //               notif.finish();
  //               break;
  //             case NotificationType.WillPresent:
  //               notif.finish(WillPresentNotificationResult.All) //other types available: WillPresentNotificationResult.None
  //               // this type of notificaiton will be called only when you are in foreground.
  //               // if it is a remote notification, don't do any app logic here. Another notification callback will be triggered with type NotificationType.Remote
  //               break;
  //           }
  //   }else {
  //     if(notif.opened_from_tray){
  //       setTimeout(()=>{
  //           Navigation.setStackRoot(componentId, {
  //             component: {
  //               id: 'home',
  //               name: 'home',
  //             }
  //           });
  //       }, 500)
  //     }
  //   }
  // });
  //
  // FCM.on(FCMEvent.RefreshToken, token => {
  //   console.log("notif --  TOKEN (refreshUnsubscribe)- ", token);
  // });
  // FCM.on("FCMTokenRefreshed", token => {
  //       //update token to server
  //       console.log("notif --  TOKEN (refreshUnsubscribe)- ", token);
  // });
  //
  // FCM.enableDirectChannel();
  // FCM.on(FCMEvent.DirectChannelConnectionChanged, (data) => {
  //   console.log('notif -- direct channel connected- ' + data);
  // });
  // setTimeout(function() {
  //   FCM.isDirectChannelEstablished().then(d => console.log(d));
  // }, 1000);


}

// export function registerAppListener(navigation){
//   FCM.on(FCMEvent.Notification, notif => {
//     console.log("Notification", notif);
//
//     if(Platform.OS ==='ios' && notif._notificationType === NotificationType.WillPresent && !notif.local_notification){
//       // this notification is only to decide if you want to show the notification when user if in foreground.
//       // usually you can ignore it. just decide to show or not.
//       notif.finish(WillPresentNotificationResult.All)
//       return;
//     }
//
//     if(notif.opened_from_tray){
//       if(notif.targetScreen === 'detail'){
//         setTimeout(()=>{
//           navigation.navigate('Detail')
//         }, 500)
//       }
//       setTimeout(()=>{
//         alert(`User tapped notification\n${JSON.stringify(notif)}`)
//       }, 500)
//     }
//
//     if(Platform.OS ==='ios'){
//             //optional
//             //iOS requires developers to call completionHandler to end notification process. If you do not call it your background remote notifications could be throttled, to read more about it see the above documentation link.
//             //This library handles it for you automatically with default behavior (for remote notification, finish with NoData; for WillPresent, finish depend on "show_in_foreground"). However if you want to return different result, follow the following code to override
//             //notif._notificationType is available for iOS platfrom
//             switch(notif._notificationType){
//               case NotificationType.Remote:
//                 notif.finish(RemoteNotificationResult.NewData) //other types available: RemoteNotificationResult.NewData, RemoteNotificationResult.ResultFailed
//                 break;
//               case NotificationType.NotificationResponse:
//                 notif.finish();
//                 break;
//               case NotificationType.WillPresent:
//                 notif.finish(WillPresentNotificationResult.All) //other types available: WillPresentNotificationResult.None
//                 // this type of notificaiton will be called only when you are in foreground.
//                 // if it is a remote notification, don't do any app logic here. Another notification callback will be triggered with type NotificationType.Remote
//                 break;
//             }
//     }
//   });
//
//   FCM.on(FCMEvent.RefreshToken, token => {
//   console.log("TOKEN (refreshUnsubscribe)", token);
// });
//
// FCM.enableDirectChannel();
// FCM.on(FCMEvent.DirectChannelConnectionChanged, (data) => {
//   console.log('direct channel connected' + data);
// });
// setTimeout(function() {
//   FCM.isDirectChannelEstablished().then(d => console.log(d));
// }, 1000);
// }
