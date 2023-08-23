import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,Image,Button,TouchableHighlight,ScrollView, StatusBar
} from 'react-native';
import { Navigation } from 'react-native-navigation';
import DeviceInfo from 'react-native-device-info';

import HTMLView from 'react-native-htmlview';
import myTerms from '../constant/termsText.json';
const CONST = require('../constant/const');

export default class terms extends Component {
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
    StatusBar.setBarStyle('dark-content', true);
  }

  onPress() {
    // go to info screen
    Navigation.push(this.props.componentId, {
      component: {
        name: CONST.InfoScreen,
      }
    });
  }

  render(){
      return (
        <View style={{ flex: 1,backgroundColor: '#fff', marginTop: DeviceInfo.hasNotch() ? 25 : 0}}>
          <View style={{flex: 0.2,alignItems: 'center',justifyContent:'center',backgroundColor:'transparent'}}>
            <Image style={{width: 200, height: 450}} source={CONST.headerlogo} resizeMode="contain" />
          </View>
          <View style={{flex: 0.7}}>
            <Text style={{color: '#191919',textAlign: 'center',paddingLeft:20,paddingRight:20,marginLeft:30,marginRight:30,marginBottom:10,fontSize:16,fontFamily:'SFUIDisplay-Bold'}}>
              Terms and Conditions</Text>
            <ScrollView contentContainerStyle={{backgroundColor:'#f7fffe',paddingTop:10,paddingBottom:10}}>
                <Text style={{color: '#333333',fontSize:15,marginLeft:25,marginRight:25,fontFamily:'SFUIDisplay-Regular'}}>{myTerms.termsText}</Text>
            </ScrollView>
          </View>
          <View style={{flex: 0.2,alignItems: 'center'}}>
            <TouchableHighlight style={{borderRadius: 3,alignSelf: 'center',marginTop:30}} underlayColor='transparent' onPress={() => { this.onPress(); }}>
                <View style={{backgroundColor: '#4ec5c1',alignItems: 'center',borderRadius: 3}}>
                  <Text style={{padding: 12,textAlign: 'center',fontSize: 12,color: '#FFF',fontWeight: 'bold',paddingLeft:80,paddingRight:80,fontFamily:'SFUIDisplay-Bold'}} >Accept</Text>
                </View>
             </TouchableHighlight>
          </View>
        </View>
      );
  }
}
const styles = StyleSheet.create({
});
