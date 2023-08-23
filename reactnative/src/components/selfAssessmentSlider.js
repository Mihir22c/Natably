import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,Alert,Dimensions,
  Text,TextInput,FlatList,KeyboardAvoidingView,Linking,
  View,Image,Button,TouchableHighlight,ScrollView, StatusBar
} from 'react-native';
import { Navigation } from 'react-native-navigation';
import Accordion from 'react-native-collapsible/Accordion';
import DeviceInfo from 'react-native-device-info';
import SpinnerLoading from '../constant/spinnerLoading'
const CONST = require('../constant/const');
import Api from '../Api/Api';
import { registerKilledListener, registerAppListener } from "../constant/listeners";
// import Slider from "react-native-slider";
import Slider from '@react-native-community/slider';

var feedbackArr = [{'id':'1','name':'abc','value':20},{'id':'2','name':'hijk','value':20},{'id':'3','name':'xyz','value':20}];
var width,height,session;
var backupArr=[], thumbArr=[];

export default class selfAssessmentSlider extends Component {
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
      reload: true,
      isLoading: false
    }
    session = this;
  }
  componentDidMount() {
    registerAppListener(this.props.navigator,this.props.componentId);
    this.setState({topbarTopMargin: CONST.checkIphoneX()});
    // get selected category array from previous page category list
    backupArr = session.props.feedbackArr;
  }

  onBackClick(){
    Navigation.pop(this.props.componentId);
  }
  onConfirm(){
    var feedbackArr = session.props.feedbackArr;
    // loop for generating a selected category array with adjusted value to save on backend start
    for(var i=0;i<feedbackArr.length;i++){
      thumbArr.push({'id':feedbackArr[i].id,'score':feedbackArr[i].value});
    }
    // loop for generating a selected category array with adjusted value to save on backend end
    this.setState({
      isLoading: true
    });
    // save adjusted value of selected category to backend
    Api.putSelfScore(this, DeviceInfo.getUniqueId(), thumbArr, function(parent, data){
      parent.setState({
        isLoading: false
      });
        Navigation.push(session.props.componentId, {
          component: {
            name: CONST.SelfAssessmentScreen,
          }
        });
    });
  }

  async changeSlider(index,id,val,steps){
    // //S2 (new) = S2 (old) - stepsMoved / (length-1) * S2 (old) / Average (S2, S3, S4)
    var totalVal = 100;
    var stepsMoved=0;
    var myaverage=0;
    var arrLength=session.props.feedbackArr.length;
    var adjustmentIndex = arrLength - 1;

    // loop for getting value of steps moved on slider start
    for(var i = 0 ; i < arrLength ; i++){
      if(session.props.feedbackArr[i].id == id){
        stepsMoved = session.props.feedbackArr[i].value - val;
        if(i == arrLength-1){
          adjustmentIndex = arrLength-2;
        }
      }
    }
    // loop for getting value of steps moved on slider end
    var differenceValue = 0;
    // check for differance value from previous value of slider
    if(stepsMoved > 0){
      differenceValue = Math.floor(stepsMoved/(arrLength-1));
    }else{
      differenceValue = Math.ceil(stepsMoved/(arrLength-1));
    }
    console.log('slider differenceValue ----- ' + index + " ---- " + stepsMoved + ' ------ ' + differenceValue + " ------ " + steps);
    console.log('slider differenceValue session.props.feedbackArr ----- 1 -' + JSON.stringify(session.props.feedbackArr));

    session.props.feedbackArr[index].value = val;
    var adjustmentValue;
    var adjustmentArr = [];

    var balanceSteps = 0;
    var flag = true;

    // loop for adjusting all slider value based on changd one start
    while(flag){
      var sum1 = 0;
      // loop for change value of sliders rather than selected one start
      for(var i = 0 ; i < arrLength ; i++){
        if(i==index){

        }else{
          if((session.props.feedbackArr[i].value + differenceValue) < 0){
            session.props.feedbackArr[i].value = 0;
          }else{
            session.props.feedbackArr[i].value = session.props.feedbackArr[i].value + differenceValue;
          }
        }
        sum1 += session.props.feedbackArr[i].value;
      }
      // loop for change value of sliders rather than selected one end
      console.log("differenceValue 1 -> i:"+ i + " sum1:" + sum1 + " differenceValue:"+ differenceValue);
      // check if slider value is not more than or less than 100
      if(sum1 != 100){
        stepsMoved = 100 - sum1;
        var differenceValue = 0;
        if(stepsMoved > 0){
          differenceValue = Math.floor(stepsMoved/(arrLength-1));
        }else{
          differenceValue = Math.ceil(stepsMoved/(arrLength-1));
        }
        if(differenceValue == 0 && sum1 != 100){
          // loop for setting adjusted value to last item start
          for(var i = arrLength - 1 ; i >= 0 ; i--){
            if(i==index){

            }else{
              if((session.props.feedbackArr[i].value + stepsMoved) >= 0){
                session.props.feedbackArr[i].value = (session.props.feedbackArr[i].value + stepsMoved);
                flag = false;
                break;
              }
            }
          }
          // loop for setting adjusted value to last item end
        }
      }else{
        flag = false;
      }
    }
    // loop for adjusting all slider value based on changd one end
    this.setState({reload:true});
  }

  render(){
    var sliderItems = session.props.feedbackArr.map(function(item, index) {
      // slider items view array
        if(session.props.feedbackArr.length > index)
        {
          return (
            <View key={index} style={{flex:1,flexDirection: 'column',backgroundColor:'#fff',marginTop:4,marginBottom:4,marginRight:2,paddingLeft:12,paddingRight:12,paddingTop:4,paddingBottom:4}} >
                <View style={{flexDirection:'row'}}>
                  <Text style={{flex:0.8,backgroundColor:'transparent',color: "#000",fontSize:18,fontFamily:'SFUIDisplay-Bold'}} numberOfLines={1}>{session.props.feedbackArr[index].name}</Text>
                  <View style={{flex: 0.2,backgroundColor:'transparent',alignItems:'flex-end',fontFamily:'SFUIDisplay-Regular'}}>
                    <Text style={{color: "#4ec5c1",fontSize:16}} numberOfLines={1}>{session.props.feedbackArr[index].value}%</Text>
                  </View>
                </View>
                <Slider
                      animateTransitions={true}
                      animationType={'timing'}
                      minimumValue={0}
                      maximumValue={100}
                      minimumTrackTintColor='#4ec5c1'
                      maximumTrackTintColor='#f1f1f1'
                      thumbTintColor='#4ec5c1'
                      thumbStyle={{width: 5, height: 5 , borderRadius:50}}
                      step = {1}
                      value={session.props.feedbackArr[index].value}
                      // onValueChange={value => session.changeSlider(session.props.feedbackArr[index].id,value,(session.props.feedbackArr[index].value-value))}
                      onSlidingComplete={value => {
                        setTimeout(() => {
                          session.changeSlider(index,session.props.feedbackArr[index].id,value,(session.props.feedbackArr[index].value-value))
                        },1000)}}
                />
            </View>
          );
        }
    });
    return (
        <KeyboardAvoidingView style = {{flex: 1}} behavior="padding">
          <View style={{ flex: 1,backgroundColor: '#fff', marginTop: DeviceInfo.hasNotch() ? 25 : 0}}>
              <SpinnerLoading visible={this.state.isLoading} />
              {/*--------header--------*/}
              <View style={{marginTop:this.state.topbarTopMargin,height: CONST.headerHeight,backgroundColor: CONST.headerBackColor,flexDirection:'row',paddingLeft:16,paddingRight:16}}>
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
                  How do your talents compare in strength?
                  </Text>
              </View>
              {/*--------slider list--------*/}
              <ScrollView style={{flex:1,paddingLeft:16,paddingRight:16,backgroundColor:'transparent'}}>
                <View style={{flex:1,flexDirection:'column',backgroundColor:'transparent'}}>
                    <Text style={{flex:0.2,color: "#8a8a8a",fontSize:12,marginTop:8,marginBottom:8,fontFamily:'GoogleSans-Regular',flexWrap:'wrap',textAlign:'center'}}>
                    Please adjust sliders to show relative strength of each talent.
                    Note that bars adjust automatically so that the sum total of all scales equals to 100%.
                    </Text>

                    {sliderItems}

                    <View style={{marginTop:32,marginBottom:32,marginLeft:4,marginRight:4}}>
                      <TouchableHighlight style={{justifyContent:'center',alignItems:'center',borderRadius:5,borderColor:'#4ec5c1',backgroundColor:'#4ec5c1',borderWidth:1,paddingTop:8,paddingBottom:8}} underlayColor='transparent' onPress={() => { this.onConfirm(); }}>
                           <Text style={{color: "#fff",fontSize:20,fontFamily:'GoogleSans-Bold'}}>Confirm</Text>
                      </TouchableHighlight>
                      <TouchableHighlight style={{justifyContent:'center',alignItems:'center',borderRadius:5,borderColor:'#4ec5c1',backgroundColor:'#4ec5c1',borderWidth:1,paddingTop:8,paddingBottom:8,marginTop:10}} underlayColor='transparent' onPress={() => { this.onBackClick(); }}>
                           <Text style={{color: "#fff",fontSize:20,fontFamily:'GoogleSans-Bold'}}>Back to Categories</Text>
                      </TouchableHighlight>
                    </View>
                </View>
              </ScrollView>
          </View>
        </KeyboardAvoidingView>
      );
  }
}
