import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text, Dimensions,
  View, Image, Button, TouchableHighlight, ScrollView
} from 'react-native';
import { Navigation } from 'react-native-navigation';
const CONST = require('../constant/const');

var width, height;
export default class sidemenu extends Component {

  static options(passProps) {
    return {
      topBar: {
        drawBehind: true,
        visible: false,
        animate: false
      }
    };
  }

  constructor(props) {
    super(props);
    height = Dimensions.get('window').height;
    width = Dimensions.get('window').width;
  }
  componentDidMount() {
  }

  onEditProfile() {
    Navigation.push('appStack', {
      component: {
        name: CONST.ProfileScreen,
        passProps: {
          from: 'edit',
        },
      }
    });
    this.closeDrawer();
  }
  onAppInfo() {
    Navigation.push('appStack', {
      component: {
        name: CONST.InfoScreen,
        passProps: {
          from: 'menu',
        },
      }
    });
    this.closeDrawer();
  }
  onSlider() {
    Navigation.push('appStack', {
      component: {
        id: CONST.SelfAssessmentScreen,
        name: CONST.SelfAssessmentScreen,
      }
    });
    this.closeDrawer();
  }

  onResponses() {
    Navigation.push('appStack', {
      component: {
        id: CONST.ResponsesScreen,
        name: CONST.ResponsesScreen,
      }
    });
    this.closeDrawer();
  }
  onExplore() {
    Navigation.push('appStack', {
      component: {
        id: CONST.ExploreScreen,
        name: CONST.ExploreScreen,
      }
    });
    this.closeDrawer();
  }

  onProfileShare() {
    Navigation.push('appStack', {
      component: {
        id: CONST.ProfileShareScreen,
        name: CONST.ProfileShareScreen,
      }
    });
    this.closeDrawer();
  }

  closeDrawer() {
    Navigation.mergeOptions(this.props.componentId, {
      sideMenu: {
        left: {
          visible: false
        }
      }
    });
  }

  render() {
    return (
      <View style={{ flex: 1, backgroundColor: '#fff', flexDirection: 'column', width: width * 70 / 100 }}>
        <View style={{ flex: 0.2, backgroundColor: 'transparent', alignItems: 'center' }}>
          <Image style={{ flex: 1, width: 150, height: 350, backgroundColor: 'transparent' }} source={CONST.headerlogo} resizeMode="contain" />
        </View>
        <View style={{ flex: 0.8, flexDirection: 'column' }}>

          <TouchableHighlight style={{ flex: 0.1, padding: 16, justifyContent: 'center' }} underlayColor='transparent' onPress={() => { this.onEditProfile(); }}>
            <Text style={{ fontSize: 20, color: '#4ec5c1', padding: 4, fontFamily: 'GoogleSans-Bold' }}>Account</Text>
          </TouchableHighlight>

          {/* <TouchableHighlight style={{ flex: 0.1, padding: 16, justifyContent: 'center' }} underlayColor='transparent' onPress={() => { this.onExplore(); }}>
            <Text style={{ fontSize: 20, color: '#4ec5c1', padding: 4, fontFamily: 'GoogleSans-Bold' }}>Explore</Text>
          </TouchableHighlight> */}

          <TouchableHighlight style={{ flex: 0.1, padding: 16, backgroundColor: 'transparent', justifyContent: 'center' }} underlayColor='transparent' onPress={() => { this.onSlider(); }}>
            <Text style={{ fontSize: 20, color: '#4ec5c1', padding: 4, fontFamily: 'GoogleSans-Bold' }}>Self Assessment</Text>
          </TouchableHighlight>

          <TouchableHighlight style={{ flex: 0.1, padding: 16, justifyContent: 'center' }} underlayColor='transparent' onPress={() => { this.onResponses(); }}>
            <Text style={{ fontSize: 20, color: '#4ec5c1', padding: 4, fontFamily: 'GoogleSans-Bold' }}>Responses</Text>
          </TouchableHighlight>

          {false &&
            <TouchableHighlight style={{ flex: 0.1, padding: 16, justifyContent: 'center' }} underlayColor='transparent' onPress={() => { this.onProfileShare(); }}>
              <Text style={{ fontSize: 20, color: '#4ec5c1', padding: 4, fontFamily: 'GoogleSans-Bold' }}>Profile Share</Text>
            </TouchableHighlight>
          }

          <TouchableHighlight style={{ flex: 0.1, padding: 16, backgroundColor: 'transparent', justifyContent: 'center' }} underlayColor='transparent' onPress={() => { this.onAppInfo(); }}>
            <Text style={{ fontSize: 20, color: '#4ec5c1', padding: 4, fontFamily: 'GoogleSans-Bold' }}>App Info</Text>
          </TouchableHighlight>

        </View>
      </View>
    );
  }
}
