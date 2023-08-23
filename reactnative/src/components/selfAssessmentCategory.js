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

var feedbackArr = [], thumbArr = [];
var width,height,session;

export default class selfAssessmentCategory extends Component {
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
      activeSections:[],
      topbarTopMargin:0,
      thumbnailArr : [],
      isLoading: false
    }
    session = this;
  }
  componentDidMount() {
    registerAppListener(this.props.navigator,this.props.componentId);
    this.setState({topbarTopMargin: CONST.checkIphoneX()});
    // get thumbnail list
    this.getThumbnailList();
  }
  getThumbnailList(){
    this.setState({
      isLoading: true
    });
    // get thumbnail list
    Api.getSelfThumbnailList(this, DeviceInfo.getUniqueId(), function(parent, data){
        console.log('getSelfThumbnailList: ', data);
      parent.setState({
        isLoading: false
      });
        if(CONST.getUserType() == "old"){
          var acriveSectionArr = [];
          // loop for set pre-selected thumbnail data start
          for(var i=0;i<data.data.length;i++){
            if(data.data[i].socreSelected){
              acriveSectionArr.push(i);
            }
          }
          // loop for set pre-selected thumbnail data end
          parent.setState({activeSections : acriveSectionArr});
        }
        parent.setState({thumbnailArr : data.data});
    });
  }

  onBackClick(){
    Navigation.pop(this.props.componentId);
  }

  onNext(){
    this.setState({
      isLoading: true
    });
    //save pre-selected / new selcted thumbnail
    Api.putSelfSelectedThumbnail(this, DeviceInfo.getUniqueId(), thumbArr, function(parent, data){
      parent.setState({
        isLoading: false
      });
        Navigation.push(session.props.componentId, {
          component: {
            name: CONST.SelfAssessmentSliderScreen,
            passProps: {
              feedbackArr: feedbackArr,
            }
          }
        });
    });
  }

  addFeedbackCategory(id,name,isActive){
    thumbArr.findIndex(x => x.id == id);
    var index = feedbackArr.findIndex(x => x.id == id)
    // generated a new array with selected value for passing to next screen
    if (index === -1 && isActive == true){
        feedbackArr.push({'id':id,'name':name,'value':catValue});
        thumbArr.push(id);
    }else if(index != -1 && isActive == false){
      feedbackArr.splice(index, 1);
      thumbArr.splice(index, 1);
    }
    var catValue = 100/feedbackArr.length;
    var totalAdjustmentVal = 0;
    // loop for adding self assessment value to category start
    for(var i=0;i<feedbackArr.length-1;i++){
      feedbackArr[i].value = Math.round(catValue);
      totalAdjustmentVal = totalAdjustmentVal + feedbackArr[i].value;
    }
    // loop for adding self assessment value to category end
    // loop for setting adjusted value to last element start
    for(var i=0;i<feedbackArr.length;i++){
      if(i == feedbackArr.length-1){
          feedbackArr[i].value = Math.round(100-totalAdjustmentVal);
      }
    }
    // loop for setting adjusted value to last element end
  }

  _renderHeader = (content, index, isActive, sections) => {
    let commonHeight = 100;
    this.addFeedbackCategory(content.id,content.name,isActive);
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
      <View style={{backgroundColor:'transparent'}} >
      </View>
    );
  };
  _updateSections = activeSections => {
    this.setState({ activeSections });
  };

  render(){
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
                  Please select between one and five areas that YOU enjoy and believe you do well in
                  </Text>
              </View>
              {/*--------category list--------*/}
              <ScrollView style={{flex:1,paddingLeft:16,paddingRight:16,backgroundColor:'transparent'}}>
                <View style={{flex:1,flexDirection:'column',backgroundColor:'transparent'}}>
                    <Text style={{flex:0.2,color: "#8a8a8a",fontSize:12,marginTop:8,marginBottom:8,fontFamily:'GoogleSans-Regular',flexWrap:'wrap'}}>
                    To select an area, touch it. To deselect, touch it again.
                    </Text>
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
                      <View style={{marginTop:32,marginBottom:32,marginLeft:4,marginRight:4}}>
                        <TouchableHighlight style={{flex:0.1,justifyContent:'center',alignItems:'center',borderRadius:5,borderColor:'#4ec5c1',backgroundColor:'#4ec5c1',borderWidth:1,paddingTop:8,paddingBottom:8}} underlayColor='transparent' onPress={() => { this.onNext(); }}>
                             <Text style={{color: "#fff",fontSize:20,fontFamily:'GoogleSans-Bold'}}>Next</Text>
                        </TouchableHighlight>
                      </View>
                    }
                </View>
              </ScrollView>
          </View>
        </KeyboardAvoidingView>
      );
  }
}
const styles = StyleSheet.create({
});
