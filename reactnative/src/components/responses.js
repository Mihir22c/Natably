import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,Dimensions,TextInput,Linking,
  View,Image,FlatList,TouchableHighlight,ScrollView, StatusBar
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Navigation } from 'react-native-navigation';
import ExpanableList from 'react-native-expandable-section-flatlist';
import Modal from "react-native-modal";
import DeviceInfo from 'react-native-device-info';
import SpinnerLoading from '../constant/spinnerLoading'
const CONST = require('../constant/const');
import Api from '../Api/Api';
import { registerKilledListener, registerAppListener } from "../constant/listeners";
//import FCM, {NotificationType} from 'react-native-fcm';
import messaging from '@react-native-firebase/messaging';
import Share, {ShareSheet, Button} from 'react-native-share';

import Svg, { Text as TextSvg } from "react-native-svg";
import LinearGradient from 'react-native-linear-gradient';

var width,height;
var barHeight = 30;
var collapseBarChartBackHeight = 240;
var openBarChartBackHeight;
var isBarCollapse = true;
var session;
var deleteFrom='';
var deleteId='';
var feedbackThumbnailId='';
var feedbackProviderName='';
var dashedWidth = 1.5,dashedColor='#bfbfbf';
var isMessagesAvailable = false;
var isMailAvailable = false;
var isWhatsappAvailable = false;
var shareOptions = {};
var currentLinkData = {};

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
                width:250,
                visible: false, // hide drwaer from showing first when this screen is loaded
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
    this.state = {
      barchartData : [],
      postRequestData:[],
      scoreData:[],
      barchartHeight : collapseBarChartBackHeight,
      barchartHeaderFlex:0.3,
      barchartListFlex:0.65,
      barchartButtonFlex:0.15,
      barChartArrow : require('../img/down_arrow.png'),
      isModalVisible:false,
      topbarTopMargin:0,
      barchartTitle:'',
      feedback:'',
      showNoDataImage:false,
      barTextPosition:{left:0},
      isLoading: false,
      groupImage: null,
      isShareSheetVisible: false,
      isFeedbackModalVisible: false
    }
    openBarChartBackHeight = height-20;
    session = this;
  }





  componentDidMount() {
    // check for deeplink url
    registerAppListener(this.props.navigator,this.props.componentId);
    CONST.setUserType("old");

    isBarCollapse = false;
    this.setState({topbarTopMargin: CONST.checkIphoneX()});
    this.navigationEventListener = Navigation.events().bindComponent(this);

    //this.getHomeCategoryData();
    Api.getCompletedFeedbackList(this, DeviceInfo.getUniqueId(), function(parent, data){
        console.log('---->> getCompletedFeedbackList response >>> '+JSON.stringify(data));
        // var openMockData = [];
        // // loop for generating barchart data array start
        // for(var i = 0 ; i < data.data.categories.length ; i++){
        //   var headerdata = data.data.categories[i].name+'+'+data.data.categories[i].bar_width+'+'+data.data.categories[i].bar_color;
        //   openMockData.push({header:headerdata,content:data.data.categories[i].thumbnails});
        // }
        // loop for generating barchart data array end
        parent.setState({barchartData : data.data.feedbacks});

        if(data.data.feedbacks.length < 1){
            parent.setState({showNoDataImage: true});
        }
        else{
            parent.setState({showNoDataImage: false});
        }

        //parent.setState({feedbackData:data.data.feedbacks})

    });
  }

  // onDeleteRequestClick(id){
  //   deleteFrom = 'request';
  //   deleteId = id;
  //   this.setState({isModalVisible: true});
  // }
  deleteRequestApi(){
    this.setState({
      isLoading: true
    });
    // delete past request data
    Api.deletePastRequest(this, deleteId, DeviceInfo.getUniqueId(), function(parent, data){
        console.log('deletePastRequest: ', data);
      parent.setState({
        isLoading: false
      });
        parent.getHomeCategoryData();
        deleteFrom = '';
        deleteId = '';
    });
  }
  // ---------- past request method end --------

  headerOnPress(){
    isBarCollapse = false;
    this.setState({barchartHeight:openBarChartBackHeight,
                  barchartHeaderFlex:0.07,barchartListFlex:8,barChartArrow : require('../img/up_arrow.png')});
  }
  componentDidAppear() {
    Navigation.mergeOptions(this.props.componentId, {
      sideMenu: {
          left: {
              visible: false,
          }}
    });
    //this.getHomeCategoryData();
  }


  onBackClick(){
    Navigation.pop(this.props.componentId);
  }

  onIgnoreFeedback(id){
    // delete feedback request
    deleteId = id;
    console.log('hhh: ', deleteId);
    this.onDeleteCategoryFeedback('feedback',id);
  }


  onDeleteCategoryFeedback(from,id){
    deleteFrom = from;
    deleteId = id;
    this.setState({isFeedbackModalVisible: true})
  }
  deleteApi(){


      // var tempArr = session.state.barchartData;
      // // loop for removing feedback items from array on success start
      // for(var i = 0 ; i < tempArr.length ; i++){
      //   for(var j=0 ; j < tempArr[i].content.length ; j++){
      //     //for(var k=0 ; k < tempArr[i].content[j].length ; k++){
      //       if(tempArr[i].content[j].id == deleteId){
      //           console.log('content: ', tempArr[i].content[j]);
      //          tempArr[i].content.splice(j, 1);
      //       }
      //     //}
      //   }
      // }
      // console.log('tempArr: ', tempArr);
      // return;

      this.setState({
        isLoading: true
      });
      Api.setFeedbackStatus(this, deleteId, DeviceInfo.getUniqueId(), 'ignored', function(parent, data){
        parent.setState({
          isLoading: false
        });
        console.log('setFeedbackStatus: ', data);
          if(data.error == '1'){

          }else{
              var tempArr = session.state.barchartData;
              // loop for removing feedback items from array on success start
              for(var i = 0 ; i < tempArr.length ; i++){
                for(var j=0 ; j < tempArr[i].content.length ; j++){
                  //for(var k=0 ; k < tempArr[i].content[j].length ; k++){
                    if(tempArr[i].content[j].id == deleteId){
                       tempArr[i].content.splice(j, 1);
                       console.log('tempArr: ', tempArr[i]);
                       console.log('tempArr[i].content: ', tempArr[i].content.length);
                       //if(tempArr[i].content.length < 1){
                           //tempArr.splice(i, 1);
                       //}
                    }
                  //}
                }
              }
              // loop for removing feedback items from array on success end
            deleteId = '';
            setTimeout(function(){
              session.setState({barchartData : tempArr});
              let dataNotFound = true;
              for(var i = 0 ; i < tempArr.length ; i++){
                  if(tempArr[i].content.length > 0){
                      console.log('dataNotFound will become true: ', dataNotFound);
                      dataNotFound = false;
                  }
              }
              console.log('state will set: ', dataNotFound);
              parent.setState({showNoDataImage: dataNotFound});
            },500);
          }
      });

  }


