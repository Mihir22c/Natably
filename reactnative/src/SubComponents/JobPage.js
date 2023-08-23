import { Dimensions, FlatList, Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import Modal from 'react-native-modal'
import CircularProgress from 'react-native-circular-progress-indicator';
import ExpandableList from 'react-native-expandable-section-flatlist';
import Chip from './Chip';
import DeviceInfo, { hasNotch } from 'react-native-device-info';
import MCIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import TalentsRequired from './TalentsRequiredItem';
import Button from './Button';
import ImageButton from './ImageButton';
import TestimonialsItem from './TestimonialsItem';
import { TextStroke } from 'react-native-textstroke';
import Api from '../Api/Api';

let { height, width } = Dimensions.get('window');

const JobPage = ({ extraStyle, visible, onBackdropPress, data, onApplyPress }) => {

    const { id, match_percentage, job_title, company_name, company_logo, location, web_url, matching_talents, matching_skills, talents_required, description, my_testimonials, bookmarked, type } = data

    let newMatching_talents = matching_talents ? Object.entries(matching_talents).map(([name, object]) => ({ name, ...object })) : []

    const [showTestimonials, setShowTestimonials] = useState(false)
    const [selectedSkills, setSelectedSkills] = useState([])
    const [selectedTestimonial, setSelectedTestimonial] = useState([])
    const [isBookmarked, setBookmarked] = useState(bookmarked)
    const [loading, setLoading] = useState(false)

    function onHeaderPress() {

    }

    const _renderRow = ({ item, index }) => {
        const { name, bar_color, job_bar_width, user_bar_width } = item
        let barLength = width * job_bar_width / 100 - 32;
        return (
            job_bar_width > 0 &&
            <View style={[styles.rowItemCon, { borderColor: bar_color, width: `${job_bar_width}%`, height: 33, }]}>
                <View style={[{ backgroundColor: bar_color, width: `${user_bar_width}%`, height: 33, borderRadius: 8, position: 'absolute', start: -1 }]}>
                </View>
                <View style={{ position: 'absolute', left: 14, justifyContent: 'center', flex: 1 }} height={32} width={width - 32}>
                    <TextStroke stroke={1} color={bar_color}>
                        <Text style={styles.talentTitle}>{name}</Text>
                    </TextStroke>
                </View>
            </View>
        )
    }

    function selectSkill(item) {
        let { name } = item
        let newSkills = [...selectedSkills]
        // setSelectedSkills(item)
        if (!newSkills.includes(name)) {
            newSkills.push(name)
        }
        else {
            newSkills = newSkills.filter(item => item !== name)
        }
        setSelectedSkills(newSkills)
    }

    function selectTestimonial(id) {
        let testimonials = [...selectedTestimonial]
        if (!testimonials.includes(id)) {
            testimonials.push(id)
        }
        else {
            testimonials = testimonials.filter((item) => item !== id)
        }
        setSelectedTestimonial(testimonials)
    }

    function onSavePress() {
        Api.getJobBookmarked(DeviceInfo.getUniqueId(), id, async function (data) {
            if (data.status === 200) {
                setBookmarked(data?.data?.bookmarked)
                // parent.setState({ bookmarked: data?.data?.bookmarked })
            }
            else {
                setLoading(false)
                return;
            }
        })

    }

    function visitWeb() {
        Linking.openURL(web_url)
    }

    return (
        console.log('test'),
        <Modal isVisible={visible} style={[styles.container, extraStyle]} backdropColor='#00000066' onBackdropPress={onBackdropPress}>
            <View style={styles.innerContainer}>
                <View style={{ padding: 15, flex: 1 }}>
                    <TouchableOpacity style={styles.downArrowCon} onPress={onBackdropPress}>
                        <Image style={styles.downArrowImg} source={require('../img/down_arrow.png')} />
                    </TouchableOpacity>
                    <ScrollView>
                        <View style={styles.topContainer}>
                            <View style={{ flex: 0.8 }}>
                                <Text style={styles.jobTitle}>Job Title</Text>
                                <Text style={styles.jobTitleText}>{job_title}</Text>
                            </View>
                            <View style={styles.topEndCon}>
                                <Text style={[styles.matchTitle, { color: match_percentage >= 50 ? '#49D2D6' : match_percentage < 50 && match_percentage > 25 ? '#E8D638' : match_percentage <= 25 ? '#EC576B' : '#000' }]}>Match</Text>
                                <CircularProgress
                                    value={match_percentage}
                                    radius={33}
                                    duration={100}
                                    progressValueColor={match_percentage >= 50 ? '#49D2D6' : match_percentage < 50 && match_percentage > 25 ? '#E8D638' : match_percentage <= 25 ? '#EC576B' : '#000'}
                                    maxValue={100}
                                    inActiveStrokeColor='#F3F3F3'
                                    titleColor={'white'}
                                    activeStrokeColor={match_percentage >= 50 ? '#49D2D6' : match_percentage < 50 && match_percentage > 25 ? '#E8D638' : match_percentage <= 25 ? '#EC576B' : '#000'}
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
                        </View>
                        <Text style={styles.jobMatchText}>You have<Text style={{ color: match_percentage >= 50 ? '#49D2D6' : match_percentage < 50 && match_percentage > 25 ? '#E8D638' : match_percentage <= 25 ? '#EC576B' : '#000' }}> {match_percentage}% match </Text>on this job!</Text>
                        <View style={styles.middleCon}>
                            <Image source={company_logo ? { uri: company_logo } : require('../img/menu.png')} style={styles.img} />
                            <View style={styles.middleInnerCon}>
                                <Text style={styles.fTitle}>Company Name & Location</Text>
                                <Text style={styles.title}>{company_name}</Text>
                                <Text style={styles.subTitle}>{location}</Text>
                            </View>
                        </View>
                        <View style={styles.talentsCon}>
                            <Text style={styles.talentText}>talents</Text>
                            <FlatList
                                data={newMatching_talents}
                                renderItem={_renderRow}
                            />
                        </View>
                        <View style={styles.skillsCon}>
                            <Text style={styles.talentText}>skills</Text>
                            <FlatList
                                contentContainerStyle={{ flexWrap: 'wrap', flexDirection: 'row', }}
                                data={matching_skills}
                                renderItem={({ index, item }) => <Chip disabled extraStyle={item?.match !== true ? styles.unSelectedChip : styles.selectedChip} title={item?.name} onPressChip={() => selectSkill(item)} titleStyle={item?.match !== true ? styles.unSelectedChipText : styles.selectedChipText} />}
                            />
                            <View style={{ flexDirection: 'row', alignItems: "center" }}>
                                <Image style={{ width: 30, height: 10, resizeMode: "contain" }} source={require('../img/RecRoundDotted.png')} />
                                <Text style={styles.smallText}>DESIRED FOR THE JOB</Text>
                                <Image style={{ width: 30, height: 10, resizeMode: "contain" }} source={require('../img/RecRoundFilled.png')} />
                                <Text style={styles.smallText}>YOUR MATCHING TALENTS AND SKILLS</Text>
                            </View>
                        </View>
                        <View style={styles.jobDetailsCon}>
                            <Text style={styles.headingText}>Job Details</Text>
                            <Text style={styles.descText}>{description}</Text>
                            <View style={styles.jobDetailsInnerTopCon}>
                                <View>
                                    <Text style={styles.headingText2}>Type</Text>
                                    <Chip extraStyle={styles.chip2} titleStyle={styles.chipInnerText2} title={'Full-time'} disabled />
                                </View>
                                <View>
                                    <Text style={styles.headingText2}>Field</Text>
                                    <Chip extraStyle={styles.chip2} titleStyle={styles.chipInnerText2} title={'Hospitality and Tourism'} disabled />
                                </View>
                            </View>
                            <View style={styles.jobDetailsInnerBottomCon}>
                                <View>
                                    <Text style={styles.headingText2}>Department</Text>
                                    <Chip extraStyle={styles.chip2} titleStyle={styles.chipInnerText2} title={'Front Desk'} disabled />
                                </View>
                                {web_url ? <View>
                                    <Text style={styles.headingText2}>Visit website</Text>
                                    <TouchableOpacity style={styles.chip} activeOpacity={0.5} onPress={() => visitWeb()}>
                                        <MCIcons name='web' size={18} color={'#79AFF9'} />
                                        <Text style={styles.chipText} >{web_url?.length > 20 ? web_url.substring(8, 25) : web_url}</Text>
                                    </TouchableOpacity>
                                </View> : null}
                            </View>
                        </View>
                        <View style={styles.talentsReqCon}>
                            <Text style={styles.headingText}>Talent Details</Text>
                            <FlatList data={talents_required} renderItem={({ item, index }) => <TalentsRequired item={item} />} />
                        </View>
                        {!showTestimonials ? <TouchableOpacity style={styles.viewEditBtn} activeOpacity={0.5} onPress={() => setShowTestimonials(!showTestimonials)}>
                            <Text style={styles.viewEditBtnText}>+ View/Edit My Testimonials</Text>
                        </TouchableOpacity> :
                            <View style={styles.testimonialsCon}>
                                <Text style={styles.headingText}>MY MATCHING TESTIMONIALS <Text style={styles.headingInnerText}>(Tap Card to Select)</Text></Text>
                                <View style={{ flexDirection: 'row', alignItems: "center", justifyContent: 'flex-start' }}>
                                    <Image style={{ width: 30, height: 10, resizeMode: "contain" }} source={require('../img/Selected.png')} />
                                    <Text style={styles.smallText2}>Selected</Text>
                                    <Image style={{ width: 30, height: 10, resizeMode: "contain" }} source={require('../img/UnSelected.png')} />
                                    <Text style={styles.smallText2}>Not Selected</Text>
                                </View>
                                <FlatList
                                    contentContainerStyle={{ paddingTop: 24 }}
                                    data={my_testimonials}
                                    renderItem={({ item, index }) => {
                                        return (<TestimonialsItem extraStyle={selectedTestimonial?.includes(item?.id) ? styles.selectedTestimonial : {}} item={item} onPress={() => selectTestimonial(item?.id)} />)
                                    }}
                                />
                            </View>

                        }
                    </ScrollView>
                </View>
                <View style={styles.bottomCon}>
                    <Button extraStyle={styles.applyBtn} title={type === "Example" ? "Use for Cover Letter" : "Apply"} onPress={() => onApplyPress(selectedTestimonial)} />
                    <ImageButton extraStyle={styles.bookmarkBtn} imageStyle={styles.bookmarkImg} image={isBookmarked === true ? require('../img/BookmarkFilled.png') : require('../img/Bookmark.png')} onPress={() => onSavePress()} />
                </View>
            </View>
        </Modal >
    )
}

export default JobPage

const styles = StyleSheet.create({
    container: {
        width: width,
        height: height,
        margin: 0,
        justifyContent: 'flex-end',
        // flex: 1,
    },
    innerContainer: {
        flex: 0.8,
        backgroundColor: '#fff',
        borderRadius: 15,
    },
    downArrowCon: {
        alignSelf: 'center',
    },
    downArrowImg: {
        height: 30,
        width: 30,
        resizeMode: 'contain'
    },
    topContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    jobTitle: {
        color: "#212C2C80",
        fontSize: 13,
        flexWrap: 'wrap',
        fontFamily: 'SFUIDisplay-Regular',
        fontWeight: '500',
        lineHeight: 15
    },
    jobTitleText: {
        color: "#212C2C",
        fontSize: 24,
        flexWrap: 'wrap',
        fontFamily: 'SFUIDisplay-Regular',
        fontWeight: '700',
        lineHeight: 28,
    },
    matchTitle: {
        color: "#49D2D6",
        fontSize: 13,
        flexWrap: 'wrap',
        fontFamily: 'SFUIDisplay-Regular',
        fontWeight: '700',
        lineHeight: 15,
        marginEnd: 6
    },
    jobMatchText: {
        color: "#212C2CB2",
        fontSize: 16,
        flexWrap: 'wrap',
        fontFamily: 'SFUIDisplay-Regular',
        fontWeight: '600',
        lineHeight: 22,
        marginTop: 24
    },
    topEndCon: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    bottomCon: {
        height: 105,
        width: '100%',
        backgroundColor: "#FFFFFF",
        shadowColor: '#6E6E85',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 2,
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 14,
    },
    middleCon: {
        marginTop: 20,
        flexDirection: 'row'
    },
    middleInnerCon: {
        paddingStart: 12
    },
    img: {
        height: 60,
        width: 60,
        borderRadius: 11,
    },
    fTitle: {
        color: "#212C2C80",
        fontSize: 13,
        flexWrap: 'wrap',
        fontFamily: 'SFUIDisplay-Regular',
        fontWeight: '500',
        lineHeight: 15
    },
    title: {
        color: "#212C2C",
        fontSize: 24,
        flexWrap: 'wrap',
        fontFamily: 'SFUIDisplay-Regular',
        fontWeight: '700',
        lineHeight: 29
    },
    subTitle: {
        color: "#212C2C",
        fontSize: 13,
        flexWrap: 'wrap',
        fontFamily: 'SFUIDisplay-Regular',
        fontWeight: '500',
        lineHeight: 16
    },
    talentText: {
        color: "#212C2CB2",
        fontSize: 14,
        flexWrap: 'wrap',
        fontFamily: 'SFUIDisplay-Regular',
        fontWeight: '500',
        lineHeight: 17,
        textTransform: "uppercase",
        marginBottom: 6
    },
    headingText: {
        color: "#212C2C",
        fontSize: 19,
        flexWrap: 'wrap',
        fontFamily: 'SFUIDisplay-Regular',
        fontWeight: '700',
        lineHeight: 23,
    },
    headingInnerText: {
        color: "#212C2C80",
        fontSize: 14,
        flexWrap: 'wrap',
        fontFamily: 'SFUIDisplay-Regular',
        fontWeight: '500',
        lineHeight: 17,
    },
    descText: {
        color: "#212C2CB2",
        fontSize: 16,
        flexWrap: 'wrap',
        fontFamily: 'SFUIDisplay-Regular',
        fontWeight: '400',
        lineHeight: 22,
        marginTop: 16,
        letterSpacing: 0.05
    },
    smallText: {
        color: "#212C2CB2",
        fontSize: 9,
        flexWrap: 'wrap',
        fontFamily: 'SFUIDisplay-Regular',
        fontWeight: '600',
        lineHeight: 22,
        marginStart: 6,
        flex: 1
    },
    smallText2: {
        color: "#212C2CB2",
        fontSize: 9,
        flexWrap: 'wrap',
        fontFamily: 'SFUIDisplay-Regular',
        fontWeight: '600',
        lineHeight: 22,
        textTransform: "uppercase",
        marginStart: 3,
    },
    talentsCon: {
        marginTop: 24
    },
    skillsCon: {
        marginTop: 24
    },
    jobDetailsCon: {
        marginTop: 24
    },
    jobDetailsInnerCon: {

    },
    jobDetailsInnerTopCon: {
        paddingTop: 16,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    jobDetailsInnerBottomCon: {
        paddingTop: 16,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    unSelectedChip: {
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: '#D1D1D180',
        marginVertical: 6,
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: "#fff"
    },
    unSelectedChipText: {
        color: '#212C2CB2',
    },
    selectedChip: {
        marginVertical: 6,
        backgroundColor: '#10827B',
        paddingHorizontal: 16,
        paddingVertical: 8
    },
    selectedChipText: {
        color: '#ffffff'
    },
    chip: {
        backgroundColor: '#10827B0D',
        marginEnd: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
        flexDirection: 'row',
        marginTop: 5,
    },
    chip2: {
        marginTop: 5,
        backgroundColor: '#10827B0D',
    },
    chipText: {
        color: '#79AFF9',
        fontSize: 14,
        flexWrap: 'wrap',
        fontFamily: 'SFUIDisplay-Regular',
        fontWeight: '500',
        lineHeight: 16,
        marginStart: 5,
    },
    chipInnerText: {
        color: '#79AFF9',
    },
    chipInnerText2: {
        fontSize: 14,
        fontWeight: '500'
    },
    headingText2: {
        color: "#212C2C80",
        fontSize: 13,
        flexWrap: 'wrap',
        fontFamily: 'SFUIDisplay-Regular',
        fontWeight: '500',
        lineHeight: 16,
    },
    talentsReqCon: {
        paddingTop: 22,
    },
    viewEditBtn: {
        borderWidth: 1,
        borderColor: '#79AFF9',
        borderStyle: 'dashed',
        borderRadius: 8,
        padding: 10,
        marginTop: 12,
        alignItems: 'center',
        justifyContent: 'center'
    },
    viewEditBtnText: {
        color: '#79AFF9',
        fontSize: 16,
        flexWrap: 'wrap',
        fontFamily: 'SFUIDisplay-Regular',
        fontWeight: '500',
        lineHeight: 22,
    },
    applyBtn: {
        width: '85%',
        height: 44
    },
    bookmarkImg: {
        height: 24,
        width: 24
    },
    bookmarkBtn: {
        marginEnd: 10,
        marginTop: 10
    },
    testimonialsCon: {
        paddingTop: 43,
    },
    rowItemCon: {
        borderWidth: 1,
        borderStyle: 'dashed',
        borderRadius: 8,
        marginVertical: 4,
        justifyContent: 'center',
    },
    talentTitle: {
        color: '#fff',
        fontSize: 14,
        flexWrap: 'wrap',
        fontFamily: 'SFUIDisplay-Regular',
        fontWeight: '600',
        lineHeight: 17,
    },
    selectedTestimonial: {
        borderColor: '#4EC5C1',
    }
})