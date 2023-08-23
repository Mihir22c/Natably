import React, { Component } from 'react';
import {
    Platform,
    StyleSheet,
    Dimensions,
    Alert,
    Linking,
    Text,
    TextInput,
    FlatList,
    TouchableOpacity,
    View,
    Image,
    TouchableHighlight,
    ScrollView,
    StatusBar,
    Keyboard,
    Clipboard,
    RefreshControl,
    KeyboardAvoidingView,
} from 'react-native';
import { Navigation } from 'react-native-navigation';
import Modal from "react-native-modal";
import Ionicons from 'react-native-vector-icons/Ionicons';
import DeviceInfo from 'react-native-device-info';
import * as Unicons from '@iconscout/react-native-unicons';
import SpinnerLoading from '../constant/spinnerLoading'
const CONST = require('../constant/const');
import Api from '../Api/Api';
import { registerAppListener } from "../constant/listeners";
import Share, { ShareSheet, Button } from 'react-native-share';
import Toast, { BaseToast } from 'react-native-toast-message';
import TalentPointView from '../constant/talentPointView';
import { openInbox } from 'react-native-email-link'
import FastImage from 'react-native-fast-image';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import BlurModel from '../constant/BlurModel';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
var width, height;
var deleteId = '';
var session;
var currentLinkID = null;
var isMessagesAvailable = false;
var isMailAvailable = false;
var isWhatsappAvailable = false;
var isOutLookAvailable = false;
var currentLinkData = {};
let shareLink = "";
let shareName = "";

const toastConfig = {
    info: (props) => (
        <BaseToast
            {...props}
            style={{ borderLeftColor: '#87CEFA' }}
            text1NumberOfLines={4}
        />
    )
}

