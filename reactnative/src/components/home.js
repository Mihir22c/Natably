import React, { Component, createRef } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  Dimensions,
  Linking,
  View,
  Image,
  FlatList,
  TouchableHighlight,
  ScrollView,
  StatusBar,
  Clipboard,
  TouchableOpacity,
  Alert,
  TouchableWithoutFeedback,
  RefreshControl,
  ImageBackground,
  SafeAreaView,
  PermissionsAndroid,
  Animated
} from 'react-native';
import { Navigation } from 'react-native-navigation';
import ExpanableList from 'react-native-expandable-section-flatlist';
import Modal from "react-native-modal";
import DeviceInfo, { hasNotch } from 'react-native-device-info';
import SpinnerLoading from '../constant/spinnerLoading'
import messaging from '@react-native-firebase/messaging';
import Share, { ShareSheet, Button } from 'react-native-share';
import LinearGradient from 'react-native-linear-gradient';
import Swipeout from 'react-native-swipeout';
const Color = require('color');
import { TextStroke } from 'react-native-textstroke';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DropShadow from "react-native-drop-shadow";
import BlurModel from '../constant/BlurModel';
import FastImage from 'react-native-fast-image'
import extractUrls from 'extract-urls';

import FeedbackContentItem from '../constant/feedbackContentItem';
import RelationshipIcon from '../constant/relationshipIcon';
import ProfileShareItem from '../constant/profileShareItem';
import ChipText from '../constant/chipText';
const CONST = require('../constant/const');
import Api from '../Api/Api';
import { registerKilledListener, registerAppListener } from "../constant/listeners";

import IcDiamond from '../img/ic_diamond';
import TalentPointView from '../constant/talentPointView';
import Toast, { BaseToast } from 'react-native-toast-message';
import YoutubePlayer from 'react-native-youtube-iframe';
import { Vimeo } from 'react-native-vimeo-iframe';
import StarRating from 'react-native-star-rating';
import * as Animatable from 'react-native-animatable'
import AsyncStorage from '@react-native-async-storage/async-storage';
import RecordScreen, { RecordingResponse } from 'react-native-record-screen';
import { RNCamera } from 'react-native-camera';
import CameraRoll from '@react-native-camera-roll/camera-roll';
import FaceCamera from '../constant/FaceCamera'
import WebView from 'react-native-webview';
import RNUrlPreview from 'react-native-url-preview'
import { LinkPreview } from '@flyerhq/react-native-link-preview'
import CareerItem from '../SubComponents/CareerItem';
import JobPage from '../SubComponents/JobPage';

const { width, height } = Dimensions.get('window');
var collapseBarChartBackHeight = 210;
var openBarChartBackHeight;
var isBarCollapse = true;
var session;
var recordResp;
var deleteFrom = '';
var deleteId = '';
var dashedWidth = 1.5, dashedColor = 'rgba(0, 0, 0, 0.2)';
var homeData = [];
var isMessagesAvailable = false;
var isMailAvailable = false;
var isWhatsappAvailable = false;
var shareOptions = {};
var currentLinkData = {};
var undoFeedback;
var selfAssessmentItems
let shareLink = "";
let shareName = "";
let shareType = "";
const cross = require('../img/Cross.png')
const checkWhite = require('../img/CheckWhite.png')
const eye = require('../img/Eye.png')

const videoCallbacks = {
  timeupdate: (data) => console.log('timeupdate: ', data),
  play: (data) => console.log('play: ', data),
  pause: (data) => console.log('pause: ', data),
  fullscreenchange: (data) => console.log('fullscreenchange: ', data),
  ended: (data) => console.log('ended: ', data),
  controlschange: (data) => console.log('controlschange: ', data),
};

const videoTags = [
  { title: 'Virtoso', color: '#DB6575' },
  { title: 'Personnable', color: '#49D2D6' },
  { title: 'Advisor', color: '#F5834B' }
]

const toasConfig = {
  info: (props) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: '#87CEFA' }}
      text1NumberOfLines={4}
    />
  )
}

const isPortrait = () => {
  const dim = Dimensions.get('screen')
  return dim.height >= dim.width
}

const isLandScape = () => {
  const dim = Dimensions.get('screen')
  return dim.width >= dim.height
}

registerKilledListener();

export default class home extends Component {

  static options(passProps) {
    return {
      topBar: {
        drawBehind: true,
        visible: false,
        animate: false
      },
      sideMenu: {
        left: {
          width: 250,
          visible: false, // hide drwaer from showing first when this screen is loaded
          enabled: false, // hide drawer for this screen
        }
      }
    };
  }

  constructor(props) {
    super(props);
    this.userViewConfigRef = { viewAreaCoveragePercentThreshold: 20, waitForInteraction: true, }
    this.onUserViewRef = this.onUserViewRef.bind(this)
    StatusBar.setBarStyle('dark-content', true);
    this.state = {
      barchartData: [],
      feedbackData: [],
      postRequestData: [],
      exploreData: [],
      jobNotificationsData: [],
      exploreFilteredData: [],
      exploreFilterList: [],
      scoreData: [],
      notificationsData: [],
      allSkills: [],
      profileShateList: [],
      barchartHeight: collapseBarChartBackHeight,
      barchartHeaderFlex: 0.3,
      barchartListFlex: 0.65,
      barchartButtonFlex: 0.15,
      barChartArrow: require('../img/down_arrow.png'),
      isModalVisible: false,
      topbarTopMargin: 0,
      barchartTitle: '',
      feedback: '',
      showNoDataImage: false,
      barTextPosition: { left: 0 },
      isLoading: false,
      groupImage: null,
      userImage: null,
      isShareSheetVisible: false,
      isFeedbackModalVisible: false,
      isShareable: false,
      refreshing: false,
      feedbackRowId: null,
      tooltipName: null,
      explanationIconModal: false,
      focusedUserView: '',
      careerFocused: "",
      username: '',
      isFilters: false,
      filteredData: [],
      filteredIds: [],
      selectedButton: '',
      allHomeData: {},
      rating: 0,
      explorePost: {},
      isPlay: false,
      exploreVideo: { ytVideoId: '', vimeoVideoId: '', other: '', notificationId: 0, isClosed: true },
      scrollDownY: 0,
      talents: [],
      recording: false,
      setRecordingUri: '',
      orientation: 'portrait',
      cam: 100,
      feedbackStatus: 'dismiss',
      secondScreen: false,
      isJobPage: false,
      jobsList: [],
      jobDetails: {},
      parentYPosition: 0,
      previewImage: "",
      pastJobApplications: []
    }

    openBarChartBackHeight = height - 140;
    session = this;
    Dimensions.addEventListener('change', () => {
      this.setState({ orientation: isPortrait() ? 'portrait' : 'landscape' })
    })
  }

  _handleOpenURL(event) {
    CONST.deeplink(event.url, session.props.componentId);
  }

  onUserViewRef({ viewableItems }) {
    let { item } = viewableItems[0]
    let selectedBtn = item.split(' ')[1]
    if (selectedBtn === 'Development') {
      this.getCategoriesTalents()
      this.getArticlesByCategoryId([])
    }
    this.setState({ focusedUserView: item, selectedButton: selectedBtn })
  }

  componentDidMount() {
    // check for deeplink url
    Linking.addEventListener('url', this._handleOpenURL);
    registerAppListener(this.props.navigator, this.props.componentId);
    CONST.setUserType("old");

    isBarCollapse = false;
    this.setState({ topbarTopMargin: CONST.checkIphoneX() });
    this.navigationEventListener = Navigation.events().bindComponent(this);

    //this.checkFirebasePermmision();
    this.onBarChartArrowClick();
    // Navigation.events().registerComponentDidAppearListener(() => {
    //   setTimeout(() => {
    //     this.flatListRef?.scrollToOffset({ offset: 0, animated: true })
    //   }, 500)
    // })

    if (this.props.from === 'deeplink') {
      this.getDeepLinkData();
    } else {
      this.getHomeCategoryData();
    }
    const operator = Platform.select({ ios: '&', android: '?' });

    Linking.canOpenURL(`sms:${operator}body=${""}`).then(supported => {
      if (supported) {
        isMessagesAvailable = true;
      }
    });
    Linking.canOpenURL('mailto:support@example.com').then(supported => {
      if (supported) {
        isMailAvailable = true;
      }
    });
    Linking.canOpenURL('whatsapp://send?text=').then(supported => {
      console.log('whatsapp supported: ', supported);
      if (supported) {
        isWhatsappAvailable = true;
      }
    });
    this.animatedValue = new Animated.Value(0);
  }

  animate() {
    const { parentYPosition } = this.state;
    let FINAL_POSITION = 150
    Animated.timing(this.animatedValue, {
      toValue: FINAL_POSITION - parentYPosition
    }).start();
  }

  async requestPermission() {
    try {
      console.log('180');
      await messaging().requestPermission();
      // User has authorised
      this.getFcmtoken();
    } catch (error) {
      // User has rejected permissions
      console.log('permission rejected');
    }
  }

  async checkFirebasePermmision() {
    const authStatus = await messaging().requestPermission();
    const enabled = authStatus === messaging.AuthorizationStatus.AUTHORIZED || authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    //console.log('x1: ', authStatus);

    if (enabled) {
      this.getFcmtoken();
    } else {
      this.requestPermission();
    }
  }

  async getFcmtoken() {
    // get fcm token and send back to backend
    // FCM.getFCMToken().then(token => {
    //   Api.getUserToken(session, this.state.barchartTitle, DeviceInfo.getUniqueId(), DeviceInfo.getDeviceId(), token, function(parent, data){
    //     // console.log('------ getUserProfile response >>> '+ data.data.name);
    //   });
    // });

    // this.onTokenRefreshListener = messaging().onTokenRefresh(fcmToken => {
    //     console.log('Update FCM Token : ', fcmToken);
    //     if (fcmToken) {
    //
    //     }
    // });

    const enabled = await messaging().hasPermission();
    //console.log('x3: ', enabled);
    if (enabled) {
      //console.log('Notification Permission Apply :', enabled);
      let getToken = await messaging().getToken();
      console.log('FCM Token : ', getToken);
      Api.getUserToken(session, this.state.barchartTitle, DeviceInfo.getUniqueId(), DeviceInfo.getDeviceId(), getToken, function (parent, data) {
        // console.log('------ getUserProfile response >>> '+ data.data.name);
      });
    }
    else {
      this.requestPermission();
    }
  }

  getDeepLinkData() {
    // get deeplink data
    Api.addRecipientForDeepLink(this, this.props.token, DeviceInfo.getUniqueId(), function (parent, data) {
      // get home data
      console.log('addRecipientForDeepLink: ', data);
      if (data.status == 200) {
        parent.getHomeCategoryData();
      } else {
        return;
      }
    });
  }

  getHomeCategoryData() {
    let { careerFocused, focusedUserView } = this.state
    // get userprofile for display name on screen //DeviceInfo.getUniqueId()
    Api.getUserProfile(this, DeviceInfo.getUniqueId(), function (parent, data) {
      //console.log('home getUserProfile response: ', data);
      if (data.status == 200) {
        if (data.data.photo != 'https://natably.com/images/avatar.png') {
          parent.setState({ userImage: data.data.photo });
          CONST.setProfileAvatar(data.data.photo);
        } else {
          parent.setState({ userImage: null });
        }

        if (data.data.hasOwnProperty('code')) {

          if (data.data.code != null) {
            //console.log('home getGroupCode will call');
            Api.getGroupCode(parent, data.data.code, function (parent, data) {
              //console.log('GetGroupCode Response: ', JSON.stringify(data));

              if (data.status == 200) {

                parent.setState({ groupImage: data.data.logo });

              } else if (data.status == 404) {
                //console.log('xxx 293: ', data);
                parent.setState({ groupImage: null });
              }
            });
          }
          else {
            parent.setState({ groupImage: null });
          }
        }
        if (data.data.name != '') {
          parent.setState({ username: data.data.name, barchartTitle: data.data.name + "'s Talents", focusedUserView: focusedUserView === data.data.name + "'s Career" ? focusedUserView : data.data.name + "'s Talents", selectedButton: careerFocused?.includes('Career') ? "Career" : 'Talents' })
        } else {
          parent.setState({ username: User, barchartTitle: "User's Talents", focusedUserView: "User's Talents", selectedButton: 'Talents' })
        }
      } else {
        this.setState({
          isLoading: false
        });
        return;
      }

    });
    this.setState({
      isLoading: true
    });
    // get home data
    Api.getHomeCategories(this, DeviceInfo.getUniqueId(), function (parent, data) {
      if (data.status == 200) {
        parent.setState({ allHomeData: data?.data })
        homeData = data.data.categories;
        var openMockData = [];
        // loop for generating barchart data array start
        for (var i = 0; i < data.data.categories.length; i++) {
          var headerdata = data.data.categories[i].name + '+' + data.data.categories[i].bar_width + '+' + data.data.categories[i].bar_color;

          openMockData.push({
            header: headerdata,
            content: data.data.categories[i].thumbnails
          });
        }

        let allSkills = [];
        let skill = data.data.categories.filter((category, index) => {
          category.thumbnails.filter((thumbnail, idx) => {
            thumbnail.feedbacks.filter((feedback, ind) => {
              feedback.skills.filter((cell, position) => {
                let obj = {
                  title: cell,
                  count: 1
                }
                allSkills.push(obj);
              })
            })
          })
        });

        const allSkill = allSkills.reduce((a, c) => {
          let found = a.find(({ title }) => title === c.title);
          if (found) {
            found.count = found.count + c.count; //[...found.data, ...c.data];
          } else {
            a.push(c);
          }
          return a;
        }, []);

        // loop for generating barchart data array end
        parent.setState({
          barchartData: openMockData,
          allSkills: allSkill,
          feedbackData: data.data.feedbacks.feedbacks,
          //notificationsData: data.data.feedbacks.feedbacks,
          exploreData: data.data.talent_news,
          jobNotificationsData: data.data.job_notifications,
          isShareable: data.data.shareable,
          pastJobApplications: data.data.past_applications
          //isShareable: true,
        });

        parent.getPastRequestApi();
        parent.getProfileShareApi();
        parent.getSelfAssessmentData();
      } else {
        this.setState({
          isLoading: false
        });
      }
    });
  }

  getProfileShareApi() {
    Api.getShareProfile(this, DeviceInfo.getUniqueId(), function (parent, data) {
      parent.setState({
        isLoading: false
      });
      if (data.status == 200) {
        parent.setState({
          profileShateList: data.data
        });
      } else {
        return;
      }
    });
  }

