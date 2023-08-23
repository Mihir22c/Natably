import React, { Component } from 'react';
import {
    Platform,
    StyleSheet,
    Text, Linking,
    View, Image, Button, TouchableHighlight, ScrollView, StatusBar, Dimensions, FlatList
} from 'react-native';
import { Navigation } from 'react-native-navigation';
import { registerAppListener } from '../constant/listeners';
import SpinnerLoading from '../constant/spinnerLoading';
const CONST = require('../constant/const');
import DeviceInfo from 'react-native-device-info';
import YoutubePlayer from 'react-native-youtube-iframe';
import { Rating } from 'react-native-ratings';
import StarRating from 'react-native-star-rating';
import Api from '../Api/Api';
import { Vimeo } from 'react-native-vimeo-iframe';

var width, height;
var barHeight = 30;
var collapseBarChartBackHeight = 240;
var openBarChartBackHeight;
var isBarCollapse = true;
var session;
var deleteFrom = '';
var deleteId = '';
var feedbackThumbnailId = '';
var feedbackProviderName = '';
var dashedWidth = 1.5, dashedColor = '#bfbfbf';
var isMessagesAvailable = false;
var isMailAvailable = false;
var isWhatsappAvailable = false;
var shareOptions = {};
var currentLinkData = {};
const videoCallbacks = {
    timeupdate: (data) => console.log('timeupdate: ', data),
    play: (data) => console.log('play: ', data),
    pause: (data) => console.log('pause: ', data),
    fullscreenchange: (data) => console.log('fullscreenchange: ', data),
    ended: (data) => console.log('ended: ', data),
    controlschange: (data) => console.log('controlschange: ', data),
};
const videoTags = [
    { title: 'Virtoso', color: '#DB6575' },
    { title: 'Personnable', color: '#49D2D6' },
    { title: 'Advisor', color: '#F5834B' }
]
// const categories = [
//     { title: 'Advisor', color: '#49D2D6' },
//     { title: 'Articulate', color: '#DB6575' },
//     { title: 'Crowd Reader', color: '#79AFF9' },
//     { title: 'Discoverer', color: '#49D2D6' },
//     { title: 'Grit', color: '#79AFF9' },
//     { title: 'Harmonic', color: '#E8D638' },
//     { title: 'Math Wiz', color: '#797979' },
//     { title: 'Mnemonist', color: '#7D0FC9' },
//     { title: 'Personable', color: '#79AFF9' },
//     { title: 'Rain Maker', color: '#21C57F' },
//     { title: 'Sage', color: '#F5834B' },
//     { title: 'Strategist', color: 'rgba(33, 44, 44, 0.5)' },
//     { title: 'Swagger', color: '#F5834B' },
//     { title: 'Trail Blazer', color: 'rgba(33, 44, 44, 0.5)' },
//     { title: 'Virtuoso', color: '#DB6575' },
//     { title: 'Visionary', color: '#DB6575' },
// ]
export default class explore extends Component {

