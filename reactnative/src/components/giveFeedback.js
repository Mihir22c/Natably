import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,Alert,Dimensions,
  Text,TextInput,FlatList,KeyboardAvoidingView,Linking,
  View,Image,Button,TouchableHighlight,ScrollView, StatusBar, Keyboard, LayoutAnimation
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Navigation } from 'react-native-navigation';
import Accordion from 'react-native-collapsible/Accordion';
import DeviceInfo from 'react-native-device-info';
import SpinnerLoading from '../constant/spinnerLoading'
import Share from 'react-native-share';
const CONST = require('../constant/const');
import Api from '../Api/Api';
import { registerKilledListener, registerAppListener } from "../constant/listeners";
import Modal from "react-native-modal";

var feedbackArr = [];
var width,height,session;
var feedbackUrl = '';

export default class giveFeedback extends Component {
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

  constructor(props){
    super(props);
    height = Dimensions.get('window').height;
    width = Dimensions.get('window').width;
    StatusBar.setBarStyle('dark-content', true);
    this.state={
      keyboardOffset: 0,
      keyboardBottomMargin: 32,
      feedbackPerson: '',
      feedback:'',
      activeSections:[],
      topbarTopMargin:0,
      thumbnailArr : [],
      app_request_id:'',
      submitBtnText:'Send',
      isSubmitBtnClicked:false,
      isLinkModalVisible:false,
      isLoading: false,
      providerName: ''
    }
    session = this;
  }
  componentDidMount() {
    registerAppListener(this.props.navigator,this.props.componentId);
    this.setState({topbarTopMargin: CONST.checkIphoneX()});
    this.getThumbnailList();
    this.setState({feedbackPerson: this.props.personName});
    // if called screen via deeplink then get deeplink data
    if(this.props.from === 'deeplink'){
      this.getDeepLinkData();
    }


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
      //console.log('_keyboardWillShow');
      this.setState({
          keyboardOffset: Platform.OS==='android' ? 0 : 0,
          keyboardBottomMargin: 332
      });

      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
  }

  keyboardWillHide() {
      //console.log('keyboardWillHide');
      this.setState({
          keyboardOffset: 0,
          keyboardBottomMargin: 32
      });

      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
  }

  getDeepLinkData(){
    // get deeplink data
    this.setState({
      isLoading: true
    });
    Api.getSubmitFeedbackDeeplinkData(this, this.props.token, function(parent, data){
      parent.setState({
        isLoading: false
      });
      console.log('getSubmitFeedbackDeeplinkData: ', data);
        if(data.hasOwnProperty('error')){

        }else{
            console.log('hp feedbackPerson: ', parent.state.feedbackPerson);
          //if(data.data.provider_name != null){    //hiren commented because we are showing recipient_name not provider_name
            parent.setState({
              feedbackPerson: data.data.recipient_name,
              providerName: data.data.provider_name,
              app_request_id:data.data.app_request_id,
            }); //data.data.provider_name
          //}

        }
    });
  }
  getThumbnailList(){
    // get category thumbnail list
    this.setState({
      isLoading: true
    });
    Api.getThumbnailList(this, function(parent, data){
      parent.setState({
        isLoading: false
      });
        if(data.error == '1'){

        }else{
          parent.setState({thumbnailArr : data.data});
        }
    });
  }

  onBackClick(){
    if(this.props.from === 'deeplink'){
      Navigation.setStackRoot(this.props.componentId, {
        component: {
          id: 'home',
          name: CONST.HomeScreen,
        }
      });
    }else{
      Navigation.pop(this.props.componentId);
    }
  }

