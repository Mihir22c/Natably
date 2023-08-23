import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  Alert,
  View,
  Image,
  TouchableHighlight,
  Keyboard,
  LayoutAnimation,
  Modal,
  TouchableOpacity,
  Dimensions,
  FlatList,
  Linking,
  StatusBar,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Navigation } from 'react-native-navigation';
import DeviceInfo from 'react-native-device-info';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import SpinnerLoading from '../constant/spinnerLoading'
import messaging from '@react-native-firebase/messaging';
import { GoogleBookSearch } from 'react-native-google-books';
import { BookSearch } from 'react-native-google-books';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as Unicons from '@iconscout/react-native-unicons';
import { Dropdown } from 'react-native-element-dropdown';
import { AutocompleteDropdown } from 'react-native-autocomplete-dropdown';
import FastImage from 'react-native-fast-image'

import {
  CodeField,
  Cursor,
} from 'react-native-confirmation-code-field';

import BlurModel from '../constant/BlurModel';

let { height, width } = Dimensions.get('window');
import { registerKilledListener, registerAppListener } from "../constant/listeners";
const CONST = require('../constant/const');
import Api from '../Api/Api';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

var circle_icon_size = 30;
var access_token = '';
var gender_data = '';
var notif_data = '';
var session;
var androidKeyboardOffset = 0;
var serachCancel;
var iskeyboard = false;

registerKilledListener();

let professionArray = [
  { label: 'Studying', value: 'studying' },
  { label: 'Working', value: 'working' },
];

let associationData = [
  { label: 'Faculty', value: 'faculty' },
  { label: 'Staff', value: 'staff' },
  { label: 'Alumni', value: 'alumni' },
]

export default class profile extends Component {

  static options(passProps) {
    return {
      topBar: {
        drawBehind: true,
        visible: false,
        animate: false
      },
      sideMenu: {
        left: {
          enabled: false, // hide drawer for this screen
        }
      }
    };
  }

  constructor(props) {
    super(props);
    StatusBar.setBarStyle("dark-content", true);
    this.state = {
      name: '',
      profileAvatar: '',
      isFromEdit: false,
      titleText: 'CREATE YOUR PROFILE',
      topbarTopMargin: 0,
      isLoading: false,
      verificationCode: '',
      groupStatus: 999,
      keyboardOffset: 0,
      errorMessage: '',
      groupData: '',
      isDelete: false,
      selectedBook: '',
      googleBookID: '',
      showGoogleBookSearch: false,
      arrayGoogleBooks: [],
      isChangeProfile: false,
      removeProfile: 0,
      profileData: '',

      occupation: null,
      currentyear: null,
      institution: null,
      profession: null,
      jobTitle: null,
      degree: null,
      interestedJob: null,
      institutionData: [],
      interestedFieldData: [],
      aspiredJobData: [],
      degreeData: [],
      yearData: [],
      professionData: [],
      occupationData: [],
      professionSearch: '',
      interestedFieldSearch: '',
      aspiredJobSearch: '',
      association: null,
      programEditable: true,
      companyTextEnable: true,
      interestedFieldEditable: true,
      aspiredJobEditable: true,
      interestedField: null,
      aspiredJob: null,
      aspiredJobText: null,
      linkedInUrl: null,
      linkedInEditable: true,
    }
    session = this;
  }

  _keyboardWillShow(event) {
    let that = this;
    iskeyboard = true;
    if (Platform.OS === 'android') {
      setTimeout(function () {
        that.setState({
          keyboardOffset: androidKeyboardOffset,
        });
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      }, 200);
    }
    else {
      this.setState({
        keyboardOffset: - (height / 6),
      });

      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    }
  }

  keyboardWillHide() {
    this.setState({
      keyboardOffset: 0,
    });
    iskeyboard = false;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
  }

