import moment from 'moment';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableHighlight,
  Image,
  Dimensions
} from 'react-native';
import * as Unicons from '@iconscout/react-native-unicons';
import DeviceInfo from 'react-native-device-info';
import Modal from "react-native-modal";
import Swipeout from 'react-native-swipeout';
import Api from '../Api/Api';

let { height, width } = Dimensions.get('window');

export default class ProfileShareItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isModalVisible: false,
    }
  }

  onItemDelete() {
    console.log('onItemDelete');
    this.setState({
      isModalVisible: true,
    })
  }

  onDeleteItemApi() {
    console.log('Profile Id: ', this.props.item.id);
    this.props.onChangeLoading(true);
    setTimeout(() => {
      this.setState({ isModalVisible: false })
    }, 100);
    try {
      Api.deleteProfileShare(this, DeviceInfo.getUniqueId(), this.props.item.id, function (parent, data) {
        parent.props.onCompleteAction();
        parent.setState({ isModalVisible: false })
      });
    } catch (e) {
      this.props.onChangeLoading(false);
      console.log('ItemDeleteError: ', e);
    }
  }

  onResendProfileShareClick() {
    this.props.onChangeLoading(true);
    try {
      Api.resendProfileShare(this, DeviceInfo.getUniqueId(), this.props.item.id, function (parent, data) {
        parent.props.onGetProfileUrl(data.data.url);
      })
    } catch (e) {
      this.props.onChangeLoading(false);
      console.log('Resend Profile Error: ', e);
    }
  }

  render() {
    const { item } = this.props;
    var dateArr = item.date_sent.split('-');
    if (this.state.isModalVisible) {
      return (
        <Modal animationIn={'fadeInDown'} animationOut={'fadeOutDown'} useNativeDriver={true}
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }} isVisible={this.state.isModalVisible}>

          <View style={{ width: width - 30, height: 150, backgroundColor: "white", justifyContent: 'center', alignItems: "center", borderRadius: 4, borderColor: "rgba(0, 0, 0, 0.1)" }}>
            <View style={{ flex: 0.5, justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent' }}>
              <Text style={{ color: "#000", fontSize: 20, padding: 8, justifyContent: 'center', alignItems: 'center', fontFamily: 'SFUIDisplay-Bold' }}>Cancel profile share and delete from share tracker?</Text>
            </View>
            <View style={{ flex: 0.5, width: width - 50, height: 50, justifyContent: 'center', backgroundColor: 'transparent' }}>
              <View style={{ flex: 1, flexDirection: 'row' }}>
                <TouchableHighlight style={{ flex: 0.5, borderRadius: 3, alignSelf: 'center', backgroundColor: '#4ec5c1', alignItems: 'center', borderRadius: 3, marginRight: 4 }} underlayColor='transparent' onPress={() => { this.onDeleteItemApi() }}>
                  <Text style={{ padding: 12, textAlign: 'center', fontSize: 18, color: 'white', fontFamily: 'SFUIDisplay-Bold' }} >Yes</Text>
                </TouchableHighlight>
                <TouchableHighlight style={{ flex: 0.5, borderRadius: 3, alignSelf: 'center', backgroundColor: '#ec576b', alignItems: 'center', borderRadius: 3, marginLeft: 4 }} underlayColor='transparent' onPress={() => { this.setState({ isModalVisible: false }) }}>
                  <Text style={{ padding: 12, textAlign: 'center', fontSize: 18, color: 'white', fontFamily: 'SFUIDisplay-Bold' }} >No</Text>
                </TouchableHighlight>
              </View>
            </View>
          </View>
        </Modal>
      )
    }
    return (
      <Swipeout
        autoClose={true}
        disabled={item.status == 'Completed' ? false : true}
        backgroundColor={'transparent'}
        right={[{ text: 'Clear', type: 'delete', onPress: () => this.onItemDelete() }]}>

        <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 16, paddingBottom: 16, borderBottomWidth: 1, borderColor: '#e8e8e8' }}>
          <View style={{ flex: 0.5, flexDirection: 'column', backgroundColor: 'transparent' }} >
            <Text style={style.itemProviderName}>{item.recipient_name}</Text>
            <Text style={style.itemDate}>{moment(item.date_sent, "YYYY-MM-DD").format('MMM D, YYYY')}</Text>
          </View>
          <View style={{ flex: 0.3, flexDirection: 'column', alignItems: 'flex-end', backgroundColor: 'transparent' }} >
            <Text style={style.itemStatusText}>{item.status.charAt(0).toUpperCase() + item.status.substr(1)}</Text>
          </View>

          <View style={{ flex: 0.3, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <TouchableHighlight
              style={style.itemCancelButton}
              underlayColor='transparent'
              onPress={() => { this.onItemDelete() }}>
              <Unicons.UilTimes size={24} color="#EC576B" />
            </TouchableHighlight>
            <TouchableHighlight
              style={style.itemResendButton}
              underlayColor='transparent'
              onPress={() => { this.onResendProfileShareClick(); }}>
              <Unicons.UilRedo size={24} color="#4EC5C1" />
            </TouchableHighlight>

            {/* <TouchableHighlight style={{ flex: 0.05, alignItems: 'center', }} underlayColor='transparent' onPress={() => { this.onResendProfileShareClick(); }}>
              <Image style={{ width: 20, height: 20 }} source={require('../img/reload.png')} resizeMode="contain" />
            </TouchableHighlight>
            <TouchableHighlight style={{ flex: 0.05, alignItems: 'center', marginTop: 10 }} underlayColor='transparent' onPress={() => {
              console.log('CancelRequest Called');
              this.onItemDelete()
            }}>
              <Image style={{ width: 20, height: 20 }} source={require('../img/cancel.png')} resizeMode="contain" />
            </TouchableHighlight> */}
          </View>
        </View>
      </Swipeout>
    )
  }
}

const style = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 16,
    paddingTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(33, 44, 44, 0.15)',
    marginTop: 10,
  },
  itemProviderName: {
    fontFamily: 'SFUIDisplay-Bold',
    fontWeight: '700',
    fontSize: 16,
    color: 'rgba(33, 44, 44, 0.85)',
    lineHeight: 22
  },
  itemDate: {
    fontFamily: 'SFUIDisplay-Medium',
    fontWeight: '500',
    fontSize: 14,
    color: 'rgba(33, 44, 44, 0.5)',
    lineHeight: 22,
    marginTop: 2
  },
  itemStatusText: {
    fontFamily: 'SFUIDisplay-SemiBold',
    fontWeight: '600',
    fontSize: 14,
    color: 'rgba(33, 44, 44, 0.5)',
    lineHeight: 22,
    marginLeft: 4,
    marginRight: 4,
    textAlign: 'right'
  },
  itemCancelButton: {
    alignItems: 'center',
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 8,
    backgroundColor: 'rgba(236, 87, 107, 0.15)',
    justifyContent: 'center'
  },
  itemResendButton: {
    alignItems: 'center',
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 8,
    backgroundColor: 'rgba(78, 197, 193, 0.15)',
    justifyContent: 'center'
  }
})

ProfileShareItem.defaultPropps = {
  item: {},
  onCompleteAction: () => { },
  onChangeLoading: () => { },
  onGetProfileUrl: () => { }
}
