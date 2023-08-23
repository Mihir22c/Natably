/** @format */

import {
  AppRegistry,
  Platform
} from 'react-native';
import App from './App';
import { Navigation } from "react-native-navigation";
import DeviceInfo from 'react-native-device-info';

let bundleId = DeviceInfo.getBundleId();

const CONST = require('./src/constant/const.js');
import Splash from './src/components/splash';
import Terms from './src/components/terms';
import Info from './src/components/info';
import Sidemenu from './src/components/sidemenu';
import GetFeedback from './src/components/getFeedback';
import Profile from './src/components/profile';
import Home from './src/components/home';
import GiveFeedback from './src/components/giveFeedback';
import SelfAssessmentCategory from './src/components/selfAssessmentCategory';
import SelfAssessmentSlider from './src/components/selfAssessmentSlider';
import SelfAssessment from './src/components/selfAssessment';
import Responses from './src/components/responses';
import Explore from './src/components/explore';
import ExploreDetail from './src/components/exploreDetails';
import ProfileShare from './src/components/profileShare';
import ApplyJob from './src/components/applyJob';

Navigation.registerComponent(CONST.SplashScreen, () => Splash);
Navigation.registerComponent(CONST.TermsScreen, () => Terms);
Navigation.registerComponent(CONST.InfoScreen, () => Info);
Navigation.registerComponent(CONST.SidemenuScreen, () => Sidemenu);
Navigation.registerComponent(CONST.GetFeedbackScreen, () => GetFeedback);
Navigation.registerComponent(CONST.ProfileScreen, () => Profile);
Navigation.registerComponent(CONST.HomeScreen, () => Home);
Navigation.registerComponent(CONST.SelfAssessmentCategoryScreen, () => SelfAssessmentCategory);
Navigation.registerComponent(CONST.SelfAssessmentSliderScreen, () => SelfAssessmentSlider);
Navigation.registerComponent(CONST.SelfAssessmentScreen, () => SelfAssessment);
Navigation.registerComponent(CONST.GiveFeedbackScreen, () => GiveFeedback);
Navigation.registerComponent(CONST.ResponsesScreen, () => Responses);
Navigation.registerComponent(CONST.ExploreScreen, () => Explore);
Navigation.registerComponent(CONST.ExploreDetailScreen, () => ExploreDetail);
Navigation.registerComponent(CONST.ProfileShareScreen, () => ProfileShare);
Navigation.registerComponent(CONST.ApplyJobScreen, () => ApplyJob);

Navigation.events().registerAppLaunchedListener(() => {
  Navigation.setRoot({
    root: {
      sideMenu: {
        left: {
          component: {
            name: CONST.SidemenuScreen,
          }
        },
        center: {
          stack: {
            children: [
              {
                component: {
                  id: 'appStack',
                  name: CONST.SplashScreen,
                }
              }
            ]
          }
        },
      }
    }
  })
});
