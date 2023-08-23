import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Dimensions,
  Alert,
  Linking,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  View,
  Image,
  TouchableHighlight,
  ScrollView,
  StatusBar,
  Keyboard,
  Clipboard,
  RefreshControl,
  KeyboardAvoidingView,
} from 'react-native';
import { Navigation } from 'react-native-navigation';
import Modal from "react-native-modal";
import DeviceInfo from 'react-native-device-info';
import * as Unicons from '@iconscout/react-native-unicons';
import SpinnerLoading from '../constant/spinnerLoading'
const CONST = require('../constant/const');
import Api from '../Api/Api';
import { registerAppListener } from "../constant/listeners";
import Share, { ShareSheet, Button } from 'react-native-share';
import Toast, { BaseToast } from 'react-native-toast-message';
import TalentPointView from '../constant/talentPointView';
import { openInbox } from 'react-native-email-link'
var width, height;
var deleteId = '';
var session;
var currentLinkID = null;
var isMessagesAvailable = false;
var isMailAvailable = false;
var isWhatsappAvailable = false;
var isOutLookAvailable = false;
var currentLinkData = {};
let shareLink = "";
let shareName = "";

const toasConfig = {
  info: (props) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: '#87CEFA' }}
      text1NumberOfLines={4}
    />
  )
}

export default class getFeedback extends Component {
  static options(passProps) {
    return {
      topBar: {
        drawBehind: true,
        visible: false,
        animate: false
      },
      sideMenu: {
        left: {
          // height:50,
          // visible: false, // hide drwaer from showing first when this screen is loaded
          enabled: false, // hide drawer for this screen
        }
      }
    };
  }