  onSendFeedback(){
    // generate deep link
    this.generateUniqueLink();
  }
  generateUniqueLink(){
    if(this.state.feedbackPerson != ''){
      if(feedbackArr.length > 0){
        this.setState({
          isLoading: true
        });
        if(this.props.from === 'deeplink'){
          console.log('Feedback Array: ', JSON.stringify(feedbackArr));
            Api.sendFeedback(this, this.state.app_request_id, this.state.providerName, feedbackArr, DeviceInfo.getUniqueId(), function(parent, data){
                //parent.generateNewFeedbackLink(true);
                console.log('SendDataResponse: ', JSON.stringify(data));
                parent.setState({
                  isLoading: false
                });
                Alert.alert(
                    CONST.appName,
                    'Your feedback has been submitted successfully!',
                    [
                        {text: 'OK', onPress: () => {
                            session.onBackClick();
                        }
                    },],);
            });
        }else{
            this.generateNewFeedbackLink(false);
        }
      }else{
        Alert.alert(CONST.appName,'Please add atleast one feedback!');
      }
    }else{
      Alert.alert(CONST.appName,'Please add person name to whom you want to give feedback!');
    }
  }
  generateNewFeedbackLink(fromDeepLink){
    Api.getFeedbackUrl(this, this.state.feedbackPerson, feedbackArr, DeviceInfo.getUniqueId(), function(parent, data){
      parent.setState({
        isLoading: false
      });
        feedbackUrl = data.data.url;
        console.log('data: ', data);
        // open share dialog after generating a feedback link

        if(fromDeepLink){

            Alert.alert(
                CONST.appName,
                'Your feedback has been submitted successfully!',
                [
                    {text: 'OK', onPress: () => {
                        session.onBackClick();
                    }
                },],);
        }
        else{
            setTimeout(function(){
                setTimeout(function(){
                    const shareOptions = {
                      title: CONST.appName,
                      url: feedbackUrl,
                    };
                    return Share.open(shareOptions)
                      .then(({action, activityType}) => {
                        if(action === Share.dismissedAction){
                          session.setState({isLinkModalVisible:true});
                        }
                        else {
                          session.setState({isLinkModalVisible:true});
                        }
                      })
                      .catch(err => {
                        console.log(err);
                        session.setState({isLinkModalVisible:true});
                      });
                },500);
            },500);
        }
    });
  }
  onResendLink(){
    setTimeout(function(){
        CONST.openShareLinkDialog(feedbackUrl);
    },500);
  }
  onSendAnotherFeedback(){
    this.setState({feedbackPerson: '', activeSections:[]});
    feedbackArr = [];
    session.setState({isLinkModalVisible:false});
  }
  onGotoHome(){
    session.setState({isLinkModalVisible:false});
    if(session.props.from === 'deeplink' || session.props.previousScreen == 'responses'){
      Navigation.setStackRoot(session.props.componentId, {
        component: {
          id: 'home',
          name: CONST.HomeScreen
        }
      });
    }else{
      setTimeout(function(){
          Navigation.pop(session.props.componentId);
      },500);
    }
  }
  _renderLinkModalContent(){
    var mainWidth = width-150;
    return(
      <View style={{width:mainWidth,height:180,backgroundColor: "white",justifyContent:'center',alignItems: "center", borderRadius: 4, borderColor: "rgba(0, 0, 0, 0.1)"}}>
        <View style={{flex: 0.3,padding:4,borderRadius:5,backgroundColor:'transparent',justifyContent:'center',alignItems: "center"}}>
             <Text style={{color: "#282828",fontSize:15,padding:4,fontFamily:'GoogleSans-Regular',textAlign:'center'}}>I would like to …</Text>
        </View>
        <View style={{width:mainWidth,flex:0.01,backgroundColor:'#ededed'}}/>

        <TouchableHighlight style={{flex: 0.2,padding:4,borderRadius:5,backgroundColor:'transparent',justifyContent:'center',alignItems: "center"}} underlayColor='transparent' onPress={() => { this.onResendLink()}}>
             <Text style={{color: "#4ec5c1",fontSize:16,padding:4,fontFamily:'GoogleSans-Bold',textAlign:'center'}}>Resend</Text>
        </TouchableHighlight>
        <View style={{width:mainWidth,flex:0.01,backgroundColor:'#ededed'}}/>
        <TouchableHighlight style={{flex: 0.2,padding:4,borderRadius:5,backgroundColor:'transparent',justifyContent:'center',alignItems: "center"}} underlayColor='transparent' onPress={() => { this.onSendAnotherFeedback(); }}>
             <Text style={{color: "#4ec5c1",fontSize:16,padding:4,fontFamily:'GoogleSans-Bold',textAlign:'center'}}>Generate New</Text>
        </TouchableHighlight>
        <View style={{width:mainWidth,flex:0.01,backgroundColor:'#ededed'}}/>
        <TouchableHighlight style={{flex: 0.2,padding:4,borderRadius:5,backgroundColor:'transparent',justifyContent:'center',alignItems: "center"}} underlayColor='transparent' onPress={() => { this.onGotoHome(); }}>
             <Text style={{color: "#4ec5c1",fontSize:16,padding:4,fontFamily:'GoogleSans-Bold',textAlign:'center'}}>Back to Home Screen</Text>
        </TouchableHighlight>
      </View>
    );
  }