  getSelfAssessmentData() {
    // get sel assessment data
    Api.getSelfAssessment(this, DeviceInfo.getUniqueId(), function (parent, data) {
      if (data.status == 200) {
        parent.setState({ scoreData: data.data });
        var selfAsseessment = [];
        var notInHome = [];

        if (homeData.length > 0) {
          for (var i = 0; i < homeData.length; i++) {
            for (var k = 0; k < data.data.length; k++) {
              if (homeData[i].name.replace(/[^a-zA-Z ]/g, "").replace(" ", "").toLowerCase() === data.data[k].name.replace(/[^a-zA-Z ]/g, "").replace(" ", "").toLowerCase()) {
                homeData[i]["score"] = data.data[k].score;
                selfAsseessment.push({ "name": data.data[k].name })
              }
            }
          }
          // loop for generating self assessment data array end
          // loop for cheking homedata contain selected category or not start
          for (var i = 0; i < homeData.length; i++) {
            for (var k = 0; k < data.data.length; k++) {
              var index = selfAsseessment.findIndex(x => x.name.replace(/[^a-zA-Z ]/g, "").replace(" ", "").toLowerCase() == data.data[k].name.replace(/[^a-zA-Z ]/g, "").replace(" ", "").toLowerCase())
              var index1 = notInHome.findIndex(x => x.name.replace(/[^a-zA-Z ]/g, "").replace(" ", "").toLowerCase() == data.data[k].name.replace(/[^a-zA-Z ]/g, "").replace(" ", "").toLowerCase())
              if (index === -1 && index1 === -1) {
                notInHome.push(data.data[k]);
              }
            }
          }
          // loop for cheking homedata contain selected category or not end
          var openMockData = [];
          var headerdata;
          // loop for adding score value to homedata array start
          for (var i = 0; i < homeData.length; i++) {
            if (homeData[i].hasOwnProperty("score")) {
              headerdata = homeData[i].name + '+' + homeData[i].bar_width + '+' + homeData[i].bar_color + '+' + homeData[i].score;
            } else {
              headerdata = homeData[i].name + '+' + homeData[i].bar_width + '+' + homeData[i].bar_color;
            }
            openMockData.push({ header: headerdata, content: homeData[i].thumbnails });
          }
          // loop for adding score value to homedata array end
          parent.setState({ barchartData: openMockData, scoreData: notInHome });
        }
        else {

          var openMockData = [];
          var headerdata;

          for (var i = 0; i < data.data.length; i++) {
            if (data.data[i].hasOwnProperty("score")) {
              headerdata = data.data[i].name + '+' + data.data[i].color + '+' + data.data[i].score;
            } else {
              headerdata = data.data[i].name + '+' + data.data[i].color;
            }
            openMockData.push({ header: headerdata });
          }
          //console.log('hh: ', openMockData);
          parent.setState({ barchartData: openMockData });
        }
      } else {
        parent.setState({
          isLoading: false
        });
        return;
      }
    });
  }

  // getExplorePost
  getExplorePost(id) {
    // let { id } = item
    Api.getExplorePost(this, id, DeviceInfo.getUniqueId(), function (parent, data) {
      if (data.status === 200) {
        let { categories, description, title, topic, rating } = data?.data
        if (data?.data) {
          parent.setState({ explorePost: data?.data, rating: rating })
        }
      }
      else {
        this.setState({
          isLoading: false
        });
        return;
      }
    })
  }

  // detect URL from raw string
  detectURLs(message) {
    var urlRegex = /(((https?:\/\/)|(www\.))[^\s]+)/g;
    return message.match(urlRegex)
  }

  // getExploreLink
  getExploreLink(item) {
    if (this.detectURLs(item?.resource)) {
      let modifiedLink = this.detectURLs(item?.resource)[0]
      Linking.openURL(modifiedLink)
    }
  }


  // getCategories
  getCategoriesTalents() {
    console.log('getCategoriesTalents calling');
    Api.getCategories(this, function (parent, data) {
      console.log('getCategoriesTalents DAta', data);
      if (data.status === 200) {
        parent.getArticlesByCategoryId([]);
        parent.setState({ talents: data?.data, })
      }
      else {
        this.setState({
          isLoading: false
        });
        return;
      }
    })
  }

  // ---------- past request method start --------
  getPastRequestApi() {
    Api.getPastRequest(this, DeviceInfo.getUniqueId(), function (parent, data) {
      parent.setState({
        isLoading: false
      });

      if (data.status == 200) {
        // set past request data
        parent.setState({ postRequestData: data.data });
        //console.log('showNoDataImage will be set');
        //console.log('parent.state.feedbackData: ', parent.state.feedbackData);
        //console.log('parent.state.postRequestData: ', parent.state.postRequestData);
        if (parent.state.feedbackData.length == 0 && parent.state.postRequestData.length == 0) {
          parent.setState({ showNoDataImage: true });
        }
        else {
          parent.setState({ showNoDataImage: false });
        }
      } else {
        return;
      }

    });
  }

  onResendRequestClick(id) {
    this.setState({
      isLoading: true
    });
    // re-send past request data
    Api.resendPastRequest(this, id, DeviceInfo.getUniqueId(), function (parent, data) {
      parent.setState({
        isLoading: false
      });

      if (data.status == 200) {
        shareLink = data.data.url
        setTimeout(function () {
          session.setState({
            //isLoading: true,
            isShareSheetVisible: true
          });
        }, 500);
      } else {
        return;
      }

      // setTimeout(function(){
      //     CONST.openShareLinkDialog(data.data.url);
      // },500);
    });
  }

  onCancelRequestClick(data) {

    console.log('status: ', data.status);
    deleteId = data.id;
    deleteFrom = 'request';
    this.setState({
      isLoading: true,
      isModalVisible: false
    });

    if (data.status == 'Completed') {
      this.untrackRequestApi();
    }
    else {
      this.deleteRequestApi();
    }
    return;
  }

  untrackRequestApi() {
    this.setState({
      isLoading: true
    });
    // delete past request data
    Api.untrackPastRequest(this, deleteId, DeviceInfo.getUniqueId(), function (parent, data) {
      console.log('untrackPastRequest: ', data);
      parent.setState({
        isLoading: false
      });
      if (data.status == 200) {
        parent.getHomeCategoryData();
        deleteFrom = '';
        deleteId = '';
      } else {
        deleteFrom = '';
        deleteId = '';
        return;
      }

    });
  }

  deleteRequestApi() {
    this.setState({
      isLoading: true
    });
    // delete past request data
    Api.deletePastRequest(this, deleteId, DeviceInfo.getUniqueId(), function (parent, data) {
      console.log('deletePastRequest: ', data);
      parent.setState({
        isLoading: false
      });
      if (data.status == 200) {
        parent.getHomeCategoryData();
        deleteFrom = '';
        deleteId = '';
      } else {
        deleteFrom = '';
        deleteId = '';
        return;
      }

    });
  }
  // Archive Explore Notifications
  archiveExploreNotifications(articleId) {
    this.setState({
      isLoading: true
    });
    // delete past request data
    Api.archiveArticleById(this, articleId, DeviceInfo.getUniqueId(), function (parent, data) {
      console.log('archiveExploreNotifications: ', data);
      parent.setState({
        isLoading: false
      });
      if (data.status == 200) {
        parent.getHomeCategoryData();
        deleteFrom = '';
        deleteId = '';
      } else {
        deleteFrom = '';
        deleteId = '';
        return;
      }
    });
  }

  onShareClick(type) {
    this.setState({
      isShareSheetVisible: false
    })

    let message = `Hi${shareName},\nWould you give me some talent points and help me identify what I am good at? It takes only a couple of minutes. \n\nPlease visit the following link: ${shareLink}\n\nThank you!`;
    let options = {
      title: CONST.appName,
      social: type == 'whatsapp' ? Share.Social.WHATSAPP : type == 'messages' ? Share.Social.SMS : null,
    }
    if (type == "gmail") {
      if (Platform.OS === 'android') {
        if (shareType == "talentpoint") {
          options.message = message
        } else {
          options.url = shareLink;
        }
        options.social = Share.Social.EMAIL
        setTimeout(() => {
          Share.shareSingle(options);
        }, 300);
      }
      else {
        let gmailURL
        if (shareType == "talentpoint") {
          gmailURL = 'mailto:?subject=&body=' + shareType + message
        }
        else {
          gmailURL = 'mailto:?subject=&body=' + shareType + shareLink
        }
        console.log("shareType", shareType);
        console.log("Mail Data", gmailURL);
        Linking.openURL(gmailURL);
      }
    } else if (type == 'copylink') {
      console.log('shareType', shareType);
      Clipboard.setString(shareType == "talentpoint" ? message : shareLink);
      Toast.show({
        type: 'info',
        position: 'bottom',
        visibilityTime: 3000,
        text1: shareType == "talentpoint" ? 'Points request has been copied. Paste the request it into the communication app of choice.' : 'Profile share has been copied.'
      });
    } else if (type == 'whatsapp') {
      options.url = shareLink;
      if (Platform.OS === 'android') {
        setTimeout(() => {
          Share.shareSingle(options);
        }, 300);
      }
      else {
        let whatsappURL = 'whatsapp://send?text=' + shareLink;
        Linking.openURL(whatsappURL);
      }
    } else if (type == 'messages') {
      const operator = Platform.select({ ios: '&', android: '?' });
      Linking.openURL(`sms:${operator}body=${shareLink}`);
    }
  }

  _renderPastRequestItem = ({ item: rowData, index }) => {
    return (
      <TalentPointView
        rowData={rowData}
        onClear={() => { this.onCancelRequestClick(rowData); }}
        onDelete={() => { currentLinkData = rowData; this.setState({ isModalVisible: true }); }}
        onResend={() => {
          shareName = rowData.provider_name != "(Name not provided)" ? " " + rowData.provider_name : "";
          shareType = "talentpoint";
          this.onResendRequestClick(rowData.id);
        }}
      />
    )
  }

  _renderProfileShareItem = ({ item: rowData, index }) => {
    return (
      <ProfileShareItem
        item={rowData}
        onCompleteAction={() => {
          this.setState({ isLoading: false });
          this.getProfileShareApi();
        }}
        onGetProfileUrl={(url) => {
          this.setState({ isLoading: false });
          shareLink = url;
          shareType = "profile";
          setTimeout(function () {
            session.setState({
              isShareSheetVisible: true
            });
          }, 500);
        }}
        onChangeLoading={(visible) => { console.log('isLoading: ', visible); this.setState({ isLoading: visible }) }} />
    )
  }
  // ---------- past request method end --------

  headerOnPress() {
    isBarCollapse = false;
    this.setState({
      barchartHeight: openBarChartBackHeight,
      barchartHeaderFlex: 0.07,
      barchartListFlex: 8,
      barChartArrow: require('../img/up_arrow.png')
    });
  }

  componentDidAppear() {
    let { careerFocused } = this.state
    if (careerFocused) {
      this.setState({ focusedUserView: `${this.state.username}'s Career`, selectedButton: "Career" })
    }
    else {
      this.setState({ focusedUserView: `${this.state.username}'s Talents`, selectedButton: "Talents" })
    }
    Navigation.mergeOptions(this.props.componentId, {
      sideMenu: {
        left: {
          visible: false,
        }
      }
    });

    if (this.state.calledApi) {
      this.setState({
        calledApi: false
      });
      this.getHomeCategoryData();
    }
  }

  componentDidDisappear() {
    this.setState({
      calledApi: true
    });
  }

  onMenuClick() {
    this.setState({ careerFocused: '' })
    Navigation.mergeOptions(this.props.componentId, {
      sideMenu: {
        left: {
          visible: true,
        }
      }
    });
  }
  // Realize MenuClick
  onRealizeMenuClick() {
  }
  // on notification icon press
  notificationIconClick() {

  }

  onBarChartArrowClick() {

    // expand or collapse bar items
    if (isBarCollapse) {
      isBarCollapse = false;
      this.setState({
        barchartHeight: openBarChartBackHeight,
        showSelfAssessment: true,
        barchartHeaderFlex: 0.07,
        barchartListFlex: 8,
        barChartArrow: require('../img/up_arrow.png')
      });
    } else {
      isBarCollapse = true;
      this.setState({
        barchartHeight: collapseBarChartBackHeight,
        barchartHeaderFlex: 0.3,
        showSelfAssessment: false,
        barchartListFlex: 65,
        barChartArrow: require('../img/down_arrow.png')
      });
      // for (var i = 0; i < this.state.barchartData.length; i++) {
      //   this.ExpandableList.setSectionState(i, false);
      // }
    }
  }

  onNotificationIconClick() {
    let focusedUserView = this.state.focusedUserView
    if (!focusedUserView.includes('Talents')) {
      this.flatListRef.scrollToIndex({ index: 0, animated: false })
      this.setState({ focusedUserView: `${this.state.username}'s Talents`, selectedButton: 'Talents' })
      isBarCollapse = true;
      this.setState({
        barchartHeight: collapseBarChartBackHeight,
        barchartHeaderFlex: 0.3,
        showSelfAssessment: false,
        barchartListFlex: 65,
        barChartArrow: require('../img/down_arrow.png')
      });
    }
    // expand or collapse bar items
    else {
      if (isBarCollapse) {
        isBarCollapse = false;
        this.setState({
          barchartHeight: openBarChartBackHeight,
          showSelfAssessment: true,
          barchartHeaderFlex: 0.07,
          barchartListFlex: 8,
          barChartArrow: require('../img/up_arrow.png')
        });
      } else {
        isBarCollapse = true;
        this.setState({
          barchartHeight: collapseBarChartBackHeight,
          barchartHeaderFlex: 0.3,
          showSelfAssessment: false,
          barchartListFlex: 65,
          barChartArrow: require('../img/down_arrow.png')
        });
      }
    }
  }

  onAcceptAllFeedback() {
    this.setState({
      isLoading: true
    });
    // accept all feedback requests
    Api.setAcceptAllFeedback(this, DeviceInfo.getUniqueId(), function (parent, data) {
      parent.setState({
        isLoading: false
      });
      if (data.status == 200) {
        parent.getHomeCategoryData();
      } else {
        return;
      }

    });
  }

  onAcceptSingleFeedback(id) {
    // accept single feedback request
    this.setFeedbackStatus(id, 'accepted');
  }

  onIgnoreFeedback(id) {
    // delete feedback request
    deleteFrom = 'ignored';
    deleteId = id;
    this.onDeleteCategoryFeedback('ignored', id);
  }

  setFeedbackStatus(id, status) {
    this.setState({
      isLoading: true,
      feedbackStatus: status
    });
    Api.setFeedbackStatus(this, id, DeviceInfo.getUniqueId(), status, function (parent, data) {
      parent.setState({
        isLoading: false
      });

      if (data.status == 200) {
        if (data.error == '1') {

        } else {
          // loop for removing feedback items from array on changed feedback status api success start
          for (var i = 0; i < session.state.feedbackData.length; i++) {
            for (var j = 0; j < session.state.feedbackData[i].content.length; j++) {
              if (session.state.feedbackData[i].content[j].id == deleteId) {
                session.state.feedbackData[i].content.splice(j, 1);
              }
            }
          }
          parent.setState({
            feedbackRowId: null,
            feedbackAction: '',
            feedbackLastDeletedRow: null
          })
          // loop for removing feedback items from array on changed feedback status api success end
          parent.getHomeCategoryData();
          deleteFrom = '';
          deleteId = '';
        }
      } else {
        return;
      }

    });
  }

  cancelFeedbackStatus() {
    this.setState({
      feedbackRowId: null,
      feedbackAction: ''
    });
    clearTimeout(undoFeedback);
    console.log('Timeout cancel');
  }

  onDeleteCategoryFeedback(from, id) {
    deleteFrom = from;
    deleteId = id;
    this.setState({ isFeedbackModalVisible: true })
  }

  deleteApi() {

    if (deleteFrom == 'feedback') {
      this.setState({
        isLoading: true
      });
      Api.setFeedbackStatus(this, deleteId, DeviceInfo.getUniqueId(), 'ignored', function (parent, data) {
        parent.setState({
          isLoading: false
        });

        if (data.status == 200) {
          if (data.error == '1') {

          } else {
            var tempArr = session.state.barchartData;
            // loop for removing feedback items from array on success start
            for (var i = 0; i < tempArr.length; i++) {
              for (var j = 0; j < tempArr[i].content.length; j++) {
                for (var k = 0; k < tempArr[i].content[j].feedbacks.length; k++) {
                  if (tempArr[i].content[j].feedbacks[k].id == deleteId) {
                    tempArr[i].content[j].feedbacks.splice(k, 1);
                  }
                }
              }
            }
            // loop for removing feedback items from array on success end
            deleteFrom = '';
            deleteId = '';
            session.setState({ barchartData: tempArr });
          }
        } else {
          return;
        }
      });
    } else if (deleteFrom == 'request') {
      this.deleteRequestApi();
    } else {
      this.setFeedbackStatus(deleteId, 'ignored');
    }
  }