  componentDidMount() {
    this._keyboardWillShow = this._keyboardWillShow.bind(this);
    this.keyboardWillHide = this.keyboardWillHide.bind(this);

    this.keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'android' ? 'keyboardDidShow' : 'keyboardWillShow',
      this._keyboardWillShow,
    );
    this.keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'android' ? 'keyboardDidHide' : 'keyboardWillHide',
      this.keyboardWillHide,
    );

    registerAppListener(this.props.navigator, this.props.componentId);
    this.setState({ topbarTopMargin: CONST.checkIphoneX() });
    // check to show screen as create profile / edit profile
    if (this.props.from == 'edit') {
      this.setState({ isFromEdit: true, titleText: 'Account Settings' });
      CONST.getProfileAvatar().then((result) => {
        console.log('UserProfile: ', result);
        if (result != null) {
          console.log("Profile Pic for Local : ", result)
          this.setState({
            profileAvatar: result
          });
        }
      });
      this.getUserProfileData();
    } else {
      this.setState({ isFromEdit: false, titleText: 'CREATE YOUR PROFILE' });
    }
  }

  async fnGetFCMToken() {

    // messaging().getInitialNotification().then(remoteMessage => {
    //   if (remoteMessage) {
    //     console.log('onMessage 379:' + JSON.stringify(remoteMessage), remoteMessage.notification);
    //   }
    // });

    const enabled = await messaging().hasPermission();
    console.log('notification: ', enabled);
    if (enabled) {
      console.log('Notification Permission Apply :', enabled);
      let getToken = await messaging().getToken();
      console.log('FCM Token : ', getToken);
      access_token = getToken;
      //this.sendUserDataOnServer();
      this.onSubmitClick()
      try {
        AsyncStorage.setItem('@AccessToken', getToken);
      } catch (error) {
        // alert('error - ' + error);
      }
    } else {
      this.checkFirebasePermmision(true)
    }
  }

  getUserProfileData() {
    this.setState({
      isLoading: true
    })
    //DeviceInfo.getUniqueId()
    Api.getUserProfile(this, DeviceInfo.getUniqueId(), function (parent, data) {
      parent.setState({
        isLoading: false
      })
      if (data.error == '1') {

      } else {
        parent.setState({
          profileData: data.data,
          name: data.data.name,
          selectedBook: data.data.google_book_title == null ? '' : data.data.google_book_title,
          jobTitle: data.data.job_title,
          occupation: data.data.cp_occupation,
          company: data.data.company_institution,
          program: data.data.company_institution != null ? data.data.company_institution : '',
          association: data.data.association,
          interestedField: { id: data.data.field_interest_id, name: '' },
          aspiredJob: { id: data.data.job_field_interest_id, name: '' },
          aspiredJobText: data.data.other_job_field_interest,
          linkedInUrl: data.data.linkedin_url
        });
        notif_data = data.data.should_be_notified == 1 ? 'selected' : 'not_selected'

        if (data.data.photo != 'https://natably.com/images/avatar.png') {
          console.log("Profile Pic : ", data.data.photo)
          parent.setState({
            profileAvatar: data.data.photo
          });
          CONST.setProfileAvatar(data.data.photo);
        }

        if (data.data.hasOwnProperty('code')) {
          if (data.data.code != null) {
            parent.verificationCodeChangeText(data.data.code);
          } else {
            parent.setState({
              occupationData: professionArray,
              companyTextEnable: true
            });
            if (data.data.university != null) {
              parent.setState({
                institution: data.data.university,
                institutionSearch: data.data.university
              });
              parent.onSearchUniversities(data.data.university)
            }
          }
        }
        if (data.data.occupation_id != null) {
          parent.onOccupationsApi("", data.data.occupation_id)
        }
        parent.addDropdownData();
      }
    });
  }

  onBackClick() {
    Navigation.pop(this.props.componentId);
  }

  onNextClick() {
    // save user's profile information to backend
    notif_data = "not_selected"
    if (this.state.name != '' && notif_data != '') {
      AsyncStorage.getItem('@AccessToken')
        .then(token => {
          if (token == null) {
            messaging().getInitialNotification().then(remoteMessage => {
              if (remoteMessage) {
                console.log('onMessage 379:' + JSON.stringify(remoteMessage), remoteMessage.notification);
              }
            });
            this.checkFirebasePermmision(false);
          } else {
            access_token = token;
            this.checkFirebasePermmision(false);
            //this.sendUserDataOnServer();
          }
        })
        .catch(error => console.log(error));
    } else {
      Alert.alert(CONST.appName, 'Please fill all information!');
    }
  }

  openNotificationSettings(isEdit) {
    Alert.alert(
      'Natably Would Like to Send You Notifications',
      'Notifications may include alerts, sounds, and icon badges. These can be configured in Settings.',
      [
        {
          text: "Cancel", onPress: () => {
            notif_data = 'not_selected'
            if (isEdit) {
              this.onSubmitClick();
            }
            else {
              this.sendUserDataOnServer();
            }
          }
        },
        {
          text: "Go to Settings", onPress: () => {
            this.setState({
              isLoading: false
            });
            Linking.canOpenURL('app-settings:').then(supported => {
              if (!supported) {
                if (Platform.OS === 'android') {
                  Linking.openSettings();
                }
                else {
                  Linking.openSettings();
                }
              } else {
                return Linking.openURL('app-settings:3');
              }
            }).catch(err => console.error('An error occurred', err));
          }
        },
      ],
      { cancelable: false }
    );
  }

  async checkFirebasePermmision(isEdit) {
    try {
      const authStatus = await messaging().requestPermission();
      console.log('Permission status:', authStatus);
      const enabled = authStatus === messaging.AuthorizationStatus.AUTHORIZED || authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        const authStatus = await messaging().hasPermission();
        if (authStatus === messaging.AuthorizationStatus.AUTHORIZED) {
          console.log('authStatus: ', authStatus);
          let getToken = await messaging().getToken();
          console.log('FCM Token 2: ', getToken);
          access_token = getToken;
          Api.getUserToken(session, this.state.name, DeviceInfo.getUniqueId(), DeviceInfo.getDeviceId(), getToken, function (parent, data) {
            //console.log('------ getUserProfile response >>> '+ data.data.name);
          });
          notif_data = 'selected';
          //console.log('notif_data will be selected', notif_data);
          if (isEdit) {
            this.onSubmitClick();
          }
          else {
            this.sendUserDataOnServer();
          }
        }
        else {
          console.log('authStatus else: ', authStatus);
          notif_data = 'not_selected';
          this.openNotificationSettings(isEdit);
        }
      }
      else {
        notif_data = 'not_selected';
        this.openNotificationSettings(isEdit);
      }
    }
    catch (error) {
      notif_data = 'not_selected';
      this.openNotificationSettings(isEdit);
      console.log("permission rejected: ", error);
    }
  }

  async sendUserDataOnServer() {

    let getTheToken = await messaging().getToken();
    try {
      AsyncStorage.setItem('@AccessToken', getTheToken);
    } catch (error) {
    }

    gender_data = '';
    this.setState({
      isLoading: true,
    })
    var notif_data_api = 0;
    if (notif_data == 'selected') {
      notif_data_api = 1;
    }
    // save user's profile information to backend
    console.log('access_token: ', access_token);
    Api.saveUserProfile(this, this.state.name, DeviceInfo.getUniqueId(), access_token, gender_data, notif_data_api, this.state.groupData == '' ? '' : this.state.groupData.id, this.state.googleBookID, this.state.selectedBook, function (parent, data) {
      console.log('saveUserProfile response: ', data);
      parent.setState({
        isLoading: false
      });
      Navigation.push(parent.props.componentId, {
        component: {
          name: CONST.SelfAssessmentCategoryScreen,
        }
      });
    });
  }

  async openImagePicker(isCamera) {
    try {
      let option = {
        // maxHeight: 200,
        // maxWidth: 200,
        selectionLimit: 1,
        mediaType: 'photo',
        includeBase64: false,
      };

      let result = null;

      if (isCamera) {
        result = await launchCamera(option);
      } else {
        result = await launchImageLibrary(option);
      }

      if (result.didCancel) {
        console.log('User cancelled photo picker');
      } else if (result.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (result.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      } else if (result.assets) {
        this.setState({
          profileAvatar: result.assets[0]
        })
      }

      setTimeout(() => {
        this.setState({
          isChangeProfile: false
        });
      }, 500)

    } catch (e) {
      console.log('Image Picker Error: ', e);
      this.setState({
        isChangeProfile: false
      });
    }
  }

  onSubmitClick() {

    //console.log('this.state.verificationCode.length: ', this.state.verificationCode.length);
    if (this.state.groupData != '') {
      if (this.state.verificationCode.length < 6) {
        this.setState({ isDelete: true });
        return;
      }
    }

    // save user's edited profile info to backend
    gender_data = '';
    if (this.state.name != '' && notif_data != '') {
      this.setState({
        isLoading: true
      });
      var notif_data_api = 0;
      if (notif_data == 'selected') {
        notif_data_api = 1;
      }

      let ocupationData = {
        cp_occupation: this.state.occupation,
        job_title: this.state.jobTitle,
        institution: this.state.institution != null ? this.state.institution.title : null,
        degree_id: this.state.degree != null ? this.state.degree.id : null,
        occupation_id: this.state.profession != null ? this.state.profession.id : null,
        current_year_id: this.state.currentyear,
        association: this.state.association,
        company_institution: this.state.occupation == 'working' ? this.state.company : this.state.program,
        field_interest_id: this.state.interestedField?.id,
        job_field_interest_id: this.state.aspiredJob?.id,
        other_job_field_interest: this.state.aspiredJobText,
      }

      if (this.state.profileData != null) {
        if (this.state.profession != null) {
          ocupationData.occupation_id = this.state.profession.id
        } else {
          ocupationData.occupation_id = this.state.profileData.occupation_id
        }
      }

      console.log("Update Data: ", JSON.stringify(ocupationData));

      Api.editUserProfile(
        this,
        this.state.name,
        DeviceInfo.getUniqueId(),
        this.state.groupData == '' ? '' : this.state.groupData.id,
        this.state.googleBookID,
        this.state.selectedBook,
        ocupationData,
        this.state.profileAvatar,
        this.state.removeProfile,
        this.state.linkedInUrl,
        function (parent, data) {
          if (parent.state.removeProfile == 1) {
            CONST.setProfileAvatar("");
          }
          parent.setState({
            isLoading: false,
            removeProfile: 0
          });
          // if (data.status == 200) {
          //   CONST.setProfile(JSON.stringify(data.data));
          // }
          setTimeout(function () {
            Navigation.pop(session.props.componentId);
          }, 1000);
        });
    } else {
      Alert.alert(CONST.appName, 'Please fill all information!');
    }
  }

  verificationCodeChangeText(text) {
    this.setState({ verificationCode: text });
    if (text.length == 0) {
      this.setState({
        occupationData: professionArray,
      })
    }
    if (text.length == 6) {
      //console.log('call get Group code');
      this.setState({
        isLoading: true,
        groupStatus: '',
      });
      Api.getGroupCode(this, text, function (parent, data) {
        parent.setState({
          isLoading: false,
          groupStatus: data.status
        });
        if (data.status == 200) {

          parent.setState({
            errorMessage: '',
            groupData: data.data,
            occupationData: [professionArray[1]],
            company: data.data.name,
            companyTextEnable: false
          });

          if (data.data.designation == "business") {
            parent.setState({
              occupationData: [professionArray[1]],
              occupation: 'working',
              company: data.data.company_institution,
              association: null,
            });
          } else {
            let obj = {
              id: 0,
              title: data.data.name
            }
            parent.setState({
              occupationData: professionArray,
              occupation: parent.state.professionData != null ? parent.state.profileData.cp_occupation : 'studying',
              program: data.data.name,
            });
            if (parent.state.profileData != null) {
              if (parent.state.profileData.university != null) {
                obj.title = parent.state.profileData.university;
                parent.setState({
                  institution: obj,
                  institutionSearch: parent.state.profileData.university,
                })
                parent.onSearchUniversities(parent.state.profileData.university)

              }
            }

            if (data.data.company_institution != null) {
              obj.title = data.data.company_institution;
              parent.setState({
                institution: obj,
                institutionSearch: data.data.company_institution,
              })
              parent.onSearchUniversities(data.data.company_institution)
            }
          }

        } else if (data.status == 404) {
          //console.log('xxx 293: ', data);
          parent.setState({
            verificationCode: '',
            errorMessage: data.error.message,
            occupationData: professionArray
          });
        }
      });
    } else {
      this.setState({
        errorMessage: '',
      });
    }
  }

  // editImgClick() {
  //   console.log('Image Click');
  //   this.setState({
  //     isDelete: true,
  //   })
  // }

  addDropdownData() {
    try {
      Api.getDegrees(this, function (parent, data) {
        if (data.status == 200) {
          parent.setState({
            degreeData: data.data
          })

          if (parent.state.profileData != null) {
            if (parent.state.profileData.hasOwnProperty('degree_id')) {
              data.data.map((row, inx) => {
                if (parent.state.profileData.degree_id == row.id) {
                  parent.setState({
                    degree: row
                  })
                }
              })
            }
          }
        }
      });

      Api.getCurrentYears(this, function (parent, data) {
        if (data.status == 200) {
          const result = Object.keys(data.data).map(key => ({
            name: data.data[key] + "",
            id: data.data[key]
          }));
          parent.setState({
            yearData: result
          });
          if (parent.state.profileData != null) {
            if (parent.state.profileData.hasOwnProperty('current_year')) {
              result.map((row, inx) => {
                if (parent.state.profileData.current_year == row.id) {
                  parent.setState({
                    currentyear: row.id
                  })
                }
              })
            }
          }
        }
      });

      Api.getInterestedField(this, DeviceInfo.getUniqueId(), function (parent, data) {
        if (data.status == 200) {
          parent.setState({
            interestedFieldData: data?.data
          });
          if (parent.state.profileData != null) {
            if (parent.state.profileData.hasOwnProperty('field_interest_id')) {
              data?.data.map((row, inx) => {
                if (parent.state.profileData.field_interest_id == row.id) {
                  parent.setState({
                    interestedField: { id: row?.id, name: '' }
                  })
                  parent.getInterestedJob(row?.id)
                }
              })
            }
          }
        }
      });


    } catch (e) {
      console.log("Profle Screen Error : ", e);
    }
  }

  onSearchUniversities(text) {
    try {
      Api.getUniversities(this, text, DeviceInfo.getUniqueId(), function (parent, data) {
        if (data.status == 200) {
          let updateArray = data.data.map((row, idx) => {
            let obj = {
              id: idx,
              title: row
            }
            return obj;
          })
          parent.setState({
            institutionData: updateArray
          });
        }
      });
    } catch (error) {
      console.log('getUniversities Error: ', error);
    }
  }

  getInterestedJob(fieldInterestId) {
    Api.getJobInterested(this, DeviceInfo.getUniqueId(), fieldInterestId, function (parent, data) {
      if (data.status == 200) {
        parent.setState({
          aspiredJobData: data?.data
        });
        if (parent.state.profileData != null) {
          if (parent.state.profileData.hasOwnProperty('job_field_interest_id')) {
            data?.data.map((row, inx) => {
              if (parent.state.profileData.job_field_interest_id == row.id) {
                parent.setState({
                  aspiredJob: { id: row.id, name: '' }
                })
              }
            })
          }
        }
      }
    });
  }

  onOccupationsApi(text, id) {
    try {
      Api.getOccupations(this, text, id, DeviceInfo.getUniqueId(), function (parent, data) {
        if (data.status == 200) {
          if (id != null) {
            let obj = {
              id: data.data.id,
              title: data.data.name
            }
            parent.setState({
              profession: obj,
              professionSearch: data.data.name,
              professionData: [obj]
            });
          } else {
            var updateArray = data.data.map((row, idx) => {
              let obj = {
                id: row.id,
                title: row.name
              }
              return obj;
            })
            parent.setState({
              professionData: updateArray
            });
          }
        }
      });
    } catch (error) {
      console.log('getOccupations Error: ', error);
    }
  }

  render() {
    if (this.state.showGoogleBookSearch) {
      return (
        <View style={{ height: '100%' }}>

          <TouchableHighlight style={{ position: 'absolute', flex: 0.1, marginLeft: 16, marginTop: 60, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' }} underlayColor='transparent' onPress={() => {

            console.log('refs: ', this.refs.mySearch._reactInternals.memoizedState.searchval);
            let searchVal = this.refs.mySearch._reactInternals.memoizedState.searchval;
            this.setState({ showGoogleBookSearch: false });
            if (searchVal.length < 1) {
              this.setState({ selectedBook: '' });
            }
          }}>
            <Image style={{ width: CONST.headerLeftMenuSize, height: CONST.headerLeftMenuSize }} source={require('../img/back.png')} resizeMode="contain" />
          </TouchableHighlight>

          <GoogleBookSearch
            ref="mySearch"
            apikey={CONST.googleAPIKey}
            value={this.state.selectedBook}
            searchContainerStyle={{ marginTop: 100 }}
            resultContainerStyle={{ display: 'none', height: 0, backgroundColor: 'transparent' }}
            resultItemStyle={{ display: 'none', height: 0, backgroundColor: 'transparent' }}
            onResultPress={(book) => {

            }}
            searchResult={(result) => {
              this.setState({ arrayGoogleBooks: result });
            }}
          />

          {this.state.arrayGoogleBooks.length > 0 &&
            <FlatList
              style={{ position: 'absolute', marginTop: 180, backgroundColor: 'transparent', height: '100%', width: '100%' }}
              data={this.state.arrayGoogleBooks}
              renderItem={({ item: rowData, index }) => (
                <TouchableOpacity onPress={() => { this.setState({ showGoogleBookSearch: false, selectedBook: rowData.volumeInfo.title, googleBookID: rowData.id }); }} style={{ height: 50, paddingLeft: 10, paddingRight: 10, borderBottomWidth: 0.5, borderBottomColor: 'rgba(52, 52, 52, 0.8)', justifyContent: 'center' }}>
                  {/*console.log('rowData.volumeInfo.id: ', rowData.id)*/}
                  <Text>{rowData.volumeInfo.title + ' by ' + rowData.volumeInfo.authors}</Text>
                </TouchableOpacity>
              )}

              keyExtractor={(item, index) => index.toString()}
            />
          }
        </View>
      );
    }

    return (
      <View style={{ height: height, top: this.state.keyboardOffset }}>
        <View style={{ flex: 1, backgroundColor: '#fff', flexDirection: 'column', marginTop: DeviceInfo.hasNotch() ? 25 : 0 }}>
          <SpinnerLoading visible={this.state.isLoading} />
          {/*--------header--------*/}
          {this.state.isFromEdit ?
            <View style={{ marginTop: this.state.topbarTopMargin, height: CONST.headerHeight, backgroundColor: CONST.headerBackColor, flexDirection: 'row', paddingLeft: 16, paddingRight: 16 }}>
              {/*left*/}
              <TouchableOpacity style={{ flex: 0.1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent', opacity: 0.5 }} underlayColor='transparent' onPress={() => this.onBackClick()}>
                <Unicons.UilArrowLeft size={30} color="#000000" />
              </TouchableOpacity>
              {/*center*/}
              <View style={{ flex: 0.8, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent', opacity: 0.7 }}>
                <Text style={style.titleText}>{this.state.titleText}</Text>
              </View>
              {/*right*/}
              <View style={{ flex: 0.1 }}>

              </View>
            </View>
            :
            <View style={{ marginTop: this.state.topbarTopMargin, flex: 0.2 }}>
              <View style={{ flex: 0.1 }} />
              <View style={{ flex: 0.1, paddingLeft: 32, paddingRight: 32, backgroundColor: 'transparent' }}>
                <Image style={{ width: 150, height: 56 }} source={CONST.headerlogo} resizeMode="contain" />
              </View>
            </View>
          }
          {/*--------divider--------*/}
          {this.state.isFromEdit &&
            <View style={{ backgroundColor: 'rgba(0, 0, 0, 0.15)', height: 1 }} />
          }

          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS == 'ios' ? null : 'height'}
            enabled
          >
            <ScrollView
              nestedScrollEnabled
              //keyboardDismissMode='on-drag'
              keyboardShouldPersistTaps="handled"
              contentInsetAdjustmentBehavior='automatic'
              // contentContainerStyle={{ paddingBottom: iskeyboard ? 100 : 20 }}
              style={{ flex: 1 }}
            >
              <View style={{ paddingBottom: 50 }}>
                {/*------------Profile Avatar-------------*/}
                {this.state.isFromEdit &&
                  <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 40 }}>
                    <FastImage
                      style={{ width: 128, height: 128, borderRadius: 128 / 2 }}
                      source={this.state.profileAvatar.hasOwnProperty('uri') ? { uri: this.state.profileAvatar.uri, priority: FastImage.priority.high } : this.state.profileAvatar != '' ? { uri: this.state.profileAvatar, priority: FastImage.priority.high } : require('../img/user.png')}
                    />
                    {/*<Image source={this.state.profileAvatar.hasOwnProperty('uri') ? { uri: this.state.profileAvatar.uri } : this.state.profileAvatar != '' ? { uri: this.state.profileAvatar } : require('../img/user.png')} style={{ width: 128, height: 128, borderRadius: 128 / 2 }} />*/}
                    <TouchableOpacity style={style.cameraButton} activeOpacity={0.4} onPress={() => this.setState({ isChangeProfile: true })}>
                      <Image source={require('../img/camera.png')} style={{ width: 40, height: 40 }} />
                    </TouchableOpacity>
                  </View>
                }
                {/*------------Name-------------*/}
                <TouchableOpacity style={{ marginTop: 30, flexDirection: 'column', paddingLeft: 32, paddingRight: 32, backgroundColor: 'transparent' }} onPress={() => { this.refs.myInput.focus() }}>

                  <Text style={{ color: "#000000", fontSize: 18, fontFamily: 'GoogleSans-Regular' }}>Name</Text>
                  <TextInput
                    ref="myInput"
                    style={{ marginTop: 15, color: '#000', fontSize: 20, fontFamily: 'GoogleSans-Bold' }}
                    onChangeText={(name) => this.setState({ name })}
                    onFocus={() => androidKeyboardOffset = 0}
                    value={this.state.name}
                    placeholder={'Your name'}
                  />
                  <View style={{ marginTop: 10, height: 4, flexDirection: 'row', backgroundColor: 'transparent' }}>
                    <View style={{ flex: 0.33, backgroundColor: '#f2473f' }} />
                    <View style={{ flex: 0.33, backgroundColor: '#4ec5c1' }} />
                    <View style={{ flex: 0.33, backgroundColor: '#f3d471' }} />
                  </View>

                </TouchableOpacity>

                {/*------------Google Books Input-------------*/}

                <TouchableOpacity style={{ marginTop: 30, justifyContent: 'center' }} underlayColor='transparent' onPress={() => { this.setState({ showGoogleBookSearch: true }); }} disabled>

                  <View style={{ flexDirection: 'row', backgroundColor: 'transparent', alignItems: 'center' }}>
                    {/* <Text style={{ color: "#000000", fontSize: 18, marginLeft: 30, fontFamily: 'GoogleSans-Regular' }}>YOUR LINKEDIN PROFILE</Text> */}
                    <Text style={{ color: "#000000", fontSize: 12, marginLeft: 30, fontFamily: 'SFUIDisplay-Regular', fontWeight: '700' }}>YOUR LINKEDIN PROFILE</Text>

                    {false &&
                      <TouchableHighlight style={{ position: 'absolute', right: 30, alignItems: 'center', justifyContent: 'center', backgroundColor: ' transparent' }} underlayColor='transparent' onPress={() => { this.setState({ showGoogleBookSearch: true }); }}>
                        <Image style={{ width: 20, height: 20 }} source={require('../img/edit.png')} resizeMode="contain" />
                      </TouchableHighlight>
                    }
                  </View>

                  {/* <TouchableOpacity disabled={this.state.selectedBook.length > 0 ? true : true} style={{ height: 40, marginBottom: 0, marginTop: 5, marginLeft: 30, marginRight: 30, paddingLeft: 5, paddingRight: 5, borderWidth: 1, borderColor: '#e8e8e8', alignItems: 'flex-start', justifyContent: 'center' }} underlayColor='transparent' onPress={() => { this.setState({ showGoogleBookSearch: true }); }}>
                    <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.5} style={{ color: this.state.selectedBook.length > 0 ? "#000000" : '#bdbdbf', fontSize: 18, fontFamily: 'GoogleSans-Regular' }}>{this.state.selectedBook.length > 0 ? this.state.selectedBook : 'Select your favourite book (optional)'}</Text>
                  </TouchableOpacity> */}
                  <TextInput
                    style={{ height: 40, marginBottom: 0, marginTop: 5, marginLeft: 30, marginRight: 30, paddingLeft: 5, paddingRight: 5, borderWidth: 1, borderColor: '#e8e8e8', alignItems: 'flex-start', justifyContent: 'center' }}
                    value={this.state.linkedInUrl}
                    editable={this.state.linkedInEditable}
                    placeholder='Enter LinkedIN profile URL address'
                    onChangeText={(url) => this.setState({ linkedInUrl: url })}
                  />
                </TouchableOpacity>

                {/*------------Group code-------------*/}
                <View style={{ marginTop: 30, flexDirection: 'column', paddingLeft: 32, paddingRight: 32, paddingTop: 5, backgroundColor: 'transparent' }}>
                  {(this.state.groupStatus == 404 || this.state.groupStatus == 999) &&
                    <View style={{ flexDirection: 'row', backgroundColor: 'transparent' }}>
                      <Text style={{ color: "#909090", fontSize: 18, fontFamily: 'GoogleSans-Regular', marginRight: 15 }}>Enter group code (if applicable):</Text>
                      <TouchableHighlight style={{ display: 'none', alignItems: 'center', position: 'absolute', right: 0, justifyContent: 'center', backgroundColor: ' transparent' }} underlayColor='transparent' onPress={() => { this.setState({ verificationCode: '' }); }}>
                        <Image style={{ width: 20, height: 20 }} source={require('../img/cancel.png')} resizeMode="contain" />
                      </TouchableHighlight>
                    </View>
                  }
                  <TouchableOpacity onPress={() => {
                    if (this.state.groupStatus == 200) {
                      this.setState({ groupStatus: 999 });
                      //this.refs.myCodeField.focus();
                    }
                  }} style={{ flex: 0.5, backgroundColor: 'transparent', marginTop: 0 }}>
                    {this.state.groupStatus == 200 &&
                      <View>
                        <View style={{ flexDirection: 'row' }}>
                          <Text style={{ color: "#909090", fontSize: 18, marginLeft: 0, fontFamily: 'GoogleSans-Regular' }}>Group</Text>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                          <Image source={{ uri: this.state.groupData.logo }} style={style.logoImage} />
                          <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.5} style={style.groupName}>{this.state.groupData.name}</Text>
                        </View>
                      </View>
                    }
                    {(this.state.groupStatus == 404 || this.state.groupStatus == 999) &&
                      <View>
                        <CodeField
                          ref="myCodeField"
                          value={this.state.verificationCode}
                          onChangeText={(text) => {
                            this.verificationCodeChangeText(text);
                          }}
                          cellCount={6}
                          rootStyle={style.codeFieldRoot}
                          onFocus={() => androidKeyboardOffset = -150}
                          //keyboardType="number-pad"
                          returnKeyType={'done'}
                          onSubmitEditing={() => Keyboard.dismiss()}
                          textContentType="oneTimeCode"
                          renderCell={({ index, symbol, isFocused }) => (
                            <View key={index} style={style.cellRoot}>
                              <Text style={style.cellText}>
                                {symbol || (isFocused ? <Cursor /> : null)}
                              </Text>
                            </View>
                          )}
                        />
                        {this.state.groupStatus == 404 &&
                          <Text style={style.errorMessage}>{this.state.errorMessage}</Text>
                        }
                      </View>
                    }

                  </TouchableOpacity>
                </View>


                {/*------------add-university-and-work-data-------------*/}
                {this.state.isFromEdit &&
                  <View style={{
                    marginTop: 30,
                    marginLeft: 32,
                    marginRight: 32,
                    backgroundColor: '#FFFFFF',
                    borderRadius: 16,
                    borderColor: 'rgba(16, 130, 123, 0.2)',
                    borderWidth: 1,
                    shadowColor: "#000",
                    shadowOffset: {
                      width: 0,
                      height: 2,
                    },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                    elevation: 5,
                  }}>

                    {/*------------ Current Primary Occupation DropDown-------------*/}
                    <View style={{ paddingLeft: 16, paddingRight: 16, paddingTop: 16 }}>
                      <Text style={style.itemTitle}>occupational Status</Text>
                      <Dropdown
                        data={this.state.occupationData}
                        style={style.dropdown}
                        placeholderStyle={style.itemText}
                        selectedTextStyle={style.itemText}
                        maxHeight={150}
                        labelField="label"
                        valueField="value"
                        placeholder="Select Occupation"
                        value={this.state.occupation}
                        onChange={item => {
                          this.setState({
                            occupation: item.value,
                            programEditable: item.value == 'studying' ? true : false
                          });
                        }}
                      />
                    </View>

                    <View style={{ backgroundColor: 'rgba(16, 130, 123, 0.05)', marginTop: 8, paddingLeft: 16, paddingRight: 16, paddingBottom: 16 }}>
                      {this.state.occupation == 'studying' &&
                        <View style={{ marginTop: 20 }}>
                          <View>
                            <Text style={style.itemTitle}>Degree Attaining</Text>
                            <Dropdown
                              data={this.state.degreeData}
                              style={style.dropdown}
                              placeholderStyle={style.itemText}
                              selectedTextStyle={style.itemText}
                              maxHeight={350}
                              labelField="name"
                              valueField="id"
                              placeholder="Select Degree"
                              value={this.state.degree != null ? this.state.degree.id : null}
                              onChange={item => {
                                this.setState({
                                  degree: item
                                });
                              }}
                            />
                          </View>
                          <View style={{ marginTop: 20 }}>
                            <Text style={style.itemTitle}>Class of (graduation year)</Text>
                            <Dropdown
                              data={this.state.yearData}
                              style={style.dropdown}
                              placeholderStyle={style.itemText}
                              selectedTextStyle={style.itemText}
                              maxHeight={350}
                              labelField="name"
                              valueField="id"
                              placeholder="Select Year"
                              value={this.state.currentyear}
                              onChange={item => {
                                this.setState({
                                  currentyear: item.id
                                });
                              }}
                            />
                          </View>
                          <View style={{ marginTop: 20 }}>
                            <Text style={style.itemTitle}>Name of institution</Text>
                            <View>
                              <AutocompleteDropdown
                                clearOnFocus={false}
                                closeOnBlur={true}
                                closeOnSubmit={false}
                                showClear={false}
                                useFilter={false}
                                onSelectItem={item => {
                                  this.setState({
                                    institution: item,
                                    institutionSearch: item != null ? item.title : this.state.institution != null ? this.state.institution.title : this.state.institutionSearch
                                  })
                                }}
                                dataSet={this.state.institutionData}
                                suggestionsListMaxHeight={300}
                                emptyResultText="Start typing to select..."
                                style={[
                                  style.dropdown,
                                  { backgroundColor: 'transparent' }
                                ]}
                                onChangeText={(text) => {
                                  clearTimeout(serachCancel)
                                  serachCancel = setTimeout(() => {
                                    this.onSearchUniversities(text);
                                  }, 1000);
                                  this.setState({
                                    institutionSearch: text
                                  })
                                }}
                                inputContainerStyle={{
                                  backgroundColor: 'transparent',
                                  borderRadius: 0,
                                  paddingHorizontal: 0,
                                  marginLeft: -13,
                                  marginRight: -13
                                }}
                                textInputProps={{
                                  placeholder: 'Start typing to select...',
                                  placeholderTextColor: "gray",
                                  autoCorrect: false,
                                  autoCapitalize: 'none',
                                  value: this.state.institutionSearch,
                                  style: style.itemText
                                }}
                                inputHeight={50}
                              />
                            </View>
                          </View>
                          <View style={{ marginTop: 20 }}>
                            <Text style={style.itemTitle}>Name of program</Text>
                            <TextInput
                              value={this.state.program}
                              placeholder="Enter program name"
                              editable={this.state.programEditable}
                              placeholderTextColor="rgba(33, 44, 44, 0.7)"
                              style={[style.dropdown, style.itemText]}
                              onChangeText={(text) => this.setState({ program: text })}
                            />
                          </View>
                          <View style={{ marginTop: 20 }}>
                            <Text style={style.itemTitle}>What is your field of interest?</Text>
                            {/* <AutocompleteDropdown
                              clearOnFocus={false}
                              closeOnBlur={true}
                              closeOnSubmit={false}
                              showClear={false}
                              useFilter={false}
                              onSelectItem={item => {
                                // this.setState({
                                //   interestedField: item,
                                //   interestedFieldSearch: item != null ? item.title : this.state.interestedField != null ? this.state.institution.title : this.state.interestedFieldSearch
                                // })
                              }}
                              dataSet={this.state.institutionData}
                              suggestionsListMaxHeight={300}
                              emptyResultText="Start typing to select..."
                              style={[
                                style.dropdown,
                                { backgroundColor: 'transparent' }
                              ]}
                              onChangeText={(text) => {
                                clearTimeout(serachCancel)
                                serachCancel = setTimeout(() => {
                                  this.onInterestedField(text);
                                }, 1000);
                                this.setState({
                                  interestedFieldSearch: text
                                })
                              }}
                              inputContainerStyle={{
                                backgroundColor: 'transparent',
                                borderRadius: 0,
                                paddingHorizontal: 0,
                                marginLeft: -13,
                                marginRight: -13
                              }}
                              textInputProps={{
                                placeholder: 'Start typing to select...',
                                placeholderTextColor: "gray",
                                autoCorrect: false,
                                autoCapitalize: 'none',
                                value: this.state.interestedFieldSearch,
                                style: style.itemText
                              }}
                              inputHeight={50}
                            /> */}
                            <Dropdown
                              data={this.state.interestedFieldData}
                              style={style.dropdown}
                              placeholderStyle={style.itemText}
                              selectedTextStyle={style.itemText}
                              maxHeight={350}
                              labelField="name"
                              valueField="id"
                              placeholder="Select"
                              value={this.state.interestedField != null ? this.state.interestedField.id : null}
                              onChange={item => {
                                this.setState({
                                  interestedField: item
                                });
                                this.getInterestedJob(item.id)
                              }}
                            />
                          </View>
                          <View style={{ marginTop: 20 }}>
                            <Text style={style.itemTitle}>What job do you aspire to?</Text>
                            {/* <AutocompleteDropdown
                              clearOnFocus={false}
                              closeOnBlur={true}
                              closeOnSubmit={false}
                              showClear={false}
                              useFilter={false}
                              onSelectItem={item => {
                                // this.setState({
                                //   aspiredJob: item,
                                //   aspiredJobSearch: item != null ? item.title : this.state.aspiredJob != null ? this.state.institution.title : this.state.aspiredJobSearch
                                // })
                              }}
                              dataSet={this.state.aspiredJobData}
                              suggestionsListMaxHeight={300}
                              emptyResultText="Start typing to select..."
                              style={[
                                style.dropdown,
                                { backgroundColor: 'transparent' }
                              ]}
                              onChangeText={(text) => {
                                clearTimeout(serachCancel)
                                serachCancel = setTimeout(() => {
                                  this.onAspiredJobSearch(text);
                                }, 1000);
                                this.setState({
                                  aspiredJobSearch: text
                                })
                              }}
                              inputContainerStyle={{
                                backgroundColor: 'transparent',
                                borderRadius: 0,
                                paddingHorizontal: 0,
                                marginLeft: -13,
                                marginRight: -13
                              }}
                              textInputProps={{
                                placeholder: 'Start typing to select...',
                                placeholderTextColor: "gray",
                                autoCorrect: false,
                                autoCapitalize: 'none',
                                value: this.state.aspiredJobSearch,
                                style: style.itemText
                              }}
                              inputHeight={50}
                            /> */}
                            <Dropdown
                              data={this.state.aspiredJobData}
                              style={style.dropdown}
                              placeholderStyle={style.itemText}
                              selectedTextStyle={style.itemText}
                              maxHeight={350}
                              labelField="name"
                              valueField="id"
                              placeholder="Select"
                              value={this.state.aspiredJob != null ? this.state.aspiredJob.id : null}
                              onChange={item => {
                                this.setState({
                                  aspiredJob: item
                                });
                              }}
                            />
                          </View>

                          {this.state.aspiredJob?.name === 'Other' ||
                            this.state.aspiredJobText !== null ? <View style={{ marginTop: 20 }}>
                            <Text style={style.itemTitle}>Please Specify</Text>
                            <TextInput
                              value={this.state.aspiredJobText}
                              placeholder="Enter Job name"
                              placeholderTextColor="rgba(33, 44, 44, 0.7)"
                              style={[style.dropdown, style.itemText]}
                              onChangeText={(text) => this.setState({ aspiredJobText: text })}
                            />
                          </View> : null}
                        </View>
                      }
                      {this.state.occupation == 'working' &&
                        <View style={{ marginTop: 20, }}>
                          <View style={{
                            ...Platform.select({ ios: { zIndex: 1 } }),
                          }}>
                            <Text style={style.itemTitle}>Primary occupation</Text>
                            <AutocompleteDropdown
                              clearOnFocus={false}
                              closeOnBlur={true}
                              closeOnSubmit={false}
                              onSelectItem={item => {
                                this.setState({
                                  profession: item,
                                  professionSearch: item != null ? item.title : this.state.profession != null ? this.state.profession.title : this.state.professionSearch
                                })
                              }}
                              dataSet={this.state.professionData}
                              suggestionsListMaxHeight={300}
                              useFilter={false}
                              style={[style.dropdown, { backgroundColor: 'transparent' }]}
                              emptyResultText="Start typing to select..."
                              onChangeText={(text) => {
                                this.setState({
                                  professionSearch: text
                                })
                                clearTimeout(serachCancel)
                                serachCancel = setTimeout(() => {
                                  this.onOccupationsApi(text, null);
                                }, 1000);
                              }}
                              inputContainerStyle={{
                                backgroundColor: 'transparent',
                                borderRadius: 0,
                                paddingHorizontal: 0,
                                marginLeft: -13,
                                marginRight: -13
                              }}
                              textInputProps={{
                                placeholder: 'Start typing to select...',
                                value: this.state.professionSearch,
                                placeholderTextColor: "gray",
                                autoCorrect: false,
                                autoCapitalize: 'none',
                                style: style.itemText
                              }}
                            />
                          </View>
                          {this.state.groupStatus == 200 &&
                            <>
                              {this.state.groupData.designation == 'education' &&
                                <View style={{ marginTop: 20 }}>
                                  <Text style={style.itemTitle}>Association</Text>
                                  <Dropdown
                                    data={associationData}
                                    style={style.dropdown}
                                    placeholderStyle={style.itemText}
                                    selectedTextStyle={style.itemText}
                                    maxHeight={150}
                                    labelField="label"
                                    valueField="value"
                                    placeholder="Select Association"
                                    value={this.state.association}
                                    onChange={item => {
                                      let com = this.state.company;
                                      let companyEnable = this.state.companyTextEnable
                                      if (item.value == 'alumni') {
                                        com = '',
                                          companyEnable = true
                                      } else {
                                        companyEnable = false
                                        if (this.state.groupStatus == 200) {
                                          com = this.state.groupData.name
                                        }
                                      }
                                      this.setState({
                                        association: item.value,
                                        company: com,
                                        companyTextEnable: companyEnable
                                      });
                                    }}
                                  />
                                </View>
                              }
                            </>
                          }

                          <View style={{ marginTop: 20 }}>
                            <Text style={style.itemTitle}>Job Title</Text>
                            <TextInput
                              value={this.state.jobTitle}
                              placeholder="E.g. Manager"
                              placeholderTextColor="rgba(33, 44, 44, 0.7)"
                              style={[style.dropdown, style.itemText]}
                              onChangeText={(text) => this.setState({ jobTitle: text })}
                            />
                          </View>

                          <View style={{ marginTop: 20 }}>
                            <Text style={style.itemTitle}>COMPANY / INSTITUTION</Text>
                            <TextInput
                              value={this.state.company}
                              placeholder="E.g. Microsoft"
                              //editable={this.state.association == 'alumni' ? true :this.state.profileData.code == null ? true : false}
                              editable={this.state.companyTextEnable}
                              placeholderTextColor="rgba(33, 44, 44, 0.7)"
                              style={[style.dropdown, style.itemText]}
                              onChangeText={(text) => this.setState({ company: text })}
                            />
                          </View>
                          <View style={{ marginTop: 20 }}>
                            <Text style={style.itemTitle}>Degree Of Education Attained</Text>
                            <Dropdown
                              data={this.state.degreeData}
                              style={style.dropdown}
                              placeholderStyle={style.itemText}
                              selectedTextStyle={style.itemText}
                              maxHeight={350}
                              labelField="name"
                              valueField="id"
                              placeholder="Select Degree"
                              value={this.state.degree != null ? this.state.degree.id : null}
                              onChange={item => {
                                this.setState({
                                  degree: item
                                });
                              }}
                            />
                          </View>
                        </View>
                      }

                    </View>

                  </View>
                }

                {/*------------Next button-------------*/}
                <View style={{ marginTop: 30, paddingLeft: 32, paddingRight: 32, justifyContent: 'center', alignItems: 'center' }}>
                  {this.state.isFromEdit ?
                    <View style={{ flexDirection: 'row' }}>
                      <TouchableHighlight style={style.cancelButton} underlayColor='transparent' onPress={() => { this.onBackClick(); }}>
                        <Text style={{ color: "#1d2e2d", fontSize: 20, fontFamily: 'GoogleSans-Bold' }}>Cancel</Text>
                      </TouchableHighlight>
                      <TouchableHighlight style={style.updateButton} underlayColor='transparent' onPress={() => { this.fnGetFCMToken() }}>
                        <Text style={{ color: "#fff", fontSize: 20, fontFamily: 'GoogleSans-Bold' }}>Update</Text>
                      </TouchableHighlight>
                    </View>
                    :
                    <TouchableHighlight style={{ width: 80, height: 60, padding: 8, borderRadius: 5, backgroundColor: '#4ec5c1', alignItems: 'center', justifyContent: 'center' }} underlayColor='transparent' onPress={() => { this.onNextClick(); }}>
                      <Image style={{ width: circle_icon_size, height: circle_icon_size }} source={require('../img/next.png')} resizeMode="contain" />
                    </TouchableHighlight>
                  }
                </View>

              </View>
            </ScrollView>
          </KeyboardAvoidingView>

          <Modal
            animationType="fade"
            transparent={true}
            visible={this.state.isDelete}>

            <View style={{ flex: 1, backgroundColor: '#000000B3', justifyContent: 'center' }}>
              <View style={{
                alignSelf: 'center',
                backgroundColor: '#FFFFFF',
                width: '80%',
                shadowOpacity: 0.24,
                borderRadius: 8,
                paddingTop: 30,
                paddingBottom: 20,
                elevation: 4,
                shadowOffset: {
                  height: 4,
                  width: 2
                }
              }}>
                <Text style={{ marginTop: 20, textAlign: 'center', fontSize: 25, fontFamily: 'SFUIDisplay-Regular', fontWeight: '500' }}>{'Exit the ' + this.state.groupData.name + ' group?'}</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 30 }}>
                  <TouchableOpacity onPress={() => {
                    this.setState({ groupStatus: 999, isDelete: false, verificationCode: '', groupData: '' });
                    let that = this;
                    setTimeout(function () {
                      that.onSubmitClick();
                    }, 200);
                  }} style={{ flex: 1, padding: 8, alignItems: 'center', backgroundColor: '#4ec5c1', borderRadius: 6, marginLeft: 15, marginRight: 5 }}>
                    <Text style={style.modalButtonText}>Yes</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => this.setState({ isDelete: false })} style={{ flex: 1, padding: 8, alignItems: 'center', backgroundColor: '#f2473f', borderRadius: 6, marginLeft: 5, marginRight: 15 }}>
                    <Text style={style.modalButtonText}>No</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

          </Modal>

          <BlurModel
            onTouchOutside={() => this.setState({ isChangeProfile: false })}
            visible={this.state.isChangeProfile}>

            <View style={style.profilePickerContainer}>

              <View>
                <TouchableOpacity onPress={() => this.openImagePicker(true)} style={style.btnProfilePicker}>
                  <Text style={style.btnProfilePickerText}>Camera</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => this.openImagePicker(false)} style={style.btnProfilePicker}>
                  <Text style={style.btnProfilePickerText}>Choose from Gallery</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => this.setState({ isChangeProfile: false, profileAvatar: '', removeProfile: 1 })} style={style.btnProfilePicker}>
                  <Text style={[style.btnProfilePickerText, { color: '#F9543D' }]}>Remove Photo</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => this.setState({ isChangeProfile: false })} style={{ backgroundColor: '#FFFFFF', width: 56, height: 56, borderRadius: 56 / 2, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', top: 170 }}>
                  <Ionicons name="close" size={20} color="rgba(33, 44, 44, 0.7)" />
                </TouchableOpacity>
              </View>

            </View>

          </BlurModel>

        </View>
      </View>
    );
  }
}

