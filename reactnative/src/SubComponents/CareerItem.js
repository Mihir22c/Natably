import { Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import CircularProgress from 'react-native-circular-progress-indicator'
import Chip from './Chip'
import MCIcons from 'react-native-vector-icons/MaterialCommunityIcons'

const Applied = require('../img/Applied.png')
const Check = require('../img/CheckRound.png')
const Cross = require('../img/CrossRound.png')
const Redirected = require('../img/Redirected.png')

const CareerItem = ({ extraStyle, onPress, item }) => {
    const { app_user_match_percentage, company_logo, company_name, department, email, field_name, id, job_title, location, type, web_url, description, bookmarked, status } = item


    function visitWeb() {
        if (web_url !== '') {
            Linking.openURL(web_url)
        }
    }

    return (
        <TouchableOpacity style={[styles.container, extraStyle]} onPress={onPress} activeOpacity={0.5}>
            <View style={styles.topCont}>
                <View style={{ flexDirection: 'row', flex: 0.75 }}>
                    <Image source={company_logo ? { uri: company_logo } : require('../img/menu.png')} style={styles.img} />
                    <View style={{ paddingStart: 12 }}>
                        <Text style={styles.title}>{job_title}</Text>
                        <View style={styles.companyCon}>
                            <Text style={styles.subTitle}>{company_name}</Text>
                            <Image style={styles.dot} source={require('../img/Dot.png')} />
                            <Text style={styles.subTitle}>{location}</Text>
                        </View>
                    </View>
                </View>
                <CircularProgress
                    value={app_user_match_percentage}
                    radius={33}
                    duration={500}
                    progressValueColor={app_user_match_percentage >= 50 ? '#49D2D6' : app_user_match_percentage < 50 && app_user_match_percentage > 25 ? '#E8D638' : app_user_match_percentage <= 25 ? '#EC576B' : '#000'}
                    maxValue={100}
                    inActiveStrokeColor='#F3F3F3'
                    titleColor={'#ffffff'}
                    activeStrokeColor={app_user_match_percentage >= 50 ? '#49D2D6' : app_user_match_percentage < 50 && app_user_match_percentage > 25 ? '#E8D638' : app_user_match_percentage <= 25 ? '#EC576B' : '#000'}
                    titleStyle={{ fontWeight: 'bold' }}
                    valueSuffix={'%'}
                    activeStrokeWidth={7}
                    inActiveStrokeWidth={7}
                    subtitleStyle={{
                        fontSize: 16,
                        flexWrap: 'wrap',
                        fontFamily: 'SFUIDisplay-Regular',
                        fontWeight: '700',
                        lineHeight: 19
                    }}
                    valueSuffixStyle={{
                        fontSize: 16,
                        flexWrap: 'wrap',
                        fontFamily: 'SFUIDisplay-Regular',
                        fontWeight: '700',
                        lineHeight: 19
                    }}
                    clockwise={false}
                    rotation={90}
                />
            </View>
            <View style={styles.bottomCont}>
                <Text style={styles.desc}>{description}</Text>
            </View>
            <View style={styles.bottomCont}>
                <View style={{ flexDirection: field_name?.length > 25 ? 'column' : 'row' }}>
                    <Chip extraStyle={{ alignSelf: 'flex-start' }} title={type} />
                    <Chip extraStyle={{ alignSelf: 'flex-start', marginTop: field_name?.length > 25 ? 5 : 0 }} title={field_name} />
                </View>
                {web_url ? <TouchableOpacity style={styles.webLinkCont} onPress={() => visitWeb()}>
                    <View style={styles.round}>
                        <MCIcons name='web' size={18} color={'#ffffff'} />
                    </View>
                    <Text style={styles.webLinkText}>Visit Web</Text>
                </TouchableOpacity> : null}
                {status ? <View style={styles.bottomInnerBottomContainer}>
                    <View style={styles.bottomInnerCommonCont}>
                        <Image style={styles.jobStatusImage} source={status === 'Applied' ? Applied : status === 'Advanced' ? Check : status === 'Redirected' ? Redirected : status === 'Declined' ? Cross : {}} />
                        <Text style={styles.jobStatusText}>{status}</Text>
                    </View>
                    {bookmarked && <View style={styles.bottomInnerCommonCont}>
                        <Image style={styles.bookmarkedImage} source={require('../img/BookmarkFilled.png')} />
                        <Text style={styles.savedText}>Liked</Text>
                    </View>}
                </View> : null}
            </View>
        </TouchableOpacity >
    )
}

export default CareerItem

const styles = StyleSheet.create({
    container: {
        // flex: 1,
        padding: 16,
        borderWidth: 1,
        borderColor: '#EFEFEF',
        borderRadius: 8,
        marginVertical: 6
    },
    img: {
        height: 60,
        width: 60,
        borderRadius: 11,
    },
    topCont: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    bottomCont: {
        // flexDirection: "row"
    },
    title: {
        color: "#212C2C",
        fontSize: 16,
        flexWrap: 'wrap',
        fontFamily: 'SFUIDisplay-Regular',
        fontWeight: '700',
        lineHeight: 19,
        flex: 1,
    },
    subTitle: {
        color: "#212C2C",
        fontSize: 13,
        flexWrap: 'wrap',
        fontFamily: 'SFUIDisplay-Regular',
        fontWeight: '500',
        lineHeight: 16,
        // flex: 1,
    },
    desc: {
        marginVertical: 12,
        color: "#212C2CB2",
        fontSize: 14,
        flexWrap: 'wrap',
        fontFamily: 'SFUIDisplay-Regular',
        fontWeight: '400',
        lineHeight: 20
    },
    tagContainer: {

    },
    tagText: {

    },
    round: {
        padding: 4,
        backgroundColor: '#79AFF9',
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: "center"
    },
    webLinkCont: {
        flexDirection: "row",
        alignItems: 'center',
        // justifyContent: 'space-between',
        // flex: 1,
        // marginStart: 8,
        marginTop: 8
    },
    webLinkText: {
        color: '#79AFF9',
        fontSize: 13,
        flexWrap: 'wrap',
        fontFamily: 'SFUIDisplay-Regular',
        fontWeight: '600',
        lineHeight: 20,
        marginStart: 3
    },
    companyCon: {
        flexDirection: 'row',
        marginTop: 5,
        alignItems: "center",
        flex: 1,
        flexWrap: "wrap",
    },
    dot: {
        height: 3,
        width: 3,
        resizeMode: 'contain',
        marginHorizontal: 6
    },
    bottomInnerBottomContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: "center",
        paddingTop: 12
    },
    bookmarkedImage: {
        height: 24,
        width: 18,
        resizeMode: "contain"
    },
    savedText: {
        color: '#10827B',
        fontSize: 13,
        flexWrap: 'wrap',
        fontFamily: 'SFUIDisplay-Regular',
        fontWeight: '500',
        lineHeight: 19,
        marginStart: 6
    },
    bottomInnerCommonCont: {
        flexDirection: "row",
        alignItems: "center"
    },
    jobStatusImage: {
        height: 20,
        width: 20,
        resizeMode: 'contain'
    },
    jobStatusText: {
        color: '#79AFF9',
        fontSize: 13,
        flexWrap: 'wrap',
        fontFamily: 'SFUIDisplay-Regular',
        fontWeight: '500',
        lineHeight: 19,
        marginStart: 6
    }
})