  onGetFeedbackClick() {
    // goto get feedback screen
    Navigation.push(this.props.componentId, {
      component: {
        name: CONST.GetFeedbackScreen,
        options: {
          topBar: {
            drawBehind: true,
            visible: false,
            animate: false
          }
        }
      }
    });
  }

  onGiveFeedbackClick(from) {
    // goto give feedback screen
    Navigation.push(this.props.componentId, {
      component: {
        name: CONST.GiveFeedbackScreen,
        passProps: {
          personName: from,
        },
      }
    });
  }

  // onSendReciprocateFeedback(name) {
  //   // give feedback to any selected user
  //   this.onGiveFeedbackClick(name);
  // }

  onCancelPopup() {
    this.setState({ isModalVisible: false })
  }

  onAcceptPopup() {
    session.setState({ isFeedbackModalVisible: false })
    setTimeout(function () {
      session.deleteApi();
    }, 500);
  }

  onExploreItemClick(getItem) {
    // console.log('getItem', getItem);
    let ytVideoId
    if (getItem?.resource?.includes('https://youtu.be/')) {
      this.getExplorePost(getItem?.id)
      // ytVideoId = getItem?.resource?.replace('https://youtu.be/', '')
      this.setState({ exploreVideo: { ytVideoId: getItem?.resource?.replace('https://youtu.be/', ''), vimeoVideoId: '', other: '', notificationId: getItem?.id, isClosed: false } })
    }
    else if (getItem?.resource?.includes('https://www.youtube.com/watch?v=')) {
      this.getExplorePost(getItem?.id)
      // ytVideoId = getItem?.resource?.replace('https://www.youtube.com/watch?v=', '')
      this.setState({ exploreVideo: { ytVideoId: getItem?.resource?.replace('https://www.youtube.com/watch?v=', ''), vimeoVideoId: '', other: '', notificationId: getItem?.id, isClosed: false } })
    }
    else {
      // ytVideoId = getItem?.resource
      this.setState({ exploreVideo: { ytVideoId: '', vimeoVideoId: '', other: getItem?.resource, notificationId: 0, isClosed: true } })
    }
    // try {
    //   Alert.alert(
    //     CONST.appName,
    //     'This page will open in browser.',
    //     [
    //       { text: 'Cancel' },
    //       {
    //         text: 'Open', onPress: () => {
    //           Linking.openURL(getItem.url);
    //         }
    //       }
    //     ]);

    // } catch (e) {
    //   console.log('Open Url Error: ', e);
    // }
    // goto Explore Screen
    // Navigation.push(this.props.componentId, {
    //   component: {
    //     name: CONST.ExploreScreen,
    //     options: {
    //       topBar: {
    //         drawBehind: true,
    //         visible: false,
    //         animate: false
    //       }
    //     },
    //     passProps: { item: getItem }
    //   },
    // });
  }

  onCancelShareSheet() {
    this.setState({ isShareSheetVisible: false });
  }

  onFeedbackAction(rowId, type) {
    this.setState({
      feedbackRowId: rowId,
      feedbackAction: type
    });
    undoFeedback = setTimeout(() => {
      this.setState({
        feedbackRowId: null,
        feedbackAction: 'cancelled',
        feedbackLastDeletedRow: rowId,
      });

      if (type == 'Accept') {
        this.onAcceptSingleFeedback(rowId);
      } else if (type == 'Dismiss') {
        this.onIgnoreFeedback(rowId);
      }

      //
    }, 5000);
  }

  onPressFilterIcon() {
    isBarCollapse = false;
    this.setState({ isFilters: !this.state.isFilters, barChartArrow: require('../img/up_arrow.png') })
  }
  onPressFilters(item, index) {
    let { exploreFilteredData, exploreData } = this.state
    this.setState({ explorePost: {} })
    let { name, id } = item
    let title = name
    let newFilterData = [...this.state.filteredData]
    let newFilterIds = [...this.state.filteredIds]
    let catIds = []

    if (!newFilterIds.includes(id)) {
      newFilterIds.push(id)
      this.getArticlesByCategoryId(newFilterIds)
    }
    else {
      newFilterIds = newFilterIds.filter(it => it !== id)
      this.getArticlesByCategoryId(newFilterIds)
    }
    this.setState({ filteredIds: newFilterIds })
  }
  // star rating
  giveArticleRate(star, articleId) {
    this.setState({ rating: star })
    Api.setArticleRateById(this, articleId, DeviceInfo.getUniqueId(), star, function (parent, data) {
      if (data.status === 200) {
        parent.getExplorePost(articleId)
      }
    })
  }

  // get articles by CategoryId
  getArticlesByCategoryId(categoryIds) {
    console.log('getArticlesByCategoryId calling', categoryIds);
    Api.getArticlesByCategory(this, categoryIds, DeviceInfo.getUniqueId(), async function (parent, data) {
      console.log('getArticlesByCategoryId data?.data', data);
      if (data.status === 200) {
        parent.setState({ exploreFilteredData: data?.data, isLoading: false })
      }
      else {
        this.setState({
          isLoading: false
        });
        return;
      }
    })
  }
  getJobsList() {
    Api.getJobList(this, DeviceInfo.getUniqueId(), async function (parent, data) {
      if (data.status === 200) {
        parent.setState({ jobsList: data?.data })
      }
      else {
        this.setState({
          isLoading: false
        });
        return;
      }
    })
  }

  // clear filters (develop)
  clearFilters() {
    this.setState({ filteredIds: [], explorePost: {} })
    this.getArticlesByCategoryId([])
  }

  // Request Job Page
  onReqJobPage(jobId) {
    this.setState({
      isLoading: true
    });
    Api.getJobDetailsByJobId(this, DeviceInfo.getUniqueId(), jobId, async function (parent, data) {
      if (data.status === 200) {
        parent.setState({ jobDetails: data?.data, isJobPage: true })
      }
      else {
        parent.setState({
          isLoading: false
        });
        return;
      }
    })
    this.setState({
      isLoading: false
    });
  }

  // Resend Job Application Request
  resendJobAppReq(id) {
    this.setState({
      isLoading: true
    });
    Api.resendJobApplication(this, DeviceInfo.getUniqueId(), id, async function (parent, data) {
      if (data.status === 200) {
        parent.getHomeCategoryData();
      }
      else {
        parent.setState({
          isLoading: false
        });
        return;
      }
    })
    this.setState({
      isLoading: false
    });
  }
  // Delete Job Application Request
  deleteJobAppReq(id) {
    this.setState({
      isLoading: true
    });
    Api.deleteJobApplicationRequest(this, DeviceInfo.getUniqueId(), id, async function (parent, data) {
      if (data.status === 200) {
        // console.log('deleteJobAppReq data data data', data);
        parent.getHomeCategoryData();
      }
      else {
        parent.setState({
          isLoading: false
        });
        return;
      }
    })
    this.setState({
      isLoading: false
    });
  }

