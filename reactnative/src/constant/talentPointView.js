import React from 'react';
import {
    View,
    Text,
    TouchableHighlight,
    StyleSheet
} from 'react-native';
import * as Unicons from '@iconscout/react-native-unicons';
import Swipeout from 'react-native-swipeout';
import moment from 'moment';
import { Image } from 'react-native';

function TalentPointView(props) {
    const { rowData, onClear, onDelete, onResend, type, onView } = props;
    return (
        <Swipeout
            autoClose={true}
            disabled={rowData.status == 'Completed' ? false : true}
            backgroundColor={'transparent'}
            right={[{ text: 'Clear', type: 'delete', onPress: () => { onClear(); } }]}>

            <View style={style.itemContainer}>
                <View style={{ flex: 0.5 }}>

                    {type === 'job_application' && <Text style={style.job_title}>{rowData?.job_title}</Text>}
                    <Text style={[style.itemProviderName, { color: type === 'job_application' ? '#10827B' : {} }]}>{type === 'job_application' ? rowData?.company_name : rowData.provider_name}</Text>
                    <Text style={style.itemDate}>{type === 'job_application' ? rowData.date : moment(rowData.date_sent, "YYYY-MM-DD").format('MMM D, YYYY')}</Text>
                </View>
                <View style={{ flex: 0.3 }}>
                    <Text numberOfLines={1} style={style.itemStatusText}>{rowData.status.charAt(0).toUpperCase() + rowData.status.substr(1)}</Text>
                </View>
                <View style={{ flex: type === "job_application" ? 0.5 : 0.3, flexDirection: 'row', }}>
                    {rowData.status == 'Completed' ?
                        <View />
                        :
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                            {type === "job_application" ?
                                <>
                                    {rowData?.status !== "Completed" ?
                                        <>
                                            <TouchableHighlight
                                                style={style.itemEyeButton}
                                                underlayColor='transparent'
                                                onPress={() => { onView(rowData?.link_url); }}>
                                                <Image style={{ height: 24, width: 24 }} source={require('../img/Eye.png')} resizeMode='contain' />
                                            </TouchableHighlight>
                                            <TouchableHighlight
                                                style={style.itemCancelButton}
                                                underlayColor='transparent'
                                                onPress={() => { onDelete(); }}>
                                                <Unicons.UilTimes size={24} color="#EC576B" />
                                            </TouchableHighlight>
                                            <TouchableHighlight
                                                style={style.itemResendButton}
                                                underlayColor='transparent'
                                                onPress={() => { onResend() }}>
                                                <Unicons.UilRedo size={24} color="#4EC5C1" />
                                            </TouchableHighlight>
                                        </>
                                        :

                                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: "center" }}>
                                            <Text numberOfLines={1} style={style.itemStatusText}>{rowData.status.response_choice}</Text>
                                        </View>}
                                </> :
                                <>
                                    <TouchableHighlight
                                        style={style.itemCancelButton}
                                        underlayColor='transparent'
                                        onPress={() => { onDelete(); }}>
                                        <Unicons.UilTimes size={24} color="#EC576B" />
                                    </TouchableHighlight>
                                    <TouchableHighlight
                                        style={style.itemResendButton}
                                        underlayColor='transparent'
                                        onPress={() => { onResend() }}>
                                        <Unicons.UilRedo size={24} color="#4EC5C1" />
                                    </TouchableHighlight>
                                </>
                            }
                        </View>
                    }
                </View>
            </View>
        </Swipeout>
    )
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
    job_title: {
        fontFamily: 'SFUIDisplay-Bold',
        fontWeight: '700',
        fontSize: 16,
        color: '#79AFF9',
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
    itemEyeButton: {
        alignItems: 'center',
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#79AFF91A',
        justifyContent: 'center'
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

export default TalentPointView;