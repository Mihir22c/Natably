import { NativeModules, Platform, Dimensions, NetInfo } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Navigation } from 'react-native-navigation';
import Share from 'react-native-share';
import DeviceInfo from 'react-native-device-info';

let bundleId = DeviceInfo.getBundleId();
export let appName = 'Natably';
export let headerBackColor = "#fff";
export let headerlogo = require('../img/logo.png');
export let headerLeftMenuSize = 25;
export let headerHeight = 56;

export let googleAPIKey = "AIzaSyCJKUonGb63hG6XtxhupV2rbVfxvgUxzU0";


export let SplashScreen = bundleId + ".Splash";
export let TermsScreen = bundleId + ".Terms";
export let InfoScreen = bundleId + ".Info";
export let SidemenuScreen = bundleId + ".Sidemenu";
export let GetFeedbackScreen = bundleId + ".GetFeedback";
export let GiveFeedbackScreen = bundleId + ".GiveFeedback";
export let ProfileScreen = bundleId + ".Profile";
export let ExploreScreen = bundleId + ".Explore";
export let ExploreDetailScreen = bundleId + ".ExploreDetail";
export let HomeScreen = bundleId + ".Home";
export let SelfAssessmentCategoryScreen = bundleId + ".SelfAssessmentCategory";
export let SelfAssessmentSliderScreen = bundleId + ".SelfAssessmentSlider";
export let SelfAssessmentScreen = bundleId + ".SelfAssessment"
export let ResponsesScreen = bundleId + ".Responses"
export let ProfileShareScreen = bundleId + ".ProfileShare"
export let ApplyJobScreen = bundleId + ".ApplyJob"

export let WHATSAPP_ICON = "https://w7.pngwing.com/pngs/110/230/png-transparent-whatsapp-application-software-message-icon-whatsapp-logo-whats-app-logo-logo-grass-mobile-phones.png";
export let IMESSAGE_ICON = "https://www.macworld.com/wp-content/uploads/2021/03/messages-ios-icon-100667645-orig-4.jpg?quality=50&strip=all";
export let MESSAGES_ICON = "https://i.gadgets360cdn.com/large/android_messages_logo_1534597065870.jpg";
export let EMAIL_ICON = "https://149493502.v2.pressablecdn.com/wp-content/uploads/2020/10/new-Gmail-icon.jpg";
export let COPY_ICON = "https://img.icons8.com/material-sharp/24/000000/copy.png";
export let MS_OUTLOOK_ICON = "https://is1-ssl.mzstatic.com/image/thumb/Purple122/v4/0d/76/74/0d76745e-e709-6178-cbaf-536bc50ead4c/AppIcon-outlook.prod-0-1x_U007emarketing-0-7-0-85-220.png/460x0w.webp";


export let userType = 'new';
export function setUserType(newType) {
  userType = newType;
}
export function getUserType() {
  return userType;
}

export async function setProfileAvatar(value) {
  try {
    await AsyncStorage.setItem('profile_avatar', value)
  } catch (e) {
    console.log("errr setProfileLocal: " + e);
  }
}

export async function getProfileAvatar() {
  const result = await AsyncStorage.getItem('profile_avatar');
  return result;
}

export let internetConnectionTitle = 'Natably';
export let internetConnectionMessage = 'No Internet Connection available!! Please try later..';

export function checkInternetStatus() {
  if (Platform.OS === 'android') {
    NetInfo.getConnectionInfo().then((connectionInfo) => {
      console.log('Initial, type: ---- @@@ --- ' + connectionInfo.type + ', effectiveType: ' + connectionInfo.effectiveType)
      if (connectionInfo.type === 'none') {
        return false;
      } else {
        return true;
      }
    });
  } else {
    fetch('https://www.google.com', {
      method: "Head",
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: 0,
      },
    })
      .then(() => {
        console.log('internet true');
        return true;
      })
      .catch(() => {
        console.log('internet false');
        return false;
      });
  }
}

export function deeplink(url, componentId) {
  console.log('Navigate url deeplink ------> ' + url);
  if (url === null) {
    var that = this;
    AsyncStorage.getItem('@AccessToken')
      .then(token => {
        console.log('GetToken: ', token);
        var screenName = TermsScreen;
        if (token == null) {
          screenName = TermsScreen;
          setUserType("new");
        } else {
          screenName = HomeScreen;
          setUserType("old");
        }
        setTimeout(function () {
          Navigation.push(componentId, {
            component: {
              id: screenName + "1",
              name: screenName,
              options: {
                topBar: {
                  drawBehind: true,
                  visible: false,
                  animate: false
                }
              }
            }
          });
        }, 500);
      })
      .catch(error => console.log(error));
  }
  else {
    const route = url.replace(/.*?:\/\//g, '');
    const id = route.match(/\/([^\/]+)\/?$/)[1];
    var routeArr = route.split('/');

    // console.log('navigate routeName length------> ' + routeArr.length); https://natably.com/feedback/10440e066f0b81e75caf5a0f70205c9c
    for (var i = 0; i < routeArr.length; i++) {
      console.log('navigate routeName ------> ' + routeArr[i]);
    }

    if (routeArr[1] === 'feedback') {
      // give-feedback url
      Navigation.push(componentId, {
        component: {
          id: 'home',
          name: HomeScreen,
          passProps: {
            from: 'deeplink',
            token: routeArr[2],
            url: ''
          }
        }
      });
    }
    else if (routeArr[1] === 'token' || routeArr[1] === 'submit-feedback') {
      // re-send past request url OR get-feedback url
      Navigation.push(componentId, {
        component: {
          name: GiveFeedbackScreen,
          passProps: {
            from: 'deeplink',
            personName: '',
            token: routeArr[2],
          },
        }
      });
    }
  }
}

export function openShareLinkDialog(shareUrl) {
  const shareOptions = {
    title: appName,
    url: shareUrl,
  };
  return Share.open(shareOptions)
    .then(({ action, activityType }) => {
      if (action === Share.dismissedAction) {
        console.log('Share dismissed');
      }
      else {
        console.log('Share successful');
      }
    })
    .catch(err => console.log(err));
}

let d = Dimensions.get('window');
export let { height, width } = d;

export let topbarTopMargin = 0;
export function checkIphoneX() {
  // if(Platform.OS === 'ios' && (height === 812 || height === 896)){
  //   topbarTopMargin = 30;
  // }

  if (Platform.OS === 'ios' && DeviceInfo.hasNotch()) {
    topbarTopMargin = 30;
  }

  return topbarTopMargin;
}


//F93FE7B4-95D9-406F-9AAA-3FEA5D0EFCDB