  _renderFeedbackModalContent = () => (
    <View style={{ width: width - 30, height: 150, backgroundColor: "white", justifyContent: 'center', alignItems: "center", borderRadius: 4, borderColor: "rgba(0, 0, 0, 0.1)" }}>
      <View style={{ flex: 0.5, justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent' }}>
        <Text style={{ color: "#000", fontSize: 20, padding: 8, justifyContent: 'center', alignItems: 'center', fontFamily: 'SFUIDisplay-Bold' }}>Are you sure want to dismiss this response?</Text>
      </View>
      <View style={{ flex: 0.5, width: width - 50, height: 50, justifyContent: 'center', backgroundColor: 'transparent' }}>
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <TouchableHighlight style={{ flex: 0.5, borderRadius: 3, alignSelf: 'center', backgroundColor: '#4ec5c1', alignItems: 'center', borderRadius: 3, marginRight: 4 }} underlayColor='transparent' onPress={() => { this.onAcceptPopup(); }}>
            <Text style={{ padding: 12, textAlign: 'center', fontSize: 18, color: 'white', fontFamily: 'SFUIDisplay-Bold' }} >Yes</Text>
          </TouchableHighlight>
          <TouchableHighlight style={{ flex: 0.5, borderRadius: 3, alignSelf: 'center', backgroundColor: '#ec576b', alignItems: 'center', borderRadius: 3, marginLeft: 4 }} underlayColor='transparent' onPress={() => { this.setState({ isFeedbackModalVisible: false }); }}>
            <Text style={{ padding: 12, textAlign: 'center', fontSize: 18, color: 'white', fontFamily: 'SFUIDisplay-Bold' }} >No</Text>
          </TouchableHighlight>
        </View>
      </View>
    </View>
  );

  _renderModalContent = () => (
    <View style={{ width: width - 30, height: 150, backgroundColor: "white", justifyContent: 'center', alignItems: "center", borderRadius: 4, borderColor: "rgba(0, 0, 0, 0.1)" }}>
      <View style={{ flex: 0.5, justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent' }}>
        <Text style={{ color: "#000", fontSize: 20, padding: 8, justifyContent: 'center', alignItems: 'center', fontFamily: 'SFUIDisplay-Bold' }}>Cancel request and delete from request tracker?</Text>
      </View>
      <View style={{ flex: 0.5, width: width - 50, height: 50, justifyContent: 'center', backgroundColor: 'transparent' }}>
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <TouchableHighlight style={{ flex: 0.5, borderRadius: 3, alignSelf: 'center', backgroundColor: '#4ec5c1', alignItems: 'center', borderRadius: 3, marginRight: 4 }} underlayColor='transparent' onPress={() => { this.onCancelRequestClick(currentLinkData); }}>
            <Text style={{ padding: 12, textAlign: 'center', fontSize: 18, color: 'white', fontFamily: 'SFUIDisplay-Bold' }} >Yes</Text>
          </TouchableHighlight>
          <TouchableHighlight style={{ flex: 0.5, borderRadius: 3, alignSelf: 'center', backgroundColor: '#ec576b', alignItems: 'center', borderRadius: 3, marginLeft: 4 }} underlayColor='transparent' onPress={() => { this.onCancelPopup(); }}>
            <Text style={{ padding: 12, textAlign: 'center', fontSize: 18, color: 'white', fontFamily: 'SFUIDisplay-Bold' }} >No</Text>
          </TouchableHighlight>
        </View>
      </View>
    </View>
  );

  _renderfeedbackChildItem = ({ item: rowData, index }) => {

    return (
      <FeedbackContentItem
        rowData={rowData}
        feedbackRowId={this.state.feedbackRowId}
        feedbackAction={this.state.feedbackAction}
        feedbackLastDeletedRow={this.state.feedbackLastDeletedRow}
        commonHeight={110}
        styleContainer={[style.feedbackChildContainer, { marginTop: index != 0 ? 14 : 0 }]}
        onUndoClick={() => {
          this.cancelFeedbackStatus();
        }}
        onAcceptClick={() => {
          this.onFeedbackAction(rowData.id, 'Accept');
        }}
        onDismissClick={() => {
          this.onFeedbackAction(rowData.id, 'Dismiss')
        }}
      />
    )
  }

  _renderfeedbackItem = ({ item: rowData, index }) => {

    return (
      <View style={{ marginTop: 4, marginBottom: 8, backgroundColor: '#FFFFFF', minHeight: 230 }}>
        <TouchableOpacity onPress={() => this.setState({ explanationIconModal: true })}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }} >
            <RelationshipIcon relationship={rowData.content[0].relationship} hasReference={rowData.content[0].has_reference} />

            <View style={{ flex: 0.75, alignItems: 'center', marginLeft: 8, flexDirection: 'row' }}>
              <TouchableHighlight style={{}} underlayColor='transparent' onLongPress={() => { this.onSendReciprocateFeedback(rowData.provider_name); }}>
                <Text style={style.providername}>{rowData.provider_name}</Text>
              </TouchableHighlight>
              <Text style={style.thinkText}> thinks you are:</Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', flex: 1, marginTop: 8, marginBottom: 4 }}>
          <View style={{ width: 1, marginLeft: 10, backgroundColor: '#000000', opacity: 0.1, marginBottom: 8 }} />
          <FlatList
            style={{ flex: 1, marginLeft: 16 }}
            data={rowData.content}
            extraData={this.state}
            CellRendererComponent={DropShadow}
            renderItem={this._renderfeedbackChildItem}
            keyExtractor={(item, index) => index.toString()}
          />
        </View>

        {/* <TouchableHighlight style={{ flex: 0.1, justifyContent: 'center', alignItems: 'center', borderRadius: 5, borderColor: '#4ec5c1', borderWidth: 1, padding: 8, marginTop: 8, marginLeft: 10, marginRight: 10 }} underlayColor='transparent' onPress={() => { this.onSendReciprocateFeedback(rowData.provider_name); }}>
          <Text style={{ color: "#4ec5c1", fontSize: 15, fontFamily: 'SFUIDisplay-Regular' }}>Reciprocate, send {rowData.provider_name} points, too!</Text>
        </TouchableHighlight> */}
      </View>
    )
  }
  _renderJobNotificationsItem = ({ item: rowData, index }) => {
    let { company_logo, company_name, date, link_url, recruiter_response, response_choice } = rowData
    return (
      <View style={{ marginTop: 4, marginBottom: 8, backgroundColor: '#F6F6F6', minHeight: 230 }}>
        {/* <TouchableOpacity onPress={() => this.setState({})}> */}
        <View style={{ flexDirection: 'row' }} >
          <View style={[style.jnStatusRoundCon, { backgroundColor: response_choice?.includes('Contact Us') ? '#4EC5C1' : response_choice?.includes('We are no longer looking') ? '#EC576B' : '#E8D638' }]}>
            <Image style={style.jnJobStatusImage} source={require('../img/JobStatus.png')} />
            <Image style={style.jnStatusImage} imageStyle={{ height: 16, width: 16, resizeMode: "contain" }} source={response_choice?.includes('Contact Us') ? checkWhite : response_choice?.includes('We are no longer looking') ? cross : ''} />
          </View>
          <View style={{ flex: 1, marginStart: 6 }}>
            <Text style={style.companyName}>Recruiter <Text style={style.company_text}>has responded to your Job Application at </Text>{company_name}</Text>
          </View>
        </View>
        {/* </TouchableOpacity> */}

        <View style={{
          width: '80%', marginTop: 12, borderRadius: 20, backgroundColor: '#FFFFFF', paddingVertical: 16, paddingHorizontal: 20, alignSelf: 'flex-end', marginEnd: 22, shadowColor: '#A3A3C233',
          shadowOffset: {
            width: 0,
            height: 6,
          },
          shadowOpacity: 0.3,
          shadowRadius: 10,
          elevation: 12,
        }}>
          <Image style={style.companyLogo} source={{ uri: company_logo }} />
          <Text style={style.rrText}>{response_choice}</Text>
          <Text style={style.rcText}>{recruiter_response}</Text>
          <TouchableOpacity style={style.viewJobBtn} onPress={() => link_url ? Linking.openURL(link_url) : {}}>
            <Text style={style.viewJobBtnText}>View Job</Text>
          </TouchableOpacity>
        </View>
        <Text style={style.jobNotifDateText}>{date}</Text>
      </View>
    )
  }

  _renderNotificationChildItem = ({ item, index }) => {
    let commonHeight = 110;
    return (
      <View style={style.feedbackChildContainer}>
        <Swipeout onOpen={(sectionID, rowId, direction) => console.log('onPren: ', "sectionID: " + sectionID + " rowId: " + rowId + " direction: " + direction)} style={{ borderRadius: 20, minHeight: 110 + 50, marginBottom: 8, marginTop: 8 }} autoClose={true} backgroundColor={'#FFFFFF'}
          left={[{ text: 'Accept', backgroundColor: '#15BFB4', type: 'primary', onPress: () => { console.log('Accept Button Click'); } }]}
          right={[{ text: 'Dismiss', type: 'delete', backgroundColor: '#F9543D', onPress: () => { console.log('Dismiss Click'); } }]}>

          <View style={style.feedbackChildItem}>
            <View style={{ flex: 1, flexDirection: 'column', backgroundColor: '#FFFFFF', paddingTop: 10 }}>
              <View style={{ minHeight: 120, flexDirection: 'row' }}>
                <Image style={{ width: commonHeight, height: commonHeight, backgroundColor: 'transparent' }} resizeMode="contain" source={{ uri: 'http://natably.com/images/thumbnails/' + item.thumbnailUrl }} />
                <View style={{ flex: 1, flexDirection: 'column', backgroundColor: 'transparent', justifyContent: 'center', marginLeft: 6 }}>
                  <Text style={style.feedbackTitle} numberOfLines={1}>{item.thumbnailName}</Text>
                  <Text style={style.feedbackContent} >{item.feedback}</Text>
                  {item.skills.length != 0 &&
                    <Text style={style.skillTitle} >Skills</Text>
                  }
                  <View style={{ marginTop: 5, marginBottom: 5 }}>
                    {item.skills.map((row, index) => {
                      return (
                        <ChipText
                          text={row}
                        />
                      )
                    })}
                  </View>
                </View>
              </View>
            </View>
          </View>
        </Swipeout>
      </View>
    )
  }

  _renderNotificationsItem = ({ item, index }) => {
    return (
      <View style={{ flexDirection: 'column', marginTop: 4, marginBottom: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }} >
          <RelationshipIcon relationship={item.content[0].relationship} hasReference={item.content[0].has_reference} />

          <View style={{ flex: 0.75, alignItems: 'center', marginLeft: 8, flexDirection: 'row' }}>
            <TouchableHighlight style={{}} underlayColor='transparent' onLongPress={() => { console.log('Notification all Click'); }}>
              <Text style={style.providername}>{item.provider_name}</Text>
            </TouchableHighlight>
            <Text style={style.thinkText}> thinks you are:</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', flex: 1, marginTop: 8, marginBottom: 4 }}>
          <View style={{ width: 1, marginLeft: 10, backgroundColor: '#000000', opacity: 0.1, marginBottom: 8 }} />
          <FlatList
            style={{ flex: 1, marginLeft: 10 }}
            data={item.content}
            extraData={this.state}
            renderItem={this._renderNotificationChildItem}
            keyExtractor={(item, index) => index.toString()}
          />
        </View>
      </View>
    )
  }

  _renderRow = (rowItem, rowId, sectionId) => {
    let colorVal = this.state.barchartData[sectionId].header.split("+");
    const colorCode = Color(colorVal[2]);
    let commonHeight = 100;
    let commonIconHeight = 30;
    let smallIconHeight = 20;
    let rowData = this.state.exploreData[0]
    return (
      <View key={rowId} style={[style.telentRowcontainer, { borderColor: colorVal[2], }]}>
        <View style={{ backgroundColor: colorCode.alpha(0.15).string() }}>
          <View style={{ flexDirection: 'row', justifyContent: 'center', paddingTop: 24, paddingLeft: 20, paddingRight: 20, paddingBottom: 24 }}>
            <Image style={{ width: 126, height: 90 }} source={{ uri: rowItem.thumbanail }} resizeMode="contain" />

            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text style={[style.telentrowTitle, { color: colorCode.alpha(0.9).mix(Color("#000000"), 0.3).string() }]}>{colorVal[0]}</Text>
              <Text style={[style.telentRowContent, { color: colorCode.alpha(0.8).lighten(0.1).mix(Color('#000000'), 0.2).string() }]}>{rowItem.description}</Text>
            </View>
          </View>

          <View style={{ height: 1, backgroundColor: colorCode.alpha(0.2).string() }} />

          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 12, alignItems: 'center', paddingLeft: 20, paddingRight: 20, paddingBottom: 30 }}>
            <View style={{ flex: 1, alignItems: 'center', flexDirection: 'row' }}>
              <View style={{ width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' }}>
                <Text numberOfLines={1} style={{ fontFamily: 'SFUIDisplay-Medium', fontWeight: '500', fontSize: 14, color: colorCode.string() }}>{rowItem.feedbacks.length}</Text>
              </View>
              <Text style={[style.telentRowPoint, { color: colorCode.string() }]}>TALENT POINTS</Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                Navigation.push('appStack', {
                  component: {
                    id: CONST.ResponsesScreen,
                    name: CONST.ResponsesScreen,
                  }
                });
              }}
              style={{ backgroundColor: colorVal[2], justifyContent: 'center', alignItems: 'center', padding: 12, borderRadius: 47 }}>
              <Text style={{ color: '#FFFFFF', fontFamily: 'SFUIDisplay-Bold', fontWeight: '700', fontSize: 12, textTransform: 'uppercase' }}>Edit</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ marginTop: -16, paddingLeft: 20, paddingRight: 20, backgroundColor: '#FFFFFF', borderRadius: 16, paddingBottom: 20 }}>
          {rowItem.feedbacks.map((row, index) => {
            return (
              <View style={[style.rowFeedbackContainer, { marginTop: index == 0 ? 20 : 4 }]}>
                <RelationshipIcon relationship={row.relationship} hasReference={row.has_reference} style={{ marginLeft: 11, marginTop: 10, marginBottom: 10, paddingRight: row.has_reference ? 6 : 0 }} />

                <View style={{ flex: 1, justifyContent: 'center', marginLeft: 6, marginTop: 10, marginBottom: 10 }}>
                  <Text style={style.rowFeedbackTitle} numberOfLines={1}>{row.provider_name}</Text>
                  {row.feedback != '' && <Text style={style.feedbackContent}>{row.feedback}</Text>}
                  {row.skills.length !== 0 &&
                    <View>
                      <Text style={style.skillTitle}>Skills</Text>
                      <View style={{ marginTop: 5, marginBottom: 5 }}>
                        {row.skills.map((row, index) => {
                          return (
                            <ChipText
                              text={row}
                            />
                          )
                        })}
                      </View>
                    </View>
                  }
                </View>
              </View>
            )
          })}
        </View>
      </View>
    );
  };
  _renderRowDevelopments = (rowItem, rowId, sectionId) => {
    let colorVal = this.state.barchartData[sectionId].header.split("+");
    const colorCode = Color(colorVal[2]);
    let commonHeight = 100;
    let commonIconHeight = 30;
    let smallIconHeight = 20;
    let rowData = this.state.exploreData
    return (
      <View key={rowId} style={[style.telentRowcontainer, { borderColor: colorVal[2], }]}>
        <FlatList data={rowData} renderItem={({ item, index }) => {
          let { topic, title, description, image, archived } = item
          return (
            archived &&
            <View style={{}}>
              <TouchableOpacity onPress={() => this.onExpolerItemClick('item')} style={{ flexDirection: 'row', marginTop: 8 }}>
                <View style={{ backgroundColor: '#79AFF9', borderRadius: 20, height: commonIconHeight, width: 'auto', alignItems: 'center', justifyContent: 'center', flexDirection: "row", paddingEnd: 5, }}>
                  <View style={{ backgroundColor: '#E8D638', borderRadius: 20, height: commonIconHeight, width: commonIconHeight, alignItems: 'center', justifyContent: 'center', marginEnd: 5, borderColor: '#fff', borderWidth: 2 }}>
                    <Ionicons name='person' size={14} color={'#212C2C'} />
                  </View>
                  <Ionicons name='play' size={18} color={'#fff'} />
                </View>
                <View style={{ flex: 1, flexDirection: 'column', backgroundColor: 'transparent', marginLeft: 4, }}>
                  <Text style={{ color: "#000", fontSize: 16, paddingLeft: 4, paddingTop: 4, flexWrap: 'wrap', fontFamily: 'SFUIDisplay-Bold' }} numberOfLines={1}>{title}</Text>
                  <Text style={{ color: "#000", fontSize: 14, paddingLeft: 4, paddingTop: 4, flexWrap: 'wrap', fontFamily: 'SFUIDisplay-Regular' }} >{description}</Text>
                  <Image style={{ height: height / 6, width: width / 1.4, marginTop: 10 }} source={image ? { uri: image } : require('../img/ExploreVideo.png')} resizeMode="stretch" />
                </View>
              </TouchableOpacity>
            </View>
          )
        }} />
      </View>
    );
  };

  _renderSection = (section, sectionId) => {
    if (homeData.length < 1) {
      return (<View />);
    }

    let res = section.split("+");
    let commonHeight = 32;
    let mytext = res[0];
    //let textlength = width*(mytext.length)/100;
    let barlength = width * res[1] / 100 - 32;
    let barColor = res[2]; //'#ffa20f';
    //var hexrgb = 'rgba('+hex2rgb(barColor)[0]+','+hex2rgb(barColor)[1]+','+hex2rgb(barColor)[2]+',0.5)';
    let dashedLength = 0, showDashed = false;;
    if (res.length == 4) {
      dashedLength = width * res[3] / 100 - 32;
      showDashed = true;
    }
    return (
      <View style={{ flex: 0.1, height: commonHeight, flexDirection: 'row', marginTop: 8, marginBottom: 0 }} >
        {/* barchart color*/}
        <View style={{
          width: barlength,//barlength,
          height: commonHeight,
          backgroundColor: barColor,
          flexDirection: 'row',
          //borderRadius: 8,
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
          alignItems: 'center'
        }}>
        </View>
        {/* barchart dashed line*/}
        {showDashed &&
          <View style={{
            flex: 1, position: 'absolute', left: 0, top: 0, width: dashedLength, height: commonHeight,
            borderWidth: dashedWidth, borderColor: dashedColor, borderStyle: 'dashed', borderRadius: 1, borderTopLeftRadius: 8, borderTopRightRadius: 8,
          }} >
          </View>
        }
        {/* barchart text*/}
        <View style={{ flex: 1, position: 'absolute', left: 14, top: 0, justifyContent: 'center' }} height={commonHeight} width={width - 32}>
          <TextStroke stroke={1} color={barColor}>
            <Text style={{
              fontFamily: 'SFUIDisplay-SemiBold',
              fontSize: 16,
              color: 'white',
              fontWeight: '600',
              lineHeight: 17
            }}>{mytext}</Text>
          </TextStroke>
        </View>

      </View>
    );
  };

  _renderExploreItem = ({ item: rowData, index }) => {
    let { id, archived, topic, description, image, thumbnail, relationship, has_reference, resource, resource_type } = rowData
    let commonHeight = 100;
    let commonIconHeight = 30;
    let smallIconHeight = 20;
    return (
      !archived &&
      <Swipeout autoClose={true} backgroundColor={'transparent'} right={[{ text: 'Archive', type: 'delete', onPress: () => this.archiveExploreNotifications(id) }]}>
        <TouchableOpacity onPress={() => this.onExploreItemClick(rowData)} style={{}}>
          {/* <Image style={{ width: commonHeight, height: commonHeight, backgroundColor: 'transparent' }} resizeMode="contain" source={{ uri: rowData.image }} /> */}
          <View style={{ flexDirection: 'row', marginTop: 8 }}>
            <View style={{ backgroundColor: '#4EC5C1', borderRadius: 20, height: commonIconHeight, width: 'auto', alignItems: 'center', justifyContent: 'center', flexDirection: "row", paddingEnd: 5, }}>
              <View style={{ backgroundColor: '#4EC5C1', borderRadius: 20, height: commonIconHeight, width: commonIconHeight, alignItems: 'center', justifyContent: 'center', marginEnd: 5, borderColor: '#fff', borderWidth: 2 }}>
                <Ionicons name='book' size={18} color={'#212C2C'} />
                {/* <Image style={{ height: 20, width: 20 }} source={require('../img/book.png')} resizeMode='cover' /> */}
              </View>
              <Ionicons name={resource_type === 'video' ? 'play' : 'globe'} size={18} color={'#fff'} />
            </View>
          </View>
          <View style={{ flex: 1, flexDirection: 'row', backgroundColor: 'transparent', marginLeft: 4, }}>
            {resource_type !== 'link' ? <Image style={{ height: height / 11, width: width / 3.5, marginTop: 10, borderRadius: 20 }} source={thumbnail ? { uri: thumbnail } : require('../img/ExploreVideo.png')} resizeMode="stretch" /> :
              <View style={{ marginTop: 5, height: height / 11, width: width / 3.5 }}>
                <RNUrlPreview imageStyle={{ height: height / 11, width: width / 3.5 }} text={resource} />
              </View>}
            <View style={{ flexDirection: "column", flex: 1 }}>
              <Text style={{ color: "#000", fontSize: 16, paddingLeft: 4, paddingTop: 4, flexWrap: 'wrap', fontFamily: 'SFUIDisplay-Bold', flex: 1 }}>{topic}</Text>
              <Text style={{ color: "#000", fontSize: 14, paddingLeft: 4, paddingTop: 4, flexWrap: 'wrap', fontFamily: 'SFUIDisplay-Regular', flex: 1 }} >{description}</Text>
            </View>
            {/* <Image style={{ height: height / 6, width: width, marginTop: 10, backgroundColor: 'red' }} source={thumbnail ? { uri: thumbnail } : require('../img/ExploreVideo.png')} resizeMode="cover" /> */}
            {/* <Text style={{ color: "#212C2C", fontSize: 10, paddingTop: 10, flexWrap: 'wrap', fontFamily: 'SFUIDisplay-Regular' }}>31 December 16:00</Text> */}
          </View>
          {/* <Image style={{ height: height / 11, width: width / 3.5, marginTop: 10, borderRadius: 20 }} source={thumbnail ? { uri: thumbnail } : require('../img/ExploreVideo.png')} resizeMode="stretch" /> */}
        </TouchableOpacity>
      </Swipeout>
    )
  }

  _renderSelfNSkils = () => {
    return (
      <>
        <View style={{ marginTop: 20, marginLeft: 16, marginRight: 16, marginBottom: this.state.allSkills.length != 0 ? 10 : 20, paddingBottom: this.state.allSkills.length == 0 ? 10 : 0 }}>
          <View style={style.chatInfoContainer}>
            <LinearGradient style={{ width: 16, height: 16, alignSelf: 'center' }} start={{ x: 0.0, y: 0.25 }} end={{ x: 0.5, y: 1.0 }} colors={['#f4a39f', '#ace8dc', '#b7dbf3', '#fcdca9']} />
            <Text style={style.chatInfoText}>The way others see you</Text>
          </View>
          <View style={style.chatInfoContainer}>
            <View style={{ width: 16, height: 16, alignSelf: 'center', borderWidth: dashedWidth, borderColor: dashedColor, borderStyle: 'dashed' }} />
            <Text style={style.chatInfoText}>The way you see yourself</Text>
          </View>
        </View>
        <View style={{ paddingLeft: 16, paddingRight: 16, backgroundColor: '#FFFFFF', marginTop: 20, marginBottom: 20, paddingBottom: 20 }}>
          <Text style={style.allSkills}>All SKills</Text>
          <View style={style.allSkillsContainer}>
            {this.state.allSkills.map((row, index) => {
              return (
                <View style={[style.allSkillsItemContainer, { borderBottomWidth: this.state.allSkills.length == index + 1 ? 0 : 1 }]}>
                  <Text style={style.allSkillsItemText}>{row.title}</Text>
                  <View style={style.allSkillsItemCountContainer}>
                    <Text style={style.allSkillsItemCount}>{row.count}</Text>
                  </View>
                </View>
              )
            })}
          </View>
        </View>
      </>
    )
  }

  _renderExploreDevelopmentItem = ({ item, index }) => {
    let { id, image, description, archived, topic, title, thumbnail, resource_type, resource } = item
    return (
      <TouchableOpacity style={{ paddingVertical: 8, flexDirection: "row" }} onPress={() => resource_type !== 'link' ? this.getExplorePost(id) : this.getExploreLink(item)}>
        {resource_type !== 'link' ? <ImageBackground style={{ height: height / 11, width: width / 3.5, borderRadius: 11, alignItems: "center", justifyContent: 'center' }} source={{ uri: thumbnail }} resizeMode='stretch'>
          <Image style={{ height: 30, width: 30 }} source={require('../img/Play.png')} resizeMode='contain' />
        </ImageBackground> :
          extractUrls(resource)[0].includes(['.png', '.jpg', '.jpeg',]) ?
            <RNUrlPreview containerStyle={{ height: height / 11, width: width / 3.5 }}
              // imageStyle={{ height: height, width: width }}
              text={extractUrls(resource)[0]}
            // text={'https://github.com/'}
            /> :
            <Image style={{ height: height / 11, width: width / 3.5 }} source={require('../img/UrlFrame.png')} resizeMode='contain' />
          // <LinkPreview containerStyle={{
          //   height: height / 11,
          //   width: width / 3.5,
          //   backgroundColor: '#f7f7f8',
          //   borderRadius: 20,
          //   overflow: 'hidden',
          // }}
          //   text={'github.com/flyerhq'}
          //   enableAnimation
          // // renderLinkPreview={() => undefined}
          // />
        }
        <View View style={{ paddingStart: 10, flex: 1 }}>
          <Text style={{ color: "#212C2C", fontSize: 18, flexWrap: 'wrap', fontWeight: '600', lineHeight: 22, }}>{title}</Text>
          <Text style={{ color: "#212C2C", fontSize: 18, flexWrap: 'wrap', fontWeight: '400', lineHeight: 26, }}>{description}</Text>
        </View>
      </TouchableOpacity>
    )
  }

  _renderButtons = ({ item, index }) => {
    let { selectedButton, username, focusedUserView, isFilters } = this.state
    let { title, color, unlocked, selectedColor } = item
    return (
      <TouchableOpacity style={{ borderRadius: 10, backgroundColor: !unlocked ? '#212C2C26' : selectedButton !== '' && selectedButton === title ? selectedColor : color, height: height / 24, width: width / 3.5, alignItems: "center", justifyContent: "center", marginHorizontal: 8, borderColor: !unlocked ? '#212C2C26' : selectedButton !== '' && selectedButton === title ? color : selectedColor, borderWidth: !unlocked ? 0 : 1 }}
        onPress={() => {
          isBarCollapse = false;
          this.setState({ barChartArrow: require('../img/up_arrow.png') });
          this.flatListRef.scrollToIndex({ index: title === 'Development' ? 1 : title === 'Career' ? 2 : 0, animated: false });
          this.setState({
            selectedButton: title, focusedUserView: username + `'s ${title}`, isFilters: false, explorePost: title === 'Talents' && {},
            // barChartArrow: require('../img/up_arrow.png') 
          });
          if (title === 'Development' && unlocked === true) {
            this.getCategoriesTalents();
            this.setState({ careerFocused: '' })
          }
          if (title === 'Career' && unlocked === true) {
            this.getJobsList()
          }
          else {
            this.setState({ careerFocused: '' })
          }
        }}
      // disabled={!unlocked}
      >
        {!unlocked && <Image style={{ height: height / 37, width: width / 17, position: 'absolute', alignSelf: 'flex-end', top: -10, end: -10 }} source={require('../img/LockFill.png')} resizeMode="contain" />}
        <Text style={{ color: !unlocked ? '#fff' : unlocked && selectedButton !== '' && selectedButton === title ? '#fff' : selectedColor, fontSize: 14, fontFamily: 'SFUIDisplay-Regular', fontWeight: '500' }}>{title === 'Talents' ? 'Discover' : title === 'Development' ? 'Develop' : 'Realize'}</Text>
      </TouchableOpacity>
    )
  }

  // scroll Down
  _onScrollBottom(nativeEvent) {
    let { y } = nativeEvent?.contentOffset
    if (Object.keys(this.state.explorePost).length > 0) {
      this.setState({ scrollDownY: y })
    }
  }

  // // recording start
  // async startRecording() {
  //   RecordScreen.clean();
  //   const res = await RecordScreen.startRecording().catch((error) => console.error(error));
  //   console.log('res', res);
  //   // if (res === RecordingStartResponse.PermissionError) {
  //   //   // user denies access
  //   // }
  // }

  // // recording stop
  // async stopRecording() {
  //   const response = await RecordScreen.stopRecording().catch((error) =>
  //     console.warn(error)
  //   );
  //   if (response) {
  //     const url = response.result.outputURL;
  //     console.log('url', url);
  //   }
  // }

  _handleOnRecording = async () => {
    let { recording } = this.state
    // this.setState({ recording: !recording });
    if (recording) {
      this.setState({ recording: false });
      const res = await RecordScreen.stopRecording().catch((error) =>
        console.warn(error)
      );
      console.log('res', res);
      if (res?.status === 'success') {
        console.log('res in', res);
        let { outputURL } = res?.result
        this.setState({ setRecordingUri: outputURL });
        // let obj = { type: 'video', album:  }
        this.savePicture(outputURL)
      }
    } else {
      this.setState({ recording: true });
      this.hasAndroidAudioPermission()
      const res = await this.hasAndroidAudioPermission() ? await RecordScreen.startRecording({ mic: true }).catch((error) => {
        console.warn(error);
        this.setState({ recording: false });
      }) : await RecordScreen.startRecording({ mic: false }).catch((error) => {
        console.warn(error);
        this.setState({ recording: false });
      });
      console.log('res--==', res);
      if (res === RecordingResponse?.PermissionError) {
        Alert.alert(res);
        this.setState({ recording: false });
      }
    }
  };

  hasAndroidPermission = async () => {
    const permission = Platform.Version >= 33 ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES && PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE && PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;

    const hasPermission = await PermissionsAndroid.check(permission);
    if (hasPermission) {
      return true;
    }

    const status = await PermissionsAndroid.request(permission);
    return status === 'granted';
  }
  hasAndroidAudioPermission = async () => {
    const audioPermit = PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
    const hasPermission = await PermissionsAndroid.check(audioPermit);
    if (hasPermission) {
      return true;
    }
    const status = await PermissionsAndroid.request(audioPermit);
    return status === 'granted';
  }

  savePicture = async (outputURL) => {
    if (Platform.OS === "android" && !(await this.hasAndroidPermission())) {
      return;
    }
    CameraRoll.save(outputURL, { type: 'video', album: 'Natably' })
  };

  onPressBlankBar() {
    if (this.state.feedbackStatus === 'dismiss') {
      this.setState({ secondScreen: true })
    }
  }

  selfAssessmentItems = ({ index }) => {
    // session.state.scoreData.map(function (item, index) {
    if (session.state.scoreData.length > index) {
      let commonHeight = 30;
      let barlength = width * session.state.scoreData[index].score / 100 - 35;  //session.props.feedbackArr[index].value
      barlength = Math.abs(barlength);
      //console.log("barchart -- " + width + " - " + session.state.scoreData[index].score + " - " + barlength);
      let barColor = session.state.scoreData[index].color;
      return (
        <TouchableOpacity key={index} style={{ flex: 1, height: commonHeight, backgroundColor: 'transparent', marginTop: 8, marginBottom: 0, justifyContent: 'center' }} disabled={this.state.allHomeData?.development_status === "unlocked" ? true : false} onPress={() => this.onPressBlankBar()}>
          <View style={{ width: barlength, height: commonHeight, borderWidth: dashedWidth, borderColor: dashedColor, borderStyle: 'dashed', borderRadius: 1 }} />
          <View style={{ flex: 1, position: 'absolute', top: 7, width: width - 32, height: commonHeight, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ width: width - 32, height: commonHeight, color: "#212C2C", fontSize: 14, fontFamily: 'SFUIDisplay-SemiBold', opacity: 0.4, fontWeight: '600', paddingLeft: 14, alignSelf: 'center', }}>
              {session.state.scoreData[index].name}
            </Text>
          </View>
        </TouchableOpacity>
      );
    }
    // })
  };

  // past job applications data
  _renderPastJobApplicationItem = ({ item: rowData, index }) => {
    // var dateArr = rowData.date_sent.split('-');

    let { id } = rowData

    return (
      <TalentPointView
        type={'job_application'}
        rowData={rowData}
        onClear={() => { }}
        onDelete={() => this.deleteJobAppReq(id)}
        onResend={() => this.resendJobAppReq(id)}
        onView={(jobUrl) => jobUrl ? Linking?.openURL(jobUrl) : undefined}
      />

    )
  }

  render() {
    let { isFilters, filteredData, filteredIds, exploreData, username, focusedUserView, selectedButton, allHomeData, rating, explorePost, isPlay, exploreVideo, exploreFilteredData, scrollDownY, talents, orientation, feedbackData, feedbackStatus, barchartData, secondScreen, } = this.state

    // var secondScreen = false
    // var selfAssessmentItems = 

    let ytVideoId
    if (explorePost?.resource?.includes('https://youtu.be/')) {
      ytVideoId = explorePost?.resource?.replace('https://youtu.be/', '')
    }
    else if (explorePost?.resource?.includes('https://www.youtube.com/watch?v=')) {
      ytVideoId = explorePost?.resource?.replace('https://www.youtube.com/watch?v=', '')
    }
    else {
      ytVideoId = explorePost?.resource
    }
    return (
      // <SafeAreaView style={{ flex: 1 }}>
      // Explore Notification Video Players
      exploreVideo?.ytVideoId !== '' && exploreVideo?.isClosed === false ?
        <View style={{ flex: 1, backgroundColor: "#000" }} onStartShouldSetResponder={() => { }}>
          <YoutubePlayer
            initialPlayerParams={{}}
            // webViewStyle={{ backgroundColor: '#212C2C', borderRadius: 10, paddingBottom: 12, }}
            webViewStyle={{ top: '2%' }}
            webViewProps={{
              injectedJavaScript: `
              var element = document.getElementsByClassName('container')[0];
              element.style.position = 'unset';
              element.style.paddingBottom = 'unset';
              true;
            `, allowsFullscreenVideo: true, scrollEnabled: false
            }}
            height={height / 1.09}
            width={width}
            play={isPlay}
            onChangeState={(param) => { }}
            videoId={exploreVideo?.ytVideoId}
          />
          <TouchableOpacity style={{ position: 'absolute', top: '10%', start: '5%' }} onPress={() => this.setState({ exploreVideo: { isClosed: true, ytVideoId: '', vimeoVideoId: '', other: '', notificationId: '' } })}>
            <Ionicons name='ios-arrow-back-sharp' size={30} color="white" />
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', justifyContent: "space-between", paddingHorizontal: 12, alignItems: 'center', backgroundColor: '#000' }}>
            <Text style={{ color: "#fff", fontSize: 16, flexWrap: 'wrap', fontFamily: 'SFUIDisplay-Regular', fontWeight: '500', lineHeight: 22 }}>Not really</Text>
            <StarRating
              rating={rating}
              emptyStar={require('../img/star.png')}
              emptyStarColor={'rgba(255, 255, 255, 0.2)'}
              // fullStar={require('../img/star.png')}
              // halfStar={'ios-star-half'}
              selectedStar={(star) => this.giveArticleRate(star, exploreVideo?.notificationId)}
              animation='pulse'
              fullStarColor={'#E8D638'}
              starSize={35}
              starStyle={{ paddingHorizontal: 3, }} />
            <Text style={{ color: "#fff", fontSize: 16, flexWrap: 'wrap', fontFamily: 'SFUIDisplay-Regular', fontWeight: '500', lineHeight: 22 }}>Absolutely</Text>
          </View>
        </View>
        :
        exploreVideo?.vimeoVideoId !== '' && exploreVideo?.isClosed === false ?
          <View View style={{ minHeight: height, minWidth: '100%', }}>
            <Vimeo
              containerStyle={{ minHeight: height, minWidth: '100%', borderRadius: 10 }}
              params={'api=1&autoplay=1&controls=0'}
              videoId='226053498'
              handlers={videoCallbacks}
              allowsInlineMediaPlayback={true}
              allowsFullscreenVideo={true}
            />
            <TouchableOpacity style={{ position: 'absolute', top: '10%', start: '5%' }} onPress={() => this.setState({ exploreVideo: { isClosed: true, ytVideoId: '', vimeoVideoId: '', other: '', notificationId: '' } })}>
              <Ionicons name='ios-arrow-back-sharp' size={30} color="white" />
            </TouchableOpacity>
          </View> :
          // exploreVideo?.other !== '' && exploreVideo?.isClosed === false ?
          //   // <WebView source={exploreVideo?.other} /> 
          //   :
          <View style={{ flex: 1, backgroundColor: '#FFFFFF', flexDirection: 'column', marginTop: DeviceInfo.hasNotch() ? 25 : 0 }} onLayout={event => { const { y } = event.nativeEvent.layout; this.setState({ parentYPosition: y }) }}>
            {/*--------header--------*/}
            < SpinnerLoading visible={this.state.isLoading} />
            <View style={{ marginTop: this.state.topbarTopMargin, height: CONST.headerHeight, backgroundColor: CONST.headerBackColor, flexDirection: 'row', paddingLeft: 16, paddingRight: 16 }}>
              {/*left*/}
              <View style={{ flex: 0.3, flexDirection: 'row', justifyContent: "space-around", marginStart: -16 }}>
                <TouchableHighlight style={{ flex: 0.1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' }} underlayColor='transparent' onPress={() => { this.onMenuClick(); }}>
                  <Image style={{ width: CONST.headerLeftMenuSize, height: CONST.headerLeftMenuSize }} source={require('../img/menu.png')} resizeMode="contain" />
                </TouchableHighlight>
                <TouchableHighlight style={{ flex: 0.1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' }} underlayColor='transparent' onPress={() => this.onNotificationIconClick()}>
                  <>
                    <Image style={{ width: CONST.headerLeftMenuSize, height: CONST.headerLeftMenuSize }} source={require('../img/notification.png')} resizeMode="contain" />
                    {(exploreData.length > 0 ? exploreData?.filter(item => item.archived !== true).length : 0 + feedbackData?.length) > 0 ? <View style={{ backgroundColor: '#FC476D', borderRadius: 12, height: 12, width: 12, alignItems: 'center', justifyContent: 'center', position: "absolute", top: 15, start: 5 }}>
                      <Text style={{ color: '#FFFFFF', fontSize: 10 }}>{(exploreData.length > 0 ? exploreData?.filter(item => item.archived !== true).length : 0) + (feedbackData?.length > 0 ? feedbackData?.length : 0)}</Text>
                    </View> : null}
                  </>
                </TouchableHighlight>
              </View>
              {/*center*/}
              <View style={{ flex: 0.5, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent', marginLeft: this.state.userImage != null || this.userImage != null ? 20 : 0, }}>
                <Image style={{ width: 150, height: 56 }} source={CONST.headerlogo} resizeMode="contain" />
              </View>
              {/*right*/}
              <View style={{
                flex: 0.2,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'flex-end',
                // ...Platform.select({
                //   ios: {
                //     marginRight: this.state.groupImage != null || this.userImage != null ? 15 : 0
                //   },
                //   android: {
                //     marginRight: this.state.groupImage != null ? 0 : 0
                //   }
                // })
                //marginRight: this.state.userImage != null || this.userImage != null ? 15 : 0
              }}>
                {this.state.groupImage != null &&
                  <Image style={{ width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(33, 44, 44, 0.15)', marginRight: this.state.userImage != null ? -8 : 0, zIndex: 1 }} source={{ uri: this.state.groupImage }} />
                }
                {this.state.userImage != null &&
                  <FastImage
                    style={{ width: 32, height: 32, borderRadius: 32 / 2 }}
                    source={{
                      uri: this.state.userImage,
                      priority: FastImage.priority.high,
                    }}
                  />
                }
                {/* <TouchableOpacity style={{ marginEnd: 10 }} onPress={() => this._handleOnRecording()}>
                  <Text>{!this.state.recording ? 'start' : 'stop'}</Text>
                </TouchableOpacity> */}
              </View>
            </View>
            {this.state.barchartData.length > 0 && <View style={{}}>
              <FlatList
                contentContainerStyle={{ paddingHorizontal: 20, alignItems: 'center', marginBottom: 20, paddingTop: 10 }}
                numColumns={3}
                scrollEnabled={false}
                data={[{ title: 'Talents', color: '#fff', selectedColor: '#EC576B', unlocked: this.state.barchartData.length > 0 ? true : false },
                { title: 'Development', color: '#fff', selectedColor: '#4EC5C1', unlocked: allHomeData?.development_status === 'unlocked' ? true : false },
                { title: 'Career', color: '#fff', selectedColor: '#E8D638', unlocked: allHomeData?.career_status === 'unlocked' ? true : false }]}
                renderItem={this._renderButtons}
              />
              <FlatList
                ref={(ref) => { this.flatListRef = ref; }}
                horizontal
                contentContainerStyle={{}}
                data={[this.state.barchartTitle, `${this.state.username}'s Development`, `${this.state.username}'s Career`]}
                renderItem={({ item, index }) => {
                  return (
                    // focusedUserView === `${this.state.username}'s Career` && allHomeData?.career_status === 'locked' || focusedUserView === `${this.state.username}'s Development` && allHomeData?.development_status === 'locked' ? null : 
                    <View style={{ width: width }}>
                      <View style={{ alignItems: 'center', backgroundColor: '#FFFFFF', marginTop: 4, marginBottom: 4, flexDirection: 'row', justifyContent: 'center', paddingLeft: 20, paddingRight: 20, }}>
                        <View style={{ flexDirection: 'row', flex: 1, justifyContent: 'center' }}>
                          {focusedUserView === `${this.state.username}'s Career` && allHomeData?.career_status === 'locked' || focusedUserView === `${this.state.username}'s Development` && allHomeData?.development_status === 'locked' ? null :
                            <View style={{ marginTop: 6 }}>
                              <IcDiamond color="#4EC5C1" size={25} />
                            </View>
                          }
                          <Text style={style.userName}>{focusedUserView === `${this.state.username}'s Career` && allHomeData?.career_status === 'locked' || focusedUserView === `${this.state.username}'s Development` && allHomeData?.development_status === 'locked' ? null : this.state.focusedUserView}</Text>
                        </View>
                        {/* {
                          focusedUserView === `${this.state.username}'s Career` && allHomeData?.career_status === 'unlocked' && <TouchableHighlight style={{ flex: 0.1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' }} underlayColor='transparent' onPress={() => { this.onRealizeMenuClick(); }}>
                            <Image style={{ width: CONST.headerLeftMenuSize, height: CONST.headerLeftMenuSize }} source={require('../img/Hamburger.png')} resizeMode="contain" />
                          </TouchableHighlight>
                        } */}
                      </View>
                    </View>
                  )
                }}
                pagingEnabled
                scrollEnabled={allHomeData?.development_status === 'unlocked' && allHomeData?.career_status === 'unlocked' ? true : false}
                showsHorizontalScrollIndicator={false}
                onViewableItemsChanged={this.onUserViewRef}
                viewabilityConfig={this.userViewConfigRef}
                extraData={this.state}
              />
              {this.state.focusedUserView === `${this.state.username}'s Development` && allHomeData?.development_status === 'unlocked' && <View style={{ justifyContent: "space-between", paddingHorizontal: 12, flexDirection: 'row', paddingTop: 5 }}>
                <Text style={{ color: "#212C2C", fontSize: 20, flexWrap: 'wrap', fontFamily: 'SFUIDisplay-Regular', fontWeight: '700', lineHeight: 28, }}>Explore</Text>
                {focusedUserView === `${username}'s Development` ?
                  <View style={{ flexDirection: "row", alignItems: 'center' }}>
                    {filteredIds.length > 0 && <TouchableOpacity style={{ marginEnd: 6 }} onPress={() => this.clearFilters()}>
                      <Text style={{ color: '#DB6575CC', fontSize: 12, flexWrap: 'wrap', fontWeight: '600', textTransform: "uppercase" }}>Clear</Text>
                    </TouchableOpacity>}
                    <TouchableOpacity onPress={() => this.onPressFilterIcon()}>
                      <Image style={{ height: 30, width: 30, tintColor: filteredIds.length > 0 ? '#DB6575CC' : '#212C2C' }} source={require('../img/Filter.png')} resizeMode={'contain'} />
                    </TouchableOpacity>
                  </View> : null}
              </View>}
            </View>}
            <View style={{ backgroundColor: '#FFFFFF', flex: this.state.focusedUserView === `${this.state.username}'s Development` && allHomeData?.development_status === 'locked' || focusedUserView === `${this.state.username}'s Career` && allHomeData?.career_status === 'locked' ? 0 : 0 }}>
              <ScrollView
                style={{ flexDirection: 'column', backgroundColor: '#FFFFFF', marginBottom: focusedUserView === `${this.state.username}'s Talents` ? 140 : 0 }}
                // contentContainerStyle={{ paddingBottom: focusedUserView === `${this.state.username}'s Development` || focusedUserView === `${this.state.username}'s Career` ? 100 : 0 }} 
                scrollEventThrottle={10} onScroll={({ nativeEvent }) => this._onScrollBottom(nativeEvent)}>
                {/* User Talents and/or Video and web content */}

                {this.state.focusedUserView === `${this.state.username}'s Development` && allHomeData?.development_status === 'unlocked' ?
                  <>
                    {isFilters && focusedUserView === `${username}'s Development` && <View style={{ paddingHorizontal: 20, }}>
                      <ScrollView
                        scrollEnabled={false}
                        contentContainerStyle={{ flexWrap: 'wrap', flexDirection: 'row', paddingTop: 6, }}>

                        {talents.length > 0 && talents?.map((item, index) => {
                          let { color, name, id } = item
                          let title = name
                          return (
                            <TouchableHighlight style={{ backgroundColor: filteredIds.includes(id) ? color : 'transparent', borderRadius: 20, paddingVertical: 10, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 15, marginVertical: 6, borderColor: color, borderWidth: 0.5, marginEnd: 3 }} onPress={() => this.onPressFilters(item, index)}>
                              <Text style={{ color: !filteredIds.includes(id) ? color : "#fff", fontSize: 12, flexWrap: 'wrap', fontWeight: '600' }}>{title}</Text>
                            </TouchableHighlight>
                          )
                        })
                        }
                      </ScrollView>
                    </View>}
                    {Object.keys(explorePost).length > 0 ?
                      <View style={{ flex: 1, paddingHorizontal: 10 }}>
                        {/* ----- Video player ----- */}
                        <View style={{ backgroundColor: '#212C2C', borderRadius: 10, paddingBottom: 12, }}>
                          {
                            ytVideoId ?
                              <View style={{ borderRadius: 10, height: width / 1.875, overflow: 'hidden' }} onStartShouldSetResponder={() => { }}>
                                <YoutubePlayer
                                  initialPlayerParams={{}}
                                  webViewStyle={{ backgroundColor: '#212C2C', borderRadius: 10, paddingBottom: 12, }}
                                  height={width / 1.875}
                                  play={isPlay}
                                  onFullScreenChange={(param) => console.log('param', param)}
                                  videoId={ytVideoId}
                                />
                              </View> :
                              <View View style={{ minHeight: width / 1.875, minWidth: '100%', }}>
                                <Vimeo
                                  containerStyle={{ minHeight: width / 1.875, minWidth: '100%', borderRadius: 10 }}
                                  params={'api=1&autoplay=0&controls=0'}
                                  videoId='226053498'
                                  handlers={videoCallbacks}
                                  allowsInlineMediaPlayback={true}
                                />
                              </View>
                          }
                          {/* Video rating */}
                          <View style={{ flexDirection: 'row', justifyContent: "space-between", paddingHorizontal: 12, alignItems: 'center' }}>
                            <Text style={{ color: "#fff", fontSize: 16, flexWrap: 'wrap', fontFamily: 'SFUIDisplay-Regular', fontWeight: '500', lineHeight: 22 }}>Not really</Text>
                            <StarRating
                              rating={rating}
                              emptyStar={require('../img/star.png')}
                              emptyStarColor={'rgba(255, 255, 255, 0.2)'}
                              // fullStar={require('../img/star.png')}
                              // halfStar={'ios-star-half'}
                              selectedStar={(star) => this.giveArticleRate(star, explorePost?.id)}
                              animation='pulse'
                              fullStarColor={'#E8D638'}
                              starSize={35}
                              starStyle={{ paddingHorizontal: 3, }} />
                            <Text style={{ color: "#fff", fontSize: 16, flexWrap: 'wrap', fontFamily: 'SFUIDisplay-Regular', fontWeight: '500', lineHeight: 22 }}>Absolutely</Text>
                          </View>
                        </View>
                        {/* Tags related video */}
                        <View style={{ flexDirection: "row", justifyContent: 'space-between', alignItems: 'center', marginTop: 20, }}>
                          <FlatList horizontal data={explorePost?.categories}
                            scrollEnabled={false}
                            contentContainerStyle={{ height: 30 }}
                            renderItem={({ item, index }) => {
                              let { color, name } = item
                              return (
                                <TouchableHighlight style={{ backgroundColor: color, borderRadius: 10, height: 25, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8, marginStart: index !== 0 ? 3 : 0, marginEnd: index !== videoTags.length - 1 ? 3 : 0 }}>
                                  <Text style={{ color: "#fff", fontSize: 12, flexWrap: 'wrap', fontWeight: '500' }}>{name}</Text>
                                </TouchableHighlight>
                              )
                            }}
                          />
                        </View>
                        {/* item description */}
                        <View style={{ paddingVertical: 10 }}>
                          <Text style={{ color: "#000", fontSize: 18, flexWrap: 'wrap', fontFamily: 'SFUIDisplay-Regular', fontWeight: '600', lineHeight: 22 }}>{explorePost?.topic}</Text>
                          <Text style={{ color: "#212C2C", fontSize: 18, flexWrap: 'wrap', fontFamily: 'SFUIDisplay-Regular', fontWeight: '400', lineHeight: 26 }}>{explorePost?.description
                          }</Text>
                        </View>
                      </View> : null}
                    {/* Videos */}
                    {allHomeData?.development_status === 'unlocked' && <View>
                      {exploreFilteredData.length > 0 &&
                        // this.state.exploreData.some(item => item.archived === true) &&
                        <View style={[style.sectionStyle, { paddingBottom: '10%' }]}>
                          <FlatList
                            contentContainerStyle={{ paddingBottom: 150 }}
                            style={style.sectionList}
                            data={exploreFilteredData}
                            extraData={this.state}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={this._renderExploreDevelopmentItem}
                          />
                        </View>
                      }
                    </View>}
                  </>
                  :
                  this.state.focusedUserView === `${this.state.username}'s Talents` ?
                    <>
                      {/*--------category barchart--------*/}
                      {

                        // feedbackData?.length > 0 && feedbackStatus === 'dismiss' ?
                        //   <View style={{ flex: 1, }}>
                        //     <View style={{ backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                        //       <Image style={{ width: 350, height: 500 }} source={require('../img/points.jpg')} resizeMode="contain" />
                        //     </View>
                        //   </View>
                        //   :
                        this.state.barchartData.length > 0 && secondScreen ? <View style={{ flex: 1, }}>
                          <TouchableOpacity style={{ backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center' }} onPress={() => this.setState({ secondScreen: !this.state.secondScreen })}>
                            <Image style={{ width: 350, height: 500 }} source={require('../img/points.jpg')} resizeMode="contain" />
                          </TouchableOpacity>
                        </View> :
                          this.state.barchartData.length > 0 && !secondScreen ?
                            <View style={{ paddingBottom: 180 }}>
                              <ExpanableList
                                ref={instance => this.ExpandableList = instance}
                                style={{ flex: this.state.barchartListFlex, backgroundColor: '#fff', paddingLeft: 16, paddingRight: 16 }}
                                dataSource={this.state.barchartData}
                                headerKey="header"
                                memberKey="content"
                                renderRow={this._renderRow}
                                renderSectionHeaderX={this._renderSection}
                                headerOnPress={(index) => this.headerOnPress(index)}
                                extraData={this.state}
                              />
                              <View style={{ paddingLeft: 16, paddingRight: 16, backgroundColor: '#FFFFFF' }}>
                                <FlatList
                                  contentContainerStyle={{}}
                                  // style={style.sectionList}
                                  data={session.state.scoreData}
                                  extraData={this.state}
                                  // keyExtractor={(item, index) => index.toString()}
                                  renderItem={this.selfAssessmentItems}
                                />
                              </View>
                              {this._renderSelfNSkils()}
                            </View>
                            :
                            <View style={{ flex: 1, }}>
                              <View style={{ backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                                <Image style={{ width: 350, height: 500 }} source={require('../img/nodata.png')} resizeMode="contain" />
                              </View>
                              {this._renderSelfNSkils()}
                            </View>
                      }
                    </>
                    : null
                }
              </ScrollView>
            </View>
            {
              this.state.focusedUserView === `${this.state.username}'s Development` && allHomeData?.development_status === 'unlocked' && Object.keys(explorePost).length > 0 && scrollDownY >= 150 ?
                <Animated.View style={{ flex: 1, position: 'absolute', transform: [{ translateY: this.state.parentYPosition }], top: 0 }}>
                  <View style={{ backgroundColor: '#212C2C', borderRadius: 10, paddingBottom: 12 }}>
                    {
                      ytVideoId ?
                        <View style={{ borderRadius: 10, height: width / 1.875, overflow: 'hidden' }} onStartShouldSetResponder={() => { }}>
                          <YoutubePlayer
                            initialPlayerParams={{}}
                            webViewStyle={{ backgroundColor: '#212C2C', borderRadius: 10, paddingBottom: 12, }}
                            height={width / 1.875}
                            width={width}
                            play={isPlay}
                            onFullScreenChange={(param) => console.log('param', param)}
                            videoId={ytVideoId}
                          />
                        </View> :
                        <View style={{ minHeight: width / 1.875, minWidth: '100%', }}>
                          <Vimeo
                            containerStyle={{ minHeight: width / 1.875, minWidth: '100%', borderRadius: 10 }}
                            params={'api=1&autoplay=0&controls=0'}
                            videoId='226053498'
                            handlers={videoCallbacks}
                            allowsInlineMediaPlayback={true}
                          />
                        </View>
                    }
                    <View style={{ flexDirection: 'row', justifyContent: "space-between", paddingHorizontal: 12, alignItems: 'center' }}>
                      <Text style={{ color: "#fff", fontSize: 16, flexWrap: 'wrap', fontFamily: 'SFUIDisplay-Regular', fontWeight: '500', lineHeight: 22 }}>Not really</Text>
                      <StarRating
                        rating={rating}
                        emptyStar={require('../img/star.png')}
                        emptyStarColor={'rgba(255, 255, 255, 0.2)'}
                        // fullStar={require('../img/star.png')}
                        // halfStar={'ios-star-half'}
                        selectedStar={(star) => this.giveArticleRate(star, explorePost?.id)}
                        animation='pulse'
                        fullStarColor={'#E8D638'}
                        starSize={35}
                        starStyle={{ paddingHorizontal: 3, }} />
                      <Text style={{ color: "#fff", fontSize: 16, flexWrap: 'wrap', fontFamily: 'SFUIDisplay-Regular', fontWeight: '500', lineHeight: 22 }}>Absolutely</Text>
                    </View>
                  </View>
                </Animated.View> : null
            }
            {/*--------BOTTOM LIST PART---------*/}
            {
              focusedUserView === `${username}'s Talents` ?
                <View style={{
                  flex: 1,
                  shadowColor: '#6E6E85',
                  shadowOffset: {
                    width: 0,
                    height: 6,
                  },
                  shadowOpacity: 0.37,
                  shadowRadius: 7.49,
                  elevation: 12,
                  borderTopLeftRadius: 26,
                  borderTopRightRadius: 26,
                  position: 'absolute',
                  top: isBarCollapse ? height * 0.17 : height * 0.80,
                  bottom: 0, //DeviceInfo.hasNotch() ? 50 : 40,
                  right: 0,
                  left: 0,
                  backgroundColor: '#FFFFFF',
                }}>
                  <TouchableHighlight
                    style={{
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'transparent',
                      paddingTop: 15,
                      paddingBottom: 15
                    }}
                    underlayColor='transparent'
                    onPress={() => { this.onBarChartArrowClick(); }}>

                    <Image style={{ width: 30, height: 30 }} source={this.state.barChartArrow} resizeMode="contain" />

                  </TouchableHighlight>
                  {focusedUserView === `${this.state.username}'s Talents` &&
                    <View style={{ flex: 1 }}>
                      <ScrollView
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                          <RefreshControl
                            refreshing={this.state.refreshing}
                            onRefresh={() => {
                              this.getHomeCategoryData()
                            }}
                          />
                        }
                        // this.state?.jobNotificationsData.length > 0 ? '#F6F6F6' :
                        style={{ flex: 1, backgroundColor: '#FFFFFF', paddingTop: 10 }}>
                        <View style={{ flex: 1, backgroundColor: '#FFFFFF', marginBottom: 90 }}>
                          {/*-------- JOB notifications-------- */}
                          {this.state.jobNotificationsData.length > 0 &&
                            <>
                              <View style={{ backgroundColor: '#FFFFFF', paddingStart: 21, paddingBlock: 20 }}>
                                <Text style={style.sectionTitle}>You’ve got a job response</Text>
                              </View>
                              <FlatList
                                style={{ paddingStart: 10, backgroundColor: '#F6F6F6', paddingTop: 20 }}
                                data={this.state.jobNotificationsData}
                                extraData={this.state}
                                keyExtractor={(item, index) => index.toString()}
                                renderItem={this._renderJobNotificationsItem}
                              />
                            </>
                          }
                          <View style={{ paddingLeft: 16 }}>
                            {/*----- notification Data ------*/}
                            {this.state.notificationsData.length > 0 &&
                              <View style={style.sectionStyle}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }} >
                                  <Text style={style.sectionTitle}>Notifications</Text>
                                  <TouchableHighlight style={style.btnAcceptAll} underlayColor='transparent' onPress={() => { this.onAcceptAllFeedback(); }}>
                                    <Text style={style.acceptAll}>Accept All</Text>
                                  </TouchableHighlight>
                                </View>
                                <FlatList
                                  style={style.sectionList}
                                  data={this.state.notificationsData}
                                  extraData={this.state}
                                  renderItem={this._renderNotificationsItem}
                                  keyExtractor={(item, index) => index.toString()}
                                />
                              </View>
                            }
                            {/*----- feedback Data ------*/}
                            {this.state.feedbackData.length > 0 &&
                              <View style={style.sectionStyle}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }} >
                                  <Text style={style.sectionTitle}>Discover</Text>
                                  <TouchableHighlight style={style.btnAcceptAll} underlayColor='transparent' onPress={() => { this.onAcceptAllFeedback(); }}>
                                    <Text style={style.acceptAll}>Accept All</Text>
                                  </TouchableHighlight>
                                </View>
                                <FlatList
                                  style={[style.sectionList, { paddingRight: 0, paddingLeft: 0 }]}
                                  data={this.state.feedbackData}
                                  extraData={this.state}
                                  renderItem={this._renderfeedbackItem}
                                  keyExtractor={(item, index) => index.toString()}
                                />
                              </View>
                            }
                            {/*--------Explore Data-------- */}
                            {allHomeData.development_status === 'unlocked' && this.state.exploreData.length > 0 && this.state.exploreData.some(item => item.archived === false) &&
                              <>
                                <View style={style.sectionStyle}>
                                  <Text style={style.sectionTitle}>Develop</Text>
                                  <FlatList
                                    style={style.sectionList}
                                    data={this.state.exploreData}
                                    extraData={this.state}
                                    keyExtractor={(item, index) => index.toString()}
                                    renderItem={this._renderExploreItem}
                                  />
                                </View>
                              </>
                            }
                            {/*--------past request-------- */}
                            {this.state.postRequestData.length > 0 &&
                              <View style={style.sectionStyle}>
                                <Text style={style.sectionTitle}>Point requests</Text>
                                <FlatList
                                  style={style.sectionList}
                                  data={this.state.postRequestData}
                                  extraData={this.state}
                                  keyExtractor={(item, index) => index.toString()}
                                  renderItem={this._renderPastRequestItem}
                                />
                              </View>
                            }
                            {/*--------profile share request-------- */}
                            {this.state.profileShateList.length > 0 &&
                              <View style={style.sectionStyle}>
                                <Text style={style.sectionTitle}>Profile shares</Text>
                                <FlatList
                                  style={style.sectionList}
                                  data={this.state.profileShateList}
                                  extraData={this.state}
                                  keyExtractor={(item, index) => index.toString()}
                                  renderItem={this._renderProfileShareItem}
                                />
                              </View>
                            }
                            {/* Past Job Applications */}
                            {
                              this.state.pastJobApplications.length > 0 &&
                              <>
                                <View style={style.sectionStyle}>

                                  <Text style={style.subTitleText}>Past Applications</Text>
                                  <FlatList
                                    style={{ marginTop: 8 }}
                                    data={this.state.pastJobApplications}
                                    extraData={this.state}
                                    keyExtractor={(item, index) => index.toString()}
                                    renderItem={this._renderPastJobApplicationItem}
                                  />
                                </View>
                              </>
                            }
                          </View>
                        </View>
                      </ScrollView>
                    </View>}
                  {/*--------give / get feedback---------*/}
                  <View style={style.bottomContainer}>

                    <TouchableHighlight style={[style.btnGetPoint, { flex: 1, borderRadius: 10 }]} underlayColor='transparent' onPress={() => { this.onGetFeedbackClick(); }}>
                      <Text style={style.btnGetPointText}>Get Points</Text>
                    </TouchableHighlight>

                    {/* <TouchableHighlight style={style.btnGivePoint} underlayColor='transparent' onPress={() => { this.onGiveFeedbackClick(''); }}>
                      <Text style={style.btnGivePointText}>Give Points</Text>
                    </TouchableHighlight> */}

                    {this.state.isShareable &&
                      <TouchableHighlight style={{ flex: 0.11, height: 44, alignItems: 'center', justifyContent: 'center', marginLeft: 8 }} underlayColor='transparent' onPress={() => {
                        Navigation.push('appStack', {
                          component: {
                            id: CONST.ProfileShareScreen,
                            name: CONST.ProfileShareScreen,
                          }
                        });
                      }}>
                        <MaterialCommunityIcons name={Platform.OS == 'ios' ? "share" : 'share-variant'} size={25} color="#4EC5C1" />
                      </TouchableHighlight>
                    }
                  </View>

                  {/*-----------ShareSheet for link---------*/}
                  <ShareSheet visible={this.state.isShareSheetVisible} onCancel={() => this.onCancelShareSheet()}>

                    <View style={{ width: '100%', alignItems: 'center', marginTop: 10 }}>
                      <Text style={{ color: "#000000", fontSize: 20, fontFamily: 'GoogleSans-Bold' }}>Share Link</Text>
                    </View>

                    <View style={{ width: '100%', height: 20 }} />

                    {isWhatsappAvailable &&
                      <Button buttonStyle={{ alignItems: 'center' }} iconSrc={{ uri: CONST.WHATSAPP_ICON }}
                        onPress={() => {
                          this.onShareClick('whatsapp');
                          // if (Platform.OS === 'android') {
                          //   setTimeout(() => {
                          //     Share.shareSingle(Object.assign(shareOptions, {
                          //       "social": "whatsapp"
                          //     }));
                          //   }, 300);
                          // }
                          // else {
                          //   let whatsappURL = 'whatsapp://send?text=' + shareOptions.url;
                          //   Linking.openURL(whatsappURL);
                          // }

                        }}>Whatsapp</Button>
                    }
                    {isMessagesAvailable &&
                      <Button buttonStyle={{ alignItems: 'center' }} iconSrc={{ uri: Platform.OS === 'android' ? CONST.MESSAGES_ICON : CONST.IMESSAGE_ICON }}
                        onPress={() => {
                          this.onShareClick('messages');
                          // this.onCancelShareSheet();
                          // setTimeout(() => {
                          //   const operator = Platform.select({ ios: '&', android: '?' });
                          //   Linking.openURL(`sms:${operator}body=${shareOptions.url}`);

                          // }, 300);
                        }}>Messages</Button>
                    }
                    {/* {isMailAvailable && */}
                    <Button buttonStyle={{ alignItems: 'center' }} iconSrc={{ uri: CONST.EMAIL_ICON }}
                      onPress={() => {

                        this.onShareClick('gmail')

                        // this.onCancelShareSheet();
                        // if (Platform.OS === 'android') {
                        //   setTimeout(() => {
                        //     Share.shareSingle(Object.assign(shareOptions, {
                        //       "social": Share.Social.EMAIL
                        //     }));
                        //   }, 300);
                        // }
                        // else {
                        //   let gmailURL = 'mailto:?subject=&body=' + shareOptions.url;
                        //   Linking.openURL(gmailURL);
                        //}

                      }}>Gmail</Button>
                    {/* } */}

                    <Button buttonStyle={{ alignItems: 'center' }} iconSrc={{ uri: CONST.COPY_ICON }}
                      onPress={() => {
                        this.onShareClick('copylink');
                      }}>Copy Link</Button>

                    <View style={{ width: '100%', height: 20 }} />
                  </ShareSheet>

                </View>
                : null
            }

            {/* {focusedUserView === `${this.state.username}'s Development` && <View style={style.bottomContainer}>

              <TouchableHighlight style={style.btnGetPoint} underlayColor='transparent' onPress={() => { this.onGetFeedbackClick(); }}>
                <Text style={style.btnGetPointText}>Get Points</Text>
              </TouchableHighlight>

              <TouchableHighlight style={style.btnGivePoint} underlayColor='transparent' onPress={() => { this.onGiveFeedbackClick(''); }}>
                <Text style={style.btnGivePointText}>Give Points</Text>
              </TouchableHighlight>

              {this.state.isShareable &&
                <TouchableHighlight style={{ flex: 0.11, height: 44, alignItems: 'center', justifyContent: 'center', marginLeft: 8 }} underlayColor='transparent' onPress={() => {
                  Navigation.push('appStack', {
                    component: {
                      id: CONST.ProfileShareScreen,
                      name: CONST.ProfileShareScreen,
                    }
                  });
                }}>
                  <MaterialCommunityIcons name={Platform.OS == 'ios' ? "share" : 'share-variant'} size={25} color="#4EC5C1" />
                </TouchableHighlight>
              }
            </View>} */}

            {/*-----------modal---------*/}
            <Modal animationIn={'fadeInDown'} animationOut={'fadeOutDown'} useNativeDriver={true}
              style={{ flex: 1, justifyContent: "center", alignItems: "center" }} isVisible={this.state.isModalVisible}>
              {this._renderModalContent()}
            </Modal>

            {/*-----------feedback modal---------*/}
            <Modal animationIn={'fadeInDown'} animationOut={'fadeOutDown'} useNativeDriver={true}
              style={{ flex: 1, justifyContent: "center", alignItems: "center" }} isVisible={this.state.isFeedbackModalVisible}>
              {this._renderFeedbackModalContent()}
            </Modal>

            <Toast config={toasConfig} />

            {/*-----------explanationIcon modal---------*/}
            <BlurModel
              onTouchOutside={() => this.setState({ explanationIconModal: false })}
              visible={this.state.explanationIconModal}>

              <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: 'transparent' }}>
                <TouchableWithoutFeedback onPress={() => this.setState({ explanationIconModal: false })} style={{ flex: 1, width: '100%' }}>
                  <View style={{ flex: 1, width: '100%' }} />
                </TouchableWithoutFeedback>
                <View style={{ backgroundColor: '#FFFFFF', padding: 25, borderRadius: 8, width: '80%', alignSelf: 'center', justifyContent: 'center' }}>
                  <View style={{ flexDirection: 'row' }}>
                    <Text style={{ flex: 1, fontFamily: 'SFUIDisplay-SemiBold', fontWeight: '600', textAlign: 'center', fontSize: 18, color: 'rgba(33, 44, 44, 0.85)', textTransform: 'uppercase', lineHeight: 21 }}></Text>
                    <TouchableOpacity onPress={() => this.setState({ explanationIconModal: false })}>
                      <Ionicons name="close" size={17} color="rgba(33, 44, 44, 0.7)" />
                    </TouchableOpacity>
                  </View>

                  <View style={style.explanationIconItem}>
                    <RelationshipIcon isInfo relationship="supervisor" hasReference={false} />
                    <Text style={style.explanationIconText}>Supervisor/Coach/Client</Text>
                  </View>

                  <View style={style.explanationIconItem}>
                    <RelationshipIcon isInfo relationship="peer_colleague" hasReference={false} />
                    <Text style={style.explanationIconText}>Peers/Colleagues</Text>
                  </View>

                  <View style={style.explanationIconItem}>
                    <RelationshipIcon isInfo relationship="family_friend" hasReference={false} />
                    <Text style={style.explanationIconText}>Family/Friends</Text>
                  </View>

                  <View style={style.explanationIconItem}>
                    <RelationshipIcon isInfo relationship="" hasReference={false} />
                    <Text style={style.explanationIconText}>Relationship not provided</Text>
                  </View>

                  <View style={style.explanationIconItem}>
                    <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: '#4EC5C1', alignItems: 'center', justifyContent: 'center' }}>
                      <Feather name="check" size={12} color="#FFFFFF" />
                    </View>
                    <Text style={style.explanationIconText}>Willing to provide a reference</Text>
                  </View>

                </View>
                <TouchableWithoutFeedback onPress={() => this.setState({ explanationIconModal: false })} style={{ flex: 1, width: '100%' }}>
                  <View style={{ flex: 1, width: '100%' }} />
                </TouchableWithoutFeedback>
              </View>
            </BlurModel>
            {
              // --------give / get feedback---------
              focusedUserView === `${this.state.username}'s Development` && allHomeData?.development_status === 'locked' && allHomeData?.career_status === 'locked' &&
              <>
                <View style={{ flex: 1, backgroundColor: '#FFFFFF', justifyContent: "center" }}>
                  <Text style={style.realizeText}><Text style={{ color: '#4EC5C1' }}>“Get"</Text> and <Text style={{ color: '#4EC5C1' }}>“Accept"</Text> points from at least 5 people to unlock Development and get access to career videos.</Text>
                  <Image style={{ height: height / 4, width: width, marginTop: '4%' }} source={require('../img/downArrow.png')} resizeMode={'contain'} />
                </View>
                <View style={style.bottomContainerDevelop}>
                  <TouchableHighlight style={style.btnGetPoint} underlayColor='transparent' onPress={() => { this.onGetFeedbackClick(); }}>
                    <Text style={style.btnGetPointText}>Get Points</Text>
                  </TouchableHighlight>

                  <TouchableHighlight style={style.btnGivePoint} underlayColor='transparent' onPress={() => { this.onGiveFeedbackClick(''); }}>
                    <Text style={style.btnGivePointText}>Give Points</Text>
                  </TouchableHighlight>

                  {this.state.isShareable &&
                    <TouchableHighlight style={{ flex: 0.11, height: 44, alignItems: 'center', justifyContent: 'center', marginLeft: 8 }} underlayColor='transparent' onPress={() => {
                      Navigation.push('appStack', {
                        component: {
                          id: CONST.ProfileShareScreen,
                          name: CONST.ProfileShareScreen,
                        }
                      });
                    }}>
                      <MaterialCommunityIcons name={Platform.OS == 'ios' ? "share" : 'share-variant'} size={25} color="#4EC5C1" />
                    </TouchableHighlight>
                  }
                </View>
              </>
            }
            {
              focusedUserView === `${this.state.username}'s Career` && allHomeData?.development_status === 'locked' && allHomeData?.career_status === 'locked' &&
              <>
                <View style={{ flex: 1, backgroundColor: '#FFFFFF', justifyContent: "flex-start", top: allHomeData?.development_status === 'locked' && allHomeData?.career_status === 'locked' ? '16%' : 0 }}>
                  {/* <Text style={style.realizeText}>Request and <Text style={{ color: '#4EC5C1' }}>“Get Points”</Text>from at least 5 people to unlock Development and start receiving  content.</Text>
                  <Image style={{ height: height / 4, width: width, marginTop: '4%' }} source={require('../img/downArrow.png')} resizeMode={'contain'} /> */}
                  <Text style={style.realizeText}><Text style={{ color: '#4EC5C1' }}>“Get"</Text> and <Text style={{ color: '#4EC5C1' }}>“Accept"</Text> points from at least 5 people to unlock Development and get access to career videos.</Text>
                  <Image style={{ height: height / 4, width: width, marginTop: '4%' }} source={require('../img/downArrow.png')} resizeMode={'contain'} />
                </View>
                <View style={style.bottomContainer}>
                  <TouchableHighlight style={style.btnGetPoint} underlayColor='transparent' onPress={() => { this.onGetFeedbackClick(); }}>
                    <Text style={style.btnGetPointText}>Get Points</Text>
                  </TouchableHighlight>

                  <TouchableHighlight style={style.btnGivePoint} underlayColor='transparent' onPress={() => { this.onGiveFeedbackClick(''); }}>
                    <Text style={style.btnGivePointText}>Give Points</Text>
                  </TouchableHighlight>

                  {this.state.isShareable &&
                    <TouchableHighlight style={{ flex: 0.11, height: 44, alignItems: 'center', justifyContent: 'center', marginLeft: 8 }} underlayColor='transparent' onPress={() => {
                      Navigation.push('appStack', {
                        component: {
                          id: CONST.ProfileShareScreen,
                          name: CONST.ProfileShareScreen,
                        }
                      });
                    }}>
                      <MaterialCommunityIcons name={Platform.OS == 'ios' ? "share" : 'share-variant'} size={25} color="#4EC5C1" />
                    </TouchableHighlight>
                  }

                </View>
              </>
            }
            {
              focusedUserView === `${this.state.username}'s Career` && allHomeData?.career_status === 'locked' && allHomeData?.development_status === 'unlocked' ?
                <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
                  <Image style={{ height: height / 5, width: width, start: '4%' }} source={require('../img/topArrow.png')} resizeMode={'contain'} />
                  <Text style={style.realizeText}>View and Rate<Text style={{ color: '#4EC5C1' }}> Develop </Text> items to unlock <Text style={{ color: '#E8D638' }}>Realize</Text> and get matched to jobs that match your talents and skills.</Text>
                </View> :
                focusedUserView === `${this.state.username}'s Career` &&
                <View style={{ flex: 1, paddingHorizontal: 20 }}>
                  <FlatList data={this.state.jobsList} renderItem={({ item, index }) => {
                    const { id } = item
                    return (
                      <CareerItem item={item} onPress={() => this.onReqJobPage(id)} />
                    )
                  }} />
                  {this.state?.isJobPage && Object.keys(this.state.jobDetails).length !== 0 && <JobPage data={this.state.jobDetails} visible={this.state.isJobPage} onBackdropPress={() => this.setState({ isJobPage: false })} onApplyPress={(selectedTestimonial) => {
                    this.setState({ isJobPage: false, careerFocused: focusedUserView })
                    Navigation.push(this.props.componentId, {
                      component: {
                        name: CONST.ApplyJobScreen,
                        options: {
                          topBar: {
                            drawBehind: true,
                            visible: false,
                            animate: false
                          }
                        },
                        passProps: {
                          jobDetails: this.state.jobDetails,
                          selectedTestimonials: selectedTestimonial
                        }
                      }
                    });
                  }} />}
                </View>
            }
            {
              this.state.recording ?
                <FaceCamera orientation={orientation} /> : null
            }
          </View >
      // {/* </SafeAreaView> */}

    );
  }
}

const style = StyleSheet.create({
  sectionStyle: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    marginTop: 8
  },
  subTitleText: {
    color: "#212C2C",
    fontSize: 20,
    lineHeight: 22,
    letterSpacing: 0.5,
    fontWeight: '700',
    fontFamily: 'SFUIDisplay-Bold'
  },
  sectionList: {
    flex: 0.8,
    paddingLeft: 16,
    paddingRight: 16,
    marginTop: 8,
    paddingBottom: 20
  },
  middleShadowStyle: {
    shadowOffset: {
      width: 0,
      height: -10
    },
    shadowOpacity: 0.15,
    shadowRadius: 20,
  },
  middleContainer: {
    flex: 0.2,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    shadowColor: 'rgba(110, 110, 133, 1)',
  },
  telentRowcontainer: {
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
    borderWidth: 1,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
  },
  telentrowTitle: {
    fontFamily: 'SFUIDisplay-Bold',
    fontWeight: '700',
    fontSize: 16
  },
  telentRowContent: {
    color: "rgba(0, 0, 0, 0.7)",
    fontSize: 14,
    fontFamily: 'SFUIDisplay-Regular',
    marginTop: 4,
    lineHeight: 22
  },
  telentRowPoint: {
    fontFamily: 'SFUIDisplay-Bold',
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: 'rgba(27, 50, 48, 0.5)',
    marginLeft: 8
  },
  chatInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 8
  },
  chatInfoText: {
    flex: 1,
    color: "rgba(33, 37, 41, 0.7)",
    fontSize: 14,
    alignSelf: 'center',
    paddingLeft: 13,
    paddingRight: 13,
    fontFamily: 'SFUIDisplay-Medium',
    fontWeight: '500'
  },
  feedbackChildContainer: {
    // ...Platform.select({
    //   ios: {
    //     //shadowColor: "rgba(163, 163, 194, 1)",
    //     shadowOffset: {
    //       width: 0,
    //       height: 15,
    //     },
    //     shadowOpacity: 0.20,
    //     shadowRadius: 6.60,
    //   },
    //   android: {
    //     elevation: 2,
    //     borderBottomWidth: 0,
    //     backgroundColor: 'transparent',
    //     borderRadius: 20,
    //   }
    // }),
    shadowOffset: {
      width: 0,
      height: Platform.OS == 'ios' ? 15 : 8,
    },
    shadowOpacity: 0.20,
    shadowRadius: 6.60,
    shadowColor: "rgba(163, 163, 194, 1)",
  },
  rowFeedbackContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: "rgba(163, 163, 194, 1)",
    shadowOffset: {
      width: 0,
      height: 15,
    },
    shadowOpacity: 0.20,
    shadowRadius: 6.60,
    elevation: 15,
    marginTop: 4
  },
  rowFeedbackTitle: {
    color: "rgba(27, 50, 48, 0.9)",
    fontSize: 16,
    paddingLeft: 4,
    paddingTop: 4,
    fontWeight: '700',
    fontFamily: 'SFUIDisplay-Bold'
  },
  explanationIconItem: {
    flexDirection: 'row',
    //alignItems: 'center',
    marginTop: 12,
  },
  explanationIconText: {
    fontFamily: 'SFUIDisplay-Regular',
    fontWeight: '400',
    fontSize: 16,
    letterSpacing: 0.005,
    lineHeight: 19,
    color: 'rgba(33, 44, 44, 0.7)',
    marginLeft: 12,
    paddingRight: 20,
    alignSelf: 'center'
  },
  allSkills: {
    fontFamily: 'SFUIDisplay-Bold',
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: 'rgba(27, 50, 48, 0.5)'
  },
  allSkillsContainer: {
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
    marginTop: 8,
    borderColor: 'rgba(27, 50, 48, 0.1)'
  },
  allSkillsItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    //borderBottomWidth: 1,
    borderBottomColor: 'rgba(27, 50, 48, 0.1)',
    paddingLeft: 16,
    paddingRight: 7,
    paddingTop: 13,
    paddingBottom: 13
  },
  allSkillsItemText: {
    fontFamily: 'SFUIDisplay-Medium',
    fontWeight: '500',
    fontSize: 14,
    flexWrap: 'wrap',
    color: 'rgba(33, 37, 41, 0.7)'
  },
  allSkillsItemCountContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 32,
    minWidth: 32,
    borderRadius: 32 / 2,
    backgroundColor: 'rgba(27, 50, 48, 0.05)'
  },
  allSkillsItemCount: {
    fontFamily: 'SFUIDisplay-Medium',
    fontWeight: '500',
    fontSize: 14,
    flexWrap: 'wrap',
    color: 'rgba(0, 0, 0, 1)'
  },
  sectionTitle: {
    flex: 0.7,
    color: "#212C2C",
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 26,
    fontFamily: 'SFUIDisplay-Bold'
  },
  feedbackChildItem: {
    paddingLeft: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
  },
  feedbackUserContainer: {
    flex: 0.15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#15BFB4',
    borderRadius: 54,
    flexDirection: 'row'
  },
  feedbackUserRoleContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E8D638',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    //marginLeft: Platform.OS == 'ios' ? -8 : -1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  feedbackActionContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    height: 84,
    borderWidth: 1,
    borderColor: 'rgba(21, 191, 180, 0.4)',
    borderStyle: 'dashed',
    marginBottom: 8,
    paddingLeft: 10,
    paddingRight: 10,
  },
  providername: {
    color: "#212C2C",
    fontSize: 16,
    fontFamily: 'SFUIDisplay-Bold',
    fontWeight: '700',
    lineHeight: 19,
  },
  jnStatusRoundCon: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    height: 28,
    width: 'auto',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: "row",
    paddingEnd: 8,
  },
  jnStatusImage: {
    height: 16,
    width: 16,
    resizeMode: "contain",
  },
  jnJobStatusImage: {
    height: 30,
    width: 30,
    resizeMode: "contain",
    marginEnd: 8
  },
  companyName: {
    color: "#212C2C",
    fontSize: 18,
    fontFamily: 'SFUIDisplay-Bold',
    fontWeight: '700',
    lineHeight: 18,
  },
  company_text: {
    color: "#212C2C",
    fontSize: 18,
    fontFamily: 'SFUIDisplay-Regular',
    fontWeight: '400',
    lineHeight: 18,
  },
  companyLogo: {
    height: 32,
    width: 44,
    resizeMode: 'contain'
  },
  viewJobBtn: {
    alignSelf: "flex-end",
  },
  viewJobBtnText: {
    color: '#4EC5C1',
    fontSize: 16,
    fontFamily: 'SFUIDisplay-Regular',
    fontWeight: '700',
    lineHeight: 19
  },
  rrText: {
    color: '#212C2C',
    fontSize: 18,
    fontFamily: 'SFUIDisplay-Regular',
    fontWeight: '600',
    lineHeight: 22
  },
  rcText: {
    color: '#212C2CD9',
    fontSize: 14,
    fontFamily: 'SFUIDisplay-Regular',
    fontWeight: '400',
    lineHeight: 17,
    marginTop: 4
  },
  jobNotifDateText: {
    color: '#212C2C80',
    fontSize: 10,
    fontFamily: 'SFUIDisplay-Regular',
    fontWeight: '700',
    lineHeight: 12,
    marginStart: '16%',
    marginTop: 12
  },
  thinkText: {
    color: "#1B3230",
    fontSize: 16,
    fontFamily: 'SFUIDisplay-Regular',
    fontWeight: '400',
    lineHeight: 19,
  },
  userName: {
    color: "#212C2C",
    fontSize: 24,
    fontWeight: '700',
    alignSelf: 'center',
    marginLeft: 4,
    fontFamily: 'SFUIDisplay-Bold',
    lineHeight: 29,
    display: 'flex'
  },
  btnAcceptAll: {
    flex: 0.3,
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 4,
    paddingRight: 4
  },
  acceptAll: {
    color: "#4EC5C1",
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 19,
    fontFamily: 'SFUIDisplay-Medium'
  },
  feedbackTitle: {
    color: "#212C2C",
    fontSize: 16,
    paddingLeft: 4,
    paddingTop: 4,
    flexWrap: 'wrap',
    fontWeight: '700',
    fontFamily: 'SFUIDisplay-Bold',
    lineHeight: 22
  },
  feedbackContent: {
    color: "rgba(33, 44, 44, 0.85)",
    fontSize: 14,
    paddingLeft: 4,
    paddingRight: 28,
    paddingTop: 4,
    flexWrap: 'wrap',
    lineHeight: 22,
    fontFamily: 'SFUIDisplay-Regular',
    lineHeight: 17,
    letterSpacing: 0.005
  },
  skillTitle: {
    fontFamily: 'SFUIDisplay-Bold',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: 'rgba(33, 44, 44, 0.5)',
    paddingLeft: 4,
    lineHeight: 14,
    marginTop: 11
  },
  bottomContainer: {
    position: 'absolute',
    paddingTop: 10,
    bottom: 0,
    width: '100%',
    height: DeviceInfo.hasNotch() ? 100 : 80,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingLeft: 10,
    paddingRight: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)'
  },
  bottomContainerDevelop: {
    position: 'absolute',
    paddingTop: 10,
    bottom: 0,
    width: '100%',
    height: DeviceInfo.hasNotch() ? 100 : 80,
    flexDirection: 'row',
    // alignItems: 'flex-start',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingLeft: 10,
    paddingRight: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)'
  },
  btnGivePoint: {
    flex: 0.45,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#4ec5c1',
    borderWidth: 1,
    borderRadius: 2,
    marginLeft: 8,
    backgroundColor: 'transparent'
  },
  btnGivePointText: {
    color: "#4EC5C1",
    fontSize: 18,
    padding: 8,
    fontWeight: '700',
    lineHeight: 19,
    fontFamily: 'SFUIDisplay-Bold'
  },
  btnGetPoint: {
    flex: 0.45,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 2,
    backgroundColor: '#4ec5c1',
    height: 44,
  },
  btnGetPointText: {
    color: "#FFFFFF",
    fontSize: 18,
    padding: 8,
    lineHeight: 19,
    fontWeight: '700',
    fontFamily: 'SFUIDisplay-Bold',
  },
  realizeText: {
    color: "#212C2C",
    fontSize: 24,
    lineHeight: 40,
    fontWeight: '700',
    fontFamily: 'SFUIDisplay-Regular',
    paddingHorizontal: 26,
    textAlign: 'center',
    alignSelf: 'center',
  }
})