    static options(passProps) {
        return {
            topBar: {
                drawBehind: true,
                visible: false,
                animate: false
            },
            sideMenu: {
                left: {
                    width: 250,
                    visible: false, // hide drwaer from showing first when this screen is loaded
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
            barchartData: [],
            postRequestData: [],
            scoreData: [],
            barchartHeight: collapseBarChartBackHeight,
            barchartHeaderFlex: 0.3,
            barchartListFlex: 0.65,
            barchartButtonFlex: 0.15,
            barChartArrow: require('../img/down_arrow.png'),
            isModalVisible: false,
            topbarTopMargin: 0,
            barchartTitle: '',
            feedback: '',
            showNoDataImage: false,
            barTextPosition: { left: 0 },
            isLoading: false,
            groupImage: null,
            isShareSheetVisible: false,
            isFeedbackModalVisible: false,
            isPlay: false,
            exploreItem: props?.item,
            rating: 0,
            categories: [],
            explorePost: {}
        }
        openBarChartBackHeight = height - 20;
        session = this;
    }

    onBackClick() {
        Navigation.pop(this.props.componentId);
    }

    componentDidMount() {
        registerAppListener(this.props.navigator, this.props.componentId);
        CONST.setUserType("old");

        isBarCollapse = false;
        this.setState({ topbarTopMargin: CONST.checkIphoneX() });
        this.navigationEventListener = Navigation.events().bindComponent(this);

        this.getExplorePost()
    }

    getExplorePost() {
        Api.getExplorePost(this, this.state.exploreItem?.id, DeviceInfo.getUniqueId(), function (parent, data) {
            console.log('data', data);
            if (data.status === 200) {
                let { categories, description, title, topic } = data?.data
                if (data?.data) {
                    parent.setState({ explorePost: data?.data })
                }
            }
            else {
                this.setState({
                    isLoading: false
                });
                return;
            }
        })
    }
    onMenuClick() {
        Navigation.mergeOptions(this.props.componentId, {
            sideMenu: {
                left: {
                    visible: true,
                }
            }
        });
    }
    onClickCategories(item, videoId) {
        Navigation.push(this.props.componentId, {
            component: {
                name: CONST.ExploreDetailScreen,
                options: {
                    topBar: {
                        drawBehind: true,
                        visible: false,
                        animate: false
                    }
                },
                passProps: { item: this.state.explorePost, category: item, videoId: videoId }
            },
        });
    }

    giveArticleRate(star) {
        this.setState({ rating: star })
        Api.setArticleRateById(this, this.state.exploreItem?.id, DeviceInfo.getUniqueId(), star, this.state.category?.id, function (parent, data) {
            console.log('data', data);
            if (data.status === 200) {
                parent.getArticlesByCategoryId()
            }
        })
    }

    render() {
        console.log('props', this.props);
        let { exploreItem, rating, explorePost } = this.state
        // console.log('exploreItem', exploreItem?.resource?.split('='));
        // let videoId = exploreItem?.resource?.split('=')[1]
        let ytVideoId
        if (exploreItem?.resource?.includes('https://youtu.be/')) {
            ytVideoId = exploreItem?.resource?.replace('https://youtu.be/', '')
        }
        else if (exploreItem?.resource?.includes('https://www.youtube.com/watch?v=')) {
            ytVideoId = exploreItem?.resource?.replace('https://www.youtube.com/watch?v=', '')
        }
        else {
            ytVideoId = exploreItem?.resource
        }
        // console.log('videoId', ytVideoId);
        return (
            <View style={{ flex: 1, backgroundColor: '#FFFFFF', flexDirection: 'column', marginTop: DeviceInfo.hasNotch() ? 25 : 0 }}>
                <SpinnerLoading visible={this.state.isLoading} />
                <View style={{ marginTop: this.state.topbarTopMargin, height: CONST.headerHeight, backgroundColor: CONST.headerBackColor, flexDirection: 'row', paddingLeft: 16, paddingRight: 16 }}>
                    {/*left*/}
                    <TouchableHighlight style={{ flex: 0.1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' }} underlayColor='transparent' onPress={() => { this.onBackClick(); }}>
                        <Image style={{ width: CONST.headerLeftMenuSize, height: CONST.headerLeftMenuSize }} source={require('../img/back.png')} resizeMode="contain" />
                    </TouchableHighlight>
                    {/* <TouchableHighlight style={{ flex: 0.1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' }} underlayColor='transparent' onPress={() => { this.onMenuClick(); }}>
                        <Image style={{ width: CONST.headerLeftMenuSize, height: CONST.headerLeftMenuSize }} source={require('../img/menu.png')} resizeMode="contain" />
                    </TouchableHighlight> */}
                    {/*center*/}
                    <View style={{ flex: 0.8, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' }}>
                        <Image style={{ width: 150, height: 56 }} source={CONST.headerlogo} resizeMode="contain" />
                    </View>
                    {/*right*/}
                    <View style={{ flex: 0.1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' }}>
                        {this.state.groupImage != null &&
                            <Image style={{ width: 40, height: 40 }} source={{ uri: this.state.groupImage }} resizeMode="contain" />
                        }
                    </View>
                </View>
                <View style={{ flex: 1, paddingHorizontal: 10 }}>
                    {/* ----- Explore ----- */}
                    {/* ----- Video player ----- */}
                    <View style={{ backgroundColor: '#212C2C', borderRadius: 10, paddingBottom: 12 }}>
                        {
                            ytVideoId ?
                                <View style={{ borderRadius: 10, height: width / 1.875, overflow: 'hidden' }} onStartShouldSetResponder={() => { }}>
                                    <YoutubePlayer
                                        initialPlayerParams={{}}
                                        webViewStyle={{ backgroundColor: '#212C2C', borderRadius: 10, paddingBottom: 12, }}
                                        height={width / 1.875}
                                        play={this.state.isPlay}
                                        onFullScreenChange={(param) => console.log('param', param)}
                                        videoId={ytVideoId}
                                    />
                                </View> :
                                <View View style={{ minHeight: width / 1.875, minWidth: '100%', }}>
                                    <Vimeo
                                        containerStyle={{ minHeight: width / 1.875, minWidth: '100%', borderRadius: 10 }}
                                        params={'api=1&autoplay=0&controls=0'}
                                        videoId='226053498'
                                        handlers={videoCallbacks}
                                        allowsInlineMediaPlayback={true}
                                    />
                                </View>
                        }
                        {/* Video rating */}
                        <View style={{ flexDirection: 'row', justifyContent: "space-between", paddingHorizontal: 12, alignItems: 'center' }}>
                            <Text style={{ color: "#fff", fontSize: 16, flexWrap: 'wrap', fontFamily: 'SFUIDisplay-Regular', fontWeight: '500', lineHeight: 22 }}>Not really</Text>
                            <StarRating
                                rating={rating}
                                emptyStar={require('../img/star.png')}
                                emptyStarColor={'rgba(255, 255, 255, 0.2)'}
                                // fullStar={require('../img/star.png')}
                                // halfStar={'ios-star-half'}
                                selectedStar={(star) => this.giveArticleRate(star)}
                                animation='pulse'
                                fullStarColor={'#E8D638'}
                                starSize={35}
                                starStyle={{ paddingHorizontal: 3, }} />
                            <Text style={{ color: "#fff", fontSize: 16, flexWrap: 'wrap', fontFamily: 'SFUIDisplay-Regular', fontWeight: '500', lineHeight: 22 }}>Absolutely</Text>
                        </View>
                    </View>

                    <View View style={{ minHeight: width / 1.875, minWidth: '100%', }}>
                        <Vimeo
                            containerStyle={{ minHeight: width / 1.875, minWidth: '100%', borderRadius: 10 }}
                            params={'api=1&autoplay=0&controls=0'}
                            videoId='226053498'
                            handlers={videoCallbacks}
                            allowsInlineMediaPlayback={true}
                        />
                    </View>
                    {/* Tags related video */}
                    <View style={{ flexDirection: "row", justifyContent: 'space-between', alignItems: 'center', marginTop: 20, }}>
                        <FlatList horizontal data={videoTags}
                            scrollEnabled={false}
                            contentContainerStyle={{ height: 30 }}
                            renderItem={({ item, index }) => {
                                let { color, title } = item
                                return (
                                    <TouchableHighlight style={{ backgroundColor: color, borderRadius: 10, height: 25, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5, marginStart: index !== 0 ? 3 : 0, marginEnd: index !== videoTags.length - 1 ? 3 : 0 }}>
                                        <Text style={{ color: "#fff", fontSize: 12, flexWrap: 'wrap', fontWeight: '500' }}>{title}</Text>
                                    </TouchableHighlight>
                                )
                            }}
                        />
                        <Text style={{ color: "#000", fontSize: 16, flexWrap: 'wrap', fontFamily: 'SFUIDisplay-Regular', fontWeight: '600', lineHeight: 22 }}>NEWEST VIDEO</Text>
                    </View>
                    {/* item description */}
                    <View style={{ paddingVertical: 10 }}>
                        <Text style={{ color: "#000", fontSize: 18, flexWrap: 'wrap', fontFamily: 'SFUIDisplay-Regular', fontWeight: '600', lineHeight: 22 }}>{explorePost?.topic}</Text>
                        <Text style={{ color: "#212C2C", fontSize: 18, flexWrap: 'wrap', fontFamily: 'SFUIDisplay-Regular', fontWeight: '400', lineHeight: 26 }}>{explorePost?.description
                        }</Text>
                    </View>
                    {/* item categories */}
                    <ScrollView contentContainerStyle={{}} showsVerticalScrollIndicator={false}>
                        <Text style={{ color: "#212C2C", fontSize: 24, flexWrap: 'wrap', fontFamily: 'SFUIDisplay-Regular', fontWeight: '700', lineHeight: 28 }}>Categories</Text>
                        <View style={{}}>
                            <ScrollView
                                scrollEnabled={false}
                                contentContainerStyle={{ flexWrap: 'wrap', flexDirection: 'row', paddingTop: 6 }}>
                                {
                                    explorePost?.categories?.map((item, index) => {
                                        let { color, name } = item
                                        return (
                                            <TouchableHighlight style={{ backgroundColor: color, borderRadius: 20, paddingVertical: 10, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 15, marginStart: index !== 0 ? 3 : 0, marginEnd: index !== videoTags.length - 1 ? 3 : 0, marginVertical: 6 }} onPress={() => this.onClickCategories(item, ytVideoId)}>
                                                <Text style={{ color: "#fff", fontSize: 16, flexWrap: 'wrap', fontWeight: '600' }}>{name}</Text>
                                            </TouchableHighlight>
                                        )
                                    })}
                            </ScrollView>
                        </View>
                    </ScrollView>
                </View>
            </View >
        );
    }
}
//module.exports = splash;
