import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,Alert,Dimensions,
  Text,TextInput,FlatList,KeyboardAvoidingView,Linking,
  View,Image,Button,TouchableHighlight,ScrollView, StatusBar
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Navigation } from 'react-native-navigation';
import Accordion from 'react-native-collapsible/Accordion';
import DeviceInfo from 'react-native-device-info';
import SpinnerLoading from '../constant/spinnerLoading'
const CONST = require('../constant/const');
import Api from '../Api/Api';
import { registerKilledListener, registerAppListener } from "../constant/listeners";
import Slider from "react-native-slider";
import Svg, { Text as TextSvg } from "react-native-svg";

var feedbackArr = [{'id':'1','name':'abc','value':20},{'id':'2','name':'hijk','value':20},{'id':'3','name':'xyz','value':20}];
var width,height,session;

export default class selfAssessment extends Component {
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
      topbarTopMargin:0,
      reload:true,
      scoreData:[],
      isShowEditBtn:false,
      isLoading: false,
    }
    session = this;
  }
  componentDidMount() {
    registerAppListener(this.props.navigator,this.props.componentId);
    this.setState({topbarTopMargin: CONST.checkIphoneX()});
    this.getScoreData();
    // show edit button or not
    if(CONST.getUserType() == "old"){
      this.setState({isShowEditBtn : true});
    }else{
      this.setState({isShowEditBtn : false});
    }
  }
  getScoreData(){
    this.setState({
      isLoading: true
    });
    // get self assessment value
    Api.getSelfAssessment(this, DeviceInfo.getUniqueId(), function(parent, data){
        if (data.data != null) {
          let scoreArray = data.data.sort((a, b) => (b.score > a.score) ? 1 : -1);
          console.log('scoreArray: ', JSON.stringify(scoreArray));
          parent.setState({
            scoreData : scoreArray,
            isLoading: false
          });
        }
        parent.setState({
          //scoreData : data.data,
          isLoading: false
        });
    });
  }

  onBackClick(){
    if(CONST.getUserType() == "old"){
      //Navigation.popTo(CONST.HomeScreen);
      Navigation.push(session.props.componentId, {
        component: {
          name: CONST.HomeScreen,
        }
      });
    }else{
      Navigation.pop(this.props.componentId);
    }
  }
  onEdit(){
    // goto edit self assessment screen
    Navigation.push(session.props.componentId, {
      component: {
        name: CONST.SelfAssessmentCategoryScreen,
      }
    });
  }
  onHome(){
    // goto home screen
    if(session.state.isShowEditBtn){
      //Navigation.popTo(CONST.HomeScreen);
      Navigation.push(session.props.componentId, {
        component: {
          name: CONST.HomeScreen,
        }
      });
    }else{
      Navigation.push(this.props.componentId, {
        component: {
          id: CONST.HomeScreen,
          name: CONST.HomeScreen,
        }
      });
    }
  }

  render(){
    var sliderItems = session.state.scoreData.map(function(item, index) {
      // baritems list of selft assessment category
        if(session.state.scoreData.length > index)
        {
          let commonHeight = 30;
          let barlength=width*session.state.scoreData[index].score/100-35;  //session.props.feedbackArr[index].value
          barlength = Math.abs(barlength);
          console.log("barchart -- " + width + " - " + session.state.scoreData[index].score + " - " + barlength);
          let barColor = session.state.scoreData[index].color;
          return (
            <View key={index} style={{flex:1,height:commonHeight,backgroundColor:'transparent',
                marginTop:8,marginBottom:0}}>

                <View style={{width:barlength,height:commonHeight,backgroundColor:barColor,
                    borderTopLeftRadius:5,borderTopRightRadius:5}} />
                <Svg style={{flex:1, position: 'absolute', left: 0, top: 0}} height={commonHeight} width={width-32}>
                    <TextSvg
                          fill="#ffffff"
                          color="#ffffff"
                          stroke={barColor}
                          fontSize="17"
                          fontWeight="bold"
                          fontFamily='SFUIDisplay-Bold'
                          x="10"
                          y="21.5"
                          textAnchor="start"
                >{session.state.scoreData[index].name}</TextSvg>
                </Svg>
            </View>
          );
        }
    });
    return (
        <KeyboardAvoidingView style = {{flex: 1}} behavior="padding">
          <View style={{ flex: 1,backgroundColor: '#fff', marginTop: DeviceInfo.hasNotch() ? 25 : 0}}>
              <SpinnerLoading visible={this.state.isLoading} />
              {/*--------header--------*/}
              <View style={{marginTop:this.state.topbarTopMargin,height:CONST.headerHeight,backgroundColor: CONST.headerBackColor,flexDirection:'row',paddingLeft:16,paddingRight:16}}>
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
              {/*--------subtitle data--------*/}
              <View style={{flex:0.2,backgroundColor:'transparent',paddingLeft:16,paddingRight:16,marginTop:16,justifyContent:'center',alignItems:'center'}}>
                  <Text style={{flex:1,color: "#000",fontSize:20,textAlign:'center',fontFamily:'GoogleSans-Bold'}}>
                  Your Self Assessment:
                  </Text>
              </View>
              {/*--------slider list--------*/}
              <ScrollView style={{flex:1,paddingLeft:16,paddingRight:16,backgroundColor:'transparent'}}>
                <View style={{flex:1,flexDirection:'column',backgroundColor:'transparent'}}>
                    <View style={{paddingLeft:1,paddingRight:1}}>
                      {sliderItems}
                    </View>

                    <View style={{marginTop:32,marginBottom:32,marginLeft:4,marginRight:4}}>
                      {session.state.isShowEditBtn &&
                        <TouchableHighlight style={{justifyContent:'center',alignItems:'center',borderRadius:5,borderColor:'#4ec5c1',backgroundColor:'#4ec5c1',borderWidth:1,paddingTop:8,paddingBottom:8}} underlayColor='transparent' onPress={() => { this.onEdit(); }}>
                             <Text style={{color: "#fff",fontSize:20,fontFamily:'GoogleSans-Bold'}}>Edit</Text>
                        </TouchableHighlight>
                      }
                      <TouchableHighlight style={{justifyContent:'center',alignItems:'center',borderRadius:5,borderColor:'#4ec5c1',backgroundColor:'#4ec5c1',borderWidth:1,paddingTop:8,paddingBottom:8,marginTop:10}} underlayColor='transparent' onPress={() => { this.onHome(); }}>
                           <Text style={{color: "#fff",fontSize:20,fontFamily:'GoogleSans-Bold'}}>Home</Text>
                      </TouchableHighlight>
                    </View>
                </View>
              </ScrollView>
          </View>
        </KeyboardAvoidingView>
      );
  }
}
const styles = StyleSheet.create({
});