onGetFeedbackClick(){
  // goto get feedback screen
  Navigation.push(this.props.componentId, {
    component: {
      name: CONST.GetFeedbackScreen,
      passProps: {
        previousScreen: 'responses',
      },
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

  onGiveFeedbackClick(from){
    // goto give feedback screen
    Navigation.push(this.props.componentId, {
      component: {
        name: CONST.GiveFeedbackScreen,
        passProps: {
          personName:from,
          previousScreen: 'responses'
        },
      }
    });
  }

  onSendReciprocateFeedback(name){
    // give feedback to any selected user
    this.onGiveFeedbackClick(name);
  }

  onAcceptPopup(){
    session.setState({isFeedbackModalVisible: false})
    setTimeout(function(){
      session.deleteApi();
    },500);
  }


_renderFeedbackModalContent = () => (
      <View style={{width:width-30, height:150, backgroundColor: "white", justifyContent:'center', alignItems: "center", borderRadius: 4, borderColor: "rgba(0, 0, 0, 0.1)"}}>
          <View style={{flex:0.5,justifyContent:'center',alignItems:'center',backgroundColor:'transparent'}}>
              <Text style={{color: "#000",fontSize:20,padding:8, justifyContent:'center',alignItems:'center',fontFamily:'SFUIDisplay-Bold'}}>Are you sure want to dismiss this response?</Text>
          </View>
          <View style={{flex:0.5,width:width-50 ,height:50, justifyContent:'center',backgroundColor:'transparent'}}>
              <View style={{flex:1,flexDirection: 'row'}}>
                  <TouchableHighlight style={{flex:0.5,borderRadius: 3,alignSelf: 'center',backgroundColor: '#4ec5c1',alignItems: 'center',borderRadius: 3,marginRight:4}} underlayColor='transparent' onPress={() => { this.onAcceptPopup(); }}>
                      <Text style={{padding: 12,textAlign: 'center',fontSize: 18,color: 'white',fontFamily:'SFUIDisplay-Bold'}} >Yes</Text>
                  </TouchableHighlight>
                  <TouchableHighlight style={{flex:0.5,borderRadius: 3,alignSelf: 'center',backgroundColor: '#ec576b',alignItems: 'center',borderRadius: 3,marginLeft:4}} underlayColor='transparent' onPress={() => { this.setState({isFeedbackModalVisible: false}); }}>
                      <Text style={{padding: 12,textAlign: 'center',fontSize: 18,color: 'white',fontFamily:'SFUIDisplay-Bold'}} >No</Text>
                 </TouchableHighlight>
              </View>
          </View>
      </View>
    );

  _renderfeedbackChildItem = ({ item: rowData, index }) => {
    let commonHeight = 110;
    //console.log('index: ', index);
    //console.log('xxx: ', rowData);

    let mytext = rowData.thumbnailName;

    return(
      <View style={{minHeight: commonHeight+20,flexDirection: 'row',marginTop:8,marginBottom:8}}>

          <View style={{flex:1,flexDirection:'column',backgroundColor:'#fff'}}>
              <View style={{minHeight: 120,flex:0.7,flexDirection:'row',backgroundColor:'transparent',paddingLeft:4, paddingRight:2}}>
                  <Image style={{width: commonHeight, height: commonHeight,backgroundColor:'transparent'}} resizeMode="contain" source={{ uri : 'http://natably.com/images/thumbnails/' + rowData.thumbnailUrl}} />
                  <View style={{flex:1, flexDirection:'column',backgroundColor:'transparent'}}>
                    <Text style={{color: "#000",fontSize:16,paddingLeft:4,paddingTop:4,flexWrap:'wrap',fontFamily:'SFUIDisplay-Bold'}} numberOfLines={1}>{mytext}</Text>
                    <Text style={{color: "#000",fontSize:14,paddingLeft:4,paddingTop:4,flexWrap:'wrap',fontFamily:'SFUIDisplay-Regular'}} >{rowData.feedback}</Text>
                  </View>
              </View>
              <TouchableHighlight style={{position: 'absolute', right: 0, marginTop: 0, padding:4}} underlayColor='transparent' onPress={() => { this.onIgnoreFeedback(rowData.id); }}>
                   <Image style={{width: 20, height: 20}} source={require('../img/cancel.png')} resizeMode="contain" />
              </TouchableHighlight>

          </View>
      </View>
    )
  }
  _renderfeedbackItem = ({ item: rowData, index }) => {
      //console.log('xxx: ', rowData);
      //console.log('xxx: ', rowData.content[0]);

      if(rowData.content.length < 1){
          return (null);
      }

      let commonHeight = 110;
      let mytext = rowData.content[0].thumbnailName;

    return(
      <View style={{flexDirection: 'column',marginTop:4,marginBottom:8}}>
          <View style={{flexDirection: 'row',alignItems:'center'}} >

              <View style={{flex: 0.75,alignItems: 'center',marginLeft:8,flexDirection:'row'}}>
                <TouchableHighlight style={{}} underlayColor='transparent' onLongPress={() => { this.onSendReciprocateFeedback(rowData.provider_name); }}>
                  <Text style={{color: "#000",fontSize:16,fontFamily:'SFUIDisplay-Bold'}}>{rowData.provider_name}</Text>
                </TouchableHighlight>
                <Text style={{color: "#000",fontSize:16,fontFamily:'SFUIDisplay-Regular'}}> thinks you are:</Text>
              </View>
          </View>

          {/*
          <View style={{minHeight: commonHeight+20,flexDirection: 'row',marginTop:8,marginBottom:8}}>

              <View style={{flex:1,flexDirection:'column',backgroundColor:'#fff'}}>
                  <View style={{minHeight: 120,flex:0.7,flexDirection:'row',backgroundColor:'transparent',paddingLeft:4, paddingRight:2}}>
                      <Image style={{width: commonHeight, height: commonHeight,backgroundColor:'transparent'}} resizeMode="contain" source={{ uri : rowData.content[0].thumbanail}} />
                      <View style={{flex:1, flexDirection:'column',backgroundColor:'transparent'}}>
                        <Text style={{color: "#000",fontSize:16,paddingLeft:4,paddingTop:4,flexWrap:'wrap',fontFamily:'SFUIDisplay-Bold'}} numberOfLines={1}>{mytext}</Text>
                        <Text style={{color: "#000",fontSize:14,paddingLeft:4,paddingTop:4,flexWrap:'wrap',fontFamily:'SFUIDisplay-Regular'}} >{rowData.content[0].feedbacks[0].feedback}</Text>
                      </View>
                  </View>
                  <TouchableHighlight style={{position: 'absolute', right: 0, marginTop: 0, padding:4}} underlayColor='transparent' onPress={() => { this.onIgnoreFeedback(rowData.content[0].feedbacks[0].id); }}>
                       <Image style={{width: 20, height: 20}} source={require('../img/cancel.png')} resizeMode="contain" />
                  </TouchableHighlight>

              </View>
          </View>
          */}

          <FlatList
            style={{marginTop:8,marginBottom:4}}
            data={rowData.content}
            extraData={this.state}
            renderItem={this._renderfeedbackChildItem}
            keyExtractor={(item, index)=> index.toString()}
          />
          {/*
            <TouchableHighlight style={{flex:0.1,justifyContent:'center',alignItems:'center',borderRadius:5,borderColor:'#4ec5c1',borderWidth:1,padding:8}} underlayColor='transparent' onPress={() => { this.onSendReciprocateFeedback(rowData.provider_name); }}>
                 <Text style={{color: "#4ec5c1",fontSize:15,fontFamily:'SFUIDisplay-Regular'}}>Reciprocate, send {rowData.provider_name} feedback, too!</Text>
            </TouchableHighlight>
          */}
      </View>
    )
  }

  render(){

    return (
        <View style={{flex: 1,backgroundColor: '#FFFFFF',flexDirection:'column', marginTop: DeviceInfo.hasNotch() ? 25 : 0}}>
          {/*--------header--------*/}
          <SpinnerLoading visible={this.state.isLoading}/>
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
              <View style={{flex: 0.1,alignItems: 'center',justifyContent:'center',backgroundColor:'transparent'}}>
               {this.state.groupImage != null &&
                <Image style={{width: 40, height: 40}} source={{uri: this.state.groupImage}} resizeMode="contain" />
               }
              </View>
          </View>

          {/*--------BOTTOM LIST PART---------*/}
          <View style={{flex:0.9, backgroundColor: 'transparent'}}>
            <ScrollView style={{flex:1,backgroundColor:'transparent',paddingTop:25,paddingLeft:16,paddingRight:16}}>
                {/*---- no data image -----*/}
                {this.state.showNoDataImage &&
                  <View style={{backgroundColor:'transparent',alignItems:'center',justifyContent:'center'}}>
                      <Image style={{width: 350, height: 500}} source={require('../img/nodata.png')} resizeMode="contain" />
                  </View>
                }
                <View style={{flex:1,backgroundColor:'transparent',marginBottom:20}}>
                    {/*----- feedback Data ------*/}
                    {this.state.barchartData.length > 0 &&
                      <View style={{flex:1,flexDirection:'column'}}>

                          <View style={{flex:this.state.barchartHeaderFlex,alignItems:'center',backgroundColor:'#fff',marginTop: 0,marginBottom:4}} >
                              <Text style={{color: "#000",fontSize:20,fontWeight:'bold',alignSelf:'center',paddingLeft:16,paddingRight:16,fontFamily:'SFUIDisplay-Bold'}}>{this.state.barchartTitle}</Text>
                          </View>

                          <FlatList
                            style={{marginTop:16}}
                            data={this.state.barchartData}
                            extraData={this.state}
                            renderItem={this._renderfeedbackItem}
                            keyExtractor={(item, index)=> index.toString()}
                          />
                      </View>
                    }
                </View>
            </ScrollView>
            {this.state.showNoDataImage &&
                <View style={{position: 'absolute', paddingTop: 10, bottom: 0, width: '100%', height: 50, flexDirection:'row',alignItems:'flex-start',justifyContent:'center',backgroundColor:'transparent'}}>
                    <TouchableHighlight style={{flex: 0.42,alignItems: 'center',justifyContent:'center',borderColor:'#4ec5c1',borderWidth:1,borderRadius:5,backgroundColor:'#4ec5c1'}} underlayColor='transparent' onPress={() => { this.onGetFeedbackClick(); }}>
                         <Text style={{color: "#FFFFFF",fontSize:18,padding:8,fontFamily:'SFUIDisplay-Bold'}}>Get Points</Text>
                    </TouchableHighlight>
                    <View style={{flex:0.05}}/>
                    <TouchableHighlight style={{flex: 0.42,alignItems: 'center',justifyContent:'center',borderColor:'#4ec5c1',borderWidth:1,borderRadius:5,backgroundColor:'transparent'}} underlayColor='transparent' onPress={() => { this.onGiveFeedbackClick(''); }}>
                         <Text style={{color: "#4ec5c1",fontSize:18,padding:8,fontFamily:'SFUIDisplay-Bold'}}>Give Points</Text>
                    </TouchableHighlight>
                </View>
            }
          </View>

          {/*-----------feedback modal---------*/}
          <Modal animationIn={'fadeInDown'} animationOut={'fadeOutDown'} useNativeDriver={true}
           style={{flex: 1,justifyContent: "center",alignItems: "center"}} isVisible={this.state.isFeedbackModalVisible}>
           {this._renderFeedbackModalContent()}
         </Modal>


        </View>
      );
  }
}