const style = StyleSheet.create({
  titleText: {
    color: "#000000",
    fontSize: 22,
    fontWeight: '600',
    alignSelf: 'center',
    fontFamily: 'SFUIDisplay-SemiBold',
    lineHeight: 22,
  },
  itemTitle: {
    fontFamily: 'SFUIDisplay-Bold',
    fontWeight: '700',
    color: '#212C2C',
    letterSpacing: 0.05,
    textTransform: 'uppercase',
    fontSize: 12,
    lineHeight: 22
  },
  dropdown: {
    height: 44,
    borderBottomWidth: 1,
    borderColor: 'rgba(33, 44, 44, 0.15)'
  },
  itemText: {
    fontFamily: 'SFUIDisplay-Regular',
    fontSize: 18,
    fontWeight: '400',
    lineHeight: 24,
    color: 'rgba(33, 44, 44, 0.7)'
  },
  codeFieldRoot: {
    marginTop: 20,
    width: '90%',
    marginLeft: 'auto',
    marginRight: 'auto',
    alignSelf: 'center'
  },
  cellRoot: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    marginLeft: 'auto',
    marginRight: 'auto',
    flexDirection: 'row',
  },
  cellText: {
    color: '#000',
    fontSize: 30,
    textAlign: 'center'
  },
  focusCell: {
    borderBottomColor: '#007AFF',
    borderBottomWidth: 2,
  },
  separator: {
    height: 2,
    width: 10,
    backgroundColor: '#000',
    alignSelf: 'center',
  },
  errorMessage: {
    color: '#f01212',
    fontSize: 16,
    alignSelf: 'center',
    marginTop: 20,
    fontFamily: 'SFUIDisplay-Regular'
  },
  logoImage: {
    width: 50,
    height: 50,
    borderRadius: 18,
  },
  groupName: {
    flex: 1,
    color: '#000000',
    fontSize: 18,
    fontFamily: 'SFUIDisplay-Regular',
    alignSelf: 'center',
    marginLeft: 10
  },
  modalButtonText: {
    fontSize: 18,
    fontFamily: 'SFUIDisplay-Regular',
    color: '#FFFFFF',
    padding: 2
  },
  cameraButton: {
    width: 40,
    height: 40,
    marginLeft: 87,
    marginTop: -(20 + 10)
  },
  cancelButton: {
    width: 120,
    height: 50,
    padding: 8,
    borderRadius: 5,
    backgroundColor: '#f1f4f4',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
    marginRight: 10
  },
  updateButton: {
    width: 120,
    height: 50,
    padding: 8,
    borderRadius: 5,
    backgroundColor: '#4ec5c1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginLeft: 10
  },
  profilePickerContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  btnProfilePicker: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginTop: 8,
    marginLeft: 24,
    marginRight: 24,
    alignItems: 'center',
    padding: 10
  },
  btnProfilePickerText: {
    fontFamily: 'SFUIDisplay-Regular',
    fontSize: 18,
    color: '#000000',
    padding: 10
  },
  searchTextInput: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#DDDDDD',
    paddingHorizontal: 8,
    marginBottom: 8,
    margin: 6,
    height: 45,
  },
  autocompleteContainer: {
    flex: 1,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 1
  }
});