  constructor(props) {
    super(props);
    StatusBar.setBarStyle('dark-content', true);
    height = Dimensions.get('window').height;
    width = Dimensions.get('window').width;
    this.state = {
      keyboardOffset: 0,
      feedbackPerson: '',
      topbarTopMargin: 0,
      postRequestData: [],
      isModalVisible: false,
      isRequestStatusModal: false,
      isLoading: false,
    }
    session = this;
  }
  componentDidMount() {
    registerAppListener(this.props.navigator, this.props.componentId);
    this.setState({ topbarTopMargin: CONST.checkIphoneX() });
    // get past request data
    this.getPastRequestApi(true);

    const operator = Platform.select({ ios: '&', android: '?' });

    Linking.canOpenURL(`sms:${operator}&addresses=null&body=${""}`).then(supported => {
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
    Linking.canOpenURL('ms-outlook://emails/inbox').then(supported => {
      console.log('outlook supported: ', supported);
      if (supported) {
        isOutLookAvailable = true;
      }
    });

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

  }

  _keyboardWillShow(event) {
    //console.log('_keyboardWillShow');
    this.setState({
      keyboardOffset: Platform.OS === 'android' ? 0 : 0,
    });
  }

  keyboardWillHide() {
    //console.log('keyboardWillHide');
    this.setState({
      keyboardOffset: 0,
    });
  }

  getPastRequestApi(showLoader) {
    this.setState({
      isLoading: showLoader
    });
    Api.getPastRequest(this, DeviceInfo.getUniqueId(), function (parent, data) {
      parent.setState({
        isLoading: false
      });
      console.log('Api.getPastRequest: ', data);
      parent.setState({ postRequestData: data.data });
    });
  }

  onBackClick = () => {
    console.log('--------------------------------------------> onBackClick');
    Navigation.pop(this.props.componentId);
  }

  checkForNameExist() {
    var foundName = false;
    // loop for checking name of user from whom you want to get feedback is exist in list data or not start
    for (var i = 0; i < this.state.postRequestData.length; i++) {
      if (this.state.postRequestData[i].provider_name == this.state.feedbackPerson) {
        foundName = true;
        break;
      }
    }
    // loop for checking name of user from whom you want to get feedback is exist in list data or not end
    return foundName;
  }

  openShareSheet = () => {

    deleteId = currentLinkID;
    session.setState({
      //isLoading: true,
      isShareSheetVisible: true
    });
  }

  generateNewFeedbackLink(type) {
    Keyboard.dismiss();
    // generate a new link if user not exist
    if (this.checkForNameExist()) {
      Alert.alert(CONST.appName, "Feedback request for " + this.state.feedbackPerson + " already exists.  Please edit the name or delete prior feedback request in Home screen first.")
    } else {
      this.setState({
        isLoading: true
      });
      Api.getFeedbackUniqueUrl(this, this.state.feedbackPerson, DeviceInfo.getUniqueId(), function (parent, data) {
        parent.setState({
          isLoading: false
        });
        if (data.error == '1') {
        } else {
          shareLink = data.data.url
          parent.onShareClick(type);

          session.getPastRequestApi(false);
          session.setState({
            feedbackPerson: ''
          });
        }
      });
    }
  }

  onResendRequestClick(id) {

    this.setState({
      isLoading: true,
    });

    Api.resendPastRequest(this, id, DeviceInfo.getUniqueId(), function (parent, data) {
      parent.setState({
        isLoading: false
      });

      if (data.status == 200) {
        shareLink = data.data.url

        setTimeout(function () {
          session.setState({
            isShareSheetVisible: true
          });
        }, 500);
      }
      return;
    });
  }

  onDeleteRequestClick(id) {
    // on delete past request
    deleteId = id;
    this.setState({ isModalVisible: true });
  }

  onShareClick(type) {
    this.setState({
      isShareSheetVisible: false
    })
    Keyboard.dismiss()
    if (this.state.feedbackPerson != '') {
      shareName = " " + this.state.feedbackPerson
    }
    let message = `Hi${shareName},\nWould you give me some talent points and help me identify what I am good at? It takes only a couple of minutes. \n\nPlease visit the following link: ${shareLink}\n\nThank you!`;
    let options = {
      title: CONST.appName,
      social: type == 'whatsapp' ? Share.Social.WHATSAPP : type == 'messages' ? Share.Social.SMS : null,
    }
    if (type == "gmail") {
      if (Platform.OS === 'android') {
        options.message = message
        options.social = Share.Social.EMAIL
        setTimeout(() => {
          Share.shareSingle(options);
        }, 300);
      }
      else {
        let gmailURL = 'mailto:?subject=&body=' + message;
        Linking.openURL(gmailURL);
      }
    } else if (type == 'copylink') {
      Clipboard.setString(message);
      Toast.show({
        type: 'info',
        position: 'bottom',
        visibilityTime: 3000,
        text1: 'Points request has been copied. Paste the request it into the communication app of choice.'
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
    else if (type == 'ms-outlook') {
      const operator = Platform.select({ ios: '&', android: '?' });
      Linking.openURL('ms-outlook://compose?to=&subject=&body=' + message);
    }
  }

  untrackRequestApi() {
    this.setState({
      isLoading: true
    });
    // delete past request data
    Api.untrackPastRequest(this, deleteId, DeviceInfo.getUniqueId(), function (parent, data) {
      console.log('untrackPastRequest: ', data);

      if (data.error == '1') {

      } else {
        // loop for removing past request from array after successful response start
        console.log('parent.state.postRequestData: ', parent.state.postRequestData);
        for (var i = 0; i < parent.state.postRequestData.length; i++) {
          if (parent.state.postRequestData[i].id == deleteId) {
            parent.state.postRequestData.splice(i, 1);
          }
          parent.setState({ done: true });
        }
        deleteId = '';
        // loop for removing past request from array after successful response end
      }

      parent.setState({
        isLoading: false
      });

    });
  }

  deleteApi(isFromPopup) {

    if (!isFromPopup) {
      this.setState({
        isLoading: true
      });
    }

    Api.deletePastRequest(this, deleteId, DeviceInfo.getUniqueId(), function (parent, data) {

      console.log('deletePastRequest response: ', data);

      //if(!isFromPopup){
      parent.setState({
        isLoading: false
      });
      //}

      if (data.error == '1') {

      } else {
        // loop for removing past request from array after successful response start
        console.log('parent.state.postRequestData: ', parent.state.postRequestData);
        for (var i = 0; i < parent.state.postRequestData.length; i++) {
          if (parent.state.postRequestData[i].id == deleteId) {
            parent.state.postRequestData.splice(i, 1);
          }
          parent.setState({ done: true });
        }
        // loop for removing past request from array after successful response end
      }
    });
  }

  onCancelRequestClick(data) {

    console.log('status: ', data.status);

    this.setState({
      isLoading: true,
      isRequestStatusModal: false
    });

    deleteId = data.id;
    console.log('Completed: ', data.status);

    if (data.status == 'Completed') {
      this.untrackRequestApi();
    }
    else {
      this.deleteApi(true);
      return;
    }
  }

  onAcceptPopup() {
    this.setState({ isModalVisible: false })
    setTimeout(function () {
      session.deleteApi(false);
    }, 1000);
  }

  onCancelPopup() {
    this.setState({ isModalVisible: false })
  }

  _renderStatusModalContent = () => (
    <View style={{ width: width - 30, height: 150, backgroundColor: "white", justifyContent: 'center', alignItems: "center", borderRadius: 4, borderColor: "rgba(0, 0, 0, 0.1)" }}>
      <View style={{ flex: 0.5, justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent' }}>
        <Text style={{ color: "#000", fontSize: 20, padding: 8, justifyContent: 'center', alignItems: 'center', fontFamily: 'SFUIDisplay-Bold' }}>Cancel request and delete from request tracker?</Text>
      </View>
      <View style={{ flex: 0.5, width: width - 50, height: 50, justifyContent: 'center', backgroundColor: 'transparent' }}>
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <TouchableHighlight style={{ flex: 0.5, borderRadius: 3, alignSelf: 'center', backgroundColor: '#4ec5c1', alignItems: 'center', borderRadius: 3, marginRight: 4 }} underlayColor='transparent' onPress={() => { this.onCancelRequestClick(currentLinkData); }}>
            <Text style={{ padding: 12, textAlign: 'center', fontSize: 18, color: 'white', fontFamily: 'SFUIDisplay-Bold' }} >Yes</Text>
          </TouchableHighlight>
          <TouchableHighlight style={{ flex: 0.5, borderRadius: 3, alignSelf: 'center', backgroundColor: '#ec576b', alignItems: 'center', borderRadius: 3, marginLeft: 4 }} underlayColor='transparent' onPress={() => { this.setState({ isRequestStatusModal: false }) }}>
            <Text style={{ padding: 12, textAlign: 'center', fontSize: 18, color: 'white', fontFamily: 'SFUIDisplay-Bold' }} >No</Text>
          </TouchableHighlight>
        </View>
      </View>
    </View>
  );

  _renderModalContent = () => (
    <View style={{ width: width - 30, height: 150, backgroundColor: "white", justifyContent: 'center', alignItems: "center", borderRadius: 4, borderColor: "rgba(0, 0, 0, 0.1)" }}>
      <View style={{ flex: 0.5, justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent' }}>
        <Text style={{ color: "#000", fontSize: 20, padding: 8, justifyContent: 'center', alignItems: 'center', fontFamily: 'SFUIDisplay-Bold' }}>Delete from request tracker?</Text>
      </View>
      <View style={{ flex: 0.5, width: width - 50, height: 50, justifyContent: 'center', backgroundColor: 'transparent' }}>
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <TouchableHighlight style={{ flex: 0.5, borderRadius: 3, alignSelf: 'center', backgroundColor: '#4ec5c1', alignItems: 'center', borderRadius: 3, marginRight: 4 }} underlayColor='transparent' onPress={() => { this.onAcceptPopup(); }}>
            <Text style={{ padding: 12, textAlign: 'center', fontSize: 18, color: 'white', fontFamily: 'SFUIDisplay-Bold' }} >Yes</Text>
          </TouchableHighlight>
          <TouchableHighlight style={{ flex: 0.5, borderRadius: 3, alignSelf: 'center', backgroundColor: '#ec576b', alignItems: 'center', borderRadius: 3, marginLeft: 4 }} underlayColor='transparent' onPress={() => { this.onCancelPopup(); }}>
            <Text style={{ padding: 12, textAlign: 'center', fontSize: 18, color: 'white', fontFamily: 'SFUIDisplay-Bold' }} >No</Text>
          </TouchableHighlight>
        </View>
      </View>
    </View>
  );

  _renderItem = ({ item: rowData, index }) => {
    var dateArr = rowData.date_sent.split('-');

    return (
      <TalentPointView
        rowData={rowData}
        onClear={() => { rowData; this.onCancelRequestClick(rowData); }}
        onDelete={() => { currentLinkData = rowData; this.setState({ isRequestStatusModal: true }); }}
        onResend={() => {
          shareName = rowData.provider_name != "(Name not provided)" ? " " + rowData.provider_name : ""
          this.onResendRequestClick(rowData.id);
        }}
      />

    )
  }

  render() {
    return (
      <View style={{ height: height, top: this.state.keyboardOffset }}>
        <View style={{ flex: 1, backgroundColor: '#fff', marginTop: DeviceInfo.hasNotch() ? 25 : 0 }}>
          <SpinnerLoading visible={this.state.isLoading} />
          {/*--------header--------*/}
          <View style={{ marginTop: this.state.topbarTopMargin, height: CONST.headerHeight, backgroundColor: CONST.headerBackColor, flexDirection: 'row', paddingLeft: 16, paddingRight: 16 }}>
            {/*left*/}
            <TouchableOpacity style={{ flex: 0.1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent', opacity: 0.5 }} underlayColor='transparent' onPress={this.onBackClick}>
              <Unicons.UilArrowLeft size={30} color="#000000" />
            </TouchableOpacity>
            {/*center*/}
            <View style={{ flex: 0.8, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent', opacity: 0.7 }}>
              <Text style={styles.titleText}>Request talent points</Text>
            </View>
            {/*right*/}
            <View style={{ flex: 0.1 }} />
          </View>
          {/*--------divider--------*/}
          <View style={{ backgroundColor: 'rgba(0, 0, 0, 0.15)', height: 1 }} />

          <KeyboardAvoidingView
            style={{ flex: 1 }}
            enabled
            behavior={(Platform.OS === 'ios') ? "padding" : null}>
            <ScrollView showsVerticalScrollIndicator={false} refreshControl={
              <RefreshControl
                refreshing={false}
                onRefresh={() => this.getPastRequestApi(true)}
              />
            }>
              <View>
                {/*--------sub - title--------*/}
                <View style={{ paddingLeft: 16, paddingRight: 16, marginTop: 30 }}>
                  <Text style={styles.subTitleText}>Request points from</Text>
                  <TextInput
                    ref='FeedbackPersonInput'
                    style={styles.inputName}
                    returnKeyType="done"
                    onSubmitEditing={Keyboard.dismiss}
                    placeholderTextColor="rgba(33, 44, 44, 0.7)"
                    placeholder={'Enter name to track response status (OPTIONAL)'}
                    onChangeText={(feedbackPerson) => this.setState({ feedbackPerson })}
                    value={this.state.feedbackPerson}
                  />

                  <View style={{ marginTop: 30, backgroundColor: 'transparent' }}>
                    <Text style={styles.subTitleText}>Send request with</Text>

                    <TouchableOpacity onPress={() => {
                      if (isWhatsappAvailable) {
                        this.generateNewFeedbackLink('whatsapp');
                      } else {
                        Toast.show({
                          type: 'error',
                          position: 'bottom',
                          text1: "WhatsApp is not installed on the device."
                        })
                      }
                    }} style={styles.shareContainer}>
                      <Image source={require('../img/whatsapp.png')} resizeMode="contain" style={{ width: 24, height: 24 }} />
                      <Text style={styles.shareTextItem}>WhatsApp</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => {
                      if (isMessagesAvailable) {
                        this.generateNewFeedbackLink('messages')
                      } else {
                        Toast.show({
                          type: 'error',
                          position: 'bottom',
                          text1: "Messages is not installed on the device."
                        });
                      }
                    }} style={styles.shareContainer}>
                      <Image source={require('../img/messages.png')} resizeMode="contain" style={{ width: 24, height: 24 }} />
                      <Text style={styles.shareTextItem}>Messages</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => {
                      if (isMailAvailable) {
                        this.generateNewFeedbackLink('gmail');
                      } else {
                        Toast.show({
                          type: 'error',
                          position: 'bottom',
                          text1: "Gmail is not installed on the device."
                        });
                      }
                    }} style={[styles.shareContainer]}>
                      <Image source={require('../img/gmail.png')} resizeMode="contain" style={{ width: 24, height: 24 }} />
                      <Text style={styles.shareTextItem}>Email (default)</Text>
                    </TouchableOpacity>

                    {isOutLookAvailable ? <TouchableOpacity onPress={() => {
                      if (isOutLookAvailable) {
                        // Linking.openURL('ms-outlook://');
                        this.generateNewFeedbackLink('ms-outlook');
                      } else {
                        Toast.show({
                          type: 'error',
                          position: 'bottom',
                          text1: "Microsoft Outlook is not installed on the device."
                        });
                      }
                    }} style={[styles.shareContainer]}>
                      <Image source={require('../img/outlook.png')} resizeMode="contain" style={{ width: 24, height: 24 }} />
                      <Text style={styles.shareTextItem}>Microsoft Outlook</Text>
                    </TouchableOpacity> : null}

                    <TouchableOpacity onPress={() => this.generateNewFeedbackLink('copylink')} style={styles.shareContainer}>
                      <View style={{ opacity: 0.65 }}>
                        <Unicons.UilCopy size="24" color="#000000" />
                      </View>
                      <Text style={styles.shareTextItem}>Copy Link</Text>
                    </TouchableOpacity>

                  </View>

                </View>
                {/*--------past request--------*/}

                {this.state.postRequestData.length > 0 &&
                  <View style={{ backgroundColor: 'transparent', paddingLeft: 16, paddingRight: 16, marginTop: 30, marginBottom: 50 }}>
                    <Text style={styles.subTitleText}>Past requests</Text>
                    <FlatList
                      style={{ marginTop: 8 }}
                      data={this.state.postRequestData}
                      extraData={this.state}
                      keyExtractor={(item, index) => index.toString()}
                      renderItem={this._renderItem}
                    />
                  </View>
                }
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
          <Toast config={toasConfig} />

          {/*-----------modal---------*/}
          <Modal animationIn={'fadeInDown'} animationOut={'fadeOutDown'} useNativeDriver={true}
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }} isVisible={this.state.isModalVisible}>
            {this._renderModalContent()}
          </Modal>
          {/*-----------status modal---------*/}
          <Modal animationIn={'fadeInDown'} animationOut={'fadeOutDown'} useNativeDriver={true}
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }} isVisible={this.state.isRequestStatusModal}>
            {this._renderStatusModalContent()}
          </Modal>
        </View>

        {/*-----------ShareSheet for link---------*/}
        <ShareSheet visible={this.state.isShareSheetVisible} onCancel={() => this.setState({ isShareSheetVisible: false })}>

          <View style={{ width: '100%', alignItems: 'center', marginTop: 10 }}>
            <Text style={{ color: "#000000", fontSize: 20, fontFamily: 'GoogleSans-Bold' }}>Share Link</Text>
          </View>

          <View style={{ width: '100%', height: 20 }} />

          {isWhatsappAvailable &&
            <Button buttonStyle={{ alignItems: 'center' }} iconSrc={{ uri: CONST.WHATSAPP_ICON }}
              onPress={() => { this.onShareClick('whatsapp') }}>Whatsapp</Button>
          }
          {isMessagesAvailable &&
            <Button buttonStyle={{ alignItems: 'center' }} iconSrc={{ uri: Platform.OS === 'android' ? CONST.MESSAGES_ICON : CONST.IMESSAGE_ICON }}
              onPress={() => { this.onShareClick('messages') }}>Messages</Button>
          }
          {isMailAvailable &&
            <Button buttonStyle={{ alignItems: 'center' }} iconSrc={{ uri: CONST.EMAIL_ICON }}
              onPress={() => { this.onShareClick('gmail') }}>Gmail</Button>
          }
          {isOutLookAvailable &&
            <Button buttonStyle={{ alignItems: 'center' }} iconSrc={{ uri: CONST.MS_OUTLOOK_ICON }}
              onPress={() => { this.onShareClick('ms-outlook') }}>Microsoft Outlook</Button>
          }

          <Button buttonStyle={{ alignItems: 'center' }} iconSrc={{ uri: CONST.COPY_ICON }}
            onPress={() => { this.onShareClick('copylink') }}>Copy Link</Button>

          <View style={{ width: '100%', height: 20 }} />
        </ShareSheet>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  titleText: {
    color: "#000000",
    fontSize: 22,
    fontWeight: '600',
    alignSelf: 'center',
    fontFamily: 'SFUIDisplay-SemiBold',
    lineHeight: 22,
  },
  subTitleText: {
    color: "#212C2C",
    fontSize: 20,
    lineHeight: 22,
    letterSpacing: 0.5,
    fontWeight: '700',
    fontFamily: 'SFUIDisplay-Bold'
  },
  inputName: {
    height: 40,
    color: '#000000',
    borderBottomWidth: 1,
    borderColor: 'rgba(33, 44, 44, 0.15)',
    marginTop: 10,
    fontSize: 16,
    lineHeight: 22,
    fontFamily: 'SFUIDisplay-Regular'
  },
  shareContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    borderColor: 'rgba(33, 44, 44, 0.15)',
    borderBottomWidth: 1,
    paddingTop: 16,
    paddingBottom: 16
  },
  shareTextItem: {
    marginLeft: 11,
    fontFamily: 'SFUIDisplay-SemiBold',
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 22,
    color: 'rgba(33, 44, 44, 0.7)'
  }
});
