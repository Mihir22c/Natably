import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,Linking,
  View,Image,Button,TouchableHighlight,ScrollView
} from 'react-native';
import { Navigation } from 'react-native-navigation';
const CONST = require('../constant/const');

export default class splash extends Component {

  static options(passProps) {
      return {
        topBar: {
          drawBehind: true,
          visible: false,
          animate: false
        }
      };
  }

  constructor(props){
    super(props);
  }
  componentDidMount() {
    // check for deep link url
    console.log('Splash Screen');
    Linking.getInitialURL().then(url => {
      console.log('Navigate url componentDidMount ------> ' + url);
      CONST.deeplink(url,this.props.componentId);
    });
  }

  render(){
      return (
        <View style={{ flex: 1,backgroundColor: '#fff',alignItems: 'center',justifyContent:'center' }}>
            <Image style={{width: 250, height: 400}} source={CONST.headerlogo} resizeMode="contain" />
        </View>
      );
  }
}
//module.exports = splash;
