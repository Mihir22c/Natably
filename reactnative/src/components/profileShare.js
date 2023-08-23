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
  KeyboardAvoidingView,
  TouchableOpacity,
  View,
  Image,
  TouchableHighlight,
  StatusBar,
  Keyboard,
  LayoutAnimation,
  Clipboard
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Navigation } from 'react-native-navigation';
import Modal from "react-native-modal";
import DeviceInfo from 'react-native-device-info';
import SpinnerLoading from '../constant/spinnerLoading'
const CONST = require('../constant/const');
import Api from '../Api/Api';
import { registerKilledListener, registerAppListener } from "../constant/listeners";
import Share, {ShareSheet, Button} from 'react-native-share';
import Swipeout from 'react-native-swipeout';
import ProfileShareItem from '../constant/profileShareItem';

var width,height;
var deleteId = '';
var session;
var generateFeedbackClick = false;
var resendClick = false;
var generateLinkClick = false;
var uniqueFeedbackLink = '';
var currentLinkID = null;
var isMessagesAvailable = false;
var isMailAvailable = false;
var isWhatsappAvailable = false;
var shareOptions = {};
var currentLinkData = {};

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

  constructor(props){
    super(props);
    StatusBar.setBarStyle('dark-content', true);
    height = Dimensions.get('window').height;
    width = Dimensions.get('window').width;
    this.state={
      keyboardOffset: 0,
      feedbackPerson : '',
      topbarTopMargin:0,
      profileShareList:[],
      isModalVisible:false,
      generateLinkBtnText:'Send',
      isGenerateLinkClicked:false,
      isLinkModalVisible:false,
      isRequestStatusModal: false,
      isLoading: false,
    }
    session = this;
  }
  componentDidMount() {
    registerAppListener(this.props.navigator,this.props.componentId);
    this.setState({topbarTopMargin: CONST.checkIphoneX()});
    // get past request data
    this.getProfileShareApi(true);

    const operator = Platform.select({ios: '&', android: '?'});

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

    this._keyboardWillShow = this._keyboardWillShow.bind(this);
    this.keyboardWillHide = this.keyboardWillHide.bind(this);

    this.keyboardWillShowListener = Keyboard.addListener(
        Platform.OS==='android' ? 'keyboardDidShow' : 'keyboardWillShow',
        this._keyboardWillShow,
    );
    this.keyboardWillHideListener = Keyboard.addListener(
        Platform.OS==='android' ? 'keyboardDidHide' : 'keyboardWillHide',
        this.keyboardWillHide,
    );

  }

  _keyboardWillShow(event) {
      console.log('_keyboardWillShow');
      this.setState({
          keyboardOffset: Platform.OS==='android' ? 0 : 0,
      });

      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
  }

  keyboardWillHide() {
      console.log('keyboardWillHide');
      this.setState({
          keyboardOffset: 0,
      });

      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
  }

  getProfileShareApi(showLoader){
    this.setState({
      isLoading: showLoader
    });
    Api.getShareProfile(this, DeviceInfo.getUniqueId(), function(parent, data){
      parent.setState({
        isLoading: false
      });
        console.log('Api.getShareProfile: ', data);
        parent.setState({profileShareList : data.data});
    });
  }

  onBackClick = () => {
    console.log('--------------------------------------------> onBackClick');
    Navigation.pop(this.props.componentId);
  }

  checkForNameExist(){
    var foundName = false;
    // loop for checking name of user from whom you want to get feedback is exist in list data or not start
    for(var i = 0 ; i < this.state.profileShareList.length ; i++){
      if(this.state.profileShareList[i].recipient_name == this.state.feedbackPerson){
        foundName = true;
        break;
      }
    }
    // loop for checking name of user from whom you want to get feedback is exist in list data or not end
    return foundName;
  }

  onCancelShareSheet() {

      // if(this.state.isGenerateLinkClicked){
      //     session.setState({ isShareSheetVisible: false});
      // }
      // else{
      //     session.setState({isShareSheetVisible: false});
      // }
      session.setState({
        isLinkModalVisible: true,
        isShareSheetVisible: false
      })
  }

  openShareSheet = () => {

      deleteId = currentLinkID;

      shareOptions = {
        title: CONST.appName,
        url: uniqueFeedbackLink,
      };
      session.setState({
        //isLoading: true,
        isShareSheetVisible: true
      });
      return;
  }


  onProfileShareClick(){
    Keyboard.dismiss();

    if(this.checkForNameExist()){
      Alert.alert(CONST.appName, "Profile has already been shared with "+this.state.feedbackPerson+". Please edit the name or delete prior share first.")
    }else{

    this.setState({
      isLoading: true,
    });

      Api.setProfileShare(this, DeviceInfo.getUniqueId(), this.state.feedbackPerson, function(parent, data){
        parent.setState({
          isLoading: false,
          // feedbackPerson: ''
        });
          console.log('Api.setShareProfile: ', data);
          if(data.error == '1'){
          }else{
            uniqueFeedbackLink = `Hello ${parent.state.feedbackPerson},\nI am sharing my career development profile with you. It provides an overview of my progress on talents, skills, and jobs. It also shows suggestions from my coaching sessions.

            To view, follow this link:\n${data.data.url}\nThank you!`;
            console.log('uniqueFeedbackLink: ', uniqueFeedbackLink);
            currentLinkID = data.data.id;
            //session.getPastRequestApi();
            session.openShareSheet();
            session.setState({isGenerateLinkClicked: true});
            session.getProfileShareApi(false);
          }

          //parent.setState({profileShareList : data.data});
      });
    }
  }

  // generateNewFeedbackLink(){
  //   Keyboard.dismiss();
  //   // generate a new link if user not exist
  //   if(this.checkForNameExist()){
  //     Alert.alert(CONST.appName,"Feedback request for "+this.state.feedbackPerson+" already exists.  Please edit the name or delete prior feedback request in Home screen first.")
  //   }else{
  //     this.setState({
  //       isLoading: true
  //     });
  //     Api.getFeedbackUniqueUrl(this, this.state.feedbackPerson, DeviceInfo.getUniqueId(), function(parent, data){
  //       parent.setState({
  //         isLoading: false
  //       });
  //         if(data.error == '1'){
  //         }else{
  //           uniqueFeedbackLink = data.data.url;
  //           console.log('uniqueFeedbackLink: ', uniqueFeedbackLink);
  //           currentLinkID = data.data.id;
  //           //session.getPastRequestApi();
  //           session.openShareSheet();
  //           session.setState({isGenerateLinkClicked:true});
  //         }
  //     });
  //   }
  // }

  onSendAnotherRequest(){
    // open modal for send another request of link
    //this.state.feedbackPerson = '';
    session.setState({isLinkModalVisible:false, feedbackPerson: ''});
    var that = this;
    setTimeout(function(){
      that.refs.FeedbackPersonInput.focus();
    }, 500);
  }

  onGotoHome(){

      console.log('this.props.componentId: ', this.props.componentId);

    if(this.props.previousScreen == 'responses'){
        session.setState({isLinkModalVisible:false});

        Navigation.push(this.props.componentId, {
          component: {
            id: CONST.HomeScreen,
            name: CONST.HomeScreen,
          }
        });
    }
    else{
        session.setState({isLinkModalVisible:false});
        Navigation.pop(this.props.componentId);
    }

  }

  _renderLinkModalContent(){

    var mainWidth = width;
    return(
      <View style={{width:mainWidth,height:180,backgroundColor: "white",justifyContent:'center',alignItems: "center", borderRadius: 4, borderColor: "rgba(0, 0, 0, 0.1)"}}>

          <View style={{marginTop:32,marginBottom:32,marginLeft:4,marginRight:4, width: '100%', paddingLeft: 15, paddingRight: 15}}>
            <TouchableHighlight style={{justifyContent:'center', width: '100%', alignItems:'center',borderRadius:5,borderColor:'#4ec5c1',backgroundColor:'#4ec5c1',borderWidth:1,paddingTop:8,paddingBottom:8, paddingLeft: 5, paddingRight: 5}} underlayColor='transparent' onPress={() => { this.onSendAnotherRequest(); }}>
                   <Text style={{color: "#fff",fontSize:20,fontFamily:'GoogleSans-Bold'}}>Share profile with someone else</Text>
            </TouchableHighlight>
            <TouchableHighlight style={{justifyContent:'center', width: '100%', alignItems:'center',borderRadius:5,borderColor:'#4ec5c1',backgroundColor:'#4ec5c1',borderWidth:1,paddingTop:8,paddingBottom:8,marginTop:10}} underlayColor='transparent' onPress={() => { this.onGotoHome(); }}>
                 <Text style={{color: "#fff",fontSize:20,fontFamily:'GoogleSans-Bold'}}>Home</Text>
            </TouchableHighlight>
          </View>

      </View>
    );
  }

  onDeleteRequestClick(id){
    // on delete past request
    deleteId = id;
    this.setState({isModalVisible: true});
  }

  untrackRequestApi(){
    this.setState({
      isLoading: true
    });
    // delete past request data
    Api.untrackPastRequest(this, deleteId, DeviceInfo.getUniqueId(), function(parent, data){
        console.log('untrackPastRequest: ', data);

        if(data.error == '1'){

        }else{
          // loop for removing past request from array after successful response start
          console.log('parent.state.profileShareList: ', parent.state.profileShareList);
            for(var i = 0 ; i < parent.state.profileShareList.length ; i++){
              if(parent.state.profileShareList[i].id == deleteId){
                  parent.state.profileShareList.splice(i, 1);
              }
              parent.setState({done: true});
            }
            deleteId = '';
            // loop for removing past request from array after successful response end
        }

        parent.setState({
            isLoading: false
        });

      });
  }

  deleteApi(isFromPopup){

        if(!isFromPopup){
              this.setState({
                isLoading: true
              });
        }

        Api.deleteProfileShare(this, DeviceInfo.getUniqueId(), deleteId, function(parent, data){
          console.log('DeleteShareProfile response: ', data);
          parent.setState({
            isLoading: false
          })
          if(data.error == '1'){

          }else {
            parent.getProfileShareApi(true);
          }
        });

        // Api.deletePastRequest(this, deleteId, DeviceInfo.getUniqueId(), function(parent, data){
        //
        //     console.log('deletePastRequest response: ', data);
        //
        //     //if(!isFromPopup){
        //         parent.setState({
        //           isLoading: false
        //         });
        //     //}
        //
        //     if(data.error == '1'){
        //
        //     }else{
        //       // loop for removing past request from array after successful response start
        //       console.log('parent.state.profileShareList: ', parent.state.profileShareList);
        //         for(var i = 0 ; i < parent.state.profileShareList.length ; i++){
        //           if(parent.state.profileShareList[i].id == deleteId){
        //               parent.state.profileShareList.splice(i, 1);
        //           }
        //           parent.setState({done: true});
        //         }
        //         // loop for removing past request from array after successful response end
        //     }
        // });
  }

  onCancelReqPopup(){

    this.setState({isLinkModalVisible: true});

    this.deleteApi(true);
  }

  onAcceptReqPopup(){
      setTimeout(function(){
        session.getPastRequestApi(false);
      },1000);

      this.setState({isLinkModalVisible: true});
  }

  onCancelRequestClick(data){

      console.log('status: ', data.status);

      this.setState({
        isLoading: true,
        isRequestStatusModal: false
      });

      deleteId = data.id;
      console.log('Completed: ', data.status);

      if(data.status == 'Completed'){
          //this.untrackRequestApi();
      }
      else{
          this.deleteApi(true);
          return;
      }

      // if(data.status == 'completed'){
      //     parent.deleteApi(true);
      // }
      // else{
      //     Api.cancelPastRequest(this, data.id, DeviceInfo.getUniqueId(), function(parent, data){
      //           console.log('cancelPastRequest: ', data);
      //
      //           parent.setState({
      //             isLoading: false
      //           });
      //
      //           if(data.error == '1'){
      //
      //           }else{
      //                 //parent.getPastRequestApi();
      //                 parent.deleteApi(true);
      //           }
      //     });
      // }
  }

  onAcceptPopup(){
    this.setState({isModalVisible: false})
    setTimeout(function(){
      session.deleteApi(false);
    },1000);
  }

  onCancelPopup(){
    this.setState({isModalVisible: false})
  }

  _renderStatusModalContent = () => (
      <View style={{width:width-30, height:150, backgroundColor: "white", justifyContent:'center', alignItems: "center", borderRadius: 4, borderColor: "rgba(0, 0, 0, 0.1)"}}>
          <View style={{flex:0.5,justifyContent:'center',alignItems:'center',backgroundColor:'transparent'}}>
              <Text style={{color: "#000",fontSize:20,padding:8, justifyContent:'center',alignItems:'center',fontFamily:'SFUIDisplay-Bold'}}>Cancel profile share and delete from share tracker?</Text>
          </View>
          <View style={{flex:0.5,width:width-50 ,height:50, justifyContent:'center',backgroundColor:'transparent'}}>
              <View style={{flex:1,flexDirection: 'row'}}>
                  <TouchableHighlight style={{flex:0.5,borderRadius: 3,alignSelf: 'center',backgroundColor: '#4ec5c1',alignItems: 'center',borderRadius: 3,marginRight:4}} underlayColor='transparent' onPress={() => { this.onCancelRequestClick(currentLinkData); }}>
                      <Text style={{padding: 12,textAlign: 'center',fontSize: 18,color: 'white',fontFamily:'SFUIDisplay-Bold'}} >Yes</Text>
                  </TouchableHighlight>
                  <TouchableHighlight style={{flex:0.5,borderRadius: 3,alignSelf: 'center',backgroundColor: '#ec576b',alignItems: 'center',borderRadius: 3,marginLeft:4}} underlayColor='transparent' onPress={() => { this.setState({isRequestStatusModal: false}) }}>
                      <Text style={{padding: 12,textAlign: 'center',fontSize: 18,color: 'white',fontFamily:'SFUIDisplay-Bold'}} >No</Text>
                 </TouchableHighlight>
              </View>
          </View>
      </View>
  );

  _renderModalContent = () => (
      <View style={{width:width-30, height:150, backgroundColor: "white", justifyContent:'center', alignItems: "center", borderRadius: 4, borderColor: "rgba(0, 0, 0, 0.1)"}}>
          <View style={{flex:0.5,justifyContent:'center',alignItems:'center',backgroundColor:'transparent'}}>
              <Text style={{color: "#000",fontSize:20,padding:8, justifyContent:'center',alignItems:'center',fontFamily:'SFUIDisplay-Bold'}}>Delete from request tracker?</Text>
          </View>
          <View style={{flex:0.5,width:width-50 ,height:50, justifyContent:'center',backgroundColor:'transparent'}}>
              <View style={{flex:1,flexDirection: 'row'}}>
                  <TouchableHighlight style={{flex:0.5,borderRadius: 3,alignSelf: 'center',backgroundColor: '#4ec5c1',alignItems: 'center',borderRadius: 3,marginRight:4}} underlayColor='transparent' onPress={() => { this.onAcceptPopup(); }}>
                      <Text style={{padding: 12,textAlign: 'center',fontSize: 18,color: 'white',fontFamily:'SFUIDisplay-Bold'}} >Yes</Text>
                  </TouchableHighlight>
                  <TouchableHighlight style={{flex:0.5,borderRadius: 3,alignSelf: 'center',backgroundColor: '#ec576b',alignItems: 'center',borderRadius: 3,marginLeft:4}} underlayColor='transparent' onPress={() => { this.onCancelPopup(); }}>
                      <Text style={{padding: 12,textAlign: 'center',fontSize: 18,color: 'white',fontFamily:'SFUIDisplay-Bold'}} >No</Text>
                 </TouchableHighlight>
              </View>
          </View>
      </View>
  );

  _renderItem = ({ item: rowData, index }) => {
    return(
      <ProfileShareItem
        item={rowData}
        onCompleteAction={()=> {
          this.setState({isLoading: false});
          this.getProfileShareApi(true);
        }}
        onGetProfileUrl={(url)=> {
          this.setState({isLoading: false});
          shareOptions = {
              title: CONST.appName,
              url: url,
          };
          setTimeout(function(){
              session.setState({
                //isLoading: true,
                isShareSheetVisible: true
              });
          },500);
        }}
        onChangeLoading={(visible)=> {this.setState({ isLoading: visible})}} />
    )
    // var dateArr = rowData.date_sent.split('-'); //"2019-02-04"
    // //var statusColor = '#4dc5c1';
    // var statusColor = '#cbcbcb';
    // if(rowData.status == 'Request Sent'){
    //   //statusColor = '#e8d638';
    // }
    // return(
    //     <Swipeout autoClose={true} disabled={rowData.status == 'Completed' ? false : true} backgroundColor={'transparent'} right={[{text: 'Clear', type: 'delete', onPress: () => {rowData; this.onCancelRequestClick(rowData);}}]}>
    //       <View style={{flexDirection: 'row',alignItems:'center',paddingTop:16,paddingBottom:16,borderBottomWidth:1,borderColor:'#e8e8e8'}}>
    //           <View style={{flex:0.5,flexDirection: 'column',backgroundColor:'transparent'}} >
    //               <Text style={{color: "#000",fontSize:18,fontFamily:'GoogleSans-Bold'}}>{rowData.recipient_name}</Text>
    //               <Text style={{color: "#515151",fontSize:16,fontFamily:'GoogleSans-Regular'}}>{dateArr[2]+'.'+dateArr[1]+'.'+dateArr[0]}</Text>
    //           </View>
    //           <View style={{flex:0.4,flexDirection: 'column',alignItems:'flex-end',backgroundColor:'transparent'}} >
    //               <Text style={{color: statusColor,fontSize:16,marginRight:16,fontFamily:'GoogleSans-Bold'}}>{rowData.status.charAt(0).toUpperCase() + rowData.status.substr(1)}</Text>
    //           </View>
    //           {rowData.status == 'Completed' ?
    //             <View/>
    //           :
    //             rowData.status != 'Request Sent' ?
    //             <TouchableHighlight style={{flex:0.1,backgroundColor:'transparent',alignItems:'center',padding:8}} underlayColor='transparent' onPress={() =>
    //                 {
    //                     //this.onDeleteRequestClick(rowData.id);
    //                     currentLinkData = rowData; this.setState({isRequestStatusModal: true});
    //                 }}>
    //                  <Image style={{width: 20, height: 20}} source={require('../img/cancel.png')} resizeMode="contain" />
    //             </TouchableHighlight>
    //           :
    //             <View style={{flex:0.1,flexDirection: 'column',backgroundColor:'transparent',padding:8}}>
    //                 <TouchableHighlight style={{flex:0.05,alignItems:'center'}} underlayColor='transparent' onPress={() => { this.onResendRequestClick(rowData.id); }}>
    //                      <Image style={{width: 20, height: 20}} source={require('../img/reload.png')} resizeMode="contain" />
    //                 </TouchableHighlight>
    //                 <TouchableHighlight style={{flex:0.05,alignItems:'center',marginTop:10}} underlayColor='transparent' onPress={() => { currentLinkData = rowData; this.setState({isRequestStatusModal: true});}}>
    //                      <Image style={{width: 20, height: 20}} source={require('../img/cancel.png')} resizeMode="contain" />
    //                 </TouchableHighlight>
    //             </View>
    //           }
    //       </View>
    //   </Swipeout>
    // )
  }

  render(){
      return (
        <View style={{height: height, top: this.state.keyboardOffset}}>
          <View style={{ flex: 1,backgroundColor: '#fff', marginTop: DeviceInfo.hasNotch() ? 25 : 0}}>
              <SpinnerLoading visible={this.state.isLoading}  />
              {/*--------header--------*/}
              <View style={{marginTop:this.state.topbarTopMargin,height: CONST.headerHeight,backgroundColor: CONST.headerBackColor,flexDirection:'row',paddingLeft:16,paddingRight:16}}>
                  {/*left*/}
                  <TouchableOpacity style={{flex: 0.1,alignItems: 'center',justifyContent:'center',backgroundColor:'transparent'}} underlayColor='transparent' onPress={this.onBackClick}>
                    <Image style={{width: CONST.headerLeftMenuSize, height: CONST.headerLeftMenuSize}} source={require('../img/back.png')} resizeMode="contain" />
                  </TouchableOpacity>
                  {/*center*/}
                  <View style={{flex: 0.8,alignItems: 'center',justifyContent:'center',backgroundColor:'transparent'}}>
                    <Image style={{width: 150, height: 56}} source={CONST.headerlogo} resizeMode="contain" />
                  </View>
                  {/*right*/}
                  <View style={{flex: 0.1}}/>
              </View>
              {/*--------title--------*/}
              <View style={{flex:0.1,flexDirection:'column',backgroundColor:'#fff',paddingLeft:16,paddingRight:16}}>
                  <Text style={{color: "#000", fontSize: 20, fontWeight: 'bold', alignSelf: 'center' , marginTop: 8, marginBottom: 8, fontFamily: 'GoogleSans-Bold'}}>Share talent profile with:</Text>
              </View>
              {/*--------sub - title--------*/}
              <View style={{flex:0.35,flexDirection:'column',backgroundColor:'transparent',paddingLeft:16,paddingRight:16}}>
                  {/*<Text style={{flex:0.2,color: "#000",fontSize:18,fontFamily:'GoogleSans-Regular'}}>Get feedback from:</Text>*/}
                  <TextInput
                    ref='FeedbackPersonInput'
                    style={{height: 40, color: '#000000', padding: 8, borderWidth:1,borderColor:'#e8e8e8', marginTop: 10, fontFamily:'GoogleSans-Regular'}}
                    placeholder={'Name'}
                    onChangeText={(feedbackPerson) => this.setState({feedbackPerson})}
                    value={this.state.feedbackPerson}
                  />
                  <Text style={{backgroundColor:'transparent',color: "#8a8a8a",fontSize:12,marginTop:8,fontFamily:'GoogleSans-Regular',flexWrap:'wrap'}}>Enter name of the person you are sharing your profile with, so you can manage it</Text>
                  <TouchableHighlight style={{height: 50,padding:4,marginTop:15,alignItems: 'center',justifyContent:'center',borderColor:'#4ec5c1',borderWidth:1,borderRadius:5,backgroundColor:'#4ec5c1'}} underlayColor='transparent' onPress={()=> this.onProfileShareClick()}>
                       <Text style={{color: "#fff",fontSize:18,padding:4,fontFamily:'GoogleSans-Bold'}}>{this.state.generateLinkBtnText}</Text>
                  </TouchableHighlight>
              </View>
              {/*--------past request--------*/}
              {/*<View style={{flex:0.05}}/>*/}
              {this.state.profileShareList.length > 0 &&
                <View style={{flex: 1}}>
                    <Text style={{flex:0.1,color: "#000",fontSize:20,fontFamily:'GoogleSans-Bold',paddingLeft:16,paddingRight:16}}>Profile shares:</Text>
                    <FlatList
                      style={{flex:0.9,marginTop:8,paddingLeft:16,paddingRight:16}}
                      data={this.state.profileShareList}
                      extraData={this.state}
                      keyExtractor={(item, index)=> index.toString()}
                      renderItem={this._renderItem}
                    />
                </View>
              }
              {/*-----------modal---------*/}
              <Modal animationIn={'fadeInDown'} animationOut={'fadeOutDown'} useNativeDriver={true}
                style={{flex: 1,justifyContent: "center",alignItems: "center"}} isVisible={this.state.isModalVisible}>
                {this._renderModalContent()}
              </Modal>
              {/*-----------status modal---------*/}
              <Modal animationIn={'fadeInDown'} animationOut={'fadeOutDown'} useNativeDriver={true}
                style={{flex: 1,justifyContent: "center",alignItems: "center"}} isVisible={this.state.isRequestStatusModal}>
                {this._renderStatusModalContent()}
              </Modal>
              {/*-----------modal for link---------*/}
              <Modal animationIn={'fadeInDown'} animationOut={'fadeOutDown'} useNativeDriver={true}
                style={{flex: 1,justifyContent: "center",alignItems: "center"}} isVisible={this.state.isLinkModalVisible}>
                {this._renderLinkModalContent()}
              </Modal>


          </View>

          {/*-----------ShareSheet for link---------*/}
          <ShareSheet visible={this.state.isShareSheetVisible} onCancel={this.onCancelShareSheet.bind(this)}>

                <View style={{width: '100%', alignItems: 'center', marginTop: 10}}>
                    <Text style={{color: "#000000",fontSize:20,fontFamily:'GoogleSans-Bold'}}>Share Link</Text>
                </View>

                <View style={{width: '100%', height: 20}}/>

                {isWhatsappAvailable &&
                    <Button buttonStyle={{alignItems: 'center'}} iconSrc={{ uri: CONST.WHATSAPP_ICON }}
                            onPress={()=>{
                                this.onCancelShareSheet();
                                if(Platform.OS==='android'){
                                    setTimeout(() => {
                                      Share.shareSingle(Object.assign(shareOptions, {
                                        "social": "whatsapp"
                                      }));
                                    },300);
                                }
                                else{
                                    let whatsappURL = 'whatsapp://send?text=' + shareOptions.url;
                                    Linking.openURL(whatsappURL);
                                }

                      }}>Whatsapp</Button>
                }
                {isMessagesAvailable &&
                <Button buttonStyle={{alignItems: 'center'}} iconSrc={{ uri: Platform.OS==='android' ? CONST.MESSAGES_ICON : CONST.IMESSAGE_ICON }}
                        onPress={()=>{
                            this.onCancelShareSheet();
                            setTimeout(() => {
                              // Share.shareSingle(Object.assign(shareOptions, {
                              //   "social": "SMS",
                              //   message: 'some message'
                              // }));
                              const operator = Platform.select({ios: '&', android: '?'});
                              Linking.openURL(`sms:${operator}body=${shareOptions.url}`);

                            },300);
                }}>Messages</Button>
                }
                {isMailAvailable &&
                    <Button buttonStyle={{alignItems: 'center'}} iconSrc={{ uri: CONST.EMAIL_ICON }}
                            onPress={()=>{
                                this.onCancelShareSheet();
                              console.log("Share Options: ", shareOptions);
                                if(Platform.OS==='android'){
                                    setTimeout(() => {
                                      Share.shareSingle(Object.assign(shareOptions, {
                                        "social": "email"
                                      }));
                                    },300);
                                }
                                else{
                                  let gmailURL = 'mailto:?subject=&body=' + shareOptions.url;
                                  Linking.openURL(gmailURL);
                                  // Share.shareSingle(Object.assign(shareOptions, {
                                  //   "social": Share.Social.EMAIL
                                  // }));
                                }

                    }}>Gmail</Button>
                }

            <Button buttonStyle={{ alignItems: 'center' }} iconSrc={{ uri: CONST.COPY_ICON }}
              onPress={() => {
                this.onCancelShareSheet();
                Clipboard.setString(shareOptions.url);
              }}>Copy Link</Button>

                  <View style={{width: '100%', height: 20}}/>


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
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
