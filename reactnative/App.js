import React from 'react'
import { Navigation } from 'react-native-navigation';
import { LogBox, View, Text } from 'react-native';
import messaging from '@react-native-firebase/messaging'

import Splash from './src/components/splash';
// import terms from './src/components/terms';
// import info from './src/components/info';
// import sidemenu from './src/components/sidemenu';
// import getFeedback from './src/components/getFeedback';
// import profile from './src/components/profile';
// import home from './src/components/home';
// import giveFeedback from './src/components/giveFeedback';
// import selfAssessmentCategory from './src/components/selfAssessmentCategory';
// import selfAssessmentSlider from './src/components/selfAssessmentSlider';
// import selfAssessment from './src/components/selfAssessment';


// export default class App extends React.Component {
//   constructor(props) {
//     super(props)
//   }
//   render() {
//     return (
//       <Splash />
//     )
//   }
// }

export default App = () => {

  useEffect(() => {
    const unsubscribe = messaging().onTokenRefresh((newToken) => {
      console.log('FCM Token Refreshed:', newToken);
      // Handle the token refresh event
    });
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <Splash />
  )
}


// Navigation.registerComponent('splash', () => splash);
// Navigation.registerComponent('terms', () => terms);
// Navigation.registerComponent('info', () => info);
// Navigation.registerComponent('sidemenu', () => sidemenu);
// Navigation.registerComponent('getFeedback', () => getFeedback);
// Navigation.registerComponent('profile', () => profile);
// Navigation.registerComponent('home', () => home);
// Navigation.registerComponent('giveFeedback', () => giveFeedback);
// Navigation.registerComponent('selfAssessmentCategory', () => selfAssessmentCategory);
// Navigation.registerComponent('selfAssessmentSlider', () => selfAssessmentSlider);
// Navigation.registerComponent('selfAssessment', () => selfAssessment);
//
// Navigation.events().registerAppLaunchedListener(async() => {
//   Navigation.setRoot({
//   root: {
//     sideMenu: {
//       left: {
//         component: {
//           name: 'sidemenu',
//         }
//       },
//       center: {
//         stack: {
//           children: [
//             {
//               component: {
//                 id: 'appStack',
//                 name: 'splash',
//               }
//             }
//           ]
//         }
//       },
//     }
//   }
//   })
// });