export default class ApplyJob extends Component {
    static options(passProps) {
        return {
            topBar: {
                drawBehind: true,
                visible: false,
                animate: false
            },
            sideMenu: {
                left: {
                    // height:50,
                    // visible: false, // hide drwaer from showing first when this screen is loaded
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
            keyboardOffset: 0,
            topbarTopMargin: 0,
            postApplicationData: [],
            isModalVisible: false,
            isRequestStatusModal: false,
            isLoading: false,
            jobTitle: "",
            companyName: "",
            recruiterName: "",
            jobInterestReason: "",
            profileAvatar: '',
            isFromEdit: false,
            profileName: "",
            linkedInURL: "",
            past_applications: [],
            alreadyApplied: false,
            jobType: "",
            appliedJobData: {},
            responseChoice: "",
            recruiterResponse: "",
            jobUrl: "",
            preview: "0",
            isCameraOpen: false,
            isRecruiterNameEmpty: false,
            isCompNameEmpty: false,
            isJobTitleEmpty: false,
            isApplicantNameEmpty: false,
            jobId: 0,
            contentInsetTop: 0
        }
        session = this;
    }
    componentDidMount() {
        registerAppListener(this.props.navigator, this.props.componentId);
        this.setState({ topbarTopMargin: CONST.checkIphoneX() });
        // get past request data
        // this.getPastApplicationApi(true);
        if (this.props?.jobDetails) {
            const { id, company_name, job_title, past_applications, already_applied, user, type, response_choice, link_url, recruiter_response } = this.props?.jobDetails
            const { linkedin_url, photo, name } = user
            this.setState({
                companyName: company_name,
                jobTitle: job_title,
                past_applications: past_applications,
                alreadyApplied: already_applied,
                linkedInURL: linkedin_url,
                profileName: name,
                profileAvatar: photo,
                jobType: type,
                responseChoice: response_choice,
                jobUrl: link_url,
                recruiterResponse: recruiter_response,
                jobId: id
            })
        }

        const operator = Platform.select({ ios: '&', android: '?' });

        Linking.canOpenURL(`sms:${operator}&addresses=null&body=${""}`).then(supported => {
            if (supported) {
                isMessagesAvailable = true;
            }
        });
        Linking.canOpenURL('mailto:support@example.com').then(supported => {
            if (supported) {
                isMailAvailable = true;
            }
        });
        Linking.canOpenURL('whatsapp://send?text=').then(supported => {
            if (supported) {
                isWhatsappAvailable = true;
            }
        });
        Linking.canOpenURL('ms-outlook://emails/inbox').then(supported => {
            if (supported) {
                isOutLookAvailable = true;
            }
        });

        this._keyboardWillShow = this._keyboardWillShow.bind(this);
        this.keyboardWillHide = this.keyboardWillHide.bind(this);

        this.keyboardWillShowListener = Keyboard.addListener(
            Platform.OS === 'android' ? 'keyboardDidShow' : 'keyboardWillShow',
            this._keyboardWillShow,
        );
        this.keyboardWillHideListener = Keyboard.addListener(
            Platform.OS === 'android' ? 'keyboardDidHide' : 'keyboardWillHide',
            this.keyboardWillHide,
        );

    }

    _keyboardWillShow(event) {
        //console.log('_keyboardWillShow');
        this.setState({
            keyboardOffset: Platform.OS === 'android' ? 0 : 0,
        });
    }

    keyboardWillHide() {
        //console.log('keyboardWillHide');
        this.setState({
            keyboardOffset: 0,
        });
    }

    getPastApplicationApi(showLoader) {
        // this.setState({
        //     isLoading: showLoader
        // });
        // Api.getPastRequest(this, DeviceInfo.getUniqueId(), function (parent, data) {
        //     parent.setState({
        //         isLoading: false
        //     });
        //     console.log('Api.getPastRequest: ', data);
        //     parent.setState({ postApplicationData: data.data });
        // });
    }

    // getUserProfileData() {
    //     this.setState({
    //         isLoading: true
    //     })
    //     //DeviceInfo.getUniqueId()
    //     Api.getUserProfile(this, DeviceInfo.getUniqueId(), function (parent, data) {
    //         parent.setState({
    //             isLoading: false
    //         })
    //         if (data.error == '1') {

    //         } else {
    //             parent.setState({
    //                 profileName: data.data.name,
    //                 linkedInUrl: data.data?.linkedin_url
    //             });
    //             if (data.data.photo != 'https://natably.com/images/avatar.png') {
    //                 console.log("Profile Pic : ", data.data.photo)
    //                 parent.setState({
    //                     profileAvatar: data.data.photo
    //                 });
    //                 CONST.setProfileAvatar(data.data.photo);
    //             }
    //         }
    //     });
    // }

    onBackClick = () => {
        Navigation.pop(this.props.componentId);
    }

    // checkForNameExist() {
    //     var foundName = false;
    //     // loop for checking name of user from whom you want to get feedback is exist in list data or not start
    //     for (var i = 0; i < this.state.postApplicationData.length; i++) {
    //         if (this.state.postApplicationData[i].provider_name == this.state.feedbackPerson) {
    //             foundName = true;
    //             break;
    //         }
    //     }
    //     // loop for checking name of user from whom you want to get feedback is exist in list data or not end
    //     return foundName;
    // }

    openShareSheet = () => {

        deleteId = currentLinkID;
        session.setState({
            //isLoading: true,
            isShareSheetVisible: true
        });
    }


    onResendRequestClick(id) {

        // this.setState({
        //     isLoading: true,
        // });

        // Api.resendPastRequest(this, id, DeviceInfo.getUniqueId(), function (parent, data) {
        //     parent.setState({
        //         isLoading: false
        //     });

        //     if (data.status == 200) {
        //         shareLink = data.data.url

        //         setTimeout(function () {
        //             session.setState({
        //                 isShareSheetVisible: true
        //             });
        //         }, 500);
        //     }
        //     return;
        // });
    }

    onDeleteRequestClick(id) {
        // on delete past request
        deleteId = id;
        this.setState({ isModalVisible: true });
    }

    onSubmit() {
        let { recruiterName, companyName, jobTitle, profileName, } = this.state
        console.log('recruiterNamerecruiterNamerecruiterName', recruiterName);
        if (companyName === '') {
            this.setState({ isCompNameEmpty: true });
            Toast.show({
                type: 'error',
                position: 'bottom',
                visibilityTime: 3000,
                text1: 'Company name is required field!'
            });
        }
        else if (jobTitle === '') {
            this.setState({ isJobTitleEmpty: true });
            Toast.show({
                type: 'error',
                position: 'bottom',
                visibilityTime: 3000,
                text1: 'Job title is required field!'
            });
        }
        else if (profileName === '') {
            this.setState({ isApplicantNameEmpty: true });
            Toast.show({
                type: 'error',
                position: 'bottom',
                visibilityTime: 3000,
                text1: 'Name is required field!'
            });
        }
        else {
            if (this.props?.jobDetails) {
                const { id, job_title, company_name, user, recruiter_name } = this.props?.jobDetails
                console.log('this.props?.jobDetails', this.props?.jobDetails);
                const { name, photo, linkedin_url } = user
                Api.setJobApply(this, DeviceInfo.getUniqueId(), id, this.state.jobInterestReason, this.props?.selectedTestimonials, job_title, company_name, recruiter_name, name, linkedin_url, this.state.preview, photo, function (parent, data) {
                    console.log('======== jobApply data ========', data);
                    if (data?.data.status === 200) {
                        parent.setState({ appliedJobData: data })
                        Alert.alert('Applied!')
                    }
                    parent.onBackClick();
                });
            }
        }
    }

    async openImagePicker(isCamera) {
        try {
            let option = {
                // maxHeight: 200,
                // maxWidth: 200,
                selectionLimit: 1,
                mediaType: 'photo',
                includeBase64: false,
            };

            let result = null;

            if (isCamera) {
                result = await launchCamera(option);
            } else {
                result = await launchImageLibrary(option);
            }

            if (result.didCancel) {
                console.log('User cancelled photo picker');
            } else if (result.error) {
                console.log('ImagePicker Error: ', response.error);
            } else if (result.customButton) {
                console.log('User tapped custom button: ', response.customButton);
            } else if (result.assets) {
                this.setState({
                    profileAvatar: result.assets[0]
                })
            }

            setTimeout(() => {
                this.setState({
                    isCameraOpen: false
                });
            }, 500)

        } catch (e) {
            console.log('Image Picker Error: ', e);
            this.setState({
                isCameraOpen: false
            });
        }
    }

    generateShareLink(type) {
        Keyboard.dismiss();
        this.setState({
            isLoading: true
        });
        let { recruiterName } = this.state
        // console.log('appliedJobData', appliedJobData);
        // if (appliedJobData) {
        //     if (appliedJobData.error == '1') {
        //     } else {
        //         shareLink = appliedJobData?.data?.url
        //         this.onShareClick(type);
        //     }
        // }
        console.log('this.props?.jobDetails', this.props?.jobDetails);
        if (recruiterName === '') {
            this.setState({ isRecruiterNameEmpty: true });
            Toast.show({
                type: 'error',
                position: 'bottom',
                visibilityTime: 3000,
                text1: 'Recruiter name is required field!'
            });
            this.reqNameRef?.focus();
        }
        else {
            if (this.props?.jobDetails) {
                const { id, job_title, company_name, user } = this.props?.jobDetails
                const { name, photo, linkedin_url } = user
                Api.setJobApply(this, DeviceInfo.getUniqueId(), id, this.state.jobInterestReason, this.props?.selectedTestimonials, job_title, company_name, recruiterName, name, linkedin_url, this.state.preview, photo, function (parent, data) {
                    console.log('data', data);
                    parent.setState({
                        isLoading: false
                    });
                    if (data.status === 500 && data.error?.code == 'job already applyed') {
                        Toast.show({
                            type: 'error',
                            position: 'bottom',
                            visibilityTime: 3000,
                            text1: data.error?.code
                        });
                    }
                    else {
                        shareLink = data.data.url
                        parent.onShareClick(type);
                    }
                });
            }
        }
        this.setState({
            isLoading: false
        });
    }

    onShareClick(type) {
        this.setState({
            isShareSheetVisible: false
        })
        Keyboard.dismiss()
        if (this.state.profileName != '') {
            shareName = " " + this.state.profileName
        }
        const imageUrl = `data:image/png;base64,${require('../img/logo.png')}`
        let message = `Hi,

        I am writing to express interest in ${this.state.jobTitle}.  My motivation letter is supported by Natably, a platform that helps individuals find most fitting jobs by matching their natural talents and abilities to requirements of a job.  Natably also makes processing of applications a breeze.  Try it out.
        
        To see my application letter please visit:
        ${shareLink}
        
        NOTE: Natably is a US registered EdTech service provider.  You can verify the safety of Natably’s web address via Google Transparency Report:
        https://transparencyreport.google.com/safe-browsing/search?url=natably.com&hl=en`;
        let options = {
            title: CONST.appName,
            social: type == 'whatsapp' ? Share.Social.WHATSAPP : type == 'messages' ? Share.Social.SMS : null
        }
        if (type == "gmail") {
            if (Platform.OS === 'android') {
                options.message = message
                options.social = Share.Social.EMAIL
                setTimeout(() => {
                    Share.shareSingle(options);
                }, 300);
            }
            else {
                let gmailURL = 'mailto:?subject=&body=' + message;
                Linking.openURL(gmailURL);
            }
        } else if (type == 'copylink') {
            Clipboard.setString(message);
            Toast.show({
                type: 'info',
                position: 'bottom',
                visibilityTime: 3000,
                text1: 'Your cover letter link has been copied. Paste it into the communication app of your choice.'
            });
        } else if (type == 'whatsapp') {
            options.url = shareLink;
            if (Platform.OS === 'android') {
                setTimeout(() => {
                    Share.shareSingle(options);
                }, 300);
            }
            else {
                let whatsappURL = 'whatsapp://send?text=' + shareLink;
                Linking.openURL(whatsappURL);
            }
        } else if (type == 'messages') {
            const operator = Platform.select({ ios: '&', android: '?' });
            Linking.openURL(`sms:${operator}body=${shareLink}`);
        }
        else if (type == 'ms-outlook') {
            const operator = Platform.select({ ios: '&', android: '?' });
            Linking.openURL('ms-outlook://compose?to=&subject=&body=' + message);
        }
    }

    onCancelRequestClick(data) {

        // console.log('status: ', data.status);

        // this.setState({
        //     isLoading: true,
        //     isRequestStatusModal: false
        // });

        // deleteId = data.id;
        // console.log('Completed: ', data.status);

        // if (data.status == 'Completed') {
        //     this.untrackRequestApi();
        // }
        // else {
        //     this.deleteApi(true);
        //     return;
        // }
    }

    onAcceptPopup() {
        this.setState({ isModalVisible: false })
        setTimeout(function () {
            session.deleteApi(false);
        }, 1000);
    }

    onCancelPopup() {
        this.setState({ isModalVisible: false })
    }

    // Resend Job Application Request
    resendJobAppReq(id) {
        this.setState({
            isLoading: true
        });
        Api.resendJobApplication(this, DeviceInfo.getUniqueId(), id, async function (parent, data) {
            if (data.status === 200) {
                parent.onReqJobPage();
            }
            else {
                parent.setState({
                    isLoading: false
                });
                return;
            }
        })
        this.setState({
            isLoading: false
        });
    }

    onReqJobPage() {
        this.setState({
            isLoading: true
        });
        Api.getJobDetailsByJobId(this, DeviceInfo.getUniqueId(), this.state.jobId, async function (parent, data) {
            if (data.status === 200) {
                parent.setState({ past_applications: data?.data?.past_applications })
            }
            else {
                parent.setState({
                    isLoading: false
                });
                return;
            }
        })
        this.setState({
            isLoading: false
        });
    }
    // Delete Job Application Request
    deleteJobAppReq(id) {
        this.setState({
            isLoading: true
        });
        Api.deleteJobApplicationRequest(this, DeviceInfo.getUniqueId(), id, async function (parent, data) {
            if (data.status === 200) {
                // console.log('deleteJobAppReq data data data', data);
                parent.onReqJobPage();
            }
            else {
                parent.setState({
                    isLoading: false
                });
                return;
            }
        })
        this.setState({
            isLoading: false
        });
    }

    _renderStatusModalContent = () => (
        <View style={{ width: width - 30, height: 150, backgroundColor: "white", justifyContent: 'center', alignItems: "center", borderRadius: 4, borderColor: "rgba(0, 0, 0, 0.1)" }}>
            <View style={{ flex: 0.5, justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent' }}>
                <Text style={{ color: "#000", fontSize: 20, padding: 8, justifyContent: 'center', alignItems: 'center', fontFamily: 'SFUIDisplay-Bold' }}>Cancel request and delete from request tracker?</Text>
            </View>
            <View style={{ flex: 0.5, width: width - 50, height: 50, justifyContent: 'center', backgroundColor: 'transparent' }}>
                <View style={{ flex: 1, flexDirection: 'row' }}>
                    <TouchableHighlight style={{ flex: 0.5, borderRadius: 3, alignSelf: 'center', backgroundColor: '#4ec5c1', alignItems: 'center', borderRadius: 3, marginRight: 4 }} underlayColor='transparent' onPress={() => { this.onCancelRequestClick(currentLinkData); }}>
                        <Text style={{ padding: 12, textAlign: 'center', fontSize: 18, color: 'white', fontFamily: 'SFUIDisplay-Bold' }} >Yes</Text>
                    </TouchableHighlight>
                    <TouchableHighlight style={{ flex: 0.5, borderRadius: 3, alignSelf: 'center', backgroundColor: '#ec576b', alignItems: 'center', borderRadius: 3, marginLeft: 4 }} underlayColor='transparent' onPress={() => { this.setState({ isRequestStatusModal: false }) }}>
                        <Text style={{ padding: 12, textAlign: 'center', fontSize: 18, color: 'white', fontFamily: 'SFUIDisplay-Bold' }} >No</Text>
                    </TouchableHighlight>
                </View>
            </View>
        </View>
    );

    _renderModalContent = () => (
        <View style={{ width: width - 30, height: 150, backgroundColor: "white", justifyContent: 'center', alignItems: "center", borderRadius: 4, borderColor: "rgba(0, 0, 0, 0.1)" }}>
            <View style={{ flex: 0.5, justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent' }}>
                <Text style={{ color: "#000", fontSize: 20, padding: 8, justifyContent: 'center', alignItems: 'center', fontFamily: 'SFUIDisplay-Bold' }}>Delete from request tracker?</Text>
            </View>
            <View style={{ flex: 0.5, width: width - 50, height: 50, justifyContent: 'center', backgroundColor: 'transparent' }}>
                <View style={{ flex: 1, flexDirection: 'row' }}>
                    <TouchableHighlight style={{ flex: 0.5, borderRadius: 3, alignSelf: 'center', backgroundColor: '#4ec5c1', alignItems: 'center', borderRadius: 3, marginRight: 4 }} underlayColor='transparent' onPress={() => { this.onAcceptPopup(); }}>
                        <Text style={{ padding: 12, textAlign: 'center', fontSize: 18, color: 'white', fontFamily: 'SFUIDisplay-Bold' }} >Yes</Text>
                    </TouchableHighlight>
                    <TouchableHighlight style={{ flex: 0.5, borderRadius: 3, alignSelf: 'center', backgroundColor: '#ec576b', alignItems: 'center', borderRadius: 3, marginLeft: 4 }} underlayColor='transparent' onPress={() => { this.onCancelPopup(); }}>
                        <Text style={{ padding: 12, textAlign: 'center', fontSize: 18, color: 'white', fontFamily: 'SFUIDisplay-Bold' }} >No</Text>
                    </TouchableHighlight>
                </View>
            </View>
        </View>
    );

    _renderItem = ({ item: rowData, index }) => {
        // var dateArr = rowData.date_sent.split('-');

        return (
            <TalentPointView
                type={'job_application'}
                rowData={rowData}
                onClear={() => { }}
                onDelete={() => this.deleteJobAppReq(rowData?.id)}
                onResend={() => this.resendJobAppReq(rowData?.id)}
                onView={(jobUrl) => jobUrl ? Linking?.openURL(jobUrl) : undefined}
            />

        )
    }

    render() {
        return (
            <View style={{ height: height, top: this.state.keyboardOffset }}>
                <View style={{ flex: 1, backgroundColor: '#fff', marginTop: DeviceInfo.hasNotch() ? 25 : 0 }}>
                    <SpinnerLoading visible={this.state.isLoading} />
                    {/*--------header--------*/}
                    <View style={{ marginTop: this.state.topbarTopMargin, height: CONST.headerHeight, backgroundColor: CONST.headerBackColor, flexDirection: 'row', paddingLeft: 16, paddingRight: 16 }}>
                        {/*left*/}
                        <TouchableOpacity style={{ flex: 0.1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent', opacity: 0.5 }} underlayColor='transparent' onPress={() => this.onBackClick()}>
                            <Unicons.UilArrowLeft size={30} color="#000000" />
                        </TouchableOpacity>
                        {/*center*/}
                        <View style={{ flex: 0.8, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent', opacity: 0.7 }}>
                            <Text style={styles.titleText}>Apply</Text>
                        </View>
                        {/*right*/}
                        <View style={{ flex: 0.1 }} />
                    </View>
                    {/*--------divider--------*/}
                    <View style={{ backgroundColor: 'rgba(0, 0, 0, 0.15)', height: 1 }} />

                    {/* <KeyboardAvoidingView
                        style={{ flex: 1 }}
                        enabled
                        behavior={(Platform.OS === 'ios') ? "padding" : null}>
                        <ScrollView showsVerticalScrollIndicator={false}> */}
                    <KeyboardAwareScrollView
                        ref={(ref) => { this.kasRef = ref; }}
                        style={{ flex: 1 }}
                        enableOnAndroid={true}
                        extraScrollHeight={-25}
                        contentContainerStyle={{ paddingBottom: 35, }}
                        contentInset={{ top: this.state?.jobType === "Example" ? 30 : 0 }}
                        keyboardShouldPersistTaps="always"
                        showsVerticalScrollIndicator={false}>
                        <View>
                            {/*--------sub - title--------*/}
                            <View style={{ paddingLeft: 16, paddingRight: 16, marginTop: this.state?.jobType === "Example" ? 30 : 0 }}>
                                {this.state?.jobType === "Example" && <Text style={styles.noteText}>IMPORTANT: You have selected to create a cover letter using an EXAMPLE job profile. To complete this action please enter the following details:</Text>}
                                <View style={{ marginTop: 18 }}>
                                    <View style={[styles.semiCon, { borderBottomColor: this.state.isJobTitleEmpty ? '#EB576B' : '#212C2C26' }]}>
                                        <Text style={styles.semiTitle}>Job Title</Text>
                                        <TextInput
                                            style={styles.semiInput}
                                            value={this.state.jobTitle}
                                            placeholder='{JOB TITLE}'
                                            onChangeText={(title) => this.setState({ jobTitle: title, isJobTitleEmpty: title.length > 0 ? false : true })} placeholderTextColor={this.state.isJobTitleEmpty ? '#EB576B' : '#212C2CB2'}
                                            editable={this.state?.jobType === "Example" ? true : false}
                                        />
                                    </View>
                                    <View style={[styles.semiCon, { borderBottomColor: this.state.isCompNameEmpty ? '#EB576B' : '#212C2C26' }]}>
                                        <Text style={styles.semiTitle}>Company Name</Text>
                                        <TextInput
                                            style={styles.semiInput}
                                            value={this.state.companyName} placeholder='Enter company to track response status'
                                            onChangeText={(companyName) => this.setState({ companyName: companyName, isCompNameEmpty: companyName.length > 0 ? false : true })} placeholderTextColor={this.state.isCompNameEmpty ? '#EB576B' : '#212C2CB2'}
                                            editable={this.state?.jobType === "Example" ? true : false} />
                                    </View>
                                    {this.state.jobType === 'Example' && <View style={[styles.semiCon, { borderBottomColor: this.state.isRecruiterNameEmpty ? '#EB576B' : '#212C2C26' }]}>
                                        <Text style={styles.semiTitle}>Recruiter Name</Text>
                                        <TextInput
                                            ref={(ref) => { this.reqNameRef = ref; }}
                                            style={styles.semiInput}
                                            value={this.state.recruiterName} placeholder='Enter name to track response status'
                                            onChangeText={(recruiterName) => this.setState({ recruiterName: recruiterName, isRecruiterNameEmpty: recruiterName.length > 0 ? false : true })}
                                            placeholderTextColor={this.state.isRecruiterNameEmpty ? '#EB576B' : '#212C2CB2'}
                                        />
                                    </View>}
                                    <View style={styles.semiCon}>
                                        <Text style={styles.semiTitle}>Why are you interested in this job?</Text>
                                        <TextInput
                                            style={styles.semiInput}
                                            value={this.state.jobInterestReason}
                                            placeholder='Write a short motivational statement' onChangeText={(jobInterestReason) => this.setState({ jobInterestReason: jobInterestReason })}
                                            placeholderTextColor={'#212C2CB2'} />
                                    </View>
                                </View>

                                <Text style={styles.semiTitle}>Your Profile Details</Text>
                                <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 40 }}>
                                    <FastImage
                                        style={{ width: 128, height: 128, borderRadius: 128 / 2 }}
                                        source={this.state.profileAvatar.hasOwnProperty('uri') ? { uri: this.state.profileAvatar.uri, priority: FastImage.priority.high } : this.state.profileAvatar != '' ? { uri: this.state.profileAvatar, priority: FastImage.priority.high } : require('../img/user.png')}
                                    />
                                    {/*<Image source={this.state.profileAvatar.hasOwnProperty('uri') ? { uri: this.state.profileAvatar.uri } : this.state.profileAvatar != '' ? { uri: this.state.profileAvatar } : require('../img/user.png')} style={{ width: 128, height: 128, borderRadius: 128 / 2 }} />*/}
                                    <TouchableOpacity style={styles.cameraButton} activeOpacity={0.4} onPress={() => this.setState({ isCameraOpen: true })}>
                                        <Image source={require('../img/camera.png')} style={{ width: 40, height: 40 }} />
                                    </TouchableOpacity>
                                </View>
                                {/*------------Name-------------*/}
                                <View style={{ marginTop: 30, borderBottomColor: this.state.isApplicantNameEmpty ? '#EB576B' : '#212C2C26', borderBottomWidth: 1 }} >
                                    <Text style={styles.semiTitle2}>Name</Text>
                                    <TextInput
                                        style={styles.semiInput}
                                        onChangeText={(name) => this.setState({ profileName: name, isApplicantNameEmpty: name.length > 0 ? false : true })}
                                        value={this.state.profileName}
                                        placeholder={'Your name'}
                                        placeholderTextColor={this.state.isApplicantNameEmpty ? '#EB576B' : '#212C2CB2'}
                                    />
                                </View>
                                <View style={{ marginTop: 30, borderBottomColor: '#212C2C26', borderBottomWidth: 1 }} >
                                    <Text style={styles.semiTitle2}>YOUR LINKEDIN PROFILE</Text>
                                    <TextInput
                                        style={styles.semiInput}
                                        onChangeText={(url) => this.setState({ linkedInURL: url })}
                                        value={this.state.linkedInURL}
                                        placeholder={'LinkedIN profile URL address'}
                                    />
                                </View>

                                {this.state?.jobType === "Example" ?
                                    <View style={{ marginTop: 30, backgroundColor: 'transparent' }}>
                                        <Text style={styles.subTitleText}>Send application using</Text>

                                        <TouchableOpacity onPress={() => this.generateShareLink('copylink')} style={styles.shareContainer}>
                                            <View style={{ opacity: 0.65 }}>
                                                <Unicons.UilCopy size="24" color="#000000" />
                                            </View>
                                            <Text style={styles.shareTextItem}>Copy Link</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity onPress={() => {
                                            if (isWhatsappAvailable) {
                                                this.generateShareLink('whatsapp');
                                            } else {
                                                Toast.show({
                                                    type: 'error',
                                                    position: 'bottom',
                                                    text1: "WhatsApp is not installed on the device.",
                                                    visibilityTime: 1500
                                                })
                                            }
                                        }} style={styles.shareContainer}>
                                            <Image source={require('../img/whatsapp.png')} resizeMode="contain" style={{ width: 24, height: 24 }} />
                                            <Text style={styles.shareTextItem}>WhatsApp</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity onPress={() => {
                                            if (isMessagesAvailable) {
                                                this.generateShareLink('messages')
                                            } else {
                                                Toast.show({
                                                    type: 'error',
                                                    position: 'bottom',
                                                    text1: "Messages is not installed on the device.",
                                                    visibilityTime: 1500
                                                });
                                            }
                                        }} style={styles.shareContainer}>
                                            <Image source={require('../img/messages.png')} resizeMode="contain" style={{ width: 24, height: 24 }} />
                                            <Text style={styles.shareTextItem}>Messages</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity onPress={() => {
                                            if (isMailAvailable) {
                                                this.generateShareLink('gmail');
                                            } else {
                                                Toast.show({
                                                    type: 'error',
                                                    position: 'bottom',
                                                    text1: "Gmail is not installed on the device.",
                                                    visibilityTime: 1500
                                                });
                                            }
                                        }} style={[styles.shareContainer]}>
                                            <Image source={require('../img/gmail.png')} resizeMode="contain" style={{ width: 24, height: 24 }} />
                                            <Text style={styles.shareTextItem}>Email (default)</Text>
                                        </TouchableOpacity>

                                        {isOutLookAvailable ? <TouchableOpacity onPress={() => {
                                            if (isOutLookAvailable) {
                                                // Linking.openURL('ms-outlook://');
                                                this.generateShareLink('ms-outlook');
                                            } else {
                                                Toast.show({
                                                    type: 'error',
                                                    position: 'bottom',
                                                    text1: "Microsoft Outlook is not installed on the device.",
                                                    visibilityTime: 1500
                                                });
                                            }
                                        }} style={[styles.shareContainer]}>
                                            <Image source={require('../img/outlook.png')} resizeMode="contain" style={{ width: 24, height: 24 }} />
                                            <Text style={styles.shareTextItem}>Microsoft Outlook</Text>
                                        </TouchableOpacity> : null}


                                    </View> :
                                    <View style={{ paddingTop: 32 }}>
                                        <TouchableOpacity style={styles.submitBtn} onPress={() => this.onSubmit()}>
                                            <Text style={styles.submitBtnText}>Submit</Text>
                                        </TouchableOpacity>
                                    </View>}

                            </View>
                            {/*--------past request--------*/}

                            {/* {this.state.postApplicationData.length > 0 && */}
                            <View style={{ backgroundColor: 'transparent', paddingLeft: 16, paddingRight: 16, marginTop: 30, marginBottom: 50 }}>
                                <Text style={styles.subTitleText}>Past Applications</Text>
                                <FlatList
                                    style={{ marginTop: 8 }}
                                    data={this.state.past_applications}
                                    extraData={this.state}
                                    keyExtractor={(item, index) => index.toString()}
                                    renderItem={this._renderItem}
                                />
                            </View>
                            {/* } */}
                        </View>
                    </KeyboardAwareScrollView>
                    {/* </ScrollView>
                    </KeyboardAvoidingView> */}
                    <Toast config={toastConfig} />

                    {/*-----------modal---------*/}
                    <Modal animationIn={'fadeInDown'} animationOut={'fadeOutDown'} useNativeDriver={true}
                        style={{ flex: 1, justifyContent: "center", alignItems: "center" }} isVisible={this.state.isModalVisible}>
                        {this._renderModalContent()}
                    </Modal>
                    {/*-----------status modal---------*/}
                    <Modal animationIn={'fadeInDown'} animationOut={'fadeOutDown'} useNativeDriver={true}
                        style={{ flex: 1, justifyContent: "center", alignItems: "center" }} isVisible={this.state.isRequestStatusModal}>
                        {this._renderStatusModalContent()}
                    </Modal>
                </View>

                <BlurModel
                    onTouchOutside={() => this.setState({ isCameraOpen: false })}
                    visible={this.state.isCameraOpen}>

                    <View style={styles.profilePickerContainer}>

                        <View>
                            <TouchableOpacity onPress={() => this.openImagePicker(true)} style={styles.btnProfilePicker}>
                                <Text style={styles.btnProfilePickerText}>Camera</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => this.openImagePicker(false)} style={styles.btnProfilePicker}>
                                <Text style={styles.btnProfilePickerText}>Choose from Gallery</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => this.setState({ isChangeProfile: false, profileAvatar: '', removeProfile: 1 })} style={styles.btnProfilePicker}>
                                <Text style={[styles.btnProfilePickerText, { color: '#F9543D' }]}>Remove Photo</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => this.setState({ isChangeProfile: false })} style={{ backgroundColor: '#FFFFFF', width: 56, height: 56, borderRadius: 56 / 2, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', top: 170 }}>
                                <Ionicons name="close" size={20} color="rgba(33, 44, 44, 0.7)" />
                            </TouchableOpacity>
                        </View>

                    </View>

                </BlurModel>

                {/*-----------ShareSheet for link---------*/}
                <ShareSheet visible={this.state.isShareSheetVisible} onCancel={() => this.setState({ isShareSheetVisible: false })}>

                    <View style={{ width: '100%', alignItems: 'center', marginTop: 10 }}>
                        <Text style={{ color: "#000000", fontSize: 20, fontFamily: 'GoogleSans-Bold' }}>Share Link</Text>
                    </View>

                    <View style={{ width: '100%', height: 20 }} />

                    {isWhatsappAvailable &&
                        <Button buttonStyle={{ alignItems: 'center' }} iconSrc={{ uri: CONST.WHATSAPP_ICON }}
                            onPress={() => { this.onShareClick('whatsapp') }}>Whatsapp</Button>
                    }
                    {isMessagesAvailable &&
                        <Button buttonStyle={{ alignItems: 'center' }} iconSrc={{ uri: Platform.OS === 'android' ? CONST.MESSAGES_ICON : CONST.IMESSAGE_ICON }}
                            onPress={() => { this.onShareClick('messages') }}>Messages</Button>
                    }
                    {isMailAvailable &&
                        <Button buttonStyle={{ alignItems: 'center' }} iconSrc={{ uri: CONST.EMAIL_ICON }}
                            onPress={() => { this.onShareClick('gmail') }}>Gmail</Button>
                    }
                    {isOutLookAvailable &&
                        <Button buttonStyle={{ alignItems: 'center' }} iconSrc={{ uri: CONST.MS_OUTLOOK_ICON }}
                            onPress={() => { this.onShareClick('ms-outlook') }}>Microsoft Outlook</Button>
                    }

                    <Button buttonStyle={{ alignItems: 'center' }} iconSrc={{ uri: CONST.COPY_ICON }}
                        onPress={() => { this.onShareClick('copylink') }}>Copy Link</Button>

                    <View style={{ width: '100%', height: 20 }} />
                </ShareSheet>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    profilePickerContainer: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    btnProfilePicker: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        marginTop: 8,
        marginLeft: 24,
        marginRight: 24,
        alignItems: 'center',
        padding: 10
    },
    btnProfilePickerText: {
        fontFamily: 'SFUIDisplay-Regular',
        fontSize: 18,
        color: '#000000',
        padding: 10
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    },
    titleText: {
        color: "#000000",
        fontSize: 22,
        fontWeight: '600',
        alignSelf: 'center',
        fontFamily: 'SFUIDisplay-SemiBold',
        lineHeight: 22,
    },
    subTitleText: {
        color: "#212C2C",
        fontSize: 20,
        lineHeight: 22,
        letterSpacing: 0.5,
        fontWeight: '700',
        fontFamily: 'SFUIDisplay-Bold'
    },
    noteText: {
        color: '#000000',
        borderBottomWidth: 1,
        borderColor: 'rgba(33, 44, 44, 0.15)',
        marginTop: 10,
        fontSize: 16,
        lineHeight: 22,
        fontFamily: 'SFUIDisplay-Regular'
    },
    inputName: {
        height: 40,
        color: '#000000',
        borderBottomWidth: 1,
        borderColor: 'rgba(33, 44, 44, 0.15)',
        marginTop: 10,
        fontSize: 16,
        lineHeight: 22,
        fontFamily: 'SFUIDisplay-Regular'
    },
    shareContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        borderColor: 'rgba(33, 44, 44, 0.15)',
        borderBottomWidth: 1,
        paddingTop: 16,
        paddingBottom: 16
    },
    shareTextItem: {
        marginLeft: 11,
        fontFamily: 'SFUIDisplay-SemiBold',
        fontSize: 18,
        fontWeight: '600',
        lineHeight: 22,
        color: 'rgba(33, 44, 44, 0.7)'
    },
    semiCon: {
        borderBottomColor: '#212C2C26',
        borderBottomWidth: 1,
        marginVertical: 18
    },
    semiTitle: {
        fontFamily: 'SFUIDisplay-Regular',
        fontSize: 20,
        fontWeight: '700',
        lineHeight: 22,
        color: '#212C2C'
    },
    semiTitle2: {
        fontFamily: 'SFUIDisplay-Regular',
        fontSize: 12,
        fontWeight: '700',
        lineHeight: 22,
        color: '#212C2C',
        textTransform: 'uppercase'
    },
    semiInput: {
        fontFamily: 'SFUIDisplay-Regular',
        fontSize: 16,
        fontWeight: '400',
        lineHeight: 22,
        color: '#212C2CB2',
        paddingVertical: 11,
        flex: 1
    },
    cameraButton: {
        width: 40,
        height: 40,
        marginLeft: 87,
        marginTop: -(20 + 10)
    },
    submitBtn: {
        width: '100%',
        height: 44,
        alignSelf: 'center',
        backgroundColor: '#4EC5C1',
        borderRadius: 8,
        alignItems: "center",
        justifyContent: 'center'
    },
    submitBtnText: {
        fontFamily: 'SFUIDisplay-Regular',
        fontSize: 16,
        fontWeight: '500',
        lineHeight: 19,
        color: '#FFFFFF',
    }
});
