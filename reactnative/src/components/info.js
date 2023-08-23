import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text, Dimensions,
  View, Image, FlatList, TouchableHighlight, ScrollView, StatusBar
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Navigation } from 'react-native-navigation';
import { registerKilledListener, registerAppListener } from "../constant/listeners";
const CONST = require('../constant/const');
import DeviceInfo from 'react-native-device-info';

var width, height;

export default class info extends Component {

  static options(passProps) {
    return {
      topBar: {
        translucent: false,
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
    StatusBar.setBarStyle('dark-content', true);
    height = Dimensions.get('window').height;
    width = Dimensions.get('window').width;
    this.state = {
      topbarTopMargin: 0,
    }
  }
  componentDidMount() {
    registerAppListener(this.props.navigator, this.props.componentId);
    this.setState({ topbarTopMargin: CONST.checkIphoneX() })
    // check if we have to show back button or not
    if (this.props.from == 'menu') {
      this.setState({ showBackBtn: true });
    } else {
      this.setState({ showBackBtn: false });
    }
  }
  onBackClick() {
    Navigation.pop(this.props.componentId);
  }

  onInfoSubmitClick() {
    if (this.props.from == 'menu') {
      Navigation.pop(this.props.componentId);
    } else {
      Navigation.push(this.props.componentId, {
        component: {
          name: CONST.ProfileScreen,
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
  }

  render() {
    return (
      <View style={{ flex: 1, backgroundColor: '#fff', flexDirection: 'column', marginTop: DeviceInfo.hasNotch() ? 25 : 0 }}>
        {/*--------header--------*/}
        <View style={{ marginTop: this.state.topbarTopMargin, height: CONST.headerHeight, backgroundColor: CONST.headerBackColor, flexDirection: 'row', paddingLeft: 16, paddingRight: 16 }}>
          {/*left*/}
          {this.state.showBackBtn ?
            <TouchableHighlight style={{ flex: 0.1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' }} underlayColor='transparent' onPress={() => { this.onBackClick(); }}>
              <Image style={{ width: CONST.headerLeftMenuSize, height: CONST.headerLeftMenuSize }} source={require('../img/back.png')} resizeMode="contain" />
            </TouchableHighlight>
            :
            <View style={{ flex: 0.1 }} />
          }
          {/*center*/}
          <View style={{ flex: 0.8, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' }}>
            <Image style={{ width: 150, height: 56 }} source={CONST.headerlogo} resizeMode="contain" />
          </View>
          {/*right*/}
          <View style={{ flex: 0.1 }} />
        </View>
        <ScrollView contentContainerStyle={{ paddingLeft: 32, paddingRight: 32, marginTop: 8 }}>
          {/*--------title and description--------*/}
          <View style={{ flexDirection: 'column' }}>
            <Text style={{ color: "#000", fontSize: 13, fontFamily: 'Lato-Italic' }}>
              {"“Don't follow your passion.  Instead, focus on your talent. Find out what you're good at and then invest 10,000 hours in it.”"}
            </Text>
            <Text style={{ color: "#000", fontSize: 10, fontFamily: 'Lato-Italic', marginTop: 4 }}>
              {"- NYU Stern School of Business Professor and L2, Inc. Founder"}
            </Text>

            <Text style={{ color: "#000", fontSize: 13, fontFamily: 'Lato-Italic', marginTop: 6 }}>
              {"\n“To find out what one is fitted to do, and to secure an opportunity to do it, is the key to happiness.”"}
            </Text>
            <Text style={{ color: "#000", fontSize: 10, fontFamily: 'Lato-Italic', marginTop: 4 }}>
              {"— John Dewey"}
            </Text>

            <Text style={{ color: "#000", fontSize: 18, fontFamily: 'Lato-Italic', marginTop: 10 }}>
              {"\nEveryone carries a unique set of natural abilities or talents.  It is like your finger print.  Understanding your natural ability profile allows you to focus your development on the right areas so you can realize your full potential.  Everyone has talents.  It is whether you are aware of them and what you do with them that makes the difference"}
            </Text>

            <Text style={{ color: "#000", fontSize: 18, fontFamily: 'Lato-Italic', marginTop: 2 }}>
              {"\nNatably helps you discover and understand your talent profile through interaction with others.  Others can affirm your awareness of the talents you have, as well as help you discover new ones."}
            </Text>
          </View>
          {/*--------send and receive ghraphic and text--------*/}
          <View style={{ marginTop: 32, marginBottom: 32, alignItems: 'center', backgroundColor: 'transparent' }}>
            <Image style={{ width: width, height: 350 }} source={require('../img/info_graphics.png')} resizeMode="contain" />
          </View>
          {!this.state.showBackBtn &&
            <View style={{ flexDirection: 'column' }}>
              <Text style={{ color: "#000", fontSize: 18, textAlign: 'center', fontFamily: 'Lato-Bold' }}>
                {"Don’t wait.  Start your talent \ndiscover journey now."}
              </Text>
            </View>
          }
          {/*--------another description--------*/}
          {!this.state.showBackBtn &&
            <TouchableHighlight style={{ borderRadius: 3, alignSelf: 'center', marginTop: 30, marginBottom: 30 }} underlayColor='transparent' onPress={() => { this.onInfoSubmitClick(); }}>
              <View style={{ backgroundColor: '#4ec5c1', alignItems: 'center', justifyContent: 'center', borderRadius: 20 }}>
                <Text style={{ fontFamily: 'Lato-Bold', fontSize: 22, color: '#FFF', paddingLeft: 80, paddingRight: 80, paddingTop: 8, paddingBottom: 8 }}>Start</Text>
              </View>
            </TouchableHighlight>
          }
        </ScrollView>
      </View>
    );
  }
}
const styles = StyleSheet.create({

});