  onFeedbackTextChange(id,feedbackText){
    // check feedback array conians selected id or not
    var found = feedbackArr.some(function (el) {
      if(el.id === id){
        el.content = feedbackText;
      }
      return el.id === id;
    });
    // if feedback array not contain id then add new item
    if (!found) { feedbackArr.push({'id':id,'content':feedbackText}); }
  }
  addFeedbackCategory(id,isActive){
    // add or remove selcted/unselected feedback from array
    var index = feedbackArr.findIndex(x => x.id == id)
    if (index === -1 && isActive == true){
        feedbackArr.push({'id':id,'content':''});
    }else if(index != -1 && isActive == false){
      feedbackArr.splice(index, 1)
    }
  }

  _renderHeader = (content, index, isActive, sections) => {
    let commonHeight = 100;
    this.addFeedbackCategory(content.id,isActive);
    return(
      <View style={{minHeight: commonHeight,backgroundColor:'#fff',paddingLeft:4,paddingRight:4,marginTop:10,
        shadowColor: '#262626',shadowOffset: { width: 0, height: 0 },shadowRadius: 10,shadowOpacity: 0.1,elevation: 3,zIndex:999}}>
          <View style={{flexDirection:'row'}}>
              <Image style={{width: commonHeight, height: commonHeight,backgroundColor:'transparent'}} resizeMode="contain" source={{ uri : 'http://natably.com/images/thumbnails/'+content.thumbnail}} />
              <View style={{flex:0.85,flexDirection:'column',backgroundColor:'transparent',marginTop:4,marginLeft:4}}>
                <Text style={{color: "#000",fontSize:16,paddingLeft:4,paddingTop:4,flexWrap:'wrap',fontFamily:'GoogleSans-Bold'}} numberOfLines={1}>{content.name}</Text>
                <Text style={{color: "#000",fontSize:14,paddingLeft:4,paddingTop:4,flexWrap:'wrap',fontFamily:'GoogleSans-Regular'}} >{content.description}</Text>
              </View>
              {isActive &&
                <View style={{flex:0.15,alignItems:'center',marginTop:8}}>
                    <Image style={{width: 20, height: 20}} source={require('../img/checkmark.png')} resizeMode="contain" />
                </View>
              }
          </View>
      </View>
    );
  };
  _renderContent = (content, index, isActive, sections) => {
    return (
      <View style={[styles.content,{backgroundColor:'transparent',marginBottom:10}]} >
        <TextInput
          style={{height: 100,borderWidth:1,borderColor:'#e8e8e8', color: 'black', textAlignVertical:'top',padding:8,fontFamily:'GoogleSans-Regular'}}
          onChangeText={(feedback) => this.onFeedbackTextChange(content.id,feedback)}
          placeholder={'Additional detail (optional)'}
          numberOfLines={5}
          multiline={true}
        />
      </View>
    );
  };

  _updateSections = activeSections => {
    this.setState({ activeSections });
  };
  render(){
      return (
        <View style={{height: height, top: this.state.keyboardOffset}}>
          <View style={{ flex: 1,backgroundColor: '#fff', marginTop: DeviceInfo.hasNotch() ? 25 : 0 }}>
              <SpinnerLoading visible={this.state.isLoading} />
              {/*--------header--------*/}
              <View style={{marginTop:this.state.topbarTopMargin,height: CONST.headerHeight, backgroundColor: CONST.headerBackColor,flexDirection:'row',paddingLeft:16,paddingRight:16}}>
                  {/*left*/}
                  <TouchableHighlight style={{flex: 0.1,alignItems: 'center',justifyContent:'center',backgroundColor:'transparent'}} underlayColor='transparent' onPress={() => { this.onBackClick(); }}>
                    <Image style={{width: CONST.headerLeftMenuSize, height: CONST.headerLeftMenuSize}} source={require('../img/back.png')} resizeMode="contain" />
                  </TouchableHighlight>
                  {/*center*/}
                  <View style={{flex: 0.8,alignItems: 'center',justifyContent:'center',backgroundColor:'transparent'}}>
                    <Image style={{width: 150, height: 56}} source={CONST.headerlogo} resizeMode="contain" />
                  </View>
                  {/*right*/}
                  <View style={{flex: 0.1}}/>
              </View>
              {/*--------input data--------*/}
              <View style={{flex:0.2,flexDirection:'column',backgroundColor:'transparent',paddingLeft:16,paddingRight:16,marginTop:16}}>
                  <Text style={{flex:0.4,color: "#000",fontSize:18,textAlign:'center',fontFamily:'GoogleSans-Bold'}}>Give talent points to:</Text>
                  <TextInput
                      style={{flex:0.25,borderWidth:1,borderColor:'#e8e8e8',backgroundColor:'transparent',
                              textAlignVertical:'bottom',padding:8,fontSize:16,color:'#000',fontFamily:'GoogleSans-Regular'}}
                      onChangeText={(feedbackPerson) => this.setState({feedbackPerson})}
                      value={this.state.feedbackPerson}
                      editable={this.props.from === 'deeplink' ? false : true}
                      placeholder={'Name'}
                  />
              </View>
              {/*--------category list--------*/}
              <ScrollView style={{flex:1,paddingLeft:16,paddingRight:16,backgroundColor:'transparent'}}>
                <View style={{flex:1,flexDirection:'column',backgroundColor:'transparent'}}>
                    <Text style={{flex:0.2,color: "#8a8a8a",fontSize:12,marginTop:8,marginBottom:8,fontFamily:'GoogleSans-Regular',flexWrap:'wrap'}}>Please select roles you think the person can play well and tell them what made you feel that way</Text>
                    <Accordion
                      sections={this.state.thumbnailArr}
                      activeSections={this.state.activeSections}
                      // renderSectionTitle={this._renderSectionTitle}
                      renderHeader={this._renderHeader}
                      renderContent={this._renderContent}
                      onChange={this._updateSections}
                      expandMultiple={true}
                    />
                    {this.state.thumbnailArr.length > 0 &&
                      <View style={{marginTop:32,marginBottom: this.state.keyboardBottomMargin}}>
                        <TouchableHighlight style={{flex:0.1,justifyContent:'center',alignItems:'center',borderRadius:5,borderColor:'#4ec5c1',backgroundColor:'#4ec5c1',borderWidth:1,paddingTop:8,paddingBottom:8}} underlayColor='transparent' onPress={() => { this.onSendFeedback(); }}>
                             <Text style={{color: "#fff",fontSize:20,fontFamily:'GoogleSans-Bold'}}>{this.state.submitBtnText}</Text>
                        </TouchableHighlight>
                        {false &&
                          <View style={{flex:0.2,flexDirection:'row',alignItems:'center',justifyContent:'center',backgroundColor:'#fff',marginTop:4}}>
                              <TouchableHighlight style={{flex: 0.495,padding:4,borderColor:'#4ec5c1',borderWidth:1,borderRadius:5,backgroundColor:'#4ec5c1'}} underlayColor='transparent' onPress={() => { this.onSendAnotherFeedback(); }}>
                                   <Text style={{color: "#fff",fontSize:14,padding:4,fontFamily:'GoogleSans-Bold',textAlign:'center',flexWrap:'wrap'}}>Send Another Feedback</Text>
                              </TouchableHighlight>
                              <View style={{flex:0.01}}/>
                              <TouchableHighlight style={{flex: 0.495,padding:4,borderColor:'#4ec5c1',borderWidth:1,borderRadius:5,backgroundColor:'#4ec5c1'}} underlayColor='transparent' onPress={() => { this.onGotoHome(); }}>
                                   <Text style={{color: "#fff",fontSize:14,padding:4,fontFamily:'GoogleSans-Bold',textAlign:'center',flexWrap:'wrap'}}>Return to Home Screen</Text>
                              </TouchableHighlight>
                          </View>
                        }
                      </View>
                    }
                </View>
              </ScrollView>
              {/*-----------modal for link---------*/}
              <Modal animationIn={'fadeInDown'} animationOut={'fadeOutDown'} useNativeDriver={true}
                style={{flex: 1,justifyContent: "center",alignItems: "center"}} isVisible={this.state.isLinkModalVisible}>
                {this._renderLinkModalContent()}
              </Modal>
          </View>
        </View>
      );
  }
}
const styles = StyleSheet.create({
});
